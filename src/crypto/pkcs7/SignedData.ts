import { AlgorithmIdentifier } from "./AlgorithmIdentifier.js";
import { ContentInfo } from "./ContentInfo.js";
import { Certificate } from "./Certificate.js";
import { Asn1Object } from "../../asn1/Asn1Object.js";
import { SignerInfo } from "./SignerInfo.js";

export class SignedData {
  public readonly version: bigInt.BigInteger;
  public readonly digestAlgorithms: ReadonlyArray<AlgorithmIdentifier>;
  public readonly contentInfo: ContentInfo;
  public readonly certificates: ReadonlyArray<Certificate>;
  public readonly crls: Asn1Object;
  public readonly signerInfos: ReadonlyArray<SignerInfo>;

  public constructor(obj: Asn1Object) {
    const children = obj.parseValueAsChildren();
    this.version = children[0].parseValueAsInteger();
    this.digestAlgorithms = children[1]
      .parseValueAsChildren()
      .map((child) => new AlgorithmIdentifier(child));
    this.contentInfo = new ContentInfo(children[2]);
    let i = 3;
    if (children[i].isTag && children[i].type === 0) {
      this.certificates = children[i]
        .parseValueAsChildren()
        .map((child) => new Certificate(child));
      i++;
    }
    if (children[i].isTag && children[i].type === 1) {
      this.crls = children[i];
      i++;
    }

    this.signerInfos = children[i]
      .parseValueAsChildren()
      .map((child) => new SignerInfo(child));
  }
}
