import { isEqual } from "lodash";

type Prefix = [string, string];

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

export class Rendering {
  append(s: string, newline = false) {
    s = s.replace(/\n/g, " ");

    if (newline) {
      this.ensureStartOfLine();
    }

    if (this.atStartOfLine) {
      this.renderPrefix();
    }

    /** Greedy word wrap */
    let lastMatchEnd = 0;
    for (let m of wordPieces(s)) {
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
        : s.substring(lastMatchEnd, matchEnd);
      this.result += toAdd;
      this.col += matchLen;
      this.atStartOfLine = false;

      lastMatchEnd = matchEnd;
    }
  }

  private renderPrefix() {
    const prefix = this.prefix(!this.currentPrefixRendered);
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

  pushPrefix(firstLinePrefix: string, subsequentLinePrefix?: string) {
    this.prefixStack.push(makePrefix(firstLinePrefix, subsequentLinePrefix));
    this.currentPrefixRendered = false;
    this.ensureStartOfLine();
  }

  popPrefix(firstLinePrefix: string, subsequentLinePrefix?: string) {
    const prefix = makePrefix(firstLinePrefix, subsequentLinePrefix);
    const popped = this.prefixStack.pop();
    if (!isEqual(popped, prefix)) {
      throw new Error("pop does not match what was pushed");
    }
    this.currentPrefixRendered = false;
  }

  prefix(firstLine = true) {
    return this.prefixStack.map(p => (firstLine ? p[0] : p[1])).join("");
  }

  /** Used for collecting link info to add on later */
  addTrailer(s: string) {
    this.trailers.push(s);
  }

  finish() {
    this.ensureStartOfLine();
    while (this.trailers.length > 0) {
      this.result += `\n${this.trailers.shift()}`;
    }
    if (!this.result.endsWith("\n")) {
      this.newLine();
    }
  }

  maxWidth = 80;
  atStartOfLine = true;
  col = 0;
  private prefixStack: Prefix[] = [];
  private currentPrefixRendered = false;
  result = "";
  linkCounter = 1;
  trailers: string[] = [];
}
