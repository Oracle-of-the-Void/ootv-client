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
- [ ] Search form selects (Tom Select, 2026-10-30; replaced Chosen, which turned itself off on phones and left
  tall list boxes). Check that tapping a field doesn't zoom the page, how much of the list the keyboard leaves
  (the keyboard opens because the field filters), and that the page behind doesn't jump.
- [ ] Search panel: phones start with it open; it opens from the Edit search bar above the results
  (added 2026-10-15: a tester couldn't find the second tap on the Search Results button) or that button when
  already on the results and closes on Search, the arrow, a tap on the results, or switching
  view. Check the page behind it doesn't scroll while the panel is open.
- [ ] Directory cards view (the phone default; the menubar view buttons switch to the
  detailed table, which still scrolls sideways): a tap on a card or its name opens the list, a
  0.5 s long-press on the name renames it (check iOS doesn't select the text or pop its menu
  instead), notes with line breaks, the ⌘ actions menu in the card's title bar (it opens upward
  near the bottom of the screen), the New list tile, and the menubar Sort dropdown.
- [ ] Swipe list picker (added 2026-10-16): with no active list, an adding swipe in search
  results opens a list picker with collapsible folders and New list (which asks for a name).
- [ ] Directory drag and drop (added 2026-10-15): long-press a list's move handle or a folder
  and drag it onto a folder, a folder in an expanded tree, or the path bar. It's HTML5 drag and
  drop, which iOS Safari 15+ supports and Android Chrome may not. Where it doesn't work, the
  list's Folder menu still does the move. Check that the long-press doesn't open iOS's own menu.
- [ ] Tooltips: hidden on touch except after a 0.5 s long-press, then shown for 1.5 s
  (`data-balloon-visible`). Check iOS doesn't pop its own long-press menu over it.

## Still to do

- [ ] **Menubar height**: with the double-size icons it wraps to three rows (~160px) at
  390px. The format, card size and sort buttons now share one box (`ul.viewblock`), so sort
  no longer takes a row of its own; folding that box into one dropdown would save another row.

## Done since the first pass

Double-size menubar icons, no debug button, start on the search form, full-width search
panel, other views close the panel, separate saved view defaults with "(Mobile)" on the
save items (`settings[game].mobile`), Visual Spoiler as the phone search default,
directory scrolls sideways, list quantity beside the +/- buttons (desktop too),
long-press labels (noted in Help), 1em text symbols kept small, sideways phones get the phone layout, Edit search bar above the results (with the result count), back/forward closes the search panel, one YouTube link on Help.

Swipes on card images and Simple List titles (click-drag with a mouse). By default, search results: right +1,
left −1, up-right +3; deck/list view: right +1, left −1, up-right +2; in both, up-left removes every copy.
Settings → Gestures changes what each direction does (add, remove, set the count to, remove all, nothing),
separately for search and for the deck/list view, and turns each gesture off (deck swipe touch and mouse,
directory drag touch and mouse, long-press labels, card peek touch and mouse; `settings.all.gestures`, or this browser when logged out). A short toast confirms each change; going to 0 asks before removing the card. They work in search (Detail, Visual
Spoiler and Simple List, on the first active list; the toast names the list when several are active)
and in the deck/list view (Deck, Detail, Visual Spoiler and Simple List, on the list shown). Mostly vertical
drags still scroll. Swipes and Settings → Gestures were checked on a real phone on 2026-10-16.

Card peek (2026-10-29, [PR #502](https://github.com/Oracle-of-the-Void/ootv-client/pull/502), emulated touch
on Chrome only): a card image drawn smaller than Detailed (search and list rows, Deck view stacks, public
decks, a Detailed image shrunk under ~480px) or a Simple List title (search and lists) shows the Detailed
image: on hover after 250 ms beside it (mouse, switch `cardpeekmouse`), or after a 500 ms press centered
over a backdrop until the next tap (touch, `cardpeektouch`). The release after a peek doesn't open the
card or swipe; Android's long-press menu is blocked. The Detailed file comes from the card's printing
(`cardpeekfind`), since Dune's files aren't named `_select`/`_details`. WebKit runs it (2026-10-30, synthetic press). **Not checked on real iOS Safari**: the
image/link callout is turned off with `-webkit-touch-callout` set on the press, which may be too late; if the
iOS menu or link preview still opens, set it in CSS on `a.deckswipe` and its image instead.

Card view (2026-10-21, [#372](https://github.com/Oracle-of-the-Void/ootv-client/issues/372), emulated touch only):
a sideways swipe on a card opened from a search goes to the next (left) or previous (right) result,
like the arrow keys (Gestures switch `cardswipetouch`; skipped when pinch-zoomed, over a form field, in
something that scrolls sideways, or with a modal open). The ◀ ▶ buttons get finger-sized tap targets.
Visual Spoiler (the phone default) used to open cards without the search, so the buttons never showed.

Card editor (2026-10-21, emulated touch only): a sideways swipe on Printing details goes to the next
(left) or previous (right) instance, the same rules as the card view's swipe (Gestures switch
`editswipetouch`; also skipped over a value box, in the image zoom panel, in the JSON view and with a
confirm box up). The ◀ ▶ arrows beside "Instance N (i of n)" are 36px tap targets.

Card editor image panel (2026-10-30, emulated touch only; **not checked on iOS Safari**): thumbnails under the
zoom panel's image reorder by dragging, through pointer events with `touch-action: none` on each thumbnail, and a tap
shows that image. The pointer is captured on the thumbnail row, not the thumbnail, because moving the thumbnail in the
page would release it.

Added 2026-10-16 (emulated touch only; see the checklist above): with no active list, an adding
swipe in search results asks which list to activate (folder tree, plus New list); a Gestures switch
hides the directory's Folder pulldown (move lists by dragging only); New list asks for a name and
makes the list active; in the directory a tap on a name opens the list and a long-press renames it
(a pencil does it with a mouse); list actions (View, Duplicate, Upload, downloads, Delete) are in a
⌘ menu by the activate toggle, in the table and the cards; list notes keep their line breaks. In an open list's header, long notes start at three lines with Show more / Show less.
