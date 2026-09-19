# Not in LZY yet

This is the list of things LZY does not have, so nobody has to find out the
hard way. Each is either on the roadmap, with the version it is planned for,
or named as a known limitation. None of them is hidden in a footnote
elsewhere.

## Language features

| Missing | What to do today | Planned |
|---|---|---|
| Error handling (`try` / `catch`) | Check before you act, with `contains()` and comparisons | 0.1.0 |
| Anonymous functions | Define a named function and pass its name | 0.1.0 |
| Compound assignment (`+=`) | Write `total = total + 1` | 0.1.0 |
| Sorting with a comparison | `sort()` works on all-numbers or all-text lists | 0.1.0 |
| Modules and `import` | Keep a program in one file | 0.2.0 |
| String interpolation or formatting | Join with `+` and `text()`, or use commas in `say` | Not scheduled |
| Classes and structs | Use maps | Needs a proposal first |
| Pattern matching | Use `if` / `else if` | Not scheduled |
| `async`, concurrency, parallelism | — | Not scheduled |
| An integer-division operator | `floor(a / b)` | Not scheduled |

Words such as `try`, `catch`, `class`, `import`, `match` and `async` are
already reserved, so programs written today will not break when they arrive.

## The outside world

LZY has **no file, network or process access**, and a program cannot read its
command-line arguments or environment. Input comes from `ask`; output goes to
`say`.

| Missing | Planned |
|---|---|
| Files | 0.3.0 |
| HTTP client, then a small server | 0.3.0 |
| Running other programs | 0.3.0 |
| Databases (probably SQLite first) | 0.3.0 |
| Command-line arguments and environment variables | Not scheduled |

Each of these will arrive with a written security review, because it is the
point where LZY programs first reach outside the interpreter.

## Libraries and tooling

| Missing | Planned |
|---|---|
| A standard library: `strings`, `math`, `collections`, `datetime`, `json` | 0.2.0 |
| `lzyfmt`, a formatter | 0.1.0 |
| `lzylint`, a linter | 0.1.0 |
| `lzytest`, tests written in LZY | 0.2.0 |
| Editor support and a language server | 0.4.0 |
| A browser playground | 0.4.0 |
| A bytecode virtual machine | 0.5.0 |
| Packages and a package manager | 0.6.0 |

Today there are the built-in functions, which are always available — see
[Built-in functions](stdlib.md).

## Known limitations

These are design gaps, not bugs:

- **A keyword cannot follow a dot.** `question.ask` does not parse because
  `ask` is a keyword; write `question["ask"]`.
- **A `while true` loop runs forever.** There is no time limit.
- **LZY is not a sandbox.** It has limits on nesting, recursion and size, but
  no time limit and only partial memory limits. See [Security](/security/).

## Where this list comes from

The versions are from the [roadmap](/roadmap/), and the list matches
[section 14 of the specification](../../../SPEC.md#14-what-lzy-does-not-have-yet).
If you need one of these, say so on
[GitHub Discussions](https://github.com/rishav9713/lzy/discussions) — knowing
what people are waiting for helps decide the order.
