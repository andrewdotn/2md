import { fixtureBuffer } from "./main-test";
import { expect } from "chai";
import { unMojibake } from "./clipboard";

describe("windows clipboard", function() {
  it("can sort out encodings", async function() {
    // Actual output from Get-Clipboard -TextFormatType Html > outFile
    const x = await fixtureBuffer("windows-paste1.cf_html");
    expect(unMojibake(x)).to.include("föò ∞");
    expect(unMojibake(x)).to.include(
      "The quick brown 🦊 jumped over the lazy dogs"
    );
  });
});
