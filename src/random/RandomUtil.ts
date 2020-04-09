import BigInteger from "big-integer";

export const pseudoRandomLong = (): BigInteger.BigInteger => {
  return BigInteger.randBetween(0, 9223372036854775807);
};
