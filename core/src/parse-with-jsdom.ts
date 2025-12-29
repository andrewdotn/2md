import { parse as parse5 } from "parse5";
import type { Document } from "parse5/dist/tree-adapters/default";
import type { ParseOptions } from "./parse.ts";
import { parse as parseToIr } from "./parse.ts";

export function parseHtml(html: string): Document {
  const dom = parse5(html);
  return dom;
}

export function parse(html: string, options?: ParseOptions) {
  const dom = parseHtml(html);

  return parseToIr(dom, options);
}
