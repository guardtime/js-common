import { TypedArray } from "../utils/Array.js";

export default class WebCryptoRandom {
  /**
   * Get cryptographically strong random values. The array given as the parameter is
   * filled with random numbers (random in its cryptographic meaning).
   * @param {TypedArray} typedArray
   */
  static getRandomValues(typedArray: TypedArray): TypedArray {
    return crypto.getRandomValues(typedArray);
  }
}
