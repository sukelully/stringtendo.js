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
  timeIntervalRoC: 100
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
  timeIntervalRoC: 100
};

// Define a nunchuck class.
class Nunchuck {
  constructor() {
    // Get a reference to the container where serial messages will be displayed.
    this.serialMessagesContainer = document.getElementById('serial-messages-container');

    // Initialise the serialHandler and start listening for incoming messages.
    serialHandler.init().then(() => {
      this.nunchuckLoop(); // Start the process of reading serial messages.
    }).catch((error) => {
      console.error(error);
    });

    this.stringTest = new String();
    this.stringtendo = false;

    // Event listener to play a note when clicking outside of buttons and sliders.
    document.addEventListener('mousedown', (event) => {
      if (event.target.matches('button') || event.target.matches('input[type="range"]'))  {
          return; // Return early if a button or slider is clicked.
      }
      this.stringTest.pluckString();
      console.log("string 4 pluck");
    });

    this.toggleSynthButton = document.getElementById('toggle-synth-button').addEventListener('click', (event) => {

    });
  }

  // Provides controller functionality.
  // Extract controller data from serial message, listen for button presses and calculate rate of change.
  async nunchuckLoop() {
    try {
      // Read serial data when it is received.
      const message = await serialHandler.read();
      
      // Create new list item to display data.
      const displayedData = document.createElement('li');

      // Pattern match the incoming message to extract the Nunchuck's controller parameter values.
      const pattern = /X1: ([^ ]+) +Y1: ([^ ]+) +Z1: ([^ ]+)+button_Z1: ([^ ]+) +button_C1: ([^ ]+)+Joy1: ([^ ]+) ([^ )]+)X2: ([^ ]+) +Y2: ([^ ]+) +Z2: ([^ ]+)+button_Z2: ([^ ]+) +button_C2: ([^ ]+)+Joy2: ([^ ]+) ([^ )]+)/;
      const matches = message.match(pattern);
      if (matches) {
        // Create a new string with the pattern matched values.
        const newMessage = `accX1: ${matches[1]} accY1: ${matches[2]} accZ1: ${matches[3]} buttonZ1: ${matches[4]} buttonC1: ${matches[5]} Joy1: ${matches[6]}, ${matches[7]} 
        accX2: ${matches[8]} accY2: ${matches[9]} accZ2: ${matches[10]}buttonZ2: ${matches[11]} buttonC2: ${matches[12]} Joy2: ${matches[13]}, ${matches[14]}`;
        // Assign pattern matched values to global variables.
        nun1.accX = `${matches[1]}`;
        nun1.accY = `${matches[2]}`;
        nun1.accZ = `${matches[3]}`;
        nun1.butZ = `${matches[4]}`;
        nun1.butC = `${matches[5]}`;
        nun1.joyX = `${matches[6]}`;
        nun1.joyY = `${matches[7]}`;

        nun2.accX = `${matches[8]}`;
        nun2.accY = `${matches[9]}`;
        nun2.accZ = `${matches[10]}`;
        nun2.butZ = `${matches[11]}`;
        nun2.butC = `${matches[12]}`;
        nun2.joyX = `${matches[13]}`;
        nun2.joyY = `${matches[14]}`;

        if (this.stringtendo == true) {
          // Calculate rate of change of both controllers.
          this.calcRateOfChange(nun1, matches);        
          this.calcRateOfChange(nun2, matches);

          // RoC debugging.
          // console.log(`avgRoC: ${nun2.accAvgRoc}`);
          // console.log(`X_RoC: ${nun2.accX_RoC}`);
          // console.log(`Y_RoC: ${nun2.accY_RoC}`);
          // console.log(`Z_RoC: ${nun2.accZ_RoC}`);
        }

        // Display the data.
        displayedData.innerText = newMessage; // Set the text of the list item to the new message.
        // displayedData.innerText = nun1.accX;
        this.serialMessagesContainer.innerHTML = ''; // Clear the container.
        this.serialMessagesContainer.appendChild(displayedData); // Add the list item to the container.
      }

      if (this.stringtendo == true) {
        // C button is pressed.
        this.strPressC(nun1);
        this.strPressC(nun2);
        // this.begPressC();
      } else {
        this.pluckPressC(nun1);
        this.pluckPressC(nun2);
      }

      // Set a timeout to call this function again after 10 milliseconds.
      // (Arduino code is also ran every 10 milliseconds).
      setTimeout(() => {
        this.nunchuckLoop();
      }, 10);
    } catch (error) {
      console.error(error);
    }
  }

   // Calculates the rate of change of an accelerometer by averaging the rate of change of the
  // three axes of an accelerometer over 100ms.
  calcRateOfChange(nunchuck, matches) {
    // Get initial values every 100ms.
    setTimeout(() => {
      nunchuck.initAccX = nunchuck.accX;
      nunchuck.initAccY = nunchuck.accY;
      nunchuck.initAccZ = nunchuck.accY;
    }, 100);

    // Calculate the rate of change of all three accelerometer values over 100ms.
    setTimeout(() => {
      if (nunchuck == nun1) {
        nunchuck.finAccX = parseFloat(matches[1]);
        nunchuck.finAccY = parseFloat(matches[2]);
        nunchuck.finAccZ = parseFloat(matches[3]);
      } else {
        nunchuck.finAccX = parseFloat(matches[8]);
        nunchuck.finAccY = parseFloat(matches[9]);
        nunchuck.finAccZ = parseFloat(matches[10]);
      }
      nunchuck.accX_RoC = (nunchuck.finAccX - nunchuck.initAccX); // if (nunchuck.accX_RoC < 0 ) nunchuck.accX_RoC *= -1;
      nunchuck.accY_RoC = (nunchuck.finAccY - nunchuck.initAccY); //  if (nunchuck.accY_RoC < 0 ) nunchuck.accY_RoC *= -1;
      nunchuck.accZ_RoC = (nunchuck.finAccZ - nunchuck.initAccZ); //  if (nunchuck.accZ_RoC < 0 ) nunchuck.accZ_RoC *= -1;
      nunchuck.accAvgRoc = (nunchuck.accX_RoC + nunchuck.accY_RoC + nunchuck.accZ_RoC) / 3;
      nunchuck.timeIntervalRoC = 100;
    }, nunchuck.timeIntervalRoC);
  }

  // Scales the average rate of change of all accelerometer values
  // to be in a suitable range for the frequency of the loop filter.
  scaleIntensity(RoC) {
    // console.log(`RoC: ${RoC}`);
    const m = (7000 - 1000) / 300;
    const c = 1000 - m * 1;
    return m * RoC + c;
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

      // Resets rate of change values after string has been plucked
      // so that plucking intensity drops quickly after stopping movement.
      nunchuck.initAccX = 0;
      nunchuck.initAccY = 0;
      nunchuck.initAccZ = 0;
      nunchuck.finAccX = 0;
      nunchuck.finAccY = 0;
      nunchuck.finAccZ = 0;
      nunchuck.accX_RoC = 0;
      nunchuck.accY_RoC = 0;
      nunchuck.accZ_RoC = 0;
      nunchuck.accAvgRoc = 0;
      nunchuck.timeIntervalRoC = 10;
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