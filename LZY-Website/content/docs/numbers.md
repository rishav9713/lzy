# Numbers

LZY has one kind of number. There is no separate integer and float type to
choose between: `6 / 2` is `3`, `7 / 2` is `3.5`, and `4.0` is the same value
as `4`.

## Syntax

```text
42          whole number
3.5         with a decimal point
1_000_000   underscores between digits, for readability
1e3         with an exponent: 1000
1.5e-2      0.015
```

A number may not be followed directly by letters, so `3kg` is an error.

## Example

```lzy
say 6 / 2
say 7 / 2
say 4.0 == 4
say 1_000_000
say 1.5e-2
```

```output
3
3.5
true
1000000
0.015
```

## Arithmetic

| Operator | Meaning | Example | Result |
|---|---|---|---|
| `+` | add | `7 + 2` | `9` |
| `-` | subtract | `7 - 2` | `5` |
| `*` | multiply | `7 * 2` | `14` |
| `/` | divide | `7 / 2` | `3.5` |
| `%` | remainder | `7 % 2` | `1` |

`/` is always true division. There is no integer-division operator; use
`floor(a / b)`. The remainder takes its sign from the right-hand number, so
`-7 % 3` is `2`.

```lzy
say floor(7 / 2)
say -7 % 3
say 7 % -3
```

```output
3
2
-2
```

## Whole numbers are exact

Internally a number is held as a whole number when it can be, and whole
numbers have no size limit:

```lzy
say 2 * 1000000000000 * 1000000000000
```

```output
2000000000000000000000000
```

Numbers with a fractional part are IEEE-754 double-precision values, like in
most languages, so some decimals cannot be represented exactly:

```lzy
say 0.1 + 0.2
say round(0.1 + 0.2, 2)
```

```output
0.30000000000000004
0.3
```

## Rounding

| Function | Gives |
|---|---|
| `round(n)` | the nearest whole number |
| `round(n, places)` | rounded to that many decimal places |
| `floor(n)` | the nearest whole number at or below `n` |
| `ceiling(n)` | the nearest whole number at or above `n` |

```lzy
say round(3.14159, 2)
say floor(-2.5)
say ceiling(-2.5)
say round(1234, -2)
```

```output
3.14
-3
-2
1200
```

`round` rounds exact halves to the nearest even number, so `round(2.5)` is
`2` and `round(3.5)` is `4`:

```lzy
say round(2.5)
say round(3.5)
```

```output
2
4
```

## Other number functions

`abs`, `sqrt`, `min`, `max`, `sum` and `random_number`. They are all in the
[built-in functions reference](stdlib.md). `random_number(low, high)` uses the
operating system's secure random generator, and includes both ends.

## Turning text into a number

`number()` reads a number out of text. It ignores spaces at either end:

```lzy
answer = " 42 "
say number(answer) + 1
```

```output
43
```

## Common mistakes

Dividing by zero:

```lzy-broken
say 10 / 0
```

```output
Value error in program.lzy, on line 1.

LZY cannot divide by zero.

    say 10 / 0
           ^

Check the value on the right of the '/' before dividing.
```

Text that is not a number:

```lzy-broken
say number("forty")
```

```output
Value error in program.lzy, on line 1.

"forty" is not something LZY can read as a number.

    say number("forty")
        ^^^^^^

Text like "42" or "3.5" works; text like "forty" does not.
```

Arithmetic on text:

```lzy-broken
say "3" * 2
```

```output
Type error in program.lzy, on line 1.

'*' works on numbers, but it was given some text.

    say "3" * 2
            ^

Use number() to turn text into a number first.
```

## See also

- [Operators](operators.md)
- [Specification: number](../../../SPEC.md#61-number)
