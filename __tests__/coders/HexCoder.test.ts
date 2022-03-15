import { HexCoder } from "../../src/coders/HexCoder";

describe("Hex coder", () => {
  it("encode/decode works", () => {
    const hexEncodedString = "AFAF";
    const decoded = HexCoder.decode(hexEncodedString);
    const encoded = HexCoder.encode(decoded);

    expect(encoded).toBe(hexEncodedString);
  });
});
