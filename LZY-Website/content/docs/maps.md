# Maps

A map holds pairs of keys and values, and looks values up by key. It keeps
the order in which keys were added. Keys may be text, numbers or `true` and
`false`; values can be anything.

## Syntax

```text
{}
{ "key": value, "key": value }
map["key"]
map.key
map["key"] = value
map.key = value
```

## Example

```lzy
person = { "name": "Ada", "age": 36 }

say person["name"]
say person.age

person.city = "London"
person["age"] = 37
say person
say keys(person)
```

```output
Ada
36
{ "name": "Ada", "age": 37, "city": "London" }
["name", "age", "city"]
```

## Two ways to look up a key

- `map["key"]` always matches the key **exactly**, including its case.
- `map.key` is a convenience. It uses the exact key if there is one, and
  otherwise a key that matches ignoring case — but if more than one key
  matches, it is an error rather than a guess.

```lzy
person = { "Name": "Ada" }
say person.name
say person["Name"]
```

```output
Ada
Ada
```

This is because map keys are *data*. They may have come from somewhere else,
where their exact spelling matters.

## A shorthand for keys

A bare name used as a key means that name, folded to small letters, as text:

```lzy
settings = { colour: "red", Size: 3 }
say keys(settings)
```

```output
["colour", "size"]
```

## Map functions

| Function | Gives |
|---|---|
| `keys(map)` | a list of the keys, in order |
| `values(map)` | a list of the values, in order |
| `contains(map, key)` | `true` if the key is there |
| `remove_key(map, key)` | removes a key and gives back its value |
| `length(map)` | how many keys |
| `copy(map)` | a separate copy |

## Counting with a map

A map is the natural way to count things:

```lzy
counts = {}
for word in split("the fox and the dog and the cat", " ")
    if contains(counts, word)
        counts[word] = counts[word] + 1
    else
        counts[word] = 1

for word in sort(keys(counts))
    say word + ": " + text(counts[word])
```

```output
and: 2
cat: 1
dog: 1
fox: 1
the: 3
```

## Going through a map

A `for` loop over a map gives its keys, in order:

```lzy
stock = { "apples": 4, "pears": 0 }
for fruit in stock
    say fruit, stock[fruit]
```

```output
apples 4
pears 0
```

## Common mistakes

A key that is not there. Check first with `contains()`:

```lzy-broken
stock = { "apples": 4 }
say stock["pears"]
```

```output
Lookup error in program.lzy, on line 2.

This map has no key "pears".

    say stock["pears"]
        ^^^^^

It has these keys: "apples"
```

A key after a dot that is also a keyword. Use square brackets instead:

```lzy-broken
question = { "ask": "What is 6 times 7?" }
say question.ask
```

```output
Syntax error in program.lzy, on line 2.

LZY expected a name after the '.'.

    say question.ask
                 ^^^

Write it like user.name, or use user["name"] for a key with spaces in it.
```

## See also

- [Lists](lists.md)
- [Specification: map keys are data, not names](../../../SPEC.md#44-map-keys-are-data-not-names)
