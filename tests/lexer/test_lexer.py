"""Lexer behaviour: tokens, literals, layout."""

from __future__ import annotations

import pytest

from lzy.errors import LzySyntaxError
from lzy.lexer.lexer import tokenize
from lzy.lexer.tokens import TokenType as T


def types(source: str):
    return [token.type for token in tokenize(source)]


def values(source: str):
    return [token.value for token in tokenize(source) if token.type in (T.NUMBER, T.TEXT)]


class TestLiterals:
    @pytest.mark.parametrize(
        "source,expected",
        [
            ("1", 1),
            ("42", 42),
            ("3.5", 3.5),
            ("1_000_000", 1000000),
            ("1e3", 1000.0),
            ("1.5e-2", 0.015),
            ("0", 0),
        ],
    )
    def test_numbers(self, source, expected):
        assert values(source) == [expected]

    def test_whole_numbers_stay_integers(self):
        token = tokenize("42")[0]
        assert isinstance(token.value, int)

    @pytest.mark.parametrize(
        "source,expected",
        [
            ('"hello"', "hello"),
            ("'hello'", "hello"),
            ('"with \\"quotes\\""', 'with "quotes"'),
            ('"tab\\there"', "tab\there"),
            ('"line\\nbreak"', "line\nbreak"),
            ('"back\\\\slash"', "back\\slash"),
            ('"\\u{48}i"', "Hi"),
            ('""', ""),
        ],
    )
    def test_text(self, source, expected):
        assert values(source) == [expected]

    def test_original_spelling_is_kept(self):
        token = tokenize("MyName")[0]
        assert token.text == "MyName"
        assert token.value == "myname"


class TestLayout:
    def test_simple_line(self):
        assert types('say "hi"') == [T.SAY, T.TEXT, T.NEWLINE, T.EOF]

    def test_indent_and_dedent(self):
        source = "if true\n    say 1\nsay 2\n"
        assert types(source) == [
            T.IF, T.TRUE, T.NEWLINE,
            T.INDENT, T.SAY, T.NUMBER, T.NEWLINE,
            T.DEDENT, T.SAY, T.NUMBER, T.NEWLINE,
            T.EOF,
        ]

    def test_blank_lines_carry_no_indentation(self):
        source = "if true\n\n    say 1\n\n\nsay 2\n"
        assert types(source).count(T.INDENT) == 1
        assert types(source).count(T.DEDENT) == 1

    def test_comment_only_lines_are_ignored(self):
        source = "if true\n# a comment at the left margin\n    say 1\n"
        assert types(source).count(T.INDENT) == 1

    def test_trailing_comment(self):
        assert types("say 1 # explain") == [T.SAY, T.NUMBER, T.NEWLINE, T.EOF]

    def test_dedent_to_end_of_file(self):
        source = "if true\n    if true\n        say 1\n"
        assert types(source).count(T.DEDENT) == 2

    def test_newlines_inside_brackets_are_ignored(self):
        source = "numbers = [\n    1,\n    2,\n]\n"
        assert T.INDENT not in types(source)
        assert types(source).count(T.NEWLINE) == 1

    def test_file_with_no_trailing_newline(self):
        assert types("say 1") == [T.SAY, T.NUMBER, T.NEWLINE, T.EOF]

    def test_empty_file(self):
        assert types("") == [T.EOF]

    def test_only_comments(self):
        assert types("# nothing here\n") == [T.EOF]

    def test_windows_line_endings(self):
        assert types("say 1\r\nsay 2\r\n").count(T.NEWLINE) == 2

    def test_byte_order_mark_is_skipped(self):
        assert types("﻿say 1") == [T.SAY, T.NUMBER, T.NEWLINE, T.EOF]


class TestOperators:
    @pytest.mark.parametrize(
        "source,expected",
        [
            ("==", T.EQUAL),
            ("!=", T.NOT_EQUAL),
            ("<", T.LESS),
            ("<=", T.LESS_EQUAL),
            (">", T.GREATER),
            (">=", T.GREATER_EQUAL),
            ("=", T.ASSIGN),
            ("+", T.PLUS),
            ("%", T.PERCENT),
            (".", T.DOT),
        ],
    )
    def test_operator_tokens(self, source, expected):
        assert types(source)[0] is expected


class TestLexerErrors:
    def test_tab_indentation_is_rejected(self):
        with pytest.raises(LzySyntaxError) as caught:
            tokenize("if true\n\tsay 1\n")
        assert "tab" in caught.value.message

    def test_unclosed_text(self):
        with pytest.raises(LzySyntaxError) as caught:
            tokenize('say "hello')
        assert "never closed" in caught.value.message

    def test_text_cannot_span_lines(self):
        with pytest.raises(LzySyntaxError):
            tokenize('say "hello\nworld"')

    def test_unclosed_bracket(self):
        with pytest.raises(LzySyntaxError) as caught:
            tokenize("say (1 + 2")
        assert "never closed" in caught.value.message

    def test_mismatched_bracket(self):
        with pytest.raises(LzySyntaxError) as caught:
            tokenize("say [1, 2)")
        assert "does not match" in caught.value.message

    def test_stray_closing_bracket(self):
        with pytest.raises(LzySyntaxError):
            tokenize("say 1)")

    def test_misaligned_dedent(self):
        source = "if true\n        say 1\n    say 2\n"
        with pytest.raises(LzySyntaxError) as caught:
            tokenize(source)
        assert "does not line up" in caught.value.message

    def test_unknown_character(self):
        with pytest.raises(LzySyntaxError) as caught:
            tokenize("say 1 $ 2")
        assert "$" in caught.value.message

    def test_bare_bang(self):
        with pytest.raises(LzySyntaxError) as caught:
            tokenize("say !true")
        assert "not" in caught.value.hint

    def test_number_followed_by_letters(self):
        with pytest.raises(LzySyntaxError) as caught:
            tokenize("say 12abc")
        assert "12abc" in caught.value.message

    def test_unknown_escape(self):
        with pytest.raises(LzySyntaxError) as caught:
            tokenize('say "\\q"')
        assert "escape" in caught.value.message

    def test_bad_unicode_escape(self):
        with pytest.raises(LzySyntaxError):
            tokenize('say "\\u{110000}"')

    def test_reserved_word_is_rejected_with_a_suggestion(self):
        with pytest.raises(LzySyntaxError) as caught:
            tokenize("class = 1")
        assert caught.value.suggestion == "my_class"


class TestSpans:
    def test_line_and_column_are_one_based(self):
        token = tokenize("say 1\nsay 2\n")[3]
        assert token.type is T.SAY
        assert token.span.line == 2
        assert token.span.column == 1

    def test_span_length_covers_the_token(self):
        token = tokenize("hello = 1")[0]
        assert token.span.length == 5
