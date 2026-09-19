# LEP-0000: Title

| | |
|---|---|
| **Status** | Draft |
| **Author** | Your name or handle |
| **Created** | YYYY-MM-DD |
| **Target version** | e.g. 0.1.0 |
| **Supersedes** | — |
| **Superseded by** | — |

> Copy this file to `NNNN-short-name.md` and fill in every section. If a
> section genuinely does not apply, write "None, because ..." rather than
> deleting it — the reader needs to know you thought about it.

## Problem

What cannot be done today, or what is done badly? Show real LZY code that is
awkward or impossible. One paragraph and one example is usually enough.

## Motivation

Who is hurt by this, and how often? An annoyance that shows up in every
program is worth more than one that shows up in a rare case.

Say explicitly which kind of LZY user this helps: a beginner, someone writing
an algorithm, someone building an application, or someone automating
security work.

## Proposal

What changes, stated plainly enough that someone could implement it from this
section alone.

## Syntax

The exact grammar, in the notation used by `docs/spec/grammar.ebnf`, plus
examples of how it is written:

```text
# before
...

# after
...
```

## Semantics

What it means when it runs. Cover:

- the ordinary case
- what happens at the edges (empty, zero, nothing, nesting)
- how it interacts with scope, case-insensitivity and the type rules
- what is an error, and what the error message says

Show the error message. In LZY, the error is part of the feature.

## Alternatives

Other ways to solve the same problem, including **doing nothing**, and why
each is worse. Be fair to them. If you cannot argue the other side, you do
not understand the trade-off yet.

## Security implications

Does this give a program any new reach — over files, the network, processes,
memory or time? Does it make any existing safe default easier to get wrong?
Does it add a way to make the interpreter do unbounded work?

If the answer to all of those is no, say so and say why.

## Compatibility

Does an existing LZY program change meaning or stop working? If yes:

- exactly which programs
- how someone finds out theirs is affected
- what they do about it
- whether the linter or formatter can fix it automatically

Before 1.0 a breaking change is allowed. It still has to be worth it, and it
still goes in the changelog.

## Implementation

Which parts of the codebase change, roughly, and in what order. Note anything
that looks harder than it sounds.

## Tests

What proves this works, and what proves it fails properly. Name the cases,
including the ones you expect to be forgotten.

## Documentation

What has to be updated: SPEC.md sections, the grammar, `docs/learn/`,
examples, README.

## Open questions

Anything you have not settled. It is fine to propose a LEP with open
questions; it is not fine to hide them.
