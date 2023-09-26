import { SubjectPublicKeyInfo } from "./SubjectPublicKeyInfo";
import { BrowserPublicKey } from "./BrowserPublicKey";
import { SpkiFactory } from "./SpkiFactory";
import { PublicKey } from "./PublicKey";

export class BrowserSpkiFactory implements SpkiFactory {
  async create(spki: SubjectPublicKeyInfo): Promise<PublicKey> {
    return new BrowserPublicKey(spki);
  }
}
