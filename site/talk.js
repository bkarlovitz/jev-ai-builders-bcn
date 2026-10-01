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
    "recycle.direct_right": T.direct_right, "recycle.rules_right": T.rules_right, "recycle.flagged": T.flagged,
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

  // ---- The basics: short customer messages (slides 3 to 7) ----
  var B = DATA.basics;
  var TOPIC_LABEL = { bug: "bug", feature_request: "feature request", billing: "billing", praise: "praise" };
  function message(text) { return B.messages.filter(function (m) { return m.message === text; })[0]; }
  function plainBar(box, label, width, value, isPick) {
    var row = el("div", "bar-row" + (isPick ? " is-pick" : ""));
    row.appendChild(el("span", "bar-name", label));
    var track = el("div", "bar-track"), fill = el("div", "bar-fill");
    fill.style.width = (width * 100) + "%";
    track.appendChild(fill);
    row.appendChild(track);
    row.appendChild(el("span", "bar-pct", value));
    box.appendChild(row);
  }
  // Choice: the topic of one message, a bar per option
  $all("[data-topic-bars]").forEach(function (box) {
    var m = message(box.getAttribute("data-topic-bars"));
    B.topics.forEach(function (t) { plainBar(box, TOPIC_LABEL[t] || t, m.topic.probabilities[t], pct(m.topic.probabilities[t]), t === m.topic.choice); });
  });
  // Choice: the criteria (options and their descriptions), and the confidence of an answer
  $all("[data-topic-criteria]").forEach(function (list) {
    B.topics.forEach(function (t) {
      var li = el("li");
      li.appendChild(el("span", "chip", TOPIC_LABEL[t] || t));
      li.appendChild(el("span", null, B.topic_criteria[t]));
      list.appendChild(li);
    });
  });
  $all("[data-topic-conf]").forEach(function (n) { n.textContent = message(n.getAttribute("data-topic-conf")).topic.confidence.toFixed(2); });

  // Noul: does each message ask for a refund?
  $all("[data-refund-bars]").forEach(function (box) {
    var names = box.getAttribute("data-items").split("|"), labels = box.getAttribute("data-labels").split("|");
    names.forEach(function (name, k) { var v = message(name).refund; plainBar(box, labels[k], v, v.toFixed(2), false); });
  });
  // Score: how upset, placed on the 0-2 scale
  $all("[data-upset-scale]").forEach(function (box) {
    box.setAttribute("data-scale", "upset");
  });

  // Noul answers for a few items: one yes-probability each
  $all("[data-noul]").forEach(function (box) {
    var field = box.getAttribute("data-noul");
    var names = box.getAttribute("data-items").split("|"), labels = (box.getAttribute("data-labels") || "").split("|");
    names.forEach(function (name, k) {
      var it = item(name), v = it[field];
      var row = el("div", "bar-row");
      row.appendChild(el("span", "bar-name", labels[k] || name));
      var track = el("div", "bar-track"), fill = el("div", "bar-fill");
      fill.style.width = (v * 100) + "%";
      track.appendChild(fill);
      row.appendChild(track);
      row.appendChild(el("span", "bar-pct", v.toFixed(2)));
      box.appendChild(row);
    });
  });

  // Score answers for a few items, placed on the 0-2 scale
  $all("[data-scale]").forEach(function (box) {
    var field = box.getAttribute("data-scale");
    var names = box.getAttribute("data-items").split("|"), labels = (box.getAttribute("data-labels") || "").split("|");
    var levels = (box.getAttribute("data-levels") || "").split("|");
    var line = el("div", "scale-line");
    [0, 1, 2].forEach(function (t) {
      var tick = el("span", "scale-tick" + (t === 0 ? " is-start" : t === 2 ? " is-end" : ""));
      tick.appendChild(el("strong", null, String(t)));
      tick.appendChild(el("span", null, levels[t] || ""));
      tick.style.left = (t / 2 * 100) + "%";
      line.appendChild(tick);
    });
    names.forEach(function (name, k) {
      var v = field === "upset" ? message(name).upset.score : item(name)[field];
      var mark = el("div", "scale-mark" + (v < 0.2 ? " is-start" : v > 1.8 ? " is-end" : ""));
      mark.style.left = (v / 2 * 100) + "%";
      mark.appendChild(el("span", "scale-mark-name", labels[k] || name));
      mark.appendChild(el("span", "scale-mark-value", v.toFixed(2)));
      line.appendChild(mark);
    });
    box.insertBefore(line, box.firstChild);
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

  // One call: the real request and answer, with the API terms highlighted
  var TERMS = { state: 1, questions: 1, type: 1, instructions: 1, criteria: 1, choice: 1, probabilities: 1, confidence: 1 };
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function jsonHtml(v, pad) {
    pad = pad || "";
    if (v === null || typeof v !== "object") return esc(JSON.stringify(v));
    var inner = pad + "  ";
    var simple = Object.keys(v).every(function (k) { return v[k] === null || typeof v[k] !== "object"; });
    if (simple && JSON.stringify(v).length < 110) {
      return "{ " + Object.keys(v).map(function (k) { return esc(JSON.stringify(k)) + ": " + esc(JSON.stringify(v[k])); }).join(", ") + " }";
    }
    var parts = Object.keys(v).map(function (k) {
      var key = esc(JSON.stringify(k));
      if (TERMS[k]) key = '<span class="term-key">' + key + "</span>";
      return inner + key + ": " + jsonHtml(v[k], inner);
    });
    return "{\n" + parts.join(",\n") + "\n" + pad + "}";
  }
  function shortCriterion(text) {
    var cut = text.indexOf(":");
    var head = cut >= 0 ? text.slice(0, cut) : text;
    if (head.length > 30 && head.indexOf(".") > 0) head = head.slice(0, head.indexOf("."));
    return head + ": …";
  }
  var picker = $("[data-picker]");
  if (picker) {
    var reqBox = $('[data-call="request"]'), resBox = $('[data-call="response"]'), meta = $("[data-result-meta]");
    var q = R.cork_call.request.questions.bin, criteria = {};
    Object.keys(q.criteria).forEach(function (k) { criteria[k] = shortCriterion(q.criteria[k]); });
    var show = function (name) {
      var it = item(name), probs = {};
      Object.keys(it.probabilities).sort(function (a, b) { return it.probabilities[b] - it.probabilities[a]; })
        .forEach(function (k) { probs[k] = it.probabilities[k]; });
      reqBox.innerHTML = jsonHtml({ state: { item: name }, questions: { bin: { type: q.type, instructions: q.instructions, criteria: criteria } } });
      resBox.innerHTML = jsonHtml({ bin: { choice: it.choice, confidence: it.confidence, probabilities: probs } });
      var perDollar = Math.round(1 / (it.input_tokens * PRICE_PER_TOKEN) / 1000) * 1000;
      meta.textContent = Math.round(it.latency_ms) + " ms. " + it.input_tokens + " tokens. About " + num(perDollar) + " calls for one dollar.";
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

  // ---- The fixed "I send / Jev sends back" frame (slides 5 to 7) ----
  function neutralBar(box, label, width, value, isPick, bin) {
    var row = el("div", "bar-row" + (isPick ? " is-pick" : ""));
    row.appendChild(el("span", "bar-name", label));
    var track = el("div", "bar-track"), fill = el("div", "bar-fill");
    if (bin) fill.setAttribute("data-bin", bin);
    fill.style.width = (width * 100) + "%";
    track.appendChild(fill);
    row.appendChild(track);
    row.appendChild(el("span", "bar-pct", value));
    box.appendChild(row);
  }
  // Choice: the two highest probabilities, then the rest in one line
  $all("[data-top-bars]").forEach(function (box) {
    var it = item(box.getAttribute("data-top-bars")), p = it.probabilities;
    var keys = Object.keys(p).sort(function (a, b) { return p[b] - p[a]; });
    keys.slice(0, 2).forEach(function (k) { neutralBar(box, BIN_NAME[k], p[k], pct(p[k]), k === it.choice, k); });
    var rest = keys.slice(2), restSum = rest.reduce(function (s, k) { return s + p[k]; }, 0);
    neutralBar(box, "the other " + rest.length, restSum, pct(restSum), false, null);
  });
  // Score: value, confidence and one bar per level
  $all("[data-score-value]").forEach(function (n) { n.textContent = item(n.getAttribute("data-score-value")).dirt.toFixed(2); });
  $all("[data-score-conf]").forEach(function (n) { n.textContent = item(n.getAttribute("data-score-conf")).dirt_confidence.toFixed(2); });
  $all("[data-level-bars]").forEach(function (box) {
    var p = item(box.getAttribute("data-level-bars")).dirt_probabilities, labels = box.getAttribute("data-levels").split("|");
    Object.keys(p).sort().forEach(function (k, i) { neutralBar(box, labels[i] || k, p[k], pct(p[k]), false, null); });
  });
  // Noul: the value, and a no-to-yes line with a mark at 0.5
  $all("[data-noul-value]").forEach(function (n) { n.textContent = item(n.getAttribute("data-noul-value")).is_packaging.toFixed(2); });
  $all("[data-yesno]").forEach(function (box) {
    var field = box.getAttribute("data-yesno");
    var line = el("div", "yesno-line");
    var half = el("span", "yesno-half", "0.5");
    line.appendChild(half);
    function mark(name, label, main) {
      var v = item(name)[field];
      var m = el("div", "yesno-mark" + (main ? " is-main" : "") + (v > 0.85 ? " is-end" : v < 0.15 ? " is-start" : ""));
      m.style.left = (v * 100) + "%";
      m.appendChild(el("span", "yesno-label", label + " " + v.toFixed(2)));
      line.appendChild(m);
    }
    var others = box.getAttribute("data-others").split("|"), labels = box.getAttribute("data-labels").split("|");
    others.forEach(function (name, k) { mark(name, labels[k] || name, false); });
    var main = box.getAttribute("data-main");
    mark(main, main, true);
    box.appendChild(el("span", "yesno-end", "no"));
    box.appendChild(line);
    box.appendChild(el("span", "yesno-end", "yes"));
  });

  // Confidence of an item's direct answer, and the level probabilities of a Score
  $all("[data-conf]").forEach(function (n) { n.textContent = item(n.getAttribute("data-conf")).confidence.toFixed(2); });
  $all("[data-dirt-probs]").forEach(function (n) {
    var name = n.getAttribute("data-dirt-probs"), p = item(name).dirt_probabilities;
    n.textContent = name + ": " + Object.keys(p).filter(function (k) { return p[k] >= 0.01; })
      .map(function (k) { return "level " + k + " " + pct(p[k]); }).join(" · ");
  });

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
      ["How much food or oil? (0 to 2)", nap.dirt.toFixed(2) + (nap.rules_unsure.indexOf("how dirty") >= 0 ? " (not sure)" : "")]
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
