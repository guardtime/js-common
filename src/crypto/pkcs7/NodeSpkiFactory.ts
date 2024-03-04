import crypto from "node:crypto";
import { NodePublicKey } from "./NodePublicKey.js";
import { SpkiFactory } from "./SpkiFactory.js";
import { PublicKey } from "./PublicKey.js";
import { SubjectPublicKeyInfo } from "./SubjectPublicKeyInfo.js";

export class NodeSpkiFactory implements SpkiFactory {
  public async create(spki: SubjectPublicKeyInfo): Promise<PublicKey> {
    return new NodePublicKey(
      crypto.createPublicKey({
        key: spki.getBytes() as Buffer,
        format: "der",
        type: "spki",
      }),
    );
  }
}
