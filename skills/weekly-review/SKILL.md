---
name: weekly-review
description: Produce a weekly review from daily notes, projects, outputs, and lessons. Write to outputs/reviews/.
---

# Weekly Review

## Vault

Default: `~/Documents/Brain`, or `BRAIN_VAULT` if set.

## Read first

1. `SYSTEM.md`
2. `lessons.md`
3. Last 7 days of `daily/`
4. `projects/`
5. Recent files in `outputs/`
6. `inbox/inbox.md`

## Do

Write `outputs/reviews/weekly-YYYY-MM-DD.md` (use today's date):

```
# Weekly review — week of YYYY-MM-DD

## What moved
## What stalled
## Decisions made
## Lessons worth keeping
## Next week focus (max 3)
## Inbox debt
```

Offer to append new lessons to `lessons.md` after the user approves.

## Rules

- Be specific. Quote file names and dates.
- Sample size honesty: if the week is empty, say the vault is quiet.
- Do not rewrite `SYSTEM.md` priorities unless asked.
