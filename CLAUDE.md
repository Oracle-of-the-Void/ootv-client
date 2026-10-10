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
  `addlistitem`, `renderlist`), card editing (`editcard*`), PDF proxies (`createpdf`),
  URL routing (`urlparser`), and template switching (`activatetemplate`, `changesort`).
  The API base is `apiuri = "https://api.oracleofthevoid.com"`.
- `templates/<game>.js` registers a game by filling the globals `dbinfo[game]`,
  `databasesort[game]`, `headerize`, `searchables`, `labels` and `templates`. Copy an
  existing game (e.g. `dune.js`) when adding one, and add its `<script>` tag to `index.html`.
- `templates/template-<game>-<key>.html` holds the JsRender templates for one game
  (`card`, `search`). Generic ones (`template-list.html`, `template-text*.html`,
  `template-visual*.html`, `template-pdf.html`) have no game prefix. They are fetched
  at runtime: `"templates/template-" + (generic ? "" : database + "-") + key + ".html"`.
- `res/` and `gamelogos/` hold images. `*.min.js` and `pdfkit*.js` are vendored
  third-party code, so don't edit them. `pica.min.js` (pica 10.0.3, image resizing)
  isn't in `index.html`: the card editor's image upload (`uploadimagetrigger`) loads it on demand.
- `docs/API.md` is the API contract with ootv-search (routes, inputs, outputs).
  `docs/data.md` describes the card JSON. `oracle.api` holds scratch notes on the search
  request format.
- The issue index and cache live in the workspace repo, at
  `../ootv-claude/issues/ootv-client/` (`INDEX.md`, `issues.json`), not here. Update them
  there; don't commit issue bookkeeping to this repo. Put `Fixes #N` in the `dev` →
  `master` PR body so GitHub closes the issue when the PR merges.

## Conventions

- Match the existing style: jQuery, global functions, `$.ajax` callbacks, 4-space or
  tab indentation (it is mixed, so follow the surrounding lines). Don't introduce
  modules, frameworks or a build.
- Card fields are arrays (`a.title.join()`). Templates must guard against missing fields.

## Deploy

`.github/workflows/deploy.yml` runs `aws s3 sync --delete` of the repo root:
- `dev` → `preview.oracleofthevoid.com` (CloudFront `E2S43UTDKL45NF`)
- `master` → `oracleofthevoid.com` (CloudFront `E6ECGAAP7LNKR`)

`*.md`, `*.drawio`, dotfiles and `docs/` are excluded from the sync. Any other new file at the
top level gets published, so keep scratch files out of the repo. Push to `dev` and
check preview before going to `master`. Ask the user before pushing either branch.

## Testing

There are no automated tests. To check a change, serve the directory locally (e.g.
`python3 -m http.server`) and load `index.html`. It talks to the live prod API, so
read-only browsing is safe, but editing cards or lists while logged in writes real data.

For headless checks, use Playwright with Chromium (installed globally; see the workspace
`CLAUDE.md`). Run scripts with `NODE_PATH=$(npm root -g) node script.js` against
`http://localhost:<port>/#game=l5r,#cardid=...` or preview. Use a fresh browser context
to reproduce a first visit: selects are cached in `localStorage`, so a reload behaves
differently from a cold load. `page.route()` can delay `/attributes` to force that race.

`docs/TESTING.md` has the detailed techniques: faking login and admin groups, mocking
API writes, early vs late login timing, fake lists, and per-game differences to cover.
