## Notes on data for new databases

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
* printing.imagehash (the image directory; required with `image`, left out with it when there is no scan)
* printing.printingid (required)
* printing.publisher (optional, array of one string). L5R: Five Rings Publishing Group, Wizards
  of the Coast, Alderac Entertainment Group or Onyx Lives (with printing.publisherurl). The
  l5r "Paper" filter depends on it, so set it on every new printing.
* printing.notmrp (optional, boolean, default false). true: when a legality search picks which
  printing of the card to show, this printing is skipped, so it is never the "most recent
  printing" for an arc or format (e.g. a later expansion reprint that shouldn't stand for the
  arc). Other searches (a set search) can still show it. Leave it out rather than writing
  false. To set it, edit the card in the site's card editor, which edits the card's JSON
  directly: add `"notmrp": true` inside that printing's object. The Discord bot honors it
  too.
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
  A printing with no scan has neither `image` nor `imagehash` (never an empty `image: []`: the
  templates read `image[0]`).

### optional

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


