import { String } from './string.js'
import { chromScale } from './notes.js';

class Harp {
    constructor(){
        // Set up strings.
        this.string1 = new String();
        this.string2 = new String();
        this.string3 = new String();
        this.string4 = new String();
        this.string5 = new String();
        this.string6 = new String();
        this.string7 = new String();
        this.string8 = new String();

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
            this.loopFilter.frequency = this.dampSlider.value;
        }
        this.delSlider.oninput = () => {
            this.delSliderOutput.innerHTML = this.delSlider.value;
            this.delay.delayTime.value = this.delSlider.value;
        }
        this.filterSlider.oninput = () => {
            this.filterSliderOutput.innerHTML = this.filterSlider.value;
            this.noiseFilter.frequency.value = this.filterSlider.value;
        }
        
        // OnePoleFilter node is unstable when frequency is adjusted so it must be disconnected first.
        // Set up event listeners for damp slider mousedown and mouseup events to do so.
        this.dampSlider.addEventListener('mousedown', (event) => {
            if (event.currentTarget === this.dampSlider) {
                // Disconnect loopFilter node is damp slider is adjusted.
                this.loopFilter.disconnect();
            }
            this.loopFilter.frequency = this.dampSlider.value;
        });

        // Reconnect node upon mouseup event.
        this.dampSlider.addEventListener('mouseup', (event) => {
            this.loopFilter.connect(this.delay);
            this.loopFilter.connect(this.output);
        });

        // Event listener to play a note when clicking outside of buttons and sliders.
        document.addEventListener('mousedown', (event) => {
            if (event.target.matches('button') || event.target.matches('input[type="range"]'))  {
                return; // Return early if a button or slider is clicked.
            }

            this.string1.pluckString();
        });

        // Audio context button event listener for starting the Tone.js audio context.
        this.audioContextButton = document.getElementById('audio-context-button').addEventListener('click', async () => {
            await Tone.start();
            console.log('audio context started');
        });
        this.scaleTestButton = document.getElementById('scale-test-button').addEventListener('click', () => {
            this.scaleTest();
        });
         // Toggle menu button event listener for showing/hiding the menu.
        this.toggleMenuButton = document.getElementById('toggle-menu-button').addEventListener('click', async () => {
            this.toggleVisibility('ks-settings');
        });
    }

    // Plays the chromatic scale.
    scaleTest() {
        this.string1.playFreq(chromScale['C']);
        setTimeout(() => {
            this.string1.playFreq(chromScale['Db']);
        }, 250);
        setTimeout(() => {
            this.string1.playFreq(chromScale['D']);
        }, 500);
        setTimeout(() => {
            this.string1.playFreq(chromScale['Eb']);
        }, 750);
        setTimeout(() => {
            this.string1.playFreq(chromScale['E']);
        }, 1000);
        setTimeout(() => {
            this.string1.playFreq(chromScale['F']);
        }, 1250);
        setTimeout(() => {
            this.string1.playFreq(chromScale['Gb']);
        }, 1500);
        setTimeout(() => {
            this.string1.playFreq(chromScale['G']);
        }, 1750);
        setTimeout(() => {
            this.string1.playFreq(chromScale['Ab']);
        }, 2000);
        setTimeout(() => {
            this.string1.playFreq(chromScale['A']);
        }, 2250);
        setTimeout(() => {
            this.string1.playFreq(chromScale['Bb']);
        }, 2500);
        setTimeout(() => {
            this.string1.playFreq(chromScale['B']);
        }, 2750);
        setTimeout(() => {
            this.string1.playFreq(chromScale['C+']);
        }, 3000);
    }

    // Show/hides HTML an element.
    // Taken from https://stackoverflow.com/questions/16308779/how-can-i-hide-show-a-div-when-a-button-is-clicked
    toggleVisibility(id) {
        var element = document.getElementById(id);
        element.style.display = (element.style.display == 'block') ? 'none' : 'block';
    }

    // Plays notes with 
    playTest(joy_X, joy_Y) {
        if (106 <= joy_X && joy_X <= 146 && 8 <= joy_Y && joy_Y <= 48) {        // South.
            this.string1.playFreq(chromScale['C']);
        }
        if (38 <= joy_X && joy_X <= 78 && 38 <= joy_Y && joy_Y <= 78) {         // South-West.
            this.string2.playFreq(chromScale['D']);
        }
        if (178 <= joy_X && joy_X <= 218 && 36 <= joy_Y && joy_Y <= 76) {       // South-East.
            this.string3.playFreq(chromScale['E']);
        }
        if (6 <= joy_X && joy_X <= 46 && 106 <= joy_Y && joy_Y <= 146) {        // West.
            this.string4.playFreq(chromScale['F']);
        }
        if (206 <= joy_X && joy_X <= 246 && 106 <= joy_Y && joy_Y <= 146) {     // East;
            this.string5.playFreq(chromScale['G']);
        }
        if (35 <= joy_X && joy_X <= 75 && 186 <= joy_Y && joy_Y <= 226) {       // North-West.
            this.string6.playFreq(chromScale['A']);
        }
        if (180 <= joy_X && joy_X <= 220 && 186 <= joy_Y && joy_Y <= 226) {     // North-East.
            this.string7.playFreq(chromScale['B']);
        }
        if (106 <= joy_X && joy_X <= 146 && 206 <= joy_Y && joy_Y <= 246) {     // North.
            this.string8.playFreq(chromScale['C+']);
        }
    }
}

// Instantiate and export.
const harp = new Harp();
export { harp }