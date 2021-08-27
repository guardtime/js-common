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

import { Result } from "./Result.js";
import { Rule } from "./Rule.js";

/**
 * Verification policy for KSI signature
 */
export class Policy<Context, Error> extends Rule<Context, Error> {
  private readonly firstRule: Rule<Context, Error>;

  constructor(rule: Rule<Context, Error>, ruleName: string | null = null) {
    super(ruleName ? ruleName : "VerificationPolicy");

    this.firstRule = rule;
  }

  public async verify(context: Context): Promise<Result<Error>> {
    let verificationRule: Rule<Context, Error> | null = this.firstRule;
    const verificationResults: Result<Error>[] = [];

    try {
      while (verificationRule !== null) {
        const result: Result<Error> = await verificationRule.verify(context);
        verificationResults.push(result);
        verificationRule = verificationRule.getNextRule(result.getResultCode());
      }
    } catch (error) {
      throw error;
    }

    return Result.CREATE_FROM_RESULTS(this.getRuleName(), verificationResults);
  }
}
