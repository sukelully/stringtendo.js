// Import serialHandler object and OscillatorController class.
import { serialHandler } from './serialHandler.js';
// import { PluckSynth } from './pluckSynth.js';
import { harp } from './harp.js'

// Global variables.
var acc_X = 0;
var acc_Y = 0;
var acc_Z = 0;
var button_Z = 0;
var button_C= 0;
var joy_X = 0;
var joy_Y = 0;

// Define a nunchuck class.
class nunchuckApp {
  constructor() {
    // Get a reference to the container where serial messages will be displayed.
    this.serialMessagesContainer = document.getElementById('serial-messages-container');

    // Initialise the serialHandler and start listening for incoming messages.
    serialHandler.init().then(() => {
      this.getSerialMessage(); // Start the process of reading serial messages.
    }).catch((error) => {
      console.error(error);
    });

    // Initialize the button_C state to 0.
    this.button_C_state = 0;
  }

  // Read incoming serial data from Arduino and pattern match the 
  // expected data format to extract parameter values.
  async getSerialMessage() {
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
        const newMessage = `acc_X: ${matches[1]} acc_Y: ${matches[2]} acc_Z: ${matches[3]} button_Z: ${matches[4]} button_C: ${matches[5]} Joy: (${matches[6]}, ${matches[7]})`;
        // Assign pattern matched values to global variables.
        acc_X = `${matches[1]}`;
        acc_Y = `${matches[2]}`;
        acc_Z = `${matches[3]}`;
        button_Z = `${matches[4]}`;
        button_C = `${matches[5]}`;
        joy_X = `${matches[6]}`;
        joy_Y = `${matches[7]}`;

        // Check if button_C value has changed from 0 to 1.
        if (this.button_C_state == 0 && button_C == 1) {
          // Call pluckPlucky() if button_C has changed from 0 to 1.
          // this.harp.string1.pluckString();
          harp.playTest(joy_X, joy_Y);
        }

        // Update the button_C state.
        this.button_C_state = button_C;

        // Display the data.
        displayedData.innerText = newMessage; // Set the text of the list item to the new message.
        this.serialMessagesContainer.innerHTML = ''; // Clear the container.
        this.serialMessagesContainer.appendChild(displayedData); // Add the list item to the container.
      }
  
      // Set a timeout to call this function again after 10 milliseconds.
      // (Arduino code is also ran every 10 milliseconds).
      setTimeout(() => {
        this.getSerialMessage();
      }, 10);
    } catch (error) {
      console.error(error);
    }
  }
}

// Create a new instance of the WebSerialDemoApp class.
const app = new nunchuckApp();