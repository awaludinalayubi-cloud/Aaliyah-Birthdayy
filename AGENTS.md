# AGENTS.md

## What this repo is

Not a code repo. It contains one document: `DESIGN.md`, a Meta design-system analysis written in the `@google/design.md` format (YAML token frontmatter + prose). `README.md` is a pointer stub to getdesign.md — ignore it for content.

## Working with DESIGN.md

- The YAML frontmatter (lines 1–349) is the source of truth for tokens: `colors`, `typography`, `rounded`, `spacing`, `components`. Prose below references tokens via `{colors.primary}`, `{typography.body-md}`, etc.
- When editing, reference token names verbatim — do not paraphrase or inline raw values in prose (see "Iteration Guide" in DESIGN.md).
- New component states belong as separate `components:` entries (`-pressed`, `-disabled`, `-focused`), not prose.
- Validate after edits:
  ```
  npx @google/design.md lint DESIGN.md
  ```
- Documented convention: no hover states (default/pressed/active only); `{rounded.full}` pills for all buttons; cobalt `{colors.primary}` reserved for buy-now CTAs only.

## Layout

- `DESIGN.md` — the only meaningful file; token frontmatter + analysis prose.
- `README.md` — stub pointing to https://getdesign.md/meta/design-md.

No build, test, or CI setup exists. No git repo initialized.