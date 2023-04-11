/* This code is based on the Adafruit Wii Nunchuck Breakout Adapter code found at:
*  https://learn.adafruit.com/adafruit-wii-nunchuck-breakout-adapter?view=all
*
*  Modified by Luke Sullivan to simplifiy importing into browser.
*  Modifications include:
*  - Removing tab spacing to simplify pattern matching the data.
*  - Button data is shows as 1 or 0 to signify state instead of printing the button name when pressed.
*  - Button data is now printed before joystick data.
*  - Code is ran every 10ms instead of 100ms.
*/

#include <WiiChuck.h>

Accessory nunchuck; // Declare an object of the Accessory class named nunchuck.

void setup() {
  Serial.begin(115200);           // Start the serial communication at 115200 bits per second.
  nunchuck.begin();               // Initialize the nunchuck object.

  if (nunchuck.type == Unknown) { // If the type of the nunchuck is unknown, set it to NUNCHUCK.
    nunchuck.type = NUNCHUCK;
  }
}

void loop() {
  // Read inputs and update maps.
  nunchuck.readData();

  // Print the X, Y, and Z acceleration values.
  Serial.print('X: ');
  Serial.print(nunchuck.getAccelX());
  Serial.print(' Y: ');
  Serial.print(nunchuck.getAccelY());
  Serial.print(' Z: ');
  Serial.println(nunchuck.getAccelZ());

  // Print the state of the Z and C buttons.
  Serial.print('button_Z: ');
  if (nunchuck.getButtonZ()) Serial.print('1'); else Serial.print('0');
  Serial.print(' button_C: ');
  if (nunchuck.getButtonC()) Serial.print('1'); else Serial.print('0');

  // Print the joystick X and Y values.
  Serial.print('\nJoy: (');
  Serial.print(nunchuck.getJoyX()); Serial.print(', ');
  Serial.print(nunchuck.getJoyY()); Serial.println(')');

  Serial.println(); // Print a blank line.
  delay(10);        // Delay for 10 milliseconds before repeating the loop.
}