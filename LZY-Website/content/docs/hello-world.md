# Hello World

Your first LZY program is one line long. This page writes it, runs it, checks
it, and then tries the same thing in the REPL.

You need LZY installed first. If `lzy --version` does not work yet, see
[Installation](/install/).

## Write it

Make a new file called `hello.lzy` and put this in it:

```lzy
say "Hello World"
```

- **`say`** means "print this where I can see it".
- **`"Hello World"`** is text. The quotes tell LZY that what is inside them is
  words to print, not instructions.

Save the file as plain text. LZY files are UTF-8, and the extension is `.lzy`.

## Run it

In a terminal, in the folder where you saved the file:

```bash
lzy hello.lzy
```

It prints `Hello World`. That is a program, running. `lzy hello.lzy` is short for `lzy run hello.lzy`;
both do the same thing.

## Check it without running it

`lzy check` reads a program and reports mistakes without running any of it:

```bash
lzy check hello.lzy
```

It prints `hello.lzy: no mistakes found.` when there are none. That is useful
for a program that asks questions or takes a long time.

## Say more than one thing

Put commas between values and `say` puts a space between them. Numbers are
worked out before they are printed:

```lzy
say "Hello", "World"
say "Two plus two is", 2 + 2
say "Six divided by four is", 6 / 4
```

```output
Hello World
Two plus two is 4
Six divided by four is 1.5
```

## Try it in the REPL

The REPL runs LZY one line at a time and remembers names between lines. Start
it with `lzy repl`, or just `lzy`:

<!-- lzy:component repl-session -->

Type `exit` to leave. There is more on the [REPL page](repl.md).

## Break it on purpose

Leave off the closing quote:

```lzy-broken
say "Hello World
```

```output
Syntax error in program.lzy, on line 1.

This text was opened but never closed.

    say "Hello World
        ^

Add a closing " at the end of the text.
```

Every LZY error looks like this: what happened, where, why, and what to do
about it. Reading them is a skill worth practising early — see
[Errors](errors.md).

## Next

- [Your first project](first-project.md): a small program with decisions,
  loops and a function.
- [The course](../../../docs/learn/README.md), if you are new to programming.
