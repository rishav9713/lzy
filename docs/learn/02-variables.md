# Level 2 — Keeping things

## A name for a value

A **variable** is a name for a value you want to keep:

```lzy
name = "Ada"
say name
```

```
Ada
```

The `=` means "put this value in this name". Read it as *"name gets Ada"*,
not as "name equals Ada" — that will matter in Level 3.

## Names ignore capital letters

These are all the same variable:

```lzy
name = "Ada"
say NAME
say Name
say nAmE
```

All four print `Ada`. LZY remembers how you spelled it, though, so if you
make a typo it can show you the spelling you used:

```lzy-broken
total = 10
say totl
```

```
'totl' has not been given a value yet.

Maybe you meant:

    total
```

## Changing what is in a name

```lzy
score = 0
say score

score = 10
say score

score = score + 5
say score
```

```
0
10
15
```

That third one looks strange the first time. `score = score + 5` means:
*work out `score + 5`, then put the answer back into `score`*. The right
side happens first.

## Kinds of value

LZY has a few kinds of value. You have met two already:

```lzy
age = 36                  # a number
name = "Ada"              # some text
likes_maths = true        # a yes/no value - true or false
nickname = nothing        # nothing at all
```

You can ask LZY what kind something is:

```lzy
say type(36)              # number
say type("Ada")           # text
say type(true)            # truth
say type(nothing)         # nothing
```

## Joining text together

`+` joins two pieces of text:

```lzy
first = "Ada"
last = "Lovelace"
say first + " " + last
```

```
Ada Lovelace
```

Note the `" "` in the middle. Without it you would get `AdaLovelace`.

## Numbers and text do not mix

This does **not** work:

```lzy-broken
age = 36
say "I am " + age
```

LZY will tell you that `+` cannot add a number and text, and suggest the
fix. `+` means one thing at a time: add two numbers, or join two pieces of
text. It never guesses which one you meant.

To join a number onto text, turn it into text first with `text(...)`:

```lzy
age = 36
say "I am " + text(age)
```

Or let `say` do it for you with a comma:

```lzy
say "I am", age
```

## Asking a question

`ask` reads a line that someone types:

```lzy
name = ask "What is your name? "
say "Hello " + name + "!"
```

Whatever someone types comes back as **text**, even if it looks like a
number. To do sums with it, turn it into a number:

```lzy
answer = ask "How old are you? "
age = number(answer)
say "Next year you will be", age + 1
```

## Break it on purpose

Try each of these and read what LZY says:

```lzy-broken
say 5 + "5"
```

```lzy-broken
age = number("thirty")
```

```lzy-broken
say my_favourite_colour
```

## Your job

Write `greeting.lzy` that:

1. asks for a name
2. asks for an age
3. prints a greeting using the name
4. prints how old they will be in ten years, worked out by LZY

Then run it and give it your age as a word — `thirty` instead of `30` — and
read the error.

---

Next: **[Level 3 — Making decisions](03-decisions.md)**
