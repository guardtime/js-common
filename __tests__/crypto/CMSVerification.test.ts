import { Base64Coder } from "../../src/coders/Base64Coder.js";
import { Utf8Converter } from "../../src/strings/Utf8Converter.js";
import { NodeSpkiFactory } from "../../src/crypto/pkcs7/NodeSpkiFactory.js";
import { Pkcs7Envelope } from "../../src/crypto/pkcs7/Pkcs7Envelope.js";
import {
  Pkcs7ContentType,
  Pkcs7EnvelopeVerifier,
} from "../../src/crypto/pkcs7/Pkcs7EnvelopeVerifier.js";
import { SignedDataVerifier } from "../../src/crypto/pkcs7/SignedDataVerifier.js";
import { ResultCode } from "../../src/verification/Result.js";
import {
  exampleContent,
  exampleSignatureDetached,
  trustedCertificate,
} from "./Certificates.js";

describe("CMS", () => {
  it("verify detached signature", async () => {
    const envelope = Pkcs7Envelope.createFromBytes(
      Base64Coder.decode(exampleSignatureDetached),
    );
    const verifier = new Pkcs7EnvelopeVerifier();
    verifier.registerVerifier(
      Pkcs7ContentType.SIGNED_DATA,
      new SignedDataVerifier(
        new NodeSpkiFactory(),
        Base64Coder.decode(trustedCertificate),
        "CN=*.z.guardtime.com",
      ),
    );

    const result = await verifier.verify(
      envelope,
      Utf8Converter.ToBytes(exampleContent),
    );

    expect(result.getResultCode()).toBe(ResultCode.OK);
  });
});
