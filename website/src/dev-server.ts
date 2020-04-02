import Bundler from "parcel";
import express from "express";
import yargs from "yargs";
import { resolve } from "path";

// This file is using the babel settings for a browser
import "regenerator-runtime";

async function main() {
  const argv = yargs
    .strict()
    .demandCommand(0, 0)
    .option("port", { type: "number", default: 1200 }).argv;
  const app = express();

  const server = app.listen(argv.port, () => {
    console.log(`Now listening on ${JSON.stringify(server.address())}`);
  });

  const docDir = resolve(__dirname, "..", "..", "doc");
  app.use("/doc", express.static(docDir));

  const files = ["index", "demo", "how-it-works"];

  const bundler = new Bundler(files.map(f => resolve(__dirname, `${f}.html`)));

  app.use(bundler.middleware());

  app.get("/", (req, res) => res.redirect("/index.html"));
  for (const f of files) {
    app.get(`/${f}`, (req, res) => res.redirect(`/${f}.html`));
  }
}

if (require.main === module) {
  main().catch(e => {
    console.error(e);
    process.exit(1);
  });
}
