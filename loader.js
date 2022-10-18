import constants from "./constants.js";

export default class Loader {
    constructor(bar) {
        this.i = -1;
        this.interval = null;
        this.bar = bar;
        this.active = true;
    }
    update() {
        if (this.active) {
            this.i = (++this.i) % 3;
            this.bar.updateBottomBar(`${constants.Loader.THINKING}.${'.'.repeat(this.i)}${' '.repeat(3 - this.i)}`);
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