# Diffuse Conversations
### Because AI is cool.

**The What**

Diffuse Conversations is a helpful NodeJS command-line tool that leverages several major AIs to gather information about an image you'd like to see, then generate that image for you.

**The Why**

Because AI is cool. Like the tagline says. And also, because I was inspired by this video: [Proof-of-Concept of an AI Assistant Designer](https://twitter.com/imcharleslo/status/1580591523447844865?s=20&t=--wluJFUerrrIvTzeqdAiA) by [@imcharleslo](https://twitter.com/imcharleslo/status/1580591523447844865) on Twitter.

**The Usage**

*Requirements:*
1. [NodeJS and NPM.](https://nodejs.org/en/download/)
2. Windows for text-to-speech ability.
    * If you aren't on Windows or don't want TTS, you can replace the `tts.js` import with a no-op as the comment at the top of `index.js` says, and remove `wintts` from `package.json` before installing packages.

*Installing:*

Clone this repo into an empty local directory, then install packages:

    git clone https://github.com/IceMetalPunk/DiffuseConversations.git .

    npm install

    # If you don't want TTS or are not on Windows, be sure to run the line below; otherwise, skip it.
    npm uninstall wintts

Then get yourself a [HuggingFace access token](https://huggingface.co/settings/tokens) and a [Stable Horde API key](https://stablehorde.net/register), and put them in a file called simply `.env` in the root of the repo:

    HUGGINGFACE_API_KEY=<HuggingFace_Access_Token_Goes_Here>
    STABLE_HORDE_API_KEY=<Stable_Horde_API_Key_Goes_Here>

*Running:*

Simply run the index file with Node:

    node ./index.js

The AI will ask you questions about your image, and you can enter the answers in natural language (I believe English will work best as the prompts are in English). When the AI has decided it has enough information, it will start generating your image! If you don't get rate limited (see The Limits section for more info on that), your image will appear when it's done, usually within 40 to 80 seconds.

The image is saved as output.webp in the main program directory, and it *will* overwrite that file if it exists, so be sure to rename or Save As your images if you want to keep multiple.

**The Limits**

I don't have access to GPT-3, and so far I haven't been able to get GPT-NeoX-20B working via HuggingFace, so the AI behind the language processing is GPT-J-6B instead. Note that this is more than 3 times smaller than NeoX and nearly 30 times smaller than GPT-3, so the performance can be... dumb, sometimes, for lack of a nicer word. Still, it's better than any AI we had 5 years ago, so celebrate the positives! (If I ever get NeoX working, you'll see the difference, I'm sure!)

In terms of Stable Diffusion, my local install is the [Automatic1111 WebUI version](https://github.com/AUTOMATIC1111/stable-diffusion-webui), which is very much not interception-friendly. As I don't know much Python, it's been a struggle to get a command-line image generation working. I was pointed to the [InvokeAI version](https://github.com/invoke-ai/InvokeAI) by none other than than the becoming-famous Nerdy Rodent himself, so I'm looking into that and hopefully can get something working. In the meantime, I'm outsourcing the Stable Diffusion generation to the [Stable Horde API](https://stablehorde.net/), hence the rate limiting issue that occasionally gives a 429 error when checking the status on a generation. (The limit is meant to be 2 requests per minute, but even at a 40 second interval, it still occasionally hits the rate limit, so... 🤷‍♂️).

**The Approach**

While AI forms the backbone to all this, there is certainly some data processing that goes into making this work. So here's how the app works, from the moment you load it to the moment it gives you an image and exits.

1. The initial "What do you want to see?" question is hard-coded.
2. After every answer you submit, GPT-J is passed the question and answer with a context that asks it to combine the two into a single declarative sentence. So instead of "What color is the car? Blue", it outputs "the car is blue".
3. These phrases are concatenated and comma-separated, and GPT-J is given the full description list with a context that guides it to ask visual questions until it thinks it has enough information. Loop back to Step 2.
4. Once the AI says it knows enough, the final comma-separated list of descriptors goes through one more pass into GPT-J, this time with a context that asks it to summarize all the information in one concise description. This gets rid of duplicate or extraneous information introduced by the nature of concatenating independent outputs, effectively distilling all your answers down into the essence of one image description.
5. The final digested prompt is passed to Stable Diffusion, and when the output is ready, it's opened for you to see.

**The Plan**

1. *Stable Diffusion:* While this currently is based on RESTful services for everything, I do hope to get Stable Diffusion working through a local install instead, thereby allowing it to work offline and without any rate limiting (and, in general, much faster on any decent GPU).
2. *Language Model:* If I can figure outhow to get NeoX working, I very much would like to swap out GPT-J for that. I know it would work so much better, if only it would load...
    * GPT-3 support... maybe one day. OpenAI's API isn't free, so meh, if NeoX works well enough, I won't bother upgrading to GPT-3.
3. *Whisper:* Once Stable Diffusion is local, there's really no reason to fear local AIs over RESTful ones, so I hope to add support for [Whisper-Mic](https://github.com/mallorbc/whisper_mic) so you can answer the AI's questions without having to type anything. Because future AIs will probably get frustrated waiting for you to type things 😜