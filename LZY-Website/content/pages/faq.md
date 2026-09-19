# Frequently asked questions

Short answers to the questions people ask first, with links to the long ones.
Something missing? Ask on
[GitHub Discussions](https://github.com/rishav9713/lzy/discussions).

<!-- lzy:accordion -->

## About LZY

### What is LZY?

An open-source, general-purpose programming language built around one idea:
a program should say what it does in words a person can read aloud. It is
case-insensitive, uses indentation instead of braces, has one kind of number,
and refuses to guess when a program is ambiguous. See the
[introduction](../docs/introduction.md).

### Why was LZY created?

Because most languages ask a beginner to learn punctuation before ideas. LZY
removes ceremony — semicolons, braces, boilerplate — without removing
meaning. Its rule is *less syntax, not less understanding*: where a choice is
between shorter and clearer, LZY picks clearer.

### What does LZY stand for?

Lazy: it is the Lazy Programming Language, which is why its mascot is a
sloth. The laziness is about ceremony, not understanding — LZY removes
punctuation and boilerplate, but it does not remove meaning.

### Is LZY open source? Is it free?

Yes and yes. LZY is released under the
[Apache License 2.0](/license/), which allows commercial use, modification
and distribution, and includes an explicit patent grant.

## Using LZY

### What platforms does LZY run on?

Anywhere Python 3.9 or newer runs. It is tested on Windows, macOS and Linux
with every Python version from 3.9 to 3.13. See [Download](/download/).

### How do I install LZY?

With pipx or pip, from the latest GitHub release, or from source. LZY is not
on PyPI. The [installation page](install.md) has the commands.

### Is LZY production ready?

No. LZY is at version 0.0.x. The core language works and is well tested, but
it has no error handling, no modules, and no file or network access, and the
language may still change in ways that break programs. It is a good time to
learn it, teach with it and argue with its design; it is not yet a good time
to build something important on it. See [Not in LZY yet](../docs/not-yet.md).

### Is LZY fast?

It is not trying to be. LZY is a tree-walking interpreter written in Python,
and its roadmap explicitly says it optimises for reading, not speed. A
bytecode virtual machine is planned for 0.5.0, and its speed-up will be
published with the method used to measure it. No benchmarks have been
published yet.

### Can I use LZY for security tooling?

For defensive analysis of data you already hold, within limits: the examples
include a log analyser, an indicator extractor and a passphrase checker. But
LZY cannot read files or use the network yet, so data must be written into
the program or typed in. See [use cases](/use-cases/).

### Can I run LZY in the browser?

Not yet. A browser playground is planned for 0.4.0, once LZY code can run in
real isolation. The [playground page](/playground/) lets you write LZY with
highlighting and take it to your terminal.

### Is there editor support?

Not yet. A VS Code extension and a language server are planned for 0.4.0.
Until then, any text editor works; set it to indent with spaces.

## Getting involved

### How do I report a bug?

Open an [issue](https://github.com/rishav9713/lzy/issues/new/choose) with the
smallest program that shows the problem, what you expected, what happened,
and `lzy --version`. Security problems go through
[private reporting](/security/) instead.

### How can I request a feature?

Open a [language idea](https://github.com/rishav9713/lzy/issues/new?template=language_idea.yml)
issue with real code showing what is awkward today. Changes to the language
itself go through a written proposal — see
[language proposals](../../../docs/leps/README.md).

### How do I contribute?

Read [Contributing](../../../CONTRIBUTING.md). Clearer error messages, tests,
examples and levels of the learning course are especially wanted, and none of
them needs deep knowledge of the interpreter.

## Comparisons

### How does LZY compare with Python?

LZY is implemented in Python, and the two look similar: both use indentation
and `#` comments. LZY differs on purpose in a few places — names ignore case,
there is one number type, there is no truthiness, and `if` needs no `:`. LZY
is far smaller and far younger, and is not trying to replace Python. See
[the language at a glance](language.md#compared-with-languages-you-may-know).

### How does LZY compare with JavaScript?

JavaScript converts between types freely, so `1 + "1"` is `"11"`. LZY
refuses, and says why. LZY uses indentation where JavaScript uses braces, and
has no `null` versus `undefined` distinction — only `nothing`.

### Is LZY a replacement for anything?

No. The roadmap says so directly: LZY is not a competitor to Python,
JavaScript or anything else. It is for people who want to read their own
code.
