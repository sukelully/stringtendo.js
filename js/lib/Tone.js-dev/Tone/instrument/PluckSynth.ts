// Import necessary classes and functions from other modules
import { Frequency, NormalRange, Time } from "../core/type/Units";
import { LowpassCombFilter } from "../component/filter/LowpassCombFilter";
import { deepMerge } from "../core/util/Defaults";
import { optionsFromArguments } from "../core/util/Defaults";
import { RecursivePartial } from "../core/util/Interface";
import { Noise } from "../source/Noise";
import { Instrument, InstrumentOptions } from "./Instrument";

// Define an interface to describe the options for the PluckSynth class
export interface PluckSynthOptions extends InstrumentOptions {
    attackNoise: number;
    dampening: Frequency;
    resonance: NormalRange;
    release: Time;
}

/**
 * Karplus-Strong string synthesis.
 * @example
 * const plucky = new Tone.PluckSynth().toDestination();
 * plucky.triggerAttack("C4", "+0.5");
 * plucky.triggerAttack("C3", "+1");
 * plucky.triggerAttack("C2", "+1.5");
 * plucky.triggerAttack("C1", "+2");
 * @category Instrument
 */
export class PluckSynth extends Instrument<PluckSynthOptions> {

    readonly name = "PluckSynth";

    /**
     * Noise burst at the beginning
     */
    private _noise: Noise;
    private _lfcf: LowpassCombFilter;

    /**
     * The amount of noise at the attack.
     * Nominal range of [0.1, 20]
     * @min 0.1
     * @max 20
     */
    attackNoise: number;

    /**
     * The amount of resonance of the pluck. Also correlates to the sustain duration.
     */
    resonance: NormalRange;

    /**
     * The release time which corresponds to a resonance ramp down to 0
     */
    release: Time;

    constructor(options?: RecursivePartial<PluckSynthOptions>)
    constructor() {
        // Call the super constructor with the default options merged with any provided options
        super(optionsFromArguments(PluckSynth.getDefaults(), arguments));
        const options = optionsFromArguments(PluckSynth.getDefaults(), arguments);

        // Create a new Noise object to generate the initial burst of noise
        this._noise = new Noise({
            context: this.context,
            type: "pink"
        });

        // Set the amount of noise at the attack to the provided value
        this.attackNoise = options.attackNoise;

        // Create a new LowpassCombFilter object to generate the pluck sound
        this._lfcf = new LowpassCombFilter({
            context: this.context,
            dampening: options.dampening,
            resonance: options.resonance,
        });

        // Set the amount of resonance to the provided value and the release time to the provided value
        this.resonance = options.resonance;
        this.release = options.release;

        // Connect the Noise object to the LowpassCombFilter object, which is then connected to the output
        this._noise.connect(this._lfcf);
        this._lfcf.connect(this.output);
    }

    // Define a static method to return the default options for the PluckSynth class
    static getDefaults(): PluckSynthOptions {
        return deepMerge(Instrument.getDefaults(), {
            attackNoise: 1,
            dampening: 4000,
            resonance: 0.7,
            release: 1,
        });
    }

    /**
     * The dampening control. i.e. the lowpass filter frequency of the comb filter
     * @min 0
     * @max 7000
     */
        get dampening(): Frequency {
            return this._lfcf.dampening;
        }
        set dampening(fq) {
            this._lfcf.dampening = fq;
        }
    
        // Define a method to trigger the attack of a pluck sound with the given note and time
        triggerAttack(note: Frequency, time?: Time): this {
            // Convert the note to a frequency and the time to seconds
            const freq = this.toFrequency(note);
            time = this.toSeconds(time);
            // Calculate the delay amount based on the frequency
            const delayAmount = 1 / freq;
            // Set the delay time of the LowpassCombFilter to the delay amount
            this._lfcf.delayTime.setValueAtTime(delayAmount, time);
            // Start the Noise object
            this._noise.start(time);
            // Stop the Noise object after a certain amount of time based on the attackNoise value
            this._noise.stop(time + delayAmount * this.attackNoise);
            // Cancel any scheduled resonance changes and set the resonance to the pluck's resonance value
            this._lfcf.resonance.cancelScheduledValues(time);
            this._lfcf.resonance.setValueAtTime(this.resonance, time);
            return this;
        }
    
        /**
         * Ramp down the [[resonance]] to 0 over the duration of the release time.
         */
        // Define a method to trigger the release of a pluck sound
        triggerRelease(time?: Time): this {
            // Linearly ramp down the resonance to 0 over the duration of the release time
            this._lfcf.resonance.linearRampTo(0, this.release, time);
            return this;
        }
    
        // Override the dispose() method to clean up the objects used by the PluckSynth
        dispose(): this {
            super.dispose();
            this._noise.dispose();
            this._lfcf.dispose();
            return this;
        }
    }
    