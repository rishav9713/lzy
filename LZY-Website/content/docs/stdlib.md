# Built-in functions

LZY does not have a standard library of modules yet — that arrives with
modules in 0.2.0. What it has is a set of built-in functions that are always
available, with no `import`. They are ordinary names, so they follow the
usual case rules: `LENGTH`, `Length` and `length` are the same function.

Every function checks its inputs and gives a clear error when it is handed
the wrong kind of value.

<!-- lzy:component builtins-table -->

## Values and types

### type

```text
type(value)  ->  text
```

The name of a value's type: `number`, `text`, `truth`, `nothing`, `list`,
`map` or `function`.

```lzy
say type(42), type("hi"), type(true), type(nothing)
say type([1]), type({}), type(type)
```

```output
number text truth nothing
list map function
```

### length

```text
length(text, list or map)  ->  number
```

How many characters are in text, items in a list, or keys in a map.

```lzy
say length("café")
say length([1, 2, 3])
say length({ "a": 1 })
```

```output
4
3
1
```

### text

```text
text(value)  ->  text
```

Any value, as the text `say` would print for it.

```lzy
say text(3.5) + "!"
say text(true) + " / " + text(nothing)
say text([1, "a"])
```

```output
3.5!
true / nothing
[1, "a"]
```

### number

```text
number(text)  ->  number
```

Reads a number out of text, ignoring spaces at either end. Gives an error if
the text is not a number. A number is given back unchanged.

```lzy
say number("42") + 1
say number(" 3.5 ")
say number("1e3")
```

```output
43
3.5
1000
```

### show

```text
show(value)  ->  text
```

How a value looks when it is written inside a list: text keeps its quotes.

```lzy
say show("quoted")
say show(42)
say show([1, "two"])
```

```output
"quoted"
42
[1, "two"]
```

## Numbers

### abs

```text
abs(number)  ->  number
```

The size of a number, ignoring its sign.

```lzy
say abs(-4), abs(4), abs(-2.5)
```

```output
4 4 2.5
```

### round

```text
round(number)          ->  number
round(number, places)  ->  number
```

The nearest whole number, or the nearest value with that many decimal places.
A negative number of places rounds to tens, hundreds and so on. An exact half
rounds to the nearest even number.

```lzy
say round(3.14159, 2)
say round(1234, -2)
say round(2.5), round(3.5)
```

```output
3.14
1200
2 4
```

### floor

```text
floor(number)  ->  number
```

The largest whole number that is not above this one.

```lzy
say floor(3.7), floor(-3.2)
```

```output
3 -4
```

### ceiling

```text
ceiling(number)  ->  number
```

The smallest whole number that is not below this one.

```lzy
say ceiling(3.2), ceiling(-3.7)
```

```output
4 -3
```

### sqrt

```text
sqrt(number)  ->  number
```

The square root. Gives an error for a negative number.

```lzy
say sqrt(16), sqrt(2)
```

```output
4 1.4142135623730951
```

### min

```text
min(number, number, ...)  ->  number
min(list of numbers)      ->  number
```

The smallest of the numbers given, or of the numbers in one list.

```lzy
say min(3, 1, 2)
say min([7, 4, 9])
```

```output
1
4
```

### max

```text
max(number, number, ...)  ->  number
max(list of numbers)      ->  number
```

The largest of the numbers given, or of the numbers in one list.

```lzy
say max(3, 1, 2)
say max([7, 4, 9])
```

```output
3
9
```

### sum

```text
sum(list of numbers)  ->  number
```

All the numbers in a list, added up. An empty list sums to `0`.

```lzy
say sum([1, 2, 3.5])
say sum([])
```

```output
6.5
0
```

### random_number

```text
random_number(low, high)  ->  number
```

A random whole number between `low` and `high`, including both. It uses the
operating system's cryptographically secure generator; there is no seed.

```lzy
roll = random_number(1, 6)
say roll >= 1 and roll <= 6
```

```output
true
```

## Text functions

### upper

```text
upper(text)  ->  text
```

The same text in capital letters.

```lzy
say upper("lazy"), upper("straße")
```

```output
LAZY STRASSE
```

### lower

```text
lower(text)  ->  text
```

The same text in small letters.

```lzy
say lower("LZY Language")
```

```output
lzy language
```

### trim

```text
trim(text)  ->  text
```

The same text without spaces at either end.

```lzy
say "[" + trim("   padded   ") + "]"
```

```output
[padded]
```

### split

```text
split(text, separator)  ->  list of text
```

Cuts text into a list at every copy of the separator. An empty separator
splits it into single characters.

```lzy
say split("a,b,,c", ",")
say split("abc", "")
```

```output
["a", "b", "", "c"]
["a", "b", "c"]
```

### join

```text
join(list of text, separator)  ->  text
```

One piece of text from a list of text, with the separator between items.
Every item must already be text.

```lzy
say join(["red", "green", "blue"], ", ")
say join(["2026", "09", "19"], "-")
```

```output
red, green, blue
2026-09-19
```

### replace

```text
replace(text, old, new)  ->  text
```

The text with every copy of `old` swapped for `new`.

```lzy
say replace("a-b-c", "-", " + ")
```

```output
a + b + c
```

### starts_with

```text
starts_with(text, part)  ->  truth
```

Whether text begins with `part`.

```lzy
say starts_with("lazy", "la"), starts_with("lazy", "zy")
```

```output
true false
```

### ends_with

```text
ends_with(text, part)  ->  truth
```

Whether text ends with `part`.

```lzy
say ends_with("report.lzy", ".lzy")
```

```output
true
```

## Lists and maps

### range

```text
range(stop)               ->  list of numbers
range(start, stop)        ->  list of numbers
range(start, stop, step)  ->  list of numbers
```

Counts from `start` (or `0`) up to, but not including, `stop`. A negative
step counts down. All three must be whole numbers, and one `range` makes at
most 10,000,000 numbers.

```lzy
say range(5)
say range(2, 6)
say range(10, 0, -3)
```

```output
[0, 1, 2, 3, 4]
[2, 3, 4, 5]
[10, 7, 4, 1]
```

### append

```text
append(list, item)  ->  nothing
```

Adds an item to the end of a list. The list itself changes.

```lzy
items = [1, 2]
append(items, 3)
say items
```

```output
[1, 2, 3]
```

### remove_at

```text
remove_at(list, position)  ->  the removed item
```

Removes the item at a position, and gives it back. Negative positions count
from the end.

```lzy
items = ["a", "b", "c"]
say remove_at(items, -1)
say items
```

```output
c
["a", "b"]
```

### contains

```text
contains(list, item)  ->  truth
contains(map, key)    ->  truth
contains(text, part)  ->  truth
```

Whether a list holds an item, a map has a key, or text holds some smaller
text.

```lzy
say contains([1, 2, 3], 2)
say contains({ "a": 1 }, "a")
say contains("lazy", "zy")
```

```output
true
true
true
```

### keys

```text
keys(map)  ->  list
```

Every key in a map, in the order they were added.

```lzy
say keys({ "b": 1, "a": 2 })
```

```output
["b", "a"]
```

### values

```text
values(map)  ->  list
```

Every value in a map, in the order their keys were added.

```lzy
say values({ "b": 1, "a": 2 })
```

```output
[1, 2]
```

### remove_key

```text
remove_key(map, key)  ->  the removed value
```

Removes a key from a map, and gives back its value. Gives an error if the key
is not there; check first with `contains()`.

```lzy
stock = { "apples": 4, "pears": 2 }
say remove_key(stock, "pears")
say stock
```

```output
2
{ "apples": 4 }
```

### sort

```text
sort(list)  ->  list
```

A new list with the items in order. The list must be all numbers or all
text; text is ordered by Unicode code point, so capitals come first.

```lzy
say sort([3, 1.5, 2])
say sort(["pear", "Apple", "fig"])
```

```output
[1.5, 2, 3]
["Apple", "fig", "pear"]
```

### reverse

```text
reverse(list)  ->  list
```

A new list with the items back to front.

```lzy
say reverse([1, 2, 3])
```

```output
[3, 2, 1]
```

### copy

```text
copy(list or map)  ->  list or map
```

A separate copy, so changing one does not change the other. The copy is
shallow: lists and maps inside it are still shared.

```lzy
original = [1, 2]
duplicate = copy(original)
append(duplicate, 3)
say original, duplicate
```

```output
[1, 2] [1, 2, 3]
```

### find

```text
find(list, item)  ->  number or nothing
find(text, part)  ->  number or nothing
```

The position of the first match, or `nothing` if there is none.

```lzy
say find(["a", "b", "c"], "c")
say find("lazy", "z")
say find([1, 2], 5)
```

```output
2
2
nothing
```

## See also

- [Specification: built-in functions](../../../SPEC.md#11-built-in-functions)
- [Not in LZY yet](not-yet.md), for the standard library that is planned
