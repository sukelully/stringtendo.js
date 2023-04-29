import { LineBreakTransformer } from "/js/lineBreakTransformer.js";

class SerialHandler {
    constructor() {
      // Create encoder and decoder objects.
      this.encoder = new TextEncoder();
      this.decoder = new TextDecoder();
    }
  
    async init() {
      // Check if serial is available.
      if ('serial' in navigator) {
        try {
          // Set filters to find microcontroller.
          const filters = [
            { usbVendorId: 0x2341, usbProductId: 0x0042 } // Arduino Mega 2560 vendor and product ID.
          ];
          // Get list of available ports that match the filter.
          const ports = await navigator.serial.getPorts({ filters });
          // Matching port is found.
          if (ports.length > 0) {
            const port = ports[0];
            // Open the port with the specified baud rate.
            await port.open({ baudRate: 115200 });
  
            // Get signal states.
            const signals = await port.getSignals();
            console.log(signals);
  
            const textDecoder = new TextDecoderStream();
            const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
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
      // console.log(parsedData);
      return parsedData;
    }
    
    // parseData(data) {
    //   const values = data.split(',');
    //   const parsedData = {
    //     accelX: parseFloat(values[0]),
    //     accelY: parseFloat(values[1]),
    //     accelZ: parseFloat(values[2]),
    //     buttonZ: parseInt(values[3]),
    //     buttonC: parseInt(values[4]),
    //     joyX: parseFloat(values[5]),
    //     joyY: parseFloat(values[6]),
    //   };
    //   return parsedData;
    // }
  
    // Read data from serial port.
    async read() {
      try {
        // Read data from serial port and decode it into a string.
        const readerData = await this.reader.read();
        return readerData.value;
      } catch (err) {
        // Handle read errors.
        const errorMessage = `Error reading data: ${err}`;
        console.error(errorMessage);
        return errorMessage;
      }
    }
  }
  
  // Instantiate and export.
  const serialHandler = new SerialHandler();
  export { serialHandler };