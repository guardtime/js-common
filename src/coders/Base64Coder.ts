import { toByteArray, fromByteArray } from "base64-js";
import ASCIIConverter from "../strings/ASCIIConverter.js";

export default class Base64Coder {
  static decode(value: string): Uint8Array {
    return toByteArray(value);
  }

  static encode(bytes: Uint8Array): string {
    return fromByteArray(bytes);
  }

  static decodeToByteString(value: string): string {
    return ASCIIConverter.ToString(Base64Coder.decode(value));
  }

  static encodeByteString(byteString: string): string {
    return Base64Coder.encode(ASCIIConverter.ToBytes(byteString));
  }
}
