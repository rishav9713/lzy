# Syntax and layout

LZY has very little punctuation. A program is a list of lines, one statement
per line, and blocks are made by indenting. This page covers how a program is
laid out: lines, blocks, comments, and long values that span several lines.

## Syntax

```text
statement
statement

line that opens a block
    statement in the block
    statement in the block
statement after the block

# a comment
```

## One statement per line

There is no semicolon and no statement separator. The end of the line is the
end of the statement.

```lzy
say "one"
say "two"
```

```output
one
two
```

## Blocks are indentation

A line that opens a block — `if`, `else`, `while`, `for`, `function` — simply
ends. The lines indented under it are the block. There is no `:`, no `{`, and
no `then`, and nothing closes the block: it ends when the indentation does.

```lzy
age = 20

if age >= 18
    say "Adult"
    say "Welcome"
say "This line is not part of the if"
```

```output
Adult
Welcome
This line is not part of the if
```

- Indent with **spaces**. A tab in the indentation is an error, because tabs
  look different in different editors and the indentation is the program.
- Four spaces per level is the LZY style. Any consistent width works.
- A block must contain at least one statement.
- Blocks can nest up to 64 levels deep.

## Comments

`#` starts a comment that runs to the end of the line. There are no block
comments.

```lzy
# This whole line is a comment.
say "hi"    # This comment is at the end of a line.
```

```output
hi
```

## Long values across lines

Inside `(`, `[` or `{`, line breaks and indentation mean nothing, so a long
list, map or function call can be spread out:

```lzy
people = [
    "Ada",
    "Grace",
    "Alan",
]

say people
```

```output
["Ada", "Grace", "Alan"]
```

A trailing comma after the last item is allowed.

## Blank lines

Blank lines, and lines holding only a comment, can go anywhere, including in
the middle of a block. They never change what a program means.

## Files

| Property | Value |
|---|---|
| Extension | `.lzy` |
| Encoding | UTF-8 |
| Line endings | `\n`, `\r\n` and `\r` are all accepted |
| Largest file | 2,000,000 characters (100,000 with `--safe`) |

## Common mistakes

A tab in the indentation:

```lzy-broken
if true
	say "indented with a tab"
```

```output
Syntax error in program.lzy, on line 2.

This line is indented with a tab.

    say "indented with a tab"
    ^

LZY indents with spaces so that every editor shows your code the same way.
Replace the tab with spaces (4 spaces per level is the LZY style).
```

Forgetting to indent the block:

```lzy-broken
if true
say "hello"
```

```output
Syntax error in program.lzy, on line 2.

The 'if' on line 1 needs an indented block under it.

    say "hello"
    ^^^

Indent the lines that belong to it by 4 spaces.
```

Adding punctuation from another language:

```lzy-broken
say "hello";
```

```output
Syntax error in program.lzy, on line 1.

LZY does not know what to do with the character ';'.

    say "hello";
               ^

Remove it, or check for a typo.
```

## See also

- [Names and case](names.md)
- [Specification: layout](../../../SPEC.md#3-layout)
