import dotenv from 'dotenv'
dotenv.config();
import inquirer from 'inquirer'
import { HuggingFace } from 'huggingface'
import { reword } from './reworder.js'
import { speak } from './tts.js';

const hf = new HuggingFace(process.env.HUGGINGFACE_API_KEY);

const initialQuestion = 'What would you like to see?';
const preamble = `Below is the output of an AI that reads a description of an image and either outputs a question to gather more visual details about the desired image, or outputs "Enough" only if the description is sufficiently detailed and specific.

Input: I would like to see a school, large
Output: What kind of material is the school building made of?

Input: I want to see a large red monster with horns, a tail, and claws, fur all over his body, fantasy art style
Output: Enough.

Input: I want a car, red, driving fast on a road, daytime
Output: What style of car is it?

Input: I would like to see a field
Output: Are there flowers in the field?

Input:`;

class Loader {
    constructor(bar) {
        this.i = -1;
        this.interval = null;
        this.bar = bar;
    }
    update() {
        this.i = (++this.i) % 3;
        this.bar.updateBottomBar(`Thinking.${'.'.repeat(this.i)}${' '.repeat(3 - this.i)}`);
    }
    show() {
        if (this.interval === null) {
            this.interval = setInterval(this.update.bind(this), 500)
        }
    }
    hide() {
        clearInterval(this.interval);
        this.bar.updateBottomBar('');
        this.interval = null;
    }
    remove() {
        this.hide();
        this.bar.close();
    }
}

let fullDescription = '';

const ui = new inquirer.ui.BottomBar();
const loader = new Loader(ui);
const ask = async label => {
    speak(label);
    const answer = await inquirer.prompt(
        [
            {
                type: 'input',
                name: 'text',
                message: label,
                validate: t => t.trim() ? true : 'You must enter something!',
                filter: t => t.replace(/(?:^ +| +$)/g, '')
            }
        ]
    );
    try {
        loader.show();
        const reworded = await reword(hf, label, answer.text);
        if (fullDescription) {
            fullDescription = fullDescription + ', ';
        }
        fullDescription += reworded.replace(/\W+?$/, '');
        // console.log(reworded);
        // process.exit();
        // return;
        // console.log('Trying: ', `${preamble} ${fullDescription}\nOutput:`)
        const inputs = `${preamble} ${fullDescription}\nOutput:`;
        const data = await hf.textGeneration({
            inputs,
            model: 'EleutherAI/gpt-neo-2.7B',
            parameters: {
                max_new_tokens: 20,
                temperature: 0.60,
                repetition_penalty: 1.25,
                return_full_text: false,
                max_time: 60 * Math.random() + 60
            }
        });
        const response = data.generated_text.split('\n');
        const nextPrompt = response[0].trim();
        console.log(fullDescription);
        if (nextPrompt.replace(/\W/g, '').toLowerCase() === 'enough') {
            return;
        }
        return setTimeout(() => ask(nextPrompt), 1);
    } catch (er) {
        console.log(er);
    } finally {
        loader.hide();
    }
}

ask(initialQuestion);