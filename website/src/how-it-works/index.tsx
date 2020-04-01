import "regenerator-runtime";

import "../style.scss";

import Post from "./post.mdx";

import { render } from "react-dom";
import React from "react";

document.addEventListener("DOMContentLoaded", async function() {
  const appDiv = document.getElementById("app");
  render(<Post />, appDiv);
});
