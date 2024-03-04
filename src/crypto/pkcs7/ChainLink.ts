import { Certificate } from "./Certificate.js";

export type ChainLink = { certificate: Certificate; parents: ChainLink[] };
