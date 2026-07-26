## Obsidian + Hermes: Your Self-Improving Ai Brain

<p align="center">
  <a href="https://x.com/_0xpainn"><img src="https://img.shields.io/badge/Follow%20%40_0xPainn%20on%20X-000000?style=for-the-badge&logo=x&logoColor=white" alt="Follow @_0xpainn on X"></a>  
  <a href="https://github.com/Harlihm/Your-Self-Improving-AI-Brain/stargazers"><img src="https://img.shields.io/github/stars/Harlihm/Your-Self-Improving-AI-Brain?style=for-the-badge&color=0071e3&logo=github&logoColor=white" alt="GitHub stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-0071e3?style=for-the-badge" alt="MIT License"></a>
</p>

![Hermes-Agent + Obsidian Header](assets/header.jpg)

![Self-Improving AI Brain Logo](assets/logo.jpg)

## What this is

A second brain that **stores** knowledge in Obsidian and **acts** on it with Hermes Agent.

You dump ideas into an inbox, track projects, take daily notes. Hermes reads that vault, runs skills (daily brief, inbox cleanup, project health, weekly review), and writes results back into your files. Over time, lessons get saved so the system gets better the more you use it.

Obsidian = permanent memory. Hermes = the worker. OpenRouter = the AI models (free tier works).

## The problem

- Obsidian is great at storing notes, but it can't do anything with them.
- AI chat tools can do work, but they forget everything between sessions.
- Most "second brain" setups become graveyards: capture is easy, follow-through isn't.

This bridges both sides: lasting memory in your vault + an agent that reads it, acts on it, and writes what it learned back.

## Install

**1. Install [Node.js](https://nodejs.org) (v18+), [Obsidian](https://obsidian.md), and a free [OpenRouter](https://openrouter.ai) API key.**

**2. Install Hermes and this repo:**

```shell
npm install -g hermes-agent
git clone https://github.com/Harlihm/Your-Self-Improving-AI-Brain.git
cd Your-Self-Improving-AI-Brain
npm run setup
```

**3. Add your key** (Mac / Linux):

```shell
echo 'export OPENROUTER_API_KEY="sk-or-..."' >> ~/.zshrc
source ~/.zshrc
```

Windows: add a user environment variable named `OPENROUTER_API_KEY`.

**4. Open the vault**

Obsidian → **Open folder as vault** → `~/Documents/Brain`

Edit `SYSTEM.md` with who you are and what you're working on.

**5. Run it**

```shell
hermes
```

Then try:

```
use the daily-brief skill
use the inbox-processor skill
use the project-health skill
use the weekly-review skill
use the learn skill
```



## What you get


| Folder             | Purpose                     |
| ------------------ | --------------------------- |
| `inbox/`           | Capture anything            |
| `notes/`           | Lasting knowledge           |
| `projects/`        | Active work                 |
| `daily/`           | Daily notes                 |
| `outputs/`         | Hermes briefs and reviews   |
| `lessons.md`       | What improved over time     |
| `modules/content/` | Optional X content workflow |




## Skills

- **inbox-processor** — sorts the inbox into notes and projects
- **daily-brief** — today's focus and top actions
- **project-health** — blockers and stale work
- **weekly-review** — what moved, what stalled, next focus
- **learn** — writes a lesson back into `lessons.md`



## Optional: content module

If you publish on X, see `modules/content/README.md` inside the vault.

```shell
npm run new-post -- "topic"
npm run log -- <slug> --views N --likes N --bookmarks N
npm run archive -- <slug>
```



## License

MIT
