# Editing other people's lists, and the audit log

Last updated 2026-10-31.

Admins can open and fix anyone's deck or list, private ones too: a mistyped card the owner asked
about, a list made public by accident, or something that breaks the site's rules. Every step is
written to the **audit log** under the admin's name, before it happens.

## Who can

- Anyone with the permission `listedit` for the game (or for every game, in the `*` group), or a
  site admin (`*: *`). Give it on [Users](users.md).
- `*` in a game's own group (full card editing for that game) is **not** enough: card editors
  don't automatically get to touch players' decks.

## Editing a list

1. Open the list (a shared link, a public list, or its id). Someone else's list always opens
   **read only**, with an **Edit as admin** button in the banner.
2. Click it. A popup says whose list it is and whether it's private, and asks you to confirm.
   **Email the owner** is ticked by default: the owner gets a short email saying an admin changed
   one of their lists, with a link to it (no names, no details). It goes at most once an hour per
   admin and list, however many changes you make.
3. After you accept, the list has its owner's edit controls under a red banner and is already an
   **active list**, so cards add to it from search. **Stop editing** takes it off. The banner has the
   **Email the owner** switch (change it any time) and **Stop editing**. Reloading the page also
   stops editing.

Card changes save about 15 seconds after the last one. **Stop editing** saves any still waiting
and finishes once they're in (it shows *Saving...*, or *Not saved, retrying...* if the save fails,
and the list stays open for editing until it works). Reloading doesn't wait: card changes from the
last 15 seconds are lost, so use Stop editing first.

What you can change: the cards, name, notes, type, legality, public/private and the deck
construction rules. What you can't: delete it, or change its folder (that's the owner's filing).
While you edit, the deck's saved summary (its Count and the red Illegal in the directory and the
public listing) follows your changes, and the audit log shows that as a save of `summary`. It never
emails the owner.
Changes save straight to the owner's list. There is no undo, but the audit log keeps the old
values.

## What is logged

Admin → Audit → **Audit log** (site admins only) lists, newest first:

| What | When |
|---|---|
| Opened a list to edit | the popup was accepted (with the popup's version and whether the owner is emailed) |
| Saved a list | each change: the field and its old and new values, or for the cards which ones changed and how many |
| Searched users / Looked at a user / Edited a user | every use of [Users](users.md), with the old and new values of an edit |

Refusals are logged too (result `denied`). Pick up to 31 days, and narrow it to one admin (uid) or
one target (`list#123`, `user#456`); click an admin's name or a user to filter on them. The log
is kept for good, and the site can only add to it, never change or delete a row.
