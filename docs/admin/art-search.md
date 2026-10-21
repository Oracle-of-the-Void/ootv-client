# Similar art

Every L5R instance with an image has an art vector: a fingerprint of the painting in its
`image[0]`, made by an image model (DINOv2) from the art box of the card. Cards whose vectors
are close have art that looks alike: the same painting in another frame, a reprint, a crop,
and to a lesser degree the same artist's style.

## Finding similar art

In the card editor, under an instance's images, **Find similar art** opens a search (in a new
tab) of every card ordered by how much its art looks like that instance's, most alike first.
Each result shows the instance whose art matched. The card itself comes first, then its
reprints and anything else using the same painting, then cards that only look somewhat alike.

The search is an ordinary search link (`#search=table=l5r&artlike=<cardid>_<printingid>`), so
it can be shared, and the API takes the search form's other fields with it as filters (for
example `field_clan`), applied to the most alike few hundred instances.

Uses:

- art credits: a printing that shares a painting with another should usually credit the same
  artist. Doubts go in the card's **Needs review** notes (see that page); never change a credit
  on a match alone.
- wrong or duplicate images: an image that matches a different card's art closely.
- reprints: finding every printing of a painting across sets.

## Placeholder art

Images that match the art on five or more other cards (the 2023 fan sets' brush-and-blade and
clan-symbol placeholders, the rules cards, the ring and virtue templates) are flagged and left
out of the results.

## When images change

The vectors belong to the image they were made from. Pointing an instance at a different image
file in the editor clears its vector, so it drops out of similar-art searches until the vectors
are rebuilt with ootv-backups `art-vectors.py`, which only redoes the instances that need it.
New sets and new instances need the same run.

Replacing an image file under the same name (the mass image upload, or the editor's upload with
"Replace existing files") does **not** clear the vector: the old one stays until the vectors
are rebuilt from fresh downloads. Mention it when you do that, so the rebuild gets done.

Design and history: ootv-claude `ART-MATCHING.md`.
