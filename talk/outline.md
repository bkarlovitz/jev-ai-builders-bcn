# What is Jev, and why should I use it?

Outline. AI Builders, Barcelona, 2 October 2026.

**Status: draft 4, after the structure review. One section here = one slide in `site/index.html`.** Keep the two in step.

The recycling example teaches every concept, from slide 4 on. Decidim shows the same pattern at volume.
Speaker notes are also in `talk/speaker-notes.md`.

17 slides, about 12 minutes. Times are rough. One reveal step: slide 6.
JSON view: on slides 6, 7, 8, 10 and 13, press J (or click { } JSON) for the real request, → (or J, or the Response button) for the response, ← to go back,
Esc to close. Open it live on slides 6 and 10; skip slide 10 if short on time.

---

## Opening

### 1. Title (0:20)

- **On screen:** Only the title, centred: "What is Jev, and why should I use it?" Under it, a QR code to the
  published deck (placeholder until the address is known).
- **Reader text:** none.
- **Speaker notes:** Name, one line about me. “You have probably heard of Jev. I spent some time building with
  it, and this is what I learned.”

### 2. Jev next to an LLM (0:50)

- **On screen:** Heading: "LLMs write for people. Jev decides for programs." Table,
  LLM vs Jev. What it gives back: text / one of your answers, with a probability for every answer, every time.
  What it is trained for: text people like (RLHF) / calibrated decisions (RLCD).
- **Reader text:** Jev understands language like an LLM, but it is trained to give back decisions with
  probabilities, not text.
- **Speaker notes:** “Is Jev an LLM? It understands language like one. It does not write.” Then the two
  rows: “An LLM gives back text. Jev gives back one of your answers, with a probability for every answer,
  every time. An LLM is trained to write text people like: RLHF. Jev is trained for calibrated decisions:
  TypeSafe calls that RLCD.” If someone thinks of JSON mode: “JSON mode fixes the format of an LLM's answer.
  It still writes one token at a time, and it does not give you a probability for every answer.” If someone
  brings up logprobs: “Logprobs are for each token, not for each of your answers, and RLHF tends to make them
  badly calibrated. Jev is trained for exactly that.”

### 3. Three kinds of question (0:20)

- **On screen:** Table, with examples from a support inbox. Choice / Which team should handle this ticket? /
  one of your options, with a probability for each. Score / How urgent is it? / a position on levels you
  describe. Noul / Is the customer asking for a refund? / yes or no, as one number.
- **Reader text:** Jev answers three kinds of question. The next example uses all three.
- **Speaker notes:** “Jev answers three kinds of question. A Choice picks one of your options. A Score gives a
  position on levels you describe. A Noul is yes or no, as one number. Now let's see all three on one real
  example: recycling in Barcelona.”

## Example 1: Which bin? (teaches how Jev works)

### 4. Which bin? (0:20)

- **On screen:** Example 1. The six places (yellow, blue, green, brown, grey, Green Point). "Recycling in
  Barcelona"
- **Reader text:** Barcelona has five street bins. Some things do not go in any bin: you take them to a
  recycling centre called a Green Point. It is not always clear where something goes.
- **Speaker notes:** “Barcelona has five street bins, and a Green Point for things that go in none of them.
  It is not always clear where something goes. The city has rules. Let's give them to Jev.”

### 5. The city's rules (0:30)

- **On screen:** Six rows: the bin chip, a short name, one line of examples from the city's rules (yellow
  packaging, blue paper and cardboard, green glass, brown organic, grey general waste, Green Point not a
  street bin). Footer: Written from the city's website. /
  Next: give these rules to Jev.
- **Reader text:** I did not teach Jev anything about Barcelona. I wrote the city's rules in plain words. They
  are shortened here; the full text sent to Jev is in the repo.
- **Speaker notes:** “The city publishes rules. Here they are, in plain words. Now let's give these six lines
  to Jev, exactly like this.”

### 6. Choice: one of your options (1:00)

- **On screen:** Two columns, I send / Jev sends back. Left: state wine cork (big),
  instructions In Barcelona, where should `item` go?, criteria the six bin chips, the six rules you just saw.
  Next key (reveal) shows the right: choice brown (big), confidence 0.93, probabilities brown 95%, Green Point
  5%, the other 4 0%.
- **Reader text:** This is a real call. The state is the item. The question has instructions and criteria. Jev
  sends back its choice, a probability for every criterion, and a confidence number. The same request also had
  four more questions; see “Break the decision into small questions”.
- **Speaker notes:** “First item: a wine cork. Where does it go?” Step 1, the left side: “State is the text Jev reads. The question has instructions and
  criteria. The criteria are the six rules from the last slide, word for word.” Next key, the right side: “Jev
  gives a probability for every criterion. The choice is the highest. Confidence says how concentrated that
  is. This is a Choice.” Press J for the real request: “This is the real
  request. State is an object with my own field, item; the backticks in the instructions point at it. bin,
  brown, green_point are my names.” J again for the response: “Jev gives my names back, with a probability for
  each, and a confidence. 882 tokens in; the answer is free.” Esc to close.

### 7. Score: a position on your levels (0:40)

- **On screen:** Same frame. Left: state paper napkin with oil on it, instructions How much
  food or oil is on `item`?, criteria levels in order 0 clean or almost clean / 1 a little food on it / 2
  covered or soaked in food or oil. Right: score 1.35 (big), confidence 0.46, probabilities 0 clean 0%, 1 a
  little 64%, 2 covered 36%. Line: Between level 1 and level 2: a position, not a measurement.
- **Reader text:** A Score question has levels that you describe in words, in order. Jev gives a probability
  for each level, and the score is the weighted average, so it can land between two levels.
- **Speaker notes:** “Same frame. The criteria are now levels, in order. Jev does not pick one; it gives a
  probability for each level, and the score is the weighted average, so it can land between two. For this
  napkin: between ‘a little’ and ‘covered’. The city only needs clean or not clean. My code decides where to
  cut; that comes later.”

### 8. Noul: yes or no, as one number (0:35)

- **On screen:** Same frame. Left: state wine cork, instructions Is `item` packaging, or a
  container that held a product?, criteria none needed. Right: noul 0.37 (big), and a no-to-yes line with a
  mark at 0.5: wine cork 0.37 (big dot), old newspaper 0.15 and water bottle 0.97 (small). Line: Near 1: yes.
  Near 0: no. Near 0.5: not sure.
- **Reader text:** A Noul is a yes-or-no question. Jev gives back one number: the probability that the answer
  is yes. It needs no criteria.
- **Speaker notes:** “Third type. Yes or no, as a probability. No criteria needed. Is a cork packaging? 0.37:
  Jev is not sure, and that is fair. It does not mean ‘a little bit packaging’; it means yes and no are both
  possible. Which brings us to the useful part.”

### 9. “Not sure” is useful (0:50)

- **On screen:** Bin bars for "old newspaper" (blue 100%, `confidence` 1.00) and "used pen" (Green Point 47%,
  grey 45%, `confidence` 0.36). "Sure → act. Not sure → check, or ask a person." "For a Noul, look at how
  close it is to 0.5."
- **Reader text:** Confidence tells you how concentrated the probabilities are. Your program can act on a sure
  answer and send an unsure one to a person.
- **Speaker notes:** “Confidence tells you how concentrated the probabilities are. TypeSafe suggests starting
  around 0.8 to act and below 0.5 to ask a person, and tuning it for your case. My demo uses 0.6.” If asked
  about the pen: the city is also unclear; its two pages disagree, between grey and yellow.

### 10. Break the decision into small questions (0:40)

- **On screen:** "TypeSafe's advice: small questions, one call, the same state." 1 Where should it go?
  `choice` / 2 What is it made of? `choice` / 3 Is it packaging? `noul` / 4 Is it a glass bottle or jar? `noul` / 5 How much food or
  oil is on it? `score`. Right: answers for "paper napkin with oil on it": brown, paper, 0.11, 0.01, 1.35 (not
  sure). "Five questions take about the same time as one."
- **Reader text:** TypeSafe recommends breaking a decision into small questions. One call can hold many of
  them about the same state; they are answered at the same time and cannot see each other's answers.
- **Speaker notes:** “TypeSafe recommends breaking a decision into small questions. Each one is a simple fact
  that Jev can answer well and you can check. Question 1 is the direct question, for comparison. Questions 2
  to 5 are the small facts. They are answered together, in one call, and cannot see each other's answers.”
  Press J twice for the response: “One request, five questions, one answer object.” If short on time, skip
  the JSON here. Then: “Next: what my code does with them.”

## Example 2: Every proposal in the city (volume)

### 11. What is the city being asked for? (0:30)

- **On screen:** Example 2. decidim.barcelona is the city's website for public participation. People, groups
  and the council post proposals. Others support and comment. The council answers. Four facts: 35,768
  proposals, 282 participation processes, 2018-2026, mostly Catalan (some Spanish).
- **Reader text:** Decidim Barcelona is the city council's website for public participation. People, groups
  and the council itself post proposals; others support and comment; the council answers each one.
- **Speaker notes:** “Decidim is the city's participation website. It is also free software, made here in
  Barcelona, and used by hundreds of cities.” Most proposals come from the big city action plans and
  participatory budgets.

### 12. Two proposals (0:40)

- **On screen:** Two cards, each with district, year and result, the Catalan title and text, and a short
  English version: Carril bici Av. Vallcarca (Gracia, 2020, accepted) and Instal-lar sistema de recollida
  selectiva de residus remunerada (la Barceloneta, 2020, rejected). Footer: From decidim.barcelona, CC BY-SA
  4.0.
- **Reader text:** Two real proposals from 2020. Most proposals are this short: half of them are under 211
  characters.
- **Speaker notes:** “Most are this short: half are under 211 characters. I did not translate anything for
  Jev; it reads the Catalan.”

### 13. Five questions about each one (0:50)

- **On screen:** The I send / Jev sends back frame, with a { } JSON button. Left: state = the bike-lane
  proposal title and text; questions: main topic `choice` (10 criteria), about tourism? `noul`, describes a
  problem? `noul`, how big a change? `score` (one place / one district / whole city), about children? `noul`.
  Right: main topic mobility 1.00, about tourism 0.03, describes a problem 0.91, how big a change 0.24: a
  small fix in one place, about children 0.08.
- **Reader text:** Each proposal is the state: its title and its text. Jev answers five questions about it in
  one call.
- **Speaker notes:** “Same shape as the bins. The state has two fields now: the title and the text. Five
  questions in one call.” Jev is trained mostly on English, so I checked a sample: its topic agreed with the
  city's own label about 8 times in 10, and it agrees here (the city's label is sustainable mobility).

### 14. What came back (0:40)

- **On screen:** Bar chart of the main topic (education and culture 6,847 ... tourism 583). How big a change:
  4,316 one place, 17,140 one district, 14,312 whole city. 20 min, $1.34.
- **Reader text:** The main topic of every proposal, as Jev chose it from ten criteria, and how big a change
  each proposal asks for. All 35,768 proposals took 20 minutes and cost $1.34.
- **Speaker notes:** “Tourism is the main topic of 583, but it is mentioned in about 1,300.” The “describes a
  problem” question was weak, about 45% unsure, so I do not show it. The 20 minutes was my own rate limit, 30
  calls a second.

### 15. Why it's called Jev (0:30)

- **On screen:** "In 1865, William Stanley Jevons noticed that when steam engines used coal more efficiently,
  Britain burned more coal, not less." "Decision models do the same for AI: sorting, routing, checking and
  scoring text get cheap enough to use everywhere." Small: "Every Decidim proposal: about 600 hours for a
  person, 20 minutes and $1.34 for Jev."
- **Reader text:** Jev is named after the economist William Stanley Jevons: when something gets cheaper, people
  use more of it. Decision models make sorting, routing, checking and scoring text cheap enough to use
  everywhere. Reading every Decidim proposal would take one person about 600 hours; Jev did it in 20 minutes
  for $1.34.
- **Speaker notes:** “Why is it called Jev? William Stanley Jevons, an economist. In 1865 he noticed that more
  efficient steam engines made Britain burn more coal, not less: when something gets cheap, people find many
  more uses for it. Decision models do that for AI. A big class of everyday problems, like sorting, routing,
  checking and scoring text, becomes cheap enough to run on everything, not just a sample. You just saw it:
  600 hours of reading for 20 minutes and $1.34.”

## Closing

### 16. Where it fits (0:40)

- **On screen:** Good for: routing · which bin?, scoring · how much food?, reading at volume · every
  proposal, fast checks inside your code. Not good for: writing text, maths and dates, images. Big: "Use it next to an LLM, not instead
  of one." Then: "29 September 2026: OpenAI announced the same idea, the Decisions API. 1 October: Cloudflare
  released Clef, with open weights and Jev's API. This is becoming a kind of model, not one product."
- **Reader text:** Jev fits where a program needs a quick decision about text: routing, scoring, reading at
  volume. It does not write, it is not good at maths or dates, and it cannot look at images. Text from users
  can try to trick it, so check its answers in your code. Use it next to an LLM, not instead of one. On 29
  September 2026 OpenAI announced the same idea: the Decisions API. On 1 October Cloudflare released Clef, an
  open-weight decision model that uses the same API as Jev.
- **Speaker notes:** “These are the things you just saw: routing, scoring, reading at volume. TypeSafe
  publishes the ‘not good for’ list themselves. Text from users can try to trick it, so check its answers in
  your code. Use it next to an LLM, not instead of one.” Then: “Three days ago OpenAI announced the same idea.
  Yesterday Cloudflare released Clef: open weights, the same three question types, and Jev's API, so you can
  switch by changing the endpoint. This is becoming a kind of model, not one product.” If asked: built on
  GPT-6 Luna, about 150 ms, text and images, limited preview, no price yet; the numbers are OpenAI's own.
  Clef, if asked: two sizes, Clef (27B) and Clef-flash (9B), Apache 2.0 on Hugging Face, hosted on Workers
  AI; Cloudflare says it is faster than Jev, but those are Cloudflare's own numbers.

### 17. Thank you (0:15)

- **On screen:** "Thank you. Questions?" Links only, each opening in a new tab: docs.typesafe.ai,
  github.com/bkarlovitz/jev-ai-builders-bcn, ajuntament.barcelona.cat (the street bins page),
  decidim.barcelona.
- **Reader text:** The code, the saved results and the speaker notes are all in the repo. Sources: TypeSafe AI
  documentation; Ajuntament de Barcelona street bins page and Waste Finder; Decidim Barcelona open data;
  OpenAI DevDay 2026 recap; Cloudflare changelog, 1 October 2026; W. S. Jevons, The Coal Question (1865). All
  results were saved on 30 September 2026 with jev-1.13.0.
- **Speaker notes:** Thank you. Questions.

---

## Numbers used, and where they come from

| Number | Source |
|---|---|
| $0.042 per million input tokens; answers free | docs.typesafe.ai/models |
| "about 100 ms" | docs.typesafe.ai, How to build with TypeSafe |
| About 250 ms round trip; about 60 ms inside TypeSafe | `captures/recycle/_summary.json` (median of 42 calls: 254 ms and 64 ms) |
| Wine cork: brown 95%, confidence 0.93, 225 ms, 882 tokens | `captures/recycle/wine-cork.json` |
| Wine cork, newspaper, pen, napkin, pizza box, water bottle answers | `captures/recycle/*.json` |
| About 27,000 calls per dollar | 882 input tokens × $0.042 per million |
| 36 of 36, 33 of 36, 8 not sure, 6 unclear | `captures/recycle/_summary.json` |
| Broken glass: grey 99% in the first version | `captures/recycle-v1/broken-drinking-glass.json` |
| 35,768 proposals; 178,840 answers; 20 minutes; $1.34 | `captures/decidim/summary.json` (1,195 seconds, 31.9 million input tokens) |
| Topic counts | `captures/decidim/summary.json` |
| About 600 hours | 35,768 proposals × 1 minute |
| Jevons: more efficient steam engines, more coal burned (1865) | W. S. Jevons, *The Coal Question* (1865) |
| About 8 in 10 agreement with the city's labels | a sample of 350 labelled proposals (82%) |
| OpenAI Decisions API facts | OpenAI DevDay 2026 recap (checked in the planning session) |
| Cloudflare Clef facts | developers.cloudflare.com/changelog/post/2026-10-01-clef-workers-ai/ (1 October 2026) |
