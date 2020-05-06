/**
 * Compare byte arrays.
 * @param arr1 Typed array 1.
 * @param arr2 Typed array 2.
 * @returns True if arrays are equal.
 */
export function compareUint8Arrays(
  arr1: Uint8Array,
  arr2: Uint8Array
): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i += 1) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Compare arrays.
 * @param arr1 First array.
 * @param arr2 Second array.
 * @returns True if arrays are equal.
 */
export function compareArrayEquals<T extends IEquals>(
  arr1: T[],
  arr2: T[]
): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i += 1) {
    if (!arr1[i].equals(arr2[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Equality checking interface.
 */
interface IEquals {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  equals(object: any): boolean;
}
