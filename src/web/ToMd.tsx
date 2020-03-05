import React, { Component } from "react";
import { ContentEditable } from "./demo/content-editable";
import { parseToIr } from "../parse";
import { BlockRendering } from "../render";

interface ToMdState {
  html: string;
  doc?: Node;
  quote: boolean;
}

export class ToMd extends Component<{}, ToMdState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      html: "<h1>Hello world</h1>",
      quote: false
    };
  }

  setHtml = (html: string, doc?: Node) => {
    this.setState({ html, doc });
  };

  toggleQuote = () => {
    this.setState(s => ({ quote: !s.quote }));
  };

  render() {
    let markdown = "";
    if (this.state.doc || this.state.html) {
      let doc: Node | undefined = this.state.doc;
      if (!doc && this.state.html) {
        const div = document.createElement("div");
        div.innerHTML = this.state.html;
        doc = div;
      }
      console.log(doc);
      const intermediate = parseToIr(doc!, {
        quote: this.state.quote
      });
      const rendered = new BlockRendering();
      intermediate.render(rendered);
      markdown = rendered.finish();
    }

    return (
      <div>
        <h1>2md</h1>
        <h2>Convert formatted text to Markdown</h2>
        <a href="https://github.com/andrewdotn/2md">github</a>
        <p>Paste something here to get Markdown</p>
        <ContentEditable
          className="toMd-demo__input-area"
          onInput={this.setHtml}
          value={this.state.html}
        />
        <label>
          <input
            type="checkbox"
            onChange={this.toggleQuote}
            checked={this.state.quote}
          />
          Quote
        </label>
        <pre>{markdown}</pre>
        <a href="demo.html">Detailed demo</a>
      </div>
    );
  }
}
