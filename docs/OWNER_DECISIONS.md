# Owner Decisions

Decisions that belong to the project owner rather than to whoever happens to
be writing code. Each one is recorded with its options and its reasoning, so
that it is made once and not re-argued every session.

**Open decisions** need an answer. **Settled decisions** are closed; work
follows them without asking again unless new evidence turns up.

---

## Open

None. Both decisions that were open at 0.0.1 have been made and are recorded
below.

---

## Settled

These were decided while building 0.0.1. They are recorded so they are not
reopened without new evidence. Each is also reflected in
[SPEC.md](../SPEC.md).

### D-001 — Licence: Apache-2.0 ✅

**Decided:** Apache License 2.0, on 2026-09-19. The owner asked for a
recommendation to be chosen, and Apache-2.0 was the standing recommendation.

**Why.** For a programming language, the explicit patent grant in Apache-2.0
is worth more than the brevity of MIT. Section 3 grants every user a patent
licence from every contributor, and withdraws it from anyone who sues over
patents — which is exactly the protection an organisation looks for before
adopting a new language. Swift, Kotlin and Rust all landed in the same place.

This was decided before the first outside contribution, which was the last
moment it could be changed without every contributor's consent.

**What changed.** `LICENSE` now holds the verbatim Apache-2.0 text, with its
appendix left as the template as Apache recommends. A `NOTICE` file carries
the copyright attribution, which Apache-2.0 section 4(d) requires
downstream users to reproduce.

**Note.** `pyproject.toml` had already been written with the
`License :: OSI Approved :: Apache Software License` classifier while
`LICENSE` still held MIT text. That mismatch existed between the two 0.0.1
commits and is resolved by this decision; the metadata and the licence file
now agree.

---

### D-002 — Copyright holder: Rishav Kumar ✅

**Decided:** `Copyright 2026 Rishav Kumar`, on 2026-09-19, by the owner.

**Why.** The owner asked to be named. Ownership is then unambiguous, which
matters if the project is ever relicensed, transferred or donated to a
foundation.

**What changed.** The `NOTICE` file names Rishav Kumar as the copyright
holder, and `pyproject.toml` names him as the author. Later contributors
keep copyright in their own contributions under Apache-2.0 section 5; if a
list of them is ever wanted, it goes in an `AUTHORS` file rather than in
`NOTICE`.

---

### D-003 — Conditions require a real yes/no value ✅

**Decided:** no truthiness. `if count` is an error; `if count != 0` is not.

**Why.** Truthiness is a large, quiet source of bugs — the cases where `0`,
`""` and an empty list behave like `false` are exactly the cases people get
wrong. The cost is a short comparison. The benefit is that a condition always
says what it tests, which matters more in a language meant to be read by
beginners. The error message suggests the comparison to write.

**Revisit if:** teaching LZY to real beginners shows this blocks them rather
than helping them.

---

### D-004 — `1 + "1"` is an error ✅

**Decided:** no implicit conversion between numbers and text.

**Why.** Every language that guesses here surprises someone. `+` in LZY means
one thing at a time: add two numbers, join two pieces of text, or join two
lists. Because this is the most common beginner mistake, it gets LZY's
clearest error, complete with the corrected line.

---

### D-005 — Indentation must use spaces ✅

**Decided:** a tab in a line's indentation is an error.

**Why.** A tab is displayed differently by different editors. A language
whose blocks *are* its indentation cannot let the same file look different in
two places, and a beginner cannot debug what they cannot see. Rejecting tabs
outright, with a message that says what to do, is kinder than accepting them
and producing mysterious behaviour.

---

### D-006 — Only a function call creates a scope ✅

**Decided:** `if`, `for` and `while` bodies do not create scopes. Assignment
writes to the nearest scope that already has the name, and creates the name
in the current scope otherwise.

**Why.** This makes the obvious thing work:

```lzy
if ready
    message = "yes"
say message
```

Block scoping would throw `message` away and confuse everyone who tried it.
The chosen assignment rule also makes counters and closures work without
needing a `global` or `nonlocal` keyword. The cost is that a function can
write to a global by accident; that is a real hazard, but it is predictable
and easy to explain, which the alternatives were not.

**Revisit if:** accidental global writes become a common, reported bug.

---

### D-007 — One numeric type ✅

**Decided:** there is one `number` type. Whole numbers and real numbers are
the same type; `6 / 2` is `3`, and `4.0 == 4` is `true`.

**Why.** The int/float split causes a steady stream of beginner confusion for
no benefit in a dynamically typed language at this stage. Internally, whole
values are held as integers, which keeps them exact and unbounded.

**Revisit if:** the bytecode VM in 0.5.0 shows a performance reason to make
the distinction visible — it almost certainly will not.

---

### D-008 — Map keys are matched exactly, then folded ✅

**Decided:** `map["Name"]` is always exact. `map.name` tries the exact key
first, then falls back to a case-insensitive match, and is an error if more
than one key matches.

**Why.** Names in LZY are case-insensitive, but map keys are *data* — they
may have come from a file or an API, where case is meaningful and not the
programmer's to change. Making `.name` convenient without making `[...]`
ambiguous gets both. Refusing to guess between two matching keys is
important: silently picking one would be a bug that only shows up in
production data.

---

### D-009 — The interpreter has no runtime dependencies ✅

**Decided:** LZY's interpreter uses only the Python standard library.

**Why.** Nothing to audit, nothing to break, and `pip install` cannot fail
for reasons outside the project. For a language whose security story matters,
an empty dependency tree is the strongest supply-chain position available.
Development dependencies (pytest, ruff, coverage) are separate and are not
needed to run LZY.

**Revisit if:** a dependency earns its place on evidence, and survives a
security review.

---

### D-010 — Reserved words are refused as names ✅

**Decided:** words LZY expects to need later (`class`, `import`, `async`,
`match`, and others listed in SPEC.md §5.2) cannot be used as names today.

**Why.** Adding a keyword later is otherwise a breaking change for everyone
who happened to use that word. Refusing them now, with a message that
suggests an alternative, costs a beginner nothing and keeps the future open.

---

## Decisions that are not the owner's

For completeness, so nobody waits on an answer that is not needed:
ordinary implementation choices, refactors, test coverage, documentation
wording, bug fixes and anything already covered by a settled decision above
are made by whoever is doing the work.

Anything that changes **what an existing program means** is neither — it goes
through a LEP in [`docs/leps/`](leps/).
