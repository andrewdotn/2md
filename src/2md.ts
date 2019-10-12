import { Rendering } from "./render";

/**
 * Intermediate representation of the document. We use vanilla computing science
 * techniques: HTML input DOM is transformed into an abstract syntax tree of in
 * an intermediate representation format, roughly representing important
 * markdown elements, which then gets rendered to text.
 */
export abstract class IrNode {
  constructor(children: (IrNode | string)[]) {
    this.children = children;
    this.name = this.constructor.name;
  }

  push(child: IrNode | string) {
    this.children.push(child);
  }

  render(r: Rendering) {
    for (let c of this.children) {
      if (typeof c === "string") {
        r.append(c);
      } else {
        c.render(r);
      }
    }
  }

  children: (IrNode | string)[];
  readonly name: string;
}

export class Doc extends IrNode {}

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Heading */
export class H extends IrNode {
  constructor(
    children: (IrNode | string)[],
    { level }: { level: HeadingLevel }
  ) {
    super(children);
    this.level = level;
  }

  render(r: Rendering) {
    r.prefix = "#".repeat(this.level) + " ";
    r.ensureStartOfLine();
    super.render(r);
    r.prefix = r.prefix.substring(0, r.prefix.length - (this.level + 1));
    r.ensureStartOfLine();
  }

  level: HeadingLevel;
}

/** Link */
export class A extends IrNode {
  constructor(children: (IrNode | string)[], { href }: { href: string }) {
    super(children);
    this.href = href;
  }

  render(r: Rendering) {
    const num = r.linkCounter++;
    r.append("[");
    super.render(r);
    r.append(`][${num}]`);
    // XXX: escape/quote bad hrefs, e.g., containing newlines?
    r.addTrailer(`[${num}]: ${this.href}`);
  }

  href: string;
}

/** Bold */
export class B extends IrNode {
  render(r: Rendering) {
    r.append("**");
    super.render(r);
    r.append("**");
  }
}

/** Italics */
export class I extends IrNode {
  render(r: Rendering) {
    r.append("*");
    super.render(r);
    r.append("*");
  }
}

/** List item */
export class L extends IrNode {
  render(r: Rendering) {
    r.prefix = "  - ";
    r.append("", true);
    super.render(r);
    r.prefix = r.prefix.substring(0, r.prefix.length - 4);
    r.append("", true);
  }
}
