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

import { Hash, createHash } from "crypto";
import HashAlgorithm from "./HashAlgorithm";
import { Hasher } from "./Hasher";
import DataHash from "./DataHash";
import { HashingError } from "./HashingError";

export default class NodeHasher implements Hasher {
  private readonly _algorithm: HashAlgorithm;
  private _hasher: Hash;

  /**
   * Get hasher algorithm
   * @return HashAlgorithm
   */
  public get algorithm(): HashAlgorithm {
    return this._algorithm;
  }

  /**
   * Create Node Hasher
   * @param hashAlgorithm HashAlgorithm
   */
  constructor(hashAlgorithm: HashAlgorithm) {
    if (!hashAlgorithm.isImplemented()) {
      throw new HashingError(
        `Hash algorithm is not implemented: ${hashAlgorithm.name}.`
      );
    }

    this._algorithm = hashAlgorithm;
    this._hasher = createHash(this.algorithm.name.replace("-", ""));
  }

  /**
   * Digest the final result
   * @return Promise<DataHash>
   */
  async digest(): Promise<DataHash> {
    return DataHash.create(
      this._algorithm,
      new Uint8Array(this._hasher.digest())
    );
  }

  /**
   * Update the hasher content
   * @param data byte array
   */
  update(data: Uint8Array): Hasher {
    this._hasher.update(data);

    return this;
  }

  /**
   * Update the hasher content
   * @param data byte array
   */
  reset(): Hasher {
    this._hasher = createHash(this.algorithm.name.replace("-", ""));

    return this;
  }
}
