"""Token definitions and identifier case-folding rules for LZY."""

from __future__ import annotations

import unicodedata
from dataclasses import dataclass
from enum import Enum, auto

from lzy.errors import Span


def fold(name: str) -> str:
    """Normalise a name to its case-insensitive form.

    LZY is case-insensitive, so ``Total``, ``TOTAL`` and ``total`` are one name.
    Folding happens in two steps:

    1. Unicode NFKC normalisation, so visually identical names written with
       different code points compare equal.
    2. ``str.casefold``, which is a full Unicode case fold rather than a naive
       ``lower()``.

    Consequences worth knowing (documented in SPEC.md):
    ``straße`` and ``strasse`` fold to the same name, and the Kelvin sign
    ``K`` folds to ``k``. Original spelling is kept on the token for
    diagnostics and tooling; only lookups use the folded form.
    """
    return unicodedata.normalize("NFKC", name).casefold()


class TokenType(Enum):
    # Literals and names
    NUMBER = auto()
    TEXT = auto()
    IDENT = auto()

    # Keywords
    IF = auto()
    ELSE = auto()
    WHILE = auto()
    FOR = auto()
    IN = auto()
    FUNCTION = auto()
    RETURN = auto()
    BREAK = auto()
    CONTINUE = auto()
    SAY = auto()
    ASK = auto()
    AND = auto()
    OR = auto()
    NOT = auto()
    TRUE = auto()
    FALSE = auto()
    NOTHING = auto()

    # Operators and punctuation
    PLUS = auto()
    MINUS = auto()
    STAR = auto()
    SLASH = auto()
    PERCENT = auto()
    ASSIGN = auto()
    EQUAL = auto()
    NOT_EQUAL = auto()
    LESS = auto()
    LESS_EQUAL = auto()
    GREATER = auto()
    GREATER_EQUAL = auto()
    LPAREN = auto()
    RPAREN = auto()
    LBRACKET = auto()
    RBRACKET = auto()
    LBRACE = auto()
    RBRACE = auto()
    COMMA = auto()
    COLON = auto()
    DOT = auto()

    # Layout
    NEWLINE = auto()
    INDENT = auto()
    DEDENT = auto()
    EOF = auto()


#: Folded keyword spelling -> token type. Because the keys are already folded,
#: ``SAY``, ``Say`` and ``sAy`` all match the same entry.
KEYWORDS = {
    "if": TokenType.IF,
    "else": TokenType.ELSE,
    "while": TokenType.WHILE,
    "for": TokenType.FOR,
    "in": TokenType.IN,
    "function": TokenType.FUNCTION,
    "return": TokenType.RETURN,
    "break": TokenType.BREAK,
    "continue": TokenType.CONTINUE,
    "say": TokenType.SAY,
    "ask": TokenType.ASK,
    "and": TokenType.AND,
    "or": TokenType.OR,
    "not": TokenType.NOT,
    "true": TokenType.TRUE,
    "false": TokenType.FALSE,
    "nothing": TokenType.NOTHING,
}

#: Words that are not keywords yet but are reserved so that adding them later
#: is not a breaking change. Using one as a name is a friendly error today.
RESERVED = {
    "class", "struct", "import", "export", "module", "use", "async", "await",
    "match", "when", "where", "try", "catch", "throw", "finally", "with",
    "let", "const", "var", "then", "do", "end", "self", "this", "super",
    "new", "delete", "yield", "test", "assert", "enum", "interface",
    "public", "private", "static", "extends", "implements", "parallel",
}

#: Human-readable names used in error messages.
TOKEN_DESCRIPTIONS = {
    TokenType.NUMBER: "a number",
    TokenType.TEXT: "some text",
    TokenType.IDENT: "a name",
    TokenType.NEWLINE: "the end of the line",
    TokenType.INDENT: "an indented block",
    TokenType.DEDENT: "the end of the block",
    TokenType.EOF: "the end of the file",
    TokenType.LPAREN: "'('",
    TokenType.RPAREN: "')'",
    TokenType.LBRACKET: "'['",
    TokenType.RBRACKET: "']'",
    TokenType.LBRACE: "'{'",
    TokenType.RBRACE: "'}'",
    TokenType.COMMA: "','",
    TokenType.COLON: "':'",
    TokenType.DOT: "'.'",
    TokenType.ASSIGN: "'='",
}


@dataclass
class Token:
    """A single token.

    ``text`` keeps the original spelling exactly as written, so diagnostics,
    the formatter and IDE tooling can show the user's own casing. ``value``
    holds the folded name for identifiers and keywords, or the parsed literal
    for numbers and text.
    """

    type: TokenType
    text: str
    span: Span
    value: object = None

    def describe(self) -> str:
        """Describe this token the way an error message should refer to it."""
        if self.type in (TokenType.IDENT,):
            return f"the name '{self.text}'"
        if self.type is TokenType.NUMBER:
            return f"the number {self.text}"
        if self.type is TokenType.TEXT:
            return "some text"
        if self.type in KEYWORDS.values():
            return f"'{self.text}'"
        return TOKEN_DESCRIPTIONS.get(self.type, f"'{self.text}'")
