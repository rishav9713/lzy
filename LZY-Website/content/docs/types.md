# Types and values

Every value in LZY has one of seven types. LZY never converts between them
behind your back: a number stays a number until you turn it into text with
`text()`, and text stays text until you turn it into a number with
`number()`.

## The seven types

| Type | Written as | Examples |
|---|---|---|
| `number` | digits | `0`, `42`, `3.5`, `1_000_000`, `1.5e-2` |
| `text` | quotes | `"hello"`, `'hello'` |
| `truth` | keywords | `true`, `false` |
| `nothing` | keyword | `nothing` |
| `list` | `[ ]` | `[1, 2, 3]`, `[]` |
| `map` | `{ }` | `{ "name": "Ada" }`, `{}` |
| `function` | `function` | any function, including built-ins |

## Example

```lzy
say type(36)
say type("Ada")
say type(true)
say type(nothing)
say type([1, 2])
say type({ "a": 1 })
say type(length)
```

```output
number
text
truth
nothing
list
map
function
```

## No hidden conversions

`+` adds two numbers or joins two pieces of text. It will not do both at once,
and it will not guess which you meant:

```lzy
age = 36
say "I am " + text(age)
say number("40") + 2
```

```output
I am 36
42
```

## No truthiness

`if`, `while`, `and`, `or` and `not` need a real `true` or `false`. A number,
some text, a list or `nothing` is not quietly treated as one. Write the
comparison you mean:

```lzy
count = 0
if count == 0
    say "none yet"
```

```output
none yet
```

## Comparing values

`==` and `!=` work on any two values. Values of different types are never
equal, and comparing them is never an error:

```lzy
say 1 == "1"
say 4.0 == 4
say [1, 2] == [1, 2]
say nothing == false
```

```output
false
true
true
false
```

## Lists and maps are shared

Numbers, text and truth values behave as separate copies. Lists and maps are
*shared* when you store them in another name, so a change through one name is
seen through the other. Use `copy()` when you want a separate one:

```lzy
a = [1]
b = a
append(b, 2)
say a

c = copy(a)
append(c, 3)
say a
say c
```

```output
[1, 2]
[1, 2]
[1, 2, 3]
```

`copy()` is shallow: a list inside the copied list is still shared.

## Common mistakes

Mixing numbers and text with `+`. Here the text holds digits, so the
suggestion to use `number()` is the right one:

```lzy-broken
total = 10
extra = "5"
say total + extra
```

```output
Type error in program.lzy, on line 3.

'+' cannot add a number and text.

    say total + extra
              ^

LZY keeps numbers and text apart so that '+' always means the same thing. Use
number(...) to add them as numbers, or text(...) to join them as text.

Maybe you meant:

    total + number(extra)
```

Using a number as a condition:

```lzy-broken
count = 0
if count
    say "some"
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

## See also

- [Numbers](numbers.md), [Text](text.md), [Lists](lists.md), [Maps](maps.md)
- [Specification: values and types](../../../SPEC.md#6-values-and-types)
