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

import { Result, ResultCode } from "./Result.js";

/**
 * Verification Rule for KSI Signature
 */
export abstract class Rule<Context, Error> {
  private onSuccessRule: Rule<Context, Error> | null = null;
  private onFailureRule: Rule<Context, Error> | null = null;
  private onNaRule: Rule<Context, Error> | null = null;
  private readonly ruleName: string;

  protected constructor(ruleName: string) {
    this.ruleName = ruleName;
  }

  public getRuleName(): string {
    return this.ruleName;
  }

  public onSuccess(rule: Rule<Context, Error>): Rule<Context, Error> {
    this.onSuccessRule = rule;

    return this;
  }

  public onFailure(rule: Rule<Context, Error>): Rule<Context, Error> {
    this.onFailureRule = rule;

    return this;
  }

  public onNa(rule: Rule<Context, Error>): Rule<Context, Error> {
    this.onNaRule = rule;

    return this;
  }

  public onAny(rule: Rule<Context, Error>): Rule<Context, Error> {
    return this.onSuccess(rule).onFailure(rule).onNa(rule);
  }

  public abstract verify(context: Context): Promise<Result<Error>>;

  public getNextRule(resultCode: ResultCode): Rule<Context, Error> | null {
    switch (resultCode) {
      case ResultCode.OK:
        return this.onSuccessRule;
      case ResultCode.FAIL:
        return this.onFailureRule;
      case ResultCode.NA:
        return this.onNaRule;
      default:
        return null;
    }
  }
}
