// SerialHandler class for handling serial communication.
class SerialHandler {
  constructor() {
    // Create encoder and decoder objects.
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
  }
  
  // Initialize serial communication.
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
          // Get writable and readable streams.
          this.writer = port.writable.getWriter();
          this.reader = port.readable.getReader();
          // Get signal states.
          const signals = await port.getSignals();
          console.log(signals);
        // Board not found.
        } else {
          console.error('Arduino 2560 not detected.');
        }
      } catch(err) {
        console.error('There was an error opening the serial port:', err);
      }
    } else {
      console.error('Web serial doesn\'t seem to be enabled in your browser. Check https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility for more info.');
    }
  }
  
  // Write data to the serial port.
  async write(data) {
    // Encode data as a Uint8Array.
    const dataArrayBuffer = this.encoder.encode(data);
    // Write data to the port and return the number of bytes written.
    return await this.writer.write(dataArrayBuffer);
  }
  
  // Read data from the serial port.
  async read() {
    try {
      // Read data from the port and decode it into a string.
      const readerData = await this.reader.read();
      return this.decoder.decode(readerData.value);
    } catch (err) {
      // Handle read errors.
      const errorMessage = `Error reading data: ${err}`;
      console.error(errorMessage);
      return errorMessage;
    }
  }
}

// Create new SerialHandler object and export for use in main module.
const serialHandler = new SerialHandler();
export { serialHandler };