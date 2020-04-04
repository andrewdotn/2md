import "regenerator-runtime";

import "./style.css";

import React from "react";
import { render } from "react-dom";
import { Demo } from "./demo";
import { ErrorBoundary } from "./error-boundary";

document.addEventListener("DOMContentLoaded", async function() {
  const appDiv = document.getElementById("app");
  render(
    <React.StrictMode>
      <ErrorBoundary>
        <Demo />
      </ErrorBoundary>
    </React.StrictMode>,
    appDiv
  );
});
