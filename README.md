# Joe Solves Tech

Landing page for an AI and no-code consulting practice for small businesses.

**Live:** https://joe-solves-tech.vercel.app

## What's here

| File | What it is |
|---|---|
| `joe-solves-tech.html` | The site. One self-contained file. |
| `joe-solves-tech-before.html` | The version before the design pass, kept for comparison. |
| `compare.html` | Side-by-side viewer for the two, with synced scrolling. |
| `.claude/serve.js` | Small static server for local preview. |
| `.claude/launch.json` | Dev server config. Paths are machine-specific. |

## Running it locally

```bash
node .claude/serve.js
```

Then open http://localhost:8000. The `compare.html` viewer needs to be served
over HTTP rather than opened from disk — it reads into both frames to sync
their scrolling, which browsers block for `file://` pages.

## How it's built

No build step, no dependencies, no framework. One HTML file with inline CSS and
JavaScript. The only external resources are Google Fonts and a hero photograph
from Unsplash, and the page still renders if either fails to load.

**Design system.** Five colours, and everything else is derived from them:

| Token | Value | Role |
|---|---|---|
| `--ink` | `#000000` | text |
| `--bg` | `#F7F7F7` | ground |
| `--accent` | `#007AFF` | links and calls to action |
| `--violet` | `#5566F5` | brand gradient, head |
| `--rose` | `#E0A6C6` | brand gradient, tail |

Type runs on a six-step scale. Spacing follows a 2px-based scale
(2 · 4 · 6 · 10 · 12 · 16 · 20 · 40 · 60 · 80 · 120).

**Constraints the page holds to.** It works with JavaScript disabled — nothing
is hidden behind a scroll observer that JavaScript alone can reveal. Animation
is limited to `transform` and `opacity`, apart from one stroke-dash draw that
runs once. There are no external JavaScript libraries. `prefers-reduced-motion`
is respected throughout.

## Deploying

```bash
mkdir -p .deploy/joe-solves-tech
cp joe-solves-tech.html .deploy/joe-solves-tech/index.html
cd .deploy/joe-solves-tech && vercel deploy --prod --yes
```

## Status

Early. The three project cards are labelled example builds rather than client
work, the pricing is provisional, and the reviews section is deliberately an
empty state until there is something real to put in it.
