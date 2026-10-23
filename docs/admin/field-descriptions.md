# Fields: descriptions and settings

Last updated: 2026-10-23

Every card field has a short description of what it holds, so the card editor can say what a
field is for before you fill it in, and **settings** that say how the site uses it: its labels,
how it's searched, and whether it shows at all. Both are kept on the site, not in these docs,
and anyone with permission edits them on **Admin → Fields** (formerly Field descriptions).

## Where they show

- In the [card editor](card-editor.md), hover a field's label: after the card page's long label
  and the field's name comes its description. Labels with a description have a dotted underline.
- In the editor's **Add field** menu, the field picked shows its description under the menu.

## Editing them

**Admin → Fields** lists the fields of the game you're on, card fields first, then
printing (instance) fields: every field already described, the fields in the game's card template
and search form, and the fields of the cards loaded in this session. For a field that's missing,
open a card that has it first, or add it in the editor and come back.

- **This game** (the game's name) or **Shared by every game**: descriptions shared by every game
  are for fields that mean the same everywhere (`title`, `set`, `rarity`, `needsreview`...). A
  game's own description replaces the shared one for that game. In the game's list, a field with
  only a shared description shows it greyed in an empty box. Type in the box to give the game its
  own; clear the box to go back to the shared one.
- **only fields with no description** hides the fields that already have one, game or shared.
- **Save** saves every box you changed at once, descriptions and settings. If someone else saved since you opened the page,
  nothing is saved: copy your text, reload and save again.
- Keep a description to a sentence or two: what the field holds, its form (a list of strings,
  true/false...), and anything easy to get wrong. Say so when a field is old or unused.

## Settings

The **Settings** box holds the field's entry in the game's field list, as JSON. An empty box uses
the shared settings, shown greyed. Change a whole entry, not part of it: what's in the box
replaces the field's settings; clear it to drop them.

- `label`: the long label (card page, search form); `short`: the short one (rows like HR/GC/PH).
- `search`: how the search form searches it, `{"type": "text"}` (or `keyword`, `select`,
  `numeric`, `exists`...) with options such as `advanced`, `clickable`, `reverse`; `false` (or no
  `search`) for a field that isn't searched. `combined` names another card field searched with
  it: L5R and Pathfinder Pawns `title` has `"combined": "alttitle"`, so a title search also finds
  a card by its other name (ootv-claude GAME-TEMPLATES.md §1.7, decision 26). A field is in the
  search form only when the game config's `search` list names it ([Game config](game-config.md)).
- `show`: `"card"` (the default: shown on the card page), `"internal"` (the editor only), or
  `"hidden"`: nowhere. A hidden field has no card page row, no search box, no Table view
  column, and a template can leave it out with `{{if ~fieldshown('<field>')}}` (see
  [Game config and templates](game-config.md)). It's meant for a standard field a game doesn't use,
  such as `rarity` on an LCG: `{"label": "Rarity", "short": "Rarity", "show": "hidden"}` on the
  game's printing `rarity`.
- `role`, `searchkey`: used by the game config and search (`role` is for shared code, e.g. which
  field is a game's faction).

A settings change reaches the site from the next page load.

Saving needs the `fields` permission (or full permission, `*`) on the game; the shared ones need
it on every game (`*`). Each save keeps who changed which description, and from what, in the
item's history (the last 50 saves).

## Behind the scenes

`oracle-all-structure`, `database` = the game's table (`l5r`, `lbs`...) or `all`, `key` =
`fields`: `{fields: {card: {<field>: text}, printing: {<field>: text}}, settings: {card: {<field>:
{...}}, printing: {...}}, version, updated, uname, history}`. Read with the API's `/structure?database=<game>&key=fields`, saved with `/update`
operation `fields` (`docs/API.md`). The full data reference is `docs/data.md`.
