function* wordPieces(s: string): Generator<RegExpExecArray> {
  const wordRegex = /\S+/g;
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

class Wrap {
  constructor(s: string, prefixFirst: string, prefixSubsequent: string) {
    this.text = s;
    this.prefixFirst = prefixFirst;
    this.prefixSubsequent = prefixSubsequent;
    this.result = "";
  }

  wrap() {
    this.result = "";
    const text = this.text.replace(/\n/g, " ");

    if (this.atStartOfLine) {
      this.renderPrefix();
    }

    /** Greedy word wrap */
    let lastMatchEnd = 0;
    for (let m of wordPieces(text)) {
      const word = m[0];
      const matchEnd = m.index + word.length;
      const matchLen = matchEnd - lastMatchEnd;

      if (
        !this.atStartOfLine &&
        this.col + (matchEnd - lastMatchEnd) > this.maxWidth
      ) {
        this.ensureStartOfLine();
        this.renderPrefix();
      }

      const toAdd = this.atStartOfLine
        ? m[0]
        : text.substring(lastMatchEnd, matchEnd);
      this.result += toAdd;
      this.col += matchLen;
      this.atStartOfLine = false;

      lastMatchEnd = matchEnd;
    }

    return this.result;
  }

  private renderPrefix() {
    const prefix = !this.currentPrefixRendered
      ? this.prefixFirst
      : this.prefixSubsequent;
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
  maxWidth = 80;
  atStartOfLine = true;
  col = 0;
  currentPrefixRendered = false;
  prefixFirst: string;
  prefixSubsequent: string;
  result: string;
}

export function wrap(s: string, prefixFirst: string, prefixSubsequent: string) {
  return new Wrap(s, prefixFirst, prefixSubsequent).wrap();
}
