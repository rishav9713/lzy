# Safe mode and limits

LZY refuses work that would otherwise bring the interpreter down: a file too
large to read, nesting too deep to follow, a function calling itself without
end. Each limit produces a normal LZY error, never a crash. `--safe` makes
every limit tighter.

## The limits

This table is generated from `lzy/runtime/limits.py`, where every limit lives:

<!-- lzy:component limits-table -->

## Using --safe

```bash
lzy --safe program.lzy
lzy --safe check program.lzy
lzy --safe repl
```

Use it for code you did not write and have not read.

## What a limit looks like

A function that never stops calling itself:

```lzy-broken
function forever(n)
    return forever(n + 1)

say forever(1)
```

```output
Limit reached in program.lzy, on line 2.

'forever' called itself too many times.

    return forever(n + 1)
           ^^^^^^^

LZY allows 400 calls waiting at once. A function that calls itself needs a
case where it stops and returns without calling itself again.
```

## Why there are several depth limits

They bound different things, and each catches a shape the others miss. The
parser's own nesting is limited while it reads. The syntax tree it produces is
measured separately afterwards, because a long chain like `1 + 1 + 1 + ...` is
read by a loop but builds a tree one level deep per operator. At run time, the
total amount of unfinished work is limited too, and so is the number of
function calls waiting at once.

LZY also runs every program on a thread whose stack size it sets itself, so
the limits mean the same thing on every operating system. Version 0.0.2
exists because, before this, a deep expression could crash the interpreter on
Windows with Python 3.9 or 3.10 — the details are in the
[0.0.2 release notes](../../../docs/releases/v0.0.2.md).

## These are not a sandbox

**There is no time limit** — a `while true` loop runs until it is stopped —
and **memory is only partly limited**: `range` is capped, but other growth is
not. `--safe` does not change that. To run LZY code you do not trust, use
isolation from the operating system: a separate process with CPU and memory
caps, no network, and an unprivileged user.

See the [security policy](/security/).
