import yargs from "yargs";
import { run } from "./run";
import { parse, parseHtml, ParseOptions } from "./parse";
import { BlockRendering } from "./render";
import { readFile } from "fs-extra";
import { inspect } from "util";

export function toMd(html: string, options?: ParseOptions): string {
  const intermediate = parse(html, options);

  const rendered = new BlockRendering();
  intermediate.render(rendered);
  return rendered.finish();
}

// https://stackoverflow.com/a/54071129/14558
function tuple<T extends string[]>(...o: T) {
  return o;
}

// Getting the clipboard as HTML is relatively easy in swift:
// https://stackoverflow.com/a/36109230/14558 but it’s not obvious how to call
// that API from nodejs, though I’m sure a native extension could be written.
//
// https://github.com/sindresorhus/clipboardy shells out to pbpaste
// and electron calls into Chromium’s native clipboard access code
async function readClipboard() {
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
  return Buffer.from(match[1], "hex").toString();
}

async function main() {
  const outputFormats = tuple("raw", "html", "ir", "blocks", "md");
  type OutputFormat = typeof outputFormats[number];

  const argv = yargs
    .strict()
    .demandCommand(0, 1)
    .usage(
      `2md [options] [FILE]

Converts formatted text to markdown. Defaults to reading the clipboard.`
    )
    .option("output-format", { choices: outputFormats, default: "md" })
    // This magic option is handy for debugging round-trip issues, but isn’t
    // enabled by default because we don’t want users to have to pull in
    // markdown libraries too.
    .option("dev-mode-md-to-html-first", { type: "boolean", hidden: true })
    .option("wrap-in-backquote", { type: "boolean", default: true }).argv;

  let input: string;
  if (argv._.length == 1) {
    input = (await readFile(argv._[0])).toString();

    if (argv.devModeMdToHtmlFirst && argv._[0].endsWith(".md")) {
      const remark = await require("remark");
      const html = await require("remark-html");
      const rendered = await remark()
        .use(html)
        .process(input);
      input = rendered.contents;
    }
  } else {
    input = await readClipboard();
  }

  const outputFormat: OutputFormat = <OutputFormat>argv.outputFormat;
  const parseOptions: ParseOptions = {
    wrapInBackquote: <boolean>argv.wrapInBackquote
  };

  let output: string;
  switch (outputFormat) {
    case "raw": {
      output = input;
      break;
    }
    case "html": {
      const firstElement = parseHtml(input).firstElementChild;
      output = firstElement === null ? "" : firstElement.outerHTML;
      break;
    }

    // There’s some duplication between these next cases and toMd(). It’s minor
    // for now so I’m leaving it alone, but we could break out of a subroutine
    // once the desired format is computed, rather than duplicating prefixes of
    // the code that runs the input through the parse-and-render toolchain.
    case "ir": {
      const intermediate = parse(input, parseOptions);
      output = inspect(intermediate, false, 10);
      break;
    }
    case "blocks": {
      const intermediate = parse(input, parseOptions);
      const rendering = new BlockRendering();
      intermediate.render(rendering);
      rendering.cleanup();
      output = inspect(rendering.outputBlocks, false, 10);
      break;
    }
    case "md": {
      output = toMd(input, parseOptions);
      break;
    }
    default: {
      throw new Error(`Unknown output format ${inspect(outputFormat)}`);
    }
  }

  console.log(output);
}

if (require.main === module) {
  main().catch(e => {
    console.error(e);
    process.exit(1);
  });
}
