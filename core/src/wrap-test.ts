import { expect } from "chai";
import { inspect } from "util";
import { stripTrailingNewlines } from "./wrap.ts";

describe("stripTrailingNewlines", function () {
  for (let [input, expected] of [
    ["foo", "foo"],
    ["foo\n", "foo"],
    ["foo\n\n\n\n", "foo"],
    ["foo\n\n\n\nbar\n\n\nbaz\n", "foo\n\n\n\nbar\n\n\nbaz"],
    ["foo\n\n\n\nbar\n\n\nbaz\n\n\n\n", "foo\n\n\n\nbar\n\n\nbaz"],
  ]) {
    it(`strips trailing newlines from ${inspect(input)}`, function () {
      expect(stripTrailingNewlines(input)).to.eql(expected);
    });
  }
});
