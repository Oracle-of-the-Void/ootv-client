# Star Wars CCG (table `swccg`)

Last updated: 2026-11-02

**Star Wars Customizable Card Game** (Decipher, 1995–2001), Premiere through Theed Palace, with the
premium products and foils. Added 2026-11-02 as a preview game (ootv-claude `projects/newgame-swccg.md`).
Only cards Decipher printed: the Players Committee's virtual and Legacy cards are not loaded.

## Where the data came from

- **Cards**: the Players Committee's [card JSON](https://github.com/swccgpc/swccg-card-json) (MIT),
  converted by ootv-games `scripts/game-swccg/scripts/convert.py`. **2,518 cards, 3,732 printings in 32 sets.**
- **Foils**: ccgtrader's checklists (Reflections I, II and III, tournament foils: 347 printings), matched
  by side and name. Where cards share a name, ccgtrader's image of the foil decides.
- **Images**: 2,578 scans from strangewayes' 600 dpi Drive archive. The outer border is repainted flat
  black on every scan. The 12 First and Second Anthology cards are the only ones not from that archive:
  imperialblock.com's own scans, 350×490.
- **Rulebooks**: 20 books on the Bookshelf (Decipher's rules and inserts, the Players Committee's).

## Printed text and errata

The print wins. Every scan was read by a vision model; a difference from the Players Committee's text
counts as printed when two reads agree (a third decides ties), and the rest were checked by eye. `text` is
the printed wording; `erratum` holds the Players Committee's wording where it differs (864 cards). Printed
typos are kept (Telsij's "subtact"). 8 printed titles with old spellings (Padmé, Ric Olié, …) keep the
Players Committee's spelling in `alttitle`, so both are found.

## Cards and printings

One card per side, title and game text. A reprint with new text is a separate card with the same title.

- Card fields, named from the rulebook and the Players Committee's glossary: `title`, `uniqueness`, `side`,
  `type`, `subtype`, `destiny`, `deploy`, `forfeit`, `power`, `ability`, `armor`, `maneuver`, `hyperspeed`,
  `landspeed`, `parsec`, `politics`, `ferocity`, `forcesensitivity`, `defensevalue`, `lore`, `text`,
  `icons`, `darkicons`, `lighticons`, `characteristics`.
- Search aids from the Players Committee, not printed: `alttitle`, `pulls`, `pulledby`, `matching`,
  `matchingweapon`, `counterpart`, `cancels`, `canceledby`, `combo`, `ruling`.
- Internal: `scompid`, `gempid`, `ccgtraderid`.
- Printings have `set`, `rarity`, `version` (`AI` = Alternate Image), `foil` and `language` (Japanese foils).

**Limited and Unlimited** are separate printings of Premiere, A New Hope, Hoth and Dagobah. The scan sits on
Limited only, because the repainted border hides the edition, so Unlimited printings have no image yet.

**Two-sided cards**: the 32 objectives have the front in `text` and the back in `backtext`, with `backdestiny`,
`backicons` and `backtype`; the back was checked against its scan. Jabba's Prize prints a picture on
one side, so it has `text` only. Jedi Pack Han, Leia, Motti and Tarkin print an empty text box.

**Rarity**: First and Second Anthology are Preview and Third Anthology is Premium, from imperialblock.com's
listing. All foils are Promo.

## Known gaps

- 1,175 printings have no image: 828 Unlimited and 347 foils. The list is ootv-games
  `game-swccg/convert/scan-list.tsv`.
- The archive's `Errata/` scans are not loaded, pending a person's look before the release.
- No card carries `needsreview` so far.

## Rebuilding

A dead game: no refresh. If the source data changes, rerun ootv-games `scripts/game-swccg/scripts/convert.py`
(values read from the cards: `verified.json`, `objectives.json` beside it) and write changes with the bulk
recipe. `game-swccg/ADD-GAME.md` and `GO-LIVE.md` record how the game was added.
