import { Asn1Object } from "../../asn1/Asn1Object.js";

export class Attribute {
  public readonly type: string;
  public readonly value?: Asn1Object;

  public constructor(obj: Asn1Object) {
    const children = obj.parseValueAsChildren();
    this.type = children.at(0)?.parseValueAsObjectIdentifier() as string;
    this.value = children.at(1) as Asn1Object;
  }
}
