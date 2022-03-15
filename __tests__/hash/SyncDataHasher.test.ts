import { HashAlgorithm } from "../../src/hash/HashAlgorithm";
import { SyncDataHasher } from "../../src/hash/SyncDataHasher";
import { NodeHasher } from "../../src/hash/NodeHasher";

describe("Data hashers work similarly", () => {
  it("sha256 is the same", () => {
    const dataToBeHashed = new Uint8Array([1, 2, 3, 4]);

    const hashAlg = HashAlgorithm.SHA2_256;
    const asyncHasher = new NodeHasher(hashAlg);
    const syncHasher = new SyncDataHasher(hashAlg);

    syncHasher.update(dataToBeHashed);
    const syncResult = syncHasher.digest();

    asyncHasher.update(dataToBeHashed);
    return asyncHasher.digest().then((asyncResult) => {
      expect(asyncResult).toEqual(syncResult);
    });
  });

  it("sha1 is the same", () => {
    const dataToBeHashed = new Uint8Array([1, 2, 3, 4]);

    const hashAlg = HashAlgorithm.SHA1;
    const asyncHasher = new NodeHasher(hashAlg);
    const syncHasher = new SyncDataHasher(hashAlg);

    syncHasher.update(dataToBeHashed);
    const syncResult = syncHasher.digest();

    asyncHasher.update(dataToBeHashed);
    return asyncHasher.digest().then((asyncResult) => {
      expect(asyncResult).toEqual(syncResult);
    });
  });

  it("Not supported hash algorithm throws error", () => {
    expect(() => {
      new SyncDataHasher(HashAlgorithm.SHA3_256);
    }).toThrow(/Hash algorithm is not implemented: SHA3-256./);
  });

  it.skip("Time measure", async () => {
    const dataToBeHashed = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    // Sync Hash
    let startTime = new Date();
    for (let i = 0; i < 100000; i++) {
      const syncHasher = new SyncDataHasher(HashAlgorithm.SHA2_256);
      syncHasher.update(dataToBeHashed);
      syncHasher.digest();
    }

    let endTime = new Date();
    let timeDiff = +endTime - +startTime; //in ms
    console.log(timeDiff + " ms");

    // ASync Hash
    startTime = new Date();
    for (let i = 0; i < 100000; i++) {
      const asyncHasher = new NodeHasher(HashAlgorithm.SHA2_256);
      asyncHasher.update(dataToBeHashed);
      await asyncHasher.digest();
    }

    endTime = new Date();
    timeDiff = +endTime - +startTime; //in ms
    console.log(timeDiff + " ms");
  });
});
