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
- [ ] Search panel: phones start with it open; it opens from the Edit search bar above the results
  (added 2026-10-15: a tester couldn't find the second tap on the Search Results button) or that button when
  already on the results and closes on Search, the arrow, a tap on the results, or switching
  view. Check the page behind it doesn't scroll while the panel is open.
- [ ] Directory cards view (the phone default; the menubar view buttons switch to the
  detailed table, which still scrolls sideways): editing the name and notes on a card, the
  Download dropdown inside a card, the New list tile, and the menubar Sort dropdown.
- [ ] Tooltips: hidden on touch except after a 0.5 s long-press, then shown for 1.5 s
  (`data-balloon-visible`). Check iOS doesn't pop its own long-press menu over it.

## Still to do

- [ ] **Menubar height**: with the double-size icons it wraps to three rows (~160px) at
  390px. Fine for now; could fold the format and size buttons into one dropdown on phones.

## Done since the first pass

Double-size menubar icons, no debug button, start on the search form, full-width search
panel, other views close the panel, separate saved view defaults with "(Mobile)" on the
save items (`settings[game].mobile`), Visual Spoiler as the phone search default,
directory scrolls sideways, list quantity beside the +/- buttons (desktop too),
long-press labels (noted in Help), 1em text symbols kept small, sideways phones get the phone layout, Edit search bar above the results (with the result count), back/forward closes the search panel, one YouTube link on Help.

Swipes on card images and Simple List titles (click-drag with a mouse): right +1, left −1, up-right +3, up-left −3,
with a short toast; going to 0 asks before removing the card. They work in search (Detail, Visual
Spoiler and Simple List, on the first active list; the toast names the list when several are active)
and in the deck/list view (Deck, Detail, Visual Spoiler and Simple List, on the list shown). Mostly vertical
drags still scroll. Tested with emulated touch only: check on a real phone.
