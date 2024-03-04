import moment from "moment";
import { TbsCertificate } from "./TbsCertificate.js";
import { RDNSequence } from "./RDNSequence.js";
import { Asn1Object } from "../../asn1/Asn1Object.js";
import { SubjectPublicKeyInfo } from "./SubjectPublicKeyInfo.js";

export class Certificate {
  public readonly tbsCertificate: TbsCertificate;
  public readonly signatureAlgorithm: string;
  private readonly signature: Uint8Array;
  private readonly tbsCertificateBytes: Uint8Array;

  public get serialNumber() {
    return this.tbsCertificate.serialNumber;
  }

  public get issuer(): RDNSequence {
    return this.tbsCertificate.issuer;
  }

  public get subject(): RDNSequence {
    return this.tbsCertificate.subject;
  }

  public getSubjectPublicKeyInfo(): SubjectPublicKeyInfo {
    return this.tbsCertificate.subjectPublicKeyInfo;
  }

  public getTbsCertificateBytes(): Uint8Array {
    return new Uint8Array(this.tbsCertificateBytes);
  }

  public getSignatureBytes() {
    return new Uint8Array(this.signature);
  }

  public constructor(obj: Asn1Object) {
    const children = obj.parseValueAsChildren();
    this.tbsCertificate = new TbsCertificate(children[0]);
    this.tbsCertificateBytes = children[0].getBytes();
    this.signatureAlgorithm = children[1]
      .parseValueAsChildren()
      .at(0)
      ?.parseValueAsObjectIdentifier() as string;
    this.signature = new Uint8Array(children[2].parseValueBitStringAsBytes());
  }

  public isValidAt(time: moment.Moment) {
    return this.tbsCertificate.isValidAt(time);
  }
}
