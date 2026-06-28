"use strict";
/**
 * Shared content → HTML rendering, used by both:
 *   - build.js          (local: read/write files on disk)
 *   - api/publish.js    (serverless: transform in memory before committing)
 *
 * Keeping it in one place means the SEO fallback can never drift from what
 * the publish endpoint writes. Pure string in / string out — no I/O here.
 */

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// Mirror of app.js safeUrl — only allow vetted schemes / relative links.
function safeUrl(s) {
  const v = String(s == null ? "" : s).trim();
  if (!v) return "";
  if (/^(https?:|mailto:|tel:)/i.test(v)) return esc(v);
  if (/^[#/?]/.test(v)) return esc(v);
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return "#";
  return esc(v);
}

function headBlock(eyebrow, h2, sub) {
  return (
    (eyebrow ? "<p>" + esc(eyebrow) + "</p>" : "") +
    (h2 ? "<h2>" + esc(h2) + "</h2>" : "") +
    (sub ? "<p>" + esc(sub) + "</p>" : "")
  );
}

function cards(items, titleKey, bodyKey) {
  return (items || [])
    .map(function (it) {
      var link = it.link ? ' <a href="' + safeUrl(it.link) + '">Read more</a>' : "";
      return (
        "<article>" +
        "<h3>" + esc(it[titleKey]) + "</h3>" +
        "<p>" + esc(it[bodyKey] || it.description || it.excerpt || "") + link + "</p>" +
        "</article>"
      );
    })
    .join("\n");
}

function renderPrerender(c) {
  c = c || {};
  var site = c.site || {};
  var hero = c.hero || {};
  var parts = [];

  var nav = (site.nav || [])
    .map(function (n) { return '<a href="' + safeUrl(n.href) + '">' + esc(n.label) + "</a>"; })
    .join(" · ");
  if (nav) parts.push("<nav>" + nav + "</nav>");

  parts.push(
    "<section>" +
      (hero.eyebrow ? "<p>" + esc(hero.eyebrow) + "</p>" : "") +
      "<h1>" + esc(hero.title || site.name) + "</h1>" +
      (hero.lead ? "<p>" + esc(hero.lead) + "</p>" : "") +
      (hero.ctaPrimary ? '<a href="' + safeUrl(hero.ctaPrimary.href) + '">' + esc(hero.ctaPrimary.label) + "</a> " : "") +
      (hero.ctaSecondary ? '<a href="' + safeUrl(hero.ctaSecondary.href) + '">' + esc(hero.ctaSecondary.label) + "</a>" : "") +
    "</section>"
  );

  function section(node, titleKey, bodyKey) {
    if (!node) return;
    parts.push(
      "<section>" + headBlock(node.eyebrow, node.heading, node.sub) +
      cards(node.items, titleKey, bodyKey) + "</section>"
    );
  }

  section(c.purpose, "title", "body");
  section(c.stories, "title", "excerpt");
  section(c.blogs, "title", "excerpt");
  section(c.tutorials, "title", "description");
  section(c.videos, "title", "description");

  if (c.podcast) {
    var ep = c.podcast.episode || {};
    parts.push(
      "<section>" + headBlock(c.podcast.eyebrow, c.podcast.heading, c.podcast.sub) +
      "<article><h3>" + esc(ep.title) + "</h3><p>" + esc(ep.summary) + "</p></article></section>"
    );
  }

  if (c.about) {
    var principles = (c.about.principles || [])
      .map(function (p) { return "<li><strong>" + esc(p.title) + "</strong> — " + esc(p.body) + "</li>"; })
      .join("\n");
    parts.push(
      "<section>" + headBlock(c.about.eyebrow, c.about.heading, c.about.intro) +
      (principles ? "<ul>" + principles + "</ul>" : "") + "</section>"
    );
  }

  if (c.footer) {
    parts.push("<footer><p>" + esc(c.footer.blurb) + "</p></footer>");
  }

  return parts.join("\n    ");
}

function replaceBetween(html, startMarker, endMarker, replacement, label) {
  var start = html.indexOf(startMarker);
  var end = html.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Markers for " + label + " not found in index.html");
  }
  return (
    html.slice(0, start + startMarker.length) +
    "\n    " + replacement + "\n    " +
    html.slice(end)
  );
}

function syncHead(html, c) {
  var site = (c && c.site) || {};
  var title = (site.name || "AIverse Daily") + (site.tagline ? " — " + site.tagline : "");
  var desc = site.description || "";
  function setTag(re, value) { if (re.test(html)) html = html.replace(re, value); }
  setTag(/<title>[\s\S]*?<\/title>/, "<title>" + esc(title) + "</title>");
  setTag(/(<meta name="description" content=")[\s\S]*?("\s*\/>)/, "$1" + esc(desc) + "$2");
  setTag(/(<meta property="og:title" content=")[\s\S]*?("\s*\/>)/, "$1" + esc(title) + "$2");
  setTag(/(<meta property="og:description" content=")[\s\S]*?("\s*\/>)/, "$1" + esc(desc) + "$2");
  setTag(/(<meta name="twitter:title" content=")[\s\S]*?("\s*\/>)/, "$1" + esc(title) + "$2");
  setTag(/(<meta name="twitter:description" content=")[\s\S]*?("\s*\/>)/, "$1" + esc(desc) + "$2");
  return html;
}

/** Apply both transforms to an index.html string. */
function renderInto(html, content) {
  html = replaceBetween(html, "<!--PRERENDER-->", "<!--/PRERENDER-->", renderPrerender(content), "PRERENDER");
  html = syncHead(html, content);
  return html;
}

/** The content.js payload the site loads at runtime. */
function contentJs(content) {
  return "/* AIVERSE DAILY — generated by the CMS. */\nwindow.AIVERSE_CONTENT = " + JSON.stringify(content, null, 2) + ";\n";
}

module.exports = { esc, safeUrl, renderInto, renderPrerender, syncHead, replaceBetween, contentJs };
