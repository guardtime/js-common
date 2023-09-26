import { Pkcs7EnvelopeContentVerifier } from "./Pkcs7EnvelopeContentVerifier";
import { Asn1Object } from "../../asn1/Asn1Object";
import { VerificationResult } from "./VerificationResult";
import { HexCoder } from "../../coders/HexCoder";
import moment from "moment/moment";
import crypto from "node:crypto";
import { sha224, sha256 } from "@noble/hashes/sha256";
import { sha384, sha512, sha512_224, sha512_256 } from "@noble/hashes/sha512";
import { Certificate } from "./Certificate";
import { SignedData } from "./SignedData";
import { ChainLink } from "./ChainLink";
import { Asn1ByteInputStream } from "../../asn1/Asn1ByteInputStream";
import { SubjectPublicKeyInfo } from "./SubjectPublicKeyInfo";

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
            const result = this.digest(
              signer.digestAlgorithm.identifier,
              signedData,
            );
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
          certificate.getSubjectPublicKeyInfo().getBytes(),
        );

        const inputData = new Uint8Array(
          signer.authenticatedAttributes?.getBytes() as Uint8Array,
        );
        inputData.set([0x31]);
        if (
          !(await publicKey.verifySignature(
            signer.digestAlgorithm.identifier,
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

  private digest(oid: string, data: Uint8Array): Uint8Array {
    switch (oid) {
      case "2.16.840.1.101.3.4.2.1":
        return sha256(data);
      case "2.16.840.1.101.3.4.2.2":
        return sha384(data);
      case "2.16.840.1.101.3.4.2.3":
        return sha512(data);
      case "2.16.840.1.101.3.4.2.4":
        return sha224(data);
      case "2.16.840.1.101.3.4.2.5":
        return sha512_224(data);
      case "2.16.840.1.101.3.4.2.6":
        return sha512_256(data);
      default:
        throw new Error("Invalid signer info digest algorithm");
    }
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
        parentCertificate.getSubjectPublicKeyInfo().getBytes(),
      );

      if (
        await publicKey.verifySignature(
          certificate.algorithm,
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

export interface SpkiFactory {
  create(bytes: Uint8Array): Promise<PublicKey>;
}

export interface PublicKey {
  verifySignature(
    algorithm: string,
    data: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean>;
}

export class NodeSpkiFactory implements SpkiFactory {
  public async create(bytes: Uint8Array): Promise<PublicKey> {
    return new NodePublicKey(
      crypto.createPublicKey({
        key: bytes as Buffer,
        format: "der",
        type: "spki",
      }),
    );
  }
}

export class NodePublicKey implements PublicKey {
  private readonly publicKey: crypto.KeyObject;

  public constructor(key: crypto.KeyObject) {
    this.publicKey = key;
  }

  public async verifySignature(
    algorithm: string,
    data: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    return crypto.verify(
      this.getAlgorithm(algorithm),
      data,
      this.publicKey,
      signature,
    );
  }

  private getAlgorithm(algorithm: string) {
    switch (algorithm) {
      case "1.2.840.113549.1.1.11":
        return "sha256WithRSAEncryption";
      case "1.2.840.113549.1.1.12":
        return "sha384WithRSAEncryption";
      case "1.2.840.113549.1.1.13":
        return "sha512WithRSAEncryption";
      default:
        throw new Error("Unsupported algorithm");
    }
  }
}

export class BrowserPublicKey implements PublicKey {
  private readonly publicKeyInfo: SubjectPublicKeyInfo;

  public constructor(publicKeyInfo: SubjectPublicKeyInfo) {
    this.publicKeyInfo = publicKeyInfo;
  }

  public async verifySignature(
    algorithm: string,
    data: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    const publicKey = await crypto.subtle.importKey(
      "spki",
      this.publicKeyInfo.getBytes(),
      this.getPublicKeyAlgorithmParams(algorithm),
      false,
      ["verify"],
    );

    return crypto.subtle.verify(
      this.getVerifyAlgorithmParams(algorithm),
      publicKey,
      signature,
      data,
    );
  }

  private getVerifyAlgorithmParams(algorithm: string) {
    switch (algorithm) {
      case "1.2.840.113549.1.1.11":
      case "1.2.840.113549.1.1.12":
      case "1.2.840.113549.1.1.13":
        return {
          name: "RSASSA-PKCS1-v1_5",
        };
      default:
        throw new Error("Unsupported algorithm");
    }
  }

  private getPublicKeyAlgorithmParams(algorithm: string) {
    switch (algorithm) {
      case "1.2.840.113549.1.1.11":
        return {
          name: "RSASSA-PKCS1-v1_5",
          hash: "SHA-256",
        };
      case "1.2.840.113549.1.1.12":
        return {
          name: "RSASSA-PKCS1-v1_5",
          hash: "SHA-384",
        };
      case "1.2.840.113549.1.1.13":
        return {
          name: "RSASSA-PKCS1-v1_5",
          hash: "SHA-512",
        };
      default:
        throw new Error("Unsupported algorithm");
    }
  }
}

export class BrowserSpkiFactory implements SpkiFactory {
  async create(bytes: Uint8Array): Promise<PublicKey> {
    return new BrowserPublicKey(
      new SubjectPublicKeyInfo(new Asn1ByteInputStream(bytes).readAsn1Object()),
    );
  }
}
