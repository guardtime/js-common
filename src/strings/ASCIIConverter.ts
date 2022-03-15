export class ASCIIConverter {
  /**
   * Convert string to bytes
   * @param asciiString string
   * @returns {Uint8Array} byte array
   */
  static ToBytes(asciiString: string): Uint8Array {
    if (typeof asciiString !== "string") {
      throw new Error("Invalid string");
    }
    const bytes = [];
    for (let i = 0; i < asciiString.length; i++) {
      bytes.push(asciiString.charCodeAt(i));
    }

    return new Uint8Array(bytes);
  }

  /**
   * Convert bytes to string
   * @param {Uint8Array} bytes
   * @returns string
   */
  static ToString(bytes: Uint8Array): string {
    if (!(bytes instanceof Uint8Array)) {
      throw new Error("Invalid byte array");
    }

    let data = "";
    for (let i = 0; i < bytes.length; i++) {
      data += String.fromCharCode(bytes[i]);
    }

    return data;
  }
}
