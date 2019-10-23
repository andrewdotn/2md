import { JSDOM } from "jsdom";
import { IrNode, HeadingLevel, Doc, A, I, L, B, H, C, P } from "./2md";

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
        receiver = new B([]);
        break;
      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
      case "H6":
        receiver = new H([], { level: extractHeadingLevel(htmlNode.nodeName) });
        break;
      case "B":
      case "STRONG":
        receiver = new B([]);
        break;
      case "I":
      case "EM":
        receiver = new I([]);
        break;
      case "LI":
        receiver = new L([]);
        break;
      case "A":
        receiver = new A([], { href: e.getAttribute("href") || "" });
        break;
      case "P":
        receiver = new P([]);
        break;
      case "CODE":
        receiver = new C([]);
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

/**
 * Run the given function on every non-string node, allowing it to make changes
 */
function visitPre(root: IrNode, fn: (node: IrNode) => void) {
  fn(root);
  for (let c of root.children) {
    if (typeof c !== "string") {
      visitPre(c, fn);
    }
  }
}

/**
 * If two subsequent nodes are strings, concatenate them. This optimization pass
 * should be quick, and is here entirely to make unit test input cleaner.
 */
function concatenateStrings(node: IrNode) {
  for (let i = 0; i < node.children.length - 1; i++) {
    const c0 = node.children[i];
    const c1 = node.children[i + 1];
    if (typeof c0 === "string" && typeof c1 === "string") {
      node.children[i] += c1;
      node.children.splice(i + 1, 1);
    }
  }
}

/**
 * Em-dashes are nicer, but generally impossible to differentiate in the
 * fixed-width fonts that we’re expecting this markdown to be viewed with.
 */
function replaceEmDashes(node: IrNode) {
  for (let i = 0; i < node.children.length; i++) {
    const c = node.children[i];
    if (typeof c === "string" && c.indexOf("—") !== -1) {
      node.children[i] = c.replace(/—/g, "--");
    }
  }
}

export function parse(html: string): IrNode {
  const doc = parseHtml(html);
  const root = new Doc([]);
  for (let i = 0; i < doc.childNodes.length; i++) {
    parse1(root, doc.childNodes[i]);
  }

  visitPre(root, concatenateStrings);
  visitPre(root, replaceEmDashes);

  return root;
}
