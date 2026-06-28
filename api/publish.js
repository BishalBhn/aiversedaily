"use strict";
/**
 * POST /api/publish  — publish content live by committing to GitHub.
 *
 * Auth:  header `x-admin-password` must equal env ADMIN_PASSWORD.
 * Action: writes content.js + content.json + a freshly pre-rendered index.html
 *         to the repo in ONE atomic commit. Vercel auto-redeploys from it.
 *
 * Required env vars (set in the Vercel dashboard / `vercel env add`):
 *   ADMIN_PASSWORD   the CMS publish password
 *   GITHUB_TOKEN     fine-grained PAT with Contents: read & write on this repo
 *   GITHUB_REPO      "owner/name"   (default: BishalBhn/aiversedaily)
 *   GITHUB_BRANCH    branch to commit to (default: main)
 */
const { renderInto, contentJs } = require("../lib/prerender");
const { getFileText, commitFiles } = require("../lib/github");
const { timingSafeEqual, readBody } = require("../lib/http");

const REPO = process.env.GITHUB_REPO || "BishalBhn/aiversedaily";
const BRANCH = process.env.GITHUB_BRANCH || "main";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!ADMIN_PASSWORD || !GITHUB_TOKEN) {
    res.status(500).json({ ok: false, error: "Server not configured: set ADMIN_PASSWORD and GITHUB_TOKEN env vars." });
    return;
  }

  if (!timingSafeEqual(req.headers["x-admin-password"], ADMIN_PASSWORD)) {
    res.status(401).json({ ok: false, error: "Incorrect password." });
    return;
  }

  let content;
  try {
    content = await readBody(req);
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message || "Invalid request body." });
    return;
  }
  if (!content || typeof content !== "object" || Array.isArray(content) || !content.site) {
    res.status(400).json({ ok: false, error: "Content must be an object with a `site` key." });
    return;
  }

  try {
    // Re-render index.html (SEO fallback) from the latest committed copy.
    const currentIndex = await getFileText(GITHUB_TOKEN, REPO, BRANCH, "index.html");
    const newIndex = renderInto(currentIndex || "", content);

    const sha = await commitFiles(GITHUB_TOKEN, REPO, BRANCH, [
      { path: "content.js", content: contentJs(content) },
      { path: "content.json", content: JSON.stringify(content, null, 2) + "\n" },
      { path: "index.html", content: newIndex },
    ], "CMS: publish content update");

    res.status(200).json({ ok: true, commit: sha, message: "Published. The site will redeploy in ~30s." });
  } catch (e) {
    const status = e.status === 401 || e.status === 403 ? 502 : 500;
    res.status(status).json({ ok: false, error: "Publish failed: " + (e.message || "unknown error") });
  }
};
