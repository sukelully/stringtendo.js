import "../../core/worklet/SingleIOProcessor.worklet";
import "../../core/worklet/DelayLine.worklet";
import { registerProcessor } from "../../core/worklet/WorkletGlobalScope";

export const workletName = "feedback-comb-filter";

const feedbackCombFilter = /* javascript */`
	class FeedbackCombFilterWorklet extends SingleIOProcessor {

		constructor(options) {
			super(options);
			// this.frequency = 65.41			// C2.
			this.frequency = 130.81		// C3.
			// this.frequency = 261.63;		// C4.
			this.bufferIndex = 0;
			this.bufferSize = Math.round((this.sampleRate / this.frequency) * 2);
			// this.delayLine = new Float32Array(this.bufferSize);							// Modified.
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

		// // Modified.
		// generate(input, channel, parameters) {
		// 	// Calculate delayed sample and store it
		// 	// in the delay buffer at the current index.
		// 	this.delayLine[this.bufferIndex] = input + parameters.feedback * (this.delayLine[this.bufferIndex] + this.delayLine[(this.bufferIndex + 1) % this.bufferSize]) / 2;
		// 	// Retrieve delayed sample from delay buffer.
		// 	const delayedSample = this.delayLine[this.bufferIndex];
		// 	// Increment buffer index and handle wrapping around.
		// 	if (++this.bufferIndex >= this.bufferSize) {
		// 		this.bufferIndex = 0;
		// 	}
		// 	return delayedSample;
		// }

		// Mod standard.
		generate(input, channel, parameters) {
			const sampleIndex = parameters.delayTime * this.sampleRate;
			const currentSample = this.delayLine.get(channel, sampleIndex);
			const nextSample = this.delayLine.get(channel, sampleIndex + 1);
			const average = ((currentSample + nextSample) / 2) % this.sampleRate;
			
			this.delayLine.push(channel, input + average * parameters.feedback);
			return currentSample;
		}

		// Original.
		// generate(input, channel, parameters) {
		// 	const delayedSample = this.delayLine.get(channel, parameters.delayTime * this.sampleRate);
		// 	this.delayLine.push(channel, input + delayedSample * parameters.feedback);
		// 	return delayedSample;
		// }
	}
`;

registerProcessor(workletName, feedbackCombFilter);