import { DigestAlgorithm } from "./DigestAlgorithm.js";

export interface PublicKey {
  verifySignature(
    algorithm: DigestAlgorithm,
    data: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean>;
}
