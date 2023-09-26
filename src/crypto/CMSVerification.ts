import { Pkcs7Envelope } from "./pkcs7/Pkcs7Envelope";
import {
  Pkcs7ContentType,
  Pkcs7EnvelopeVerifier,
} from "./pkcs7/Pkcs7EnvelopeVerifier";
import { SignedDataVerifier } from "./pkcs7/SignedDataVerifier";
import { NodeSpkiFactory } from "./pkcs7/NodeSpkiFactory";

export class CMSVerification {
  /**
   * Function that verifies detached signature and check that it is signed by the given trusted certificate
   * @param signatureValue - the pkcs7 signature bytes
   * @param signedBytes - if the signedBytes are not included in the signature, then they must be included here.
   * If signed bytes are included in the signature, then set this as null
   * @param trustedCertificates - list of trusted root ceritificates in PEM format
   * @param selector - certificate attribute selector
   * @returns boolean value whether the signature was verified
   */
  static async verify(
    publicKeyFactory: NodeSpkiFactory,
    signatureValue: Uint8Array,
    trustedCertificates: Uint8Array,
    selector: string,
    signedBytes: Uint8Array,
  ): Promise<boolean> {
    const envelope = Pkcs7Envelope.createFromBytes(signatureValue);
    const verifier = new Pkcs7EnvelopeVerifier();
    verifier.registerVerifier(
      Pkcs7ContentType.SIGNED_DATA,
      new SignedDataVerifier(publicKeyFactory, trustedCertificates, selector),
    );

    // TODO: Return verification result
    return (await verifier.verify(envelope, signedBytes)).status;
  }
}
