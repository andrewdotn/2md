declare module "*.html" {
  const content: string;
  export default content;
}

declare module "endent" {
  function endent(strings: TemplateStringsArray, ...keys: unknown[]): string;

  export = endent;
}
