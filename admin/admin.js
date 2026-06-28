(function () {
  "use strict";

  // ---------- color option sets ----------
  var TAG = ["violet", "teal", "coral", "gold"];
  var MOOD = ["violet", "teal", "coral", "gold", "indigo", "mix"];
  var SWATCH = { violet: "#8b7dff", teal: "#31d9cb", coral: "#ff8a62", gold: "#ffd86d", indigo: "#6c5ce7", mix: "#8b7dff" };

  // ---------- schema: describes every editable part of the site ----------
  var SCHEMA = [
    { id: "site", label: "Site & SEO", icon: "🛰", group: "Foundation",
      intro: "Site name, tagline and the description search engines and social cards show.",
      fields: [
        { path: "site.name", label: "Site name", type: "text" },
        { path: "site.tagline", label: "Tagline", type: "text" },
        { path: "site.description", label: "SEO / social description", type: "textarea", help: "~150 characters. Shows in Google and link previews." },
        { path: "site.url", label: "Live URL", type: "text", half: true },
        { path: "site.email", label: "Contact email", type: "text", half: true }
      ] },

    { id: "social", label: "Social links", icon: "🔗",
      intro: "Paste full profile URLs or just the handle. Leave a field empty to hide that icon.",
      fields: [
        { path: "site.social.instagram", label: "Instagram", type: "text", half: true },
        { path: "site.social.facebook", label: "Facebook", type: "text", half: true },
        { path: "site.social.youtube", label: "YouTube", type: "text", half: true },
        { path: "site.social.linkedin", label: "LinkedIn", type: "text", half: true }
      ] },

    { id: "forms", label: "Forms", icon: "✉",
      intro: "Make the newsletter, pitch, and contact forms actually deliver. Create a free form at formspree.io and paste its form ID (e.g. xrgklabc) or full endpoint URL here. Empty = demo mode (shows success but doesn’t send).",
      fields: [
        { path: "site.forms.newsletter", label: "Newsletter signup endpoint", type: "text" },
        { path: "site.forms.pitch", label: "Pitch form endpoint (Contribute)", type: "text" },
        { path: "site.forms.contact", label: "Contact form endpoint (About)", type: "text" }
      ] },

    { id: "nav", label: "Navigation", icon: "🧭",
      intro: "The menu links in the header. Use #home, #tutorials, etc. for on-page sections.",
      lists: [{ path: "site.nav", title: "Menu items", addLabel: "Add menu item", nameKey: "label",
        fields: [{ key: "label", label: "Label", type: "text", half: true }, { key: "href", label: "Link", type: "text", half: true }] }] },

    { id: "hero", label: "Hero", icon: "✦", group: "Pages",
      intro: "The opening section — your headline, lead line, buttons, and the flagship-series card.",
      fields: [
        { path: "hero.eyebrow", label: "Eyebrow label", type: "text" },
        { path: "hero.title", label: "Headline", type: "text" },
        { path: "hero.lead", label: "Lead paragraph", type: "textarea" },
        { path: "hero.ctaPrimary.label", label: "Primary button", type: "text", half: true },
        { path: "hero.ctaPrimary.href", label: "Primary link", type: "text", half: true },
        { path: "hero.ctaSecondary.label", label: "Secondary button", type: "text", half: true },
        { path: "hero.ctaSecondary.href", label: "Secondary link", type: "text", half: true },
        { path: "hero.feature.label", label: "Feature card — label", type: "text" },
        { path: "hero.feature.title", label: "Feature card — title", type: "text" },
        { path: "hero.feature.caption", label: "Feature card — caption", type: "textarea" }
      ] },

    { id: "purpose", label: "Platform purpose", icon: "🎯",
      intro: "Explain what the platform does and why it exists in a concise, engaging way.",
      fields: [
        { path: "purpose.heading", label: "Section heading", type: "text", half: true },
        { path: "purpose.sub", label: "Section subtitle", type: "text", half: true }
      ],
      lists: [{ path: "purpose.items", title: "Purpose cards", addLabel: "Add card", nameKey: "title",
        fields: [
          { key: "label", label: "Label", type: "text", half: true },
          { key: "title", label: "Title", type: "text" },
          { key: "body", label: "Body", type: "textarea" },
          { key: "tagColor", label: "Tag colour", type: "select", options: TAG, half: true }
        ] }] },

    { id: "stories", label: "Latest stories", icon: "📰",
      intro: "The news cards under the hero.",
      fields: [
        { path: "stories.heading", label: "Section heading", type: "text", half: true },
        { path: "stories.sub", label: "Section subtitle", type: "text", half: true }
      ],
      lists: [{ path: "stories.items", title: "Story cards", addLabel: "Add story", nameKey: "title",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "excerpt", label: "Excerpt", type: "textarea" },
          { key: "tag", label: "Tag", type: "text", half: true },
          { key: "tagColor", label: "Tag colour", type: "select", options: TAG, half: true },
          { key: "thumb", label: "Image tint", type: "select", options: TAG, half: true },
          { key: "meta", label: "Meta (e.g. 5 min read)", type: "text", half: true },
          { key: "link", label: "Link", type: "text" }
        ] }] },

    { id: "blogs", label: "Blog", icon: "📝",
      intro: "Longer-form posts. Each one gets its own readable page at /blog/<slug>; the homepage cards link to it.",
      fields: [
        { path: "blogs.heading", label: "Section heading", type: "text", half: true },
        { path: "blogs.sub", label: "Section subtitle", type: "text", half: true }
      ],
      lists: [{ path: "blogs.items", title: "Blog posts", addLabel: "Add post", nameKey: "title",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "slug", label: "URL slug (e.g. my-first-post)", type: "text", half: true },
          { key: "meta", label: "Meta (e.g. 6 min read)", type: "text", half: true },
          { key: "excerpt", label: "Excerpt / summary", type: "textarea", help: "Shown on the card and used as the article’s lead + SEO description." },
          { key: "body", label: "Full article", type: "textarea", help: "Leave a blank line between paragraphs. Start a line with “## ” to make a subheading." },
          { key: "tag", label: "Tag", type: "text", half: true },
          { key: "tagColor", label: "Tag colour", type: "select", options: TAG, half: true },
          { key: "thumb", label: "Image tint", type: "select", options: TAG, half: true },
          { key: "sourceName", label: "Source name (optional)", type: "text", half: true },
          { key: "sourceUrl", label: "Source URL (optional)", type: "text" }
        ] }] },

    { id: "newsletter", label: "Newsletter", icon: "✉",
      intro: "The email sign-up strip.",
      fields: [
        { path: "newsletter.eyebrow", label: "Eyebrow", type: "text", half: true },
        { path: "newsletter.cta", label: "Button label", type: "text", half: true },
        { path: "newsletter.title", label: "Title", type: "text" },
        { path: "newsletter.body", label: "Body", type: "textarea" },
        { path: "newsletter.placeholder", label: "Input placeholder", type: "text" }
      ] },

    { id: "tutorials", label: "Tutorials", icon: "🛠",
      intro: "Curated YouTube tutorials and the intro/disclaimer copy shown above them.",
      fields: [
        { path: "tutorials.heading", label: "Section heading", type: "text" },
        { path: "tutorials.sub", label: "Section subtitle", type: "textarea" },
        { path: "tutorials.intro", label: "Intro copy", type: "textarea" },
        { path: "tutorials.disclaimer", label: "Disclaimer", type: "textarea" }
      ],
      lists: [{ path: "tutorials.items", title: "Tutorial cards", addLabel: "Add tutorial", nameKey: "title",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "level", label: "Label", type: "text", half: true },
          { key: "levelColor", label: "Label colour", type: "select", options: TAG, half: true },
          { key: "videoId", label: "YouTube video ID", type: "text" }
        ] }] },

    { id: "podcast", label: "Podcast", icon: "🎙",
      intro: "Latest episode and its show notes.",
      fields: [
        { path: "podcast.eyebrow", label: "Eyebrow", type: "text" },
        { path: "podcast.heading", label: "Heading", type: "text" },
        { path: "podcast.sub", label: "Subtitle", type: "textarea" },
        { path: "podcast.episode.number", label: "Episode label", type: "text", half: true },
        { path: "podcast.episode.duration", label: "Duration", type: "text", half: true },
        { path: "podcast.episode.title", label: "Episode title", type: "text" },
        { path: "podcast.episode.summary", label: "Episode summary", type: "textarea" },
        { path: "podcast.episode.audioUrl", label: "Audio URL (optional)", type: "text" }
      ],
      lists: [{ path: "podcast.notes", title: "Show notes", addLabel: "Add timestamp", nameKey: "title",
        fields: [
          { key: "ts", label: "Timestamp", type: "text", half: true },
          { key: "title", label: "Title", type: "text", half: true },
          { key: "body", label: "Note", type: "textarea" }
        ] }] },

    { id: "videos", label: "Videos", icon: "▶", group: "Pages",
      intro: "Showcase video content from YouTube or self-hosted MP4 files.",
      fields: [
        { path: "videos.eyebrow", label: "Eyebrow", type: "text", half: true },
        { path: "videos.heading", label: "Section heading", type: "text" },
        { path: "videos.sub", label: "Section subtitle", type: "textarea" }
      ],
      lists: [{ path: "videos.items", title: "Video cards", addLabel: "Add video", nameKey: "title",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "type", label: "Source type", type: "select", options: ["youtube", "video"], half: true },
          { key: "duration", label: "Duration", type: "text", half: true },
          { key: "url", label: "YouTube URL or video URL", type: "text" },
          { key: "thumbnail", label: "Thumbnail URL", type: "text" },
          { key: "poster", label: "Poster image", type: "text" }
        ] }] },

    { id: "contribute", label: "Contribute", icon: "✍",
      intro: "The pitch page — what you accept, and the formats in the form's dropdown.",
      fields: [
        { path: "contribute.eyebrow", label: "Eyebrow", type: "text" },
        { path: "contribute.heading", label: "Heading", type: "text" },
        { path: "contribute.intro", label: "Intro", type: "textarea" }
      ],
      lists: [
        { path: "contribute.guidelines", title: "What fits", addLabel: "Add guideline", nameKey: "title",
          fields: [
            { key: "icon", label: "Icon (emoji)", type: "text", half: true },
            { key: "title", label: "Title", type: "text", half: true },
            { key: "body", label: "Description", type: "textarea" }
          ] },
        { path: "contribute.formats", title: "Form formats", addLabel: "Add format", stringList: true,
          fields: [{ key: "value", label: "Format", type: "text" }] }
      ] },

    { id: "about", label: "About", icon: "🌌",
      intro: "Mission, principles, and the value tiles.",
      fields: [
        { path: "about.eyebrow", label: "Eyebrow", type: "text" },
        { path: "about.heading", label: "Heading", type: "text" },
        { path: "about.intro", label: "Intro", type: "textarea" }
      ],
      lists: [
        { path: "about.principles", title: "Principles", addLabel: "Add principle", nameKey: "title",
          fields: [{ key: "title", label: "Title", type: "text" }, { key: "body", label: "Description", type: "textarea" }] },
        { path: "about.mood", title: "Value tiles", addLabel: "Add tile", nameKey: "label",
          fields: [{ key: "label", label: "Label", type: "text", half: true }, { key: "color", label: "Colour", type: "select", options: MOOD, half: true }] }
      ] },

    { id: "footer", label: "Footer", icon: "⚓", group: "Footer",
      intro: "The closing blurb and contact line.",
      fields: [
        { path: "footer.blurb", label: "Blurb", type: "textarea" },
        { path: "footer.builtFor", label: "Tagline", type: "text", half: true },
        { path: "footer.email", label: "Contact email", type: "text", half: true }
      ] }
  ];

  // ---------- state ----------
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  // Published content is the source of truth (loaded from content.js).
  var base = clone(window.AIVERSE_CONTENT || {});
  var data;
  try { data = JSON.parse(localStorage.getItem("aiverse:draft") || "null"); } catch (e) { data = null; }
  if (!data) data = clone(base);
  var activeId = SCHEMA[0].id;
  var aiState = { messages: [] };
  function escHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------- path helpers ----------
  function get(obj, path) { return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj); }
  function set(obj, path, val) {
    var keys = path.split("."), last = keys.pop();
    var t = keys.reduce(function (o, k) { if (o[k] == null) o[k] = {}; return o[k]; }, obj);
    t[last] = val;
  }
  function listArr(path) { var a = get(data, path); if (!Array.isArray(a)) { set(data, path, []); a = get(data, path); } return a; }

  // ---------- DOM ----------
  var sidebar = document.getElementById("sidebar");
  var editor = document.getElementById("editor");
  var saveState = document.getElementById("saveState");
  var toastEl = document.getElementById("toast");
  var previewFrame = document.getElementById("previewFrame");

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  // ---------- sidebar ----------
  function renderSidebar() {
    sidebar.innerHTML = "";
    sidebar.appendChild(el("div", "s-sep", "Assistant"));
    var ai = el("button", "s-item ai-item" + (activeId === "__ai" ? " active" : ""),
      '<span class="ic">✨</span><span>AI Assistant</span>');
    ai.onclick = function () { activeId = "__ai"; renderSidebar(); renderEditor(); editor.scrollTop = 0; };
    sidebar.appendChild(ai);
    SCHEMA.forEach(function (s) {
      if (s.group) sidebar.appendChild(el("div", "s-sep", s.group));
      var b = el("button", "s-item" + (s.id === activeId ? " active" : ""),
        '<span class="ic">' + s.icon + "</span><span>" + s.label + "</span>");
      b.onclick = function () { activeId = s.id; renderSidebar(); renderEditor(); editor.scrollTop = 0; };
      sidebar.appendChild(b);
    });
  }

  // ---------- field rendering ----------
  function fieldControl(f, dataAttrs) {
    var attrs = Object.keys(dataAttrs).map(function (k) { return 'data-' + k + '="' + dataAttrs[k] + '"'; }).join(" ");
    if (f.type === "textarea") return '<textarea class="inp" ' + attrs + "></textarea>";
    if (f.type === "select") {
      var opts = (f.options || []).map(function (o) { return "<option value=\"" + o + "\">" + o + "</option>"; }).join("");
      return '<select class="inp" ' + attrs + ">" + opts + "</select>";
    }
    return '<input class="inp" type="text" ' + attrs + " />";
  }
  function fieldBlock(f, dataAttrs) {
    var c = el("div", "field");
    c.innerHTML = "<label>" + f.label + "</label>" + fieldControl(f, dataAttrs) + (f.help ? '<p class="help">' + f.help + "</p>" : "");
    return c;
  }
  // group consecutive .half fields into row2 pairs
  function appendFields(container, fields, makeAttrs) {
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.half && fields[i + 1] && fields[i + 1].half) {
        var row = el("div", "row2");
        row.appendChild(fieldBlock(f, makeAttrs(f)));
        row.appendChild(fieldBlock(fields[i + 1], makeAttrs(fields[i + 1])));
        container.appendChild(row); i++;
      } else {
        container.appendChild(fieldBlock(f, makeAttrs(f)));
      }
    }
  }

  // ---------- editor ----------
  function renderEditor() {
    if (activeId === "__ai") { renderAI(); return; }
    var s = SCHEMA.filter(function (x) { return x.id === activeId; })[0];
    editor.innerHTML = "";
    var head = el("div", "ed-head", "<h1>" + s.label + "</h1>" + (s.intro ? "<p>" + s.intro + "</p>" : ""));
    editor.appendChild(head);

    if (s.fields && s.fields.length) {
      var g = el("div", "group");
      appendFields(g, s.fields, function (f) { return { path: f.path }; });
      editor.appendChild(g);
    }

    (s.lists || []).forEach(function (list, li) {
      var arr = listArr(list.path);
      var lh = el("div", "list-head", "<h3>" + list.title + "</h3>");
      var add = el("button", "add-btn", "+ " + list.addLabel);
      add.onclick = function () { arr.push(blankItem(list)); save(); renderEditor(); };
      lh.appendChild(add);
      editor.appendChild(lh);

      arr.forEach(function (item, idx) {
        editor.appendChild(itemCard(list, li, idx, arr));
      });
      if (!arr.length) editor.appendChild(el("p", "field", '<span class="help">No items yet. Use “' + list.addLabel + '”.</span>'));
    });

    hydrate();
  }

  function blankItem(list) {
    if (list.stringList) return "";
    var o = {};
    list.fields.forEach(function (f) { o[f.key] = f.type === "select" ? f.options[0] : ""; });
    return o;
  }

  function itemCard(list, li, idx, arr) {
    var card = el("div", "item");
    var nameVal = list.stringList ? arr[idx] : (arr[idx] && arr[idx][list.nameKey]) || "";
    var top = el("div", "item-top");
    top.appendChild(el("div", "item-name", "<b>" + (idx + 1) + "</b>" + (nameVal || "Untitled")));
    var ctrls = el("div", "item-ctrls");
    function mk(label, title, cls, fn) { var b = el("button", "mini" + (cls ? " " + cls : ""), label); b.title = title; b.onclick = fn; return b; }
    ctrls.appendChild(mk("↑", "Move up", "", function () { if (idx > 0) { var t = arr[idx - 1]; arr[idx - 1] = arr[idx]; arr[idx] = t; save(); renderEditor(); } }));
    ctrls.appendChild(mk("↓", "Move down", "", function () { if (idx < arr.length - 1) { var t = arr[idx + 1]; arr[idx + 1] = arr[idx]; arr[idx] = t; save(); renderEditor(); } }));
    ctrls.appendChild(mk("⧉", "Duplicate", "", function () { arr.splice(idx + 1, 0, clone(arr[idx])); save(); renderEditor(); }));
    ctrls.appendChild(mk("✕", "Delete", "danger", function () { arr.splice(idx, 1); save(); renderEditor(); }));
    top.appendChild(ctrls);
    card.appendChild(top);

    if (list.stringList) {
      card.appendChild(fieldBlock(list.fields[0], { list: list.path, index: idx, str: "1" }));
    } else {
      appendFields(card, list.fields, function (f) { return { list: list.path, index: idx, key: f.key }; });
    }
    return card;
  }

  // ---------- hydrate inputs from data ----------
  function hydrate() {
    editor.querySelectorAll("[data-path]").forEach(function (inp) {
      var v = get(data, inp.dataset.path);
      if (inp.tagName === "SELECT") { if (v == null || v === "") { v = inp.options[0] && inp.options[0].value; set(data, inp.dataset.path, v); } inp.value = v; }
      else inp.value = v == null ? "" : v;
    });
    editor.querySelectorAll("[data-list]").forEach(function (inp) {
      var arr = listArr(inp.dataset.list), idx = +inp.dataset.index;
      var v = inp.dataset.str ? arr[idx] : (arr[idx] ? arr[idx][inp.dataset.key] : "");
      if (inp.tagName === "SELECT") { if (v == null || v === "") { v = inp.options[0] && inp.options[0].value; if (inp.dataset.str) arr[idx] = v; else arr[idx][inp.dataset.key] = v; } inp.value = v; }
      else inp.value = v == null ? "" : v;
    });
  }

  // ---------- live edits ----------
  function onInput(e) {
    var inp = e.target;
    if (inp.dataset.path != null && inp.dataset.path !== "") {
      set(data, inp.dataset.path, inp.value);
    } else if (inp.dataset.list != null) {
      var arr = listArr(inp.dataset.list), idx = +inp.dataset.index;
      if (inp.dataset.str) { arr[idx] = inp.value; }
      else { if (!arr[idx]) arr[idx] = {}; arr[idx][inp.dataset.key] = inp.value; }
      // live-update the card title label
      var card = inp.closest(".item");
      if (card) {
        var list = currentList(inp.dataset.list);
        var nameVal = inp.dataset.str ? arr[idx] : (list && arr[idx] ? arr[idx][list.nameKey] : "");
        var nameEl = card.querySelector(".item-name");
        if (nameEl) nameEl.innerHTML = "<b>" + (idx + 1) + "</b>" + (nameVal || "Untitled");
      }
    }
    save();
  }
  function currentList(path) {
    var s = SCHEMA.filter(function (x) { return x.id === activeId; })[0];
    return (s.lists || []).filter(function (l) { return l.path === path; })[0];
  }
  editor.addEventListener("input", onInput);

  // ---------- save / preview ----------
  // Edits autosave to a local draft (browser storage). Publishing exports a
  // content.js you commit + redeploy — there is no live server to write to.
  var saveT, prevT;
  function save() {
    clearTimeout(saveT);
    saveState.textContent = "Saving…"; saveState.classList.add("dirty");
    saveT = setTimeout(function () {
      try { localStorage.setItem("aiverse:draft", JSON.stringify(data)); } catch (e) {}
      var t = new Date();
      saveState.textContent = "Draft saved · " + ("0" + t.getHours()).slice(-2) + ":" + ("0" + t.getMinutes()).slice(-2);
      saveState.classList.remove("dirty");
      schedulePreview();
    }, 250);
  }
  function schedulePreview() {
    clearTimeout(prevT);
    prevT = setTimeout(refreshPreview, 700);
  }
  function refreshPreview() {
    try { localStorage.setItem("aiverse:draft", JSON.stringify(data)); } catch (e) {}
    try { previewFrame.contentWindow.location.reload(); } catch (e) { previewFrame.src = "../index.html?draft=1&t=" + Date.now(); }
  }

  // ---------- toast ----------
  function toast(msg) {
    toastEl.textContent = msg; toastEl.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { toastEl.hidden = true; }, 3200);
  }

  // ---------- download helpers ----------
  function download(filename, text) {
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 100);
  }

  // ---------- top actions ----------
  // Publish = POST to /api/publish, which commits the content to GitHub and
  // triggers a Vercel redeploy. Password is asked once per session.
  function getPassword(force) {
    var pw = null;
    if (!force) { try { pw = sessionStorage.getItem("aiverse:pubpass"); } catch (e) {} }
    if (!pw) {
      pw = window.prompt("Enter the publish password:");
      if (pw) { try { sessionStorage.setItem("aiverse:pubpass", pw); } catch (e) {} }
    }
    return pw;
  }
  var publishBtn = document.getElementById("btnPublish");
  publishBtn.onclick = function () {
    var pw = getPassword(false);
    if (!pw) return;
    publishBtn.disabled = true;
    var prevLabel = publishBtn.textContent;
    publishBtn.textContent = "Publishing…";
    saveState.textContent = "Publishing…";
    fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify(data),
    }).then(function (res) {
      return res.json().then(function (body) { return { status: res.status, body: body }; });
    }).then(function (r) {
      if (r.status === 200 && r.body.ok) {
        base = clone(data); // new published baseline (so Revert returns here)
        toast(r.body.message || "Published — the site will redeploy shortly.");
        saveState.textContent = "Published ✓";
      } else if (r.status === 401) {
        try { sessionStorage.removeItem("aiverse:pubpass"); } catch (e) {}
        toast("Incorrect password — try Publish again.");
        saveState.textContent = "Not published";
      } else {
        toast((r.body && r.body.error) || "Publish failed.");
        saveState.textContent = "Not published";
      }
    }).catch(function () {
      toast("Couldn’t reach the publish endpoint. (Available on the deployed site only.)");
      saveState.textContent = "Not published";
    }).then(function () {
      publishBtn.disabled = false;
      publishBtn.textContent = prevLabel;
    });
  };
  document.getElementById("btnJson").onclick = function () {
    download("content.json", JSON.stringify(data, null, 2));
    toast("Downloaded content.json");
  };
  document.getElementById("btnRevert").onclick = function () {
    if (!confirm("Discard all changes and revert to the published content?")) return;
    data = clone(base); save(); renderEditor(); refreshPreview(); toast("Reverted to published content.");
  };
  document.getElementById("btnPreview").addEventListener("click", function () { refreshPreview(); });
  document.getElementById("btnRefresh").onclick = refreshPreview;

  var fileInput = document.getElementById("fileInput");
  document.getElementById("btnImport").onclick = function () { fileInput.click(); };
  fileInput.onchange = function () {
    var file = fileInput.files[0]; if (!file) return;
    var r = new FileReader();
    r.onload = function () {
      var txt = String(r.result), obj = null;
      try { obj = JSON.parse(txt); } catch (e) {
        var a = txt.indexOf("{"), b = txt.lastIndexOf("}");
        if (a >= 0 && b > a) { try { obj = JSON.parse(txt.slice(a, b + 1)); } catch (e2) {} }
      }
      if (!obj || typeof obj !== "object") { toast("Couldn’t read that file. Use a content.json or content.js export."); return; }
      data = obj; save(); renderEditor(); refreshPreview(); toast("Imported content.");
    };
    r.readAsText(file); fileInput.value = "";
  };

  // preview show/hide (small screens)
  var pane = document.getElementById("previewPane");
  var showBtn = document.getElementById("btnShowPreview");
  document.getElementById("btnHidePreview").onclick = function () { pane.style.display = "none"; showBtn.hidden = false; };
  showBtn.onclick = function () { pane.style.display = "flex"; showBtn.hidden = true; refreshPreview(); };

  // ---------- AI assistant panel ----------
  function renderAI() {
    editor.innerHTML = "";
    editor.appendChild(el("div", "ed-head",
      "<h1>AI Assistant</h1><p>Tell the assistant what to change — by typing or voice. It edits your draft and previews it; click <strong>Publish ↓</strong> when you're happy. Review auto-written blog drafts below.</p>"));

    var chat = el("div", "ai-chat");
    var log = el("div", "ai-log"); log.id = "aiLog";
    chat.appendChild(log);
    var row = el("div", "ai-input-row");
    var ta = el("textarea", "ai-text"); ta.id = "aiText";
    ta.placeholder = "e.g. Change the hero headline to “Today’s AI, decoded”  •  Add a blog about open-source models";
    var mic = el("button", "ai-mic", "🎙"); mic.type = "button"; mic.title = "Speak";
    var send = el("button", "ai-send", "Send"); send.type = "button";
    row.appendChild(ta); row.appendChild(mic); row.appendChild(send);
    chat.appendChild(row);
    editor.appendChild(chat);

    var drafts = el("div", "ai-drafts"); drafts.id = "aiDrafts";
    editor.appendChild(drafts);

    renderAILog();
    setupMic(mic, ta);
    send.onclick = function () { submitChat(ta.value); };
    ta.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submitChat(ta.value); }
    });
    loadDrafts();
  }

  function renderAILog() {
    var log = document.getElementById("aiLog");
    if (!log) return;
    if (!aiState.messages.length) {
      log.innerHTML = '<p class="ai-empty">Ask me to change anything — copy, sections, links, or whole blog posts. I edit your draft; you Publish when ready.</p>';
      return;
    }
    log.innerHTML = aiState.messages.map(function (m) {
      return '<div class="ai-msg ai-' + m.role + (m.pending ? " ai-pending" : "") + '">' + escHtml(m.text) + "</div>";
    }).join("");
    log.scrollTop = log.scrollHeight;
  }

  function submitChat(text) {
    text = (text || "").trim();
    if (!text) return;
    var pw = getPassword(false);
    if (!pw) return;
    var hist = aiState.messages.filter(function (m) { return !m.pending; });
    hist = hist.slice(-8).map(function (m) { return { role: m.role, text: m.text }; });
    aiState.messages.push({ role: "user", text: text });
    aiState.messages.push({ role: "assistant", text: "Thinking…", pending: true });
    renderAILog();
    var ta = document.getElementById("aiText"); if (ta) ta.value = "";

    fetch("/api/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ message: text, content: data, history: hist }),
    }).then(function (r) { return r.json().then(function (b) { return { status: r.status, body: b }; }); })
      .then(function (r) {
        aiState.messages = aiState.messages.filter(function (m) { return !m.pending; });
        if (r.status === 200 && r.body.ok) {
          if (r.body.changed && r.body.content) { data = r.body.content; save(); }
          aiState.messages.push({ role: "assistant", text: r.body.summary || "Done." });
        } else if (r.status === 401) {
          try { sessionStorage.removeItem("aiverse:pubpass"); } catch (e) {}
          aiState.messages.push({ role: "assistant", text: "Incorrect password — try sending again." });
        } else {
          aiState.messages.push({ role: "assistant", text: (r.body && r.body.error) || "Something went wrong." });
        }
        renderAILog();
      })
      .catch(function () {
        aiState.messages = aiState.messages.filter(function (m) { return !m.pending; });
        aiState.messages.push({ role: "assistant", text: "Couldn’t reach the assistant (available on the deployed site)." });
        renderAILog();
      });
  }

  function setupMic(mic, ta) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { mic.disabled = true; mic.classList.add("disabled"); mic.title = "Voice input isn’t supported in this browser"; return; }
    var rec = new SR(); rec.lang = "en-US"; rec.interimResults = true; rec.continuous = false;
    var listening = false, baseText = "";
    rec.onresult = function (e) {
      var t = "";
      for (var i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      ta.value = (baseText ? baseText + " " : "") + t;
    };
    rec.onend = function () { listening = false; mic.classList.remove("rec"); };
    rec.onerror = function () { listening = false; mic.classList.remove("rec"); };
    mic.onclick = function () {
      if (listening) { rec.stop(); return; }
      baseText = ta.value.trim(); listening = true; mic.classList.add("rec");
      try { rec.start(); } catch (e) { listening = false; mic.classList.remove("rec"); }
    };
  }

  function loadDrafts() {
    var wrap = document.getElementById("aiDrafts");
    if (!wrap) return;
    wrap.innerHTML = '<div class="ai-drafts-head"><h3>AI blog drafts</h3>' +
      '<button class="add-btn ai-refresh" type="button" style="width:auto">↻ Check for drafts</button></div>' +
      '<div id="aiDraftList"></div>';
    wrap.querySelector(".ai-refresh").onclick = fetchDrafts;
    var pw = null; try { pw = sessionStorage.getItem("aiverse:pubpass"); } catch (e) {}
    if (pw) fetchDrafts();
  }

  function fetchDrafts() {
    var list = document.getElementById("aiDraftList");
    var pw = getPassword(false);
    if (!pw) { if (list) list.innerHTML = ""; return; }
    if (list) list.innerHTML = '<p class="ai-empty">Loading…</p>';
    fetch("/api/agent/drafts", { headers: { "x-admin-password": pw } })
      .then(function (r) { return r.json().then(function (b) { return { status: r.status, body: b }; }); })
      .then(function (r) {
        if (r.status !== 200 || !r.body.ok) {
          if (r.status === 401) { try { sessionStorage.removeItem("aiverse:pubpass"); } catch (e) {} }
          if (list) list.innerHTML = '<p class="ai-empty">' + escHtml((r.body && r.body.error) || "Couldn’t load drafts.") + "</p>";
          return;
        }
        renderDraftList(r.body.drafts || []);
      })
      .catch(function () { if (list) list.innerHTML = '<p class="ai-empty">Couldn’t reach the server (deployed site only).</p>'; });
  }

  function renderDraftList(drafts) {
    var list = document.getElementById("aiDraftList");
    if (!list) return;
    if (!drafts.length) {
      list.innerHTML = '<p class="ai-empty">No pending drafts. The writer queues a new one about every two days.</p>';
      return;
    }
    list.innerHTML = drafts.map(function (d) {
      return '<div class="ai-draft">' +
        '<div class="ai-draft-top"><span class="tag tag-' + escHtml(d.tagColor || "violet") + '">' + escHtml(d.tag || "AI") + "</span>" +
          '<span class="ai-draft-meta">' + escHtml(d.meta || "") + "</span></div>" +
        "<h4>" + escHtml(d.title) + "</h4>" +
        '<p class="ai-draft-ex">' + escHtml(d.excerpt || "") + "</p>" +
        (d.sourceUrl ? '<p class="ai-draft-src">Source: ' + escHtml(d.sourceName || d.sourceUrl) + "</p>" : "") +
        '<div class="ai-draft-actions"><button class="btn primary ai-approve" type="button">Approve &amp; add</button>' +
          '<button class="mini ai-toggle" type="button" title="Show full text">⤢</button>' +
          '<button class="mini danger ai-discard" type="button" title="Discard">✕</button></div>' +
        '<div class="ai-draft-body" hidden>' + escHtml(d.body || "").replace(/\n/g, "<br>") + "</div>" +
      "</div>";
    }).join("");
    list.querySelectorAll(".ai-draft").forEach(function (card, i) {
      var d = drafts[i];
      card.querySelector(".ai-approve").onclick = function () { approveDraft(d); };
      card.querySelector(".ai-discard").onclick = function () { discardDraft(d.id, true); };
      card.querySelector(".ai-toggle").onclick = function () { var b = card.querySelector(".ai-draft-body"); b.hidden = !b.hidden; };
    });
  }

  function approveDraft(d) {
    if (!data.blogs || typeof data.blogs !== "object") data.blogs = { heading: "From the blog", items: [] };
    if (!Array.isArray(data.blogs.items)) data.blogs.items = [];
    data.blogs.items.unshift({
      slug: d.slug, title: d.title, excerpt: d.excerpt, body: d.body,
      tag: d.tag, tagColor: d.tagColor, thumb: d.thumb, meta: d.meta,
      sourceName: d.sourceName, sourceUrl: d.sourceUrl,
    });
    save();
    discardDraft(d.id, true);
    toast("Added to Blog. Review it, then Publish ↓ to go live.");
  }

  function discardDraft(id, reload) {
    var pw = getPassword(false);
    if (!pw) return;
    fetch("/api/agent/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ action: "discard", id: id }),
    }).then(function (r) { return r.json(); })
      .then(function () { if (reload !== false) fetchDrafts(); })
      .catch(function () {});
  }

  // ---------- boot ----------
  renderSidebar();
  renderEditor();
  // ensure preview reflects current draft on load
  try { localStorage.setItem("aiverse:draft", JSON.stringify(data)); } catch (e) {}
  setTimeout(refreshPreview, 400);
})();
