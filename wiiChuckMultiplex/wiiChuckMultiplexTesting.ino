/*
 * Based on wiiChuck library code written by Kevin Harrington:
 * (https://github.com/madhephaestus/WiiChuck/blob/master/examples/WiiAccessoryMultiplex/WiiAccessoryMultiplex.ino)
 *
 * Modifications include:
 *   - Removed unessecary comments.
 *   - Removed tab spacing to simplify pattern matching.
 *   - Removed 2 for loops that print each controller's values individually.
 *   - Button data now shows as 1 or 0 to signify state instead of printing the button name when pressed.
 *   - Added nunchuck identifiers for each value.
 */

#include <WiiChuck.h>

Accessory nunchuck1;
Accessory nunchuck2;

unsigned long startTime = 0;
unsigned long elapsedTime = 0;

#define TCADDR 0x70         // I2C bus address.
#define NUM_TRIALS 1000     // Number of trials to run.
#define SERIAL_DELAY 17   // Total delay time of loop.

void setup() {
	Serial.begin(115200);
	nunchuck1.addMultiplexer(TCADDR, 0);
	nunchuck2.addMultiplexer(TCADDR, 3);
	nunchuck1.begin();
	nunchuck2.begin();

	// If the device isn't auto-detected, set the type.
	if (nunchuck1.type == Unknown) {
		nunchuck1.type = NUNCHUCK;
	}
	if (nunchuck2.type == Unknown) {
		nunchuck2.type = NUNCHUCK;
	}
}

void loop() {
  // Define variables for trial counter and elapsed time array.
  static int trial = 0;
  static int i2cErrorCount = 0;
  static unsigned long trialTimes[NUM_TRIALS];

  // Start timer.
  startTime = millis();

  /**********************************************************************/

  // Read inputs and update maps.
	nunchuck1.readData();
  nunchuck2.readData();

  // Print the X, Y, and Z acceleration values for nunchuck1.
  Serial.print("X1: ");   Serial.print(nunchuck1.getAccelX());
  Serial.print(" Y1: ");  Serial.print(nunchuck1.getAccelY());
  Serial.print(" Z1: ");  Serial.println(nunchuck1.getAccelZ());
  // Print the state of the Z and C buttons for nunchuck1.
  Serial.print("button_Z1: ");
  if (nunchuck1.getButtonZ()) Serial.print("1"); else Serial.print("0");
  Serial.print(" button_C1: ");
  if (nunchuck1.getButtonC()) Serial.print("1"); else Serial.println("0");
  // Print the joystick X and Y values for nunchuck1.
  Serial.print("Joy1: ");
  Serial.print(nunchuck1.getJoyX());    Serial.print(" ");
  Serial.println(nunchuck1.getJoyY());

  // Print the X, Y, and Z acceleration values for nunchuck2.
  Serial.print("X2: ");   Serial.print(nunchuck2.getAccelX());
  Serial.print(" Y2: ");  Serial.print(nunchuck2.getAccelY());
  Serial.print(" Z2: ");  Serial.println(nunchuck2.getAccelZ());
  // Print the state of the Z and C buttons for nunchuck2.
  Serial.print("button_Z2: ");
  if (nunchuck2.getButtonZ()) Serial.print("1"); else Serial.print("0");
  Serial.print(" button_C2: ");
  if (nunchuck2.getButtonC()) Serial.print("1"); else Serial.println("0");
  // Print the joystick X and Y values for nunchuck2.
  Serial.print("Joy2: ");
  Serial.print(nunchuck2.getJoyX());    Serial.print(" ");
  Serial.println(nunchuck2.getJoyY());
  Serial.println("");

  /**********************************************************************/

  // Stop timer and store elapsed time in array.
  elapsedTime = millis() - startTime;
  trialTimes[trial] = elapsedTime;

  // Search serial output for "I2C" string and count occurrences.
  while (Serial.available()) {
    if (Serial.find("I2C")) {
      i2cErrorCount++;
    }
  }

  // Increment trial counter.
  trial++;

  // If all trials have been completed, calculate and print statistics.
  if (trial >= NUM_TRIALS) {
    unsigned long minTime = trialTimes[0];
    unsigned long maxTime = trialTimes[0];
    unsigned long totalTime = 0;

    // Calculate minimum, maximum, and total elapsed times.
    for (int i = 0; i < NUM_TRIALS; i++) {
      minTime = min(minTime, trialTimes[i]);
      maxTime = max(maxTime, trialTimes[i]);
      totalTime += trialTimes[i];
    }

    // Calculate average elapsed time.
    float avgTime = (float)totalTime / NUM_TRIALS;

    // Print statistics to serial monitor.
    Serial.print("Elapsed time statistics (");
    Serial.print(NUM_TRIALS);
    Serial.println(" trials):");
    Serial.print("  Minimum (ms): ");
    Serial.println(minTime);
    Serial.print("  Maximum (ms): ");
    Serial.println(maxTime);
    Serial.print("  Average (ms): ");
    Serial.println(avgTime);
    Serial.print("  I2C Error Count: ");
    Serial.println(i2cErrorCount);

    // Exit loop.
    while (true) {}
  }

  float calcDelay = SERIAL_DELAY - elapsedTime;

  delay(calcDelay);    // Same time delay as main nunchuck.js loop.
}