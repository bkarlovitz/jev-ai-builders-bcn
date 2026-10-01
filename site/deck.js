/* deck.js: the slide engine. One slide at a time, steps inside slides,
   keyboard and touch, a long-page view, an overview, and a speaker view.
   Plain script, no modules, so it also runs from file://.

   Keys
     → space PageDown Enter   next step or slide      ← PageUp   back
     Home End                 first or last slide
     F  full screen           O  all slides           S  slides or one long page
     P  hide or show the text under the slides (presenting)
     N  speaker notes box     V  open the speaker view in a new window

   URL options: ?present  ?page  ?notes  ?speaker  ?all (show every step at once)
   and #slide-id to open a slide. */
(function () {
  "use strict";

  var body = document.body;
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var params = new URLSearchParams(location.search);
  var state = { index: 0, step: 0 };
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
      q("[data-sp-step]").textContent = steps ? (spState.step + " of " + steps + " reveals shown") : "No reveals on this slide";
      q("[data-sp-next]").textContent = spState.index + 1 < slides.length ? title(spState.index + 1) : "End";
      q("[data-sp-reader]").textContent = textOf(s, ".reader");
      document.title = "Speaker: " + title(spState.index);
    };
    window.addEventListener("message", function (e) {
      var d = e.data || {};
      if (d.jevDeck === "state") { spState.index = d.index; spState.step = d.step; renderSpeaker(); if (!started && (d.index || d.step)) started = Date.now(); }
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
  var narrow = window.matchMedia("(max-width: 700px)");
  var pageView = params.has("page") || narrow.matches;

  function setView(page) {
    pageView = page;
    body.classList.toggle("view-scroll", page);
    body.classList.toggle("view-deck", !page);
    q('[data-act="view"]').textContent = page ? "Slides" : "Page";
    if (page) {
      slides[state.index].scrollIntoView({ behavior: "instant", block: "start" });
    } else {
      window.scrollTo(0, 0);
    }
    render();
  }
  function setPresenting(on) {
    body.classList.toggle("is-presenting", on);
    body.classList.toggle("show-captions", !on);
    document.documentElement.classList.toggle("has-captions", !on);
    q('[data-act="present"]').textContent = on ? "Show text" : "Present";
  }

  /* ---- rendering ---- */
  function render() {
    slides.forEach(function (s, i) {
      var active = i === state.index;
      s.classList.toggle("is-active", active);
      s.setAttribute("aria-hidden", String(!pageView && !active));
      s.querySelectorAll("[data-step]").forEach(function (e) {
        e.classList.toggle("is-shown", pageView || i < state.index || (active && Number(e.getAttribute("data-step")) <= state.step));
      });
    });
    body.classList.toggle("on-section", !pageView && slides[state.index].classList.contains("slide--section"));
    var steps = stepsIn(slides[state.index]);
    var progress = slides.length > 1 ? (state.index + (steps ? state.step / (steps + 1) : 0)) / (slides.length - 1) : 1;
    q(".progress").style.width = (progress * 100) + "%";
    q("[data-count]").textContent = (state.index + 1) + " / " + slides.length;
    var hash = "#" + slides[state.index].id;
    if (location.hash !== hash) { try { history.replaceState(null, "", hash); } catch (e) { /* some file:// cases */ } }
    var notes = q("[data-notes-overlay]");
    if (!notes.hidden) notes.textContent = textOf(slides[state.index], ".notes");
    if (speakerWin && !speakerWin.closed) speakerWin.postMessage({ jevDeck: "state", index: state.index, step: state.step }, "*");
  }

  function goTo(index, step) {
    state.index = Math.max(0, Math.min(slides.length - 1, index));
    state.step = Math.max(0, Math.min(stepsIn(slides[state.index]), step || 0));
    if (pageView) slides[state.index].scrollIntoView({ behavior: "smooth", block: "start" });
    render();
  }
  function next() {
    if (!pageView && state.step < stepsIn(slides[state.index])) { state.step++; render(); }
    else if (state.index < slides.length - 1) goTo(state.index + 1, 0);
  }
  function prev() {
    if (!pageView && state.step > 0) { state.step--; render(); }
    else if (state.index > 0) goTo(state.index - 1, pageView ? 0 : stepsIn(slides[state.index - 1]));
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
    if (k === "ArrowRight" || k === "PageDown" || (!pageView && k === "ArrowDown") || ((k === " " || k === "Enter") && !onControl && !e.shiftKey)) { e.preventDefault(); next(); }
    else if (k === "ArrowLeft" || k === "PageUp" || (!pageView && k === "ArrowUp") || (k === " " && e.shiftKey && !onControl)) { e.preventDefault(); prev(); }
    else if (k === "Home") { e.preventDefault(); goTo(0, 0); }
    else if (k === "End") { e.preventDefault(); goTo(slides.length - 1, 0); }
    else if (k === "f" || k === "F") fullscreen();
    else if (k === "o" || k === "O") toggleOverview(true);
    else if (k === "s" || k === "S") setView(!pageView);
    else if (k === "p" || k === "P") setPresenting(!body.classList.contains("is-presenting"));
    else if (k === "n" || k === "N") toggleNotes();
    else if (k === "v" || k === "V") openSpeaker();
  });

  var touchX = null, touchY = null;
  document.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (pageView || touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX, dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { if (dx < 0) next(); else prev(); }
    touchX = null;
  }, { passive: true });

  document.querySelectorAll("[data-act]").forEach(function (b) {
    b.addEventListener("click", function () {
      var a = b.getAttribute("data-act");
      if (a === "next") next();
      else if (a === "prev") prev();
      else if (a === "overview") toggleOverview(true);
      else if (a === "view") setView(!pageView);
      else if (a === "present") setPresenting(!body.classList.contains("is-presenting"));
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

  // Hide the control bar while presenting, until the mouse moves.
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
  setPresenting(params.has("present"));
  setView(pageView);
  if (params.has("notes")) toggleNotes();
  if (params.has("all")) body.classList.add("all-steps");
  setTimeout(function () { body.classList.remove("is-loading"); }, 60);
  window.addEventListener("hashchange", function () {
    var i = slides.map(function (s) { return "#" + s.id; }).indexOf(location.hash);
    if (i >= 0 && i !== state.index) goTo(i, 0);
  });
})();
