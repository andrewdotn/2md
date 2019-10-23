import { last } from "lodash";
import { wrap } from "./wrap";

export class Prefix {
  constructor(first: string, subsequent?: string) {
    this.first = first;
    this.subsequent = subsequent !== undefined ? subsequent : first;
  }

  render() {
    if (!this._rendered) {
      this._rendered = true;
      return this.first;
    }
    return this.subsequent;
  }

  equals(other: Prefix): boolean {
    return this.first === other.first && this.subsequent === other.subsequent;
  }

  static join(prefixList: Prefix[]) {
    return new Prefix(
      prefixList.map(p => p.first).join(""),
      prefixList.map(p => p.subsequent).join("")
    );
  }

  readonly first: string;
  readonly subsequent: string;
  private _rendered = false;
}

class OutputBlock {
  constructor(prefix?: Prefix) {
    if (prefix === undefined) {
      prefix = new Prefix("");
    }
    this.prefix = prefix;
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

    return wrap(this._contents, this.prefix);
  }

  prefix: Prefix;
  private _contents: string | undefined;

  isHeading() {
    return this.prefix.first.trimRight().endsWith("#");
  }
}

export class TextRendering {
  constructor(blocks: OutputBlock[]) {
    this._blocks = blocks;
  }

  toText(): string {
    let ret = "";
    let separator: string | null = null;
    let lastNonEmptyBlock: OutputBlock | null = null;
    for (let block of this._blocks) {
      const rendered = block.render();
      if (rendered !== "" && ret !== "" && separator != null) {
        const betweenHeadings =
          block.isHeading() &&
          lastNonEmptyBlock !== null &&
          lastNonEmptyBlock.isHeading();
        if (!betweenHeadings) {
          ret += separator + "\n";
        }
      }
      if (rendered !== "") {
        ret += rendered + "\n";
        separator = null;
        lastNonEmptyBlock = block;
      } else {
        separator = block.prefix.subsequent.trimRight();
      }
    }
    return ret;
  }

  private _blocks: OutputBlock[];
}

export class BlockRendering {
  append(s: string, newline = false) {
    if (this.outputBlocks.length === 0) {
      this.pushPrefix(new Prefix(""));
    }
    last(this.outputBlocks)!.append(s);
  }

  pushPrefix(prefix: Prefix) {
    this._prefixStack.push(prefix);
    this.outputBlocks.push(new OutputBlock(this.prefix()));
  }

  popPrefix(prefix: Prefix) {
    const popped = this._prefixStack.pop();
    if (popped === undefined || !popped.equals(prefix)) {
      throw new Error("pop does not match what was pushed");
    }
    this.outputBlocks.push(new OutputBlock(this.prefix()));
  }

  prefix(): Prefix {
    return Prefix.join(this._prefixStack);
  }

  /** Used for collecting link info to add on later */
  addTrailer(s: string) {
    this.trailers.push(s);
  }

  cleanup() {
    for (let i = 0; i < this.outputBlocks.length - 1; i++) {
      const b0 = this.outputBlocks[i];
      const b1 = this.outputBlocks[i + 1];

      if (b0.prefix.equals(b1.prefix)) {
        b1.prefix = b0.prefix;
      }
    }
  }

  finish(): string {
    this.cleanup();

    let ret = new TextRendering(this.outputBlocks).toText();

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
  outputBlocks: OutputBlock[] = [];
  linkCounter = 1;
  trailers: string[] = [];
}
