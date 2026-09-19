# LZY Enhancement Proposals

A **LEP** is how a change to the LZY language gets decided.

It exists for one reason: a language that changes one convenient patch at a
time ends up as a pile of conveniences. Writing the proposal down forces the
question "what does this cost?" to be answered before the code is written,
and leaves a record of why the language is the way it is.

## When you need one

**You need a LEP to:**

- add or change syntax
- change what an existing program means
- add or change a type, or how values behave
- add a keyword or a reserved word
- change the scoping, evaluation or error rules
- change the standard library's shape (not just add to it)

**You do not need a LEP to:**

- fix a bug, where the fix makes the code match the specification
- improve an error message
- add tests, documentation or examples
- refactor without changing behaviour
- add a built-in function that fits the existing pattern — open an issue

If you are unsure, open an issue and ask. That is cheaper than writing a LEP
nobody wanted, and much cheaper than merging a change nobody thought about.

## How it works

1. **Discuss.** Open an issue first. Somebody may have tried it already.
2. **Write.** Copy [`0000-template.md`](0000-template.md) to
   `NNNN-short-name.md`, using the next free number.
3. **Propose.** Open a pull request with the LEP alone, and no
   implementation. This keeps the argument about the idea.
4. **Decide.** Maintainers accept, reject or ask for changes. A rejected LEP
   stays in the repository with its reasoning, because "we considered this
   and here is why not" is worth as much as a yes.
5. **Implement.** Once accepted, update in this order: specification,
   grammar, parser, tests, examples, documentation. The LEP moves to
   `Status: Final` when the release that carries it ships.

## Statuses

| Status | Meaning |
|---|---|
| `Draft` | Being written; not ready to be judged |
| `Proposed` | Ready for a decision |
| `Accepted` | Agreed, not yet implemented |
| `Final` | Implemented and released |
| `Rejected` | Not going ahead; the reasoning is kept |
| `Withdrawn` | The author stopped pursuing it |
| `Superseded` | Replaced by a later LEP, which is named |

## What makes a good LEP

The **Alternatives** and **Security implications** sections are the ones that
decide most proposals. A LEP that says "here is the strongest argument
against this, and here is why I still think it is right" gets taken more
seriously than one that pretends the trade-off does not exist.

Keep examples small enough to read, and show the error message a user would
get when they use the feature wrongly.

## Index

| LEP | Title | Status |
|---|---|---|
| — | *No proposals yet.* | |

The changes most likely to need the first LEPs are listed under
**Next recommended work** in [PROJECT_STATUS.md](../../PROJECT_STATUS.md):
error handling, anonymous functions and compound assignment.
