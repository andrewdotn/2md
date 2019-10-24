import { BlockRendering, Prefix } from "./render";

/**
 * Intermediate representation of the document. We use vanilla computing science
 * techniques: HTML input DOM is transformed into an abstract syntax tree of in
 * an intermediate representation format, roughly representing important
 * markdown elements, which then gets rendered to text.
 */
export abstract class IrNode {
  constructor(children: (IrNode | string)[]) {
    this.children = children;
    this.name = <NodeName>this.constructor.name;
  }

  push(child: IrNode | string) {
    this.children.push(child);
  }

  render(r: BlockRendering) {
    for (let c of this.children) {
      if (typeof c === "string") {
        r.append(c);
      } else {
        c.render(r);
      }
    }
  }

  children: (IrNode | string)[];
  readonly name: NodeName;
}

type NodeName = "H" | "A" | "P" | "O" | "B" | "I" | "F" | "C" | "L";

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

  render(r: BlockRendering) {
    const prefix = new Prefix("#".repeat(this.level) + " ", "");
    // Headings shouldn’t be wrapped as they turn into multiple heading blocks
    r.pushPrefix(prefix, { maxWidth: 0 });
    super.render(r);
    r.popPrefix(prefix);
  }

  level: HeadingLevel;
}

/** Link */
export class A extends IrNode {
  constructor(children: (IrNode | string)[], { href }: { href: string }) {
    super(children);
    this.href = href;
  }

  render(r: BlockRendering) {
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
  render(r: BlockRendering) {
    r.append("**");
    super.render(r);
    r.append("**");
  }
}

/** Italics */
export class I extends IrNode {
  render(r: BlockRendering) {
    r.append("*");
    super.render(r);
    r.append("*");
  }
}

/** List item */
export class L extends IrNode {
  render(r: BlockRendering) {
    // See comment on Prefix constructor
    const prefix = new Prefix("  - ", "    ");
    r.pushPrefix(prefix);
    super.render(r);
    r.popPrefix(prefix);
  }
}

/** Ordered list */
export class O extends IrNode {
  render(r: BlockRendering) {
    throw new Error("this node should have been transformed away");
  }
}

/** Numbered list item */
export class N extends IrNode {
  constructor(children: (IrNode | string)[], { index }: { index: number }) {
    super(children);
    this.index = index;
  }

  render(r: BlockRendering) {
    const number = this.index.toFixed(0).padStart(2);
    const prefix = new Prefix(`${number}. `, "    ");
    r.pushPrefix(prefix);
    super.render(r);
    r.popPrefix(prefix);
  }

  index: number;
}

/** Code */
export class C extends IrNode {
  render(r: BlockRendering) {
    r.append("`");
    super.render(r);
    r.append("`");
  }
}

/** Preformatted */
export class F extends IrNode {
  render(r: BlockRendering) {
    const prefix = new Prefix("    ");
    r.pushPrefix(prefix, { maxWidth: 0, preserveNewlines: true });
    super.render(r);
    r.popPrefix(prefix);
  }
}

/** Paragraph */
export class P extends IrNode {
  render(r: BlockRendering) {
    const prefix = new Prefix("");
    r.pushPrefix(prefix);
    super.render(r);
    r.popPrefix(prefix);
  }
}

/** Blockquote */
export class Q extends IrNode {
  render(r: BlockRendering) {
    const prefix = new Prefix("> ");
    r.pushPrefix(prefix);
    super.render(r);
    r.popPrefix(prefix);
  }
}
