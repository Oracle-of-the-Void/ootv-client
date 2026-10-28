# Doomtown: Reloaded (table `dtlcg`)

Last updated: 2026-10-26

AEG's **Doomtown: Reloaded** (2014–2016) and **Pine Box Entertainment**'s sets since 2017, Weird West
Edition included, as one game (ootv-claude `projects/newgame-dtlcg.md`). On the site it's called **Doomtown: The Card Game**
(the game menu, the bot); this doc says Doomtown: Reloaded to keep it apart from the 1998 CCG. Not live yet: built and checked
Live as a preview game since 2026-10-27 (ootv-games `game-dtlcg/GO-LIVE.md`).

**Not the 1998 Doomtown CCG**, which would be a game of its own (`dtccg`). The two never share cards,
ids or images, even where names agree.

## Where the data came from

- **Cards**: DoomtownDB (dtdb.co), through Whispers of War (2025-03): 1,316 entries in 27 sets, which
  become 1,036 cards with 1,347 printings (ootv-games `game-dtlcg/scripts/convert.py`). Each printing
  keeps its 5-digit DoomtownDB code in `dtdbcode`.
- **One card per name**, as Pine Box's floor rules play it: use the most recent printing (MRP). A reprint
  is the same card even when Weird West Edition rewrote it, so the card's fields are its most recent
  printing's, and an older printing whose printed stats or text differ says so in its `notes`
  ("Printed with cost 4 …"). Exceptions:
  - Experienced versions are cards of their own, titled "(Exp.1)". DoomtownDB leaves that off four
    Whispers of War dudes (Rafi Hamid, Mr. Outang, Harry Highbinder); their titles add it and
    `alttitle` holds the printed name.
  - Clear Out! is two cards (a Base Set Action, a Whispers of War Hex), each with a `needsreview` note.
- **Ids never change**: `cardid-map.tsv` and `printingid-map.tsv` in `game-dtlcg/` hold every id handed
  out, so a refresh adds new cards and printings after the old ones.
- **Images**: PNG with transparent corners. AEG's own print files (Base Set, Saddlebags 1–6, Faith and
  Fear, OP promos 1–7), rendered at 600 dpi, where they match the printed card (295 of 319; each
  checked against a printed scan); DoomtownDB's scans for everything else. 24 AEG versions with
  different wording, 3 starred saddlebag reprints and 3 errata renders are held back until they are
  checked against real cards.
- **Promos** the Doomtown Card Explorer has images of but DoomtownDB doesn't list (23) are printings in
  set Promos with a `needsreview` note: where each was released is unknown.
- **Rulings**: the floor rules' errata (v1.5, July 2026, §4.B; 11 cards) as `Erratum (...)` rulings linked
  to the PDF, and the Doomtown Card Explorer's rules notes (122 cards) with their source.

## Fields

Names follow the rulebook's card anatomy (pp. 4–5):

- `type`, `faction` (Neutral for drifters and cards with no faction), `keywords` (one per entry, printed
  order: Experienced 1, Huckster 2, Deputy, Private, ...).
- `value` (A, 2–10, J, Q, K) and `suit` (Spades, Hearts, Clubs, Diamonds): the poker value.
- `cost`, `upkeep`, `production`, `startingghostrock` (outfits; a legend's modifier), `bullets` and
  `shooter` (Stud, Draw, or Bonus for a bullet bonus that is neither), `influence`, `control`.
- Card text keeps DoomtownDB's faction icons as tokens (`[lawdogs]`, `[1stpeoples]`, `[fourthring]`, ...);
  the game config's `symbols` draws them as the faction's name for now.
- Printings: `set`, `number`, `quantity`, `publisher` (Alderac Entertainment Group through Blood Moon
  Rising, Pine Box Entertainment from There Comes a Reckoning; none on promos), `artist`, `flavor`,
  `notes`. Rarity is `Fixed` (`Promo` on promos, which are `notmrp`) and hidden.

## Legality

All derived: no card stores a legality. `dtlcg/attributes` holds two rules
([Derived legalities](derived-legality.md) for how rules work), from the floor rules §4:

- **Weird West** (the default for official events): a printing in a Pine Box set; Decimator Array is
  banned. 634 cards, exactly Pine Box's format-legal list (whose "Bio-Charge Neutralizer" is a typo
  for Bio-Charged).
- **Old Timer**: any printing, AEG's sets too; Showboating and 108 Worldly Desires are banned. 1,034 cards.

The card page lists the formats a card fits (the `derivedlegality` row helper).

## Refreshing

Pine Box still releases sets. `game-dtlcg/scripts/refresh.sh` pulls DoomtownDB and new images, rebuilds
the cards, images, sets and legality rules, checks Weird West against Pine Box's list, and lists what
changed (`convert/refresh-<date>/`). Changes go live the usual ways: a new set through the set import or
`upload-set.py`, changed cards through the bulk recipe (export, conditional update, log, verify in
search), and a changed `attributes.json` to `dtlcg/attributes` (then a cold start of the search Lambdas).
