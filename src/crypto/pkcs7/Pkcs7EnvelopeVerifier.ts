import { Pkcs7EnvelopeContentVerifier } from "./Pkcs7EnvelopeContentVerifier";
import { Pkcs7Envelope } from "./Pkcs7Envelope";
import { VerificationResult } from "./VerificationResult";

export enum Pkcs7ContentType {
  SIGNED_DATA = "1.2.840.113549.1.7.2",
}

export class Pkcs7EnvelopeVerifier {
  private verifiers: Map<
    Pkcs7ContentType,
    Pkcs7EnvelopeContentVerifier<unknown>
  > = new Map();

  public registerVerifier<T>(
    oid: Pkcs7ContentType,
    verifier: Pkcs7EnvelopeContentVerifier<T>,
  ) {
    this.verifiers.set(oid, verifier);
  }

  public async verify(
    envelope: Pkcs7Envelope,
    signedData: Uint8Array,
  ): Promise<VerificationResult> {
    const verifier = this.verifiers.get(envelope.contentType);
    if (verifier === undefined) {
      throw new Error(
        `Could not find verifier for given envelope content [${envelope.contentType}]`,
      );
    }

    return await verifier.verify(envelope.content, signedData);
  }
}
