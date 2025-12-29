import { run } from "./run.ts";
import { readFile, unlink } from "fs/promises";
import { pathExists } from "./fs-util.ts";

export async function readClipboard() {
  for (const c of [readClipboardMac, readClipboardUnix, readClipboardWindows]) {
    try {
      return await c();
    } catch (e) {
      if (e instanceof Error && "code" in e && e.code === "ENOENT") {
        continue;
      }
      throw e;
    }
  }
  throw new Error(
    "Unable to find a clipboard-reading program, please try" +
      " file input instead",
  );
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
    "the clipboard as «class HTML»",
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
    "text/html",
  ]);
  if ((output.stderr ?? "") !== "") {
    throw new Error(`xclip printed an error: ${output.stderr}`);
  }
  return output.stdout;
}

async function readClipboardWindows() {
  const output = await run([
    "powershell.exe",
    "-c",
    // When printing to the console, the encoding gets even more messed up, so
    // we use a temporary file instead.
    `
      $tmp = New-TemporaryFile
      Get-Clipboard -TextFormatType Html > $tmp
      $tmp.ToString()
      `,
  ]);
  const tmpfileName = output.stdout.trim();
  if ((output.stderr ?? "") !== "") {
    if (await pathExists(tmpfileName)) {
      unlink(tmpfileName);
    }
    throw new Error(`powershell printed an error: ${output.stderr}`);
  }
  const tmpfileContent = await readFile(tmpfileName);
  unlink(tmpfileName);
  if (tmpfileContent[0] !== 0xff || tmpfileContent[1] !== 0xfe) {
    throw new Error("No BOM in clipboard output");
  }
  const cfHtml = unMojibake(tmpfileContent);
  const match = /^Version:0.9\r\nStartHTML:([0-9]+)/.exec(cfHtml);
  if (!match || match.index !== 0) {
    throw new Error("Get-Clipboard did not return CF_HTML output");
  }
  const htmlStartIndex = parseInt(match[1]);
  return cfHtml.slice(htmlStartIndex);
}

// This does match https://en.wikipedia.org/wiki/Windows-1252 but was computed
// by making a UTF-8 webpage with all characters from U+0000 to U+00FE, copying
// and pasting, and writing some comparison code to see what got mangled.
const cp1252Inverse: { [unicode: number]: number } = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x2c6: 0x88,
  0x2030: 0x89,
  0x160: 0x8a,
  0x2039: 0x8b,
  0x152: 0x8c,
  0x17d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x2dc: 0x98,
  0x2122: 0x99,
  0x161: 0x9a,
  0x203a: 0x9b,
  0x153: 0x9c,
  0x17e: 0x9e,
  0x178: 0x9f,
};

/* Turn a UTF-8+cp1252+UTF-16LE+BOM-encoded mess into a UTF-8 string. */
export function unMojibake(s: Buffer) {
  if (s[0] !== 0xff || s[1] !== 0xfe) {
    throw new Error("No BOM in clipboard output");
  }

  // Turn UTF-16LE pairs into integers, ignoring endianness for now
  const array = new Uint16Array(s.buffer, s.byteOffset + 2, s.length / 2 - 1);

  // The string was UTF-8 encoded before getting the UTF-16 treatment, so
  // anything that doesn't fit in 8 bits has been mangled through cp1252.
  for (let i = 0; i < array.length; i++) {
    if (array[i] > 0xff) {
      const v = cp1252Inverse[array[i]];
      if (v === undefined) {
        throw new Error(
          `unknown cp1252 code point at ${i}: 0x${array[i].toString(16)}`,
        );
      }
      array[i] = v;
    }
  }
  const decoded = Buffer.from(array);
  return decoded.toString("utf-8");
}
