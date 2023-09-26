export class Utf8Converter {
  private static readonly TEXT_ENCODER = new TextEncoder();
  private static readonly TEXT_DECODER = new TextDecoder();

  /**
   * Convert string to bytes
   * @param utf8String string
   * @returns {Uint8Array} byte array
   */
  static ToBytes(utf8String: string): Uint8Array {
    return Utf8Converter.TEXT_ENCODER.encode(utf8String);
  }

  /**
   * Convert bytes to string
   * @param {Uint8Array} bytes
   * @returns string
   */
  static ToString(bytes: Uint8Array): string {
    return Utf8Converter.TEXT_DECODER.decode(bytes);
  }
}
