"use strict";
/**
 * Minimal raw-fetch client for the Claude Messages API (no SDK dependency,
 * matching the rest of this project). Opus 4.8 is the default model — note it
 * rejects temperature/top_p/top_k and budget_tokens, so we never send them.
 */

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-8";

async function createMessage(body) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error("ANTHROPIC_API_KEY is not set.");
    err.status = 500;
    throw err;
  }
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(Object.assign({ model: MODEL }, body)),
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch (e) { json = { raw: text }; }
  if (!res.ok) {
    const msg = (json.error && json.error.message) || json.raw || ("HTTP " + res.status);
    const err = new Error("Claude API: " + msg);
    err.status = res.status;
    throw err;
  }
  return json;
}

/** Concatenate the text blocks of a response's content array. */
function textOf(content) {
  return (content || []).filter(function (b) { return b.type === "text"; }).map(function (b) { return b.text; }).join("").trim();
}

module.exports = { createMessage, textOf, MODEL };
