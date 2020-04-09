import BigInteger from "big-integer";
import UnsignedLongCoder from "../../src/coders/UnsignedLongCoder";

describe("UnsignedLongCoder", () => {
  it("encode/decode works", () => {
    const bi = BigInteger(40);
    const bytes = UnsignedLongCoder.encode(bi);
    const biFromCoder = UnsignedLongCoder.decode(bytes, 0, bytes.length);

    expect(biFromCoder.equals(bi)).toBe(true);
    expect(UnsignedLongCoder.encodeWithPadding(BigInteger(1000))).toEqual(
      new Uint8Array([0, 0, 0, 0, 0, 0, 3, 232])
    );
  });
});
