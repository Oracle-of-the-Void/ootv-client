# ootv-client

Static front end for oracleofthevoid.com. It has no build step, bundler, package.json
or tests. The files in this directory are exactly what gets served.

## Layout

- `index.html` is the single page. It loads jQuery and lodash from CDNs, plus local
  `chosen.jquery.min.js`/`chosen.min.css` (vendored Chosen 1.8.7; the CSS needs the
  `chosen-sprite*.png` files beside it), `jsviews.min.js`, `amazon-cognito-auth.min.js`
  and the per-game `templates/<game>.js`.
- `oracle.js` (~2500 lines, global functions and `var`s) holds all app logic: Cognito
  login, search (`dosearch`), card view (`docard`), lists/decks (`listinfo`,
  `addlistitem`, `renderlist`), PDF proxies (`createpdf`),
  URL routing (`urlparser`), and template switching (`activatetemplate`, `changesort`).
  The API base is `apiuri`: `https://api.oracleofthevoid.com` (prod Lambda) on the live
  site, `https://api-dev.oracleofthevoid.com` (dev Lambda) on preview and localhost. Both
  share the same DynamoDB tables and Elasticsearch, so writes are always live.
- **Game config from structure** (ootv-claude `GAME-TEMPLATES.md` §2, every game since 2026-10-23):
  each game is drawn from `GET /gameconfig`: its `<game>/game` item in `oracle-all-structure`, the
  `settings` of `<game>/fields`, and the master views in `all/templates`. `gameconfigapply()` in
  `oracle.js` fills the globals `dbinfo`, `databasesort`, `headerize`, `searchables`, `labels`,
  `templates`, `updates` (symbols) and `blurb` from it; no game has files here. The game menu comes from
  `all/games`. A new game gets structure items, not files. To edit the items as JSON until the Admin
  editor exists: `python3 docs/gameconfig/push.py pull DIR [game]`, edit, then `push.py DIR` (dry run)
  and `--go` (production). `templates/template-*.html` (the generic views: list, text*, visual*, pdf,
  table, debug) are still in the repo, copied into `all/templates` when it was first written.
- Sun and Moon codes (for the S&M text export and ootv-search's `/import`): set codes are the
  `oracle-all-structure` item `l5r/snm` (`sets`), which `oracle.js` loads through `/structure` on
  the first S&M export; a printing S&M files under another edition carries its own code in the
  printing field `snmsetcode` (`docs/data.md`), which wins. No static copy is served.
  `docs/snm/snm-map.py` rebuilds both into `docs/snm/l5r-snm.json` after S&M updates its
  database (it reads `../SnM/.../database.xml` and the l5r export in `../ootv-backups`); then
  `python3 docs/snm/snm-push.py --go` writes the set codes and ootv-backups `snm-printings.py`
  the printing codes. The Admin set import adds a new set's code to the item.
- `res/` and `gamelogos/` hold images. `*.min.js` and `pdfkit*.js` are vendored
  third-party code, so don't edit them. `pica.min.js` (pica 10.0.3, image resizing)
  isn't in `index.html`: the card editor's image upload (`uploadimagetrigger`) and the Admin
  mass image upload (`massimagetrigger`) load it on demand.
- The card editor is `cardeditor.js`, loaded on first use by `cardeditor()` in `oracle.js`: the
  whole card in memory (regular / HTML / JSON views), saved by Commit as a sequence of `/update`
  calls. Its image upload is `uploadimagetrigger` in `oracle.js`. User guide:
  `docs/admin/card-editor.md`.
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

## Deploy

`.github/workflows/deploy.yml` runs `aws s3 sync --delete` of the repo root:
- `dev` → `preview.oracleofthevoid.com` (CloudFront `E2S43UTDKL45NF`)
- `master` → `oracleofthevoid.com` (CloudFront `E6ECGAAP7LNKR`)

Browsers pick up a deploy without a hard reload. `.github/stamp-version.sh` stamps the
checkout with the commit: local `.js`/`.css` refs in the top-level `*.html` get `?v=<sha>`,
`var ootvversion` in `index.html` gets the sha, and it writes `version.json` (the sha plus a UTC
`timestamp`, shown on the admin page with when this browser cached each select). `.js`, `.css` and
`templates/*` are then served `immutable` for a year, the pages, `version.json` and `docs/admin`
as `no-cache`, and images for a day. So anything new that `oracle.js` loads at runtime from
this repo needs `'?v='+ootvversion` on its URL (see the template, snm and pica loads), or
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

`docs/MOBILE.md` lists the remaining mobile/touch work and what still needs a real-phone check.
`docs/TESTING.md` has the detailed techniques: faking login and admin groups, mocking
API writes, early vs late login timing, fake lists, and per-game differences to cover.
