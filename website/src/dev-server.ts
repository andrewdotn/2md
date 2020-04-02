import Bundler from "parcel";
import express from "express";
import yargs from "yargs";
import { resolve as pathResolve } from "path";

// This file is using the babel settings for a browser
import "regenerator-runtime";

async function main() {
  const argv = yargs
    .strict()
    .demandCommand(0, 0)
    .option("port", { type: "number", default: 1200 }).argv;
  const app = express();

  const docDir = pathResolve(__dirname, "..", "..", "doc");
  app.use("/doc", express.static(docDir));

  const files = ["index", "demo", "how-it-works"];

  await new Promise((resolve, reject) => {
    const bundler = new Bundler(
      files.map(f => pathResolve(__dirname, `${f}.html`))
    );
    app.use(bundler.middleware());
    bundler.on("bundled", () => resolve());
    bundler.on("buildError", () => reject());
  });

  // on(name: 'buildEnd', cb: () => void): void;
  // on(name: 'bundled', cb: (bundle: ParcelBundler.ParcelBundle) => void): void;
  // on(name: 'buildStart', cb: (entryPoints: string[]) => void): void;
  // on(name: 'buildError', cb: (error: Error) => void): void;

  app.get("/", (req, res) => res.redirect("/index.html"));
  for (const f of files) {
    app.get(`/${f}`, (req, res) => res.redirect(`/${f}.html`));
  }

  const server = app.listen(argv.port, () => {
    console.log(`Now listening on ${JSON.stringify(server.address())}`);
  });
}

if (require.main === module) {
  main().catch(e => {
    console.error(e);
    process.exit(1);
  });
}
