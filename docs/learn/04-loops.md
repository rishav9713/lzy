# Level 4 — Doing things many times

## for

A **loop** repeats work. The simplest kind walks through a list:

```lzy
for colour in ["red", "green", "blue"]
    say colour
```

```
red
green
blue
```

Read it as: *for each colour in this list, say the colour.*

`colour` is a name you chose. LZY puts each item into it in turn, then runs
the indented block. Like `if`, the indent is the block.

## Counting with range

To count, use `range`:

```lzy
for n in range(5)
    say n
```

```
0
1
2
3
4
```

`range(5)` counts **from 0**, and stops **before** 5 — that is five numbers.
Counting from zero looks odd at first and becomes natural quickly.

You can say where to start, and how big each step is:

```lzy
for n in range(1, 6)        # 1 2 3 4 5
    say n

for n in range(0, 10, 2)    # 0 2 4 6 8
    say n
```

## Adding things up

A very common pattern: keep a running total.

```lzy
numbers = [10, 20, 30, 40]

total = 0
for number in numbers
    total = total + number

say "Total:", total
```

```
Total: 100
```

`total` starts at `0` **before** the loop. Each time round, the loop adds one
number to it. Put `total = 0` inside the loop by mistake and it resets every
time — try it and see.

## while

`for` goes through things you already have. `while` keeps going as long as
something is true:

```lzy
countdown = 3

while countdown > 0
    say countdown
    countdown = countdown - 1

say "Lift off"
```

```
3
2
1
Lift off
```

**Something inside the loop has to change the condition**, or it will never
stop. Here, `countdown` gets smaller each time. If you forget that line, the
program runs forever and you will have to stop it yourself with Ctrl-C.

## break and continue

`break` leaves the loop straight away:

```lzy
for n in range(100)
    if n > 3
        break
    say n
```

```
0
1
2
3
```

`continue` skips the rest of this turn and starts the next one:

```lzy
for n in range(6)
    if n % 2 == 0
        continue
    say n
```

```
1
3
5
```

`%` gives the remainder after division, so `n % 2 == 0` means "n divides by
two exactly" — that is, n is even.

## Loops inside loops

```lzy
for row in range(3)
    for column in range(3)
        say "row", row, "column", column
```

The inner loop runs all the way through for each turn of the outer one, so
this prints nine lines.

`break` only leaves the loop it is directly inside.

## Going through text

A loop can walk through the characters of text:

```lzy
for character in "LZY"
    say character
```

```
L
Z
Y
```

## Break it on purpose

```lzy-broken
for n in 5
    say n
```

```lzy-broken
for n in range(3)
say n
```

## Your job

Write `times-table.lzy` that:

1. asks which times table to print
2. prints the first twelve lines of it, like `3 x 7 = 21`
3. at the end, prints the total of all twelve answers

Then write `countdown.lzy` using `while`, which counts down from a number the
user gives and says `"Lift off"` at the end. Make it refuse politely if the
number is less than 1.

---

Next: **[Level 5 — Functions](05-functions.md)**
