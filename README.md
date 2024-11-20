# phil-lib: A blazingly fast TypeScript library.

A collection of useful odds and ends.
Many of these come from stack overflow, but I'm tired of looking them up and adding TypeScript annotations each time I need them.

## API Docs

- [Miscellaneous (Browser only.)](https://tradeideasphilip.github.io/phil-lib/modules/client_misc.html)
- [Miscellaneous (Works with node.js and in the browser.)](https://tradeideasphilip.github.io/phil-lib/modules/misc.html)
- [Support for the TCL programming language](https://tradeideasphilip.github.io/phil-lib/modules/tcl.html)

## Build Instructions

Manually bump the package version number in `package.json`. Then run `npm update` to copy that version number into `package-lock.json`.

Then type:

```
npx tsc
npx typedoc *.ts
git add .
git commit
git push
npm publish
```

You might have to publish to git hub then update the documentation one more time then publish that final result to GitHub.
That will make sure that the pointers from the documentation back to the source code will point to the correct version on GitHub.
This should make no important difference to the `npm` package.

## Test Instructions

### NPM Link

_I've never gotten this to work quite right._

In this directory: `npm link`

In the main / test program directory: `npm link phil-lib`

Special instructions if the main program uses vite: https://stackoverflow.com/questions/67964556/cant-support-npm-link-added-local-package-in-vite-cli

### GitHub

Sometimes I push to GitHub, but I don't publish to npm.
Then I run `npm install https://github.com/TradeIdeasPhilip/phil-lib` in the main / test program directory.
Then I build and run the main program to test this library.

This means that people who install from the npm repository will only get things that have been tested.
But I still have to publish untested code to GitHub.

### Local Testing

I like the alternate format, described below, because it allowed me to make changes to the main program and the library at the same time.
I could build and test everything locally, before committing, publishing, or otherwise sharing anything.
`npm link` is aimed at local testing, but I have multiple problems trying to use it.

## Alternate Format

If you don't like `npm` see https://github.com/TradeIdeasPhilip/lib.

That package is mostly obsolete.
Use `npm` or one of its modern replacements.
Ignore the plethora of older solutions and use a package manager.
