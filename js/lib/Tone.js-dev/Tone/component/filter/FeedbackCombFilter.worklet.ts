import "../../core/worklet/SingleIOProcessor.worklet";
import "../../core/worklet/DelayLine.worklet";
import { registerProcessor } from "../../core/worklet/WorkletGlobalScope";

export const workletName = "feedback-comb-filter";

const feedbackCombFilter = /* javascript */`
	class FeedbackCombFilterWorklet extends SingleIOProcessor {

		constructor(options) {
			super(options);
			this.delaySizeInSamples = Math.round(this.sampleRate / 40);	// Concert A.
			this.delayBufferIndex = 0;
			this.delayBuffer = new Float32Array(this.delaySizeInSamples);
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
			}];
		}

		generate(input, channel, parameters) {
			this.delayBuffer[this.delayBufferIndex] = input + parameters.feedback * (this.delayBuffer[this.delayBufferIndex] + this.delayBuffer[(this.delayBufferIndex + 1) % this.delaySizeInSamples]) / 2;
			const delayedSample = this.delayBuffer[this.delayBufferIndex];
			if (++this.delayBufferIndex >= this.delaySizeInSamples) {
				this.delayBufferIndex = 0;
			}
			return delayedSample;
		}
	}
`;

registerProcessor(workletName, feedbackCombFilter);