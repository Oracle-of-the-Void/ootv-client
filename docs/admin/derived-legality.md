# Derived legalities (L5R)

Last updated: 2026-10-17

A derived legality is a value in the Legality menu that no card actually holds. When someone
selects it, the search API turns it into a rule over the card data: arc legality, set, the
icons on each printing, and type. The formats that weren't printed on the cards can then be
defined once instead of tagged card by card. Cards never display these values.

## Where it lives

- **Rules:** DynamoDB `oracle-all-structure`, item `database = l5r`, `key = attributes`, field
  `attributes.legality.derived` (a list, one entry per format).
- **Menu group:** `attributes.legality.optgroupregex`. The "Format" group regex
  (`Strict|Extended|Modern|Legacy|BigDeck|Obsidian.*Hand`) must match every derived format, or the name lands
  in the wrong group. Names hold `&nbsp;`, so match a space with `.*`, not `.`. The "Arc" regex excludes `Strict|Extended`. Filters that aren't formats
  (Paper) go in "Misc" (`Proxy|Unreleased|Paper`).
- **Per-card overrides:** the card field `legalityderivedexception`
  (`{ "add": [names], "remove": [names] }`), edited on the card itself.
- **Code:** ootv-search `lib/attributeopts.js` (`derivedQuery`). `/attributes` lists the names
  and `/search` expands them. In ootv-client, `derivedprinting()` picks which printing to
  show (see "Which printing is shown").
- **Deck/list legality menu:** ootv-client `listLegalitySelect` lists `legality.sortregex`,
  then adds each derived name right after the format it starts with (Ivory → Ivory Strict),
  with the rest (BigDeck) at the end. A new derived format shows up there on its own; you don't
  need to add it to `sortregex`. Entries with `listable: false` (Paper) are left out. A list's
  legality is only a label and isn't checked.
- **Search form checkbox:** a `searchables` entry of type `require` in `templates/l5r.js`
  (`"paper": {"type": "require", "field": "legality", "value": "Paper"}`, labels
  `tagpaper`/`shortpaper`) renders a checkbox that sends `require_legality=Paper`. The API ANDs
  `require_<field>` with the rest of the search; `templatefetch()` then switches to a printing
  that fits it.

## Which printing is shown

A legality search (an arc, a format, or Paper) shows the card on one of its printings. Among
the printings that match, it's the **latest**: the later set in the chronological set order
(`sortregex` under `printing.set` in the same `oracle-all-structure` item), and on a tie the
later printing on the card. A derived entry's `prefer` comes first: Ivory Extended shows an
Ivory printing even when a Twenty Festivals one is later. Printings marked `notmrp: true` are
skipped, so a later expansion reprint can be kept from standing for its arc. For example,
Ring of the Void in Jade shows Siege of Sleeping Mountain unless that printing is `notmrp`; then
it shows Pearl. The Discord bot picks the same way, and so does a decklist import's `Legality:` line.

`notmrp` is set on: Siege of Sleeping Mountain, the Promotional–Emperor Rings and full-bleed
Personalities/Strongholds (2026-10-15), and the Imperial-arc starter-deck reprints (2026-10-16, 315
printings). Starter reprints whose rules text plays differently keep it unset: the 4 Shadowlands
honor/gold variants, Isawa Tomo (Time of the Void) and Summon Faeries (Shadowlands, Anvil of Despair,
Crimson and Jade).

## How a rule works

Each entry is `{ name, all, any, none, prefer }`:

| Part | Meaning |
|---|---|
| `name` | The menu value, with `&nbsp;` for spaces (e.g. `Ivory&nbsp;Strict`). |
| `all` | Every clause must match. |
| `any` | At least one clause must match (when there are any). |
| `none` | No clause may match. A clause on printing fields drops the card if **any** of its printings matches. |
| `prefer` | Optional legality values. It's only for the client: printings carrying one of them are shown first. Search ignores it. |

A clause is `{ <card field>: [values], printing: { <printing field>: [values] } }`.
- Fields within a clause are ANDed; the values listed for one field are ORed.
- All the `printing` fields in a clause must match on the **same** printing. For example,
  "legality 20F + set Evil Portents" means a printing from Evil Portents that has the 20F icon.

Exceptions on a card (`legalityderivedexception`) override the rule:
- **add:** the card is in the format even if the rule doesn't match. The `none` clauses don't
  apply to it.
- **remove:** the card is out of the format, even if the rule or an `add` matches. Ban lists are
  done this way.
- **Names:** the format names, written with plain spaces (e.g. `Ivory Strict`). The
  `&nbsp;` spelling also works.

## Common exclusions

Legacy, Modern, BigDeck and Obsidian Hand share these `none` clauses:

- legality `Unreleased` or `Not Legal (Proxy)`
- type Proxy, Other, Clock or Territory (Clock and Territory are Siege board pieces)
- any printing with rarity `None`

Stored legality is multi-valued. `Unreleased` is never removed or replaced: a card is unreleased
for reasons that have nothing to do with playability. Other values go beside it, so an
unreleased proxy has both `Unreleased` and `Not Legal (Proxy)`. Every proxy has
`Not Legal (Proxy)` (backfilled 2026-10-18).

## Formats

Counts are as of the last update. Check the current count by selecting the value in a search.

### Ivory Strict (850)

All of:
- legal in Ivory (`A Brother's Destiny (Ivory Edition)`)

Any of:
- a printing with the 20F icon from an Ivory-arc set: A Matter of Honor, Ivory Edition, The
  Coming Storm, A Line in the Sand, The New Order, The Currency of War, Promotional–Ivory
- a Stronghold or Ring printed in Ivory Edition

Left as it is: no clarification for Ivory is known. Don't change it without a source.

### Ivory Extended (2,933)

Ivory plus the arcs on either side of it, Emperor and 20F. An arc ended when the next one began.
So a card that gets in only through 20F legality also needs a 20F-icon printing from one of the
Ivory Strict sets.

Any of:
- legal in Emperor or Ivory
- a 20F-icon printing from an Ivory Strict set (listed above)

Prefer: Ivory.

### Twenty Festivals Strict (893)

Source: AEG "Twenty Festivals Strict Clarification", 2015-04-02.

All of:
- legal in 20F (`A Brother's Destiny (Twenty Festivals)`)

Any of:
- a printing with the Onyx icon from a 20F-arc set: Twenty Festivals, Thunderous Acclaim, Evil
  Portents, The Blackest Storm, Promotional–Twenty Festivals, Siege: Clan War
- any card in the Twenty Festivals base set, numbers 1–372. Starter reprints such as Gates of
  the Second City (#391) stay out.

Promotional–20F and Siege: Clan War stay in the set list for now, although the ruling names only
the three expansions.

### Twenty Festivals Extended (2,152)

Any of:
- legal in Ivory or 20F
- an Onyx-icon printing from a 20F Strict set (listed above)

Prefer: 20F.

### Jade Extended (2,402)

Any of:
- a Stronghold, Personality, Event, Spell or Ring legal in Jade
- a Strategy (Actions, Kihos), Follower, Sensei, Item, Holding, Region or Ancestor legal in
  Imperial or Jade

This is its own type-based rule. Don't generalize it to other Extended formats.

### Jade Extended 2000 (1,915)

The Jade Extended rule unchanged, plus:

All of:
- a printing from a Hidden Emperor (Jade) arc set: Jade Edition, Hidden Emperor 1–6, The Dark
  Journey Home, Pearl Edition, Siege of Sleeping Mountain, Honor Bound, Ambition's Debt, Fire &
  Shadow, Top Deck Booster Pack, Heroes of Rokugan, Soul of the Empire, Storms Over Matsu Palace,
  The War of Spirits, Promotional–Jade and Promotional–CWF (the set menu's "The Hidden
  Emperor (Jade)" group)

The set clause is an `all` clause, so the printing shown is a Jade-arc one. It drops 487 Jade
Extended cards that were never reprinted in the arc: Imperial-only Strategies, Items, Holdings,
Followers, Regions and Ancestors, and 58 Imperial Personalities (Akodo Kage, Bayushi Kachiko, the
Scorpion Clan Coup cards). Those Personalities are Jade-legal only through Jade's experienced rule (a
Personality whose experienced version was printed in Jade counts as Jade). Jade Extended 2000 has no
such rule, which is what sets it apart from Jade Extended.

### Legacy (11,981)

Rules shelf: [Legacy Format](https://oracleofthevoid.com/#game=l5r,#rulebook=aeg-legacy-format) (AEG's rules wiki, May 2015).

Legacy counts any card *printed* in its era, whether or not it carries a bug. It started as the
trial "Legacy (derived)" next to a stored `Legacy` value on the cards. Once the two matched card
for card, the stored value was dropped and the derived entry took the name (2026-10-13).

Any of:
- legal in any arc from Imperial through Ivory (Imperial, Jade, Gold, Diamond, Lotus, Samurai,
  Celestial, Emperor, Ivory)
- a 20F-icon printing from Twenty Festivals, Thunderous Acclaim, Evil Portents,
  Promotional–Twenty Festivals or Siege: Clan War. Legacy froze before The Blackest Storm.
- a printing from a set whose Legacy cards carry no arc legality, or that held cards banned
  from their arc: 1,000 Years of Darkness, Siege: Clan War, Siege: Heart of Darkness, Dawn of the
  Empire, Promotional–Emperor, War of Honor, Emperor Edition, Promotional–Celestial,
  Promotional–Lotus, Promotional–Samurai, The Coming Storm, The Imperial Gift 2, A Line in the
  Sand, Emperor Edition Demo Decks, Ivory Edition, Promotional–Ivory, Seeds of Decay, The
  Harbinger, The Shadow's Embrace, Torn Asunder, Twenty Festivals

None of: the common exclusions.

No prefer: the MRPs stop before The Blackest Storm, so there's nothing to prefer.

**Ban list / removed** (`remove: Legacy`):

| Card | ID | Type | Why |
|---|---|---|---|
| Breach of Etiquette | 1128 | Strategy | banned |
| Minor Oni Servant | 5063 | Follower | banned |
| Rise from the Ashes | 6342 | Spell | banned |
| Shrine of the Spirits | 7215 | Stronghold | banned |
| Take the Initiative | 7744 | Strategy | banned |
| The High House of Light | 8134 | Stronghold | banned |
| The Master of Five | 8212 | Event | banned |
| Yodin Sensei | 9480 | Sensei | banned |
| Nanashi Mura | 5508 | Stronghold | not legal |
| The Shrine of Lady Sun | 8333 | Stronghold | not legal |
| The Governor's Estate | 8106 | Stronghold | not legal |
| Gates of the Second City | 11142 | Stronghold | not legal |

The ban list is closed: these are all of Legacy's bans.

### Modern (6,367)

Rules shelf: [Modern Format Comprehensive Rules](https://oracleofthevoid.com/#game=l5r,#rulebook=modern) (forum, November 2014) and the [L5R Modern FAQ](https://oracleofthevoid.com/#game=l5r,#rulebook=modern-faq-2015) (March 2015).

Like Legacy, it started as the trial "Modern (derived)", and the stored `Modern` value was
synced to it, then dropped (2026-10-13). Modern is **not** a subset of Legacy. Legacy counts any card printed in its era, while a Modern
card needs a Modern bug (Samurai, Celestial, Emperor, Ivory, 20F, Onyx, before The Blackest
Storm). Each format has its own ban list.

Any of:
- legal in Samurai, Celestial, Emperor or Ivory
- a 20F- or Onyx-icon printing from Twenty Festivals, Thunderous Acclaim, Evil Portents, The
  Currency of War, Promotional–Twenty Festivals or Siege: Clan War
- a printing from the 2015 Modern set list. This catches cards banned from their own arc, which
  lost the arc tag but are still Modern. The sets are Samurai Edition, Test of the Emerald and
  Jade Championships, Honor's Veil, Words and Deeds, The Heaven's Will, Glory of the Empire,
  The Imperial Gift 1–3, Death at Koten, Celestial Edition, Path of the Destroyer, The
  Harbinger, The Plague War, Battle of Kyuden Tonbo, Empire at War, The Dead of Winter, Before
  the Dawn, Forgotten Legacy, Second City, Emperor Edition, Embers of War, The Shadow's
  Embrace, Seeds of Decay, Honor and Treachery, Emperor Edition Gempukku, Torn Asunder, Coils
  of Madness, Gates of Chaos, Aftermath, Ivory Edition, A Matter of Honor, The Coming Storm, A
  Line in the Sand, The New Order, Twenty Festivals, Promotional–Emperor, Samurai Edition
  Banzai. The 2015 list's Lotus-arc sets (Khan's Defiance, Tomorrow, The Truest Test) are left
  out.

None of: the common exclusions.

Cards with no arc legality and no arc ban aren't Modern. That's why Gates of the Second City and
The Governor's Estate are removed below. Shabura is out.

**Ban list / removed** (`remove: Modern`):

| Card | ID | Type | Why |
|---|---|---|---|
| Bamboo Harvesters | 679 | Holding | banned (2015 list) |
| Bamboo Harvesters (exp 2) | 10428 | Holding | banned (2015 list) |
| Border Keep | 1106 | Holding | banned (2015 list) |
| Border Keep (inexp) | 10240 | Holding | banned (2015 list) |
| Border Keep (exp 2) | 10429 | Holding | banned (2015 list) |
| Yasuki Palaces (exp) | 9459 | Stronghold | banned (2015 list) |
| The Inevitable Grasp of Conquest | 10817 | Celestial | banned (2015 list) |
| Keigo Sensei | 10966 | Sensei | banned (later addition) |
| Foothold of the Mad | 10562 | Stronghold | banned (later addition) |
| The Governor's Estate | 8106 | Stronghold | no arc legality |
| Gates of the Second City | 11142 | Stronghold | no arc legality |

Kyuden Otomo (exp) and Koan's items were later taken off the Modern ban list, so they have no
exception. A newer, longer Modern ban list may still turn up. Add any bans from it as `remove`
exceptions.

### BigDeck (11,973)

Rules shelf: [Big Deck, Tanuki Edition](https://oracleofthevoid.com/#game=l5r,#rulebook=big-deck).

The Legacy clauses, unchanged, with BigDeck's own ban list (July 5th, 2016). Legacy's
bans don't apply here.

**Ban list** (`remove: BigDeck`):

| Card | ID | Type |
|---|---|---|
| Gozoku Sensei | 2885 | Sensei |
| Jigoku Sensei | 4046 | Sensei |
| Kakita Dueling Academy | 4161 | Stronghold |
| Koan's Jingasa | 10524 | Item |
| Koan's Robes | 10525 | Item |
| Kyuden Hitomi | 4639 | Stronghold |
| Kyuden Otomo (exp) | 4646 | Stronghold |
| Mirumoto Hakahime | 5091 | Personality |
| Nanashi Mura | 5508 | Stronghold |
| Palace of the Emerald Champion | 5864 | Region |
| Razor's Edge Dojo | 6191 | Stronghold |
| The Governor's Estate | 8106 | Stronghold |
| The High House of Light | 8134 | Stronghold |
| The Master of Five | 8212 | Event |
| The Ruins of Isawa Castle | 8292 | Stronghold |
| The Shrine of Lady Sun | 8333 | Stronghold |
| Tomorrow Sensei | 8627 | Sensei |
| Toturi Sensei | 8674 | Sensei |
| Yoma Sensei | 9517 | Sensei |
| Gates of the Second City | 11142 | Stronghold |

A name on a ban list without "(exp)" means only the non-experienced card. That's why only the
inexperienced Mirumoto Hakahime is banned. Experienced versions are separate cards; check the
card's title and keywords for "Experienced".

### Obsidian Hand (11,949)

Rules shelf: [The Obsidian Hand](https://oracleofthevoid.com/#game=l5r,#rulebook=obsidian-hand) (the current ClickUp docs), the [2016 ruleset v.01](https://oracleofthevoid.com/#game=l5r,#rulebook=obsidian-hand-2016) and the [group queries 2016–2024](https://oracleofthevoid.com/#game=l5r,#rulebook=obsidian-hand-queries-2024).

Source: "The Obsidian Hand Ruleset Quickstart and Primer"
([ClickUp](https://doc.clickup.com/9016365709/d/h/8cpnmmd-636/014766f3e7c6080), also pinned in
the Sun and Moon Discord's legacy channel). The Obsidian Hand council's ruleset is the Jade Hand
Council's post-Ivory Legacy with changes, so the card pool is the Legacy clauses, unchanged, with
Obsidian Hand's own ban list. No prefer: play uses the most recent printings, which is what the
search shows anyway.

**Ban list** (`remove: Obsidian Hand`). The primer bans the Jade Hand Legacy cards plus its own
additions. All 12 of Legacy's removals are on it:

| Card | ID | Type |
|---|---|---|
| Gates of the Second City | 11142 | Stronghold |
| House of the Black Lion | 12637 | Stronghold |
| Nanashi Mura | 5508 | Stronghold |
| Shrine of the Spirits | 7215 | Stronghold |
| The Governor's Estate | 8106 | Stronghold |
| The High House of Light | 8134 | Stronghold |
| The Shrine of Lady Sun | 8333 | Stronghold |
| Gozoku Sensei | 2885 | Sensei |
| Yodin Sensei | 9480 | Sensei |
| The Master of Five | 8212 | Event |
| Hantei | 2964 | Personality |
| Isawa Tadaka, Seven Thunder (exp 2CW) | 12646 | Personality |
| Moshi Eihime | 5254 | Personality |
| Breach of Etiquette | 1128 | Strategy |
| The Final Wave | 8080 | Strategy |
| Lies, Lies, Lies... | 4726 | Strategy |
| Recruiting Drive | 6216 | Strategy |
| Take the Initiative | 7744 | Strategy |
| Gaijin Merchant | 2755 | Follower |
| Koan's Jingasa | 10524 | Item |
| Koan's Robes | 10525 | Item |
| Minor Oni Servant | 5063 | Follower |
| Rise from the Ashes | 6342 | Spell |

"Hantei" is only the card of that exact name (Dawn of the Empire). The other Hantei cards stay
legal, and so do the other three Isawa Tadakas. The experienced Lies, Lies, Lies... (Shattered
Empire) isn't in Legacy anyway.

**Cards with the Rank (Kabuto) icon** are banned too. No card field records the icon, so these are
the Legacy cards with a `:Rank…:` symbol in their text, all from Siege: Clan War and Siege: Heart
of Darkness (21 cards; the 6 Clocks with one are already out as board pieces): The Dark Naga, The
Quelsa, The Shakash, The Sleepless One, Doji Nashiko (Demon Bride of Fu Leng), Fu Leng, the Ninth
Kami, The Hidden Heart of Iuchiban, Junzo's Dark Citadel, Knot of Serpents, Baseless Rage, Brutal
Strike, Inevitability, Malevolence, Warlord's Command, Compromised Supply Lines, Darkness is
Inevitable, Fallen in Battle, Insidious Influence, Tactical Retreat, Terrifying Presence and
Unholy Power.

"Unreleased cards/promos" are covered by the common exclusions.

The primer's other rules don't change the card pool, so they aren't modeled: Starting Holdings
(only the MRPs of Border Keep and Bamboo Harvesters), Rings as their MRPs, cards once ruled the
same now counting as different for deck building, and the gameplay rules (Dishonor Victory,
turn structure, player abilities, Performing).

## Filters

Derived values that aren't formats. They sit in the Legality menu's "Misc" group, and their
entry has `listable: false`, so the deck/list Legality menu leaves them out.

### Paper (12,403)

Cards printed on paper by the original publishers: at least one printing whose `publisher` is
Five Rings Publishing Group or Wizards of the Coast, or an Alderac Entertainment Group printing
from one of the AEG sets (Gold Edition's successors up to, not including, The Blackest Storm,
plus Promotional–Gold and the Oracle of the Void proxies), and the card isn't `Unreleased`.
Onyx Lives printings don't count. The Blackest Storm doesn't either: its printings carry both
Onyx Lives and AEG (AEG technically produced it; Onyx finished and published it), so the AEG
clause lists its sets in a `set` term, which leaves TBS out. A new AEG set would have to be
added to that list. 250 of these cards also have an Onyx Lives reprint. On those, the search
results and card page show the paper printing.

The rule (`any`): `{printing: {publisher: [FRPG, WotC]}}` or
`{printing: {publisher: [AEG], set: [the 83 AEG sets]}}`. Both printing fields in one clause
must match the same printing.

The search form has a **Paper** row, just below Pub, with an **only** checkbox. It sends `require_legality=Paper`, which the
API ANDs with the rest of the search, including whatever the Legality menu holds. Picking
Paper in the Legality menu instead ORs it with the other legalities chosen there.

The publishers come from the set (`ootv-backups/printing-publisher.py`, 2026-10-14):

| Publisher | Sets |
|---|---|
| Five Rings Publishing Group | Pre-Imperial Edition through Scorpion Clan Coup, plus Promotional–Imperial |
| Wizards of the Coast | Jade Edition through The War of Spirits, plus Promotional–Jade, Promotional–CWF and Gold Edition |
| Alderac Entertainment Group | After Gold Edition (plus Promotional–Gold) up to The Blackest Storm |
| Onyx Lives | The Blackest Storm and later (already set). The Blackest Storm also has AEG (2026-10-23) |

In the Oracle of the Void set, the proxies are AEG and the Old, New and SotE card backs are
FRPG, WotC and WotC. The three Mike Petke printings keep that publisher. A new set needs its
publisher set at import time.

## Changing a rule

1. Read `attributes.legality.derived` from `oracle-all-structure` (`l5r` / `attributes`) and
   edit it. Before writing, compare the old and new card counts against Elasticsearch, using
   ootv-search `lib/attributeopts.derivedQuery`.
2. Write the change with `update-item ... SET attributes.legality.derived = :d`. For a new
   format, also add its name to the Format `optgroupregex`. For a new filter that isn't a
   format, add it to Misc instead and give it `listable: false`.
3. The search Lambdas cache the config per container. Force a cold start of `prod-ootv-search`
   and `dev-ootv-search`, e.g. by changing the function description.
4. Check the count by selecting the value in a search, or by POSTing to `/search` with
   `type_legality=select&field_legality[]=<name>`.
5. Update this document, along with ootv-search `CLAUDE.md` ("Derived select values").

Ban changes are card edits, not config changes: add or remove the format name in the card's
`legalityderivedexception`. Bulk edits made outside the editor must be logged (one `updatelog`
row per card and one `bulkupdate` row in `oracle-all-updatelog`). The search index picks the
change up through the DynamoDB stream; no cold start is needed.

## History

- 2026-10-12: Ivory and Twenty Festivals Strict/Extended; Jade Extended.
- 2026-10-13: Legacy (derived) and the `none` clause support; Ivory/20F Extended prefer their own
  arc; Modern (derived), followed by syncing stored Modern to it; the Legacy ban list
  exceptions; BigDeck. Then the stored `Legacy`/`Modern` values were dropped from 11,981 cards
  (bulkupdate) and the derived entries renamed from "Legacy (derived)"/"Modern (derived)" to
  `Legacy`/`Modern`, with the ban exceptions renamed to match.
- 2026-10-14: Paper (ootv-client #240), after `printing.publisher` was backfilled on 18,197
  printings; `listable: false`; the search API's `require_<field>` and the Paper "only" checkbox (below Pub).
- 2026-10-16: Obsidian Hand (the Legacy clauses with its own ban list, 44 `remove` exceptions).
- 2026-10-17: Jade Extended 2000 (Jade Extended limited to cards printed in a Jade-arc set).
- 2026-10-23: The Blackest Storm's 168 printings got AEG as publisher beside Onyx Lives
  (bulkupdate); Paper's AEG clause now lists the AEG sets so TBS stays out (still 12,403).
