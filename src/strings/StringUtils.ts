/**
 * Add tab prefix to each line of string
 * @param value string
 * @returns string prefixed string
 */
export const tabPrefix = (value: string): string => {
  if (typeof value !== "string") {
    throw new Error("Value not string");
  }
  let result = "";
  const lines = value.split("\n");
  for (let i = 0; i < lines.length; i++) {
    result += "    ";
    result += lines[i];
    if (i !== lines.length - 1) {
      result += "\n";
    }
  }

  return result;
};
