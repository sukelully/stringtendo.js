class String {
    constructor(){
        // Initialise variables for the noise generator, gain, filters, and output nodes.
        this.isPlaying = false;
        this.isConnected = true;
        this.noise = new Tone.Noise('brown');
        this.pluck = new Tone.Player('/src/harpPluck.wav');

        this.decayGain = new Tone.Gain(0.999);
        this.gain = new Tone.Gain(0.4);
        this.outputGain = new Tone.Gain();
        
        // Might be better at the end of the signal chain - notch filter.
        this.noiseFilter = new Tone.Filter({            // Initial filter used to shape tone.
            frequency: 20000, 
            type: 'lowpass',
            Q: 1
        });
        this.delay = new Tone.Delay({
            delayTime: 0.000865, 
            maxDelay: 1
        }); 
        this.loopFilter = new Tone.OnePoleFilter({
            frequency: 2000,                            // Dampening.
            type: 'lowpass'
        });
        this.output = new Tone.getDestination();

        // Routing.
        this.noise.connect(this.noiseFilter);
        this.pluck.connect(this.noiseFilter);
        this.noiseFilter.connect(this.gain);          
        this.gain.connect(this.outputGain);                 // Pluck sound
        this.gain.connect(this.delay);
        this.delay.connect(this.decayGain);
        this.decayGain.connect(this.loopFilter);
        this.loopFilter.connect(this.delay);
        this.loopFilter.connect(this.outputGain);
    }

    // Clears delay loop.
    muteString() {
        // Ramp output gain to 0 in 10ms.
        this.outputGain.gain.rampTo(0, 0.01);

        // Mute output and disconnect delay loop.
        setTimeout(() => {
            this.delay.disconnect();
        }, 110);    // Lowest interval without pops.

        // Reconnect and set output gain to 1 10ms after being disconnected.
        setTimeout(() => {
            this.delay.connect(this.loopFilter);
            this.outputGain.gain.rampTo(1, 0.01);
        }, 200);
    }

    // Creates a 17-22ms pink noise burst that is fed into the delay line and filter.
    // Longer than a traditional Karplus-Strong noise burst but there are issues with
    // it not making it into the delay line otherwise.
    pluckString() {
        const randomInt = Math.floor(Math.random() * (23 - 17) ) + 17;

        // Pink noise.
        // this.noise.start();
        
        // // Stop this.noise after 2-7ms.
        // setTimeout(() => {
        //     this.noise.stop();
        // }, randomInt);      

        // Harp sample.
        Tone.loaded().then(() => {
            this.pluck.start();
        });
        
    }

    // 6000 intensity = 128 delayComp
    // 4000 intensity = 128.5 delayComp
    // 2000 intensity = 130 delayComp
    // 1000 intensity = 134 delayComp

    // Returns a value that is used to calculate the necessary delay time
    // for the input pitch.
    calcDelayComp(intensity) {
        if (intensity >= 6000) {
          return 128;
        } else if (intensity >= 4000) {
          return 128.5 - 0.00025 * (intensity - 4000);
        } else if (intensity >= 2000) {
          return 130 - 0.000125 * (intensity - 2000);
        } else if (intensity >= 500) {
          return 134 - 0.0001 * (intensity - 1000);
        } else {
          return 140
        }
      }

    // // Plays the specified frequency.
    // // Converts frequency to delay time.
    playFreq(frequency) {
        const intensity = this.loopFilter.frequency;
        const delayComp = this.calcDelayComp(intensity);
        const sampleRate = Tone.context.sampleRate;
        const delayTime = (1 / frequency) - (delayComp / sampleRate);
        // delayTime = delayTime.toFixed(6);
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