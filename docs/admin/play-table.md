# Play table

Last updated: 2026-11-03 (l5r/play version 9: Add a province)

The play table (`/play/`, repo `ootv-play`; on preview only so far) plays a game from its table config: the
zones, the layout rows, setup, card states, counters, the turn's phases and the attack, and the rules that
change by arc. The live site reads it from the settings (`oracle-all-structure`), item **`<game>/play`**; L5R's
is `l5r/play`, created 2026-11-03 at version 1, now version 9. There's no Admin editor for it yet.

## Where it comes from

- `ootv-play` `games/<game>.json` is the working copy. Preview and local copies of the table play by that file,
  so rules can be tried there without touching the settings; `?config=structure` on the table's address makes
  preview play by the item instead.
- Before a release, the item is brought up to date from the file, one key at a time on the live version (ootv-tools
  `structure/set.py`). `ootv-play` `test/structure-diff.mjs` lists the keys that differ.
- `l5r/play` is kept in step with `games/l5r.json` as the table's work is merged (the user, 2026-11-03), one changed
  path at a time. Version 2 (2026-11-03) added `tokens`, `table.arrange` and the provinces' `attach`, and moved
  `placement` to card widths. Version 3 (2026-11-03): Gold only from Ivory on (`counters` per arc, `clear: phase`). Version 4 (2026-11-03): battles (each arc's `phases[].attack`: Maneuvers segments `assign`, the Resolution step `resolve`, `commit`, `honor`). Version 5 (2026-11-03): Shinsei's Shrine keeps its province empty (the provinces' `norefill`; `title` among the `cardfields`). Version 6 (2026-11-03): the Events Phase turns provinces up one at a time and waits at each Event (the Events phase `reveal`, which also attaches Regions); tokens by name (`cardcounters` +1F, +1C, +1F/+1C, -1F; `customtokens`; `tokenforce` counts a token's F in battle); dishonored cards turn upside down (`cardstates` look `turn`); Arrange: Standard (`table.arrange.standard`). Version 7 (2026-11-03): the provinces' `norefill` title rule is gone; Shinsei's Shrine's own card field `play` says it (`cardfields` gains `play`; see below). Version 8 (2026-11-03): Gold (`gold`: bowing a card with Gold Production adds it; a card bought from a province in the Dynasty Phase pays its cost and the rest is lost; a Personality of the player's clan paid in full adds its Personal Honor, else costs 2 less; a Gold counter before Ivory too; Ivory and Three Dynasties keep a pool with no clan rule), `cardfields` cost, production, conditionalvalues, clan, ph; who goes first (`firstplayer`: the highest starting Honor, a tie at random, SCC p. 58); seats are Player A and Player B. Version 9 (2026-11-03): Province 5 and 6 (`zones[].extra`), out of the game until a player picks Add a province; every province list (`table.rows`, `gold.buy.from`, the Events `reveal`/`faceup` zones, `attack.battlefields`, in each arc) names them.
- New items are made with ootv-tools `structure/create.py <game>/play <file>`, which refuses if the item exists.

## What's in it

| Key | What |
|---|---|
| `zones` | the piles and areas: who sees them, how they're laid out, which back a discard takes, what a tap does, which pile refills a province, where a destroyed province's cards go, which cards attach to the zone itself (`attach`, L5R's provinces: Regions and Fortifications) |
| `table.rows` | the order of the piles and provinces along a player's row |
| `table.arrange` | Arrange's rows of card types, nearest first (L5R: stronghold, sensei, wind, holdings, regions, celestials; then personalities; then the rest), and the types it stacks (Holding) |
| `placement`, `setup` | where each deck card starts (L5R: the stronghold and pre-game cards in play, in the corner; spots in card widths from the near right-hand corner) and the opening shuffles and deals |
| `cardfields`, `enter` | the card fields the rules read (L5R: type, keywords, title) and what happens as a card comes into play (L5R: Holdings enter bowed; Fortifications not, up to Lotus) |
| `cardstates`, `counters`, `cardcounters`, `customtokens`, `tokenforce` | bow and dishonor (upside down); Honor, Gold and Hand size; tokens on cards, by name (+1F, ...; any name typed), a token's F counted in battle |
| `tokens` | a token one player holds or nobody does (L5R: the Imperial Favor) |
| `gold` | what produces Gold (`produce`), what a purchase is and what it costs (`buy`), the clan Personality rule (`clan`: Personal Honor when paid in full, else 2 less; not Shadowlands), and whether what's left after a payment is lost (`spendall`, before Ivory) |
| `firstplayer` | who goes first: the highest of a counter (L5R: Honor), a tie at random |
| `phases` | the turn: what each phase does as it starts (straighten, turn provinces up, draw), whose action it is, the hand limit, and the attack: its segments (Maneuvers: `assign`, the attacker then the defender; `infantry`, `cavalry` or `any`; Three Dynasties' Cavalry `onlywithunits`), the battle steps (Resolution: `resolve`), who may be assigned (`commit`: L5R, a unit led by an unbowed Personality; Cavalry when the Personality and all its Followers are) and the Honor a resolution gives (`honor`: 2 a card destroyed to the winner, 1 each on a tie) |
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

Gold: before Ivory there's no pool (excess Gold is "taxed by the Emperor" and lost, Samurai and Emperor rules), so
there's no Gold counter. From Ivory on (Ivory, Twenty Festivals, Onyx, Shattered Empire, Three Dynasties and the
legacy formats) a Gold counter is the pool, emptied for both players as each phase ends.

Battles (all arcs): units assigned to the defender's provinces stand in a Battlefields pane, one column per province.
Resolution totals each army's printed Force (bowed cards add nothing, a bowed Personality makes its unit nothing, a
side with no units has none) and the province's Strength (the Stronghold's `strength`, plus attachments printing one),
which players adjust for card effects. The loser's army is destroyed, both on a tie with units on both sides; the
province falls when the attacking Force is more than the defence plus its Strength. Attackers bow and go home after
each battle; defenders at the end of the attack, or when their province falls (Scorpion Clan Coup pp. 37–42, Ivory
CR XII.7–8, Emperor CR XIII). A destroyed province leaves the row.

## Card field `play`

Rules a card brings to the table live on the card, not in `l5r/play` (the user, 2026-11-03, the same way `deckconstruction` does for deck checks). `{"attached": {...}}` changes the zone the card is attached to while it's there face up; only `autorefill` can be changed so far. Shinsei's Shrine (card 6992): `{"attached": {"autorefill": false}}`, "This province does not hold Dynasty cards (do not refill it)". The province doesn't refill by itself; a player can still refill it by hand. Edit it in the card editor like any field.
