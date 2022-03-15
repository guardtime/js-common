import { ASCIIConverter } from "../../src/strings/ASCIIConverter";

describe("ASCIIConverter", () => {
  it("converter works", () => {
    const bytes = ASCIIConverter.ToBytes("asdf");
    const back = ASCIIConverter.ToString(bytes);

    expect(back).toBe("asdf");
  });

  it("Null byte should be converted too", () => {
    const bytes = new Uint8Array([1, 0, 2]);
    const asString = ASCIIConverter.ToString(bytes);
    const bytesBack = ASCIIConverter.ToBytes(asString);
    expect(bytesBack).toEqual(bytes);
  });

  it.skip("Large file encode and decode", () => {
    // 10 MB of data
    const data = new Uint8Array(10485760);

    const dataString = ASCIIConverter.ToString(data);
    expect(ASCIIConverter.ToBytes(dataString)).toEqual(data);
  });
});
