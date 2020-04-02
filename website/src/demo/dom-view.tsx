import React, { Component } from "react";

interface DomViewProps {
  node: Node;
}

function vis(s: string | null) {
  if (!s) {
    return '""'
  }
  if (/^\s*$/.test(s)) {
    return `"${s}"`;
  }
  return s.replace(/\n/g, '\\n');
}

export class DomView extends Component<DomViewProps> {
  render() {
    const node = this.props.node;
    const children = [];
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      children.push(<DomView node={child} />);
    }

    const attrInfo = [];
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attrInfo.push(" ");
        attrInfo.push(<span title={attr.value}>{attr.name}="…"</span>);
      }
    }

    const isText = node.nodeType === Node.TEXT_NODE;

    return (
      <div className="dom-view__node-wrapper">
        {node.nodeName}
        {attrInfo}
        {isText && (
          <>
            {" "}
            <code>{vis(node.textContent)}</code>
          </>
        )}
        {!isText && <br />}
        {children}
      </div>
    );
  }
}
