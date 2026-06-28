"use strict";
/**
 * /api/agent/drafts — manage the pending AI-draft queue (drafts.json).
 *
 *   GET                    → { ok, drafts: [...] }
 *   POST { action:"discard", id }  → remove one pending draft
 *
 * Approving a draft is done client-side (the CMS inserts it into the content
 * draft, then the user Publishes); on approve the CMS also calls discard here
 * to clear it from the queue. Auth: x-admin-password. Env: GITHUB_TOKEN.
 */
const { getFileText, commitFiles } = require("../../lib/github");
const { timingSafeEqual, readBody } = require("../../lib/http");

const REPO = process.env.GITHUB_REPO || "BishalBhn/aiversedaily";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const DRAFTS_PATH = "drafts.json";

async function loadDrafts(token) {
  const raw = await getFileText(token, REPO, BRANCH, DRAFTS_PATH);
  if (!raw) return [];
  try { return JSON.parse(raw) || []; } catch (e) { return []; }
}

module.exports = async function handler(req, res) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!ADMIN_PASSWORD || !GITHUB_TOKEN) {
    res.status(500).json({ ok: false, error: "Server not configured: set ADMIN_PASSWORD and GITHUB_TOKEN." });
    return;
  }
  if (!timingSafeEqual(req.headers["x-admin-password"], ADMIN_PASSWORD)) {
    res.status(401).json({ ok: false, error: "Incorrect password." });
    return;
  }

  try {
    if (req.method === "GET") {
      res.status(200).json({ ok: true, drafts: await loadDrafts(GITHUB_TOKEN) });
      return;
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      if (body.action !== "discard" || !body.id) {
        res.status(400).json({ ok: false, error: "Expected { action: 'discard', id }." });
        return;
      }
      const drafts = await loadDrafts(GITHUB_TOKEN);
      const next = drafts.filter(function (d) { return d.id !== body.id; });
      if (next.length === drafts.length) {
        res.status(200).json({ ok: true, removed: false, drafts: next });
        return;
      }
      await commitFiles(GITHUB_TOKEN, REPO, BRANCH, [
        { path: DRAFTS_PATH, content: JSON.stringify(next, null, 2) + "\n" },
      ], "CMS: discard AI draft");
      res.status(200).json({ ok: true, removed: true, drafts: next });
      return;
    }
    res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message || "Drafts operation failed." });
  }
};
