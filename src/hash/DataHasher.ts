/*
 * GUARDTIME CONFIDENTIAL
 *
 * Copyright 2008-2020 Guardtime, Inc.
 * All Rights Reserved.
 *
 * All information contained herein is, and remains, the property
 * of Guardtime, Inc. and its suppliers, if any.
 * The intellectual and technical concepts contained herein are
 * proprietary to Guardtime, Inc. and its suppliers and may be
 * covered by U.S. and foreign patents and patents in process,
 * and/or are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Guardtime, Inc.
 * "Guardtime" and "KSI" are trademarks or registered trademarks of
 * Guardtime, Inc., and no license to trademarks is granted; Guardtime
 * reserves and retains all trademark rights.
 */

import { sha1 } from "@noble/hashes/sha1";
import { sha256 } from "@noble/hashes/sha256";
import { sha384, sha512 } from "@noble/hashes/sha512";
import { ripemd160 } from "@noble/hashes/ripemd160";
import { DataHash } from "./DataHash.js";
import { HashAlgorithm } from "./HashAlgorithm.js";
import { HashingError } from "./HashingError.js";
import { Hasher } from "./Hasher";

interface MessageDigest {
  update(buf: Uint8Array): this;
  digest(): Uint8Array;
  destroy(): void;
}

/**
 * Provides synchronous hashing functions
 */
export class DataHasher implements Hasher {
  public readonly algorithm: HashAlgorithm;
  private _messageDigest: MessageDigest;

  /**
   * Create DataHasher instance the hash algorithm
   * @param {HashAlgorithm} algorithm
   */
  public constructor(algorithm: HashAlgorithm) {
    if (!algorithm.isImplemented()) {
      throw new HashingError(
        `Hash algorithm is not implemented: ${algorithm.name}.`,
      );
    }

    this.algorithm = algorithm;
    this._messageDigest = DataHasher.createMessageDigest(this.algorithm);
  }

  /**
   * Add data for hashing
   * @param {Uint8Array} data byte array
   * @returns {DataHasher}
   */
  public update(data: Uint8Array): Hasher {
    this._messageDigest.update(data);
    return this;
  }

  /**
   * Hashes the data and returns the DataHash
   * @returns DataHash
   */
  public async digest(): Promise<DataHash> {
    return DataHash.create(this.algorithm, this._messageDigest.digest());
  }

  /**
   * Resets the hash calculation.
   * @returns {DataHasher} The same data hasher object for chaining calls.
   */
  public reset(): Hasher {
    this._messageDigest = DataHasher.createMessageDigest(this.algorithm);
    return this;
  }

  private static createMessageDigest(algorithm: HashAlgorithm): MessageDigest {
    switch (algorithm) {
      case HashAlgorithm.SHA1:
        return sha1.create();
      case HashAlgorithm.SHA2_256:
        return sha256.create();
      case HashAlgorithm.SHA2_384:
        return sha384.create();
      case HashAlgorithm.SHA2_512:
        return sha512.create();
      case HashAlgorithm.RIPEMD160:
        return ripemd160.create();
      default:
        throw new HashingError(
          `Hash algorithm is not implemented: ${algorithm.name}.`,
        );
    }
  }
}
