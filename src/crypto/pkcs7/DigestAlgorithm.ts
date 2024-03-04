import { sha224, sha256 } from "@noble/hashes/sha256";
import { sha384, sha512, sha512_224, sha512_256 } from "@noble/hashes/sha512";

export class DigestAlgorithm {
  public static SHA256 = new DigestAlgorithm("SHA-256", sha256);
  public static SHA384 = new DigestAlgorithm("SHA-384", sha384);
  public static SHA512 = new DigestAlgorithm("SHA-512", sha512);
  public static SHA224 = new DigestAlgorithm("SHA-224", sha224);
  public static SHA512_224 = new DigestAlgorithm("SHA-512/224", sha512_224);
  public static SHA512_256 = new DigestAlgorithm("SHA-512/256", sha512_256);

  public name: string;
  private hasher: (data: Uint8Array) => Uint8Array;

  constructor(name: string, hasher: (data: Uint8Array) => Uint8Array) {
    this.name = name;
    this.hasher = hasher;
  }

  digest(data: Uint8Array): Uint8Array {
    return this.hasher(data);
  }

  static getDigestAlgorithm(oid: string) {
    switch (oid) {
      case "2.16.840.1.101.3.4.2.1":
        return DigestAlgorithm.SHA256;
      case "2.16.840.1.101.3.4.2.2":
        return DigestAlgorithm.SHA384;
      case "2.16.840.1.101.3.4.2.3":
        return DigestAlgorithm.SHA512;
      case "2.16.840.1.101.3.4.2.4":
        return DigestAlgorithm.SHA224;
      case "2.16.840.1.101.3.4.2.5":
        return DigestAlgorithm.SHA512_224;
      case "2.16.840.1.101.3.4.2.6":
        return DigestAlgorithm.SHA512_256;
      default:
        throw new Error("Invalid signer info digest algorithm");
    }
  }
}
