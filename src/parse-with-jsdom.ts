import { JSDOM } from "jsdom";

export function parseHtml(html: string): Document {
  const dom = new JSDOM(html);
  return dom.window.document;
}
