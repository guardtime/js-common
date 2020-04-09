import BigInteger from "big-integer";

// TODO: Get better library
function makeCRCTable(): number[] {
  let c: number;
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  return crcTable;
}

export default class CRC32 {
  private static crcTable = makeCRCTable();

  static create(value: Uint8Array): BigInteger.BigInteger {
    let crc = 0 ^ -1;
    for (let i = 0; i < value.length; i++) {
      crc = (crc >>> 8) ^ this.crcTable[(crc ^ value[i]) & 0xff];
    }

    return BigInteger((crc ^ -1) >>> 0);
  }
}
