import { OutputBlock, Prefix } from "2md/src/render";
import React, { Component, CSSProperties } from "react";
import { vis } from "./util";

interface BlockViewProps {
  blocks?: OutputBlock[];
}

function expand(s: string) {
  return <code>"{s.replace(/ /g, "\xa0")}"</code>;
}

export class BlockView extends Component<BlockViewProps> {
  render() {
    let { blocks } = this.props;

    if (!blocks) {
      return;
    }

    const seen = new Set<Prefix>();

    const ret = [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];

      for (let depth = 0; depth < b.prefixStack.length; depth++) {
        const prefix = b.prefixStack[depth];
        if (seen.has(prefix)) {
          continue;
        }
        seen.add(prefix);

        let span = 1;
        for (let j = i + 1; j < blocks.length; j++) {
          if (blocks[j].prefixStack[depth] === prefix) {
            span++;
          }
        }

        const style: CSSProperties = {
          gridRowStart: `span ${span}`,
        gridColumnStart: (depth + 1).toString();
        };
        ret.push(
          <div className="block-view__prefix" style={style}>
            {expand(prefix.first)}
            {prefix.first !== prefix.subsequent && (
              <>
                {" "}
                <br />
                <span className="block-view__then">then</span>
                <br />
                {expand(prefix.subsequent)}
              </>
            )}
          </div>
        );
      }

      ret.push(
        <div
          className="block-view__content"
          style={{ gridColumnStart: b.prefixStack.length + 1 }}
        >
          <code>{vis(b.contents())}</code>
        </div>
      );
    }
    return <div className="block-view">{ret}</div>;
  }
}
