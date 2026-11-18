# Mythos (table `mythos`)

Last updated: 2026-11-04

**Mythos**, Chaosium's collectible card game of Lovecraftian horror (1996–1997): the Limited Edition and its
three boosters (Expeditions of Miskatonic University, Cthulhu Rising, Legends of the Necronomicon, 1996), the
Standard Game Set, The Dreamlands and New Aeon (1997). Added 2026-11-04 as a preview game (ootv-claude
`projects/newgame-mythos.md`).

## Where the data came from

- **Card list**: Chaosium's own card lists (chaosium.com/mythos, from the Wayback Machine): every card's set,
  type, rarity and artist, and the 1996 rarity list that names which booster each Limited card came in.
- **Images**: ccgtrader.net's scans, one per card (940 of 943 records): real scans, but small (285×400 to
  356×500). They are enlarged to the 745 px master by plain resampling, nothing redrawn, and every printing
  says so in a public note: "Image enlarged from a small scan (W×H); a better scan is wanted." The originals
  stay in ootv-games `game-mythos/ccgtrader/`.
- **Text and stats**: there is no text database for Mythos, so every scan was read by a vision model (the
  whole card, then close crops of the text box, the type bar, the title bar and the icon column) and **every
  card was then proofread by eye**. What the eye check settled is in ootv-games
  `scripts/game-mythos/verified/` (text, investigators, public attributes, sanity, type line, spell icons).
- **Rulebooks**: Chaosium's rules pages printed to PDF (rules V4.1, the Dreamlands additions, FAQ, errata,
  card files, tournament rules, combat examples): 7 books on the Bookshelf.

**941 cards, 950 printings.**

## Cards and printings

One card per printed title, rules text, type, value and sanity; for Locations also the subregion and public
attributes (the four Great Libraries of the Dreamlands share their text but stand in four cities). Reprints
with the same text are printings of one card (Mi-Go in Limited and Standard); other arts or copies of one card
in a set are `version` 1, 2, ... (Car, Train, Hunting Horror, Insect from Shaggai, Carter's Quest, ...).

- Card fields, named as in the rulebook ("Description of the Cards"): `type` (the left bar), `subtype` (the word
  beside it: a Location's subregion, or Phobia, Weapon, Greater Independent, Heroic Adventure ...), `region`
  (the bar's colour: green Lovecraft Country, purple Europe, red Middle East, blue South Pacific; empty on New
  Aeon, whose bars are one colour, and on Dreamlands blends), `attributes` (the line under the title),
  `value` (+ `valueprinted` when the corner prints "+6" or "6/4"), `corner` (Gate, Event "!", Elder Sign),
  `spellicon` (Cthulhu, Death, Eye, Folk, Water, Yellow Sign, Dream), `publicattributes` (Water, Forest,
  Cemetery, Inside, Outside), `sanity` + `sanitycolor` (the pentagram), `dimension` (Dreamlands: the blue
  star; New Æon: the yellow atom), `unique` (the red dot), `text`.
- Each printing has `set`, `rarity` (the Standard Game Set has none), `version`, `artist`, `flavor`, `copyright`,
  `notes`. Internal: `ccgtraderid`.
- Chaosium's list wins on type, rarity and artist, except where the card prints otherwise (Book of Dzyan's
  bar says Artifact): then the card wins, with a needsreview note.

## Investigators

One card per face (the user, 2026-11-03), `flipside` naming the other face: 42 faces. Fields: `education`,
`sanity` (Beginning Sanity), `sanitymax`, `handsize` ("Your Hand is N Cards"), `handmin`, `handmax`,
`languages`, `text`. Chaosium's lists name the pairs for Limited; the New Aeon scans show both faces; 13
Dreamlands and Standard faces have no known partner yet (needsreview). The six scans of both faces on one
image were cut in two for the card images.

## Needs review

913 cards carry `needsreview` notes ([Needs review notes](needsreview.md)), almost all for the small scan. The
other 151 notes are worth a look:
- scans with a store watermark over the text (13 New Aeon cards), the French John Scott, the Rebellious Youth
  thumbnail, three Standard investigators with no image at all;
- faint scans where words were read with doubt, lines cut off, misprints kept as printed;
- doubtful records: a second copy of Portaphobia and Boston & Maine Train Station, a third Car and a second
  Carter's Quest that Chaosium lists but no scan shows;
- 62 sanity numbers read from the icon column only.
The list of scans wanted is ootv-games `game-mythos/SCAN-TARGETS.md`. Replacing an image: take its note and
the image needsreview line off.

## Rebuilding

A dead game: no refresh. Rerun ootv-games `scripts/game-mythos/convert.py` (and `build-images.py`), then write
changes with the bulk recipe. `game-mythos/ADD-GAME.md` and `GO-LIVE.md` record how the game was added.
