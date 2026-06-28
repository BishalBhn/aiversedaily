"use strict";
/**
 * POST /api/agent/chat — conversational (and voice) CMS editor.
 *
 * Body:  { message, content, history? }   header: x-admin-password
 *   message  the user's instruction (typed or voice-transcribed)
 *   content  the current CMS draft (full content object)
 *   history  optional prior [{role, text}] turns for context
 *
 * Claude edits an in-memory copy of `content` via the tools in lib/content-ops,
 * then returns the updated content plus a short summary of what changed. The
 * browser replaces its draft with the result and previews it; nothing is
 * published until the user clicks Publish.
 *
 * Env: ANTHROPIC_API_KEY, ADMIN_PASSWORD.
 */
const { createMessage, textOf } = require("../../lib/anthropic");
const { TOOLS, applyTool } = require("../../lib/content-ops");
const { timingSafeEqual, readBody } = require("../../lib/http");

const MAX_STEPS = 10;

function systemPrompt(content) {
  return [
    "You are the content editor for AIverse Daily, a calm, clear AI-news website.",
    "You modify a single JSON content object using the provided tools — one tool call per change.",
    "Make ONLY the changes the user asks for; do not rewrite or 'improve' unrelated fields.",
    "Match the site's voice: clear, practical, no hype. Keep edits concise and well-formed.",
    "When the user is vague, make a reasonable choice rather than asking, and note it in your summary.",
    "After your edits, reply with one or two plain sentences summarizing exactly what you changed.",
    "",
    "Current content (JSON):",
    "```json",
    JSON.stringify(content, null, 2),
    "```",
  ].join("\n");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ ok: false, error: "Method not allowed" }); return; }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD || !process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ ok: false, error: "Server not configured: set ANTHROPIC_API_KEY and ADMIN_PASSWORD env vars." });
    return;
  }
  if (!timingSafeEqual(req.headers["x-admin-password"], ADMIN_PASSWORD)) {
    res.status(401).json({ ok: false, error: "Incorrect password." });
    return;
  }

  let body;
  try { body = await readBody(req); } catch (e) { res.status(400).json({ ok: false, error: e.message }); return; }
  const message = (body.message || "").toString().trim();
  const content = body.content;
  if (!message) { res.status(400).json({ ok: false, error: "Empty message." }); return; }
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    res.status(400).json({ ok: false, error: "Missing content object." });
    return;
  }

  // Seed the conversation with any prior turns for context, then the new message.
  const messages = [];
  (body.history || []).forEach(function (h) {
    if (h && (h.role === "user" || h.role === "assistant") && h.text) {
      messages.push({ role: h.role, content: h.text });
    }
  });
  messages.push({ role: "user", content: message });

  let changed = false;
  try {
    let summary = "";
    for (let step = 0; step < MAX_STEPS; step++) {
      const resp = await createMessage({
        max_tokens: 4096,
        system: systemPrompt(content),
        tools: TOOLS,
        messages: messages,
      });

      if (resp.stop_reason === "pause_turn") { // server tool paused — resume
        messages.push({ role: "assistant", content: resp.content });
        continue;
      }

      messages.push({ role: "assistant", content: resp.content });
      const toolUses = (resp.content || []).filter(function (b) { return b.type === "tool_use"; });

      if (!toolUses.length) { summary = textOf(resp.content); break; }

      const results = toolUses.map(function (tu) {
        const out = applyTool(content, tu.name, tu.input || {});
        if (out.ok) changed = true;
        return { type: "tool_result", tool_use_id: tu.id, content: out.message, is_error: !out.ok };
      });
      messages.push({ role: "user", content: results });
    }

    res.status(200).json({ ok: true, changed: changed, content: content, summary: summary || "Done." });
  } catch (e) {
    res.status(e.status && e.status < 500 ? 400 : 502).json({ ok: false, error: e.message || "Agent failed." });
  }
};
