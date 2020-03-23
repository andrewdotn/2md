// When bundled by parceljs, the `process.main === module` check doesn’t
// work. `process` and `module` are overridden, and even if there was a way
// to access the originals, every module would think it was main because
// the code from every file is bundled into a single main file.
//
// So we have a separate entry point for parcel to bundle.

import { main } from "./main";

main().catch(e => {
  console.error(e);
  process.exit(1);
});
