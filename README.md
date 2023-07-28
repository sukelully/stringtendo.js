# stringtendo.js

This project is a web-based Karplus-Strong synthesiser operated using two Nintendo Wii Nunchuck controllers.

Both Nunchuks each use an [Adafruit Nunchuk adapter](https://www.adafruit.com/product/4836) to connect to an [I2C multiplexer](https://www.adafruit.com/product/2717) which itself is connected to an [Arduino Mega 2560](https://store.arduino.cc/products/arduino-mega-2560-rev3).

The Nunchuck button and accelerometer data is then sent to a PC through serial where it is imported into a web browser and used to control the synthesiser.

The synthesiser itself uses a simple Karplus-Strong algorithm implemented using a modified\* version of [Tone.js]((https://tonejs.github.io/)https://tonejs.github.io/).

<br>

\* An error in the way Tone.js's FeedbackCombFilter audio node decayed was found to be the cause of an unusual Karplus-Strong sound in its [PluckSynth](https://tonejs.github.io/docs/14.7.77/PluckSynth) module. A slight modification to the source code resulted in a significant improvement to my Karplus-Strong implementation and Tone.js' own PluckSynth.
