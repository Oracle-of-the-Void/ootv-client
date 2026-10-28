# Quest for the Grail (table `qftg`)

Last updated: 2026-10-28

**Quest for the Grail**, the Arthurian collectible card game (Stone Ring Games / Horizon Games,
1995): Preview Edition, Limited Edition and three promos. The planned expansion, Knights of the
Isle, was never released. Added 2026-10-28 as a preview game (ootv-claude `projects/newgame-qftg.md`).

## Where the data came from

- **Cards**: ztcgvault.com's card database (Zarthbenn's TCG Vault), converted by ootv-games
  `game-qftg/scripts/convert.py`. **275 cards, 409 printings.**
- **Images**: Zarthbenn's own scans (745×1040, 2023) of every Limited Edition and promo card: 283.
  The Preview Edition has no images yet.
- **Checked against the cards**: every scan was read by a vision model and every difference from
  the database checked by eye. About 60 database errors were fixed to what the card prints (text,
  flavor, 16 card types, 2 cost boxes); typos the cards print are kept as printed. Every artist
  credit was read by eye from the card too.

## Cards and printings

One card per printed title and text. Limited Edition's numbered Domains ("Gaul 1", "Gaul 2",
"Gaul 3": the same text with other art) are one card with a printing per version (`version` 1, 2,
3). Combat Experience 1, 2 and 3 have different text, so they are three cards with one title.
The card shows the Limited Edition printing (version 1), or the promo.

- Card fields, named as in the rulebook ("Understanding the Cards"): `type` (as printed at the top of
  the text box), `deck` (Court or Quest, the two card backs), `upkeep` (the oval on Warriors),
  `valorcost` (the diamond on Rewards), `magic` (the star on Spells), `prowess`, `strength`,
  `endurance`, `valor` (the PRO, STR, END and VAL boxes; Quest cards print `*` where the text
  sets them, and their VAL is the diamond at the bottom right), `text`.
- Each printing has `set`, `rarity`, `number` (ztcgvault's checklist number: the cards print none),
  `version`, `artist`, `flavor`, and `title` where the Preview Edition checklist uses another name.
- Internal: `ztcgvaultid`.

## Preview Edition

ztcgvault has only a checklist for it: 117 names with rarity, no text, type or images. Each name is a
printing (no image) on the Limited Edition card it names; "Britain (3 Versions)" is three printings,
"Concentration (A)" and "(B)" two. Four names are joined to a differently named Limited card (The Round
Table, The Dolorous Blade, King Uther Pendragon of Logres, Sir Lamorack of Gales). Names with no Limited
card (Lady Lynette, Blatant Beast, Saxon Raider, Summer and Winter Solstice, and others) are title-only
cards. All of these carry a needsreview note until scans are found.

## Needs review

62 cards carry `needsreview` notes ([Needs review notes](needsreview.md)): the Preview Edition ones
above; artist credits where the card and ztcgvault disagree (28 cards print "Scriptorium Images"
where ztcgvault says Dave Nalle, and 6 name another painter; the note gives both); "Lois Rhead" on
Shield of Valor (Louis Rhead on every other card of his); and King Leodegrance of Britain, which
prints Warrior Knight where ztcgvault says Warrior King.

## Rebuilding

A dead game: no refresh. If the source data changes, rerun ootv-games `game-qftg/scripts/convert.py`
(values read from the cards are in `work/verified.json` and `work/credits-printed.tsv`) and write
changes with the bulk recipe. `ADD-GAME.md` and `GO-LIVE.md` there record how the game was added.
