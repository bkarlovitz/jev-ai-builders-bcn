# CLAUDE.md

Guidance for AI coding agents working in this repo.

## What this repo is

Material for the talk **"What is Jev, and why should I use it?"** by Bryan Karlovitz
(AI Builders, Barcelona, 2 October 2026). Jev is TypeSafe AI's fast "decision" model: it returns typed
answers with probabilities, not text. The repo holds two demos, their saved results, and the talk outline.

## Layout

```
demos/             recycle.py, decidim.py, jev_common.py, requirements.txt
captures/          saved Jev results (committed, so everything works offline)
talk/outline.md    outline and speaker notes
site/              the presentation page (static HTML/CSS/JS), once built
data/              raw Decidim download (gitignored)
```

## Running the demos

```bash
python -m venv .venv
.venv/Scripts/pip install -r demos/requirements.txt   # macOS/Linux: .venv/bin/pip
cp .env.example .env                                  # then add your TypeSafe API key
python demos/recycle.py "wine cork"
python demos/recycle.py --offline "wine cork"         # saved result, no network
```

Run the scripts from the repo root. See `README.md` for all commands.

## Rules

- **Never commit an API key.** The key is read from `TYPESAFE_API_KEY`, either from the environment or from
  the gitignored `.env`. Do not print it, log it, or write it into captures.
- **Every demo must work offline.** Live calls are an extra; saved results in `captures/` are the baseline.
  Do not delete or regenerate captures without being asked.
- **The presentation page never calls the API.** Its data is copied from `captures/`. It uses relative
  paths only, local fonts, no CDN and no build step, so the same files run from a website or from disk.
- **Language:** the talk is for an international audience. Write talk text in plain English (B1–B2 level):
  short sentences, common words, no idioms.
- **Be honest with results.** Show what Jev actually returned, including wrong and unsure answers.
- **Commits:** only when the repo owner asks. Commit messages carry no tool or AI attribution.
- If a `NOTES.md` file exists locally, read it first. It holds working notes that are not part of the repo.
