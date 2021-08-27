import HashAlgorithm from "../hash/HashAlgorithm.js";
import { HashingError } from "../hash/HashingError.js";

export default class WebHMAC {
  /**
   * @param {HashAlgorithm} algorithm
   * @param {Uint8Array} key
   * @param {Uint8Array} data
   * @returns {Promise.<Uint8Array, Error>}
   */
  static async digest(
    algorithm: HashAlgorithm,
    key: Uint8Array,
    data: Uint8Array
  ): Promise<Uint8Array> {
    if (!algorithm.isImplemented() || algorithm === HashAlgorithm.RIPEMD160) {
      throw new HashingError(
        `Hash algorithm is not implemented: ${algorithm.name}.`
      );
    }

    const hmacKey = await window.crypto.subtle.importKey(
      "raw",
      key,
      {
        name: "HMAC",
        hash: { name: algorithm.name },
      },
      false,
      ["sign"]
    );

    const bytes = await window.crypto.subtle.sign(
      {
        name: "HMAC",
        hash: { name: algorithm.name },
      },
      hmacKey,
      data
    );

    return new Uint8Array(bytes);
  }
}
