import { String } from '/js/string.js';
import { chromScale } from '/js/notes.js';
import { EffectsChain } from '/js/effectsChain.js';

class Harp {
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

        // Start the Tone.js audio context.
        this.audioContextButton = document.getElementById('audio-context-button').addEventListener('click', async () => {
            await Tone.start();
            console.log('audio context started');
        });

        // Mute strings.
        this.muteStringsButton = document.getElementById('mute-strings-button').addEventListener('click', () => {
            this.muteStrings();
        })

        // Toggle delay.
        this.toggleDelayButton = document.getElementById('toggle-delay-button').addEventListener('click', (event) => {
            for (let i = 1; i <= 8; i++) {
                this.effectsChain.toggleDelay(this[`string${i}`].outputGain, this.output);
                this.effectsChain.toggleDelay(this[`string${i}b`].outputGain, this.output);
            }
            this.effectsChain.delayIsConnected = !this.effectsChain.delayIsConnected;
            console.log(`delay on: ${this.effectsChain.delayIsConnected}`);

            if (this.effectsChain.delayIsConnected) {
                event.target.style.backgroundColor = '#04AA6D';
            } else {
                event.target.style.backgroundColor = '#b3b3b3';
            }
        });

        // Toggle reverb.
        this.toggleReverbButton = document.getElementById('toggle-reverb-button').addEventListener('click', (event) => {
            for (let i = 1; i <= 8; i++) {
                this.effectsChain.toggleReverb(this[`string${i}`].outputGain, this.output);
                this.effectsChain.toggleReverb(this[`string${i}b`].outputGain, this.output);
            }
            this.effectsChain.reverbIsConnected = !this.effectsChain.reverbIsConnected;
            console.log(`reverb on: ${this.effectsChain.reverbIsConnected}`);

            if (this.effectsChain.reverbIsConnected) {
                event.target.style.backgroundColor = '#04AA6D';
            } else {
                event.target.style.backgroundColor = '#b3b3b3';
            }
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

    // Plays notes with joystick.
    playHarp(joy_X, joy_Y, intensity) {
        if (106 <= joy_X && joy_X <= 146 && 8 <= joy_Y && joy_Y <= 48) {        // South.
            this.swapString('1', '1b', 'C3', intensity);                                     
        }
        if (38 <= joy_X && joy_X <= 78 && 38 <= joy_Y && joy_Y <= 78) {         // South-West.
            this.swapString('2', '2b', 'D3', intensity);  
        }
        if (178 <= joy_X && joy_X <= 218 && 36 <= joy_Y && joy_Y <= 76) {       // South-East.
            this.swapString('3', '3b', 'E3', intensity); 
        }
        if (6 <= joy_X && joy_X <= 46 && 106 <= joy_Y && joy_Y <= 146) {        // West.
            this.swapString('4', '4b', 'F3', intensity); 
        }
        if (206 <= joy_X && joy_X <= 246 && 106 <= joy_Y && joy_Y <= 146) {     // East;
            this.swapString('5', '5b', 'G3', intensity); 
        }
        if (35 <= joy_X && joy_X <= 75 && 186 <= joy_Y && joy_Y <= 226) {       // North-West.
            this.swapString('6', '6b', 'A3', intensity); 
        }
        if (180 <= joy_X && joy_X <= 220 && 186 <= joy_Y && joy_Y <= 226) {     // North-East.
            this.swapString('7', '7b', 'B3', intensity); 
        }
        if (106 <= joy_X && joy_X <= 146 && 206 <= joy_Y && joy_Y <= 246) {     // North.
            this.swapString('8', '8b', 'C4', intensity);
        }
    }

    // Plays the chromatic scale.
    scaleTest() {
        const notes = ['C4', 'Db4', 'D4', 'Eb4', 'E4', 'F4', 'Gb4', 'G4', 'Ab4', 'A4', 'Bb4', 'B4', 'C5'];
        let time = 0;
        notes.forEach(note => {
          setTimeout(() => {
            this.string1.playFreq(chromScale[note]);
          }, time);
          time += 250;
        });
    }

    // Show/hides HTML an element.
    // Taken from https://stackoverflow.com/questions/16308779/how-can-i-hide-show-a-div-when-a-button-is-clicked
    toggleVisibility(id) {
        var element = document.getElementById(id);
        element.style.display = (element.style.display == 'block') ? 'none' : 'block';
    }
}

// Instantiate and export.
const harp = new Harp();
export { harp }