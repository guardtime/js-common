export const isNodePlatform = !!(
  typeof process !== "undefined" &&
  process.versions &&
  process.versions.node
);
