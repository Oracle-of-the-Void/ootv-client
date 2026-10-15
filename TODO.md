# TODO


## Comprehensive card data documentation (noted 2026-10-15)

`docs/data.md` covers only part of the card JSON, and some of it is notes ("not sure if
technically required"). The card editor edits raw JSON, so it's the only reference an editor
has for which fields and options exist. Write a full reference:

- every card-level field per game (`templates/<game>.js` searchables and the card templates
  show which ones are used), with type, whether it's required, and what reads it;
- every printing field: `printingid`, `set`, `rarity`, `publisher`, `artist`, `legality`,
  `notmrp`, `image`/`imagehash`, the legacy `printimagehash`, and the rest;
- card overrides such as `legalityderivedexception` and what each one changes;
- the `oracle-all-structure` items each game relies on (`attributes`: `sortregex`,
  `optgroupregex`, `derived`; `template`).

## Rework the look of directory folders (noted 2026-10-13)

Folders work (#36, PR #264) but they're still butt-ugly and need a design pass. What's
rough today:

- Table view: a folder is a gray band built from 15 empty table cells, with its name and
  buttons absolutely positioned over them (`template-dirfolderrow`, `.dirfolderrow` in
  `oracle.css`). It reads as a stray header row, not a folder.
- Cards view: folder tiles are plain gray boxes beside the list cards
  (`template-dirfoldercard`).
- The path bar (`#dirpathbar`, `template-dirpath`) is a bare white strip.
- Every list row/card has a Folder dropdown, which crowds the table and is a clumsy way
  to move things. Drag and drop onto a folder or the path bar would be nicer (it also
  needs a touch fallback).
- New folder and Rename use `prompt()`, and Remove uses `confirm()`. Use the site's modal.
- Missing: moving a folder into another folder (Rename can only rename in place).

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

## Look at Proxy Nexus's L5R support for ideas (noted 2026-10-14)

Proxy Nexus announced L5R support:
https://www.reddit.com/r/l5r/comments/1tr2web/announcing_proxy_nexus_support_for_l5r/

Not read yet. Go through the post and the site for ideas we could borrow for the proxy
page (`proxy.html`) and proxy printing in general.

## Revisit the hourly select refresh: would CloudFront be cheaper? (noted 2026-10-14)

Since #220 (PR #272), a returning visitor's cached search selects are refetched in the
background once they're an hour old (`selectmaxage` in `oracle.js`). That's about 9
`POST /attributes` calls per visitor per game per hour, each going through API Gateway,
the `prod-ootv-search` Lambda and, on a Lambda cache miss, an Elasticsearch aggregation.
POSTs can't be cached by CloudFront, so every one is billed.

- [ ] After a few weeks, compare `/attributes` request and Lambda invocation counts in
      CloudWatch before and after 2026-10-14, and what they cost.
- [ ] Price the alternative: serve each game's selects as cacheable GETs through
      CloudFront (a `GET /attributes` with `Cache-Control`, or static JSON per game
      written when data changes). CloudFront requests cost less than API Gateway +
      Lambda, and the edge would absorb most of them, which could allow a shorter
      `selectmaxage`.
- [ ] Decide whether to keep the hour, change it, or move the selects behind CloudFront.
