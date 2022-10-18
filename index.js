import dotenv from 'dotenv'
dotenv.config();
import inquirer from 'inquirer'
import { HuggingFace } from 'huggingface'
import { reword, summarize } from './reworder.js'
import { speak } from './tts.js';
import { generate } from './stablediffusion.js';
import fs from 'fs'
import child_process from 'child_process'
import Constants from './constants.js'

const hf = new HuggingFace(process.env.HUGGINGFACE_API_KEY);

const initialQuestion = 'What would you like to see?';
const preamble = `Below is the output of an AI that reads a description of an image and outputs a question to gather more visual details about the desired image, or outputs "Enough" only if the description is sufficiently detailed and specific. Each pair is a separate instance unrelated to the previous pairs.

Input: I would like to see a school, large
Output: What kind of material is the school building made of?

Input: I want to see a large red monster with horns, a tail, and claws, fur all over his body, fantasy art style
Output: Enough.

Input: I want a car, red, driving fast on a road, daytime
Output: What style of car is it?

Image: Show me James Corden
Output: Where should he be?

Input: I would like to see a field
Output: Are there flowers in the field?

Input:`;

class Loader {
    constructor(bar) {
        this.i = -1;
        this.interval = null;
        this.bar = bar;
        this.active = true;
    }
    update() {
        if (this.active) {
            this.i = (++this.i) % 3;
            this.bar.updateBottomBar(`Thinking.${'.'.repeat(this.i)}${' '.repeat(3 - this.i)}`);
        }
    }
    pause() { this.active = false; }
    resume() { this.active = true; }
    show() {
        if (this.interval === null) {
            this.interval = setInterval(this.update.bind(this), 500)
        }
        this.resume();
    }
    hide() {
        this.pause();
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
        const inputs = `${preamble} ${fullDescription}\nOutput:`;
        const data = await hf.textGeneration({
            inputs,
            model: Constants.MODEL,
            parameters: {
                max_new_tokens: 20,
                temperature: 0.65,
                return_full_text: false,
                max_time: 60 * Math.random() + 60
            }
        });
        const response = data.generated_text.split('\n');
        const nextPrompt = response[0].trim();
        //console.log(fullDescription);
        if (nextPrompt.replace(/\W/g, '').toLowerCase() === 'enough') {
            fullDescription = await summarize(hf, fullDescription);
            loader.pause();
            ui.updateBottomBar('');
            console.log(`You asked for: ${fullDescription}`);
            const minTime = 40;
            ui.updateBottomBar(`Drawing image, this may take awhile! Status will only be updated every ${minTime} seconds to avoid rate limiting.`);
            const result = await generate(fullDescription, status => {
                const timeLeft = Math.max(status.wait_time, minTime);
                ui.updateBottomBar(`Queue: ${status.queue_position}, Time Left: ${status.wait_time < timeLeft ? '< ' : ''}${timeLeft}s`);
            });
            loader.hide();
            const img = result.generations[0].img;
            const binary = Buffer.from(img, 'base64');
            fs.writeFileSync('output.webp', binary, 'binary');
            console.log('Done!');
            child_process.exec('start ./output.webp');
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