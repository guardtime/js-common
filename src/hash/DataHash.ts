import Hex from "../coders/HexCoder";

import HashAlgorithm from "./HashAlgorithm";
import { HashingError } from "./HashingError";

export default class DataHash {
  public readonly hashAlgorithm: HashAlgorithm;
  public readonly value: Uint8Array;
  public readonly imprint: Uint8Array;

  /**
   * Create DataHash instance with imprint
   * @param {Uint8Array} bytes byte array
   */
  constructor(bytes: Uint8Array) {
    const algorithm = HashAlgorithm.getById(bytes[0]);
    if (algorithm === null) {
      throw new HashingError(
        `Imprint contains invalid hash algorithm id: ${bytes[0]}.`
      );
    }

    this.hashAlgorithm = algorithm;
    this.value = new Uint8Array(bytes.subarray(1));
    if (this.value.length != this.hashAlgorithm.length) {
      throw new HashingError(
        "Imprint digest length does not match with algorithm."
      );
    }

    this.imprint = new Uint8Array(bytes);
    Object.freeze(this);
  }

  /**
   * Create DataHash instance with algorithm and hash
   * @param hashAlgorithm HashAlgorithm
   * @param value byte array
   */
  static create(hashAlgorithm: HashAlgorithm, value: Uint8Array): DataHash {
    const bytes = new Uint8Array(value.length + 1);
    bytes[0] = hashAlgorithm.id;
    bytes.set(value, 1);

    return new DataHash(bytes);
  }

  /**
   * @param {DataHash} x
   * @param {DataHash} y
   * @returns {boolean}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static equals(x: any, y: any): boolean {
    if (!(x instanceof DataHash) || !(y instanceof DataHash)) {
      return false;
    }

    if (x.imprint.length != y.imprint.length) {
      return false;
    }

    for (let i = 0; i < x.imprint.length; i++) {
      if (x.imprint[i] !== y.imprint[i]) {
        return false;
      }
    }

    return true;
  }

  toString(): string {
    return Hex.encode(this.imprint);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  equals(other: any): boolean {
    return DataHash.equals(this, other);
  }
}
