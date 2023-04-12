// Import serialHandler and harp objects.
import { serialHandler } from '/js/serialHandler.js';
import { harp } from '/js/harp.js'

// Controller variables.
var accX = 0;
var accY = 0;
var accZ = 0;
var buttonZ = 0;
var buttonC= 0;
var joyX = 0;
var joyY = 0;

// Rate of change variables.
var initialAccX = 0;
var initialAccY = 0;
var initialAccZ = 0;
var finalAccX = 0;
var finalAccY = 0;
var finalAccZ = 0;
var accX_RoC = 0;
var accY_RoC = 0;
var accZ_RoC = 0;
var accAvgRoc = 0;
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
      const pattern = /X: ([^ ]+) +Y: ([^ ]+) +Z: ([^ ]+)+button_Z: ([^ ]+) +button_C: ([^ ]+)+Joy: \(([^,]+), ([^)]+)\)/;
      const matches = message.match(pattern);
      if (matches) {
        // Create a new string with the pattern matched values.
        const newMessage = `accX: ${matches[1]} accY: ${matches[2]} accZ: ${matches[3]} 
        buttonZ: ${matches[4]} buttonC: ${matches[5]} Joy: (${matches[6]}, ${matches[7]})`;
        // Assign pattern matched values to global variables.
        accX = `${matches[1]}`;
        accY = `${matches[2]}`;
        accZ = `${matches[3]}`;
        buttonZ = `${matches[4]}`;
        buttonC = `${matches[5]}`;
        joyX = `${matches[6]}`;
        joyY = `${matches[7]}`;

        // Get initial values every 100ms.
        setTimeout(() => {
          initialAccX = accX;
          initialAccY = accY;
          initialAccZ = accZ;
        }, 300);

        // Calculate the rate of change of all three accelerometer values over 100ms.
        setTimeout(() => {
          finalAccX = parseFloat(matches[1]);
          finalAccY = parseFloat(matches[2]);
          finalAccZ = parseFloat(matches[3]);
          accX_RoC = (finalAccX - initialAccX);   if (accX_RoC < 0 ) accX_RoC *= -1;
          accY_RoC = (finalAccY - initialAccY);   if (accY_RoC < 0 ) accY_RoC *= -1;
          accZ_RoC = (finalAccZ - initialAccZ);   if (accZ_RoC < 0 ) accZ_RoC *= -1;
          accAvgRoc = (accX_RoC + accY_RoC + accZ_RoC) / 3;
          timeIntervalRoC = 300;
        }, timeIntervalRoC);

        // C button is pressed.
        this.pressButtonC();

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
  pressButtonC() {
    // Check if button_C value has changed from 0 to 1.
    if (this.buttonC_state == 0 && buttonC == 1) {
      // Play note on harp if buttonC has changed from 0 to 1.
      const intensity = this.scaleIntensity(accAvgRoc);
      harp.playHarp(joyX, joyY, intensity);
      console.log(`accAvgRoc: ${accAvgRoc}`);

      // Resets rate of change values after string has been plucked
      // so that plucking intensity drops quickly after stopping movement.
      initialAccX = 0;
      initialAccY = 0;
      initialAccZ = 0;
      finalAccX = 0;
      finalAccY = 0;
      finalAccZ = 0;
      accX_RoC = 0;
      accY_RoC = 0;
      accZ_RoC = 0;
      accAvgRoc = 0;
      timeIntervalRoC = 10;
    }

    // Update the buttonC state.
    this.buttonC_state = buttonC;
  }
}

// Create nunchuck object.
const nunchuck = new Nunchuck();