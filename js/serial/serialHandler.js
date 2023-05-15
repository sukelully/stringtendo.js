// Import class used to transform data stream by splitting into lines.
import { LineBreakTransformer } from "/js/serial/lineBreakTransformer.js";

class SerialHandler {
  async init() {
    if ('serial' in navigator) {
      try {
        // Set filters to find microcontroller and get list of ports that match filter.
        const filters = [
          { usbVendorId: 0x2341, usbProductId: 0x0042 } // Arduino Mega 2560 vendor and product ID.
        ];
        const ports = await navigator.serial.getPorts({ filters });

        // Matching port is found.
        if (ports.length > 0) {
          // Open the port with the specified baud rate.
          const port = ports[0];
          await port.open({ baudRate: 115200 });

          // Instantiate decoder used to turn data into strings.
          const textDecoder = new TextDecoderStream();

          // Pipe the readable stream from the port to the text decoder.
          const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);

          // Create a reader to read from the text decoder stream, applying line breaks.
          this.reader = textDecoder.readable
            .pipeThrough(new TransformStream(new LineBreakTransformer()))
            .getReader();
        } else {
          console.error('Arduino 2560 not detected.');
        }
      } catch (err) {
        console.error('There was an error opening the serial port:', err);
      }
    } else {
      console.error('Web serial doesn\'t seem to be enabled in your browser. Check https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility for more info.');
    }
  }

  // Parse data into an object for use in stringtendo.js
  parseData(data) {
    const values = data.split(',');
    const parsedData = {
      id: values[0],
      accelX: parseFloat(values[1]),
      accelY: parseFloat(values[2]),
      accelZ: parseFloat(values[3]),
      buttonZ: parseInt(values[4]),
      buttonC: parseInt(values[5]),
      joyX: parseFloat(values[6]),
      joyY: parseFloat(values[7]),
    };
    return parsedData;
  }

  // Read data from the serial port.
  async read() {
    try {
      // Read data from the serial port and decode into a string.
      const readerData = await this.reader.read();
      return readerData.value;
    } catch (err) {
      // Handle read errors.
      const errorMessage = `Error reading data: ${err}`;
      // console.error(errorMessage);
      return errorMessage;
    }
  }
}

const serialHandler = new SerialHandler();
export { serialHandler };