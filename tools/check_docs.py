"""Check that the documentation points at things that exist.

Broken links are the fastest way for documentation to lose a reader's trust,
and they are easy to introduce by renaming a file. This runs in CI.

What it checks:

* every relative Markdown link resolves to a real file or folder
* every in-page anchor (``#section``) matches a heading in that file
* every ``.lzy`` file referenced from the documentation exists

External links (``http://``, ``https://``, ``mailto:``) are not fetched: CI
should not fail because somebody else's site is down.

Inside ``LZY-Website/``, a link that starts with ``/`` is a page on the
website, such as ``/install/``, not a file in the repository. Those are
checked by the website build instead, against the pages it actually produced
(``LZY-Website/scripts/check-links.mjs``).
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WEBSITE = ROOT / "LZY-Website"

#: [text](target) - the target stops at a space (which would start a title).
LINK = re.compile(r"\[(?P<text>[^\]]*)\]\((?P<target>[^)\s]+)\)")

#: A Markdown ATX heading.
HEADING = re.compile(r"^(?P<hashes>#{1,6})\s+(?P<title>.+?)\s*$", re.MULTILINE)

SKIP_DIRECTORIES = {
    ".git", "__pycache__", ".pytest_cache", "node_modules", "dist", "build",
}


def markdown_files() -> list[Path]:
    found = []
    for path in ROOT.rglob("*.md"):
        if any(part in SKIP_DIRECTORIES for part in path.parts):
            continue
        found.append(path)
    return sorted(found)


def slug(title: str) -> str:
    """Turn a heading into the anchor GitHub generates for it."""
    text = title.strip().lower()
    # Drop inline formatting characters GitHub ignores when building anchors.
    text = re.sub(r"[`*_~]", "", text)
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"\s+", "-", text).strip("-")


def anchors_in(path: Path) -> set:
    if not path.exists() or path.suffix != ".md":
        return set()
    text = path.read_text(encoding="utf-8")
    return {slug(match.group("title")) for match in HEADING.finditer(text)}


def check_file(path: Path) -> list[tuple[int, str]]:
    problems: list[tuple[int, str]] = []
    text = path.read_text(encoding="utf-8")

    for match in LINK.finditer(text):
        target = match.group("target")
        line = text.count("\n", 0, match.start()) + 1

        if target.startswith(("http://", "https://", "mailto:", "tel:")):
            continue

        if target.startswith("/") and WEBSITE in path.parents:
            continue

        file_part, _, anchor = target.partition("#")

        if not file_part:
            # A link within the same page.
            if anchor and anchor not in anchors_in(path):
                problems.append((line, f"no heading matches #{anchor}"))
            continue

        resolved = (path.parent / file_part).resolve()
        if not resolved.exists():
            problems.append((line, f"{file_part} does not exist"))
            continue

        if anchor and resolved.suffix == ".md" and anchor not in anchors_in(resolved):
            problems.append((line, f"{file_part} has no heading #{anchor}"))

    return problems


def main() -> int:
    total = 0
    for path in markdown_files():
        problems = check_file(path)
        if not problems:
            continue
        total += len(problems)
        relative = path.relative_to(ROOT)
        for line, message in problems:
            print(f"{relative}:{line}: {message}")

    checked = len(markdown_files())
    if total:
        print()
        print(f"{total} broken link(s) across {checked} documentation files.")
        return 1

    print(f"All links resolve, across {checked} documentation files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
