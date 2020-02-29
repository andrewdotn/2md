import endent from "endent";
import React, { Component } from "react";
import { ContentEditable } from "./content-editable";
import { FixtureDictionary, FixtureSelector } from "./fixture-selector";
import { parse, parseHtml } from "../parse";
import { BlockRendering } from "../render";
import { format } from "prettier/standalone";
import prettierHtmlPlugin from "prettier/parser-html";
import { DomView } from "./dom-view";

/** Run prettier on the input html, returning original if there are any syntax
 * errors. */
function getPrettierHtml(html: string) {
  try {
    return format(html, {
      parser: "html",
      plugins: [prettierHtmlPlugin]
    });
  } catch (e) {
    if (e instanceof SyntaxError) {
      return html;
    }
    throw e;
  }
}

export const helloWorldHtml = endent`
        <div>
        <h1>Hello, <i>world</i></h1>
        <p>This is some sample html.</p>
        </div>`;

interface AppProps {
  fixtures: FixtureDictionary;
}

interface AppState {
  rawHtml: string;
}

export class App extends Component<AppProps, AppState> {
  state = {
    rawHtml: helloWorldHtml
  };

  setHtml = (newValue: string) => {
    this.setState({ rawHtml: newValue });
  };

  prettifyRawHtml = () => {
    this.setState(s => ({ rawHtml: getPrettierHtml(s.rawHtml) }));
  };

  render() {
    const html = this.state.rawHtml ?? "";

    const dom = parseHtml(html);

    const intermediate = parse(html);
    const rendered = new BlockRendering();
    intermediate.render(rendered);
    const markdown = rendered.finish();

    return (
      <div className="toMd-demo">
        <h1>2md demo</h1>
        <div className="toMd-demo__wrapper">
          <div className="toMd-demo__column">
            <h2>Input</h2>
            <p>
              Select a sample from{" "}
              <FixtureSelector
                onChange={this.setHtml}
                fixtures={this.props.fixtures}
              />
              , click to start typing, or paste something.
            </p>
            <ContentEditable
              className="toMd-demo__input-area"
              value={this.state.rawHtml}
              onInput={this.setHtml}
            />
          </div>
          <div className="toMd-demo__column toMd-demo__column__flex">
            <h2>Raw</h2>
            <button onClick={this.prettifyRawHtml}>Run prettier</button>
            <textarea
              className="toMd-demo__input-textarea"
              onChange={e => this.setHtml(e.currentTarget.value)}
              value={this.state.rawHtml}
            />
          </div>
          <div className="toMd-demo__column">
            <h2>DOM</h2>
            <DomView node={dom.getRootNode()} />
          </div>
          <div className="toMd-demo__column">
            <h2>Intermediate</h2>
            <pre className="toMd-demo__output">
              {JSON.stringify(
                intermediate,
                (k, v) => (k == "parent" ? undefined : v),
                2
              )}
            </pre>
          </div>
          <div className="toMd-demo__column">
            <h2>Output blocks</h2>
            <pre className="toMd-demo__output">
              {JSON.stringify(rendered, null, 2)}
            </pre>
          </div>
          <div className="toMd-demo__column">
            <h2>Markdown</h2>
            <pre className="toMd-demo__output">{markdown}</pre>
          </div>
        </div>
      </div>
    );
  }
}
