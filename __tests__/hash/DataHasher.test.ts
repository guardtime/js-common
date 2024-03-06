import { HashAlgorithm } from "../../src/hash/HashAlgorithm.js";
import { DataHasher } from "../../src/hash/DataHasher.js";
import { NodeDataHasher } from "../../src/hash/NodeDataHasher.js";

describe("Data hashers work similarly", () => {
  it("sha256 is the same", async () => {
    const dataToBeHashed = new Uint8Array([1, 2, 3, 4]);

    const hashAlg = HashAlgorithm.SHA2_256;
    const asyncHasher = new NodeDataHasher(hashAlg);
    const syncHasher = new DataHasher(hashAlg);

    syncHasher.update(dataToBeHashed);
    asyncHasher.update(dataToBeHashed);
    expect(await asyncHasher.digest()).toEqual(await syncHasher.digest());
  });

  it("sha1 is the same", async () => {
    const dataToBeHashed = new Uint8Array([1, 2, 3, 4]);

    const hashAlg = HashAlgorithm.SHA1;
    const asyncHasher = new NodeDataHasher(hashAlg);
    const syncHasher = new DataHasher(hashAlg);

    syncHasher.update(dataToBeHashed);
    asyncHasher.update(dataToBeHashed);
    expect(await asyncHasher.digest()).toEqual(await syncHasher.digest());
  });

  it("Not supported hash algorithm throws error", () => {
    expect(() => {
      new DataHasher(HashAlgorithm.SHA3_256);
    }).toThrow(/Hash algorithm is not implemented: SHA3-256./);
  });
});
