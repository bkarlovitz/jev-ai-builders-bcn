# What is Jev, and why should I use it?

Material for a short talk by Bryan Karlovitz at AI Builders, Barcelona, on 2 October 2026.

[Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) is a fast "decision" model from
TypeSafe AI. You send some text (the `state`) and a few questions, each with the possible answers (the
`criteria`). Jev gives back an answer for each question, with probabilities. It does not write text.

## The slides

Open `site/index.html` in a browser. It needs no server and no internet. Use the arrow keys to move between
slides, or press `S` to read everything as one page. The text of each slide, with the speaker notes, is in
`talk/outline.md`.

## Read the code

Three small Python scripts, in the order I suggest reading them:

1. **`demos/basics.py`**: the smallest complete example. Short customer messages, and three questions in one
   call: a Choice (what is it about?), a Score (how upset is the customer?) and a Noul (does it ask for a
   refund?). This one is not in the talk.
2. **`demos/recycle.py`**: the talk's main example, "Which bin?" for Barcelona's recycling. It shows how to
   write your rules into the criteria, how to ask several small questions in one call, and how to make the
   final decision in normal code, with "not sure" when Jev is unsure.
3. **`demos/decidim.py`**: the volume example. It asks five questions about each of 35,768 proposals on
   decidim.barcelona, many calls in parallel, within the rate limit, and can resume if it stops.

`demos/jev_common.py` is the shared part: the HTTP call to Jev, the price, and saving results. The scripts
call the HTTP API directly (`POST https://api.typesafe.ai/v1/systemone`), so what you see is exactly what is
sent. TypeSafe also has [client SDKs](https://docs.typesafe.ai/sdk.md).

## Read the saved results

You do not need an API key to see what Jev returned. Every request and answer is saved as JSON in
`captures/`:

- `captures/basics/`: one file per customer message.
- `captures/recycle/`: one file per item (42 items), plus `_summary.json` with all of them in one table.
- `captures/decidim/summary.json`: the totals for all proposals (count, tokens, cost, time, topics).

All results were saved on 30 September 2026 with `jev-1.13.0`.

## Run it yourself

You need Python 3 and a TypeSafe API key ([docs.typesafe.ai](https://docs.typesafe.ai)). The commands are
for PowerShell; on macOS or Linux use `.venv/bin/activate` and `cp`.

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r demos\requirements.txt
Copy-Item .env.example .env      # then open .env and add your key
```

`.env` is gitignored, so your key stays on your computer. Run all commands from the repo root.

```powershell
python demos\basics.py                         # 9 messages, 3 questions each
python demos\recycle.py "wine cork"            # one item: the answers and the decision in code
python demos\recycle.py --raw "wine cork"      # the same, with the raw request and answer
python demos\recycle.py --capture-all          # all 42 items, saved, with a table
python demos\recycle.py --offline "wine cork"  # show a saved result, no API call
```

The Decidim example downloads about 113 MB of open data and makes about 36,000 calls. In September 2026 that
cost $1.34. Try a small run first:

```powershell
python demos\decidim.py download               # the proposals CSV from decidim.barcelona, into data\
python demos\decidim.py run --limit 50         # a small test
python demos\decidim.py run                    # everything (resumes if interrupted)
python demos\decidim.py summary
```

## Where things are

- `site/`: the slides (static HTML, CSS and JavaScript).
- `talk/outline.md` and `talk/speaker-notes.md`: the text of the talk.
- `demos/`: the scripts.
- `captures/`: the saved results.
- `tools/build_site_data.py`: copies the saved results into `site/data/talk-data.js` for the slides.

## Sources

- Jev and TypeSafe AI: https://docs.typesafe.ai
- Recycling rules: Ajuntament de Barcelona, [street bins](https://ajuntament.barcelona.cat/neteja-i-residus/en/household-waste-collection/five-fractions-domestic-waste-collection-system/street-bins) and the [Waste Finder](https://ajuntament.barcelona.cat/cercador-de-residus/en)
- Proposals: [Decidim Barcelona open data](https://www.decidim.barcelona/open-data)

## Licence

The code is under the MIT licence (see `LICENSE`). The recycling rules belong to the Ajuntament de Barcelona,
and the proposal data comes from Decidim Barcelona; this repo only contains results derived from them.
