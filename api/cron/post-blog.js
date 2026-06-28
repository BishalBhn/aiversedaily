"use strict";
/**
 * GET /api/cron/post-blog — autonomous blog writer (runs on a Vercel Cron).
 *
 * Every run it: gates to a ~2-day cadence, researches a current AI story with
 * Claude's web-search tool, writes one original post in the house voice, and
 * appends it to drafts.json (a PENDING queue the site never reads). A human
 * approves it in the CMS before it goes live — nothing is auto-published.
 *
 * Auth:  Authorization: Bearer <CRON_SECRET>  (Vercel sends this automatically
 *        when CRON_SECRET is set), or x-admin-password for manual testing.
 * Env:   ANTHROPIC_API_KEY, GITHUB_TOKEN, CRON_SECRET, ADMIN_PASSWORD (manual).
 */
const { createMessage, textOf } = require("../../lib/anthropic");
const { slugify } = require("../../lib/content-ops");
const { getFileText, commitFiles } = require("../../lib/github");
const { timingSafeEqual } = require("../../lib/http");

const REPO = process.env.GITHUB_REPO || "BishalBhn/aiversedaily";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const DRAFTS_PATH = "drafts.json";
const TAGS = ["violet", "teal", "coral", "gold"];
const MIN_HOURS_BETWEEN = 46;   // ~2 days, with slack for the daily cron
const MAX_PENDING = 5;          // don't pile up unreviewed drafts

function authorized(req) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization === "Bearer " + secret) return true;
  if (process.env.ADMIN_PASSWORD && timingSafeEqual(req.headers["x-admin-password"], process.env.ADMIN_PASSWORD)) return true;
  return false;
}

function parseJson(text) {
  let t = String(text || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a >= 0 && b > a) t = t.slice(a, b + 1);
  return JSON.parse(t);
}

async function writePost(existingTitles) {
  const system = [
    "You are a staff writer for AIverse Daily, a calm, clear AI-news site for non-experts.",
    "Voice: plain language, practical, no hype. Explain what changed, why it matters, and what to do.",
  ].join(" ");
  const user = [
    "Use web search to find ONE notable, real AI development from the last several days.",
    "Then write one original blog post about it for AIverse Daily.",
    "Do NOT duplicate any of these existing titles: " + JSON.stringify(existingTitles) + ".",
    "",
    "Return ONLY a JSON object (no prose, no code fence) with these keys:",
    '{ "title": string, "excerpt": string (2-3 sentences),',
    '  "body": string (4-6 paragraphs separated by blank lines; start a subheading line with "## "),',
    '  "tag": string (2-3 words), "meta": string (e.g. "6 min read"),',
    '  "sourceName": string, "sourceUrl": string (a real URL you actually found) }',
  ].join("\n");

  const messages = [{ role: "user", content: user }];
  let resp;
  for (let step = 0; step < 6; step++) {
    resp = await createMessage({
      max_tokens: 4000,
      system: system,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
      messages: messages,
    });
    if (resp.stop_reason === "pause_turn") { messages.push({ role: "assistant", content: resp.content }); continue; }
    break;
  }
  const post = parseJson(textOf(resp.content));
  if (!post.title || !post.body) throw new Error("Model returned an incomplete post.");

  const color = TAGS[Math.floor((Date.now() / 3600000) % TAGS.length)];
  return {
    id: slugify(post.title).slice(0, 60) + "-" + Date.now(),
    createdAt: new Date().toISOString(),
    slug: slugify(post.title).slice(0, 70),
    title: post.title,
    excerpt: post.excerpt || "",
    body: post.body,
    tag: post.tag || "AI",
    tagColor: color,
    thumb: color,
    meta: post.meta || "5 min read",
    sourceName: post.sourceName || "",
    sourceUrl: /^https?:\/\//.test(post.sourceUrl || "") ? post.sourceUrl : "",
  };
}

module.exports = async function handler(req, res) {
  if (!authorized(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN || !process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ ok: false, error: "Server not configured: set ANTHROPIC_API_KEY, GITHUB_TOKEN, CRON_SECRET." });
    return;
  }

  try {
    let drafts = [];
    const raw = await getFileText(GITHUB_TOKEN, REPO, BRANCH, DRAFTS_PATH);
    if (raw) { try { drafts = JSON.parse(raw) || []; } catch (e) { drafts = []; } }

    // Cadence + backlog gates.
    if (drafts.length >= MAX_PENDING) {
      res.status(200).json({ ok: true, skipped: "max-pending", pending: drafts.length });
      return;
    }
    const newest = drafts[0] && drafts[0].createdAt ? Date.parse(drafts[0].createdAt) : 0;
    if (newest && (Date.now() - newest) < MIN_HOURS_BETWEEN * 3600000) {
      res.status(200).json({ ok: true, skipped: "too-soon", pending: drafts.length });
      return;
    }

    const existingTitles = [];
    const contentRaw = await getFileText(GITHUB_TOKEN, REPO, BRANCH, "content.json");
    if (contentRaw) {
      try {
        const c = JSON.parse(contentRaw);
        (c.blogs && c.blogs.items || []).forEach(function (b) { existingTitles.push(b.title); });
      } catch (e) {}
    }
    drafts.forEach(function (d) { existingTitles.push(d.title); });

    const post = await writePost(existingTitles);
    drafts.unshift(post);
    const sha = await commitFiles(GITHUB_TOKEN, REPO, BRANCH, [
      { path: DRAFTS_PATH, content: JSON.stringify(drafts, null, 2) + "\n" },
    ], "AI draft: " + post.title);

    res.status(200).json({ ok: true, created: post.title, slug: post.slug, commit: sha, pending: drafts.length });
  } catch (e) {
    res.status(e.status && e.status < 500 ? 400 : 502).json({ ok: false, error: e.message || "Generation failed." });
  }
};
