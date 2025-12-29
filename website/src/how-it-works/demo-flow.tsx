import React, { Component } from "react";
import { ContentEditable } from "../demo/content-editable";
import { DomView } from "../demo/dom-view";
import { parseToIr } from "2md/src/parse";
import { BlockRendering, OutputBlock } from "2md/src/render";
import { IrNode } from "2md/src/2md";
import { FixtureSelector } from "../demo/fixture-selector";
import { fixtures } from "../generated-fixtures";
import { IrView } from "../demo/ir-view";
import { BlockView } from "../demo/block-view";
import { Fixture } from "../gen-fixtures";
import { parse as parse5 } from "parse5";
import type { ChildNode } from "parse5/dist/tree-adapters/default";

interface DemoFlowState {
  rawHtml?: string;
  selectedFixture?: Fixture;
  dom?: ChildNode;
  intermediate?: IrNode;
  untransformedIntermediate?: IrNode;
  markdown?: string;
  rendered?: OutputBlock[];
  setHtml: (html: string) => void;
  setFixture: (fixture: Fixture) => void;
}

export const DemoContext = React.createContext({
  setHtml: () => {},
  setFixture: () => {},
} as DemoFlowState);

export class DemoFlow extends Component<{}, DemoFlowState> {
  constructor(props: {}) {
    super(props);

    const defaultFixture = fixtures.get("Ars Technica")!;
    this.state = {
      setHtml: this.setHtml,
      setFixture: this.setFixture,
      selectedFixture: defaultFixture,
      ...this.computeState(defaultFixture.html),
    };
  }

  computeState = (rawHtml: string) => {
    const doc = parse5(rawHtml);
    const dom = doc.childNodes[0];

    const intermediate = parseToIr(doc, {});

    const untransformedIntermediate = parseToIr(doc, {}, true);
    const rendered = new BlockRendering();
    intermediate.render(rendered);
    const markdown = rendered.finish();

    return {
      rawHtml,
      dom,
      intermediate,
      untransformedIntermediate,
      rendered: rendered.outputBlocks,
      markdown,
    };
  };

  setHtml = (rawHtml: string) => {
    this.setState({
      selectedFixture: undefined,
      ...this.computeState(rawHtml),
    });
  };

  setFixture = (newFixture: Fixture) => {
    this.setState({
      selectedFixture: newFixture,
      ...this.computeState(newFixture.html),
    });
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
        {({ rawHtml, setHtml, setFixture, selectedFixture }) => (
          <>
            <p className="bg-light mb-0 pb-2 border border-bottom-0">
              Select a sample from{" "}
              <FixtureSelector
                defaultValue={selectedFixture}
                onChange={setFixture}
                fixtures={fixtures}
              />
              , click to start typing, or select all and paste something.
            </p>
            <ContentEditable
              className="border border-primary p-1 mb-3"
              onInput={(newValue, element) =>
                element && setHtml(element?.innerHTML)
              }
              value={rawHtml}
            />
          </>
        )}
      </DemoContext.Consumer>
    );
  }
}

export function DemoHtmlEditor() {
  return (
    <>
      <DemoContext.Consumer>
        {({ rawHtml, setHtml }) => (
          <textarea
            // <textarea> defaults to `vertical-align: baseline`, resulting in
            // mysterious vertical gaps between it and things met to adjoin
            // it. https://stackoverflow.com/a/35906942/14558
            className="w-100 align-bottom"
            rows={10}
            onChange={(e) => setHtml(e.currentTarget.value)}
            value={rawHtml}
          />
        )}
      </DemoContext.Consumer>
      <div className="bg-light border border-top-0 py-1 mb-3">
        Yes, this HTML is also editable, so that you can see how changes here
        flow through the other steps of the process.
      </div>
    </>
  );
}

export function DemoCharCount() {
  return (
    <DemoContext.Consumer>
      {({ rawHtml }) => rawHtml?.length?.toString() ?? "??"}
    </DemoContext.Consumer>
  );
}

export function DemoDom() {
  return (
    <div className="mb-3">
      <DemoContext.Consumer>
        {({ dom }) => dom && <DomView node={dom} />}
      </DemoContext.Consumer>
    </div>
  );
}

export function DemoUntransformedIntermediate() {
  return (
    <div className="mb-2">
      <DemoContext.Consumer>
        {({ untransformedIntermediate }) => (
          <IrView ir={untransformedIntermediate} />
        )}
      </DemoContext.Consumer>
    </div>
  );
}

export function DemoIntermediate() {
  return (
    <div className="mb-2">
      <DemoContext.Consumer>
        {({ intermediate }) => <IrView ir={intermediate} />}
      </DemoContext.Consumer>
    </div>
  );
}

export function DemoOutputBlocks() {
  return (
    <>
      <DemoContext.Consumer>
        {({ rendered }) => (
          <div className="mb-3 float-left">
            <BlockView blocks={rendered} />
          </div>
        )}
      </DemoContext.Consumer>
      <div className="clearfix" />
    </>
  );
}

export function DemoMarkdown() {
  return (
    <DemoContext.Consumer>
      {({ markdown }) => (
        <pre>
          <code>{markdown}</code>
        </pre>
      )}
    </DemoContext.Consumer>
  );
}

export class DemoImage extends Component<{ src: string }> {
  render() {
    return (
      <div className="demo-image">
        <a href={this.props.src}>
          <img style={{ maxWidth: "100%" }} src={this.props.src} />
        </a>
      </div>
    );
  }
}
