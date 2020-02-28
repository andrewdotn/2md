import "./style.css";
import { parse } from "../parse";
import { BlockRendering } from "../render";

function render(input: string) {
  const intermediate = parse(input);
  console.log(intermediate);

  const rendered = new BlockRendering();
  intermediate.render(rendered);
  console.log(rendered);
  return rendered.finish();
}

document.addEventListener("DOMContentLoaded", function() {
  const inputField = document.getElementById("input") as
    | HTMLInputElement
    | undefined;
  if (!inputField) {
    throw Error("couldn’t find input field");
  }
  inputField.value = "<b>blah blah</b>";

  const output = document.getElementById("output");
  if (!output) {
    throw new Error("couldn’t find output");
  }

  const update = () => {
    output.innerText = render(inputField.value);
  };

  update();
  inputField.addEventListener("input", update);
});
