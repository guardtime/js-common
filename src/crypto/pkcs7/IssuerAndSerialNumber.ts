import BigInteger from "big-integer";
import { RDNSequence } from "./RDNSequence.js";
import { Asn1Object } from "../../asn1/Asn1Object.js";

export class IssuerAndSerialNumber {
  public readonly issuer: RDNSequence;
  public readonly serialNumber: BigInteger.BigInteger;

  public constructor(obj: Asn1Object) {
    const children = obj.parseValueAsChildren();
    this.issuer = new RDNSequence(children[0]);
    this.serialNumber = children[1].parseValueAsInteger();
  }
}
