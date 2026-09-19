# Functions

A function gives a name to a piece of work. It takes inputs, runs its body,
and can send an answer back with `return`. Functions are values, so they can
be stored in names, passed to other functions and returned from them.

## Syntax

```text
function name(input, input, ...)
    statements
    return value
```

## Example

```lzy
function area(width, height)
    return width * height

say area(3, 4)
say area(3, 4) + area(5, 5)
```

```output
12
37
```

## Inputs and return

- A function must be called with exactly as many inputs as it lists.
- `return` sends a value back and ends the function straight away.
- A function that reaches the end without `return`, or uses `return` on its
  own, gives back `nothing`.

```lzy
function check(age)
    if age < 0
        return "That is not a real age."
    if age < 18
        return "Too young."
    return "Fine."

say check(-5)
say check(10)
say check(30)
```

```output
That is not a real age.
Too young.
Fine.
```

```lzy
function greet(who)
    say "Hello " + who + "!"

result = greet("Ada")
say result
```

```output
Hello Ada!
nothing
```

## Recursion

A function can call itself. It needs a stopping case, or it will call itself
until LZY stops it:

```lzy
function factorial(n)
    if n <= 1
        return 1
    return n * factorial(n - 1)

say factorial(5)
say factorial(20)
```

```output
120
2432902008176640000
```

LZY allows 400 calls waiting at once (100 with `--safe`).

## Functions are values

```lzy
function double(n)
    return n * 2

function apply_twice(f, value)
    return f(f(value))

say apply_twice(double, 5)
say type(double)
```

```output
20
function
```

LZY has no anonymous functions yet, so a function has to be named before it
can be passed. They are planned for 0.1.0.

## Closures

A function defined inside another function keeps the names around it, even
after the outer function has finished:

```lzy
function counter()
    count = 0
    function step()
        count = count + 1
        return count
    return step

next = counter()
say next(), next(), next()
```

```output
1 2 3
```

## Common mistakes

The wrong number of inputs:

```lzy-broken
function add(a, b)
    return a + b

say add(1)
```

```output
Type error in program.lzy, on line 4.

'add' needs 2 inputs, but it was given 1 input.

    say add(1)
        ^^^

Check the brackets for a missing or extra value.
```

Recursion with no stopping case:

```lzy-broken
function forever(n)
    return forever(n + 1)

say forever(1)
```

```output
Limit reached in program.lzy, on line 2.

'forever' called itself too many times.

    return forever(n + 1)
           ^^^^^^^

LZY allows 400 calls waiting at once. A function that calls itself needs a
case where it stops and returns without calling itself again.
```

Calling something that is not a function:

```lzy-broken
x = 5
say x(3)
```

```output
Type error in program.lzy, on line 2.

A number cannot be called like a function.

    say x(3)
        ^

'x' holds a value, not a function.
```

## See also

- [Scope](scope.md)
- [Specification: functions](../../../SPEC.md#10-functions)
