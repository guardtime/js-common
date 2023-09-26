import { PublicKey } from "./PublicKey";
import { SubjectPublicKeyInfo } from "./SubjectPublicKeyInfo";

export interface SpkiFactory {
  create(spki: SubjectPublicKeyInfo): Promise<PublicKey>;
}
