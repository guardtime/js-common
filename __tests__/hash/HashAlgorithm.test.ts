import HashAlgorithm from "../../src/hash/HashAlgorithm";

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
});
