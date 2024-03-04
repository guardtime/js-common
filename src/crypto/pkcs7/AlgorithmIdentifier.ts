import { Asn1Object } from "../../asn1/Asn1Object.js";

export class AlgorithmIdentifier {
  public readonly identifier: string;
  public readonly parameters: Asn1Object | undefined;

  public constructor(obj: Asn1Object) {
    const children = obj.parseValueAsChildren();
    this.identifier = children[0].parseValueAsObjectIdentifier();
    this.parameters = children.at(1);
  }
}
