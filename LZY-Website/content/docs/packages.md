# Packages

LZY does not have packages, a package manager or a package registry. This is
deliberate: the roadmap puts packages late, because a package manager built
before the language settles is a package manager built twice.

## What exists today

- **One program is one file.** There are no modules or `import` yet, so there
  is nothing to package.
- **LZY itself** is distributed as a Python wheel on GitHub Releases. See
  [Download](/download/).
- **There is no project file.** No `lzy.toml`, no lock file, no dependency
  list. A folder of `.lzy` files is a complete project.

## What is planned

In the order the roadmap gives:

| Step | What | Planned |
|---|---|---|
| Modules | `import`, with rules for name clashes and circular imports, and no code run on import beyond the module's own top level | 0.2.0 |
| A standard library | `strings`, `math`, `collections`, `datetime`, `json` | 0.2.0 |
| Packages | `lzy.toml`, `lzy init`, `lzy add`, `lzy install` | 0.6.0 |
| Integrity | lockfiles, checksums, pinning and verification | 0.6.0 |
| A registry | only after a written threat model for it exists | 0.6.0 |

None of the commands in that table exist yet. They are named in the
[roadmap](/roadmap/) and may change before they arrive.

## Why so late

A package system decides how code from strangers reaches your machine. LZY's
roadmap asks for a written threat model before any registry exists, and for
the language itself to stop moving first. Until then, sharing LZY code means
sharing `.lzy` files.

## See also

- [Not in LZY yet](not-yet.md)
- [Roadmap: 0.6.0](/roadmap/#v0-6-0)
