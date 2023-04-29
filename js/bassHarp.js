import { String } from '/js/string.js';
import { chromScale } from '/js/notes.js';
import { EffectsChain } from '/js/effectsChain.js';

class BassHarp {
    constructor(){
        // Create 8 strings for each note of the major scale + octave
        // and duplicates of each to bypass filter instability.
        for (let i = 1; i <= 8; i++) {
            this[`string${i}`] = new String();
            this[`string${i}b`] = new String();
        }

        this.effectsChain = new EffectsChain();
        this.output = new Tone.getDestination();

        // Connect reverb node.
        for (let i = 1; i <= 8; i++) {
            this[`string${i}`].outputGain.connect(this.effectsChain.reverb);
            this[`string${i}b`].outputGain.connect(this.effectsChain.reverb);
        }
        this.effectsChain.reverb.connect(this.output);

        // Mute strings event listener.
        this.muteStringsButton = document.getElementById('mute-strings-button').addEventListener('click', () => {
            this.muteStrings();
        });

        // Toggle filter event listner.
        this.toggleFilterButton = document.getElementById('toggle-filter-button').addEventListener('click', (event) => {
            for (let i = 1; i <= 8; i++) {
                this.effectsChain.toggleFilter(this[`string${i}`].outputGain, this.output);
                this.effectsChain.toggleFilter(this[`string${i}b`].outputGain, this.output);
            }
            this.effectsChain.filterIsConnected = !this.effectsChain.filterIsConnected;
        });

        // Toggle delay event listener.
        this.toggleDelayButton = document.getElementById('toggle-delay-button').addEventListener('click', () => {
            for (let i = 1; i <= 8; i++) {
                this.effectsChain.toggleDelay(this[`string${i}`].outputGain, this.output);
                this.effectsChain.toggleDelay(this[`string${i}b`].outputGain, this.output);
            }
            this.effectsChain.delayIsConnected = !this.effectsChain.delayIsConnected;
        });

        // Toggle reverb event listener.
        this.toggleReverbButton = document.getElementById('toggle-reverb-button').addEventListener('click', () => {
            for (let i = 1; i <= 8; i++) {
                this.effectsChain.toggleReverb(this[`string${i}`].outputGain, this.output);
                this.effectsChain.toggleReverb(this[`string${i}b`].outputGain, this.output);
            }
            this.effectsChain.reverbIsConnected = !this.effectsChain.reverbIsConnected;;
        });
    }

    // Disconnects the output of a chosen string's loop filter.
    disconnectFilter(string) {
        this[`string${string}`].outputGain.gain.rampTo(0, 0.001);
        setTimeout(() => {
            this[`string${string}`].loopFilter.disconnect();
            this[`string${string}`].isConnected = false;
            this[`string${string}`].isPlaying = false;
        }, 110);
    }

    // Connects a chosen string's loop filter to delay and output node.
    reconnectFilter(string) {
        this[`string${string}`].loopFilter.connect(this[`string${string}`].delay);
        this[`string${string}`].loopFilter.connect(this[`string${string}`].outputGain);
        this[`string${string}`].outputGain.gain.rampTo(1, 0.001);
        this[`string${string}`].isConnected = true;
    }

    // Disconnects and sets the loop filter frequency, then reconnects and plays the specified note.
    // Avoids clicks and pops.
    strikeString(stringA, stringB, note, intensity) {
        this.disconnectFilter(stringB);
        this[`string${stringA}`].loopFilter.frequency = intensity;
        this.reconnectFilter(stringA);
        setTimeout(() => {
            this[`string${stringA}`].playFreq(chromScale[note]);
            this[`string${stringA}`].isPlaying = true;
        }, 50);
    }

    // Mutes all strings.
    muteStrings() {
        for (let i = 1; i <= 8; i++) {
            this[`string${i}`].muteString();
            this[`string${i}b`].muteString();
        }
    }

    // Each string has a duplicate that replaces the original each time it is plucked.
    // Prevents pops in audio and maintains no
    swapString(stringA, stringB, note, intensity) {
        // Keeps filter frequency in a suitable range.
        if (intensity < 1000) intensity = 1000;
        if (intensity > 7000) intensity = 7000;
        if (this[`string${stringA}`].isPlaying == false) {
            this.strikeString(stringA, stringB, note, intensity);
        } else {
            this.strikeString(stringB, stringA, note, intensity);
        }
    }

    playHarp(joy_X, joy_Y, intensity) {
        if (106 <= joy_X && joy_X <= 146 && 8 <= joy_Y && joy_Y <= 48) { 
            this.swapString('1', '1b', 'C2', intensity);                                     
        }
        else if (38 <= joy_X && joy_X <= 78 && 38 <= joy_Y && joy_Y <= 78) {         // South-West.
            this.swapString('2', '2b', 'D2', intensity);  
        }
        else if (178 <= joy_X && joy_X <= 218 && 36 <= joy_Y && joy_Y <= 76) {       // South-East.
            this.swapString('3', '3b', 'E2', intensity); 
        }
        else if (6 <= joy_X && joy_X <= 46 && 106 <= joy_Y && joy_Y <= 146) {        // West.
            this.swapString('4', '4b', 'F2', intensity); 
        }
        else if (206 <= joy_X && joy_X <= 246 && 106 <= joy_Y && joy_Y <= 146) {     // East;
            this.swapString('5', '5b', 'G2', intensity); 
        }
        else if (35 <= joy_X && joy_X <= 75 && 186 <= joy_Y && joy_Y <= 226) {       // North-West.
            this.swapString('6', '6b', 'A2', intensity); 
        }
        else if (180 <= joy_X && joy_X <= 220 && 186 <= joy_Y && joy_Y <= 226) {     // North-East.
            this.swapString('7', '7b', 'B2', intensity); 
        }
        else if (106 <= joy_X && joy_X <= 146 && 206 <= joy_Y && joy_Y <= 246) {     // North.
            this.swapString('8', '8b', 'C3', intensity);
        } else {
            console.log("none true");
        }
    }
}

// Instantiate and export.
const bassHarp = new BassHarp();
export { bassHarp }