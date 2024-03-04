import BigInteger from "big-integer";
import { IssuerAndSerialNumber } from "./IssuerAndSerialNumber.js";
import { AlgorithmIdentifier } from "./AlgorithmIdentifier.js";
import { Attributes } from "./Attributes.js";
import { Asn1Object } from "../../asn1/Asn1Object.js";

export class SignerInfo {
  public readonly version: BigInteger.BigInteger;
  public readonly issuerAndSerialNumber: IssuerAndSerialNumber;
  public readonly digestAlgorithm: AlgorithmIdentifier;
  public readonly authenticatedAttributes: Attributes | undefined;
  public readonly signatureAlgorithm: AlgorithmIdentifier;
  public readonly unauthenticatedAttributes: Attributes | undefined;
  private readonly signature: Uint8Array;

  public constructor(obj: Asn1Object) {
    const children = obj.parseValueAsChildren();
    this.version = children[0].parseValueAsInteger();
    this.issuerAndSerialNumber = new IssuerAndSerialNumber(children[1]);
    this.digestAlgorithm = new AlgorithmIdentifier(children[2]);
    let position = 3;
    if (children[position].isTag && children[position].type === 0) {
      this.authenticatedAttributes = new Attributes(children[position++]);
    }

    this.signatureAlgorithm = new AlgorithmIdentifier(children[position++]);
    this.signature = children[position++].parseValueAsBytes();
    this.unauthenticatedAttributes = children.at(position)
      ? new Attributes(children.at(position) as Asn1Object)
      : undefined;
  }

  public getSignature(): Uint8Array {
    return new Uint8Array(this.signature);
  }
}
