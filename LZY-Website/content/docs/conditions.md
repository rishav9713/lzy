# Conditions

`if` runs a block only when a condition is `true`. `else if` tries another
condition, and `else` catches everything left. The condition must be a real
`true` or `false`: LZY does not treat `0`, empty text or an empty list as
false.

## Syntax

```text
if condition
    statements
else if condition
    statements
else
    statements
```

`else if` is two words. There is no `elif`, no `:` and no `then`.

## Example

```lzy
score = 85

if score >= 90
    say "A"
else if score >= 80
    say "B"
else if score >= 70
    say "C"
else
    say "Try again"
```

```output
B
```

LZY checks each condition in turn and runs the first block whose condition is
true. The rest are skipped.

## Combining conditions

```lzy
age = 25
has_ticket = true

if age >= 18 and has_ticket
    say "Come in"

if age < 5 or age > 65
    say "Reduced price"

if not has_ticket
    say "You need a ticket"
```

```output
Come in
```

## Yes/no values can be stored

A comparison produces `true` or `false`, which you can keep in a name:

```lzy
age = 20
is_adult = age >= 18
say is_adult

if is_adult
    say "Adult"
```

```output
true
Adult
```

## Say what you are testing

In some languages `if count` quietly means `if count is not zero`. In LZY it
is an error, with a suggestion:

```lzy-broken
count = 0
if count
    say "something"
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

This is on purpose. `if count != 0` says what it tests, and it is only a few
more characters. See the reasoning in the
[design decisions](../../../docs/OWNER_DECISIONS.md#d-003-conditions-require-a-real-yesno-value).

## Blocks do not hide names

A name set inside an `if` is still there afterwards:

```lzy
ready = true
if ready
    message = "yes"
say message
```

```output
yes
```

## Common mistakes

`=` instead of `==`:

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

`elif` from another language:

```lzy-broken
x = 2
if x == 1
    say "one"
elif x == 2
    say "two"
```

```output
Syntax error in program.lzy, on line 4.

LZY does not have a 'elif' instruction.

    elif x == 2
    ^^^^

Write 'else if' as two words.

Maybe you meant:

    else if
```

Text as a condition:

```lzy-broken
name = "Ada"
if name
    say "has a name"
```

```output
Type error in program.lzy, on line 2.

'if' needs a yes/no value, but it was given some text.

    if name
       ^^^^

LZY asks for a clear yes or no here so that a program always means what it
says.

Maybe you meant:

    name != ""
```

## See also

- [Operators](operators.md)
- [Specification: conditions need a yes/no value](../../../SPEC.md#84-conditions-need-a-yesno-value)
