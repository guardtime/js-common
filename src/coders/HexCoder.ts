import ASCIIConverter from "../strings/ASCIIConverter.js";

const BYTE_HEX_MAP = "0123456789ABCDEF";
const HEX_BYTE_MAP = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
};

export default class HexCoder {
  /**
   * Convert byte array to hex
   * @param {Uint8Array} data byte array
   * @returns string hex string
   */
  static encode(data: Uint8Array): string {
    if (!(data instanceof Uint8Array)) {
      throw new Error("Invalid array for converting to hex");
    }

    let hex = "";
    for (let i = 0; i < data.length; i++) {
      if (data[i] > 0xff) {
        throw new Error("Invalid byte");
      }

      hex += BYTE_HEX_MAP[(data[i] & 0xf0) >> 4];
      hex += BYTE_HEX_MAP[data[i] & 0x0f];
    }

    return hex;
  }

  /**
   * Convert hex string to bytes
   * @param value hex string
   * @returns {Uint8Array} byte array
   */
  static decode(value: string): Uint8Array {
    if (typeof value !== "string") {
      throw new Error("Invalid hex string");
    }

    if (value.length % 2 !== 0) {
      throw new Error("Octet string should have equal amount of characters");
    }
    const hex = value.toUpperCase();
    const result = [];
    for (let i = 0; i < hex.length; i += 2) {
      if (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        typeof HEX_BYTE_MAP[hex[i]] === "undefined" ||
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        typeof HEX_BYTE_MAP[hex[i + 1]] === "undefined"
      ) {
        throw new Error("Invalid HEX");
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      result.push((HEX_BYTE_MAP[hex[i]] << 4) + HEX_BYTE_MAP[hex[i + 1]]);
    }

    return new Uint8Array(result);
  }

  static encodeByteString(byteString: string): string {
    return HexCoder.encode(ASCIIConverter.ToBytes(byteString));
  }

  static decodeToByteString(value: string): string {
    return ASCIIConverter.ToString(HexCoder.decode(value));
  }
}
