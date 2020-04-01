// jsdom has an optional dependency on the `canvas` module, which we have
// no use for in this project. jsdom tests for the existence of `canvas`
// with this code:
//
//     let canvasInstalled = false;
//     try {
//       require.resolve("canvas");
//       canvasInstalled = true;
//     } catch (e) {
//       // canvas is not installed
//     }
//     if (canvasInstalled) {
//       const Canvas = require("canvas");
//
// When bundling, parceljs can’t tell that `require("canvas")` on the last
// line there is effectively dead code, so we get an error during bundling.
//
// This shim file is defined as an `alias` in `package.json` to turn that
// error into a no-op.

module.exports = {};
