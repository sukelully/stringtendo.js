#include <WiiChuck.h>

Accessory nunchuck1;
Accessory nunchuck2;

unsigned long startTime = 0;
unsigned long elapsedTime = 0;

#define SERIAL_DELAY 10     // Total delay time of loop.
#define TCADDR 0x70        // I2C bus address.

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
  // Start timer.
  startTime = millis();

  // Read inputs and update maps.
	nunchuck1.readData();
  nunchuck2.readData();

  // Send nunchuck1 data in CSV format.
  Serial.print("nun1,");
  Serial.print(nunchuck1.getAccelX()); Serial.print(",");
  Serial.print(nunchuck1.getAccelY()); Serial.print(",");
  Serial.print(nunchuck1.getAccelZ()); Serial.print(",");
  Serial.print(nunchuck1.getButtonZ()); Serial.print(",");
  Serial.print(nunchuck1.getButtonC()); Serial.print(",");
  Serial.print(nunchuck1.getJoyX()); Serial.print(",");
  Serial.print(nunchuck1.getJoyY()); Serial.print(";");

  // Send nunchuck2 data in CSV format.
  Serial.print("nun2,");
  Serial.print(nunchuck2.getAccelX()); Serial.print(",");
  Serial.print(nunchuck2.getAccelY()); Serial.print(",");
  Serial.print(nunchuck2.getAccelZ()); Serial.print(",");
  Serial.print(nunchuck2.getButtonZ()); Serial.print(",");
  Serial.print(nunchuck2.getButtonC()); Serial.print(",");
  Serial.print(nunchuck2.getJoyX()); Serial.print(",");
  Serial.println(nunchuck2.getJoyY());

  // Stop timer and calculate delayTime.
  elapsedTime = millis() - startTime;
  float delayTime = SERIAL_DELAY - elapsedTime;

  // Delay so that data is transmitted every 17ms.
  delay(40);
}
