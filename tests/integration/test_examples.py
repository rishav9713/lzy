"""Every example in examples/ must run, and must keep producing what it says.

Each ``name.lzy`` may have two companions:

* ``name.input`` - lines fed to ``ask``, one answer per line.
* ``name.out``   - the exact output the example is expected to print.

The golden files mean a change in language behaviour cannot quietly rewrite
what the documentation shows a beginner.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from tests.conftest import EXAMPLES, run

EXAMPLE_FILES = sorted(EXAMPLES.rglob("*.lzy"))


def answers_for(path: Path):
    companion = path.with_suffix(".input")
    if not companion.exists():
        return []
    return companion.read_text(encoding="utf-8").splitlines()


def golden_for(path: Path):
    companion = path.with_suffix(".out")
    if not companion.exists():
        return None
    return companion.read_text(encoding="utf-8").splitlines()


def ids(paths):
    return [str(path.relative_to(EXAMPLES)).replace("\\", "/") for path in paths]


def test_there_are_examples_to_run():
    assert EXAMPLE_FILES, "no examples found - the examples/ folder should not be empty"


@pytest.mark.parametrize("path", EXAMPLE_FILES, ids=ids(EXAMPLE_FILES))
def test_example_runs(path: Path):
    source = path.read_text(encoding="utf-8")
    result = run(source, answers=answers_for(path))
    assert result.ok, (
        f"{path.name} failed to run:\n{result.error.render(source)}"
    )


@pytest.mark.parametrize("path", EXAMPLE_FILES, ids=ids(EXAMPLE_FILES))
def test_example_matches_its_recorded_output(path: Path):
    expected = golden_for(path)
    if expected is None:
        pytest.skip(f"{path.name} has no recorded output")
    source = path.read_text(encoding="utf-8")
    result = run(source, answers=answers_for(path))
    assert result.ok, result.error.render(source) if result.error else ""
    assert result.output == expected


@pytest.mark.parametrize("path", EXAMPLE_FILES, ids=ids(EXAMPLE_FILES))
def test_every_example_has_recorded_output(path: Path):
    assert path.with_suffix(".out").exists(), (
        f"{path.name} has no .out file. Record one so the example cannot drift."
    )


@pytest.mark.parametrize("path", EXAMPLE_FILES, ids=ids(EXAMPLE_FILES))
def test_every_example_explains_itself(path: Path):
    """An example a beginner reads should say what it is for."""
    first = path.read_text(encoding="utf-8").lstrip().splitlines()[0]
    assert first.startswith("#"), f"{path.name} should open with a comment"


class TestDocumentedCounts:
    """Numbers quoted in the README must stay true as the language grows."""

    def test_the_readme_builtin_count_is_right(self):
        from lzy.interpreter.builtins import BUILTINS

        readme = (EXAMPLES.parent / "README.md").read_text(encoding="utf-8")
        assert f"{len(BUILTINS)} built-in" in readme

    def test_the_readme_example_count_is_right(self):
        readme = (EXAMPLES.parent / "README.md").read_text(encoding="utf-8")
        assert f"{len(EXAMPLE_FILES)} runnable programs" in readme
