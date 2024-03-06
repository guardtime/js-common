import { Asn1Object } from "../../asn1/Asn1Object.js";

export class SubjectPublicKeyInfo {
  public readonly algorithm: string;
  private readonly publicKey: Uint8Array;
  private readonly bytes: Uint8Array;

  public getBytes() {
    return new Uint8Array(this.bytes);
  }

  public constructor(obj: Asn1Object) {
    const children = obj.parseValueAsChildren();
    this.algorithm = children
      .at(0)
      ?.parseValueAsChildren()
      .at(0)
      ?.parseValueAsObjectIdentifier() as string;
    this.publicKey = children.at(1)?.parseValueBitStringAsBytes() as Uint8Array;
    this.bytes = obj.getBytes();
  }
}
