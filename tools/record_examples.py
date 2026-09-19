"""Record the expected output of every example into a .out file.

Run this only after reading the output and agreeing it is correct::

    python tools/record_examples.py            # show what would change
    python tools/record_examples.py --write    # write the .out files

The recorded files are what tests/integration/test_examples.py compares
against, so they are a promise about what LZY prints, not a convenience.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from lzy.api import run_source  # noqa: E402  (path set up above)

EXAMPLES = ROOT / "examples"


def answers_for(path: Path):
    companion = path.with_suffix(".input")
    if not companion.exists():
        return []
    return companion.read_text(encoding="utf-8").splitlines()


def run_example(path: Path):
    source = path.read_text(encoding="utf-8")
    replies = iter(answers_for(path))

    def read_line(prompt: str) -> str:
        try:
            return next(replies)
        except StopIteration:
            raise EOFError from None

    return source, run_source(source, str(path), read_line=read_line)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="write the .out files")
    args = parser.parse_args()

    failures = 0
    changed = 0

    for path in sorted(EXAMPLES.rglob("*.lzy")):
        source, result = run_example(path)
        relative = path.relative_to(ROOT)

        if not result.ok:
            failures += 1
            print(f"FAILED  {relative}")
            print(result.error.render(source))
            continue

        target = path.with_suffix(".out")
        recorded = result.text
        existing = target.read_text(encoding="utf-8") if target.exists() else None

        if existing == recorded:
            print(f"same    {relative}")
            continue

        changed += 1
        print(f"CHANGED {relative}")
        if args.write:
            target.write_text(recorded, encoding="utf-8", newline="\n")

    print()
    print(f"{changed} changed, {failures} failed")
    if failures:
        return 1
    if changed and not args.write:
        print("Re-run with --write to record these.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
