---
name: inbox-processor
description: Process the vault inbox. Sort items into notes, projects, daily, or archive. Clear what was handled.
---

# Inbox Processor

## Vault

Default: `~/Documents/Brain`, or `BRAIN_VAULT` if set.

## Read first

1. `SYSTEM.md`
2. `lessons.md`
3. `inbox/inbox.md`
4. Existing folders under `notes/`, `projects/`, `daily/`

## Do

For each unchecked or new inbox line:

1. Decide the destination:
   - lasting knowledge → `notes/<short-slug>.md`
   - active work → `projects/<name>/` (create from `projects/_template.md` if needed)
   - today-only → append to `daily/YYYY-MM-DD.md`
   - noise / done → `archive/` or delete with a note
2. Write the file. Keep titles short.
3. Mark the inbox line done, or remove it once filed.
4. Report a short summary: filed N, skipped N, needs-decision N.

## Rules

- Do not invent facts.
- Do not create projects for one-line thoughts. Prefer `notes/`.
- Ask only when the destination is genuinely unclear.
- Never wipe the whole inbox without processing each item.
