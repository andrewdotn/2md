import { toMd as toMdInternal } from "../main";

/**
 * Transform the given HTML string into Markdown, returning a string.
 *
 * Example: `toMd('foo <b>bar</b>') -> 'foo **bar**\n'
 *
 * If `quote` is true, wrap the input HTML in a blockquote element.
 */
export function toMd(
  html: string,
  { quote }: { quote?: boolean } = {}
): string {
  return toMdInternal(html, { quote });
}
