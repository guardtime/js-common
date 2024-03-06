import { CRC32 } from "../../src/crc/CRC32.js";

describe("CRC32", () => {
  it("create crc32", () => {
    const crc = CRC32.create(new Uint8Array([1, 2, 3]));
    expect(crc.valueOf()).toBe(1438416925);
  });
});
