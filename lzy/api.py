"""The one function most embedders need: run some LZY source.

Keeping the lexer -> parser -> interpreter pipeline in a single place means the
CLI, the REPL, the test suite and any future playground all run programs the
same way, and all report errors the same way.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable

from lzy.ast.nodes import Program
from lzy.errors import LzyError
from lzy.interpreter.interpreter import Interpreter
from lzy.lexer.lexer import tokenize
from lzy.parser.parser import parse
from lzy.runtime.limits import Limits


@dataclass
class Result:
    """What happened when a program ran."""

    output: list[str] = field(default_factory=list)
    error: LzyError | None = None

    @property
    def ok(self) -> bool:
        return self.error is None

    @property
    def text(self) -> str:
        """All printed lines joined, with a trailing newline if anything printed."""
        return "".join(line + "\n" for line in self.output)


def compile_source(
    source: str, file: str = "<input>", limits: Limits | None = None
) -> Program:
    """Turn LZY source into an AST. Raises :class:`LzyError` on bad input."""
    limits = limits or Limits()
    return parse(tokenize(source, file, limits), limits)


def run_source(
    source: str,
    file: str = "<input>",
    *,
    limits: Limits | None = None,
    output: Callable[[str], None] | None = None,
    read_line: Callable[[str], str] | None = None,
) -> Result:
    """Run LZY source and collect the outcome.

    Errors are returned on the :class:`Result` rather than raised, because
    every caller needs to render them with the source text alongside.
    """
    collected: list[str] = []

    def collect(line: str) -> None:
        collected.append(line)
        if output is not None:
            output(line)

    result = Result(collected)
    try:
        program = compile_source(source, file, limits)
        interpreter = Interpreter(
            limits=limits, output=collect, read_line=read_line, file=file
        )
        interpreter.run(program)
    except LzyError as error:
        result.error = error
    return result
