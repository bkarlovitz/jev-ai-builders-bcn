"""Read every citizen proposal on decidim.barcelona with Jev.

Run from the repo root.

Step 1  download:  python demos/decidim.py download
        (gets the open-data zip from decidim.barcelona into data/; if that fails, download it
         in your browser from https://www.decidim.barcelona/open-data and pass --csv PATH)
Step 2  run:       python demos/decidim.py run [--limit N] [--csv PATH]
        (asks 5 questions about every proposal, in parallel; resumes if interrupted)
Step 3  summary:   python demos/decidim.py summary

Results go to captures/decidim/ (results.jsonl and summary.json).
"""
from __future__ import annotations

import argparse
import asyncio
import csv
import html
import io
import json
import re
import sys
import time
from pathlib import Path

import httpx

from jev_common import CAPTURES, DATA, PRICE_PER_INPUT_TOKEN, BOLD, DIM, api_key, c, call_jev_async, save_json

OUT = CAPTURES / "decidim"
CSV_URL = "https://www.decidim.barcelona/open-data/download?resource=proposals"
CONCURRENCY = 20
MAX_REQUESTS_PER_SECOND = 30  # the documented limit is 40 requests per second
MAX_BODY_CHARS = 2000

QUESTIONS = {
    "topic": {
        "type": "choice",
        "instructions": "What is the main topic of this citizen proposal to the city of Barcelona?",
        "criteria": {
            "mobility": "Transport, traffic, cars, bikes, buses, metro, parking, walking.",
            "public_space": "Streets, squares, pavements, benches, lighting, cleaning, noise in the street.",
            "housing": "Housing, rent, flats, evictions.",
            "environment": "Parks, gardens, trees and green areas, recycling, pollution, climate, energy, water.",
            "social": "Health, care, elderly people, poverty, inclusion, equality.",
            "education_culture": "Schools, children, libraries, culture, sport, festivals.",
            "tourism": "Tourists, tourist flats, cruise ships, tourist crowds.",
            "economy": "Jobs, shops, markets, businesses, taxes.",
            "government": "How the city council works, participation, transparency, digital services.",
            "other": "None of the above.",
        },
    },
    "about_tourism": {
        "type": "noul",
        "instructions": "Does this proposal talk about tourism or tourists, even as a side point?",
    },
    "complaint": {
        "type": "noul",
        "instructions": "Does the author describe a problem they are unhappy about, not only suggest a new idea?",
        "criteria": {
            "true": "The text describes something that is wrong, missing or annoying today (for example dirt, noise, danger, a broken or missing service).",
            "false": "The text only proposes an action or a new idea and does not describe a current problem.",
        },
    },
    "scale": {
        "type": "score",
        "instructions": "How big is the change this proposal asks for?",
        "criteria": [
            "A small fix in one place (one street, one bench, one crossing).",
            "A change for one neighbourhood or district.",
            "A change for the whole city.",
        ],
    },
    "children": {
        "type": "noul",
        "instructions": "Is this proposal mainly about children or young people?",
    },
}


def download() -> Path:
    """The full zip returned HTTP 500 on 30 Sep 2026; the proposals-only CSV works."""
    DATA.mkdir(exist_ok=True)
    path = DATA / "proposals.csv"
    print(f"Downloading {CSV_URL} ...")
    with httpx.stream("GET", CSV_URL, follow_redirects=True, timeout=600) as r:
        r.raise_for_status()
        with path.open("wb") as f:
            for chunk in r.iter_bytes(1 << 20):
                f.write(chunk)
    print(c(f"Saved {path} ({path.stat().st_size / 1e6:.0f} MB)", DIM))
    return path


def find_csv() -> Path:
    cands = [p for p in DATA.rglob("*.csv") if "proposal" in p.name.lower() and "comment" not in p.name.lower()]
    if not cands:
        sys.exit(f"No proposals CSV found in {DATA}. Run 'download' or pass --csv PATH.")
    return max(cands, key=lambda p: p.stat().st_size)


def clean(text: str) -> str:
    text = html.unescape(re.sub(r"<[^>]+>", " ", text or ""))
    return re.sub(r"\s+", " ", text).strip()


def pick(row: dict, prefix: str) -> str:
    """Decidim exports multilingual columns like 'title/ca', 'title/es' or 'title/machine_translations/en'."""
    keys = [k for k in row if k and (k == prefix or k.startswith(prefix + "/"))]
    for lang in ("en", "es", "ca"):
        for k in keys:
            if k.endswith("/" + lang) and "machine" not in k and row[k]:
                return row[k]
    for k in keys:
        if row[k]:
            return row[k]
    return ""


def load_proposals(csv_path: Path) -> list[dict]:
    csv.field_size_limit(10**9)
    raw = csv_path.read_text(encoding="utf-8-sig", errors="replace")
    delim = ";" if raw[:5000].count(";") > raw[:5000].count(",") else ","
    rows = list(csv.DictReader(io.StringIO(raw), delimiter=delim))
    print(c(f"{len(rows)} rows in {csv_path.name}; columns: {', '.join(list(rows[0].keys())[:40])}", DIM))
    out = []
    for row in rows:
        if str(row.get("is_amend", "")).lower() in ("true", "1"):
            continue
        title, body = clean(pick(row, "title")), clean(pick(row, "body"))
        if not (title or body):
            continue
        out.append({
            "id": row.get("id") or row.get("reference"),
            "title": title,
            "body": body[:MAX_BODY_CHARS],
            "url": row.get("url", ""),
            "published_at": row.get("published_at", ""),
            "state": row.get("state", ""),
            "likes": row.get("likes/total_count", ""),
            "created_in_meeting": str(row.get("created_in_meeting", "")).lower() == "true",
            "process": row.get("participatory_space/url") or row.get("participatory_space/id", ""),
        })
    return out


async def run(csv_path: Path, limit: int | None) -> None:
    props = load_proposals(csv_path)
    if limit:
        props = props[:limit]
    OUT.mkdir(parents=True, exist_ok=True)
    results_path = OUT / "results.jsonl"
    done = set()
    if results_path.exists():
        for line in results_path.read_text(encoding="utf-8").splitlines():
            try:
                done.add(str(json.loads(line)["id"]))
            except Exception:
                pass
    todo = [p for p in props if str(p["id"]) not in done]
    print(c(f"{len(props)} proposals, {len(done)} already done, {len(todo)} to go.", BOLD))

    sem = asyncio.Semaphore(CONCURRENCY)
    pace = {"next": 0.0}
    pace_lock = asyncio.Lock()

    async def wait_for_slot():
        """Spread requests out so we stay under the API's rate limit."""
        async with pace_lock:
            now = time.perf_counter()
            slot = max(pace["next"], now)
            pace["next"] = slot + 1 / MAX_REQUESTS_PER_SECOND
        if slot > now:
            await asyncio.sleep(slot - now)

    headers = {"Authorization": f"Bearer {api_key()}", "Content-Type": "application/json"}
    lock = asyncio.Lock()
    counter = {"n": 0, "tokens": 0, "failed": 0}
    t0 = time.perf_counter()

    async with httpx.AsyncClient(headers=headers, timeout=30) as client:
        with results_path.open("a", encoding="utf-8") as f:

            async def one(p):
                async with sem:
                    state = {"proposal_title": p["title"], "proposal_text": p["body"]}
                    await wait_for_slot()
                    try:
                        res = await call_jev_async(client, state, QUESTIONS)
                    except Exception as e:
                        counter["failed"] += 1
                        print(c(f"  failed {p['id']}: {e}", "31"))
                        return
                    rec = {**p, "answers": res["response"]["answers"], "usage": res["response"].get("usage", {}),
                           "latency_ms": res["latency_ms"], "server_ms": res["server_ms"]}
                    async with lock:
                        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
                        counter["n"] += 1
                        counter["tokens"] += rec["usage"].get("input_tokens") or 0
                        if counter["n"] % 250 == 0:
                            el = time.perf_counter() - t0
                            print(f"  {counter['n']}/{len(todo)}  {el:.0f}s  "
                                  f"${counter['tokens'] * PRICE_PER_INPUT_TOKEN:.4f}")
                            f.flush()

            await asyncio.gather(*(one(p) for p in todo))

    wall = time.perf_counter() - t0
    run_info = {"proposals_this_run": counter["n"], "failed_this_run": counter["failed"],
                "wall_seconds": round(wall, 1), "input_tokens_this_run": counter["tokens"],
                "concurrency": CONCURRENCY, "max_requests_per_second": MAX_REQUESTS_PER_SECOND}
    save_json(OUT / "last_run.json", run_info)
    print(c(f"Done: {counter['n']} proposals in {wall:.0f}s.", BOLD))
    summary()


def summary() -> None:
    results_path = OUT / "results.jsonl"
    recs = [json.loads(l) for l in results_path.read_text(encoding="utf-8").splitlines() if l.strip()]
    tokens = sum((r.get("usage") or {}).get("input_tokens") or 0 for r in recs)
    lat = sorted(r["latency_ms"] for r in recs)
    topics: dict[str, int] = {}
    for r in recs:
        t = r["answers"]["topic"]["choice"]
        topics[t] = topics.get(t, 0) + 1
    s = {
        "proposals": len(recs),
        "questions_answered": len(recs) * len(QUESTIONS),
        "input_tokens": tokens,
        "cost_usd": round(tokens * PRICE_PER_INPUT_TOKEN, 4),
        "latency_ms_median": lat[len(lat) // 2] if lat else None,
        "latency_ms_p95": lat[int(len(lat) * 0.95)] if lat else None,
        "server_ms_median": (lambda v: v[len(v) // 2] if v else None)(sorted(r["server_ms"] for r in recs if r.get("server_ms") is not None)),
        "topics": dict(sorted(topics.items(), key=lambda kv: -kv[1])),
        "about_tourism_share": round(sum(r["answers"]["about_tourism"]["noul"] >= 0.5 for r in recs) / max(len(recs), 1), 3),
        "complaint_share": round(sum(r["answers"]["complaint"]["noul"] >= 0.5 for r in recs) / max(len(recs), 1), 3),
    }
    last = OUT / "last_run.json"
    if last.exists():
        s["last_run"] = json.loads(last.read_text(encoding="utf-8"))
    save_json(OUT / "summary.json", s)
    print(json.dumps(s, indent=2))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cmd", choices=["download", "run", "summary"])
    ap.add_argument("--csv", type=Path, help="path to a proposals CSV you downloaded yourself")
    ap.add_argument("--limit", type=int, help="only the first N proposals (try 50 first)")
    args = ap.parse_args()
    if args.cmd == "download":
        download()
    elif args.cmd == "run":
        asyncio.run(run(args.csv or find_csv(), args.limit))
    else:
        summary()


if __name__ == "__main__":
    main()
