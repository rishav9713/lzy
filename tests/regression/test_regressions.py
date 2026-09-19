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
