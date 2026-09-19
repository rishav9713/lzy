"""Shared helpers for the LZY test suite."""

from __future__ import annotations

from pathlib import Path
from typing import List, Optional

import pytest

from lzy.api import Result, run_source
from lzy.runtime.limits import Limits

PROJECT_ROOT = Path(__file__).resolve().parent.parent
EXAMPLES = PROJECT_ROOT / "examples"


def run(source: str, *, answers: Optional[List[str]] = None, limits=None) -> Result:
    """Run LZY source with no real input or output. Errors land on the Result."""
    replies = iter(answers or [])

    def read_line(prompt: str) -> str:
        try:
            return next(replies)
        except StopIteration:
            raise EOFError from None

    return run_source(source, "<test>", limits=limits, read_line=read_line)


def output(source: str, **kwargs) -> List[str]:
    """Run source that is expected to succeed, and return its printed lines."""
    result = run(source, **kwargs)
    assert result.ok, f"expected success, got:\n{result.error.render(source)}"
    return result.output


def error(source: str, **kwargs):
    """Run source that is expected to fail, and return the error."""
    result = run(source, **kwargs)
    assert result.error is not None, f"expected an error, got output {result.output!r}"
    return result.error


@pytest.fixture
def limits() -> Limits:
    return Limits()


@pytest.fixture
def tiny_limits() -> Limits:
    return Limits().sandboxed()
