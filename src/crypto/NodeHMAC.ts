import * as crypto from "crypto";
import { HashAlgorithm } from "../hash/HashAlgorithm.js";
import { HashingError } from "../hash/HashingError.js";

export class NodeHMAC {
  /**
   * @param {HashAlgorithm} algorithm
   * @param {Uint8Array} key
   * @param {Uint8Array} data
   * @returns {Promise.<Uint8Array, Error>}
   */
  public static async digest(
    algorithm: HashAlgorithm,
    key: Uint8Array,
    data: Uint8Array,
  ): Promise<Uint8Array> {
    if (!algorithm.isImplemented()) {
      throw new HashingError(
        `Hash algorithm is not implemented: ${algorithm.name}.`,
      );
    }

    try {
      const hasher = crypto.createHmac(algorithm.name.replace("-", ""), key);
      hasher.update(Buffer.from(data));
      return new Uint8Array(hasher.digest());
    } catch (e) {
      throw new HashingError(e);
    }
  }
}
