import React from "react";
import { ToMd } from "../ToMd";

export function SimpleToMd() {
  return (
    <ToMd
      render={({ editor, toggleQuote, markdown, toMd }) => (
        <div>
          {editor}
          <pre>{markdown}</pre>
        </div>
      )}
    />
  );
}
