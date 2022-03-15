interface VerificationChecks {
  passed: string[];
  skipped: string[];
  failed: string[];
}

/**
 * Verification results shows passed and failed verification checks.
 *
 * @constructor
 * @param {string} name - Verification name.
 * @deprecated
 */
export class VerificationResult {
  public readonly name: string;
  public readonly checks: VerificationChecks;

  constructor(name: string) {
    this.name = name;
    this.checks = { passed: [], failed: [], skipped: [] };
  }

  /**
   *
   * @param {boolean} predicate
   * @param {string} passed
   * @param {string} failed
   */
  check(predicate: boolean, passed: string, failed: string): void {
    if (predicate) {
      this.addPass(passed);
    } else {
      this.addFailure(failed);
    }
  }

  /**
   *
   * @param {string} message
   */
  addPass(message: string): void {
    this.checks.passed.push(message);
  }

  /**
   *
   * @param {string} message
   */
  addFailure(message: string): void {
    this.checks.failed.push(message);
  }

  /**
   *
   * @param message
   */
  skip(message: string): void {
    this.checks.skipped.push(message);
  }

  /**
   * @returns {string}
   */
  message(): string {
    return `${this.name} ${this.status}`;
  }

  /**
   * @returns {boolean}
   */
  get success(): boolean {
    return !this.failed && !this.incomplete;
  }
  /**
   * @returns {boolean}
   */
  get failed(): boolean {
    return !!this.checks.failed.length;
  }
  /**
   * @returns {boolean}
   */
  get incomplete(): boolean {
    return !!this.checks.skipped.length;
  }

  get status(): string | null {
    if (this.success) {
      return "passed";
    } else if (this.failed) {
      return "failed";
    } else if (this.incomplete) {
      return "incomplete";
    }

    return null;
  }
}
