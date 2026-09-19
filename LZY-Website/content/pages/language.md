# The language at a glance

All of LZY on one page, for readers who already program. Each section links
to the full guide page. Every example here was run to produce the output
shown beneath it.

## A program

A program is a `.lzy` file of statements, one per line. Blocks are made by
indenting with spaces, `#` starts a comment, and names ignore case.

```lzy
# Comments start with a hash.
greeting = "Hello"
if length(greeting) > 3
    say greeting, "World"
```

```output
Hello World
```

[Syntax and layout](../docs/syntax.md) · [Names and case](../docs/names.md)

## Values

Seven types: `number`, `text`, `truth`, `nothing`, `list`, `map` and
`function`. One numeric type; no implicit conversions; no truthiness.

```lzy
say 7 / 2, 6 / 2, 4.0 == 4
say "text", 'also text', "tab\there"
say true, false, nothing
say [1, "two", [3]]
say { "name": "Ada", "age": 36 }
```

```output
3.5 3 true
text also text tab	here
true false nothing
[1, "two", [3]]
{ "name": "Ada", "age": 36 }
```

[Types and values](../docs/types.md) · [Numbers](../docs/numbers.md) ·
[Text](../docs/text.md)

## Variables

```lzy
count = 1
count = count + 1
Count = Count * 10
say count
```

```output
20
```

`=` stores; there is no declaration keyword and no `+=`.
[Variables](../docs/variables.md)

## Operators

| Kind | Operators |
|---|---|
| Arithmetic | `+ - * / %`, and prefix `-` |
| Comparison | `== != < <= > >=` |
| Logic | `and or not`, which short-circuit |
| Joining | `+` on two texts or two lists |

```lzy
say 2 + 3 * 4, (2 + 3) * 4, 7 % 3
say "ab" + "cd", [1] + [2]
say 1 == "1", "a" < "b", not (1 > 2)
```

```output
14 20 1
abcd [1, 2]
false true true
```

[Operators](../docs/operators.md)

## Conditions

```lzy
temperature = 12
if temperature > 25
    say "hot"
else if temperature > 10
    say "mild"
else
    say "cold"
```

```output
mild
```

Conditions must be `true` or `false`. [Conditions](../docs/conditions.md)

## Loops

```lzy
for n in range(3)
    say "for", n

n = 3
while n > 0
    n = n - 1
    if n == 1
        continue
    say "while", n
```

```output
for 0
for 1
for 2
while 2
while 0
```

`for` walks a list, text or map; `break` and `continue` work in both.
[Loops](../docs/loops.md)

## Functions

```lzy
function greet(name, greeting)
    return greeting + ", " + name + "!"

function make_multiplier(factor)
    function multiply(n)
        return n * factor
    return multiply

triple = make_multiplier(3)
say greet("Ada", "Hello")
say triple(14)
```

```output
Hello, Ada!
42
```

Recursion, closures and passing functions around all work. There are no
anonymous functions yet. [Functions](../docs/functions.md) ·
[Scope](../docs/scope.md)

## Lists and maps

```lzy
colours = ["red", "green"]
append(colours, "blue")
say colours[0], colours[-1], length(colours)

person = { "name": "Ada" }
person.age = 36
say person.name, person["age"], keys(person)
```

```output
red blue 3
Ada 36 ["name", "age"]
```

Lists and maps are shared, not copied, when stored in another name.
[Lists](../docs/lists.md) · [Maps](../docs/maps.md)

## Input and output

```lzy
say "Several values", 1, [2], "separated by spaces"
```

```output
Several values 1 [2] separated by spaces
```

`ask "question? "` reads a line of input as text.
[Input and output](../docs/input-output.md)

## Built-in functions

`type length text number show abs round floor ceiling sqrt min max sum
random_number upper lower trim split join replace starts_with ends_with range
append remove_at contains keys values remove_key sort reverse copy find`

[Built-in functions](../docs/stdlib.md)

## Errors

Every error says what happened, where, why, and how to fix it. There is no
`try` / `catch` yet: an error stops the program.

```lzy-broken
count = 0
if count
    say "none"
```

```output
Type error in program.lzy, on line 2.

'if' needs a yes/no value, but it was given a number.

    if count
       ^^^^^

LZY asks for a clear yes or no here so that a program always means what it
says.

Maybe you meant:

    count != 0
```

[Errors](../docs/errors.md)

## Compared with languages you may know

A few differences that trip up people coming from Python or JavaScript.
These are differences, not claims that one approach is better.

| Feature | LZY | Python | JavaScript |
|---|---|---|---|
| Blocks | indentation, no `:` | indentation and `:` | braces |
| Case in names | ignored | significant | significant |
| Print | `say x` | `print(x)` | `console.log(x)` |
| Number types | one | `int` and `float` | one (plus `BigInt`) |
| `7 / 2` | `3.5` | `3.5` | `3.5` |
| `1 + "1"` | error | error | `"11"` |
| `if 0` | error | false | false |
| `else if` | `else if` | `elif` | `else if` |
| Comments | `#` | `#` | `//` |
| Empty value | `nothing` | `None` | `null` / `undefined` |
| Semicolons | none | none | optional |

## The full definition

This page is a summary. The complete, precise definition of the language is
the [specification](../../../SPEC.md), with its
[formal grammar](../../../docs/spec/grammar.ebnf).
