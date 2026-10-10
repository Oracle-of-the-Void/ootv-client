# Mobile / touch: what's left

Status as of 2026-10-10. The first pass is on `dev` (not yet on `master`):

- [`3a6550e`](https://github.com/Oracle-of-the-Void/ootv-client/commit/3a6550e) makes the
  menubar dropdowns open with a tap on touch screens (refs #79).
- [`ef4f16c`](https://github.com/Oracle-of-the-Void/ootv-client/commit/ef4f16c) adds the
  phone layout: viewport meta, slide-over search panel, wrapping menubar, hidden sidebar
  extras, no fixed min-widths, and a stacked card view.

The phone rules are in the `@media (max-width: 768px)` block at the end of `oracle.css`.
How to test at phone width is in `TESTING.md` under "Phone width".

## Check on a real iPhone first

Headless Chromium can't stand in for these:

- [ ] Menubar dropdowns (hamburger, game chooser, sort, profile, directory Download) open
  and close by tap ([#79](https://github.com/Oracle-of-the-Void/ootv-client/issues/79)).
  If they work, release to `master` with `Fixes #79` in the PR body and move #79 out of
  "Almost done" in `ootv-claude/issues/ootv-client/INDEX.md`.
- [ ] Search form selects. Chosen disables itself on phones, so these are plain
  `<select multiple>`. iOS should show a one-line picker; Chromium draws tall list boxes.
  If they're unusable, consider a compact custom control for the panel.
- [ ] Search panel: opens from the Search Results button when already on the results, closes on Search, the arrow, or a tap
  on the results. Check the page behind it doesn't scroll while the panel is open.

## Still to do

- [ ] **Directory table**: 13 columns, too wide for a phone. Cheap: `overflow-x: auto` on
  `#resultdir`. Better: stack each list as a card (name, type and legality on one line,
  then the action buttons).
- [ ] **Hover-only labels**: on touch the menubar icon buttons have no visible label,
  because balloon tooltips only show on hover. Options: list the views by name in the
  hamburger menu, or show the label on long-press.
- [ ] **Deck/list view on a phone**: not tested yet. Check Visual Deck, Simple List and
  Visual, including the `+`/`-`/trash buttons and the editable quantities.
- [ ] **Modals on a phone**: list import, the confirm dialog and the card editor
  (`editcard*`) have only had their min-width removed. Check they fit and scroll.
- [ ] **Search panel form**: still uses the desktop sizes (105px inputs, 110px selects)
  inside a panel up to 360px wide. Let the inputs fill the panel.
- [ ] **Tablets and landscape phones** (769–1000px): they get the desktop layout with the
  sidebar always open. Decide whether the breakpoint should be higher.
- [ ] **Profile menu and Admin entry**: not tested by tap because they need a login (see
  "Faking login" in `TESTING.md`).

## Unrelated loose ends from the same session

- [ ] The Help page has a large YouTube banner further down, now that YouTube is also in
  the links row at the top. Remove one.
- [ ] The Admin entry in the profile menu doesn't hide again on logout until a reload
  (`logoutcallback()` doesn't hide `.showonadmin`).
