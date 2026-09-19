"""The ``lzy`` command-line tool and the REPL."""

from __future__ import annotations

import pytest

from lzy import __version__
from lzy.cli.main import EXIT_ERROR, EXIT_OK, main, normalise_argv
from lzy.repl import _opens_block, run_repl


@pytest.fixture
def program(tmp_path):
    def write(source: str, name: str = "program.lzy"):
        path = tmp_path / name
        path.write_text(source, encoding="utf-8")
        return str(path)

    return write


class TestArgumentHandling:
    @pytest.mark.parametrize(
        "given,expected",
        [
            (["hello.lzy"], ["run", "hello.lzy"]),
            (["run", "hello.lzy"], ["run", "hello.lzy"]),
            (["check", "hello.lzy"], ["check", "hello.lzy"]),
            (["repl"], ["repl"]),
            (["--debug", "hello.lzy"], ["--debug", "run", "hello.lzy"]),
            (["--safe", "--debug", "a.lzy"], ["--safe", "--debug", "run", "a.lzy"]),
            (["--version"], ["--version"]),
            ([], []),
        ],
    )
    def test_a_bare_path_means_run(self, given, expected):
        assert normalise_argv(given) == expected

    def test_version(self, capsys):
        with pytest.raises(SystemExit) as caught:
            main(["--version"])
        assert caught.value.code == 0
        assert __version__ in capsys.readouterr().out

    def test_help(self, capsys):
        with pytest.raises(SystemExit):
            main(["--help"])
        out = capsys.readouterr().out
        assert "lzy repl" in out
        assert "complex logic" in out.lower()


class TestRunning:
    def test_runs_a_program(self, program, capsys):
        assert main([program('say "hi"')]) == EXIT_OK
        assert capsys.readouterr().out == "hi\n"

    def test_run_command_is_the_same(self, program, capsys):
        assert main(["run", program('say "hi"')]) == EXIT_OK
        assert capsys.readouterr().out == "hi\n"

    def test_reports_an_error_and_exits_non_zero(self, program, capsys):
        assert main([program("say missing")]) == EXIT_ERROR
        captured = capsys.readouterr()
        assert captured.out == ""
        assert "Name error" in captured.err

    def test_errors_go_to_standard_error_with_the_file_name(self, program, capsys):
        path = program("say missing")
        main([path])
        assert path in capsys.readouterr().err

    def test_no_python_traceback_by_default(self, program, capsys):
        main([program("say 1 / 0")])
        assert "Traceback" not in capsys.readouterr().err

    def test_debug_re_raises_for_maintainers(self, program):
        from lzy.errors import LzyError

        with pytest.raises(LzyError):
            main(["--debug", program("say 1 / 0")])

    def test_safe_mode_runs_normal_programs(self, program, capsys):
        assert main(["--safe", program("say 1 + 1")]) == EXIT_OK
        assert capsys.readouterr().out == "2\n"

    def test_safe_mode_applies_tighter_limits(self, program, capsys):
        source = "function f(n)\n    return f(n + 1)\nsay f(0)"
        assert main(["--safe", program(source)]) == EXIT_ERROR
        assert "too many times" in capsys.readouterr().err


class TestChecking:
    def test_check_reports_a_clean_program(self, program, capsys):
        assert main(["check", program('say "hi"')]) == EXIT_OK
        assert "no mistakes found" in capsys.readouterr().out

    def test_check_does_not_run_the_program(self, program, capsys):
        assert main(["check", program('say "side effect"')]) == EXIT_OK
        assert "side effect" not in capsys.readouterr().out

    def test_check_finds_a_syntax_mistake(self, program, capsys):
        assert main(["check", program("if true\nsay 1")]) == EXIT_ERROR
        assert "indented block" in capsys.readouterr().err

    def test_check_does_not_find_runtime_mistakes(self, program):
        # Checking is a parse, not a run: this is valid syntax.
        assert main(["check", program("say 1 / 0")]) == EXIT_OK


class TestFileProblems:
    def test_missing_file(self, capsys, tmp_path):
        assert main([str(tmp_path / "nope.lzy")]) == EXIT_ERROR
        assert "could not find this file" in capsys.readouterr().err

    def test_missing_file_suggests_the_extension(self, capsys, tmp_path):
        (tmp_path / "thing.lzy").write_text("say 1", encoding="utf-8")
        main([str(tmp_path / "thing")])
        assert "thing.lzy" in capsys.readouterr().err

    def test_a_folder_is_not_a_program(self, capsys, tmp_path):
        assert main([str(tmp_path)]) == EXIT_ERROR
        assert "folder" in capsys.readouterr().err

    def test_a_binary_file_is_reported_kindly(self, capsys, tmp_path):
        path = tmp_path / "binary.lzy"
        path.write_bytes(b"\xff\xfe\x00\x01\x80\x81")
        assert main([str(path)]) == EXIT_ERROR
        captured = capsys.readouterr().err
        assert "not text that LZY can read" in captured
        # The path is shown whole on its own line, never wrapped, so that it
        # can be read and copied even when it contains spaces.
        assert f"    {path}" in captured


class TestRepl:
    def run_lines(self, lines):
        return run_repl(input_lines=lines)

    def test_evaluates_and_echoes_an_expression(self, capsys):
        self.run_lines(["1 + 1"])
        assert capsys.readouterr().out == "2\n"

    def test_runs_a_statement(self, capsys):
        self.run_lines(['say "hi"'])
        assert capsys.readouterr().out == "hi\n"

    def test_remembers_names_between_lines(self, capsys):
        self.run_lines(['name = "Ada"', "say name"])
        assert capsys.readouterr().out == "Ada\n"

    def test_a_block_is_collected_until_a_blank_line(self, capsys):
        self.run_lines(["if 5 > 3", '    say "yes"', ""])
        assert capsys.readouterr().out == "yes\n"

    def test_a_function_defined_at_the_prompt_can_be_called(self, capsys):
        self.run_lines(
            ["function double(n)", "    return n * 2", "", "say double(21)"]
        )
        assert capsys.readouterr().out == "42\n"

    def test_an_error_does_not_end_the_session(self, capsys):
        self.run_lines(["say missing", 'say "still here"'])
        captured = capsys.readouterr()
        assert "Name error" in captured.err
        assert "still here" in captured.out

    def test_help(self, capsys):
        self.run_lines(["help"])
        assert "Things to try" in capsys.readouterr().out

    @pytest.mark.parametrize("word", ["exit", "quit", "BYE", "Exit"])
    def test_leaving(self, word, capsys):
        assert self.run_lines([word, 'say "not reached"']) == 0
        assert "not reached" not in capsys.readouterr().out

    def test_blank_lines_are_ignored(self, capsys):
        self.run_lines(["", "   ", "say 1"])
        assert capsys.readouterr().out == "1\n"

    def test_a_value_of_nothing_is_not_echoed(self, capsys):
        self.run_lines(["function f()", "    return", "", "f()"])
        assert capsys.readouterr().out == ""

    @pytest.mark.parametrize(
        "line,expected",
        [
            ("if true", True),
            ("IF true", True),
            ("for x in y", True),
            ("while true", True),
            ("function f()", True),
            ("else", True),
            ("say 1", False),
            ("x = 1", False),
            ("", False),
            ("   ", False),
        ],
    )
    def test_which_lines_start_a_block(self, line, expected):
        assert _opens_block(line) is expected


class TestVersionIsSingleSourced:
    """``lzy --version`` reports the package's own version.

    pyproject declares the version dynamically from ``lzy.__version__``, so
    the package and its packaging metadata cannot drift apart by editing one
    and forgetting the other. That the *built* metadata matches is checked in
    CI's Package job, where a fresh build actually happens; asserting it here
    would only test whether the developer had reinstalled since their last
    version bump.
    """

    def test_the_cli_reports_the_package_version(self, capsys):
        with pytest.raises(SystemExit):
            main(["--version"])
        assert capsys.readouterr().out.strip() == f"LZY {__version__}"
