import "node-forge/lib/sha256.js";
import "node-forge/lib/sha1.js";
import "node-forge/lib/sha512.js";
import HashAlgorithm from "./HashAlgorithm.js";
import DataHash from "./DataHash.js";
import HexCoder from "../coders/HexCoder.js";
import ASCIIConverter from "../strings/ASCIIConverter.js";
import { HashingError } from "./HashingError.js";
import forge from "node-forge";

/**
 * Provides synchronous hashing functions
 */
export default class SyncDataHasher {
  public readonly hashAlgorithm: HashAlgorithm;
  private _messageDigest: forge.md.MessageDigest;

  /**
   * Create SyncDataHasher instance the hash algorithm
   * @param {HashAlgorithm} hashAlgorithm
   */
  constructor(hashAlgorithm: HashAlgorithm) {
    if (!hashAlgorithm.isImplemented()) {
      throw new HashingError(
        `Hash algorithm is not implemented: ${hashAlgorithm.name}.`
      );
    }

    this.hashAlgorithm = hashAlgorithm;
    this._messageDigest = SyncDataHasher.createMessageDigest(
      this.hashAlgorithm
    );
  }

  /**
   * Add data for hashing
   * @param {Uint8Array} data byte array
   * @returns {DataHasher}
   */
  update(data: Uint8Array): SyncDataHasher {
    this._messageDigest.update(ASCIIConverter.ToString(data));
    return this;
  }

  /**
   * Hashes the data and returns the DataHash
   * @returns DataHash
   */
  digest(): DataHash {
    return DataHash.create(
      this.hashAlgorithm,
      HexCoder.decode(this._messageDigest.digest().toHex())
    );
  }

  /**
   * Resets the hash calculation.
   * @returns {DataHasher} The same data hasher object for chaining calls.
   */
  reset(): SyncDataHasher {
    this._messageDigest = SyncDataHasher.createMessageDigest(
      this.hashAlgorithm
    );
    return this;
  }

  private static createMessageDigest(
    hashAlgorithm: HashAlgorithm
  ): forge.md.MessageDigest {
    switch (hashAlgorithm) {
      case HashAlgorithm.SHA1:
        return forge.md.sha1.create();
      case HashAlgorithm.SHA2_256:
        return forge.md.sha256.create();
      case HashAlgorithm.SHA2_384:
        return forge.md.sha384.create();
      case HashAlgorithm.SHA2_512:
        return forge.md.sha512.create();
      default:
        throw new HashingError(
          `Hash algorithm is not implemented: ${hashAlgorithm.name}.`
        );
    }
  }
}
