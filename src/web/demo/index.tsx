import "./style.css";

import React from "react";
import { render } from "react-dom";
import { Demo, helloWorldHtml } from "./demo";
import { ErrorBoundary } from "./error-boundary";

async function loadFixtures() {
  // parcel gets these using fetch; would prefer static inclusion, but not
  // enough to spend any time making it happen.
  const fixturePromises = {
    "Ars Technica": import("../../../fixtures/quote1.html"),
    MDN: import("../../../fixtures/quote2.html"),
    "Node JS": import("../../../fixtures/nodejs.html"),
    "Stack Overflow": import("../../../fixtures/quote3.html")
  };
  await Promise.all(Object.keys(fixturePromises));
  const ret = new Map<string, string>();
  ret.set("Hello world", helloWorldHtml);
  for (const [key, html] of Object.entries(fixturePromises)) {
    ret.set(key, ((await html) as unknown) as string);
  }
  return ret;
}

document.addEventListener("DOMContentLoaded", async function() {
  const fixtures = await loadFixtures();

  const appDiv = document.getElementById("app");
  render(
    <React.StrictMode>
      <ErrorBoundary>
        <Demo fixtures={fixtures} />
      </ErrorBoundary>
    </React.StrictMode>,
    appDiv
  );
});
