// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import util from "node-forge/lib/util.js";

export default class Utf8Converter {
  /**
   * Convert string to bytes
   * @param utf8String string
   * @returns {Uint8Array} byte array
   */
  static ToBytes(utf8String: string): Uint8Array {
    if (typeof utf8String !== "string") {
      throw new Error("Invalid string");
    }

    return util.text.utf8.encode(utf8String);
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

    return util.text.utf8.decode(bytes);
  }
}
