#include <WiiChuck.h>

Accessory nunchuck1;
Accessory nunchuck2;

void setup() {
	Serial.begin(115200);
	// Multiplexer located at address 0x70
	nunchuck1.addMultiplexer(0x70, 1); // Nunchuk connected to multiplexer port 0
	nunchuck2.addMultiplexer(0x70, 2); // '' port 1
	nunchuck1.begin();
	nunchuck2.begin();
	if (nunchuck1.type == Unknown) {
		nunchuck1.type = NUNCHUCK;
	}
	if (nunchuck2.type == Unknown) {
		nunchuck2.type = NUNCHUCK;
	}
}

void loop() {
	Serial.println('-------------------------------------------');
	nunchuck1.readData();    // Read inputs and update maps
	nunchuck2.readData();    // Read inputs and update maps

	Serial.print('1:' ); nunchuck1.printInputs(); // Print all inputs
	// for (int i = 0; i < WII_VALUES_ARRAY_SIZE; i++) {
	// 	Serial.println(
	// 			'Controller Val ' + String(i) + ' = '
	// 					+ String((uint8_t) nunchuck1.values[i]));
	// }
	// Serial.print('2:' ); nunchuck2.printInputs(); // Print all inputs
	// for (int i = 0; i < WII_VALUES_ARRAY_SIZE; i++) {
	// 	Serial.println(
	// 			'Controller Val ' + String(i) + ' = '
	// 					+ String((uint8_t) nunchuck2.values[i]));
	// }
  delay(1000);

}