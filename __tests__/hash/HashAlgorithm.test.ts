import { HashAlgorithm } from "../../src/hash/HashAlgorithm.js";

describe("HashAlgorithm", () => {
  test("get hash algorithm by name", () => {
    const actualAlg = HashAlgorithm.getByName("SHA-256");
    expect(actualAlg).toEqual(HashAlgorithm.SHA2_256);
  });

  test("get hash algorithm by alternative name", () => {
    const actualAlg = HashAlgorithm.getByName("dEfA-.UlT");
    expect(actualAlg).toEqual(HashAlgorithm.SHA2_256);
  });

  test("get invalid hash algorithm because of number in it", () => {
    const actualAlg = HashAlgorithm.getByName("dEfA-.UlT1");
    expect(actualAlg).toBeNull();
  });

  test("get invalid hash algorithm", () => {
    const actualAlg = HashAlgorithm.getByName("does not exist");
    expect(actualAlg).toBeNull();
  });

  test("is equal to object with similar info", () => {
    expect(
      HashAlgorithm.equals(HashAlgorithm.SHA2_256, {
        id: 1,
        length: 32,
        name: "SHA-256",
      }),
    ).toBeTruthy();
  });
});
