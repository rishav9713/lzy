# Level 1 — Your first program

## Saying something

Open a new file, call it `hello.lzy`, and type one line:

```lzy
say "Hello World"
```

Save it, then run it:

```bash
lzy hello.lzy
```

You should see:

```
Hello World
```

That is a program. You wrote it.

## What each part means

```lzy
say "Hello World"
```

- **`say`** is an instruction. It means "print this where I can see it".
- **`"Hello World"`** is the thing to print. The quotes tell LZY that what is
  inside them is *text* and not an instruction.

That is the whole line. There is no semicolon, no brackets, no `main`
function, and nothing to set up first.

## Capital letters do not matter

All four of these lines do exactly the same thing:

```lzy
say "Hello"
SAY "Hello"
Say "Hello"
SaY "Hello"
```

LZY ignores capital letters in instructions and in names. You will never lose
an afternoon to a capital letter.

What is *inside* the quotes is different. That is your text, so LZY leaves it
exactly as you wrote it:

```lzy
say "hello"
say "HELLO"
```

prints

```
hello
HELLO
```

## Saying more than one thing

Put a comma between them, and LZY puts a space between them:

```lzy
say "Two plus two is", 4
```

```
Two plus two is 4
```

## Notes to yourself

Anything after a `#` is a **comment**. LZY ignores it completely. Comments
are for the person reading the program — often you, later.

```lzy
# This program greets the world.
say "Hello World"     # this bit does the greeting
```

## Doing sums

`say` will print the answer to a sum:

```lzy
say 2 + 2
say 10 - 3
say 6 * 7
say 10 / 4
```

```
4
7
42
2.5
```

Notice `10 / 4` gives `2.5`. LZY has one kind of number, so you never have to
think about whether an answer is a "whole number" or not.

## Break it on purpose

Try this, and read what LZY tells you:

```lzy-broken
say "Hello
```

LZY will say the text was opened but never closed, point at the line, and
tell you to add a closing quote. That is what every error in LZY tries to
do: say what happened, where, why, and what to try.

Now try this one:

```lzy-broken
print("Hello")
```

LZY knows that word from other languages and will tell you what LZY calls it
instead.

## Your job

Write a program called `about-me.lzy` that prints:

- your name
- your favourite number
- your favourite number multiplied by 2, worked out by LZY rather than by you

Then add a comment at the top saying what the program does.

---

Next: **[Level 2 — Variables](02-variables.md)**
