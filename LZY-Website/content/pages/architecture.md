# Architecture

LZY is a tree-walking interpreter written in Python, using only Python's
standard library. A program goes through four stages — lexer, parser, syntax
tree, interpreter — and every stage reports problems as LZY errors, never as
Python ones. This page explains each part and where it lives.

<!-- lzy:component architecture-diagram -->

## The pipeline

### 1. Lexer — `lzy/lexer/`

Reads the source text and turns it into *tokens*: names, numbers, text,
keywords and punctuation. It also handles the parts of LZY that are about
layout rather than meaning:

- **Indentation** becomes `INDENT` and `DEDENT` tokens, so the parser can
  treat a block like any other structure. A tab in the indentation is refused
  here.
- **Case-insensitivity** happens here: every name is *folded* (Unicode NFKC,
  then full case folding) for lookups, while the spelling you wrote is kept
  for error messages.
- **Inside brackets**, line breaks are ignored, which is what lets a long list
  span several lines.

### 2. Parser — `lzy/parser/`

A hand-written recursive-descent parser that turns tokens into a syntax tree.
It is written to read function-for-function like the
[formal grammar](../../../docs/spec/grammar.ebnf), so the two can be checked
against each other. Writing it by hand, rather than generating it, is what
makes targeted errors possible: it can notice `if score = 10` and say "use
`==`" instead of "unexpected token".

### 3. Syntax tree — `lzy/ast/`

The tree is made of small dataclass nodes. Every node carries its *span* —
the file, line, column and length it came from — which is how every error,
even one found while running, can point at the exact spot with `^`.

### 4. Interpreter — `lzy/interpreter/`

Walks the tree and runs it.

- `interpreter.py` — evaluating expressions and running statements.
- `environment.py` — scopes and name lookup. Only a function call creates a
  scope; storing updates the nearest scope that already has the name.
- `values.py` — what a value is, what each type is called, and how values
  print.
- `builtins.py` — the built-in functions, each checking its own inputs.

## Around the pipeline

- **`lzy/errors.py`** defines every error kind and renders each error in the
  same shape: heading, message, the line with `^`, the reason, and "Maybe you
  meant".
- **`lzy/runtime/limits.py`** holds every safety limit in one place, so
  anyone embedding LZY can tighten them without touching the rest.
- **`lzy/runtime/execution.py`** runs each program on a thread with a stack
  size LZY sets itself, so the limits mean the same thing on every operating
  system.
- **`lzy/cli/`**, **`lzy/repl.py`** and **`lzy/api.py`** are the ways in: the
  `lzy` command, the interactive session, and `run_source()` for embedding.
  All three run programs through the same pipeline.

## Every file

<!-- lzy:component module-table -->

## Choices, and why

| Decision | Reason |
|---|---|
| A tree-walking interpreter | Correctness and ease of change matter far more than speed at this stage |
| Python's standard library only | Nothing to audit, nothing to break, trivial to install |
| A hand-written parser | It reads like the grammar and gives far better error messages |
| Limits checked in one place | So the rules that protect the interpreter cannot drift apart |
| Every error carries a source span | So every error can say where, even at run time |

These come from the project's own record of decisions, in
[PROJECT_STATUS.md](../../../PROJECT_STATUS.md#architecture-decisions).

## What is planned

- **0.5.0** adds a compiler from the syntax tree to bytecode, and a virtual
  machine to run it. The tree-walking interpreter stays as the reference
  implementation, and both must pass the same test suite.
- **Modules** (0.2.0) add an `import` stage between parsing and running.

There is no separate semantic-analysis pass — checks happen while parsing and
while running — and no native compiler, which the roadmap rules out until the
VM exists. See the [roadmap](/roadmap/).

## Reading the code

The code is meant to be read in pipeline order: [SPEC.md](../../../SPEC.md)
first, then `lzy/lexer/`, `lzy/parser/` and `lzy/interpreter/`.
[Contributing](../../../CONTRIBUTING.md#how-the-code-is-laid-out) has a map
of the folders.
