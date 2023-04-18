import { String } from '/js/string3.js';
import { chromScale } from '/js/notes.js';

class Harp {
    constructor(){
        // Create 8 strings for each note of the major scale + octave
        // and duplicates of each to bypass filter instability.
        for (let i = 1; i <= 8; i++) {
            this[`string${i}`] = new String();
            this[`string${i}b`] = new String();
        }

        // Create reverb & output nodes and route the strings to both..
        this.reverb = new Tone.Reverb(20);
        this.output = new Tone.getDestination();
        for (let i = 1; i <= 8; i++) {
            this[`string${i}`].outputGain.connect(this.reverb);
            this[`string${i}b`].outputGain.connect(this.reverb);
        }
        this.reverb.connect(this.output);

        // Set up HTML elements and event listeners.
        this.dampSlider = document.getElementById('damp-slider');
        this.dampSliderOutput = document.getElementById('damp-value');
        this.dampSliderOutput.innerHTML = this.dampSlider.value;
        this.delSlider = document.getElementById('del-slider');
        this.delSliderOutput = document.getElementById('del-value');
        this.delSliderOutput.innerHTML = this.delSlider.value;
        this.filterSlider = document.getElementById('filter-slider');
        this.filterSliderOutput = document.getElementById('filter-value');
        this.filterSliderOutput.innerHTML = this.filterSlider.value;

        // Set event listeners to update filter frequency and delay time when sliders are adjusted.
        this.dampSlider.oninput = () => {
            this.dampSliderOutput.innerHTML = this.dampSlider.value;
            for (let i = 1; i <= 8; i++) {
                this[`string${i}`].loopFilter.frequency = this.dampSlider.value;
                this[`string${i}b`].loopFilter.frequency = this.dampSlider.value;
            }
        }
        this.delSlider.oninput = () => {
            this.delSliderOutput.innerHTML = this.delSlider.value;
            for (let i = 1; i <= 8; i++) {
                this[`string${i}`].delay.delayTime.value = this.delSlider.value;
                this[`string${i}b`].delay.delayTime.value = this.delSlider.value;
            }
        }
        this.filterSlider.oninput = () => {
            this.filterSliderOutput.innerHTML = this.filterSlider.value;
            for (let i = 1; i <= 8; i++) {
                this[`string${i}`].noiseFilter.frequency.value = this.filterSlider.value;
                this[`string${i}b`].noiseFilter.frequency.value = this.filterSlider.value;
            }
        }

        // OnePoleFilter node is unstable when frequency is adjusted so it must be disconnected first.
        // Set up event listeners for damp slider mousedown and mouseup events to do so.
        this.dampSlider.addEventListener('mousedown', (event) => {
            if (event.currentTarget === this.dampSlider) {
                // Disconnect loopFilter node is damp slider is adjusted.
                for (let i = 1; i <= 8; i++) {
                    this[`string${i}`].loopFilter.disconnect();
                }
            }
            // this.string1.loopFilter.frequency = this.dampSlider.value;
            for (let i = 1; i <= 8; i++) {
                this[`string${i}`].loopFilter.frequency = this.dampSlider.value;
            }
        });
        // Reconnect node upon mouseup event.
        this.dampSlider.addEventListener('mouseup', (event) => {
            for (let i = 1; i <= 8; i++) {
                this[`string${i}`].loopFilter.connect(this[`string${i}`].delay);
                this[`string${i}`].loopFilter.connect(this[`string${i}`].output);
            }
        });

        // Event listener to play a note when clicking outside of buttons and sliders.
        document.addEventListener('mousedown', (event) => {
            if (event.target.matches('button') || event.target.matches('input[type="range"]'))  {
                return; // Return early if a button or slider is clicked.
            }
            // this.swapString('1', '1b', 'C3', 6000); 
        });

        // Start the Tone.js audio context.
        this.audioContextButton = document.getElementById('audio-context-button').addEventListener('click', async () => {
            await Tone.start();
            console.log('audio context started');
        });
        // Chromatic scale test.
        this.scaleTestButton = document.getElementById('scale-test-button').addEventListener('click', () => {
            this.scaleTest();
        });
         // Show/hide the menu.
        this.toggleMenuButton = document.getElementById('toggle-menu-button').addEventListener('click', async () => {
            this.toggleVisibility('ks-settings');
            console.log("menu clicked");
        });
        // Mute strings.
        this.muteStringsButton = document.getElementById('mute-strings-button').addEventListener('click', () => {
            this.muteStrings();
        })
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
        // intensity = Math.floor(Math.random() * (6000 - 3000) ) + 3000;
        intensity = 3000;
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