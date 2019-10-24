import { IrNode, N, Separator } from "./2md";

export function applyTreeTransforms(root: IrNode) {
  visitPre(root, concatenateStrings);
  visitPre(root, replaceEmDashes);
  visitPre(root, removeEmptyLinks);
  visitPre(root, collapseCodeInsidePre);
  visitPre(root, numberLists);
  visitPre(root, twoBrsMakesOneSeparator);
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
      // Since we just deleted the element at the current index, decrement
      // the loop index, otherwise we’ll miss the next element which has
      // shifted down into the current position.
      i--;
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

/**
 * <pre><code>foo</code></pre> -> <pre>foo</pre>
 */
function numberLists(node: IrNode) {
  for (let i = 0; i < node.children.length; i++) {
    let counter = 1;
    const c = node.children[i];
    if (typeof c !== "string" && c.name === "O") {
      const newChildren = c.children.map(n => {
        if (typeof n !== "string" && n.name === "L") {
          return new N(n.children, { index: counter++ });
        } else {
          return n;
        }
      });

      node.children.splice(i, 1, ...newChildren);
    }
  }
}

function twoBrsMakesOneSeparator(node: IrNode) {
  for (let i = 0; i < node.children.length - 1; i++) {
    const n0 = node.children[i];
    const n1 = node.children[i + 1];

    if (typeof n0 !== "string" && n0.name === "Br") {
      if (typeof n1 !== "string" && n1.name === "Br") {
        node.children.splice(i, 1, new Separator([]));
      } else {
        node.children.splice(i, 1);
        i--;
      }
    }
  }
}
