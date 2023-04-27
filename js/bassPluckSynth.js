import { EffectsChain } from '/js/effectsChain.js';

class BassPluckSynth {
    constructor() {
        // Create synth and effects objects.
        this.pluckSynth = new Tone.PluckSynth();
        this.effectsChain = new EffectsChain();
        this.output = new Tone.getDestination();

        // Routing.
        this.pluckSynth.connect(this.effectsChain.reverb);
        this.effectsChain.reverb.connect(this.output);

        // Toggle filter event listener.
        this.toggleFilterButton = document.getElementById('toggle-filter-button').addEventListener('click', () => {
            this.effectsChain.toggleFilter(this.pluckSynth, this.output);
            this.effectsChain.filterIsConnected = !this.effectsChain.filterIsConnected;
        });

        // Toggle delay event listener.
        this.toggleDelayButton = document.getElementById('toggle-delay-button').addEventListener('click', () => {
            this.effectsChain.toggleDelay(this.pluckSynth, this.output);
            this.effectsChain.delayIsConnected = !this.effectsChain.delayIsConnected;
        });

        // Toggle reverb event listener.
        this.toggleReverbButton = document.getElementById('toggle-reverb-button').addEventListener('click', () => {
            this.effectsChain.toggleReverb(this.pluckSynth, this.output);
            this.effectsChain.reverbIsConnected = !this.effectsChain.reverbIsConnected;
        });
    }

    // // Plays notes with joystick.
    // playHarp(joy_X, joy_Y) {
    // console.log("pluckSynth bass pluck");
    //     if (106 <= joy_X && joy_X <= 146 && 8 <= joy_Y && joy_Y <= 48) {        // South.        
    //         this.pluckSynth.triggerAttack('C2');
    //     }
    //     if (38 <= joy_X && joy_X <= 78 && 38 <= joy_Y && joy_Y <= 78) {         // South-West.
    //         this.pluckSynth.triggerAttack('D2');
            
    //     }
    //     if (178 <= joy_X && joy_X <= 218 && 36 <= joy_Y && joy_Y <= 76) {       // South-East.
    //         this.pluckSynth.triggerAttack('E2');
            
    //     }
    //     if (6 <= joy_X && joy_X <= 46 && 106 <= joy_Y && joy_Y <= 146) {        // West.
    //         this.pluckSynth.triggerAttack('F2');
            
    //     }
    //     if (206 <= joy_X && joy_X <= 246 && 106 <= joy_Y && joy_Y <= 146) {     // East;
    //         this.pluckSynth.triggerAttack('G2');
            
    //     }
    //     if (35 <= joy_X && joy_X <= 75 && 186 <= joy_Y && joy_Y <= 226) {       // North-West.
    //         this.pluckSynth.triggerAttack('A2');
            
    //     }
    //     if (180 <= joy_X && joy_X <= 220 && 186 <= joy_Y && joy_Y <= 226) {     // North-East.
    //         this.pluckSynth.triggerAttack('B2');
            
    //     }
    //     if (106 <= joy_X && joy_X <= 146 && 206 <= joy_Y && joy_Y <= 246) {     // North.
    //         this.pluckSynth.triggerAttack('C3');
    //     }
    // }
    
    // Plays notes with joystick.
    playHarp(joy_X, joy_Y) {
        console.log("pluckSynth bass pluck");
        if (106 <= joy_X && joy_X <= 146 && 8 <= joy_Y && joy_Y <= 48) {        // South.        
            this.pluckSynth.triggerAttack('C2');
        }
        if (38 <= joy_X && joy_X <= 78 && 38 <= joy_Y && joy_Y <= 78) {         // South-West.
            this.pluckSynth.triggerAttack('D2');
            
        }
        if (178 <= joy_X && joy_X <= 218 && 36 <= joy_Y && joy_Y <= 76) {       // South-East.
            this.pluckSynth.triggerAttack('E2');
            
        }
        if (6 <= joy_X && joy_X <= 46 && 106 <= joy_Y && joy_Y <= 146) {        // West.
            this.pluckSynth.triggerAttack('F2');
            
        }
        if (206 <= joy_X && joy_X <= 246 && 106 <= joy_Y && joy_Y <= 146) {     // East;
            this.pluckSynth.triggerAttack('G2');
            
        }
        if (35 <= joy_X && joy_X <= 75 && 186 <= joy_Y && joy_Y <= 226) {       // North-West.
            this.pluckSynth.triggerAttack('A2');
            
        }
        if (180 <= joy_X && joy_X <= 220 && 186 <= joy_Y && joy_Y <= 226) {     // North-East.
            this.pluckSynth.triggerAttack('B2');
            
        }
        if (106 <= joy_X && joy_X <= 146 && 206 <= joy_Y && joy_Y <= 246) {     // North.
            this.pluckSynth.triggerAttack('C3');
        }
    }
}

const bassPluckSynth = new BassPluckSynth();
export { bassPluckSynth }