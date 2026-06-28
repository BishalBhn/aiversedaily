# AIverse Daily

A cinematic, content-driven AI media site with a built-in CMS. No backend, no build step — deploy the folder anywhere static.

> **Tagline:** Today’s AI, made clear.

## What’s in here

```
aiverse-daily/
├─ index.html        The website (renders from content.js)
├─ styles.css        All site styles
├─ app.js            Renders the site + interactions (theme, parallax, forms)
├─ content.js        ← THE ONLY FILE YOU EDIT FOR CONTENT (source of truth)
├─ content.json      Same content as JSON (for import/export/portability)
├─ build.js          Pre-renders content into index.html for SEO / no-JS crawlers
├─ admin/
│  ├─ index.html     The CMS dashboard  → open /admin/
│  ├─ admin.css
│  └─ admin.js
└─ assets/           Logo, favicon, social avatar (PNG + SVG)
```

## Run it locally

Because the site loads `content.js` and the CMS uses a live preview, run a tiny local server (don’t just double-click the file):

```bash
cd aiverse-daily
python3 -m http.server 8080
```

Then open:

- Website → http://localhost:8080/
- CMS → http://localhost:8080/admin/

## Editing content — two ways

**A. The CMS (recommended).** Open `/admin/`. Every part of the site is editable from the sidebar: Site & SEO, Social links, Navigation, Hero, Stories, Newsletter, Tutorials, Podcast, Contribute, About, Footer. Add, reorder, duplicate, or delete cards. Changes autosave to a draft and show in the live preview.

When you’re happy, click **Publish ↓** and enter the publish password. The CMS sends the content to `/api/publish`, which commits a fresh `content.js`, `content.json`, and a re-rendered `index.html` to GitHub in one commit. Vercel auto-redeploys, and the change is live in ~30 seconds. No manual file editing.

> **Editing by hand instead?** Edit `content.js` directly, run `node build.js` to refresh the SEO fallback in `index.html`, then commit both and push. Same result.

### One-time setup for live publishing

The publish endpoint needs two secrets, set as Vercel environment variables (Project → Settings → Environment Variables, or `vercel env add`):

| Variable | What it is |
| --- | --- |
| `ADMIN_PASSWORD` | The password the CMS asks for before publishing. |
| `GITHUB_TOKEN` | A GitHub **fine-grained** personal access token, scoped to this repo, with **Contents: Read and write**. |

Optional: `GITHUB_REPO` (default `BishalBhn/aiversedaily`) and `GITHUB_BRANCH` (default `main`).

After setting them, redeploy once so the function picks them up. Until they’re set, the site still works — only the Publish button is inactive.

## AI Assistant (chat + voice) and the auto-writer

Open `/admin/` → **AI Assistant** (top of the sidebar).

- **Chat / voice editor** — type or tap 🎙 and speak an instruction ("change the hero headline to…", "add a blog about open-source models", "remove the third tutorial"). The assistant edits your draft and updates the live preview. Nothing goes live until you click **Publish ↓**.
- **Auto-written blog drafts** — a scheduled writer researches a current AI story with web search and writes one post every ~2 days into a pending queue (`drafts.json`). They appear under **AI blog drafts** for you to **Approve & add** (drops it into the Blog section to review, then Publish) or **Discard**. Nothing is auto-published.

These features need two more env vars (in addition to `ADMIN_PASSWORD` + `GITHUB_TOKEN` above):

| Variable | What it is |
| --- | --- |
| `ANTHROPIC_API_KEY` | Your Claude API key (from [platform.claude.com](https://platform.claude.com)). Powers both the chat agent and the auto-writer. |
| `CRON_SECRET` | Any random string. Vercel sends it to the cron job so only Vercel can trigger the auto-writer. |

The auto-writer runs on a Vercel Cron (`vercel.json` → `crons`, daily at 09:00 UTC) and self-gates to roughly every two days. Model defaults to `claude-opus-4-8`; override with the optional `CLAUDE_MODEL` env var. Voice input uses the browser's built-in speech recognition (Chrome/Edge/Safari).

> **Why commit instead of a live database?** The site stays fully static: fast, cheap to host, SEO-pre-rendered, and every publish is a normal git commit you can review or roll back. `build.js` and `/api/publish` share one renderer (`lib/prerender.js`) so the SEO fallback can never drift from what’s published.

- **Preview ↗** opens the site using your unsaved draft.
- **Export JSON** / **Import** move content between machines or back it up.
- **Revert** discards your draft and returns to the published content.

**B. By hand.** Open `content.js` and edit the values directly. Same result.

## Connect the social links

Open the CMS → **Social links**, and paste each profile URL (or just the handle) for Instagram, Facebook, YouTube, and LinkedIn. Empty fields stay hidden. Publish. The footer icons appear automatically. (You can also edit `site.social` in `content.js`.)

## Deploy (live in minutes)

Any static host works. Fastest:

- **Netlify Drop** — drag the `aiverse-daily` folder onto https://app.netlify.com/drop.
- **Vercel / Cloudflare Pages / GitHub Pages** — point them at this folder; no build command needed.

After deploy, update `site.url` and the social-preview image path in `index.html` (`og:image`) if you want link previews to use your own cover.

## Notes

- **Podcast audio:** add a real file URL in CMS → Podcast → *Audio URL*. The on-page player is a visual preview until then.
- **Forms** (newsletter, pitch, contact) validate on the front end. Wire them to a backend or a service like Formspree when ready.
- **Logo & avatar** live in `assets/`. Use `aiverse-avatar-1080.png` as the profile picture on all four social platforms.
- Respects dark/light toggle, reduced-motion, and keyboard focus out of the box.

## Go-live checklist (Vercel)

1. **Deploy.** From this folder: `npx vercel` then `npx vercel --prod` (or push to GitHub and import on vercel.com). No build command — it's a static site.
2. **Set your domain everywhere** (for correct link previews + sitemap):
   ```bash
   python3 set-domain.py https://your-domain.com
   ```
   This updates `index.html` (canonical + Open Graph), `robots.txt`, `sitemap.xml`, `content.js`, and `404.html`. Re-deploy after running it.
3. **Connect forms** (so signups/pitches reach you): create free forms at [formspree.io](https://formspree.io), then in `/admin/` → **Forms**, paste each form ID. Publish. Until then, forms run in demo mode (success message, nothing sent).
4. **Connect social links:** `/admin/` → **Social links** → paste your profile URLs → Publish.
5. Done. Share the URL.

## What "static" means here

The site itself is **plain HTML + CSS + JS** — Vercel just serves files, so it's fast and cheap. There's no database. The only server-side code is a single serverless function, `/api/publish`, used **only when you click Publish** in the CMS: it commits your content to GitHub so Vercel can redeploy. Visitors never touch it. Content comes from `content.js`, and forms POST directly to Formspree. Nothing dynamic runs on a normal page view.

## Production files included

- `vercel.json` — clean URLs, asset caching, `/admin` set to noindex.
- `robots.txt` + `sitemap.xml` — search-engine ready.
- `site.webmanifest` + app icons — installable / proper icons on mobile.
- `404.html` — branded not-found page (served automatically by Vercel).
