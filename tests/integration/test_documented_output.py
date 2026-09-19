"""Output shown in the documentation has to be what LZY really prints.

A ``lzy`` or ``lzy-broken`` fence followed directly by an ``output`` fence is
a promise: this is what you will see. For ``lzy`` that is the printed output;
for ``lzy-broken`` it is the whole error message.

The only thing ignored is the file name in an error's first line, so a page
can say "Type error in totals.lzy" when its prose talks about totals.lzy.

To record new output after reading it, run ``tools/record_doc_outputs.py
--write``.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

from lzy.api import run_source
from tests.conftest import PROJECT_ROOT

#: The snippet may not contain a fence line, so a snippet with no output of
#: its own can never be paired with the next snippet's output.
PAIR = re.compile(
    r"^```(?P<tag>lzy|lzy-broken)[ \t]*\n(?P<code>(?:(?!^```).)*?)^```[ \t]*\n"
    r"(?:[ \t]*\n)*"
    r"^```output[ \t]*\n(?P<output>.*?)^```",
    re.MULTILINE | re.DOTALL,
)

SKIP_DIRECTORIES = {
    ".git",
    "__pycache__",
    ".pytest_cache",
    "node_modules",
    "build",
    "dist",
}


def documentation_files() -> list[Path]:
    return sorted(
        path
        for path in PROJECT_ROOT.rglob("*.md")
        if not any(part in SKIP_DIRECTORIES for part in path.parts)
    )


def documented_pairs() -> list[tuple[str, int, str, str, str]]:
    found = []
    for path in documentation_files():
        text = path.read_text(encoding="utf-8")
        for match in PAIR.finditer(text):
            line = text.count("\n", 0, match.start()) + 1
            name = path.relative_to(PROJECT_ROOT).as_posix()
            found.append(
                (
                    name,
                    line,
                    match.group("tag"),
                    match.group("code"),
                    match.group("output"),
                )
            )
    return found


def normalise(text: str) -> str:
    text = re.sub(r"^(.+?) in .+?, (on line \d+\.)", r"\1 \2", text, count=1)
    return "\n".join(line.rstrip() for line in text.strip("\n").splitlines())


def no_input(prompt: str) -> str:
    raise EOFError


PAIRS = documented_pairs()


def test_the_documentation_shows_output_somewhere():
    assert PAIRS, "expected at least one snippet with its output shown"


@pytest.mark.parametrize(
    "name,line,tag,code,expected",
    PAIRS,
    ids=[f"{name}:{line}" for name, line, *_rest in PAIRS],
)
def test_documented_output_is_what_lzy_prints(name, line, tag, code, expected):
    result = run_source(code, "program.lzy", read_line=no_input)

    if tag == "lzy-broken":
        assert result.error is not None, (
            f"{name} line {line} is shown as a mistake, but LZY ran it."
        )
        actual = result.error.render(code)
    else:
        assert result.error is None, (
            f"{name} line {line} failed:\n{result.error.render(code)}"
        )
        actual = result.text

    assert normalise(actual) == normalise(expected), (
        f"{name} line {line} shows output LZY does not print.\n"
        f"Run: python tools/record_doc_outputs.py --write"
    )
