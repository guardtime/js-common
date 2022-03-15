import { HashAlgorithm } from "./HashAlgorithm.js";

export class IDataHash {
  hashAlgorithm: HashAlgorithm;
  value: Uint8Array;
  imprint: Uint8Array;
}
