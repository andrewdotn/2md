import "regenerator-runtime/runtime";
import yargs from "yargs";
import { run } from "./run";
import { parse, parseHtml, ParseOptions } from "./parse";
import { BlockRendering } from "./render";
import { tuple } from "./tuple";
import { appendFile, pathExists, readFile } from "fs-extra";
import { inspect } from "util";
import { join as pathJoin } from "path";

export function toMd(html: string, options?: ParseOptions): string {
  const intermediate = parse(html, options);

  const rendered = new BlockRendering();
  intermediate.render(rendered);
  return rendered.finish();
}

// Getting the clipboard as HTML is relatively easy in swift:
// https://stackoverflow.com/a/36109230/14558 but it’s not obvious how to call
// that API from nodejs, though I’m sure a native extension could be written.
//
// https://github.com/sindresorhus/clipboardy shells out to pbpaste
// and electron calls into Chromium’s native clipboard access code
async function readClipboardMac() {
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

async function readClipboardUnix() {
  const output = await run([
    "xclip",
    "-o",
    "-selection",
    "clipboard",
    "-t",
    "text/html"
  ]);
  if ((output.stderr ?? "") !== "") {
    throw new Error(`xclip printed an error: ${output.stderr}`);
  }
  return output.stdout;
}

async function readClipboard() {
  for (const c of [readClipboardMac, readClipboardUnix]) {
    try {
      return await c();
    } catch (e) {
      if (e.code === "ENOENT") {
        continue;
      }
      throw e;
    }
  }
  throw new Error(
    "Unable to find a clipboard-reading program, please try" +
      " file input instead"
  );
}

/**
 * Opt-in local telemetry. If `~/.config/2md/local-telemetry-opt-in` exists, the
 * current time will be appended to it on evey run of 2md.
 */
async function saveTelemetryMaybe() {
  const homeDir = process.env.HOME;
  if (!homeDir) {
    return;
  }
  const telemetryFile = pathJoin(
    homeDir,
    ".config",
    "2md",
    "local-telemetry-opt-in"
  );
  if (await pathExists(telemetryFile)) {
    const time = new Date().getTime().toString();
    appendFile(telemetryFile, time + "\n");
  }
}

export async function main() {
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
    .option("quote", {
      type: "boolean",
      default: true,
      description: "Wrap the output in a quote"
    }).argv;

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

  saveTelemetryMaybe();

  const outputFormat: OutputFormat = <OutputFormat>argv.outputFormat;
  const parseOptions: ParseOptions = {
    quote: <boolean>argv.quote
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
