"""Copy what the presentation page needs from captures/ into site/data/talk-data.js.

The page never calls the API. It reads this one file, which also works when the page is
opened straight from disk (file://).

Usage (from the repo root):  python tools/build_site_data.py
"""
from __future__ import annotations

import json
import statistics
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "demos"))

import basics  # noqa: E402
import decidim  # noqa: E402
import recycle  # noqa: E402

OUT = ROOT / "site" / "data" / "talk-data.js"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def recycle_data() -> dict:
    summary = {r["item"]: r for r in load(recycle.CAPTURE_DIR / "_summary.json")}
    items = []
    for item, city in recycle.ITEMS:
        cap = load(recycle.CAPTURE_DIR / f"{recycle.slug(item)}.json")
        a = cap["response"]["answers"]
        row = summary[item]
        items.append({
            "item": item,
            "city": city,
            "probabilities": a["bin"]["probabilities"],
            "choice": a["bin"]["choice"],
            "confidence": a["bin"]["confidence"],
            "material": a["material"]["choice"],
            "material_confidence": a["material"]["confidence"],
            "is_packaging": a["is_packaging"]["noul"],
            "glass_bottle": a["glass_bottle"]["noul"],
            "dirt": a["dirt"]["score"],
            "dirt_probabilities": a["dirt"]["probabilities"],
            "dirt_confidence": a["dirt"]["confidence"],
            "rules_bin": row["rules_bin"],
            "rules_reason": row["rules_reason"],
            "rules_unsure": [recycle.LABELS[q] for q in row["rules_unsure"]],
            "rules_bin_first_version": row["rules_bin_first_version"],
            "latency_ms": cap["latency_ms"],
            "input_tokens": cap["response"]["usage"]["input_tokens"],
        })
    known = [i for i in items if i["city"] != "?"]
    cork = load(recycle.CAPTURE_DIR / "wine-cork.json")
    v1_glass = load(ROOT / "captures" / "recycle-v1" / "broken-drinking-glass.json")["response"]["answers"]["bin"]
    return {
        "options": recycle.BINS,
        "items": items,
        "totals": {
            "items": len(items),
            "known": len(known),
            "unclear": len(items) - len(known),
            "direct_right": sum(i["choice"] == i["city"] for i in known),
            "rules_right": sum(i["rules_bin"] == i["city"] for i in known),
            "first_version_right": sum(i["rules_bin_first_version"] == i["city"] for i in known),
            "flagged": sum(1 for i in items if i["rules_unsure"]),
            "median_latency_ms": round(statistics.median(i["latency_ms"] for i in items)),
            "median_input_tokens": round(statistics.median(i["input_tokens"] for i in items)),
        },
        "first_version_broken_glass": {"choice": v1_glass["choice"], "probabilities": v1_glass["probabilities"]},
        # One of the five questions, as sent and as answered, for the "real JSON" view.
        "cork_call": {
            "request": {
                "state": cork["request"]["state"],
                "model": cork["request"]["model"],
                "questions": {"bin": cork["request"]["questions"]["bin"]},
            },
            "response": {
                "model": cork["response"]["model"],
                "answers": {"bin": cork["response"]["answers"]["bin"]},
                "usage": cork["response"]["usage"],
            },
        },
        "rule_limits": {"first_version": recycle.FIRST_VERSION_LIMIT, "now": recycle.CLEAN_PAPER_BELOW},
        # Full real calls (all five questions) for the JSON view
        "calls": {name: full_call(recycle.CAPTURE_DIR / f"{recycle.slug(name)}.json")
                  for name in ("wine cork", "paper napkin with oil on it")},
    }


def full_call(path: Path) -> dict:
    cap = load(path)
    return {"request": cap["request"], "response": cap["response"], "latency_ms": cap["latency_ms"]}


def basics_data() -> dict:
    messages = []
    for message in basics.MESSAGES:
        cap = load(basics.CAPTURE_DIR / f"{basics.slug(message)}.json")
        a = cap["response"]["answers"]
        messages.append({
            "message": message,
            "topic": {k: a["topic"][k] for k in ("choice", "confidence", "probabilities")},
            "upset": {k: a["upset"][k] for k in ("score", "confidence")},
            "refund": a["refund"]["noul"],
        })
    return {
        "topics": list(basics.QUESTIONS["topic"]["criteria"]),
        "topic_criteria": basics.QUESTIONS["topic"]["criteria"],
        "upset_levels": basics.QUESTIONS["upset"]["criteria"],
        "messages": messages,
    }


# Shown on the slides with each example proposal. The English is a short gloss, not a full translation.
# District and city label come from the open data (taxonomies); author names are left out on purpose.
EXAMPLE_NOTES = {
    "17120": {
        "gloss": "Finish the bike lane on Avinguda Vallcarca. Today it has a gap. We need a safe bike route "
                 "from Plaça Lesseps to the Ronda de Dalt.",
        "district": "Gràcia", "result": "accepted", "city_label": "Mobilitat sostenible i segura",
    },
    "17535": {
        "gloss": "A collection system for glass and plastic containers, like in other countries, that pays people "
                 "who recycle with money, vouchers or discounts. Machines in markets, supermarkets and public spaces.",
        "district": "la Barceloneta", "result": "rejected", "city_label": "Residu zero",
    },
}


def decidim_data() -> dict:
    s = load(ROOT / "captures" / "decidim" / "summary.json")
    examples = []
    for r in load(ROOT / "captures" / "decidim" / "examples.json"):
        examples.append({**r, **EXAMPLE_NOTES[str(r["id"])], "year": r["published_at"][:4]})
    return {
        "questions": decidim.QUESTIONS,
        "examples": examples,
        "scale_levels": s["scale_levels"],
        "children_count": s["children_count"],
        "about_tourism_count": s["about_tourism_count"],
        "processes": s["processes"],
        "years": s["years"],
        "failed": s["last_run"].get("failed_this_run", 0),
        "proposals": s["proposals"],
        "answers": s["questions_answered"],
        "seconds": s["last_run"]["wall_seconds"],
        "cost_usd": s["cost_usd"],
        "input_tokens": s["input_tokens"],
        "topics": s["topics"],
        "about_tourism_share": s["about_tourism_share"],
    }


def main() -> None:
    data = {"basics": basics_data(), "recycle": recycle_data(), "decidim": decidim_data()}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "// Generated by tools/build_site_data.py from captures/. Do not edit by hand.\n"
        "window.TALK_DATA = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n",
        encoding="utf-8",
    )
    t = data["recycle"]["totals"]
    print(f"Wrote {OUT} ({OUT.stat().st_size / 1000:.0f} kB)")
    print(f"recycle: {t['items']} items, direct {t['direct_right']}/{t['known']}, rules {t['rules_right']}/{t['known']}, "
          f"first version {t['first_version_right']}/{t['known']}, median {t['median_latency_ms']} ms, {t['median_input_tokens']} tokens")
    d = data["decidim"]
    print(f"decidim: {d['proposals']} proposals, {d['answers']} answers, {d['seconds']} s, ${d['cost_usd']}")


if __name__ == "__main__":
    main()
