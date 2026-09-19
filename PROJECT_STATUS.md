# LZY Project Status

**Last updated:** 2026-09-19
**Version:** 0.0.1
**Phase:** Phase 7 complete — *LZY 0.0.1, Language Foundation*
**Next milestone:** 0.1.0 — Core Language Stable

This file is the honest picture of where LZY actually is. It is written for
whoever picks the project up next, including a future session that has no
memory of this one. The repository, not this file, is the final authority; if
they disagree, the repository is right and this file is stale.

---

## At a glance

| Area | Status | Notes |
|---|---|---|
| Lexer | **READY** | Tokens, layout, Unicode folding, all error paths |
| Parser | **READY** | Full 0.0.1 grammar, targeted diagnostics |
| AST | **READY** | Dataclass nodes, every node carries a span |
| Interpreter | **READY** | Tree-walking, correct on everything specified |
| Error messages | **READY** | 4-part contract, tested as a feature |
| CLI | **READY** | `run`, `check`, `repl`, `--safe`, `--debug` |
| REPL | **READY** | Multi-line blocks, state kept across lines |
| Built-in functions | **READY** | 33, all typed and tested |
| Specification | **READY** | SPEC.md matches the implementation |
| Formal grammar | **READY** | `docs/spec/grammar.ebnf` |
| Tests | **READY** | 1156 passing, including 420 fuzz cases |
| Examples | **READY** | 22, each with recorded output under test |
| Security limits | **READY** | Enforced in one place, tested |
| Packaging | **READY** | `pip install -e .` gives the `lzy` command |
| CI | **READY** | GitHub Actions, 3 platforms × 5 Python versions |
| Learning course | **IN PROGRESS** | Levels 1-5 written, 6-9 outstanding |
| GitHub repository | **BLOCKED** | Needs the owner — see *Blocked* below |
| Error handling in LZY | **NOT IMPLEMENTED** | No `try`/`catch`; planned for 0.1.0 |
| Modules | **NOT IMPLEMENTED** | Planned for 0.2.0 |
| Standard library | **NOT IMPLEMENTED** | Built-ins only; planned for 0.2.0 |
| Files / network / HTTP | **NOT IMPLEMENTED** | Planned for 0.3.0 |
| Classes / structs | **NOT IMPLEMENTED** | Not scheduled; needs a LEP first |
| Formatter (`lzyfmt`) | **NOT IMPLEMENTED** | Planned for 0.1.0 |
| Linter (`lzylint`) | **NOT IMPLEMENTED** | Planned for 0.1.0 |
| Editor support / LSP | **NOT IMPLEMENTED** | Planned for 0.4.0 |
| Package manager | **NOT IMPLEMENTED** | Deliberately not started |
| Bytecode VM | **NOT IMPLEMENTED** | Planned for 0.5.0 |
| Playground | **NOT IMPLEMENTED** | Needs real isolation before it exists |
| Released artifacts | **NOT STARTED** | Nothing has been published anywhere |

---

## What works

Everything in this list has a test behind it.

**Language**

- Case-insensitive names, folded with Unicode NFKC then full case folding.
  Original spelling is kept for diagnostics.
- Indentation-based blocks; spaces only, tabs refused with an explanation.
- Seven types: `number`, `text`, `truth`, `nothing`, `list`, `map`,
  `function`.
- One numeric type. `6 / 2` is `3`; `4.0 == 4` is `true`.
- Arithmetic `+ - * / %`, comparison `== != < <= > >=`, logic
  `and or not` with short-circuiting.
- `if` / `else if` / `else`, `while`, `for ... in`, `break`, `continue`.
- Functions: recursion, mutual recursion, closures, first-class use.
- Lists and maps, including nesting, indexing, `map.name` access, and
  reference sharing with `copy()` to opt out.
- `say` with several values; `ask` for input.
- 33 built-in functions.

**Tooling**

- `lzy run`, `lzy check`, `lzy repl`, `--safe`, `--debug`, `--version`,
  `--help`, and a piped-program path on standard input.
- An interactive REPL that keeps names between lines and collects indented
  blocks until a blank line.

**Quality**

- 1156 tests: unit, integration, negative, regression, security, and 420
  fuzz cases.
- Every example has a recorded `.out` file that is compared on every run, so
  documentation cannot drift from behaviour.
- CI on Ubuntu, macOS and Windows against Python 3.9 through 3.13.

---

## Known limitations

These are design gaps, not bugs. They are listed in
[SPEC.md §14](SPEC.md#14-what-lzy-does-not-have-yet) as well.

1. **No error handling.** A program cannot recover from an error; it stops.
2. **No modules.** One file per program.
3. **No file, network or process access at all.**
4. **No anonymous functions**, so a function has to be named to be passed.
5. **No compound assignment.** `total = total + 1`, not `total += 1`.
6. **No string interpolation.** Use `+` and `text(...)`.
7. **A keyword cannot follow a dot.** `question.ask` will not parse; write
   `question["ask"]`.
8. **`sort` takes no comparison function**, so it sorts numbers or text only.
9. **No integer division operator.** Use `floor(a / b)`.
10. **A `while true` loop runs forever.** There is no time or step limit;
    that is the user's own loop to fix.

---

## Known bugs

None open. Six were found and fixed during the 0.0.1 build; each has a
regression test in `tests/regression/test_regressions.py`:

| # | Bug | Fixed by |
|---|---|---|
| 001 | `lzy file.lzy` crashed with a Python `TypeError` | Removed the hidden positional competing with the subparsers |
| 002 | Comparing a self-referential list overflowed the C stack | Depth limit and identity short-circuit in `equal()` |
| 003 | A type error echoed a 5000-character literal back | Suggestions cap each quoted part at 40 characters |
| 004 | A file path with spaces was wrapped across two lines | Paths use an unwrapped `detail` line |
| 005 | `--debug` printed the error twice and ate the traceback | `main` re-raises instead of reporting again |
| 006 | Python's recursion limit stayed raised after a run | Restored in a `finally` |

---

## Known security issues

None open. The current posture:

- LZY 0.0.1 has **no file, network or process access**, so the interpreter
  offers a program no route to the host.
- Limits on source size, nesting depth, recursion and output are enforced in
  `lzy/runtime/limits.py` and tested against hostile input.
- `random_number` uses the operating system's secure generator.
- Anything `ask` reads is data and is never executed.
- The interpreter depends only on the Python standard library, so there is no
  third-party supply chain to audit.

**This is not a sandbox.** A `while true` loop still runs forever, and a
program can still allocate large lists. Running untrusted LZY needs real
isolation. See [SECURITY.md](SECURITY.md).

---

## Blocked

**B-1: The public GitHub repository does not exist yet.**

The GitHub CLI (`gh`) is not installed in the development environment and no
GitHub credentials are configured, so the repository could not be created or
configured from a session. Everything is committed locally and ready to push.

What the owner needs to do, once:

1. Create a **public** repository (the preferred name is `lzy`; check for a
   clash first).
2. `git remote add origin <url>` and `git push -u origin main`.
3. Turn on Issues, Discussions, Dependabot, secret scanning and code
   scanning.
4. Protect `main`: require a pull request and require the CI check to pass.

The workflows in `.github/` are written and will start running on the first
push. Nothing else is waiting on this.

---

## Pending owner decisions

None. Both decisions that were open at 0.0.1 were made on 2026-09-19 and are
recorded in [docs/OWNER_DECISIONS.md](docs/OWNER_DECISIONS.md):

- **D-001** — the licence is **Apache-2.0**, chosen for its patent grant.
- **D-002** — the copyright holder is **Rishav Kumar**.

---

## Next recommended work

In priority order, and with the reason:

1. **Error handling (`try` / `catch` or an LZY equivalent).** The largest gap
   in the language. Needs a LEP first, because it decides how errors behave
   for good. Blocks any real application work.
2. **`lzyfmt`, the formatter.** The AST already carries every span it needs.
   A canonical format settles style arguments before there is a community to
   have them.
3. **`lzylint`.** Start with unused names and unreachable code, keeping
   style, correctness and security findings clearly separated.
4. **Levels 6–9 of the learning course** in `docs/learn/`.
5. **Anonymous functions and compound assignment.** Small, and each removes a
   daily annoyance. Each needs a LEP.
6. **Modules and `import`.** Begins 0.2.0 and unblocks the standard library.

---

## Architecture decisions

| Decision | Reason | Revisit when |
|---|---|---|
| Tree-walking interpreter in Python | Correctness and iteration speed matter far more than execution speed at this stage | Performance becomes a real complaint (0.5.0, the VM) |
| Standard library only, no dependencies | Nothing to audit, nothing to break, trivial to install | A dependency earns its place on evidence |
| Hand-written recursive-descent parser | Reads like the grammar, and gives far better error messages than a generated parser | Never, most likely |
| Blocks do not create scopes | A value set inside an `if` surviving afterwards is what people expect | A concrete bug shows otherwise |
| Assignment writes to the nearest existing name | Makes counters and closures work without extra keywords | If accidental global writes become a real problem |
| No truthiness | Removes a whole class of silent bugs, at the cost of a few characters | If teaching shows it genuinely blocks beginners |
| Spaces-only indentation | A beginner language cannot look different in different editors | Never |
| `equal()` and `inspect()` are depth-limited | A value can contain itself; the interpreter must survive that | Never |

---

## How to pick this up

```bash
git clone <repository>
cd lzy
pip install -e ".[dev]"
pytest                              # everything should pass
python -m lzy examples/01-beginner/hello.lzy
```

Read in this order: [SPEC.md](SPEC.md), then `lzy/lexer/`, `lzy/parser/`,
`lzy/interpreter/`. [CONTRIBUTING.md](CONTRIBUTING.md) covers the rest.
