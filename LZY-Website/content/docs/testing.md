# Testing

LZY is tested heavily for a language this young, because a language that
behaves differently from its documentation is worse than no language at all.
This page describes what is tested, how, and how to run the tests yourself.

<!-- lzy:component project-numbers -->

## What the tests cover

| Folder | What it checks |
|---|---|
| `tests/lexer/` | reading source text into tokens, indentation, and case folding |
| `tests/parser/` | turning tokens into a syntax tree, and the syntax errors |
| `tests/interpreter/` | what programs do: values, collections, scope, functions |
| `tests/errors/` | that error messages say what, where, why and how to fix it |
| `tests/cli/` | the `lzy` command, its options and exit codes |
| `tests/integration/` | the examples, and the LZY in the documentation |
| `tests/regression/` | one test for every bug that was found and fixed |
| `tests/security/` | limits, hostile input, and fuzzing |

## Documentation is tested too

Three checks keep the documentation honest, including this website:

- **Every LZY snippet must parse.** Any ` ```lzy ` block in any Markdown file
  in the repository is parsed by the test suite.
- **Every deliberate mistake must fail, helpfully.** A ` ```lzy-broken `
  block must produce an error, and that error must offer a hint or a
  suggestion.
- **Every output shown must be real.** An ` ```output ` block after a snippet
  must match what LZY prints for it, exactly.

The examples work the same way: each program's output is recorded in a
`.out` file next to it, and the test suite compares them on every change.

## Fuzzing and hostile input

The security tests feed LZY malformed and deliberately hostile programs —
deep nesting, oversized input, values that contain themselves, endless
recursion — and check that each one either runs or produces an LZY error. The
interpreter process must never crash.

## Running the tests

```bash
git clone https://github.com/rishav9713/lzy
cd lzy
python -m pip install -e ".[dev]"

pytest                                  # everything
pytest tests/lexer -v                   # one area
pytest -k case_insensitiv               # tests whose names match
coverage run -m pytest && coverage report
ruff check .                            # linting
python tools/record_examples.py         # do the examples still print what they claim?
python tools/record_doc_outputs.py      # does the documentation still show real output?
```

## Continuous integration

Every pull request runs the whole suite on these systems and Python versions,
plus linting, a coverage floor of 90%, a documentation link check, and a
build and install of the package:

<!-- lzy:component platform-matrix -->

## Writing a test

- Every change needs a test, and every bug fix needs a regression test named
  after the bug.
- Test names are sentences, such as
  `test_assignment_updates_the_nearest_existing_name`.
- Test behaviour, not implementation: check what a program prints, not which
  method was called.

More in [CONTRIBUTING.md](../../../CONTRIBUTING.md#tests).
