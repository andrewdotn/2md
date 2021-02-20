import Bundler from "parcel";
import express from "express";
import yargs from "yargs";
import { resolve as pathResolve } from "path";
import { main as genFixtures } from "./gen-fixtures";

// This file is using the babel settings for a browser
import "regenerator-runtime";

/**
 * The error
 *
 *     2md/node_modules/2md/src/parse.ts: Unknown version 14.15.5 of Node.js
 *
 * comes about because parcel tries to load the env-preset stuff for the .ts
 * files in the core package, and that includes the bugfix portion of the URL,
 * which isn’t normally considered by browserslist.
 *
 * Add an alias to work around that.
 */
function workaroundBrowserslistNodeReleasesStuff() {
  const b = require("browserslist");
  const versionMatch = /^v([^.]+)\.([^.]+)\.([^.]+)$/.exec(process.version);
  if (!versionMatch) {
    throw new Error("Unable to determine node version");
  }
  const major = versionMatch[1];
  const minor = versionMatch[2];
  const micro = versionMatch[3];
  // b.aliases[`node ${versionMatch[1]}.${versionMatch[2]}`] = `current node`;

  const jsReleases = require("node-releases/data/processed/envs.json");
  const curRelease = jsReleases.find(r => r.version === `${major}.${minor}.0`);
  console.log(curRelease);
  jsReleases.push({
    ...curRelease,
    version: `${major}.${minor}.${micro}`
  });
  console.log(jsReleases[jsReleases.length - 1]);
}

async function main() {
  const argv = yargs
    .strict()
    .demandCommand(0, 0)
    .option("port", { type: "number", default: 1200 }).argv;
  const app = express();

  const g = genFixtures();

  workaroundBrowserslistNodeReleasesStuff();

  const docDir = pathResolve(__dirname, "..", "..", "doc");
  app.use("/doc", express.static(docDir));

  const files = ["index", "demo", "email", "how-it-works"];

  await g;
  await new Promise((resolve, reject) => {
    const bundler = new Bundler(
      files.map(f => pathResolve(__dirname, `${f}.html`))
    );
    app.use(bundler.middleware());
    bundler.on("bundled", () => resolve());
    bundler.on("buildError", () => reject());
  });

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
