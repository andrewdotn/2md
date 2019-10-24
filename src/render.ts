import { last } from "lodash";
import { wrap, WrapOptions } from "./wrap";

/**
 * A string that gets prepended to each line of an output block in Markdown,
 * e.g., `#` or `>`. The first line is often different from subsequent lines,
 * for example with a bulleted list that is simply indented on subsequent lines.
 *
 * You should always make a new prefix instead of caching one, because it
 * contains state to track whether the first line has been printed or not.
 */
export class Prefix {
  constructor(first: string, subsequent?: string) {
    this.first = first;
    this.subsequent = subsequent !== undefined ? subsequent : first;
  }

  static render(prefixStack: Prefix[]): string {
    let ret = "";
    for (let p of prefixStack) {
      if (!p._rendered) {
        p._rendered = true;
        ret += p.first;
      } else {
        ret += p.subsequent;
      }
    }
    return ret;
  }

  equals(other: Prefix): boolean {
    return this.first === other.first && this.subsequent === other.subsequent;
  }

  readonly first: string;
  readonly subsequent: string;
  private _rendered = false;
}

class OutputBlock {
  constructor(prefixStack: Prefix[], wrapOptions?: WrapOptions) {
    this.prefixStack = prefixStack;
    this.wrapOptions = wrapOptions;
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

    return wrap(this._contents, this.prefixStack, this.wrapOptions);
  }

  isHeading() {
    if (this.prefixStack.length === 0) return false;

    return last(this.prefixStack)!
      .first.trimRight()
      .endsWith("#");
  }

  prefixStack: Prefix[];
  private _contents: string | undefined;
  private wrapOptions?: WrapOptions;
}

export class TextRendering {
  constructor(blocks: OutputBlock[]) {
    this._blocks = blocks;
  }

  toText(): string {
    let ret = "";
    let lastNonEmptyBlock: OutputBlock | null = null;
    for (let block of this._blocks) {
      const rendered = block.render();
      if (rendered !== "" && ret !== "") {
        const betweenHeadings =
          block.isHeading() &&
          lastNonEmptyBlock !== null &&
          lastNonEmptyBlock.isHeading();
        if (!betweenHeadings && lastNonEmptyBlock !== null) {
          ret += Prefix.render(lastNonEmptyBlock.prefixStack).trim() + "\n";
        }
      }
      if (rendered !== "") {
        ret += rendered + "\n";
        lastNonEmptyBlock = block;
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

  pushPrefix(prefix: Prefix, wrapOptions?: WrapOptions) {
    this._prefixStack.push(prefix);
    this.outputBlocks.push(
      new OutputBlock(this._prefixStack.slice(), wrapOptions)
    );
  }

  popPrefix(prefix: Prefix) {
    const popped = this._prefixStack.pop();
    if (popped === undefined || !popped.equals(prefix)) {
      throw new Error("pop does not match what was pushed");
    }
    this.outputBlocks.push(new OutputBlock(this._prefixStack.slice()));
  }

  /** Used for collecting link info to add on later */
  addTrailer(s: string) {
    this.trailers.push(s);
  }

  finish(): string {
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
