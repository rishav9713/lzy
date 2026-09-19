# Level 3 — Making decisions

## if

A program that always does the same thing is not much use. `if` lets it
choose:

```lzy
age = 18

if age >= 18
    say "You can vote."
```

Two things to notice:

- The `if` line ends there. No brackets, no `:`, no `then`.
- The next line is **indented** — pushed in by four spaces. That indent is
  what tells LZY the line belongs to the `if`.

## The indent is the block

Everything indented under the `if` happens together:

```lzy
if age >= 18
    say "You can vote."
    say "You can also drive."
say "This always prints."
```

The last line is not indented, so it is not part of the `if`. It prints
whatever happens.

**Use spaces, not tabs.** LZY will refuse a tab and tell you why: tabs look
different in different editors, and in a language where the indent *is* the
block, that would be a disaster.

## else

```lzy
age = 15

if age >= 18
    say "Adult"
else
    say "Not an adult yet"
```

## else if

For more than two choices:

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

`else if` is two words. LZY checks each one in turn and stops at the first
that fits.

## Comparing things

| Written | Means |
|---|---|
| `a == b` | a is the same as b |
| `a != b` | a is not the same as b |
| `a < b` | a is less than b |
| `a <= b` | a is less than or the same as b |
| `a > b` | a is more than b |
| `a >= b` | a is more than or the same as b |

**`=` and `==` are different**, and this is the one that catches everybody:

- `=` **puts** a value into a name. `score = 10`
- `==` **asks** whether two values are the same. `score == 10`

If you write `if score = 10`, LZY will stop and tell you to use `==`.

## Yes/no values

`5 > 3` is not a number. It is a **yes/no value** — `true` or `false`:

```lzy
say 5 > 3            # true
say 5 < 3            # false

is_old_enough = age >= 18
say is_old_enough
```

## LZY wants a real yes or no

In some languages you can write `if count` and the program guesses what you
meant. LZY will not:

```lzy-broken
count = 0

if count
    say "something"
```

```
'if' needs a yes/no value, but it was given a number.

Maybe you meant:

    count != 0
```

This is on purpose. `if count` does not say what it is testing. `if count != 0`
does, and it is only six more characters. Say what you mean and the program
will still make sense to you next month.

## and, or, not

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

- `and` — both must be true
- `or` — at least one must be true
- `not` — turns true into false and false into true

These need yes/no values too. `1 and true` is an error.

## if inside if

You can put an `if` inside another one by indenting further:

```lzy
if age >= 18
    if has_ticket
        say "Come in"
    else
        say "You need a ticket"
else
    say "Too young"
```

Often you can say the same thing more clearly with `and`. If your
indentation is getting deep, that is usually a sign.

## Break it on purpose

```lzy-broken
score = 10
if score = 10
    say "ten"
```

```lzy-broken
if true
say "hello"
```

```lzy-broken
name = "Ada"
if name
    say "has a name"
```

## Your job

Write `ticket.lzy` that:

1. asks how old someone is
2. turns the answer into a number
3. prints `"Child ticket"` under 16, `"Adult ticket"` from 16 to 64, and
   `"Senior ticket"` from 65 up
4. also prints `"Bring an adult"` if they are under 12

---

Next: **[Level 4 — Doing things many times](04-loops.md)**
