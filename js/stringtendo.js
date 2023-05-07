// Import serialHandler and harp objects.
import { serialHandler } from '/js/serial/serialHandler.js';
import { harp } from '/js/karplus-strong/harp.js';
import { bassHarp } from '/js/karplus-strong/bassHarp.js';
import { pluckSynth } from '/js/karplus-strong/pluckSynth.js';
import { bassPluckSynth } from '/js/karplus-strong/bassPluckSynth.js';

// Nunchuck parameters.
const nun1 = {  // Treble nunchuck.
  // Controller values.
  accX: 0,
  accY: 0,
  accZ: 0,
  butZ: 0,
  statButZ: 0,
  butC: 0,
  statButC: 0,
  joyX: 0,
  joyY: 0,

  // Rate of change values.
  initAccX: 0,
  initAccY: 0,
  initAccZ: 0,
  finAccX: 0,
  finAccY: 0,
  finAccZ: 0,
  accX_RoC: 0,
  accY_RoC: 0,
  accZ_RoC: 0,
  accAvgRoc: 0,
  timeIntervalRoC: 100,
  lastUpdateTime: 0
};

const nun2 = {  // Bass nunchuck.
  accX: 0,
  accY: 0,
  accZ: 0,
  butZ: 0,
  statButZ: 0,
  butC: 0,
  statButC: 0,
  joyX: 0,
  joyY: 0,

  initAccX: 0,
  initAccY: 0,
  initAccZ: 0,
  finAccX: 0,
  finAccY: 0,
  finAccZ: 0,
  accX_RoC: 0,
  accY_RoC: 0,
  accZ_RoC: 0,
  accAvgRoc: 0,
  timeIntervalRoC: 100,
  lastUpdateTime: 0
};

// Define a nunchuck class.
class Stringtendo {
  constructor() {
    // Get a reference to the container where serial messages will be displayed.
    this.serialMessagesContainer = document.getElementById('serial-messages-container');

    // Initialise the serialHandler and start listening for incoming messages.
    serialHandler.init().then(() => {
      this.nunchuckLoop(); // Start the process of reading serial messages.
    }).catch((error) => {
      console.error(error);
    });

    this.stringtendo = false;
    this.easyMode = true;
    this.lastExecutionTime = 0;

    // Stringtendo button listener.
    this.toggleSynthButton = document.getElementById('toggle-synth-button').addEventListener('click', (event) => {
      this.stringtendo = !this.stringtendo;

      if (this.stringtendo) {
        event.target.style.backgroundColor = '#04AA6D';

      } else {
          event.target.style.backgroundColor = '#b3b3b3';
      }
    });

    // Easy mode button listener.
    this.easyModeButton = document.getElementById('easy-mode-button').addEventListener('click', (event) => {
      this.easyMode = !this.easyMode;

      if (this.easyMode) {
        event.target.style.backgroundColor = '#04AA6D';

      } else {
          event.target.style.backgroundColor = '#b3b3b3';
      }
    });
  }

  // Pr// Provides controller functionality.
  // Extract controller data from serial message, listen for button presses and calculate rate of change.
  async nunchuckLoop() {
    try {
      // Read serial and split data into two variables.
      const data = await serialHandler.read();
      if (data.includes(";")) {
        const [data1, data2] = data.split(";");

        // Parse each variable into variables.
        const parsedNun1 = serialHandler.parseData(data1);
        // console.log(parsedNun1);
        const parsedNun2 = serialHandler.parseData(data2);
        // console.log(parsedNun2);

        // Assign local variables to global ones.
        nun1.accX = parsedNun1.accelX;
        nun1.accY = parsedNun1.accelY;
        nun1.accZ = parsedNun1.accelZ;
        nun1.butZ = parsedNun1.buttonZ;
        nun1.butC = parsedNun1.buttonC;
        nun1.joyX = parsedNun1.joyX;
        nun1.joyY = parsedNun1.joyY;
        // console.log(`nun1 c: ${nun1.butC}`);

        nun2.accX = parsedNun2.accelX;
        nun2.accY = parsedNun2.accelY;
        nun2.accZ = parsedNun2.accelZ;
        nun2.butZ = parsedNun2.buttonZ;
        nun2.butC = parsedNun2.buttonC;
        nun2.joyX = parsedNun2.joyX;
        nun2.joyY = parsedNun2.joyY;
        // console.log(`nun2 c: ${nun2.butC}`);
      }

      if (this.stringtendo) {
        // Calculate rate of change of both controllers.
        this.calcRateOfChange(nun1);
        this.calcRateOfChange(nun2);
      }

      if (this.easyMode) {
        if (this.stringtendo) {
          // C button is pressed.
          this.begStrPressC(nun1, nun2);
          this.pressZ(nun1, nun2);
        } else {
          this.begPressC(nun1, nun2);
        }
      } else {
        if (this.stringtendo) {
          // C button is pressed.
          this.strPressC(nun1);
          this.strPressC(nun2);
          this.pressZ(nun1, nun2);
        } else {
          this.pluckPressC(nun1);
          this.pluckPressC(nun2);
        }
      }

    setTimeout(() => {
        this.nunchuckLoop();
      }, 40);
    } catch (error) {
      console.error(error);
    }
  }

  // pluckSynth C is pressed.
  pluckPressC(nunchuck) {
    if (nunchuck.statButC == 0 && nunchuck.butC == 1) {
      if (nunchuck == nun1) pluckSynth.playHarp(nunchuck.joyX, nunchuck.joyY);
      if (nunchuck == nun2) bassPluckSynth.playHarp(nunchuck.joyX, nunchuck.joyY);
    }

    // Update the button C state.
    nunchuck.statButC = nunchuck.butC;
  }

  // Stringtendo C is pressed.
  strPressC(nunchuck) {
    // Check if value of C has changed from 0 to 1.
    if (nunchuck.statButC == 0 && nunchuck.butC == 1) {
      // Play note on harp if C button has changed from 0 to 1.
      const intensity = this.scaleIntensity(nunchuck.accAvgRoc);
      // console.log(`intensity: ${intensity}`)
      if (nunchuck == nun1) harp.playHarp(nunchuck.joyX, nunchuck.joyY, intensity);
      if (nunchuck == nun2) bassHarp.playHarp(nunchuck.joyX, nunchuck.joyY, intensity);      
      // console.log(nunchuck.accAvgRoc);
    }

    // Update the button C state.
    nunchuck.statButC = nunchuck.butC;
  }

  // 
  strHandleNote(nun1, note, octave, intensity) {
    var string1;
    var string2;

    if (octave == 4 && note == 'C') {
      octave = 4;
    } else {
      octave = 3;
    }

    if (nun1.statButC == 0 && nun1.butC == 1) {
      switch (note) {
        case 'C':
          string1 = '1';
          string2 = '1b';
        case 'D':
          string1 = '2';
          string2 = '2b';
        case 'E':
          string1 = '3';
          string2 = '3b';
        case 'F':
          string1 = '4';
          string2 = '4b';
        case 'G':
          string1 = '5';
          string2 = '5b';
        case 'A':
          string1 = '6';
          string2 = '6b';
        case 'B':
          string1 = '7';
          string2 = '7b';
        default:
          break
      }
      harp.swapString(`${string2}`, `${string1}`, `${note}${octave}`, intensity);
    }
  }

  begStrPressC(nun1, nun2) {
    const zones = [
      { xRange: [106, 146], yRange: [8, 48], notes: ['C', 'E', 'G', 'C', 'C'], bassNote: 'C2' },
      { xRange: [38, 78], yRange: [38, 78], notes: ['D', 'F', 'A', 'D', 'D'], bassNote: 'D2' },
      { xRange: [178, 218], yRange: [36, 76], notes: ['E', 'G', 'B', 'E', 'E'], bassNote: 'E2' },
      { xRange: [6, 46], yRange: [106, 146], notes: ['F', 'A', 'C', 'F', 'F'], bassNote: 'F2' },
      { xRange: [206, 246], yRange: [106, 146], notes: ['G', 'B', 'D', 'G', 'G'], bassNote: 'G2' },
      { xRange: [35, 75], yRange: [186, 226], notes: ['A', 'C', 'E', 'A', 'A'], bassNote: 'A2' },
      { xRange: [180, 220], yRange: [186, 226], notes: ['B', 'D', 'F', 'B', 'B'], bassNote: 'B2' },
      { xRange: [106, 146], yRange: [206, 246], notes: ['C', 'E', 'G', 'C', 'C'], bassNote: 'C3' }
    ];

    for (const zone of zones) {
      const intensity1 = this.scaleIntensity(nun1.accAvgRoc);
      const intensity2 = this.scaleIntensity(nun2.accAvgRoc);

      if (this.isInZone(nun2.joyX, nun2.joyY, ...zone.xRange, ...zone.yRange)) {
        const [noteS, noteW, noteE, noteN, randomNote] = zone.notes;

        if (this.isInZone(nun1.joyX, nun1.joyY, 106, 146, 8, 48))         this.strHandleNote(nun1, noteS, 3, intensity1);
        else if (this.isInZone(nun1.joyX, nun1.joyY, 6, 46, 106, 146))    this.strHandleNote(nun1, noteW, 3, intensity1);
        else if (this.isInZone(nun1.joyX, nun1.joyY, 206, 246, 106, 146)) this.strHandleNote(nun1, noteE, 3, intensity1);
        else if (this.isInZone(nun1.joyX, nun1.joyY, 106, 146, 206, 246)) this.strHandleNote(nun1, noteN, 4, intensity1);
        else this.strHandleNote(nun1, this.getRandomNote(randomNote), 3, intensity1);

        if (nun2.statButC == 0 && nun2.butC == 1) {
          bassHarp.playHarp(nun2.joyX, nun2.joyY, intensity2);
          console.log(nun2.accAvgRoc);
        }
        break;
      }
    }

    // Update the button C state.
    nun1.statButC = nun1.butC;
    nun2.statButC = nun2.butC;
  }

  isInZone(x, y, minX, maxX, minY, maxY) {
    return minX <= x && x <= maxX && minY <= y && y <= maxY;
  }

  handleNote(nun1, note, octave) {
    if (nun1.statButC == 0 && nun1.butC == 1) {
      pluckSynth.pluckSynth.triggerAttack(`${note}${octave}`);
    }
  }

  getRandomNote(scale) {
    const arpeggios = {
    C: ['C', 'E', 'G'],
    D: ['D', 'F', 'A'],
    E: ['E', 'G', 'B'],
    F: ['F', 'A', 'C'],
    G: ['G', 'B', 'D'],
    A: ['A', 'C', 'E'],
    B: ['B', 'D', 'F']
    };
    const letters = arpeggios[scale];
    const randomIndex = Math.floor(Math.random() * letters.length);
    return letters[randomIndex];
  }

  begPressC(nun1, nun2) {
    const zones = [
      { xRange: [106, 146], yRange: [8, 48], notes: ['C', 'E', 'G', 'C', 'C'], bassNote: 'C2' },
      { xRange: [38, 78], yRange: [38, 78], notes: ['D', 'F', 'A', 'D', 'D'], bassNote: 'D2' },
      { xRange: [178, 218], yRange: [36, 76], notes: ['E', 'G', 'B', 'E', 'E'], bassNote: 'E2' },
      { xRange: [6, 46], yRange: [106, 146], notes: ['F', 'A', 'C', 'F', 'F'], bassNote: 'F2' },
      { xRange: [206, 246], yRange: [106, 146], notes: ['G', 'B', 'D', 'G', 'G'], bassNote: 'G2' },
      { xRange: [35, 75], yRange: [186, 226], notes: ['A', 'C', 'E', 'A', 'A'], bassNote: 'A2' },
      { xRange: [180, 220], yRange: [186, 226], notes: ['B', 'D', 'F', 'B', 'B'], bassNote: 'B2' },
      { xRange: [106, 146], yRange: [206, 246], notes: ['C', 'E', 'G', 'C', 'C'], bassNote: 'C3' }
    ];

    for (const zone of zones) {
      if (this.isInZone(nun2.joyX, nun2.joyY, ...zone.xRange, ...zone.yRange)) {
        // const [noteS, noteSW, noteW, noteNW, noteN, noteNE, noteE, noteSE, randomNote] = zone.notes;
        const [noteS, noteW, noteE, noteN, randomNote] = zone.notes;

        if (this.isInZone(nun1.joyX, nun1.joyY, 106, 146, 8, 48))         this.handleNote(nun1, noteS, 3);  // S.
        else if (this.isInZone(nun1.joyX, nun1.joyY, 6, 46, 106, 146))    this.handleNote(nun1, noteW, 3);  // W.
        else if (this.isInZone(nun1.joyX, nun1.joyY, 206, 246, 106, 146)) this.handleNote(nun1, noteE, 3);  // E.
        else if (this.isInZone(nun1.joyX, nun1.joyY, 106, 146, 206, 246)) this.handleNote(nun1, noteN, 3);  // N.
        else this.handleNote(nun1, this.getRandomNote(randomNote), 3);

        if (nun2.statButC == 0 && nun2.butC == 1) {
          bassPluckSynth.pluckSynth.triggerAttack(zone.bassNote);
        }
        break;
      }
    }

    // Update the button C state.
    nun1.statButC = nun1.butC;
    nun2.statButC = nun2.butC;
  }

  pressZ(nun1, nun2) {
    if (nun1.statButZ == 0 && nun1.butZ == 1) {
      harp.muteStrings();
    } else if (nun2.statButZ == 0 && nun2.butZ == 1) {
      bassHarp.muteStrings();
    }
  }

  calcRateOfChange(nunchuck) {
    const currentTime = performance.now();

    // Calculate the rate of change of all three accelerometer values
    nunchuck.accX_RoC = (nunchuck.accX - nunchuck.initAccX);
    nunchuck.accY_RoC = (nunchuck.accY - nunchuck.initAccY);
    nunchuck.accZ_RoC = (nunchuck.accZ - nunchuck.initAccZ);
    nunchuck.accAvgRoc = (nunchuck.accX_RoC + nunchuck.accY_RoC + nunchuck.accZ_RoC) / 3;

    // Update initial values if 100ms has elapsed since last update
    if (currentTime - nunchuck.lastUpdateTime >= 100) {
        nunchuck.initAccX = nunchuck.accX;
        nunchuck.initAccY = nunchuck.accY;
        nunchuck.initAccZ = nunchuck.accZ;
        nunchuck.lastUpdateTime = currentTime;
    }

    if (nunchuck.accAvgRoc < 0) nunchuck.accAvgRoc *= -1;
}

  // Scales the average rate of change of all accelerometer values
  // to be in a suitable range for the frequency of the loop filter.
  // High 500.
  // Low 0.
  scaleIntensity(RoC) {
    // if (RoC < 20) RoC = 20;
    return (RoC / 500) * 8000 + 500;
  }
}

// Create nunchuck object.
const stringtendo = new Stringtendo();