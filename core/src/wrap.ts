import { Prefix } from "./render";
import GraphemeSplitter from "grapheme-splitter";

function* wordPieces(s: string): Generator<RegExpExecArray> {
  const wordRegex = /\S+|\n/g;
  let lastIndex = 0;
  for (let m = wordRegex.exec(s); m !== null; m = wordRegex.exec(s)) {
    lastIndex = m.index + m[0].length;
    yield m;
  }
  if (lastIndex < s.length) {
    yield Object.assign([s.substring(lastIndex)], {
      index: lastIndex,
      input: s
    });
  }
}

export function stripTrailingNewlines(text: string) {
  const m = /\n+$/.exec(text);
  if (m) {
    return text.substring(0, m.index);
  } else {
    return text;
  }
}

const defaultBlockOptions = {
  acceptsTrailers: false,
  maxWidth: 80,
  preserveNewlines: false,
  endsWithHardBreak: false
};

export type BlockOptions = Partial<typeof defaultBlockOptions>;

class Wrap {
  constructor(s: string, prefixStack: Prefix[], options: BlockOptions) {
    const { maxWidth, preserveNewlines } = {
      ...defaultBlockOptions,
      ...options
    };
    this.text = s;
    this.prefixStack = prefixStack;
    this.result = "";
    this.maxWidth = maxWidth;
    this.preserveNewlines = preserveNewlines;
  }

  wrap() {
    const splitter = new GraphemeSplitter();

    this.result = "";
    let text = stripTrailingNewlines(this.text);
    if (!this.preserveNewlines) {
      text = this.text.replace(/\n/g, " ");
      text = text.trimRight();
    }

    if (this.atStartOfLine) {
      this.renderPrefix();
    }

    // Greedy word wrap. The non-greedy algorithm is much more important for
    // good spacing in justified proportional-width text, where we’re wrapping
    // monospace text at 80 cols.
    let lastMatchEnd = 0;
    for (let m of wordPieces(text)) {
      const word = m[0];
      const matchEnd = m.index + word.length;
      const matchLength = splitter.countGraphemes(
        text.substring(lastMatchEnd, matchEnd)
      );

      if (
        !this.atStartOfLine &&
        this.maxWidth > 0 &&
        this.col + matchLength > this.maxWidth
      ) {
        this.ensureStartOfLine();
        this.renderPrefix();
      }

      const toAdd = this.atStartOfLine
        ? m[0]
        : text.substring(lastMatchEnd, matchEnd);

      this.result += toAdd;
      if (toAdd == "\n") {
        this.col = 0;
        this.atStartOfLine = true;
        this.renderPrefix();
      }
      this.col += matchLength;
      this.atStartOfLine = false;

      lastMatchEnd = matchEnd;
    }

    return this.result;
  }

  private renderPrefix() {
    const prefix = Prefix.render(this.prefixStack);
    this.result += prefix;
    this.col += prefix.length;
  }

  ensureStartOfLine() {
    if (!this.atStartOfLine) {
      this.newLine();
    }
  }

  newLine() {
    this.result += "\n";
    this.col = 0;
    this.atStartOfLine = true;
  }

  text: string;
  maxWidth: number;
  atStartOfLine = true;
  col = 0;
  prefixStack: Prefix[];
  private preserveNewlines: boolean;
  result: string;
}

export function wrap(
  s: string,
  prefixStack: Prefix[],
  options: BlockOptions = {}
) {
  return new Wrap(s, prefixStack, options).wrap();
}
