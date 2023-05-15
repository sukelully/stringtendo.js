import { EffectsChain } from '/js/karplus-strong/effectsChain.js';

class MyPluckSynth {
    constructor() {
        this.pluckSynth = new Tone.PluckSynth({
            resonance: 0.99,
            release: 1,
            dampening: 4000
        });
        this.effectsChain = new EffectsChain();
        this.output = new Tone.getDestination();

        // this.pluckSynth.connect(this.effectsChain.reverb);
        // this.effectsChain.reverb.connect(this.output);
        this.pluckSynth.connect(this.output);
    }

    // Runs pluckString() upon mouseup for testing.
    handleMouseUp() {
        this.pluckSynth.triggerAttack("C2");
        // this.pluckSynth.triggerAttack("G3", "+2");
        // this.pluckSynth.triggerAttack("C3", "+3");
        // this.pluckSynth.triggerAttack("G2", "+4");
        // this.pluckSynth.triggerAttack("C2", "+5");
    }

    // Plays notes with joystick.
    playHarp(joy_X, joy_Y) {
        if (106 <= joy_X && joy_X <= 146 && 8 <= joy_Y && joy_Y <= 48) {             // South.        
            this.pluckSynth.triggerAttack('C3');
        }
        else if (38 <= joy_X && joy_X <= 78 && 38 <= joy_Y && joy_Y <= 78) {         // South-West.
            this.pluckSynth.triggerAttack('D3');
        }
        else if (178 <= joy_X && joy_X <= 218 && 36 <= joy_Y && joy_Y <= 76) {       // South-East.
            this.pluckSynth.triggerAttack('E3');
        }
        else if (6 <= joy_X && joy_X <= 46 && 106 <= joy_Y && joy_Y <= 146) {        // West.
            this.pluckSynth.triggerAttack('F3');
        }
        else if (206 <= joy_X && joy_X <= 246 && 106 <= joy_Y && joy_Y <= 146) {     // East;
            this.pluckSynth.triggerAttack('G3');
        }
        else if (35 <= joy_X && joy_X <= 75 && 186 <= joy_Y && joy_Y <= 226) {       // North-West.
            this.pluckSynth.triggerAttack('A3');
        }
        else if (180 <= joy_X && joy_X <= 220 && 186 <= joy_Y && joy_Y <= 226) {     // North-East.
            this.pluckSynth.triggerAttack('B3');
        }
        else if (106 <= joy_X && joy_X <= 146 && 206 <= joy_Y && joy_Y <= 246) {     // North.
            this.pluckSynth.triggerAttack('C4');
        }
        }
}

const pluckSynth = new MyPluckSynth();
export { pluckSynth }