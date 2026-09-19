# Troubleshooting

Solutions to the problems people actually run into, from installing LZY to
getting a program to run. Each one gives the problem, the likely cause, and
what to do. If yours is not here, see [Debugging](debug.md) or ask on
[GitHub Discussions](https://github.com/rishav9713/lzy/discussions).

## Installing

### lzy: command not found

**Problem.** After installing, the terminal says `lzy: command not found`,
or on Windows, `'lzy' is not recognized as an internal or external command`.

**Possible cause.** The folder where pip or pipx puts commands is not on your
PATH, or the terminal was opened before the install changed it.

**Solution.** Open a new terminal first. If you used pipx, run
`pipx ensurepath` and open another new terminal. Either way, `python -m lzy`
(or `py -m lzy` on Windows) runs LZY without needing the `lzy` command:

```bash
python -m lzy --version
```

### error: externally-managed-environment

**Problem.** `pip install` refuses with an "externally managed environment"
error.

**Possible cause.** Recent Linux distributions and Homebrew's Python stop
pip from installing into the system Python, to protect it.

**Solution.** Install with [pipx](https://pipx.pypa.io/), which is what it
is for, or into a virtual environment. Both are shown on the
[installation page](install.md).

### Python is too old

**Problem.** pip says LZY `requires a different Python`, or no matching
version is found.

**Possible cause.** LZY needs Python 3.9 or newer.

**Solution.** Check with `python --version`, and install a current Python
from [python.org](https://www.python.org/downloads/) if needed. Several
versions can be installed side by side.

### pip install lzy-lang finds nothing, or the wrong thing

**Problem.** Installing by name does not work, or installs something that is
not LZY.

**Possible cause.** LZY is not published on PyPI. Installing by name looks
there.

**Solution.** Install from the GitHub release address or from source, as on
the [installation page](install.md). Do not install a similarly named
package from PyPI: it is not this project.

### Permission denied while installing

**Problem.** pip fails with a permission error.

**Possible cause.** It is trying to write into a system folder.

**Solution.** Do not use `sudo pip`. Use pipx or a virtual environment,
which install into folders you own.

## Running programs

### LZY could not find this file

**Problem.** `lzy program.lzy` says it could not find the file.

**Possible cause.** The terminal is in a different folder, or the name is
spelled differently. If you left off `.lzy` and a file with that extension
exists, LZY says so.

**Solution.** Check which folder you are in, and use the full path if
needed. On Windows, file explorer may hide extensions, so a file you named
`program.lzy` could really be `program.lzy.txt`.

### This file is not text that LZY can read

**Problem.** LZY refuses a file as not being text.

**Possible cause.** The file is not saved as UTF-8, or it is not a text file
at all — a word-processor document, for example.

**Solution.** Save the program from a plain-text editor, as UTF-8.

### The program waits and does nothing

**Problem.** A program seems to hang.

**Possible cause.** It is waiting at an `ask` for you to type something, or
it is in a `while` loop whose condition never becomes `false`.

**Solution.** If it is an `ask`, type an answer and press Enter. If it is a
loop, press Ctrl+C to stop it, then check that something inside the loop
changes its condition. LZY has no time limit on loops.

### There was no answer to read

**Problem.** A program stops with an `Input error` at an `ask`.

**Possible cause.** Nothing was there to type an answer — for example the
program was run from a script, or its input was piped in and ran out.

**Solution.** Run it in a terminal where you can type, or pipe in one line
per `ask`.

## Syntax errors

### This line is indented with a tab

**Problem.** LZY refuses a line indented with a tab.

**Possible cause.** Your editor inserts tab characters.

**Solution.** Set your editor to indent with spaces — four per level is the
LZY style. Many editors have a "convert indentation to spaces" command.

### The if needs an indented block under it

**Problem.** LZY says a line needs an indented block.

**Possible cause.** The line after `if`, `else`, `while`, `for` or
`function` is not indented further than it.

**Solution.** Indent the lines that belong to it:

```lzy
if true
    say "indented, so it belongs to the if"
```

### A single = cannot be used to test something

**Problem.** An `if` with `=` is refused.

**Possible cause.** `=` stores a value; `==` compares.

**Solution.** Use `==`: `if score == 10`.

### LZY does not have an elif instruction

**Problem.** `elif` is not recognised.

**Solution.** Write `else if` as two words.

### A word LZY keeps for a future version

**Problem.** A name such as `class`, `import`, `match` or `test` is refused.

**Possible cause.** It is a reserved word. See the
[full list](../docs/keywords.md).

**Solution.** Use a different name, such as `my_class` or `test_score`.

## Errors while running

### cannot add a number and text

**Problem.** `+` refuses to join a number and text.

**Solution.** Turn the number into text with `text(...)`, or the text into
a number with `number(...)`, depending on which you meant. See
[Types and values](../docs/types.md).

### needs a yes/no value

**Problem.** `if`, `while`, `and`, `or` or `not` refuses a number, text or
list.

**Solution.** Write the comparison you mean: `if count != 0`,
`if name != ""`, `if length(items) > 0`.

### has not been given a value yet

**Problem.** A name is used before it has a value.

**Possible cause.** A typo — LZY suggests the closest name it knows — or a
name that was only created inside a function.

**Solution.** Check the spelling, and see [Scope](../docs/scope.md).

### called itself too many times

**Problem.** A recursive function stops with `Limit reached`.

**Possible cause.** It has no case where it stops calling itself, or it goes
deeper than LZY allows.

**Solution.** Make sure every path eventually returns without calling itself
again. For very deep work, use a loop instead.

## Platform notes

### Windows: Python opens the Microsoft Store

**Problem.** Typing `python` opens the Microsoft Store instead of running
Python.

**Solution.** Install Python from python.org, which includes the `py`
launcher, and use `py -m pip` and `py -m lzy`.

### macOS and Linux: python means Python 2, or is missing

**Problem.** `python --version` shows Python 2, or nothing.

**Solution.** Use `python3`, which is how most macOS and Linux systems name
Python 3.

## Still stuck?

- Search the [existing issues](https://github.com/rishav9713/lzy/issues).
- Ask on [GitHub Discussions](https://github.com/rishav9713/lzy/discussions).
- If LZY is wrong, [report a bug](https://github.com/rishav9713/lzy/issues/new?template=bug_report.yml),
  following the steps in [Debugging](debug.md#reporting-a-bug).
