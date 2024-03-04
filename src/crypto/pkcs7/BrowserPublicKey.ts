import crypto from "node:crypto";
import { SubjectPublicKeyInfo } from "./SubjectPublicKeyInfo.js";
import { PublicKey } from "./PublicKey.js";
import { DigestAlgorithm } from "./DigestAlgorithm.js";

export class BrowserPublicKey implements PublicKey {
  private readonly publicKeyInfo: SubjectPublicKeyInfo;

  public constructor(publicKeyInfo: SubjectPublicKeyInfo) {
    this.publicKeyInfo = publicKeyInfo;
  }

  public async verifySignature(
    algorithm: DigestAlgorithm,
    data: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    const publicKey = await crypto.subtle.importKey(
      "spki",
      this.publicKeyInfo.getBytes(),
      this.getSpkiAlgorithmParams(this.publicKeyInfo.algorithm, algorithm),
      false,
      ["verify"],
    );

    return crypto.subtle.verify(
      publicKey.algorithm.name,
      publicKey,
      signature,
      data,
    );
  }

  private getSpkiAlgorithmParams(
    keyAlgorithm: string,
    digestAlgorithm: DigestAlgorithm,
  ) {
    switch (keyAlgorithm) {
      case "1.2.840.113549.1.1.1":
      case "1.2.840.113549.1.1.11":
      case "1.2.840.113549.1.1.12":
      case "1.2.840.113549.1.1.13":
        return {
          name: "RSASSA-PKCS1-v1_5",
          hash: digestAlgorithm.name,
        };
      default:
        throw new Error("Unsupported algorithm");
    }
  }
}
