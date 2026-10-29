# Deck construction rules

Last updated: 2026-10-29 (Imperial and BigDeck overlays; red summary note)

A soft check of a deck as a whole: deck sizes, copy limits, Pre-Game limits. The result shows in the
deck's statistics block under "All cards legal for" ("Deck construction: ..."). Nothing is blocked; a
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

A broken rule shows in red on the Deck construction line, and the stats summary ("86 cards (49 distinct)")
adds a red note when the deck breaks its rules or has cards not legal in its chosen Legality
(`liststatsflag()`), so it shows with the statistics folded too.

The check's answer is also saved on the list (`summary.buildbad`, with the copies per deck) whenever the owner
opens it (`listsummarysave()`): the directory's Count and the public deck listing show a red Illegal from it.
A deck its owner hasn't opened since 2026-10-29, or opened before a rule change, keeps the older answer.

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
    "BigDeck":  {"fate": {"min": 100}, "dynasty": {"min": 100}, "copies": {"max": 1}}
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
| `check: copies` | Copies of one card (below) across `decks`: `max`. A rule with `when` (`{field: regex}` on the plain values, any card of that card matching) wins over one without; between two that both apply, the lower `max`. |

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
| `max` | This card's copy limit, in place of the rule's, in every legality (BigDeck's one copy too: the user, 2026-10-29); `null` = any number. |
| `countsas` | The title this card counts as for copy limits. |
| `skip` | Rule ids this card isn't counted in (e.g. a card that doesn't count toward deck size). |
| `rules` | While this card is in the deck, an overlay on the deck's rules (as a legality's), for cards that change the limits of others. |

E.g. Achirin ("You may include up to six copies") `{"max": 6}`; Lesser Oni `{"max": null}`; Depths of the
Shinomen ("Your deck may include four copies of any non-unique Ratling card")
`{"rules": {"ratling4": {"label": "Ratling (Depths of the Shinomen)", "check": "copies", "when": {"keywords": "^Ratling$"}, "max": 4}}}`.
A Unique Ratling still stops at one: both `when` rules apply to it, and the lower max wins.
