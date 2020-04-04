import { MDXProvider } from "@mdx-js/react";
import { render } from "react-dom";
import React from "react";
import "regenerator-runtime";
import Post from "./post.mdx";
import "../style.scss";
import { EmailForm } from "../email-form";

document.addEventListener("DOMContentLoaded", async function() {
  const appDiv = document.getElementById("app");

  const components = {
    blockquote: (props: any) => (
      <blockquote className="blockquote app-blockquote" {...props} />
    )
  };

  render(
    <>
      <MDXProvider components={components}>
        <Post />
      </MDXProvider>

      <footer className="sticky-footer bg-light">
        <div className="container">
          <div className="row">
            <div className="col-md-3 my-2">
              Feedback is welcome!
              <br className="d-none d-md-block" />
              <a href="mailto:feedback@2md.ca">Send me an email</a>
            </div>

            <div className="col-md-9 my-2">
              <h5>Mailing list</h5>

              <p>
                If you liked this article, and want to be one of the first to
                see future articles, subscribe to my mailing list.
              </p>

              <EmailForm list="announce" domain="2md.ca" />
            </div>

            <div className="col my-2 d-flex justify-content-center">
              <b className="text-muted">
                Copyright &copy; 2019-2020 All rights reserved.
              </b>
            </div>
          </div>
        </div>
      </footer>
    </>,
    appDiv
  );
});
