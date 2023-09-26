import { NodePublicKey } from "./NodePublicKey";
import crypto from "node:crypto";
import { SpkiFactory } from "./SpkiFactory";
import { PublicKey } from "./PublicKey";
import { SubjectPublicKeyInfo } from "./SubjectPublicKeyInfo";

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
