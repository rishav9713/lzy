# Scope

Scope decides which names a piece of code can see. LZY's rule is short: **only
a function call creates a new scope.** `if`, `for` and `while` blocks do not,
so a name set inside them is still there afterwards.

## Reading a name

LZY looks for a name in the current scope first, then in the scopes the code
was written inside, then in the whole program.

```lzy
greeting = "Hello"

function greet(name)
    return greeting + ", " + name

say greet("Ada")
```

```output
Hello, Ada
```

## Storing into a name

Storing updates the nearest scope that already has that name. If no scope
has it, the name is created in the current one.

```lzy
total = 0

function add(amount)
    total = total + amount

add(5)
add(10)
say total
```

```output
15
```

`total` already exists outside the function, so the function updates it.
This is what makes counters and closures work without any extra keyword.

## Names created inside a function stay inside

A name that does not exist outside is created inside the function, and
disappears when the function ends:

```lzy-broken
function work()
    helper = 99
    return helper

say work()
say helper
```

```output
Name error in program.lzy, on line 6.

'helper' has not been given a value yet.

    say helper
        ^^^^^^

Store something in it first, like: helper = 0
Remember that LZY ignores capital letters in names.
```

Inputs are always the function's own, even if a name outside matches:

```lzy
value = 1

function change(value)
    value = 99
    return value

say change(5)
say value
```

```output
99
1
```

## Blocks do not hide names

```lzy
for n in range(3)
    last = n
say last

if true
    message = "set inside the if"
say message
```

```output
2
set inside the if
```

## The cost of this rule

Because storing updates the nearest existing name, a function can change a
name in the whole program by accident, simply by using the same name. It is
predictable and easy to explain, which is why it was chosen, but it is worth
knowing. The reasoning is in the
[design decisions](../../../docs/OWNER_DECISIONS.md#d-006-only-a-function-call-creates-a-scope).

## See also

- [Functions](functions.md)
- [Specification: scope](../../../SPEC.md#9-scope)
