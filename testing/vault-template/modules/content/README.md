# Content module (optional)

X content workflow, kept separate from the core brain.
Use it only if you publish. Ignore this folder otherwise.

## Folders

- `_templates/run-folder/` — blank post templates
- `runs/active/` / `runs/archive/` — posts in progress / done
- `stores/inbox.md` — content ideas
- `stores/feedback/post-log.md` — views, likes, bookmarks
- `voice/` — writing rules
- `workflows/` — playbooks

## Commands (from the repo root)

```shell
npm run new-post -- "topic words" --pillar 1
npm run log -- <slug> --views N --likes N --bookmarks N
npm run archive -- <slug>
```

These scripts look under `modules/content/` inside your vault.
