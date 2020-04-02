import React, { Component, ReactElement } from "react";
import { ContentEditable } from "./demo/content-editable";
import { parseToIr } from "2md/src/parse";
import { BlockRendering } from "2md/src/render";
import { renderToStaticMarkup } from "react-dom/server";
import copy from "copy-to-clipboard";

interface ToMdProps {
  render: (options: {
    toMd: ToMd;
    editor: ReactElement<ContentEditable>;
    toggleQuote: ReactElement<HTMLInputElement>;
    markdown: string;
  }) => ReactElement;
}

interface ToMdState {
  doc?: Element;
  quote: boolean;
}

export class ToMd extends Component<ToMdProps, ToMdState> {
  constructor(props: ToMdProps) {
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

    return this.props.render({
      toMd: this,
      editor: (
        <ContentEditable
          className="border border-primary my-4"
          onInput={this.setHtml}
          value={this.state.doc?.innerHTML}
        />
      ),
      toggleQuote: (
        <input
          type="checkbox"
          className="form-check-input"
          onChange={this.toggleQuote}
          checked={this.state.quote}
        />
      ),
      markdown
    });
  }
}
