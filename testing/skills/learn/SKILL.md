---
name: learn
description: Capture a lesson from recent work and append it to lessons.md so the brain improves over time.
---

# Learn

The self-improvement loop. Use after a win, a failure, or a review.

## Vault

Default: `~/Documents/Brain`, or `BRAIN_VAULT` if set.

## Read first

1. `lessons.md`
2. The files the user points at (review, project, draft, chat summary)

## Do

1. Distill one lesson in one sentence. Actionable, not vague.
2. Show it to the user before writing.
3. On approval, append a row to `lessons.md`:

| YYYY-MM-DD | lesson text | source file or context |

4. If the lesson changes how Hermes should behave long-term, propose a one-line edit to `SYSTEM.md` and wait for approval.

## Rules

- One lesson per run unless asked for more.
- Prefer "do X when Y" over "be better at Z".
- Never delete old lessons.
- Never invent outcomes the user did not confirm.
