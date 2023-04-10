class String {
    constructor(){
        // Define the chromatic scale as an object with note names and their corresponding frequencies.
        // Initialise variables for the noise generator, gain, filters, and output nodes.
        this.isPlaying = false;
        this.isConnected = true;
        this.noise = new Tone.Noise('pink');            // Pink noise for less high frequency 'shrill'.
        this.gain = new Tone.Gain(0.5);
        this.outputGain = new Tone.Gain();
        // Might be better at the end of the signal chain - notch filter.
        this.noiseFilter = new Tone.Filter({            // Initial filter used to shape tone.
            frequency: 10000, 
            type: 'lowpass',
            Q: 1
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

        // Listen for pitch events from the PitchDetector
        // this.pitchDetector.on("frequency", (frequency) => {
        //     console.log(frequency);
        //     });

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

    // Creates a 17-22ms pink noise burst that is fed into the delay line and filter.
    // Longer than a traditional Karplus-Strong noise burst but there are issues with
    // it not making it into the delay line otherwise.
    pluckString() {
        // Checks to see if this.noise is not already playing.
        const randomInt = Math.floor(Math.random() * (23 - 17) ) + 17;
        this.noise.start();
        
        // Stop this.noise after 2-7ms.
        setTimeout(() => {
            this.noise.stop();
        }, randomInt);
        
    }

    // (132/SR tests)
    // 0.02585 = 35Hz.

    // 0.01505 = ~56.4Hz.

    // 0.0005 = ~315Hz
    // 0.0001 = ~365Hz
    // 0.00005 = 368Hz
    // F#4 = 369Hz
    // 0.00001 = ~375Hz  // Highest possible note.

    // Middle C3 (130.81Hz) tests.
    // (150/SR) = ~137Hz
    // (138/SR) = ~132.2Hz
    // (134/SR) = ~131Hz
    // (132/SR) = 129.3Hz
    // (130/SR) = 129.3Hz
    // (128/SR) = 128.6Hz

    // C4 (263.74Hz) tests.
    // (134/SR) = ~263Hz.

    // // Plays the specified frequency.
    // // Converts frequency to delay time.
    playFreq(frequency) {
        const sampleRate = Tone.context.sampleRate;
        // Delay node adds 128 sample frames between output and input so without
        // compensation the delay is 128 / sampleRate longer than desired.
        // However, using 134 yields more accurate pitch.
        var delayTime = (1 / frequency) - (134 / sampleRate);
        delayTime = delayTime.toFixed(6);
        this.delay.delayTime.value = delayTime;
        this.pluckString();
    }

    // // Plays the specified frequency.
    // // Converts frequency to delay time.
    // playFreq(frequency) {
    //     const sampleRate = Tone.context.sampleRate;
    //     // Delay node adds 128 sample frames between output and input so without
    //     // compensation the delay is 128 / sampleRate longer than desired.
    //     var delayTime = (1 / frequency) - (130 / sampleRate);
    //     if (delayTime <= 0) {
    //       // if delay time is less than or equal to zero, set delay time to zero and return
    //       this.delay.delayTime.value = 0;
    //       return;
    //     }
    //     // use a logarithmic function to scale delay time whilst approaching zero
    //     var logDelayTime = Math.log(delayTime);
    //     var scaledDelayTime = (logDelayTime / Math.log(1 / sampleRate)) * -1;
    //     var scaledDelayTimeExp = Math.exp(scaledDelayTime);
    //     console.log(scaledDelayTimeExp);
    //     this.delay.delayTime.value = scaledDelayTimeExp/10;
    //     this.pluckString();
    // }

    // Show/hides HTML an element.
    // Taken from https://stackoverflow.com/questions/16308779/how-can-i-hide-show-a-div-when-a-button-is-clicked
    toggleVisibility(id) {
        var element = document.getElementById(id);
        element.style.display = (element.style.display == 'block') ? 'none' : 'block';
    }
}

// Export class.
export { String }