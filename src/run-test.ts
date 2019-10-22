import { randomBytes } from "crypto";
import { run } from "./run";
import { expect } from "chai";

describe("run", function() {
  it("raises an error if the command does not exist", async function() {
    const dummyCommand = randomBytes(10).toString("hex");
    let thrown = false;
    let error: Error = new Error();
    try {
      await run([dummyCommand]);
    } catch (e) {
      thrown = true;
      error = e;
    }
    expect(thrown).to.eql(true);
    expect(/ENOENT/.test(error.toString())).to.eql(true);
  });
});
