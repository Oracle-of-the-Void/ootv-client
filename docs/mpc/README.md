# MakePlayingCards (MPC) card templates

Templates downloaded from www.makeplayingcards.com (2026-10-11), kept for reference for the
"PDF for MakePlayingCards" output (`createpdf` with `layout: 'mpc'` in `oracle.js`). Each is a
one-page Illustrator PDF showing the safe, cut and bleed lines.

| File | MPC name | Cut (finished) | With bleed | Safe area | Pixels at 300 dpi (cut / bleed) |
|---|---|---|---|---|---|
| `mpc-poker-63.5x88.9mm.pdf` | poker-size | 2.5 × 3.5 in (63.5 × 88.9 mm) | 2.74 × 3.74 in | 2.3 × 3.3 in | 750 × 1050 / 822 × 1122 |
| `mpc-american-poker-63x88mm.pdf` | American-poker-size | 2.48 × 3.46 in (63 × 88 mm) | 2.72 × 3.7 in | 2.28 × 3.27 in | 744 × 1038 / 816 × 1110 |

Both add **0.12 in (36 px at 300 dpi) of bleed on each side**. Art has to run through the bleed
so no white shows if the cut drifts; keep text inside the safe area. The template says to delete
the guide layer and upload JPG, BMP, PNG, GIF or TIFF.

The OotV output makes each PDF page the card plus the bleed (the game's `dbinfo[game].cardsize`,
in mm, plus `bleed`, default 0.12 in), draws the `_master` scan (~750 × 1050, i.e. 300 dpi at
poker size) at the cut size, and fills the bleed with black or with the card's stretched edge
pixels. Scans have white rounded corners and sometimes white edge slivers, which
`pdffixcorners()` paints over with the card's edge colour first.

## MPC's PDF upload rules (from MPC support, 2026-10-11)

For PDF upload MPC wants **one PDF file per card**, named `1.pdf`, `2.pdf`, ... in order, and a
separate file for every copy even when designs repeat. They also ask for the artwork in a layer
group called "CMYK", MPC's guide layers hidden, text converted to outlines, and the file saved as
"CS2 version or below" (PDF 1.5 or older).

The OotV "PDF for MakePlayingCards" download is a zip of exactly that: one single-page PDF per
card copy (proxy quantities repeat), numbered in list order. PDFKit writes PDF 1.3 with no text and
no guide layers. The images are RGB JPEGs: there is no "CMYK" layer group (an Illustrator concept),
and the browser can't encode CMYK images, so if MPC rejects RGB the files need converting first.
