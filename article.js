(function () {
  "use strict";

  var content = window.AIVERSE_CONTENT || {};

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(s) {
    var v = String(s == null ? "" : s).trim();
    if (!v) return "";
    if (/^(https?:|mailto:|tel:)/i.test(v)) return esc(v);
    if (/^[#/?]/.test(v)) return esc(v);
    if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return "#";
    return esc(v);
  }
  function slugify(s) {
    return String(s == null ? "" : s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function itemSlug(it) { return it.slug || slugify(it.title); }

  // ---------- resolve which article to show ----------
  function currentSlug() {
    var m = location.pathname.match(/\/blog\/([^/]+)\/?$/);
    if (m) return decodeURIComponent(m[1]);
    var q = new URLSearchParams(location.search);
    return q.get("slug") || q.get("id") || "";
  }

  var items = (content.blogs && content.blogs.items) || [];
  var slug = currentSlug();
  var article = items.filter(function (it) { return itemSlug(it) === slug; })[0];

  var main = document.getElementById("articleMain");

  // ---------- not found ----------
  if (!article) {
    document.title = "Article not found — AIverse Daily";
    main.innerHTML =
      '<section class="block"><div class="wrap" style="text-align:center;max-width:560px">' +
        '<span class="eyebrow">404</span>' +
        "<h1>We couldn’t find that article</h1>" +
        "<p class=\"lead\">It may have moved or been unpublished.</p>" +
        '<div class="hero-cta" style="justify-content:center"><a class="btn btn-primary" href="/#blogs">Browse all blogs →</a></div>' +
      "</div></section>";
    boot();
    return;
  }

  // ---------- SEO / head ----------
  (function () {
    var siteName = (content.site && content.site.name) || "AIverse Daily";
    document.title = article.title + " — " + siteName;
    var desc = article.excerpt || "";
    function meta(sel, val) { var el = document.querySelector(sel); if (el) el.setAttribute("content", val); }
    meta('meta[name="description"]', desc);
    meta('meta[property="og:title"]', article.title);
    meta('meta[property="og:description"]', desc);
    var base = content.site && content.site.url ? content.site.url.replace(/\/$/, "") : "";
    if (base) {
      var url = base + "/blog/" + itemSlug(article);
      var canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.href = url;
    }
  })();

  // ---------- body: blank-line paragraphs, "## " subheads ----------
  function renderBody(body) {
    return String(body || "").split(/\n{2,}/).map(function (block) {
      block = block.trim();
      if (!block) return "";
      if (block.indexOf("## ") === 0) return "<h2>" + esc(block.slice(3)) + "</h2>";
      return "<p>" + esc(block) + "</p>";
    }).join("");
  }

  var sourceHtml = article.sourceUrl
    ? '<p class="article-source">Source: <a href="' + safeUrl(article.sourceUrl) + '" target="_blank" rel="noopener">' +
        esc(article.sourceName || article.sourceUrl) + "</a></p>"
    : "";

  // ---------- related (other posts) ----------
  var related = items.filter(function (it) { return itemSlug(it) !== itemSlug(article); }).slice(0, 2);
  var relatedHtml = related.length
    ? '<aside class="article-related"><h2>Keep reading</h2><div class="grid-3">' +
        related.map(function (it) {
          var url = "/blog/" + encodeURIComponent(itemSlug(it));
          return '<article class="card story">' +
            '<a class="story-thumb thumb-' + esc(it.thumb || "violet") + '" href="' + esc(url) + '" aria-label="' + esc(it.title) + '"></a>' +
            '<div class="story-body">' +
              '<div class="meta"><span class="tag tag-' + esc(it.tagColor || "violet") + '">' + esc(it.tag) + "</span></div>" +
              '<h3><a class="card-title-link" href="' + esc(url) + '">' + esc(it.title) + "</a></h3>" +
              "<p>" + esc(it.excerpt) + "</p>" +
            "</div></article>";
        }).join("") +
      "</div></aside>"
    : "";

  // ---------- render ----------
  main.innerHTML =
    '<article class="article">' +
      '<div class="wrap article-wrap">' +
        '<a class="article-back" href="/#blogs">← All blogs</a>' +
        '<div class="article-meta">' +
          '<span class="tag tag-' + esc(article.tagColor || "violet") + '">' + esc(article.tag) + "</span>" +
          (article.meta ? '<span class="tag tag-gold">' + esc(article.meta) + "</span>" : "") +
        "</div>" +
        "<h1>" + esc(article.title) + "</h1>" +
        '<p class="article-lead">' + esc(article.excerpt) + "</p>" +
        '<div class="article-thumb thumb-' + esc(article.thumb || "violet") + '" aria-hidden="true"></div>' +
        '<div class="article-body">' + renderBody(article.body) + sourceHtml + "</div>" +
        relatedHtml +
      "</div>" +
    "</article>";

  boot();

  // ---------- shared chrome (theme toggle, footer year) ----------
  function boot() {
    var root = document.documentElement, btn = document.getElementById("themeToggle");
    if (btn) {
      function setTheme(theme) {
        root.setAttribute("data-theme", theme);
        try { localStorage.setItem("aiverse:theme", theme); } catch (e) {}
        btn.setAttribute("aria-pressed", String(theme === "light"));
      }
      btn.addEventListener("click", function () {
        setTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
      });
      if (root.getAttribute("data-theme") === "light") btn.setAttribute("aria-pressed", "true");
    }
    var fb = document.getElementById("footBottom");
    if (fb) {
      var s = content.site || {};
      fb.innerHTML = "<span>© " + new Date().getFullYear() + " " + esc(s.name || "AIverse Daily") + ". " + esc(s.tagline || "") + "</span>" +
        '<span><a href="/" style="color:inherit">Home</a> · <a href="/#blogs" style="color:inherit">Blogs</a></span>';
    }
  }
})();
