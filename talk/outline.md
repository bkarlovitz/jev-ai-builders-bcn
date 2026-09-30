# What is Jev, and why should I use it?

Outline and speaker notes. AI Builders, Barcelona, 2 October 2026.

**Status: draft 2, with real numbers from the runs on 30 September 2026. For review.**

Each section has three parts:

- **On screen:** what the room sees.
- **Reader text:** two or three plain sentences for someone reading the page later, without the speaker.
- **Speaker notes:** what Bryan says live. Not shown on the page.

Times are rough. Total: about 12 to 13 minutes.

---

## 1. Title (0:20)

- **On screen:** "What is Jev, and why should I use it?" Bryan Karlovitz. "What it does, and how you build
  with it."
- **Reader text:** This is a short talk about Jev, the fast decision model from TypeSafe AI. It was given at
  AI Builders in Barcelona in October 2026.
- **Speaker notes:** Name, one line about me. "You have probably heard of Jev. I spent some time building
  with it, and this is what I learned."

## 2. Two ways to use AI (0:45)

- **On screen:** Left: "Chat. We ask, it writes." Right: "Decide. A program asks, the model picks."
- **Reader text:** Most of us use AI by chatting: we ask a question and the model writes an answer.
  Jev works in a different way. It does not write. A program asks it a question, and it picks an answer.
- **Speaker notes:** "Most of us use AI by chatting. We ask, it writes. Jev does not write. It decides."
  The plan: how it works, two things I built with it, and when to use it.

## 3. A model for programs, not people (1:15)

- **On screen:** A table.

  | | A chat model (LLM) | Jev |
  |---|---|---|
  | What it does | writes text | picks an answer |
  | Who reads the result | a person | a program |
  | How long it takes | seconds | about 0.1 seconds |
  | What you pay for | text in and text out | text in only |

  Below the table: "$0.042 for one million input tokens. Answers are free."
- **Reader text:** A chat model writes text for a person to read. Jev picks an answer for a program to use.
  It is fast and cheap, because it does not write anything.
- **Speaker notes:** "The kind of decision an expert makes in one second." TypeSafe says most calls take about
  100 milliseconds. From my laptop I saw about 250 milliseconds for the full trip, and about 60 of those were
  inside TypeSafe's servers.

## 4. How one call works (1:15)

- **On screen:** A diagram: "your text + your questions (with your options)" → Jev → "answers + how sure".
  Three kinds of question:
  - Choice: pick one option.
  - Score: pick a level.
  - Noul: yes or no, as a probability.
- **Reader text:** You send some text and a few questions. Each question has a fixed list of possible answers.
  Jev gives back one answer for each question, and a number that says how sure it is.
- **Speaker notes:** The answer is always one of your options. It cannot invent a new one. You can ask many
  questions in one call, and they are answered at the same time.

## 5. "I'm not sure" is useful (1:00)

- **On screen:** Two small bar charts. One tall bar: "sure". Several similar bars: "not sure".
  Below: "Sure → act. Not sure → check, or ask a person."
- **Reader text:** Jev gives a probability for every option. When one option has almost all the probability,
  Jev is sure. When the probability is spread over several options, it is not sure, and your program can ask a
  person.
- **Speaker notes:** The model tells you how sure it is, and your program can use that. High confidence does
  not mean the answer is correct. It means the model did not hesitate.

## 6. Example 1: Which bin? (0:30)

- **On screen:** Barcelona's five bins (yellow, blue, green, brown, grey) and the Green Point.
  "Where does a wine cork go?"
- **Reader text:** Barcelona has five street bins. Some things do not go in any bin: you take them to a
  recycling centre called a Green Point. It is not always clear where something goes.
- **Speaker notes:** Ask the room, calmly: "Where does a wine cork go?" Wait. "Brown. It is organic."

## 7. Your rules go in the options (0:45)

- **On screen:** The six options, each with its short description. For example:
  "Brown bin (organic): food, egg and nut shells, corks, tea bags, coffee grounds, kitchen paper and paper
  napkins dirty with oil or food, flowers and garden waste."
  Below: "These descriptions come from the city's website."
- **Reader text:** I did not teach Jev anything about Barcelona. I wrote the city's rules into the options,
  in plain words. Jev reads the item, reads the options, and picks.
- **Speaker notes:** This is the main idea of building with Jev: you write your rules as options. My first
  version had a mistake. I wrote "broken glass" under the grey bin. Jev said grey, and it was 99% sure. But
  the city says broken glass goes to a Green Point. When I fixed the options, Jev said Green Point. It
  follows the rules you give it.

## 8. One item, one call (1:00)

- **On screen:** "wine cork". Six bars: brown 95%, Green Point 5%, the others 0%. "Brown. Confidence 0.93."
  "About 250 ms. About 900 tokens. One dollar pays for about 27,000 of these calls."
  Then a short look at the real request and the real answer (JSON).
- **Reader text:** Here is one real call. I sent the words "wine cork" and the question with six options.
  Jev answered "brown" with 95% probability, in about a quarter of a second.
- **Speaker notes:** Show the JSON briefly: the item, the question, the options, then the answer with its
  probabilities. Optional: if the wifi is good, run it live in the terminal and take one item from the room.

## 9. Small questions, and your code decides (1:15)

- **On screen:** Five questions in one call:
  1. Where should it go? (the direct question)
  2. What is it made of?
  3. Is it packaging?
  4. Is it a glass bottle or jar?
  5. How much food or oil is on it?

  Then two rules in plain words: "Glass, but not a bottle or jar → Green Point." "Paper, and not clean → brown."
- **Reader text:** You can also ask several small questions and let your own code decide. The rules are
  normal code, so you can read them, test them and change them. When a small answer is not sure, the code
  says "check the city guide".
- **Speaker notes:** Jev answers the small questions. My code makes the decision. My first paper rule was
  wrong: it sent an oily napkin to the blue bin. I changed one number in the code, and it was fixed. I did
  not call the model again, because I already had its answers.

## 10. What happened with 42 items (1:00)

- **On screen:** A short table.

  | | Right |
  |---|---|
  | The direct question | 36 of 36 |
  | Small questions + my rules | 33 of 36 |

  "6 more items have no clear answer from the city."
  Then three items:
  - Broken drinking glass → Green Point, 100%. (Not the green bin.)
  - Coffee capsule: my rules said yellow, and said "not sure". The city says Green Point.
  - Used pen → Green Point 47%, grey 45%. Not sure. The city's own pages do not agree.
- **Reader text:** I tried 42 everyday items. For 36 of them the city has a clear answer. The direct question
  was right every time. My rules were wrong three times, and each time the code said it was not sure.
- **Speaker notes:** The direct question won here, because the city's rules are in the options. My rules were
  weaker, but every mistake came with a warning. And for the pen, "not sure" is the honest answer.

## 11. Example 2: Every proposal in the city (1:30)

- **On screen:** "decidim.barcelona: 35,768 proposals, 2018 to 2026."
  "5 questions for each one = 178,840 answers."
  "20 minutes. $1.34."
  A bar chart of the main topic:
  education and culture 6,847 · mobility 6,177 · social 5,517 · public space 5,327 · environment 4,803 ·
  economy 2,022 · government 1,839 · housing 1,529 · other 1,124 · tourism 583.
- **Reader text:** Barcelona has a public website where people and groups send proposals to the city. There
  are more than 35,000 of them, mostly in Catalan. I asked Jev five questions about every one. It took 20
  minutes and cost $1.34.
- **Speaker notes:** Could one person read them all? At one minute each, that is about 600 hours. The text is
  in Catalan and Spanish, and Jev is trained mostly on English, so I checked a sample: it agreed with the
  city's own topic labels about 8 times in 10. When something gets very cheap, people find new uses for it.
  That idea comes from an economist called Jevons, and that is where the name Jev comes from.

## 12. When to use it, and when not (1:00)

- **On screen:** Two lists.
  Good for: sorting, routing, checking, scoring, big piles of text, things that must be fast.
  Not good for: writing text, maths, comparing dates, text that tries to trick it, images.
- **Reader text:** Jev is good when a program needs a quick decision about some text. It is not good at
  writing, at maths or at dates, and it cannot look at images. It works together with chat models; it does
  not replace them.
- **Speaker notes:** It works with LLMs, not instead of them. TypeSafe publishes this list of weak points
  themselves.

## 13. This is becoming normal (0:40)

- **On screen:** "OpenAI Decisions API, announced 29 September 2026."
  "Same idea. About 150 ms. Text and images. Limited preview. No price yet."
- **Reader text:** Three days before this talk, OpenAI announced a product with the same idea. So this is
  becoming a kind of model, not one product from one company.
- **Speaker notes:** It is built on GPT-6 Luna. The numbers are OpenAI's own.

## 14. Three things to remember (0:30)

- **On screen:**
  1. Chat models write for people. Jev decides for programs.
  2. Write your rules in the options. Ask small questions. Let your code decide.
  3. Use "not sure".

  Links: docs.typesafe.ai and this repo.
- **Reader text:** The code, the saved results and these notes are all in the repo.
- **Speaker notes:** Thank you. Questions.

---

## Numbers used, and where they come from

| Number | Source |
|---|---|
| $0.042 per million input tokens; answers free | docs.typesafe.ai/models |
| "about 100 ms" | docs.typesafe.ai, How to build with TypeSafe |
| About 250 ms round trip; about 60 ms inside TypeSafe | `captures/recycle/_summary.json` (median of 42 calls: 254 ms and 64 ms) |
| Wine cork: brown 95%, confidence 0.93 | `captures/recycle/wine-cork.json` |
| About 900 tokens per call; about 27,000 calls per dollar | 885 input tokens × $0.042 per million |
| 36 of 36, 33 of 36, 6 unclear | `captures/recycle/_summary.json` |
| Broken glass: grey 99% in the first version | `captures/recycle-v1/broken-drinking-glass.json` |
| 35,768 proposals; 178,840 answers; 20 minutes; $1.34 | `captures/decidim/summary.json` (1,195 seconds, 31.9 million input tokens) |
| Topic counts | `captures/decidim/summary.json` |
| About 600 hours | 35,768 proposals × 1 minute |
| About 8 in 10 agreement with the city's labels | a sample of 350 labelled proposals (82%) |
| OpenAI Decisions API facts | OpenAI DevDay 2026 recap (checked in the planning session) |
