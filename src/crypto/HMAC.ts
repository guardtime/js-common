import HashAlgorithm from "../hash/HashAlgorithm";
import { isNodePlatform } from "../utils/Util";
import NodeHMAC from "./NodeHMAC";
import WebHMAC from "./WebHMAC";

export default class HMAC {
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
