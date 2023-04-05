// Create PluckSynth class.
// Initalise synth and get current time.
class WiiMapping {
    constructor() {
      this.plucky = new Tone.PluckSynth({
        'attackNoise': 0.1,
        'dampening': 100,
        'resonance': 0.95
      }).toDestination();
      this.now = Tone.now(); // Does not work - investigate. May not need though.
    }

    playTest(joy_X, joy_Y) {
      // North.
      if (106 <= joy_X && joy_X <= 146 && 206 <= joy_Y && joy_Y <= 246) {
        this.plucky.triggerAttack('C4');
      }
      
      // North-East.
      if (180 <= joy_X && joy_X <= 220 && 186 <= joy_Y && joy_Y <= 226) {
        this.plucky.triggerAttack('B3');
      }

      // East.
      if (206 <= joy_X && joy_X <= 246 && 106 <= joy_Y && joy_Y <= 146) {
        this.plucky.triggerAttack('G3');
      }

      // South-East.
      if (178 <= joy_X && joy_X <= 218 && 36 <= joy_Y && joy_Y <= 76) {
        this.plucky.triggerAttack('E3');
      }

      // South.
      if (106 <= joy_X && joy_X <= 146 && 8 <= joy_Y && joy_Y <= 48) {
        this.plucky.triggerAttack('C3');
      }

      // South-West.
      if (38 <= joy_X && joy_X <= 78 && 38 <= joy_Y && joy_Y <= 78) {
        this.plucky.triggerAttack('D3');
      }

      // West.
      if (6 <= joy_X && joy_X <= 46 && 106 <= joy_Y && joy_Y <= 146) {
        this.plucky.triggerAttack('F3');
      }

      // North-West.
      if (35 <= joy_X && joy_X <= 75 && 186 <= joy_Y && joy_Y <= 226) {
        this.plucky.triggerAttack('A3');
      }
    }
  }
  
  // Export class for use in main module.
  export { WiiMapping };