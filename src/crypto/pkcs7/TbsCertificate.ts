import BigInteger from "big-integer";
import moment from "moment/moment";
import { RDNSequence } from "./RDNSequence";
import { Asn1Object } from "../../asn1/Asn1Object";
import { SubjectPublicKeyInfo } from "./SubjectPublicKeyInfo";

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
    this.version = children[0]
      .parseValueAsChildren()
      .at(0)
      ?.parseValueAsInteger() as BigInteger.BigInteger;
    this.serialNumber = children[1].parseValueAsInteger();
    this.algorithm = children[2]
      .parseValueAsChildren()
      .at(0)
      ?.parseValueAsObjectIdentifier() as string;
    this.issuer = new RDNSequence(children[3]);
    const validity = children[4].parseValueAsChildren();
    this.validity = {
      notBefore: validity[0].parseValueAsTime(),
      notAfter: validity[1].parseValueAsTime(),
    };
    this.subject = new RDNSequence(children[5]);
    this.subjectPublicKeyInfo = new SubjectPublicKeyInfo(children[6]);
    const extensions = children.at(7);
    if (extensions?.isTag && extensions?.type === 3) {
      this.extensions = children[5].getBytes();
    }
  }

  public isValidAt(time: moment.Moment) {
    return !(
      time.isBefore(this.validity.notBefore) ||
      time.isAfter(this.validity.notAfter)
    );
  }
}
