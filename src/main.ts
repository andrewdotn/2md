import yargs from "yargs";
import { run } from "./run";
import { parse } from "./parse";
import { Rendering } from "./render";

export function toMd(html: string): string {
  const intermediate = parse(html);

  const rendered = new Rendering();
  intermediate.render(rendered);
  rendered.finish();

  return rendered.result;
}

type CommandRunner = (args: { [x: string]: unknown }) => Promise<void> | void;

interface Command {
  name: string;
  description?: string;
  configureArgv?: (yargs: yargs.Argv) => void;
  run: CommandRunner;
  default?: boolean;
}

const commands: Command[] = [
  {
    name: "paste",
    async run(args: {}) {
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
      const html = Buffer.from(match[1], "hex").toString();
      console.log(toMd(html));
    },
    default: true
  }
  // {
  //   name:
  // }
];

async function main() {
  let commandToRun: CommandRunner | undefined = undefined;
  let defaultCommand: CommandRunner | undefined = undefined;
  let defaultCount = 0;
  let yargsParser = yargs.strict().demandCommand(0, 1);
  for (let c of commands) {
    if (c.default) {
      defaultCommand = c.run;
      defaultCount++;
    }

    yargsParser = yargsParser.command(
      c.name,
      c.description || "foo",
      args => {
        if (c.configureArgv) {
          return c.configureArgv(args);
        } else {
          return {};
        }
      },
      () => {
        commandToRun = commandToRun;
      }
    );
  }

  if (defaultCount != 1) {
    throw new Error("Exactly one command must be specified as the default.");
  }

  const argv = yargsParser.argv;

  if (commandToRun === undefined) {
    commandToRun = defaultCommand;
  }

  commandToRun!(argv);
}

if (require.main === module) {
  main().catch(e => {
    console.error(e);
    process.exit(1);
  });
}
