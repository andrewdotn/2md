import { BlockRendering, Prefix } from "./render.ts";
import { tuple } from "./tuple.ts";
import { includes, last } from "lodash-es";

/**
 * Intermediate representation of the document. We use vanilla computing science
 * techniques: HTML input DOM is transformed into an abstract syntax tree of in
 * an intermediate representation format, roughly representing important
 * markdown elements, which then gets rendered to text.
 */
export abstract class IrNode {
  // An earlier version used the class name directly, but that does not
  // survive minification.
  static irName: NodeName;

  constructor(children: (IrNode | string)[]) {
    const constructor = this.constructor as typeof IrNode;
    if (!includes(nodeNames, constructor.irName)) {
      throw new Error(`constructor ${constructor.irName} is not in nodeNames`);
    }
    this.name = constructor.irName;

    for (let c of children) {
      if (c instanceof IrNode) {
        c.parent = this;
      }
    }
    this.children = children;
  }

  push(child: IrNode | string) {
    this.children.push(child);
    if (typeof child !== "string") {
      child.parent = this;
    }
  }

  isOrHasParentNamed(name: NodeName): boolean {
    if (this.name === name) {
      return true;
    }
    if (this.parent) {
      return this.parent.isOrHasParentNamed(name);
    }
    return false;
  }

  copyOfChildren() {
    return this.children.slice();
  }

  childCount() {
    return this.children.length;
  }

  hasChildren() {
    return this.children.length !== 0;
  }

  child(i: number) {
    return this.children[i];
  }

  setChild(i: number, value: IrNode | string) {
    if (value instanceof IrNode) {
      value.parent = this;
    }
    this.children[i] = value;
  }

  removeChild(i: number) {
    this.children.splice(i, 1);
  }

  insertChild(i: number, value: IrNode | string) {
    if (value instanceof IrNode) {
      value.parent = this;
    }
    this.children.splice(i, 0, value);
  }

  /**
   * What node.children = node.children[0].children would do if children weren’t
   * private, and if that could maintain invariants.
   */
  replaceWithChildren() {
    if (!this.parent) {
      throw new Error("can’t replace root node");
    }
    let index = this.parent.children.indexOf(this);

    const copy = this.copyOfChildren();
    while (this.hasChildren()) {
      this.removeChild(0);
    }
    this.parent.removeChild(index);
    for (let c of copy) {
      this.parent.insertChild(index, c);
      index++;
    }
  }

  clearChildren() {
    for (const c of this.children) {
      if (c instanceof IrNode) {
        c.parent = undefined;
      }
    }
    this.children = [];
  }

  replaceChild(i: number, replacement: IrNode | string) {
    const removed = this.children[i];
    if (removed instanceof IrNode) {
      // in case there’s a reference somewhere?
      removed.parent = undefined;
    }
    if (replacement instanceof IrNode) {
      replacement.parent = this;
    }

    this.children[i] = replacement;
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

  // Life was easier when other classes had direct access to the `children`
  // array, but we need to track parents for `isOrHasParentNamed().`
  private children: (IrNode | string)[];
  parent?: IrNode;
  readonly name: NodeName;
}

const nodeNames = tuple(
  "A",
  "Bold",
  "Br",
  "Separator",
  "Code",
  "Document",
  "Preformatted",
  "Heading",
  "I",
  "ListItem",
  "NumberedListItem",
  "OrderedList",
  "P",
  "Blockquote",
);
type NodeName = (typeof nodeNames)[number];

export class Document extends IrNode {
  static irName: NodeName = "Document";
}

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export class Heading extends IrNode {
  static irName: NodeName = "Heading";

  constructor(
    children: (IrNode | string)[],
    { level }: { level: HeadingLevel },
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

export class A extends IrNode {
  static irName: NodeName = "A";

  constructor(children: (IrNode | string)[], { href }: { href: string }) {
    super(children);
    this.href = href;
  }

  render(r: BlockRendering) {
    // Alternatively could render children into a new BlockRendering object
    let childText = "";
    let childRenderingValid = true;
    for (let c of this.copyOfChildren()) {
      if (typeof c === "string") {
        childText += c;
      } else {
        childRenderingValid = false;
        break;
      }
    }
    if (childRenderingValid && childText === this.href) {
      r.append("<");
      super.render(r);
      r.append(">");
    } else {
      const id = r.getLinkId(this.href);
      r.append("[");
      super.render(r);
      r.append(`][${id}]`);
    }
  }

  href: string;
}

/** Bold */
export class Bold extends IrNode {
  static irName: NodeName = "Bold";

  render(r: BlockRendering) {
    r.append("**");
    super.render(r);
    r.append("**");
  }
}

/** Italics */
export class I extends IrNode {
  static irName: NodeName = "I";

  render(r: BlockRendering) {
    r.append("*");
    super.render(r);
    r.append("*");
  }
}

export class ListItem extends IrNode {
  static irName: NodeName = "ListItem";

  render(r: BlockRendering) {
    // See comment on Prefix constructor
    const prefix = new Prefix("  - ", "    ");
    r.pushPrefix(prefix);
    super.render(r);
    r.popPrefix(prefix);
  }
}

export class OrderedList extends IrNode {
  static irName: NodeName = "OrderedList";

  render(r: BlockRendering) {
    throw new Error("this node should have been transformed away");
  }
}

export class NumberedListItem extends IrNode {
  static irName: NodeName = "NumberedListItem";

  constructor(children: (IrNode | string)[], { number }: { number: number }) {
    super(children);
    this.number = number;
  }

  render(r: BlockRendering) {
    const number = this.number.toFixed(0).padStart(2);
    const prefix = new Prefix(`${number}. `, "    ");
    r.pushPrefix(prefix);
    super.render(r);
    r.popPrefix(prefix);
  }

  number: number;
}

export class Code extends IrNode {
  static irName: NodeName = "Code";

  render(r: BlockRendering) {
    r.append("`");
    super.render(r);
    r.append("`");
  }
}

export class Preformatted extends IrNode {
  static irName: NodeName = "Preformatted";

  render(r: BlockRendering) {
    const prefix = new Prefix("    ");
    r.pushPrefix(prefix, { maxWidth: 0, preserveNewlines: true });
    super.render(r);
    r.popPrefix(prefix);
  }
}

export class P extends IrNode {
  static irName: NodeName = "P";

  render(r: BlockRendering) {
    const prefix = new Prefix("");
    r.pushPrefix(prefix);
    super.render(r);
    r.popPrefix(prefix);
  }
}

export class Blockquote extends IrNode {
  static irName: NodeName = "Blockquote";

  render(r: BlockRendering) {
    const prefix = new Prefix("> ");
    r.pushPrefix(prefix, { acceptsTrailers: this.acceptsTrailers });
    super.render(r);
    r.popPrefix(prefix);
  }

  acceptsTrailers = false;
}

// For <br> tags: two subsequent ones are turned into a Separator nodes. A
// single <br> tag is ignored for now.
export class Br extends IrNode {
  static irName: NodeName = "Br";

  render(r: BlockRendering) {
    const prefix = new Prefix("");
    const lastBlock = last(r.outputBlocks);
    if (lastBlock) {
      lastBlock.wrapOptions.endsWithHardBreak = true;
    }
    r.pushPrefix(prefix);
    r.popPrefix(prefix);
  }
}

export class Separator extends IrNode {
  static irName: NodeName = "Separator";

  render(r: BlockRendering) {
    const prefix = new Prefix("");
    r.pushPrefix(prefix);
    r.popPrefix(prefix);
  }
}
