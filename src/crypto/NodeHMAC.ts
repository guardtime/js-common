import * as crypto from "crypto";
import HashAlgorithm from "../hash/HashAlgorithm";
import ASCIIConverter from "../strings/ASCIIConverter";
import { HashingError } from "../hash/HashingError";

export default class NodeHMAC {
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
    if (!algorithm.isImplemented()) {
      throw new HashingError(
        `Hash algorithm is not implemented: ${algorithm.name}.`
      );
    }

    try {
      const hmacHasher = crypto.createHmac(
        algorithm.name.replace("-", ""),
        ASCIIConverter.ToString(key)
      );
      hmacHasher.update(Buffer.from(data));
      return new Uint8Array(hmacHasher.digest());
    } catch (e) {
      throw new HashingError(e);
    }
  }
}
