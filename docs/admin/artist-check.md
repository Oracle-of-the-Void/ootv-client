# Artist check

Last updated 2026-10-25.

Who painted a printing? The artist check answers with three kinds of evidence. It never writes
to the card: you decide, then fix the credit or add a `needsreview` note in the card editor as
usual (see [Needs review notes](needsreview.md)). L5R only for now.

## Running a check

- **Admin → Artist check:** type the card id and the printing id, then **Check**. Or pick **a
  picture** (say whether it's a whole card or the art alone): the same check runs on the picture,
  with "Maybe the same painting" found by art fingerprint (very close at 0.90 and up). The list below
  shows this game's recent checks, newest first. **show** opens one again.
- **Card editor** (the usual place): under an instance's images, **Check artist** (next to Find
  similar art) runs the check and shows the result right there, with a checkbox for each artist it
  names (the same painting's credits first, then the style candidates). Tick the right one (more
  than one for a joint credit) and press **Fill in artist**: the instance's artist field becomes the
  ticked names. That's only in the editor until you **Commit**, which saves it with the usual update
  log. When the same painting has exactly one credited artist, that box starts ticked; still compare
  the two paintings by eye first. The result stays under the instance while the editor is open.

Both need the `artcheck` permission (or `*`) on the game. Everyone else who can search by photo
(any permission on the game, or a Patreon tier) gets **Photo → Find the artist** on the search
panel: the picture check only, within the per-level limits in Admin → Config → Limits (one count
shared with Find the card), and they see only their own results. Pictures are kept
90 days (`s3://reports.oracleofthevoid.com/artcheck/`), then deleted. A check takes a few seconds once
it's picked up.

## Reading the result

- **Signature:** what a vision model reads painted in the art, or "none read". When it matches the
  credit it says so. When it doesn't, **look at the art yourself**: the model often misreads small
  signatures. In a test of 300 credited paintings, about one in six had something readable, and
  the mismatches checked by eye were the real artist's signature misread (e.g. "T. Williams" for
  T. Gianni). A mismatch is a reason to look, never a reason by itself to change a credit.
- **Found in the art** (since 2026-10-24): when the model can point to the signature on the card,
  it's shown cut out and zoomed in. Printed text (the credit strip, the card title) is left out. With
  nothing read in the art region, the model also looks for any signature on the whole card, so a
  faint one can turn up here.
- **The reading may name** (since 2026-10-25): artists in the artists list whose name the reading
  matches (a word of it, the initials, or nearly the same letters, so "Schuler" finds Douglas Shuler)
  but who have no signatures in the catalogue yet. Those with signatures show below instead.
- **Closest known signatures** (since 2026-10-25): the eight signatures in the catalogue most like the
  one found, from any artist: by the look of the hand (the cut-out compared as an image, "look") and
  by the reading (against what the model read on each known signature and its artist's name,
  "reading"). The reading part also catches the model's usual misreads: "HYPER" brings up Steve
  Snyder's signature that it once read that way. In testing, the nearest signature by look alone was
  the same artist about one time in four (chance: one in twenty-five), so it's a lead to compare by
  eye, not an answer. A signature filed a minute ago is already compared.
- **Known signatures by artist:** signatures of the likely artists from the signature catalogue (the
  credited artist, any artist the reading names, the artists of the closest signatures, then the
  style candidates), up to six each from different sets, never from the checked painting. Click one
  to open its card. Compare the hand by eye: the shapes of the letters, the date, where it sits. Only
  artists already in the catalogue appear (the Artists guide, "Signatures", says where they come from).
- **Add this signature to the catalogue** (since 2026-10-25): shown when a signature was found and
  the painting (or the same painting on another printing) isn't in the catalogue yet. Type whose it
  is (the box suggests the credit, artists the reading names and the style vote first, then every
  name in the artists list). For an admin (artcheck permission) it's filed at once, under an artist
  from the artists list (an alias goes to the entry it points at; add a new artist in Admin →
  Artists first). Anyone else using Photo → Find the artist gets **Submit for approval** instead.
- **Same painting:** other credited printings that use the same painting (a reprint, a new frame,
  a crop). These are the strongest evidence: a printing that reuses a credited painting may take
  that artist, once you've compared the two by eye.
- **By style:** artists ranked by how close their 5 best credited paintings come in painting style
  (brushwork, colour, texture; the same painting doesn't count), each with its share of the vote
  among the 10 nearest paintings. In a test on 15,546 credited L5R paintings (2026-10-25), the top
  artist was right 42% of the time overall, and **88% of the time when its share was 50% or more**
  (shown in bold; about one painting in six gets that). Below 50% the names are candidates to look into, not answers. **Nearest paintings**
  lists the 10 with their artists and scores, linked to their cards.

What to do with it: read the printed credit strip on the scan first. If there's no credit, a
same-painting match checked by eye can give the artist. Otherwise put the candidates in the card's
`needsreview` notes and leave the credit blank.

## Check bugs (L5R)

**Check bugs** (next to Check, and under each L5R instance in the card editor beside Check artist)
asks the same worker which arc bugs are printed on the card, read from the instance's images. It
shows each bug it found, zoomed (green frame), and any it's unsure of (orange frame, marked ?), with
a score, then what to review:

- **unsure**: a bug might be there; look at the zoomed picture. Faint bare glyphs (the Samurai 侍 on
  Glory of the Empire starter reprints) and washed-out foil scans land here.
- **legality without a printed bug (misprint?)**: the instance is legal in an arc whose bug isn't
  printed. Either a misprint meant to carry it (it still gets the bug in `printedbugs`: add it by
  hand) or a wrong legality.
- **bug without legality (ban? no-legality set?)**: the bug is printed but the instance isn't legal
  there, e.g. a card banned from that arc.

In the card editor, **Set printedbugs** sets the instance's `printedbugs` to the bugs found, and
**Add review note** copies the review lines into the card's `needsreview`; Commit saves either. On the
Admin page, the picture option **the bugs on a whole card** checks an uploaded flat scan (photos at
an angle aren't straightened yet). It's right 99.94% of the time against the reviewed cards, and
never reports a bug that isn't there. `printedbugs` is described in `docs/data.md`.

## Signature submissions

Below the recent checks, **Signature submissions** lists the signatures people sent in from Find the
artist that wait for an admin: the zoomed signature, the printing (or "an uploaded picture"), its
credit, what the model read, the artist the sender named, and who sent it. Compare the signature
with the artist's known ones (run Artist check on the printing, or open the artist's catalogue), fix
the name in the box if needed, then **Approve** (filed in the catalogue under that artist, which must
be in the artists list) or **Reject**. Tick "show decided ones too" to see past decisions. Filed
signatures are marked `how: submitted` in the artist's `index.json`, with who sent and approved them.

## When it says the worker is offline

The checks run on a computer on our home network (the style comparison and the vision model need
a GPU), not on AWS. The site queues the job; the worker picks it up, works it out and writes the
result back. If the page says the worker is offline, your check waits in the queue and runs when
the worker is back. Checks are kept for 90 days.

How it's built, and how to run the worker: `ootv-claude/ARTIST-CHECK.md` (workspace repo) and
ootv-tools `artcheck/README.md`.
