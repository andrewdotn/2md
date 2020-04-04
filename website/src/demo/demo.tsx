import React from "react";
import { ContentEditable } from "./content-editable";
import { FixtureSelector } from "./fixture-selector";
import {
  DemoContext,
  DemoFlow,
  DemoIntermediate,
  DemoUntransformedIntermediate
} from "../how-it-works/demo-flow";
import { fixtures } from "../generated-fixtures";
import { DomView } from "./dom-view";
import "./dom-view.css";
import { BlockView } from "./block-view";
import "./block-view.css";

export function Demo() {
  let div = (
    <>
      <div className="toMd-demo">
        <DemoFlow>
          <div className="toMd-demo__heading">
            <h1 className="toMd-demo__heading-piece">
              <a href="/">2md</a> demo{" "}
            </h1>
            <span className="toMd-demo__heading-piece">
              <a href="/">friendly version</a>
            </span>
            <span className="toMd-demo__heading-piece">
              this page shows some of the internals of 2md, for an explanation
              see <a href="/how-it-works">how it works</a>
            </span>
          </div>
          <div className="toMd-demo__wrapper">
            <div className="toMd-demo__column">
              <h2>Input</h2>

              <DemoContext.Consumer>
                {({ rawHtml, setHtml }) => (
                  <>
                    <p>
                      Select a sample from{" "}
                      <FixtureSelector
                        html={rawHtml}
                        onChange={setHtml}
                        fixtures={fixtures}
                      />
                      , click to start typing, or select all and paste
                      something.
                    </p>
                    <ContentEditable
                      className="toMd-demo__input-area"
                      onInput={(newValue, element) =>
                        element && setHtml(element?.innerHTML)
                      }
                      value={rawHtml}
                    />
                  </>
                )}
              </DemoContext.Consumer>
            </div>
            <div className="toMd-demo__column toMd-demo__column__flex">
              <h2>Raw</h2>
              <DemoContext.Consumer>
                {({ rawHtml, setHtml }) => (
                  <textarea
                    className="toMd-demo__input-textarea"
                    onChange={e => setHtml(e.currentTarget.value)}
                    value={rawHtml}
                  />
                )}
              </DemoContext.Consumer>
            </div>
            <div className="toMd-demo__column">
              <h2>DOM</h2>
              <DemoContext.Consumer>
                {({ dom }) => dom && <DomView node={dom} />}
              </DemoContext.Consumer>
            </div>
            <div className="toMd-demo__column">
              <h2>Intermediate pre-transform</h2>
              <DemoUntransformedIntermediate />
            </div>
            <div className="toMd-demo__column">
              <h2>Intermediate post-transform</h2>
              <DemoIntermediate />
            </div>
            <div className="toMd-demo__column">
              <h2>Output blocks</h2>
              <DemoContext.Consumer>
                {({ rendered }) => <BlockView blocks={rendered} />}
              </DemoContext.Consumer>
            </div>
            <div className="toMd-demo__column">
              <h2>Markdown</h2>

              <DemoContext.Consumer>
                {({ markdown }) => (
                  <pre className="toMd-demo__output">
                    <code>{markdown}</code>
                  </pre>
                )}
              </DemoContext.Consumer>
            </div>
          </div>
        </DemoFlow>
      </div>
    </>
  );
  return div;
}
