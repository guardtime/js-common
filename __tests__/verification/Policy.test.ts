import { Rule } from "../../src/verification/Rule";
import { Result, ResultCode } from "../../src/verification/Result";
import { Policy } from "../../src/verification/Policy";

class TestRule extends Rule<boolean, string> {
  public constructor(name: string) {
    super(name);
  }

  async verify(isFail: boolean): Promise<Result<string>> {
    if (isFail) {
      return new Result<string>(this.getRuleName(), ResultCode.FAIL);
    }
    return new Result<string>(this.getRuleName(), ResultCode.OK);
  }
}

describe("Policy", () => {
  it("works", async () => {
    const policy = new Policy(
      new TestRule("FIRST").onAny(
        new TestRule("SECOND").onFailure(new TestRule("THIRD"))
      )
    );
    let result = await policy.verify(true);
    expect(result.getResultCode()).toEqual(ResultCode.FAIL);
    expect(
      result.getChildResults().map((child) => child.getRuleName())
    ).toEqual(["FIRST", "SECOND", "THIRD"]);

    result = await policy.verify(false);
    expect(result.getResultCode()).toEqual(ResultCode.OK);
    expect(
      result.getChildResults().map((child) => child.getRuleName())
    ).toEqual(["FIRST", "SECOND"]);
  });
});
