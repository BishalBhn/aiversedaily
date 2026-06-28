#!/usr/bin/env node
/**
 * build.js — pre-render content into index.html for SEO / no-JS crawlers.
 *
 * The site renders client-side from content.js (which modern crawlers run).
 * This step additionally bakes the text into a <noscript> block and keeps the
 * <head> tags in sync with content.json, so crawlers that don't execute JS
 * still see real content. Run it after editing content, before committing:
 *
 *     node build.js
 *
 * Idempotent: re-running overwrites the generated region in place.
 * The actual rendering lives in lib/prerender.js so it can't drift from the
 * /api/publish endpoint, which uses the same module.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { renderInto } = require("./lib/prerender");

const ROOT = __dirname;
const CONTENT = path.join(ROOT, "content.json");
const INDEX = path.join(ROOT, "index.html");

if (!fs.existsSync(CONTENT)) {
  console.error("build.js: content.json not found at " + CONTENT);
  process.exit(1);
}

const content = JSON.parse(fs.readFileSync(CONTENT, "utf8"));
const html = fs.readFileSync(INDEX, "utf8");
fs.writeFileSync(INDEX, renderInto(html, content));
console.log("✓ build.js: pre-rendered SEO content + synced head tags into index.html");
