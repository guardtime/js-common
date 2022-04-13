import forge from "node-forge";

export class CMSVerification {
  /**
   * Transforms input signature into a forge pkcs7 signature
   * @param signatureValue - the signature in Uint8Array format
   * @param signedBytes - if the signedBytes are not included in the signature, then they must be included here.
   * If signed bytes are included in the signature, then set this as null
   * @param trustedCertificates - list of trusted root ceritificates in PEM format
   * @param selector
   * @returns the result of the verify function
   */
  static verifyFromBytes(
    signatureValue: Uint8Array,
    signedBytes: Uint8Array | string | null,
    trustedCertificates: Array<string>,
    selector: string | null
  ): boolean {
    const signatureBuffer = new forge.util.ByteStringBuffer(
      signatureValue.buffer
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const signature = forge.pkcs7.messageFromAsn1(
      forge.asn1.fromDer(signatureBuffer)
    );

    return this.verify(signature, signedBytes, trustedCertificates, selector);
  }

  /**
   * Transforms input signature into a forge pkcs7 signature
   * @param signatureValue - the signature in PEM format
   * @param signedBytes - if the signedBytes are not included in the signature, then they must be included here.
   * If signed bytes are included in the signature, then set this as null
   * @param trustedCertificates - list of trusted root ceritificates in PEM format
   * @param selector
   * @returns the result of the verify function
   */
  static verifyFromPem(
    signatureValue: string,
    signedBytes: Uint8Array | string | null,
    trustedCertificates: Array<string>,
    selector: string | null
  ): boolean {
    const signature = forge.pkcs7.messageFromPem(
      signatureValue
    ) as forge.pkcs7.PkcsSignedData;
    return this.verify(signature, signedBytes, trustedCertificates, selector);
  }

  /**
   * Function that verifies attached or detached signature and check that it is signed by the given trusted certificate
   * @param signature - the pkcs7 signature
   * @param signedBytes - if the signedBytes are not included in the signature, then they must be included here.
   * If signed bytes are included in the signature, then set this as null
   * @param trustedCertificates - list of trusted root ceritificates in PEM format
   * @param selector - certificate attribute selector
   * @returns boolean value whether the signature was verified
   */
  private static verify(
    signature: forge.pkcs7.PkcsSignedData,
    signedBytes: Uint8Array | string | null,
    trustedCertificates: Array<string>,
    selector: string | null
  ): boolean {
    if (signedBytes !== null) {
      signature.content = new forge.util.ByteStringBuffer(signedBytes);
    }

    if (selector == null || selector.length == 0) {
      return false;
    }

    const verifySelector = this.verifyCertificateSubject(
      signature.certificates[0],
      selector
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const verified = signature.verify(
      forge.pki.createCaStore(trustedCertificates)
    );

    return verified && verifySelector;
  }

  /**
   * Function that verifies the given certificate subject against the selectorString values
   * @param certificate - The certificate in forge.pki.Certificate format.
   * @param selectorString - The subject selector as a string in the format "key=value,key=value"
   *
   * @returns true if the selectors match and false in other cases.
   */
  static verifyCertificateSubject(
    certificate: forge.pki.Certificate,
    selectorString: string | null
  ): boolean {
    if (selectorString == null || selectorString.length == 0) {
      return false;
    }
    const selectorsArray = selectorString.split(",");
    for (const selector of selectorsArray) {
      const selectorArray = selector.split("=");
      let selectorField = selectorArray[0];
      const selectorValue = selectorArray[1];
      if (selectorField.length > 2) {
        selectorField = this.getFieldShortName(selectorField);
      }
      const subject = certificate.subject.getField(selectorField);
      if (subject !== null) {
        const value = subject.value;
        if (value !== selectorValue) {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  }

  /**
   * Converts the long names keys into short ones.
   * @param longName - the certificate subject value's long name
   */
  private static getFieldShortName(longName: string): string {
    switch (longName.toLowerCase()) {
      case "commonname":
        return "CN";
      case "countryname":
        return "C";
      case "localityname":
        return "L";
      case "stateorprovincename":
        return "O";
      case "organizationname":
        return "O";
      case "organizationalunitname":
        return "OU";
      case "emailaddress":
        return "E";
      default:
        return longName;
    }
  }
}
