import { sha256 } from "@noble/hashes/sha256";
import { hmac } from "@noble/hashes/hmac";
import { sha1 } from "@noble/hashes/sha1";
import { sha384, sha512 } from "@noble/hashes/sha512";
import { ripemd160 } from "@noble/hashes/ripemd160";
import { HashAlgorithm } from "../hash/HashAlgorithm.js";
import { HashingError } from "../hash/HashingError.js";

export class HMAC {
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

    return hmac(HMAC.findHasherByAlgorithm(algorithm), key, data);
  }

  /**
   * Try to find hasher by algorithm.
   * @param algorithm hash algorithm
   * @private
   * @throws Error Throws on hash algorithm which has not implementation
   */
  private static findHasherByAlgorithm(algorithm: HashAlgorithm) {
    switch (algorithm) {
      case HashAlgorithm.SHA2_256:
        return sha256;
      case HashAlgorithm.SHA1:
        return sha1;
      case HashAlgorithm.SHA2_384:
        return sha384;
      case HashAlgorithm.SHA2_512:
        return sha512;
      case HashAlgorithm.RIPEMD160:
        return ripemd160;
      default:
        throw new Error(
          `Data hasher not found for algorithm: ${algorithm.name}`,
        );
    }
  }
}
