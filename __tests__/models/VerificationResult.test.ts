import VerificationResult from "../../src/models/VerificationResult";

describe("Verification Result", () => {
  it("can report that it is a success", () => {
    const result = new VerificationResult("Test Result");
    result.check(true, "Check 1 passed", "Check 1 failed");
    result.check(true, "Check 2 passed", "Check 2 failed");
    expect(result.success).toBeTruthy();
    expect(result.failed).toBeFalsy();
    expect(result.incomplete).toBeFalsy();
    expect(result.message()).toEqual("Test Result passed");
    expect(result.status).toEqual("passed");
  });
  it("can report that it is a failure", () => {
    const result = new VerificationResult("Test Result");
    result.check(true, "Check 1 passed", "Check 1 failed");
    result.check(false, "Check 2 passed", "Check 2 failed");
    expect(result.success).toBeFalsy();
    expect(result.failed).toBeTruthy();
    expect(result.incomplete).toBeFalsy();
    expect(result.message()).toEqual("Test Result failed");
    expect(result.status).toEqual("failed");
  });
  it("can report that it is incomplete", () => {
    const result = new VerificationResult("Test Result");
    result.check(true, "Check 1 passed", "Check 1 failed");
    result.skip("Leg day");
    expect(result.success).toBeFalsy();
    expect(result.failed).toBeFalsy();
    expect(result.incomplete).toBeTruthy();
    expect(result.message()).toEqual("Test Result incomplete");
    expect(result.status).toEqual("incomplete");
  });
  it("status is failed even there are skipped", () => {
    const result = new VerificationResult("Test Result");
    result.check(false, "Check 1 passed", "Check 1 failed");
    result.skip("Leg day");
    expect(result.success).toBeFalsy();
    expect(result.failed).toBeTruthy();
    expect(result.incomplete).toBeTruthy();
    expect(result.message()).toEqual("Test Result failed");
    expect(result.status).toEqual("failed");
  });
});
