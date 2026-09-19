# The LZY Language Specification

**Version 0.0.1** — this describes the language as it is actually implemented
today. Anything not described here is not part of LZY yet.

This document and `lzy/` are meant to agree. Where they disagree, that is a
bug in one of them; please report it.

---

## 1. Philosophy

LZY has one rule that everything else follows from:

> **Less syntax, not less understanding.**

A program should say what it does in words a person can read aloud. LZY
removes punctuation and ceremony, not meaning. Where a choice is between
"shorter" and "clearer", LZY picks clearer.

Three consequences show up throughout this document:

1. **No hidden conversions.** `1 + "1"` is an error, not a guess.
2. **No truthiness.** A condition needs a real yes/no value.
3. **One way to say a thing**, until there is a good reason for two.

---

## 2. Source files

| Property | Value |
|---|---|
| Extension | `.lzy` |
| Encoding | UTF-8 |
| Byte order mark | Allowed at the start, ignored |
| Line endings | `\n`, `\r\n` and `\r` are all accepted and normalised to `\n` |

A source file is a sequence of lines. The maximum file size LZY will read is
2,000,000 characters (see [§13 Limits](#13-limits)).

---

## 3. Layout

### 3.1 Lines and statements

One statement per line. There is no statement separator and no semicolon.

```lzy
say "one"
say "two"
```

### 3.2 Blocks and indentation

A block is written by indenting. The line that opens the block ends normally —
there is no `:`, no `{`, and no `then`.

```lzy
if age >= 18
    say "Adult"
    say "Welcome"
```

* **Indentation must use spaces.** A tab in the indentation of a line is an
  error. This is deliberate: tabs look different in different editors, and a
  language that is meant to be read by beginners cannot afford to look
  different depending on where you read it. Four spaces per level is the LZY
  style, but any consistent width works.
* A block must contain at least one statement.
* Blank lines and comment-only lines carry no indentation meaning; they can
  appear anywhere.
* The maximum nesting depth is 64 levels.

### 3.3 Continuation inside brackets

Inside `(`, `[` or `{`, line breaks and indentation carry no meaning, so long
values can be spread over several lines.

```lzy
people = [
    "Ada",
    "Grace",
    "Alan"
]
```

### 3.4 Comments

`#` begins a comment that runs to the end of the line. There are no block
comments.

```lzy
# A whole-line comment.
say "hi"    # A comment at the end of a line.
```

---

## 4. Names and case

**LZY is case-insensitive.** These are all the same name:

```text
total    Total    TOTAL    ToTaL
```

### 4.1 What a name may be

A name starts with a letter or `_`, and continues with letters, digits or `_`.
"Letter" means any Unicode letter, so `café` and `имя` are valid names.

### 4.2 How names are compared

Two names are the same name when their **folded** forms are equal. Folding is:

1. Unicode **NFKC** normalisation, then
2. Unicode **full case folding** (`casefold`, not `lower`).

This is a deliberate choice of a strict, well-defined rule over a simpler one,
and it has consequences worth knowing:

| Written | Written | Same name? | Why |
|---|---|---|---|
| `Total` | `TOTAL` | yes | ordinary case folding |
| `café` (composed) | `café` (decomposed `e` + accent) | yes | NFKC |
| `straße` | `strasse` | **yes** | full case folding maps `ß` to `ss` |
| `K` (Kelvin sign) | `k` | **yes** | NFKC maps the Kelvin sign to `K` |
| `total` | `totals` | no | different names |

The last two rows surprise people, so they are called out here rather than
left to be discovered. If you need two distinct names, do not rely on case or
on Unicode lookalikes to tell them apart.

### 4.3 Spelling is preserved

LZY remembers the spelling you wrote. Error messages, and later the formatter
and editor tooling, show your casing back to you:

```
'Totl' has not been given a value yet.

Maybe you meant:

    Total
```

Only lookups are case-insensitive; display is not.

### 4.4 Map keys are data, not names

Map keys are text values, not identifiers, so they are matched **exactly**.
The one exception is `map.name`, which is a convenience for `map["name"]`:

1. If the map has that key exactly, that key is used.
2. Otherwise, if exactly one key folds to the same name, that key is used.
3. If more than one key folds to the same name, it is an error — LZY will not
   guess between them.

```lzy
person = { "Name": "Ada" }
say person.name       # "Ada"   - one folded match
say person["name"]    # error   - square brackets are always exact
```

---

## 5. Keywords and reserved words

### 5.1 Keywords

```
and       ask       break     continue  else      false     for
function  if        in        not       nothing   or        return
say       true      while
```

Keywords are matched after folding, so `SAY`, `Say` and `say` are one keyword.

### 5.2 Reserved words

These are not keywords yet, but LZY refuses them as names so that adding them
later does not break existing programs:

```
assert   async    await    catch    class    const    delete   do
end      enum     export   extends  finally  implements        import
interface         let      match    module   new      parallel private
public   self     static   struct   super    test     then     this
throw    try      use      var      when     where    with     yield
```

---

## 6. Values and types

LZY has seven types.

| Type | Written as | Examples |
|---|---|---|
| `number` | digits | `0`, `42`, `3.5`, `1_000_000`, `1.5e-2` |
| `text` | quotes | `"hello"`, `'hello'` |
| `truth` | keywords | `true`, `false` |
| `nothing` | keyword | `nothing` |
| `list` | `[ ]` | `[1, 2, 3]`, `[]` |
| `map` | `{ }` | `{ "name": "Ada" }`, `{}` |
| `function` | `function` | see [§10](#10-functions) |

`type(value)` returns the type's name as text.

### 6.1 number

**There is one numeric type.** `6 / 2` and `3` are the same value and print
the same way.

Internally a number is held as a whole number when it can be and as a real
number otherwise, but that distinction is never visible: `4.0 == 4` is `true`,
and `say 4.0` prints `4`. Whole numbers have no size limit; real numbers are
IEEE-754 doubles.

Literals may use `_` as a separator between digits (`1_000_000`), a decimal
point (`3.5`), and an exponent (`1e3`, `1.5e-2`). A number may not be followed
directly by letters.

### 6.2 text

Text is a sequence of Unicode characters, written in `"` or `'` quotes. Text
cannot span lines. Escapes:

| Escape | Meaning |
|---|---|
| `\n` | new line |
| `\t` | tab |
| `\r` | carriage return |
| `\0` | the zero character |
| `\\` | a backslash |
| `\"` `\'` | a quote |
| `\u{...}` | a Unicode character by hexadecimal number, e.g. `\u{1F600}` |

Any other escape is an error.

Text is immutable: `t[0] = "x"` is an error. Build new text instead.

### 6.3 truth

`true` and `false`. Nothing else is a truth value, and nothing is
automatically converted to one — see [§8.4](#84-conditions-need-a-yesno-value).

### 6.4 nothing

`nothing` is the single value meaning "no value". A function that does not
return anything returns `nothing`.

### 6.5 list

An ordered, changeable sequence, counted from `0`. Negative positions count
back from the end, so `items[-1]` is the last item.

```lzy
colours = ["red", "green", "blue"]
say colours[0]      # red
say colours[-1]     # blue
colours[1] = "lime"
```

A list may hold values of different types.

### 6.6 map

A changeable collection of key-and-value pairs that **keeps insertion order**.

Keys may be `text`, `number` or `truth`. A `list`, `map` or `function` cannot
be a key.

```lzy
person = { "name": "Ada", "age": 36 }
say person["name"]
say person.age
person.city = "London"
```

A bare name used as a key is shorthand for its own folded text, so
`{ name: 1 }` means `{ "name": 1 }`.

### 6.7 Sharing and copying

`number`, `text` and `truth` behave as independent values. Lists and maps are
**shared** when stored in another name:

```lzy
a = [1]
b = a
append(b, 2)
say a            # [1, 2]  - a and b are the same list

c = copy(a)      # a separate list
```

---

## 7. Expressions

### 7.1 Precedence

From loosest to tightest. Everything binds left to right except `not` and
unary `-`.

| Level | Operators |
|---|---|
| 1 | `or` |
| 2 | `and` |
| 3 | `not` (prefix) |
| 4 | `==` `!=` `<` `<=` `>` `>=` |
| 5 | `+` `-` |
| 6 | `*` `/` `%` |
| 7 | `-` (prefix) |
| 8 | `f(...)` `x[...]` `x.name` |

### 7.2 Arithmetic

`+` `-` `*` `/` `%` work on two numbers.

* `/` is true division: `7 / 2` is `3.5`, `6 / 2` is `3`.
* `%` is the remainder, taking its sign from the right operand, so
  `-7 % 3` is `2`.
* Dividing by zero, or taking a remainder by zero, is an error.

### 7.3 `+` on other types

`+` also joins two pieces of text, and joins two lists. It does **not** mix
types:

```lzy
say "a" + "b"        # ab
say [1] + [2]        # [1, 2]
say 1 + "1"          # error
```

This is the single most common thing beginners try, so it gets LZY's clearest
error message, including a suggested fix using `text(...)` or `number(...)`.

### 7.4 Comparison

`==` and `!=` compare any two values. **Different types are never equal, and
comparing them is never an error:**

```lzy
say 1 == "1"          # false
say true == 1         # false
say [1, 2] == [1, 2]  # true   - lists compare by their contents
```

`<` `<=` `>` `>=` compare **two numbers** or **two pieces of text** (in code
point order). Anything else is an error.

### 7.5 `and`, `or`, `not`

These take yes/no values and produce yes/no values. `and` and `or`
short-circuit: the right side is not worked out if the left side settles the
answer.

```lzy
say true or missing_name     # true - the right side is never reached
```

### 7.6 `ask`

`ask` reads one line of input and gives it back as text. It may take a prompt.

```lzy
name = ask "What is your name? "
anything = ask
```

**Whatever `ask` reads is data.** It is never run as code.

---

## 8. Statements

### 8.1 `say`

Prints values, separated by a single space, followed by a new line.

```lzy
say "Hello"
say 1, 2, 3          # 1 2 3
say                  # an empty line
```

Text prints without quotes. Inside a list or map, text prints with quotes:

```lzy
say "a"              # a
say ["a"]            # ["a"]
```

### 8.2 Assignment

```lzy
name = "Ada"
items[0] = 1
person.age = 37
```

The left side must be a name, a list position, or a map key.

### 8.3 `if` / `else`

```lzy
if score >= 90
    say "A"
else if score >= 80
    say "B"
else
    say "C"
```

`else if` is two words. There is no `elif`.

### 8.4 Conditions need a yes/no value

`if`, `while`, `and`, `or` and `not` all require `true` or `false`. A number,
some text, a list or `nothing` is an error, with a suggestion:

```
'if' needs a yes/no value, but it was given a number.

Maybe you meant:

    score != 0
```

This is on purpose. Truthiness is a common source of bugs that are hard to
see, and spelling out the comparison costs one short phrase.

### 8.5 `while`

```lzy
while countdown > 0
    say countdown
    countdown = countdown - 1
```

### 8.6 `for`

```lzy
for item in items
    say item
```

`for` walks through a **list** (its items), **text** (its characters), or a
**map** (its keys). Anything else is an error. Use `range(n)` to count.

The list is snapshotted when the loop starts, so adding to it inside the loop
does not make the loop run forever.

### 8.7 `break` and `continue`

`break` leaves the innermost loop. `continue` starts its next turn. Both are
errors outside a loop.

---

## 9. Scope

**Only a function call creates a new scope.** `if`, `for` and `while` bodies
do not:

```lzy
if ready
    message = "yes"
say message          # fine - the block did not hide it
```

Reading a name searches the current scope, then the scopes it was written
inside, then the global scope.

**Storing into a name updates the nearest scope that already has that name.**
If no scope has it, it is created in the current scope:

```lzy
total = 0
function add()
    total = total + 1    # updates the global total
add()
say total                # 1

function f()
    helper = 1           # a new name: local to f
say helper               # error
```

---

## 10. Functions

```lzy
function add(a, b)
    return a + b
```

* A function must be given exactly as many inputs as it has parameters.
* Two parameters cannot have names that fold to the same thing.
* `return` with no value, and reaching the end of the body, both give
  `nothing`.
* Functions are values: they can be stored, passed and returned.
* Functions close over the scope they were written in, so a function returned
  from another function keeps working.

```lzy
function counter()
    count = 0
    function step()
        count = count + 1
        return count
    return step

c = counter()
say c(), c(), c()     # 1 2 3
```

Recursion works, and is limited to 400 calls waiting at once
([§13](#13-limits)).

---

## 11. Built-in functions

All of these are ordinary names in the global scope, so they follow the usual
case rules: `LENGTH`, `Length` and `length` are the same function.

### Values and types

| Function | Gives |
|---|---|
| `type(v)` | the type's name, as text |
| `length(v)` | characters in text, items in a list, keys in a map |
| `text(v)` | any value as text |
| `number(v)` | text turned into a number; an error if it is not one |
| `show(v)` | how a value looks inside a list (text keeps its quotes) |

### Numbers

| Function | Gives |
|---|---|
| `abs(n)` | size, ignoring the sign |
| `round(n)`, `round(n, places)` | nearest value |
| `floor(n)` / `ceiling(n)` | nearest whole number down / up |
| `sqrt(n)` | square root; an error for a negative number |
| `min(...)` / `max(...)` | smallest / largest of the values, or of one list |
| `sum(list)` | total of a list of numbers |
| `random_number(low, high)` | a random whole number, both ends included |

`random_number` uses the operating system's cryptographically secure
generator. There is no seeded generator, so a value that is meant to be
unguessable is unguessable by default.

### Text

| Function | Gives |
|---|---|
| `upper(t)` / `lower(t)` | the same text in capitals / small letters |
| `trim(t)` | the text without spaces at either end |
| `split(t, separator)` | a list; an empty separator splits into characters |
| `join(list, separator)` | one piece of text from a list of text |
| `replace(t, old, new)` | the text with every copy of `old` swapped |
| `starts_with(t, part)` / `ends_with(t, part)` | yes or no |

### Lists and maps

| Function | Gives |
|---|---|
| `range(stop)`, `range(start, stop)`, `range(start, stop, step)` | a list of numbers |
| `append(list, item)` | nothing; adds to the end |
| `remove_at(list, position)` | the item that was removed |
| `sort(list)` | a new list in order (all numbers, or all text) |
| `reverse(list)` | a new list, back to front |
| `copy(list or map)` | a separate copy |
| `contains(list, map or text, item)` | yes or no |
| `find(list or text, item)` | the position, or `nothing` |
| `keys(map)` / `values(map)` | a list |
| `remove_key(map, key)` | the value that was removed |

---

## 12. Errors

Every error LZY reports is meant to answer four questions: **what happened,
where, why, and how to fix it.**

```
Type error in totals.lzy, on line 5.

'+' cannot add a number and text.

    total = total + name
                  ^

LZY keeps numbers and text apart so that '+' always means the same thing.
Use number(...) to add them as numbers, or text(...) to join them as text.

Maybe you meant:

    total + number(name)
```

LZY never shows a Python traceback to a user. `lzy --debug` shows one, for
people working on LZY itself.

Error kinds: `Syntax error`, `Name error`, `Type error`, `Value error`,
`Lookup error`, `Limit reached`, `Input error`.

**There is no way to catch an error in LZY 0.0.1.** Error handling is planned;
see ROADMAP.md.

---

## 13. Limits

LZY refuses work that would otherwise take the interpreter down. Every limit
produces a normal LZY error.

| Limit | Default | `--safe` |
|---|---|---|
| Source file size | 2,000,000 characters | 100,000 |
| Indentation depth | 64 | 32 |
| Bracket depth | 64 | 32 |
| Parser nesting depth | 200 | 100 |
| Function calls waiting at once | 400 | 100 |
| Characters printed by one `say` | 1,000,000 | 100,000 |
| Numbers built by one `range` | 10,000,000 | 10,000,000 |

These are a safety net, not a sandbox. See SECURITY.md.

---

## 14. What LZY does not have yet

Named here so that nobody has to guess. All of these are on the roadmap.

* Error handling (`try` / `catch`)
* Modules and `import`
* Classes and structs
* Files, network, HTTP, processes, databases
* Pattern matching, `where` filters
* `async`, concurrency, parallelism
* Anonymous functions
* `+=` and other compound assignment
* String formatting or interpolation
* A standard library beyond the built-ins in [§11](#11-built-in-functions)
* Keyword names after a dot: `question.ask` will not parse, because `ask` is a
  keyword. Use `question["ask"]`.

---

## 15. Versioning

LZY uses `MAJOR.MINOR.PATCH`.

While the version starts with `0.`, the language may change in ways that break
existing programs. Every such change is written down in CHANGELOG.md, and any
change to what a program means goes through the LEP process first
(`docs/leps/`).

From `1.0.0`, a program that runs on one `1.x` release runs on every later
`1.x` release.
