#!/usr/bin/env node

// npm requires a shebang for the script to work out-of-the-box, but that
// breaks a local bundling with parcel, because the shebang gets embedded
// deep inside the file and node chokes on that.

import { main } from "./main.ts";

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
