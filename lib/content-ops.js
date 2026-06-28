"use strict";
/**
 * The tool surface the conversational CMS agent uses to edit the content
 * object, plus the server-side executor that applies each tool call. Edits are
 * applied to an in-memory copy of the content the browser sent, so the agent
 * can "update anything" without the browser running any tools itself.
 */

function slugify(s) {
  return String(s == null ? "" : s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getAt(obj, path) {
  return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
}
function setAt(obj, path, val) {
  const keys = path.split("."), last = keys.pop();
  const t = keys.reduce(function (o, k) { if (o[k] == null || typeof o[k] !== "object") o[k] = {}; return o[k]; }, obj);
  t[last] = val;
}
function listAt(obj, path) {
  const a = getAt(obj, path);
  if (Array.isArray(a)) return a;
  setAt(obj, path, []);
  return getAt(obj, path);
}

// JSON-schema tool definitions handed to Claude.
const TOOLS = [
  {
    name: "update_field",
    description: "Set a single text/scalar field by dot-path. Examples of paths: hero.title, hero.lead, site.name, site.tagline, newsletter.body, podcast.episode.title, footer.blurb.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Dot-path to the field, e.g. hero.title" },
        value: { type: "string", description: "New value" },
      },
      required: ["path", "value"],
    },
  },
  {
    name: "add_list_item",
    description: "Add an item to a list. List paths: blogs.items, stories.items, purpose.items, tutorials.items, videos.items, podcast.notes, about.principles, about.mood, contribute.guidelines, site.nav. For blogs.items include: title, slug (kebab-case), excerpt, body (paragraphs separated by blank lines; start a subheading line with '## '), tag, tagColor (violet|teal|coral|gold), thumb (same set), meta (e.g. '6 min read'), and optionally sourceName + sourceUrl.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string" },
        item: { type: "object", description: "The item object to add", additionalProperties: true },
        position: { type: "string", enum: ["start", "end"], description: "Where to insert (default start)" },
      },
      required: ["path", "item"],
    },
  },
  {
    name: "update_list_item",
    description: "Update fields on one item in a list, found by its zero-based index. Only the provided fields change.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string" },
        index: { type: "integer" },
        fields: { type: "object", additionalProperties: true },
      },
      required: ["path", "index", "fields"],
    },
  },
  {
    name: "remove_list_item",
    description: "Remove one item from a list by its zero-based index.",
    input_schema: {
      type: "object",
      properties: { path: { type: "string" }, index: { type: "integer" } },
      required: ["path", "index"],
    },
  },
  {
    name: "move_list_item",
    description: "Reorder a list item from one zero-based index to another.",
    input_schema: {
      type: "object",
      properties: { path: { type: "string" }, from: { type: "integer" }, to: { type: "integer" } },
      required: ["path", "from", "to"],
    },
  },
];

/** Apply one tool call to `content` (mutated in place). Returns {ok, message}. */
function applyTool(content, name, input) {
  try {
    if (name === "update_field") {
      if (typeof input.path !== "string" || !input.path) return { ok: false, message: "Missing path." };
      setAt(content, input.path, input.value);
      return { ok: true, message: "Set " + input.path + "." };
    }
    if (name === "add_list_item") {
      const arr = listAt(content, input.path);
      const item = input.item || {};
      if (input.path === "blogs.items" && !item.slug && item.title) item.slug = slugify(item.title);
      if (input.position === "end") arr.push(item); else arr.unshift(item);
      return { ok: true, message: "Added an item to " + input.path + " (now " + arr.length + ")." };
    }
    if (name === "update_list_item") {
      const arr = listAt(content, input.path);
      const i = +input.index;
      if (!arr[i]) return { ok: false, message: "No item at index " + input.index + " in " + input.path + "." };
      Object.assign(arr[i], input.fields || {});
      return { ok: true, message: "Updated " + input.path + "[" + i + "]." };
    }
    if (name === "remove_list_item") {
      const arr = listAt(content, input.path);
      const i = +input.index;
      if (!arr[i]) return { ok: false, message: "No item at index " + input.index + " in " + input.path + "." };
      arr.splice(i, 1);
      return { ok: true, message: "Removed " + input.path + "[" + i + "]." };
    }
    if (name === "move_list_item") {
      const arr = listAt(content, input.path);
      const from = +input.from, to = +input.to;
      if (!arr[from]) return { ok: false, message: "No item at index " + from + "." };
      const [it] = arr.splice(from, 1);
      arr.splice(Math.max(0, Math.min(to, arr.length)), 0, it);
      return { ok: true, message: "Moved " + input.path + " " + from + " → " + to + "." };
    }
    return { ok: false, message: "Unknown tool: " + name };
  } catch (e) {
    return { ok: false, message: "Error: " + (e.message || "failed") };
  }
}

module.exports = { TOOLS, applyTool, slugify };
