# TODO

## Remove the legacy image layout code, every repo (noted 2026-10-18)

Since 2026-10-18 no printing in any game has `printimagehash` (ootv-backups `modernize-images.py`
and `fix-noimage-printings.py`; old → new map in ootv-backups `to-trash/redirect-map.tsv.gz`). Every
image is `imageuri + printing.imagehash + "/" + printing.image[n][size]`, and a printing with no
scan has no image fields at all. **Never `image: []`:** `templatefetchimage` reads `image[0][size]`
and would throw. Remove the legacy branches (and keep handling "no image fields"):

- [x] ootv-client `oracle.js` (released in PR #346; `imagehashtourl()` is now `preparecard()`, which
      only builds `printingreverse`):
  - `imagehashtourl()`: the per-printing legacy `images[]` builder, plus `card.icon` and
    `card.imageurl` from the card-level `imagehash` (nothing reads either; noted 2026-10-15),
    and the stale commented-out template line under it.
  - `templatefetchimage()` (the `"images" in prdata` branch) and the PDF/proxy export ("OLD STYLE").
  - `templateimagehashfromset()` / `templateimagefromset()` and their `imagehashfromset` /
    `imagefromset` tags: no template uses them, and `imagehashfromset` throws on a modern printing.
  - The card editor's legacy conversion on upload (#227: the `legacy` count and the files-to-copy
    helper near "The legacy images of a printing").
  - `nodiff` can drop `images` and `printimagehash`.
- [x] ootv-client `proxy.html` (hard-coded old URL) and the commented legacy path in
      `templates/template-pdf.html`; `docs/data.md` "image path" (describe the modern layout only).
- [x] ootv-search `lib/imagetrash.js`: the `printimagehash` branch of the unlinked-image list (also
      `routes/showimage.js`; released in search PR #83).
- [x] ootv-discord `src/oracle.js` `imageUrl()`: the `printimagehash` fallback, and its unit test
      (deployed 2026-10-18).
- [x] ootv-import `parse.jq`: the "old way: imagehash / printing: printimagehash" output (only a
      comment; it already wrote the modern layout).
- [x] ootv-backups `corner-icons.py` and `move-printing.py`: `corner-icons.py` already read
      `image[]` first, so only its fallback went; `move-printing.py` no longer copies files (modern
      names don't depend on the ids).
All released 2026-10-18; recorded in ootv-claude `DEPRECATED.md`.

- [x] Decide about the card-level `imagehash` (12,432 l5r and 683 lbs cards; only `card.icon` used it).
      Dropped from every card 2026-10-18 (ootv-backups `drop-card-imagehash.py`); #227 closed.

Deploys: one ootv-client PR (feature branch → master) and one ootv-search PR (dev → main), each
needs the user's yes; ootv-discord deploys with its stack. Before deleting the old S3 files, see
ootv-backups `TODO.md` "redirect old image URLs".

## L5R clan search: Monkey = Toturi's Army, and legality-aware clans (noted 2026-10-18)

Two related changes to how the l5r Clan search works (the `clan` select in
`templates/l5r.js`, plus whatever ootv-search does with it):

- Make Monkey Clan equivalent to Toturi's Army, so searching either clan finds both.
- Make the clan search depend on legality: which clans are offered, and what each one
  matches, should follow the format being searched rather than one fixed list.

Not designed yet. Decide whether the equivalence lives in the card data, the search
query (ootv-search), or the client, and update `docs/admin/` to match.

## Dune: use the standard `deck` field (noted 2026-10-18)

Dune keeps a card's deck (Imperial / House) in `decktype`; L5R and LBS use `deck`. The list statistics
(`liststatsdeckfield` in `oracle.js`) fall back to `decktype` for Dune; that fallback goes once Dune is
moved. To move it: copy `decktype` to `deck` on every `oracle-dune` card (a bulk update: export
first, pause the ES stream, log it; ootv-backups `PROCESSING.md`), then switch `templates/dune.js`
(`databasesort` deck sort, `searchables`, `labels`) and `template-dune-card.html` /
`template-dune-search.html` to `deck`, and drop `decktype` once nothing reads it (check ootv-search,
the import profile in `oracle-all-structure`, and ootv-games `game-dune` scripts). Then remove the
`decktype` fallback from `liststatsdeckfield`. The deck headers
(`headerize['dune']`) could then group by deck as L5R's do.

## Card corners in the editor's image upload (noted 2026-10-16)

Card images are PNG with the area outside the rounded corners transparent (square-cornered
Onyx Lives cards excepted; `ootv-import/AI-IMPORT.md` "Card images"). The import pipeline
holds to that: `set-import.py images` refuses non-PNG and warns when a master's corner pixels
are opaque. The card editor's upload (`uploadimagetrigger`) does neither: it takes JPEG as
well as PNG, and uploads whatever it's given, so a scan with white or black corners goes
live as is. The Admin mass image upload uses the same resize and upload code, so the same
applies there. Look at:

- warning (or refusing) when a non-Onyx Lives master has opaque corners, as `set-import.py` does;
- cutting the corners in the browser: an anti-aliased rounded-rectangle mask, inset a few px,
  on the master before `_details`/`_select` are made (the method in AI-IMPORT.md; the radius
  would have to come per game, or from the image);
- saving a JPEG upload as PNG once the corners are cut.

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

- Table view: a folder is a gray band built from empty table cells, with its name and
  buttons absolutely positioned over them (`template-dirfolderrow`, `.dirfolderrow` in
  `oracle.css`). It reads as a stray header row, not a folder.
- Cards view: folder tiles are plain gray boxes beside the list cards
  (`template-dirfoldercard`).
- The path bar (`#dirpathbar`, `template-dirpath`) is a bare white strip.
- Every list row/card has a Folder dropdown, which crowds the table and is a clumsy way
  to move things. Drag and drop onto a folder or the path bar now works (2026-10-15), and
  since 2026-10-16 Settings → Gestures has a switch that hides the dropdown.
- New folder, Rename and New list's name (2026-10-16) use `prompt()`, and Remove uses
  `confirm()`. Use the site's modal.
- Missing: moving a folder into another folder (Rename can only rename in place).

## Declare the page's character encoding (noted 2026-10-13)

`index.html` has no `<meta charset>`, and S3/CloudFront serve `index.html` as `text/html` and
`oracle.js` as `text/javascript`, both without a `charset`. The browser then guesses the
encoding (often windows-1252), so any non-ASCII character typed straight into `oracle.js`
or a template shows up garbled: a `−` in the deck swipe toast came out as `âˆ’` (PR for
`deck-swipe`; it now uses `'−'`). Until this is fixed, write non-ASCII characters in
JS as `\uXXXX` escapes, and in HTML as entities (`&bull;`, `&#149;`).

- [x] Add `<meta charset="utf-8">` as the first element in `<head>` of `index.html`. Scripts loaded by the page inherit its encoding.
      (2026-10-18, branch `charset-utf8`.) `setimport-preview.html` already had it.
- [ ] Optionally have the deploy set `Content-Type: ...; charset=utf-8` on `*.html`/`*.js`
      (`aws s3 sync` in `.github/workflows/deploy.yml`, e.g. a second `cp` with
      `--content-type`), so the files don't depend on the meta tag.
- [x] Check that nothing currently relies on the windows-1252 guess: look for non-ASCII
      bytes in served files (`LC_ALL=C grep -nP '[^\x00-\x7F]' *.html *.js templates/*`,
      skipping vendored `*.min.js`) and confirm they render the same after the change.
      (2026-10-18) All non-ASCII bytes are valid UTF-8 (`pdfkit.js`, `setimport-etl.js`,
      `setimport.js`), so the guess only ever garbled them. Chromium check: master decodes as
      windows-1252, the branch as UTF-8, no page errors.
- [ ] Web set import cleanup: on master the browser read `setimport-etl.js` as windows-1252, so
      `nospec`'s `“ ” – ’ •` and `ΓÇó` patterns never matched (tested: `A • B “q”` came through
      unchanged; with the meta tag it becomes `A &#149; B "q"`). Cards imported through Admin →
      Set import since 2026-10-17 may hold raw `•`, curly quotes or en dashes in `text`,
      `keywords` and the other `nospec` fields. Check those sets once this is released.

## Look at Proxy Nexus's L5R support for ideas (noted 2026-10-14)

Proxy Nexus announced L5R support:
https://www.reddit.com/r/l5r/comments/1tr2web/announcing_proxy_nexus_support_for_l5r/

Not read yet. Go through the post and the site for ideas we could borrow for proxy
printing (the PDF export; the 2019 `proxy.html` mockup was deleted 2026-10-18).

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
