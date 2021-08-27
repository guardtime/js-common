import NodeHasher from "./NodeHasher.js";
import { Hasher } from "./Hasher.js";
import HashAlgorithm from "./HashAlgorithm.js";
import DataHash from "./DataHash.js";
import WebHasher from "./WebHasher.js";
import { isNodePlatform } from "../utils/Util.js";

export default class DataHasher implements Hasher {
  private hasher: Hasher;

  constructor(algorithm: HashAlgorithm) {
    if (isNodePlatform) {
      this.hasher = new NodeHasher(algorithm);
    } else {
      this.hasher = new WebHasher(algorithm);
    }
  }

  public get algorithm(): HashAlgorithm {
    return this.hasher.algorithm;
  }

  async digest(): Promise<DataHash> {
    return this.hasher.digest();
  }

  reset(): Hasher {
    return this.hasher.reset();
  }

  update(data: Uint8Array): Hasher {
    return this.hasher.update(data);
  }
}
