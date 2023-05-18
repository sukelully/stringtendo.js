import "../../core/worklet/SingleIOProcessor.worklet";
import "../../core/worklet/DelayLine.worklet";
import { registerProcessor } from "../../core/worklet/WorkletGlobalScope";

export const workletName = "feedback-comb-filter";

const feedbackCombFilter = /* javascript */`
	class FeedbackCombFilterWorklet extends SingleIOProcessor {

		constructor(options) {
			super(options);
			this.delayLine = new DelayLine(this.sampleRate, options.channelCount || 2);			// Standard.			
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
			// Calculate number of samples needed for desired pitch.
			const sampleIndex = parameters.delayTime * this.sampleRate;
			// Get the values of the current sample and next sample.
			const currentSample = this.delayLine.get(channel, sampleIndex);
			const nextSample = this.delayLine.get(channel, sampleIndex + 1);
			// Calculate average value of both samples.
			const average = ((currentSample + nextSample) / 2) % this.sampleRate;

			// Calculate value of sample to be added to delay line buffer.
			this.delayLine.push(channel, input + average * parameters.feedback);
			return currentSample;
		}
	}
`;

registerProcessor(workletName, feedbackCombFilter);