# The REPL

The REPL — read, evaluate, print, loop — runs LZY one line at a time. It keeps
every name you create until you leave, so you can build something up step by
step. It is the quickest way to try an idea.

## Starting it

```bash
lzy repl
```

Running `lzy` on its own does the same, when nothing is piped in.

## A session

This session was recorded by feeding each line to LZY's real REPL:

<!-- lzy:component repl-session -->

Things to notice:

- **A lone expression is echoed.** `6 * 7` prints `42` without `say`.
- **Names are kept** between lines: `name` was still there several lines later.
- **Blocks wait for a blank line.** A line that opens a block — `if`, `else`,
  `while`, `for`, `function` — switches to the `...` prompt. Keep typing the
  indented lines, then leave a blank line to run the block.
- **Errors do not end the session.** The name error was reported, and the REPL
  carried on.

## Commands

Type `help` for a reminder, and `exit`, `quit` or `bye` to leave. Like
everything in LZY, these ignore capital letters. Ctrl+C clears a half-typed
block without leaving.

<!-- lzy:component repl-help -->

## Limits

The REPL uses the same limits as `lzy run`. `lzy --safe repl` starts one with
the tighter limits.

## See also

- [The lzy command](cli.md)
- [Hello World](hello-world.md)
