import React, { Component } from "react";
import { ContentEditable } from "./demo/content-editable";
import { parseToIr } from "../parse";
import { BlockRendering } from "../render";
import { renderToStaticMarkup } from "react-dom/server";
import copy from "copy-to-clipboard";

interface ToMdState {
  doc?: Element;
  quote: boolean;
}

export class ToMd extends Component<{}, ToMdState> {
  constructor(props: {}) {
    super(props);

    // Initial message
    const div = document.createElement("div");
    div.innerHTML = renderToStaticMarkup(
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
    );
    this.state = {
      doc: div,
      quote: false
    };
  }

  setHtml = (html: string, doc?: Element) => {
    this.setState({ doc });
  };

  toggleQuote = () => {
    this.setState(s => ({ quote: !s.quote }));
  };

  copyToClipboard = (data: string) => {
    return () => copy(data + "\n");
  };

  render() {
    let markdown = "";
    if (this.state.doc) {
      const intermediate = parseToIr(this.state.doc, {
        quote: this.state.quote
      });
      const rendered = new BlockRendering();
      intermediate.render(rendered);
      markdown = rendered.finish();
    }

    return (
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col-md-auto">
            <div>
              <h1 className="d-inline">
                <a href="https://github.com/andrewdotn/2md">2md</a>:{" "}
              </h1>
              <h2 className="d-inline">Convert formatted text to Markdown</h2>
            </div>
            <ContentEditable
              className="border border-primary my-4"
              onInput={this.setHtml}
              value={this.state.doc?.innerHTML}
            />
            <div className="d-flex flex-wrap">
              <h3 className="d-inline mb-0">Markdown</h3>
              <div className="flex-fill" />
              <div className="mb-0 align-self-baseline form-group form-check">
                <label>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    onChange={this.toggleQuote}
                    checked={this.state.quote}
                  />
                  Quote
                </label>
              </div>
              <a className="align-self-baseline btn btn-link" href="demo.html">
                Developer demo
              </a>
              <button
                className="align-self-baseline btn btn-primary btn-sm mb-2"
                onClick={this.copyToClipboard(markdown)}
              >
                Copy to clipboard
              </button>
            </div>
            <pre className="border bg-light">{markdown}</pre>
          </div>
        </div>
      </div>
    );
  }
}
