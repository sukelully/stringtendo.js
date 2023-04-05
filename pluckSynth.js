class PluckSynth {
    constructor(){
        // Define the chromatic scale as an object with note names and their corresponding frequencies.
        this.chromaticScale = {
             'C-': 130.81 / 2,
            'Db-': 138.59 / 2,
             'D-': 146.83 / 2,
            'Eb-': 155.56 / 2,
             'E-': 164.81 / 2,
             'F-': 174.61 / 2,
            'Gb-': 185.00 / 2,
             'G-': 196.00 / 2,
            'Ab-': 207.65 / 2,
             'A-': 220.00 / 2,
            'Bb-': 233.08 / 2,
             'B-': 246.94 / 2, 
            'C': 130.81,
            'Db': 138.59,
             'D': 146.83,
            'Eb': 155.56,
             'E': 164.81,
             'F': 174.61,
            'Gb': 185.00,
             'G': 196.00,
            'Ab': 207.65,
             'A': 220.00,
            'Bb': 233.08,
             'B': 246.94,
             'C+': 130.81 * 2,
            'Db+': 138.59 * 2,
             'D+': 146.83 * 2,
            'Eb+': 155.56 * 2,
             'E+': 164.81 * 2,
             'F+': 174.61 * 2,
            'Gb+': 185.00 * 2,
             'G+': 196.00 * 2,
            'Ab+': 207.65 * 2,
             'A+': 220.00 * 2,
            'Bb+': 233.08 * 2,
             'B+': 246.94 * 2,
            'C++': 130.81 * 4
        }
        
        // Initialise variables for the noise generator, gain, filters, and output nodes.
        this.isPlaying = false;                         // Used to keep track of this.noise state.
        this.noise = new Tone.Noise('pink');            // Pink noise for less high frequency 'shrill'.
        this.gain = new Tone.Gain(0.5);
        // Might be better at the end of the signal chain - notch filter.
        this.noiseFilter = new Tone.Filter({            // Initial filter used to shape tone.
            frequency: 10000, 
            type: 'lowpass'
        });
        this.delay = new Tone.Delay({
            delayTime: 0.01, 
            maxDelay: 1
        }); 
        this.loopFilter = new Tone.OnePoleFilter({
            frequency: 2000, 
            type: 'lowpass'
        });
        // Try and make changing dampening variable better.
        this.loopFilter2 = new Tone.OnePoleFilter({
            frequency: 2000, 
            type: 'lowpass'
        })
        this.output = new Tone.getDestination();

        // Routing.
        this.noise.connect(this.noiseFilter);
        this.noiseFilter.connect(this.gain);          
        this.gain.connect(this.output);
        this.gain.connect(this.delay);
        this.delay.connect(this.loopFilter);
        this.loopFilter.connect(this.delay);
        this.loopFilter.connect(this.output);

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
            // this.playFreq(32.70); // Low C
            this.pluckString();
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

    // Creates a 2-7ms pink noise burst that is fed into the delay line and filter.
    pluckString() {
        // Checks to see if this.noise is not already playing.
        if (this.isPlaying == false) {
            var randomInt = Math.floor(Math.random() * (8 - 2) ) + 2;
            this.noise.start();
            this.isPlaying = true;
            
            // Stop this.noise after 2-7ms.
            setTimeout(() => {
                this.noise.stop();
                this.isPlaying = false;
            }, randomInt);
        }
    }

    // Plays the specified frequency.
    // Converts frequency to delay time.
    playFreq(frequency) {
        const sampleRate = Tone.context.sampleRate;
        // Delay node adds 128 sample frames between output and input so without
        // compensation the delay is 128 / sampleRate longer than desired.
        // Issue solved with: https://stackoverflow.com/questions/13153078/web-audio-karplus-strong-string-synthesis
        var detune = Math.random() * (130.5 - 129.5) + 12.5;         // Subtle out of tune effect.
        var delayTime = (1 / frequency) - (detune / sampleRate);
        delayTime = delayTime.toFixed(6);
        this.delay.delayTime.value = delayTime;
        this.pluckString();
    }

    // Plays the chromatic scale.
    scaleTest() {
        this.playFreq(this.chromaticScale['C+']);
        setTimeout(() => {
            this.playFreq(this.chromaticScale['Db+']);
        }, 250);
        setTimeout(() => {
            this.playFreq(this.chromaticScale['D+']);
        }, 500);
        setTimeout(() => {
            this.playFreq(this.chromaticScale['Eb+']);
        }, 750);
        setTimeout(() => {
            this.playFreq(this.chromaticScale['E+']);
        }, 1000);
        setTimeout(() => {
            this.playFreq(this.chromaticScale['F+']);
        }, 1250);
        setTimeout(() => {
            this.playFreq(this.chromaticScale['Gb+']);
        }, 1500);
        setTimeout(() => {
            this.playFreq(this.chromaticScale['G+']);
        }, 1750);
        setTimeout(() => {
            this.playFreq(this.chromaticScale['Ab+']);
        }, 2000);
        setTimeout(() => {
            this.playFreq(this.chromaticScale['A+']);
        }, 2250);
        setTimeout(() => {
            this.playFreq(this.chromaticScale['Bb+']);
        }, 2500);
        setTimeout(() => {
            this.playFreq(this.chromaticScale['B+']);
        }, 2750);
        setTimeout(() => {
            this.playFreq(this.chromaticScale['C++']);
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
            this.playFreq(this.chromaticScale['C']);
        }
        if (38 <= joy_X && joy_X <= 78 && 38 <= joy_Y && joy_Y <= 78) {         // South-West.
            this.playFreq(this.chromaticScale['D']);
        }
        if (178 <= joy_X && joy_X <= 218 && 36 <= joy_Y && joy_Y <= 76) {       // South-East.
            this.playFreq(this.chromaticScale['E']);
        }
        if (6 <= joy_X && joy_X <= 46 && 106 <= joy_Y && joy_Y <= 146) {        // West.
            this.playFreq(this.chromaticScale['F']);
        }
        if (206 <= joy_X && joy_X <= 246 && 106 <= joy_Y && joy_Y <= 146) {     // East;
            this.playFreq(this.chromaticScale['G']);
        }
        if (35 <= joy_X && joy_X <= 75 && 186 <= joy_Y && joy_Y <= 226) {       // North-West.
            this.playFreq(this.chromaticScale['A']);
        }
        if (180 <= joy_X && joy_X <= 220 && 186 <= joy_Y && joy_Y <= 226) {     // North-East.
            this.playFreq(this.chromaticScale['B']);
        }
        if (106 <= joy_X && joy_X <= 146 && 206 <= joy_Y && joy_Y <= 246) {     // North.
            this.playFreq(this.chromaticScale['C+']);
        }
    }
}

// Instantiate and export.
export { PluckSynth }