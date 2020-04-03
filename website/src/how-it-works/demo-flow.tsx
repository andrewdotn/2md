import React, { Component } from "react";
import { ContentEditable } from "../demo/content-editable";
import { DomView } from "../demo/dom-view";
import { parseToIr } from "2md/src/parse";
import { BlockRendering, OutputBlock } from "2md/src/render";
import { IrNode } from "2md/src/2md";
import { FixtureSelector } from "../demo/fixture-selector";
import { fixtures } from "../generated-fixtures";
import { renderToStaticMarkup } from "react-dom/server";
import { IrView } from "../demo/ir-view";
import { BlockView } from "../demo/block-view";

interface DemoFlowState {
  rawHtml?: string;
  dom?: Node;
  intermediate?: IrNode;
  untransformedIntermediate?: IrNode;
  markdown?: string;
  rendered?: OutputBlock[];
  setHtml: (html: string) => void;
}

const DemoContext = React.createContext({
  setHtml: () => {}
} as DemoFlowState);

export class DemoFlow extends Component<{}, DemoFlowState> {
  constructor(props: {}) {
    super(props);

    if (!fixtures.has("Hello world")) {
      fixtures.set(
        "Hello world",
        renderToStaticMarkup(
          <div>
            {/*
            With content-editable, sometimes doing select-all, then paste, was
            pasting into the <h3> node, causing badly messed-up markdown output.
            By having a <p> first it doesn’t look as nice but we skip that bug.
        */}
            <p className="mb-1">Welcome</p>
            <h3 className="">Input</h3>
            <p>
              Paste <i>formatted</i> text here to see it turned into Markdown.
            </p>
          </div>
        )
      );
    }

    this.state = {
      setHtml: this.setHtml,
      ...this.computeState(fixtures.get("Nested lists")!)
    };
  }

  computeState = (rawHtml: string) => {
    const doc = document.implementation.createHTMLDocument();
    const div = doc.createElement("div");
    doc.body.appendChild(div);
    div.innerHTML = rawHtml;

    const dom = doc;

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
      markdown
    };
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
          <>
            <p className="bg-light mb-0 pb-2 border border-bottom-0">
              Select a sample from{" "}
              <FixtureSelector
                html={rawHtml}
                onChange={setHtml}
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
            onChange={e => setHtml(e.currentTarget.value)}
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
      <div className="mb-2">
        <DemoContext.Consumer>
          {({ rendered }) => <BlockView blocks={rendered} />}
        </DemoContext.Consumer>
      </div>
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
