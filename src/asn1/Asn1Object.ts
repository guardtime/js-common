import moment from "moment";
import { UnsignedLongCoder } from "../coders/UnsignedLongCoder.js";
import ASN1 from "@lapo/asn1js";

export class Asn1Object {
  public get isTag(): boolean {
    return this.asn1.tag.tagClass === 2 && this.asn1.tag.tagConstructed;
  }

  public get type(): number {
    return this.asn1.tag.tagNumber;
  }

  private asn1: ASN1;

  private constructor(asn1: ASN1) {
    this.asn1 = asn1;
  }

  static createFromBytes(bytes: Uint8Array): Asn1Object {
    return new Asn1Object(ASN1.decode(bytes));
  }

  parseValueAsChildren() {
    if (!this.asn1.sub) {
      return [];
    }

    const children = new Array<Asn1Object>();
    for (const child of this.asn1.sub) {
      children.push(new Asn1Object(child));
    }

    return children;
  }

  parseValueAsObjectIdentifier(): string {
    const result = [];
    const firstByte = this.asn1.stream.enc.at(this.asn1.posContent()) as number;
    if (firstByte === undefined) {
      throw new Error("Invalid value for object identifier: Not enough bytes");
    }
    const first = Math.floor(firstByte / 40);
    result.push(first);
    result.push(firstByte - first * 40);
    let value = 0;
    let position = this.asn1.posContent() + 1;
    while (position < this.asn1.posEnd()) {
      const byte = this.asn1.stream.enc.at(position++) as number;
      if (byte === undefined) {
        throw new Error(
          "Invalid value for object identifier: Not enough bytes",
        );
      }
      value = (value << 7) | (byte & 0b01111111);
      if (byte >> 7 === 0) {
        result.push(value);
        value = 0;
      }
    }

    return result.join(".");
  }

  parseValueAsInteger() {
    return UnsignedLongCoder.decode(
      (this.asn1.stream.enc as Uint8Array).subarray(
        this.asn1.posContent(),
        this.asn1.posEnd(),
      ),
    );
  }

  parseValueAsAscii(): string {
    return String.fromCharCode.apply(
      null,
      (this.asn1.stream.enc as Uint8Array).subarray(
        this.asn1.posContent(),
        this.asn1.posEnd(),
      ),
    );
  }

  parseValueAsUtcTime(): moment.Moment {
    return moment(this.parseValueAsAscii(), "YYMMDDHHmmssZ");
  }

  parseValueAsGeneralizedTime(): moment.Moment {
    return moment(this.parseValueAsAscii(), "YYYYMMDDHHmmssZ");
  }

  parseValueAsTime(): moment.Moment {
    if (this.type === 23) {
      return this.parseValueAsUtcTime();
    }

    if (this.type === 24) {
      return this.parseValueAsGeneralizedTime();
    }

    throw new Error("Invalid format for time.");
  }

  parseValueAsBytes(): Uint8Array {
    return (this.asn1.stream.enc as Uint8Array).subarray(
      this.asn1.posContent(),
      this.asn1.posEnd(),
    );
  }

  parseValueBitStringAsBytes(): Uint8Array {
    (this.asn1.stream.enc as Uint8Array).subarray(
      this.asn1.posContent(),
      this.asn1.posEnd(),
    );
    const padding = this.asn1.stream.enc.at(this.asn1.posContent()) as number;
    const bytes = (this.asn1.stream.enc as Uint8Array).subarray(
      this.asn1.posContent() + 1,
      this.asn1.posEnd(),
    );
    bytes.set([(bytes.at(-1) as number) << padding], bytes.length - 1);
    return bytes;
  }

  getBytes(): Uint8Array {
    return (this.asn1.stream.enc as Uint8Array).subarray(
      this.asn1.posStart(),
      this.asn1.posEnd(),
    );
  }
}
