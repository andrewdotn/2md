import { Prefix } from "./render";

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

const defaultWrapOptions = {
  acceptsTrailers: false,
  maxWidth: 80,
  preserveNewlines: false
};

export type WrapOptions = Partial<typeof defaultWrapOptions>;

class Wrap {
  constructor(s: string, prefixStack: Prefix[], options: WrapOptions) {
    const { maxWidth, preserveNewlines } = {
      ...defaultWrapOptions,
      ...options
    };
    this.text = s;
    this.prefixStack = prefixStack;
    this.result = "";
    this.maxWidth = maxWidth;
    this.preserveNewlines = preserveNewlines;
  }

  wrap() {
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
      const matchLen = matchEnd - lastMatchEnd;

      if (
        !this.atStartOfLine &&
        this.maxWidth > 0 &&
        this.col + (matchEnd - lastMatchEnd) > this.maxWidth
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
      this.col += matchLen;
      this.atStartOfLine = false;

      lastMatchEnd = matchEnd;
    }

    return this.result;
  }

  private renderPrefix() {
    const prefix = Prefix.render(this.prefixStack);
    this.result += prefix;
    this.col += prefix.length;
    this.currentPrefixRendered = true;
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
  currentPrefixRendered = false;
  prefixStack: Prefix[];
  private preserveNewlines: boolean;
  result: string;
}

export function wrap(
  s: string,
  prefixStack: Prefix[],
  options: WrapOptions = {}
) {
  return new Wrap(s, prefixStack, options).wrap();
}
