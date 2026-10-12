# Mobile / touch: what's left

Status as of 2026-10-10. The first pass is on `dev` (not yet on `master`):

- [`3a6550e`](https://github.com/Oracle-of-the-Void/ootv-client/commit/3a6550e) makes the
  menubar dropdowns open with a tap on touch screens (refs #79).
- [`ef4f16c`](https://github.com/Oracle-of-the-Void/ootv-client/commit/ef4f16c) adds the
  phone layout: viewport meta, slide-over search panel, wrapping menubar, hidden sidebar
  extras, no fixed min-widths, and a stacked card view.

The phone rules are in the `@media (max-width: 768px), (pointer: coarse) and (max-height: 500px)`
block at the end of `oracle.css` (narrow screens, plus phones held sideways); `narrowscreen()` in
`oracle.js` uses the same query. There's no user-agent sniffing, so "Request desktop site" (which
widens the viewport) gets the desktop layout.
How to test at phone width is in `TESTING.md` under "Phone width".

## Check on a real iPhone first

Tested on Android (2026-10-10): deck/list views, pop-ups, the profile menu and the Admin
entry all work. Headless Chromium can't stand in for these on iOS:

- [ ] Menubar dropdowns (hamburger, game chooser, sort, profile, directory Download) open
  and close by tap ([#79](https://github.com/Oracle-of-the-Void/ootv-client/issues/79)).
  If they work, release to `master` with `Fixes #79` in the PR body and move #79 out of
  "Almost done" in `ootv-claude/issues/ootv-client/INDEX.md`.
- [ ] Search form selects. Chosen disables itself on phones, so these are plain
  `<select multiple>`. iOS should show a one-line picker; Chromium draws tall list boxes.
  If they're unusable, consider a compact custom control for the panel.
- [ ] Search panel: phones start with it open; it opens from the Search Results button when
  already on the results and closes on Search, the arrow, a tap on the results, or switching
  view. Check the page behind it doesn't scroll while the panel is open.
- [ ] Tooltips: hidden on touch except after a 0.5 s long-press, then shown for 1.5 s
  (`data-balloon-visible`). Check iOS doesn't pop its own long-press menu over it.

## Still to do

- [ ] **Directory as cards**: the directory table (13 columns) now scrolls sideways inside
  its view on phones. Better: stack each list as a card (name, type and legality on one
  line, then the action buttons).
- [ ] **Menubar height**: with the double-size icons it wraps to three rows (~160px) at
  390px. Fine for now; could fold the format and size buttons into one dropdown on phones.

## Done since the first pass

Double-size menubar icons, no debug button, start on the search form, full-width search
panel, other views close the panel, separate saved view defaults with "(Mobile)" on the
save items (`settings[game].mobile`), Visual Spoiler as the phone search default,
directory scrolls sideways, list quantity beside the +/- buttons (desktop too),
long-press labels (noted in Help), 1em text symbols kept small, sideways phones get the phone layout, one YouTube link on Help.
