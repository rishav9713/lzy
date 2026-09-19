# Keywords and reserved words

LZY has a small set of keywords, and a longer list of reserved words that are
kept for the future. Both lists on this page are generated from the lexer, in
`lzy/lexer/tokens.py`.

## Keywords

These words mean something to LZY. Keywords are matched ignoring case, so
`SAY`, `Say` and `say` are the same keyword. Select one to read about it.

<!-- lzy:component keywords -->

| Keywords | What they do |
|---|---|
| `say`, `ask` | print, and read a line of input — [Input and output](input-output.md) |
| `if`, `else` | choose — [Conditions](conditions.md) |
| `while`, `for`, `in`, `break`, `continue` | repeat — [Loops](loops.md) |
| `function`, `return` | define and leave a function — [Functions](functions.md) |
| `and`, `or`, `not` | combine yes/no values — [Operators](operators.md) |
| `true`, `false`, `nothing` | values — [Types and values](types.md) |

## Reserved words

These are not keywords yet, but LZY will not let you use them as names, so
that giving them a meaning later does not break anyone's program.

<!-- lzy:component reserved-words -->

Using one gives an error with a suggestion:

```lzy-broken
match = 3
```

```output
Syntax error in program.lzy, on line 1.

'match' is a word LZY keeps for a future version of the language.

    match = 3
    ^^^^^

Choose a different name so your program keeps working when LZY starts using
this word.

Maybe you meant:

    my_match
```

## A keyword after a dot

Because keywords are keywords everywhere, a map key that is also a keyword
cannot be reached with a dot. Use square brackets:

```lzy
question = { "ask": "What is 6 times 7?", "answer": "42" }
say question["ask"]
say question.answer
```

```output
What is 6 times 7?
42
```

## See also

- [Names and case](names.md)
- [Specification: keywords and reserved words](../../../SPEC.md#5-keywords-and-reserved-words)
