import React, { Component } from "react";
import { ContentEditable } from "../demo/content-editable";
import { DomView } from "../demo/dom-view";
import { parseToIr } from "../../../core/src/parse";
import { BlockRendering } from "../../../core/src/render";
import { IrNode } from "../../../core/src/2md";
import { FixtureSelector } from "../demo/fixture-selector";
import { fixtures } from "../generated-fixtures";

interface DemoFlowState {
  rawHtml?: string;
  dom?: Node;
  intermediate?: IrNode;
  markdown?: string;
  setHtml: (html: string) => void;
}

const DemoContext = React.createContext({
  setHtml: () => {}
} as DemoFlowState);

export class DemoFlow extends Component<{}, DemoFlowState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      setHtml: this.setHtml,
      ...this.computeState(fixtures.get("Ars Technica")!)
    };
  }

  computeState = (rawHtml: string) => {
    const doc = document.implementation.createHTMLDocument();
    const div = doc.createElement("div");
    doc.body.appendChild(div);
    div.innerHTML = rawHtml;

    const dom = doc;

    const intermediate = parseToIr(doc, {});
    const rendered = new BlockRendering();
    intermediate.render(rendered);
    const markdown = rendered.finish();

    return { rawHtml, dom, intermediate, markdown };
  };

  setHtml = (rawHtml: string) => {
    this.setState(this.computeState(rawHtml));
  };

  render() {
    return (
      <DemoContext.Provider value={this.state}>
        {this.props.children}
      </DemoContext.Provider>
    );
  }
}

export class DemoContent extends Component {
  render() {
    return (
      <DemoContext.Consumer>
        {({ rawHtml, setHtml }) => (
          <div>
            <p>
              Select a sample from{" "}
              <FixtureSelector onChange={setHtml} fixtures={fixtures} />, click
              to start typing, or paste something.
            </p>
            <ContentEditable
              onInput={(newValue, element) =>
                element && setHtml(element?.innerHTML)
              }
              value={rawHtml}
            />
          </div>
        )}
      </DemoContext.Consumer>
    );
  }
}

export function DemoHtmlEditor() {
  return (
    <DemoContext.Consumer>
      {({ rawHtml, setHtml }) => (
        <textarea
          className="toMd-demo__input-textarea"
          onChange={e => setHtml(e.currentTarget.value)}
          value={rawHtml}
        />
      )}
    </DemoContext.Consumer>
  );
}

export function DemoDom() {
  return (
    <DemoContext.Consumer>
      {({ dom }) => dom && <DomView node={dom} />}
    </DemoContext.Consumer>
  );
}

export function DemoIntermediate() {
  return (
    <DemoContext.Consumer>
      {({ intermediate }) => (
        <pre className="toMd-demo__output">
          {JSON.stringify(
            intermediate,
            (k, v) => (k == "parent" ? undefined : v),
            2
          )}
        </pre>
      )}
    </DemoContext.Consumer>
  );
}

export function DemoMarkdown() {
  return (
    <DemoContext.Consumer>
      {({ markdown }) => <pre>{markdown}</pre>}
    </DemoContext.Consumer>
  );
}
