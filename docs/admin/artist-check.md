# Artist check

Last updated 2026-10-24.

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
gets **Photo → Find the artist** on the search panel: the picture check only, within the
per-level limits in Admin → Config → Limits, and they see only their own results. Pictures are kept
90 days (`s3://reports.oracleofthevoid.com/artcheck/`), then deleted. A check takes a few seconds once
it's picked up.

## Reading the result

- **Signature:** what a vision model reads painted in the art, or "none read". When it matches the
  credit it says so. When it doesn't, **look at the art yourself**: the model often misreads small
  signatures. In a test of 300 credited paintings, about one in six had something readable, and
  the mismatches checked by eye were the real artist's signature misread (e.g. "T. Williams" for
  T. Gianni). A mismatch is a reason to look, never a reason by itself to change a credit.
- **Same painting:** other credited printings that use the same painting (a reprint, a new frame,
  a crop). These are the strongest evidence: a printing that reuses a credited painting may take
  that artist, once you've compared the two by eye.
- **By style:** the artists of the 10 credited paintings nearest in painting style (brushwork,
  colour, texture; the same painting doesn't count), with each artist's share of the vote. In a
  test on 14,842 credited L5R paintings, the top artist was right 41% of the time overall, and
  **88% of the time when its share was 50% or more** (shown in bold; about one painting in six
  gets that). Below 50% the names are candidates to look into, not answers. **Nearest paintings**
  lists the 10 with their artists and scores, linked to their cards.

What to do with it: read the printed credit strip on the scan first. If there's no credit, a
same-painting match checked by eye can give the artist. Otherwise put the candidates in the card's
`needsreview` notes and leave the credit blank.

## When it says the worker is offline

The checks run on a computer on our home network (the style comparison and the vision model need
a GPU), not on AWS. The site queues the job; the worker picks it up, works it out and writes the
result back. If the page says the worker is offline, your check waits in the queue and runs when
the worker is back. Checks are kept for 90 days.

How it's built, and how to run the worker: `ootv-claude/ARTIST-CHECK.md` (workspace repo) and
ootv-tools `artcheck/README.md`.
