# Names and case

LZY is case-insensitive. `total`, `Total` and `TOTAL` are the same name, and
`SAY`, `Say` and `say` are the same keyword. Only lookups ignore case: LZY
remembers how you spelled a name and uses your spelling in error messages.

## Syntax

A name starts with a letter or `_`, and continues with letters, digits or
`_`. "Letter" means any Unicode letter, so `café` and `имя` are valid names.

```text
total    item_count    _hidden    café    x2
```

## Example

```lzy
Total = 10
say TOTAL
say total + 5

SAY "Keywords ignore case too"
```

```output
10
15
Keywords ignore case too
```

## How two names are compared

Two names are the same when their *folded* forms are equal. Folding is
Unicode NFKC normalisation, then full Unicode case folding. That is stricter
than lower-casing, and it has consequences worth knowing:

| Written | Written | Same name? | Why |
|---|---|---|---|
| `Total` | `TOTAL` | yes | ordinary case folding |
| `café` (composed) | `café` (e + accent) | yes | NFKC normalisation |
| `straße` | `strasse` | **yes** | full case folding turns `ß` into `ss` |
| `total` | `totals` | no | different names |

```lzy
straße = 2
say strasse
```

```output
2
```

If you need two different names, do not rely on case or on letters that look
alike to tell them apart.

## Map keys are data, not names

Keys in a map are text values, so they are matched exactly:
`person["Name"]` and `person["name"]` are different keys. The one convenience
is `person.name`, which falls back to a case-insensitive match. See
[Maps](maps.md).

## Reserved words

Some words are not keywords yet, but LZY refuses them as names so that adding
them later does not break your program. `class`, `import`, `try` and `match`
are among them; the full list is on the [keywords page](keywords.md).

## Common mistakes

Using a reserved word as a name:

```lzy-broken
class = "7B"
```

```output
Syntax error in program.lzy, on line 1.

'class' is a word LZY keeps for a future version of the language.

    class = "7B"
    ^^^^^

Choose a different name so your program keeps working when LZY starts using
this word.

Maybe you meant:

    my_class
```

A typo in a name. LZY suggests the name it thinks you meant:

```lzy-broken
total = 10
say totl
```

```output
Name error in program.lzy, on line 2.

'totl' has not been given a value yet.

    say totl
        ^^^^

LZY knows a name that looks very similar.

Maybe you meant:

    total
```

Two inputs that differ only in case:

```lzy-broken
function area(width, Width)
    return width * Width
```

```output
Syntax error in program.lzy, on line 1.

The input 'Width' is listed twice.

    function area(width, Width)
                         ^^^^^

LZY is case-insensitive, so 'Total' and 'total' are the same name. Give each
input a different name.
```

## See also

- [Keywords and reserved words](keywords.md)
- [Specification: names and case](../../../SPEC.md#4-names-and-case)
