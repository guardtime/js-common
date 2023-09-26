export class VerificationResult {
  public readonly status: boolean;
  public readonly errorMessage: string;

  private constructor(status: boolean, error?: string) {
    this.status = status;
    this.errorMessage = error ?? "";
  }

  static success() {
    return new VerificationResult(true);
  }

  static error(error: string) {
    return new VerificationResult(false, error);
  }

  static failed() {
    return new VerificationResult(false);
  }
}
