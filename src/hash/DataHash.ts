import Hex from "../coders/HexCoder.js";

import HashAlgorithm from "./HashAlgorithm.js";
import { HashingError } from "./HashingError.js";
import { compareUint8Arrays } from "../utils/Array.js";
import IDataHash from "./IDataHash.js";

export default class DataHash implements IDataHash {
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
    this.imprint = new Uint8Array(bytes);
    this.value = this.imprint.slice(1);
    if (this.value.length != this.hashAlgorithm.length) {
      throw new HashingError(
        "Imprint digest length does not match with algorithm."
      );
    }

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
   * Check if 2 objects are data hash and equal to eachother.
   * @param obj1 First object.
   * @param obj2 Second object.
   * @returns True if data hashes imprint, value and algorithm are equal.
   */
  static equals(obj1: IDataHash, obj2: IDataHash): boolean {
    return (
      DataHash.isDataHash(obj1) &&
      DataHash.isDataHash(obj2) &&
      compareUint8Arrays(obj1.imprint, obj2.imprint) &&
      compareUint8Arrays(obj1.value, obj2.value) &&
      HashAlgorithm.equals(obj1.hashAlgorithm, obj2.hashAlgorithm)
    );
  }

  /**
   * Test if object is data hash.
   * @param obj Object to test.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static isDataHash(obj: any): obj is IDataHash {
    return (
      typeof obj === "object" &&
      obj !== null &&
      Object.prototype.hasOwnProperty.call(obj, "imprint") &&
      ArrayBuffer.isView(obj.imprint) &&
      Object.prototype.hasOwnProperty.call(obj, "value") &&
      ArrayBuffer.isView(obj.value) &&
      Object.prototype.hasOwnProperty.call(obj, "hashAlgorithm")
    );
  }

  toString(): string {
    return Hex.encode(this.imprint);
  }

  equals(obj: IDataHash): boolean {
    return DataHash.equals(this, obj);
  }
}
