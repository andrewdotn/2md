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
        <ToMd />
      </ErrorBoundary>
    </React.StrictMode>,
    appDiv
  );
});
