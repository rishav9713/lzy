# Variables

A variable is a name for a value. `=` puts a value into a name; using the name
later gives the value back. There is no keyword to declare a variable: the
first time you store into a name, it exists.

## Syntax

```text
name = value
list[position] = value
map[key] = value
map.key = value
```

## Example

```lzy
name = "Ada"
age = 36
likes_maths = true

say "Name:", name
say "Age next year:", age + 1
say "Likes maths:", likes_maths
```

```output
Name: Ada
Age next year: 37
Likes maths: true
```

## Changing a variable

Storing into a name again replaces what was there. The right-hand side is
worked out first, so a name can appear on both sides:

```lzy
score = 0
score = 10
score = score + 5
say score
```

```output
15
```

Read `score = score + 5` as "work out `score + 5`, then put the answer back
into `score`". LZY has no `+=`; write the addition out.

## Values of any type

A variable can hold any kind of value, and can hold a different kind later.
`type()` says what it holds right now:

```lzy
thing = 42
say type(thing)
thing = "forty-two"
say type(thing)
thing = nothing
say type(thing)
```

```output
number
text
nothing
```

`nothing` is the value that means "no value".

## Where a variable lives

A name created inside a function belongs to that function. A name created
anywhere else — including inside an `if` or a loop — belongs to the whole
program. See [Scope](scope.md) for the exact rules.

## Common mistakes

Using a name before giving it a value:

```lzy-broken
say total
```

```output
Name error in program.lzy, on line 1.

'total' has not been given a value yet.

    say total
        ^^^^^

Store something in it first, like: total = 0
Remember that LZY ignores capital letters in names.
```

Trying `+=`, which LZY does not have:

```lzy-broken
count = 1
count += 1
```

```output
Syntax error in program.lzy, on line 2.

LZY expected a value here, but found '='.

    count += 1
           ^

A value is a number, some text, a name, a list or a map.
```

Assigning to something that cannot hold a value:

```lzy-broken
10 = count
```

```output
Syntax error in program.lzy, on line 1.

The left side of '=' must be somewhere a value can be stored.

    10 = count
       ^

That means a name, a list position like scores[0], or a map key like
user.name.
```

## See also

- [Types and values](types.md)
- [Scope](scope.md)
- [Specification: assignment](../../../SPEC.md#82-assignment)
