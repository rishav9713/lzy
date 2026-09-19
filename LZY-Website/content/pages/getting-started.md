# Getting started

This page takes you from nothing to a running LZY program in about five
minutes: what LZY is, what you need, how to install it, and how to write,
check and run your first program.

## 1. What is LZY?

LZY is a small, readable programming language. Programs are written in plain
words with no punctuation to memorise, blocks are made by indenting, and every
error explains itself. It is open source, runs anywhere Python runs, and is
at an early version — see [the introduction](../docs/introduction.md) for what
it can and cannot do yet.

```lzy
say "Hello World"
```

## 2. What you need

- **Python 3.9 or newer.** LZY is written in Python and needs nothing else:
  no compiler, no other libraries. Check with `python --version` (or
  `python3 --version` on macOS and Linux).
- **A terminal**: Terminal on macOS, PowerShell or Command Prompt on Windows,
  any shell on Linux.
- **A text editor.** Any editor works. There is no LZY editor extension yet,
  so set it to indent with spaces.

## 3. Install LZY

<!-- lzy:component install-commands -->

Full instructions for each operating system, and help when something goes
wrong, are on the [installation page](install.md).

## 4. Check it worked

<!-- lzy:component version-check -->

If you see `command not found` or `not recognized`, the `lzy` command is not
on your PATH yet — see [troubleshooting](troubleshooting.md#lzy-command-not-found).

## 5. Write your first program

Make a file called `hello.lzy`:

```lzy
name = "World"
say "Hello " + name

for count in range(1, 4)
    say "Counting:", count
```

```output
Hello World
Counting: 1
Counting: 2
Counting: 3
```

## 6. Run it

```bash
lzy hello.lzy
```

## 7. Check without running

LZY has no compile step: `lzy` reads your program and runs it directly. To
find mistakes without running anything, use `lzy check`:

```bash
lzy check hello.lzy
```

## 8. Try the REPL

`lzy repl` runs LZY one line at a time, which is the quickest way to
experiment. Type `exit` to leave.

```bash
lzy repl
```

## 9. Next steps

| If you want to… | Go to |
|---|---|
| learn to program, from the beginning | [the course](../../../docs/learn/README.md) |
| see the whole language quickly | [the language at a glance](language.md) |
| look something up | [built-in functions](../docs/stdlib.md) |
| read real programs | [examples](/examples/) |
| build something small | [your first project](../docs/first-project.md) |
