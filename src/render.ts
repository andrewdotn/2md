import { isEqual, last } from "lodash";
import { wrap } from "./wrap";

type Prefix = [string, string];

/**
 * Convenience function to allow callers to specify only one part of the prefix
 * if both parts are the same.
 */
function makePrefix(
  firstLinePrefix: string,
  subsequentLinePrefix?: string
): Prefix {
  const p: Prefix = [
    firstLinePrefix,
    subsequentLinePrefix === undefined ? firstLinePrefix : subsequentLinePrefix
  ];
  return p;
}

class OutputBlock {
  constructor(prefix?: Prefix) {
    if (prefix === undefined) {
      prefix = makePrefix("");
    }
    this._prefixFirst = prefix[0];
    this._prefixSubsequent = prefix[1];
  }

  append(s: string) {
    if (this._contents === undefined) this._contents = "";
    this._contents += s;
  }

  contents(): string | null {
    if (this._contents === undefined) {
      return null;
    }
    return this._contents;
  }

  render(): string {
    if (this._contents === undefined) {
      return "";
    }

    return wrap(this._contents, this._prefixFirst, this._prefixSubsequent);
  }

  private readonly _prefixFirst: string;
  private readonly _prefixSubsequent: string;
  private _contents: string | undefined;
}

export class TextRendering {
  constructor(blocks: OutputBlock[]) {
    this._blocks = blocks;
  }

  toText(): string {
    let ret = "";
    for (let b of this._blocks) {
      const rendered = b.render();
      if (rendered) {
        if (ret !== "") {
          ret += "\n";
        }
        ret += rendered;
        if (ret !== "" && !ret.endsWith("\n")) {
          ret += "\n";
        }
      }
    }
    return ret;
  }

  private _blocks: OutputBlock[];
}

export class BlockRendering {
  append(s: string, newline = false) {
    last(this.result)!.append(s);
  }

  pushPrefix(firstLinePrefix: string, subsequentLinePrefix?: string) {
    const prefix = makePrefix(firstLinePrefix, subsequentLinePrefix);
    this._prefixStack.push(prefix);
    this.result.push(new OutputBlock(this.prefix()));
  }

  popPrefix(firstLinePrefix: string, subsequentLinePrefix?: string) {
    const prefix = makePrefix(firstLinePrefix, subsequentLinePrefix);
    const popped = this._prefixStack.pop();
    if (!isEqual(popped, prefix)) {
      throw new Error("pop does not match what was pushed");
    }
    this.result.push(new OutputBlock(this.prefix()));
  }

  prefix(firstLine = true): Prefix {
    return [
      this._prefixStack.map(p => p[0]).join(""),
      this._prefixStack.map(p => p[1]).join("")
    ];
  }

  /** Used for collecting link info to add on later */
  addTrailer(s: string) {
    this.trailers.push(s);
  }

  finish(): string {
    let ret = new TextRendering(this.result).toText();

    if (this.trailers.length !== 0) {
      while (!ret.endsWith("\n\n")) {
        ret += "\n";
      }
      while (this.trailers.length > 0) {
        ret += `${this.trailers.shift()}\n`;
      }
    }
    return ret;
  }

  private _prefixStack: Prefix[] = [];
  result: OutputBlock[] = [];
  linkCounter = 1;
  trailers: string[] = [];
}
