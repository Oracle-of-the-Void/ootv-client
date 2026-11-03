# Play table

Last updated: 2026-11-03 (l5r/play created)

The play table (`/play/`, repo `ootv-play`; on preview only so far) plays a game from its table config: the
zones, the layout rows, setup, card states, counters, the turn's phases and the attack, and the rules that
change by arc. The live site reads it from the settings (`oracle-all-structure`), item **`<game>/play`**; L5R's
is `l5r/play`, created 2026-11-03 at version 1. There's no Admin editor for it yet.

## Where it comes from

- `ootv-play` `games/<game>.json` is the working copy. Preview and local copies of the table play by that file,
  so rules can be tried there without touching the settings; `?config=structure` on the table's address makes
  preview play by the item instead.
- Before a release, the item is brought up to date from the file, one key at a time on the live version (ootv-tools
  `structure/set.py`). `ootv-play` `test/structure-diff.mjs` lists the keys that differ.
- New items are made with ootv-tools `structure/create.py <game>/play <file>`, which refuses if the item exists.

## What's in it

| Key | What |
|---|---|
| `zones` | the piles and areas: who sees them, how they're laid out, which back a discard takes, what a tap does, which pile refills a province, where a destroyed province's cards go |
| `table.rows` | the order of the piles and provinces along a player's row |
| `placement`, `setup` | where each deck card starts (L5R: the stronghold and pre-game cards in play, in the corner) and the opening shuffles and deals |
| `cardfields`, `enter` | the card fields the rules read (L5R: type, keywords) and what happens as a card comes into play (L5R: Holdings enter bowed; Fortifications not, up to Lotus) |
| `cardstates`, `counters`, `cardcounters` | bow and dishonor; Honor, Gold and Hand size; tokens |
| `phases` | the turn: what each phase does as it starts (straighten, turn provinces up, draw), whose action it is, the hand limit, and the attack's segments and battle steps |
| `arcrules`, `rulesets` | what changes by arc or format, and the rule sets a player can pick at the start (see below) |

## L5R rules by arc

From the last complete rulebook of each arc (`ootv-play` `docs/l5r/turn-sequence`). The start screen asks for the
arc, which filters the deck lists, and the rules, which default to the arc's own; the legacy formats (Legacy,
BigDeck, Modern, Obsidian Hand) default to the latest arc's, Three Dynasties. Any rule set can be picked.

| Rules | Phases | Each battle | Starting hand |
|---|---|---|---|
| Clan Wars to Age of Enlightenment | Straighten, Events, Action, Attack, Dynasty, End | Battle actions, Resolution | 5 |
| Race for the Throne (Samurai) | the same | Combat, Resolution | 5 |
| Destroyer War (Celestial) | the same | Combat, Resolution | 6 |
| Age of Conquest (Emperor) | the same | Engage (attacker first), Combat, Resolution | 6 |
| Ivory, Twenty Festivals, Onyx / Shattered Empire | Action, Attack, Dynasty, End of turn | Engage, Combat, Resolution | 5 |
| Three Dynasties | the same, Infantry and Cavalry Maneuvers back | Engage, Combat, Resolution | 5 |

Everywhere: starting Honor from the stronghold, four provinces, a hand size of 8 (a counter players can change),
the defender acting first in battle unless noted.
