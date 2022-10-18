import dotenv from 'dotenv'
dotenv.config();

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

export const reword = async (hf, q, a) => {
    const data = await hf.textGeneration({
        inputs: `${preamble}\n\nQuestion: ${q}\nAnswer: ${a}\nReworded:`,
        model: 'EleutherAI/gpt-neo-2.7B',
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