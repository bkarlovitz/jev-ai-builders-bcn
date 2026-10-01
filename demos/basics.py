"""The basics: one small example for each kind of question.

A few short customer messages, three questions asked in one call per message:
  topic    Choice  - what the message is about
  upset    Score   - how upset the customer is
  refund   Noul    - does the message ask for a refund?

Usage (from the repo root):
  python demos/basics.py            # run all messages and save the results
  python demos/basics.py --offline  # print the saved results
"""
from __future__ import annotations

import argparse
import re

from jev_common import CAPTURES, BOLD, DIM, c, call_jev, load_json, save_json

CAPTURE_DIR = CAPTURES / "basics"

QUESTIONS = {
    "topic": {
        "type": "choice",
        "instructions": "What is `message` about?",
        "criteria": {
            "bug": "Something in the app is broken or does not work as expected.",
            "feature_request": "The customer asks for something new or for a change.",
            "billing": "Payments, charges, prices, refunds or subscriptions.",
            "praise": "The customer says something positive about the app.",
        },
    },
    "upset": {
        "type": "score",
        "instructions": "How upset is the customer who wrote `message`?",
        "criteria": ["Calm or happy.", "A little annoyed.", "Angry, or threatening to leave."],
    },
    "refund": {
        "type": "noul",
        "instructions": "Does `message` ask for a refund?",
    },
}

MESSAGES = [
    "The app logs me out every time I close it.",
    "Love the new dark mode!",
    "Small thing: the export button is hard to find.",
    "Third time this week I've lost my work. I'm cancelling.",
    "I was charged twice this month. Please refund one of them.",
    "Can I get my money back if I cancel now?",
    "Why did my bill go up after the update?",
    "It would be great to export to PDF.",
    "Do you offer refunds?",
]


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:60]


def show(cap: dict) -> None:
    a = cap["response"]["answers"]
    probs = " ".join(f"{k}={v:.2f}" for k, v in sorted(a["topic"]["probabilities"].items(), key=lambda kv: -kv[1]))
    print(c(f"  {cap['message']}", BOLD))
    print(f"    topic  {a['topic']['choice']:<16} conf {a['topic']['confidence']:.2f}   {probs}")
    print(f"    upset  {a['upset']['score']:.2f} of 2        conf {a['upset']['confidence']:.2f}")
    print(f"    refund {a['refund']['noul']:.2f}")
    print(c(f"    {cap['latency_ms']:.0f} ms · {cap['response']['usage']['input_tokens']} input tokens", DIM))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--offline", action="store_true", help="print the saved results; no API calls")
    args = ap.parse_args()
    for message in MESSAGES:
        path = CAPTURE_DIR / f"{slug(message)}.json"
        if args.offline:
            cap = load_json(path)
        else:
            cap = call_jev({"message": message}, QUESTIONS)
            cap["message"] = message
            save_json(path, cap)
        show(cap)


if __name__ == "__main__":
    main()
