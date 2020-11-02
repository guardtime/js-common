import base32Encode from 'base32-encode';

export default class Base32Coder {

  static encode(bytes: Uint8Array): string {
    return base32Encode(bytes, 'RFC4648', { padding: false });
  }

  // https://github.com/chrismiceli/base32decode-javascript
  static decode(base32EncodedString: string): Uint8Array {
    if (typeof base32EncodedString !== "string") {
      throw new Error("Invalid string");
    }

    base32EncodedString = base32EncodedString.replace(/-/g, "");

    if ((base32EncodedString.length * 5) % 8 !== 0) {
      throw new Error(
        "base32EncodedString is not of the proper length. Please verify padding."
      );
    }

    base32EncodedString = base32EncodedString.toLowerCase();
    const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
    let returnArray = new Array((base32EncodedString.length * 5) / 8);

    let currentByte = 0;
    let bitsRemaining = 8;
    let mask = 0;
    let arrayIndex = 0;

    for (let count = 0; count < base32EncodedString.length; count++) {
      const currentIndexValue = alphabet.indexOf(base32EncodedString[count]);
      if (currentIndexValue === -1) {
        if (base32EncodedString[count] === "=") {
          let paddingCount = 0;
          for (; count < base32EncodedString.length; count++) {
            if (base32EncodedString[count] !== "=") {
              throw new Error("Invalid '=' in encoded string");
            } else {
              paddingCount++;
            }
          }

          switch (paddingCount) {
            case 6:
              returnArray = returnArray.slice(0, returnArray.length - 4);
              break;
            case 4:
              returnArray = returnArray.slice(0, returnArray.length - 3);
              break;
            case 3:
              returnArray = returnArray.slice(0, returnArray.length - 2);
              break;
            case 1:
              returnArray = returnArray.slice(0, returnArray.length - 1);
              break;
            default:
              throw new Error("Incorrect padding");
          }
        } else {
          throw new Error(
            "base32EncodedString contains invalid characters or invalid padding."
          );
        }
      } else if (bitsRemaining > 5) {
        mask = currentIndexValue << (bitsRemaining - 5);
        currentByte |= mask;
        bitsRemaining -= 5;
      } else {
        mask = currentIndexValue >> (5 - bitsRemaining);
        currentByte |= mask;
        returnArray[arrayIndex++] = currentByte;
        currentByte = currentIndexValue << (3 + bitsRemaining);
        bitsRemaining += 3;
      }
    }

    return new Uint8Array(returnArray);
  }
}
