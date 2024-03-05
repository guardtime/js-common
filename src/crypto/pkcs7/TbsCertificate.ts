import BigInteger from "big-integer";
import moment from "moment/moment";
import { RDNSequence } from "./RDNSequence.js";
import { Asn1Object } from "../../asn1/Asn1Object.js";
import { SubjectPublicKeyInfo } from "./SubjectPublicKeyInfo.js";

export class TbsCertificate {
  public readonly version: BigInteger.BigInteger;
  public readonly algorithm: string;
  public readonly validity: Readonly<{
    notBefore: moment.Moment;
    notAfter: moment.Moment;
  }>;
  public readonly subject: RDNSequence;
  public readonly issuer: RDNSequence;
  public readonly serialNumber: BigInteger.BigInteger;
  public readonly subjectPublicKeyInfo: SubjectPublicKeyInfo;
  private readonly extensions: Uint8Array;

  public constructor(obj: Asn1Object) {
    const children = obj.parseValueAsChildren();
    let i = 0;
    if (children[0].isTag && children[0].type === 0) {
      this.version = children[i++]
        .parseValueAsChildren()
        .at(0)
        ?.parseValueAsInteger() as BigInteger.BigInteger;
    } else {
      this.version = BigInteger(1);
    }
    this.serialNumber = children[i++].parseValueAsInteger();
    this.algorithm = children[i++]
      .parseValueAsChildren()
      .at(0)
      ?.parseValueAsObjectIdentifier() as string;
    this.issuer = new RDNSequence(children[i++]);
    const validity = children[i++].parseValueAsChildren();
    this.validity = {
      notBefore: validity[0].parseValueAsTime(),
      notAfter: validity[1].parseValueAsTime(),
    };
    this.subject = new RDNSequence(children[i++]);
    this.subjectPublicKeyInfo = new SubjectPublicKeyInfo(children[i++]);
    const extensions = children.at(i);
    if (extensions?.isTag && extensions?.type === 3) {
      this.extensions = children[i].getBytes();
    }
  }

  public isValidAt(time: moment.Moment) {
    return !(
      time.isBefore(this.validity.notBefore) ||
      time.isAfter(this.validity.notAfter)
    );
  }
}
