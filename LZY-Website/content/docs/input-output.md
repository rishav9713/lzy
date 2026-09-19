# Input and output

`say` prints. `ask` reads a line that someone types. Those are the only two
ways an LZY program talks to the outside world today: there is no file,
network or process access yet.

## Syntax

```text
say value, value, ...
say

name = ask
name = ask "a question? "
```

## say

`say` prints its values separated by a single space, then a new line. `say`
on its own prints an empty line.

```lzy
say "Hello"
say "Two plus two is", 2 + 2
say
say "After an empty line"
```

```output
Hello
Two plus two is 4

After an empty line
```

Text prints without quotes. Inside a list or map it keeps its quotes, so you
can tell `"1"` from `1`:

```lzy
say "a"
say ["a", 1, true, nothing]
say { "name": "Ada", "scores": [9, 7] }
```

```output
a
["a", 1, true, nothing]
{ "name": "Ada", "scores": [9, 7] }
```

`text()` turns any value into the text `say` would print, and `show()` gives
the text it would have inside a list:

```lzy
say text(3.5) + "!"
say show("quoted") + " and " + show(42)
```

```output
3.5!
"quoted" and 42
```

## ask

`ask` stops, waits for someone to type a line and press Enter, and gives back
what they typed as **text**. It can show a question first:

```lzy
name = ask "What is your name? "
say "Hello " + name + "!"
```

What someone types always comes back as text, even if it looks like a
number. Turn it into a number with `number()` before doing sums:

```lzy
answer = ask "How old are you? "
age = number(answer)
say "Next year you will be", age + 1
```

Whatever `ask` reads is data. It is never run as code.

## Piping answers in

`ask` reads standard input, so answers can be piped in instead of typed.
Each `ask` reads one line. From a copy of the repository:

```bash
echo Ada | lzy examples/01-beginner/greeting.lzy
```

A program itself can also be piped in to `lzy` with no file name. In that
case its `ask` has nothing to read, because standard input is the program.

## Common mistakes

Doing sums with what `ask` gave back, without `number()`:

```lzy-broken
answer = "36"
say answer + 1
```

```output
Type error in program.lzy, on line 2.

'+' cannot add a number and text.

    say answer + 1
               ^

LZY keeps numbers and text apart so that '+' always means the same thing. Use
number(...) to add them as numbers, or text(...) to join them as text.

Maybe you meant:

    number(answer) + 1
```

Running a program that uses `ask` with nothing left to read — in a script,
in a test, or after piped answers run out — stops it with an `Input error`
that says LZY asked a question but there was no answer to read.

## See also

- [Text](text.md)
- [Specification: say](../../../SPEC.md#81-say) and [ask](../../../SPEC.md#76-ask)
