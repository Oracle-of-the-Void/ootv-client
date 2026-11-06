# ootv-client

Static front end for oracleofthevoid.com. It has no build step, bundler, package.json
or tests. The files in this directory are exactly what gets served.

## Layout

- `index.html` is the single page. It loads jQuery and lodash from CDNs, plus local
  `tom-select.complete.min.js`/`tom-select.min.css` (vendored Tom Select 2.6.2, the search form's multiple selects: `tomselectify` in `oracle.js`; after setting a select's value in code, call its `tomselect.setValue`, not `sync()`, which loses the optgroups once options are picked; its `checkbox_options` boxes are reset from the picks on every drawing of the dropdown (a hook on `refreshOptions`), since the plugin only follows pick events and a box could stay ticked with nothing picked; a dropdown is as wide as its longest option, over the page, capped at the window's right edge by `--tsdropdownmax`, set on opening). Every other select with more than two options becomes a single-pick Tom Select by itself when it first scrolls into view (`tomselectauto`; `.notomselect` opts out): code keeps using the select, `.val()`, new options and hide/show/disabled are passed on, but `.value =` isn't, and the control sits right after the select, so use `.nextAll(sel)`, not `.next()`, `jsviews.min.js` and `amazon-cognito-auth.min.js`. No game has files of its own (below).
- Search engines: `index.html`'s `<title>`, description, canonical and Open Graph tags and the About page's game list are
  what crawlers and link previews see first; `pagetitle()` in `oracle.js` retitles the page per game, card and deck
  (called from `showview`, `drawcard`, `refreshlist`, `gameconfigapply`). `robots.txt` allows everything and names the sitemap. `/browse/` (card, set and deck pages, a page per part of the tool, the help topics, plus `browse/sitemap.xml`, for
  search engines) isn't in this repo: ootv-tools `seo/build.py` builds and uploads it daily, and the deploy's `--delete` sync
  excludes it. The About page's game list links each game in the app (`#game=<game>`), and `homegamesdraw` replaces it with the logos once the page runs; the Card lists line at the bottom of that page links each `/browse/<game>` and the About the tools line under it each tool page, so crawlers get a visible link from the home page as well as the sitemap. The deploy
  adds `<meta name="robots" content="noindex">` to preview's `index.html` (dev branch only). Plan and findings:
  ootv-claude `issues/ootv-client/TODO.md`, "Search engine tuning".
- `oracle.js` (~2500 lines, global functions and `var`s) holds all app logic: Cognito
  login, search (`dosearch`), card view (`docard`), lists/decks (`listinfo`,
  `addlistitem`, `renderlist`), PDF proxies (`createpdf`),
  URL routing (`urlparser`), and template switching (`activatetemplate`, `changesort`).
  `changesort` is the Sort menu's click: picking the current sort again flips A–Z/Z–A. Anything that
  restores a search (url, back/forward, game switch) sets the sort with `setsortfromrequest` instead,
  which turns the request's `"desc"` sort back into its menu key plus `sortdir` and never toggles (#585).
  The API base is `apiuri`: `https://api.oracleofthevoid.com` (prod Lambda) on the live
  site, `https://api-dev.oracleofthevoid.com` (dev Lambda) on preview and localhost. Both
  share the same DynamoDB tables and Elasticsearch, so writes are always live.
- **Game config from structure** (ootv-claude `GAME-TEMPLATES.md` §2, every game since 2026-10-23):
  each game is drawn from `GET /gameconfig`: its `<game>/game` item in `oracle-all-structure`, the
  `settings` of `<game>/fields`, and the master views in `all/templates`. `gameconfigapply()` in
  `oracle.js` fills the globals `dbinfo`, `databasesort`, `headerize`, `searchables`, `labels`,
  `templates`, `updates` (symbols) and `blurb` from it; no game has files here. The game menu comes from
  `all/games`. A new game gets structure items, not files. They're edited in Admin → Fields (the field
  list's `settings`, `show: "hidden"`), Game config and Templates (`gameconfigadmin.js`, loaded on first
  use; guide `docs/admin/game-config.md`). **A small change (one key, one flag, one mon) is a conditional
  `update_item` of only that path on the live item: ootv-tools `structure/set.py` (version check,
  `version + 1` + history entry), or the Admin editor: never push.py** (workspace `CLAUDE.md`, the user 2026-10-28). Only real bulk edits (many
  settings, a restructure, a new game's first items) go as JSON: `python3 docs/gameconfig/push.py pull DIR
  [game]`, edit, then `push.py DIR` (dry run) and `--go` (production); it refuses any item saved since the
  pull (`DIR/versions.json`). A master template that fails to
  compile or draw falls back to its newest working version from the item's history (`templatesafe`). The card
  page's shared pieces (`card-top`, `-middle`, `-bottom`, `textversion`, `textversionbutton`,
  `decklistcontrols`) are `all/templates` `partials`, put into `#all_template` by `templatepartials()`;
  nothing view-related is left in `index.html`. The old `templates/` directory (per-game `.js`, per-game
  and generic `.html` views) is gone: ootv-claude `DEPRECATED.md`.
- Layout shift (Search Console's mobile CLS, 0.54 on `/` when first tracked 2026-10-29; one page plus a tapped search
  measured 3.46 throttled, 0.05 after): anything drawn late must take its room first. Result thumbnails (`_select`) reserve 150×210 and sit
  top-aligned with a block image (`a.deckswipe:has(> img[src*="_select."])`, `oracle.css`); the search form hides its
  Advanced-only buttons and holds `#searchbottom` invisible until `#selectsloaded`; `html.bootabout` (top of `oracle.js`,
  cleared by `showview`) hides the view buttons on a load that opens the About page; `index.html`'s game list is already
  the logo tiles `homegamesdraw` draws, and their logos keep a 64px box. Measure with Playwright on a phone at 4× CPU and a
  slow network, a `layout-shift` PerformanceObserver, after load *and* after a tapped search (shifts more than 0.5s after a tap count).
- The search form's rows (`initializeform` in `oracle.js`): each label is a floated 30px `dt`, so a `dd` must be at least 30px tall or the labels drift from their fields down the form (#552). A new field type shorter than that needs the same `min-height` as the checkbox rows.
- The search sidebar on wide screens (`sidebarfit` in `oracle.js`, called from `showview`): the views in `sidebarnosearch` (Help, Bookshelf,
  Public lists) start with it collapsed; opening or closing it by hand holds for those views together, and separately for the others
  (`sidebaropen`). The ad and links under the form hide with it. The phone layout's `!important` rules ignore this. A new view with no use for the form goes in `sidebarnosearch`.
- Link color: `--link` on `:root`, applied by `:where(a[href])` in `oracle.css`, which any other link rule beats.
- Dark mode (the menu's Theme: Auto, Light, Dark; "Theme" block in `oracle.js`, the script at the top of `index.html`, `settings.all.theme` when logged in): `html[data-theme=dark]` swaps the `:root` variables at the top of `oracle.css`. **A new color goes in as a variable with a value in both blocks**; only colors on something that never changes (charcoal bars, gold buttons, card art, book pages, the black or white numbers on the card stat icons, which must set their own color: `.gc`, `.fo` and friends) stay literal. A menu inside a charcoal title bar sits on `--panel`, so it resets the bar's white text to `--text`, not to a literal (`ul.dirlistmenu`).
- Which game a load opens (top of `oracle.js`, "Default game" block): each tab has its own game. A `#game=` url says itself; a tab in use stays on its game (`tabgame` in `sessionStorage`); a newly opened tab starts on the default (`session_favoritegame`, the copy of `settings.all.game`, then `session_gamedefault`), then the last game this browser used (`session_database`). Anything that changes a tab's game sets both `tabgame` and `session_database`. With none of these `gamenotpicked` is set: L5R loads behind the front page's logos, with no Recent updates. `homegamesdraw` draws the logos from the game menu over `index.html`'s plain `.homegames` links, which stay for crawlers. A click on a logo or in the game menu goes through `gamepick`, which offers to make it the default unless `gamenoask()` (`settings.all.gamenoask`, `session_gamenoask`). Logging out and Clear Cache keep `session_gamedefault` and `session_gamenoask`.
- The home page's Recent updates (`loadupdates`): `homeupdatecount` rows at a time with an Older updates button, and each
  row fetches up to 10 whole cards, so keep the count low (30 rows was 1.7 MB). It draws `#template-homeupdate`, with plain
  labels from `homeupdatelabels`; a new operation needs one there. The admin update log keeps `#template-updatelog` and the raw names.
- Sun and Moon codes (for the S&M text export and ootv-search's `/import`): set codes are the
  `oracle-all-structure` item `l5r/snm` (`sets`), which `oracle.js` loads through `/structure` on
  the first S&M export; a printing S&M files under another edition carries its own code in the
  printing field `snmsetcode` (`docs/data.md`), which wins, and one S&M files under another card
  name ("Market Place") its `titletextsnm` (`snmlistnames`). No static copy is served.
  `docs/snm/snm-map.py` rebuilds both into `docs/snm/l5r-snm.json` after S&M updates its
  database (it reads `../SnM/.../database.xml` and the l5r export in `../ootv-backups`); then
  `python3 docs/snm/snm-push.py --go` writes the changed set codes (only those, each conditioned on its old value) and ootv-tools `printings/snm-printings.py`
  the printing codes and names. The Admin set import adds a new set's code to the item.
- `res/` and `gamelogos/` hold images, built in ootv-assets `logos/` (copy its outputs here): the site logo `res/logo.png` (300×231, shown at 75×58, also the og:image), `logo-square.png` and `favicon.ico` (16/32/48) come from `logos/ootv/make-logo.py --circle`, out of AEG's layered PSD (2026-11-04, #590). `*.min.js` and `pdfkit*.js` are vendored
  third-party code, so don't edit them. `pica.min.js` (pica 10.0.3, image resizing)
  isn't in `index.html`: the card editor's image upload (`uploadimagetrigger`) and the Admin
  mass image upload (`massimagetrigger`) load it on demand. Nor are `pdfkit.min.js` (~1.9 MB)
  and `blob-stream.min.js`: `createpdf` loads them on the first PDF (`loadpdfkit`).
- Card backs (2026-10-29, #22): the "CARD BACKS" block in `oracle.js`. `printingsides()` pairs a printing's fronts with
  their own printed backs (image `side: "back"`, or `doublesided`); fronts without one get `printing.back` or the first
  game config `cardbacks` rule that fits (`cardbackstandard`); back cards are fetched on demand (`cardbacksfetch`). The
  card page draws them through `~cardsides` in the `card-top` partial (extra fronts as "Print n of m", backs only as
  thumbnails that flip the big image), and `createpdf` uses them for Backs: Duplex. Docs: `docs/data.md`, admin
  `game-config.md` (`cardbacks`), help `cards#backs`.
- Tap speed (Interaction to Next Paint; Search Console flagged phones at 341 ms on 2026-11-05): a tap's handler shows its answer, then hands the slow drawing to `afterpaint(fn)` (after the next paint). `showview` defers `pagetitle`, `updateviewbuttons` and the Help, Bookshelf and Public lists loaders; `viewbutton` lights the button and redraws after; `docardid` from a click draws the card after; `defaultcard` (a search's first card, behind the scenes) waits too and skips if another card was drawn since (`carddrawcount`); `tomselectauto` conversions are queued (`tomselectdrain`, ~30 ms a task). Code that needs one of these done straight after calling it has to call it itself. Keep `console.log` out of anything run once per card. Measuring: ootv-claude `issues/ootv-client/TODO.md`, "Mobile INP".
- The card page's count (`cardlistbar` in `oracle.js`, `#cardlistbar`, under the card's name): a − n + per active list, for the printing showing, through `deckswipeapply` like a swipe. `drawcard` draws it, not a partial; the `card-bottom` partial's rows still do every printing. `cardlistcounts` updates it in place (from `listedited`), so a button keeps its focus.
- List header notes start at three lines (`listnotesclosed`, 4.05em in `oracle.css`); `listnotesfit` shows Show more / Show less only when they don't fit, re-measured by a `ResizeObserver` on `#resultlist`, and needs calling after a header is redrawn without `#resultlist` changing size. `listnotesopen` keeps them open per list through redraws until reload; focus opens them.
- Card swipes (`deckswipe*` in `oracle.js`, `swipedirs`/`swipedefaults`, Settings → Gestures): `a.deckswipe` in search and list views, plus the Card Details picture for a mouse only (`deckswipelink`, needs an active list). On touch, Card Details keeps the previous/next swipe (`cardswipe`), by decision. Down-right and down-left default to Nothing, and scroll until given an action.
- Public deck counts in search: the Sort menu's Public decks (`publicdeckssort`, the API ranks it) and the Detail rows' globes (`searchdeckcounts`, `publicgamecounts` keyed by game and legality) count every public deck, or with exactly one Legality searched and no Banned (`searchdecklegality`), only that format's decks; the API names the format (`group=cardcounts&legality=`). The card page's count is always every deck. Guide `docs/admin/most-played.md`.
- Stepping through results (`cardprev`/`cardnext`): a card's `qs` is the search it was opened from, or `listid=N` for a card opened with the list view on screen (`listcardqs`, in `docard`: the views' links don't say, and Table and Deck pass no qs), whose order is what `refreshlist` last drew (`listcardorder`, read from the rows' `a.deckswipe`). Anything redrawing a card takes `cardqs()`, not `#lastsearchquery`, or a list's card loses its arrows. Keys: Alt+Left/Right step too, with `preventDefault` so the browser doesn't also go Back or Forward.
- Version menu (`versionmenu*` in `oracle.js`, `listversionchange`; help `lists#versions`, Settings → Gestures `versionmenumouse`/`versionmenutouch`): right-click or long-press a card's image, title or version in the list view, on a list you can edit. On touch it shares card peek's press and takes it on these rows; the menu shows the image, and a tap on it is the full-size peek. Shift, selected text and the switch leave the browser's menu. The rows come from what the templates already draw (`versionmenutarget`: `a.deckswipe`, `.listqty[data-foil]`, the `editquantity` id), so no template change; the Deck view can't tell a regular entry from a foil one of the same printing, so both move. Versions that fit the list's legality come first (`versionmenufits`: `printingfits`, gated by `cardderived` for derived formats).
- Which list the List view shows (`listinfo` in `oracle.js`): a list someone asked for (`#listid` link, directory click) is
  `listopening` until it arrives, and background loads (the directory's first list, restored active lists, card fetches
  finishing late) only fill the cache, never the view: `liststale`, checked in `refreshlist` and `dolist`. Test: `docs/TESTING.md`.
- List edits and tabs: the cached list (`cache_thing`) is `localStorage`, shared by every tab, while `updatepending` and `listsaving` (`listunsaved`) are one tab's memory. So every edit also stamps `listdirty` (shared; `listdirtymark`), and refetches (`listinfo`, `listrevalidate`) leave the cached copy alone while it's set: without it, another tab's refetch replaced a copy with edits waiting, and the save then wrote the old cards over the server's, with no 409 (#551). The save that covered the stamp clears it; if the stamp changed during the save, another tab edited, and the cache stays. It runs out after `LISTDIRTYMS` (3 minutes), for a tab closed before saving. A new path that replaces the cached list needs the same check.
- List saves (`listinfoupdate`): a `POST /list` with the parameters as a JSON body, never a GET with them in the URL: a big
  list as `updatevalue` was over API Gateway's URL limit and never reached the server (ootv-claude `issues/ootv-search/PROBLEMS.md` #26,
  2026-11-03). A failed save (not a 409) shows a red **Not saved** in the list's Modified spot, the reason in its title. Other `/list`
  calls are still GETs; anything that can grow with the list goes as POST too.
- A list's cards (`listprefetch`): `/oracle-fetch` 50 at a time (`LISTPREFETCHCHUNK`), the chunks together, the list drawn once all
  answered. One request for a ~460-card collection was over Lambda's 6 MB answer limit (413) and the list never drew.
- Directory changes (`listdir*` in `oracle.js`): the server reads the directory through a DynamoDB index that lags writes, and a
  directory read already out when a list is created answers without it. So a directory read asked for during a create, copy or
  remove waits until it's done (`listdirbusy`, `listdirdone`), and for `LISTDIRLAGMS` (a minute) every directory answer keeps this
  tab's new lists and drops its removed ones (`listdirapply`). A new path that creates or removes a list does the same.
- Public lists filters (`publicfacetoptions` in `oracle.js`): the choices in the results first with counts, then **Others**, from one unfiltered `/publiclists` request per game and whose lists (`publicfacetbase`). The API's facets are narrowed by every filter, the pulldown's own included.
- List ids: the API's items hold numbers (`list.listid`), while `activelists` and anything from a template's `onclick` hold strings, so compare with `String(listid)` (#542). `showlisttoggle` draws a list's toggle, and `renderlisteditarea` keeps the list view's in step with the Active Lists bar.
- List counts (`40/40 (80 total)`, Pre-Game only in the total): `deckcounthtml` in `oracle.js`, for the directory (`dircount`, from the saved `summary`), the Active Lists bar (`activelistcount`: a deck's from its loaded cards on every edit, `activelistcheck`, else from the last draw, `listdeckdrawn`, redrawn by `refreshlist`; the total alone when the decks don't add up. After a deck's count there, a green/red # by its construction rules and a legality shield: `activelistmarks`, its own `/cardslegal` per card set, debounced, kept in `liststatslegalcache`) and a deck's header (`#template-listcheck`, before All cards legal for). Only the directory and public listing show the red Illegal next to it.
- Deck statistics (`liststats` in `oracle.js`, template `#template-liststats`): type counts, shares and averages
  (`liststatsavgs`; the hover shows the working). In a deck, card numbers are the deck's own (`deckcontext`,
  `deckstatvalue`: card `conditionalvalues` on the Stronghold clan, Sensei, Stronghold; `docs/data.md`), in the averages
  and the Table view (`span.deckvalue`). L5R Deck GP and Gold:Cost ratio GC: `liststatsgoldcost`. Help `lists#stats`.
- Deck construction check (`deckbuild*` in `oracle.js`, panel `listbuildform`): the game's rules, overlaid by the deck's
  legality, the deck's own changes and its cards'. The **Special** legality (`decklegalityspecial`) is a deck-only value in
  every game, added by the `deckLegalitySelect` converter (`listLegalitySelect` is the plain list, also used by import): no
  card has it, and it starts with no rules. A card not legal in the deck's legality fails the check too (`liststatslegal`,
  from `/cardslegal`), so a deck's `summary` is saved there, after that answer, not in `liststats` (`listsummaryheld`).
  A rule with `cap` (a legality's, or the panel's "cards can't change it" box) is out of cards' reach. Anything a deck changes shows: the header (`deckbuildownhtml`), the directory and public listing's Own rules (`deckbuildownmark`).
  A deck with no legality is checked again by the regular arc `/cardslegal` infers (`listbuildinferred`, `inferred`), and a card's `deckconstruction.legality` changes its own `max`, `skip`, `rules` per legality (Isawa Osugi, Oni no Kamu: not Unique in Imperial).
  Guide `docs/admin/deck-construction.md`, help `lists#stats`.
- The card editor is `cardeditor.js`, loaded on first use by `cardeditor()` in `oracle.js`: the
  whole card in memory (regular / HTML / JSON views), saved by Commit as a sequence of `/update`
  calls. Its image upload is `uploadimagetrigger` in `oracle.js`, in its own box over the editor
  (`#cardeditupload`, filled by `cardedituploadopen`). The image zoom panel's foot deletes an image and
  reorders them by dragging thumbnails (`cardeditzoomfoot`). User guide: `docs/admin/card-editor.md`.
- The Bookshelf (the Rules section until 2026-10-23; menubar book button, `#view=rules`, a shelf
  `#shelf=<key>`; a page is `#rulebook=<id>,#page=<n>`, whatever shelf the book is on) is
  `rules.js`, loaded on first use by `rulesshow()`; `rulesstate` in `oracle.js` is what the url
  says. Its shelves (Rulebooks, Newsletters) are listed by the structure item `<game>/bookshelf`, each
  shelf's books in `<game>/<key>`. The books are static files on the images bucket (`<imageuri>rulebooks/`, every shelf's), built and
  uploaded by ootv-import `SCRIPTS/rulebook-convert.py`, so adding one needs no deploy. Guide:
  `docs/admin/rulebooks.md`.
- Help (menubar ? button, `#view=help`; a section is `#help=<topic>,#helpsec=<id>`) is `help.js`,
  loaded on first use by `helpload()`; the topics are `docs/help/<topic>.md`, and `.helpq` "?"
  links next to controls show a section on hover or long-press (`helpstate` in `oracle.js` is
  what the url says). A new feature gets its help section, and a "?" where people will look for
  it. How to write them: `docs/HELP-AUTHORING.md`.
- Admin editing of someone else's list (`listadminopen` / `adminediting` in `oracle.js`): read only until
  **Edit as admin** and its popup (text version `ADMINEDITWARNING`: bump it when the wording changes), then the
  owner's controls under the red banner, with the list already active (`listadminaccept`); a save empties the list's cache until the refetch answers, so `listadminedit` holds through that gap on `listeditpermission()` alone; saves send `adminedit=1&notify=`, so **Stop editing** (`listadminstop`) waits for card saves still pending. `listsummarysave` saves the list's `summary` too, with `adminedit=1` and no `notify`, since an owner may never open the list again. Admin → Audit → Users and Audit log
  are `useradmin.js` (`POST /admin`, loaded on first use). Who may: `listeditpermission()` (explicit `listedit`
  or a site admin). Guides `docs/admin/admin-editing.md`, `docs/admin/users.md`; ootv-claude `ADMIN-EDIT-AUDIT.md`.
- Admin → Set import and Import profiles: `setimport-etl.js` (the CSV → card engine, driven by an
  import profile; also run by ootv-import `SCRIPTS/etl-compare.js` under Node) and `setimport.js`
  (the page). Both load on demand (`loadsetimport`); `setimport-preview.html` is the empty page
  the card preview's "Open in another window" opens, which `setimport.js` draws into. The server is ootv-search's `ootv-admin`
  Lambda (`/setimport`) and `/setimportverify`; the admin guide is `docs/admin/set-import.md`.
- `docs/API.md` is the API contract with ootv-search (routes, inputs, outputs).
  `docs/data.md` describes the card JSON. `oracle.api` holds scratch notes on the search
  request format.
- `docs/admin/*.md` are admin docs on site structures (first: `derived-legality.md`, the L5R
  derived legality rules and ban exceptions). The admin page links each one; `loadadmindoc()`
  in `oracle.js` fetches it and renders it with marked (loaded on demand from cdnjs). **Keep
  them current:** when you change something a doc describes (e.g. a derived rule, a ban
  exception, a count), update the doc and its "Last updated" line in the same piece of work.
  A new doc needs a link in the admin list in `index.html`. Doc-only changes still go through
  a branch → `dev` → PR to `master`, like code.
- The issue index and cache live in the workspace repo, at
  `../ootv-claude/issues/ootv-client/` (`INDEX.md`, `issues.json`), not here. Update them
  there; don't commit issue bookkeeping to this repo. Put `Fixes #N` in the feature
  branch → `master` PR body so GitHub closes the issue when the PR merges.

## Conventions

- Match the existing style: jQuery, global functions, `$.ajax` callbacks, 4-space or
  tab indentation (it is mixed, so follow the surrounding lines). Don't introduce
  modules, frameworks or a build.
- Card fields are arrays (`a.title.join()`). Templates must guard against missing fields.
- balloon.css sets `position: relative` on every `[aria-label][data-balloon-pos]`, which beats a
  plain class selector: a positioned element with a balloon tooltip needs a more specific
  selector, or use `title` (as the list stats **Above** / **To the side** button does).

## Deploy

`.github/workflows/deploy.yml` runs `aws s3 sync --delete` of the repo root:
- `dev` → `preview.oracleofthevoid.com` (CloudFront `E2S43UTDKL45NF`)
- `master` → `oracleofthevoid.com` (CloudFront `E6ECGAAP7LNKR`)

A push to `master` also runs `discord-push`, which finishes first: to wait for a deploy, watch the run named `Deploy`
(`gh run list --workflow deploy.yml`), then check `version.json`.

Browsers pick up a deploy without a hard reload. `.github/stamp-version.sh` stamps the
checkout with the commit: local `.js`/`.css` refs in the top-level `*.html` get `?v=<sha>`,
`var ootvversion` in `index.html` gets the sha, and it writes `version.json` (the sha plus a UTC
`timestamp`, shown on the admin page with when this browser cached each select). `.js` and `.css` are then served `immutable` for a year, the pages, `version.json` and `docs/admin`
as `no-cache`, and images for a day. CloudFront gzips text files on both distributions (`Compress` on the default
cache behavior, since 2026-10-30; no brotli, which would need a cache policy instead of the legacy cache settings). So anything new that `oracle.js` loads at runtime from
this repo needs `'?v='+ootvversion` on its URL (see the cardeditor.js, help.js and pica loads), or
browsers keep a stale copy for a year. CloudFront ignores query strings, so the deploy
uploads assets, invalidates and waits (the deploy roles need `cloudfront:GetInvalidation`),
then uploads the pages. A tab left open across a deploy checks `version.json` when it comes
back into view (`checkversion`) and offers a reload. Locally `ootvversion` is `'dev'` and
the check is off.

`*.md`, `*.drawio`, dotfiles and `docs/` are excluded from the sync, except `docs/admin/`
(published so the admin page can show those docs; the repo is public anyway, so nothing secret goes there). Any other new file at the
top level gets published, so keep scratch files out of the repo.

## Branch workflow

1. Do each feature or fix on its own branch, cut from `master` (e.g. `pdf-options`,
   `fix/<thing>`), and push that branch to GitHub.
2. Merge the branch into `dev` and push `dev` to test it on preview. Several features
   can sit on `dev` at once. Don't commit features directly on `dev`.
3. When a feature is ready, open a PR from **its own branch** to `master` (not
   `dev` → `master`), so features ship individually. Merging to `master` deploys prod,
   so ask the user first.
4. After a merge to `master`, merge `master` back into `dev` and push, to keep `dev`
   in sync.

Pushing feature branches and `dev` doesn't need confirmation; pushing or merging to
`master` does, **except for `.md`-only changes** (`CLAUDE.md`, `docs/**/*.md`).
Commit those straight to `master` and push without asking or opening a PR, then merge
`master` into `dev` and push `dev`. If a commit touches any non-`.md` file, the normal
workflow applies. `docs/admin/*.md` is the one `.md` path that is published to the site.

## Testing

There are no automated tests. To check a change, serve the directory locally (e.g.
`python3 -m http.server`) and load `index.html`. It talks to the live prod API, so
read-only browsing is safe, but editing cards or lists while logged in writes real data.

For headless checks, use Playwright with Chromium (installed globally; see the workspace
`CLAUDE.md`). Run scripts with `NODE_PATH=$(npm root -g) node script.js` against
`http://localhost:<port>/#game=l5r,#cardid=...` or preview. Use a fresh browser context
to reproduce a first visit: selects are cached in `localStorage`, so a reload behaves
differently from a cold load. `page.route()` can delay `/attributes` to force that race.

Handy in scripts: `viewbutton('<template>')` switches the results/list view (`search`, `visual`, `list`
= Simple List, `visual-deck`, `table`), and a long-press is CDP `Input.dispatchTouchEvent` touchStart, a wait,
touchEnd, in a `devices['Pixel 7']` context. A list template's `img` `src` can start with blank lines (the
`{{if}}` around `fetchimage`): compare `img.src`, not `getAttribute('src')`.

**Every UI change: check it in WebKit too**, not only Chromium: `webkit.launch()` with
`devices['iPhone 13']` and `devices['Desktop Safari']`, alongside the phone-size and desktop
Chromium checks. Many users are on iPhone/Safari, and Safari-only breakage has shipped before
(#473: iOS Discord hands Safari deck links with the second `#` escaped as `%23`). WebKit setup,
including the no-sudo libraries: the workspace `ootv-claude/ENVIRONMENT.md`, Playwright section.
WebKit doesn't run on extreme6 (no Playwright build for Ubuntu 18.04): there, say the WebKit check is still
to do, and do it on another machine or a real iPhone.

`docs/MOBILE.md` lists the remaining mobile/touch work and what still needs a real-phone check.
`docs/TESTING.md` has the detailed techniques: faking login and admin groups, mocking
API writes, early vs late login timing, fake lists, and per-game differences to cover.
