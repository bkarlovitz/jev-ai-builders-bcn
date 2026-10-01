# Speaker notes

What I say on each slide. One section per slide in `site/index.html`.

## 1. Title

Name, one line about me. “You have probably heard of Jev. I spent some time building with it, and this is what
I learned.”

## 2. Jev next to an LLM

“Is Jev an LLM? It understands language like one. It does not write. It is trained to give calibrated
probabilities, which TypeSafe calls RLCD, instead of text that people like, which is RLHF.” If someone thinks
of JSON mode: “JSON mode fixes the format of an LLM's answer. It still writes one token at a time, and it does
not give you a probability for every answer.” In passing: about 100 ms according to TypeSafe, about 250 ms
from my laptop; $0.042 per million input tokens, and the answers are free.

## 3. Which bin?

Ask the room, calmly: “Where does a wine cork go?” Wait. Next key: “Brown. It is organic.” Then: “The city has
rules. Let's give the rules to Jev.”

## 4. The city's rules

“The city publishes rules. Here they are, in plain words. Cork is in the brown line. Now let's give these six
lines to Jev, exactly like this.”

## 5. One call

Step 1, the left side: “State is the text Jev reads. The question has instructions and criteria. The criteria
are the six rules from the last slide, word for word.” Next key, the right side: “Jev gives a probability for
every criterion. The choice is the highest. Confidence says how concentrated that is. That is the whole API.
This question type is a Choice; there are two more.”

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
below 0.5 to ask a person, and tuning it for your case. My demo uses 0.6. For the pen, the city is also
unclear: its two pages disagree, between grey and yellow.”

## 9. A second way: ask small questions

“Question 1 is the direct question. Questions 2 to 5 are small facts. They are answered together and cannot
see each other. Why ask small facts when the direct question works? Next slide.”

## 10. Your code decides

“Jev answers the small questions. My code makes the decision. When I fixed the rule, I did not call the model
again; I already had its answers. This is how TypeSafe says to build: code owns the decision, the model
supplies the judgment.”

## 11. 42 everyday items

“The direct question wins here because the city's list is in the criteria, so it is close to a lookup. Small
questions give you facts you can reuse and rules you can change. Pick by your problem.”

## 12. Every proposal in the city

“Same shape as the bins, but here the state is a title and up to 2,000 characters of Catalan. Jev is trained
mostly on English, so I checked a sample: its topic agreed with the city's own label about 8 times in 10. The
20 minutes was my own rate limit, 30 calls a second.”

## 13. What the proposals are about

“Tourism is the main topic of 583, but it is mentioned in about 1,300.” The “describes a problem” question was
weak, about 45% unsure, so I do not show it.

## 14. When reading gets cheap

Could one person read them all? Not really. When something gets very cheap, people find new uses for it.

## 15. When to use it, and when not

“TypeSafe publishes this list themselves. It works with LLMs, not instead of them.”

## 16. This is becoming normal

It is built on GPT-6 Luna. The numbers are OpenAI's own.

## 17. Three things to remember

Thank you. Questions.
