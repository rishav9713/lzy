# Introduction

LZY is an open-source programming language built around one idea: a program
should say what it does in words a person can read aloud.

```lzy
say "Hello World"
```

```output
Hello World
```

That line is a whole program. There is no `main` function to write, no
semicolon, no brackets, and nothing to set up first.

## Less syntax, not less understanding

Most languages ask a beginner to learn punctuation before they learn ideas.
LZY takes the punctuation away, but it does not take away meaning. Where a
choice is between shorter and clearer, LZY picks clearer.

```lzy
numbers = [10, 20, 30, 40]

total = 0
for number in numbers
    total = total + number

say "Total:", total
```

```output
Total: 100
```

Three rules follow from that, and they show up everywhere:

- **No hidden conversions.** `1 + "1"` is an error, not a guess.
- **No truthiness.** A condition needs a real `true` or `false`, so `if count`
  is an error and `if count != 0` is not.
- **One way to say a thing**, until there is a good reason for two.

## What makes LZY different

| Decision | What it means |
|---|---|
| **Case-insensitive** | `total`, `Total` and `TOTAL` are one name. See [Names and case](names.md). |
| **Indentation, no braces** | A block is the indented lines under the line that opens it. See [Syntax and layout](syntax.md). |
| **One number type** | `6 / 2` is `3` and `7 / 2` is `3.5`. See [Numbers](numbers.md). |
| **Strict about types** | LZY would rather say it does not know what you meant than guess. See [Types and values](types.md). |
| **Errors that teach** | Every error says what happened, where, why, and what to try. See [Errors](errors.md). |

Each of those is a deliberate decision, argued with its alternatives in the
[design decisions](../../../docs/OWNER_DECISIONS.md).

## Who it is for

- **Someone learning to program**, including a child, who needs the language
  to get out of the way.
- **A teacher** who wants to show an idea without first explaining
  boilerplate.
- **An experienced developer** who wants scripts that read like notes.
- **A security or operations engineer** analysing logs and reports — within
  the limits described below.

## Where LZY is today

LZY is at version 0.0.x. The core language works and is tested: variables,
seven types, arithmetic and comparison, decisions, loops, functions with
recursion and closures, lists, maps, input and output, and a set of built-in
functions, with the `lzy` command and an interactive REPL.

<!-- lzy:component project-numbers -->

It is also missing things you would expect from a mature language: error
handling, modules, file and network access, and a standard library beyond the
built-ins. Those are on the [roadmap](/roadmap/), and the full list is in
[Not in LZY yet](not-yet.md).

It is a good time to read LZY, try it and argue with its design. It is not yet
a good time to build something important on it.

## How LZY runs

LZY is an interpreter written in Python, using only Python's standard library.
It reads a `.lzy` file, checks it, and runs it directly — there is no separate
compile step. That makes it easy to install anywhere Python runs, and easy to
read: the whole interpreter is a few thousand lines. See
[Architecture](/architecture/).

## Where to go next

- New to programming: start [the course](../../../docs/learn/README.md).
- Already program: read [the language at a glance](/language/).
- Want it running first: [install LZY](/install/), then write
  [Hello World](hello-world.md).
