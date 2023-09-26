import crypto from "node:crypto";

import { PublicKey } from "./PublicKey";
import { DigestAlgorithm } from "./DigestAlgorithm";

export class NodePublicKey implements PublicKey {
  private readonly publicKey: crypto.KeyObject;

  public constructor(key: crypto.KeyObject) {
    this.publicKey = key;
  }

  public async verifySignature(
    algorithm: DigestAlgorithm,
    data: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    return crypto.verify(
      algorithm.name.replace("-", ""),
      data,
      this.publicKey,
      signature,
    );
  }
}
