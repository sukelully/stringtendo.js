// Import serialHandler and harp objects.
import { serialHandler } from '/js/serialHandler.js';
import { harp } from '/js/harp.js'

// Controller variables.
var accX1 = 0;
var accY1 = 0;
var accZ1 = 0;
var buttonZ1 = 0;
var buttonC1= 0;
var joyX1 = 0;
var joyY1 = 0;

var accX2 = 0;
var accY2 = 0;
var accZ2 = 0;
var buttonZ2 = 0;
var buttonC2= 0;
var joyX2 = 0;
var joyY2 = 0;

// Rate of change variables.
var initialAccX1 = 0;
var initialAccY1 = 0;
var initialAccZ1 = 0;
var finalAccX1 = 0;
var finalAccY1 = 0;
var finalAccZ1 = 0;
var accX1_RoC = 0;
var accY1_RoC = 0;
var accZ1_RoC = 0;
var acc1AvgRoc = 0;
var timeIntervalRoC = 100;

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

    // Initialize the button_C state to 0.
    this.button_C_state = 0;
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
      // const pattern = /X1: ([^ ]+) +Y1: ([^ ]+) +Z1: ([^ ]+)+button_Z1: ([^ ]+) +button_C1: ([^ ]+)+Joy1: \(([^,]+), ([^)]+)\)/; //+X2: ([^ ]+)/;
      // const pattern = /X1: ([^ ]+) +Y1: ([^ ]+) +Z1: ([^ ]+)+button_Z1: ([^ ]+) +button_C1: ([^ ]+)+Joy1: ([^ ]+) ([^ )]+)+X2: ([^ ]+)/;
      const pattern = /X1: ([^ ]+) +Y1: ([^ ]+) +Z1: ([^ ]+)+button_Z1: ([^ ]+) +button_C1: ([^ ]+)+Joy1: ([^ ]+) ([^ )]+)X2: ([^ ]+) +Y2: ([^ ]+) +Z2: ([^ ]+)+button_Z2: ([^ ]+) +button_C2: ([^ ]+)+Joy2: ([^ ]+) ([^ )]+)/;
      const matches = message.match(pattern);
      if (matches) {
        // Create a new string with the pattern matched values.
        const newMessage = `accX1: ${matches[1]} accY1: ${matches[2]} accZ1: ${matches[3]} buttonZ1: ${matches[4]} buttonC1: ${matches[5]} Joy1: ${matches[6]}, ${matches[7]} 
        accX2: ${matches[8]} accY2: ${matches[9]} accZ2: ${matches[10]}buttonZ2: ${matches[11]} buttonC2: ${matches[12]} Joy2: ${matches[13]}, ${matches[14]}`;
        // Assign pattern matched values to global variables.
        accX1 = `${matches[1]}`;
        accY1 = `${matches[2]}`;
        accZ1 = `${matches[3]}`;
        buttonZ1 = `${matches[4]}`;
        buttonC1 = `${matches[5]}`;
        joyX1 = `${matches[6]}`;
        joyY1 = `${matches[7]}`;

        accX2 = `${matches[8]}`;
        accY2 = `${matches[9]}`;
        accZ2 = `${matches[10]}`;
        buttonZ2 = `${matches[11]}`;
        buttonC2 = `${matches[12]}`;
        joyX2 = `${matches[13]}`;
        joyY2 = `${matches[14]}`;

        // Get initial values every 100ms.
        setTimeout(() => {
          initialAccX1 = accX1;
          initialAccY1 = accY1;
          initialAccZ1 = accZ1;
        }, 300);

        // Calculate the rate of change of all three accelerometer values over 100ms.
        setTimeout(() => {
          finalAccX1 = parseFloat(matches[1]);
          finalAccY1 = parseFloat(matches[2]);
          finalAccZ1 = parseFloat(matches[3]);
          accX1_RoC = (finalAccX1 - initialAccX1);   if (accX1_RoC < 0 ) accX1_RoC *= -1;
          accY1_RoC = (finalAccY1 - initialAccY1);   if (accY1_RoC < 0 ) accY1_RoC *= -1;
          accZ1_RoC = (finalAccZ1 - initialAccZ1);   if (accZ1_RoC < 0 ) accZ1_RoC *= -1;
          acc1AvgRoc = (accX1_RoC + accY1_RoC + accZ1_RoC) / 3;
          timeIntervalRoC = 300;
        }, timeIntervalRoC);

        // C button is pressed.
        this.pressbuttonC1();

        // Display the data.
        displayedData.innerText = newMessage; // Set the text of the list item to the new message.
        this.serialMessagesContainer.innerHTML = ''; // Clear the container.
        this.serialMessagesContainer.appendChild(displayedData); // Add the list item to the container.
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

  scaleIntensity(x) {
    const m = (7000 - 1000) / (300 - 1);
    const c = 1000 - m * 1;
    return m * x + c;
  }

  // C button is pressed.
  pressbuttonC1() {
    // Check if button_C value has changed from 0 to 1.
    if (this.buttonC1_state == 0 && buttonC1 == 1) {
      // Play note on harp if buttonC1 has changed from 0 to 1.
      const intensity = this.scaleIntensity(acc1AvgRoc);
      harp.playHarp(joyX1, joyY1, intensity);
      console.log(`acc1AvgRoc: ${acc1AvgRoc}`);

      // Resets rate of change values after string has been plucked
      // so that plucking intensity drops quickly after stopping movement.
      initialAccX1 = 0;
      initialAccY1 = 0;
      initialAccZ1 = 0;
      finalAccX1 = 0;
      finalAccY1 = 0;
      finalAccZ1 = 0;
      accX1_RoC = 0;
      accY1_RoC = 0;
      accZ1_RoC = 0;
      acc1AvgRoc = 0;
      timeIntervalRoC = 10;
    }

    // Update the buttonC1 state.
    this.buttonC1_state = buttonC1;
  }
}

// Create nunchuck object.
const nunchuck = new Nunchuck();