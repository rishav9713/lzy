# Operators

LZY has arithmetic, comparison and logical operators. Each one means one
thing: `+` adds numbers or joins text or lists, but it never mixes types, and
`and`, `or` and `not` only work on `true` and `false`.

## Arithmetic

| Operator | Works on | Example | Result |
|---|---|---|---|
| `+` | two numbers, two texts, or two lists | `2 + 3`, `"a" + "b"`, `[1] + [2]` | `5`, `ab`, `[1, 2]` |
| `-` | two numbers | `7 - 2` | `5` |
| `*` | two numbers | `6 * 7` | `42` |
| `/` | two numbers | `7 / 2` | `3.5` |
| `%` | two numbers | `7 % 3` | `1` |
| `-` (prefix) | one number | `-x` | the negative |

## Comparison

| Operator | Means | Works on |
|---|---|---|
| `==` | is the same as | any two values |
| `!=` | is not the same as | any two values |
| `<` `<=` `>` `>=` | ordering | two numbers, or two texts |

`==` never fails: values of different types are simply not equal. The
ordering operators only compare two numbers or two pieces of text.

```lzy
say 2 + 3 == 5
say 1 == "1"
say "apple" < "banana"
say [1, 2] != [2, 1]
```

```output
true
false
true
true
```

## Logic

| Operator | Means |
|---|---|
| `and` | both are `true` |
| `or` | at least one is `true` |
| `not` | turns `true` into `false`, and `false` into `true` |

`and` and `or` stop as soon as the answer is known, so the right side is not
worked out when it does not need to be:

```lzy
say true or missing_name
say false and missing_name
say not (1 > 2)
```

```output
true
false
true
```

`missing_name` is never looked up, so there is no error.

## Precedence

From the loosest-binding to the tightest. Operators on the same level work
left to right, except `not` and prefix `-`.

| Level | Operators |
|---|---|
| 1 | `or` |
| 2 | `and` |
| 3 | `not` |
| 4 | `==` `!=` `<` `<=` `>` `>=` |
| 5 | `+` `-` |
| 6 | `*` `/` `%` |
| 7 | `-` (prefix) |
| 8 | calls `f(...)`, positions `x[...]`, keys `x.name` |

```lzy
say 2 + 3 * 4
say (2 + 3) * 4
say not 1 == 2
```

```output
14
20
true
```

Brackets always win. When in doubt, add them: they cost nothing and make the
intent clear.

## What LZY does not have

No `+=` or other compound assignment, no `++`, no integer division operator
(use `floor(a / b)`), no `**` for powers, and no bitwise operators.

## Common mistakes

`=` where `==` was meant:

```lzy-broken
score = 10
if score = 10
    say "ten"
```

```output
Syntax error in program.lzy, on line 2.

A single '=' stores a value, so it cannot be used to test something in an
'if'.

    if score = 10
             ^

Use '==' to check whether two values are the same.
```

Ordering values of different types:

```lzy-broken
say 10 < "20"
```

```output
Type error in program.lzy, on line 1.

LZY can only compare two numbers or two pieces of text with '<', but it was
given a number and some text.

    say 10 < "20"
           ^

Use '==' to check whether two values are the same.
```

Logic on a number:

```lzy-broken
has_items = 3
if has_items and true
    say "yes"
```

```output
Type error in program.lzy, on line 2.

'and' needs a yes/no value, but it was given a number.

    if has_items and true
       ^^^^^^^^^

LZY asks for a clear yes or no here so that a program always means what it
says.

Maybe you meant:

    has_items != 0
```

## See also

- [Conditions](conditions.md)
- [Specification: expressions](../../../SPEC.md#7-expressions)
