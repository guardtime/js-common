import { Utf8Converter } from "../../src/strings/Utf8Converter.js";

describe("Utf8Converter", () => {
  it("converter works", () => {
    const bytes = Utf8Converter.ToBytes("asdf汉字");
    const back = Utf8Converter.ToString(bytes);

    expect(back).toBe("asdf汉字");
  });

  it("Null byte should be converted too", () => {
    const bytes = new Uint8Array([1, 0, 2]);
    const asString = Utf8Converter.ToString(bytes);
    const bytesBack = Utf8Converter.ToBytes(asString);
    expect(bytesBack).toEqual(bytes);
  });
});
