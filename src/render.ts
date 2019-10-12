export class Rendering {
  append(s: string, newline = false) {
    if (newline) {
      this.ensureStartOfLine();
    }

    /** Greedy word wrap */
    let lastMatchEnd = 0;
    const wordRegex = /\S+/g;
    for (let m = wordRegex.exec(s); m !== null; m = wordRegex.exec(s)) {
      const word = m[0];
      const matchEnd = m.index + word.length;
      const matchLen = matchEnd - lastMatchEnd;

      if (
        !this.atStartOfLine &&
        this.col + (matchEnd - lastMatchEnd) > this.maxWidth
      ) {
        this.ensureStartOfLine();
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

  ensureStartOfLine() {
    if (!this.atStartOfLine || this.col != this.prefix.length) {
      if (this.result.length !== 0) {
        this.result += "\n";
      }
      this.result += this.prefix;
      this.col = this.prefix.length;
      this.atStartOfLine = true;
    }
  }

  /** Used for collecting link info to add on later */
  addTrailer(s: string) {
    this.trailers.push(s);
  }

  finish() {
    while (this.trailers.length > 0) {
      this.result += `\n${this.trailers.shift()}\n`;
    }
  }

  maxWidth = 80;
  atStartOfLine = true;
  col = 0;
  prefix = "";
  result = "";
  linkCounter = 1;
  trailers: string[] = [];
}
