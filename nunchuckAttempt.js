// Import serialHandler and harp objects.
import { serialHandler } from '/js/serialHandler.js';
import { harp } from '/js/harp.js';
import { bassHarp } from '/js/bassHarp.js';
import { pluckSynth } from '/js/pluckSynth.js';
import { bassPluckSynth } from '/js/bassPluckSynth.js';
import { String } from '/js/string.js';

// Nunchuck parameters.
const nun1 = {  // Treble nunchuck.
  // Controller values.
  accX: 0,
  accY: 0,
  accZ: 0,
  butZ: 0,
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
class Nunchuck {
  constructor() {
    // Get a reference to the container where serial messages will be displayed.
    this.serialMessagesContainer = document.getElementById('serial-messages-container');

    // Buffer to store the incoming serial data
    this.serialBuffer = '';

    // Initialise the serialHandler and start listening for incoming messages.
    serialHandler.init().then(() => {
      this.nunchuckLoop(); // Start the process of reading serial messages.
    }).catch((error) => {
      console.error(error);
    });

    this.stringTest = new String();
    this.stringtendo = false;
    this.serialDisplay = true;
    this.lastExecutionTime = 0;

    // Event listener to play a note when clicking outside of buttons and sliders.
    document.addEventListener('mousedown', (event) => {
      if (event.target.matches('button') || event.target.matches('input[type="range"]'))  {
          return; // Return early if a button or slider is clicked.
      }
      this.stringTest.pluckString();
      console.log("string 4 pluck");
    });

    // Display serial messages if true.
    if (this.serialDisplay) {
      document.querySelector('.element').style.display = 'block';
    } else {
      document.querySelector('.element').style.display = 'none';
    }

    this.toggleSynthButton = document.getElementById('toggle-synth-button').addEventListener('click', (event) => {
      this.stringtendo = !this.stringtendo;

      if (this.stringtendo) {
        event.target.style.backgroundColor = '#04AA6D';

      } else {
          event.target.style.backgroundColor = '#b3b3b3';
      }
    });
  }
  
  async nunchuckLoop() {
    try {
      // Read serial data when it is received.
      const matches = await this.readSerialData();
  
      // Update the values and remove the matched message from the buffer.
      this.updateValues(matches);
      this.serialBuffer = this.serialBuffer.slice(matches[0].length);
  
      // Update the RoC calculations and button presses.
      this.calcRateOfChange(nun1);
      this.calcRateOfChange(nun2);
  
      if (this.stringtendo) {
        // C button is pressed.
        this.strPressC(nun1);
        this.strPressC(nun2);
      } else {
        this.pluckPressC(nun1);
        this.pluckPressC(nun2);
      }
  
      setTimeout(() => {
        this.nunchuckLoop();
      }, 25);
    } catch (error) {
      console.error(error);
    }
  }  

updateValues(matches) {
  // Assign pattern matched values to global variables.
  nun1.accX = matches[1];
  nun1.accY = matches[2];
  nun1.accZ = matches[3];
  nun1.butZ = matches[4];
  nun1.butC = matches[5];
  nun1.joyX = matches[6];
  nun1.joyY = matches[7];

  nun2.accX = matches[8];
  nun2.accY = matches[9];
  nun2.accZ = matches[10];
  nun2.butZ = matches[11];
  nun2.butC = matches[12];
  nun2.joyX = matches[13];
  nun2.joyY = matches[14];

  // Update the displayed data only if there's a change in the data.
  const newMessage = `accX1: ${nun1.accX} accY1: ${nun1.accY} accZ1: ${nun1.accZ} buttonZ1: ${nun1.butZ} buttonC1: ${nun1.butC} Joy1: ${nun1.joyX}, ${nun1.joyY}
  accX2: ${nun2.accX} accY2: ${nun2.accY} accZ2: ${nun2.accZ} buttonZ2: ${nun2.butZ} buttonC2: ${nun2.butC} Joy2: ${nun2.joyX}, ${nun2.joyY}`;

  if (this.serialMessagesContainer.textContent !== newMessage) {
    this.serialMessagesContainer.textContent = newMessage;
  }
}

async readSerialData() {
  return new Promise(async (resolve) => {
    while (true) {
      try {
        const data = await serialHandler.read();
        this.serialBuffer += data;

        // Check if there's a complete message in the buffer.
        const pattern = /^([-\d]+),([-\d]+),([-\d]+),([-\d]+),([-\d]+),([-\d]+),([-\d]+)\r\n([-\d]+),([-\d]+),([-\d]+),([-\d]+),([-\d]+),([-\d]+),([-\d]+)/;
        const matches = this.serialBuffer.match(pattern);

        if (matches) {
          resolve(matches);
          break;
        }
      } catch (error) {
        console.error(error);
      }
    }
  });
}

  calcRateOfChange(nunchuck) {
    const currentTime = performance.now();
    
    // Update initial values if 100ms has elapsed since last update
    if (currentTime - nunchuck.lastUpdateTime >= 100) {
      nunchuck.initAccX = nunchuck.accX;
      nunchuck.initAccY = nunchuck.accY;
      nunchuck.initAccZ = nunchuck.accZ;
      nunchuck.lastUpdateTime = currentTime;
    }
  
    // Calculate the rate of change of all three accelerometer values
    nunchuck.accX_RoC = (nunchuck.accX - nunchuck.initAccX);
    nunchuck.accY_RoC = (nunchuck.accY - nunchuck.initAccY);
    nunchuck.accZ_RoC = (nunchuck.accZ - nunchuck.initAccZ);
    nunchuck.accAvgRoc = (nunchuck.accX_RoC + nunchuck.accY_RoC + nunchuck.accZ_RoC) / 3;
    if (nunchuck.accAvgRoc < 0) nunchuck.accAvgRoc *= -1;
    // console.log(nunchuck.accAvgRoc);
  }

  // Scales the average rate of change of all accelerometer values
  // to be in a suitable range for the frequency of the loop filter.
  // High 500.
  // Low 0.
  scaleIntensity(RoC) {
    return (RoC / 500) * 8000 + 1000;
  }

  pluckPressC(nunchuck) {
    if (nunchuck.statButC == 0 && nunchuck.butC == 1) {
      if (nunchuck == nun1) pluckSynth.playHarp(nunchuck.joyX, nunchuck.joyY);
      if (nunchuck == nun2) bassPluckSynth.playHarp(nunchuck.joyX, nunchuck.joyY);
    }

    // Update the button C state.
    nunchuck.statButC = nunchuck.butC;
  }

  // C button is pressed.
  strPressC(nunchuck) {
    // Check if value of C has changed from 0 to 1.
    if (nunchuck.statButC == 0 && nunchuck.butC == 1) {
      // Play note on harp if C button has changed from 0 to 1.
      const intensity = this.scaleIntensity(nunchuck.accAvgRoc);
      // console.log(`intensity: ${intensity}`)
      // console.log(intensity);
      if (nunchuck == nun1) harp.playHarp(nunchuck.joyX, nunchuck.joyY, intensity);
      if (nunchuck == nun2) bassHarp.playHarp(nunchuck.joyX, nunchuck.joyY, intensity);      
      // console.log(nunchuck.accAvgRoc);
    }

    // Update the button C state.
    nunchuck.statButC = nunchuck.butC;
  }

  begPressC() {
    if (106 <= nun1.joyX && nun1.joyX <= 146 && 8 <= nun1.joyY && nun1.joyY <= 48) {        // South.
      console.log("bass south");
      if (106 <= nun2.joyX && nun2.joyX <= 146 && 8 <= nun2.joyY && nun2.joyY <= 48) {        // South.
        console.log("treble south");
        if (nun1.statButC == 0 && nun1.butC == 1) {
          const intensity = this.scaleIntensity(nun2.accAvgRoc);
          harp.playHarp(nun2.joyX, nun2.joyY, intensity);
        }
      }
    }
  }
}

// Create nunchuck object.
const nunchuck = new Nunchuck();

/*
// Provides controller functionality.
// Extract controller data from serial message, listen for button presses and calculate rate of change.
async nunchuckLoop() {
  try {
    // Read serial data when it is received.
    const message = await serialHandler.read();

    // Pattern match the incoming message to extract the Nunchuck's controller parameter values.
    const pattern = /^([-\d]+),([-\d]+),([-\d]+),([-\d]+),([-\d]+),([-\d]+),([-\d]+)\r\n([-\d]+),([-\d]+),([-\d]+),([-\d]+),([-\d]+),([-\d]+),([-\d]+)/;
    const matches = message.match(pattern);
    if (matches) {
      // Assign pattern matched values to global variables.
      nun1.accX = matches[1];
      nun1.accY = matches[2];
      nun1.accZ = matches[3];
      nun1.butZ = matches[4];
      nun1.butC = matches[5];
      nun1.joyX = matches[6];
      nun1.joyY = matches[7];

      nun2.accX = matches[8];
      nun2.accY = matches[9];
      nun2.accZ = matches[10];
      nun2.butZ = matches[11];
      nun2.butC = matches[12];
      nun2.joyX = matches[13];
      nun2.joyY = matches[14];

      // Update the displayed data only if there's a change in the data.
      const newMessage = `accX1: ${nun1.accX} accY1: ${nun1.accY} accZ1: ${nun1.accZ} buttonZ1: ${nun1.butZ} buttonC1: ${nun1.butC} Joy1: ${nun1.joyX}, ${nun1.joyY}
      accX2: ${nun2.accX} accY2: ${nun2.accY} accZ2: ${nun2.accZ} buttonZ2: ${nun2.butZ} buttonC2: ${nun2.butC} Joy2: ${nun2.joyX}, ${nun2.joyY}`;

      if (this.serialMessagesContainer.textContent !== newMessage) {
        this.serialMessagesContainer.textContent = newMessage;
      }
    }

    if (this.stringtendo == true) {
      // Calculate rate of change of both controllers.
      this.calcRateOfChange(nun1, matches);
      this.calcRateOfChange(nun2, matches);
    }

    // Update the RoC calculations and button presses.
    this.calcRateOfChange(nun1);
    this.calcRateOfChange(nun2);

    if (this.stringtendo) {
      // C button is pressed.
      this.strPressC(nun1);
      this.strPressC(nun2);
    } else {
      this.pluckPressC(nun1);
      this.pluckPressC(nun2);
    }

    setTimeout(() => {
      this.nunchuckLoop();
    }, 10);
  } catch (error) {
    console.error(error);
  }
}
*/