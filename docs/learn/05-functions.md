# Level 5 — Naming a piece of work

## The problem

Suppose you need the area of a rectangle in three places:

```lzy
area1 = 3 * 4
area2 = 10 * 2
area3 = 7 * 7
```

That is fine until the rule changes, or until the calculation is twenty lines
long instead of one. A **function** gives a piece of work a name, so you
write it once and use it anywhere.

## Writing one

```lzy
function area(width, height)
    return width * height

say area(3, 4)
say area(10, 2)
```

```
12
20
```

- **`function`** starts the definition.
- **`area`** is the name you chose.
- **`(width, height)`** are its **parameters** — the values it needs.
- The indented block is the body.
- **`return`** sends an answer back.

## Calling it

`area(3, 4)` **calls** the function. The `3` goes into `width` and the `4`
goes into `height`, the body runs, and the whole call turns into whatever was
returned — so you can use it anywhere a value goes:

```lzy
total = area(3, 4) + area(5, 5)
say total                          # 37
```

## Functions that do not return anything

Not everything needs to give an answer back:

```lzy
function greet(who)
    say "Hello " + who + "!"
    say "Nice to meet you."

greet("Ada")
```

A function with no `return` gives back `nothing`.

## return stops the function

As soon as a `return` runs, the function is over:

```lzy
function check(age)
    if age < 0
        return "That is not a real age."
    if age < 18
        return "Too young."
    return "Fine."

say check(-5)      # That is not a real age.
say check(10)      # Too young.
say check(30)      # Fine.
```

This is often tidier than one big `if` / `else if` / `else`.

## Names inside a function stay inside it

```lzy-broken
function work()
    helper = 99
    return helper

say work()         # 99
say helper         # error - helper does not exist out here
```

A name first created inside a function belongs to that function. This is a
good thing: you can name things inside a function without worrying about what
the rest of the program calls them.

Parameters work the same way:

```lzy
value = 1

function change(value)
    value = 99
    return value

say change(5)      # 99
say value          # 1 - the outer one was not touched
```

## A function can call itself

This is called **recursion**, and it is how you describe something in terms
of a smaller version of itself.

The factorial of 5 is `5 * 4 * 3 * 2 * 1`. Another way to say it: factorial
of 5 is `5 times the factorial of 4`.

```lzy
function factorial(n)
    if n <= 1
        return 1
    return n * factorial(n - 1)

say factorial(5)      # 120
```

Every recursive function needs a **stopping case** — here, `if n <= 1`.
Without one it calls itself forever, and LZY will stop it and tell you so:

```
'forever' called itself too many times.

LZY allows 400 calls waiting at once. A function that calls itself needs a
case where it stops and returns without calling itself again.
```

## Functions are values

A function can be stored in a name, and passed to another function:

```lzy
function double(n)
    return n * 2

function triple(n)
    return n * 3

function apply_twice(f, value)
    return f(f(value))

say apply_twice(double, 5)      # 20
say apply_twice(triple, 2)      # 18
```

`apply_twice` does not know or care which function it is given. That is a
powerful idea, and you will meet it again.

## A function can build a function

```lzy
function make_adder(amount)
    function add(n)
        return n + amount
    return add

add_ten = make_adder(10)
say add_ten(5)         # 15
```

`add` remembers the `amount` it was built with, even after `make_adder` has
finished. That is called a **closure**.

## When to write one

Write a function when:

- you are about to copy and paste code
- a piece of work deserves a name
- a chunk of a program does one thing and you could say what it is in a short
  phrase

If you cannot think of a good name, that is often a sign the function is
doing more than one thing.

## Break it on purpose

```lzy-broken
function add(a, b)
    return a + b

say add(1)
```

```lzy-broken
function forever(n)
    return forever(n + 1)

say forever(1)
```

```lzy-broken
x = 5
say x(3)
```

## Your job

Write `shapes.lzy` with:

1. `area_rectangle(width, height)`
2. `area_triangle(base, height)`
3. `area_circle(radius)` — use `3.14159` for pi
4. `describe(name, area)` which prints something like
   `"A circle with area 78.5"`, rounded to one decimal place with
   `round(area, 1)`

Then use all four together.

For a harder one: write `count_down(n)` that prints `n` down to 1 and then
`"Done"` — using recursion, with no loop.

---

You have now met everything LZY's core language does. Levels 6 to 9 — lists
and maps in depth, algorithms, applications and advanced LZY — are not
written yet. The [examples](../../examples/) folder is the best place to go
next: start with [`02-algorithms/`](../../examples/02-algorithms/).

If you would like to write one of the missing levels, see
[CONTRIBUTING.md](../../CONTRIBUTING.md).
