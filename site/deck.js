/* deck.js: the slide engine. One slide at a time, steps inside slides,
   keyboard and touch, a long-page view, an overview, and a speaker view.
   Plain script, no modules, so it also runs from file://.

   Three views
     deck   one slide at a time (screens wider than 700 px)
     swipe  phones: one slide per screen, swipe sideways (native scroll snap)
     page   every slide one after another; S or the Page button switches to it.
            On a phone the choice between swipe and page is remembered.

   Keys
     → space PageDown Enter   next step or slide      ← PageUp   back
     Home End                 first or last slide
     F  full screen           O  all slides           S  slides or one long page
     N  speaker notes box     V  open the speaker view in a new window
     J  the real JSON behind the slide: request, then response, then close. While it is open,
        → / ← (and the Request, Response and Close buttons) move forward and back; Esc closes

   URL options: ?page  ?notes  ?speaker  ?all (show every step at once)
   and #slide-id to open a slide. */
(function () {
  "use strict";

  var body = document.body;
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var params = new URLSearchParams(location.search);
  var state = { index: 0, step: 0, json: 0 };
  var speakerWin = null;

  function q(sel) { return document.querySelector(sel); }
  function stepsIn(slide) {
    var max = 0;
    slide.querySelectorAll("[data-step]").forEach(function (e) { max = Math.max(max, Number(e.getAttribute("data-step")) || 0); });
    return max;
  }
  function title(i) { return slides[i] ? slides[i].getAttribute("data-title") : ""; }
  function textOf(slide, sel) { var n = slide.querySelector(sel); return n ? n.textContent.trim() : ""; }

  /* ---- speaker view: a second window that shows notes and drives the deck ---- */
  if (params.has("speaker")) {
    body.className = "view-speaker";
    var spState = { index: 0, step: 0 }, started = null;
    var send = function (action) {
      if (window.opener) window.opener.postMessage({ jevDeck: "nav", action: action }, "*");
      else { // opened on its own: just move through the notes
        if (action === "next") spState.step < stepsIn(slides[spState.index]) ? spState.step++ : (spState.index = Math.min(slides.length - 1, spState.index + 1), spState.step = 0);
        if (action === "prev") spState.step > 0 ? spState.step-- : (spState.index = Math.max(0, spState.index - 1), spState.step = 0);
        renderSpeaker();
      }
      if (!started) started = Date.now();
    };
    var renderSpeaker = function () {
      var s = slides[spState.index];
      q("[data-sp-title]").textContent = title(spState.index);
      q("[data-sp-count]").textContent = (spState.index + 1) + " / " + slides.length;
      q("[data-sp-notes]").textContent = textOf(s, ".notes");
      var steps = stepsIn(s);
      q("[data-sp-step]").textContent = (steps ? (spState.step + " of " + steps + " reveals shown") : "No reveals on this slide") +
        (s.hasAttribute("data-json") ? " · JSON: " + ["closed (press J)", "request", "response"][spState.json || 0] : "");
      q("[data-sp-next]").textContent = spState.index + 1 < slides.length ? title(spState.index + 1) : "End";
      q("[data-sp-reader]").textContent = textOf(s, ".reader");
      document.title = "Speaker: " + title(spState.index);
    };
    window.addEventListener("message", function (e) {
      var d = e.data || {};
      if (d.jevDeck === "state") { spState.index = d.index; spState.step = d.step; spState.json = d.json; renderSpeaker(); if (!started && (d.index || d.step)) started = Date.now(); }
    });
    document.querySelectorAll("[data-sp-act]").forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.getAttribute("data-sp-act");
        if (a === "reset") started = Date.now(); else send(a);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (["ArrowRight", "PageDown", " ", "Enter"].indexOf(e.key) >= 0) { e.preventDefault(); send("next"); }
      if (["ArrowLeft", "PageUp"].indexOf(e.key) >= 0) { e.preventDefault(); send("prev"); }
    });
    setInterval(function () {
      var s = started ? Math.floor((Date.now() - started) / 1000) : 0;
      q("[data-sp-timer]").textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    }, 500);
    renderSpeaker();
    if (window.opener) window.opener.postMessage({ jevDeck: "hello" }, "*");
    return;
  }

  /* ---- views ---- */
  var deckEl = q(".deck");
  var narrow = window.matchMedia("(max-width: 700px)");
  var STORE = "jevDeckPhoneView";
  function stored() { try { return localStorage.getItem(STORE); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(STORE, v); } catch (e) { /* private mode */ } }
  function defaultMode() {
    if (params.has("page")) return "page";
    if (narrow.matches) return stored() === "page" ? "page" : "swipe";
    return "deck";
  }
  var mode = defaultMode(), pageView = mode === "page";

  function swipeTo(index, smooth) {
    deckEl.scrollTo({ left: index * deckEl.clientWidth, behavior: smooth ? "smooth" : "instant" });
  }
  function setMode(m) {
    mode = m;
    pageView = m === "page";
    body.classList.toggle("view-deck", m === "deck");
    body.classList.toggle("view-swipe", m === "swipe");
    body.classList.toggle("view-scroll", m === "page");
    body.classList.toggle("layout-stack", m !== "deck");
    q('[data-act="view"]').textContent = pageView ? "Slides" : "Page";
    if (m === "page") slides[state.index].scrollIntoView({ behavior: "instant", block: "start" });
    else window.scrollTo(0, 0);
    if (m === "swipe") swipeTo(state.index, false);
    render();
  }
  // The Page / Slides button and the S key
  function toggleView() {
    var next = pageView ? (narrow.matches ? "swipe" : "deck") : "page";
    if (narrow.matches) store(next === "page" ? "page" : "slides");
    setMode(next);
  }

  /* ---- rendering ---- */
  function render() {
    slides.forEach(function (s, i) {
      var active = i === state.index;
      s.classList.toggle("is-active", active);
      s.setAttribute("aria-hidden", String(mode === "deck" && !active));
      s.querySelectorAll("[data-step]").forEach(function (e) {
        e.classList.toggle("is-shown", mode !== "deck" || i < state.index || (active && Number(e.getAttribute("data-step")) <= state.step));
      });
    });
    body.classList.toggle("on-section", mode === "deck" && slides[state.index].classList.contains("slide--section"));
    var steps = mode === "deck" ? stepsIn(slides[state.index]) : 0;
    var progress = slides.length > 1 ? (state.index + (steps ? state.step / (steps + 1) : 0)) / (slides.length - 1) : 1;
    q(".progress").style.width = (progress * 100) + "%";
    q("[data-count]").textContent = (state.index + 1) + " / " + slides.length;
    var hash = "#" + slides[state.index].id;
    if (location.hash !== hash) { try { history.replaceState(null, "", hash); } catch (e) { /* some file:// cases */ } }
    var notes = q("[data-notes-overlay]");
    if (!notes.hidden) notes.textContent = textOf(slides[state.index], ".notes");
    var overlay = q("[data-json-overlay]"), spec = slides[state.index].getAttribute("data-json");
    var view = !pageView && spec && state.json && window.JEV_JSON ? window.JEV_JSON(spec, state.json) : null;
    overlay.hidden = !view;
    if (view) {
      q("[data-json-title]").textContent = view.title;
      q("[data-json-code]").innerHTML = view.html;
      q("[data-json-note]").textContent = view.note;
      overlay.querySelectorAll("[data-json-part]").forEach(function (b) {
        if (b.getAttribute("role") === "tab") b.setAttribute("aria-selected", String(Number(b.getAttribute("data-json-part")) === state.json));
      });
      // Shrink the code until the panel fits the screen (never below 14 px).
      // On a phone the sheet scrolls instead.
      var code = q("[data-json-code]"), panel = overlay.querySelector(".json-panel");
      code.style.fontSize = "";
      panel.scrollTop = 0;
      var size = parseFloat(getComputedStyle(code).fontSize);
      while (mode === "deck" && panel.scrollHeight > panel.clientHeight + 1 && size > 14) {
        size -= 1;
        code.style.fontSize = size + "px";
      }
    }
    if (speakerWin && !speakerWin.closed) speakerWin.postMessage({ jevDeck: "state", index: state.index, step: state.step, json: state.json }, "*");
  }

  function goTo(index, step) {
    state.json = 0;
    var from = state.index;
    state.index = Math.max(0, Math.min(slides.length - 1, index));
    state.step = Math.max(0, Math.min(stepsIn(slides[state.index]), step || 0));
    if (pageView) slides[state.index].scrollIntoView({ behavior: "smooth", block: "start" });
    if (mode === "swipe") swipeTo(state.index, Math.abs(state.index - from) === 1);
    render();
  }
  function next() {
    if (state.json) { stepJson(1); return; }
    if (mode === "deck" && state.step < stepsIn(slides[state.index])) { state.step++; render(); }
    else if (state.index < slides.length - 1) goTo(state.index + 1, 0);
  }
  function prev() {
    if (state.json) { stepJson(-1); return; }
    if (mode === "deck" && state.step > 0) { state.step--; render(); }
    else if (state.index > 0) goTo(state.index - 1, mode === "deck" ? stepsIn(slides[state.index - 1]) : 0);
  }

  /* ---- overview ---- */
  var overview = q("[data-overview]"), overviewList = q("[data-overview-list]");
  slides.forEach(function (s, i) {
    var li = document.createElement("li"), b = document.createElement("button");
    b.type = "button";
    var n = document.createElement("span");
    n.textContent = String(i + 1);
    b.appendChild(n);
    b.appendChild(document.createTextNode(title(i)));
    b.addEventListener("click", function () { toggleOverview(false); goTo(i, 0); });
    li.appendChild(b);
    overviewList.appendChild(li);
  });
  function toggleOverview(open) {
    overview.hidden = !open;
    if (open) {
      overviewList.querySelectorAll("button").forEach(function (b, i) { b.setAttribute("aria-current", String(i === state.index)); });
      overviewList.querySelectorAll("button")[state.index].focus();
    }
  }

  // J: request, then response, then closed. Only on slides with data-json.
  function cycleJson() {
    if (pageView || !slides[state.index].hasAttribute("data-json")) return;
    if (mode === "swipe" && state.json === 2) return;  // on a phone, close with the Close button
    state.json = (state.json + 1) % 3;
    render();
  }
  // While the JSON is open: forward is request, response, closed; back is response, request, closed.
  function stepJson(dir) {
    if (mode === "swipe" && state.json === 2 && dir > 0) return;  // on a phone, close with the Close button
    state.json = state.json + dir;
    if (state.json < 1 || state.json > 2) state.json = 0;
    render();
  }

  function toggleNotes() {
    var notes = q("[data-notes-overlay]");
    notes.hidden = !notes.hidden;
    render();
  }
  function openSpeaker() {
    var url = location.href.split("#")[0].split("?")[0] + "?speaker";
    speakerWin = window.open(url, "jev-speaker", "width=1000,height=700");
    setTimeout(render, 500);
  }
  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  }

  window.addEventListener("message", function (e) {
    var d = e.data || {};
    if (d.jevDeck === "nav") { if (d.action === "next") next(); if (d.action === "prev") prev(); }
    if (d.jevDeck === "hello") { speakerWin = e.source; render(); }
  });

  /* ---- input ---- */
  document.addEventListener("keydown", function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    var onControl = tag === "button" || tag === "summary" || tag === "a";
    var k = e.key;
    if (!overview.hidden) { if (k === "Escape" || k === "o" || k === "O") toggleOverview(false); return; }
    var deck = mode === "deck";
    if (state.json) {
      var panel = q(".json-panel");
      if (k === "ArrowRight" || ((k === "j" || k === "J") && !e.shiftKey)) { e.preventDefault(); stepJson(1); }
      else if (k === "ArrowLeft" || ((k === "j" || k === "J") && e.shiftKey)) { e.preventDefault(); stepJson(-1); }
      else if (k === "ArrowDown" || k === "PageDown" || (k === " " && !e.shiftKey && !onControl)) { e.preventDefault(); panel.scrollBy(0, k === "ArrowDown" ? 60 : panel.clientHeight * 0.8); }
      else if (k === "ArrowUp" || k === "PageUp" || (k === " " && e.shiftKey && !onControl)) { e.preventDefault(); panel.scrollBy(0, k === "ArrowUp" ? -60 : -panel.clientHeight * 0.8); }
      else if (k === "Escape") { state.json = 0; render(); }
      return;
    }
    if (k === "ArrowRight" || (deck && (k === "PageDown" || k === "ArrowDown")) || (!pageView && (k === " " || k === "Enter") && !onControl && !e.shiftKey)) { e.preventDefault(); next(); }
    else if (k === "ArrowLeft" || (deck && (k === "PageUp" || k === "ArrowUp")) || (!pageView && k === " " && e.shiftKey && !onControl)) { e.preventDefault(); prev(); }
    else if (k === "Home") { e.preventDefault(); goTo(0, 0); }
    else if (k === "End") { e.preventDefault(); goTo(slides.length - 1, 0); }
    else if (k === "f" || k === "F") fullscreen();
    else if (k === "o" || k === "O") toggleOverview(true);
    else if (k === "s" || k === "S") toggleView();
    else if (k === "n" || k === "N") toggleNotes();
    else if (k === "v" || k === "V") openSpeaker();
    else if (k === "j" || k === "J") cycleJson();
    else if (k === "Escape" && state.json) { state.json = 0; render(); }
  });

  var touchX = null, touchY = null;
  document.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (mode !== "deck" || touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX, dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { if (dx < 0) next(); else prev(); }
    touchX = null;
  }, { passive: true });

  document.querySelectorAll("[data-json-open]").forEach(function (b) {
    b.addEventListener("click", function () { cycleJson(); b.blur(); });
  });
  q("[data-json-overlay]").addEventListener("click", function (e) {
    if (e.target === e.currentTarget) { state.json = 0; render(); }
  });
  document.querySelectorAll("[data-json-part]").forEach(function (b) {
    b.addEventListener("click", function () { state.json = Number(b.getAttribute("data-json-part")); render(); });
  });

  document.querySelectorAll("[data-act]").forEach(function (b) {
    b.addEventListener("click", function () {
      var a = b.getAttribute("data-act");
      if (a === "next") next();
      else if (a === "prev") prev();
      else if (a === "overview") toggleOverview(true);
      else if (a === "view") toggleView();
    });
  });

  // In the long-page view, follow the scroll position.
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!pageView || ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var line = window.innerHeight * 0.3, best = state.index;
      slides.forEach(function (s, i) { if (s.getBoundingClientRect().top <= line) best = i; });
      if (best !== state.index) { state.index = best; state.step = 0; render(); }
    });
  }, { passive: true });

  // In the swipe view, follow the sideways scroll position.
  var swipeTicking = false;
  deckEl.addEventListener("scroll", function () {
    if (mode !== "swipe" || swipeTicking) return;
    swipeTicking = true;
    requestAnimationFrame(function () {
      swipeTicking = false;
      var i = Math.round(deckEl.scrollLeft / Math.max(1, deckEl.clientWidth));
      if (i !== state.index && i >= 0 && i < slides.length) { state.index = i; state.step = 0; state.json = 0; render(); }
    });
  }, { passive: true });
  window.addEventListener("resize", function () { if (mode === "swipe") swipeTo(state.index, false); });
  narrow.addEventListener("change", function () { if (!params.has("page")) setMode(defaultMode()); });

  // Hide the slides view's control bar until the mouse moves.
  var controls = q(".controls"), idleTimer = null;
  function wake() {
    controls.classList.remove("is-idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { controls.classList.add("is-idle"); }, 2000);
  }
  document.addEventListener("mousemove", wake);
  wake();

  /* ---- start ---- */
  var start = slides.map(function (s) { return "#" + s.id; }).indexOf(location.hash);
  state.index = start > 0 ? start : 0;
  setMode(mode);
  if (params.has("notes")) toggleNotes();
  if (params.has("all")) body.classList.add("all-steps");
  setTimeout(function () { body.classList.remove("is-loading"); }, 60);
  window.addEventListener("hashchange", function () {
    var i = slides.map(function (s) { return "#" + s.id; }).indexOf(location.hash);
    if (i >= 0 && i !== state.index) goTo(i, 0);
  });
})();
