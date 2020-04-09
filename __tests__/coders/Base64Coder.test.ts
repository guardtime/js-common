import Base64Coder from "../../src/coders/Base64Coder";

describe("Base64Coder", () => {
  it("encode/decode works", () => {
    const encoded = Base64Coder.encode(new Uint8Array([10, 20, 30]));
    const decoded = Base64Coder.decode(encoded);

    expect(decoded[0]).toBe(10);
    expect(decoded[1]).toBe(20);
    expect(decoded[2]).toBe(30);
  });
});
