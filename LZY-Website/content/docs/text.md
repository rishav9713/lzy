# Text

Text is a sequence of characters, written between double or single quotes.
What is inside the quotes is kept exactly as written, including its capital
letters. Text cannot be changed in place: you build new text instead.

## Syntax

```text
"double quotes"
'single quotes'
"a quote \" inside"
"a new line \n in the middle"
"an emoji \u{1F600} by its number"
```

Text cannot span lines; use `\n` for a line break.

## Example

```lzy
first = "Ada"
last = "Lovelace"

say first + " " + last
say length(first)
say upper(last)
say first[0]
say last[-1]
```

```output
Ada Lovelace
3
LOVELACE
A
e
```

## Escapes

| Escape | Means |
|---|---|
| `\n` | a new line |
| `\t` | a tab |
| `\r` | a carriage return |
| `\0` | the zero character |
| `\\` | a backslash |
| `\"` and `\'` | a quote |
| `\u{...}` | a character by its hexadecimal number |

Any other escape is an error.

```lzy
say "Name:\tAda"
say "She said \"hello\""
say "\u{1F600}"
```

```output
Name:	Ada
She said "hello"
😀
```

## Joining text

`+` joins two pieces of text. To join a number onto text, turn it into text
first with `text()`, or let `say` do it with a comma:

```lzy
count = 3
say "You have " + text(count) + " messages"
say "You have", count, "messages"
```

```output
You have 3 messages
You have 3 messages
```

## Positions

Characters are counted from `0`. A negative position counts back from the
end, so `-1` is the last character. A `for` loop walks through the
characters one by one:

```lzy
word = "LZY"
say word[0], word[-1]

for character in word
    say character
```

```output
L Y
L
Z
Y
```

## Text functions

| Function | Gives |
|---|---|
| `length(t)` | how many characters |
| `upper(t)`, `lower(t)` | the same text in capitals, or small letters |
| `trim(t)` | the text without spaces at either end |
| `split(t, separator)` | a list of pieces |
| `join(list, separator)` | one piece of text from a list of text |
| `replace(t, old, new)` | the text with every `old` swapped for `new` |
| `starts_with(t, part)`, `ends_with(t, part)` | `true` or `false` |
| `contains(t, part)` | `true` or `false` |
| `find(t, part)` | the position of `part`, or `nothing` |

```lzy
line = "  red, green, blue  "
colours = split(trim(line), ", ")
say colours
say join(colours, " and ")
say replace("a-b-c", "-", "+")
say contains("lazy", "zy")
say find("lazy", "z")
```

```output
["red", "green", "blue"]
red and green and blue
a+b+c
true
2
```

`split` with an empty separator splits text into single characters.

## Comparing text

`==` compares text exactly, including case. `<` and `>` compare by Unicode
code point, which puts capital letters before small ones:

```lzy
say "a" == "A"
say "apple" < "banana"
say "Z" < "a"
say sort(["banana", "Apple", "cherry"])
```

```output
false
true
true
["Apple", "banana", "cherry"]
```

## Common mistakes

Joining text and a number with `+`:

```lzy-broken
score = 10
say "Score: " + score
```

```output
Type error in program.lzy, on line 2.

'+' cannot add a number and text.

    say "Score: " + score
                  ^

LZY keeps numbers and text apart so that '+' always means the same thing. Use
number(...) to add them as numbers, or text(...) to join them as text.

Maybe you meant:

    number("Score: ") + score
```

The suggestion turns the text into a number, which is right when the text
holds digits. Here it holds words, so the fix is the other one the
explanation mentions: `"Score: " + text(score)`.

Changing a character in place:

```lzy-broken
word = "cat"
word[0] = "b"
```

```output
Type error in program.lzy, on line 2.

Text cannot be changed one character at a time.

    word[0] = "b"
    ^^^^

Build a new piece of text instead, for example with replace().
```

Forgetting to close the quotes:

```lzy-broken
say "Hello
```

```output
Syntax error in program.lzy, on line 1.

This text was opened but never closed.

    say "Hello
        ^

Add a closing " at the end of the text.
```

## See also

- [Built-in functions](stdlib.md)
- [Specification: text](../../../SPEC.md#62-text)
