# Legend of the Burning Sands (table `lbs`)

Last updated: 2026-11-16

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
  a word before the faction splits in three: "Former Moto Clan Tar-khan" is `Former`, `Moto Clan`, `Tar-khan`;
  "Gypsy Jackal" is `Gypsy`, `Jackal` (2026-11-15).
- **Jinn spells**: "Summon Jinn of Earthly Pleasures" is `Summon Jinn`, `Jinn of Earthly Pleasures`, so a
  Traits search for Summon Jinn finds every Jinn; Alakrai's "Summon Elder Jinn Trickster" is `Summon Jinn`,
  `Elder Jinn Trickster`.
- **Capitals as printed**: `Tavern-Master`, `Brother of the Black Shield`, even where our text had them in lower case.
- **Numbered traits** are written with the sign: `Archery +2`, `Raid -1`, `Carry +1`; plain `Archery` when
  printed without a number.
- **Actions, Spells and Stories** also get the kind words before their timing ("Buried Curse Day:" gives
  `Buried`, `Curse`; "Open Omen:" gives `Omen`): Omen, Buried, Curse, Council, Spirit, Event, Blessing, Tale,
  Reward. Those words stay in the ability text as well.
- **The trait line is not in `text`** (card or printing), the same as L5R keywords. A card whose whole text was
  its trait line has no `text`.
- **`printing[].traits`** only when a printing's own line differs from the card's (the card holds the MRP);
  the site shows it in printed mode. Takiyah's Shadow of the Tyrant printing reads "Watcher of Omens", the
  Awakening one "Watcher". An empty list means the printing has no traits: Blood Oath's 1998 printings
  print no Omen.

Search: Traits is a keyword field in the search form, after Faction; each trait on a card is a link to that search.

## Copper Production (`production`)

The Copper a card produces, as a one-entry list like L5R's Gold Production: `"4"`, or `"2*"` when the text adds
to it or gives a second, higher value (Belly Dancer: 2, plus 1 per Den of Iniquity), `"0*"` when there's
nothing without the condition (Abdul-Rafi's: 1 per 0-Influence Hero), `"*"` when it varies (Auction Block:
Copper equal to a discarded card's Fate). Filled 2026-11-15 from the text: 41 Holdings, Merchant Caravan (a
Follower; it can produce 1 Influence instead, which isn't recorded here) and the 12 Strongholds. A Stronghold's
`production` is its printed Copper, which stays in `copper` as well; on every other card `copper` is the cost.

Search: Copper Production is a numeric field in the search form, after Influence; "2*" matches 2, "*" matches any amount.

## Story Points (`storypoints`)

The Story Points a Story card counts toward a Story Victory, as a one-entry list: `"2"`. Each Story prints them as
the first line of its text, "2 Story Points" or just "2 Points"; on 2026-11-16 that line was moved out of the card
and printing text into `storypoints` on all 10 Stories (0 to 2 points; ootv-tools `field-fixes/lbs-traits.py`,
revert file ootv-backups `reverts/2026-11-16-lbs-storypoints.jsonl`). The same pass gave The Tale of the Stolen
Heart and The Tale of the Moto and the Senpet their missing `Tale` trait, and The Tale of Selqet and the Eye of
Night its `Reward`. Text that mentions Story Points (Truth of the Prophecy, Qaliraq's Mystical Lute) is unchanged.

Search: Story Points is a numeric field in the search form, after Copper Production.

## Card text

The Awakening (1999) printings' rules text was proofread against the scans on 2026-11-15: 171 printings had
wording, missing words, capitals or periods that differed from the card (Blood Oath's "Every Hero challenged",
Staff of Sumarkhan's "Every Hero and Follower"), and each card's text, which was the same as its Awakening
printing, was fixed with it. The card's own misprints stay as printed ("additonal", "lower then", "Abjar ibn
Kaleel"). Flavor text found in rules text went to the printing's `flavor`. The same pass found trait lines the
first split missed (Omen and Council written in lower case, Burning Oil's Fortification, Jinn Horde's Jinn, Jinn of
Destruction's Carry -1 and Raid +1). Octavius and Phyrrus print "Beserk"; their trait is `Berserk`.

The other sets (Shadow of the Tyrant, Secrets and Lies, Black Hand Black Heart, promos) got the same proofread on
2026-11-16: text and flavor on 225 printings, and the card text on 95 cards whose text was that printing's. Among
them were missing clauses (The Moto Oasis's "All Moto Heroes you control", Judgement's "Judgment will only join an
Ebonite player."), "Day Open" for "Day Omen" (The Last Oasis) and Scimitar's flavor sitting in its text. The seven
promo Stronghold printings that had no text got it from their scans; they print it differently from the card. The
same misprint rule applies ("targetted", "may not distributed", "Armu", "Lammassu", "damge"). Trait lines that
differ only in spelling or order ("Non-human", "Raid-1", Tahir's "Smokless") keep the normalised trait so the
search finds them; Hensatti's trait is `Pharaoh` as printed.
