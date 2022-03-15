import bigInteger from "big-integer";
import { X509 } from "../../src/crypto/X509";
import { HexCoder } from "../../src/coders/HexCoder";
import { Base64Coder } from "../../src/coders/Base64Coder";

const certBase64 =
  "MIICtjCCAZ4CAQEwDQYJKoZIhvcNAQELBQAwITELMAkGA1UEAxMCSDMxEjAQBgNVBAoTCUd1YXJkdGltZTAeFw0xMjExMjYxMzAwMTZaFw0xNDEyMjYxMzAwMTZaMCExCzAJBgNVBAMTAkgzMRIwEAYDVQQKEwlHdWFyZHRpbWUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDVkmSzH2Au23FOAGkCMTdCZUoHCcOHV7EPqVxFmwea01gS0nDfAjzFUcudvgYRtaw6r6r4ZPLC+pqBI0W7FjeVpRQAuKypYGhie2IEd2FAQLDB4gnJl68Z7K9B+Njc8rvwKbrqix+N3ReqFz9IENbwtGrXj90SMFBoCofkmUCe+fy5H/YYjhud7wnZUhYPw7DsYU+5eqAh9dNXNSD4gxOLDoZgID49G953fS2pkgdZKIWpZl+/hftiTDLD92NB0HYwoqEJZZGSM+RUKMxPeRiHz6goGcqoXp/WjeXyd5uiP4TQX8KsvAQQDTBrBs8DFbFlL7MOEzM+vvV2PdFdU0bRAgMBDskwDQYJKoZIhvcNAQELBQADggEBAL/Invma9hUUj7tcZAKKNlZm2bktd6jguW+eFUbf7m1zfSLw3sq85mwFkl8hSDlV/d4pasJJCd8KmGLki5T9BM/TAjvzf1g2orBGMArhZkYNnYkuJTHcxetLFqtyBxdMKGiObmhfTI1YNAckomnvsausJ8ejsKKFxFTcWQ1TOeL3v3N/sZ/c/pwVd80ZbTIo/k/dFwbRVkhuj3Q+DDi/8tlcGXSAppBVX+uFqDGudu3TZ8XQY7VX7ZSH/2rIO5SZm0CbgAOFYQitDLKLIXEBS6R4W4n559L+dXIaStAR3U8Jmx8WXWMSsa1FJVynyiVLUMMw07mVgQGUs2IK81ghXsY=";
const signedDataHex =
  "30290204538D1000042101BFA2FFF68565AEDBB3F8FF7438443E0B260ED04E6CB27C36294CFC4C7A0267C3";
const signatureHex =
  "ABA3BADCE5F7672E7ECB4AE02923D22F33C4F0603AB0B0ABD5B156C4442D02C88EDA8466785E031922E49BE62B6524DFC917BC689A8D71420B2F99ECE8FA135716715C81E956A4878C2D75224184C53443D5708A8F9486107E53F7FF9ACF6869773F08459A835F65379782B6EC55050A1A49FF62131C9D5A0E1AFB0BD9B02BBABB67689CBDAED4602C12B55139B657C2C4B96515A87878F2EC73A5D82A5810BBDB142C3A391B80D901792B57E54FA08F0973D6F408677FA35DBEEDDA3E1901570335B332726FD5B2FDAF580AB14B492808CFA6EF1F43CCB57B58D27A09CC6E59950E9ADDB4BFC4DC48BDA29A2029AD841C6FB4E4889369D651686656FC341C28";

const certBytes = Base64Coder.decode(certBase64);
const dataBytes = HexCoder.decode(signedDataHex);
const signatureBytes = HexCoder.decode(signatureHex);

describe("X509", () => {
  it("verify cert, signature and data happy path", () => {
    const result = X509.verify(certBytes, dataBytes, signatureBytes);
    expect(result).toBe(true);
  });

  it("verify cert if it is okay during time", () => {
    expect(X509.isCertificateValidDuring(certBytes, bigInteger(0))).toBeFalsy();
    expect(
      X509.isCertificateValidDuring(certBytes, bigInteger(13854708160))
    ).toBeFalsy();
    expect(
      X509.isCertificateValidDuring(certBytes, bigInteger(1385470816))
    ).toBeTruthy();
  });

  it("Bad data returns false", () => {
    const badDataBytes = HexCoder.decode("30");
    const result = X509.verify(certBytes, badDataBytes, signatureBytes);
    expect(result).toBe(false);
  });
});
