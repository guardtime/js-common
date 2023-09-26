import { UnsignedLongCoder } from "../coders/UnsignedLongCoder";
import { Asn1Object } from "./Asn1Object";

export class Asn1ByteInputStream {
  private readonly data: Uint8Array;
  private position: number;
  private readonly length: number;

  /**
   * TLV input stream constructor.
   * @param bytes Data bytes.
   */
  public constructor(bytes: Uint8Array) {
    this.data = new Uint8Array(bytes);
    this.position = 0;
    this.length = bytes.length;
  }

  /**
   * Get stream position.
   * @returns Stream position.
   */
  public getPosition(): number {
    return this.position;
  }

  /**
   * Get stream length.
   * @returns Stream length.
   */
  public getLength(): number {
    return this.length;
  }

  public readAsn1Object(): Asn1Object {
    const startPosition = this.getPosition();
    const typeByte = this.readByte();
    const isTag = typeByte >> 5 === 0b101;
    const type = typeByte & 0b00011111;
    const value = this.read(this.readLength());

    return new Asn1Object(
      isTag,
      this.data.subarray(startPosition, this.getPosition()),
      type,
      value,
    );
  }

  /**
   * Read next byte from stream.
   * @throws If available bytes is shorter than read bytes length.
   */
  public readByte(): number {
    if (this.length <= this.position) {
      throw new Error("Could not read byte: Premature end of data");
    }

    const byte: number = this.data[this.position] & 0xff;
    this.position += 1;

    return byte;
  }

  /**
   * Read number of bytes from stream.
   * @param length Read bytes length.
   * @throws If available bytes is shorter than read bytes length.
   */
  public read(length: number): Uint8Array {
    if (this.length < this.position + length) {
      throw new Error(`Could not read ${length} bytes: Premature end of data`);
    }

    const data: Uint8Array = this.data.subarray(
      this.position,
      this.position + length,
    );
    this.position += length;

    return data;
  }

  private readLength(): number {
    const lengthByte = this.readByte();
    if (lengthByte >> 7) {
      return UnsignedLongCoder.decode(
        this.read(lengthByte & 0b01111111),
      ).toJSNumber();
    }

    return UnsignedLongCoder.decode(
      new Uint8Array([lengthByte & 0b01111111]),
    ).toJSNumber();
  }
}
