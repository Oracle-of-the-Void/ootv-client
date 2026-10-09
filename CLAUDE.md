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
  third-party code, so don't edit them.
- `docs/API.md` is the API contract with ootv-search (routes, inputs, outputs).
  `docs/data.md` describes the card JSON. `oracle.api` holds scratch notes on the search
  request format.
- `docs/issues/` is a local cache of the GitHub issues: `issues.json` (raw `gh` output,
  with comments) and `INDEX.md` (issues grouped by type and overlapping functionality).
  Refresh with the command in `INDEX.md`. Index edits go out in the same `dev` → `master`
  PR as the fix, so write the state after the merge (the issue is closed and released
  in PR #N), not "fixed on `dev`". Put `Fixes #N` in the PR body so GitHub closes
  the issue when the PR merges.

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
