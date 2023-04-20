class EffectsChain {
    constructor() {
        this.delay = new Tone.FeedbackDelay({
            delayTime: 0.3,
            feedback: 0.6
        });
        this.delayIsConnected = false;
        this.reverb = new Tone.Reverb({
            delayTime: 20,
            wet: 1
        });
        this.reverbIsConnected = true;
    }

    toggleReverb(inputNode, outputNode) {
        if (this.reverbIsConnected == false) {
            inputNode.connect(this.reverb);
            this.reverb.connect(outputNode);
        } else {
            this.reverb.disconnect();
            inputNode.connect(outputNode);
        }
    }

    toggleDelay(inputNode, outputNode) {
        if (this.reverbIsConnected == true) {
            if (this.delayIsConnected == false) {
                inputNode.connect(this.delay);
                this.delay.connect(this.reverb);
            } else {
                this.delay.disconnect();
                inputNode.connect(this.reverb);
            }
        } else {
            if (this.delayIsConnected == false) {
                inputNode.connect(this.delay);
                this.delay.connect(outputNode);
            } else {
                this.delay.disconnect();
                inputNode.connect(outputNode);
            }
        }
    }
}

export { EffectsChain }