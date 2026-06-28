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
const crypto = require("crypto");
const { renderInto, contentJs } = require("../lib/prerender");

const REPO = process.env.GITHUB_REPO || "BishalBhn/aiversedaily";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const API = "https://api.github.com";

function timingSafeEqual(a, b) {
  const ab = Buffer.from(String(a == null ? "" : a));
  const bb = Buffer.from(String(b == null ? "" : b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function readBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  if (typeof req.body === "string" && req.body) {
    try { return Promise.resolve(JSON.parse(req.body)); } catch (e) { return Promise.reject(new SyntaxError("Invalid JSON")); }
  }
  return new Promise(function (resolve, reject) {
    let raw = "";
    req.on("data", function (c) {
      raw += c;
      if (raw.length > 2_000_000) { reject(new Error("Payload too large")); req.destroy(); }
    });
    req.on("end", function () {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(new SyntaxError("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

async function gh(token, method, path, body) {
  const res = await fetch(API + path, {
    method: method,
    headers: Object.assign(
      {
        Authorization: "Bearer " + token,
        Accept: "application/vnd.github+json",
        "User-Agent": "aiverse-daily-cms",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body ? { "Content-Type": "application/json" } : {}
    ),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch (e) { json = { raw: text }; }
  if (!res.ok) {
    const err = new Error("GitHub " + method + " " + path + " → " + res.status + " " + (json.message || ""));
    err.status = res.status;
    throw err;
  }
  return json;
}

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

  const [owner, repo] = REPO.split("/");
  try {
    // Current index.html → apply the pre-render transform in memory.
    const idxFile = await gh(GITHUB_TOKEN, "GET", `/repos/${owner}/${repo}/contents/index.html?ref=${BRANCH}`);
    const currentIndex = Buffer.from(idxFile.content, "base64").toString("utf8");
    const newIndex = renderInto(currentIndex, content);

    // Latest commit + base tree.
    const ref = await gh(GITHUB_TOKEN, "GET", `/repos/${owner}/${repo}/git/ref/heads/${BRANCH}`);
    const latestSha = ref.object.sha;
    const latestCommit = await gh(GITHUB_TOKEN, "GET", `/repos/${owner}/${repo}/git/commits/${latestSha}`);

    // One tree with all three files (inline content).
    const tree = await gh(GITHUB_TOKEN, "POST", `/repos/${owner}/${repo}/git/trees`, {
      base_tree: latestCommit.tree.sha,
      tree: [
        { path: "content.js", mode: "100644", type: "blob", content: contentJs(content) },
        { path: "content.json", mode: "100644", type: "blob", content: JSON.stringify(content, null, 2) + "\n" },
        { path: "index.html", mode: "100644", type: "blob", content: newIndex },
      ],
    });

    const commit = await gh(GITHUB_TOKEN, "POST", `/repos/${owner}/${repo}/git/commits`, {
      message: "CMS: publish content update",
      tree: tree.sha,
      parents: [latestSha],
    });

    await gh(GITHUB_TOKEN, "PATCH", `/repos/${owner}/${repo}/git/refs/heads/${BRANCH}`, { sha: commit.sha });

    res.status(200).json({ ok: true, commit: commit.sha, message: "Published. The site will redeploy in ~30s." });
  } catch (e) {
    const status = e.status === 401 || e.status === 403 ? 502 : 500;
    res.status(status).json({ ok: false, error: "Publish failed: " + (e.message || "unknown error") });
  }
};
