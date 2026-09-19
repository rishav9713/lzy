# LZY

**Complex logic. Simple code.**

LZY is an open-source programming language built around one idea: a program
should say what it does in words a person can read aloud.

```lzy
say "Hello World"
```

```lzy
numbers = [10, 20, 30, 40]

total = 0
for number in numbers
    total = total + number

say "Total:", total
```

> **Status: 0.0.1 — early.** The core language works and is tested, but LZY
> has no modules, no error handling, no file or network access, and no
> standard library beyond its built-in functions. It is a good time to read
> it, try it and argue with its design. It is not yet a good time to build
> something important on it. See [PROJECT_STATUS.md](PROJECT_STATUS.md) for
> exactly what does and does not work.

---

## Why LZY

Most languages ask a beginner to learn punctuation before they learn ideas.
Semicolons, braces, `public static void`, `if __name__ == "__main__"` — none
of it is the thing they came to learn.

LZY takes that away without taking away the power. Its guiding rule is:

> **Less syntax, not less understanding.**

That means LZY removes ceremony, not meaning:

- **No hidden conversions.** `1 + "1"` is an error, not a guess.
- **No truthiness.** `if count` is an error; `if count != 0` says what you mean.
- **Errors that teach.** Every error says what happened, where, why, and what
  to try instead.

LZY is not trying to be the shortest language. It is trying to be the one you
can still read six months later.

---

## Design philosophy

**Simple syntax → readable code → powerful abstractions → complex
functionality → low cognitive overhead.**

Four decisions follow from it, and they are the ones people notice first:

| Decision | Why |
|---|---|
| **Case-insensitive** | `total`, `Total` and `TOTAL` are one name. A learner should not lose an afternoon to a capital letter. |
| **Indentation, no braces** | The shape of the code on the page is the shape of the program. |
| **One number type** | `6 / 2` is `3`. There is no int-versus-float trap to fall into. |
| **Strict about types** | The language would rather say "I do not know what you meant" than quietly do the wrong thing. |

The reasoning behind each is written up in [SPEC.md](SPEC.md), including the
parts that are genuinely debatable.

---

## Who is it for

- **Someone learning to program**, including a child, who needs the language
  to get out of the way.
- **A teacher** who wants to show an idea without first explaining boilerplate.
- **An experienced developer** who wants scripts that read like notes.
- **A security or operations engineer** automating log analysis, checks and
  reporting — LZY is general-purpose, and its defensive-tooling examples are
  in [`examples/04-security/`](examples/04-security/).

---

## Installing

LZY needs **Python 3.9 or newer** and nothing else — the interpreter uses only
the Python standard library.

```bash
git clone https://github.com/rishav9713/lzy
cd lzy
pip install -e .
```

Then:

```bash
lzy --version
lzy repl
```

You can also run it without installing:

```bash
python -m lzy examples/01-beginner/hello.lzy
```

---

## Hello World

Put this in `hello.lzy`:

```lzy
say "Hello World"
```

Run it:

```bash
lzy hello.lzy
```

---

## Using the `lzy` command

```bash
lzy hello.lzy          # run a program
lzy run hello.lzy      # the same thing, written out
lzy check hello.lzy    # look for mistakes without running it
lzy repl               # try LZY one line at a time
lzy --safe program.lzy # run with tighter limits
lzy --version
lzy --help
```

---

## A tour in four programs

### A beginner program

```lzy
name = ask "What is your name? "

say "Hello " + name + "!"

if length(name) > 8
    say "That is a long name."
else
    say "That is a short name."
```

### An algorithm

Binary search, from [`examples/02-algorithms/searching.lzy`](examples/02-algorithms/searching.lzy):

```lzy
function binary_search(sorted_items, wanted)
    low = 0
    high = length(sorted_items) - 1

    while low <= high
        middle = floor((low + high) / 2)
        found = sorted_items[middle]

        if found == wanted
            return middle
        else if found < wanted
            low = middle + 1
        else
            high = middle - 1

    return nothing

say binary_search([1, 3, 5, 7, 9, 11, 13], 7)     # 3
```

### An application

From [`examples/03-applications/todo-list.lzy`](examples/03-applications/todo-list.lzy):

```lzy
jobs = []

function add_job(list_of_jobs, title)
    append(list_of_jobs, { "title": title, "done": false })

function finish_job(list_of_jobs, title)
    for job in list_of_jobs
        if job.title == title
            job.done = true
            return true
    return false

add_job(jobs, "Write the lexer")
finish_job(jobs, "Write the lexer")

for job in jobs
    if job.done
        say "[x] " + job.title
    else
        say "[ ] " + job.title
```

### Defensive security automation

From [`examples/04-security/log-analyser.lzy`](examples/04-security/log-analyser.lzy),
which counts failed logins per source address and flags the ones worth a
person's attention:

```lzy
failures = {}

for line in log_lines
    source = field_after(line, "from")
    if source == nothing
        continue

    if contains(line, "Failed password")
        if contains(failures, source)
            failures[source] = failures[source] + 1
        else
            failures[source] = 1

for address in sort(keys(failures))
    if failures[address] >= alert_threshold
        say "[high] " + text(failures[address]) + " failed logins from " + address
```

LZY is a general-purpose language. Its security examples are written for
defensive and authorised work: analysing logs you already hold, checking
configuration, and turning alerts into something a person can act on.

---

## Errors

Error messages are treated as a language feature, not an afterthought.

```lzy
total = 0
name = "Ada"
say total + name
```

```
Type error in totals.lzy, on line 3.

'+' cannot add a number and text.

    say total + name
              ^

LZY keeps numbers and text apart so that '+' always means the same thing.
Use number(...) to add them as numbers, or text(...) to join them as text.

Maybe you meant:

    total + number(name)
```

LZY never shows a Python traceback to someone writing LZY.

---

## What works today

**Working and tested:** variables, all seven types, arithmetic and comparison,
`if`/`else if`/`else`, `while`, `for`, `break`, `continue`, functions,
recursion, closures, first-class functions, lists, maps, 33 built-in
functions, `say`, `ask`, the `lzy` command, and the REPL.

**Not there yet:** error handling, modules, classes, files, network, HTTP,
databases, concurrency, a standard library, a formatter, a linter, a package
manager, and editor support.

The full, honest list is in [PROJECT_STATUS.md](PROJECT_STATUS.md), and
[SPEC.md §14](SPEC.md#14-what-lzy-does-not-have-yet) names every gap.

---

## Roadmap

| Version | Focus |
|---|---|
| **0.0.1** | Language foundation — *this release* |
| 0.1.0 | Error handling, a formatter, and the core language declared stable |
| 0.2.0 | Modules and a real standard library |
| 0.3.0 | Files, JSON, HTTP, and applications |
| 0.5.0 | Bytecode and a virtual machine |
| 0.9.0 | Feature freeze |
| 1.0.0 | A stable specification |

[ROADMAP.md](ROADMAP.md) has the detail, including what has to be true before
each one ships.

---

## Documentation

- [SPEC.md](SPEC.md) — the language, defined
- [docs/spec/grammar.ebnf](docs/spec/grammar.ebnf) — the formal grammar
- [docs/learn/](docs/learn/) — a guided course, from the first program upward
- [examples/](examples/) — 22 runnable programs, every one covered by a test
- [docs/leps/](docs/leps/) — proposals for changes to the language
- [docs/OWNER_DECISIONS.md](docs/OWNER_DECISIONS.md) — decisions taken, and why

---

## Development

```bash
git clone https://github.com/rishav9713/lzy
cd lzy
pip install -e ".[dev]"

pytest                                  # the whole suite
pytest tests/lexer -v                   # one area
coverage run -m pytest && coverage report
ruff check .                            # linting

python tools/record_examples.py         # check every example still prints what it claims
```

The interpreter is a straightforward pipeline, and the code is meant to be
read in this order:

```
source → lzy/lexer → lzy/parser → lzy/ast → lzy/interpreter → output
```

[CONTRIBUTING.md](CONTRIBUTING.md) explains the layout, the standards, and how
a language change gets proposed.

---

## Security

LZY 0.0.1 has no file, network or process access, and its hard limits on
recursion, nesting and input size are tested against malformed and hostile
input. That is a starting point, not a sandbox: **do not run untrusted LZY
outside proper isolation.**

Please report vulnerabilities privately — see [SECURITY.md](SECURITY.md).

---

## Contributing

Contributions are welcome, especially:

- language design arguments, backed by examples
- error messages that could be clearer
- tests for behaviour that is not covered
- documentation that explains something better

Start with [CONTRIBUTING.md](CONTRIBUTING.md) and
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

## License

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

Apache-2.0 was chosen over MIT for its explicit patent grant, which
matters more for a programming language than the brevity of MIT does.
The reasoning is recorded in
[docs/OWNER_DECISIONS.md](docs/OWNER_DECISIONS.md#d-001-licence-apache-20).
