import "regenerator-runtime";

import "../style.css";

import Post from "./post.mdx";

import { render } from "react-dom";
import React from "react";

document.addEventListener("DOMContentLoaded", async function() {
  const appDiv = document.getElementById("app");
  render(
    <div className="container">
      <Post />
    </div>,
    appDiv
  );
});
