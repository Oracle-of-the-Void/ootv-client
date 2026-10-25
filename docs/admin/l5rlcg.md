# L5R LCG (table `l5rlcg`)

Last updated: 2026-10-24

Fantasy Flight Games' **Legend of the Five Rings: The Card Game** (2017–2021), added 2026-10-24
(ootv-claude `projects/newgame-l5rlcg.md`). FFG only for now; Emerald Legacy, the community
continuation, can follow if there's interest.

## Where the data came from

- **Cards**: the fiveringsdb snapshot of 2021-10-21 (ootv-games `game-newl5r/fiveringsdb/`), converted
  by `game-newl5r/scripts/convert.py`: 1,373 cards in 42 packs, card ids in release order (the Draft
  Pack last). Each card keeps its fiveringsdb slug in `fiveringsdbid`, for matching deck lists from
  fiveringsdb or EmeraldDB.
- **Images**: the ProxyNexus 600 dpi scans for every card but the Draft Pack, which comes from FFG's
  own Draft Cards print file at 600 dpi. 89 promo alternate arts are extra printings (set `Promo`,
  rarity `Promo`, `notmrp`). PNG with transparent corners; masters at full scan size.
- **Rulings**: fiveringsdb's 1,019 rulings, in `ruling`. Card links inside them became the card's name
  in italics.

## Fields

Shared names where the idea is the same (`deck`, `traits`, `number`, `flavor`, `ruling`); the rest
are this game's. Descriptions are in Admin → Field descriptions.

- `deck`: Province (provinces, strongholds, warlords), Role, Dynasty, Conflict, Treaty. The deck list
  groups by it, Province first.
- `clan`, `allowedclans` (only when other clans may include the card), `cost`, `military`,
  `political`, `glory`, `strength`, `strengthbonus`, `militarybonus`, `politicalbonus`, `honor`,
  `fate`, `influencepool`, `influencecost`, `rolerestriction`, `element`, `unique`, `decklimit`.
- Rarity is `Fixed` on every pack printing (an LCG has no rarity); `quantity` is the copies in the
  product.
- Card text keeps fiveringsdb's icon tokens (`[conflict-military]`, `[clan-crab]`, `[element-air]`).
  The game config's `symbols` draws them; for now as text placeholders, until there are icons.

## Legality

`legality` lists the formats a card is legal in:

| Value | Source |
|---|---|
| `Stronghold`, `Stronghold (Restricted)` | FFG's last Imperial Law, 2021-08-10 (19 banned, 24 restricted) |
| `Skirmish` | Imperial Law (16 banned); strongholds, provinces and roles are never Skirmish |
| `Enlightenment` | Imperial Law (7 banned): FFG's multiplayer format |
| `Jade Edict`, `Jade Edict (Restricted)` | the community's Jade Edict list, from fiveringsdb |

A banned card leaves the format out. A restricted card has both values (`Stronghold` and
`Stronghold (Restricted)`), so it shows in a plain Stronghold search. Draft Pack cards, Clan War
treaties and Under Fu Leng's Shadow warlords belong to their own modes and have no legality.
Imperial Law only adds to fiveringsdb's older flags (3 more Stronghold bans, 2 more restricted, 1 more
Skirmish ban); the lists are in ootv-games `game-newl5r/ffg-rules/imperial-law-2021-08-10.json`.

## Errata

`text` is the current wording. Each functional erratum is also a `ruling` entry starting
`Erratum:`: Imperial Law's 14 (linked to its page on the Bookshelf), and a note on the 13 cards whose
text fiveringsdb already carried errata for from older Rules Reference versions.

## Bookshelf

11 FFG rules documents (ootv-import `rulebooks/l5rlcg.json`; [the Bookshelf guide](rulebooks.md)).
