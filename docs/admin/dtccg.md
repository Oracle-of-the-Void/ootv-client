# Doomtown CCG (table `dtccg`)

Last updated: 2026-10-27

The **original Doomtown collectible card game** (1998–2001): Episodes 1&2 to 9, Pine Box Edition,
Shootout at High Noon, Mouth of Hell, Reaping of Souls, Revelations, Boot Hill Edition, Ashes to
Ashes, Eye for an Eye, Do Unto Others, Promotional and Brothers' Bounty. Copyright Pinnacle
Entertainment Group; published by Wizards of the Coast (Five Rings Publishing) to 1999 and Alderac
Entertainment Group from 2000. Added and released 2026-10-27 (ootv-claude `projects/newgame-dt.md`).

**Not Doomtown: Reloaded** (the 2014 game, table `dtlcg`). The two are separate games: never match cards
between them, even where the names are the same.

## Where the data came from

- **Cards**: Classic DTDB (classic-dtdb.co, its GraphQL API), 1,639 entries, converted by ootv-games
  `game-dtccg/scripts/convert.py`. Classic DTDB lacks most of the two base sets' reprints (Boot Hill
  Edition 13 of 318, Pine Box Edition 28 of 405, Shootout at High Noon 2 of 73); those printings come
  from ccgtrader's set lists, checked against AEG's and doomtown.com's checklists. Result: **1,632
  cards, 2,337 printings**.
- **Images**: Classic DTDB's scans (1,638 printings). ccgtrader's images are rebuilt cards (real art,
  retyped text, no flavor or artist), so they aren't used: **699 printings have no image** until real
  scans exist (the list is ootv-games `game-dtccg/work/scan-targets.tsv`). A card whose newest printing
  is one of them shows the MISSING stamp on its card page.
- **Artist, flavor and printed text** on each printing were read from its scan by a vision model.
  Values and suits read that way agreed with Classic DTDB on 1,605 of 1,606 cards.
- **Rulings and errata**: the official Accumulated Rulings v4.0.4 (2000-10-16, kept by the Crow's
  Nest, where AEG pointed for errata), in `ruling` (244 cards) and `erratum` (12), each linked to the
  Wayback copy. Nothing official after October 2000 has been found (Do Unto Others, Shootout at High Noon).

## Cards and printings

One card per name and experience level, like L5R: an experienced Dude or Deed is its own card
(`experienced`: "Experienced", "Experienced 2"). The card shows its **most recent printing** (MRP,
`printingprimary`): the rulebook (April 2000) has the same rule, "The most recent printin' of a card
overrules all previous printin's... (This doesn't apply to printing new, 'Experienced' cards)".
Promotional printings are `notmrp`.

- Card fields are the MRP's: `value` and `suit` (A, 2–10, J, Q, K; Spades, Hearts, Clubs, Diamonds),
  `cost` (ghost rock), `upkeep`, `production` ("+3"), `influence` ("+1" on Goods), `control`,
  `bullets` ("+2" on Goods and Actions) and `bullettype` (Stud or Draw), `skill` and `skillrating`,
  `outfit` (Drifter when the card has no Outfit symbol), `traits`, `timing` (Noon, Shootout,
  Reaction, Job), `text`. The names are the rulebook's ("Them Cards").
- Each printing has its own `value` and `suit` (they change between printings: Pinned Down is 8 of
  Clubs in Episode 3, Ace of Clubs in Boot Hill Edition), `artist`, `flavor`, and `text` where its
  printed wording differs from the card's.
- Internal: `dtdbid`, `dtdbimage` (Classic DTDB), `ccgtraderid`.

## Needs review

50 cards carry `needsreview` notes ([Needs review notes](needsreview.md)): the newest printing's scan
shows another value or wording than the card data; the card text differs from the Accumulated
Rulings' MRP or errata text; the rulings name a newest printing that doesn't match the scans (Katie
Karl, Bobo LeVeux: Boot Hill reprinted the plain versions); the seven Sins and Flim (Classic DTDB says
Drifters for Pine Box Edition, the scans show the Flock icon); and 5 cards only ccgtrader has (Eagle
Sight, Feeding Time, Tracking Teeth, Boxing Match, New Dunwich Casino), built from its rebuilt images,
with no cost or stats yet.

## Legality

All derived ([Derived legalities](derived-legality.md)), from AEG's "Gomorra After Boot Hill" v2.0
(2000-06-07), in `dtccg/attributes`:

- **Open**: every card (1,632).
- **Boot Hill Strict**: only cards printed in Boot Hill Edition or later (834).
- **Boot Hill Extended**: Dudes, Deeds and Events only from Boot Hill Edition on; Actions, Goods,
  Improvements and Hexes from any set (and Outfits and Jokers, which the page doesn't restrict by set);
  minus the 10 Outfits, 100 Dudes and 119 Deeds AEG lists as not allowed; plus the Dudes it marks
  Harrowed or "Dead But Legal", whatever their set (1,138). "Hexes" is read literally: Miracles and
  Spirits must be Boot Hill Edition or later.

The card page lists the formats a card fits (the legality row's `derivedlegality` helper). The rules
are made by ootv-games `game-dtccg/scripts/make-structure.py`; three names on AEG's lists match no card
(`convert/legality-unmatched.txt`).

## Rebuilding

A dead game: no refresh. If the source data or the rules change, rerun the chain in ootv-games
`game-dtccg/README.md` ("Converter") and write changes the usual ways (bulk recipe for cards,
`dtccg/attributes` for the rules, then a cold start of the search Lambdas). `ADD-GAME.md` and
`GO-LIVE.md` there record how the game was added.
