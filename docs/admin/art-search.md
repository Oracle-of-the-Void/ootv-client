# Similar art

Every instance with an image has an art vector, in every game (L5R since 2026-10-21, the other
games since 2026-10-22): a fingerprint of the painting in its `image[0]`, made by an image model
(DINOv2) from the art box of the card (set per game, and per card type where a game's frames
differ; a Pathfinder pawn uses the whole pawn). Search compares vectors within one game only. Cards whose vectors
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

## Search by photo

The **Photo** button under the search form takes a photo of a card, or a picture of its art, and
searches the current game for the cards whose art looks most like it.

Who gets it: a logged-in account with any permission on the game (an entry under the game, or
under `*`, in the user's groups in the user editor), or a Patreon supporter whose tier is listed
in the limits below. Supporters are tied to their account by email (or by linking Patreon on
their profile) in `oracle-all-patreon`, which Patreon keeps current; see [Patreon](patreon.md).
Everyone sees the button: for anyone else (not logged in, or no permission or tier) it explains
that the photo features are for Patreon supporters, that a free membership gets 1 a day and that
heavy use has a real cost, with a Join on Patreon button; the API refuses them too. Supporters see
their allowance under the choices, and that higher tiers get more. The same people get
**Find the artist** under the same button ([Artist check](artist-check.md)). A result link can be
opened by anyone: it only searches with the stored fingerprints.

Each person has a daily and a per-minute allowance by level, **one count for Find the card and
Find the artist together** (the user's call, 2026-10-23), set in **Admin → Config → Limits**
([Limits](limits.md); stored in `oracle-all-structure`, database `all`, key `artphoto`, field
`limits`; the API rereads it every 5 minutes). A level with no day or minute number has no
limit in that period. Set 2026-10-23:

| Level | Who | Per day | Per minute |
|---|---|---|---|
| `admin` | full permission (`*`) on the game or on `*` | no limit | no limit |
| `maintainer` | any other permission on the game | no limit | no limit |
| `patreon-free` | Patreon Free tier | 1 | 1 |
| `patreon-ashigaru` | Patreon Ashigaru ($2) | 5 | 1 |
| `patreon-samurai` | Patreon Samurai ($5) | 25 | 5 |
| `patreon-maker` | Patreon Maker ($50) | 500 | 10 |

A supporter gets the level of their highest tier. The key is `patreon-` plus the tier's title on
Patreon in lower case (anything not a letter or digit becomes `-`), so **renaming a tier on
Patreon means renaming its key here**; a tier with no key gets no photo features. A level the
APIs don't find at all gets 1 a day and 1 a minute. Find the artist's `admin` also covers the
`artcheck` permission, and its `member` level is `maintainer` here.

Correcting the outline counts as a search. Over the limit, the page says so and when it resets
(the next minute, or midnight UTC); under the results it shows how many are left today (not for
levels without a daily limit).
The page shrinks the photo and sends it to the API (`POST /artphoto`, the `ootv-artembed`
Lambda in ootv-search `artembed/`), which:

1. looks for the card in the photo (up to three card-shaped outlines, since on a busy table the
   best-shaped one isn't always the card) and straightens it;
2. cuts the game's art box out of it in every way up it can be (a card photographed sideways
   or upside down still matches);
3. turns each piece into an art vector, the same kind the instances have.

The search keeps each card's best match over all the pieces. It is an ordinary search link
(`#search=table=l5r&artphoto=<id>`) that works for a week; the photo itself is never stored,
only its vectors. Above the results the page shows the card it found, turned the way it
matched, and **Adjust the outline**: drag the four corners onto the card and search again, for
when the wrong part of the photo was used. When no card outline is found (a pawn, a picture of
the art alone) the whole picture is searched.

Tested on synthetic photos of real cards (tilted, rotated, any lighting, on plain and busy
backgrounds): the right card first 91-99% of the time depending on the game; real photos taken
on the card slinger all matched.

## Placeholder art

Images that match the art on five or more other cards (the 2023 fan sets' brush-and-blade and
clan-symbol placeholders, the rules cards, the ring and virtue templates) are flagged and left
out of the results.

## When images change

The vectors belong to the image they were made from. Any change to an instance's image list in
the editor (a different file, an image added or deleted, a new order) clears its vector, so it
drops out of similar-art searches until the vectors are rebuilt with ootv-tools `art-matching/art-vectors.py --game <game>`, which only redoes the instances that
need it. New sets and new instances need the same run.

Replacing an image file under the same name (the mass image upload, or the editor's upload with
"Replace existing files") does **not** clear the vector: the old one stays in search until the
next `art-vectors.py` run, which notices the changed file and redoes it. Mention it when you do
that, so the run gets done.

Design and history: ootv-claude `ART-MATCHING.md`.
