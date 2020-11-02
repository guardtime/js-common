import Base32Coder from "../../src/coders/Base32Coder";

describe("Base32Coder", () => {
  it("decode works", () => {
    const encodedString = "ABDA====";
    const actualOutput = Base32Coder.decode(encodedString);
    expect(actualOutput[0]).toBe(0);
    expect(actualOutput[1]).toBe(70);
  });

  it("encode works", () => {
    const bytes = new Uint8Array([0, 70]);
    expect(Base32Coder.encode(bytes)).toBe('ABDA');
  });
});
