import { Asn1Object } from "../../asn1/Asn1Object.js";
import { HexCoder } from "../../coders/HexCoder.js";
import { Attribute } from "./Attribute.js";

export class RDNSequence {
  private readonly rdns: ReadonlyArray<Asn1Object>;

  public constructor(obj: Asn1Object) {
    const children = obj.parseValueAsChildren();
    const rdns = new Array<Asn1Object>();
    for (const rdn of children) {
      rdns.push(rdn);
    }

    this.rdns = rdns;
  }

  public equals(obj: RDNSequence): boolean {
    if (this.rdns.length != obj.rdns.length) {
      return false;
    }

    for (let i = 0; i < this.rdns.length; i++) {
      if (
        HexCoder.encode(this.rdns[i].getBytes()) !==
        HexCoder.encode(obj.rdns[i].getBytes())
      ) {
        return false;
      }
    }

    return true;
  }

  public containsSelector(selector: string): boolean {
    const [name, value] = selector.split("=");
    const oid = RDNSequence.getSelectorOid(name);
    for (const rdn of this.rdns) {
      const attribute = new Attribute(
        rdn.parseValueAsChildren().at(0) as Asn1Object,
      );
      // TODO: Parse value according to attribute
      if (
        attribute.type === oid &&
        attribute.value?.parseValueAsAscii() === value
      ) {
        return true;
      }
    }

    return false;
  }

  private static getSelectorOid(selectorName: string): string {
    switch (selectorName?.toUpperCase()) {
      case "CN":
        return "2.5.4.3";
      case "C":
        return "2.5.4.6";
      case "L":
        return "2.5.4.7";
      case "O":
        return "2.5.4.10";
      case "OU":
        return "2.5.4.11";
      case "E":
        return "E";
      default:
        throw new Error("Unknown selector");
    }
  }
}
