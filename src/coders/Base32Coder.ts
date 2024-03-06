import { base32 } from "rfc4648";

export class Base32Coder {
  static encode(bytes: Uint8Array): string {
    return base32.stringify(bytes, { pad: false });
  }

  // https://github.com/chrismiceli/base32decode-javascript
  static decode(base32EncodedString: string): Uint8Array {
    if (typeof base32EncodedString !== "string") {
      throw new Error("Invalid string");
    }

    base32EncodedString = base32EncodedString.replace(/-/g, "");

    if ((base32EncodedString.length * 5) % 8 !== 0) {
      throw new Error(
        "base32EncodedString is not of the proper length. Please verify padding.",
      );
    }

    return base32.parse(base32EncodedString);
  }
}
