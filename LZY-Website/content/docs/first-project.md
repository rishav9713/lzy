# Your first project

This page builds one small program from start to finish: a shopping list that
totals itself. On the way it uses most of what LZY's core language has —
variables, lists, maps, a loop, a decision and a function — and shows how an
LZY project is laid out.

## One file is one program

An LZY program is a single `.lzy` file. LZY does not have modules or `import`
yet, so a program cannot be split across files; that is planned for 0.2.0.
There is no project file and no build step either. A folder for your own
programs can be as simple as:

```text
my-lzy/
├── shopping.lzy
├── quiz.lzy
└── notes.txt
```

Run any of them with `lzy shopping.lzy`.

## Step 1: the data

A list keeps things in order. A map looks things up by name. A list of maps
is a small table:

```lzy
items = [
    { "name": "bread", "price": 1.2, "count": 2 },
    { "name": "milk", "price": 0.9, "count": 1 },
    { "name": "apples", "price": 0.35, "count": 6 }
]

say length(items), "things on the list"
```

```output
3 things on the list
```

Inside `[` `]` and `{` `}`, line breaks do not matter, so a long list can be
spread over several lines.

## Step 2: a function

A function names a piece of work. This one works out what one line of the
list costs:

```lzy
function line_cost(item)
    return round(item["price"] * item["count"], 2)

say line_cost({ "name": "bread", "price": 1.2, "count": 2 })
```

```output
2.4
```

The indented line is the function's body. `return` sends the answer back.

`round(..., 2)` keeps two decimal places. Money needs it: like most
languages, LZY stores numbers such as `0.35` in binary, where they cannot be
exact, so `0.35 * 6` would otherwise print as `2.0999999999999996`. See
[Numbers](numbers.md#whole-numbers-are-exact).

## Step 3: a loop

Now go through the list, printing each line and keeping a running total:

```lzy
items = [
    { "name": "bread", "price": 1.2, "count": 2 },
    { "name": "milk", "price": 0.9, "count": 1 },
    { "name": "apples", "price": 0.35, "count": 6 }
]

function line_cost(item)
    return round(item["price"] * item["count"], 2)

total = 0
for item in items
    cost = line_cost(item)
    total = total + cost
    say item["name"], "costs", cost

say "Total:", round(total, 2)
```

```output
bread costs 2.4
milk costs 0.9
apples costs 2.1
Total: 5.4
```

`total` starts at `0` before the loop, and each time round the loop adds one
line to it.

## Step 4: a decision

Finally, round the total and compare it with a budget. `round(value, 2)`
keeps two decimal places:

```lzy
total = 5.4
budget = 5

total = round(total, 2)
if total > budget
    say "Over budget by", round(total - budget, 2)
else
    say "Within budget"
```

```output
Over budget by 0.4
```

The `if` line ends where the condition ends. There is no `:` and no
`then`; the indented line underneath is what happens.

## The whole program

Put all four steps together in `shopping.lzy`:

```lzy
# A shopping list that totals itself.

items = [
    { "name": "bread", "price": 1.2, "count": 2 },
    { "name": "milk", "price": 0.9, "count": 1 },
    { "name": "apples", "price": 0.35, "count": 6 }
]

budget = 5

function line_cost(item)
    return round(item["price"] * item["count"], 2)

total = 0
for item in items
    cost = line_cost(item)
    total = total + cost
    say item["name"] + ": " + text(cost)

total = round(total, 2)
say "Total: " + text(total)

if total > budget
    say "Over budget by " + text(round(total - budget, 2))
else
    say "Within budget"
```

```output
bread: 2.4
milk: 0.9
apples: 2.1
Total: 5.4
Over budget by 0.4
```

Notice `text(cost)`. `+` joins two pieces of text, but it will not join text
and a number — you turn the number into text first. That rule is covered in
[Text](text.md).

## Check it, then run it

```bash
lzy check shopping.lzy
lzy shopping.lzy
```

## Where to go from here

- Change the prices, add items, and run it again.
- Replace the fixed list with answers typed in using `ask` — see
  [Input and output](input-output.md).
- Read the [examples](/examples/), which are longer programs in the same
  style.
