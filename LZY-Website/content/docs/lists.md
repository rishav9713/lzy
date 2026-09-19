# Lists

A list holds values in order, counted from `0`. It can grow and shrink, its
items can be changed, and it can hold values of different types, including
other lists and maps.

## Syntax

```text
[]
[item, item, item]
list[position]
list[position] = value
```

## Example

```lzy
colours = ["red", "green", "blue"]

say colours[0]
say colours[-1]
say length(colours)

colours[1] = "lime"
append(colours, "yellow")
say colours
```

```output
red
blue
3
["red", "lime", "blue", "yellow"]
```

Negative positions count back from the end: `-1` is the last item.

## Adding, removing and finding

| Function | Does |
|---|---|
| `append(list, item)` | adds to the end; gives `nothing` |
| `remove_at(list, position)` | removes the item at a position and gives it back |
| `contains(list, item)` | `true` if the item is in the list |
| `find(list, item)` | the position of the item, or `nothing` |
| `length(list)` | how many items |

```lzy
queue = ["a", "b", "c"]
first = remove_at(queue, 0)
say first, queue

say contains(queue, "c")
say find(queue, "c")
say find(queue, "z")
```

```output
a ["b", "c"]
true
1
nothing
```

## New lists from old ones

These give back a new list and leave the original alone:

| Function | Gives |
|---|---|
| `sort(list)` | the items in order: all numbers, or all text |
| `reverse(list)` | the items back to front |
| `copy(list)` | a separate copy |
| `list + list` | the two joined together |

```lzy
numbers = [5, 2, 9, 1]
say sort(numbers)
say reverse(numbers)
say numbers + [10]
say numbers
```

```output
[1, 2, 5, 9]
[1, 9, 2, 5]
[5, 2, 9, 1, 10]
[5, 2, 9, 1]
```

`sort` takes no comparison function yet, so it sorts numbers or text only.

## Numbers in a list

`sum`, `min` and `max` work on a list of numbers:

```lzy
scores = [72, 95, 88]
say sum(scores), min(scores), max(scores)
say sum(scores) / length(scores)
```

```output
255 72 95
85
```

## Lists are shared

Storing a list in another name does not copy it. Both names see the same
list:

```lzy
a = [1, 2]
b = a
append(b, 3)
say a
```

```output
[1, 2, 3]
```

Use `copy(a)` when you want a separate list.

## Common mistakes

A position past the end:

```lzy-broken
items = [1, 2, 3]
say items[3]
```

```output
Lookup error in program.lzy, on line 2.

There is no position 3 in this list.

    say items[3]
        ^^^^^

It holds 3 items, so the positions run from 0 to 2.
```

Sorting a mix of numbers and text:

```lzy-broken
say sort([3, "two", 1])
```

```output
Type error in program.lzy, on line 1.

'sort' works on a list of numbers or a list of text, but this list holds
number and text.

    say sort([3, "two", 1])
        ^^^^

Sort one kind of value at a time.
```

## See also

- [Maps](maps.md)
- [Loops](loops.md)
- [Specification: list](../../../SPEC.md#65-list)
