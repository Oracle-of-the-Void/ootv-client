## API gateway endpoints

### Not needing Authentication

* [/attributes (POST or GET)](#attributes)     -> Pulls attributes from games (for use in pull-downs)
* [/oracle-fetch (GET)](#oracle-fetch)  -> Get cards by cardid
* [/search (POST)](#search)                    -> Search cards, return results
* [/verify-jwt (POST)](#verify-jwt)            -> For use in authentication
* [/oracle-structure (GET)](#oracle-structure) -> Returns information about games (templating, etc)
* [/oracle-updatelog (POST or GET)](#updatelog)-> Fetch information about recent updates
* [/visit (GET)](#visit)                       -> Anonymous daily visitor ping

### Needing Authentication

* [/user (GET)](#user)                          -> Verify user account and return user data 
* [/user (POST)](#user-post)                    -> Change your own name, add or remove your emails
* [/import (POST)](#import)                     -> import decks/lists from external files
* [/list (GET)](#list)                          -> deck/list handling routines
* [/update (POST)](#update)                     -> database modification routines
* [/upload (POST)](#upload)                     -> presigned S3 URLs for uploading card images
* [/loginlog (GET)](#loginlog)                 -> sign-in log for the admin page (site admins only)
* [/discord (GET, POST)](#discord)            -> Discord bot settings for the admin page (site admins only)
* [/setimport (POST)](#setimport)              -> Admin set import and import profiles (ootv-admin Lambda)
* [/setimportverify (POST)](#setimportverify)  -> after a set import: the written cards vs search

## Note

In general, when table is required for most things, oracle- is added as a prefix and used as the table name for dynamodb, index name for elastic.  This is a general selector to get to the game desired.

## /updatelog

Retrieves information from the updatelog about recent updates

inputs:

* table (required)
* limit (default 10, at most 30)
* mintime (optional) -> only pulls updates more recent than this.
  * Meant to periodically poll with the last most recent updates, will get empty results if nothing is newer
* maxtime (optional) -> only pulls updates older than this. With mintime, pins a fixed window (used by the tests).
* fetchcards (optional)
  * brings back data from the updates:  use to display info on the updates and overwrite local cache entries
  * fetches at most the first 10 cardids of each log row; `cardids` is still complete
* filters (optional, combined with AND; the admin Update log uses them):
  * operation -> comma list of exact operations (`update,bulkupdate`)
  * uname -> case-insensitive part of the maintainer's name
  * q -> case-insensitive text in the description, name or operation, a cardid, or part of a
    card title (up to 1000 matching titles are looked up in ES; rows naming any of them match)
  * a filtered request reads the log 200 rows at a time until `limit` rows match
* facets (optional) -> also return every maintainer name and operation in this table's log

outputs:

* logs -> array of hash entries, starting with most recent
  * database
  * cardids (array)
  * operation
  * uname (of maintainer performing update)
  * timestamp  (standard millisecond unix timestamp)
  * uid  (of maintainer)
* cardids  (array of all cardids in returned results)
* next -> pass as maxtime to get the following (older) page; null at the end of the log
  (an unfiltered page that ends exactly at the end of the log can still return a `next`, whose page is empty)
* cards (if fetchcards set) - array of cards in cards.hits.hits (empty when no rows came back)
* facets (if facets set) -> `{unames: [...], operations: [...]}`, sorted

codes:

* 200: success
* 5xx: failure

## /attributes

Retrieves an array of options suitable for a select pulldown.


Handled by lambda: oracle-attributes


inputs:

* table (required)
* lookup (required) "field" to aggregate
  * single attribute name, or two attribute names separated by colon (field1:field2)
* optgroup (optional)
  * pulls optgroups (e.g.  Arc/Format/etc for legality) if true value

outputs:
* single: array of values (similar to SELECT distinct field from table)
* double returns an hash with keys of field1, and values of all field2 contained by cards with field1
  * E.G.   {"regular set a": { "R", "U", "C" },"promo dtp set b": { "F" }}
* optgroup: returns array of hashes
  * E.G.   [{"Arc":[blah,blah,blah]},{"Format":[blah,blah,blah]}]

codes:

* 200: success
* other: errors returned by elasticsearch.Client passed through

## /oracle-fetch

Retrieves cards by cardid

Handled by lambda: oracle-fetch/index.js

inputs:

(querystring parameters from a GET)
* table (required)
* cardid (required)
  * single cardid, or comma-separated list

outputs:

* single: JSON.stringified card entry
* multiple: JSON.stringified array of card entries

codes:

* 200: success
* 404: cards not found
* other: errors returned by DynamoDB.DocumentClient passed through

## /search

Searches for cards

Handled by lambda: oracle-search/search.js

inputs - sent in body querystring:

* table (required)
* sort (optional)
  * default: [{'title.keyword': {"order" : "asc"} }]
  * "random": random order
  * any other valid elastic sort clause
  * `<field>.keyword` sorts are case-insensitive (the API swaps them for a script sort)
* sortmode (optional) - how `.keyword` sorts compare text, all case-insensitive
  * "lex" (default): plain A–Z
  * "punct": skip leading punctuation and spaces (`"Guest" of the Chuda` under G)
  * "library": like punct, and also skip a leading "a", "an" or "the"
* size (optional - defaults to 50)
  * Pagination page size
  * tops out around 1000, please don't abuse this and run more than once a day
* from (default 0)
  * Pagination page number (0 indexed)
* querystring (optional)
  * string to do an elastic query_string (operator AND)
* pairs of field_xxx (contains the data) and type_xxx (defines the operation)
  * type_xxx = 'regexp'
    * Does elastic regexp
    * somewhat useless, only works on individual keywords, basically a fuzzy 'select', as below
  * type_xxx = 'wildcard'
    * accepts arbitrary elastic searches
  * type_xxx = 'text' OR 'match_and'
    * does an elastic match (operator AND)
  * type_xxx = 'match_or'
    * does an elastic match (operator OR)
  * type_xxx = 'match_phrase' OR 'keyword'
    * elastic match_phrase
  * type_xxx = 'select'
    * checks terms against the .keyword part of a text field  (can be multi-value)
  * type_xxx = 'exists'
    * if parameter has a value, returns cards that contain the field with data
  * a select field's value can be a derived name (e.g. l5r `Legacy`, `Paper`) from the game's
    `attributes.<field>.derived` config; the API expands it into its rule
* require_xxx (optional, one or many values)
  * every value must match, ANDed with the rest of the search (field_xxx ORs its values)
  * each value is a derived name or a stored value; no type_xxx needed
  * e.g. `field_legality[]=Legacy&require_legality=Paper` = Legacy cards that are paper. The
    l5r "Paper only" checkbox sends `require_legality=Paper`

outputs:

* elasticsearch results
  * .took: time it took
  * .timed_out: true/false
  * .hits.total: number of results
  * .hits.hits: array of cards

codes:

* 200: success

## /verify-jwt

I think I was just using this as a tool to help debug auth issues.

Handled by lambda: oracle-verify-jwt/index.js

TODO: Need more documentation here, and to verify if it's in use.

## /oracle-structure

Pulls information about databases (templates, etc)

inputs:

* database
  * game to pull from
* key
  * type of info to pull
    * template


outputs:

* JSON of data

codes:

* 200: success
* 404: not found
* 5xx: error

## /user

Pulls user data from DynamoDB based on email in cognito payload (after verifying validity of cognito tokens submitted).  Then return user's entry.

Handled by lambda: oracle-user/index.js

inputs:

* Header: Authorization (required)
  * tokens from Cognito
* database (with settings)
* settings (optional): JSON object of client settings for that database, saved to the user's `settings[database]`
  * any object up to 4096 bytes and 4 levels deep; the client checks values before using them
  * today: `{"search": "<template key>", "card": "<template key>", "list": "<template key>", "sort": "<searchsorts key>", "sortdir": "asc"|"desc", "sortmode": "lex"|"punct"|"library"}`
    plus `"mobile": {same keys}`: phones (narrow screens) save and read their own set there
  * plus `"folders": ["Tournament", "Tournament/2026", ...]`, the directory folders (so empty ones last); a list's own folder is its `folder` field
  * the Settings page's "Save" buttons under Saved views (all, or search/card/list view or sort alone, merged into what's saved); the client applies them when the user loads

outputs:

* {cognito:{name: payload.name,email: payload.email,email_verified: payload.email_verified},oracle: userdata.Items}
  * with settings, the returned user already has the new `settings`
  * payload is the cognito token information
  * userdata.Items is the user info from DynamoDB

codes:

* 200: success
* 400: bad database or settings
* 404: not found
* other: passed from various actions

## /user (POST)
<a id="user-post"></a>

Changes the signed-in user's own row in `oracle-all-users` (issue #21). The body is JSON; `action` picks what to do.

* Header: Authorization (required)

| action | body | does |
|---|---|---|
| (none) | `firstname` (required, 1-50 chars), `lastname` (0-50; empty clears it) | sets the name. Shown in the menu bar and Settings; `/update` and `/upload` log it as `uname` on card edits from then on. Neither may contain `< > & "` or control characters. |
| `addemail` | `email` | emails a 6-digit code to the address (expires in 15 minutes) and sets `emailpending: {email, expires}`. At most one code a minute and 5 a day. 400 if the address is already on the account. |
| `verifyemail` | `email`, `code` | with the right code, adds an `oracle-all-emails` row (lowercase) and appends the address to `emails`. 5 wrong codes and it's dropped. 409 if the address already belongs to another account (a merge, done by hand). |
| `cancelemail` | | drops `emailpending` |
| `removeemail` | `email` | removes the address from `emails` and deletes its `oracle-all-emails` row, then emails the removed address a notice. Not the address in the token (the one you're signed in with). The answer has `warning` if the notice couldn't be queued. |

The emails go out through the `oracle-all-mail` outbox and the `oracle-mailer` Lambda (ootv-search `mailer/`). Only the code's hash is stored, and neither GET nor POST returns it.

outputs:

* same shape as GET: {cognito: payload, oracle: [the updated user]}

codes:

* 200: done
* 400: bad input, wrong or expired code, unknown action
* 404: no user for the token's email; `removeemail` for an address not on the account
* 409: address belongs to another account, or the user changed while saving
* 429: asked for codes too often

## /import

Handles deck / list importing from text files

Handled by lambda: oracle-search/import.js

Note: I'm restricting the card search to 1000 results for bounding, this is a number pulled out of a hat and may need adjustment

Note: I'm returning this as list/failed to allow the front-end application to determine if it wants to continue or not instead of just stuffing it into a list directly.
There is theoretically a little more flexibility here in that lists can be created / manipulated without saving them.

inputs: form/multipart

* table (required)
* name=file cardlist (required)
  * text file, one card per line.
  * leading numbers are treated as quantity
  * anything after a parenthesis or comment is stripped for purposes of searching
  * leading/trailing whitespace stripped after the above two things are removed
  * blank links after stripping are ignored
* fieldlist (required)
  * fields to match on in priority order: comma-separated
  * e.g: textsnm,puretexttitle,title
    * Sun and Moon adjusted title
    * Common text representation of title ( Big Dog &amp;149; Experienced  ->  Big Dog - exp )
    * title
  * puretexttitle and textsnm would only exist if they differ from the others
  * more fields may be added as they are found

outputs:

* list: { {cardid: x, quantity: x, printing: x }, ... }
* failed: array of failed lines in input (blank lines after stripping ignored)   TODO: maybe we should return blanks somehow?

codes:

* 200 success

## /list

Handles deck/card lists

Handled by lambda: oracle-list/index.js

inputs:

* Header: Authorization (required)
  * tokens from Cognito
* uid (required)
  * uid of user to search for lists of.
* listid (optional)
  * 'new': create new list
    * json (optional): the whole new item as JSON (name, list, public, type, folder, ...); it replaces the defaults
  * '': retrieve metadata for all lists for current user
  * otherwise needs to be a valid listid owned by the user, or set public by another user
* database (required for 'new' or '' listid)
  * basically the same as table elsewhere, but psuedo-optional here
* updatefield (optional)
  * ignored if 'new' operation happening
  * user must be the list's owner
  * one of ['name','notes','public','type','list','legality','folder']
    * list name, list notes, public flag, list type, list data: { {cardid: x, quantity: x, printing: x }, ... }, legality,
      directory folder: a path like "Tournament/2026" ('' = top level; trimmed, at most 255 characters).
      Empty folders live in the user's settings[database].folders (see /user settings)
  * if this is set we update that field of the list (updatevalue), and modified, except for folder
  * TODO: when updating 'list' field, we should have a field that has the quantity of cards in it that gets updated as well, so general listing can have that info
* action (optional)
  * remove
    * delete that list

outputs:

*  listid ''
  * lists.Items: array of { createdate, listid, notes, public, owner, game, name, modified, type, legality, folder, totalcount, distinctcount }
  * doesn't return actual lists as that can be quite lengthy.
* listid set or new listid
  * elastic returning the list
  * list.Items[0]
    * createdate
    * listid
    * notes
    * public
    * owner
    * game
    * name
    * modified
    * list (array of { {cardid: x, quantity: x, printing: x }, ... } )
* listid 'new'
  * same as above, but data is in list.Item (no array... difference between Dynamo and elastic)  TODO: eventually eliminate this difference
  * list initial blank array
  * name is "New List"
  * listid randomly generated
* remove
  * "Delete queued"

codes:

* 200 success
* 404 user not found
* 403 not owner of list
* 500 failed to create 64 bit int and not collide with another in 10 tries (new list)  if we start seeing this, we adjust the random generation


## /update

Handles database manipulation

Handled by lambda: oracle-update/index.js

inputs:

* Header: Authorization (required)
  * tokens from Cognito
* uid (required)
  * uid of user to search for lists of (has to match cognito info)
  * allowed groups are pulled from user information
  * groups are in the form of database:operation, where either can be "*"
* cardid (required for all operations but "new")
* database
  * which card database to edit
* data
* updateprintingprimary (optional)
  * used for newinstance only
* printingid (optional)
  * used for updateinstance / removeinstance
* operation (required)
  * new
    * new card: generate cardid
    * data is an ARRAY of cards to add
    * returns ARRAY of cardids
  * newinstance
    * add another instance to that card
    * to make new instance the MRP set updateprintingprimary=true
  * update
    * data is a hash that all keys in the hash replace keys in the card
    * printing is invalid, use new/update/remove instance instead
  * updateinstance
    * data is a hash that all keys in the has replace keys in the instance hash
    * printingid is required
  * removeinstance
    * delete that instance
    * printingid is required
  * remove
    * delete that card:   data stored in oracle-all-updatelog

outputs:

* Generally, the changes
  * changes are also logged to the item, and to oracle-all-updatelog
* new
  * cardids - array of new cardids
  * errors - count of errors
  * errormessage - Error messages
    * Note: the only general errormessage is overwriting a card, but oracle SHOULD write that card back and then try insert again with new cardid.  This will likely ONLY happen if multiple new cards are added by different people within the same millisecond or two.
* update / updateinstance / newinstance / removeinstance
  * The things that are changed are returned.
    * in the case of instance things, the entire printing array is returned
  * olddata/newdata also added to "updatelog" in item
* remove
  * the removed card is returned

codes:

* 200 success
* 404 user not found
* 403 not owner of list
* 500 database error
* 500 missing required fields

## /upload

Presigned S3 PUT URLs for card images, used by the card editor's image upload (#12) and the
Admin page's mass image upload (no cardid; one call per 3 images, all sharing one updatelog row).
The browser PUTs straight to the images bucket, so the files never go through API Gateway.

Handled by lambda: ootv-search/routes/upload.js

inputs: JSON

* Header: Authorization (required)
  * tokens from Cognito
* uid (required)
  * same check as /update: the groups must allow `updateinstance` (or `*`) for the database
* database (required)
* imagehash (required)
  * the directory under the game's imageuri: one name, letters, digits, `_` or `-`
* files (required): 1-10 of `{name, contentType}`
  * name must end `_master`, `_details` or `_select`, with `.png`, `.jpg` or `.jpeg`
  * contentType must match (`image/png` or `image/jpeg`)
* overwrite (optional)
  * without it, `If-None-Match: *` is signed into the URL and S3 refuses (412) to replace an existing file
  * with it, each file that already exists is first copied to `<name>.bak-<UTC time>.<ext>` in the same
    directory and listed in the image trash (`oracle-all-imagetrash`, reason `replaced`). If a copy fails,
    no URLs are returned.
* check (optional)
  * `true`: only report which of the files exist (up to 3000 names; contentType not needed, no updatelog row)
* cardid, printingid (optional)
  * recorded in the updatelog row (see below)
* logbatch, logid (optional): one updatelog row for a run of calls (the mass upload)
  * `logbatch: true` on the first call opens the row; the reply's `logid` is its timestamp
  * `logid` on the later calls adds their files to that row
* done (optional, with logid and no files): `{uploaded, failed, existing, replaced}`, the run's outcome,
  written as the row's description ("uploaded 135 images to l5r/CRIII/")

outputs:

* urls: `[{name, key, url, headers}]`. PUT the file to `url` with exactly `headers`.
* expires: seconds the URLs are valid (900)
* backups: `[{name, backup}]`, the copies made with overwrite
* logid: the timestamp of the updatelog row this call wrote or added to
* with check: only `exists: [{name, size, lastmodified}]`

Both clients ask before replacing: the card editor checks and waits for a second press of Upload image,
and the mass upload lists the files to replace and needs its own tick.
/update also lists in the image trash every image a card stops pointing at (`updateinstance`,
`removeinstance`, `remove`; reason `unlinked`).

Each call adds an `upload` row to oracle-all-updatelog: database, uid, uname, timestamp,
`cardids` (`[cardid]`, or `[]` without one), printingid, imagehash, `files` (names) and overwrite.
A batch (logbatch/logid) has one row instead, with `batch: true`, `files` (the `_master` names only),
`count` (URLs handed out), `backupcount`, and the description and `result` from the done call.
It records the URLs handed out. The PUTs go straight to S3, so the server can't tell whether
they succeeded, and files that are uploaded but never saved to a card are still listed.

Afterwards, save the image on the printing with /update `updateinstance`, using the modern layout
only: `imagehash` plus `image: [{master, details, select}, ...]`, and no `printimagehash` (see data.md).
A printing has one `imagehash` directory, so every image of the printing goes there, and a new image
is appended to `image`, not swapped in. The card editor converts a legacy printing on the way: it copies
`<printimagehash[i]>/printing_<cardid>_<printingid>_{master,details,select}.jpg` byte for byte into the
directory (adding `_<i+1>` after the first, since legacy directories reuse the same names) and lists
them first.

## /loginlog

Sign-in log for the Admin tab's "Login log" view, newest first.

Handled by lambda: ootv-search/routes/loginlog.js

Only site admins can read it (`groups['*']` includes `'*'`): the rows hold every user's email and IP.
Otherwise it returns 403. The token's email must be one of the uid's emails (404 if not).

Inputs (query string):
* uid: required
* limit: entries per page, default 50, max 100
* before: the `next` cursor from the previous page, to get older entries

Output: `{entries, next}`
* entries: `[{time, result, name, email, provider, newDeviceUsed, ip, reason, userAgent}]`
  * result `login`: a successful sign-in (Cognito post-authentication trigger), with name, email,
    provider (`Google`, `LoginWithAmazon`, `Cognito`) and newDeviceUsed
  * result `failed`: a failed hosted-UI password login, polled from CloudTrail every 10 minutes.
    Cognito redacts the username, so these have ip, reason and userAgent but no user.
* next: cursor for the page after, or null on the last page

Data: DynamoDB `oracle-all-logins`, read through its `feed-time` index. Written by the
`cognito-post-auth` Lambdas in ootv-search.

## /discord

Settings for the ootv-discord bot, for the Admin tab's "Discord bot" view.

Handled by lambda: ootv-search/routes/discord.js

Site admins only, checked as for `/loginlog` (403 otherwise; 404 if the token's email isn't one
of the uid's).

`GET /discord?uid=<uid>` returns `{rows, games, commands}`: every row of `oracle-all-discord`,
the games a row can name, and the bot's commands.

`POST /discord` (JSON body):
* `{uid, action: 'put', row}` replaces the row `row.guild` + `row.channel` and returns `{row}`.
  * guild: Discord server ID. channel: Discord channel ID, or `*` for the server's own row
  * name: label (the API can't look Discord names up)
  * game: default game, or empty to make users pass `game:`
  * filters: `[{field, values, require}]`, at most 5, 1–10 values each; needs a game. Values
    are ORed; with `require: true` they must all match (`require_<field>` on `/search`)
  * commands (`*` row only): `{card: 'oracle', search: 'search'}`, the commands registered in
    that server under those names. Leave it out for every command under its own name.
* `{uid, action: 'delete', guild, channel}` removes one row.

Bad input returns 400 with `{error}`. Every saved row gets `updated` and `updatedby`.

## /visit

Anonymous visitor count. `sendvisit()` in `oracle.js` keeps a random UUID in localStorage
(`ootv_vid`) and calls this once per browser per UTC day (`ootv_vidday` holds the last day sent).
It is off locally (`ootvversion == 'dev'`). Count the results with ootv-search `scripts/visitors.sh`.

Handled by lambda: ootv-search/routes/visit.js

Inputs (query string):
* vid: required, a UUID (400 if it isn't one)
* game: the current game (`database`)
* li: 1 when signed in

Writes one `oracle-all-visits` row per vid per day (`vid` + `day`; `time`, `env` (`dev` or `prod`),
`game`, `loggedin`, `userAgent`). A repeat for the same day is a no-op. No IP is stored.
Always returns 204 with no body, even when the write fails.

## /setimport

The Admin page's Set import and Import profiles (`setimport.js`; the admin guide is
`docs/admin/set-import.md`). Handled by the `ootv-admin` Lambda (ootv-search `admin/`), which
runs outside the VPC so it can reach the Lambda API (pausing the search stream) and start
DynamoDB exports. It can't reach Elasticsearch, so the search check is
[/setimportverify](#setimportverify).

inputs: JSON `{uid, database, action, ...}`, with the Cognito token in `Authorization`. The uid's
groups must allow `setimport` (or `*`) for the game or for every game.

| action | input | output |
|---|---|---|
| `profiles` | | `{profiles: [{name, description, version, updated, uname, profile, history: [{version, updated, uname}]}]}` |
| `profile` | `name` | one profile, with `history[].profile` (the last 10 versions) |
| `saveprofile` | `name`, `profile` (JSON), `version` (the one edited; 0 for new) | the saved profile; 409 if it changed meanwhile |
| `deleteprofile` | `name`, `version` | `{deleted}` |
| `setup` | | `{sortregex, arcs: [{name, regex}], snm: {sets} or null}` |
| `check` | `set`, `imagehash`, `snm` | live cards with the set, files in the image directory, sort position, arcs, S&M code |
| `register` | `set`, optional `position` + `pattern` (sort), `arc` or `newarc: {name, at}`, `snm` | `{changes, coldstart, before, after}` |
| `plan` | `params`, `profile: {name, version}`, `cards: [{file, reprint, card}]`, `overrides: {file: {cardid or "new", primary}}`, `description`, `registration` | `{job, ready, problems, warnings, infos, counts, cardids, new: [...], reprints: [...]}` |
| `jobs` | | the last 30 imports of the game |
| `job` | `job`, optional `rows: true` | the import's state (`status`, `export`, `mapping`, `written`, `conflicts`, ...) |
| `export` | `job`, optional `fresh` | `{export: {status, snapshot, items, s3}}` |
| `apply` | `job` | one step: `{status: pausing / applying / resuming / applied, written, left}` or `{blocked: [...]}` |
| `reindex` | `job`, `cardids` (of this import) | `{sent}`: re-sent to search through dynamo-to-es |
| `finish` | `job`, `verify` (the check's result) | `{status: "done", eserrors, coldstart}` |

`plan` re-checks the browser's cards (one printing each, of this set and image stub) and stores
what apply will write in `oracle-all-setimport`. Apply writes only from there. The browser
calls `apply` until it says `applied`: planned → pausing (stream disable requested) → applying
(40 writes a call) → resuming (bulkupdate row written, stream re-enabled) → applied. An import
idle for 10 minutes with the stream paused gets the stream back and the status `interrupted`;
`apply` continues it.

## /setimportverify

After a set import's apply: compares every card the import wrote with its copy in search, as
ootv-import's `set-import.py verify` does. Handled by lambda: ootv-search/routes/setimportverify.js

inputs: JSON `{uid, database, job}` with the Cognito token; same permission as /setimport.

outputs: `{checked, matched, mismatched: [{cardid, why}]}`

