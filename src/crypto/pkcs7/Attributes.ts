import { Attribute } from "./Attribute.js";
import { Asn1Object } from "../../asn1/Asn1Object.js";

export class Attributes {
  private readonly bytes: Uint8Array;
  private readonly attributes: ReadonlyArray<Attribute>;

  public constructor(obj: Asn1Object) {
    this.bytes = obj.getBytes();
    const children = obj.parseValueAsChildren();
    const attributes = new Array<Attribute>();
    for (const child of children) {
      attributes.push(new Attribute(child));
    }
    this.attributes = attributes;
  }

  public get(oid: string): Attribute[] {
    return this.attributes.filter((attribute) => attribute.type === oid);
  }

  public getBytes() {
    return new Uint8Array(this.bytes);
  }
}
