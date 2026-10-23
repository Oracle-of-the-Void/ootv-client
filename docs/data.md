## Notes on data for new databases

What each field holds is also kept on the site, for the card editor: Admin → Field descriptions
(`oracle-all-structure` `<game>/fields`, and `all/fields` for the shared ones; see
`docs/admin/field-descriptions.md`). Describe a new field there as well as here.

### json top:

* cardid (absolutely required and unique)
* title (required unless you set up a visual-only search, meh)
* type (not technically required, but use this label if you can)
* printingprimary (required)
* imagehash: obsolete. A card-level directory from the old image layout, left on older l5r and
  lbs cards; nothing reads it. Don't set it on new cards.

### printing  (nested)

* printing.set (not sure if technically required, strongly recommended)
* printing.rarity (not sure if technically required, strongly recommended)
  L5R values that need care (decided 2026-10-15 to 2026-10-19, ootv-client #47; details in ootv-import
  `L5R-STARTER-REPRINTS.md`):
  * `Starter`: a reprint that came in a set's starter decks, of a card from an earlier set. It's a
    printing under the set the card shows (its border in the Imperial and Jade arcs, its printed
    code from Gold on) and has `notmrp`. Exceptions: Hidden Emperor Starter and Scorpion Clan Coup
    Starter are sets of their own, and every Samurai Edition Banzai starter card belongs to
    Samurai Edition Banzai whatever code it prints.
  * `Fixed`: a card that is new in the set and came in its starter or deck. A card that was also in
    boosters gets both values, e.g. `["Fixed","Uncommon"]` (Soul of the Empire story-back strongholds).
  * `Stronghold`: a stronghold from before strongholds were printed on cards (it came in the box).
  * Several values are allowed when one printing covers versions that differ only in typesetting or
    flavor. A gameplay difference is a separate printing.
* printing.imagehash (the image directory; required with `image`, left out with it when there is no scan)
* printing.printingid (required)
* printing.publisher (optional, array of one string). L5R: Five Rings Publishing Group, Wizards
  of the Coast, Alderac Entertainment Group or Onyx Lives (with printing.publisherurl). The
  l5r "Paper" filter depends on it, so set it on every new printing.
* printing.notmrp (optional, boolean, default false). true: when a legality search picks which
  printing of the card to show, this printing is skipped, so it is never the "most recent
  printing" for an arc or format (e.g. a later expansion reprint that shouldn't stand for the
  arc). Other searches (a set search) can still show it. Leave it out rather than writing
  false. To set it, open the printing in the site's card editor and use Add field → `notmrp`
  (it starts as `true`), or add `"notmrp": true` inside that printing's object in the editor's JSON
  view. Make MRP in the editor removes it from the printing it picks. The Discord bot honors it too.
* printing.snmsetcode (optional, l5r, array of one string). The Sun and Moon edition code the
  S&M text export writes for this printing, where it differs from its set's code (the
  `oracle-all-structure` item `l5r/snm`, `sets`): e.g. `["Promo"]`, or `[""]` to write no set
  so S&M shows its default printing. Leave it out when the set's code is right. ootv-search's
  `/import` reads it back. Bulk values come from `docs/snm/snm-map.py` through
  ootv-backups `snm-printings.py`; edit one by hand in the card editor.
* printing.image (array, one entry per image, front first). Each entry names the files of one image
  in the printing's `imagehash` directory:
 * ```json
{
 "select": filename,    long side 210px  (other 150 or so)
 "details": filename,   long side 600px  (other 288 or so)
 "master": filename,    no spec yet
 "original": filename (optional),
 "numeric": filename (optional sizing)
}
```
  A printing with no scan has neither `image` nor `imagehash` (never an empty `image: []`). Since
  2026-10-21 the card images and the proxy export skip an empty list, entries that name no file, and
  an `image` without `imagehash` (`printingimages` in oracle.js: the missing-image stamp, no proxy
  page) instead of breaking, but leave both fields out all the same.
* printing.artvec, artmodel, artimage, arthub (machine-made, never edit by hand): the art vector of
  `image[0]` for art search (ootv-claude `ART-MATCHING.md`). `artvec` is a base64 DINOv2 vector
  (768 float16), `artmodel` the model it came from, `artimage` the `details` file it was made from,
  `arthub: true` marks placeholder art that matches too many cards. The API never sends `artvec` to
  the browser, the card editor hides all four, and an edit that changes the image drops them until
  the vectors are recomputed. In OpenSearch `artvec` becomes `printing.artvector` (k-NN, not in `_source`).

### optional

* needsreview (optional, every game, array of strings): open questions about the card, one plain-text
  reason per entry, shown only to that game's maintainers and searchable with Advanced → Needs review.
  Remove it with its x in the card editor (or `null` in the JSON view). See `docs/admin/needsreview.md`.
* ruling (optional, every game, array of HTML strings): official rulings about the card, one per
  entry, each usually ending in an `<a href>` to its source. On the card's details page the links open
  in a popup (a Bookshelf page `#rulebook=<id>,#page=<n>`, an image or a PDF in the site's modal;
  any other page in a small window). See `docs/admin/rulings.md`.
* rulingref (optional, every game, array of HTML strings): the rules team's answers about the card
  (L5R: from the mailing-list rules digests), one per entry, `<b>Q:</b> ...<br><b>A:</b> ...` then an
  `<a href>` to the answer's anchor in a copy of its source. Card details show a "Rules Q&A" button with
  the count, which opens the list in a popup. See `docs/admin/rulings.md`, "Rules Q&A".
* formattedtitle (with bold html/whatnot)
* puretexttitle (text spoiler ver.. remove special chars, \&149\; Exp to -exp, etc)

### image path
```{imageuri}{printing.imagehash}/{printing.image[n][size]}```

e.g. `https://images.oracleofthevoid.com/l5r/Promo-Gold/9774_1_details.jpg`. `imageuri` is the
game's `templates/<game>.js` value. Until 2026-10-18 l5r and lbs printings used an older layout
(`printimagehash`, files `<hash>/printing_<cardid>_<printingid>_<size>.jpg`, plus a card-level
`<imagehash>/card_<cardid>__icon.jpg`); no card uses it any more, and the client no longer reads it.
Details and how to trace an old URL or field: ootv-claude `DEPRECATED.md`.

* premium should be using _master, but it's inconsistent?

* _detail = max 600 dimension

* _master = 750x1050 or so


