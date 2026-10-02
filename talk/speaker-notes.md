# Speaker notes

What I say on each slide. One section per slide in `site/index.html`.

## 1. Title

Name, one line about me. “You have probably heard of Jev. I spent some time building with it, and this is what
I learned.”

## 2. Jev next to an LLM

“Is Jev an LLM? It understands language like one. It does not write.” Then the two rows: “An LLM gives back
text. Jev gives back one of your answers, with a probability for every answer, every time. An LLM is trained to
write text people like: RLHF. Jev is trained for calibrated decisions: TypeSafe calls that RLCD.” If someone
thinks of JSON mode: “JSON mode fixes the format of an LLM's answer. It still writes one token at a time, and it
does not give you a probability for every answer.” If someone brings up logprobs: “Logprobs are for each token,
not for each of your answers, and RLHF tends to make them badly calibrated. Jev is trained for exactly that.”

## 3. Three kinds of question

“Jev answers three kinds of question. A Choice picks one of your options. A Score gives a position on levels you
describe. A Noul is yes or no, as one number. Now let's see all three on one real example: recycling in
Barcelona.”

## 4. Which bin?

“Barcelona has five street bins, and a Green Point for things that go in none of them. It is not always clear
where something goes. The city has rules. Let's give them to Jev.”

## 5. The city's rules

“The city publishes rules. Here they are, in plain words. Now let's give these six lines to Jev, exactly like
this.”

## 6. Choice: one of your options

“First item: a wine cork. Where does it go?” Step 1, the left side: “State is the text Jev reads. The question has instructions and criteria. The criteria
are the six rules from the last slide, word for word.” Next key, the right side: “Jev gives a probability for
every criterion. The choice is the highest. Confidence says how concentrated that is. This is a Choice.” Press J for the real request: “This is the real request. State is an object with
my own field, item; the backticks in the instructions point at it. bin, brown, green_point are my names.” J
again for the response: “Jev gives my names back, with a probability for each, and a confidence. 882 tokens
in; the answer is free.” Esc to close.

## 7. Score: a position on your levels

“Same frame. The criteria are now levels, in order. Jev does not pick one; it gives a probability for each
level, and the score is the weighted average, so it can land between two. For this napkin: between ‘a little’
and ‘covered’. The city only needs clean or not clean. My code decides where to cut; that comes later.”

## 8. Noul: yes or no, as one number

“Third type. Yes or no, as a probability. No criteria needed. Is a cork packaging? 0.37: Jev is not sure, and
that is fair. It does not mean ‘a little bit packaging’; it means yes and no are both possible. Which brings
us to the useful part.”

## 9. “Not sure” is useful

“Confidence tells you how concentrated the probabilities are. TypeSafe suggests starting around 0.8 to act and
below 0.5 to ask a person, and tuning it for your case. My demo uses 0.6.” If asked about the pen: the city is
also unclear; its two pages disagree, between grey and yellow.

## 10. Break the decision into small questions

“TypeSafe recommends breaking a decision into small questions. Each one is a simple fact that Jev can answer
well and you can check. Question 1 is the direct question, for comparison. Questions 2 to 5 are the small
facts. They are answered together, in one call, and cannot see each other's answers.” Press J twice for the
response: “One request, five questions, one answer object.” If short on time, skip the JSON here. Then: “Next:
what my code does with them.”

## 11. What is the city being asked for?

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

## 15. Why it's called Jev

“Why is it called Jev? William Stanley Jevons, an economist. In 1865 he noticed that more efficient steam
engines made Britain burn more coal, not less: when something gets cheap, people find many more uses for it.
Decision models do that for AI. A big class of everyday problems, like sorting, routing, checking and scoring
text, becomes cheap enough to run on everything, not just a sample. You just saw it: 600 hours of reading for 20
minutes and $1.34.”

## 16. Where it fits

“These are the things you just saw: routing, scoring, reading at volume. TypeSafe publishes the ‘not good for’
list themselves. Text from users can try to trick it, so check its answers in your code. Use it next to an LLM,
not instead of one.” Then: “Three days ago OpenAI announced the same idea. Yesterday Cloudflare released Clef: open
weights, the same three question types, and Jev's API, so you can switch by changing the endpoint. This is
becoming a kind of model, not one product.” If asked: built on GPT-6 Luna, about 150 ms, text and images,
limited preview, no price yet; the numbers are OpenAI's own. Clef, if asked: two sizes, Clef (27B) and
Clef-flash (9B), Apache 2.0 on Hugging Face, hosted on Workers AI; Cloudflare says it is faster than Jev, but
those are Cloudflare's own numbers.

## 17. Thank you

Thank you. Questions.
