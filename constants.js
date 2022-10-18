export default {
    // MODEL: 'EleutherAI/gpt-neox-20b',
    MODEL: 'EleutherAI/gpt-j-6B',
    Loader: {
        THINKING: 'Thinking'
    },
    Main: {
        INITIAL_QUESTION: 'What would you like to see?',
        PROMPT_WORD: '\nOutput:',
        PREAMBLE: `Below is the output of an AI that reads a description of an image and outputs a question to gather more visual details about the desired image, or outputs "Enough" only if the description is sufficiently detailed and specific. Each pair of input and output is a separate instance unrelated to the previous pairs.

Input: I would like to see a school, large
Output: What kind of material is the school building made of?

Input: I want to see a large red monster with horns, a tail, and claws, fur all over his body, fantasy art style
Output: Enough.

Input: I want a car, red, driving fast on a road, daytime
Output: What style of car is it?

Input: I would like to see a field
Output: Are there flowers in the field?

Image: Show me James Corden
Output: Where should he be?

Input:`
    },
    Reword: {
        QUESTION_TAG: '\n\nQuestion: ',
        ANSWER_TAG: '\nAnswer: ',
        PROMPT_WORD: '\nReworded:',
        PREAMBLE: `Reword the following pairs of questions and answers into a single declarative description:

Question: Are the people inside the house dead?
Answer: No
Reworded: the people are alive

Question: What is your favorite color?
Answer: Blue
Reworded: my favorite color is blue

Question: How many windows are there?
Answer: 4
Reworded: there are 4 windows`
    },
    Summary: {
        TEXT_TAG: '\n\nText: ',
        PROMPT_WORD: '\nSummary:',
        PREAMBLE: `Below is the output of a text-summarizing AI that includes all the most important details in its summary. Each pair of text and summary is independent.

Text: I want to see a puppy, the puppy is a corgi, he is 2 years old, the puppy is brown, the dog is playing
Summary: A 2-year-old brown corgi dog is playing

Text: Show me a woman, the woman is tall, her name is Ada Lovelace, the woman is waving, woman is on a red carpet
Summary: Ada Lovelace is tall and waving on the red carpet`
    }
}