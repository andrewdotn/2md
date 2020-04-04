import "regenerator-runtime";

import { render } from "react-dom";
import React from "react";
import { ErrorBoundary } from "./demo/error-boundary";
import { ToMd } from "./ToMd";

document.addEventListener("DOMContentLoaded", async function() {
  const appDiv = document.getElementById("app");
  render(
    <React.StrictMode>
      <ErrorBoundary>
        <div className="container">
          <div className="row justify-content-md-center">
            <ToMd
              render={({ editor, toggleQuote, markdown, toMd }) => (
                <div className="col-md-auto">
                  <div>
                    <h1 className="d-inline">
                      <a href="https://github.com/andrewdotn/2md">2md</a>:{" "}
                    </h1>
                    <h2 className="d-inline">
                      Convert formatted text to Markdown
                    </h2>
                  </div>
                  {editor}
                  <div className="d-flex flex-wrap">
                    <h3 className="d-inline mb-0">Markdown</h3>
                    <div className="flex-fill" />
                    <div className="mb-0 align-self-baseline form-group form-check mr-2">
                      <label>
                        {toggleQuote}
                        Quote
                      </label>
                    </div>
                    <a className="align-self-baseline btn btn-link" href="demo">
                      Developer demo
                    </a>
                    <button
                      className="align-self-baseline btn btn-primary btn-sm mb-2"
                      onClick={toMd.copyToClipboard(markdown)}
                    >
                      Copy to clipboard
                    </button>
                  </div>
                  <pre className="border bg-light markdown-output">
                    {markdown}
                  </pre>
                  <div className="mx-auto">
                    <b>2020-04-04</b>: <a href="/how-it-works">How it works</a>
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </ErrorBoundary>
    </React.StrictMode>,
    appDiv
  );
});
