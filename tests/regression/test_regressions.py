"""One test per bug that has been fixed, so it cannot come back.

Each test names the behaviour that was wrong and what it should do instead.
Add to this file whenever a bug is fixed, not only when it seems important:
the cheap ones are the ones that come back.
"""

from __future__ import annotations

import sys

import pytest

from lzy.cli.main import EXIT_ERROR, EXIT_OK, main
from lzy.errors import LzyError, LzyLimitError
from lzy.runtime.limits import Limits
from tests.conftest import error, output, run


class TestFixed001CliBarePath:
    """``lzy file.lzy`` crashed with a Python TypeError.

    A hidden top-level positional argument competed with the subparsers, so
    argparse overwrote the file name with None after the subparser had set it.
    """

    def test_a_bare_path_runs(self, tmp_path, capsys):
        path = tmp_path / "p.lzy"
        path.write_text('say "ok"', encoding="utf-8")
        assert main([str(path)]) == EXIT_OK
        assert capsys.readouterr().out == "ok\n"

    def test_a_bare_path_after_a_global_flag_runs(self, tmp_path, capsys):
        path = tmp_path / "p.lzy"
        path.write_text('say "ok"', encoding="utf-8")
        assert main(["--safe", str(path)]) == EXIT_OK
        assert capsys.readouterr().out == "ok\n"


class TestFixed002SelfReferentialCompare:
    """Comparing a list that contained itself overflowed the C stack.

    ``equal`` recursed without a depth limit, so the process died instead of
    reporting an LZY error.
    """

    def test_comparing_two_self_referential_lists_reports_an_error(self):
        source = "a = [1]\nappend(a, a)\nb = [1]\nappend(b, b)\nsay a == b"
        result = run(source)
        assert result.ok or isinstance(result.error, LzyError)

    def test_a_list_is_equal_to_itself_without_recursing(self):
        assert output("a = [1]\nappend(a, a)\nsay a == a") == ["true"]

    def test_contains_reports_rather_than_crashing(self):
        source = "\n".join(
            [
                "a = []",
                "inner = a",
                "for i in range(300)",
                "    outer = [inner]",
                "    inner = outer",
                "b = []",
                "inner2 = b",
                "for i in range(300)",
                "    outer2 = [inner2]",
                "    inner2 = outer2",
                "say inner == inner2",
            ]
        )
        result = run(source)
        assert result.ok or isinstance(result.error, LzyLimitError)


class TestFixed003SuggestionSize:
    """A type error echoed a whole 5000-character literal back at the user."""

    def test_a_huge_literal_is_not_quoted_in_a_suggestion(self):
        source = 'say "' + "x" * 5000 + '" + 1'
        err = error(source)
        rendered = err.render(source)
        assert max(len(line) for line in rendered.splitlines()) < 300

    def test_a_short_literal_is_still_quoted(self):
        err = error('total = 1\nsay total + "a"')
        assert err.suggestion == 'total + number("a")'


class TestFixed004PathsAreNotWrapped:
    """A file path with spaces in it was wrapped across two lines."""

    def test_the_path_stays_on_one_line(self, tmp_path, capsys):
        folder = tmp_path / "a folder with spaces in the name that is quite long"
        folder.mkdir()
        missing = folder / "not-here.lzy"
        assert main([str(missing)]) == EXIT_ERROR
        assert f"    {missing}" in capsys.readouterr().err


class TestFixed005DebugDoesNotDoubleReport:
    """``--debug`` printed the error twice and swallowed the traceback."""

    def test_debug_raises_instead_of_reporting_twice(self, tmp_path, capsys):
        path = tmp_path / "p.lzy"
        path.write_text("say 1 / 0", encoding="utf-8")
        with pytest.raises(LzyError):
            main(["--debug", str(path)])
        assert capsys.readouterr().err.count("Value error") == 1


class TestFixed006RecursionLimitIsRestored:
    """Running a program left Python's recursion limit raised afterwards."""

    def test_the_limit_goes_back_to_what_it_was(self):
        before = sys.getrecursionlimit()
        run("say 1")
        assert sys.getrecursionlimit() == before

    def test_even_when_the_program_fails(self):
        before = sys.getrecursionlimit()
        run("say 1 / 0")
        assert sys.getrecursionlimit() == before


class TestFixed007WindowsStackOverflow:
    """A deep expression killed the process on Windows, Python 3.9 and 3.10.

    The first CI run found it. Two mistakes compounded:

    * a left-leaning operator chain is *parsed* by a loop but *evaluated* by
      recursion, so ``max_parse_depth`` never fired on the shape that mattered;
    * ``python_recursion_limit`` was raised to 20,000, which does not create
      stack, it only removes CPython's guard. On the 1 MB stack Windows gives
      the main thread, that turned a catchable error into a fatal crash.

    Only 3.9 and 3.10 were affected, because CPython 3.11 stopped consuming C
    stack for Python-to-Python calls.
    """

    def test_a_long_operator_chain_still_evaluates(self):
        assert output("say " + " + ".join(["1"] * 2000)) == ["2000"]

    def test_a_chain_past_the_limit_is_an_error_not_a_crash(self):
        err = error("say " + " + ".join(["1"] * 8000))
        assert isinstance(err, LzyError)
        assert "nests too deeply" in err.message

    def test_lzy_check_catches_it_too(self, tmp_path, capsys):
        """The limit is enforced at parse time, so checking finds it."""
        path = tmp_path / "deep.lzy"
        path.write_text("say " + " + ".join(["1"] * 8000), encoding="utf-8")
        assert main(["check", str(path)]) == EXIT_ERROR
        assert "nests too deeply" in capsys.readouterr().err

    def test_the_documented_call_depth_is_reachable(self):
        """max_call_depth is advertised, so it has to actually work.

        Before the fix this was several thousand Python frames on a 1 MB
        stack, so the documented limit was not reachable on Windows at all.
        """
        source = "\n".join(
            [
                "function countdown(n)",
                "    if n <= 0",
                "        return 0",
                "    return countdown(n - 1)",
                "say countdown(390)",
            ]
        )
        assert output(source) == ["0"]

    def test_runaway_recursion_reports_rather_than_crashing(self):
        err = error("function f(n)\n    return f(n + 1)\nsay f(0)")
        assert isinstance(err, LzyLimitError)
        assert "called itself too many times" in err.message

    def test_evaluation_depth_is_bounded_even_when_the_tree_is_not_deep(self):
        """Many shallow calls each holding an expression open still add up.

        ``max_ast_depth`` cannot see this shape, because no single tree is
        deep. ``max_evaluation_depth`` is the backstop that does.
        """
        limits = Limits(max_evaluation_depth=60, max_call_depth=10_000)
        source = "\n".join(
            [
                "function down(n)",
                "    if n <= 0",
                "        return 0",
                "    return 1 + down(n - 1)",
                "say down(500)",
            ]
        )
        err = error(source, limits=limits)
        assert isinstance(err, LzyLimitError)
        assert "too many things at once" in err.message

    def test_the_program_runs_on_a_thread_with_a_stack_lzy_chose(self):
        source = "function f(n)\n    return f(n + 1)\nsay f(0)"

        # A stack far too small for the default limits: LZY must still report
        # an error rather than let the platform kill the process.
        tiny = Limits(thread_stack_bytes=256 * 1024, max_call_depth=50)
        result = run(source, limits=tiny)
        assert isinstance(result.error, LzyError)

    def test_a_platform_that_refuses_a_stack_size_still_runs(self, monkeypatch):
        """The thread is an improvement, not a dependency."""
        import lzy.runtime.execution as execution

        def refuse(*args, **kwargs):
            raise ValueError("stack size not supported here")

        monkeypatch.setattr(execution.threading, "stack_size", refuse)
        assert output("say 1 + 1") == ["2"]

    def test_the_default_thread_stack_size_is_restored(self):
        """The setting is process-wide, so LZY must put it back."""
        import threading

        before = threading.stack_size()
        run("say 1")
        assert threading.stack_size() == before
