

class StringSynth {
    constructor() {
        this.isPlaying = false;
        this.noise = new Tone.Noise('pink');
        this.noiseSynth = new Tone.NoiseSynth();
        this.gain = new Tone.Gain(0.8);
        this.noiseFilter = new Tone.Filter({
            frequency: 10000,
            type: 'lowpass'
        });
        this.delay = new Tone.Delay({
            delayTime: 0.01,
            maxDelay: 2 //0.00764467548 // C3 (130.81 Hz)
        });
        this.loopFilter = new Tone.Filter({
            frequency: 3000,
            type: 'lowpass',
            rolloff: -12
        });
        this.loopFilter2 = new Tone.OnePoleFilter({      // Low pass filter to gradually reduce high frequencies. 
            frequency: 3000, 
            type: 'lowpass',
        });
        this.output = new Tone.getDestination();
        // create an envelope that modulates the filter frequency over time
        this.freqEnvelope = new Tone.FrequencyEnvelope({
            attack: 0,
            decay: 0,
            sustain: 1,
            release: 10,
            baseFrequency: 3000,
            octaves: 3.4,
            decayCurve: 'linear',
            exoponent: 1
        }).connect(this.loopFilter.frequency);
        this.freqEnvelope.releaseCurve = [1, 0.7, 0.4, 0.2, 0.1, 0];

        // this.noise.connect(this.noiseFilter);
        // this.noiseFilter.connect(this.output);
        // this.noiseFilter.connect(this.delay);
        // this.gain.connect(this.delay);
        // this.delay.connect(this.loopFilter2);
        // this.loopFilter2.connect(this.delay);
        // this.loopFilter2.connect(this.output);

        this.noise.connect(this.noiseFilter);
        this.noiseFilter.connect(this.output);
        this.noiseFilter.connect(this.delay);
        this.delay.connect(this.gain);
        this.gain.connect(this.loopFilter);
        this.loopFilter.connect(this.delay);
        this.loopFilter.connect(this.output);

        document.addEventListener('mouseup', () => this.handleMouseUp());

        // Sliders.
        this.cutoffSlider = document.getElementById('cutoffSlider');    // Cutoff frequency.
        this.cutoffSliderOutput = document.getElementById('cutoffValue');
        this.cutoffSliderOutput.innerHTML = this.cutoffSlider.value;
        this.delSlider = document.getElementById('delSlider');          // Delay Time.
        this.delSliderOutput = document.getElementById('delValue');
        this.delSliderOutput.innerHTML = this.delSlider.value;
        this.dampSlider = document.getElementById('dampSlider');        // Dampening.
        this.dampSliderOutput = document.getElementById('dampValue');
        this.dampSliderOutput.innerHTML = this.dampSlider.value;

        this.cutoffSlider.oninput = () => {                             // Cutoff frequency.
            this.cutoffSliderOutput.innerHTML = this.cutoffSlider.value;
            this.loopFilter.frequency.value = this.cutoffSlider.value;
            // this.loopFilter2.frequency = this.cutoffSlider.value;
        }
        this.delSlider.oninput = () => {                                // Delay Time.
            this.delSliderOutput.innerHTML = this.delSlider.value;
            this.delay.delayTime.value = this.delSlider.value;
        }
        this.dampSlider.oninput = () => {                               // Dampening.
            this.dampSliderOutput.innerHTML = this.dampSlider.value;
            this.noiseFilter.frequency = this.dampSlider.value;
        }
    }

    // Creates a 2-7ms pink noise burst.
    pluckString() {
        // Checks to see if this.noise is not already playing.
        if (this.isPlaying == false) {
            const randomInt = Math.floor(Math.random() * (8 - 2) ) + 2;
            this.noise.start();
            this.isPlaying = true;
            
            // Stop this.noise after 2-7ms.
            setTimeout(() => {
                this.noise.stop();
                this.isPlaying = false;
            }, randomInt);
        }
    }

    // Runs pluckString() upon mouseup for testing.
    handleMouseUp() {
        this.pluckString();
        this.freqEnvelope.triggerAttackRelease(5);
        console.log("test");
        //this.noiseSynth.triggerAttackRelease(1);
        // this.loopFilter.frequency.rampTo(0, 10);

    }
}

export { StringSynth }