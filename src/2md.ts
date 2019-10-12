export class RenderContext {
  append(s: string, newline = false) {
    if (newline) {
      this.result += "\n";
      this.result += this.prefix;
    }

    this.result += s;
    this.col += s.length;
  }

  /** Used for collecting link info to push at a good time */
  addBlock(s: string) {
    this.onBlockEnd.push(s);
  }

  finish() {
    while (this.onBlockEnd.length > 0) {
      this.result += `\n${this.onBlockEnd.shift()}\n`;
    }
  }

  maxWidth = 80;
  col = 0;
  prefix = "";
  result = "";
  linkCounter = 1;
  onBlockEnd: string[] = [];
}

export abstract class IlNode {
  constructor(children: (IlNode | string)[]) {
    this.children = children;
    this.name = this.constructor.name;
  }

  push(child: IlNode | string) {
    this.children.push(child);
  }

  render(r: RenderContext) {
    for (let c of this.children) {
      if (typeof c === "string") {
        r.append(c);
      } else {
        c.render(r);
      }
    }
  }

  children: (IlNode | string)[];
  readonly name: string;
}

export class Doc extends IlNode {}

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Heading */
export class H extends IlNode {
  constructor(
    children: (IlNode | string)[],
    { level }: { level: HeadingLevel }
  ) {
    super(children);
    this.level = level;
  }

  render(r: RenderContext) {
    r.prefix = "#".repeat(this.level) + " ";
    r.append("", true);
    super.render(r);
    r.prefix = r.prefix.substring(0, r.prefix.length - (this.level + 1));
    r.append("", true);
  }

  level: HeadingLevel;
}

/** Link */
export class A extends IlNode {
  constructor(children: (IlNode | string)[], { href }: { href: string }) {
    super(children);
    this.href = href;
  }

  render(r: RenderContext) {
    const num = r.linkCounter++;
    r.append("[");
    super.render(r);
    r.append(`][${num}]`);
    // XXX: escape/quote bad hrefs, e.g., containing newlines?
    r.addBlock(`[${num}]: ${this.href}`);
  }

  href: string;
}

/** Bold */
export class B extends IlNode {
  render(r: RenderContext) {
    r.append("**");
    super.render(r);
    r.append("**");
  }
}

/** Italics */
export class I extends IlNode {}

/** Paragraph */
export class P extends IlNode {}

/** List item */
export class L extends IlNode {
  render(r: RenderContext) {
    r.prefix = "  - ";
    r.append("", true);
    super.render(r);
    r.prefix = r.prefix.substring(0, r.prefix.length - 4);
    r.append("", true);
  }
}
