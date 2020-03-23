declare module "remark-html" {
  interface Options {
    // This can also take a schema as defined at
    // https://github.com/syntax-tree/hast-util-sanitize#schema
    // But since I don’t need any of that, I’m not typing in the types for it.
    sanitize?: boolean; // | Schema
  }

  function plugin(options?: Options): any;

  export = plugin;
}
