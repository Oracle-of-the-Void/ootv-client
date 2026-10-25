# Game config and templates

Last updated: 2026-10-23

Every game on the site is drawn from three kinds of settings kept on the site (`oracle-all-structure`),
not in the site's code. Each is edited in Admin, previewed on a card before it's saved, and keeps its
history.

| Admin → Config | What it holds | Who can save |
|---|---|---|
| **Fields** | per field: description, labels, how it's searched, whether it shows (`show`) | `fields` permission on the game (shared fields: on every game) |
| **Game config** | this game: name and logo, the card page rows, sort and list headers, views, the search form's order, symbols | `gameconfig` permission on the game |
| **Templates** | the master templates every game shares: one per view (Card Details, Detailed Search, Visual Spoiler, Simple List, Table, the text exports, PDF...), and the shared pieces the views include (the card page's top, middle and bottom, the list +/- controls, the text version button) | site admins (full permission on every game) |

Fields has [its own page](field-descriptions.md). The plan behind all of this is ootv-claude
`GAME-TEMPLATES.md`.

## Game config

**Admin → Config → Game config** shows this game's config as JSON. The main parts:

- `info`: `name`, `nameshort`, `logo`, `imageuri`, `cardsize`, `addallmax`, `description`, and for
  some games `background`, `blurb` (a notice on the card page), `renamedfields`.
- `rows`: the card page's rows (`card`, then `printing` for each version) and the search result's
  (`detail`). A row is `{fields: [...]}` plus options: `label` (default: the fields' short labels
  joined with /; `false` for no label), `sep`/`seps`, `join`/`joins`, `wrap`/`wraps`, `when`
  (`any`, `all`, `always`, a field, or a list of fields), `else` (a row drawn instead when this one
  has nothing), `helper`/`helpers` (`sortlegality`, `makelinks`, `soultitle`), `valuelabels`,
  `suffix`, `prefix`, `concat`, `ddclass`. A field marked `show: "hidden"` on Fields drops out of
  every row by itself.
- `search`: the search form's fields, in order (a field's search settings are on Fields).
- `sort`: `{group, first}` for the deck sort; `headers`: the list headers (`["deck", "type"]`).
- `views`: `{add, remove}` against the standard views (Templates); `default`: the view each place
  starts in.
- `symbols`: `[pattern, html]` pairs, the text tokens drawn as icons (L5R `:g1:`...).
- `discord`: how the Discord bot shows this game's cards: `name` (in replies, e.g. "7th Sea"),
  `color` (`"#b22222"`), `typeline` (fields under the title), `stats` (`[field, label]` pairs on one
  line), `text` (`[field, label or null, unitfield]` blocks), `footer` (`[field, label]` after the
  printing), `paper` (true: the `paper:` option works) and `search` (the bot's field options this
  game takes: set, rarity, type, clan, keywords, text, legality). A game without it isn't offered in
  the bot. The bot picks up a save within 5 minutes; a new game also needs the bot's commands
  registered again (ootv-discord `register-commands.js`).
- `publiclists`: `{fields: [...]}`, the card fields copied into each public list for its search
  (L5R: type, deck, clan; default: type).

**Preview** draws the card whose id is in the box (the card you last opened, by default) with your
edit, as Card Details, a search result and a list, without saving anything. **Save** draws them
again first and refuses an edit they can't draw. Other people see a save from their next page
loads; you see it after a reload.

## Templates

**Admin → Config → Templates** edits the master templates. Pick a **View**: its html (JsRender, the same
`{{...}}` syntax as before) and its settings (`places`: where it's offered, search, card or list;
`longname`, `shortname`, `headerizable`, `override` for the large sizes). **Standard views** are the
ones every game gets unless its config removes one.

**Shared pieces (partials)**, at the bottom of the View list, are parts several views include by
name, e.g. `{{include tmpl="#template-card-top"/}}`:

| Piece | What it is | Included by |
|---|---|---|
| `card-top` | the card page above the game's rows: images, title bar (prev/next, public lists, close, Edit), the text version and needs-review rows | Card Details |
| `card-middle` | between the card rows and the printing rows: rulings, Rules Q&A, Versions | Card Details |
| `card-bottom` | after the printing rows: the active lists' +/- per printing, the latest updates | Card Details |
| `textversion` | the card page's MRP / Printed text row | `card-top` |
| `textversionbutton` | the MRP / Printed text button itself (also the one on search and list pages) | `textversion`, the page |
| `decklistcontrols` | a list's count and +/- under each card | Detailed Search, Visual Spoiler |

A piece has its html and a `note` (what it is). Preview draws it in every view that includes it.

- **Preview** draws the card in the view you're on; **Changes against the saved version** shows the
  lines you changed, and the line above the editor names every view you've changed.
- **Save** saves every view you changed together. It first compiles every view and draws the
  preview card in each; any error and nothing is saved.
- `{{:~gamerows(#data,'card')}}` draws the game's rows (Game config). `{{if ~fieldshown('rarity')}}`
  is false for a field the game hides (Fields, `show: "hidden"`). `{{:~foilmark(foil)}}` draws a
  printing's foil mark (`✦ Foil` for `"foil"`, `✦ Also foil` for `"both"`, nothing otherwise; a second
  argument `true` adds the words); `~foilof(printing, printingid)` gives one printing's `foil` for the
  list and visual views. The card page (Versions buttons, image, each printing's Foil row), search
  and list views use them, so every game shows foils without a row in its own config.

**If a template breaks anyway** (one that only fails on some cards), the site falls back to the
newest earlier version of that view that works, from the history (with that version's shared
pieces), and site admins see a note above
the view ("Template search v12 failed (...): using v11"). Fix it here; the note goes once the
broken version is replaced.

## History

Each save keeps who saved, when and what changed, for the last 50 saves; the newest keep the whole
earlier version too, and **load vN into the editor** brings one back (then Save makes it current).
**Back to the saved version** drops your edits. If someone else saved since you opened the page,
nothing is saved: copy your edit, reload and save again.

## Behind the scenes

`oracle-all-structure` items `<game>/game`, `all/templates`, and `<game>/fields` / `all/fields`
(`settings`), read together through `/gameconfig?database=<game>`, saved with `/update` operations
`gameconfig`, `templates` and `fields` (`docs/API.md`). `docs/gameconfig/push.py` pulls and pushes
the same items as files, for bulk edits.
