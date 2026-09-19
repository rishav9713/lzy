"""The LZY in the documentation has to be real LZY.

Two fences are checked:

* ```lzy         - must parse. Many are fragments that would not run on their
                   own, so running them is not required; parsing is.
* ```lzy-broken  - must fail, because the surrounding prose says it is wrong.
                   This keeps "break it on purpose" sections honest: if LZY
                   ever starts accepting one of these, the test fails.

A snippet that is deliberately wrong and not marked will fail the first
check, which is the point.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import List, Tuple

import pytest

from lzy.api import compile_source, run_source
from lzy.errors import LzyError
from tests.conftest import PROJECT_ROOT

FENCE = re.compile(
    r"^```(?P<tag>lzy|lzy-broken)[ \t]*\n(?P<code>.*?)^```",
    re.MULTILINE | re.DOTALL,
)

SKIP_DIRECTORIES = {".git", "__pycache__", ".pytest_cache", "node_modules", "build", "dist"}


def documentation_files() -> List[Path]:
    found = [
        path
        for path in PROJECT_ROOT.rglob("*.md")
        if not any(part in SKIP_DIRECTORIES for part in path.parts)
    ]
    return sorted(found)


def snippets(tag: str) -> List[Tuple[str, int, str]]:
    """Every fenced block with this tag, as (file, line, code)."""
    found = []
    for path in documentation_files():
        text = path.read_text(encoding="utf-8")
        for match in FENCE.finditer(text):
            if match.group("tag") != tag:
                continue
            line = text.count("\n", 0, match.start()) + 1
            name = str(path.relative_to(PROJECT_ROOT)).replace("\\", "/")
            found.append((name, line, match.group("code")))
    return found


GOOD = snippets("lzy")
BROKEN = snippets("lzy-broken")


def ids(items):
    return [f"{name}:{line}" for name, line, _code in items]


def test_the_documentation_contains_lzy_snippets():
    assert len(GOOD) > 20, "expected the documentation to show plenty of LZY"


@pytest.mark.parametrize("name,line,code", GOOD, ids=ids(GOOD))
def test_documented_lzy_parses(name, line, code):
    try:
        compile_source(code, name)
    except LzyError as error:
        pytest.fail(f"{name} line {line} does not parse:\n{error.render(code)}")


def test_there_are_deliberately_broken_snippets():
    assert BROKEN, "the teaching material should show what mistakes look like"


@pytest.mark.parametrize("name,line,code", BROKEN, ids=ids(BROKEN))
def test_deliberately_broken_lzy_really_is_broken(name, line, code):
    """A snippet shown as a mistake must still be one."""
    result = run_source(code, name, read_line=lambda prompt: "")
    assert result.error is not None, (
        f"{name} line {line} is shown as a mistake, but LZY accepted it.\n"
        f"Either the snippet or the prose around it is now wrong.\n{code}"
    )


@pytest.mark.parametrize("name,line,code", BROKEN, ids=ids(BROKEN))
def test_broken_snippets_fail_helpfully(name, line, code):
    """Even the mistakes in the documentation get a usable error."""
    result = run_source(code, name, read_line=lambda prompt: "")
    error = result.error
    assert isinstance(error, LzyError)
    assert error.hint or error.suggestion, (
        f"{name} line {line}: this mistake is used to teach, so its error "
        f"should offer help.\n{error.render(code)}"
    )
