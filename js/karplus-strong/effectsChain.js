class EffectsChain {
    constructor() {
        this.filter = new Tone.Filter({
            frequency: 2000,
            type: 'lowpass',
            rolloff: -12
        });
        this.filterIsConnected = false;
        this.delay = new Tone.FeedbackDelay({
            delayTime: 0.3,
            feedback: 0.6
        });
        this.delayIsConnected = false;
        this.reverb = new Tone.Reverb({
            delayTime: 20,
            wet: 0.5
        });
        this.reverbIsConnected = true;

        this.output = new Tone.getDestination();
    }

    // toggleFilter(inputNode, outputNode) {
    //     if (!this.filterIsConnected && !this.delayIsConnected && !this.reverbIsConnected) {
    //         inputNode.connect(this.filter);
    //         this.filter.connect(outputNode);
    //     } else if (!this.filterIsConnected && this.delayIsConnected && !this.reverbIsConnected) {
    //         inputNode.connect(this.filter);
    //         this.filter.connect(this.delay);
    //     }
    // }

    connectNodes(inputNode, sourceNode, outputNode) {
        inputNode.disconnect();
        inputNode.connect(sourceNode);
        sourceNode.connect(outputNode);
    }

    connectOutput(inputNode, outputNode) {
        inputNode.connect(outputNode);
    }

    toggleFilter(inputNode, outputNode) {
        if (this.filterIsConnected) {
            this.filter.disconnect();
            if (!this.delayIsConnected && !this.reverbIsConnected) {
                this.connectOutput(inputNode, outputNode);
            } else if (this.delayIsConnected && !this.reverbIsConnected) {
                this.connectNodes(inputNode, this.delay, outputNode);
            } else if (!this.delayIsConnected && this.reverbIsConnected) {
                this.connectNodes(inputNode, this.reverb, outputNode);
            } else {
                this.connectNodes(inputNode, this.delay, this.reverb);
            }
        } else {
            if (!this.delayIsConnected && !this.reverbIsConnected) {
                this.connectNodes(inputNode, this.filter, outputNode);
            } else if (this.delayIsConnected && !this.reverbIsConnected) {
                this.connectNodes(inputNode, this.filter, this.delay);
            } else if (!this.delayIsConnected && this.reverbIsConnected) {
                this.connectNodes(inputNode, this.filter, this.reverb);
            } else {
                this.connectNodes(inputNode, this.filter, this.delay);
                this.delay.connect(this.reverb);
            }
        }
    }

    toggleDelay(inputNode, outputNode) {
        if (this.delayIsConnected) {
            this.delay.disconnect();
            if (!this.filterIsConnected && !this.reverbIsConnected) {
                this.connectOutput(inputNode, outputNode);
            } else if (this.filterIsConnected && !this.reverbIsConnected) {
                this.connectNodes(inputNode, this.filter, outputNode);
            } else if (!this.filterIsConnected && this.reverbIsConnected) {
                this.connectNodes(inputNode, this.reverb, outputNode);
            } else {
                this.connectNodes(inputNode, this.filter, this.reverb);
            }
        } else {
            if (!this.filterIsConnected && !this.reverbIsConnected) {
                inputNode.connect(outputNode);
                this.connectNodes(inputNode, this.delay, outputNode);
            } else if (this.filterIsConnected && !this.reverbIsConnected) {
                this.connectNodes(inputNode, this.filter, this.delay);
            } else if (!this.filterIsConnected && this.reverbIsConnected) {
                this.connectNodes(inputNode, this.delay, this.reverb);
            } else {
                this.connectNodes(inputNode, this.filter, this.delay);
                this.delay.connect(this.reverb);
            }
        }
    }

    toggleReverb(inputNode, outputNode) {
        if (this.reverbIsConnected) {
            this.reverb.disconnect();
            if (!this.filterIsConnected && !this.delayIsConnected) {
                this.connectOutput(inputNode, outputNode);
            } else if (this.filterIsConnected && !this.delayIsConnected) {
                this.connectNodes(inputNode, this.filter, outputNode);
            } else if (!this.filterIsConnected && this.delayIsConnected) {
                this.connectNodes(inputNode, this.delay, outputNode);
            } else {
                this.connectNodes(inputNode, this.filter, this.delay);
            }
        } else {
            if (!this.filterIsConnected && !this.delayIsConnected) {
                this.connectNodes(inputNode, this.reverb, outputNode);
            } else if (this.filterIsConnected && !this.delayIsConnected) {
                this.connectNodes(inputNode, this.filter, this.reverb);
            } else if (!this.filterIsConnected && this.delayIsConnected) {
                this.connectNodes(inputNode, this.delay, this.reverb);
            } else {
                this.connectNodes(inputNode, this.filter, this.delay);
                this.delay.connect(this.reverb);
            }
        }
    }
}

export { EffectsChain }