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

Keep scripts out of the repo (the deploy syncs every top-level file). The local page
talks to the **live prod API** (`apiuri`), so searching and browsing are real, but any
write is a write to production. See "Faking login and the API" below.

## Page state worth inspecting

Everything is a global, so `page.evaluate(() => ...)` can read it directly:

| Global | What it holds |
|---|---|
| `templates[database].available` | every template key with `places` (`search`/`card`/`list`), `generic`, `override` |
| `templates[database].active` / `.default` / `.compiled` | current template per view, the game's default, compiled JsRender templates |
| `templates[database].sort.search`, `.sortdir.search` | current search sort key (a JSON string) and `asc`/`desc` |
| `largeview` | per-view size toggle `{search, card, list}` |
| `currentresulttab()` / `viewbuttontype()` | tab on screen; which view the menubar buttons drive |
| `searchcache[database].querydata[qs]` | **plain card ids** for a search, not card objects |
| `cache_card_fetch(id)` | the cached card (fields are arrays: `title[0]`, `type.join()`) |
| `cache_thing(kind, key[, value])` | localStorage-backed cache (`<game>_<kind>_<key>`) |

## Timing and navigation

- Each template is fetched by its own `$.ajax` after the page loads. Wait ~3-4 s before
  rendering, and expect `templates not loaded yet` in the console if you don't.
- A search takes ~3 s against the live API.
- **Changing only the URL hash doesn't switch games.** Use a new page (or context) per game.
- `docard()` always switches to the Card tab and `dosearch()` to the Search tab (and pushes
  history), so code that re-renders a view that isn't on screen will yank the user's tab.
  The menubar code re-renders only the tab on screen; test that switching from another tab
  doesn't jump.
- Hover a menu (`page.hover`) before clicking its items; move the mouse away before
  screenshots so balloon tooltips don't cover things.

## Cover every game

Games differ in ways that break shared code. Loop over all seven
(`l5r lbs 7thsea initiald warlord dune pathfinder-pawns`), one page each:

- `card-premium` is missing for dune and warlord; `debug` exists only for l5r.
- `databasesort[game]` / `headerize[game]` differ per game (two-level deck+type for l5r and
  lbs, type-only for the rest, Type for pathfinder-pawns). pathfinder-pawns had neither
  until Oct 2026, which made every list render throw.
- To confirm a fix, run the same script with the change stashed (`git stash`, run,
  `git stash pop`) and compare.

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
- **Mock any endpoint that writes** with `page.route`, so nothing reaches prod:

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
- Header rows are `cardid: 0` entries: `decktitle` rows (`div.listhead`) and `typetitle`
  rows (`div.deckviewtype` in the deck view, `.listheadplain` in Simple List). Check the
  counts text, and that each deck header appears once.

## Backend changes

The site, preview included, always calls the prod API, so a client feature that needs a
new API behaviour can't be tested end to end until the ootv-search change is on prod.
Test the backend half on `dev-ootv-search` first; see "Testing a route directly" in
`ootv-search/CLAUDE.md`.
