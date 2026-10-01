# What is Jev, and why should I use it?

Outline and speaker notes. AI Builders, Barcelona, 2 October 2026.

**Status: draft 3. One section here = one slide in `site/index.html`.** Keep the two in step.

Each slide has three parts:

- **On screen:** what the room sees. "Then:" marks a part that appears on the next key press.
- **Reader text:** one or two plain sentences for someone reading the page later. Hidden while presenting.
- **Speaker notes:** what Bryan says live. Shown only in the speaker view.

22 slides, about 13 minutes. Times are rough.

---

## Opening

### 1. Title (0:20)

- **On screen:** Only the title, centred: "What is Jev, and why should I use it?" Under it, a QR code to the
  published deck. (The QR code is a placeholder until the address is known.)
- **Reader text:** none.
- **Speaker notes:** Name, one line about me. "You have probably heard of Jev. I spent some time building with
  it, and this is what I learned."

### 2. Two ways to use AI (0:30)

- **On screen:** "Chat: We ask. It writes." "Decide: A program asks. The model picks."
- **Reader text:** Most of us use AI by chatting: we ask, and the model writes. Jev works in a different way.
  A program asks it a question, and it picks an answer.
- **Speaker notes:** "Most of us use AI by chatting. We ask, it writes. Jev does not write. It decides."
  The plan: how it works, two things I built with it, and when to use it.

### 3. A model for programs, not people (0:30)

- **On screen:** Table. What it does: writes text / picks an answer. Who uses the result: a person / a program.
- **Reader text:** A chat model writes text for a person to read. Jev picks an answer for a program to use.
- **Speaker notes:** "The kind of decision an expert makes in one second."

### 4. Fast and cheap, because it does not write (0:35)

- **On screen:** "0.1 s: a typical call, says TypeSafe." "$0.042 per million tokens you send."
  "$0 for the answers."
- **Reader text:** TypeSafe says most calls take about 100 milliseconds. You pay $0.042 for every million
  tokens of text you send, and nothing for the answers.
- **Speaker notes:** From my laptop I saw about 250 milliseconds for the full trip, and about 60 of those were
  inside TypeSafe's servers.

## How it works

### 5. How one call works (0:40)

- **On screen:** "your text + your questions (each with its own options)" → Jev. → "one answer per
  question, and how sure it is".
- **Reader text:** You send some text and a few questions. Each question has a fixed list of possible answers.
  Jev gives back one answer for each question, and a number that says how sure it is.
- **Speaker notes:** The answer is always one of your options. It cannot invent a new one. You can ask many
  questions in one call, and they are answered at the same time.

### 6. Three kinds of question (0:40)

- **On screen:** Choice: pick one option ("Which bin? → brown"). Score: pick a level ("How dirty is it?
  → 1.35 of 2"). Noul: yes or no, as a probability ("Is it packaging? → 0.94").
- **Reader text:** Choice picks one option from your list. Score picks a level on a scale that you describe.
  Noul answers yes or no, as a probability.
- **Speaker notes:** The examples are real answers from the recycling demo: a wine cork, an oily napkin, a
  yogurt pot.

### 7. "I'm not sure" is useful (0:50)

- **On screen:** Bars for "banana peel" (brown 100%, sure). bars for "used pen" (Green Point 47%,
  grey 45%, not sure). "Sure → act. Not sure → check, or ask a person."
- **Reader text:** Jev gives a probability for every option. When one option has almost all of it, Jev is
  sure. When it is spread over several options, Jev is not sure, and your program can ask a person.
- **Speaker notes:** The model tells you how sure it is, and your program can use that. High confidence does
  not mean the answer is correct. It means the model did not hesitate.

## Example 1: Which bin?

### 8. Which bin? (0:30)

- **On screen:** The six places: yellow, blue, green, brown, grey, Green Point. "Where does a wine cork go?"
  "brown. Cork is organic."
- **Reader text:** Barcelona has five street bins. Some things do not go in any bin: you take them to a
  recycling centre called a Green Point.
- **Speaker notes:** Ask the room, calmly: "Where does a wine cork go?" Wait. "Brown. It is
  organic."

### 9. Your rules go in the options (0:30)

- **On screen:** The six option descriptions, as sent to Jev. "The descriptions come from the city's website."
- **Reader text:** I did not teach Jev anything about Barcelona. I wrote the city's rules into the options, in
  plain words. Jev reads the item, reads the options, and picks.
- **Speaker notes:** This is the main idea of building with Jev: you write your rules as options. These six
  descriptions are the city's rules, made short.

### 10. My first options were wrong (0:35)

- **On screen:** "broken drinking glass". Bars with my first options (grey 99%). bars with the city's
  rules (Green Point 100%). "Jev follows the rules you give it."
- **Reader text:** My first version had five options, and I wrote "broken glass" under the grey bin. Jev said
  grey, and it was 99% sure. The city says broken glass goes to a Green Point. When I fixed the options, Jev
  said Green Point.
- **Speaker notes:** My first version had a mistake. I wrote "broken glass" under the grey bin. Jev said grey,
  99% sure. But the city says broken glass goes to a Green Point. When I fixed the options, Jev said Green
  Point. It follows the rules you give it, so the rules must be right.

### 11. One item, one call (0:40)

- **On screen:** Item buttons (wine cork, broken drinking glass, yogurt pot, used pen, coffee capsule). Bars
  for the wine cork: brown 95%, Green Point 5%. "brown. Confidence 0.93." "225 ms. 882 tokens sent. One
  dollar pays for about 27,000 of these calls."
- **Reader text:** Here is one real call. I sent the words "wine cork" and the question with six options. Jev
  answered "brown" with 95% probability, in about a quarter of a second.
- **Speaker notes:** Click another item if useful. Optional: if the wifi is good, run it live in the terminal
  and take one item from the room.

### 12. The real call (0:30)

- **On screen:** The JSON I sent (one of the five questions). the JSON Jev sent back.
- **Reader text:** This is the real request and answer for the wine cork, for one of the five questions in the
  call. The full call is in the repo.
- **Speaker notes:** Point at: the item, the question, the options. Then the answer: the choice, the
  confidence, a probability for every option, and the token count.

### 13. Ask small questions (0:35)

- **On screen:** Five questions in one call: Where should it go? What is it made of? Is it packaging? Is it a
  glass bottle or jar? How much food or oil is on it? the answers for "paper napkin with oil on it".
- **Reader text:** You can ask several small questions in the same call. They are answered at the same time,
  so it is not slower.
- **Speaker notes:** One call, five questions. The first is the direct question. The other four are small facts
  about the item.

### 14. Your code decides (0:45)

- **On screen:** "Glass, but not a bottle or jar → Green Point." "Paper, and not clean → brown." "A small
  answer is not sure → check the city guide." "My first paper rule was wrong. I changed one number.
  CLEAN_PAPER_BELOW = 1.5 → 0.5. Oily napkin: blue (wrong) → brown. No new call to Jev."
- **Reader text:** The rules are normal code, so you can read them, test them and change them. My first paper
  rule sent an oily napkin to the blue bin. I changed one number, and it was fixed without calling Jev again.
- **Speaker notes:** Jev answers the small questions. My code makes the decision. When I fixed the rule, I did
  not call the model again, because I already had its answers.

### 15. 42 everyday items (0:40)

- **On screen:** "36 of 36: right with the direct question." "33 of 36: right with small questions + my
  rules." "Every mistake in my rules came with 'not sure'." "6 more items have no clear answer from the
  city."
- **Reader text:** I tried 42 everyday items. For 36 of them the city has a clear answer. The direct question
  was right every time, because the city's rules are in the options. My rules were wrong three times, and each
  time the code said it was not sure.
- **Speaker notes:** The direct question won here, because the city's rules are in the options. My rules were
  weaker, but every mistake came with a warning.

### 16. Three answers (0:35)

- **On screen:** Broken drinking glass: Green Point, 100%, not the green bin. coffee capsule: my rules
  said yellow, and "not sure"; the city says Green Point. used pen: 47% / 45%, Green Point or grey; the
  city's own pages do not agree.
- **Reader text:** The broken glass goes to a Green Point, not the green bin. For the coffee capsule my rules
  were wrong, but they said "not sure". For the used pen Jev is not sure, and neither is the city.
- **Speaker notes:** For the pen, "not sure" is the honest answer.

## Example 2: Every proposal in the city

### 17. Every proposal in the city (0:40)

- **On screen:** "35,768 proposals on decidim.barcelona." "20 min: 5 questions about each one."
  "$1.34 for all of it."
- **Reader text:** Barcelona has a public website where people and groups send proposals to the city: more than
  35,000 since 2018, mostly in Catalan. I asked Jev five questions about every one. It took 20 minutes and cost
  $1.34. On a sample, its topic agreed with the city's own label about 8 times in 10.
- **Speaker notes:** The text is in Catalan and Spanish, and Jev is trained mostly on English, so I checked a
  sample: it agreed with the city's own topic labels about 8 times in 10.

### 18. What the proposals are about (0:30)

- **On screen:** Bar chart of the main topic: education and culture 6,847 · mobility 6,177 · social 5,517 ·
  public space 5,327 · environment 4,803 · economy 2,022 · government 1,839 · housing 1,529 · other 1,124 ·
  tourism 583.
- **Reader text:** The main topic of every proposal, as Jev chose it from ten options.
- **Speaker notes:** Education and culture, mobility and social topics are the biggest. Tourism is the main
  topic of only 583, but it is mentioned in about 1,300.

### 19. When reading gets cheap (0:35)

- **On screen:** "One person, one minute for each proposal: about 600 hours." "Jev: 20 minutes and
  $1.34." "When something gets very cheap, people find new uses for it. That idea comes from the
  economist William Stanley Jevons, and it is where the name Jev comes from."
- **Reader text:** Reading every proposal would take one person about 600 hours. Jev did it in 20 minutes for
  $1.34. When something gets very cheap, people find new uses for it: that is the idea behind the name Jev.
- **Speaker notes:** Could one person read them all? Not really. When something gets very cheap, people find
  new uses for it.

## Closing

### 20. When to use it, and when not (0:45)

- **On screen:** Good for: sorting and routing, checking and scoring, big piles of text, things that must be
  fast. not good for: writing text, maths and dates, text that tries to trick it, images.
- **Reader text:** Jev is good when a program needs a quick decision about some text. It is not good at
  writing, at maths or at dates, and it cannot look at images. It works together with chat models; it does
  not replace them.
- **Speaker notes:** It works with LLMs, not instead of them. TypeSafe publishes this list of weak points
  themselves.

### 21. This is becoming normal (0:35)

- **On screen:** "OpenAI Decisions API, announced 29 September 2026." The same idea · about 150 ms · text and
  images · limited preview, no price yet.
- **Reader text:** Three days before this talk, OpenAI announced a product with the same idea. So this is
  becoming a kind of model, not one product from one company.
- **Speaker notes:** It is built on GPT-6 Luna. The numbers are OpenAI's own.

### 22. Three things to remember (0:30)

- **On screen:** 1. Chat models write for people. Jev decides for programs. 2. Write your rules in the
  options. Ask small questions. Let your code decide. 3. Use "not sure". Links: docs.typesafe.ai and
  this repo.
- **Reader text:** The code, the saved results and the speaker notes are all in the repo, with the sources.
- **Speaker notes:** Thank you. Questions.

---

## Numbers used, and where they come from

| Number | Source |
|---|---|
| $0.042 per million input tokens; answers free | docs.typesafe.ai/models |
| "about 100 ms" | docs.typesafe.ai, How to build with TypeSafe |
| About 250 ms round trip; about 60 ms inside TypeSafe | `captures/recycle/_summary.json` (median of 42 calls: 254 ms and 64 ms) |
| Wine cork: brown 95%, confidence 0.93, 225 ms, 882 tokens | `captures/recycle/wine-cork.json` |
| Napkin dirt 1.35; yogurt pot packaging 0.94 | `captures/recycle/` |
| About 27,000 calls per dollar | 882 input tokens × $0.042 per million |
| 36 of 36, 33 of 36, 6 unclear | `captures/recycle/_summary.json` |
| Broken glass: grey 99% in the first version | `captures/recycle-v1/broken-drinking-glass.json` |
| 35,768 proposals; 178,840 answers; 20 minutes; $1.34 | `captures/decidim/summary.json` (1,195 seconds, 31.9 million input tokens) |
| Topic counts | `captures/decidim/summary.json` |
| About 600 hours | 35,768 proposals × 1 minute |
| About 8 in 10 agreement with the city's labels | a sample of 350 labelled proposals (82%) |
| OpenAI Decisions API facts | OpenAI DevDay 2026 recap (checked in the planning session) |
