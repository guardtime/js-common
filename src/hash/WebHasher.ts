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

import HashAlgorithm from "./HashAlgorithm.js";
import DataHash from "./DataHash.js";
import { HashingError } from "./HashingError.js";
import { Hasher } from "./Hasher.js";

/**
 * Does hashing with asynchronous way
 */
export default class WebHasher implements Hasher {
  private readonly _algorithm: HashAlgorithm;
  private _data: Uint8Array;

  public get algorithm(): HashAlgorithm {
    return this._algorithm;
  }

  /**
   * Create DataHasher instance the hash algorithm
   * @param {HashAlgorithm} hashAlgorithm
   */
  constructor(hashAlgorithm: HashAlgorithm) {
    if (
      !hashAlgorithm.isImplemented() ||
      hashAlgorithm === HashAlgorithm.RIPEMD160
    ) {
      throw new HashingError(
        `Hash algorithm is not implemented: ${hashAlgorithm.name}.`
      );
    }

    this._algorithm = hashAlgorithm;
    this._data = new Uint8Array(0);
  }

  /**
   * Add data for hashing
   * @param {Uint8Array} data byte array
   * @returns {WebHasher}
   */
  update(data: Uint8Array): Hasher {
    if (!(data instanceof Uint8Array)) {
      throw new HashingError("Invalid array for hashing");
    }

    const previousData = this._data;
    this._data = new Uint8Array(previousData.length + data.length);
    this._data.set(previousData);
    this._data.set(data, previousData.length);

    return this;
  }

  /**
   * Create hashing Promise for getting result DataHash
   * @returns Promise.<DataHash, Error>
   */
  async digest(): Promise<DataHash> {
    return DataHash.create(
      this._algorithm,
      new Uint8Array(
        await window.crypto.subtle.digest(
          { name: this._algorithm.name },
          this._data
        )
      )
    );
  }

  /**
   * Resets the hash calculation.
   * @returns {WebHasher} The same data hasher object object for chaining calls.
   */
  reset(): Hasher {
    this._data = new Uint8Array(0);

    return this;
  }
}
