# Speaker notes

What I say on each slide. One section per slide in `site/index.html`.

## 1. Title

Name, one line about me. “You have probably heard of Jev. I spent some time building with it, and this is what
I learned.”

## 2. Reads like an LLM. Doesn't write like one.

“Is Jev an LLM? It understands language like one. TypeSafe calls it a new class of model, a System One model,
because of what it's trained to output: decisions with probabilities, not text.” In passing: it is fast and
cheap because it produces all answers in one pass and does not write. TypeSafe says a typical call takes about
100 ms; from my laptop it was about 250 ms. $0.042 per million input tokens, and output tokens are free.

## 3. One call

Jev gets your text, here one customer message, and a question with options that you write. It answers with one
of your options. One call can hold many questions; they run in parallel against the same text and cannot see
each other's answers.

## 4. Choice: pick one option

Choice: you get the pick and a probability for every option. The answer also has a confidence number, which
sums up how peaked the probabilities are.

## 5. Score: pick a level

Score: you describe each level in words. The answer can land between two levels. Read it as a position on your
levels, not as a measurement.

## 6. Noul: yes or no, as a probability

Noul: one number, the probability that the answer is yes. “Do you offer refunds?” asks about refunds but does
not ask for one, and Jev is not sure. A Noul has no separate confidence number.

## 7. “I'm not sure” is useful

The model tells you how sure it is, and your program can use that. High confidence does not mean the answer is
correct. It means the model did not hesitate.

## 8. Example 1: Which bin?

Ask the room, calmly: “Where does a wine cork go?” Wait. “Brown. It is organic.”

## 9. Your rules go in the options

This is the main idea of building with Jev: you write your rules as options. These six descriptions are the
city's rules, made short.

## 10. My first options were wrong

My first version had a mistake. I wrote “broken glass” under the grey bin. Jev said grey, 99% sure. But the
city says broken glass goes to a Green Point. When I fixed the options, Jev said Green Point. It follows the
rules you give it, so the rules must be right.

## 11. One item, one call

Click another item if useful. Optional: if the wifi is good, run it live in the terminal and take one item
from the room.

## 12. The real call

Point at: the item, the question, the options. Then the answer: the choice, the confidence, a probability for
every option, and the token count.

## 13. Ask small questions

One call, five questions. The first is the direct question. The other four are small facts about the item.

## 14. Your code decides

Jev answers the small questions. My code makes the decision. When I fixed the rule, I did not call the model
again, because I already had its answers.

## 15. 42 everyday items

The direct question won here, because the city's rules are in the options. My rules were weaker, but every
mistake came with a warning.

## 16. Three answers

For the pen, “not sure” is the honest answer.

## 17. Example 2: Every proposal in the city

The text is in Catalan and Spanish, and Jev is trained mostly on English, so I checked a sample: it agreed
with the city's own topic labels about 8 times in 10.

## 18. What the proposals are about

Education and culture, mobility and social topics are the biggest. Tourism is the main topic of only 583, but
it is mentioned in about 1,300.

## 19. When reading gets cheap

Could one person read them all? Not really. When something gets very cheap, people find new uses for it.

## 20. When to use it, and when not

It works with LLMs, not instead of them. TypeSafe publishes this list of weak points themselves.

## 21. This is becoming normal

It is built on GPT-6 Luna. The numbers are OpenAI's own.

## 22. Three things to remember

Thank you. Questions.
