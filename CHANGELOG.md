# Changelog

Every notable change to LZY is recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and LZY uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
While the version starts with `0.`, the language may change in ways that
break existing programs; every such change is listed under **Changed** with
the reason.

## [Unreleased]

### Added

- **The LZY website**, in `LZY-Website/`, published to GitHub Pages by a new
  `Website` workflow on every merge to `main`. Its facts about LZY — built-in
  functions, keywords, the command line, limits, examples, versions and the
  test count — are generated from the interpreter, and many of its pages are
  the repository's own documents, so the site cannot describe a different LZY.
- `tools/record_doc_outputs.py` and `tests/integration/test_documented_output.py`:
  an `output` fence after an `lzy` or `lzy-broken` snippet in any Markdown
  file must be exactly what LZY prints, and is recorded from the interpreter
  rather than typed.

### Changed

- `tools/check_docs.py` treats a link starting with `/` inside `LZY-Website/`
  as a page on the website, which the website build checks instead.

## [0.0.2] - 2026-09-19

A correctness release. 0.0.1 could crash the interpreter process on Windows,
and the first CI run found it within minutes of publishing. **Anyone on
Windows with Python 3.9 or 3.10 should upgrade.**

### Fixed

- **A deep expression killed the interpreter process on Windows with CPython
  3.9 and 3.10.** `say 1 + 1 + 1 + ...` with a couple of thousand terms
  produced a fatal stack overflow rather than an LZY error.

  Two mistakes compounded. A long operator chain is *parsed* by a loop but
  *evaluated* by recursion, so `max_parse_depth` never fired on that shape.
  And `python_recursion_limit` had been raised to 20,000, which does not
  create stack — it only removes CPython's guard, so on the 1 MB stack
  Windows gives the main thread it turned a catchable error into a crash.
  CPython 3.11 stopped consuming C stack for Python-to-Python calls, which is
  why 3.11 and later were unaffected.

- **`max_call_depth` was not actually reachable on Windows with Python 3.9 or
  3.10.** 400 LZY calls is several thousand Python frames, which did not fit
  in 1 MB. A documented, advertised limit did not work on one platform.

- All 150 `ruff` findings, which had the CI lint job failing.

### Added

- `max_ast_depth` (5,000; 1,000 under `--safe`) bounds the syntax tree the
  parser returns, measured by an iterative walk after parsing. Because it is
  a parse-time check, `lzy check` reports it too.
- `max_evaluation_depth` (5,000; 1,000 under `--safe`) bounds total live
  nesting while a program runs, catching shapes the other limits miss.
- `thread_stack_bytes` (64 MB). Programs now run on a thread whose stack size
  LZY sets, so the documented limits mean the same thing on every platform
  instead of depending on what the operating system happened to provide.
- `children()` and `deepest_node()` in `lzy.ast.nodes`, derived from the
  dataclass fields so a new node type is walked correctly the day it is added.

### Changed

- The version is declared once, in `lzy/__init__.py`. `pyproject.toml` reads
  it, so the package and its metadata cannot disagree.
- `ruff` is pinned to `>=0.16,<0.17`, so a new linter release cannot turn CI
  red on a branch that changed nothing.
- `_scan_operator` in the lexer drives `=`, `<` and `>` from one table
  instead of three near-identical branches.

### Security

- SECURITY.md claimed LZY "never crashes the process". **That was false on
  Windows.** The hardening table now lists the three new mitigations and names
  the crash that prompted them.

## [0.0.1] - 2026-09-19

The first working version of LZY. The core language runs, is specified and is
tested. It has no modules, no error handling and no access to files or the
network; see [PROJECT_STATUS.md](PROJECT_STATUS.md) for the honest list.

### Added

**The language**

- Case-insensitive names. Folding is Unicode NFKC followed by full case
  folding, and the spelling you wrote is kept for diagnostics.
- Indentation-based blocks. Spaces only; a tab in indentation is an error
  with an explanation.
- Seven types: `number`, `text`, `truth`, `nothing`, `list`, `map`,
  `function`.
- A single numeric type, so `6 / 2` is `3` and `4.0 == 4` is `true`.
- Arithmetic `+ - * / %`, comparison `== != < <= > >=`, and `and` / `or` /
  `not` with short-circuiting.
- `if` / `else if` / `else`, `while`, `for ... in`, `break`, `continue`.
- Functions, with recursion, mutual recursion, closures and first-class use.
- Lists and maps, including nesting, `map.name` access, reference sharing
  and `copy()` to opt out of it.
- `say`, which prints several values separated by a space.
- `ask`, which reads a line of input. What it reads is always data.
- Comments with `#`; text in `"` or `'` quotes with `\u{...}` escapes;
  numbers with `_` separators and exponents.

**Built-in functions** (33)

- Values and types: `type`, `length`, `text`, `number`, `show`
- Numbers: `abs`, `round`, `floor`, `ceiling`, `sqrt`, `min`, `max`, `sum`,
  `random_number`
- Text: `upper`, `lower`, `trim`, `split`, `join`, `replace`, `starts_with`,
  `ends_with`
- Lists and maps: `range`, `append`, `remove_at`, `sort`, `reverse`, `copy`,
  `contains`, `find`, `keys`, `values`, `remove_key`

**Tools**

- The `lzy` command: `run`, `check`, `repl`, `--safe`, `--debug`,
  `--version`, `--help`, and running a program piped in on standard input.
- An interactive REPL that keeps names between lines and collects indented
  blocks until a blank line.

**Documentation**

- `SPEC.md`, the language specification, matching the implementation.
- `docs/spec/grammar.ebnf`, the formal grammar.
- `README.md`, `ROADMAP.md`, `PROJECT_STATUS.md`, `CONTRIBUTING.md`,
  `SECURITY.md`, `CODE_OF_CONDUCT.md`, `docs/OWNER_DECISIONS.md`.
- The LEP process in `docs/leps/`.
- 22 runnable examples across beginner, algorithm, application and
  defensive-security folders, each with recorded output under test.

**Quality**

- 1156 tests: unit, integration, negative, regression, security and 420
  fuzz cases.
- Golden-output tests, so an example cannot quietly stop matching what the
  documentation shows.
- CI on Ubuntu, macOS and Windows against Python 3.9 to 3.13.

### Changed

- The project is licensed under **Apache License 2.0**, not MIT. Apache-2.0
  was chosen for its explicit patent grant, which matters more for a
  programming language than MIT's brevity does. A `NOTICE` file carries the
  copyright attribution that Apache-2.0 section 4(d) requires downstream
  users to reproduce. Decided before the first outside contribution, which
  was the last point the change could be made without every contributor's
  consent. See `docs/OWNER_DECISIONS.md`, D-001.
- The copyright holder is **Rishav Kumar**. See D-002.

### Security

- No file, network, process or environment access exists in the language, so
  a program has no route to the host.
- Limits on source size, indentation depth, bracket depth, parser nesting,
  recursion depth and output size, all in `lzy/runtime/limits.py`, with a
  tighter `--safe` profile.
- `random_number` uses the operating system's cryptographically secure
  generator; there is no seeded generator to reach for by mistake.
- Anything `ask` reads is data and is never executed. LZY has no `eval`.
- Zero runtime dependencies, so there is no third-party supply chain.
- Malformed and hostile input produces an LZY error rather than a crash,
  enforced by the fuzz suite.

### Fixed

Six bugs were found and fixed while building 0.0.1. Each has a regression
test in `tests/regression/test_regressions.py`.

- `lzy file.lzy` crashed with a Python `TypeError`, because a hidden
  positional argument competed with the subparsers.
- Comparing a list that contained itself overflowed the C stack and killed
  the process; `equal()` now has a depth limit and an identity
  short-circuit.
- A type error could echo a 5000-character literal back at the user;
  suggestions now cap each quoted part.
- A file path containing spaces was wrapped across two lines and could not
  be copied; paths now print whole on their own line.
- `--debug` printed the error twice and swallowed the traceback it was meant
  to show.
- Python's recursion limit stayed raised after a program finished.

[Unreleased]: https://github.com/rishav9713/lzy/compare/v0.0.2...HEAD
[0.0.2]: https://github.com/rishav9713/lzy/releases/tag/v0.0.2
[0.0.1]: https://github.com/rishav9713/lzy/releases/tag/v0.0.1
