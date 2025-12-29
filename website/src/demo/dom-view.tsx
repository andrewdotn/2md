import React, { Component } from "react";
import { vis } from "./util";
import type { ChildNode, Element } from "parse5/dist/tree-adapters/default";
import { defaultTreeAdapter as adapter } from "parse5";

interface DomViewProps {
  node: ChildNode;
}

export class DomView extends Component<DomViewProps> {
  render() {
    const node = this.props.node;
    console.log({ node });
    const children = [];

    if (node && adapter.isElementNode(node)) {
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        children.push(<DomView node={child} />);
      }
    }

    const attrInfo = [];
    if (node && adapter.isElementNode(node)) {
      const element = node as Element;
      for (let i = 0; i < element.attrs.length; i++) {
        const attr = element.attrs[i];
        attrInfo.push(" ");
        attrInfo.push(<span title={attr.value}>{attr.name}="…"</span>);
      }
    }

    const isText = node && adapter.isTextNode(node);

    return (
      <div className="dom-view__node-wrapper">
        {node && node.nodeName}
        {attrInfo}
        {isText && (
          <>
            {" "}
            <code>{vis(node.value)}</code>
          </>
        )}
        {!isText && <br />}
        {children}
      </div>
    );
  }
}
