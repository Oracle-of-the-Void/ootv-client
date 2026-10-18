# Set import and import profiles

Last updated: 2026-10-18

**Admin → Set import (this game)** takes a set's spreadsheet to cards on the live site. It replaces
`new-set.py`, `proc.sh`/`parse.jq` and `set-import.py` on the jump box (ootv-import STEPS.md).
**Admin → Import profiles** holds the mapping from spreadsheet columns to card fields.

Both need the `setimport` permission (or `*`) for the game.

## The steps

1. **Setup.** Pick a profile (there's no default), fill in the questions it asks (set name, image stub, Sun and Moon
   code, publisher, ...), and choose the CSV (export the spreadsheet as CSV). Defaults follow the
   other answers: the image stub starts as the set's initials until you type into it. Switching
   profiles keeps your answers and the CSV, so *Pre-Process Cards* can be run with each to compare. Type the
   set name with ordinary spaces; an `&nbsp;` typed there becomes a space, since set names are
   stored with plain spaces. The image stub and Sun and Moon code take only letters, digits, `_`
   and `-`, and other characters are dropped as you type.
2. **Cards.** *Pre-Process Cards* runs the profile over every row in the browser. Every card is
   listed, collapsed. Open one to see its JSON (syntax colored) and the CSV row it came from.
   *View: Card details* shows it the way the Card Details page will instead: a new card on its
   own, a reprint as the live card with the new printing added (and selected), a duplicate as
   the live card at its printing in this set. Images not uploaded yet show as a dashed box.
   *Open in another window* puts the same list in a window of its own, with its own filter and
   search, to keep beside Plan. It follows the page: after each Plan, every row shows what the
   plan does with it (the new card's cardid, the reprint's card and printing number, including
   changes typed in the reprint list).
   Rows with errors (an empty title, a broken transform) are marked; filter to them with *Show*.
   The search box takes a title or a row's file name (`3D_039`, or `_03` for 030-039), the
   names Plan's problems and warnings use.
   Then each row is checked against the live cards (the same matching Plan uses), and marked:
   *new*; *reprint* of a card (marked `Reprint` = 1, or *reprint, not marked*: a live card has the
   same title, experienced level and type, so it's planned as a reprint too); *duplicate* (that
   card already has a printing in this set, so the row is skipped); or *no match* / *several
   matches* for a marked reprint that needs a cardid in Plan's reprint list. Re-running a set
   that's already live shows every row as a duplicate.
   *Download out/* gives the same cards as files that ootv-import's `set-import.py` reads.
3. **The set.** *Check the set* says whether live cards already have the set, how many files
   the image directory holds, where the set sorts, its arc and its Sun and Moon code.
   *Register* adds what's missing: a sort pattern at the position you pick, the set added
   to an arc (or a new arc), and the S&M code. The search Lambdas restart so the pulldowns
   pick it up. Changes go to the `oracle-all-structure` item `<game>/attributes` (and `<game>/snm`).
4. **Images.** *Check the images* lists every file the cards name that isn't uploaded: the masters
   to upload, and any _details/_select missing (re-upload that master).
   *Open the mass image upload* opens the uploader with the stub filled in. Come back with Set
   import afterwards: the import keeps its place.
5. **Plan.** It reads every live card (read-only) and checks everything `set-import.py plan`
   did. New cards get cardids from the live maximum. Each reprint (`Reprint` = 1) is matched to
   the card with the same title and experienced level; the titles a card's printings carry count
   too (an Onyx "Name, Soul of Someone" printing). If that finds nothing, it compares titles
   with punctuation and spaces ignored ("Well-Scouted Target" is "Well Scouted Target"; the
   preview says *punctuation differs*), then tries the title without ", Soul of ..." and, for a
   row marked `Reprint`, the name before the first comma, always of the same type (shown as
   *name*). All of this applies to rows not marked `Reprint` too, apart from the comma rule:
   a spreadsheet with no `Reprint` column at all still finds its reprints. A reprint that still matches nothing lists up to three close titles of the same
   type ("Militia Training Grounds" → 5056 Militia Training Ground). Rows *not* marked
   `Reprint` that share a title and type with a live card are planned as reprints of it (*found*;
   type `new` to keep one new). Duplicates (the card already has this set) are skipped and listed. Every image must be uploaded, the set
   registered, every legality known, every printing given a publisher. A clan or type no live
   card has is a **problem** (usually a typo or a missing profile table entry): fix it, or tick
   *accept* in *New values* if it really is new, and plan again; that list also says whether the
   site's templates mention the value (icons, sorting). New keywords are listed there too, as
   warnings. Other new values (deck, rarity, ...) are
   warnings. Reprints whose printed text differs from their card are listed in *Text
   differences* with a word diff (the card's text isn't changed; errata is done by hand).
   **Problems** block going live; **warnings** are for you to read. Every row file name in
   them (`3D_039.json`) and in the lists below is a link: it opens the preview window on just
   that card, expanded.
   In the reprint list, type a cardid to change a match, `new` to make the row a new card, or
   tick *primary* to show the new printing first. In the new card list, type a cardid to make a
   row a reprint. Then *Plan again*.
6. **Go live.**
   - *Start the export* takes a full table backup (5–10 minutes). It's optional: Apply doesn't
     wait for it, so skip it when the table already has a recent export (one from another bulk
     write today, say). Without either, there's nothing to roll back to.
   - *Apply* (after ticking the confirmation) pauses the search index stream and writes the
     cards. Each new card gets an `op: new` update log entry; each reprint gets `newinstance`.
     Then it writes one update log row for the whole set (the site's "new set" notice) and
     puts the stream back. Writes are conditional, so a card someone edited since the plan
     is skipped as a conflict, never overwritten.
   - *Verify* compares every written card with its copy in search, waits for the stream to
     catch up, and offers to re-send any that differ. *Finish* records the result and restarts
     the search Lambdas.

Closing the tab mid-way is safe. Open the import again from **Earlier imports** at the top
and continue. If an import stops while the stream is paused, the stream is put back after
10 minutes without activity. The import is marked *interrupted* (Apply continues it), and an
alert goes to the phone.

## Import profiles

A profile is JSON. Each game can have several, e.g. one per publisher's spreadsheet layout.
The profile page lists them. **Edit** opens the JSON, and **Test** runs it on the CSV loaded
in Set import. **Save** keeps the last 10 versions, which **history** can view or restore.
**Clone** copies a profile under a new name. The seed for L5R is
`ootv-import/profiles/l5r-onyx.json`, which reproduces `parse.jq` card for card on the 12
Onyx Lives sets (checked with `ootv-import/SCRIPTS/etl-compare.js`).

### Shape

| Key | What it is |
|---|---|
| `params` | The questions at the start: `{name, label, default, required, pattern, type: "int" or "bool", options: "vocab:<field>", clean, help}`. A `bool` question is a checkbox; its answer is `yes` or `no` (`default: true` ticks it), and a rule tests it with `{"params.<name>": true}`. `{{name}}` uses an answer anywhere below. `clean: "text"` turns a typed `&nbsp;` into a space and tidies spaces (set names are stored with plain spaces everywhere); `clean: "id"` keeps only letters, digits, `_` and `-`. `set` is `text`, and `imagehash` and `snm` are `id`, unless the profile says otherwise. |
| `tables` | Named lookup tables for the transforms: a list of `[regex, replacement, flags]`, or an object `{value: replacement}`. |
| `columns` | Column aliases, in order: `{to, from: [alias, ...], do: [...]}`. An alias column that exists replaces `to` (for older spreadsheets with other headers). |
| `rowsteps` | Named steps that change the row before the fields (`l5rflavorsplit`). |
| `fields` | Rules, in order, each setting one field. A later rule can read an earlier one as `card.<field>`. |
| `required` | Card fields (or `printing.<field>`) that must not be empty; an empty one is a row error. |
| `reprintcolumn` | The column that marks reprints with `1` (default `Reprint`). |

### A field rule

```json
{"to": "printing.rarity", "from": "Rarity", "always": true, "do": [{"firstmatch": "rarity"}]}
```

- `to`: a card field, `printing.<field>` (the set's printing), or `$name`, a temporary value
  for later rules and not saved.
- `from`: a CSV column, `$name`, or `card.<field>`. A list reads several sources:
  - `join` (default a space) joins them;
  - `list: true` collects them into one list instead.
  
  A source can be `{"col": "...", "do": [...]}` with its own transforms. `each` applies
  transforms to every source before joining. Empty sources are skipped.
- `value`: a fixed value or template instead of `from`, e.g. `"{{set}}"`, `"{{row}}"` (the row number).
- `do`: the transforms, in order.
- `when` / `unless`: `{source: matcher}`, where the matcher is one of:
  - a string, which must be equal;
  - `true` or `false`, for a `bool` question's answer (`{"params.strongholdback": true}`);
  - `{"test": regex}`;
  - `{"in": [...]}`;
  - `{"empty": true}` or `{"nonempty": true}`.
  
  A list matches when any element does.
- `always: true` sets the field even when the source is empty. Otherwise an empty result
  leaves the field out.
- `as: "string"` stores a plain string. Otherwise the value is a list of strings, as card fields are.

Steps go in `fields` too:

- `{"step": "copytoprinting", "fields": [...], "except": {field: condition}}` copies card
  fields onto the printing.
- `{"step": "images", "name": "{{imagehash}}_{{row|pad:imagedigits}}", "extra": [{"when": ..., "suffix": "b"}]}`
  sets `printing.imagehash` and `printing.image` (`_master`, `_details` and `_select` `.png`): one
  name, plus one more for each `extra` whose condition matches. Strongholds in Ivory, Twenty
  Festivals and Onyx have a back side (`b`); Three Dynasties' don't. So the L5R profiles ask with
  a `bool` question `strongholdback` ("Strongholds have a back image (b)"), and the extra's
  condition is `{"card.type": "Stronghold", "params.strongholdback": true}`.

Two clean-ups in the L5R profiles (`onyx`, `three-dynasties`):

- The `deck` table puts Sensei, Strongholds and Winds in `Pre-Game`.
- Game text ends with `{"replace": "boldfix"}`, which fixes bold tags the spreadsheet left
  unbalanced: a stray `<b>` at the end is dropped (Togashi Hachimon in Three Dynasties), and a
  `</b>` with no `<b>` before it on its line gets one at the start of that line
  (`Courtesy:</b>` → `<b>Courtesy:</b>`, House of Virtues). Empty `<b></b>` pairs are removed.

Template filters: `pad:<n or param>`, `initials`, `lower`, `upper`.

### Transforms

| Transform | Does |
|---|---|
| `trim` | Spaces, `&nbsp` and `<br>` off the start (all of them) and the end |
| `nobrk` | `<br>` becomes a space and `(spc)` becomes `<br>` |
| `nospec` | Curly quotes, dashes and bullets become plain characters and `&#149;` |
| `nodblspc`, `upperfirst`, `lower`, `upper`, `nbsp` | Collapse double spaces, capitalize the first letter, change case, spaces → `&nbsp;` |
| `{"replace": table}` | Every regex replacement in the table, in order (global) |
| `{"sub": table}` | The same, first occurrence only |
| `{"lookup": table}` | Exact match in an object table; a value can be a list (`"Crbrn": ["Crab", "Crane"]`) |
| `{"firstmatch": table}` | The replacement of the first regex that matches (`["", "Fixed"]` catches the rest) |
| `{"split": " "}`, `{"splitre": regex}` | Split into a list |
| `{"index": n}`, `{"join": sep}`, `{"default": value}` | Pick one element, join a list, fill an empty value |
| `{"match": regex}` | The first match |
| `{"wrap": [before, after]}`, `{"prefix": s}`, `{"suffix": s}` | Add text around the value |
| `l5rkeywords` | L5R keyword line → keywords, bold ones kept as `<b>…</b>`. A line break separates keywords, except `Experienced [N]<br>Name` where Name is a live card's name (or the part of its title before a comma): that's one keyword, `Experienced N Name`, as on live cards. The page reads the live names once (admin `titles`) |

A transform on a list applies to each element. When the engine needs a new transform, add it
to `setimport-etl.js` in ootv-client. The profiles just name it.

## Where things are

- The engine is `setimport-etl.js` and the page is `setimport.js` (ootv-client).
- The server is the `ootv-admin` Lambda (ootv-search `admin/`, deployed with `admin/deploy.sh`;
  POST `/setimport`) and ootv-search's `/setimportverify` (the search check).
- Profiles are `oracle-all-structure` items `<game>` / `import/<name>`. Imports are in
  `oracle-all-setimport`: one `meta` row per import, plus a row per card to write.
- Every Plan saves the CSV as it was chosen to
  `s3://reports.oracleofthevoid.com/setimport/<game>/<import id>/<file>` (the import's `csv`
  field gives the path), so an import can be looked into later.
