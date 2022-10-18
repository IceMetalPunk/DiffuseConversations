import dotenv from 'dotenv'
dotenv.config();
const baseURL = 'https://stablehorde.net/api';
const version = 2;

export const startGeneration = async prompt => {
    const data = {
        prompt,
        'params': {
            'sampler_name': 'k_lms',
            'toggles': [
                1,
                4
            ],
            'cfg_scale': 7,
            'denoising_strength': 0.75,
            'seed': '156156165',
            'height': 512,
            'width': 512,
            'seed_variation': 1,
            'use_gfpgan': true,
            'use_real_esrgan': true,
            'use_ldsr': true,
            'use_upscaling': true,
            'steps': 50,
            'n': 1
        },
        'nsfw': true,
        'trusted_workers': false,
        'censor_nsfw': false
    };
    const response = await fetch(`${baseURL}/v${version}/generate/async`,
        {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.STABLE_HORDE_API_KEY
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data)
        }
    );
    if (response.status < 200 || response.status >= 300) {
        throw {
            statusCode: response.status,
            step: 'starting'
        };
    }
    const json = await response.json();

    return json.id;
}

export const checkGeneration = async uuid => {
    const response = await fetch(`${baseURL}/v${version}/generate/status/${uuid}`);
    if (response.status < 200 || response.status >= 300) {
        throw {
            statusCode: response.status,
            step: 'status'
        };
    }
    const json = await response.json();
    return json;
}

export const generate = async (prompt, onUpdate) => {
    const uuid = await startGeneration(prompt);
    return new Promise(async (res, rej) => {
        let interval = null;
        const checkWithUpdate = async () => {
            try {
                const status = await checkGeneration(uuid);
                onUpdate(status);
                if (status.finished) {
                    clearInterval(interval);
                    res(status);
                }
            } catch (er) {
                clearInterval(interval);
                rej(er);
            }
        };
        interval = setInterval(checkWithUpdate, 35000);
    });
}