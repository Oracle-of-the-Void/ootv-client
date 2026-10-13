# Derived legalities (L5R)

Last updated: 2026-10-13

A derived legality is a value in the Legality menu that no card actually holds. When someone
selects it, the search API turns it into a rule over the card data: arc legality, set, the
icons on each printing, and type. The formats that weren't printed on the cards can then be
defined once instead of tagged card by card. Cards never display these values.

## Where it lives

- **Rules:** DynamoDB `oracle-all-structure`, item `database = l5r`, `key = attributes`, field
  `attributes.legality.derived` (a list, one entry per format).
- **Menu group:** `attributes.legality.optgroupregex`. The "Format" group regex
  (`Strict|Extended|Modern|Legacy|BigDeck`) must match every derived name, or the name lands in
  the wrong group. The "Arc" regex excludes `Strict|Extended`.
- **Per-card overrides:** the card field `legalityderivedexception`
  (`{ "add": [names], "remove": [names] }`), edited on the card itself.
- **Code:** ootv-search `lib/attributeopts.js` (`derivedQuery`). `/attributes` lists the names
  and `/search` expands them. In ootv-client, `derivedprinting()` picks which printing to
  show.

## How a rule works

Each entry is `{ name, all, any, none, prefer }`:

| Part | Meaning |
|---|---|
| `name` | The menu value, with `&nbsp;` for spaces (e.g. `Legacy&nbsp;(derived)`). |
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
- **Names:** the format names, written with plain spaces (e.g. `Legacy (derived)`). The
  `&nbsp;` spelling also works.

Some ban exceptions also name the stored `Legacy`/`Modern` values. Those names have no effect
on the stored values; they cover a future rename of the derived formats to those names.

## Common exclusions

Legacy (derived), Modern (derived) and BigDeck share these `none` clauses:

- legality `Unreleased` or `Not Legal (Proxy)`
- type Proxy, Other, Clock or Territory (Clock and Territory are Siege board pieces)
- any printing with rarity `None`

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

### Legacy (derived) (11,981)

A trial next to the stored `Legacy` value; it matches stored Legacy exactly. Legacy counts any
card *printed* in its era, whether or not it carries a bug.

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

**Ban list / removed** (`remove: Legacy (derived)`):

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

### Modern (derived) (6,367)

A trial next to the stored `Modern` value; stored Modern was synced to match it on 2026-10-13.
Modern is **not** a subset of Legacy. Legacy counts any card printed in its era, while a Modern
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

**Ban list / removed** (`remove: Modern (derived)`):

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

The Legacy (derived) clauses, unchanged, with BigDeck's own ban list (July 5th, 2016). Legacy's
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

## Changing a rule

1. Read `attributes.legality.derived` from `oracle-all-structure` (`l5r` / `attributes`) and
   edit it. Before writing, compare the old and new card counts against Elasticsearch, using
   ootv-search `lib/attributeopts.derivedQuery`.
2. Write the change with `update-item ... SET attributes.legality.derived = :d`. For a new
   format, also add its name to the Format `optgroupregex`.
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
  exceptions; BigDeck.
