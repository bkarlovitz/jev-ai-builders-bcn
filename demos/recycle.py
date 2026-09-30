"""Which bin? — Barcelona recycling with Jev.

One Jev call per item asks five questions at the same time:
  bin            Choice  - Jev's direct answer: one of the 5 street bins, or a Green Point
  material       Choice  - what the item is mostly made of
  is_packaging   Noul    - is it packaging / a container?
  glass_bottle   Noul    - is it a glass bottle or jar?
  dirt           Score   - clean / a little food / oily
Then ~15 lines of plain code apply the city's rules to the small answers.

Usage (from the repo root):
  python demos/recycle.py "paper napkin with oil on it"   # live; falls back to saved result if offline
  python demos/recycle.py                                 # interactive: type items one by one
  python demos/recycle.py --capture-all                   # run the prepared list, save everything
  python demos/recycle.py --offline "cork"                # only use saved results
  python demos/recycle.py --raw "cork"                    # also print the raw request and response JSON
"""
from __future__ import annotations

import argparse
import json
import re
import sys

from jev_common import CAPTURES, BOLD, DIM, c, call_jev, load_json, save_json

CAPTURE_DIR = CAPTURES / "recycle"

# Thresholds used by rules(). They are our own choices, tried only on the prepared items below.
MIN_CONFIDENCE = 0.6          # a Choice or Score answer below this counts as "not sure"
NOUL_NO, NOUL_YES = 0.2, 0.8  # a yes/no answer between these counts as "not sure"
CLEAN_PAPER_BELOW = 0.5       # paper goes in blue only if the dirt score is below this (level 0 = clean)
FIRST_VERSION_LIMIT = 1.5     # the first version of the rule: brown only if "covered in food or oil". It was wrong.
LABELS = {"material": "material", "is_packaging": "packaging?", "glass_bottle": "glass bottle?", "dirt": "how dirty"}

# --- Barcelona's five street bins, plus the Green Point (recycling centre) for things no bin takes.
# Sources: Ajuntament de Barcelona, "Street bins" page and the Waste Finder (links in README.md).
# The first version had five options and put broken glass, ceramics and toys in grey. The city does not say
# that, so Jev's confident "grey" answers were wrong. Those results are kept in captures/recycle-v1/.
BINS = {
    "yellow": "Yellow bin (packaging): plastic packaging and plastic bags, drink and food cans, cartons, metal caps and lids, aluminium foil, plastic wrap, polystyrene trays.",
    "blue": "Blue bin (paper and cardboard): clean cardboard boxes and packaging, newspapers, magazines, notebooks, envelopes, paper bags, sheets of paper, gift wrap, receipts.",
    "green": "Green bin (glass): glass bottles and glass jars only, without lids.",
    "brown": "Brown bin (organic): food, egg and nut shells, corks, tea bags, coffee grounds, kitchen paper and paper napkins dirty with oil or food, flowers and garden waste.",
    "grey": "Grey bin (general waste): cigarette ends, nappies, sanitary pads, used tissues, sweepings and dust, cotton, hair, animal excrement.",
    "green_point": "Not a street bin. Take it to a Green Point (recycling centre): toys, ceramics and porcelain, plates and drinking glasses (whole or broken), mirrors, flat glass, light bulbs, single-use coffee capsules, small appliances, wood, CDs, clothes.",
}
SWATCH = {"yellow": "43", "blue": "44", "green": "42", "brown": "48;5;94", "grey": "100", "green_point": "7"}

QUESTIONS = {
    "bin": {
        "type": "choice",
        "instructions": "In Barcelona, where should `item` go?",
        "criteria": BINS,
    },
    "material": {
        "type": "choice",
        "instructions": "What is `item` mostly made of?",
        "criteria": {
            "plastic": "Plastic.",
            "metal": "Metal, such as a can, a lid or aluminium foil.",
            "carton": "A drink or food carton (for example a milk or juice carton).",
            "glass": "Glass.",
            "paper": "Paper or cardboard.",
            "organic": "Food or other natural organic material (plants, egg shells, cork, tea, coffee).",
            "ceramic": "Ceramic, porcelain or clay.",
            "other": "Something else, or a mix of materials (textile, electronics, hair, dust...).",
        },
    },
    "is_packaging": {
        "type": "noul",
        "instructions": "Is `item` packaging, or a container that held a product (a bottle, can, jar, box, tray, wrapper or bag)?",
    },
    "glass_bottle": {
        "type": "noul",
        "instructions": "Is `item` a glass bottle or a glass jar?",
    },
    "dirt": {
        "type": "score",
        "instructions": "How much food or oil is on `item`?",
        "criteria": ["Clean, or almost clean.", "A little food on it.", "Covered or soaked in food or oil."],
    },
}

# Prepared items with the city's answer, checked against the city's Waste Finder on 30 Sep 2026.
# "?" = no clear city answer: the item is not listed, or the city's own pages disagree.
ITEMS = [
    # easy
    ("empty plastic water bottle", "yellow"),
    ("empty wine bottle", "green"),
    ("old newspaper", "blue"),
    ("banana peel", "brown"),
    ("cigarette end", "grey"),
    ("empty drink can", "yellow"),
    ("cardboard box from an online order", "blue"),
    ("yogurt pot", "yellow"),
    # surprising, but the city is clear
    ("used tea bag", "brown"),
    ("wine cork", "brown"),
    ("paper napkin with oil on it", "brown"),
    ("broken drinking glass", "green_point"),
    ("empty milk carton", "yellow"),
    ("aluminium foil", "yellow"),
    ("small plastic toy", "green_point"),
    ("broken ceramic plate", "green_point"),
    ("hair from a hairbrush", "grey"),
    ("shop receipt", "blue"),
    ("coffee capsule", "green_point"),
    # no clear city answer
    ("used pen", "?"),           # the street bins page says grey; the Waste Finder says yellow
    ("greasy pizza box", "?"),   # not listed
    # a second set, added after the rules were written
    ("empty shampoo bottle", "yellow"),
    ("empty tuna tin", "yellow"),
    ("plastic supermarket bag", "yellow"),
    ("crisp packet", "yellow"),
    ("metal lid from a jam jar", "yellow"),
    ("empty jam jar", "green"),
    ("empty beer bottle", "green"),
    ("empty perfume bottle", "green"),
    ("cardboard egg box", "blue"),
    ("empty cereal box", "blue"),
    ("printed letter", "blue"),
    ("apple core", "brown"),
    ("fish bones", "brown"),
    ("wilted flowers", "brown"),
    ("kitchen paper towel with food on it", "brown"),
    ("drinking glass", "green_point"),
    ("dust from the vacuum cleaner", "grey"),
    ("old toothbrush", "?"),        # not listed
    ("chewing gum", "?"),           # not listed
    ("plastic coat hanger", "?"),   # Waste Finder: small hard plastic goes in yellow; the street bins page does not say
    ("sticking plaster", "?"),      # not listed for street bins
]


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:60]


def rules(a: dict, clean_paper_below: float = CLEAN_PAPER_BELOW) -> tuple[str, str, list[str]]:
    """Plain code: turn the small answers into a bin. Returns (bin, reason, unsure).

    unsure lists the small answers this decision used that Jev was not sure about.
    If it is not empty, the app says "check the city guide".
    """
    mat = a["material"]["choice"]
    unsure = []
    if a["material"]["confidence"] < MIN_CONFIDENCE:
        unsure.append("material")

    def yes(question: str) -> bool:
        p = a[question]["noul"]
        if NOUL_NO < p < NOUL_YES:
            unsure.append(question)
        return p >= 0.5

    if mat == "organic":
        return "brown", "organic material", unsure
    if mat == "glass":
        if yes("glass_bottle"):
            return "green", "glass bottle or jar", unsure
        return "green_point", "glass, but not a bottle or jar", unsure
    if mat == "paper":
        if a["dirt"]["confidence"] < MIN_CONFIDENCE:
            unsure.append("dirt")
        if a["dirt"]["score"] >= clean_paper_below:
            return "brown", "paper with food or oil", unsure
        return "blue", "clean paper or cardboard", unsure
    if mat in ("plastic", "metal", "carton"):
        if yes("is_packaging"):
            return "yellow", f"{mat} packaging", unsure
        return "green_point", f"{mat}, but not packaging", unsure
    if mat == "ceramic":
        return "green_point", "ceramic", unsure
    return "grey", "other material", unsure


def swatch(b: str) -> str:
    return c(f" {b.upper().replace('_', ' '):^11} ", SWATCH.get(b, "0"))


def show(item: str, cap: dict, saved: bool, raw: bool, expected: str | None = None) -> None:
    a = cap["response"]["answers"]
    print()
    print(c(f"  {item}", BOLD) + (c("   (saved result)", DIM) if saved else ""))
    if raw:
        print(c("  request:", DIM))
        print(json.dumps(cap["request"], indent=2, ensure_ascii=False))
        print(c("  response:", DIM))
        print(json.dumps(cap["response"], indent=2, ensure_ascii=False))

    probs = a["bin"]["probabilities"]
    print(c("  Jev, direct:", DIM))
    for b in BINS:
        p = probs.get(b, 0.0)
        bar = "█" * round(p * 30)
        print(f"    {swatch(b)} {bar:<30} {p:5.0%}")
    print(f"    pick: {swatch(a['bin']['choice'])}  confidence {a['bin']['confidence']:.2f}")

    print(c("  Small answers:", DIM))
    print(f"    material     {a['material']['choice']:<9} (conf {a['material']['confidence']:.2f})")
    print(f"    packaging?   {a['is_packaging']['noul']:.2f}")
    print(f"    glass bottle? {a['glass_bottle']['noul']:.2f}")
    print(f"    dirt level   {a['dirt']['score']:.2f} of 2  (conf {a['dirt']['confidence']:.2f})")

    b, why, unsure = rules(a)
    verdict = f"{swatch(b)}  because: {why}"
    if unsure:
        verdict += c(f"  →  not sure about {', '.join(LABELS[q] for q in unsure)}: check the city guide", "33")
    print(c("  Code + rules:", DIM))
    print(f"    {verdict}")
    lat = cap.get("latency_ms")
    usage = cap["response"].get("usage", {})
    srv = cap.get("server_ms")
    srv_txt = f" ({srv} ms inside TypeSafe)" if srv is not None else ""
    print(c(f"  {lat:.0f} ms round trip{srv_txt} · {usage.get('input_tokens', '?')} input tokens · 5 questions, 1 call", DIM))
    if expected:
        print(c(f"  City guide says: {expected}", DIM))


def run_one(item: str, offline: bool, raw: bool, expected: str | None = None, quiet: bool = False) -> dict | None:
    path = CAPTURE_DIR / f"{slug(item)}.json"
    cap, saved = None, False
    if not offline:
        try:
            cap = call_jev({"item": item}, QUESTIONS, timeout=5.0)
            cap["item"] = item
            save_json(path, cap)
        except RuntimeError as e:  # the API answered with an error
            print(c(f"  ({e}; using saved result)", DIM))
        except Exception as e:  # network down, timeout, etc.
            print(c(f"  (no connection: {e.__class__.__name__}, using saved result)", DIM))
    if cap is None:
        if path.exists():
            cap, saved = load_json(path), True
        else:
            print(c(f"  No saved result for '{item}'.", "31"))
            return None
    if not quiet:
        show(item, cap, saved, raw, expected)
    return cap


def capture_all(raw: bool) -> None:
    rows = []
    for item, expected in ITEMS:
        cap = run_one(item, offline=False, raw=raw, expected=expected)
        if not cap:
            continue
        a = cap["response"]["answers"]
        rb, why, unsure = rules(a)
        rows.append({
            "item": item, "city": expected,
            "jev_bin": a["bin"]["choice"], "jev_conf": round(a["bin"]["confidence"], 3),
            "rules_bin": rb, "rules_reason": why, "rules_unsure": unsure,
            "rules_bin_first_version": rules(a, FIRST_VERSION_LIMIT)[0],
            "latency_ms": cap["latency_ms"], "server_ms": cap.get("server_ms"),
            "input_tokens": cap["response"].get("usage", {}).get("input_tokens"),
        })
    save_json(CAPTURE_DIR / "_summary.json", rows)
    print()
    print(c(f"  {'item':<36} {'city':<12} {'jev':<12} {'conf':>5}  {'rules':<12} {'ms':>5}  not sure about", BOLD))
    for r in rows:
        ok = lambda b: " " if r["city"] == "?" else ("✓" if b == r["city"] else "✗")
        print(f"  {r['item']:<36} {r['city']:<12} {r['jev_bin']:<11}{ok(r['jev_bin'])} {r['jev_conf']:>5.2f}  "
              f"{r['rules_bin']:<11}{ok(r['rules_bin'])} {r['latency_ms']:>5.0f}  {', '.join(LABELS[q] for q in r['rules_unsure'])}")
    known = [r for r in rows if r["city"] != "?"]
    for name, key in (("Jev, direct", "jev_bin"), ("Code + rules", "rules_bin"), ("Rules, first version", "rules_bin_first_version")):
        print(f"  {name}: {sum(r[key] == r['city'] for r in known)} of {len(known)} right")
    print(c(f"\n  Saved to {CAPTURE_DIR}", DIM))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("item", nargs="*", help="the thing you want to throw away")
    ap.add_argument("--offline", action="store_true", help="never call the API; use saved results")
    ap.add_argument("--raw", action="store_true", help="print the raw request/response JSON")
    ap.add_argument("--capture-all", action="store_true", help="run and save the prepared item list")
    args = ap.parse_args()

    if args.capture_all:
        capture_all(args.raw)
        return
    if args.item:
        run_one(" ".join(args.item), args.offline, args.raw)
        return
    print(c("  Which bin?  Type an item and press Enter (empty line to quit).", BOLD))
    while True:
        try:
            item = input("\n  > ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if not item:
            break
        run_one(item, args.offline, args.raw)


if __name__ == "__main__":
    main()
