import yargs from "yargs";
import type { ParseOptions } from "./parse.ts";
import { BlockRendering } from "./render.ts";
import { tuple } from "./tuple.ts";
import { appendFile, readFile } from "fs/promises";
import { inspect } from "util";
import { join as pathJoin } from "path";
import { readClipboard } from "./clipboard.ts";
import { parseHtml, parse } from "./parse-with-jsdom.ts";
import { fileURLToPath } from "node:url";
import { pathExists } from "./fs-util.ts";

export function toMd(html: string, options?: ParseOptions): string {
  const intermediate = parse(html, options);

  const rendered = new BlockRendering();
  intermediate.render(rendered);
  return rendered.finish();
}

/**
 * Opt-in local telemetry. If `~/.config/2md/local-telemetry-opt-in` exists, the
 * current time will be appended to it on every run of 2md.
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
    "local-telemetry-opt-in",
  );
  if (await pathExists(telemetryFile)) {
    const time = new Date().getTime().toString();
    appendFile(telemetryFile, time + "\n");
  }
}

export async function main() {
  const outputFormats = tuple("raw", "html", "ir", "blocks", "md");
  type OutputFormat = (typeof outputFormats)[number];

  const { version } = await import("../package.json", {
    with: { type: "json" },
  });

  const argv = yargs
    .strict()
    .demandCommand(0, 1)
    .usage(
      `2md [options] [FILE]

Converts formatted text to markdown. Defaults to reading the clipboard.`,
    )
    .version(version)
    .option("output-format", { choices: outputFormats, default: "md" })
    // This magic option is handy for debugging round-trip issues, but isn’t
    // enabled by default because we don’t want users to have to pull in
    // markdown libraries too.
    .option("dev-mode-md-to-html-first", { type: "boolean", hidden: true })
    .option("quote", {
      type: "boolean",
      default: true,
      description: "Wrap the output in a quote",
    })
    .option("links", {
      type: "boolean",
      default: true,
      description: "Include hyperlinks in output",
    }).argv;

  let input: string;
  if (argv._.length == 1) {
    let argv_0 = argv._[0];
    if (typeof argv_0 !== "string") {
      throw new Error(`Expected a string, got ${inspect(argv_0)}`);
    }

    input = (await readFile(argv_0)).toString();

    if (argv.devModeMdToHtmlFirst && argv_0.endsWith(".md")) {
      const remark = (await import("remark")).default;
      const html = (await import("remark-html")).default;
      const rendered = await remark().use(html).process(input);
      if (typeof rendered.contents == "string") {
        input = rendered.contents;
      } else if (rendered.contents instanceof Buffer) {
        input = rendered.contents.toString("utf-8");
      } else {
        throw new Error(`Unexpected remark output type ${inspect(rendered)}`);
      }
    }
  } else {
    input = await readClipboard();
  }

  saveTelemetryMaybe();

  const outputFormat = argv.outputFormat as OutputFormat;
  const parseOptions: ParseOptions = {
    quote: argv.quote as boolean,
    links: argv.links as boolean,
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
