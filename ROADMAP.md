# LZY Roadmap

What LZY plans to become, in the order it plans to get there.

This roadmap describes intent, not promises with dates. Dates would be
guesses; the exit conditions below are not. A version ships when its
conditions are met.

The current state is in [PROJECT_STATUS.md](PROJECT_STATUS.md).

---

## Principles

Three rules shape the order of everything below.

**Build vertically.** A feature is finished when it has an implementation, a
place in the specification, tests, error messages, documentation and an
example. Six half-finished features are worth less than one finished one.

**Do not overbuild early.** A package registry, a native compiler and an
optimising VM are all things LZY might need one day and none of them are
things LZY needs while the core language is still moving.

**Language changes go through a LEP.** Anything that changes what an existing
program means gets written up in `docs/leps/` first, including its security
and compatibility consequences.

---

## 0.0.1 — Language Foundation ✅ *done*

The point of this release was to prove the language is real and to leave
something worth arguing with.

- Lexer, parser, AST, tree-walking interpreter
- Case-insensitive names with a documented Unicode folding rule
- Seven types, one numeric type, no truthiness, no implicit conversion
- `if` / `else if` / `else`, `while`, `for`, `break`, `continue`
- Functions with recursion, closures and first-class use
- 33 built-in functions
- `lzy` command with `run`, `check`, `repl`, `--safe`, `--debug`
- Error messages that say what, where, why and how to fix
- Specification, formal grammar, 22 examples, 1156 tests
- Safety limits tested against malformed and hostile input

---

## 0.1.0 — Core Language Stable

**The goal:** the core of LZY stops moving, and the tools you need to write
it comfortably exist.

- **Error handling.** The biggest gap in the language. Needs a LEP: it has to
  fit a language with no classes yet, and it decides how failure works for
  good.
- **`lzyfmt`, the formatter.** One canonical layout, settled before there is
  a community to argue about it.
- **`lzylint`.** Unused names, unreachable code, suspicious comparisons, with
  style, correctness and security findings kept separate.
- **Anonymous functions**, so `sort` and friends can take behaviour.
- **Compound assignment** (`total += 1`). Small; needs a LEP because it adds
  syntax.
- **Sorting with a comparison**, once anonymous functions exist.
- Learning course levels 6–9.

**Ships when:** the specification has not changed for a full release cycle,
`lzyfmt` is idempotent on every example, and the test suite covers every
documented behaviour.

---

## 0.2.0 — Modules and a Standard Library

**The goal:** a program can be more than one file, and the language comes
with batteries.

- **Modules and `import`.** Resolution rules, name collisions, circular
  imports, and — deliberately — no code execution on import beyond the
  module's own top level.
- **`lzytest`**, so LZY tests are written in LZY.
- Standard library, in this order: `strings`, `math`, `collections`,
  `datetime`, `json`.

**Ships when:** each library has documentation, examples and tests, and the
import system has a written security model.

---

## 0.3.0 — Applications

**The goal:** LZY can do useful work against the outside world. This is the
release where security stops being theoretical.

- **Files.** Explicit paths, protection against traversal, no ambient
  authority.
- **HTTP client**, then a small server.
- **Processes**, with arguments passed as a list and never as a shell string.
- **`crypto`**, wrapping vetted primitives; no home-made cryptography.
- Databases, probably SQLite first.

**Ships when:** every API that touches the outside world has had a written
security review, safe defaults, and tests that try to misuse it.

---

## 0.4.0 — Developer Experience

- VS Code extension: `.lzy`, syntax highlighting, then diagnostics
- Language server: diagnostics, completion, hover, go-to-definition,
  formatting
- A browser playground, **only** once code runs in real isolation and never
  on the host

---

## 0.5.0 — Bytecode and a Virtual Machine

**The goal:** make LZY fast enough to stop thinking about it, without
changing what any program means.

- A compiler from AST to bytecode, and a VM to run it
- A benchmark suite recorded with hardware, OS, version and method
- The tree-walking interpreter kept as the reference implementation, with
  both required to agree

**Ships when:** the VM passes the entire existing test suite unchanged and
the measured improvement is published with its methodology.

---

## 0.6.0 — Packages

Deliberately last of the big pieces. A package manager built before the
language settles is a package manager built twice.

- `lzy.toml`, `lzy init`, `lzy add`, `lzy install`
- Lockfiles, checksums, pinning, integrity verification
- A written threat model for the registry before any registry exists

---

## 0.9.0 — Feature Freeze

No new language features. Only fixes, documentation, performance and
polish. Cross-platform builds verified on every platform that is claimed,
and a signed release process with checksums.

---

## 1.0.0 — Stable

LZY reaches 1.0 when all of these are true, and not before:

- [ ] The specification is complete and stable
- [ ] The syntax has not changed for two releases
- [ ] Lexer, parser and runtime are reliable under fuzzing
- [ ] The error messages have been tested on real beginners
- [ ] There is a standard library worth the name
- [ ] CLI, REPL, formatter, linter and test tool all exist
- [ ] Editor support and a language server exist
- [ ] Package management works end to end
- [ ] Releases are built, tested and signed for every platform claimed
- [ ] There is a security policy with a real response process
- [ ] There is a contribution process and a governance model
- [ ] Builds are reproducible and releases carry checksums

After 1.0, a program that runs on one `1.x` release runs on every later
`1.x` release. Breaking that needs 2.0 and a deliberate decision.

---

## Explicitly not planned

Saying no is part of a roadmap.

- **Compiling to native code.** Not until the VM exists and something real
  needs it.
- **A type system.** LZY is dynamically typed. Optional annotations might
  earn their way in later; inference is a different language.
- **Being the fastest language.** LZY optimises for reading.
- **Replacing anything.** LZY is not a competitor to Python, JavaScript or
  anything else. It is for people who want to read their own code.
