import { JSDOM } from "jsdom";
import {
  IrNode,
  HeadingLevel,
  Doc,
  A,
  I,
  ListItem,
  Bold,
  Heading,
  Code,
  P,
  Blockquote,
  Preformatted,
  OrderedList,
  Br
} from "./2md";
import { applyTreeTransforms } from "./tree-transforms";

function extractHeadingLevel(nodeName: string): HeadingLevel {
  if (!/^H[1-6]$/.test(nodeName)) throw new Error("Not a heading");
  return <HeadingLevel>(nodeName.charCodeAt(1) - "0".charCodeAt(0));
}

function parse1(ilNode: IrNode, htmlNode: Node) {
  if (
    htmlNode.nodeType == htmlNode.TEXT_NODE &&
    htmlNode.textContent !== null
  ) {
    if (htmlNode.textContent != "\n") {
      ilNode.push(htmlNode.textContent);
    }
  } else if (htmlNode.nodeType == htmlNode.ELEMENT_NODE) {
    const e = <Element>htmlNode;
    let receiver = ilNode;
    switch (htmlNode.nodeName) {
      case "STRONG":
        receiver = new Bold([]);
        break;
      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
      case "H6":
        receiver = new Heading([], {
          level: extractHeadingLevel(htmlNode.nodeName)
        });
        break;
      case "Bold":
      case "STRONG":
        receiver = new Bold([]);
        break;
      case "I":
      case "EM":
        receiver = new I([]);
        break;
      case "OL":
        receiver = new OrderedList([]);
        break;
      case "LI":
        receiver = new ListItem([]);
        break;
      case "A":
        receiver = new A([], { href: e.getAttribute("href") || "" });
        break;
      case "PRE":
        receiver = new Preformatted([]);
        break;
      case "P":
        receiver = new P([]);
        break;
      case "BLOCKQUOTE":
        receiver = new Blockquote([]);
        break;
      case "TT":
      case "CODE":
        receiver = new Code([]);
        break;
      case "BR":
        receiver = new Br([]);
        break;
    }
    if (ilNode !== receiver) ilNode.push(receiver);

    for (let i = 0; i < htmlNode.childNodes.length; i++) {
      const c = htmlNode.childNodes[i];
      parse1(receiver, c);
    }
  }
}

export function parseHtml(html: string): Document {
  const dom = new JSDOM(html);
  return dom.window.document;
}

const defaultParseOptions = {
  wrapInBackquote: false
};

export type ParseOptions = Partial<typeof defaultParseOptions>;

export function parse(html: string, options?: ParseOptions): IrNode {
  options = Object.assign(defaultParseOptions, options);

  const doc = parseHtml(html);
  const root = new Doc([]);
  let parseRoot = root;

  if (options.wrapInBackquote) {
    parseRoot = new Blockquote([]);
    root.push(parseRoot);
  }

  for (let i = 0; i < doc.childNodes.length; i++) {
    parse1(parseRoot, doc.childNodes[i]);
  }

  applyTreeTransforms(root);

  return root;
}
