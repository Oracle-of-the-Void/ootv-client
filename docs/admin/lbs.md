# Legend of the Burning Sands (table `lbs`)

Last updated: 2026-11-15

AEG's Legend of the Burning Sands CCG (1998–2000): Shadow of the Tyrant, Secrets and Lies, Black Hand Black
Heart, The Awakening, and promos. This page covers the LBS card fields that aren't the same as other games'.

## Traits (`traits`)

Each card's trait line, one entry per trait, in the order printed. Until 2026-11-15 these sat only in the text,
written several ways ("Unique. Senpet Fist of the Pharoah.", "Weapon - Unique", "Wanderer * Collector of Fables").
On 2026-11-15 the trait line was moved out of the text into `traits` on 431 cards (ootv-tools
`field-fixes/lbs-traits.py`):

- **A Hero's opening phrase is split** into its faction or group and the rest: "Moto Clan Huntress * Unique *
  Carry +2" is `Moto Clan`, `Huntress`, `Unique`, `Carry +2`. Groups split the same way: Celestial Alliance,
  Houses of Dahab, Ivory Kingdoms, Sand Pirate, Lion Clan, Scorpion Clan. Rules traits at the start of the rest
  are split off too ("Unaligned Undead Khadi Traitor": `Unaligned`, `Undead`, `Khadi`, `Traitor`). A phrase with
  the faction word in the middle stays whole ("Former Moto Clan Tar-khan").
- **Numbered traits** are written with the sign: `Archery +2`, `Raid -1`, `Carry +1`; plain `Archery` when
  printed without a number.
- **Actions, Spells and Stories** also get the kind words before their timing ("Buried Curse Day:" gives
  `Buried`, `Curse`; "Open Omen:" gives `Omen`): Omen, Buried, Curse, Council, Spirit, Event, Blessing, Tale,
  Reward. Those words stay in the ability text as well.
- **The trait line is not in `text`** (card or printing), the same as L5R keywords. A card whose whole text was
  its trait line has no `text`.
- **`printing[].traits`** only when a printing's own line differs from the card's (the card holds the MRP);
  the site shows it in printed mode. Takiyah's Shadow of the Tyrant printing reads "Watcher of Omens", the
  Awakening one "Watcher".

Search: Traits is a keyword field in the search form, after Faction; each trait on a card is a link to that search.

## Copper Production (`production`)

The Copper a card produces, as a one-entry list like L5R's Gold Production: `"4"`, or `"2*"` when the text adds
to it or gives a second, higher value (Belly Dancer: 2, plus 1 per Den of Iniquity), `"0*"` when there's
nothing without the condition (Abdul-Rafi's: 1 per 0-Influence Hero), `"*"` when it varies (Auction Block:
Copper equal to a discarded card's Fate). Filled 2026-11-15 from the text: 41 Holdings, Merchant Caravan (a
Follower; it can produce 1 Influence instead, which isn't recorded here) and the 12 Strongholds. A Stronghold's
`production` is its printed Copper, which stays in `copper` as well; on every other card `copper` is the cost.

Search: Copper Production is a numeric field in the search form, after Influence; "2*" matches 2, "*" matches any amount.
