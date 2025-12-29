import {
  A,
  Blockquote,
  Bold,
  Br,
  Code,
  Document,
  Heading,
  I,
  IrNode,
  ListItem,
  OrderedList,
  P,
  Preformatted,
} from "./2md.ts";
import type { HeadingLevel } from "./2md.ts";
import { applyTreeTransforms } from "./tree-transforms.ts";
import type {
  Document as Parse5Document,
  ChildNode,
  Element,
} from "parse5/dist/tree-adapters/default";
import { defaultTreeAdapter as adapter } from "parse5";
import { getAttribute, removeAttribute } from "@parse5/tools";

function extractHeadingLevel(nodeName: string): HeadingLevel {
  if (!/^h[1-6]$/.test(nodeName)) throw new Error("Not a heading");
  return (nodeName.charCodeAt(1) - "0".charCodeAt(0)) as HeadingLevel;
}

// This is the actual recursive function; I think I picked up the naming
// convention from Lisp. When a recursive function needs accumulators, `foo()`
// is the simplified API used by callers that does the initial setup, and
// `foo1()` recurses.
function parse1(irNode: IrNode, htmlNode: ChildNode) {
  if (adapter.isTextNode(htmlNode) && htmlNode.value !== null) {
    if (htmlNode.value !== "\n" || irNode.isOrHasParentNamed("Preformatted")) {
      irNode.push(htmlNode.value);
    }
  } else if (adapter.isElementNode(htmlNode)) {
    const e = htmlNode as Element;
    let receiver = irNode;
    switch (htmlNode.nodeName.toUpperCase()) {
      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
      case "H6":
        receiver = new Heading([], {
          level: extractHeadingLevel(htmlNode.nodeName),
        });
        break;
      case "B":
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
        const href = getAttribute(e, "href");
        if (href) {
          receiver = new A([], { href });
        }
        break;
      case "PRE":
        receiver = new Preformatted([]);
        break;
      case "P":
      // There’s no standard markdown representation for these, but putting them
      // on separate lines is better than jamming them together in a single
      // paragraph.
      case "DL":
      case "DT":
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
    if (irNode !== receiver) irNode.push(receiver);

    for (let i = 0; i < htmlNode.childNodes.length; i++) {
      const c = htmlNode.childNodes[i];
      parse1(receiver, c);
    }
  }
}

const defaultParseOptions = {
  quote: false,
  links: true,
};

export type ParseOptions = Partial<typeof defaultParseOptions>;

// For debugging input HTML
// @ts-ignore
function stripStyles(htmlNode: ChildNode) {
  if (adapter.isElementNode(htmlNode)) {
    const e = htmlNode as Element;
    removeAttribute(e, "style");
    removeAttribute(e, "class");
    for (let i = 0; i < e.childNodes.length; i++) {
      stripStyles(e.childNodes[i]);
    }
  }
}

export function parseToIr(
  doc: Parse5Document,
  options: ParseOptions,
  skipTreeTransforms = false,
): IrNode {
  const root = new Document([]);
  let parseRoot = root;

  if (options.quote) {
    const blockquote = new Blockquote([]);
    blockquote.acceptsTrailers = true;
    parseRoot = blockquote;
    root.push(parseRoot);
  }

  for (let i = 0; i < doc.childNodes.length; i++) {
    parse1(parseRoot, doc.childNodes[i]);
  }

  if (!skipTreeTransforms) {
    applyTreeTransforms(root, { removeLinks: !options.links });
  }

  return root;
}

export function parse(doc: Parse5Document, options?: ParseOptions): IrNode {
  options = { ...defaultParseOptions, ...options };

  return parseToIr(doc, options);
}
