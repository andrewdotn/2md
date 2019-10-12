import { JSDOM } from "jsdom";

abstract class IlNode {
  constructor(children: (IlNode | string)[]) {
    this.children = children;
    this.name = this.constructor.name;
  }

  push(child: IlNode | string) {
    this.children.push(child);
  }

  children: (IlNode | string)[];
  readonly name: string;
}

export class Doc extends IlNode {}

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export class H extends IlNode {
  constructor(children: (IlNode | string)[], { level }: { level: HeadingLevel }) {
    super(children);
    this.level = level;;
  }
  level: HeadingLevel
}
export class A extends IlNode {
  constructor(children: (IlNode | string)[], { href }: { href: string }) {
    super(children);
    this.href = href;
  }
  href: string;
}

export class B extends IlNode {}
export class I extends IlNode {}
export class P extends IlNode {}
export class L extends IlNode {}

function extractHeadingLevel(nodeName: string): HeadingLevel {
  if (!/^H[1-6]$/.test(nodeName))
    throw new Error('Not a heading');
  return <HeadingLevel>(nodeName.charCodeAt(1) - '0'.charCodeAt(0));
}

function parse1(ilNode: IlNode, htmlNode: Node) {
  if (htmlNode.nodeType == htmlNode.TEXT_NODE && htmlNode.textContent !== null) {
    ilNode.push(htmlNode.textContent);
  } else if (htmlNode.nodeType == htmlNode.ELEMENT_NODE) {
    const e = <Element>htmlNode;
    let receiver = ilNode;
      switch (htmlNode.nodeName) {
        case 'STRONG':
          receiver = new B([]);
          break;
        case 'H1':
        case 'H2':
        case 'H3':
        case 'H4':
        case 'H5':
        case 'H6':
          receiver = new H([], {level: extractHeadingLevel(htmlNode.nodeName)});
          break;
        case 'B':
        case 'STRONG':
          receiver = new B([]);
          break;
        case 'I':
        case 'EM':
          receiver = new I([]);
          break;
        case 'LI':
          receiver = new L([]);
          break;
        case 'A':
          receiver = new A([], {href: e.getAttribute('href') || ''});
          break;
      }
    if (ilNode !== receiver)
      ilNode.push(receiver);

    for (let i = 0; i < htmlNode.childNodes.length; i++) {
      const c = htmlNode.childNodes[i];
      parse1(receiver, c);
    }
  }
}

function parseHtml(html: string): Document {
  const dom = new JSDOM(html);
  return dom.window.document;
}

function visitPre(root: IlNode | string, fn: (node: IlNode | string) => void) {
  fn(root);
  if (typeof(root) !== 'string') {
    for (let c of root.children) {
      visitPre(c, fn);
    }
  }
}

/**
 * If two subsequent nodes are strings, concatenate them.
 */
function concatenateStrings(root: IlNode | string) {
  if (typeof(root) === 'string')
    return;
  for (let i = 0; i < root.children.length - 1; i++) {
    if (typeof(root.children[i]) === 'string'
      && typeof(root.children[i + 1]) === 'string') {
        root.children[i] += root.children[i + 1];
        root.children.splice(i + 1, 1);
    }
  }
}

export function parse(html: string): IlNode {
  const doc = parseHtml(html);
  const root = new Doc([]);
  for (let i = 0; i < doc.childNodes.length; i++) {
    parse1(root, doc.childNodes[i]);
  }

  visitPre(root, concatenateStrings);

  return root;
}

export function toMd(html: string): string {
  const intermediate = parse(html);

  return '';
}
