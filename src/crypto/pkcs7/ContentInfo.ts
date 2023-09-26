import { Asn1Object } from "../../asn1/Asn1Object";

export class ContentInfo {
  public readonly contentType: string;
  public readonly content: Asn1Object;

  public constructor(obj: Asn1Object) {
    const children = obj.parseValueAsChildren();
    this.contentType = children[0].parseValueAsObjectIdentifier();
    this.content = children[1];
  }
}
