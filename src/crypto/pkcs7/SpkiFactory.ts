import { PublicKey } from "./PublicKey.js";
import { SubjectPublicKeyInfo } from "./SubjectPublicKeyInfo.js";

export interface SpkiFactory {
  create(spki: SubjectPublicKeyInfo): Promise<PublicKey>;
}
