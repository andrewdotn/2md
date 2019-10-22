import yargs from "yargs";
import { run } from "./run";
import { parse } from "./parse";
import { Rendering } from "./render";
import { readFile } from "fs-extra";
import { inspect } from "util";

export function toMd(html: string): string {
  const intermediate = parse(html);

  const rendered = new Rendering();
  intermediate.render(rendered);
  rendered.finish();

  return rendered.result;
}

// https://stackoverflow.com/a/54071129/14558
function tuple<T extends string[]>(...o: T) {
  return o;
}

async function main() {
  const outputFormats = tuple("raw", "ir", "md");
  type OutputFormat = typeof outputFormats[number];

  const argv = yargs
    .strict()
    .demandCommand(0, 1)
    .usage(
      `2md [options] [FILE]

Converts formatted text to markdown. Defaults to reading the clipboard.`
    )
    .option("output-format", { choices: outputFormats, default: "md" }).argv;

  let input: string;
  if (argv._.length == 1) {
    input = (await readFile(argv._[0])).toString();
  } else {
    // Getting the clipboard as HTML is relatively easy in swift:
    // https://stackoverflow.com/a/36109230/14558 but it’s not obvious how to call
    // that API from nodejs, though I’m sure a native extension could be written.
    //
    // https://github.com/sindresorhus/clipboardy shells out to pbpaste
    // and electron calls into Chromium’s native clipboard access code
    const osaOutput = await run([
      "osascript",
      "-e",
      "the clipboard as «class HTML»"
    ]);
    const hexEncodedHtml = osaOutput.stdout;
    const match = /^«data HTML((?:[0-9A-F]{2})+)»$\n/m.exec(hexEncodedHtml);
    if (!match) {
      throw new Error("Could not parse osascript output");
    }
    input = Buffer.from(match[1], "hex").toString();
  }

  const outputFormat: OutputFormat = <OutputFormat>argv.outputFormat;

  let output: string;
  switch (outputFormat) {
    case "raw":
      output = input;
      break;
    case "ir":
      const intermediate = parse(input);
      output = inspect(intermediate, false, 10);
      break;
    case "md":
      output = toMd(input);
      break;
    default:
      throw new Error(`Unknown output format ${inspect(outputFormat)}`);
  }

  console.log(output);
}

if (require.main === module) {
  main().catch(e => {
    console.error(e);
    process.exit(1);
  });
}
