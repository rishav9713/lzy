# Installation

LZY is a Python program with no dependencies, so installing it means
installing one small Python package. It works on Windows, macOS and Linux,
with Python 3.9 or newer. LZY is **not** on PyPI: install it from a GitHub
release, or from the source.

## The short version

<!-- lzy:component install-commands -->

Then check it:

<!-- lzy:component version-check -->

## Before you start: Python

LZY needs Python 3.9 or newer. Check which you have:

```bash
python --version
```

On macOS and most Linux distributions the command is `python3`. If Python is
missing or older than 3.9, install a current version from
[python.org](https://www.python.org/downloads/) or your system's package
manager.

The recommended way to install LZY is [pipx](https://pipx.pypa.io/), which
installs command-line tools into their own environment and puts them on your
PATH:

```bash
python -m pip install --user pipx
python -m pipx ensurepath
```

Open a new terminal after `ensurepath` so the PATH change takes effect.

## Windows

In PowerShell or Command Prompt, install pipx as above, then use the pipx
command from [the short version](#the-short-version).

Without pipx, `py -m pip install` followed by the release address works too.
If Windows then says `lzy` is not recognised, the folder pip installs
commands into is not on your PATH; `py -m lzy` runs LZY anyway. See
[troubleshooting](troubleshooting.md#lzy-command-not-found).

CI tests LZY on Windows with every supported Python version.

## macOS

Install Python from python.org or with Homebrew, then use pipx. Homebrew's
Python refuses a plain `pip install` outside a virtual environment, with an
"externally managed environment" error; pipx avoids that.

```bash
brew install pipx
pipx ensurepath
```

Then install LZY with the pipx command above.

## Linux

Most distributions ship Python 3. Install pipx from the package manager — for
example `sudo apt install pipx` on Debian and Ubuntu, or `sudo dnf install
pipx` on Fedora — then install LZY with the pipx command above.

Recent distributions refuse `pip install` outside a virtual environment. Use
pipx, or a virtual environment:

```bash
python3 -m venv ~/.venvs/lzy
~/.venvs/lzy/bin/python -m pip install --upgrade pip
```

then install the release into it with `~/.venvs/lzy/bin/python -m pip
install` and the address from the short version above.

## From source

To get the latest code on `main`, or to work on LZY itself:

```bash
git clone https://github.com/rishav9713/lzy
cd lzy
python -m pip install -e .
```

`-e` installs it *editable*: changes you make to the code take effect without
reinstalling. For the test and lint tools too, install `.[dev]` instead of
`.`, and see [Contributing](../../../CONTRIBUTING.md).

## Without installing

From a copy of the repository, `python -m lzy` runs LZY directly:

```bash
python -m lzy examples/01-beginner/hello.lzy
```

## Package managers and Docker

LZY is not available from PyPI, Homebrew, winget, apt or any other package
manager, and there is no official Docker image. A package on PyPI with a
similar name is not this project. See [Download](/download/) for every way to
get LZY that does exist.

## Check that it works

```bash
lzy --version
lzy repl
```

`lzy --version` prints the version. `lzy repl` starts an interactive
session; type `say "hello"`, press Enter, then type `exit`.

## Verify the download

Each release publishes SHA-256 checksums alongside its files. See
[Download](/download/#verify) for the command on each system.

## Upgrading and removing

Install a newer release the same way you installed this one; pipx and pip
replace the old version. To remove LZY:

```bash
pipx uninstall lzy-lang
```

or `python -m pip uninstall lzy-lang` if you used pip. The package is named
`lzy-lang`; the command it installs is `lzy`.

## If something goes wrong

The most common problems — `lzy` not found, an old Python, the "externally
managed environment" error — are covered in
[troubleshooting](troubleshooting.md).
