"""The LZY lexer: source text in, tokens out.

Blocks are written with indentation, so the lexer is responsible for turning
leading spaces into INDENT and DEDENT tokens. Inside brackets, line breaks and
indentation carry no meaning, which lets long lists and calls wrap naturally.
"""

from __future__ import annotations

from typing import List, Optional

from lzy.errors import LzySyntaxError, Span
from lzy.lexer.tokens import KEYWORDS, RESERVED, Token, TokenType, fold
from lzy.runtime.limits import Limits

#: Single characters that map straight to a token type.
_SIMPLE = {
    "+": TokenType.PLUS,
    "-": TokenType.MINUS,
    "*": TokenType.STAR,
    "/": TokenType.SLASH,
    "%": TokenType.PERCENT,
    "(": TokenType.LPAREN,
    ")": TokenType.RPAREN,
    "[": TokenType.LBRACKET,
    "]": TokenType.RBRACKET,
    "{": TokenType.LBRACE,
    "}": TokenType.RBRACE,
    ",": TokenType.COMMA,
    ":": TokenType.COLON,
    ".": TokenType.DOT,
}

_OPENERS = {"(": ")", "[": "]", "{": "}"}
_CLOSERS = {")": "(", "]": "[", "}": "{"}

_ESCAPES = {
    "n": "\n",
    "t": "\t",
    "r": "\r",
    "\\": "\\",
    '"': '"',
    "'": "'",
    "0": "\0",
}


class Lexer:
    def __init__(
        self,
        source: str,
        file: str = "<input>",
        limits: Optional[Limits] = None,
    ) -> None:
        self.limits = limits or Limits()
        self.file = file
        self.source = self._normalise(source)
        self.pos = 0
        self.line = 1
        self.line_start = 0
        self.tokens: List[Token] = []
        self.indents: List[int] = [0]
        #: Stack of open brackets as (character, span) so we can report the
        #: opening location when one is never closed.
        self.brackets: List[tuple] = []
        #: True when nothing but layout has been emitted on the current line.
        self.line_is_empty = True

    # ------------------------------------------------------------------
    # Setup helpers
    # ------------------------------------------------------------------

    def _normalise(self, source: str) -> str:
        if len(source) > self.limits.max_source_characters:
            raise LzySyntaxError(
                "This file is too large for LZY to read safely.",
                Span(1, 1, 1, self.file),
                hint=(
                    f"The limit is {self.limits.max_source_characters:,} characters. "
                    "Try splitting the program into smaller files."
                ),
            )
        if source.startswith("﻿"):
            source = source[1:]
        return source.replace("\r\n", "\n").replace("\r", "\n")

    # ------------------------------------------------------------------
    # Position helpers
    # ------------------------------------------------------------------

    @property
    def column(self) -> int:
        return self.pos - self.line_start + 1

    def span(self, start_pos: int, start_line: int, start_col: int) -> Span:
        return Span(start_line, start_col, max(1, self.pos - start_pos), self.file)

    def here(self, length: int = 1) -> Span:
        return Span(self.line, self.column, length, self.file)

    def at_end(self) -> bool:
        return self.pos >= len(self.source)

    def peek(self, offset: int = 0) -> str:
        index = self.pos + offset
        if index >= len(self.source):
            return ""
        return self.source[index]

    def advance(self) -> str:
        ch = self.source[self.pos]
        self.pos += 1
        if ch == "\n":
            self.line += 1
            self.line_start = self.pos
        return ch

    def add(self, type: TokenType, text: str, span: Span, value: object = None) -> None:
        self.tokens.append(Token(type, text, span, value))
        self.line_is_empty = False

    # ------------------------------------------------------------------
    # Main loop
    # ------------------------------------------------------------------

    def tokenize(self) -> List[Token]:
        self._handle_line_start()
        while not self.at_end():
            self._scan_token()
        self._finish()
        return self.tokens

    def _finish(self) -> None:
        if self.brackets:
            char, span = self.brackets[-1]
            raise LzySyntaxError(
                f"This {char!r} was never closed.".replace('"', ""),
                span,
                hint=f"Add a closing {_OPENERS[char]} to match it.",
            )
        if not self.line_is_empty:
            self.tokens.append(Token(TokenType.NEWLINE, "", self.here(1)))
        while len(self.indents) > 1:
            self.indents.pop()
            self.tokens.append(Token(TokenType.DEDENT, "", self.here(1)))
        self.tokens.append(Token(TokenType.EOF, "", self.here(1)))

    def _scan_token(self) -> None:
        ch = self.peek()

        if ch == "\n":
            self._scan_newline()
            return
        if ch in (" ", "\t"):
            self._skip_inline_space()
            return
        if ch == "#":
            while not self.at_end() and self.peek() != "\n":
                self.advance()
            return

        start_pos, start_line, start_col = self.pos, self.line, self.column

        if ch.isdigit():
            self._scan_number(start_pos, start_line, start_col)
            return
        if ch in ('"', "'"):
            self._scan_text(start_pos, start_line, start_col)
            return
        if ch.isalpha() or ch == "_":
            self._scan_word(start_pos, start_line, start_col)
            return
        self._scan_operator(start_pos, start_line, start_col)

    # ------------------------------------------------------------------
    # Layout
    # ------------------------------------------------------------------

    def _skip_inline_space(self) -> None:
        while not self.at_end() and self.peek() in (" ", "\t"):
            self.advance()

    def _scan_newline(self) -> None:
        if self.brackets:
            # Inside brackets a line break is just whitespace.
            self.advance()
            return
        span = self.here(1)
        self.advance()
        if not self.line_is_empty:
            self.tokens.append(Token(TokenType.NEWLINE, "", span))
        self._handle_line_start()

    def _handle_line_start(self) -> None:
        """Measure indentation and emit INDENT/DEDENT for the coming line."""
        while True:
            self.line_is_empty = True
            width = 0
            while not self.at_end() and self.peek() in (" ", "\t"):
                if self.peek() == "\t":
                    raise LzySyntaxError(
                        "This line is indented with a tab.",
                        self.here(1),
                        hint=(
                            "LZY indents with spaces so that every editor shows your "
                            "code the same way. Replace the tab with spaces "
                            "(4 spaces per level is the LZY style)."
                        ),
                    )
                self.advance()
                width += 1

            if self.at_end():
                return
            if self.peek() == "\n":
                # A blank line carries no indentation meaning.
                self.advance()
                continue
            if self.peek() == "#":
                while not self.at_end() and self.peek() != "\n":
                    self.advance()
                if not self.at_end():
                    self.advance()
                continue

            self._apply_indent(width)
            return

    def _apply_indent(self, width: int) -> None:
        current = self.indents[-1]
        if width == current:
            return
        if width > current:
            if len(self.indents) >= self.limits.max_block_depth:
                raise LzySyntaxError(
                    "This code is nested too deeply.",
                    self.here(1),
                    hint=(
                        f"LZY allows up to {self.limits.max_block_depth} levels of "
                        "indentation. Try moving some of this work into a function."
                    ),
                )
            self.indents.append(width)
            self.tokens.append(
                Token(
                    TokenType.INDENT,
                    " " * width,
                    Span(self.line, 1, max(1, width), self.file),
                )
            )
            self.line_is_empty = True
            return

        while width < self.indents[-1]:
            self.indents.pop()
            self.tokens.append(Token(TokenType.DEDENT, "", Span(self.line, 1, 1, self.file)))
        if width != self.indents[-1]:
            levels = ", ".join(str(i) for i in self.indents)
            raise LzySyntaxError(
                f"This line is indented by {width} spaces, which does not line up "
                "with any block above it.",
                Span(self.line, 1, max(1, width), self.file),
                hint=f"The blocks around it start at these indents: {levels}.",
            )
        self.line_is_empty = True

    # ------------------------------------------------------------------
    # Literals and names
    # ------------------------------------------------------------------

    def _scan_number(self, start_pos: int, start_line: int, start_col: int) -> None:
        def digits() -> None:
            while self.peek().isdigit() or (self.peek() == "_" and self.peek(1).isdigit()):
                self.advance()

        digits()
        is_real = False
        if self.peek() == "." and self.peek(1).isdigit():
            is_real = True
            self.advance()
            digits()
        if self.peek() in ("e", "E"):
            after = 2 if self.peek(1) in ("+", "-") else 1
            if self.peek(after).isdigit():
                is_real = True
                self.advance()
                if self.peek() in ("+", "-"):
                    self.advance()
                digits()

        text = self.source[start_pos : self.pos]

        if self.peek().isalpha() or self.peek() == "_":
            while self.peek().isalnum() or self.peek() == "_":
                self.advance()
            whole = self.source[start_pos : self.pos]
            raise LzySyntaxError(
                f"'{whole}' is not a number LZY understands.",
                self.span(start_pos, start_line, start_col),
                hint=(
                    "A number cannot be followed directly by letters. Put a space or "
                    "an operator between them."
                ),
            )

        span = self.span(start_pos, start_line, start_col)
        clean = text.replace("_", "")
        value = float(clean) if is_real else int(clean)
        self.add(TokenType.NUMBER, text, span, value)

    def _scan_text(self, start_pos: int, start_line: int, start_col: int) -> None:
        quote = self.advance()
        chunks: List[str] = []
        while True:
            if self.at_end() or self.peek() == "\n":
                raise LzySyntaxError(
                    "This text was opened but never closed.",
                    Span(start_line, start_col, 1, self.file),
                    hint=f"Add a closing {quote} at the end of the text.",
                )
            ch = self.advance()
            if ch == quote:
                break
            if ch == "\\":
                chunks.append(self._scan_escape())
            else:
                chunks.append(ch)

        span = self.span(start_pos, start_line, start_col)
        self.add(TokenType.TEXT, self.source[start_pos : self.pos], span, "".join(chunks))

    def _scan_escape(self) -> str:
        if self.at_end() or self.peek() == "\n":
            raise LzySyntaxError(
                "This text ends with an unfinished backslash escape.",
                self.here(1),
                hint="Write a double backslash if you want one backslash character.",
            )
        marker = self.advance()
        if marker in _ESCAPES:
            return _ESCAPES[marker]
        if marker == "u":
            return self._scan_unicode_escape()
        raise LzySyntaxError(
            f"'\\{marker}' is not an escape LZY understands.",
            Span(self.line, max(1, self.column - 2), 2, self.file),
            hint="LZY understands \\n, \\t, \\r, \\0, \\\\, \\\", \\' and \\u{...}.",
        )

    def _scan_unicode_escape(self) -> str:
        opening = Span(self.line, max(1, self.column - 2), 2, self.file)
        if self.peek() != "{":
            raise LzySyntaxError(
                "A \\u escape needs braces around the character number.",
                opening,
                hint="Write it like \\u{1F600}.",
            )
        self.advance()
        start = self.pos
        while not self.at_end() and self.peek() not in ("}", "\n"):
            self.advance()
        if self.peek() != "}":
            raise LzySyntaxError(
                "This \\u{ escape was never closed.",
                opening,
                hint="Write it like \\u{1F600}.",
            )
        digits = self.source[start : self.pos]
        self.advance()
        try:
            code = int(digits, 16)
        except ValueError:
            code = -1
        if not 0 <= code <= 0x10FFFF:
            raise LzySyntaxError(
                f"'{digits}' is not a character number LZY can use.",
                opening,
                hint="Use hexadecimal digits up to 10FFFF, like \\u{1F600}.",
            )
        return chr(code)

    def _scan_word(self, start_pos: int, start_line: int, start_col: int) -> None:
        while self.peek().isalnum() or self.peek() == "_":
            self.advance()
        text = self.source[start_pos : self.pos]
        folded = fold(text)
        span = self.span(start_pos, start_line, start_col)

        keyword = KEYWORDS.get(folded)
        if keyword is not None:
            self.add(keyword, text, span, folded)
            return
        if folded in RESERVED:
            raise LzySyntaxError(
                f"'{text}' is a word LZY keeps for a future version of the language.",
                span,
                hint=(
                    "Choose a different name so your program keeps working when LZY "
                    "starts using this word."
                ),
                suggestion=f"my_{folded}",
            )
        self.add(TokenType.IDENT, text, span, folded)

    # ------------------------------------------------------------------
    # Operators
    # ------------------------------------------------------------------

    def _scan_operator(self, start_pos: int, start_line: int, start_col: int) -> None:
        ch = self.advance()

        if ch == "=":
            if self.peek() == "=":
                self.advance()
                self.add(TokenType.EQUAL, "==", self.span(start_pos, start_line, start_col))
            else:
                self.add(TokenType.ASSIGN, "=", self.span(start_pos, start_line, start_col))
            return

        if ch == "!":
            if self.peek() == "=":
                self.advance()
                self.add(TokenType.NOT_EQUAL, "!=", self.span(start_pos, start_line, start_col))
                return
            raise LzySyntaxError(
                "LZY does not use '!' on its own.",
                self.span(start_pos, start_line, start_col),
                hint=(
                    "Write 'not' to turn a yes/no value around, or '!=' to check that "
                    "two values are different."
                ),
            )

        if ch == "<":
            if self.peek() == "=":
                self.advance()
                self.add(TokenType.LESS_EQUAL, "<=", self.span(start_pos, start_line, start_col))
            else:
                self.add(TokenType.LESS, "<", self.span(start_pos, start_line, start_col))
            return

        if ch == ">":
            if self.peek() == "=":
                self.advance()
                self.add(
                    TokenType.GREATER_EQUAL, ">=", self.span(start_pos, start_line, start_col)
                )
            else:
                self.add(TokenType.GREATER, ">", self.span(start_pos, start_line, start_col))
            return

        if ch in _OPENERS:
            span = self.span(start_pos, start_line, start_col)
            if len(self.brackets) >= self.limits.max_bracket_depth:
                raise LzySyntaxError(
                    "This expression has too many brackets inside each other.",
                    span,
                    hint=(
                        f"LZY allows up to {self.limits.max_bracket_depth} levels. "
                        "Try splitting the expression into named steps."
                    ),
                )
            self.brackets.append((ch, span))
            self.add(_SIMPLE[ch], ch, span)
            return

        if ch in _CLOSERS:
            span = self.span(start_pos, start_line, start_col)
            if not self.brackets:
                raise LzySyntaxError(
                    f"There is a {ch} here with no matching {_CLOSERS[ch]} before it.",
                    span,
                    hint=f"Remove it, or add the {_CLOSERS[ch]} that should come first.",
                )
            opened, opened_span = self.brackets.pop()
            if _OPENERS[opened] != ch:
                raise LzySyntaxError(
                    f"This {ch} does not match the {opened} opened on line "
                    f"{opened_span.line}.",
                    span,
                    hint=f"Close it with {_OPENERS[opened]} instead.",
                )
            self.add(_SIMPLE[ch], ch, span)
            return

        if ch in _SIMPLE:
            self.add(_SIMPLE[ch], ch, self.span(start_pos, start_line, start_col))
            return

        raise LzySyntaxError(
            f"LZY does not know what to do with the character '{ch}'.",
            self.span(start_pos, start_line, start_col),
            hint="Remove it, or check for a typo.",
        )


def tokenize(source: str, file: str = "<input>", limits: Optional[Limits] = None) -> List[Token]:
    """Tokenize ``source``. Convenience wrapper around :class:`Lexer`."""
    return Lexer(source, file, limits).tokenize()
