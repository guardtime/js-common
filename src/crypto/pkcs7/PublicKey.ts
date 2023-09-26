import { DigestAlgorithm } from "./DigestAlgorithm";

export interface PublicKey {
  verifySignature(
    algorithm: DigestAlgorithm,
    data: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean>;
}
