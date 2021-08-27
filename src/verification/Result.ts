/*
 * GUARDTIME CONFIDENTIAL
 *
 * Copyright 2008-2020 Guardtime, Inc.
 * All Rights Reserved.
 *
 * All information contained herein is, and remains, the property
 * of Guardtime, Inc. and its suppliers, if any.
 * The intellectual and technical concepts contained herein are
 * proprietary to Guardtime, Inc. and its suppliers and may be
 * covered by U.S. and foreign patents and patents in process,
 * and/or are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Guardtime, Inc.
 * "Guardtime" and "KSI" are trademarks or registered trademarks of
 * Guardtime, Inc., and no license to trademarks is granted; Guardtime
 * reserves and retains all trademark rights.
 */

import { tabPrefix } from "../strings/StringUtils.js";

export enum ResultCode {
  OK,
  FAIL,
  NA,
}

/**
 * Verification result
 */
export class Result<Error> {
  private readonly ruleName: string;
  private readonly childResults: Result<Error>[] = [];
  private readonly verificationError: Error | null;
  private readonly resultCode: ResultCode;

  constructor(
    ruleName: string,
    resultCode: ResultCode,
    verificationError: Error | null = null,
    childResults: Result<Error>[] | null = null
  ) {
    this.ruleName = ruleName;
    this.resultCode = resultCode;
    this.verificationError = verificationError || null;

    if (childResults !== null) {
      this.childResults = childResults.slice();
    }
  }

  public static CREATE_FROM_RESULTS<T>(
    ruleName: string,
    childResults: Result<T>[]
  ): Result<T> {
    const lastResult: Result<T> =
      childResults.length > 0
        ? childResults[childResults.length - 1]
        : new Result<T>(ruleName, ResultCode.OK);

    return new Result<T>(
      ruleName,
      lastResult.resultCode,
      lastResult.verificationError,
      childResults
    );
  }

  public getResultCode(): ResultCode {
    return this.resultCode;
  }

  public getVerificationError(): Error | null {
    return this.verificationError;
  }

  public getRuleName(): string {
    return this.ruleName;
  }

  public getChildResults(): Result<Error>[] {
    return this.childResults.slice();
  }

  public toString(): string {
    let result = `VerificationResult ${this.getRuleName()} [${
      ResultCode[this.getResultCode()]
    }]`;

    if (this.childResults.length > 0) {
      result = this.writeChildResults(result);
    } else {
      result = this.writeVerificationError(result);
    }

    return result;
  }

  private writeChildResults(result: string): string {
    result += ":\n";
    for (let i = 0; i < this.childResults.length; i += 1) {
      result += tabPrefix(this.childResults[i].toString());
      if (i < this.childResults.length - 1) {
        result += "\n";
      }
    }

    return result;
  }

  private writeVerificationError(result: string): string {
    if (this.getVerificationError() !== null) {
      result += `: ${this.getVerificationError()}`;
    }

    return result;
  }
}
