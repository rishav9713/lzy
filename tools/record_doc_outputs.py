"""Record what documented LZY snippets really print.

Documentation may show the output of a snippet by putting an ``output`` fence
directly after it::

    ```lzy
    say 6 / 2
    ```

    ```output
    3
    ```

For a ``lzy`` snippet the output is what it prints. For a ``lzy-broken``
snippet it is the error message LZY gives. Either way it is LZY's word, not
the author's: ``tests/integration/test_documented_output.py`` fails if they
disagree.

Run this only after reading the output and agreeing it is correct::

    python tools/record_doc_outputs.py            # show what would change
    python tools/record_doc_outputs.py --write    # rewrite the output fences
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from lzy.api import run_source  # noqa: E402  (path set up above)

#: A snippet, any blank lines, then the output fence that belongs to it. The
#: snippet may not contain a fence line, so a snippet with no output of its
#: own can never be paired with the next snippet's output.
PAIR = re.compile(
    r"^```(?P<tag>lzy|lzy-broken)[ \t]*\n(?P<code>(?:(?!^```).)*?)^```[ \t]*\n"
    r"(?:[ \t]*\n)*"
    r"^```output[ \t]*\n(?P<output>.*?)^```",
    re.MULTILINE | re.DOTALL,
)

#: The file name errors are rendered with. The comparison ignores it, so a
#: page may show whatever name its prose uses.
FILE_NAME = "program.lzy"

SKIP_DIRECTORIES = {
    ".git",
    "__pycache__",
    ".pytest_cache",
    "node_modules",
    "dist",
    "build",
}


def markdown_files() -> list[Path]:
    return sorted(
        path
        for path in ROOT.rglob("*.md")
        if not any(part in SKIP_DIRECTORIES for part in path.parts)
    )


def actual_output(tag: str, code: str) -> str:
    """What LZY prints for this snippet, or the error it reports."""

    def no_input(prompt: str) -> str:
        raise EOFError

    result = run_source(code, FILE_NAME, read_line=no_input)
    if tag == "lzy-broken":
        if result.error is None:
            return "(no error - LZY ran this snippet)\n"
        return result.error.render(code) + "\n"
    if result.error is not None:
        return "(error)\n" + result.error.render(code) + "\n"
    return result.text


def normalise(text: str) -> str:
    """Ignore the file name in an error's first line, and trailing space."""
    text = re.sub(r"^(.+?) in .+?, (on line \d+\.)", r"\1 \2", text, count=1)
    return "\n".join(line.rstrip() for line in text.strip("\n").splitlines())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="rewrite output fences")
    args = parser.parse_args()

    checked = 0
    changed = 0
    for path in markdown_files():
        text = path.read_text(encoding="utf-8")
        pieces: list[str] = []
        position = 0
        file_changed = False

        for match in PAIR.finditer(text):
            checked += 1
            actual = actual_output(match.group("tag"), match.group("code"))
            if normalise(actual) == normalise(match.group("output")):
                continue
            changed += 1
            file_changed = True
            line = text.count("\n", 0, match.start()) + 1
            print(f"CHANGED {path.relative_to(ROOT).as_posix()}:{line}")
            pieces.append(text[position : match.start("output")])
            pieces.append(actual)
            position = match.end("output")

        if file_changed and args.write:
            pieces.append(text[position:])
            path.write_text("".join(pieces), encoding="utf-8", newline="\n")

    print()
    print(f"{changed} of {checked} documented outputs changed")
    if changed and not args.write:
        print("Re-run with --write to record them, after reading them.")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
