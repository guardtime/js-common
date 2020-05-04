import HashAlgorithm from "../../src/hash/HashAlgorithm";
import DataHash from "../../src/hash/DataHash";
import { HashingError } from "../../src/hash/HashingError";

describe("DataHash", () => {
  it("create with imprint", () => {
    const imprint = new Uint8Array(33);
    imprint.set([1]);
    const dataHash = new DataHash(imprint);
    expect(dataHash.toString()).toEqual(
      "010000000000000000000000000000000000000000000000000000000000000000"
    );
  });

  it("create with algorithm and data", () => {
    const dataHash = DataHash.create(
      HashAlgorithm.SHA2_256,
      new Uint8Array(32)
    );
    expect(dataHash.toString()).toEqual(
      "010000000000000000000000000000000000000000000000000000000000000000"
    );
  });

  it("create with invalid algorithm id", () => {
    expect.assertions(1);
    const imprint = new Uint8Array(33);
    imprint.set([255]);
    try {
      const dataHash = new DataHash(imprint);
    } catch (e) {
      expect(e).toEqual(
        new HashingError(`Imprint contains invalid hash algorithm id: 255.`)
      );
    }
  });

  it("create with invalid imprint length", () => {
    expect.assertions(1);
    const imprint = new Uint8Array(32);
    imprint.set([1]);
    try {
      const dataHash = new DataHash(imprint);
    } catch (e) {
      expect(e).toEqual(
        new HashingError("Imprint digest length does not match with algorithm.")
      );
    }
  });

  it("equals with another datahash", () => {
    const imprint = new Uint8Array(33);
    imprint.set([1]);
    const firstDataHash = new DataHash(imprint);
    const secondDataHash = DataHash.create(
      HashAlgorithm.SHA2_256,
      new Uint8Array(32)
    );

    expect(firstDataHash.equals(secondDataHash)).toBeTruthy();
  });

  it("equals with invalid objects", () => {
    expect(DataHash.equals(undefined, undefined)).toBeFalsy();
    expect(DataHash.equals(null, null)).toBeFalsy();
    expect(DataHash.equals({}, {})).toBeFalsy();
    expect(DataHash.equals({ imprint: null }, { imprint: null })).toBeFalsy();
    expect(DataHash.equals({ imprint: [] }, { imprint: null })).toBeFalsy();
    expect(
      DataHash.equals({ imprint: new Uint8Array(32) }, { imprint: {} })
    ).toBeFalsy();
  });

  it("equals with correct objects", () => {
    expect(
      DataHash.equals(
        DataHash.create(HashAlgorithm.SHA2_256, new Uint8Array(32)),
        DataHash.create(HashAlgorithm.SHA2_256, new Uint8Array(32))
      )
    ).toBeTruthy();

    const imprint = new Uint8Array(33);
    imprint.set([1]);
    expect(
      DataHash.equals(
        DataHash.create(HashAlgorithm.SHA2_256, new Uint8Array(32)),
        { imprint }
      )
    ).toBeTruthy();
  });
});
