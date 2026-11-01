# Artist entries

Last updated: 2026-10-24

Clicking an artist credit on a card opens a small box: **Search cards by** the artist, then the
artist's own pages (portfolio, gallery, social media) and a note. Those pages and notes are the
**artist entries**, one per credit, shared by every game: the same person credited in L5R and 7th
Sea has one entry. They're kept in the table `oracle-all-artists` and edited on **Admin → Data → Artists**.

## The page

**Admin → Data → Artists** lists every entry: the credit, its links (or the credit it's an alias of) and
its note. Type in the filter to narrow it by name, link or note; the menu beside it picks out:

- **Waiting for review**: credits with a possible match nobody has confirmed yet (their note says
  so, and the cards carry a needs-review note tagged `(artist-links, 2026-10-23)`). Answer them here:
  add the links, or change the note to say there's no match.
- **No links, not an alias**: credits we found nothing for.
- **Aliases**: credits that are the same person as another credit.
- **Not an alias**: every main entry, the ones that hold links.

Click a credit to open its entry above the list. On a card, an admin also gets **Edit this entry**
in the artist box, which opens it here.

## An entry

- **Credit**: exactly as on the printings (`printing[].artist`), spaces and accents included. It's
  the entry's key, so it can't be changed: to fix a misspelt credit, fix the cards, then make a new
  entry for the right spelling (and delete the old one, or make it an alias).
- **Same artist as**: another credit's entry, when this credit is the same person under another
  name (a misprint, a nickname, a 7th Sea joke credit). The box then shows that entry's links,
  so an alias has no links or fandom page of its own. Point at the main entry, not at another
  alias; an entry that has aliases can't become one.
- **l5r.fandom.com page**: the wiki page's title, if it has one (where most links came from).
- **Note**: shown in the box under the links, e.g. "No links found" or why there's no artist.
- **Links**: the address and a label (Instagram, ArtStation, own site...). Tick **Archived copy**
  for a Wayback Machine copy of a dead site; the box says "archived copy". Empty rows are dropped.
- **Signatures**: the artist's known signatures, shown under the note when an entry is open (an alias
  shows its main entry's); hover one for its card, set and what was read. **With signatures** in the
  list's menu picks the artists that have some. Click a signature to open it: a bigger crop, a link to
  its card, the credit, who sent and approved it, and its last change. With the artists permission:
  - **Read as**, **How** and **Note**, then **Save**. *Read as* is what the vision model (or a person)
    reads in the signature; Find the artist compares a new find with these readings, so a misreading
    that keeps coming back ("HYPER" for Snyder) is worth keeping. *How*: `matched` (the reading matched
    the credit), `confirmed` (a person confirmed it), `submitted` (sent in from Find the artist),
    `review`/`spots` (from the catalogue scripts).
  - **Move to** another artist (a listed name; an alias files under its main entry), then **Move**.
  - **Detach**: it's a signature, but not this artist's, and you don't know whose. It leaves the
    catalogue and waits in Admin → Artist check, *Signature submissions*, as "detached from ...", for
    whoever works it out to approve it under the right artist.
  - **Delete**: not a signature, or not worth keeping. The crop is kept aside (the image trash) but is
    gone from the catalogue.

  Every change is logged on the signature and takes effect in Find the artist within a minute. If
  someone else changed the same signature since you opened it, the change is refused: reload.

  Where they're kept: table `oracle-all-signatures`, one item per signature (key artist + file, with
  the card, set, credit, reading, how and an update log), and the crops on the images site at
  `https://images.oracleofthevoid.com/artists/<name>/signatures/<cardid>_<printingid>.png`. The first
  ones came from the signature reviews (projects artist-by-style and artist-signatures: 221 artists
  and 2,505 signatures on 2026-10-28); approved Artist check submissions add more. Saving an entry
  here leaves its signatures alone.

**Save** writes the entry at once (it's live on every card page right away). If someone else saved
the same entry after you opened it, the save is refused: copy your changes and reload. **Delete**
removes the entry (the credit on the cards stays, and the box shows only the search); the old entry
is kept in the update log table. An entry other entries are aliases of can't be deleted until
they're changed.

## Who can edit

The `artists` permission (or full permission) on every game. Anyone can view the page.

## The scripts

The entries were built on 2026-10-23 by ootv-tools `artists/links/` (fandom matching, link checks,
web searches). Since the editor, **the table is the source**: the scripts are for bulk work only, and
their fill step leaves entries saved here alone.
