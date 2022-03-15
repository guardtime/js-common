import forge from "node-forge";
import { BigInteger } from "big-integer";
import { DataHash } from "../hash/DataHash.js";
import { HashAlgorithm } from "../hash/HashAlgorithm.js";
import { SyncDataHasher } from "../hash/SyncDataHasher.js";
import { ASCIIConverter } from "../strings/ASCIIConverter.js";

/**
 * Hashes the signed data for the verification process.
 * Support only some hashing algorithms.
 *
 * @param {forge.pki.Certificate} certificate
 * @param {Uint8Array} signedData
 * @returns {DataHash}
 */
function hashData(
  certificate: forge.pki.Certificate,
  signedData: Uint8Array
): DataHash {
  let hashAlgorithm;
  switch (certificate.siginfo.algorithmOid) {
    case "1.2.840.113549.1.1.5":
      hashAlgorithm = HashAlgorithm.SHA1;
      break;
    case "1.2.840.113549.1.1.11":
      hashAlgorithm = HashAlgorithm.SHA2_256;
      break;
    default:
      throw new Error(
        `Unsupported algorithm: ${certificate.siginfo.algorithmOid}`
      );
  }
  const hasher = new SyncDataHasher(hashAlgorithm);
  hasher.update(signedData);
  return hasher.digest();
}

/**
 * Converts bytes to the Forge certificate object
 *
 * @param {Uint8Array} certificateBytes
 * @returns {forge.pki.Certificate}
 */
function convertToForgeCert(
  certificateBytes: Uint8Array
): forge.pki.Certificate {
  const certAsn1Format = forge.asn1.fromDer(
    ASCIIConverter.ToString(certificateBytes)
  );
  return forge.pki.certificateFromAsn1(certAsn1Format);
}

export class X509 {
  /**
   * Verifies that the data is signed with the provided signature and that the signature matches
   * the provided X509 certificate.
   *
   * @param {Uint8Array} certificateBytes
   * @param {Uint8Array} signedData
   * @param {Uint8Array} signature
   * @returns {boolean} true if verification successful, false otherwise.
   * @throws In case of invalid data formats, throws according errors.
   */
  static verify(
    certificateBytes: Uint8Array,
    signedData: Uint8Array,
    signature: Uint8Array
  ): boolean {
    if (!(certificateBytes instanceof Uint8Array)) {
      throw new Error("Invalid certificate bytes");
    }

    if (!(signedData instanceof Uint8Array)) {
      throw new Error("Invalid signed data bytes");
    }

    if (!(signature instanceof Uint8Array)) {
      throw new Error("Invalid signature bytes");
    }

    const cert = convertToForgeCert(certificateBytes);
    const hashOfData = hashData(cert, signedData).value;

    if (cert.publicKey instanceof ArrayBuffer) {
      throw new Error("Could not verify with public key");
    }

    return (
      cert.publicKey as unknown as {
        verify: (hash: string, signature: string) => boolean;
      }
    ).verify(
      ASCIIConverter.ToString(hashOfData),
      ASCIIConverter.ToString(signature)
    );
  }

  static isCertificateValidDuring(
    certificateBytes: Uint8Array,
    time: BigInteger
  ): boolean {
    const cert: forge.pki.Certificate = convertToForgeCert(certificateBytes);
    return !(
      time.lt(new Date(cert.validity.notBefore).getTime() / 1000) ||
      time.gt(new Date(cert.validity.notAfter).getTime() / 1000)
    );
  }
}
