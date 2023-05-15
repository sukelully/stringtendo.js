class String {
    constructor(){
        // Initialise variables for the noise, gain, filters, and output nodes.
        this.isPlaying = false;
        this.isConnected = true;
        this.noise = new Tone.Noise('pink');
        this.gain = new Tone.Gain(0.4);
        this.decayGain = new Tone.Gain(0.99);           // Feedback gain.
        this.outputGain = new Tone.Gain();
        
        // Initial filter used to shape tone.
        this.noiseFilter = new Tone.Filter({            
            frequency: 20000, 
            type: 'lowpass',
            Q: 1
        });
        // Delay line.
        this.delay = new Tone.Delay({
            delayTime: 0.000865, 
            maxDelay: 1
        }); 
        // Low-pass loop filter.
        this.loopFilter = new Tone.OnePoleFilter({
            frequency: 7000,                            // Dampening.
            type: 'lowpass'
        });
        this.output = new Tone.getDestination();

        // Routing.
        this.noise.connect(this.noiseFilter);
        this.noiseFilter.connect(this.gain);          
        this.gain.connect(this.outputGain);             // Pluck sound sent to output.
        this.gain.connect(this.delay);
        this.delay.connect(this.decayGain);
        this.decayGain.connect(this.loopFilter);
        this.loopFilter.connect(this.delay);
        this.loopFilter.connect(this.outputGain);
    }

    // Clears feedback loop by disconnecting delay node from loop.
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

    // Creates a 5-15ms pink noise burst that is fed into feedback loop.
    pluckString() {
        const randomInt = Math.floor(Math.random() * (15 - 5) ) + 15;
        this.noise.start();
        
        // Stop this.noise after 5-15ms.
        setTimeout(() => {
            this.noise.stop();
        }, randomInt);      
    }

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

    // Plays the specified frequency.
    // Converts frequency to delay time.
    playFreq(frequency) {
        const intensity = this.loopFilter.frequency;
        const delayComp = this.calcDelayComp(intensity);
        const sampleRate = Tone.context.sampleRate;
        const delayTime = (1 / frequency) - (delayComp / sampleRate);
        // delayTime = delayTime.toFixed(6);
        this.delay.delayTime.value = delayTime;
        this.pluckString();
    }
}

// Export class.
export { String }