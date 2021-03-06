# Changelog

## Version 0.0.8

  - Better link handling: multiple links to the same destination do not
    result in duplicate labels, and autolinks are used when the link text
    matches the destination.

## Version 0.0.7

  - Re-release of 0.0.6 with `README.md` included in built package

## Version 0.0.6

  - Attempt to fix issues with release process

## Version 0.0.5

  - Bump [`yargs-parser`][] version

[`yargs-parser`]: https://github.com/advisories/GHSA-p9pc-299p-vxgp

## Version 0.0.4

  - Make main script executable, including from npx

## Version 0.0.3

  - Unix and windows clipboard support

  - Create a `~/.config/2md/local-telemetry-opt-in` file if you want to
    track how often you run `2md`. For now, it simply appends an epoch
    timestamp on every cli run that successfully reads input.

## Version 0.0.2

  - Add nodejs >= 12 requirement to package.json

## Version 0.0.1

  - Initial release! Most things work.

## Version 0.0.0

  - Placeholder.
