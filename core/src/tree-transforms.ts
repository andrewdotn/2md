import { IrNode, NumberedListItem, Separator } from "./2md";

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
  for (let c of root.copyOfChildren()) {
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
  for (let i = 0; i < node.childCount() - 1; i++) {
    const c0 = node.child(i);
    const c1 = node.child(i + 1);
    if (typeof c0 === "string" && typeof c1 === "string") {
      node.setChild(i, c0 + c1);
      node.removeChild(i + 1);
      i--;
    }
  }
}

/**
 * Em-dashes are nicer, but generally impossible to differentiate in the
 * fixed-width fonts that we’re expecting this markdown to be viewed with.
 */
function replaceEmDashes(node: IrNode) {
  for (let i = 0; i < node.childCount(); i++) {
    const c = node.child(i);
    if (typeof c === "string" && c.indexOf("—") !== -1) {
      node.setChild(i, c.replace(/—/g, "--"));
    }
  }
}

/**
 * Strip out empty links, such as <a name=...></a>
 */
function removeEmptyLinks(node: IrNode) {
  for (let i = 0; i < node.childCount(); i++) {
    const c = node.child(i);
    if (typeof c !== "string" && c.name === "A" && !c.hasChildren()) {
      node.removeChild(i);
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
  if (node.name !== "Preformatted") {
    return;
  }

  if (node.childCount() === 1) {
    const c = node.child(0);
    if (typeof c !== "string" && c.name === "Code") {
      // Roundabout way of doing `node.children = c.children;`
      const copy = c.copyOfChildren();
      while (node.hasChildren()) {
        node.removeChild(0);
      }
      for (let c1 of copy) {
        node.push(c1);
      }
    }
  }
}

function numberLists(node: IrNode) {
  for (let i = 0; i < node.childCount(); i++) {
    let counter = 1;
    const c = node.child(i);
    if (typeof c !== "string" && c.name === "OrderedList") {
      const newChildren = c.copyOfChildren().map(n => {
        if (typeof n !== "string" && n.name === "ListItem") {
          return new NumberedListItem(n.copyOfChildren(), {
            number: counter++
          });
        } else {
          return n;
        }
      });

      node.removeChild(i);
      for (let j = 0; j < newChildren.length; j++) {
        node.insertChild(i + j, newChildren[j]);
      }
    }
  }
}

function twoBrsMakesOneSeparator(node: IrNode) {
  for (let i = 0; i < node.childCount() - 1; i++) {
    const n0 = node.child(i);
    const n1 = node.child(i + 1);

    if (typeof n0 !== "string" && n0.name === "Br") {
      if (typeof n1 !== "string" && n1.name === "Br") {
        node.removeChild(i);
        node.removeChild(i);
        node.insertChild(i, new Separator([]));
      }
    }
  }
}
