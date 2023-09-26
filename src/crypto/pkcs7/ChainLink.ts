import { Certificate } from "./Certificate";

export type ChainLink = { certificate: Certificate; parents: ChainLink[] };
