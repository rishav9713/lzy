# Errors

When something goes wrong, LZY stops and prints an error. Error messages are
treated as part of the language: every one is meant to answer four questions
— **what happened, where, why, and how to fix it** — in words someone who has
been programming for a week can follow.

## Reading an error

```lzy-broken
total = 0
name = "Ada"
say total + name
```

```output
Type error in program.lzy, on line 3.

'+' cannot add a number and text.

    say total + name
              ^

LZY keeps numbers and text apart so that '+' always means the same thing. Use
number(...) to add them as numbers, or text(...) to join them as text.

Maybe you meant:

    total + number(name)
```

From top to bottom:

1. **The heading** says what kind of error it is and where: the file and the
   line.
2. **The message** says what happened, in one sentence.
3. **The line**, with `^` under the exact part LZY is pointing at.
4. **The explanation** says why LZY refuses, and what to do instead.
5. **Maybe you meant** shows a corrected version, when LZY can work one out.

LZY never shows a Python traceback to someone writing LZY. `lzy --debug`
adds one, for people working on LZY itself.

## Kinds of error

<!-- lzy:component error-kinds -->

## Errors happen at two times

**Before anything runs.** Syntax errors are found when LZY reads the program,
so nothing is printed first. `lzy check` finds these without running the
program at all.

**While it runs.** Name, type, value and lookup errors happen when LZY
reaches the line. Everything before that line has already run:

```lzy-broken
say "This line runs"
say 10 / 0
say "This one never does"
```

```output
Value error in program.lzy, on line 2.

LZY cannot divide by zero.

    say 10 / 0
           ^

Check the value on the right of the '/' before dividing.
```

The first line was printed before the error. The recorded output above shows
only the error, which LZY prints to standard error.

## There is no error handling yet

LZY 0.0.x has no `try` and `catch`. An error always stops the program. Error
handling is the largest gap in the language and is planned for 0.1.0; the
design needs a proposal first, because it decides how failure works for good.

Until then, check before you act:

```lzy
stock = { "apples": 4 }

if contains(stock, "pears")
    say stock["pears"]
else
    say "No pears"

answer = "12"
if answer != ""
    say number(answer) * 2
```

```output
No pears
24
```

## When an error message confuses you

That is a bug in LZY, not in you. Please
[report it](https://github.com/rishav9713/lzy/issues/new?template=error_message.yml):
say what the message was, and what you thought it meant.

## Some messages you will meet

A name that has not been given a value, with a suggestion:

```lzy-broken
colour = "red"
say color
```

```output
Name error in program.lzy, on line 2.

'color' has not been given a value yet.

    say color
        ^^^^^

LZY knows a name that looks very similar.

Maybe you meant:

    colour
```

A word from another language:

```lzy-broken
print("hello")
```

```output
Name error in program.lzy, on line 1.

LZY does not have anything called 'print'.

    print("hello")
    ^^^^^

In LZY this is called 'say'.

Maybe you meant:

    say
```

Something LZY keeps for later:

```lzy-broken
let x = 1
```

```output
Syntax error in program.lzy, on line 1.

'let' is a word LZY keeps for a future version of the language.

    let x = 1
    ^^^

Choose a different name so your program keeps working when LZY starts using
this word.

Maybe you meant:

    my_let
```

## See also

- [Debugging](/debug/)
- [Troubleshooting](/troubleshooting/)
- [Specification: errors](../../../SPEC.md#12-errors)
