# 2md: A command-line tool to paste formatted text as markdown

When I work, I keep a plain-text editor open in one corner of the screen
for making notes. Often those notes contain quotes from documentation,
articles, or stack overflow. But because the notes are plain text,
copying-and-pasting from another program usually destroys important
formatting, and loses hyperlinks.

Until this tool came along. Say you’re reading an [Ars Technica article][]
and want to save a note for later. Just select some content in your
browser, copy it, then run `2md`. The heading, list formatting, bold text,
and hyperlinks are all preserved.

![](doc/demo.gif)

[Ars Technica article]: https://arstechnica.com/gadgets/2019/10/macos-10-15-catalina-the-ars-technica-review/3/#h1

## Current status

Some pretty basic things aren’t implemented yet:

  - [ ] pre/code/tt blocks
  - [ ] numbered lists
  - [ ] br tags, such as in poetry
  - [ ] clipboard access on any OS besides macOS

The package will be [published on npm][npm-2md] once most of those are
taken care of. For now, you can check out the code and run `bin/2md`.

[npm-2md]: https://www.npmjs.com/package/2md
