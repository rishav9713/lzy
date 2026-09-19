"""Resource limits for running LZY programs.

These exist so that a malformed or hostile ``.lzy`` file fails with a clear LZY
error instead of crashing the host process. Every limit lives in one place so
that embedders (a future playground, a CI runner, a sandbox) can tighten them
without touching the lexer, parser or interpreter.

The defaults are deliberately generous for a person at a terminal and are not a
security boundary on their own: running untrusted LZY still belongs in a real
sandbox (separate process, memory and CPU caps, no network). See SECURITY.md.

Why there are several depth limits
----------------------------------

They bound different things, and each catches a shape the others miss:

* ``max_bracket_depth`` and ``max_block_depth`` are lexical, counted as the
  source is read.
* ``max_parse_depth`` bounds the parser's own recursion. It does **not** bound
  the tree the parser produces: ``1 + 1 + 1 + ...`` is parsed by a loop, so
  parser recursion stays flat while the tree grows one level per operator.
* ``max_ast_depth`` bounds that tree, checked with an iterative walk once
  parsing finishes. This is what stops a long operator chain from becoming
  deep evaluation later.
* ``max_evaluation_depth`` bounds the interpreter's total live nesting at run
  time — expressions inside calls inside expressions — which is what actually
  maps onto Python stack frames.
* ``max_call_depth`` is deliberately smaller and fires first for the common
  case of a function that calls itself forever, because "called itself too
  many times" is a far better message than "too deeply nested".
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

    #: Deepest expression/statement nesting the parser will recurse through.
    #: Guards the recursive-descent parser itself against stack exhaustion.
    max_parse_depth: int = 200

    #: Deepest syntax tree the parser will hand back, measured iteratively
    #: after parsing. Bounds how deep evaluation can later recurse, and is
    #: reported by ``lzy check`` as well as by ``lzy run``.
    max_ast_depth: int = 5_000

    #: Deepest total nesting the interpreter will hold open at once, counting
    #: every expression and statement on the way down.
    max_evaluation_depth: int = 5_000

    #: Deepest chain of LZY function calls before "called itself too many
    #: times". Smaller than ``max_evaluation_depth`` on purpose, so runaway
    #: recursion gets the message that names the real problem.
    max_call_depth: int = 400

    #: Python's own recursion ceiling while LZY code runs. It has to exceed
    #: ``max_evaluation_depth`` times the Python frames used per level, so that
    #: LZY's own limits are what a program hits rather than CPython's.
    python_recursion_limit: int = 20_000

    #: Stack given to the thread LZY programs run on, in bytes.
    #:
    #: This is not a tuning knob, it is a correctness requirement. Windows
    #: gives the main thread 1 MB, which is roughly 1,000 Python frames on
    #: CPython 3.9 and 3.10 — far fewer than LZY's own limits allow. Raising
    #: ``python_recursion_limit`` on that stack does not give more room, it
    #: just removes the guard and turns a clean error into a process crash.
    #: Running on a thread with an explicit stack makes the limits above mean
    #: the same thing on every platform.
    thread_stack_bytes: int = 64 * 1024 * 1024

    #: Longest text value ``say`` will print in one go, in characters.
    max_output_characters: int = 1_000_000

    def sandboxed(self) -> Limits:
        """A tighter profile for running code you do not trust."""
        return replace(
            self,
            max_source_characters=100_000,
            max_block_depth=32,
            max_bracket_depth=32,
            max_parse_depth=100,
            max_ast_depth=1_000,
            max_evaluation_depth=1_000,
            max_call_depth=100,
            max_output_characters=100_000,
        )


DEFAULT_LIMITS = Limits()
