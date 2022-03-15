import { HashAlgorithm } from "../hash/HashAlgorithm.js";
import TypedArray = NodeJS.TypedArray;

export interface ICryptoApi {
  HMAC: ICryptoHMAC;
  Hash: ICryptoHash;
  RSA: ICryptoRSA;
  getRandomValues(typedArray: TypedArray): TypedArray;
}

export interface ICryptoHMAC {
  digest(
    algorithm: HashAlgorithm,
    key: Uint8Array,
    data: Uint8Array
  ): Promise<Uint8Array>;
}

export interface ICryptoHash {
  digest(algorithm: HashAlgorithm, data: Uint8Array): Promise<Uint8Array>;
}

export interface ICryptoRSA {
  verify(
    certificateBytes: Uint8Array,
    signedData: Uint8Array,
    signature: Uint8Array
  ): Promise<boolean>;
}
