"""The ``lzy`` command-line tool."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from lzy import __version__
from lzy.errors import LzyError, LzyIOError
from lzy.interpreter.interpreter import Interpreter
from lzy.lexer.lexer import tokenize
from lzy.parser.parser import parse
from lzy.repl import run_repl
from lzy.runtime.limits import Limits

#: The extension LZY programs use. Files with other extensions still run; this
#: is only used to give a better message when someone points at the wrong file.
EXTENSION = ".lzy"

EXIT_OK = 0
EXIT_ERROR = 1

DESCRIPTION = "LZY - complex logic, simple code."

EPILOG = """examples:
  lzy hello.lzy            run a program
  lzy run hello.lzy        the same thing, written out
  lzy repl                 try LZY one line at a time
  lzy check hello.lzy      look for mistakes without running it
"""

#: Global flags that may appear before the command and take no value of their own.
GLOBAL_FLAGS = {"--debug", "--safe"}

COMMANDS = {"run", "check", "repl"}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="lzy",
        description=DESCRIPTION,
        epilog=EPILOG,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--version", action="version", version=f"LZY {__version__}")
    parser.add_argument(
        "--debug",
        action="store_true",
        help="show LZY's own Python traceback when something goes wrong",
    )
    parser.add_argument(
        "--safe",
        action="store_true",
        help="run with tighter limits, for code you do not trust",
    )

    commands = parser.add_subparsers(dest="command", metavar="<command>")

    run = commands.add_parser("run", help="run a program")
    run.add_argument("file", help="the .lzy file to run")

    check = commands.add_parser("check", help="check a program without running it")
    check.add_argument("file", help="the .lzy file to check")

    commands.add_parser("repl", help="start an interactive session")
    return parser


def normalise_argv(argv: list[str]) -> list[str]:
    """Let ``lzy hello.lzy`` mean ``lzy run hello.lzy``.

    Running a file is by far the common case, so a bare path is treated as an
    implicit ``run``. Global flags may still come first, so the scan steps over
    them before deciding whether a command was given.
    """
    for index, item in enumerate(argv):
        if item in GLOBAL_FLAGS:
            continue
        if item.startswith("-"):
            # An unknown flag, or --version/--help: let argparse deal with it.
            return argv
        if item in COMMANDS:
            return argv
        return argv[:index] + ["run"] + argv[index:]
    return argv


def main(argv: list[str] | None = None) -> int:
    argv = normalise_argv(list(sys.argv[1:] if argv is None else argv))
    parser = build_parser()
    args = parser.parse_args(argv)
    limits = Limits().sandboxed() if args.safe else Limits()

    try:
        if args.command == "run":
            return run_file(Path(args.file), limits, args.debug, execute=True)
        if args.command == "check":
            return run_file(Path(args.file), limits, args.debug, execute=False)
        if args.command == "repl":
            return run_repl(limits=limits, debug=args.debug)

        # No command at all: run a piped program, or start the REPL.
        if not sys.stdin.isatty():
            return run_stdin(limits, args.debug)
        return run_repl(limits=limits, debug=args.debug)
    except LzyError as error:
        if args.debug:
            # run_file has already reported this; re-raise so a maintainer
            # sees LZY's own traceback.
            raise
        report(error, None)
        return EXIT_ERROR
    except KeyboardInterrupt:
        print("\nStopped.", file=sys.stderr)
        return EXIT_ERROR


def read_program(path: Path) -> str:
    """Read a source file, turning every failure into an LZY error."""
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        hint = None
        if path.suffix == "":
            candidate = path.with_suffix(EXTENSION)
            if candidate.exists():
                hint = f"There is a file called {candidate.name}. Did you mean that?"
        raise LzyIOError(
            "LZY could not find this file:",
            None,
            detail=str(path),
            hint=hint or "Check the spelling, and the folder you are in.",
        ) from None
    except IsADirectoryError:
        raise LzyIOError(
            "This is a folder, not a program:",
            None,
            detail=str(path),
            hint="Point LZY at a .lzy file inside it.",
        ) from None
    except PermissionError:
        raise LzyIOError(
            "LZY is not allowed to read this file:",
            None,
            detail=str(path),
            hint="Check the file's permissions.",
        ) from None
    except UnicodeDecodeError:
        raise LzyIOError(
            "This file is not text that LZY can read:",
            None,
            detail=str(path),
            hint="LZY programs are saved as UTF-8 text. This looks like a binary file.",
        ) from None


def run_file(path: Path, limits: Limits, debug: bool, execute: bool) -> int:
    source = read_program(path)
    name = str(path)

    try:
        program = parse(tokenize(source, name, limits), limits)
        if not execute:
            print(f"{name}: no mistakes found.")
            return EXIT_OK
        Interpreter(limits=limits, file=name).run(program)
        return EXIT_OK
    except LzyError as error:
        report(error, source)
        if debug:
            raise
        return EXIT_ERROR


def run_stdin(limits: Limits, debug: bool) -> int:
    """Run a program piped in on standard input.

    ``ask`` cannot work here, because standard input is the program itself. It
    fails with a clear message rather than reading its own source as an answer.
    """
    source = sys.stdin.read()
    try:
        program = parse(tokenize(source, "<stdin>", limits), limits)
        Interpreter(limits=limits, file="<stdin>").run(program)
        return EXIT_OK
    except LzyError as error:
        report(error, source)
        if debug:
            raise
        return EXIT_ERROR


def report(error: LzyError, source: str | None) -> None:
    print(error.render(source), file=sys.stderr)


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
