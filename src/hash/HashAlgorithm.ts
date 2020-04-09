/*eslint no-use-before-define: ["error", { "variables": false }]*/
import { HashingError } from "./HashingError";

/**
 * HashAlgorithm Status enum.
 */
enum AlgorithmStatus {
  /**
   * Normal fully supported algorithm.
   */
  Normal,

  /**
   * Algorithm no longer considered secure and only kept for backwards
   * compatibility. Should not be used in new signatures. Should trigger
   * verification warnings when encountered in existing signatures.
   */
  NotTrusted,

  /**
   * Algorithm defined in the specification, but not yet available in the implementation.
   */
  NotImplemented,
}

const INVALID_HASH_ALGORITHM_IDS = new Uint8Array([0x03, 0x7e]);

export default class HashAlgorithm {
  public readonly id: number;
  public readonly name: string;
  public readonly length: number;
  private readonly status: AlgorithmStatus;
  private readonly deprecatedSince: number | null;
  private readonly obsoleteSince: number | null;

  /* eslint-disable @typescript-eslint/no-use-before-define */
  /**
   * Default HashAlgorithm instance
   * @return HashAlgorithm
   */
  static get DEFAULT(): HashAlgorithm {
    return SHA2_256;
  }

  /**
   * SHA1 HashAlgorithm instance
   * @return HashAlgorithm
   */
  static get SHA1(): HashAlgorithm {
    return SHA1;
  }

  /**
   * SHA2_256 HashAlgorithm instance
   * @return HashAlgorithm
   */
  static get SHA2_256(): HashAlgorithm {
    return SHA2_256;
  }

  /**
   * RIPEMD160 HashAlgorithm instance
   * @return HashAlgorithm
   */
  static get RIPEMD160(): HashAlgorithm {
    return RIPEMD160;
  }

  /**
   * SHA2_384 HashAlgorithm instance
   * @return HashAlgorithm
   */
  static get SHA2_384(): HashAlgorithm {
    return SHA2_384;
  }

  /**
   * SHA2_512 HashAlgorithm instance
   * @return HashAlgorithm
   */
  static get SHA2_512(): HashAlgorithm {
    return SHA2_512;
  }

  /**
   * SHA3_224 HashAlgorithm instance
   * @return HashAlgorithm
   */
  static get SHA3_224(): HashAlgorithm {
    return SHA3_224;
  }

  /**
   * SHA3_256 HashAlgorithm instance
   * @return HashAlgorithm
   */
  static get SHA3_256(): HashAlgorithm {
    return SHA3_256;
  }

  /**
   * SHA3_384 HashAlgorithm instance
   * @return HashAlgorithm
   */
  static get SHA3_384(): HashAlgorithm {
    return SHA3_384;
  }

  /**
   * SHA3_512 HashAlgorithm instance
   * @return HashAlgorithm
   */
  static get SHA3_512(): HashAlgorithm {
    return SHA3_512;
  }

  /**
   * SM3 HashAlgorithm instance
   * @return HashAlgorithm
   */
  static get SM3(): HashAlgorithm {
    return SM3;
  }

  /* eslint-enable @typescript-eslint/no-use-before-define */

  /**
   * Get HashAlgorithm by Guardtime algorithm ID
   * @returns HashAlgorithm|null
   */
  static getById(id: number): HashAlgorithm | null {
    const values = HashAlgorithm.Values();
    for (const i in values) {
      if (values[i].id == id) {
        return values[i];
      }
    }

    if (this.isInvalidAlgorithm(id)) {
      throw new HashingError(`Invalid hash algorithm. Id: ${id}`);
    }

    return null;
  }

  /**
   * Get HashAlgorithm based on name.
   * @param name {string}
   * @returns HashAlgorithm|null
   */
  static getByName(name: string): HashAlgorithm | null {
    const values = HashAlgorithm.Values();
    for (const i in values) {
      if (values[i].name === name) {
        return values[i];
      }
    }

    return null;
  }

  /**
   * Get list of HashAlgorithms
   * @returns Array HashAlgorithm array
   */
  static Values(): HashAlgorithm[] {
    /* eslint-disable @typescript-eslint/no-use-before-define */
    return [
      SHA1,
      SHA2_256,
      RIPEMD160,
      SHA2_384,
      SHA2_512,
      SHA3_224,
      SHA3_256,
      SHA3_384,
      SHA3_512,
      SM3,
    ];
    /* eslint-enable @typescript-eslint/no-use-before-define */
  }

  /**
   * Create HashAlgorithm instance from id, name, length
   * @param id Guardtime algorithm id
   * @param name algorithm name
   * @param length algorithm digest length
   * @param status algorithm status
   * @param deprecatedSince date from which the algorithm is deprecated
   * @param obsoleteSince date from which the algorithm is obsolete
   */
  constructor(
    id: number,
    name: string,
    length: number,
    status: AlgorithmStatus,
    deprecatedSince: number | null = null,
    obsoleteSince: number | null = null
  ) {
    this.id = id;
    this.name = name;
    this.length = length;
    this.status = status;

    if (deprecatedSince === null) {
      this.deprecatedSince = deprecatedSince;
    } else if (obsoleteSince === null) {
      this.deprecatedSince = deprecatedSince;
    } else {
      this.deprecatedSince =
        deprecatedSince > obsoleteSince ? obsoleteSince : deprecatedSince;
    }

    this.obsoleteSince = obsoleteSince;
  }

  /**
   * Returns true if the algorithm has deprecated since date set.
   */
  public hasDeprecatedSinceDate(): boolean {
    return this.deprecatedSince !== null;
  }

  /**
   * Returns deprecated since date.
   */
  public getDeprecatedSinceDate(): number | null {
    return this.deprecatedSince;
  }

  /**
   * Returns true if the algorithm is deprecated at the given date
   * @param time unix time to check against
   * @return boolean
   */
  public isDeprecated(time: number): boolean {
    return (
      (this.deprecatedSince !== null && time >= this.deprecatedSince) ||
      this.isObsolete(time)
    );
  }

  /**
   * Returns obsolete since date.
   */
  public getObsoleteSinceDate(): number | null {
    return this.obsoleteSince;
  }

  /**
   * Returns true if the algorithm is obsolete at the given date
   * @param time unix time to check against
   * @return boolean
   */
  public isObsolete(time: number): boolean {
    return this.obsoleteSince !== null && time >= this.obsoleteSince;
  }

  /**
   * Returns true if algorithm with given id is marked as invalid.
   */
  public static isInvalidAlgorithm(algorithmId: number): boolean {
    for (const id of INVALID_HASH_ALGORITHM_IDS) {
      if (id === algorithmId) {
        return true;
      }
    }

    return false;
  }

  /**
   * Returns if it is implemented.
   */
  public isImplemented(): boolean {
    return this.status !== AlgorithmStatus.NotImplemented;
  }
}

const SHA1 = new HashAlgorithm(
  0x0,
  "SHA-1",
  20,
  AlgorithmStatus.NotTrusted,
  1467331200
);
const SHA2_256 = new HashAlgorithm(0x1, "SHA-256", 32, AlgorithmStatus.Normal);
const RIPEMD160 = new HashAlgorithm(
  0x2,
  "RIPEMD160",
  20,
  AlgorithmStatus.Normal
);
const SHA2_384 = new HashAlgorithm(0x4, "SHA-384", 48, AlgorithmStatus.Normal);
const SHA2_512 = new HashAlgorithm(0x5, "SHA-512", 64, AlgorithmStatus.Normal);
const SHA3_224 = new HashAlgorithm(
  0x7,
  "SHA3-224",
  28,
  AlgorithmStatus.NotImplemented
);
const SHA3_256 = new HashAlgorithm(
  0x8,
  "SHA3-256",
  32,
  AlgorithmStatus.NotImplemented
);
const SHA3_384 = new HashAlgorithm(
  0x9,
  "SHA3-384",
  48,
  AlgorithmStatus.NotImplemented
);
const SHA3_512 = new HashAlgorithm(
  0xa,
  "SHA3-512",
  64,
  AlgorithmStatus.NotImplemented
);
const SM3 = new HashAlgorithm(0xb, "SM3", 32, AlgorithmStatus.NotImplemented);
