# The lzy command

`lzy` runs LZY programs, checks them without running them, and starts the
interactive REPL. Everything on this page is generated from the command
itself, including the outputs, which were produced by running it.

## At a glance

```bash
lzy hello.lzy            # run a program
lzy run hello.lzy        # the same thing, written out
lzy check hello.lzy      # look for mistakes without running it
lzy repl                 # try LZY one line at a time
lzy --safe program.lzy   # run with tighter limits
lzy --version
lzy --help
```

## Commands

<!-- lzy:component cli-reference -->

## Options

Options go **before** the command: `lzy --safe run program.lzy`, or
`lzy --safe program.lzy`.

<!-- lzy:component cli-options -->

### --safe

Runs with tighter limits on source size, nesting, recursion and output, for
code you do not fully trust. It is a seatbelt, not a locked door: it does not
make LZY a sandbox. The exact numbers are on
[Safe mode and limits](limits.md).

### --debug

When LZY itself goes wrong, `--debug` shows its Python traceback after the
LZY error. It is for people working on the interpreter and for bug reports
about it; you should never need it to fix your own program.

## Piping a program in

With no command and something piped in, `lzy` runs what it reads:

```bash
echo 'say 1 + 2' | lzy
```

That prints `3`. A program run this way cannot use `ask`, because standard
input is the program itself.

## Exit codes

<!-- lzy:component cli-exit-codes -->

## The full help text

<!-- lzy:component cli-help -->

## Running without installing

From a copy of the repository, `python -m lzy` does everything `lzy` does:

```bash
python -m lzy examples/01-beginner/hello.lzy
python -m lzy --version
```

## See also

- [The REPL](repl.md)
- [Safe mode and limits](limits.md)
- [Debugging](/debug/)
