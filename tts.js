import wintts from 'wintts'

export const speak = speech => {
    wintts(speech, er => er && console.error(er))
}