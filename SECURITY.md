# Security Policy

## Reporting a vulnerability

**Please do not open a public issue for a security problem.**

Report it privately through GitHub's
[private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
on this repository: **Security → Report a vulnerability**.

Please include:

- what the problem is, and what an attacker gets from it
- a `.lzy` file or set of steps that reproduces it
- the LZY version (`lzy --version`), your Python version and your OS
- anything you already know about a fix

### What to expect

| Step | Target |
|---|---|
| We acknowledge your report | within 3 working days |
| We tell you whether we agree it is a vulnerability | within 10 working days |
| We agree a disclosure date with you | once a fix is understood |
| We publish an advisory and credit you | on release, unless you prefer not |

LZY is an early project maintained by volunteers. These are the targets we
are aiming for, not a contractual guarantee. If you have not heard back
within the first window, please chase us — the report was probably missed,
not ignored.

We will not take legal action against anyone acting in good faith under this
policy.

---

## Supported versions

| Version | Supported |
|---|---|
| 0.0.x | Yes — the current line |
| Older | No |

While LZY is below 1.0 only the newest release is supported. Fixes go into
the next release rather than being backported.

---

## The security model, stated plainly

### What LZY 0.0.1 gives you

- **No access to the host.** There is no file, network, process, environment
  or foreign-function access in the language. A `.lzy` program has no route
  out of the interpreter.
- **Input is data.** Whatever `ask` reads is a text value. It is never parsed
  or run as code. LZY has no `eval`.
- **No third-party dependencies.** The interpreter uses only the Python
  standard library, so there is no dependency supply chain to compromise.
- **Enforced limits.** Source size, indentation depth, bracket depth, parser
  nesting, recursion depth and output size are all capped, in one place
  (`lzy/runtime/limits.py`). Reaching a limit is a normal LZY error, not a
  crash.
- **Secure randomness by default.** `random_number` uses the operating
  system's cryptographically secure generator. There is no seeded generator
  to reach for by mistake.
- **Tested against hostile input.** The suite includes 420 fuzz cases plus
  targeted tests for deep nesting, self-referential values, endless
  recursion and oversized input. The rule they enforce: whatever you feed
  LZY, it either runs it or reports an LZY error — it never crashes the
  process.

### What LZY 0.0.1 does not give you

**LZY is not a sandbox. Do not run untrusted LZY without real isolation.**

Specifically:

- **No time limit.** `while true` runs until you stop it.
- **No memory limit.** A program can build large lists inside the limits that
  do exist. Python integers are unbounded, so repeated multiplication can
  allocate a lot.
- **No fairness or scheduling.** LZY runs in your process and blocks it.
- **`--safe` is not a security boundary.** It tightens the limits above. It
  is a seatbelt, not a locked door.

To run code you do not trust, use isolation the operating system provides: a
separate process with CPU and memory caps, no network, a read-only filesystem
and an unprivileged user — a container or a VM. When the LZY playground is
built, it will be built that way, and not before.

---

## Security in the design

These are commitments for how LZY grows, not just descriptions of today.

**Safe defaults, always.** The easiest way to do something must be the safe
way. LZY will not ship an API like `run user_input` where a string becomes a
shell command. Process execution, when it arrives, will take its arguments as
a list.

**No ambient authority.** File and network access will be explicit at the
point of use. A library will not quietly read the filesystem because it can.

**Path handling.** File APIs will resolve and check paths, and traversal
outside an allowed root will be refused rather than silently followed.

**No home-made cryptography.** `crypto` will wrap vetted primitives with safe
defaults, and will not invent anything.

**Secrets stay out.** Nothing is committed to this repository that looks like
a credential, and CI is configured with least privilege.

**Deserialisation is not execution.** Reading JSON, or any future format,
will never construct arbitrary values or run code.

---

## Supply chain

- The interpreter has **zero runtime dependencies**.
- Development dependencies are declared in `pyproject.toml` under
  `[project.optional-dependencies] dev`.
- GitHub Actions workflows request the least privilege they need
  (`permissions: contents: read`).
- Dependabot watches GitHub Actions and Python dependencies.
- Releases, when they begin, will carry SHA-256 checksums, and signing is on
  the roadmap for 0.9.0.

---

## Hardening the language itself

Known weaknesses in LZY's own implementation, and what is done about them:

| Risk | Mitigation | Status |
|---|---|---|
| Parser stack exhaustion on nested input | Depth limits in the lexer and the parser | Done, tested |
| Deep evaluation on a shallow-parsing shape | Syntax tree depth measured after parsing | Done, tested |
| Deep evaluation across many calls | Total live-nesting limit while running | Done, tested |
| Runaway recursion in an LZY program | Call-depth limit, and Python's limit restored afterwards | Done, tested |
| A platform stack too small for LZY's own limits | Programs run on a thread with a stack LZY sets | Done, tested |
| A value that contains itself | Depth limits in `equal()` and `inspect()` | Done, tested |
| Oversized source or output | Character limits, both configurable | Done, tested |
| Memory exhaustion by allocation | Only partly addressed — `range` is capped, other growth is not | **Open** |
| Unbounded run time | Not addressed; a loop runs until stopped | **Open by design** |

Three of those rows exist because of a real crash rather than a theory. The
first CI run found that `say 1 + 1 + 1 + ...` killed the interpreter process
on Windows with CPython 3.9 and 3.10, which falsified the claim above that
LZY always reports rather than crashes. Raising Python's recursion limit does
not create stack — it only removes CPython's guard — and Windows gives the
main thread 1 MB. The fix bounds the syntax tree and the live nesting
directly, and runs programs on a stack LZY chooses. It is recorded as bug 007
in `tests/regression/test_regressions.py`.

The two open items are the reason the sandbox warning above exists. They will
be addressed before the playground ships, because the playground is the first
place LZY will run code that nobody trusts.

---

## What LZY is for

LZY is a general-purpose language. Its security examples in
`examples/04-security/` are written for **defensive and authorised** work:
analysing logs you already hold, checking configuration, assessing passphrase
strength before a passphrase is used, and turning alerts into something a
person can act on.

We will not accept contributions whose purpose is to attack systems the user
is not authorised to touch.
