# Speaker notes

What I say on each slide. One section per slide in `site/index.html`.

## 1. Title

Name, one line about me. “You have probably heard of Jev. I spent some time building with it, and this is what
I learned.”

## 2. Jev next to an LLM

“Is Jev an LLM? It understands language like one. It does not write. It is trained to give back decisions with
probabilities.” If asked about training: TypeSafe calls it RLCD (calibrated decisions), instead of RLHF (text
that people like). If someone thinks of JSON mode: “JSON mode fixes the format of an LLM's answer. It still
writes one token at a time, and it does not give you a probability for every answer.” In passing: about 100 ms
according to TypeSafe, about 250 ms from my laptop; $0.042 per million input tokens, and the answers are free.

## 3. Which bin?

Ask the room, calmly: “Where does a wine cork go?” Wait. Next key: “Brown. It is organic.” Then: “The city has
rules. Let's give the rules to Jev.”

## 4. The city's rules

“The city publishes rules. Here they are, in plain words. Cork is in the brown line. Now let's give these six
lines to Jev, exactly like this.”

## 5. One call

Step 1, the left side: “State is the text Jev reads. The question has instructions and criteria. The criteria
are the six rules from the last slide, word for word.” Next key, the right side: “Jev gives a probability for
every criterion. The choice is the highest. Confidence says how concentrated that is. This question type is a
Choice; there are two more.” Press J for the real request: “This is the real request. State is an object with
my own field, item; the backticks in the instructions point at it. bin, brown, green_point are my names.” J
again for the response: “Jev gives my names back, with a probability for each, and a confidence. 882 tokens
in; the answer is free.” Esc to close.

## 6. Score: a position on your levels

“Same frame. The criteria are now levels, in order. Jev does not pick one; it gives a probability for each
level, and the score is the weighted average, so it can land between two. For this napkin: between ‘a little’
and ‘covered’. The city only needs clean or not clean. My code decides where to cut; that comes later.”

## 7. Noul: yes or no, as one number

“Third type. Yes or no, as a probability. No criteria needed. Is a cork packaging? 0.37: Jev is not sure, and
that is fair. It does not mean ‘a little bit packaging’; it means yes and no are both possible. Which brings
us to the useful part.”

## 8. “Not sure” is useful

“Confidence tells you how concentrated the probabilities are. TypeSafe suggests starting around 0.8 to act and
below 0.5 to ask a person, and tuning it for your case. My demo uses 0.6.” If asked about the pen: the city is
also unclear; its two pages disagree, between grey and yellow.

## 9. A second way: ask small questions

“Question 1 is the direct question. Questions 2 to 5 are small facts. They are answered together and cannot
see each other.” Press J twice for the response: “One request, five questions, one answer object.” If short on
time, skip the JSON here.

## 10. Your code decides

“Jev answers the small questions. My code makes the decision. The rules are normal code: you can read them,
test them and change them, without calling the model again. This is how TypeSafe says to build: code owns the
decision, the model supplies the judgment.”

## 11. Every proposal in the city

“Decidim is the city's participation website. It is also free software, made here in Barcelona, and used by
hundreds of cities.” Most proposals come from the big city action plans and participatory budgets.

## 12. Two proposals

“Most are this short: half are under 211 characters. I did not translate anything for Jev; it reads the
Catalan.”

## 13. Five questions about each one

“Same shape as the bins. The state has two fields now: the title and the text. Five questions in one call.”
Jev is trained mostly on English, so I checked a sample: its topic agreed with the city's own label about 8
times in 10, and it agrees here (the city's label is sustainable mobility).

## 14. What came back

“Tourism is the main topic of 583, but it is mentioned in about 1,300.” The “describes a problem” question was
weak, about 45% unsure, so I do not show it. The 20 minutes was my own rate limit, 30 calls a second.

## 15. When reading gets cheap

Could one person read them all? Not really. When something gets very cheap, people find new uses for it.

## 16. When to use it, and when not

“TypeSafe publishes this list themselves. It works with LLMs, not instead of them.” Then the footer: “Three
days ago OpenAI announced the same idea, so this is becoming a kind of model, not one product.” If asked:
built on GPT-6 Luna, about 150 ms, text and images, limited preview, no price yet; the numbers are OpenAI's
own.

## 17. Three things to remember

Thank you. Questions.
