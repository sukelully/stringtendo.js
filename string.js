class String {
    constructor(){
        // Define the chromatic scale as an object with note names and their corresponding frequencies.
        
        // Initialise variables for the noise generator, gain, filters, and output nodes.
        this.isPlaying = false;                         // Used to keep track of this.noise state.
        this.noise = new Tone.Noise('pink');            // Pink noise for less high frequency 'shrill'.
        this.gain = new Tone.Gain(0.5);
        this.outputGain = new Tone.Gain();
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
            frequency: 2000,                            // Dampening.
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
        this.loopFilter.connect(this.outputGain);
        this.outputGain.connect(this.output);

        // Attempt to fix initial issues.
        // // Ramp output gain to 0 in 10ms.
        // this.outputGain.gain.rampTo(0, 0.01);
        // this.output.mute = true;

        // // First pluck can be distorted so it is muted upon setup.
        // this.pluckString();
        // this.muteString();
    }

    // Clears delay loop.
    muteString() {
        // Ramp output gain to 0 in 10ms.
        this.outputGain.gain.rampTo(0, 0.01);

        // Mute output and disconnect delay loop.
        setTimeout(() => {
            this.output.mute = true;
            this.delay.disconnect();
        }, 110);    // Lowest interval without pops.

        // Reconnect and set output gain to 1 10ms after being disconnected.
        setTimeout(() => {
            this.delay.connect(this.loopFilter);
            this.outputGain.gain.rampTo(1, 0.01);
            this.output.mute = false;
        }, 120);
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
        var detune = Math.random() * (130.5 - 129.5) + 129.5;         // Subtle out of tune effect.
        var delayTime = (1 / frequency) - (detune / sampleRate);
        delayTime = delayTime.toFixed(6);
        this.delay.delayTime.value = delayTime;
        this.pluckString();
    }

    // Show/hides HTML an element.
    // Taken from https://stackoverflow.com/questions/16308779/how-can-i-hide-show-a-div-when-a-button-is-clicked
    toggleVisibility(id) {
        var element = document.getElementById(id);
        element.style.display = (element.style.display == 'block') ? 'none' : 'block';
    }
}

// Export class.
export { String }