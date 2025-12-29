import { dirname, resolve } from "path";
import { expect } from "chai";
import { pathExists } from "./fs-util.ts";
import { fileURLToPath } from "node:url";

describe("pathExists", function () {
  it("finds extant files", async function () {
    const dir = dirname(fileURLToPath(import.meta.url));
    const tmpfile = resolve(dir, "../fixtures", "windows-paste1.cf_html");
    expect(await pathExists(tmpfile)).to.be.true;
  });

  it("returns false for missing files", async function () {
    const fakeFileName = Math.random().toString(36);
    expect(await pathExists(fakeFileName)).to.be.false;
  });
});
