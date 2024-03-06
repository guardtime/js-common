import { Result, ResultCode } from "../../src/verification/Result.js";

describe("Result", () => {
  it("toString works", async () => {
    const result = new Result("TEST_RULE", ResultCode.OK, null, [
      new Result("TEST_CHILD_RULE_1", ResultCode.FAIL, "test error"),
      new Result("TEST_CHILD_RULE_2", ResultCode.OK),
    ]);

    expect(result.toString()).toEqual(
      "VerificationResult TEST_RULE [OK]:\n" +
        "    VerificationResult TEST_CHILD_RULE_1 [FAIL]: test error\n" +
        "    VerificationResult TEST_CHILD_RULE_2 [OK]",
    );
  });
});
