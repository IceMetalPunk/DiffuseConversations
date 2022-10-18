import dotenv from 'dotenv'
dotenv.config();
import Constants from './constants.js'

export const reword = async (hf, q, a) => {
    const data = await hf.textGeneration({
        inputs: `${Constants.Reword.PREAMBLE}${Constants.Reword.QUESTION_TAG}${q}${Constants.Reword.ANSWER_TAG}${a}${Constants.Reword.PROMPT_WORD}`,
        model: Constants.MODEL,
        parameters: {
            max_new_tokens: 20,
            temperature: 0.63,
            return_full_text: false,
            max_time: 60 * Math.random() + 60
        }
    });
    const response = data.generated_text.split('\n');
    return response[0].trim();
}

export const summarize = async (hf, inputs) => {
    const result = await hf.textGeneration({
        inputs: `${Constants.Summary.PREAMBLE}${Constants.Summary.TEXT_TAG}${inputs}${Constants.Summary.PROMPT_WORD}`,
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