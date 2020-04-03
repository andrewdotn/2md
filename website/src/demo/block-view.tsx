import { OutputBlock } from "2md/src/render";
import React, { Component } from "react";
import { vis } from "./util";

interface BlockViewProps {
  blocks?: OutputBlock[];
  depth?: number;
}

function expand(s: string) {
    return <code>"{s.replace(/ /g, '\xa0')}"</code>
}

export class BlockView extends Component<BlockViewProps> {
  render() {
    let { blocks } = this.props;
    let depth = this.props.depth ?? 0;

    if (!blocks) {
      return;
    }

    const ret = [];
    ret.push(<div>{blocks.length} blocks</div>);

    // ret.push(<pre>{JSON.stringify(blocks, null, 2)}</pre>);

    let prevPrefix;
    let commonPrefix = [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];

      if (b.prefixStack.length === depth) {
      ret.push(
        <div>
          <pre>{vis(b.contents())}</pre>
        </div>
      );
      } else {
          ret.push(
              <div className="" style={{marginLeft: '10px'}}>
                  <div className="d-inline-block border-primary">
                  {depth}<br/>
                  {expand(b.prefixStack[depth].first)}, {expand(b.prefixStack[depth].subsequent)}
              </div>
              <div className="d-inline-block border-info">
              <BlockView blocks={[b]} depth={depth + 1}/>
              <div className="clearfix"/>
          </div>
              </div>
      }

      // if (!prevPrefix || b.prefixStack?.[depth] === prevPrefix) {
      //   commonPrefix.push(b);
      // } else {
      //   // ret.push(<BlockView blocks={commonPrefix} depth={depth + 1} />);
      //   commonPrefix = [];
      // }
      // prevPrefix = b.prefixStack?.[0];
    }

    return ret;
  }
}
