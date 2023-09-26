import { Pkcs7EnvelopeContentVerifier } from "./Pkcs7EnvelopeContentVerifier";
import { Asn1Object } from "../../asn1/Asn1Object";
import { VerificationResult } from "./VerificationResult";
import { HexCoder } from "../../coders/HexCoder";
import moment from "moment/moment";
import { Certificate } from "./Certificate";
import { SignedData } from "./SignedData";
import { ChainLink } from "./ChainLink";
import { SpkiFactory } from "./SpkiFactory";
import { DigestAlgorithm } from "./DigestAlgorithm";

enum Pkcs9AttributeType {
  CONTENT_TYPE = "1.2.840.113549.1.9.3",
  MESSAGE_DIGEST = "1.2.840.113549.1.9.4",
  SIGNING_TIME = "1.2.840.113549.1.9.5",
}

export class SignedDataVerifier
  implements Pkcs7EnvelopeContentVerifier<SignedData>
{
  private readonly trustedCertificate: Certificate;
  private readonly selectors: string;
  private readonly publicKeyFactory: SpkiFactory;

  public constructor(
    publicKeyFactory: SpkiFactory,
    trustedCertificate: Uint8Array,
    selectors: string,
  ) {
    this.publicKeyFactory = publicKeyFactory;
    this.trustedCertificate = new Certificate(
      Asn1Object.createFromBytes(trustedCertificate),
    );
    this.selectors = selectors;
  }

  public async verify(
    content: SignedData,
    signedData: Uint8Array,
  ): Promise<VerificationResult> {
    if (!(content instanceof SignedData)) {
      return VerificationResult.error(
        "Pkcs7 content is not instance of SignedData",
      );
    }

    for (const signer of content.signerInfos) {
      const certificates = content.certificates.filter((certificate) =>
        certificate.serialNumber.eq(signer.issuerAndSerialNumber.serialNumber),
      );
      if (certificates.length === 0) {
        return VerificationResult.error("No certificates found for SignerInfo");
      }

      for (const certificate of certificates) {
        if (!certificate.issuer.equals(signer.issuerAndSerialNumber.issuer)) {
          return VerificationResult.error(
            "SignerInfo issuer did not match certificate issuer",
          );
        }

        const selectors = this.selectors.split(",");
        for (const selector of selectors) {
          // TODO: Fix selector verification
          if (!certificate.subject.containsSelector(selector)) {
            return VerificationResult.error(
              "Certificate subject did not contain selector information",
            );
          }
        }

        if (signer.authenticatedAttributes) {
          if (
            signer.authenticatedAttributes.get(Pkcs9AttributeType.CONTENT_TYPE)
              .length === 0
          ) {
            return VerificationResult.error(
              "Content type attribute is missing",
            );
          }

          const messageDigests = signer.authenticatedAttributes.get(
            Pkcs9AttributeType.MESSAGE_DIGEST,
          );
          if (messageDigests.length === 0) {
            return VerificationResult.error(
              "Message digest attribute is missing",
            );
          }

          for (const attribute of messageDigests) {
            //switch (signer.digestAlgorithm.identifier);

            const result = DigestAlgorithm.getDigestAlgorithm(
              signer.digestAlgorithm.identifier,
            ).digest(signedData);
            const digest = attribute.value
              ?.parseValueAsChildren()
              .at(0)
              ?.parseValueAsBytes();

            if (
              !digest ||
              HexCoder.encode(result) !== HexCoder.encode(digest)
            ) {
              return VerificationResult.error(
                "Data digest did not match signature message digest",
              );
            }
          }

          const validityAttributes = signer.authenticatedAttributes.get(
            Pkcs9AttributeType.SIGNING_TIME,
          );
          if (validityAttributes) {
            for (const attribute of validityAttributes) {
              const attributeValue = attribute.value
                ?.parseValueAsChildren()
                .at(0);

              const time = attributeValue?.parseValueAsTime();
              if (!time || !certificate.isValidAt(time)) {
                return VerificationResult.error(
                  "Certificate is not valid in given signing time",
                );
              }
            }
          } else {
            if (!certificate.isValidAt(moment())) {
              return VerificationResult.error(
                "Certificate is not valid in given signing time",
              );
            }
          }
        }

        const chain = this.buildCertificateChain(certificate, content);

        // Verify certificates
        const certificateVerificationResult = await this.verifyCertificateChain(
          chain,
        );
        if (!certificateVerificationResult.status) {
          return VerificationResult.error(
            "Certificate chain verification failed",
          );
        }

        const publicKey = await this.publicKeyFactory.create(
          certificate.getSubjectPublicKeyInfo(),
        );

        // TODO: Take digest algorithm from pkcs7 root instead of signer info if missing
        const inputData = new Uint8Array(
          signer.authenticatedAttributes?.getBytes() as Uint8Array,
        );
        inputData.set([0x31]);
        if (
          !(await publicKey.verifySignature(
            DigestAlgorithm.getDigestAlgorithm(
              signer.digestAlgorithm.identifier,
            ),
            inputData,
            signer.getSignature(),
          ))
        ) {
          return VerificationResult.failed();
        }
      }

      // TODO: Verify that cert is not revoked
    }

    return VerificationResult.success();
  }

  // TODO: Verify CRL
  private async verifyCertificateChain(
    link: ChainLink,
  ): Promise<VerificationResult> {
    const certificate = link.certificate;
    for (const parentChainLink of link.parents) {
      const parentCertificate = parentChainLink.certificate;
      if (!parentCertificate.subject.equals(certificate.issuer)) {
        continue;
      }

      const publicKey = await this.publicKeyFactory.create(
        parentCertificate.getSubjectPublicKeyInfo(),
      );

      if (
        await publicKey.verifySignature(
          this.getSignatureDigestAlgorithm(certificate.signatureAlgorithm),
          certificate.getTbsCertificateBytes(),
          certificate.getSignatureBytes(),
        )
      ) {
        return parentChainLink.parents.length === 0
          ? VerificationResult.success()
          : this.verifyCertificateChain(parentChainLink);
      }
    }

    return VerificationResult.failed();
  }

  private getSignatureDigestAlgorithm(algorithm: string) {
    switch (algorithm) {
      case "1.2.840.113549.1.1.11":
        return DigestAlgorithm.SHA256;
      case "1.2.840.113549.1.1.12":
        return DigestAlgorithm.SHA384;
      case "1.2.840.113549.1.1.13":
        return DigestAlgorithm.SHA512;
      default:
        throw new Error("Unsupported digest algorithm");
    }
  }

  private buildCertificateChain(
    certificate: Certificate,
    signedData: SignedData,
  ): ChainLink {
    const parents = signedData.certificates.filter((parent) =>
      parent.subject.equals(certificate.issuer),
    );

    if (parents.length === 0) {
      return {
        certificate,
        parents: [
          {
            certificate: this.trustedCertificate,
            parents: [],
          },
        ],
      };
    }

    return {
      certificate,
      parents: parents.map((parent) =>
        this.buildCertificateChain(parent, signedData),
      ),
    };
  }
}
