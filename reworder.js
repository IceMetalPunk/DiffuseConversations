import dotenv from 'dotenv'
dotenv.config();
import Constants from './constants.js'

const preamble = `Reword the following pairs of questions and answers into a single declarative description:

Question: Are the people inside the house dead?
Answer: No
Reworded: the people are alive

Question: What is your favorite color?
Answer: Blue
Reworded: my favorite color is blue

Question: How many windows are there?
Answer: 4
Reworded: there are 4 windows`;

const summaryPreamble = `Below is the output of a text-summarizing AI that includes all the most important details in its summary.

Text: I want to see a puppy, the puppy is a corgi, he is 2 years old, the puppy is brown, the dog is playing
Summary: A 2-year-old brown corgi dog is playing`;

export const reword = async (hf, q, a) => {
    const data = await hf.textGeneration({
        inputs: `${preamble}\n\nQuestion: ${q}\nAnswer: ${a}\nReworded:`,
        model: Constants.MODEL,
        parameters: {
            max_new_tokens: 20,
            temperature: 0.63,
            return_full_text: false,
            max_time: 60 * Math.random() + 60
        }
    });
    const response = data.generated_text.split('\n');
    // console.log({gen: data.generated_text});
    return response[0].trim();
}

export const summarize = async (hf, inputs) => {
    const result = await hf.textGeneration({
        inputs: `${summaryPreamble}\n\nText: ${inputs}\nSummary:`,
        model: Constants.MODEL,
        parameters: {
            max_new_tokens: 80,
            temperature: 0.63,
            return_full_text: false,
            max_time: 60 * Math.random() + 60
        }
    });
    const summary = result.generated_text.split('\n')[0].trim();
    return summary;
}