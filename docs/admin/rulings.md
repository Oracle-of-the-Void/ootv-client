# Rulings

Last updated: 2026-10-23 (Imperial Herald rulings)

`ruling` is a card-level field, in every game, for official rulings and clarifications about a
card. Each ruling is one entry: the ruling's text, and usually a link to where it comes from.
Answers the rules team gave on the mailing lists are a second field, `rulingref` ("Rules Q&A", below).

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
| A rulebook page on the Rules shelf: `#rulebook=<id>,#page=<n>` (copy it from the Rules viewer's address bar, without the `#game=` part), optionally with a place on the page: `,#find=<words>`, `,#line=<n>` or `,#at=<percent>` (`rulebooks.md`; with text selected, the viewer's link button copies a `#find` link) | that page's image in a popup on the site, scrolled to the place and marked when the link has one, with **Open in Rules** to go to the book at that page, zoomed to the place. Hovering the link (mouse), or a long-press on it (touch), shows that place in a small popup, as the trait links do |
| An image (`.png`, `.jpg`, `.gif`, `.webp`), e.g. a screenshot of a ruling uploaded to the images bucket | the image in a popup on the site |
| A PDF (`.pdf`) | the PDF in a popup on the site, with **Open in a new tab** |
| Any other page (AEG's old rulings pages, forum posts, Wayback copies) | a small separate browser window, because most sites refuse to load inside another page |

Ctrl/Cmd-click opens any of them in a new tab instead.

## Imported rulings

Most L5R and LBS rulings came from the old FAQs, accumulated rulings, rules archives and errata lists
(1997 to 2007), which are on the Rules shelf as type **Rulings** (`rulebooks.md`). They were
put on the cards in bulk (ootv-tools `rulings/add-rulings.py`; the plan and how it was made are in
ootv-claude `RULINGS-IMPORT.md`):

- Each ruling is the archive's text with its citation (`[DW, l5rinfo, 11/4/96]`), then a link
  named for the document and page, e.g. `Rules Archive, August 18, 2007, p. 141`, that opens the
  page marked at the ruling (`#find=` with its first words).
- Errata, text changes and most recent printings (`Reads, "..."`) start with `Erratum:`. They
  are meant to take over from the card-level `erratum` field in time.
- Onyx Lives errata: each dated note in a card's `erratum` field that links an Onyx Lives
  announcement is also an `Erratum:` ruling, linked to that announcement and named for its date
  (`The Onyx Lives Project, 13 Aug 2024`), newest first. The `erratum` notes themselves stay. New
  Onyx errata: add both until the `erratum` field is retired.
- The newest document comes first. A ruling repeated in later archives (often reworded) is
  only kept from the newest one.
- A ruling goes to every card with the heading's title that was printed by the document's date
  (an "(Experienced)" or "(non-Experienced)" heading picks those versions). When that's still
  more than one card, each also gets a `needsreview` note saying so: check which card the
  rulings are about and remove them from the others.
- The FAQs' questions and answers (1997 to 2004) are rulings too: the question and its answer
  (`Q: ... A: ...`) go to each card the question names. A question about a title several cards
  share gets the same `needsreview` note.
- Rulings on general rules topics (Costs, Timing, Tokens...) and questions that name no card stay
  in the books, not on cards.
- LBS: the 1999 LBS FAQ's card rulings went onto the LBS cards the same way (its text is OCR'd, so
  a few words carry scanning slips, like "Ifyou"). LBS has two cards for a few titles (Eyla the
  Protector, Hole in the Sky, The Weight of Dreams): both got the rulings and a `needsreview` note.
- Imperial Herald: the card game's FAQ and errata columns in the Herald (issues 1, 3–14, 16, 17 and Vol. 2 #4,
  1995–2002; the "Oracle of the Void" column and the L5R FAQ) are on the cards the same way, linked to the issue's page on
  the Newsletters shelf (`The Imperial Herald, Issue 9, p. 11`; the page number is the shelf's, not the printed folio). The
  scans' OCR drops the italic card names, so these were typed up from the page images (ootv-import `rulings-herald/`), with
  the version each one is about chosen by hand where a title has several cards. Questions a later FAQ or archive reprinted
  weren't added again. Those issues carry the shelf tag **Rulings**.

## Adding, changing, removing

Edit the card in the card editor (`docs/admin/card-editor.md`): **Add field** → `ruling` if the
card has none, then **+ value** for each ruling. The **x** on a value removes that ruling; the
**x** on the field removes them all (`"ruling": null` in the JSON view).

## Search

Advanced search has a **Rulings** text box that searches the ruling text (link text included).

## Rules Q&A (`rulingref`)

`rulingref` is a second card-level field, in every game, for the rules team's answers to players'
questions, kept apart from `ruling` because there are many of them and they're informal: answers as
they stood on the day, some later reversed or folded into the Rules Archive. Same shape as `ruling`
(HTML strings), each entry the question and the answer, then a link to where it was given:

```json
"rulingref": [
  "<b>Q:</b> There is some talk that ... the second card fills face up.<br><b>A:</b> Well, technically, it doesn't refill face-up. It fills normally, then it's revealed. <a href=\"https://images.oracleofthevoid.com/l5r/rulings-mail/2004-08-31-2045-ml.html#r5-0\">Martin Lund, \"Rules for 26 August 2004\", 31 Aug 2004</a>"
]
```

On the card's details page a **Rules Q&A** row shows a button with the count ("14 answers from the
rules team"). It opens the list in a popup; clicking an answer opens its source there, scrolled to the
answer, with **Back to the list** and **Open in a new tab** (Ctrl/Cmd-click opens it in a new tab
straight away). Newest answers come first.

### L5R: the rules digests (2000–2006)

The L5R entries come from the rules team's digests on the l5r-ccg and l5r-useful mailing lists ("Rules
for <date>", "post for <date>": Jeff Alexander, Zen Faulkes, Martin Lund, Vaughn Derderian). Each digest is
copied, whole, to a page under `https://images.oracleofthevoid.com/l5r/rulings-mail/` (an index of all
1,086 is `index.html` there), with previous/next links between digests. Each answer on a page has its own
anchor (`#r<n>-<n>`), marked when a link opens it, and lists the cards it went onto. The askers'
names (From: lines, "... wrote:") are left out.

Which answers went onto cards: the question names one to three cards (a title written as on the card;
rules words that are also titles, like Overwhelmed or The Imperial Favor, don't count), the answer
isn't a holding answer ("I'll check with Jeff"), and the card doesn't already have the same ruling from
the Rules Archive (same rules person, within a week). The answer goes to each card with that title printed
by the digest's date. When the question marks the version ("XP Yasuki Hachi", "Hachi XP2", "Wayan exp 2",
"non-XP": XP is how players wrote Experienced), only that version gets it. Otherwise, when the question and
answer clearly echo one version's own card text (words the other versions' texts don't have), that version
gets it. The answers still left on several versions were then reviewed by hand (ootv-import
`rulings-email-decisions.tsv`: each stays on every version, goes to one, or comes off), so none carry a
`needsreview` note; one left unsettled by a later rebuild would get a note saying so. Everything else, chatter included, stays only in the digests.
After a change to the scripts the cards are re-synced (ootv-tools `rulings/add-rulings.py --sync`), which replaces
only the entries linking to the digests.

The pages and the card entries are made by ootv-import `SCRIPTS/email-qa.py`, `email-plan.py` and
`email-digests.py` from the threaded mail archive (project `rules-forum-rulings`).

Edit `rulingref` in the card editor like `ruling`. Advanced search has a **Rules Q&A** text box for it.

## On Discord

The Discord bot's `/rulings <card>` posts a card's rulings and says how many Rules Q&A answers it
has; `full:true` adds those (`discord-bot.md`, "Rulings").
