# Needs review

`needsreview` is a card-level field, in every game, for questions about a card that someone
should come back to: a doubtful artist credit, a possible typo not yet checked against the scan,
a rarity or legality decided on partial evidence. Writing the question down on the card is better
than guessing, and the questions are easier to settle once the cards are on the site.

## What it looks like

A list of plain-text reasons, one per question (an array of strings, like most card fields):

```json
"needsreview": [
  "The War of Spirits Starter printing 7: legality: prints the Gold bug, so Four Winds (Gold) was added to the card and this printing. Double-check the Gold legality. (#47, 2026-10-19)",
  "typo? flavor: printing 5 (Jade) \"sorceror\"; may be printed that way. Check the scan. (#47, 2026-10-19)"
]
```

Say which printing a reason is about, what the sources say, and where it came from (an issue
number and date).

## Who sees it

- **Card details:** a "Needs review" row near the top of the card, for users who can edit cards
  in that game. Other visitors don't see it.
- **Search:** Advanced search has a "Needs review" checkbox, again only for those users. It
  finds every card that has the field. Combine it with other fields (set, artist) to narrow it,
  or with a word from the reasons, e.g. Text Search for `credit`.

## Adding, changing, clearing

Edit the card in the card editor (`docs/admin/card-editor.md`):

- add a reason: **+ value** on Needs review (or **Add field** → `needsreview` if the card has none);
- settle one: its **x**;
- settle the last one: the **x** on the field itself, which removes the field (in the JSON view,
  `"needsreview": null` does the same).

Bulk runs (ootv-backups / ootv-import scripts) write it with their other changes, e.g. the L5R
starter-reprint batches (`starter-batch.py`: the plan's `needsreview` column and `card_updates`).
