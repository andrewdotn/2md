import React, { Component } from "react";
import { IrNode } from "../../../core/src/2md";
import { vis } from "./util";

interface IrViewProps {
  ir?: IrNode;
}

const ignoredProperties = ["name", "children", "parent"];

export class IrView extends Component<IrViewProps> {
  render() {
    if (!this.props.ir) {
      return;
    }

    const ir = this.props.ir;
    const renderAttrs = [];
    for (const name of Object.getOwnPropertyNames(ir)) {
      if (!ignoredProperties.includes(name)) {
        renderAttrs.push(
          <span>
            {name}=<code>{vis((ir as any)[name]?.toString())}</code>
          </span>
        );
      }
    }

    const renderChildren = [];
    for (let i = 0; i < ir.childCount(); i++) {
      const child = ir.child(i);
      if (typeof child === "string") {
        renderChildren.push(
          <div className="dom-view__node-wrapper">
            string: <code>{vis(child)}</code>
          </div>
        );
      } else {
        renderChildren.push(<IrView ir={child} />);
      }
    }

    return (
      <div className="dom-view__node-wrapper">
        {ir.name} {renderAttrs}
        {renderChildren.length > 0 && renderChildren}
      </div>
    );
  }
}
