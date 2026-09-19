"""Human-friendly diagnostics for LZY.

Every error a normal LZY user sees is an :class:`LzyError`. It answers four
questions: what happened, where, why, and how to fix it. Python tracebacks are
an implementation detail and are only shown in developer mode (``--debug``).
"""

from __future__ import annotations

import textwrap
from dataclasses import dataclass, field

# How many characters of a source line we show before truncating it.
MAX_SOURCE_LINE = 200

# Prose is wrapped to this width so that messages stay readable in a terminal.
WRAP_WIDTH = 78


@dataclass
class Span:
    """A location in a source file.

    ``line`` and ``column`` are 1-based because that is what editors show.
    ``length`` is how many characters to underline.
    """

    line: int = 0
    column: int = 1
    length: int = 1
    file: str = "<input>"

    def __str__(self) -> str:  # pragma: no cover - debugging aid
        return f"{self.file}:{self.line}:{self.column}"


class LzyError(Exception):
    """Base class for every error reported to an LZY user."""

    #: Short category shown in the header, e.g. "Syntax error".
    kind = "Error"

    def __init__(
        self,
        message: str,
        span: Span | None = None,
        *,
        hint: str | None = None,
        suggestion: str | None = None,
        detail: str | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.span = span
        self.hint = hint
        #: A corrected line of code to show under "Maybe you meant:".
        self.suggestion = suggestion
        #: A file path or other exact string, shown on its own line and never
        #: wrapped, so that it can be read and copied in one piece.
        self.detail = detail

    def render(self, source: str | None = None) -> str:
        """Format this error as the block of text the user sees."""
        return _render(self, source)


class LzySyntaxError(LzyError):
    """The source could not be read as valid LZY (lexer or parser)."""

    kind = "Syntax error"


class LzyNameError(LzyError):
    """A name was used before it was given a value."""

    kind = "Name error"


class LzyTypeError(LzyError):
    """An operation was asked to work on a kind of value it cannot handle."""

    kind = "Type error"


class LzyValueError(LzyError):
    """The kind of value was right, but the value itself was not usable."""

    kind = "Value error"


class LzyIndexError(LzyError):
    """A position or key was asked for that does not exist."""

    kind = "Lookup error"


class LzyLimitError(LzyError):
    """A safety limit (recursion, nesting, size) was reached."""

    kind = "Limit reached"


class LzyIOError(LzyError):
    """A file or input/output operation failed."""

    kind = "Input error"


@dataclass
class _Rendered:
    parts: list = field(default_factory=list)

    def add(self, text: str = "") -> None:
        self.parts.append(text)

    def add_prose(self, text: str) -> None:
        """Add wrapped prose, keeping any line breaks the author wrote."""
        for paragraph in text.splitlines() or [""]:
            if paragraph.strip():
                self.parts.extend(
                    textwrap.wrap(
                        paragraph,
                        WRAP_WIDTH,
                        # A file path or a long name is easier to read whole,
                        # even if it runs past the wrap width.
                        break_long_words=False,
                        break_on_hyphens=False,
                    )
                )
            else:
                self.parts.append("")

    def text(self) -> str:
        return "\n".join(self.parts)


def _render(error: LzyError, source: str | None) -> str:
    out = _Rendered()
    span = error.span

    if span is not None and span.line > 0:
        where = f"on line {span.line}"
        if span.file and span.file != "<input>":
            where = f"in {span.file}, {where}"
        out.add(f"{error.kind} {where}.")
    else:
        out.add(f"{error.kind}.")

    out.add()
    out.add_prose(error.message)

    if error.detail:
        detail = error.detail
        if len(detail) > MAX_SOURCE_LINE:
            detail = detail[:MAX_SOURCE_LINE] + " ..."
        out.add()
        out.add(f"    {detail}")

    snippet = _snippet(source, span)
    if snippet:
        out.add()
        out.parts.extend(snippet)

    if error.hint:
        out.add()
        out.add_prose(error.hint)

    if error.suggestion:
        suggestion = error.suggestion
        if len(suggestion) > MAX_SOURCE_LINE:
            suggestion = suggestion[:MAX_SOURCE_LINE] + " ..."
        out.add()
        out.add("Maybe you meant:")
        out.add()
        out.add(f"    {suggestion}")

    return out.text()


def _snippet(source: str | None, span: Span | None) -> list:
    """Build the ``    code`` / ``    ^^^^`` pair of lines, if we can."""
    if source is None or span is None or span.line <= 0:
        return []

    lines = source.splitlines()
    if not (1 <= span.line <= len(lines)):
        return []

    raw = lines[span.line - 1]
    # Tabs would misalign the caret, so normalise them to a single space each.
    text = raw.replace("\t", " ")
    stripped = text.lstrip()
    removed = len(text) - len(stripped)

    column = max(1, span.column - removed)
    truncated = False
    if len(stripped) > MAX_SOURCE_LINE:
        stripped = stripped[:MAX_SOURCE_LINE]
        truncated = True

    caret_start = min(column - 1, len(stripped))
    caret_len = max(1, min(span.length, max(1, len(stripped) - caret_start)))

    code = "    " + stripped + (" ..." if truncated else "")
    carets = "    " + " " * caret_start + "^" * caret_len
    return [code, carets]
