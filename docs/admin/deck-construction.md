# Deck construction rules

Last updated: 2026-10-31 (a card not legal in the deck's format breaks its construction; an admin's edit saves the summary too); 2026-10-30 (the Special legality; `titles`: Eternal Victory Dojo); 2026-10-29 (the check moved to the list header; Strength Remains, Forgotten Legacy; `cap`: BigDeck 80/80 and Modern 50/50 hold every card to one copy; `add`: Coastal Lane, Hato-gurama)

A soft check of a deck as a whole: deck sizes, copy limits, Pre-Game limits, and every card being legal in the
deck's Legality. The result shows at the
foot of the deck's list header, under "All cards legal for" ("Deck construction: ..."). Nothing is blocked; a
deck that breaks a rule saves as before. Lists of type Deck (or with no type) are checked.

## Where it lives

Four layers, each overlaying the one before rule by rule:

| Layer | Where | Edited in |
|---|---|---|
| The game's rules | `oracle-all-structure` `<game>/game`, `deckconstruction.rules` | Admin → Game config |
| A legality's changes | the same item, `deckconstruction.legality["<legality>"]`, keyed by the value the deck's Legality menu stores (`Imperial`, `BigDeck`: the `legality.sortregex` and derived names, not the cards' `Clan Wars (Imperial)`), plain spaces | Admin → Game config |
| A deck's changes | the list's `deckconstruction` field: `{"rules": {...}, "pick": {...}}` | the deck's **Construction rules** panel (owner) |
| A card's own limit, or its change to the rules while it's in the deck | the card field `deckconstruction` | the card editor |

In an overlay a rule id maps to the parts that change (`{"fate": {"min": 45}}`) or to `null`, which
switches the rule off (`{"copies": null}`). A rule id the game doesn't have adds a whole rule.
`add` changes a number already there instead of setting it (`{"dynasty": {"add": {"min": 2}}}`: the
minimum the layers before set, plus two), so one overlay works in every legality.

**Special** (every game, last in the deck's Legality menu; `decklegalityspecial` in `oracle.js`) is a value only a
list can have: no card, search filter, import arc or `legality.sortregex` knows it, and `/cardslegal` doesn't check
cards against it. It starts from **no rules** rather than the game's, so the check says "no limits". A later layer
that names a rule brings the whole rule back from `deckconstruction.rules`: the deck's panel lists the game's rules
unticked for the owner to tick, and `deckconstruction.legality["Special"]` would give a game's Special decks some by
default (no game has one). A card's `rules` change only the rules a Special deck has; they don't add any
(Forgotten Legacy's Holdings rule stays out). The public listing shows Special as the deck's format, like any owner's
legality; the search-engine deck pages (ootv-tools `seo/build.py`) leave it out of "legal in".

A broken rule shows in red on the Deck construction line, part of the list header
(`template-listcheck`), which also says "Breaks the deck construction rules" just before the not-legal cards.
**A card not legal in the deck's Legality breaks the deck's construction like a broken rule** (the user, 2026-10-31):
`/cardslegal` answers that for L5R, the only game with formats there, leaving out Proxy cards. A deck with no Legality,
or with Special, has no cards to fail this way. The red line and the "Not legal in" cards show, and the
"meets the rules" line doesn't.

The check's answer, rules and cards together, is also saved on the list (`summary.buildbad`, with the copies per deck) whenever the owner
opens it or an admin edits it (`listsummarysave()`, once `/cardslegal` answers: `liststatslegal()`): the directory's Count and the public deck listing show a red Illegal from it.
Every list was backfilled on 2026-10-29 (ootv-tools `lists/list-summary.py`, 18,681 lists; it runs the site's
own check in a headless browser). **After changing a rule or a card's legality, rerun that script** (scan, compute, write): a deck
keeps the answer from its last draw until its owner opens it or an admin edits it, and some owners never come
back (the Kempy archive decks), so don't count on a visit to clear a mark. Its public listing mark follows through the
lists index (at once, or the nightly rebuild).

Code: ootv-client `oracle.js`, `deckbuild*` (`deckbuildcheck`, `deckbuildidentity`) and the panel
`listbuildform`/`listbuildsave`; ootv-search `/list` stores the deck's field (`updatefield=deckconstruction`,
a JSON object, empty removes it).

## Rules

`deckconstruction` in `<game>/game`:

```json
{
  "decks": ["Pre-Game", "Fate", "Dynasty"],
  "rules": {
    "pregametypes": {"order": 1, "label": "Pre-Game", "check": "pertype", "deck": "Pre-Game", "max": 1, "except": ["Holding"]},
    "stronghold":   {"order": 2, "label": "Stronghold", "check": "type", "deck": "Pre-Game", "type": "Stronghold", "min": 1},
    "fate":         {"order": 3, "label": "Fate deck", "check": "size", "deck": "Fate", "min": 40},
    "dynasty":      {"order": 4, "label": "Dynasty deck", "check": "size", "deck": "Dynasty", "min": 40},
    "unique":       {"order": 5, "label": "Unique", "check": "copies", "when": {"keywords": "^Unique$"}, "max": 1},
    "copies":       {"order": 6, "label": "Copies", "check": "copies", "max": 3}
  },
  "legality": {
    "Imperial": {"fate": {"min": 30}, "dynasty": {"min": 30}},
    "BigDeck":  {"fate": {"min": 80}, "dynasty": {"min": 80}, "copies": {"max": 1, "cap": true}},
    "Modern":   {"fate": {"min": 50}, "dynasty": {"min": 50}, "copies": {"max": 1, "cap": true}}
  },
  "choices": {
    "sensei": {"label": "Sensei", "field": "deck", "when": {"type": "^Sensei$"}, "values": ["Pre-Game", "Fate"]},
    "bkbh": {"label": "Border Keep and Bamboo Harvesters", "field": "deck",
             "when": {"title": "^(Border Keep|Bamboo Harvesters)$"}, "values": ["Pre-Game", "Dynasty"]}
  }
}
```

| Part | Meaning |
|---|---|
| `decks` | The decks copy limits count in (cards in any other deck, L5R `Other`, aren't counted). A `copies` rule can set its own `decks`. |
| `label` | What the stats line and the panel call the rule. |
| `order` | Order shown; then by id. |
| `deck` | The deck the rule looks at, as the deck view groups the card (after `sort.pick` and the deck's picks). |
| `check: size` | Copies in `deck`: `min`, `max`. |
| `check: type` | Copies of `type` in `deck`: `min`, `max`. |
| `check: pertype` | Copies of each type in `deck`, less `except`: `max`. Type Proxy is never counted as a type. |
| `check: copies` | Copies of one card (below) across `decks`: `max`. A rule with `when` (`{field: regex}` on the plain values, any card of that card matching) wins over one without; between two that both apply, the lower `max`. With `cap: true` the rule's `max` holds every card it applies to, even one with its own `max` or a rule added by a card (BigDeck, Modern: one copy of any card, "up to six" cards and Depths of the Shinomen's Ratlings too). With `titles: n` only n different cards may go past the limit they'd have without this rule; more than that is a problem naming them all, since the check can't tell which ones the player meant (Eternal Victory Dojo). |

Values are compared without HTML and with plain spaces (`<b>Unique</b>` is `Unique`).

**One card, for copy limits:** the title, less a trailing `(...)` (`Hida Kisada (Emperor)` is Hida
Kisada), at its experience level from keywords (`Experienced`, `Experienced 2`, `Inexperienced`). Each
level is its own card. An experienced card titled `Name, epithet` is Name (`Hida Kisada, the Little Bear`
is Hida Kisada Experienced); `Experienced 4 Ginawa` names the card. A `Soul of Name [Experienced n]`
keyword makes the card count as Name at that level.

**Choices** (`choices`): which deck a card goes in, for a deck's owner to set (`pick` in the deck's
field: `{"sensei": "Fate"}`). A pick beats the game config `sort.pick` rules and moves (docs:
game-config.md). Public list counts (Fate/Dynasty counts) follow it too.

## The card field

`deckconstruction` on a card, an object:

| Key | Meaning |
|---|---|
| `max` | This card's copy limit, in place of the rule's; `null` = any number. A `cap` rule's lower `max` still wins (BigDeck and Modern: one copy, period; the user, 2026-10-29). |
| `countsas` | The title this card counts as for copy limits. |
| `skip` | Rule ids this card isn't counted in (e.g. a card that doesn't count toward deck size). |
| `rules` | While this card is in the deck, an overlay on the deck's rules (as a legality's), for cards that change the limits of others. |

E.g. Achirin ("You may include up to six copies") `{"max": 6}`; Lesser Oni `{"max": null}`; Depths of the
Shinomen ("Your deck may include four copies of any non-unique Ratling card")
`{"rules": {"ratling4": {"label": "Ratling (Depths of the Shinomen)", "check": "copies", "when": {"keywords": "^Ratling$"}, "max": 4}}}`.
A Unique Ratling still stops at one: both `when` rules apply to it, and the lower max wins.
Coastal Lane ("Your minimum Dynasty deck size is increased by two") `{"rules": {"dynasty": {"add": {"min": 2}}}}`;
Hato-gurama ("Your minimum Fate deck size is decreased by one") `{"rules": {"fate": {"add": {"min": -1}}}}`: 40 → 42 /
39, BigDeck 80 → 82 / 79, Modern 50 → 52 / 49, Imperial 30 → 32 / 29.
A card's `rules` apply once per copy, so each copy's `add` counts (three Coastal Lanes: Dynasty minimum +6; the
user, 2026-10-29).
Strength Remains ("Your minimum Fate deck size is increased by two") `{"rules": {"fate": {"add": {"min": 2}}}}`.
Forgotten Legacy ("You must have at least 16 Holdings in your deck construction") adds a rule of its own:
`{"rules": {"legacyholdings": {"order": 7, "label": "Holdings (Forgotten Legacy)", "check": "type", "deck": "Dynasty", "type": "Holding", "min": 16}}}`.
It sets a number rather than adding one, so more copies still mean 16. Only Dynasty Holdings count (the user,
2026-10-29), so a Celestial deck's Pre-Game Border Keep and Bamboo Harvesters don't.
Eternal Victory Dojo ("Your deck may include four copies each of one or two non-Unique Strategies with Battle abilities"):
`{"rules": {"battlestrategy4": {"label": "Battle Strategies (Eternal Victory Dojo)", "check": "copies", "when": {"type": "^Strategy$", "text": "Battle(/[A-Za-z]+)?(, :[A-Za-z0-9*]+:)?\\s*:"}, "max": 4, "titles": 2}}}`.
A third title at four is a problem; any number at three is fine. `when` reads the card's own `text` when the check runs
(nothing is stored on the list), and the regex finds a Battle ability's heading (`Battle:`, `Battle/Open:`, `Battle, :g2::`),
so a Strategy that only mentions Battle ("After your Battle action resolves") stays at three. Checked against all 3,370
L5R Strategies, 2026-10-30: it finds all 1,933 with a bold Battle heading but Discovering the Shakuhachi of Air
(Battle/Open only for a Unicorn player), plus The Lesson of Earth, whose heading isn't bold in our data.
