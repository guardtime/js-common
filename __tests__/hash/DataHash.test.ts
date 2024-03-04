import { HashAlgorithm } from "../../src/hash/HashAlgorithm";
import { DataHash } from "../../src/hash/DataHash";
import { HashingError } from "../../src/hash/HashingError";

describe("DataHash", () => {
  it("create with imprint", () => {
    const imprint = new Uint8Array(33);
    imprint.set([1]);
    const dataHash = new DataHash(imprint);
    expect(dataHash.toString()).toEqual(
      "010000000000000000000000000000000000000000000000000000000000000000",
    );
  });

  it("create with algorithm and data", () => {
    const dataHash = DataHash.create(
      HashAlgorithm.SHA2_256,
      new Uint8Array(32),
    );
    expect(dataHash.toString()).toEqual(
      "010000000000000000000000000000000000000000000000000000000000000000",
    );
  });

  it("create with invalid algorithm id", () => {
    expect.assertions(1);
    const imprint = new Uint8Array(33);
    imprint.set([255]);
    try {
      new DataHash(imprint);
    } catch (e) {
      expect(e).toEqual(
        new HashingError(`Imprint contains invalid hash algorithm id: 255.`),
      );
    }
  });

  it("create with invalid imprint length", () => {
    expect.assertions(1);
    const imprint = new Uint8Array(32);
    imprint.set([1]);
    try {
      new DataHash(imprint);
    } catch (e) {
      expect(e).toEqual(
        new HashingError(
          "Imprint digest length does not match with algorithm.",
        ),
      );
    }
  });

  it("equals with another datahash", () => {
    const imprint = new Uint8Array(33);
    imprint.set([1]);
    const firstDataHash = new DataHash(imprint);
    const secondDataHash = DataHash.create(
      HashAlgorithm.SHA2_256,
      new Uint8Array(32),
    );

    expect(firstDataHash.equals(secondDataHash)).toBeTruthy();
  });

  it("check array buffers to be recreated", () => {
    const imprint = new Uint8Array(33);
    imprint.set([1]);
    const dataHash = new DataHash(imprint);

    const correctImprint = new Uint8Array(33);
    correctImprint.set([1]);
    imprint.set([1], 2);
    expect(dataHash.imprint).toEqual(correctImprint);
    expect(dataHash.value).toEqual(new Uint8Array(32));
  });

  it("equals with invalid objects", () => {
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    expect(DataHash.equals(undefined, undefined)).toBeFalsy();
    // @ts-ignore
    expect(DataHash.equals(null, null)).toBeFalsy();
    // @ts-ignore
    expect(DataHash.equals({}, {})).toBeFalsy();
    // @ts-ignore
    expect(DataHash.equals({ imprint: null }, { imprint: null })).toBeFalsy();
    // @ts-ignore
    expect(DataHash.equals({ imprint: [] }, { imprint: null })).toBeFalsy();
    expect(
      // @ts-ignore
      DataHash.equals({ imprint: new Uint8Array(32) }, { imprint: {} }),
    ).toBeFalsy();
    expect(
      DataHash.equals(
        DataHash.create(HashAlgorithm.SHA2_256, new Uint8Array(32)),
        // @ts-ignore
        { imprint: {} },
      ),
    ).toBeFalsy();
    /* eslint-enable @typescript-eslint/ban-ts-comment */
  });

  it("equals with correct objects", () => {
    expect(
      DataHash.equals(
        DataHash.create(HashAlgorithm.SHA2_256, new Uint8Array(32)),
        DataHash.create(HashAlgorithm.SHA2_256, new Uint8Array(32)),
      ),
    ).toBeTruthy();

    const imprint = new Uint8Array(33);
    imprint.set([1]);
    expect(
      DataHash.equals(
        DataHash.create(HashAlgorithm.SHA2_256, new Uint8Array(32)),
        {
          imprint,
          value: new Uint8Array(32),
          hashAlgorithm: HashAlgorithm.SHA2_256,
        },
      ),
    ).toBeTruthy();
  });
});
