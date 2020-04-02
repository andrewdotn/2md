export function vis(s: string | null) {
  if (!s) {
    return '""';
  }
  if (/^\s*$/.test(s)) {
    return `"${s}"`;
  }
  return s.replace(/\n/g, "\\n");
}
