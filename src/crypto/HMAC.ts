import { HashAlgorithm } from "../hash/HashAlgorithm.js";
import { isNodePlatform } from "../utils/Util.js";
import { NodeHMAC } from "./NodeHMAC.js";
import { WebHMAC } from "./WebHMAC.js";

export class HMAC {
  /**
   * @param {HashAlgorithm} algorithm
   * @param {Uint8Array} key
   * @param {Uint8Array} data
   * @returns {Promise.<Uint8Array, Error>}
   */
  static digest(
    algorithm: HashAlgorithm,
    key: Uint8Array,
    data: Uint8Array
  ): Promise<Uint8Array> {
    if (isNodePlatform) {
      return NodeHMAC.digest(algorithm, key, data);
    }

    return WebHMAC.digest(algorithm, key, data);
  }
}
