"""Generate the website's data from the LZY interpreter and repository.

The website never states a fact about LZY that it could read from the source
instead. Built-in functions, keywords, the command line, the safety limits,
the error kinds, the examples and the size of the test suite all come from
here, so that when LZY changes, the website changes with it.

Run it from anywhere::

    python LZY-Website/scripts/generate_data.py

It writes JSON into ``LZY-Website/src/data/generated/``. The website's
``npm run dev``, ``npm run build`` and ``npm test`` run it first, so the
output is not committed.

Every example and every showcase program is actually run. If an example no
longer prints what its ``.out`` file says, this fails rather than publishing
output that LZY does not produce.
"""

from __future__ import annotations

import argparse
import contextlib
import io
import json
import os
import re
import subprocess
import sys
from dataclasses import fields
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WEBSITE = ROOT / "LZY-Website"
OUT = WEBSITE / "src" / "data" / "generated"
SHOWCASE = WEBSITE / "content" / "showcase"
SNIPPETS = WEBSITE / "content" / "snippets"
EXAMPLES = ROOT / "examples"

sys.path.insert(0, str(ROOT))

from lzy import __version__, errors  # noqa: E402  (path set up above)
from lzy import repl as lzy_repl  # noqa: E402
from lzy.api import run_source  # noqa: E402
from lzy.cli import main as cli  # noqa: E402
from lzy.interpreter.builtins import BUILTINS, MAX_RANGE  # noqa: E402
from lzy.lexer.lexer import tokenize  # noqa: E402
from lzy.lexer.tokens import KEYWORDS, RESERVED, TokenType  # noqa: E402
from lzy.runtime.limits import Limits  # noqa: E402

REPOSITORY = "https://github.com/rishav9713/lzy"


class GenerationError(Exception):
    """The repository says something the website must not repeat."""


# ----------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def answers_reader(answers: list[str]):
    replies = iter(answers)

    def read_line(prompt: str) -> str:
        try:
            return next(replies)
        except StopIteration:
            raise EOFError from None

    return read_line


def run_program(source: str, file: str, answers: list[str] | None = None):
    """Run LZY source and return (printed text, rendered error or None)."""
    result = run_source(source, file, read_line=answers_reader(answers or []))
    rendered = result.error.render(source) if result.error else None
    return result.text, rendered


def leading_comment(source: str) -> list[str]:
    """The comment block a program opens with, as paragraphs."""
    paragraphs: list[str] = []
    current: list[str] = []
    for line in source.splitlines():
        stripped = line.strip()
        if not stripped.startswith("#"):
            break
        text = stripped[1:].strip()
        if text:
            current.append(text)
        elif current:
            paragraphs.append(" ".join(current))
            current = []
    if current:
        paragraphs.append(" ".join(current))
    return paragraphs


def concepts(source: str, file: str) -> dict:
    """Which keywords and built-in functions a program really uses.

    This reads the program with LZY's own lexer, so a word inside a string or
    a comment is never mistaken for a use of the feature.
    """
    tokens = tokenize(source, file)
    keyword_types = set(KEYWORDS.values())
    used_keywords: set[str] = set()
    used_builtins: set[str] = set()
    defined: list[str] = []

    for index, token in enumerate(tokens):
        if token.type in keyword_types:
            used_keywords.add(str(token.value or token.text).casefold())
        following = tokens[index + 1] if index + 1 < len(tokens) else None
        if (
            token.type is TokenType.IDENT
            and token.value in BUILTINS
            and following is not None
            and following.type is TokenType.LPAREN
        ):
            used_builtins.add(str(token.value))
        if (
            token.type is TokenType.FUNCTION
            and following is not None
            and following.type is TokenType.IDENT
        ):
            defined.append(following.text)

    return {
        "keywords": sorted(used_keywords),
        "builtins": sorted(used_builtins),
        "functions": defined,
    }


# ----------------------------------------------------------------------
# The language
# ----------------------------------------------------------------------


def builtin_categories() -> dict[str, str]:
    """Map each built-in to the section of builtins.py that defines it."""
    source = read(ROOT / "lzy" / "interpreter" / "builtins.py")
    headers = [
        (match.start(), match.group(1).strip())
        for match in re.finditer(r"^# -{10,}\n# (.+)\n# -{10,}$", source, re.MULTILINE)
    ]
    categories = {}
    for match in re.finditer(r'@builtin\(\s*"(\w+)"', source):
        section = "Other"
        for position, title in headers:
            if position < match.start():
                section = title
        categories[match.group(1)] = section
    return categories


def builtins_data() -> list[dict]:
    categories = builtin_categories()
    found = []
    for name, native in BUILTINS.items():
        if name not in categories:
            raise GenerationError(f"built-in '{name}' is not under a section header")
        found.append(
            {
                "name": name,
                "minArgs": native.min_args,
                "maxArgs": native.max_args,
                "summary": native.summary,
                "category": categories[name],
            }
        )
    return found


def limits_data() -> list[dict]:
    """Every limit, with its default, its --safe value and its own comment."""
    source = read(ROOT / "lzy" / "runtime" / "limits.py")
    defaults = Limits()
    safe = defaults.sandboxed()
    found = []
    for field in fields(Limits):
        # The #: comment lines directly above "name: int = ...".
        pattern = rf"((?:^\s*#:.*\n(?:^\s*#.*\n)*)+)^\s*{field.name}\s*:"
        match = re.search(pattern, source, re.MULTILINE)
        doc = ""
        if match:
            lines = [
                re.sub(r"^\s*#:?\s?", "", line) for line in match.group(1).splitlines()
            ]
            doc = " ".join(line.strip() for line in lines if line.strip())
        found.append(
            {
                "name": field.name,
                "default": getattr(defaults, field.name),
                "safe": getattr(safe, field.name),
                "doc": doc,
            }
        )
    return found


def error_kinds() -> list[dict]:
    found = []
    for value in vars(errors).values():
        if (
            isinstance(value, type)
            and issubclass(value, errors.LzyError)
            and value is not errors.LzyError
        ):
            found.append(
                {
                    "className": value.__name__,
                    "kind": value.kind,
                    "doc": (value.__doc__ or "").strip(),
                }
            )
    return found


# ----------------------------------------------------------------------
# The command line
# ----------------------------------------------------------------------


def capture_cli(args: list[str]) -> dict:
    """Run the real ``lzy`` entry point and record what it did.

    It runs from the repository root, as a reader following the documentation
    would, so relative paths such as ``examples/...`` resolve.
    """
    out, err = io.StringIO(), io.StringIO()
    previous = Path.cwd()
    try:
        os.chdir(ROOT)
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            code = cli.main(args)
    except SystemExit as exit_:
        code = exit_.code if isinstance(exit_.code, int) else 1
    finally:
        os.chdir(previous)
    return {
        "args": args,
        "exitCode": code,
        "stdout": out.getvalue().replace("\\", "/"),
        "stderr": err.getvalue().replace("\\", "/"),
    }


def cli_data() -> dict:
    parser = cli.build_parser()
    options = []
    commands = []
    for action in parser._actions:
        if isinstance(action, argparse._SubParsersAction):
            helps = {choice.dest: choice.help for choice in action._choices_actions}
            for name, sub in action.choices.items():
                arguments = [
                    {"name": sub_action.dest, "help": sub_action.help}
                    for sub_action in sub._actions
                    if not sub_action.option_strings
                ]
                commands.append(
                    {"name": name, "help": helps.get(name, ""), "arguments": arguments}
                )
        elif action.option_strings:
            options.append({"flags": action.option_strings, "help": action.help})

    hello = "examples/01-beginner/hello.lzy"
    return {
        "prog": parser.prog,
        "description": cli.DESCRIPTION,
        "epilog": cli.EPILOG.strip(),
        "usage": parser.format_usage().strip(),
        "help": parser.format_help().strip(),
        "options": options,
        "commands": commands,
        "globalFlags": sorted(cli.GLOBAL_FLAGS),
        "extension": cli.EXTENSION,
        "exitCodes": {"ok": cli.EXIT_OK, "error": cli.EXIT_ERROR},
        "runs": {
            "version": capture_cli(["--version"]),
            "check": capture_cli(["check", hello]),
            "missingFile": capture_cli(["no-such-program.lzy"]),
            "badFlag": capture_cli(["--no-such-flag"]),
        },
    }


#: What a reader types in the REPL transcript on the website. Each line is fed
#: to the real REPL, and what it prints after each line is recorded.
REPL_SESSION = [
    'name = "Ada"',
    'say "Hello " + name',
    "6 * 7",
    "numbers = [3, 1, 2]",
    "sort(numbers)",
    "if length(name) > 2",
    '    say "A name longer than two letters"',
    "",
    "say nme",
    "exit",
]


def repl_transcript(lines: list[str]) -> list[dict]:
    """Drive the real REPL and record each prompt, what was typed, and the reply."""
    captured = io.StringIO()
    steps: list[dict] = []
    in_block = False

    class Feed:
        def __init__(self) -> None:
            self.index = 0
            self.mark = 0

        def __iter__(self):
            return self

        def __next__(self) -> str:
            self.flush()
            if self.index >= len(lines):
                raise StopIteration
            line = lines[self.index]
            self.index += 1
            nonlocal in_block
            prompt = lzy_repl.CONTINUATION if in_block else lzy_repl.PROMPT
            if not in_block and lzy_repl._opens_block(line):
                in_block = True
            elif in_block and line.strip() == "":
                in_block = False
            steps.append({"prompt": prompt, "input": line, "output": ""})
            return line

        def flush(self) -> None:
            text = captured.getvalue()[self.mark :]
            self.mark = len(captured.getvalue())
            if text and steps:
                steps[-1]["output"] += text

    feed = Feed()
    with contextlib.redirect_stdout(captured), contextlib.redirect_stderr(captured):
        lzy_repl.run_repl(input_lines=feed)
    feed.flush()
    return steps


def repl_data() -> dict:
    return {
        "banner": lzy_repl.BANNER.strip(),
        "help": lzy_repl.HELP.strip(),
        "prompt": lzy_repl.PROMPT,
        "continuation": lzy_repl.CONTINUATION,
        "quitWords": sorted(lzy_repl._QUIT),
        "transcript": repl_transcript(REPL_SESSION),
    }


def modules_data() -> list[dict]:
    """Every file of the interpreter, its size, and the first line of its docstring."""
    found = []
    for path in sorted((ROOT / "lzy").rglob("*.py")):
        source = read(path)
        lines = len(source.splitlines())
        if lines == 0:
            continue
        docstring = re.match(r'\s*(?:"""|\'\'\')(.*?)(?:"""|\'\'\'|\n\n)', source, re.S)
        summary = docstring.group(1).strip().split("\n")[0] if docstring else ""
        found.append({"path": relative(path), "lines": lines, "summary": summary})
    return found


# ----------------------------------------------------------------------
# Programs
# ----------------------------------------------------------------------


def examples_data() -> list[dict]:
    found = []
    for path in sorted(EXAMPLES.rglob("*.lzy")):
        source = read(path)
        answers_path = path.with_suffix(".input")
        answers = read(answers_path).splitlines() if answers_path.exists() else []
        expected_path = path.with_suffix(".out")
        if not expected_path.exists():
            raise GenerationError(f"{relative(path)} has no recorded .out file")
        expected = read(expected_path)

        printed, error = run_program(source, relative(path), answers)
        if error:
            raise GenerationError(f"{relative(path)} failed:\n{error}")
        if printed != expected:
            raise GenerationError(
                f"{relative(path)} no longer prints what its .out file says. "
                "Run tools/record_examples.py."
            )

        folder = path.parent.name
        found.append(
            {
                "slug": path.stem,
                "category": re.sub(r"^\d+-", "", folder),
                "categoryOrder": int(folder.split("-")[0]) if folder[0].isdigit() else 99,
                "path": relative(path),
                "description": leading_comment(source),
                "source": source,
                "output": expected,
                "input": answers,
                "lines": len(source.splitlines()),
                "concepts": concepts(source, relative(path)),
            }
        )

    slugs = [example["slug"] for example in found]
    if len(slugs) != len(set(slugs)):
        raise GenerationError(
            "two examples share a file name; the website needs them to be unique"
        )
    return found


def programs_in(folder: Path) -> list[dict]:
    """Short programs the website shows, each run for real.

    A file ending in ``-error.lzy`` is expected to fail, because the website
    shows what LZY's errors look like. Every other file must succeed. A
    leading ``01-`` only sets the order and is dropped from the name.
    """
    found = []
    for path in sorted(folder.glob("*.lzy")):
        source = read(path)
        stem = re.sub(r"^\d+-", "", path.stem)
        expects_error = stem.endswith("-error")
        name = stem.removesuffix("-error") + ".lzy"
        printed, error = run_program(source, name)
        if expects_error and not error:
            raise GenerationError(f"{relative(path)} was meant to fail, but it ran")
        if not expects_error and error:
            raise GenerationError(f"{relative(path)} failed:\n{error}")
        found.append(
            {
                "id": stem.removesuffix("-error"),
                "file": name,
                "source": source,
                "output": printed,
                "error": error,
            }
        )
    ids = [program["id"] for program in found]
    if len(ids) != len(set(ids)):
        raise GenerationError(f"two programs in {relative(folder)} have the same name")
    return found


# ----------------------------------------------------------------------
# The project
# ----------------------------------------------------------------------


def test_count() -> int | None:
    """How many tests the suite collects, or None if pytest is not installed."""
    try:
        completed = subprocess.run(
            [sys.executable, "-m", "pytest", "--collect-only", "-q", "-o", "addopts="],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=300,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    match = re.search(r"(\d+) tests? collected", completed.stdout)
    return int(match.group(1)) if match else None


def project_data() -> dict:
    pyproject = read(ROOT / "pyproject.toml")
    requires = re.search(r'^requires-python\s*=\s*"([^"]+)"', pyproject, re.MULTILINE)
    license_ = re.search(r'^license\s*=\s*"([^"]+)"', pyproject, re.MULTILINE)
    status = re.search(r'"Development Status :: \d+ - ([^"]+)"', pyproject)
    dependencies = re.search(r"^dependencies\s*=\s*\[(.*?)\]", pyproject, re.M | re.S)
    runtime_dependencies = [
        item.strip().strip("\"'")
        for item in (dependencies.group(1) if dependencies else "").split(",")
        if item.strip() and not item.strip().startswith("#")
    ]
    pythons = re.findall(r'"Programming Language :: Python :: (3\.\d+)"', pyproject)

    workflow = read(ROOT / ".github" / "workflows" / "ci.yml")
    systems = re.search(r"^\s*os:\s*\[(.*?)\]", workflow, re.MULTILINE)
    ci_pythons = re.search(r"^\s*python:\s*\[(.*?)\]", workflow, re.MULTILINE)

    def listed(match) -> list[str]:
        if not match:
            return []
        return [item.strip().strip("\"'") for item in match.group(1).split(",")]

    notice = read(ROOT / "NOTICE")
    copyright_ = re.search(r"^Copyright .+$", notice, re.MULTILINE)

    source_lines = sum(
        len(read(path).splitlines()) for path in (ROOT / "lzy").rglob("*.py")
    )

    return {
        "version": __version__,
        "repository": REPOSITORY,
        "requiresPython": requires.group(1) if requires else None,
        "license": license_.group(1) if license_ else None,
        "developmentStatus": status.group(1) if status else None,
        "runtimeDependencies": runtime_dependencies,
        "pythonVersions": pythons,
        "ci": {"systems": listed(systems), "pythons": listed(ci_pythons)},
        "copyright": copyright_.group(0) if copyright_ else None,
        "tests": test_count(),
        "interpreterLines": source_lines,
    }


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)

    try:
        language = {
            "project": project_data(),
            "keywords": sorted(KEYWORDS),
            "reserved": sorted(RESERVED),
            "builtins": builtins_data(),
            "rangeLimit": MAX_RANGE,
            "limits": limits_data(),
            "errorKinds": error_kinds(),
            "cli": cli_data(),
            "repl": repl_data(),
            "modules": modules_data(),
        }
        examples = examples_data()
        showcase = programs_in(SHOWCASE)
        snippets = {program["id"]: program for program in programs_in(SNIPPETS)}
    except GenerationError as problem:
        print(f"generate_data: {problem}", file=sys.stderr)
        return 1

    language["project"]["examples"] = len(examples)
    language["project"]["builtins"] = len(language["builtins"])

    outputs = {
        "lzy.json": language,
        "examples.json": examples,
        "showcase.json": showcase,
        "snippets.json": snippets,
    }
    for name, data in outputs.items():
        target = OUT / name
        target.write_text(
            json.dumps(data, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
            newline="\n",
        )

    tests = language["project"]["tests"]
    print(
        f"generate_data: LZY {__version__}, {len(language['builtins'])} built-ins, "
        f"{len(examples)} examples, {len(showcase) + len(snippets)} website programs, "
        f"{tests if tests is not None else 'unknown'} tests"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
