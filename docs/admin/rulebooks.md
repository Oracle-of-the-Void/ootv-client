# Bookshelf (rulebooks, newsletters)

Last updated: 2026-10-23

The **Bookshelf** button in the menubar (the open book; the Rules section until 2026-10-23) opens the
game's shelves of books, a tab each when there's more than one: **Rulebooks** (every game) and, for
L5R, **Newsletters** (the Imperial Herald, since 2026-10-23). Each shelf lists its books oldest first
(by year). Above them, the shelf's own filters narrow it by **Type** (one at a time), **Tags** (every
tag picked must be on the book) and **Arc**; each offers only the values some book on that shelf has,
and the choice is remembered in this browser, per game and shelf. The shelf last shown is remembered
too; `#game=l5r,#shelf=<key>` links to one. Each book shows its tags (and its type, unless Complete) under its title.
Clicking a book opens it in the page viewer:

- **Turning pages**: the arrow keys, Page Up/Down, Space, Home/End; the mouse wheel or a
  two-finger trackpad scroll (one page per notch or swipe; zoomed in, these scroll the page
  instead, as do the up/down arrows and Space); clicking the left or right
  side of the page; swiping on a phone; the page box and the slider at the bottom (dragging the
  slider shows each page's thumbnail as you go).
- **Two pages side by side** when the window is wide enough and the book's pages are portrait
  (page 1 is the cover, then 2-3, 4-5, ...). The columns button turns it off or on (remembered in
  this browser). Books scanned as two-page spreads always show one image at a time.
- **Zoom**: the − and + buttons (the percentage between them goes back to fit), the + − 0 keys,
  Ctrl+mouse wheel or a trackpad pinch, pinching on a phone, or a double-click / double-tap (2.5x
  there, or back to fit). Zoomed in, drag the page with the mouse or a finger (or scroll); Esc fits
  it again. Turning the page keeps the zoom, from the page's top left. Up to 800%. Zoomed pages
  switch to the larger images as needed (2400 px, then 4800 px where the book has them).
- **Full screen**: the corner button or F. The reader covers the window, and the browser goes full
  screen where it can (iPhones only allow that for video, so there it just covers the page). Esc or
  the button again leaves it.
- **Contents** (only books with a table of contents), **Pages** (thumbnails) and **Search**
  (books with text) open in a panel on the left.
- **Selecting and copying text** (books with text): the T button (or the T key) turns on select
  mode. Then dragging selects text on the page instead of turning or dragging it (on a phone,
  long-press to select), and Ctrl+C / Copy copies it as plain text: lines joined into
  paragraphs, words broken across lines by a hyphen joined again. T again goes back to turning
  pages. The browser's own find (Ctrl+F) finds words on the pages shown, in either mode. The
  words are invisible text laid over the page image, from `lines/<NNN>.json`, so a scan's copy is
  only as good as its OCR.
- **Copy page text** (books with text): the copy button (or the C key) copies the whole text of the
  page shown, or both pages of a two-page spread, joined the same way. A line that ends early
  (a heading, a list item, a paragraph's end) keeps its line break; text wrapping around a
  picture is joined back into its paragraph.
- **Search** marks the words searched for on the pages shown, while the search panel is open.
- **Links**: every page has its own address, `#game=l5r,#rulebook=<id>,#page=<n>`; the link
  button copies it. With text selected (select mode), the link button copies a link to that
  text instead. A link can point at a place on the page, which opens zoomed to the page's
  width, scrolled to it and marked:
  - `#page=<n>,#find=<words>`: the first place on the page with these words (letters and
    digits only count, so spaces, line breaks, hyphens and punctuation don't matter). Without
    `#page`, the first page of the book that has them. Links copied from a selection use its
    first dozen words.
  - `#page=<n>,#line=<n>`: the page's nth line of text, in its reading order (on two-column
    pages, usually down one column then the next).
  - `#page=<n>,#at=<percent>`: that far down the page (`#at=40`), for pages with no text.

  `#find` survives a rebuilt book best; line numbers can shift when the text changes. Turning
  the page drops the place. `#game=l5r,#view=rules` is the shelf. Turning pages doesn't add
  browser history, so Back leaves the book. The shelf remembers the last page read in each book
  (this browser only).
- **Downloads**: the original PDF (or whatever the book lists) at the bottom right.

## Trait links

In Card Details, traits with rules (Cavalry, Kharmic, Shugenja, ...) lead to where the rulebooks
define them. A trait in the **Keywords** gets a book (📖) after it, and the first time the **Text**
names a trait it gets a dotted underline. Hovering either one (or the keyword) shows the rule's text
from each of the trait's books (a long rule is whole only for the printing's own book, and cut to a few
sentences for the others, so the popup fits the screen; the click and the long-press show them all whole); clicking the book or the underlined word opens the book at the
definition, marked (a `#find` link). When the trait has more than one book, the click shows them all
with their text instead, to pick one. A keyword's number doesn't matter (Experienced 2 and Yu 3 link to
Experienced and Yu), and a trait inside a name (Utaku Yu-Pan) isn't marked. Fan-made books (shelf tag
**Fan Made**, e.g. the Onyx Lives datasheets) carry a **Fan Made** mark after their title, so AEG's rules
and the fan rules that changed them can be told apart. The book for the printing shown carries a highlighted **this printing** mark, so the rules
of the edition in hand stand out from the other books listed. On a phone or tablet, a long-press on the trait (or its keyword)
shows the same text in a panel with a large **Open page** button per book and **Close** (tapping
outside it closes it too); a plain tap works as a click.

A trait's books on a card, each shown once, in shelf order:

- the edition of **the printing shown**: its legality (arc and edition), and the arc its set was printed
  in → that edition's book;
- **the newest book** that defines the trait;
- when that newest book is fan-made (the Onyx Lives datasheets changed several rules: Sincerity, Yu),
  also **the newest AEG book** that defines it, so the original rule shows beside the fan one;
- for **each arc bug the card has** (its legalities, and the arc each of its printings' sets was printed
  in), that edition's book.

The printed arc counts even where legality leaves it out, so the rules of the arc a card was printed in
always show: a card banned from an arc (Moto Chagatai, banned from Samurai Edition but reprinted in
Samurai Edition Banzai), and printings that have no legality (the 1,000 Years of Darkness KYD cards). The
set → arc map is `sets` in the traits item (below); Celestial Edition 15th Anniversary, the proxies,
Siege: Heart of Darkness and Oracle of the Void are left out on purpose, so they still go by legality only.
Legality itself isn't changed.

An edition's book is the first of its books (below) that defines the trait; its "Last complete rules in
arc" book comes first where there is one (Scorpion Clan Coup before Imperial, The Spirit Wars before
Jade). Onyx Edition and Shattered Empire go to Onyx Lives' Onyx/ShE Rules Datasheet, then AEG's 20F
Comprehensive Rules it builds on; Three Dynasties to the Three Dynasties Rules Datasheet, then those two.
Words that older books use for something else (Honor, Duty, Elite) only link to the Onyx Lives sheets.

The links come from the `oracle-all-structure` item `<game>` / `traits` (public
`/structure?database=<game>&key=traits`; a game without one shows no trait links), which ootv-import
`SCRIPTS/rulebook-traits.py` builds from `rulebooks/<game>-traits.json`:

- `books`: the pages of each book to look in (its glossary and keyword sections), with two layout hints
  for glossaries whose entries have no gap between them;
- `editions`: each legality → its books, the one to prefer first;
- `sets`: each set (as `printing.set` has it) → the arc it was released in (in the config: arc → its sets);
- `traits`: the traits to look for.

The script reads the books' live `lines/` text and finds, in each book, the first glossary entry for
each trait ("Cavalry: A unit ...", small caps "C avalry :", a heading "Cavalry" or "The Yu Trait" with the text under it,
"Shadowlands card A card ...").
The item holds, per trait and book, the page, the `#find` phrase (the entry's first line) and up to
420 characters of the definition for the hover text. A trait that a book only explains in its main
text (not a glossary entry) is linked to it only when the JSON's `places` names the page and the words
its sentence starts with; the definition is that sentence and the rest of its paragraph. Since 2026-10-22
these cover Cavalry (Samurai Edition, Celestial), Unique (Imperial, Scorpion Clan Coup, Jade, The Spirit
Wars), Experienced (Scorpion Clan Coup, Jade, The Spirit Wars, Gold, Diamond), Naval, Shadowlands and Yu
(Diamond), found by a sweep of the rules keywords on many cards in an arc against that arc's books. The
keywords still unlinked for some arcs (Nonhuman, Political, Courtier, Samurai...) are ones those books
give no rule for. The top-level `hover` keeps a trait's whole rule in every book (Yu: 1200 characters). After changing the JSON or rebuilding a
book, run it again:

```
python3 SCRIPTS/rulebook-traits.py rulebooks/l5r-traits.json            # writes build-traits/l5r-traits.json, prints what it found
python3 SCRIPTS/rulebook-traits.py rulebooks/l5r-traits.json --upload   # and puts the structure item
```

The site reads the item when Card Details first opens, so a change needs no deploy (only a reload).
Floor rules and Special books (War of Honor) aren't searched. AEG's addenda mostly aren't either, except
the three that define traits (2026-10-22): Broken Blades (Yu, under Four Winds), The New Order (Courtesy,
Invest, Unstoppable, under Ivory Edition, first) and The Blackest Storm (Sincerity, under Twenty
Festivals, first). The Onyx Lives datasheets are searched (2026-10-21). Two per-book options in the JSON
help with rulesheets: `narrow` (a heading over a narrow column, whose first line looks like a heading
too) and `hover` (keep more than 420 characters, where the rule comes after an introduction); `stop` ends
a definition at a heading the layout hints miss (the Onyx datasheet's "Boldface Keywords"). The datasheets list their keywords as "● Cavalry - ..." and "Courage Rulebook ability"
sections; the 20F Comprehensive Rules lost its fi/ff/fl ligatures from its text, which the script puts
back in the hover text from the other books' words.

## Shelves

The shelves are listed by the `oracle-all-structure` item `<game>` / `bookshelf` (public
`/structure?database=<game>&key=bookshelf`), in tab order:

```json
{"shelves": [
  {"key": "rulebooks", "title": "Rulebooks", "types": ["Complete", "Addendum", "Special", "Play Variant", "Multi-Arc"],
   "plaintypes": ["Complete"], "help": "rules#shelf"},
  {"key": "newsletters", "title": "Newsletters", "types": ["Imperial Herald", "Inserts"], "plaintypes": ["Imperial Herald"],
   "help": "rules#newsletters"}]}
```

- `key`: the structure item holding the shelf's books (`<game>` / `rulebooks`, `<game>` / `newsletters`).
- `types`: the order of the shelf's types on its filter bar (others follow); `plaintypes`: types not
  marked on each book (Complete on Rulebooks; every newsletter is an Imperial Herald so far).
- `help`: the Help section its **?** opens.

A game without a `bookshelf` item has the Rulebooks shelf only (as above), and a shelf with no books
has no tab. Adding a shelf: create its item with the first book (`upload --new-shelf`, below), then add it
to `bookshelf`; both are read when the Bookshelf first opens, so neither needs a site deploy.

**Book ids are unique across a game's shelves.** Every shelf's books share `<game>/rulebooks/<id>/` on the
images bucket and the `#rulebook=<id>` links (so ruling and trait links work for any shelf), and `upload`
refuses an id another shelf has. Closing a book goes back to the shelf it's on.

### Newsletters

The **Imperial Herald**, AEG's fan club magazine (ootv-games `game-l5r/imperial-herald/`, from the Internet
Archive; its README), list `rulebooks/l5r-newsletters.json` in ootv-import: 55 issues, ids
`imperial-herald-01`…`17` (the first series, 1995–2000: Vol. 1 #1–4, Vol. 2 #1–3 = issues 5–7, then issues
8–17), `imperial-herald-v2-01`…`25` (2001–2009), `imperial-herald-v3-01`…`10` (2009–2012) and three 2013–14
special editions. Type `Imperial Herald`; tags `Vol. 1` (the whole first series, issues 1–17, though 5–7 were
printed as Vol. 2 #1–3), `Vol. 2`, `Vol. 3`, `Special Edition`, and `Rulings` on the issues with FAQ Q&A,
accumulated rulings or errata (1, 3–17 and Vol. 2 #4; the user, 2026-10-23); the books come from `searchable/` (the scans with an OCR text layer),
so the text is uncorrected OCR. Years come from each issue's text (dates, copyright lines), not a cover date.
Vol. 3 #3 is the 16-page scan, with the 5-page digital file as a second download.
Two **Inserts** (type `Inserts`) came with the same archive: Heroes of Rokugan and Tales of Rokugan (ids
`heroes-of-rokugan`, `tales-of-rokugan`; year 2000 estimated from the story they tell; the user, 2026-10-23).

## Where the books live

**Each shelf** is the structure item named by its `key`; the Rulebooks shelf is the `oracle-all-structure` item `<game>` / `rulebooks` (read through the public
`/structure?database=<game>&key=rulebooks`): `books` is a map from each book's id to its title,
subtitle, year, arc, type, tags, note, page count, cover size, build time and `order` (its place in
the list below). The shelf shows the books by date: by `year`, and within a year in list order (since
2026-10-21; before that, list order only), so a book added at the end of the list still lands among its year's. `upload` writes only the entries of the books it's given, so sessions working
on different books, each with its own build folder, can't drop or revert each other's books. (Until
2026-10-20 the shelf was an `index.json` on the bucket, rebuilt from whatever books the uploading
checkout had built; ootv-claude `DEPRECATED.md`.)

Everything else is on the images bucket, under the game: `https://images.oracleofthevoid.com/<game>/rulebooks/`.

| File | What |
|---|---|
| `<id>/book.json` | One book: each page's size, the table of contents, downloads, whether it has text |
| `<id>/text.json` | The text of each page, for the book's search (the PDF's own text, or OCR) |
| `<id>/lines/<NNN>.json` | Each page's words and where they are on it, for selecting and copying, `#find` and `#line` links: `[[block, [[x0, y0, x1, y1, word], ...]], ...]`, a line per entry in reading order, boxes in 1/10000ths of the page from its top left (`pdftotext -bbox-layout`, or tesseract's word boxes). `book.json` has `lines: true` when the book has them |
| `<id>/<NNN>_select.webp`, `_details.webp`, `_master.webp`, `_zoom.webp` | Each page: thumbnail (300 px), normal (1400 px), large (2400 px) and deep zoom (4800 px) on the long side. `_zoom` is only made when the source is that large: every PDF, but not the Jade photos (2048 px). A rescan or remaster at higher resolution gets it on its next build. |
| `<id>/<id>.pdf` | The download |

A game with no `rulebooks` item shows "No rulebooks yet". Nothing about books is in the site's code,
so adding or changing a book needs no site deploy. The book JSON is cached for 5 minutes, images and
PDFs for a day. A rebuilt book's pages keep their file names, so `upload` clears CloudFront's
copies of `<game>/rulebooks/<id>/*`, and the viewer asks for each image with `?v=<built>` (the build
time in `book.json` and the shelf) so browsers don't reuse a day-old page either.

## Adding or changing books

Books are built by `SCRIPTS/rulebook-convert.py` in ootv-import from a per-game list per shelf:
`rulebooks/<game>.json` for Rulebooks, and a list with `"shelf": "<key>"` for any other shelf
(`rulebooks/l5r-newsletters.json`, `"shelf": "newsletters"`). Each book entry:

```json
{"id": "emperor", "title": "Emperor Edition", "subtitle": "Rulebook", "year": 2012,
 "arc": "Age of Conquest (Emperor)", "type": "Complete", "tags": ["Base set", "Last complete rules in arc"],
 "pdf": "Rulebook-L5R-Emperor.pdf"}
```

- `id` is the book's address on the site (keep it once links are out there).
- The source is a `pdf`, or a `zip` of page images (taken in file name order).
- `text`: left out, the PDF's own text; `"ocr"` runs tesseract on each page (scans, photos, and
  browser prints whose text layer is gibberish); `{"pdf": "<file>"}` takes the text from another PDF
  with the same pages. `ocr_psm` sets tesseract's page segmentation mode (default 3); 4 (one column)
  fixed the 2000 Text Change & Errata List, where 3 dropped the first letter of some lines.
- `toc`: a list of `{"title", "page", "level"}`, or `{"pdf": "<file>"}` to take a PDF's bookmarks.
  `page` is the viewer's page number (the PDF page), not the number printed on the page.
- `downloads`: `[{"file", "label"}]` in place of the default (the source PDF). The first is saved as
  `<id>.<ext>`, later ones as `<id>-<label>.<ext>`.
  The viewer hides the download buttons for now (`rulesdownloads = false` in `rules.js`, since
  2026-10-20); the files are still built and uploaded.
- File paths are relative to the list's `source` folder (`../..` reaches outside it).
- `note`: the book's credit line, e.g. "Oracle of the Void Remaster (Don Eisele)" on the Imperial,
  SCC, Jade and Pearl remasters. It's published in `book.json` and the shelf; the viewer shows it under
  the book on the shelf and in the reader's bottom bar. The books themselves are AEG's, WotC's
  or FRPG's; kempy only collected them from various websites, so a note credits whoever substantively
  built, scanned or remastered the file, and only once we can find that person. Today only our
  remasters have one. The shelf has no
  credit line of its own: the list-wide `credit` was dropped on 2026-10-20.
- `arc`, `type` and `tags` drive the shelf's filters (the text is shown as written, so keep the
  spelling the same across books):
  - `arc`: the arc the book belongs to, named as the card legalities name it, with the edition people
    call it by in parentheses (`Hidden Emperor (Jade)`, `A Brother's Destiny (Twenty Festivals)`; since
    2026-10-22), or `Multi-Arc` for formats played with cards from many arcs
    (Legacy, Modern, Obsidian Hand, Samurai Extended, EternaL5R, ...; their type is `Multi-Arc` too, or a
    list with it, e.g. `["Rulings", "Multi-Arc"]` for a format's FAQ). Multi-Arc books come last on
    the shelf (by year among themselves), and so does Multi-Arc in the Arc filter (2026-10-22).
  - `type`: `Complete` (the whole rules of its day, basic and advanced rulebooks included),
    `Learn to Play` (a short intro to the rules, like The Currency of War), `Addendum` (changes on
    top of a complete book, like the Broken Blades rulesheet and other expansion rulesheets) or
    `Special` (rules for one format of its own, like Bushi) or
    `Play Variant` (another way to play the game: War of Honor, booster draft, sealed deck, Suicide,
    Siege, multiplayer, solitaire, 2-vs-1, koku ante; since 2026-10-22) or `Multi-Arc` (a format played
    with cards from many arcs: Legacy, Modern, Obsidian Hand, EternaL5R, Big Deck, ...; these books also
    have the arc `Multi-Arc`, below; since 2026-10-22) or
    `Floor Rules` (tournament floor rules, e.g. kempy's `Tournament/` folder) or `Rulings` (the old
    FAQs, accumulated rulings and rules archives, errata lists included; their rulings are also on the
    cards, `rulings.md`). The filter
    bar lists Complete, Addendum, Special, Play Variant and Multi-Arc first (`RULESTYPES` in `rules.js`), then any other type.
    A book that is more than one takes a list, e.g. `"type": ["Complete", "Rulings"]` for the Samurai
    Edition Comprehensive Rules (complete rules with card rulings): it shows under each type's filter.
  - `tags`: `Base set` (the rulebook of an arc's base set) and `Last complete rules in arc` (the
    latest Complete book of its arc, the one to play that arc by), and `Fan Made` (not published
    by AEG, e.g. the War of Honor update to Ivory Edition rules). A book can have any of them, or
    none. A new tag needs no site change: it shows up on the filter bar once a book has it.
    When a later Complete book joins an arc, move `Last complete rules in arc` to it.
- `source_note`: where the files came from and how they were made, for us. It stays in the list
  and is never published.
- `crop`: `[left, top, right, bottom]` in points from the page's top left (US letter is 612 × 792):
  only that part of every PDF page is shown, e.g. to drop blank margins (Broken Blades). The
  download is still the whole PDF.

Then, from ootv-import:

```bash
SCRIPTS/rulebook-convert.py rulebooks/l5r.json build            # every book, or list ids to rebuild some
SCRIPTS/rulebook-convert.py rulebooks/l5r.json meta jade        # metadata only (title, note, ...): rewrites built book.json, no rendering
SCRIPTS/rulebook-convert.py rulebooks/l5r.json lines jade --out build-lines   # word boxes only, for a book already live (below)
SCRIPTS/rulebook-convert.py rulebooks/l5r.json upload jade      # those books only: dry run, asks, syncs to S3, sets their shelf entries
SCRIPTS/rulebook-convert.py rulebooks/l5r.json remove jade      # takes a book off the shelf
```

`build` writes to `build/` (not in git). Building from a scratch worktree (the usual way, on a branch: the
list's relative `source` path doesn't reach from there), pass the source folder: `build pearl --source
<workspace>/ootv-games/game-l5r/kempy-l5rrules/Rulebooks`. A remaster whose full-quality join is very large (Pearl,
169 MB of art) renders its pages from that file but lists a smaller copy as the download (ghostscript `pdfwrite`
with JPEG at quality 90 and no downsampling: same resolution, 12 MB). After an upload, check `book.json`, a page
image and the download over HTTPS, then merge the list change so `main` holds the live shelf order. `upload` needs the book ids, and syncs and shelves only
those, from this checkout's builds, and refuses a book whose shelf entry has a later build time than this
checkout's copy (another session rebuilt it since; rebuild here, or `--force`). It never deletes. A change to a book's place in the list reaches
the shelf when that book is next uploaded (`meta <id>` then `upload <id>` is enough). To drop a book,
`remove` it, take it out of the list, and delete its folder on S3 by hand.

`build` writes `lines/` along with the rest. `lines` is for books built before it did (before
2026-10-20): it takes each book's live `book.json`, writes it with `lines: true` and `lines/` to
`--out`, and `upload <id> --out build-lines` then sends only those (the page images aren't
touched). Give it a folder without other builds of the book: it refuses one holding a
different build's page images. OCR'd books are OCR'd again from their live `_master` pages.

## The L5R books (2026-10-19)

From kempy's rulebook collection (ootv-games `game-l5r/kempy-l5rrules/Rulebooks`):

- **Imperial Edition**: the retypeset remaster (ootv-games `game-l5r/rulebook-enhance/imperial/rebuild/pages-01-64.pdf`,
  2026-10-20), with its own text. The contents come from the bookmarks of the old searchable scan
  (same 64 pages); the original color scan is the second download.
- **Scorpion Clan Coup**: the retypeset remaster (ootv-games
  `game-l5r/rulebook-enhance/scc/rebuild/scc-pages-01-71-back.pdf`, 2026-10-20), with its own text: all
  72 pages, so the two-page view shows the printed spreads. Kempy's scan lacks pp. 2-3, 22, 24, 28,
  36-37, 47, 49 and 51; those were set from phone photos of the same booklet (the older `L5RRules` copy
  of `Rulebook-L5R-Imperial_(SCC).pdf`). No contents yet. Kempy's scan is the second download.
- **Jade Edition**: the retypeset remaster (ootv-games
  `game-l5r/rulebook-enhance/jade/rebuild/jade-pages-01-71-back.pdf`, 2026-10-20), from phone photos of every
  spread (`Rulebook-L5R-Jade.zip`), with its own text and contents. Downloads: the PDF, the original photos and
  the text transcription (`Rulebook-L5R-Jade.txt`).
- **Pearl Edition**: the retypeset remaster (ootv-games `game-l5r/rulebook-enhance/pearl/rebuild/`, 2026-10-21),
  from kempy's phone photos of every spread (`Trashcan/Rulebook-L5R-PE-rulebook.zip`, the only copy): all 88
  pages, cover to the Turn Sequence back cover, the art the photos' own. The contents follow the printed table
  of contents. The pages render from the full-quality join (`pearl-pages-01-88.pdf`, 169 MB); the PDF download is
  the same pages with JPEG images (`pearl-rulebook.pdf`, 12 MB). The original photos zip is the second download.
- **Gold Edition**: the publisher PDF shows two-page spreads on a grey mat, so the book is built from
  `game-l5r/rulebook-enhance/gold/rebuild/Rulebook-L5R-Gold_pages.pdf` (2026-10-20): the same PDF cut
  into 88 single pages (cover, inside cover, pp. 1-85, back cover) by ootv-games
  `game-l5r/rulebook-enhance/gold/split_gold.py`. It's a crop only, so the text layer is kept. The
  original is the second download.
- **Diamond Edition**: AEG's web PDF shows two-page spreads in a bamboo frame, so the book is built from
  ootv-games `game-l5r/rulebook-enhance/diamond/rebuild/Rulebook-L5R-Diamond_pages.pdf` (2026-10-20): the
  same PDF cut into 112 single pages (cover, pp. 2-111, back) by `rulebook-enhance/diamond/split_diamond.py`,
  frame and white margins cropped. Crop only, so the text layer is kept. The original is the second download.
  The cover is rebuilt (`rebuild/diamond-cover.png`): the PDF's is a 47 dpi image, so it's a photo of the printed
  booklet registered onto it and cropped to the printed trim. The strip the photo's stand hid is the PDF image
  sharpened by Qwen, except the medallion, which is the PDF's own. Steps in `rulebook-enhance/diamond/cover/`.
- **Samurai Edition** core rules preview: the publisher PDF is mostly two-page spreads, so the book is
  built from `game-l5r/rulebook-enhance/samurai/rebuild/Rulebook-L5R-Samurai_preview_pages.pdf`
  (2026-10-20): the spreads cut down the middle by `rulebook-enhance/samurai/split_samurai.py`, 49
  single pages. Crop only, text kept; the original is the second download.
- The rest are the publisher PDFs with their own text: Spirit Wars, Lotus, Celestial 15, Emperor.
- Files we make (remasters, split or cropped PDFs) go in ootv-games `game-l5r/rulebook-enhance/<book>/rebuild/`,
  never into `kempy-l5rrules/`, which stays a copy of kempy's archive.
- Imperial, Jade, Pearl and Ivory basic have a table of contents so far.

From AEG's file drop (ootv-games `game-l5r/aeg-rulebooks-filedrop/`, the queue of the rest is ootv-import
`rulebooks/QUEUE.md`):

- **Ivory Edition** basic rulebook (2026-10-20): AEG's print file `L5R_IE_BasicRulebook_FIX_v2.pdf` (the
  last full export, 2013-12-18: the same text as the earlier `PRESS` file, with the covers fixed), trimmed
  to its 180 × 252 pt trim box (bleed and crop marks off) by `rulebook-enhance/ivory/trim_press.py` into
  `game-l5r/rulebook-enhance/ivory/rebuild/Rulebook-L5R-Ivory-basic_rulebook.pdf`. Crop only, text kept.
  The contents come from the book's own contents page (viewer page = printed page + 2).
- **Ivory Edition** advanced rulebook (2026-10-20): AEG's print file `L5R_IE_AdvRulebook_PRESS.pdf` with its
  cover replaced by the later fix `L5R_IE_AdvRulebook_FIX_01.pdf` (`trim_press.py --fix 1=...`), trimmed the
  same way into `game-l5r/rulebook-enhance/ivory/rebuild/Rulebook-L5R-Ivory-adv_rulebook.pdf`. 56 pages, no
  contents page. Kempy's 111-page copy is this book followed by the same text in another layout.
- **Twenty Festivals** basic and advanced rulebooks (2026-10-20): AEG's print files
  `press/Twenty_Festivals/Packaging/Rulebooks/L5R_TF_BasicRulebook_PRESS.pdf` and `L5R_TF_AdvRulebook_PRESS.pdf`
  (2014-09-09), trimmed by `trim_press.py` into `game-l5r/rulebook-enhance/twenty-festivals/rebuild/`. 76 and
  60 pages, no contents. Kempy's copies are the same exports run through a PDF optimizer (images cut to
  150 ppi, pages cropped inside the trim), so they aren't offered as downloads.
- **War of Honor** (2011, 2026-10-20): AEG's print file `WoH rulebook_Final.pdf` (2011-02-18) trimmed by
  `trim_press.py`, then its reader spreads cut into single pages by `rulebook-enhance/war-of-honor/split_woh.py`:
  48 pages. Kempy's earlier export (2011-01-06, with deck lists after the back cover) is the second download.
- **The Currency of War** learn-to-play rulebook and the **Siege: Clan War** booklet (2026-10-20): print files,
  trimmed by `trim_press.py` into `rulebook-enhance/currency-of-war/` and `siege-clan-war/`. Kempy's copies
  (TCoW at 150 ppi without its inside covers, Siege three photos) aren't offered.
- **Rulesheets**, one book each like Broken Blades (2026-10-20): Before the Dawn (print file as is) and, trimmed
  into `rulebook-enhance/ivory-rulesheets/`, the Ivory Booster Draft sheet (one landscape page; kempy's wiki
  printout of the same rules is the second download), The New Order, Thunderous Acclaim, Evil Portents and The
  Blackest Storm.
- None of the file drop books has a credit `note`. Each one went live only after a check-off.
