"""Resource limits for running LZY programs.

These exist so that a malformed or hostile ``.lzy`` file fails with a clear LZY
error instead of crashing the host process. Every limit lives in one place so
that embedders (a future playground, a CI runner, a sandbox) can tighten them
without touching the lexer, parser or interpreter.

The defaults are deliberately generous for a person at a terminal and are not a
security boundary on their own: running untrusted LZY still belongs in a real
sandbox (separate process, memory and CPU caps, no network). See SECURITY.md.
"""

from __future__ import annotations

from dataclasses import dataclass, replace


@dataclass(frozen=True)
class Limits:
    #: Longest source file the lexer will accept, in characters.
    max_source_characters: int = 2_000_000

    #: Deepest indentation nesting the lexer will accept.
    max_block_depth: int = 64

    #: Deepest bracket nesting the lexer will accept in one expression.
    max_bracket_depth: int = 64

    #: Deepest expression/statement nesting the parser will build. Guards the
    #: recursive-descent parser against stack exhaustion on hostile input.
    max_parse_depth: int = 200

    #: Deepest chain of LZY function calls before "too much recursion".
    max_call_depth: int = 400

    #: Python's own recursion ceiling while LZY code runs. It must comfortably
    #: exceed ``max_call_depth`` times the Python frames used per LZY call, but
    #: stay low enough that CPython raises RecursionError before the C stack
    #: actually overflows.
    python_recursion_limit: int = 20_000

    #: Longest text value ``say`` will print in one go, in characters.
    max_output_characters: int = 1_000_000

    def sandboxed(self) -> "Limits":
        """A tighter profile for running code you do not trust."""
        return replace(
            self,
            max_source_characters=100_000,
            max_block_depth=32,
            max_bracket_depth=32,
            max_parse_depth=100,
            max_call_depth=100,
            max_output_characters=100_000,
        )


DEFAULT_LIMITS = Limits()
