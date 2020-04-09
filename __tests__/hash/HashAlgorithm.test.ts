import HashAlgorithm from "../../src/hash/HashAlgorithm";

test("Get hash algorithm by name", () => {
  const actualAlg = HashAlgorithm.getByName("SHA-256");
  expect(actualAlg).toEqual(HashAlgorithm.SHA2_256);
});

test("Get hash algorithm by name", () => {
  const actualAlg = HashAlgorithm.getByName("does not exist");
  expect(actualAlg).toBeNull();
});
