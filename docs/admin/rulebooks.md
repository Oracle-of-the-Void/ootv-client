# Rulebooks (Rules section)

Last updated: 2026-10-19

The **Rules** button in the menubar (the open book) opens the game's rulebook shelf. Clicking a
book opens it in the page viewer:

- **Turning pages**: the arrow keys, Page Up/Down, Space, Home/End; clicking the left or right
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
so adding or changing a book needs no site deploy: the JSON is cached for 5 minutes, images and
PDFs for a day.

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
- File paths are relative to the list's `source` folder (`../..` reaches outside it).
- `note`: a remark about the source (kept in `book.json`).

Then, from ootv-import:

```bash
SCRIPTS/rulebook-convert.py rulebooks/l5r.json build            # every book, or list ids to rebuild some
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
- **Scorpion Clan Coup** (the `Imperial_(SCC)` file) and **Jade Edition** (phone photos, from
  `Rulebook-L5R-Jade.zip`) are two-page spreads with OCR text; Jade's download is the text
  transcription (`Rulebook-L5R-Jade.txt`).
- The rest are the publisher PDFs with their own text: Spirit Wars, Gold learning set, Diamond,
  Lotus, Samurai preview, Celestial 15, Emperor, Twenty Festivals basic and advanced.
- Only Imperial has a table of contents so far.
