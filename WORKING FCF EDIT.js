import "../../core/worklet/SingleIOProcessor.worklet";
import "../../core/worklet/DelayLine.worklet";
import { registerProcessor } from "../../core/worklet/WorkletGlobalScope";

export const workletName = "feedback-comb-filter";

const feedbackCombFilter = /* javascript */`
	class FeedbackCombFilterWorklet extends SingleIOProcessor {

constructor(options) {
			super(options);
			this.frequency = 65.41		// C2.
			this.delaySizeInSamples = Math.round((this.sampleRate / this.frequency) * 2);			// Modified.
			this.bufferIndex = 0;
			this.delayLineBuffer = new Float32Array(this.delaySizeInSamples);
		}

		static get parameterDescriptors() {
			return [{
				name: "delayTime",
				defaultValue: 0.1,
				minValue: 0,
				maxValue: 1,
				automationRate: "k-rate"
			}, {
				name: "feedback",
				defaultValue: 0.5,
				minValue: 0,
				maxValue: 0.9999,
				automationRate: "k-rate"
			}];d
		}

		generate(input, channel, parameters) {
			// Calculate delayed sample and store it
			// in the delay buffer at the current index.
			this.delayLineBuffer[this.bufferIndex] = input + parameters.feedback * (this.delayLineBuffer[this.bufferIndex] + this.delayLineBuffer[(this.bufferIndex + 1) % this.delaySizeInSamples]) / 2;
			// Retrieve delayed sample from delay buffer.
			const delayedSample = this.delayLineBuffer[this.bufferIndex];
			// Increment buffer index and handle wrapping around.
			if (++this.bufferIndex >= this.delaySizeInSamples) {
				this.bufferIndex = 0;
			}
			return delayedSample;
			}
	}
`;

registerProcessor(workletName, feedbackCombFilter);