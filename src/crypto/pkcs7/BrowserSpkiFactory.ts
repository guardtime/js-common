import { SubjectPublicKeyInfo } from "./SubjectPublicKeyInfo.js";
import { BrowserPublicKey } from "./BrowserPublicKey.js";
import { SpkiFactory } from "./SpkiFactory.js";
import { PublicKey } from "./PublicKey.js";

export class BrowserSpkiFactory implements SpkiFactory {
  async create(spki: SubjectPublicKeyInfo): Promise<PublicKey> {
    return new BrowserPublicKey(spki);
  }
}
