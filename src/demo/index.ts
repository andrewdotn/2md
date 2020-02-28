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
  const input = document.getElementById("input");
  input.contentEditable = true;

  const htmlField = document.getElementById("html") as
    | HTMLInputElement
    | undefined;
  if (!htmlField) {
    throw Error("couldn’t find input field");
  }
  htmlField.value = "<b>blah blah</b>";

  const output = document.getElementById("output");
  if (!output) {
    throw new Error("couldn’t find output");
  }

  const update = () => {
    output.innerText = render(htmlField.value);
  };

  update();
  htmlField.addEventListener("input", update);
  input.addEventListener("input", () => {
    htmlField.value = input.innerHTML;
    update();
  });
});
