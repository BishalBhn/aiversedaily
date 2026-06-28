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

When you’re happy, click **Publish ↓**. That downloads a new `content.js`. Replace the `content.js` in this folder with the downloaded one (or commit it) and redeploy. That’s the publish step.

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

The whole site is HTML + CSS + JS. There is **no server and no database** — Vercel just serves files. Dynamic-feeling pieces are handled without a backend: content comes from `content.js`, and forms POST directly to Formspree. That's why it's fast, free to host, and has nothing to break in production.

## Production files included

- `vercel.json` — clean URLs, asset caching, `/admin` set to noindex.
- `robots.txt` + `sitemap.xml` — search-engine ready.
- `site.webmanifest` + app icons — installable / proper icons on mobile.
- `404.html` — branded not-found page (served automatically by Vercel).
