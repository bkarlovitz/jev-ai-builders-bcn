# What is Jev, and why should I use it?

Material for a short talk by Bryan Karlovitz at AI Builders, Barcelona, on 2 October 2026.

[Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) is a fast "decision" model from
TypeSafe AI. You give it some text and a few questions with fixed options. It gives back an answer for each
question, with probabilities. It does not write text.

This repo has two demos. Each one works live, and falls back to saved results when there is no wifi.

## Setup (once)

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r demos\requirements.txt
Copy-Item .env.example .env      # then open .env and add your TypeSafe API key
```

`.env` is gitignored. Run all commands from the repo root.

## 1. Which bin? (Barcelona recycling)

```powershell
python demos\recycle.py --capture-all          # runs 21 prepared items, saves them all, prints a table
python demos\recycle.py --raw "wine cork"      # one item with the raw JSON
python demos\recycle.py                        # interactive: type items, one per line
python demos\recycle.py --offline "wine cork"  # replay a saved result, no network at all
```

If a live call fails, the script shows the saved result for that item, marked "(saved result)".
Only items that have been run at least once have a saved result.

## 2. Every citizen proposal (Decidim Barcelona)

```powershell
python demos\decidim.py download               # gets the open-data zip from decidim.barcelona
python demos\decidim.py run --limit 50         # small test first
python demos\decidim.py run                    # then everything (resumes if interrupted)
python demos\decidim.py summary
```

If `download` fails, download the open-data file in your browser from
https://www.decidim.barcelona/open-data, unzip it into a `data` folder here, and run
`python demos\decidim.py run` (or pass `--csv path\to\proposals.csv`).

## Where things are

- `demos/`: the scripts.
- `captures/`: saved Jev results, so the demos and the presentation work offline.
- `talk/outline.md`: the outline and speaker notes.

## Sources

- Jev and TypeSafe AI: https://docs.typesafe.ai
- Recycling rules: Ajuntament de Barcelona, [street bins](https://ajuntament.barcelona.cat/neteja-i-residus/en/household-waste-collection/five-fractions-domestic-waste-collection-system/street-bins) and the [Waste Finder](https://ajuntament.barcelona.cat/cercador-de-residus/en)
- Citizen proposals: [Decidim Barcelona open data](https://www.decidim.barcelona/open-data)

## Licence

The code is under the MIT licence (see `LICENSE`). The recycling rules belong to the Ajuntament de Barcelona,
and the proposal data comes from Decidim Barcelona; this repo only contains results derived from them.
