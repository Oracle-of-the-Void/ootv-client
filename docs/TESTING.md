# Testing ootv-client changes

There are no automated tests. Changes are checked by serving the repo locally and
driving it with headless Chromium through Playwright (installed globally, see the
workspace `CLAUDE.md`). These notes collect the techniques and pitfalls from testing
the menubar view buttons, size toggle, sort menu, saved view defaults and list deck
view (Oct 2026).

## Setup

```bash
python3 -m http.server 8765 &          # from the repo root
NODE_PATH=$(npm root -g) node script.js
```

**Check the port is yours.** The box is shared with other sessions and users, and a backgrounded `http.server` that
can't bind fails silently, so the tests quietly run against someone else's checkout. Take a free port
(`python3 -c "import socket;s=socket.socket();s.bind(('127.0.0.1',0));print(s.getsockname()[1])"`) and `curl` the served
file for your change before testing. Tests that all fail on something undefined usually mean this.

Keep scripts out of the repo (the deploy syncs every top-level file). The local page
talks to the **dev API** (`apiuri` is `api-dev.oracleofthevoid.com` on localhost, which
runs the `dev-ootv-search` Lambda). Its data is the live data, so searching and browsing
are real, and any write is a write to production. See "Faking login and the API" below.

PDFs need preview or the live site: from localhost the card images fail to load, so the PDF comes out with no cards.
`PDFDocument` and `blobStream` are undefined until the first `createpdf` (`loadpdfkit`).

## Page state worth inspecting

Everything is a global, so `page.evaluate(() => ...)` can read it directly:

| Global | What it holds |
|---|---|
| `templates[database].available` | every template key with `places` (`search`/`card`/`list`), `generic`, `override` |
| `templates[database].active` / `.default` / `.compiled` | current template per view, the game's default, compiled JsRender templates |
| `templates[database].sort.search`, `.sortdir.search`, `.sortmode.search` | current search sort key (a JSON string), `asc`/`desc`, and how text compares (`lex`/`punct`/`library`, keys of `sortmodes`) |
| `largeview` | per-view size toggle `{search, card, list}` |
| `currentresulttab()` / `viewbuttontype()` | tab on screen; which view the menubar buttons drive |
| `searchcache[database].querydata[qs]` | **plain card ids** for a search, not card objects |
| `listcardorder[listid]` | a list's rows as drawn, `{cardid, printing}`, for stepping from a card; in memory only, so empty after a reload |
| `$('#lastcardid').data('qs')` / `.data('prid')` | what the card on screen was opened with: a search, or `listid=N` from a list (`cardqs()`); the printing |
| `cache_card_fetch(id)` | a copy of the cached card (fields are arrays: `title[0]`, `type.join()`); to try a change, edit it and store it with `cache_card(card)`, or the code under test never sees the change |
| `cache_thing(kind, key[, value])` | localStorage-backed cache (`<game>_<kind>_<key>`) |

## Timing and navigation

- Each template is fetched by its own `$.ajax` after the page loads. Wait ~3-4 s before
  rendering, and expect `templates not loaded yet` in the console if you don't.
- A search takes ~3 s against the live API.
- **Changing only the URL hash doesn't switch games.** Use a new page (or context) per game.
- `docard()` switches to the Card view (and pushes history) unless called with
  `switchview=false`, and `dosearch()` always switches to Search, so code that re-renders a
  view that isn't on screen can yank the user's view. A new search renders its first card
  behind the scenes (`defaultcard()`), and the directory loads its first list
  (`listinfo(id,false)`) when the List view is empty.
  The menubar code re-renders only the tab on screen; test that switching from another tab
  doesn't jump.
- **List load order.** A list asked for (a `#listid` link, a directory click: `listinfo(id,true)`, `listopening`) outranks
  background loads however they finish; `activatelist` still fills the view. To test, delay the `/list` answers with
  `page.route` and try each order: directory, then the linked list, then the first list in the directory (it used to draw
  over the link), and a link answering 404 (the "private or doesn't exist" message must stay).
- Hover a menu (`page.hover`) before clicking its items; move the mouse away before
  screenshots so balloon tooltips don't cover things.

## Phone width

Narrow-screen rules live in one `@media (max-width: 768px), (pointer: coarse) and (max-height: 500px)` block (narrow screens and sideways phones) at the end of `oracle.css`
(`narrowscreen()` in `oracle.js` uses the same width). Emulate a phone with a touch context:

```js
const ctx = await browser.newContext({hasTouch: true, isMobile: true,
  viewport: {width: 390, height: 844}, userAgent: devices['iPhone 13'].userAgent});
```

- Use `page.tap()`, not `click()`, so the touch paths run (`menutap`, `pointerType`).
- Check `document.documentElement.scrollWidth` equals the viewport width in every view: any
  overflow means sideways scrolling. Balloon tooltips are always laid out (just transparent),
  so a centred `down` tooltip on a right-edge button can cause it; use `down-right` there.
- `max-width: %` on images inside the `display: table-cell` layouts collapses them to nothing;
  cap with `vw` instead.
- Search form selects are Tom Select on phones too: tap `#field_<name>-ts-control`, then an `.option` in
  `#field_<name>-ts-dropdown`. The keyboard and any zoom on focus only show on a real phone. To measure a
  dropdown, open it with a real click or tap: `tomselect.open()` from script draws no options, so it sizes to nothing.

## Cover every game

Games differ in ways that break shared code. Loop over all seven
(`l5r lbs 7thsea initiald warlord dune pathfinder-pawns`), one page each:

- `card-premium` is missing for dune and warlord; `debug` exists only for l5r.
- `databasesort[game]` / `headerize[game]` differ per game (two-level deck+type for l5r and
  lbs, type-only for the rest, Type for pathfinder-pawns). pathfinder-pawns had neither
  until Oct 2026, which made every list render throw.
- To confirm a fix, run the same script with the change stashed (`git stash`, run,
  `git stash pop`) and compare.

## Browser shortcuts

Playwright's `keyboard.press` never reaches the browser's own shortcuts, so a page's handling of Alt+Left looks
fine while the real key also goes Back. To test one, run headed under `xvfb-run` and send the key from outside with
XTest (ctypes on `libXtst.so.6`: `XTestFakeMotionEvent` over the window, then `XTestFakeKeyEvent`). Compare against
`master`: there, Alt+Left on a search result's card stepped back and then left the card for the search results.

## Faking login and the API

Headless Chromium can't do the Cognito login, so fake the logged-in state instead:

```js
await page.evaluate(() => {
  window.getidtoken = () => 'x';                       // ajax beforeSend needs a token
  cache_thing("user", "data", {cognito: {name: 'Test'},
    oracle: [{uid: 1, groups: {l5r: ['*']}, settings: {l5r: {search: 'visual'}}}]});
  $('.showonlogin').show();
  updateviewbuttons(); applyviewdefaults();
});
```

- `groups` drives admin-only UI (`fullgamepermission()`: `groups[game]` or `groups['*']`
  containing `'*'`). Test partial permissions (`{l5r: ['update']}`), another game's
  permission, and logged out (`logoutcallback()`).
- **Mock any endpoint that writes** with `page.route`, so nothing reaches prod. Not every POST is a write: `/search`
  and `/attributes` only read, and blocking `/attributes` breaks `renderlist` (`cache_select`), which looks like a bug in
  whatever runs after it. Let those through, block the rest, and record what you blocked:

  ```js
  await page.route(/api\.oracleofthevoid\.com\/user/, r => {
    const q = new URL(r.request().url()).searchParams.get('settings');
    r.fulfill({json: {cognito: {name: 'T'}, oracle: [{uid: 1, settings: {l5r: JSON.parse(q || '{}')}}]}});
  });
  ```

  Also mock the "old API" answer (ignores the parameter) to check the client reports a
  failure instead of claiming success.
- **Early vs late login.** A fresh tab with a cached user runs the login callback before
  the page has built its sorts and before templates compile. Test both orders. Seed
  localStorage and run code at `DOMContentLoaded` with an init script, and **guard it to
  the top frame**: the ad iframes run init scripts too and throw `templates is not defined`.

  ```js
  await page.addInitScript(u => {
    localStorage.setItem('l5r_user_data', JSON.stringify(u));
    if (window === window.top) document.addEventListener('DOMContentLoaded', () => applyviewdefaults());
  }, user);
  ```

## Fake lists

Lists need a login, so build one in the cache and render it. Use real card ids from a
search (`querydata` holds ids), and pick cards spread across decks and types so headers
and sorts get exercised. Fake cards without `deck`/`type` make the deck sorts throw.
Real list ids come from the API as numbers, while the toggles and `activelists` use strings: a mock with a text id like `'t1'`
hides bugs between the two (#542), so use a number when testing anything about active lists.

```js
const L = {listid: 't1', name: 'T', type: 'deck', sort: 'deck',
           list: ids.map(c => ({cardid: c, printing: cache_card_fetch(c).printingprimary, quantity: 2}))};
cache_thing("list", "t1", {list: {Items: [L]}});
cache_thing("list", "data", {lists: {Items: [L]}});
cache_thing("list", "datareverse", {t1: 0});
$("#lastlistid").val('t1');
activatetemplate('list', 'visual-deck'); renderlist(L);
```

- Deck-type lists use `sort: 'deck'` (that's what triggers `databasesort[game].deck` and
  `headerize[game].deck`); other list types use `''`.
- To test adding a card without saving it: `addlistitem('t1', id, prid, 1)`, then check
  `updatepending['t1']` (the save got queued) and `clearTimeout(savetimeout)` so the
  60 s save never fires.
- Stepping from a list card: try all five views, since Table and Deck links pass no `qs` and `listcardqs` in `docard` works it out. Check two printings of a card (two stops), a regular and a foil copy (one stop), a card not in the list (no arrows), a reload (no arrows), and taking the card's last copy out, then stepping both ways.
- The card page's count (`#cardlistbar`): add a card as printing 0 and as a printing, to see *n in all*, and pick a Version to check the bar follows it. After a click, a plain arrow must still step (the button gives up focus); from the keyboard, Enter must keep it. Going to 0 is a `confirm`.
- Count editing (Simple List and Table, `listcountready`): the count is `span.editquantity`, id
  `clist_quantity:<listid>:<cardid>:<printing>:<count>:<foil>`. The count is part of the id and changes with every save,
  so find it by prefix and foil (`[id^="clist_quantity:t1:<card>:<printing>:"][id$=":<foil>"]`). Check: click (tap on a
  touch device) opens `− [n] +`; + and − keep the focus in the box; Enter and clicking away save, Esc doesn't; 0 brings up a
  `confirm` (handle `page.on('dialog')`, dismiss then accept). Add a regular and a foil entry of one printing: both are
  editable in the Simple List and both stay plain in the Table (its template has no foil). In WebKit a tap on −/+ sends no
  `click` (its pointerdown is cancelled), so run the touch case in `devices['iPhone 13']` too.
- Version menu: `click({button: 'right'})` (mouse) or the long-press under "Handy in scripts" (touch), then the rows are `#versionmenu .versionmenuitem` (`data('prid')`, `.versionmenulegal`). `#resultlist` must hold the list `#lastlistid` names, or `liststale` skips the redraw. Set `legality` on the list item to test the ordering; Ring of Earth (l5r 6334, 35 versions) makes a good card. WebKit has no CDP long-press and `new Touch()` is illegal there: dispatch `pointerdown`, wait, then `pointerup` and an `Event('touchend')` with `changedTouches` set by hand. `touchscreen.tap` on the backdrop needs a click handler on the menu itself.
- Header rows are `cardid: 0` entries: `decktitle` rows (`div.listhead`) and `typetitle`
  rows (`div.deckviewtype` in the deck view, `.listheadplain` in Simple List). Check the
  counts text, and that each deck header appears once.
- Statistics layout: the side column/float and the **Above** / **To the side** button only
  apply at 1100px or wider (browser zoom counts), so test at 1280+ and at phone width. The
  choice is kept in localStorage (`session_liststatspinned`, and `session_liststatsopen` /
  `session_liststatskwopen` for the folds): clear them to see the defaults (to the side, both open).
  Check Simple List / Text / Table (sticky right column) and Detailed / Visual / Deck (float
  at the upper right, cards flowing round it), and in the deck view that Pre-Game sits beside
  Dynasty (`div.deckviewsmall`) when there's room, else above it (`deckviewstack`, set by `deckviewfit` on resize, pin and fold), and Fate clears (`div.listhead.deckviewbreak`). The sticky column needs `:has()` on `#maincontent` (Safari 15.4+). Each type label is wrapped with its first card
  (`span.deckviewlead`): resize through several widths and check no label is left alone at the end of a row
  (compare the label's and its first card's `getBoundingClientRect().top`). A public deck
  for these views: `#game=l5r,#listid=5372212275690645` (legal since its 2026-10-30 edit, so it no longer shows the red header note).

## Dark mode

Pick a theme before the page loads: `newContext({colorScheme: 'dark'})` for the device (`page.emulateMedia` changes it live, which Auto
should follow), or an init script setting `localStorage.session_theme` to `'"dark"'` (JSON, as `cache_session` stores it).

- **A color change that shouldn't touch light:** serve `master` and the branch side by side, and compare `getComputedStyle` color,
  background and border colors element by element in each view. Leave out the menu's Theme item if `master` hasn't got it, or everything after it is off by one.
- **Dark contrast:** walk the elements with their own text, blend the background layers up to the first solid one, and list anything under
  4:1. It can't judge text over an image or a gradient, so look at screenshots too.
- Move the mouse away first: at 0,0 it holds the first menu open. Switching views in code with the mouse over a card leaves the card peek up.
- Blocked ads leave an empty frame, which is why `ins.adsbygoogle` keeps `color-scheme: light`: dark, it draws a white block.

## Backend changes

The site, preview included, always calls the prod API, so a client feature that needs a
new API behaviour can't be tested end to end until the ootv-search change is on prod.
Test the backend half on `dev-ootv-search` first; see "Testing a route directly" in
`ootv-search/CLAUDE.md`.
