import BigInteger from "big-integer";

export default class UnsignedLongCoder {
  /**
   * Convert bytes to unsigned long
   * @param {Uint8Array} data byte array
   * @param {Number} offset read offset
   * @param {Number} length read length
   * @returns {BigInteger} long value
   */
  static decode(
    data: Uint8Array,
    offset: number,
    length: number
  ): BigInteger.BigInteger {
    if (offset < 0 || length < 0 || offset + length > data.length) {
      throw new Error("Index out of bounds");
    }

    if (length > 8) {
      throw new Error(
        "Integers of at most 63 unsigned bits supported by this implementation."
      );
    }

    let t = BigInteger.zero;
    for (let i = 0; i < length; ++i) {
      t = t.shiftLeft(8).or(data[offset + i] & 0xff);
    }

    return t;
  }

  /**
   * Convert long to byte array
   * @param {BigInteger} value long value
   * @returns {Uint8Array} Array byte array
   */
  static encode(value: BigInteger.BigInteger): Uint8Array {
    let t: BigInteger.BigInteger;
    let n = 0;

    for (t = value; t.gt(0); t = t.shiftRight(8)) {
      ++n;
    }

    const result = new Array(n);

    for (t = value; t.gt(0); t = t.shiftRight(8)) {
      result[--n] = t.and(0xff).toJSNumber();
    }

    return new Uint8Array(result);
  }

  static encodeWithPadding(value: BigInteger.BigInteger): Uint8Array {
    const encodedValue: Uint8Array = UnsignedLongCoder.encode(value);
    const result: Uint8Array = new Uint8Array(8);
    result.set(encodedValue, 8 - encodedValue.length);

    return result;
  }
}
