# Justice & The Next 250 — Site Redesign Prototype

Design prototype and evaluation for the [justice250.org](https://www.justice250.org/) Wix refresh, built to the JN250 2026 Brand Guidelines.

## Contents

| File | What it is |
|------|------------|
| `index.html` | Interactive redesign prototype — fully self-contained (fonts, hero video, logo, and cloud assets are embedded as data URIs). Open directly in a browser. |
| `evaluation.html` | Site evaluation & recommendations document: audit findings, Wix build instructions for the new sections, and prioritized interactive upgrades. |
| `assets/hero_web.mp4` | Web-compressed hero background video (1600px, ~1.5 MB, from the 4K source) — upload this version to Wix, not the raw 4K file. |
| `assets/jn250_logo.svg` | Official stacked logo (vector, recolorable single fill). |

## Page structure

Mirrors the original site's flow, with the new sections slotted in:

1. Hero (video background + logo)
2. About Justice & The Next 250
3. Why This Campaign? Why Now? — *blue section*
4. **Campaign Updates** (new — Wix Blog in the live build)
5. Get Involved — *orange section*
6. Host an Event — *yellow section, animated clouds*
7. **Events** (new — Wix Events in the live build)
8. **Media** (new — YouTube embeds in the live build)
9. Newsletter signup

All pre-existing site copy is preserved verbatim. Sample posts, events, and videos are placeholders.

## Editing the site (for the campaign team)

The site has a built-in editor at **`/admin.html`** — no coding needed:

- **Site text** — change any wording on the page
- **Images** — swap the About photo (and add images to blog posts)
- **Blog posts** — fill out a simple form (title, category, preview, full text, image) and the post appears on the site; clicking a card opens the full post
- **Events** — add/edit the rows in "Show up for the next 250," reorder them, mark past events
- **Videos** — paste a YouTube link + title; the site shows the video thumbnail with a play button (first video is featured large)

Visit **`/admin`** on the deployed site, log in with the editor password, make changes, and hit **PUBLISH CHANGES** — the live site updates in about a minute.

### Vercel setup (one time, done by whoever deploys)

1. Import this repo into Vercel (no build settings needed — it's a static site with `/api` functions).
2. Vercel dashboard → **Storage → Create Database → Blob** → connect it to this project (Vercel adds the storage credentials automatically).
3. Project → Settings → Environment Variables: add **`ADMIN_PASSWORD`** — the password the campaign team will use to log in at `/admin`.
4. Redeploy. Done — editors only ever need the URL and the password. Nothing expires, nothing to rotate.

Under the hood: published content and uploaded images live in Vercel Blob storage; the serverless functions in [`api/`](api/) verify the password and read/write it. Publishes are live immediately — no redeploy involved. The [`content.json`](content.json) in this repo is only the seed/default used before the first publish.

## Notes

- Colors are exact brand hex values (Sky Blue / Joy Orange / Mustard ramps + charcoal `#434343`).
- Typography is fully brand-accurate: headings use the real Dingos Stamp and body/label type is the real IBM Plex Mono (both embedded).
- A campaign of [The Just Trust](https://thejusttrust.org/).
