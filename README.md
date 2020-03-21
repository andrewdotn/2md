# 2md: convert formatted text to markdown

There are lots of packages for turning markdown into html, but this one
goes the other way, turning formatted html into markdown.

Say you’re reading an [Ars Technica article][] and want to copy something
into some markdown notes. Just select some content in your browser, copy
it, then run `2md`. The heading, list formatting, bold text, and hyperlinks
are all preserved.

[Ars Technica article]: https://arstechnica.com/gadgets/2019/10/macos-10-15-catalina-the-ars-technica-review/3/#h1

![](doc/demo.gif)

## Installation and usage

    yarn [global] add 2md

installs the `2md` command.

Then run

    2md [--no-quote] [FILE]

to get markdown. By default it reads from the clipboard, using `osascript`,
[`xclip`][], or `powershell`. Otherwise, pass it an html file.

[`xclip`]: https://github.com/astrand/xclip

For easy inserting of stuff into other documents, `--quote` is on by
default and wraps the markdown in a blockquote:

    > # Foo
    >
    > bar ...

## API

Only a single function is exposed: `toMd`.

    const { toMd } = require('2md');

    console.log(toMd('foo <b>bar</b>'));

prints

    foo **bar**

Only exported files with `public` in the path are supported. Everything
else is subject to change without notice. But if there’s some interesting
code here you’d like to reuse, it should be possible to publish it.

## Contributing

Contributions are welcome! There are fairly comprehensive end-to-end and
round-trip tests, and TypeScript’s type-checking makes refactoring safer,
so don’t be afraid to move code around.

### Architecture

A quick sketch of how this works:

  - Some AppleScript reads html off the clipboard

  - `jsdom` parses input html into dom elements

  - A parser iterates over the dom, emitting a tree of custom nodes that
    correspond to markdown elements; for example, `<b>` and `<strong>` tags
    get mapped to `Bold` nodes

  - Some simplifying transformations are applied to the tree of markdown
    elements, such as removing `<a>` tags with no text, because links like
    `[][1]` in the markdown output aren’t useful

  - The markdown nodes get `render()` called on them to generate a series
    of `OutputBlock` objects which are, roughly, paragraphs in the
    markdown output

  - The `OutputBlock`s are wrapped to 80 columns, and separated with
    blank lines where appropriate

You can see the results of individual steps with the `--output-format`
option to the cli. These are subject to change without notice, and not
exposed through the public api.

## Releasing

The current release process, to be automated later, is:

 1. Remove the `-pre` tag from the package.json version field

 2. Update `CHANGELOG.md`

 3. Commit to git, and `git tag vA.B.C`

 4. `git push --tags $REMOTE master`.

    Optional: figure out automation to put `CHANGELOG.md` excerpt into
    auto-created [GitHub releases][gh-release].

[gh-release]: https://github.com/andrewdotn/2md/releases

 5. `yarn run package` and inspect tarball

 6. `npm publish 2md-vA.B.C.tgz`.

     If publishing a pre-release, add `npm publish --tag next` to [set the
     correct npm tag][npm-next].

[npm-next]: https://medium.com/@mbostock/prereleases-and-npm-e778fc5e2420

 7. Bump version and add `-pre` version suffix in `package.json`
