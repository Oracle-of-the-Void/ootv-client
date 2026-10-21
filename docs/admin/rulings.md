# Rulings

`ruling` is a card-level field, in every game, for official rulings and clarifications about a
card. Each ruling is one entry: the ruling's text, and usually a link to where it comes from.

## What it looks like

An array of HTML strings, like `notes` or `erratum`. Put the source in an ordinary `<a href>`:

```json
"ruling": [
  "Bowing this card does not end the duel. <a href=\"#rulebook=jade,#page=42\">Jade rulebook p. 42</a>",
  "The Gold Cost reduction applies once per turn. <a href=\"https://web.archive.org/web/2003/http://www.l5r.com/rulings\">AEG rulings, 2003</a>"
]
```

The link text is what visitors see, so name the source (book and page, site and year).

## Where the links open

On the card's details page, **Rulings** sits above **Versions**. Clicking a link in a ruling:

| Link | Opens |
|---|---|
| A rulebook page on the Rules shelf: `#rulebook=<id>,#page=<n>` (copy it from the Rules viewer's address bar, without the `#game=` part) | that page's image in a popup on the site, with **Open in Rules** to go to the book at that page |
| An image (`.png`, `.jpg`, `.gif`, `.webp`), e.g. a screenshot of a ruling uploaded to the images bucket | the image in a popup on the site |
| A PDF (`.pdf`) | the PDF in a popup on the site, with **Open in a new tab** |
| Any other page (AEG's old rulings pages, forum posts, Wayback copies) | a small separate browser window, because most sites refuse to load inside another page |

Ctrl/Cmd-click opens any of them in a new tab instead.

## Adding, changing, removing

Edit the card in the card editor (`docs/admin/card-editor.md`): **Add field** → `ruling` if the
card has none, then **+ value** for each ruling. The **x** on a value removes that ruling; the
**x** on the field removes them all (`"ruling": null` in the JSON view).

## Search

Advanced search has a **Rulings** text box that searches the ruling text (link text included).
