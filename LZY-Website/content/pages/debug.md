# Debugging

When a program does the wrong thing, or stops with an error, the fix is
usually closer than it looks. This page is a method for finding it: read the
error, find the line, make the problem small, and only then change code.

## The method

1. **Read the whole error.** LZY errors say what happened, where, why, and
   often what to type instead. The last part — "Maybe you meant" — is right
   more often than not.
2. **Go to the file and line** in the heading: `Type error in totals.lzy, on
   line 3`.
3. **Look at the part under the `^`.** That is the exact spot LZY is pointing
   at, not just the line.
4. **Reproduce it.** Run the program again and make sure you see the same
   error. If it depends on what you typed at an `ask`, note what you typed.
5. **Make it small.** Delete everything that is not needed to cause the error.
   A three-line program that shows the problem is much easier to think about
   than a hundred-line one — and it is exactly what a bug report needs.
6. **Check the documentation** for the thing that failed: the
   [built-in functions](../docs/stdlib.md), the [guide](../docs/syntax.md), or
   the [specification](../../../SPEC.md).
7. **Search existing issues** on GitHub, in case someone has hit it already.
8. **Report it** if LZY is wrong, or if its error message did not help.

## Reading an error

```lzy-broken
answer = "4"
say answer * 2
```

```output
Type error in program.lzy, on line 2.

'*' works on numbers, but it was given some text.

    say answer * 2
               ^

Use number() to turn text into a number first.
```

- **Heading** — a *type* error, on line 2.
- **Message** — `*` was given some text, but it only works on numbers.
- **The `^`** — points at the `*`.
- **Why and how** — use `number()` to turn text into a number first:
  `number(answer) * 2`.

`answer` holds `"4"`, text that looks like a number — exactly what `ask`
gives back when someone types 4.

## Look at values with say

LZY has no debugger yet. The simplest tool is the best one: print what you
think is true, and check.

```lzy
function average(numbers)
    total = sum(numbers)
    say "debug: total is", total, "and count is", length(numbers)
    return total / length(numbers)

say average([4, 8, 9])
```

```output
debug: total is 21 and count is 3
7
```

`show()` is useful here, because it keeps the quotes around text, so you can
tell `"3"` from `3`:

```lzy
answer = "3"
say "debug:", show(answer), type(answer)
```

```output
debug: "3" text
```

## Check before you run

`lzy check` reads the whole program and reports syntax errors without running
anything. It is fast, and safe for a program that asks questions or runs for
a long time:

```bash
lzy check program.lzy
```

## Try it in the REPL

Paste a line or two into `lzy repl` to see what an expression gives, without
running the whole program. A lone expression is echoed, so `sort([3, 1, 2])`
shows its result.

## When LZY itself breaks

If LZY crashes with a Python error instead of an LZY one, that is a bug in
LZY, and `--debug` shows the traceback that tells the maintainers where:

```bash
lzy --debug program.lzy
```

Include that output in the bug report.

## Reporting a bug

Open an [issue](https://github.com/rishav9713/lzy/issues/new?template=bug_report.yml)
with:

- the smallest `.lzy` program that shows the problem,
- what you expected,
- what happened, including the **whole** error message,
- the output of `lzy --version`, your Python version and your operating
  system.

An error message that confused you is a bug too — there is a
[template for that](https://github.com/rishav9713/lzy/issues/new?template=error_message.yml).

**Security problems do not go in issues.** Report them privately — see
[Security](/security/).

## See also

- [Troubleshooting](troubleshooting.md), for problems before a program runs
- [Errors](../docs/errors.md)
