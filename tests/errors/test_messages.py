"""Error messages are a feature, so their shape is tested like any other.

Every error a user can reach must answer four questions: what happened, where,
why, and how to fix it. These tests pin down that contract rather than the
exact wording, except where the wording is the point.
"""

from __future__ import annotations

import pytest

from lzy.errors import LzyError, LzySyntaxError, LzyTypeError, Span
from tests.conftest import error


class TestRenderedShape:
    SOURCE = 'total = 0\nname = "Ada"\nsay total + name\n'

    def rendered(self) -> str:
        return error(self.SOURCE).render(self.SOURCE)

    def test_says_what_kind_of_error(self):
        assert self.rendered().startswith("Type error")

    def test_says_where(self):
        assert "line 3" in self.rendered()

    def test_shows_the_offending_line(self):
        assert "say total + name" in self.rendered()

    def test_underlines_the_problem(self):
        assert "^" in self.rendered()

    def test_explains_why(self):
        assert "LZY keeps numbers and text apart" in self.rendered()

    def test_suggests_a_fix(self):
        assert "Maybe you meant:" in self.rendered()
        assert "total + number(name)" in self.rendered()

    def test_no_python_details_leak_out(self):
        rendered = self.rendered()
        for leak in ["Traceback", ".py", "lzy.interpreter", "self", "Python"]:
            assert leak not in rendered


class TestEveryErrorIsUsable:
    """A sweep over the mistakes a learner actually makes."""

    CASES = [
        'say total',
        'say 1 + "a"',
        'say [1][9]',
        'say {}["missing"]',
        'say 1 / 0',
        'if 1\n    say 1',
        'say length(1)',
        'say upper()',
        'x = 1\nsay x(1)',
        'function f(a)\n    return a\nsay f()',
        'say (1',
        'say "abc',
        'if true\nsay 1',
        'if true:\n    say 1',
        'say 1 $ 2',
        'break',
        'return 1',
        'for x in 5\n    say x',
        'say 1 < "a"',
        'class = 1',
        'print("hi")',
        'say nothing.name',
        'items = [1]\nitems["a"] = 2',
        'say sort([1, "a"])',
        'say number("abc")',
    ]

    @pytest.mark.parametrize("source", CASES)
    def test_error_is_an_lzy_error(self, source):
        assert isinstance(error(source), LzyError)

    @pytest.mark.parametrize("source", CASES)
    def test_error_has_a_message_that_reads_as_a_sentence(self, source):
        message = error(source).message
        assert message
        assert message[0].isupper() or message[0] in "'\"" or message.startswith("LZY")
        assert message.rstrip().endswith((".", "?"))

    @pytest.mark.parametrize("source", CASES)
    def test_error_offers_a_hint_or_a_suggestion(self, source):
        err = error(source)
        assert err.hint or err.suggestion, f"no help offered for: {source}"

    @pytest.mark.parametrize("source", CASES)
    def test_error_renders_without_blowing_up(self, source):
        rendered = error(source).render(source)
        assert rendered
        assert "Traceback" not in rendered

    @pytest.mark.parametrize("source", CASES)
    def test_error_renders_even_without_the_source(self, source):
        assert error(source).render(None)


class TestSpansPointAtTheRightPlace:
    def test_points_at_the_operator_not_the_whole_line(self):
        err = error('total = 0\nsay total + "a"')
        assert err.span.line == 2
        rendered = err.render('total = 0\nsay total + "a"')
        caret_line = [line for line in rendered.splitlines() if "^" in line][0]
        code_line = rendered.splitlines()[rendered.splitlines().index(caret_line) - 1]
        assert code_line.index("+") == caret_line.index("^")

    def test_points_at_the_name_that_is_missing(self):
        err = error("say 1\nsay missing_thing")
        assert err.span.line == 2
        assert err.span.length == len("missing_thing")

    def test_reports_the_right_line_after_blank_lines_and_comments(self):
        source = "# a comment\n\n\nsay missing\n"
        assert error(source).span.line == 4

    def test_reports_the_right_line_inside_a_block(self):
        source = "if true\n    say 1\n    say missing\n"
        assert error(source).span.line == 3


class TestRendererEdgeCases:
    def test_handles_a_span_past_the_end_of_the_source(self):
        err = LzyError("boom", Span(99, 1, 1, "<test>"))
        assert "boom" in err.render("say 1")

    def test_handles_a_very_long_line(self):
        source = "say " + '"' + "x" * 5000 + '" + 1'
        rendered = error(source).render(source)
        assert max(len(line) for line in rendered.splitlines()) < 400

    def test_handles_a_line_indented_with_tabs_in_the_snippet(self):
        # Tabs are a lexer error, but the renderer must still line the caret up.
        err = LzySyntaxError("boom", Span(1, 2, 1, "<test>"))
        rendered = err.render("\tsay 1")
        assert "^" in rendered

    def test_wraps_long_prose(self):
        err = LzyTypeError(
            "A very long message. " * 20,
            Span(1, 1, 1, "<test>"),
            hint="A very long hint. " * 20,
        )
        rendered = err.render(None)
        assert max(len(line) for line in rendered.splitlines()) <= 80

    def test_a_multi_line_hint_keeps_its_breaks(self):
        err = error("say completely_unknown_name")
        assert "\n" in err.hint
        assert err.render("say completely_unknown_name")
