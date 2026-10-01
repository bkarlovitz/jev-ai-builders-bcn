/* talk.js: fills the slides with the saved demo results from data/talk-data.js.
   Plain script, no modules, so it also runs from file://. */
(function () {
  "use strict";

  var DATA = window.TALK_DATA;
  if (!DATA) return;

  var BIN_ORDER = ["yellow", "blue", "green", "brown", "grey", "green_point"];
  var BIN_NAME = { yellow: "yellow", blue: "blue", green: "green", brown: "brown", grey: "grey", green_point: "Green Point", "?": "no clear answer" };
  var BIN_HINT = { yellow: "packaging", blue: "paper", green: "glass", brown: "organic", grey: "general waste", green_point: "not a bin" };
  var TOPIC_NAME = {
    education_culture: "education and culture", mobility: "mobility", social: "social", public_space: "public space",
    environment: "environment", economy: "economy", government: "government", housing: "housing", other: "other", tourism: "tourism"
  };
  var PICKER_ITEMS = ["wine cork", "broken drinking glass", "yogurt pot", "used pen", "coffee capsule"];
  var PRICE_PER_TOKEN = 0.042 / 1e6;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function pct(p) { return Math.round(p * 100) + "%"; }
  function num(n) { return n.toLocaleString("en-US"); }
  function chip(bin) {
    var c = el("span", "chip", BIN_NAME[bin] || bin);
    if (bin !== "?") c.setAttribute("data-bin", bin);
    return c;
  }
  function item(name) {
    return DATA.recycle.items.filter(function (i) { return i.item === name; })[0];
  }

  function renderBars(box, probabilities, pick) {
    box.textContent = "";
    BIN_ORDER.filter(function (b) { return b in probabilities; }).forEach(function (b) {
      var row = el("div", "bar-row" + (b === pick ? " is-pick" : ""));
      row.appendChild(el("span", "bar-name", BIN_NAME[b]));
      var track = el("div", "bar-track"), fill = el("div", "bar-fill");
      fill.setAttribute("data-bin", b);
      fill.style.width = (probabilities[b] * 100) + "%";
      track.appendChild(fill);
      row.appendChild(track);
      row.appendChild(el("span", "bar-pct", pct(probabilities[b])));
      box.appendChild(row);
    });
  }

  var R = DATA.recycle, D = DATA.decidim, T = R.totals;

  // Headline numbers
  var values = {
    "recycle.items": T.items, "recycle.known": T.known, "recycle.unclear": T.unclear,
    "recycle.direct_right": T.direct_right, "recycle.rules_right": T.rules_right,
    "decidim.proposals": num(D.proposals), "decidim.answers": num(D.answers),
    "decidim.minutes": Math.round(D.seconds / 60) + " min", "decidim.cost": "$" + D.cost_usd.toFixed(2)
  };
  $all("[data-k]").forEach(function (n) {
    var v = values[n.getAttribute("data-k")];
    if (v != null) n.textContent = v;
  });

  // Bar charts for named items, and the first version's broken glass
  $all("[data-bars]").forEach(function (box) {
    var it = item(box.getAttribute("data-bars"));
    if (it) renderBars(box, it.probabilities, it.choice);
  });
  $all("[data-bars-v1]").forEach(function (box) {
    renderBars(box, R.first_version_broken_glass.probabilities, R.first_version_broken_glass.choice);
  });

  // The six places
  $all("[data-bins]").forEach(function (box) {
    BIN_ORDER.forEach(function (b) {
      var d = el("div", "bin", BIN_NAME[b]);
      d.setAttribute("data-bin", b);
      d.appendChild(el("small", null, BIN_HINT[b]));
      box.appendChild(d);
    });
  });

  // The option descriptions, as sent to Jev
  $all("[data-options]").forEach(function (list) {
    BIN_ORDER.forEach(function (b) {
      var li = el("li"), name = el("span");
      name.appendChild(chip(b));
      li.appendChild(name);
      li.appendChild(el("span", null, R.options[b].replace(/^[^:.]*[:.]\s*/, "")));
      list.appendChild(li);
    });
  });

  // One item, one call
  var picker = $("[data-picker]");
  if (picker) {
    var resultBars = $("[data-result-bars]"), resultPick = $("[data-result-pick]"), meta = $("[data-result-meta]");
    var show = function (name) {
      var it = item(name);
      renderBars(resultBars, it.probabilities, it.choice);
      resultPick.textContent = "";
      resultPick.appendChild(chip(it.choice));
      resultPick.appendChild(document.createTextNode("  Confidence " + it.confidence.toFixed(2)));
      var perDollar = Math.round(1 / (it.input_tokens * PRICE_PER_TOKEN) / 1000) * 1000;
      meta.textContent = Math.round(it.latency_ms) + " ms. " + it.input_tokens + " tokens sent. One dollar pays for about " + num(perDollar) + " of these calls.";
      $all("button", picker).forEach(function (b) { b.setAttribute("aria-pressed", String(b.textContent === name)); });
    };
    PICKER_ITEMS.forEach(function (name) {
      var b = el("button", null, name);
      b.type = "button";
      b.addEventListener("click", function () { show(name); });
      picker.appendChild(b);
    });
    show(PICKER_ITEMS[0]);
  }

  // The real call (JSON)
  $all('[data-json="request"]').forEach(function (p) { p.textContent = JSON.stringify(R.cork_call.request, null, 2); });
  $all('[data-json="response"]').forEach(function (p) { p.textContent = JSON.stringify(R.cork_call.response, null, 2); });

  // Small answers for the oily napkin
  $all("[data-small-answers]").forEach(function (body) {
    var nap = item("paper napkin with oil on it");
    [
      ["Where should it go?", null],
      ["What is it made of?", nap.material],
      ["Is it packaging?", nap.is_packaging.toFixed(2)],
      ["Is it a glass bottle or jar?", nap.glass_bottle.toFixed(2)],
      ["How much food or oil? (0 to 2)", nap.dirt.toFixed(2)]
    ].forEach(function (r) {
      var tr = el("tr"), cell = el("td");
      tr.appendChild(el("td", null, r[0]));
      if (r[1] === null) cell.appendChild(chip(nap.choice)); else cell.textContent = r[1];
      tr.appendChild(cell);
      body.appendChild(tr);
    });
  });
  $all("[data-limit]").forEach(function (n) { n.textContent = R.rule_limits[n.getAttribute("data-limit")]; });

  // All items (shown in the long-page view)
  $all("[data-all-items]").forEach(function (body) {
    R.items.forEach(function (it) {
      var tr = el("tr"), known = it.city !== "?";
      tr.appendChild(el("td", null, it.item));
      var city = el("td"); city.appendChild(chip(it.city)); tr.appendChild(city);
      var direct = el("td", known && it.choice !== it.city ? "miss" : null); direct.appendChild(chip(it.choice)); tr.appendChild(direct);
      tr.appendChild(el("td", null, pct(it.probabilities[it.choice])));
      var rules = el("td", known && it.rules_bin !== it.city ? "miss" : null); rules.appendChild(chip(it.rules_bin));
      if (known && it.rules_bin !== it.city) rules.appendChild(document.createTextNode(" wrong"));
      tr.appendChild(rules);
      tr.appendChild(el("td", null, it.rules_unsure.join(", ")));
      body.appendChild(tr);
    });
  });

  // Decidim topics
  $all("[data-topics]").forEach(function (box) {
    var keys = Object.keys(D.topics);
    var max = Math.max.apply(null, keys.map(function (k) { return D.topics[k]; }));
    keys.sort(function (a, b) { return D.topics[b] - D.topics[a]; }).forEach(function (k) {
      var row = el("div", "topic-row");
      row.appendChild(el("span", null, TOPIC_NAME[k] || k));
      var track = el("div", "topic-track"), fill = el("div", "topic-fill");
      fill.style.width = (D.topics[k] / max * 100) + "%";
      track.appendChild(fill);
      row.appendChild(track);
      row.appendChild(el("span", "topic-num", num(D.topics[k])));
      box.appendChild(row);
    });
  });
})();
