---
name: daily-brief
description: Build a short daily brief from SYSTEM.md, open projects, inbox, and recent daily notes. Write it to outputs/briefs/.
---

# Daily Brief

## Vault

Default: `~/Documents/Brain`, or `BRAIN_VAULT` if set.

## Read first

1. `SYSTEM.md` — who I am and current focus
2. `lessons.md` — recent lessons
3. `projects/` — active projects only
4. `inbox/inbox.md` — backlog size and top items
5. Today's and yesterday's files in `daily/` if present

## Do

Write `outputs/briefs/YYYY-MM-DD.md` with:

```
# Daily brief — YYYY-MM-DD

## Focus
(from SYSTEM.md, one line)

## Top 3 actions
1.
2.
3.

## Project pulse
- project: status / blocker

## Inbox
N items waiting. Call out anything urgent.

## Watch outs
Risks, deadlines, or open loops.
```

Keep it under one screen. Then tell the user the file path.

## Rules

- Prefer concrete next actions over motivation.
- If there is no real work, say so. Do not invent tasks.
- Do not modify project files unless asked.
