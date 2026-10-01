# What is Jev, and why should I use it?

Outline. AI Builders, Barcelona, 2 October 2026.

**Status: draft 4, after the structure review. One section here = one slide in `site/index.html`.** Keep the two in step.

The recycling example teaches every concept, from slide 3 on. Decidim shows the same pattern at volume.
Speaker notes are also in `talk/speaker-notes.md`.

16 slides, about 12 minutes. Times are rough. Two reveal steps: slides 3 and 5.

---

## Opening

### 1. Title (0:20)

- **On screen:** Only the title, centred: "What is Jev, and why should I use it?" Under it, a QR code to the
  published deck (placeholder until the address is known).
- **Reader text:** none.
- **Speaker notes:** Name, one line about me. “You have probably heard of Jev. I spent some time building with
  it, and this is what I learned.”

### 2. Jev next to an LLM (0:50)

- **On screen:** Table, LLM vs Jev. What it gives back: text / one of your answers, with a probability for
  each. Who it is for: a person reads it / your code uses it directly. How sure it is: no probability for each
  answer / a probability for every answer, every time. Footer: "TypeSafe calls this a System One model."
- **Reader text:** Jev understands language like an LLM, but it is trained to give back decisions with
  probabilities, not text.
- **Speaker notes:** “Is Jev an LLM? It understands language like one. It does not write. It is trained to
  give calibrated probabilities, which TypeSafe calls RLCD, instead of text that people like, which is RLHF.”
  If someone thinks of JSON mode: “JSON mode fixes the format of an LLM's answer. It still writes one token at
  a time, and it does not give you a probability for every answer.” In passing: about 100 ms according to
  TypeSafe, about 250 ms from my laptop; $0.042 per million input tokens, and the answers are free.

## Example 1: Which bin? (teaches how Jev works)

### 3. Which bin? (0:30)

- **On screen:** Example 1. The six places (yellow, blue, green, brown, grey, Green Point). "Where does a wine
  cork go?" Next key (reveal): "brown. Cork is organic."
- **Reader text:** Barcelona has five street bins. Some things do not go in any bin: you take them to a
  recycling centre called a Green Point. It is not always clear where something goes.
- **Speaker notes:** Ask the room, calmly: “Where does a wine cork go?” Wait. Next key: “Brown. It is
  organic.” Then: “The city has rules. Let's give the rules to Jev.”

### 4. The city's rules (0:30)

- **On screen:** Six rows: the bin chip, a short name, one line of examples from the city's rules (yellow
  packaging, blue paper and cardboard, green glass, brown organic, grey general waste, Green Point not a
  street bin). In the brown row, the word corks is highlighted. Footer: Written from the city's website. /
  Next: give these rules to Jev.
- **Reader text:** I did not teach Jev anything about Barcelona. I wrote the city's rules in plain words. They
  are shortened here; the full text sent to Jev is in the repo.
- **Speaker notes:** “The city publishes rules. Here they are, in plain words. Cork is in the brown line. Now
  let's give these six lines to Jev, exactly like this.”

### 5. One call (1:00)

- **On screen:** Two columns, I send / Jev sends back, and a tag: type choice. Left: state wine cork (big),
  instructions In Barcelona, where should `item` go?, criteria the six bin chips, the six rules you just saw.
  Next key (reveal) shows the right: choice brown (big), confidence 0.93, probabilities brown 95%, Green Point
  5%, the other 4 0%. Small: 225 ms, 882 tokens, about 27,000 calls for one dollar.
- **Reader text:** This is a real call. The state is the item. The question has instructions and criteria. Jev
  sends back its choice, a probability for every criterion, and a confidence number. The same request also had
  four more questions; see “Ask small questions”.
- **Speaker notes:** Step 1, the left side: “State is the text Jev reads. The question has instructions and
  criteria. The criteria are the six rules from the last slide, word for word.” Next key, the right side: “Jev
  gives a probability for every criterion. The choice is the highest. Confidence says how concentrated that
  is. That is the whole API. This question type is a Choice; there are two more.”

### 6. Score: a position on your levels (0:40)

- **On screen:** Same frame, tag: type score. Left: state paper napkin with oil on it, instructions How much
  food or oil is on `item`?, criteria levels in order 0 clean or almost clean / 1 a little food on it / 2
  covered or soaked in food or oil. Right: score 1.35 (big), confidence 0.46, probabilities 0 clean 0%, 1 a
  little 64%, 2 covered 36%. Line: Between level 1 and level 2: a position, not a measurement.
- **Reader text:** A Score question has levels that you describe in words, in order. Jev gives a probability
  for each level, and the score is the weighted average, so it can land between two levels.
- **Speaker notes:** “Same frame. The criteria are now levels, in order. Jev does not pick one; it gives a
  probability for each level, and the score is the weighted average, so it can land between two. For this
  napkin: between ‘a little’ and ‘covered’. The city only needs clean or not clean. My code decides where to
  cut; that comes later.”

### 7. Noul: yes or no, as one number (0:35)

- **On screen:** Same frame, tag: type noul. Left: state wine cork, instructions Is `item` packaging, or a
  container that held a product?, criteria none needed. Right: noul 0.37 (big), and a no-to-yes line with a
  mark at 0.5: wine cork 0.37 (big dot), old newspaper 0.15 and water bottle 0.97 (small). Line: Near 1: yes.
  Near 0: no. Near 0.5: not sure.
- **Reader text:** A Noul is a yes-or-no question. Jev gives back one number: the probability that the answer
  is yes. It needs no criteria.
- **Speaker notes:** “Third type. Yes or no, as a probability. No criteria needed. Is a cork packaging? 0.37:
  Jev is not sure, and that is fair. It does not mean ‘a little bit packaging’; it means yes and no are both
  possible. Which brings us to the useful part.”

### 8. “Not sure” is useful (0:50)

- **On screen:** Bin bars for "old newspaper" (blue 100%, `confidence` 1.00) and "used pen" (Green Point 47%,
  grey 45%, `confidence` 0.36). "Sure → act. Not sure → check, or ask a person." "For a Noul, look at how
  close it is to 0.5."
- **Reader text:** Confidence tells you how concentrated the probabilities are. Your program can act on a sure
  answer and send an unsure one to a person.
- **Speaker notes:** “Confidence tells you how concentrated the probabilities are. TypeSafe suggests starting
  around 0.8 to act and below 0.5 to ask a person, and tuning it for your case. My demo uses 0.6. For the pen,
  the city is also unclear: its two pages disagree, between grey and yellow.”

### 9. A second way: ask small questions (0:40)

- **On screen:** "One call, five questions, the same state." 1 Where should it go? `choice` / 2 What is it
  made of? `choice` / 3 Is it packaging? `noul` / 4 Is it a glass bottle or jar? `noul` / 5 How much food or
  oil is on it? `score`. Right: answers for "paper napkin with oil on it": brown, paper, 0.11, 0.01, 1.35 (not
  sure). "Five questions take about the same time as one."
- **Reader text:** One call can hold many questions about the same state. They are answered at the same time,
  and they cannot see each other's answers.
- **Speaker notes:** “Question 1 is the direct question. Questions 2 to 5 are small facts. They are answered
  together and cannot see each other. Why ask small facts when the direct question works? Next slide.”

### 10. Your code decides (0:50)

- **On screen:** Rules in plain words: glass, but not a bottle or jar → Green Point; paper, and not clean →
  brown; a small answer is not sure → "check the city guide".
- **Reader text:** The rules are normal code, so you can read them, test them and change them. Jev answers the
  small questions; the code makes the decision.
- **Speaker notes:** “Jev answers the small questions. My code makes the decision. The rules are normal code:
  you can read them, test them and change them, without calling the model again. This is how TypeSafe says to
  build: code owns the decision, the model supplies the judgment.”

## Example 2: Every proposal in the city (volume)

### 11. Every proposal in the city (0:40)

- **On screen:** Example 2. "decidim.barcelona, 2018 to 2026, mostly in Catalan." 35,768 proposals / 5
  questions about each one / 20 min for all of them / $1.34 in total. The five questions with their types:
  main topic `choice`, about tourism? `noul`, describes a problem? `noul`, how big a change? `score`, about
  children? `noul`.
- **Reader text:** Barcelona has a public website where people and groups send proposals to the city: more
  than 35,000 since 2018, mostly in Catalan. I asked Jev five questions about every one. It took 20 minutes
  and cost $1.34. Jev is trained mostly on English; on a sample, its topic agreed with the city's own label
  about 8 times in 10.
- **Speaker notes:** “Same shape as the bins, but here the state is a title and up to 2,000 characters of
  Catalan. Jev is trained mostly on English, so I checked a sample: its topic agreed with the city's own label
  about 8 times in 10. The 20 minutes was my own rate limit, 30 calls a second.”

### 12. What the proposals are about (0:30)

- **On screen:** Bar chart of the main topic: education and culture 6,847 / mobility 6,177 / social 5,517 /
  public space 5,327 / environment 4,803 / economy 2,022 / government 1,839 / housing 1,529 / other 1,124 /
  tourism 583.
- **Reader text:** The main topic of every proposal, as Jev chose it from ten criteria.
- **Speaker notes:** “Tourism is the main topic of 583, but it is mentioned in about 1,300.” The “describes a
  problem” question was weak, about 45% unsure, so I do not show it.

### 13. When reading gets cheap (0:30)

- **On screen:** "One person, one minute for each proposal: about 600 hours." "Jev: 20 minutes and $1.34."
  "When something gets very cheap, people find new uses for it. That idea comes from the economist William
  Stanley Jevons, and it is where the name Jev comes from."
- **Reader text:** Reading every proposal would take one person about 600 hours. Jev did it in 20 minutes for
  $1.34. When something gets very cheap, people find new uses for it: that is the idea behind the name Jev.
- **Speaker notes:** Could one person read them all? Not really. When something gets very cheap, people find
  new uses for it.

## Closing

### 14. When to use it, and when not (0:40)

- **On screen:** Good for: sorting and routing, checking and scoring, big piles of text, things that must be
  fast. Not good for: writing text, maths and dates, text that tries to trick it, images.
- **Reader text:** Jev is good when a program needs a quick decision about some text. It is not good at
  writing, at maths or at dates, and it cannot look at images. It works together with chat models; it does not
  replace them.
- **Speaker notes:** “TypeSafe publishes this list themselves. It works with LLMs, not instead of them.”

### 15. This is becoming normal (0:25)

- **On screen:** "OpenAI Decisions API, announced 29 September 2026." The same idea / about 150 ms / text and
  images / limited preview, no price yet.
- **Reader text:** Three days before this talk, OpenAI announced a product with the same idea. So this is
  becoming a kind of model, not one product from one company.
- **Speaker notes:** It is built on GPT-6 Luna. The numbers are OpenAI's own.

### 16. Three things to remember (0:30)

- **On screen:** 1. LLMs write for people. Jev decides for programs. 2. Write your rules in the criteria. Ask
  small questions. Let your code decide. 3. Use "not sure". Links: docs.typesafe.ai and this repo.
- **Reader text:** The code, the saved results and the speaker notes are all in the repo. Sources: TypeSafe AI
  documentation; Ajuntament de Barcelona street bins page and Waste Finder; Decidim Barcelona open data;
  OpenAI DevDay 2026 recap. All results were saved on 30 September 2026 with jev-1.13.0.
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
| About 8 in 10 agreement with the city's labels | a sample of 350 labelled proposals (82%) |
| OpenAI Decisions API facts | OpenAI DevDay 2026 recap (checked in the planning session) |
