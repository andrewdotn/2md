import { randomBytes } from "crypto";
import { resolve } from "path";
import { expect } from "chai";
import { readFile } from "fs-extra";
import { run, toMd } from "./main";
import { A, B, Doc, H, L } from "./2md";
import { parse } from "./parse";

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

async function fixture(filename: string): Promise<string> {
  const path = resolve(__dirname, "../fixtures", filename);
  const contents = await readFile(path);
  return contents.toString();
}

describe("2md", function() {
  describe("parsing", function() {
    it("can parse the first sample", async function() {
      const html = await fixture("quote1.html");
      const expected = new Doc([
        new H(["The end of 32-bit apps (and other removals)"], { level: 2 }),

        "Mac hardware and macOS made the jump from 32 bits to 64 bits a long time ago, but Catalina will be the very first version of macOS that is totally unable to run 32-bit software. For (what I hope will be) the last time, let's review the Mac's entire 64-bit timeline from start to finish:",
        new L([
          new B(["June 2003"]),
          ": The PowerPC G5 CPU is ",
          new A(["the first 64-bit-capable chip to show up in a Mac"], {
            href: "https://www.macworld.com/article/1025078/future.html"
          }),
          ", and with Mac OS X 10.3 Panther, it can theoretically address up to 8GB of RAM."
        ]),
        new L([
          new B(["April 2005"]),
          ": Mac OS X 10.4 Tiger ",
          new A(["allows for 64-bit processes under the hood"], {
            href: "https://arstechnica.com/gadgets/2005/04/macosx-10-4/4/"
          }),
          "--they can be spun off from another process or run via the Terminal."
        ])
      ]);
      const parsed = parse(html);
      expect(parsed).to.deep.equal(expected);
    });
  });

  describe("end-to-end", function() {
    it("can process the first sample", async function() {
      const [html, md] = await Promise.all(
        ["html", "md"].map(ext => fixture(`quote1.${ext}`))
      );
      expect(toMd(html)).to.eql(md);
    });
  });
});
