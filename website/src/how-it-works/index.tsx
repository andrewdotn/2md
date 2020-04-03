import "regenerator-runtime";

import { MDXProvider } from "@mdx-js/react";

import "../style.scss";

import Post from "./post.mdx";

import { render } from "react-dom";
import React from "react";

document.addEventListener("DOMContentLoaded", async function() {
  const appDiv = document.getElementById("app");

  const components = {
    blockquote: (props: any) => (
      <blockquote className="blockquote app-blockquote" {...props} />
    )
  };

  render(
    <MDXProvider components={components}>
      <Post />
    </MDXProvider>,

    appDiv
  );
});
