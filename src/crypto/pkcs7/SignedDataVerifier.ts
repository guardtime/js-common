import moment from "moment";
import { Pkcs7EnvelopeContentVerifier } from "./Pkcs7EnvelopeContentVerifier.js";
import { Asn1Object } from "../../asn1/Asn1Object.js";
import { HexCoder } from "../../coders/HexCoder.js";
import { Certificate } from "./Certificate.js";
import { SignedData } from "./SignedData.js";
import { ChainLink } from "./ChainLink.js";
import { SpkiFactory } from "./SpkiFactory.js";
import { DigestAlgorithm } from "./DigestAlgorithm.js";
import { Result, ResultCode } from "../../verification/Result.js";
import { SignerInfo } from "./SignerInfo.js";

enum Pkcs9AttributeType {
  CONTENT_TYPE = "1.2.840.113549.1.9.3",
  MESSAGE_DIGEST = "1.2.840.113549.1.9.4",
  SIGNING_TIME = "1.2.840.113549.1.9.5",
}

enum ResultTypes {
  AUTHENTICATED_ATTRIBUTES_EXISTENCE = "AuthenticatedAttributesExistence",
  AUTHENTICATED_ATTRIBUTES_CONTENT_TYPE_EXISTENCE = "ContentTypeInAuthenticatedAttributesExistence",
  AUTHENTICATED_ATTRIBUTES_MESSAGE_DIGEST_EXISTENCE = "MessageDigestInAuthenticatedAttributesExistence",
  MESSAGE_DIGEST_VERIFICATION = "MessageDigestVerification",
  SIGNER_INFO_CERTIFICATE_EXISTENCE = "SignerInfoCertificateExistence",
  SIGNER_INFO_ISSUER_MATCHES_CERTIFICATE = "SignerInfoIssuerMatchesCertificateIssuer",
  CERTIFICATE_SUBJECT_CONTAINS_SELECTOR = "CertificateSubjectContainsSelector",
  CERTIFICATE_IS_VALID_AT_GIVEN_TIME = "CertificateIsValidAtGivenTime",
  CERTIFICATE_CHAIN_VERIFICATION = "CertificateChainVerification",
  SIGNER_INFO_SIGNATURE_VERIFICATION = "SignerInfoSignatureVerification",
}

export class SignedDataVerifier
  implements Pkcs7EnvelopeContentVerifier<SignedData, string>
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

  private async verifySignerInfo(
    signer: SignerInfo,
    signedData: Uint8Array,
    certificateList: ReadonlyArray<Certificate>,
  ): Promise<ReadonlyArray<Result<string>>> {
    const results = new Array<Result<string>>();
    // Check if authenticated attributes exist for signer
    if (!signer.authenticatedAttributes) {
      results.push(
        new Result(
          ResultTypes.AUTHENTICATED_ATTRIBUTES_EXISTENCE,
          ResultCode.FAIL,
          "Authenticated attributes are missing",
        ),
      );
      return results;
    }
    results.push(
      new Result(ResultTypes.AUTHENTICATED_ATTRIBUTES_EXISTENCE, ResultCode.OK),
    );

    // Check if signer has content type in authenticated attributes
    if (
      signer.authenticatedAttributes.get(Pkcs9AttributeType.CONTENT_TYPE)
        .length === 0
    ) {
      results.push(
        new Result(
          ResultTypes.AUTHENTICATED_ATTRIBUTES_CONTENT_TYPE_EXISTENCE,
          ResultCode.FAIL,
          "Content type is missing from authenticated attributes",
        ),
      );
      return results;
    }
    results.push(
      new Result(
        ResultTypes.AUTHENTICATED_ATTRIBUTES_CONTENT_TYPE_EXISTENCE,
        ResultCode.OK,
      ),
    );

    // Check if message digest exist in authenticated attributes
    const messageDigests = signer.authenticatedAttributes.get(
      Pkcs9AttributeType.MESSAGE_DIGEST,
    );
    if (messageDigests.length === 0) {
      results.push(
        new Result(
          ResultTypes.AUTHENTICATED_ATTRIBUTES_MESSAGE_DIGEST_EXISTENCE,
          ResultCode.FAIL,
          "Message digest is missing from authenticated attributes",
        ),
      );
      return results;
    }
    results.push(
      new Result(
        ResultTypes.AUTHENTICATED_ATTRIBUTES_MESSAGE_DIGEST_EXISTENCE,
        ResultCode.OK,
      ),
    );

    // Check if message digest are correct
    for (const attribute of messageDigests) {
      const result = DigestAlgorithm.getDigestAlgorithm(
        signer.digestAlgorithm.identifier,
      ).digest(signedData);
      const digest = attribute.value
        ?.parseValueAsChildren()
        .at(0)
        ?.parseValueAsBytes();

      if (!digest || HexCoder.encode(result) !== HexCoder.encode(digest)) {
        results.push(
          new Result(
            ResultTypes.MESSAGE_DIGEST_VERIFICATION,
            ResultCode.FAIL,
            "Message digest attribute does not match signed data digest",
          ),
        );
        return results;
      }
      results.push(
        new Result(ResultTypes.MESSAGE_DIGEST_VERIFICATION, ResultCode.OK),
      );
    }

    // Signer has certificates
    const certificates = certificateList.filter((certificate) =>
      certificate.serialNumber.eq(signer.issuerAndSerialNumber.serialNumber),
    );
    if (certificates.length === 0) {
      results.push(
        new Result(
          ResultTypes.SIGNER_INFO_CERTIFICATE_EXISTENCE,
          ResultCode.FAIL,
          "Signer Info does not have any certificate",
        ),
      );
      return results;
    }
    results.push(
      new Result(ResultTypes.SIGNER_INFO_CERTIFICATE_EXISTENCE, ResultCode.OK),
    );

    // Certificate has signer as issuer
    for (const certificate of certificates) {
      if (!certificate.issuer.equals(signer.issuerAndSerialNumber.issuer)) {
        results.push(
          new Result(
            ResultTypes.SIGNER_INFO_ISSUER_MATCHES_CERTIFICATE,
            ResultCode.FAIL,
            "Signer Info issuer did not match certificate issuer",
          ),
        );
        return results;
      }
      results.push(
        new Result(
          ResultTypes.SIGNER_INFO_ISSUER_MATCHES_CERTIFICATE,
          ResultCode.OK,
        ),
      );

      // Certificate selector matches required selector
      const selectors = this.selectors.split(",");
      for (const selector of selectors) {
        // TODO: Fix selector verification
        if (!certificate.subject.containsSelector(selector)) {
          results.push(
            new Result(
              ResultTypes.CERTIFICATE_SUBJECT_CONTAINS_SELECTOR,
              ResultCode.FAIL,
              "Certificate subject did not contain selector information",
            ),
          );
          return results;
        }
        results.push(
          new Result(
            ResultTypes.CERTIFICATE_SUBJECT_CONTAINS_SELECTOR,
            ResultCode.OK,
          ),
        );
      }

      // Check if signing time is in attributes
      const validityAttributes = signer.authenticatedAttributes.get(
        Pkcs9AttributeType.SIGNING_TIME,
      );
      // Validate certificate against time in attributes or against current time
      if (validityAttributes) {
        for (const attribute of validityAttributes) {
          const attributeValue = attribute.value?.parseValueAsChildren().at(0);

          const time = attributeValue?.parseValueAsTime();
          if (!time || !certificate.isValidAt(time)) {
            results.push(
              new Result(
                ResultTypes.CERTIFICATE_IS_VALID_AT_GIVEN_TIME,
                ResultCode.FAIL,
                "Certificate is not valid in given signing time",
              ),
            );
            return results;
          }
          results.push(
            new Result(
              ResultTypes.CERTIFICATE_IS_VALID_AT_GIVEN_TIME,
              ResultCode.OK,
            ),
          );
        }
      } else {
        if (!certificate.isValidAt(moment())) {
          results.push(
            new Result(
              ResultTypes.CERTIFICATE_IS_VALID_AT_GIVEN_TIME,
              ResultCode.FAIL,
              "Certificate is not valid in given signing time",
            ),
          );
          return results;
        }
        results.push(
          new Result(
            ResultTypes.CERTIFICATE_IS_VALID_AT_GIVEN_TIME,
            ResultCode.OK,
          ),
        );
      }

      // Validate certificate chain
      const chain = this.buildCertificateChain(certificate, certificateList);

      const certificateVerificationResult =
        await this.verifyCertificateChain(chain);
      results.push(certificateVerificationResult);
      if (certificateVerificationResult.getResultCode() !== ResultCode.OK) {
        return results;
      }

      // Verify pkcs7 signature
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
          DigestAlgorithm.getDigestAlgorithm(signer.digestAlgorithm.identifier),
          inputData,
          signer.getSignature(),
        ))
      ) {
        results.push(
          new Result(
            ResultTypes.SIGNER_INFO_SIGNATURE_VERIFICATION,
            ResultCode.FAIL,
            "Signer info signature verification failed",
          ),
        );
        return results;
      }

      results.push(
        new Result(
          ResultTypes.SIGNER_INFO_SIGNATURE_VERIFICATION,
          ResultCode.OK,
        ),
      );
    }

    // TODO: Verify that cert is not revoked
    return results;
  }

  public async verify(
    content: SignedData,
    signedData: Uint8Array,
  ): Promise<Result<string>> {
    const results = new Array<Result<string>>();
    for (const signer of content.signerInfos) {
      results.push(
        Result.CREATE_FROM_RESULTS(
          "Signer verification",
          await this.verifySignerInfo(signer, signedData, content.certificates),
        ),
      );
    }

    return Result.CREATE_FROM_RESULTS("Signed data verification", results);
  }

  // TODO: Verify CRL
  private async verifyCertificateChain(
    link: ChainLink,
  ): Promise<Result<string>> {
    const certificate = link.certificate;
    for (const parentChainLink of link.parents) {
      const parentCertificate = parentChainLink.certificate;
      const publicKey = await this.publicKeyFactory.create(
        parentCertificate.getSubjectPublicKeyInfo(),
      );

      if (
        await publicKey.verifySignature(
          DigestAlgorithm.getDigestAlgorithm(certificate.signatureAlgorithm),
          certificate.getTbsCertificateBytes(),
          certificate.getSignatureBytes(),
        )
      ) {
        return parentChainLink.parents.length === 0
          ? new Result(
              ResultTypes.CERTIFICATE_CHAIN_VERIFICATION,
              ResultCode.OK,
            )
          : this.verifyCertificateChain(parentChainLink);
      }
    }

    return new Result(
      ResultTypes.CERTIFICATE_CHAIN_VERIFICATION,
      ResultCode.FAIL,
      "Certificate chain verification failed",
    );
  }

  // TODO: Fix certificate chain building
  private buildCertificateChain(
    certificate: Certificate,
    certificates: ReadonlyArray<Certificate>,
  ): ChainLink {
    const parents = certificates.filter(
      (parent) =>
        parent.subject.equals(certificate.issuer) && parent !== certificate,
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
        this.buildCertificateChain(
          parent,
          certificates.filter((cert) => cert === certificate),
        ),
      ),
    };
  }
}
