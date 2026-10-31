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
* printing.printedbugs (optional, L5R, array of strings). The arc bugs (legality kanji) printed on the
  card, from Jade Edition on: `jade`, `gold`, `diamond`, `lotus`, `samurai`, `celestial`, `emperor`,
  `ivory`, `twentyfestivals`, `onyx`, `shatteredempire`; `[]` = no bug (Imperial-arc cards print none).
  What is printed, not legality: a ban takes the arc out of `legality`, never out of `printedbugs`. A
  misprint meant to carry a bug it doesn't show gets that bug. Filled for new printings by the bug
  check (Admin → Artist check → Check bugs, or the card editor's Check bugs → Set printedbugs); existing
  printings don't carry it yet (ootv-claude `CARD-ARC-IDENTIFIER.md`, 2026-10-25).
* printing.deck (optional, L5R, array of one string): the deck the printing was for under the rules of
  its arc, where that differs between printings of one card. On the Border Keep and Bamboo Harvesters
  printings (2026-10-27, ootv-tools `printings/printed-deck.py`): Pre-Game for Celestial, Emperor and
  Three Dynasties, Dynasty for the Ivory promos. The card keeps every value (`["Dynasty", "Pre-Game"]`);
  lists choose one with the game config's `sort.pick` (`docs/admin/game-config.md`). Its `moves` put a
  card under a deck it doesn't have in some formats: Sensei (`deck` Pre-Game) count in the Fate deck in
  Jade and Imperial lists.
* printing.foil (optional, every game, string). Left out: the printing is regular only. `"foil"`:
  it only came in foil (a foil that differs from the regular card, a foil-only card, or a foil
  promo, stored as its own printing). `"both"`: it came in regular and in foil in the same
  release (e.g. booster rare foils); a foil identical to the regular card in the same release is
  never its own printing. A foil **promo** is always its own printing (Promotional–<arc> set, rarity
  Promo, `"foil"`, `notmrp`), even when it looks like the regular card (the user, 2026-10-25).
  Since 2026-10-23 (project l5r-foils, ootv-claude `projects/l5r-foils.md`); 7th Sea's old
  `foil: true` became `"foil"` the same day (ootv-tools `printings/foil-values.py`), L5R was filled
  2026-10-25 from imperialblock and Carlo Brozzo's lists (ootv-tools `printings/l5r-foils.py`). List
  entries will carry a foil choice of their own (not foil / foil / either).
* printing.notes (optional, array of strings). Facts about how the printing was released,
  e.g. `Released in the Kotei 2006 pack`. Promo sources from Carlo Brozzo's promo
  list read `Released as: <source> (Brozzo's promo list)` (2026-10-25).
* printing.snmsetcode (optional, l5r, array of one string). The Sun and Moon edition code the
  S&M text export writes for this printing, where it differs from its set's code (the
  `oracle-all-structure` item `l5r/snm`, `sets`): e.g. `["Promo"]`, or `[""]` to write no set
  so S&M shows its default printing. Leave it out when the set's code is right. ootv-search's
  `/import` reads it back. Bulk values come from `docs/snm/snm-map.py` through
  ootv-tools `printings/snm-printings.py`; edit one by hand in the card editor. A printing S&M
  doesn't have (starter reprints, The L5R Experience, ...) gets the code of the card's most recent
  earlier printing S&M does have. S&M's two builds are never mixed: pre-Onyx printings are
  checked against the Win build's database (Kempy 1.3.4, 2017) only, Onyx Lives printings (the
  digital releases: The Blackest Storm, Onyx Edition, Shattered Empire, ...) against the Onyx
  build's only. Onyx dropped the old editions of some cards it reprinted (Jade Works).
* printing.titletextsnm (optional, l5r, array of one string). The card name the S&M export writes
  for this printing, where S&M files it under another card than the card's own S&M name: e.g.
  Marketplace's pre-Imperial to Jade printings (and the starter reprints that borrow them) are
  `["Market Place"]` in S&M. Wins over the card's `titletextsnm`/`puretexttitle`/`title` in the S&M
  export only; `/import` matches it too. Written with `snmsetcode` by the same scripts. The map
  finds these through the printing's printed name (`printedtitle`, `title`: "Kamoto" in Anvil of
  Despair), S&M's double-sided strongholds (side "(1)"), and `ALIASES` in `snm-map.py` for names
  only S&M uses (its typos also sit in the card's `alttitle`, so a pasted S&M name finds the card).
* printing.doublesided (optional, `1`, the older marker): the printing has exactly two images, a front and
  its back (`image[1]`), e.g. the Ivory/Twenty Festivals and Onyx strongholds. Same as `side: "back"` on
  `image[1]`; new data uses `side`.
* printing.back (optional, every game, array of one string, since 2026-10-29): the cardid of the card
  whose image is the back of this printing's fronts that have no back of their own (the game's card backs are cards: L5R's are 12664 to 12668 in
  the Oracle of the Void set), or `["none"]` for no back. Leave it out to get the game's standard back
  from the game config's `cardbacks` rules (`docs/admin/game-config.md`); set it only on a printing
  the rules get wrong. The card page shows the back under the image, and the PDF's duplex option
  prints it.
* printing.image (array, one entry per image, front first). Each entry names the files of one image
  in the printing's `imagehash` directory:
 * ```json
{
 "select": filename,    long side 210px  (other 150 or so)
 "details": filename,   long side 600px  (other 288 or so)
 "master": filename,    no spec yet
 "original": filename (optional),
 "numeric": filename (optional sizing),
 "side": "back" (optional)
}
```
  An entry with `"side": "back"` is the printed back of the front just before it (a stronghold's story or
  mon back): order the list front, back, front, back. Every other entry is a front, and more than one front
  means the printing was printed more than one way (different art or typesetting under one set and
  rarity). The card page draws each front full size with "Print n of m" when there are several, and a
  front's back only as a thumbnail under it ("Printed back", or the standard back's name), so the two
  never look alike. The PDF prints the first front (and, with duplex, its back).
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
* printing.imagecleaned (optional, array of strings, internal: Fields `show: "internal"`, not on card
  pages): where the printing's image came from when its watermark was removed, one note per image,
  e.g. `ccgtrader scan, watermark removed by duneccg.webflow.io (their Drive folder, fetched
  2026-10-25)`. Marks images to replace with a clean scan of our own; drop it when the image is
  replaced. First used on Dune, 2026-10-25 (ootv-tools `printings/dune-scans.py`).

### optional

* needsreview (optional, every game, array of strings): open questions about the card, one plain-text
  reason per entry, shown only to that game's maintainers and searchable with Advanced → Needs review.
  Remove it with its x in the card editor (or `null` in the JSON view). See `docs/admin/needsreview.md`.
* variablevalues (optional, every game, map of field → array of strings, since 2026-10-28): for a
  numeric field whose printed value is variable (`*`, `X`, `2*`), the values the card can really have,
  from its text: `{"cost": ["0-6"]}` (a range), `["2", "0"]` (either), `["1+"]` (1 or more, open-ended).
  Min/max search uses it instead of the printed value's rule (`*`/`X` = 0 up, `2*` = 2, `+5/+0` = 5 or 0;
  `docs/admin/field-descriptions.md`). The printed field stays as printed.
  L5R since 2026-10-30: the Strategies whose action pays Gold equal to something (Certain Death, cost 0:
  `["0+"]`), from ootv-tools `field-fixes/fill-variable-values.py`.
* conditionalvalues (optional, every game, map of field → array of objects, since 2026-10-30): a numeric
  field's value in a deck that meets a condition, from the card's text: `{"cost": [{"value": "2", "when":
  {"clan": ["Scorpion"]}}]}` (Complications: "costs 2 less Gold for Scorpion Clan players"). `when` keys:
  `clan` (the deck's Stronghold clan, as the clan mon names it: `Scorpion`, `Ratling`, `Brotherhood of
  Shinsei`), `sensei` (the deck's Sensei title), `stronghold` (the Stronghold's title); any listed value
  matches, and the first entry that matches wins. Search ignores it (the index stores it unmapped,
  `enabled: false`): a min/max search still finds Complications at 4. The deck view uses it: a deck's
  Table cells (`span.deckvalue`, title = printed value and why) and stats averages (`deckcontext`,
  `deckstatvalue` in `oracle.js`; lists of another type keep the printed value). L5R: 83 cards (clan discounts, clan Gold productions), from
  ootv-tools `field-fixes/fill-variable-values.py`, whose `--revert` puts a run back.
* ruling (optional, every game, array of HTML strings): official rulings about the card, one per
  entry, each usually ending in an `<a href>` to its source. On the card's details page the links open
  in a popup (a Bookshelf page `#rulebook=<id>,#page=<n>`, an image or a PDF in the site's modal;
  any other page in a small window). See `docs/admin/rulings.md`.
  Not in `/search` answers (since 2026-10-29), which carry `rulingcount` instead; the card page fetches
  the card for it (`docs/API.md`, /search).
* rulingref (optional, every game, array of HTML strings): the rules team's answers about the card
  (L5R: from the mailing-list rules digests), one per entry, `<b>Q:</b> ...<br><b>A:</b> ...` then an
  `<a href>` to the answer's anchor in a copy of its source. Card details show a "Rules Q&A" button with
  the count, which opens the list in a popup. See `docs/admin/rulings.md`, "Rules Q&A".
  Not in `/search` answers (since 2026-10-29), which carry `rulingrefcount` instead.
* updatelog (every card, array of maps): one row per change (`op`, `uid`, `uname`, `timestamp` in ms,
  `olddata`/`newdata`), shown under "Latest Updates" on the card page. Not in `/search` answers (since
  2026-10-29), which carry `updatelast` (the newest row's `timestamp`) instead; the card page fetches the
  rows when "Latest Updates" opens.
* formattedtitle (with bold html/whatnot)
* puretexttitle (text spoiler ver.. remove special chars, \&149\; Exp to -exp, etc)

### image path
```{imageuri}{printing.imagehash}/{printing.image[n][size]}```

e.g. `https://images.oracleofthevoid.com/l5r/Promo-Gold/9774_1_details.jpg`. `imageuri` is the
game's `info.imageuri` in its game config (`<game>/game` in `oracle-all-structure`). Until 2026-10-18 l5r and lbs printings used an older layout
(`printimagehash`, files `<hash>/printing_<cardid>_<printingid>_<size>.jpg`, plus a card-level
`<imagehash>/card_<cardid>__icon.jpg`); no card uses it any more, and the client no longer reads it.
Details and how to trace an old URL or field: ootv-claude `DEPRECATED.md`.

* premium should be using _master, but it's inconsistent?

* _detail = max 600 dimension

* _master = 750x1050 or so


