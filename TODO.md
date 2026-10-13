# TODO

## Declare the page's character encoding (noted 2026-10-13)

`index.html` has no `<meta charset>`, and S3/CloudFront serve `index.html` as `text/html` and
`oracle.js` as `text/javascript`, both without a `charset`. The browser then guesses the
encoding (often windows-1252), so any non-ASCII character typed straight into `oracle.js`
or a template shows up garbled: a `−` in the deck swipe toast came out as `âˆ’` (PR for
`deck-swipe`; it now uses `'−'`). Until this is fixed, write non-ASCII characters in
JS as `\uXXXX` escapes, and in HTML as entities (`&bull;`, `&#149;`).

- [ ] Add `<meta charset="utf-8">` as the first element in `<head>` of `index.html` (and
      `proxy.html`). Scripts loaded by the page inherit its encoding.
- [ ] Optionally have the deploy set `Content-Type: ...; charset=utf-8` on `*.html`/`*.js`
      (`aws s3 sync` in `.github/workflows/deploy.yml`, e.g. a second `cp` with
      `--content-type`), so the files don't depend on the meta tag.
- [ ] Check that nothing currently relies on the windows-1252 guess: look for non-ASCII
      bytes in served files (`LC_ALL=C grep -nP '[^\x00-\x7F]' *.html *.js templates/*`,
      skipping vendored `*.min.js`) and confirm they render the same after the change.
