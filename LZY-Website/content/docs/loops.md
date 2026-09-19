# Loops

`for` goes through the items of a list, the characters of text, or the keys
of a map. `while` repeats as long as a condition stays `true`. `break` leaves
a loop early, and `continue` skips to its next turn.

## Syntax

```text
for name in list, text or map
    statements

while condition
    statements

break
continue
```

## for

```lzy
for colour in ["red", "green", "blue"]
    say colour
```

```output
red
green
blue
```

Read it as "for each colour in this list, say the colour". `colour` is a name
you choose; LZY puts each item into it in turn.

## Counting with range

`range` makes a list of numbers. `range(5)` counts from `0` and stops *before*
`5`. You can give a start, and a step:

```lzy
say range(5)
say range(1, 6)
say range(0, 10, 3)
say range(10, 0, -4)
```

```output
[0, 1, 2, 3, 4]
[1, 2, 3, 4, 5]
[0, 3, 6, 9]
[10, 6, 2]
```

```lzy
for n in range(1, 4)
    say "Step", n
```

```output
Step 1
Step 2
Step 3
```

## Going through text and maps

A `for` loop over text gives its characters. Over a map, it gives the keys,
in the order they were added:

```lzy
for character in "LZY"
    say character

prices = { "tea": 2, "cake": 3 }
for item in prices
    say item, "costs", prices[item]
```

```output
L
Z
Y
tea costs 2
cake costs 3
```

## while

`while` keeps going as long as its condition is `true`. Something in the loop
has to change the condition, or it never stops:

```lzy
countdown = 3
while countdown > 0
    say countdown
    countdown = countdown - 1
say "Lift off"
```

```output
3
2
1
Lift off
```

A `while true` loop with no `break` runs until you stop it with Ctrl+C. LZY
has no time limit on loops.

## break and continue

```lzy
for n in range(100)
    if n > 3
        break
    say n
```

```output
0
1
2
3
```

```lzy
for n in range(6)
    if n % 2 == 0
        continue
    say n
```

```output
1
3
5
```

`break` and `continue` apply to the loop they are directly inside.

## Changing a list while going through it

The loop takes a snapshot of the list when it starts, so adding to the list
inside the loop does not make the loop run forever:

```lzy
items = [1, 2]
for item in items
    append(items, item * 10)
say items
```

```output
[1, 2, 10, 20]
```

## Common mistakes

Looping over a number instead of a range:

```lzy-broken
for n in 5
    say n
```

```output
Type error in program.lzy, on line 1.

A 'for' loop needs a list, a map or text to go through, but this is a number.

    for n in 5
             ^

Use range(10) to count, or put the values in a list first.
```

Forgetting to indent the body:

```lzy-broken
for n in range(3)
say n
```

```output
Syntax error in program.lzy, on line 2.

The 'for' on line 1 needs an indented block under it.

    say n
    ^^^

Indent the lines that belong to it by 4 spaces.
```

## See also

- [Lists](lists.md)
- [Specification: while](../../../SPEC.md#85-while) and [for](../../../SPEC.md#86-for)
