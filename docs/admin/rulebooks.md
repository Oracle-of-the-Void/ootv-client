# Rulebooks (Rules section)

Last updated: 2026-10-20

The **Rules** button in the menubar (the open book) opens the game's rulebook shelf. Clicking a
book opens it in the page viewer:

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
- **Links**: every page has its own address, `#game=l5r,#rulebook=<id>,#page=<n>`; the link
  button copies it. `#game=l5r,#view=rules` is the shelf. Turning pages doesn't add browser
  history, so Back leaves the book. The shelf remembers the last page read in each book (this
  browser only).
- **Downloads**: the original PDF (or whatever the book lists) at the bottom right.

## Where the books live

Everything is on the images bucket, under the game: `https://images.oracleofthevoid.com/<game>/rulebooks/`.

| File | What |
|---|---|
| `index.json` | The shelf: each book's id, title, subtitle, year, arc, page count, in shelf order |
| `<id>/book.json` | One book: each page's size, the table of contents, downloads, whether it has text |
| `<id>/text.json` | The text of each page, for the book's search (the PDF's own text, or OCR) |
| `<id>/<NNN>_select.webp`, `_details.webp`, `_master.webp`, `_zoom.webp` | Each page: thumbnail (300 px), normal (1400 px), large (2400 px) and deep zoom (4800 px) on the long side. `_zoom` is only made when the source is that large: every PDF, but not the Jade photos (2048 px). A rescan or remaster at higher resolution gets it on its next build. |
| `<id>/<id>.pdf` | The download |

A game with no `index.json` shows "No rulebooks yet". Nothing about books is in the site's code,
so adding or changing a book needs no site deploy. The JSON is cached for 5 minutes, images and
PDFs for a day. A rebuilt book's pages keep their file names, so `upload` clears CloudFront's
copies of `<game>/rulebooks/*`, and the viewer asks for each image with `?v=<built>` (the build time
in `book.json` / `index.json`) so browsers don't reuse a day-old page either.

## Adding or changing books

Books are built by `SCRIPTS/rulebook-convert.py` in ootv-import from a per-game list,
`rulebooks/<game>.json`. Each book entry:

```json
{"id": "emperor", "title": "Emperor Edition", "subtitle": "Rulebook", "year": 2012,
 "arc": "Age of Conquest", "pdf": "Rulebook-L5R-Emperor.pdf"}
```

- `id` is the book's address on the site (keep it once links are out there).
- The source is a `pdf`, or a `zip` of page images (taken in file name order).
- `text`: left out, the PDF's own text; `"ocr"` runs tesseract on each page (scans, photos);
  `{"pdf": "<file>"}` takes the text from another PDF with the same pages.
- `toc`: a list of `{"title", "page", "level"}`, or `{"pdf": "<file>"}` to take a PDF's bookmarks.
  `page` is the viewer's page number (the PDF page), not the number printed on the page.
- `downloads`: `[{"file", "label"}]` in place of the default (the source PDF). The first is saved as
  `<id>.<ext>`, later ones as `<id>-<label>.<ext>`.
  The viewer hides the download buttons for now (`rulesdownloads = false` in `rules.js`, since
  2026-10-20); the files are still built and uploaded.
- File paths are relative to the list's `source` folder (`../..` reaches outside it).
- `note`: the book's credit line, e.g. "Oracle of the Void Remaster (Don Eisele)" on the Imperial,
  SCC and Jade remasters. It's published in `book.json`, but the viewer doesn't show it yet. Books from
  kempy's collection and AEG's files have no note until that wording is decided. The shelf has no
  credit line of its own: the list-wide `credit` was dropped on 2026-10-20.
- `source_note`: where the files came from and how they were made, for us. It stays in the list
  and is never published.
- `crop`: `[left, top, right, bottom]` in points from the page's top left (US letter is 612 × 792):
  only that part of every PDF page is shown, e.g. to drop blank margins (Broken Blades). The
  download is still the whole PDF.

Then, from ootv-import:

```bash
SCRIPTS/rulebook-convert.py rulebooks/l5r.json build            # every book, or list ids to rebuild some
SCRIPTS/rulebook-convert.py rulebooks/l5r.json meta             # metadata only (title, note, ...): rewrites built book.json, no rendering
SCRIPTS/rulebook-convert.py rulebooks/l5r.json upload           # shows a dry run, asks, then syncs to S3
```

`build` writes to `build/` (not in git), and rebuilds `index.json` from every built book in the
list's order. `upload` never deletes; to drop a book, remove it from the list, rebuild and upload
(it leaves the shelf), and delete its folder on S3 by hand.

## The L5R books (2026-10-19)

From kempy's rulebook collection (ootv-games `game-l5r/kempy-l5rrules/Rulebooks`):

- **Imperial Edition**: the retypeset remaster (ootv-games `game-l5r/rulebook-enhance/rebuild/pages-01-64.pdf`,
  2026-10-20), with its own text. The contents come from the bookmarks of the old searchable scan
  (same 64 pages); the original color scan is the second download.
- **Scorpion Clan Coup**: the retypeset remaster (ootv-games
  `game-l5r/rulebook-enhance/scc/rebuild/scc-pages-01-71-back.pdf`, 2026-10-20), with its own text: all
  72 pages, so the two-page view shows the printed spreads. Kempy's scan lacks pp. 2-3, 22, 24, 28,
  36-37, 47, 49 and 51; those were set from phone photos of the same booklet (the older `L5RRules` copy
  of `Rulebook-L5R-Imperial_(SCC).pdf`). No contents yet. Kempy's scan is the second download.
- **Jade Edition** (phone photos, from `Rulebook-L5R-Jade.zip`) is two-page spreads with OCR text;
  its download is the text transcription (`Rulebook-L5R-Jade.txt`).
- **Gold Edition**: the publisher PDF shows two-page spreads on a grey mat, so the book is built from
  `game-l5r/rulebook-enhance/gold/rebuild/Rulebook-L5R-Gold_pages.pdf` (2026-10-20): the same PDF cut
  into 88 single pages (cover, inside cover, pp. 1-85, back cover) by ootv-games
  `game-l5r/rulebook-enhance/gold/split_gold.py`. It's a crop only, so the text layer is kept. The
  original is the second download.
- **Diamond Edition**: AEG's web PDF shows two-page spreads in a bamboo frame, so the book is built from
  ootv-games `game-l5r/rulebook-enhance/diamond/rebuild/Rulebook-L5R-Diamond_pages.pdf` (2026-10-20): the
  same PDF cut into 112 single pages (cover, pp. 2-111, back) by `rulebook-enhance/diamond/split_diamond.py`,
  frame and white margins cropped. Crop only, so the text layer is kept. The original is the second download.
- **Samurai Edition** core rules preview: the publisher PDF is mostly two-page spreads, so the book is
  built from `game-l5r/rulebook-enhance/samurai/rebuild/Rulebook-L5R-Samurai_preview_pages.pdf`
  (2026-10-20): the spreads cut down the middle by `rulebook-enhance/samurai/split_samurai.py`, 49
  single pages. Crop only, text kept; the original is the second download.
- The rest are the publisher PDFs with their own text: Spirit Wars, Lotus, Celestial 15, Emperor,
  Twenty Festivals basic and advanced.
- Files we make (remasters, split or cropped PDFs) go in ootv-games `game-l5r/rulebook-enhance/<book>/rebuild/`,
  never into `kempy-l5rrules/`, which stays a copy of kempy's archive.
- Imperial, Jade and Ivory basic have a table of contents so far.

From AEG's file drop (ootv-games `game-l5r/aeg-rulebooks-filedrop/`, the queue of the rest is ootv-import
`rulebooks/QUEUE.md`):

- **Ivory Edition** basic rulebook (2026-10-20): AEG's print file `L5R_IE_BasicRulebook_FIX_v2.pdf` (the
  last full export, 2013-12-18: the same text as the earlier `PRESS` file, with the covers fixed), trimmed
  to its 180 × 252 pt trim box (bleed and crop marks off) by `rulebook-enhance/ivory/trim_press.py` into
  `game-l5r/rulebook-enhance/ivory/rebuild/Rulebook-L5R-Ivory-basic_rulebook.pdf`. Crop only, text kept.
  The contents come from the book's own contents page (viewer page = printed page + 2).
