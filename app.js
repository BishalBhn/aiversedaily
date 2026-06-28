(function () {
  "use strict";

  // ---------- resolve content (published vs preview draft) ----------
  var base = window.AIVERSE_CONTENT || {};
  try { var savedTheme = localStorage.getItem("aiverse:theme"); } catch (e) { savedTheme = null; }
  if (savedTheme) { document.documentElement.setAttribute("data-theme", savedTheme); }
  var isPreview = new URLSearchParams(location.search).get("draft") === "1";
  var content = base;
  if (isPreview) {
    try {
      var draft = JSON.parse(localStorage.getItem("aiverse:draft") || "null");
      if (draft) content = draft;
    } catch (e) {}
    var flag = document.getElementById("draftFlag");
    if (flag) flag.hidden = false;
  }

  var $ = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Allow only safe URL schemes for content-supplied links/sources.
  // Blocks javascript:, data:, vbscript:, etc. — returns "#" for anything unsafe.
  function safeUrl(s) {
    var v = String(s == null ? "" : s).trim();
    if (!v) return "";
    if (/^(https?:|mailto:|tel:)/i.test(v)) return esc(v);   // absolute, vetted schemes
    if (/^[#/?]/.test(v)) return esc(v);                      // same-page anchors / relative paths
    if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return "#";           // any other explicit scheme → reject
    return esc(v);                                            // bare relative path (e.g. page.html)
  }

  // ---------- head / SEO ----------
  if (content.site) {
    if (content.site.name) document.title = content.site.name + " — " + (content.site.tagline || "");
    var md = document.querySelector('meta[name="description"]');
    if (md && content.site.description) md.setAttribute("content", content.site.description);
    if (content.site.url) {
      var baseUrl = content.site.url.replace(/\/$/, "");
      var canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.href = baseUrl + "/";
      var ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.content = baseUrl + "/";
      var ogImage = document.querySelector('meta[property="og:image"]');
      var twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (ogImage) ogImage.content = baseUrl + "/assets/aiverse-avatar-1080.png";
      if (twitterImage) twitterImage.content = baseUrl + "/assets/aiverse-avatar-1080.png";
      var ld = document.getElementById("ldJson");
      if (ld) {
        try {
          var json = JSON.parse(ld.textContent);
          json.url = baseUrl + "/";
          if (json.publisher && json.publisher.logo) json.publisher.logo.url = baseUrl + "/assets/aiverse-avatar-1080.png";
          ld.textContent = JSON.stringify(json, null, 2);
        } catch (e) {}
      }
    }
  }

  // ---------- nav ----------
  (function () {
    var nav = content.site && content.site.nav || [];
    $("navLinks").innerHTML = nav.map(function (n, i) {
      return '<li><a href="' + safeUrl(n.href) + '"' + (i === 0 ? ' class="active"' : "") + ">" + esc(n.label) + "</a></li>";
    }).join("");
  })();

  // ---------- hero ----------
  (function () {
    var h = content.hero || {};
    var f = h.feature || {};
    $("heroGrid").innerHTML =
      '<div class="hero-copy reveal">' +
        (h.eyebrow ? '<span class="eyebrow">' + esc(h.eyebrow) + "</span>" : "") +
        "<h1>" + esc(h.title) + "</h1>" +
        '<p class="lead">' + esc(h.lead) + "</p>" +
        '<div class="hero-cta">' +
          (h.ctaPrimary ? '<a href="' + safeUrl(h.ctaPrimary.href) + '" class="btn btn-primary">' + esc(h.ctaPrimary.label) + "</a>" : "") +
          (h.ctaSecondary ? '<a href="' + safeUrl(h.ctaSecondary.href) + '" class="btn btn-ghost">' + esc(h.ctaSecondary.label) + "</a>" : "") +
        "</div>" +
      "</div>" +
      '<div class="hero-visual reveal"><div class="orbit-stage" id="orbit">' +
        '<div class="orbit-ring r1" aria-hidden="true"></div>' +
        '<div class="orbit-ring r2" aria-hidden="true"></div>' +
        '<div class="orbit-ring r3" aria-hidden="true"></div>' +
        '<div class="orbit-core" aria-hidden="true"></div>' +
        '<div class="planet p1 float-a" aria-hidden="true"></div>' +
        '<div class="planet p2 float-b" aria-hidden="true"></div>' +
        '<div class="planet p3 float-c" aria-hidden="true"></div>' +
        '<div class="planet p4 float-d" aria-hidden="true"></div>' +
        '<article class="feature-card">' +
          '<div class="feature-thumb" aria-hidden="true"></div>' +
          (f.label ? '<p class="series-label">' + esc(f.label) + "</p>" : "") +
          "<h3>" + esc(f.title) + "</h3>" +
          "<p>" + esc(f.caption) + "</p>" +
        "</article>" +
      "</div></div>";
  })();

  // ---------- section head helper ----------
  function head(el, eyebrow, h2, sub) {
    el.innerHTML =
      (eyebrow ? '<span class="eyebrow">' + esc(eyebrow) + "</span>" : "") +
      "<h2>" + esc(h2) + "</h2>" +
      (sub ? "<p>" + esc(sub) + "</p>" : "");
  }

  // ---------- stories ----------
  (function () {
    var s = content.stories || {};
    head($("storiesHead"), null, s.heading, s.sub);
    $("storiesGrid").innerHTML = (s.items || []).map(function (it) {
      return '<article class="card story reveal">' +
        '<div class="story-thumb thumb-' + esc(it.thumb || "violet") + '" aria-hidden="true"></div>' +
        '<div class="story-body">' +
          '<div class="meta"><span class="tag tag-' + esc(it.tagColor || "violet") + '">' + esc(it.tag) + "</span>" +
            (it.meta ? '<span class="tag tag-gold">' + esc(it.meta) + "</span>" : "") + "</div>" +
          "<h3>" + esc(it.title) + "</h3>" +
          "<p>" + esc(it.excerpt) + "</p>" +
          (it.link ? '<a class="story-link" href="' + safeUrl(it.link) + '">Read more</a>' : "") +
        "</div></article>";
    }).join("");
  })();

  // ---------- blogs ----------
  (function () {
    var b = content.blogs || {};
    head($("blogsHead"), null, b.heading, b.sub);
    $("blogsGrid").innerHTML = (b.items || []).map(function (it) {
      return '<article class="card story reveal">' +
        '<div class="story-thumb thumb-' + esc(it.thumb || "violet") + '" aria-hidden="true"></div>' +
        '<div class="story-body">' +
          '<div class="meta"><span class="tag tag-' + esc(it.tagColor || "violet") + '">' + esc(it.tag) + "</span>" +
            (it.meta ? '<span class="tag tag-gold">' + esc(it.meta) + "</span>" : "") + "</div>" +
          "<h3>" + esc(it.title) + "</h3>" +
          "<p>" + esc(it.excerpt) + "</p>" +
          (it.link ? '<a class="story-link" href="' + safeUrl(it.link) + '">Read article</a>' : "") +
        "</div></article>";
    }).join("");
  })();

  // ---------- purpose ----------
  (function () {
    var p = content.purpose || {};
    head($("purposeHead"), null, p.heading, p.sub);
    $("purposeGrid").innerHTML = (p.items || []).map(function (it) {
      return '<article class="card story reveal">' +
        '<div class="story-body">' +
          '<div class="meta"><span class="tag tag-' + esc(it.tagColor || "violet") + '">' + esc(it.label) + "</span></div>" +
          "<h3>" + esc(it.title) + "</h3>" +
          "<p>" + esc(it.body) + "</p>" +
        "</div></article>";
    }).join("");
  })();

  // ---------- newsletter ----------
  (function () {
    var n = content.newsletter || {};
    $("newsCard").innerHTML =
      "<div>" +
        (n.eyebrow ? '<span class="eyebrow">' + esc(n.eyebrow) + "</span>" : "") +
        '<h2 style="margin-top:16px;">' + esc(n.title) + "</h2>" +
        "<p>" + esc(n.body) + "</p>" +
      "</div>" +
      '<form class="signup" data-form="newsletter" novalidate>' +
        '<label class="lbl" for="news-email">Your email</label>' +
        '<div class="field-row">' +
          '<input class="input" type="email" id="news-email" name="email" placeholder="' + esc(n.placeholder || "you@email.com") + '" autocomplete="email" required />' +
          '<input type="hidden" name="_subject" value="New AIverse Daily subscriber" />' +
        '<button type="submit" class="btn btn-primary">' + esc(n.cta || "Subscribe") + "</button>" +
        "</div>" +
        '<p class="form-status" data-status role="status" aria-live="polite"></p>' +
      "</form>";
  })();

  // ---------- tutorials ----------
  (function () {
    var t = content.tutorials || {};
    head($("tutHead"), null, t.heading, t.sub);
    var intro = (t.intro || "").trim();
    var disclaimer = (t.disclaimer || "").trim();
    var cards = (t.items || []).map(function (it) {
      var videoId = it.videoId || "";
      var videoMarkup = videoId ? '<div class="tutorial-video"><iframe src="https://www.youtube.com/embed/' + esc(videoId) + '" title="' + esc(it.title || "Tutorial video") + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>' : "";
      return '<article class="card tutorial-card reveal">' +
        videoMarkup +
        '<div class="tutorial-body">' +
          '<span class="tutorial-tag">' + esc(it.level || "Tutorial") + "</span>" +
          "<h3>" + esc(it.title) + "</h3>" +
          "<p>" + esc(it.description || it.excerpt || "") + "</p>" +
        "</div></article>";
    }).join("");
    $("tutGrid").innerHTML =
      (intro ? '<div class="tutorial-intro-block"><div class="tutorial-intro-card"><span class="tutorial-intro-label">Curated learning</span><p class="tutorial-intro">' + esc(intro) + "</p></div></div>" : "") +
      cards +
      (disclaimer ? '<p class="tutorial-disclaimer">' + esc(disclaimer) + "</p>" : "");
  })();

  // ---------- podcast ----------
  (function () {
    var p = content.podcast || {};
    var ep = p.episode || {};
    head($("podHead"), p.eyebrow, p.heading, p.sub);
    var bars = "";
    var hs = [40, 70, 50, 90, 60, 80, 45, 75, 55, 85, 50, 65];
    for (var i = 0; i < hs.length; i++) bars += '<span style="height:' + hs[i] + '%"></span>';
    var notes = (p.notes || []).map(function (n) {
      return "<li><span class=\"ts\">" + esc(n.ts) + "</span><p><strong>" + esc(n.title) + "</strong>" + esc(n.body) + "</p></li>";
    }).join("");
    $("podGrid").innerHTML =
      '<article class="card player reveal">' +
        '<p class="ep-tag">' + esc(ep.number) + " · Latest</p>" +
        "<h3>" + esc(ep.title) + "</h3>" +
        "<p>" + esc(ep.summary) + "</p>" +
        '<div class="audio" id="audio">' +
          '<div class="audio-top">' +
            '<button class="play-btn" id="playBtn" aria-label="Play episode preview" aria-pressed="false">▶</button>' +
            '<div class="wave" aria-hidden="true">' + bars + "</div>" +
          "</div>" +
          '<div class="audio-time"><span id="curTime">00:00</span><span>' + esc(ep.duration || "") + "</span></div>" +
        "</div>" +
      "</article>" +
      '<aside class="card notes reveal"><h3>Show notes</h3><p class="sub">Timestamps &amp; key takeaways</p><ul>' + notes + "</ul></aside>";
  })();

  // ---------- videos ----------
  (function () {
    var v = content.videos || {};
    head($("videosHead"), v.eyebrow, v.heading, v.sub);
    var items = v.items || [];
    $("videosGrid").innerHTML = items.map(function (item) {
      var thumb = item.thumbnail ? '<img class="video-thumb" src="' + safeUrl(item.thumbnail) + '" alt="' + esc(item.title || "Video thumbnail") + '" loading="lazy" />' : '<div class="video-thumb placeholder" aria-hidden="true"></div>';
      var sourceTag = item.type === "video" ? "Native video" : "YouTube";
      return '<article class="card video-card reveal">' +
        '<div class="video-preview">' + thumb + '<button class="video-play" type="button" aria-label="Play ' + esc(item.title || "video") + '">▶</button></div>' +
        '<div class="video-body">' +
          '<div class="meta"><span class="tag tag-violet">' + esc(sourceTag) + '</span>' + (item.duration ? '<span class="tag tag-gold">' + esc(item.duration) + '</span>' : '') + '</div>' +
          '<h3>' + esc(item.title) + '</h3>' +
          '<p>' + esc(item.description || "") + '</p>' +
        '</div></article>';
    }).join("");

    var modal = $("videoModal");
    var modalTitle = $("videoModalTitle");
    var modalBody = $("videoModalBody");
    var modalClose = $("videoModalClose");

    function closeModal() {
      modal.hidden = true;
      modalBody.innerHTML = "";
      document.body.classList.remove("modal-open");
    }

    function openModal(item) {
      var url = item.url || item.src || "";
      var type = item.type || "youtube";
      modalTitle.textContent = item.title || "Video";
      if (type === "youtube") {
        var id = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{11})/);
        var embedUrl = id ? "https://www.youtube-nocookie.com/embed/" + id[1] + "?rel=0&modestbranding=1&playsinline=1" : safeUrl(url);
        modalBody.innerHTML = '<div class="video-modal-player-frame"><iframe src="' + esc(embedUrl) + '" title="' + esc(item.title || "Video") + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
      } else {
        modalBody.innerHTML = '<div class="video-modal-player-frame"><video controls preload="metadata" poster="' + safeUrl(item.poster || item.thumbnail || "") + '"><source src="' + safeUrl(url) + '" type="video/mp4" /></video></div>';
      }
      modal.hidden = false;
      document.body.classList.add("modal-open");
    }

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) { if (!modal.hidden && e.key === "Escape") closeModal(); });

    var cards = $("videosGrid").querySelectorAll(".video-card");
    cards.forEach(function (card, idx) {
      var item = items[idx];
      if (!item) return;
      card.querySelector(".video-play").addEventListener("click", function (e) {
        e.preventDefault();
        openModal(item);
      });
    });
  })();

  // ---------- contribute ----------
  (function () {
    var c = content.contribute || {};
    head($("contribHead"), c.eyebrow, c.heading, c.intro);
    var guides = (c.guidelines || []).map(function (g) {
      return '<li><span class="ico" aria-hidden="true">' + esc(g.icon) + '</span><div><strong>' + esc(g.title) + "</strong><span>" + esc(g.body) + "</span></div></li>";
    }).join("");
    var opts = (c.formats || []).map(function (f) { return "<option>" + esc(f) + "</option>"; }).join("");
    $("contribSplit").innerHTML =
      '<aside class="card guide reveal"><h3>What fits</h3><ul>' + guides + "</ul></aside>" +
      '<form class="card form-card reveal" data-form="pitch" novalidate>' +
        "<h3>Submit a pitch</h3><p class=\"sub\">Tell us the gist — flesh it out after we say yes.</p>" +
        '<div class="form-grid">' +
          '<div class="two-col">' +
            '<div><label class="lbl" for="c-name">Name</label><input class="input" id="c-name" name="name" type="text" placeholder="Your name" autocomplete="name" required /></div>' +
            '<div><label class="lbl" for="c-email">Email</label><input class="input" id="c-email" name="email" type="email" placeholder="you@email.com" autocomplete="email" required /></div>' +
          "</div>" +
          '<div><label class="lbl" for="c-format">Format</label><select class="input" id="c-format" name="format" required><option value="" selected disabled>Choose a format</option>' + opts + "</select></div>" +
          '<div><label class="lbl" for="c-title">Pitch title</label><input class="input" id="c-title" name="title" type="text" placeholder="One line that sells the idea" required /></div>' +
          '<div><label class="lbl" for="c-summary">Pitch summary</label><textarea class="input" id="c-summary" name="summary" placeholder="What’s the idea, who’s it for, and why now?" required></textarea></div>' +
          '<input type="hidden" name="_subject" value="New pitch — AIverse Daily" />' +
          '<button type="submit" class="btn btn-primary">Send pitch</button>' +
          '<p class="form-status" data-status role="status" aria-live="polite"></p>' +
        "</div>" +
      "</form>";
  })();

  // ---------- about ----------
  (function () {
    var a = content.about || {};
    head($("aboutHead"), a.eyebrow, a.heading, a.intro);
    var principles = (a.principles || []).map(function (p, i) {
      var num = ("0" + (i + 1)).slice(-2);
      return '<li><span class="num">' + num + "</span><div><strong>" + esc(p.title) + "</strong><span>" + esc(p.body) + "</span></div></li>";
    }).join("");
    var mood = (a.mood || []).map(function (m) {
      return '<div class="planet-tile pt-' + esc(m.color) + '"><span>' + esc(m.label) + "</span></div>";
    }).join("");
    $("aboutGrid").innerHTML =
      '<div class="reveal"><ol class="principle-list">' + principles + "</ol>" +
        '<div class="mood" aria-label="Brand values">' + mood + "</div></div>" +
      '<form class="card form-card reveal" data-form="contact" novalidate>' +
        "<h3>Say hello</h3><p class=\"sub\">Questions, ideas, or just want to chat?</p>" +
        '<div class="form-grid">' +
          '<div class="two-col">' +
            '<div><label class="lbl" for="a-name">Name</label><input class="input" id="a-name" name="name" type="text" placeholder="Your name" autocomplete="name" required /></div>' +
            '<div><label class="lbl" for="a-email">Email</label><input class="input" id="a-email" name="email" type="email" placeholder="you@email.com" autocomplete="email" required /></div>' +
          "</div>" +
          '<div><label class="lbl" for="a-msg">Message</label><textarea class="input" id="a-msg" name="message" placeholder="What’s on your mind?" required></textarea></div>' +
          '<input type="hidden" name="_subject" value="New message — AIverse Daily" />' +
          '<button type="submit" class="btn btn-primary">Send message</button>' +
          '<p class="form-status" data-status role="status" aria-live="polite"></p>' +
        "</div>" +
      "</form>";
  })();

  // ---------- footer ----------
  (function () {
    var f = content.footer || {};
    var s = content.site || {};
    var soc = (s.social || {});
    var icons = {
      instagram: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
      facebook: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M14 9h3V5h-3c-2.2 0-4 1.8-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1z"/></svg>',
      youtube: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.5 7.2a3 3 0 0 0-2.1-2.1C18.6 4.6 12 4.6 12 4.6s-6.6 0-8.4.5A3 3 0 0 0 1.5 7.2 31 31 0 0 0 1 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.8.5 8.4.5 8.4.5s6.6 0 8.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23 12a31 31 0 0 0-.5-4.8zM10 15.2V8.8l5.2 3.2-5.2 3.2z"/></svg>',
      linkedin: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3.5 8.5h3V21h-3V8.5zM9.5 8.5h2.9v1.7h.04c.4-.76 1.4-1.56 2.86-1.56 3.06 0 3.7 2 3.7 4.6V21h-3v-5.2c0-1.24-.02-2.84-1.74-2.84-1.74 0-2 1.36-2 2.76V21h-3V8.5z"/></svg>'
    };
    var bases = { instagram: "https://instagram.com/", facebook: "https://facebook.com/", youtube: "https://youtube.com/", linkedin: "https://linkedin.com/company/" };
    function url(plat, v) { if (!v) return ""; return /^https?:\/\//.test(v) ? v : bases[plat] + v.replace(/^@?/, plat === "youtube" ? "@" : ""); }
    var socHtml = Object.keys(icons).map(function (p) {
      var u = url(p, soc[p]); if (!u) return "";
      return '<a href="' + esc(u) + '" target="_blank" rel="noopener" aria-label="' + p + '">' + icons[p] + "</a>";
    }).join("");

    $("footGrid").innerHTML =
      "<div>" +
        '<a href="#home" class="brand"><svg class="brand-mark" aria-hidden="true"><use href="#brandMark"/></svg>' +
        '<span class="brand-name"><span class="b-ai">AI</span><span class="b-verse">verse</span><span class="b-daily">Daily</span></span></a>' +
        "<p>" + esc(f.blurb) + "</p>" +
      "</div>" +
      '<div class="foot-right">' +
        '<p class="built">' + esc(f.builtFor) + "</p>" +
        '<p class="foot-contact">' + esc(f.email || (s && s.email)) + "</p>" +
        '<div class="foot-links"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>' +
        (socHtml ? '<div class="foot-social">' + socHtml + "</div>" : "") +
      "</div>";

    var year = new Date().getFullYear();
    $("footBottom").innerHTML =
      "<span>© " + year + " " + esc(s.name || "AIverse Daily") + ". " + esc(s.tagline || "") + "</span>" +
      "<span>News · Tutorials · Podcast</span>";
  })();

  // =====================================================================
  //  INTERACTIONS
  // =====================================================================
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // theme toggle
  (function () {
    var root = document.documentElement, btn = $("themeToggle");
    function setTheme(theme) {
      root.setAttribute("data-theme", theme);
      try { localStorage.setItem("aiverse:theme", theme); } catch (e) {}
      btn.setAttribute("aria-pressed", String(theme === "light"));
    }
    btn.addEventListener("click", function () {
      var light = root.getAttribute("data-theme") === "light";
      setTheme(light ? "dark" : "light");
    });
    if (root.getAttribute("data-theme") === "light") {
      btn.setAttribute("aria-pressed", "true");
    }
  })();

  // mobile nav (hamburger) toggle
  (function () {
    var btn = $("navToggle"), links = $("navLinks");
    if (!btn || !links) return;
    function setOpen(open) {
      links.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!links.classList.contains("open"));
    });
    // tapping a link closes the menu
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    // close on outside click or Escape
    document.addEventListener("click", function (e) {
      if (links.classList.contains("open") && !links.contains(e.target) && !btn.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) { setOpen(false); btn.focus(); }
    });
  })();

  // active nav on scroll
  (function () {
    var links = [].slice.call(document.querySelectorAll(".nav-links a"));
    var map = {};
    links.forEach(function (l) { var id = l.getAttribute("href").slice(1); if (document.getElementById(id)) map[id] = l; });
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { links.forEach(function (l) { l.classList.remove("active"); }); if (map[e.target.id]) map[e.target.id].classList.add("active"); }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { obs.observe(document.getElementById(id)); });
  })();

  // scroll reveal
  (function () {
    var items = document.querySelectorAll(".reveal");
    if (reduce) { items.forEach(function (i) { i.classList.add("in"); }); return; }
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (i) { obs.observe(i); });
  })();

  // hero parallax
  (function () {
    var stage = $("orbit"); if (!stage || reduce) return;
    if (window.matchMedia("(hover: hover)").matches) {
      var tx = 0, ty = 0, cx = 0, cy = 0;
      window.addEventListener("mousemove", function (e) {
        tx = (e.clientX / window.innerWidth - 0.5) * 26; ty = (e.clientY / window.innerHeight - 0.5) * 26;
      });
      (function loop() {
        cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
        stage.style.transform = "translate(" + cx + "px," + cy + "px) rotateX(" + (-cy * 0.15) + "deg) rotateY(" + (cx * 0.15) + "deg)";
        requestAnimationFrame(loop);
      })();
    } else {
      window.addEventListener("scroll", function () {
        var r = stage.getBoundingClientRect();
        stage.style.transform = "translateY(" + (r.top / window.innerHeight - 0.5) * -18 + "px)";
      }, { passive: true });
    }
  })();

  // podcast play (visual preview or real audio)
  (function () {
    var btn = $("playBtn"); if (!btn) return;
    var audio = $("podcastAudio"), cur = $("curTime"), playing = false, t = 0, timer = null;
    function fmt(s) { var m = Math.floor(s / 60), ss = s % 60; return (m < 10 ? "0" : "") + m + ":" + (ss < 10 ? "0" : "") + ss; }
    function updateTime() { if (!cur) return; cur.textContent = audio && audio.duration && !isNaN(audio.duration) ? fmt(Math.min(Math.floor(audio.currentTime), Math.floor(audio.duration))) : fmt(t); }
    btn.addEventListener("click", function () {
      playing = !playing;
      btn.textContent = playing ? "❚❚" : "▶";
      btn.setAttribute("aria-pressed", String(playing));
      if (audio && audio.src) {
        if (playing) { audio.play().catch(function () {}); }
        else { audio.pause(); }
      }
      audio && audio.classList.toggle("playing", playing);
      if (playing && !audio) { timer = setInterval(function () { t = (t + 1) % 2295; updateTime(); }, 1000); }
      else if (!playing) { clearInterval(timer); }
    });
    if (audio) {
      audio.addEventListener("timeupdate", updateTime);
      audio.addEventListener("ended", function () { playing = false; btn.textContent = "▶"; btn.setAttribute("aria-pressed", "false"); });
    }
  })();

  // forms — POST to a configured endpoint (e.g. Formspree); demo mode if none set
  (function () {
    var endpoints = (content.site && content.site.forms) || {};
    function resolve(ep) {
      if (!ep) return "";
      return /^https?:\/\//.test(ep) ? ep : "https://formspree.io/f/" + ep;
    }
    document.querySelectorAll("form").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var status = form.querySelector("[data-status]");
        var btn = form.querySelector('button[type="submit"]');
        if (!form.checkValidity()) {
          if (status) { status.style.color = "var(--coral)"; status.textContent = "Please fill in the required fields."; }
          form.reportValidity(); return;
        }
        var isSignup = form.classList.contains("signup");
        var done = function (ok) {
          if (!status) return;
          status.style.color = ok ? "var(--teal)" : "var(--coral)";
          status.textContent = ok
            ? (isSignup ? "You’re subscribed — check your inbox. ✦" : "Got it — we’ll be in touch within a week. ✦")
            : "Something went wrong. Please email " + ((content.site && content.site.email) || "us") + ".";
          if (ok) form.reset();
        };
        var url = resolve(endpoints[form.dataset.form]);
        if (!url) {
          // No endpoint configured — demo mode. Warn the operator so submissions
          // aren't silently lost; the visitor still sees a friendly confirmation.
          console.warn('[AIverse Daily] Form "' + form.dataset.form + '" has no endpoint configured (site.forms.' + form.dataset.form + '). Submission was NOT sent. Configure it in /admin/ → Forms.');
          done(true);
          return;
        }
        if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Sending…"; }
        fetch(url, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
          .then(function (r) { done(r.ok); })
          .catch(function () { done(false); })
          .then(function () { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || "Send"; } });
      });
    });
  })();
})();
