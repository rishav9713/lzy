# Contributing to LZY

Thank you for looking. LZY is early, which means the most valuable
contributions right now are arguments about the design, clearer error
messages, and tests for behaviour nobody has pinned down yet.

By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Getting set up

You need Python 3.9 or newer. Nothing else.

```bash
git clone https://github.com/rishav9713/lzy
cd lzy
pip install -e ".[dev]"

pytest                       # expect everything to pass
lzy examples/01-beginner/hello.lzy
```

Useful commands:

```bash
pytest                                  # the whole suite, about two seconds
pytest tests/lexer -v                   # one area
pytest -k case_insensitiv               # by name
coverage run -m pytest && coverage report
ruff check .                            # lint
ruff format --diff .                    # formatting, as a preview
python tools/record_examples.py         # do the examples still print what they claim?
python tools/record_examples.py --write # record new output, after reading it
```

---

## How the code is laid out

LZY is a pipeline, and the folders follow it:

```
source text
    │
    ├─ lzy/lexer/      characters  → tokens   (also indentation, case folding)
    ├─ lzy/parser/     tokens      → AST
    ├─ lzy/ast/        the node types
    ├─ lzy/interpreter/ AST        → behaviour
    │      ├─ interpreter.py   the tree walk
    │      ├─ environment.py   scopes and name lookup
    │      ├─ values.py        what a value is, and how it prints
    │      └─ builtins.py      the built-in functions
    ├─ lzy/runtime/    limits.py — every safety limit, in one place
    ├─ lzy/errors.py   the error types and how they are rendered
    ├─ lzy/cli/        the lzy command
    └─ lzy/repl.py     the interactive session
```

Two things to know before you change anything:

**`docs/spec/grammar.ebnf` is written to read function-for-function like
`lzy/parser/parser.py`.** Change one and change the other.

**Every error a user can see is an `LzyError` with a source span.** A bare
Python exception reaching a user is a bug, even if the message is accurate.

---

## What makes a good contribution

### Especially welcome

- **Design arguments.** "This is confusing, and here is a program that shows
  why." You do not need a patch.
- **Better error messages.** If an error left you guessing, that is a
  reportable bug. Say what you expected it to tell you.
- **Tests for uncovered behaviour**, including behaviour you think is wrong.
  A failing test is a good bug report.
- **Documentation** that explains something more clearly than it is explained
  now.
- **Examples**, especially ones that teach an idea rather than show off.

### Please discuss first

- Any new syntax
- Any change to what an existing program means
- A new built-in function
- A new dependency

Open an issue or a discussion before writing the code. For language changes,
that means a LEP — see below.

---

## Standards

### Python code

- Follow the style already in the file. `ruff check .` must pass.
- Type hints on anything public.
- Docstrings that explain **why**, not what. The code says what.
- No runtime dependencies. This is deliberate; see
  [SECURITY.md](SECURITY.md).

### Errors

Every error must answer four questions: **what happened, where, why, and how
to fix it.** In practice:

```python
raise LzyTypeError(
    "'+' cannot add a number and text.",          # what
    span,                                          # where
    hint="LZY keeps numbers and text apart ...",   # why
    suggestion="total + number(name)",             # how to fix
)
```

Write for someone who has been programming for a week. Avoid "invalid",
"illegal", "unexpected token" and anything that names an internal type.

### Tests

- Every change needs a test. Every bug fix needs a regression test in
  `tests/regression/`, named after the bug.
- Test names are sentences: `test_assignment_updates_the_nearest_existing_name`.
- Test behaviour, not implementation. Assert on what a program prints, not on
  which method was called.

### LZY code in examples

- Open with a comment saying what the example is for.
- Use only features that exist. `pytest tests/integration` will catch you.
- Record the output with `python tools/record_examples.py --write` after
  reading it and agreeing it is right.

---

## Changing the language

Anything that changes what LZY means goes through a **LEP — LZY Enhancement
Proposal**. This exists so that the language does not drift one convenient
patch at a time.

1. Copy `docs/leps/0000-template.md`.
2. Fill in every section, including **Security implications** and
   **Compatibility**, and be honest in **Alternatives**.
3. Open a pull request with the LEP alone, before the implementation.
4. Once it is accepted, implement it — and update, in this order:
   specification, grammar, parser, tests, examples, documentation.

A LEP that says "and here is why I might be wrong" is taken more seriously
than one that does not.

---

## Pull requests

Before you open one:

```bash
pytest
ruff check .
python tools/record_examples.py
git status          # look at what you are actually committing
```

Then:

- **One change per pull request.** A fix and a refactor are two pull
  requests.
- **Commit messages** use `type: summary` — `feat`, `fix`, `test`, `docs`,
  `security`, `refactor`, `ci`, `chore`, `release`. Explain *why* in the
  body.
- **Say what you did not do.** If you left something out, say so; it saves
  the reviewer guessing.
- CI runs on Ubuntu, macOS and Windows across Python 3.9 to 3.13. It has to
  be green.

Never commit `.env` files, credentials, keys, tokens or anything personal.

---

## Reporting bugs

Open an issue with:

1. The smallest `.lzy` file that shows the problem
2. What you expected
3. What happened, including the whole error message
4. `lzy --version`, your Python version and your OS

`lzy --debug program.lzy` shows LZY's own traceback, which is useful in a
report about the interpreter itself.

**Security problems do not go in issues.** See [SECURITY.md](SECURITY.md).

---

## Where to start

Good first contributions, roughly easiest first:

1. Find an error message that could be clearer, and improve it.
2. Add a test for something in [SPEC.md](SPEC.md) that has no test.
3. Write an example that teaches one idea well.
4. Write a level of the course in `docs/learn/`.
5. Take on something from **Next recommended work** in
   [PROJECT_STATUS.md](PROJECT_STATUS.md).

If you are not sure whether something is wanted, ask. That is a smaller cost
than writing it and finding out.
