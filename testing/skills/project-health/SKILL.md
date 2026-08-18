---
name: project-health
description: Review active projects, flag blockers and stale work, write a status report to outputs/reviews/.
---

# Project Health

## Vault

Default: `~/Documents/Brain`, or `BRAIN_VAULT` if set.

## Read first

1. `SYSTEM.md`
2. Every folder and markdown file under `projects/`
3. Recent `lessons.md` entries that mention projects

## Do

Write `outputs/reviews/project-health-YYYY-MM-DD.md`:

For each active project:
- Goal (one line)
- Status
- Next action (or "none set")
- Blocker, if any
- Stale? (no updates in 14+ days)

End with:
- Move to archive candidates
- Suggested next actions across all projects (max 5)

## Rules

- Active means `status: active` in front matter, or anything not archived.
- Do not rewrite project files unless the user asks to apply suggestions.
- Never invent progress.
