import { UnsignedLongCoder } from "../coders/UnsignedLongCoder";
import moment from "moment";
import { Asn1ByteInputStream } from "./Asn1ByteInputStream";

export class Asn1Object {
  public readonly isTag: boolean;
  public readonly type: number;
  private readonly value: Uint8Array;
  private readonly bytes: Uint8Array;

  public constructor(
    isTag: boolean,
    bytes: Uint8Array,
    type: number,
    value: Uint8Array,
  ) {
    this.isTag = isTag;
    this.bytes = new Uint8Array(bytes);
    this.type = type;
    this.value = new Uint8Array(value);
  }

  static createFromBytes(bytes: Uint8Array): Asn1Object {
    const stream = new Asn1ByteInputStream(bytes);
    const obj = stream.readAsn1Object();
    if (stream.getPosition() !== stream.getLength()) {
      throw new Error("Unexpected input data: too many bytes");
    }

    return obj;
  }

  parseValueAsChildren() {
    const children: Asn1Object[] = [];
    const stream = new Asn1ByteInputStream(this.value);
    while (stream.getPosition() < stream.getLength()) {
      children.push(stream.readAsn1Object());
    }

    return children;
  }

  parseValueAsObjectIdentifier(): string {
    const result = [];
    const firstByte = this.value.at(0);
    if (firstByte === undefined) {
      throw new Error("Invalid value for object identifier: Not enough bytes");
    }
    const first = Math.floor(firstByte / 40);
    result.push(first);
    result.push(firstByte - first * 40);
    let value = 0;
    let position = 1;
    while (position < this.value.length) {
      const byte = this.value.at(position++);
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
    return UnsignedLongCoder.decode(this.value);
  }

  parseValueAsAscii(): string {
    return String.fromCharCode.apply(null, this.value);
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
    return new Uint8Array(this.value);
  }

  parseValueBitStringAsBytes(): Uint8Array {
    const padding = this.value.at(0) as number;
    const bytes = new Uint8Array(this.value.subarray(1));
    bytes.set([(bytes.at(-1) as number) << padding], bytes.length - 1);
    return bytes;
  }

  getBytes(): Uint8Array {
    return new Uint8Array(this.bytes);
  }
}
