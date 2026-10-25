# Android: Netrunner (table `netrunner`)

Last updated: 2026-10-24

Fantasy Flight Games' **Android: Netrunner** (2012–2018) and **Null Signal Games**' sets since 2019,
as one game (ootv-claude `projects/newgame-netrunner.md`). Not live yet: built and checked offline,
waiting on the go-live steps (ootv-games `game-netrunner/GO-LIVE.md`).

## Where the data came from

- **Cards**: NetrunnerDB's card data (`netrunner-cards-json`, v2 schema), through Vantage Point
  (2026-03): 2,054 cards in 75 sets, converted by ootv-games `game-netrunner/scripts/convert.py`.
  Each card keeps its NetrunnerDB id in `nrdbid`, and each printing its 5-digit code in `nrdbcode`.
- **Ids never change**: `cardid-map.tsv` and `printingid-map.tsv` (in `game-netrunner/`) hold every
  id handed out, so a refresh adds new cards and printings after the old ones. `printingid` is 1, 2,
  3… within a card like every other game; the NetrunnerDB code is only in `nrdbcode`.
- **Images**: the ProxyNexus scans, joined on the printing code: 2,429 images (2,162 printings, 232
  alternate arts, card backs, extra faces). PNG with transparent corners; masters at full scan size.
  A printing with no scan of its own has no image: printings share a scan only if it's identical
  (298, mostly reprints; System Core 2019 has none).
- **Alternate arts** are printings of their own: set `Alternate Art`, rarity `Promo`, no artist.
  NetrunnerDB doesn't say where each came from, so each card with one has a `needsreview` note.
- **Rulings**: NetrunnerDB's 886 rulings (653 cards) in `ruling`, newest first: the question and
  answer (or the ruling), its own sources, and a link to the card on NetrunnerDB with the date, plus
  "(verified by the NSG rules team)" where NetrunnerDB marks it. Card links inside became plain names.

## Fields

Names follow the Comprehensive Rules' "Parts of a Card" (section 2):

- `side` (Corp / Runner), `type` (Corp Identity and Runner Identity are kept apart, for deckbuilding),
  `faction` (Neutral Corp / Neutral Runner kept apart too), `subtype`.
- `cost` (play, install or rez cost; "X" where the card prints X), `influence` (the influence cost;
  missing on cards with no influence bar, which isn't the same as 0), `strength`, `memory` (memory
  cost), `trash`, `advancement`, `agendapoints`.
- Identities: `subtitle` (the part of the title after the colon; `title` is the full name),
  `mindecksize`, `influencelimit` ("∞" where printed), `baselink`, `memorylimit` (starting memory limit).
- `unique` ("Unique"), `decklimit`, `designer` (Fantasy Flight Games / Null Signal Games; NISEI, NSG's
  name until 2022, counts as Null Signal Games), `attribution`, `narrative`, `pronouns`.
- Flip and facade identities: `facetitle`, `facesubtitle`, `facesubtype`, `facetext`, `facebaselink`,
  one entry per extra face, in order; the face images are extra `image` entries on the printing.
- `eternalpoints`: the card's points on the Eternal points list in force.
- Printings: `set`, `number` (position in the set), `quantity`, `publisher`, `artist`, `flavor`.
  Rarity is `Fixed` on every pack printing and hidden (an LCG has none).
- Card text keeps NetrunnerDB's icon tokens (`[click]`, `[credit]`, `[subroutine]`, ...). The game
  config's `symbols` draws them; for now as text placeholders until there are icons.

## Legality

All derived: no card stores a legality. `netrunner/attributes` holds one rule per format snapshot,
made by `game-netrunner/scripts/make-legality.py` from NetrunnerDB's formats, card pools and
restrictions ([Derived legalities](derived-legality.md) for how rules work):

- **Format** group: the current snapshot of each format under its plain name: Standard, Startup,
  Eternal, System Gateway, Core, Snapshot, Random Access Memories. Current = the latest snapshot that
  has started.
- **Arc** group: every snapshot by its start date ("Standard 2026-08-01"), newest first: 66 of them.
- A rule: a printing in one of the pool's sets that came out while the snapshot was in force, and
  not on its ban list (`nrdbid`) or a banned subtype (Current, January 2024). Restricted lists, the
  old influence penalties and Startup's 3-point agenda cap don't take a card out of a format.

As of 2026-10-24: Standard 581 cards, Startup 219, Eternal 2,010, System Gateway 77, Core 159.

The card page lists the formats a card fits: the game config's legality row uses the
`derivedlegality` helper ("Showing derived values on the card page" in the derived legality doc).

## Refreshing

NSG still releases sets and ban lists. `game-netrunner/scripts/refresh.sh` pulls NetrunnerDB, rebuilds
the cards, sets and legality rules, and lists what changed (`convert/refresh-<date>/`). Changes then go
live the usual ways: a new set through the set import or `upload-set.py`, changed cards through the
bulk recipe (export, conditional update, log, verify in search), and a changed `attributes.json` to
`netrunner/attributes` (then a cold start of the search Lambdas).
