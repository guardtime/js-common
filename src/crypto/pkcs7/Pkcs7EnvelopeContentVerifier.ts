import { VerificationResult } from "./VerificationResult";

export interface Pkcs7EnvelopeContentVerifier<T> {
  verify(data: T, signedData: Uint8Array): Promise<VerificationResult>;
}
