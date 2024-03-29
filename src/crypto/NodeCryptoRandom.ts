import * as crypto from "crypto";

export class NodeCryptoApi {
  /**
   * Get cryptographically strong random values. The array given as the parameter is
   * filled with random numbers (random in its cryptographic meaning).
   * @param {TypedArray} typedArray
   */
  static getRandomValues(typedArray: NodeJS.TypedArray): NodeJS.TypedArray {
    return crypto.randomFillSync(typedArray);
  }
}
