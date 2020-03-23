## Test files

Where there’s a pair of `.html` and `.md` files, one file is the input and the
other is the expected output.

*There is no auto-detection of test cases, code--or at minimum a filename--will
have to be added to a test case.*

Some of the `.md` files here are test cases that are first rendered into HTML,
then back into markdown, to see if they survive a round-trip.

To avoid 2md having to require a markdown-to-HTML library dependency, this only
works from a dev install.

There’s also a hidden `--dev-mode-md-to-html-first` option for the CLI, which
only works if the required libraries are installed.
