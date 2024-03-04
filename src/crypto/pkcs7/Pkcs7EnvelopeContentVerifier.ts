import { Result } from "../../verification/Result";

export interface Pkcs7EnvelopeContentVerifier<T, E = unknown> {
  verify(data: T, signedData: Uint8Array): Promise<Result<E>>;
}
