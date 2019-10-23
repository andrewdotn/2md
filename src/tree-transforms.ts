import { IrNode } from "./2md";

export function applyOptimizations(root: IrNode) {
  visitPre(root, concatenateStrings);
  visitPre(root, replaceEmDashes);
  visitPre(root, removeEmptyLinks);
  visitPre(root, collapseCodeInsidePre);
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

/**
 * Strip out empty links, such as <a name=...></a>
 */
function removeEmptyLinks(node: IrNode) {
  for (let i = 0; i < node.children.length; i++) {
    const c = node.children[i];
    if (typeof c !== "string" && c.name === "A" && c.children.length === 0) {
      node.children.splice(i, 1);
    }
  }
}

/**
 * <pre><code>foo</code></pre> -> <pre>foo</pre>
 */
function collapseCodeInsidePre(node: IrNode) {
  if (node.name !== "F") {
    return;
  }

  if (node.children.length === 1) {
    const c = node.children[0];
    if (typeof c !== "string" && c.name === "C") {
      node.children = c.children;
    }
  }
}