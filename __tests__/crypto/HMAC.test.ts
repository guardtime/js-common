import HashAlgorithm from "../../src/hash/HashAlgorithm";
import HMAC from "../../src/crypto/HMAC";
import HexCoder from "../../src/coders/HexCoder";

describe("HMAC", () => {
  it("Check if uses node hmac", async () => {
    const hmacBytes = await HMAC.digest(
      HashAlgorithm.SHA2_256,
      new Uint8Array(5).fill(1),
      new Uint8Array(10)
    );
    expect(hmacBytes).toEqual(
      HexCoder.decode(
        "4B6BEC8170142F1965C7D178321E04B6102F0B68C833CFDADED5B42C8D59F869"
      )
    );
  });
});
