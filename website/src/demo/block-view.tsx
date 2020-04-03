import { OutputBlock } from "2md/src/render";
import React, { Component } from "react";
import { vis } from "./util";

interface BlockViewProps {
  blocks?: OutputBlock[];
  depth?: number;
}

function expand(s: string) {
  return <code>"{s.replace(/ /g, "\xa0")}"</code>;
}

export class BlockView extends Component<BlockViewProps> {
  render() {
    let { blocks } = this.props;
    let depth = this.props.depth ?? 0;

    if (!blocks) {
      return;
    }

    const ret = [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const prefix = b.prefixStack[depth];

      if (b.prefixStack.length === depth) {
        ret.push(
          <div className="block-view__content">
            <code>{vis(b.contents())}</code>
          </div>
        );
      } else {
        ret.push(
          <div className="block-view__item">
            <div className="block-view__prefix">
              {expand(prefix.first)}
              {prefix.first !== prefix.subsequent && (
                <>
                  {" "}
                  <br />
                  then
                  <br />
                  {expand(prefix.subsequent)}
                </>
              )}
            </div>
            <BlockView blocks={[b]} depth={depth + 1} />
          </div>
        );
      }
    }

    return ret;
  }
}
