import { JSDOM } from "jsdom";
import { parse as parseToIr, ParseOptions } from "./parse";

export function parseHtml(html: string): Document {
  const dom = new JSDOM(html);
  return dom.window.document;
}

export function parse(html: string, options?: ParseOptions) {
  const dom = new JSDOM(html);

  return parseToIr(dom.window.document.documentElement, options);
}
