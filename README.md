# 2md: convert formatted text to markdown

There are lots of packages for turning markdown into html, but this one
goes the other way, turning formatted html into markdown.

Say you’re reading an [Ars Technica article][] and want to copy something
into some markdown notes. Just select some content in your browser, copy
it, then run `2md`. The heading, list formatting, bold text, and hyperlinks
are all preserved.

[Ars Technica article]: https://arstechnica.com/gadgets/2019/10/macos-10-15-catalina-the-ars-technica-review/3/#h1

![](doc/demo.gif)

You can try it out online at [2md.ca](https://2md.ca).

A detailed writeup of the internals exists: “[Compiling HTML to Markdown
with TypeScript: How 2md works](https://2md.ca/how-it-works)”

## Installation

The easiest way to try out `2md` from the command line is with [`npx`][], a
tool to automatically download, cache, and run programs; it’s been included
with Node.js [since 2017][]:

[`npx`]: https://www.npmjs.com/package/npx
[since 2017]: https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b

    npx 2md [--no-quote] [FILE]

You can also install to install the `2md` command with `yarn`:

    yarn [global] add 2md

## Usage

Run

    npx 2md [--no-quote] [FILE]

to get markdown.

By default, 2md reads from the clipboard, using `osascript`, [`xclip`][],
or `powershell`. Otherwise, pass it the name of html file as a command-line
argument.

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
code here you’d like to reuse, let me know and I can look into publishing
it as a separate package.

## Contributing

Contributions are welcome! There are fairly comprehensive end-to-end and
round-trip tests, and TypeScript’s type-checking makes refactoring safer,
so don’t be afraid to move code around.

## License

All the original code here is licensed under the Apache License, version
2.0, included in `LICENSE.code`; except for the contents of the “how it
works” article `how-it-works/post.mdx`, which is not redistributable.

## Releasing

The current release process, to be automated later, is:

 1. Remove the `-pre` tag from the `version` field in `core/package.json`
    `version`, and from the `2md` dependency in `website/package.json`

 2. Update `CHANGELOG.md`

 3. Copy `README.md` and any referenced images such as `doc/demo.gif` into
    the `core` folder

 4. Commit to git, and `git tag vA.B.C`

 5. In the `core` directory, `yarn run package` and inspect tarball

 6. `git push --atomic $REMOTE main vA.B.C`

    Optional: figure out automation to put `CHANGELOG.md` excerpt into
    auto-created [GitHub releases][gh-release].

    [gh-release]: https://github.com/andrewdotn/2md/releases

 7. `npm publish 2md-vA.B.C.tgz`

    If publishing a pre-release, add `npm publish --tag next` to [set the
    correct npm tag][npm-next].

    [npm-next]: https://medium.com/@mbostock/prereleases-and-npm-e778fc5e2420

 8. Bump version and add `-pre` version suffix in `core/package.json`;
    update the `2md` dependency version in `website/package.json` as well

    <details>
    <summary>Otherwise yarn won’t use the local version.</summary>

    <p>
    The <a href="https://classic.yarnpkg.com/en/docs/workspaces/"
    >yarn workspaces documentation</a> says,
    </p>

    <blockquote>
    if <tt>workspace-b</tt> depends on a different version than the one
    referenced in <tt>workspace-a</tt>’s package.json, the dependency
    will be installed from npm rather than linked from your local
    filesystem. This is because some packages actually need to use the
    previous versions in order to build the new ones (Babel is one of
    them).
    </blockquote>
    </details>

 9. For the precompiled version, run `yarn dist` in `core` and copy
    `2md.js` to `~/bin`. It relies on a shell wrapper:

        #!/bin/bash

        DIR="$(dirname -- "${0}")"

        exec node "${DIR}/2md.js" "${@}"
