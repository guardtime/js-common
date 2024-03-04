import { Asn1Object } from "../../asn1/Asn1Object.js";

import { SignedData } from "./SignedData.js";
import { Pkcs7ContentType } from "./Pkcs7EnvelopeVerifier.js";

export class Pkcs7Envelope {
  public readonly contentType: Pkcs7ContentType;
  public readonly content: unknown;

  private constructor(obj: Asn1Object) {
    const children = obj.parseValueAsChildren();
    this.contentType =
      children[0].parseValueAsObjectIdentifier() as Pkcs7ContentType;
    const data = children.at(1);
    switch (this.contentType) {
      case Pkcs7ContentType.SIGNED_DATA:
        this.content = new SignedData(
          data?.parseValueAsChildren()?.at(0) as Asn1Object,
        );
        break;
      default:
        this.content = undefined;
    }
  }

  public static createFromBytes(bytes: Uint8Array): Pkcs7Envelope {
    return new Pkcs7Envelope(Asn1Object.createFromBytes(bytes));
  }
}
