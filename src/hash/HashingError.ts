/**
 * Hashing error
 */
export class HashingError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "HashingError";

    Object.setPrototypeOf(this, HashingError.prototype);
  }
}
