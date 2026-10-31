# Warhammer 40,000 CCG (table `wh40k`)

Last updated: 2026-10-28

The **Warhammer 40,000 collectible card game** (Sabertooth Games, 2001–2003; © Games Workshop):
Battle for Pandora Prime, Coronis Campaign, Battle for Delos, Invasion: Verdicon and Siege of
Malogrim Hive. Added 2026-10-28 as a preview game (ootv-claude `projects/newgame-wh40k.md`).
**Not** Warhammer 40,000: Conquest (the 2014 LCG); if that is ever added, it gets its own table.

## Where the data came from

- **Cards**: ztcgvault.com's card database (Zarthbenn's TCG Vault), converted by ootv-games
  `scripts/game-wh40k/scripts/convert.py`. **1,104 cards, 1,128 printings.**
- **Images**: the community scan archive (scanned by derfington and mephias, processed by Zarthbenn),
  one scan per printing: 1,116. The 12 Invasion: Verdicon reprints of Space Marine cards (Bike Squad,
  Land Speeder, the Ultramarine squads and others) have no scan anywhere; ztcgvault shows the earlier
  set's scan for them.
- **Checked against the cards**: ztcgvault's text is edited, not as printed, and it has no text or
  stats at all for Fleets and Sectors. Every scan was read three ways: a vision model, Tesseract OCR
  (plus counters for die pips and flag icons), and the scan's file name for titles. A value is kept
  where two agree; about 180 more were checked by eye. Text, keywords, flags, die, artist, flavor and
  copyright are what the card prints.

## Cards and printings

One card per title, **most recent printing** (MRP, as for L5R): Invasion: Verdicon reprints 24 earlier
cards, 14 of them reworded and a few with rule changes (Land Speeder gains a flag, Jetbike Squad
Bahrari a new command line). The card's fields come from the latest printing; an older printing whose
printed text or stats differ has a `notes` line saying what it printed.

**Vindicare Assassin** is two cards: the Pandora Prime and Coronis Campaign promos have different text,
armor save and keywords. Whether the second is an errata'd reissue (then one card) is still to research;
both carry a needsreview note.

Card fields, named as in the Battle for Delos rulebook ("The Cards"):

- `type`: Unit, Character, Fortification, Fleet, Sector.
- `race` (the race symbol; Generic = no symbol, any race), `faction` (the faction symbol). Fleets print
  no symbol: their race comes from the fleet, and the faction where the card prints "Cards with this
  symbol are … cards" (Battle for Delos on).
- `keywords`: the keyword line in printed order, plus bold keywords such as Unique; on Sectors the
  terrain word (Tunnel, Jungle…). Kept as printed: Pandora Prime prints "Conscript", Battle for Delos
  "Conscripts".
- `flags` (a count), `firepower`, `speed`, `armor`, `armorsave` (Characters), `die` (the die number),
  `firstwave` (Fleets), `victorypoints` (Sectors).
- `text` (the ability text), `commandline` (the upside-down strip by the die).
- `assault`: the value after "Assault:" in the text (a number, d6, or special), for searching only.
- `forceorg` (the Force Organization symbol: Elite, HQ, Troop…) is mapped but not filled yet. It has
  no effect on play.

Each printing has `set`, `rarity` (Common, Uncommon, Rare, Fixed, Promo), `number` (ztcgvault's
checklist number; the cards print none), `artist`, `flavor`, `copyright`, `notes`. Internal:
`ztcgvaultid`.

## Needs review

15 cards carry `needsreview` notes ([Needs review notes](needsreview.md)): the 12 Invasion: Verdicon
Space Marine reprints (no scan, so their text and stats are ztcgvault's, unchecked), the two Vindicare
Assassins, and Jamming Station (its credit line prints the card name where the artist goes).

## Rebuilding

A finished game: no refresh. Rerun ootv-games `scripts/game-wh40k/scripts/convert.py` (values read from
the cards are in `game-wh40k/work/verified.json`; the settled differences in `work/resolved.tsv`) and write
changes with the bulk recipe. `game-wh40k/ADD-GAME.md` and `GO-LIVE.md` record how the game was added.
