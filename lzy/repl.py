"""The interactive LZY session.

The REPL keeps one interpreter alive across lines, so names and functions stay
available. Because LZY uses indentation for blocks, a line that opens a block
starts a continuation: the REPL keeps reading until a blank line finishes it.
"""

from __future__ import annotations

import sys
from typing import List, Optional

from lzy import __version__
from lzy.ast.nodes import ExpressionStatement
from lzy.errors import LzyError
from lzy.interpreter.interpreter import Interpreter
from lzy.interpreter.values import show
from lzy.lexer.lexer import tokenize
from lzy.parser.parser import parse
from lzy.runtime.limits import Limits

PROMPT = "lzy> "
CONTINUATION = "...  "

BANNER = f"""LZY {__version__} - complex logic, simple code.
Type some LZY and press Enter. Type 'exit' to leave, 'help' for a reminder.
"""

HELP = """Things to try:

    say "Hello"
    name = "Ada"
    say "Hello " + name
    numbers = [3, 1, 2]
    say sort(numbers)

To write a block, end the line and indent the next one. A blank line runs it:

    if 5 > 3
        say "yes"

Type 'exit' to leave.
"""

#: Words that end the session. They are matched without regard to case, like
#: everything else in LZY.
_QUIT = {"exit", "quit", "bye"}


def run_repl(
    limits: Optional[Limits] = None,
    debug: bool = False,
    input_lines: Optional[List[str]] = None,
) -> int:
    """Start a REPL. ``input_lines`` drives it from a list, for testing."""
    limits = limits or Limits()
    interpreter = Interpreter(limits=limits, file="<repl>")
    scripted = iter(input_lines) if input_lines is not None else None

    if scripted is None:
        print(BANNER)

    buffer: List[str] = []
    while True:
        prompt = CONTINUATION if buffer else PROMPT
        try:
            line = next(scripted) if scripted is not None else input(prompt)
        except (EOFError, StopIteration):
            if scripted is None:
                print()
            return 0
        except KeyboardInterrupt:
            print("\n(use 'exit' to leave)")
            buffer.clear()
            continue

        command = line.strip().casefold()
        if not buffer and command in _QUIT:
            return 0
        if not buffer and command == "help":
            print(HELP)
            continue

        if buffer:
            if line.strip() == "":
                source = "\n".join(buffer)
                buffer.clear()
                _run_chunk(interpreter, source, limits, debug)
                continue
            buffer.append(line)
            continue

        if _opens_block(line):
            buffer.append(line)
            continue

        if line.strip() == "":
            continue
        _run_chunk(interpreter, line, limits, debug)


def _opens_block(line: str) -> bool:
    """Whether this line starts a block and needs more lines after it."""
    stripped = line.strip().casefold()
    if not stripped:
        return False
    first = stripped.split("(")[0].split()[0] if stripped.split() else ""
    return first in {"if", "else", "while", "for", "function"}


def _run_chunk(interpreter: Interpreter, source: str, limits: Limits, debug: bool) -> None:
    try:
        program = parse(tokenize(source, "<repl>", limits), limits)
    except LzyError as error:
        print(error.render(source), file=sys.stderr)
        if debug:
            raise
        return

    # A lone expression is echoed, so that `1 + 1` is useful at the prompt.
    statements = program.body.statements
    echo = (
        len(statements) == 1
        and isinstance(statements[0], ExpressionStatement)
    )

    try:
        if echo:
            value = interpreter.evaluate_source_expression(statements[0].expression)
            if value is not None:
                print(show(value))
        else:
            interpreter.run(program)
    except LzyError as error:
        print(error.render(source), file=sys.stderr)
        if debug:
            raise
