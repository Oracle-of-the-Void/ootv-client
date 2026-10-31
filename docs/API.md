## API gateway endpoints

### Not needing Authentication

* [/attributes (POST or GET)](#attributes)     -> Pulls attributes from games (for use in pull-downs)
* [/oracle-fetch (GET)](#oracle-fetch)  -> Get cards by cardid
* [/search (POST)](#search)                    -> Search cards, return results
* [/oracle-structure (GET)](#oracle-structure) -> Returns information about games (templating, etc)
* [/gameconfig (GET)](#gameconfig)             -> A game's config in one request (or every game's Discord block)
* [/oracle-updatelog (POST or GET)](#updatelog)-> Fetch information about recent updates
* [/visit (GET)](#visit)                       -> Anonymous daily visitor ping
* [/publiclist (GET)](#publiclist)             -> Read a public deck/list without logging in
* [/publiclists (GET)](#publiclists)           -> Search every public deck/list (the Public lists view)
* [/trade (GET)](#trade)                       -> Trade matching over lists open to trade (the Trades view)

### Needing Authentication

* [/user (GET)](#user)                          -> Verify user account and return user data 
* [/user (POST)](#user-post)                    -> Change your own name, add or remove your emails
* [/import (POST)](#import)                     -> read a pasted or uploaded deck/list's cards
* [/list (GET)](#list)                          -> deck/list handling routines
* [/update (POST)](#update)                     -> database modification routines
* [/upload (POST)](#upload)                     -> presigned S3 URLs for uploading card images
* [/loginlog (GET)](#loginlog)                 -> sign-in log for the admin page (site admins only)
* [/admin (POST)](#admin)                      -> user lookup/edit and the audit log for the admin page (site admins only)
* [/discord (GET, POST)](#discord)            -> Discord bot settings for the admin page (site admins only)
* [/setimport (POST)](#setimport)              -> Admin set import and import profiles (ootv-admin Lambda)
* [/setimportverify (POST)](#setimportverify)  -> after a set import: the written cards vs search
* [/messages (GET, POST)](#messages)          -> Messages between users (the Messages view)

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


Handled by lambda: ootv-search/routes/attributes.js


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

Handled by lambda: ootv-search/routes/fetch.js

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

Handled by lambda: ootv-search/routes/search.js

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
* rulings (optional): `1` keeps `ruling` and `rulingref` in the hits (the Discord bot's `/rulings`)
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
  * field_banned: cards with a `legalityderivedexception.remove` entry; field_legality / field_printing_legality, if any, say which
    names it must hold, and don't otherwise filter (admin `derived-legality.md`, "Bans")
  * type_xxx = 'exists'
    * if parameter has a value, returns cards that contain the field with data
  * type_xxx = 'numeric', with field_lower_xxx (min) and/or field_upper_xxx (max)
    * card fields: matches the plain number or `numrange.xxx`, the integer range dynamo-to-os indexes
      for every numeric field, by overlap, min and max in one clause: `*`/`X` cards (0 up) match any
      range they touch, `2*` is 2, `+5/+0` is 5 or 0, a card's `variablevalues.xxx` wins
      (`docs/admin/field-descriptions.md`, since 2026-10-28); `conditionalvalues` (a value in a deck of
      some clan) is never searched
    * printing fields (`field_lower_printing_xxx`): plain range on the number
    * a min that isn't a number (e.g. `*`) is an exact match on `xxx.keyword` instead
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
    * without `updatelog`, `ruling` and `rulingref` (they made big answers pass Lambda's 6 MB limit;
      ootv-search PROBLEMS.md #21). In their place `_source.updatelast` (the newest updatelog row's
      timestamp, ms), `rulingcount` and `rulingrefcount` (left out when 0). The whole card comes
      with `/oracle-fetch`: the card page fetches it for a card with rulings or Rules Q&A, and the
      update log when "Latest Updates" opens

codes:

* 200: success

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

## /gameconfig

Handled by lambda: ootv-search/routes/gameconfig.js. Public, read only, `Cache-Control: no-cache`.

`GET /gameconfig?database=<game>`: everything the client needs to draw a game (`gameconfigapply()`
in `oracle.js`), from `oracle-all-structure`, without the items' `history`:
* `database`, `version` (the items' versions joined, to tell a stored copy is current)
* `games`: `all/games` (the game menu)
* `game`: `<game>/game`, or null for a game with no config
* `fields`: `{all, game}`, `all/fields` and `<game>/fields`
* `templates`: `all/templates`

400 without a valid `database`.

`GET /gameconfig?discord=1`: what the Discord bot (ootv-discord `src/games.js`) reads at cold start,
in one request so it doesn't wake several API containers at once:
* `games`: `all/games` (preview flags included; the bot leaves those games out)
* `discord`: `{<game>: <game>/game's discord block}` for each game in the menu that has one
  (`docs/admin/game-config.md`)

## /user

Pulls user data from DynamoDB based on email in cognito payload (after verifying validity of cognito tokens submitted).  Then return user's entry.

Handled by lambda: ootv-search/routes/user.js

inputs:

* Header: Authorization (required)
  * tokens from Cognito
* database (with settings)
* settings (optional): JSON object of client settings for that database, saved to the user's `settings[database]`
  (`database=all`: settings for every game, such as `theme`, `game`, `textversion`, `gestures`)
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
| (none) | `firstname` (required, 1-50 chars), `lastname` (0-50; empty clears it), `displayname` (optional, 0-50; empty clears it, left out leaves it as is) | sets the name. Shown in the menu bar and Settings; `/update` and `/upload` log it as `uname` on card edits from then on. `displayname` is what others see as the owner of your public lists (`ownername`); without one they see your initials. None may contain `< > & "` or control characters. |
| `addemail` | `email` | emails a 6-digit code to the address (expires in 15 minutes) and sets `emailpending: {email, expires}`. At most one code a minute and 5 a day. 400 if the address is already on the account. |
| `verifyemail` | `email`, `code` | with the right code, adds an `oracle-all-emails` row (lowercase) and appends the address to `emails`. 5 wrong codes and it's dropped. 409 if the address already belongs to another account (a merge, done by hand). |
| `cancelemail` | | drops `emailpending` |
| `messaging` | `acceptmessages` (boolean), `messageemail` (`each` \| `off`), either or both | messages from other users ([/messages](#messages)). `acceptmessages: false`: nobody can start a conversation with you, and all your lists stop being open to trade. `messageemail: 'off'`: no email on new messages. The defaults (`true`, `each`) are stored as no field. |
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

## /trade
<a id="trade"></a>

Trade matching (ootv-claude `TRADE-LISTS.md`). No auth: it reads only lists their owners opened to trade
(`/list` `updatefield=trade`), which are public, and only `tradeable` ones (owner has a display name, accepts
messages, hasn't gone quiet for 60 days).

| param | |
|---|---|
| `mode` | `cards` or `matches` (required) |
| `game` | required |
| `cardid` | `cards`: one or more card ids (comma-separated) |
| `side` | `cards`: `have` (default, who has them) or `want` |
| `owner` | `matches`: the uid whose trade lists are matched |

outputs:

* `cards`: `{side, traders: [{owner, ownername, ownerlastseen, lists: [{listid, name, type}], cards: [entry]}]}`
* `matches`: `{mine: {wants, haves, lists}, traders: [{owner, ownername, ownerlastseen, lists, theyhave: [entry], theywant: [entry], score: {theyhave, theywant}}]}`, two-way matches first
* entry: `{cardid, title, quantity, printing, foil, listid}`, plus `yours` in matches (your quantity of it)

Matching is by card. A known printing on both sides must agree, and `foil` must agree unless either side says `either`.

## /messages
<a id="messages"></a>

Messages between users, one conversation per pair (`threadid` = `<smaller uid>-<larger uid>`).

* Header: Authorization (required); `uid` (query or body) must be the token's user

| request | does |
|---|---|
| `GET ?uid=` | inbox, newest first: `{threads: [{threadid, other, othername, lastmessage, lastfrom, unread, subject, muted, blocked, reported}], unread, next}`; `&before=<next>` for the next 50 |
| `GET ?uid=&unread=1` | `{unread}`: unread messages, not counting muted or blocked conversations |
| `GET ?uid=&threadid=` | a conversation, marked read: `{thread, other: {uid, name}, names, messages: [{msgkey, from, text, context, time}], next}`, 50 at a time, oldest first. 404 if there's none yet. A site admin can read a conversation one side reported |
| `POST {uid, to, text[, context]}` | send. `text` plain text, up to 2,000 characters. `context` `{game, listids, cardids}` (a trade) is kept on the message. Needs a verified email and a display name; 20 new conversations and 200 messages a day. 403 when blocked or the recipient doesn't accept messages |
| `POST {uid, action: mute\|unmute\|block\|unblock, other}` | mute: no email or unread count from them; block: no messages either way |
| `POST {uid, action: report, threadid[, reason]}` | emails the site admins; they can then read the conversation |

The recipient gets one email per conversation until they read it (none if muted or `messageemail` is `off`). It
names the sender and links to `#view=messages`; it never carries the message text.

## /import

Reads a deck / list as text and finds its cards; nothing is saved. Used by the list menu's
Import (`importlist`, `importlisttrigger` and `importlistfinalize` in `oracle.js`), which sends a pasted
list as the `file` part (`pasted.txt`), so a paste and a file read the same. When its **Printings from**
is set (it starts on the list's legality; a derived format is sent as its base: Jade Extended → Jade),
the client puts a `Legality: <arc>` line in front of the text. The client then saves the result:
Replace as the whole list, Add by counting matching entries (same card, printing, foil) up.

Handled by lambda: ootv-search/routes/import.js (its header comment has the full matching rules)

Note: the card search is capped at 1000 results, a number pulled out of a hat that may need adjustment.
Lines are searched 25 at a time (the 4096 clause limit).

Note: the result comes back as list/failed so the front end can ask before loading it, instead of
just stuffing it into a list.

inputs: form/multipart

* table (required)
* name=file cardlist (required)
  * text, one card per line
  * a leading count is the quantity: `3 `, `3x `, `3 x ` (not the `1` of "1,000 Cuts Technique")
  * `#` starts a comment; blank lines are skipped
  * `Title (Set)`: the printing from a Sun and Moon edition code, else a set name or set initials
  * a trailing `[foil]` / `[foil or not]` sets the entry's `foil` (`foil` / `either`)
  * `Legality: <arc>` (`_` read as a space): the following lines get the newest printing whose
    legality is that arc ("Emperor" is Age of Conquest (Emperor), "Ivory" finds "(Ivory Edition)"),
    by the set order the site uses (arc group, then `printing.set` `sortregex`; the later stored
    printing on a tie), skipping `notmrp` printings, as the site's legality search picks (since
    2026-10-29, ootv-search #152); a later Legality line takes over.
  * a line no title matches falls back to the title without punctuation or a leading "The"/"A", then
    the name before a comma (the experienced level kept), each only when one card fits, then a
    fuzzy search on the name (typos)
* fieldlist (required)
  * fields to match on in priority order: comma-separated
  * the client's choices: `textsnm,puretexttitle,title,alttitle` (Sun and Moon; also matches a
    printing's `titletextsnm`) and `puretexttitle,title` (Native Oracle, or a plain card list)
    * textsnm: Sun and Moon adjusted title
    * puretexttitle: common text representation of title ( Big Dog &amp;149; Experienced  ->  Big Dog - exp )
    * title
  * puretexttitle and textsnm only exist if they differ from the others
  * a title several cards share (Border Keep) gets the plain card, not a variant

outputs:

* list: [ {cardid: x, quantity: x, printing: x[, foil: "foil"|"either"]}, ... ] (printing 0: none picked,
  the card's default printing)
* failed: array of failed lines in input (blank lines after stripping ignored)

codes:

* 200 success
* 500 bad input (no table, file or fieldlist) or a search error: `{error}` (e.g. "fieldlist needed"),
  which the client shows

## /list

Handles deck/card lists

Handled by lambda: ootv-search/routes/list.js

inputs:

* Header: Authorization (required)
  * tokens from Cognito
* uid (required)
  * uid of user to search for lists of.
* listid (optional)
  * 'new': create new list
    * json (optional): the whole new item as JSON (name, list, public, type, folder, ...); it replaces the defaults.
      The server's own fields (`source`, `ownername`, `owner`, `listid`, `rev`) are dropped from it
  * '': retrieve metadata for all lists for current user
  * otherwise needs to be a valid listid owned by the user, or set public by another user
* database (required for 'new' or '' listid)
  * basically the same as table elsewhere, but psuedo-optional here
* updatefield (optional)
  * ignored if 'new' operation happening
  * user must be the list's owner
  * one of ['name','notes','public','type','list','legality','folder','deckconstruction','summary']
    * list name, list notes, public flag, list type, list data: { {cardid: x, quantity: x, printing: x }, ... }, legality
      (any text; the client's menu offers the game's formats, plus Special on a list's own Legality menu),
      directory folder: a path like "Tournament/2026" ('' = top level; trimmed, at most 255 characters).
      Empty folders live in the user's settings[database].folders (see /user settings)
  * summary: what the directory shows without the cards, `{"decks": [{"name", "copies"}], "buildbad": true|false, "clan": "..."}`
    (copies per deck, in deck order, at most 10; whether the deck construction check fails, its rules or a card not legal in the deck's format; optional `clan`, plain
    text, at most 60 characters: the first Stronghold whose clan has a mon, drawn before the list's name). The client saves it
    after drawing one of the user's own lists, or one being edited as an admin (`listsummarysave()`); '' removes it. The lists index copies
    `buildbad` into its summaries for the public listing's Illegal mark
  * if this is set we update that field of the list (updatevalue), and modified, except for folder and summary
  * saving `list` also adds 1 to the list's `rev` and returns the new one as `rev`
* baserev (optional, with updatefield=list)
  * the `rev` the client's edits started from (0 if the list has none yet). The save only goes through if
    that's still the list's `rev`; otherwise it answers **409** with `list` (the current item, `list.Items[0]`),
    and the client merges its changes into it and saves again (#337). Without baserev, the last save wins.
  * TODO: when updating 'list' field, we should have a field that has the quantity of cards in it that gets updated as well, so general listing can have that info
* action (optional)
  * search (no listid; database required): the [/publiclists](#publiclists) search over this user's own lists,
    private ones too, with the same parameters and answer (`game` is `database`; `owner` is ignored: always you).
    Each hit also has `public`. The client's My lists (`publicmine()` in `oracle.js`) and the card view's folder
    link (`cardid=N&minqty=1&size=0`, its `total`) use it. A save reaches it within seconds (the index's stream)
  * remove
    * delete that list (owner only, 403 otherwise)
  * duplicate
    * your own list: a copy named "Copy of <name>"
    * someone else's public list (the list view's "Copy to my lists"): a private copy, with no `folder`, that
      keeps where it came from in `source: {listid, owner, ownername, name, modified, copied}` (plus the
      original's own `source` inside it, when that was a copy too). `source` stays even if the original is
      deleted or made private; only the server writes it

outputs:

*  listid ''
  * lists.Items: array of { createdate, listid, notes, public, owner, game, name, modified, type, legality, folder, totalcount, distinctcount, summary }
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
    * source (a copy of someone else's list; see duplicate)
    * someone else's public list: also `ownername` (their display name, else initials such as "A.L.", else
      "another player"), and no `folder`. Escape it when showing it
* listid 'new'
  * same as above, but data is in list.Item (no array... difference between Dynamo and elastic)  TODO: eventually eliminate this difference
  * list initial blank array
  * name is "New List"
  * listid randomly generated
* remove
  * "Delete queued"

codes:

* 200 success
* 404 user not found, or no such list
* 403 not owner of list
* 500 failed to create 64 bit int and not collide with another in 10 tries (new list)  if we start seeing this, we adjust the random generation

## /publiclist

GET, no authentication (ootv-search `routes/publiclist.js`): a list whose `public` is true, for shared
deck links (`#game=<g>,#listid=N`) opened without logging in. Logged in, `/list` with the listid
returns another user's public list too.

Call it as a CORS simple request: no `Authorization` or `Content-Type` header (the route has no
OPTIONS preflight), so don't pass `contentType` to `$.ajax`.

inputs:

* listid (required)

outputs:

* list.Items[0]: the list, as from `/list` with a listid, without `folder` (the owner's directory filing),
  with `ownername` (as `/list` gives for someone else's list)

codes:

* 200 success
* 400 no listid
* 404 no such list, or it isn't public (the same answer, so a link doesn't show whether a private list exists)


## /publiclists

GET, no authentication (ootv-search `routes/publiclists.js`). Searches the public lists (an OpenSearch
index of every list, which this route sees only the public ones of, with its cards' titles and, for l5r, the stronghold, clan and the formats all of a
deck's cards are legal in; ootv-search `CLAUDE.md`, "Public lists search"). The client's Public lists view
(`#view=public`, `#publiclists=<query>`, `publicsearch()` in `oracle.js`) calls it. Send it as a CORS simple
request, like `/publiclist`.

inputs (a value list can be repeated or comma separated):

* game (required)
* q: text over list name, notes, owner name and card titles
* card: lists with a card whose title matches (phrase); a number (`1234` or `#1234`) is that card id, as `cardid`
  (for two cards with the same title)
* cardid: lists with all of these cards; minqty: at least this many copies of each (the client sends `minqty=1`:
  the card page's "in N public decks" count is `cardid=N&minqty=1&type=deck&size=0`, its `total`)
* type, clan, stronghold (title), owner (uid)
* format: the deck's format (`derived.format`: the list's own legality, else inferred, see `derived.formatsource`)
* cardslegal: formats every card must be legal in (all given); winner=1: lists with a tournament result
* empty=1: include lists with no cards
* sort: `modified` (default), `name`, `size`, `created`, `relevance` (the default with q)
* from, size (at most 50, default 20)
* group: `people` or `formats` returns, instead of hits, `groups[]` over the same filters (the client's People /
  Formats views). `people`: one row per owner, most lists first, paged with from/size (`groupstotal`: how many owners),
  each `owner, ownername, types {deck: n, collection: n, ...}, formats[]`. `formats`: every deck format at once (decks
  only; `format` '' for none), each `format, people, source {owner, name, cards}`. Both: `lists, precon, tournament,
  wins, latest`.
  `cards` (the client's Most played view): one row per card in the decks found (decks only), paged with from/size
  (`groupstotal`: how many different cards), each `cardid, title, type[], decks` (decks with at least one copy) `,
  copies` (summed over them); `order=decks` (default) or `copies`, `cardtype` (one or more) narrows to those card
  types. It answers `order` and `facets` too: the usual ones plus `cardtype` (different cards per type, ignoring the
  `cardtype` filter).
  `cardcounts` (the Detail search results' globes): every card's deck count at once, unpaged:
  `{total, group, counts: {cardid: decks}, complete}`. `decks` is the card page's count (decks with at least one
  copy); only cards in a deck are in `counts`; `complete` is false if it was cut short (more cards than it takes).

outputs:

* total, from, size, sort
* hits[]: `listid, game, public, type, name, notes` (plain text, first 300 characters), `owner, ownername, legalitylabel`
  (the owner's own legality label), `created, modified, totalcount, distinctcount, buildbad, sourcelistid`, `award {event, result, year}`, `derived`
  (`stronghold {cardid, title}, clan, sensei, wind, fatecount, dynastycount, format, formatsource` (`owner` | `name` | `cards`),
  `cardslegal[], unknowncards`; `fatecount`/`dynastycount` follow the game config's `sort.pick` `moves` for the list's
  own legality: L5R Sensei count as Fate in Jade and Imperial decks), and with
  cardid, `card {cardid, quantity}` for the first cardid
* facets: `type, clan, stronghold, format`, each `[{value, count}]` over the whole result; `winner`: a count

codes:

* 200 success
* 400 no game


## /cardslegal

POST (form: `table`, `cardids=1,2,3`, optional `format`), no authentication (ootv-search `routes/cardslegal.js`): the formats every one of
these cards is legal in, for the list view's "All cards legal for" line (`liststatslegal()` in `oracle.js`). It looks
only at the cards, not at the deck's size or copy limits; the client adds its `illegal` to the deck construction check
(the summary's `buildbad`). Proxy cards (type Proxy or legality Not Legal (Proxy)) are left out. Answers `{cardslegal: [...], unknown:
<cards not found>}`; 400 without a table or with over 5000 cards. With `format` (the list's legality) it also answers
`format` and `illegal: [{cardid, title}]`, the cards not legal in it; `illegal` is null for a value the game doesn't
check, such as Proxy or a deck's Special.

## /list action=award, action=precon

`/list?uid=&database=&listid=N&action=award&award=<json>` sets a tournament result `{event, result, year}` on any list
(empty `award`: removes it). Moderators only: `groups[<game>]` or `groups['*']` holding `listaward` or `*` (403
otherwise). Answers `{award}`. Owners can't set it, and a copy doesn't keep it.
`action=precon&precon={"product": ..., "year": ...}` marks a pre-constructed deck (starter, learn-to-play) the same
way (`product` required). `/publiclists` takes `precon=1` and returns `precon` and a `precon` facet count.

## /list: admin edits of anyone's list

Who: `groups[<game>]` or `groups['*']` holding the explicit op `listedit`, or a site admin (`groups['*']` holding `*`).
A plain `*` in a game's own groups is **not** enough (ootv-search `lib/admin.js` `listeditallowed`; the client's
`listeditpermission()`). Admin guide: [admin-editing.md](admin/admin-editing.md).

* Reading any list, private ones too, answers `adminedit: true` (with `ownername`): "this admin may edit it". The client
  still shows it read only, with an **Edit as admin** button.
* `action=adminopen&warning=<popup version>&notify=0|1`: the admin accepted the popup. Writes an audit row
  (`listedit-open`) and answers `{adminopen: true}`; 403 without the permission (audited as `denied`).
* Saves (`updatefield`, `baserev` as for the owner) on someone else's list need `adminedit=1`, plus `notify=1` to email
  the owner (mailer template `listedited`, at most once an hour per admin and list). Without `adminedit=1`, or for
  `folder` (the owner's filing), 403. The client's `summary` saves send no `notify`, so they never email the owner. Each save writes an audit row (`listedit-save`: field, old/new value,
  or the card changes for `list`) **before** the write; if the row can't be written, nothing is saved.
* Deleting (`action=remove`) stays the owner's.

The client keeps the lists being edited in memory only (`adminediting` in `oracle.js`): a reload ends editing, and any
save still waiting (card edits go 15 s after the last one) never goes out. Accepting the popup also makes the list active, and saves in the gap while a save's refetch is out still send `adminedit=1`. **Stop editing** waits for those saves. A 409's
`list` is the bare item, without `adminedit` or `ownername`: the client keeps its own, or its merged save would be refused.

## /update

Handles database manipulation

Handled by lambda: ootv-search/routes/update.js

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
  * fields
    * save field descriptions (`oracle-all-structure` `<database>`/`fields`; database `all` for the
      ones every game shares; ootv-search `lib/fielddescs.js`). No cardid.
    * data is `{card: {<field>: text}, printing: {<field>: text}}`, only the descriptions being
      changed; an empty text removes one
    * version (required): the item's version when it was loaded, 0 for none yet; 409 if it has
      moved on since
    * returns `{message, version, fields, changed}`; each save is kept in the item's `history`
      (last 50: who, when, old and new text)
    * read them with `/structure?database=<database>&key=fields`
    * settings (optional): `{card: {<field>: {...} | null}, printing: {...}}`, each field's whole
      settings in the field list (label, short, search, show `card`/`internal`/`hidden`, role,
      searchkey), null to drop them; checked and saved with the descriptions as one version
  * artists
    * save or delete an artist entry (`oracle-all-artists`, shared by every game; ootv-search
      `lib/artists.js`). database must be `all`; permission `artists` (or `*`) in `groups['all']`
      or `groups['*']`. No cardid.
    * `action: 'put'`: name (the credit, the item's key), data `{links: [{url, label, archived?}],
      aliasof, fandom, note}`, the whole entry (fields left out or empty are removed)
    * `action: 'delete'`: name; the old item is kept in `oracle-all-updatelog` (database `artists`,
      operation `artistdelete`). Refused while other entries are aliases of it
    * version (required): the entry's version from `GET /artist?all=1` (its updatelog length), 0
      for a new one; 409 if it has moved on since
    * an alias (aliasof set) has no links or fandom of its own, must point at an entry that isn't
      an alias, and an entry with aliases can't become one
    * returns `{message, name, version, changed}`; the item's `updatelog` row has `source: 'editor'`
  * gameconfig
    * save a game's config (`oracle-all-structure` `<database>`/`game`: info, rows, sort, headers,
      views, search, labels, symbols...; ootv-search `lib/gameconfigsave.js`). No cardid.
    * data is the whole item body (no database/key/version/history); version (required) as for
      `fields` (0 for a new game), 409 if stale
    * permission: `gameconfig` (or `*`) on the game
    * returns `{message, version, changed}` (`changed`: the parts that differ); history keeps the
      last 50 saves, the newest with the earlier copy (`old`) while the item stays under ~300 KB
  * templates
    * save the master templates (`all`/`templates`: `standard`, `views`, `partials`); database `all`; data and
      version as for `gameconfig`
    * site admins only: full permission on every game (`*` in `groups['*']`)
    * `changed` lists `views.<view>` for each view and `partials.<name>` for each partial that changed
  * limits
    * save the per-level limits of a photo feature (`all`/`artphoto`: Search by photo; `all`/`artcheck`:
      Find the artist); database `all`, `key` naming it, data `{limits: {<level>: {day, minute}}}` (whole
      numbers from 0), `version` as for `gameconfig` (409 when stale); the item's `note` is kept
    * site admins only: full permission on every game (`*` in `groups['*']`)
    * returns `{message, version}`; history keeps the last 20 saves with the old limits

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
* 404 user not found, or no such list
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
(the only one since 2026-10-18): `imagehash` plus `image: [{master, details, select}, ...]` (see data.md).
A printing has one `imagehash` directory, so every image of the printing goes there, and a new image
is appended to `image`, not swapped in.

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

## /admin

Site admins only (`groups['*']` includes `'*'`; 403 otherwise; 404 if the token's email isn't one of the uid's).
The Admin → Audit → Users and Audit log pages (`useradmin.js`). Answers hold emails and names: don't cache them.

Handled by lambda: ootv-search/routes/admin.js

Input: POST JSON `{uid, action, ...}`
* `usersearch` `{q}`: an email (exact), a uid, or part of a name / display name / email (a scan) → `{users: [{uid,
  firstname, lastname, displayname, email, emails, insert_date}], more}` (at most 50). Audited (`user-search`).
* `userget` `{target}`: → `{user, lists: {<game>: {lists, public}}, logins: [{time, result, provider, ip, newDeviceUsed}]}`.
  `user` is the users row without `settings`, `emailsends` or the pending code's hash, plus `patreon`. Audited (`user-view`).
* `useredit` `{target, field, ...}`, one change, conditional on the value just read (409 if it changed), audited
  (`user-edit`, old and new) before the write; answers as `userget` (+ `warning`):
  * `field: 'name'`: `firstname` (required), `lastname`, `displayname` (`''` clears it; resyncs their public lists)
  * `field: 'groups'`: `groups` `{<game> | '*': [ops]}`; `{}` removes them. Your own `groups['*']` must keep `*`.
  * `field: 'addemail'`: `email`, added at once (no code); 409 if it belongs to another account
  * `field: 'removeemail'`: `email`, not the last one; the address gets the `removed` notice
* `auditlog` `{from, to, admin?, target?, limit?}`: days `YYYY-MM-DD` (UTC, at most 31), by admin uid or target
  (`list#<id>`, `user#<uid>`) → `{rows, more}`, newest first (default 500, max 2000).

Data: DynamoDB `oracle-all-auditlog` (ootv-search `lib/auditlog.js`, `infrastructure/create-auditlog-table.sh`).
Row: `{day, id, time, admin, adminname, action, target, result, game, owner, field, old, new, cards, cardsmore,
warning, listpublic, notify, notified, query}`. Append-only (the API's role is denied update and delete on it), kept for good.

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

## /artist

`GET /artist?name=<credit>` (public, no auth): an artist's links from `oracle-all-artists`, the table
shared by every game. `name` is the credit exactly as stored in `printing[].artist`. Returns
`{name, aliasof?, links: [{url, label, archived?}], fandom?, note?}`; an item with `aliasof` (the same
person under another credit) answers with that item's links. 404 when the name has no item. The card
page's artist modal (`artistmodal` in `oracle.js`) calls it.

`GET /artist?all=1` (public): every entry for Admin → Artists (`artistsadmin.js`), as
`{artists: [{name, version, updated?, links?, aliasof?, fandom?, note?}]}` sorted by name, without
the updatelog (`version` is its length, `updated` its last row's time). Saved with `/update`
operation `artists`.

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
| `match` | `params`, `cards: [{file, reprint, card}]`, `overrides` | `{set, live, secs, counts, rows: {file: {status, cardid, title, how, cands, near}}}`: status new / reprint / duplicate / unmatched / ambiguous / missing (read-only) |
| `plan` | `params`, `profile: {name, version}`, `cards: [{file, reprint, card}]`, `overrides: {file: {cardid or "new", primary}}`, `description`, `registration`, `csv: {name, text}` | `{job, ready, problems, warnings, infos, counts, cardids, new: [...], reprints: [...], duplicates: [...]}` |
| `jobs` | | the last 30 imports of the game |
| `job` | `job`, optional `rows: true` | the import's state (`status`, `export`, `mapping`, `written`, `conflicts`, ...) |
| `export` | `job`, optional `fresh` | `{export: {status, snapshot, items, s3}}` (optional: `apply` doesn't require one) |
| `apply` | `job` | one step: `{status: pausing / applying / resuming / applied, written, left}` or `{blocked: [...]}` |
| `reindex` | `job`, `cardids` (of this import) | `{sent}`: re-sent to search through dynamo-to-os |
| `finish` | `job`, `verify` (the check's result) | `{status: "done", eserrors, coldstart}` |

`plan` re-checks the browser's cards (one printing each, of this set and image stub) and stores
what apply will write in `oracle-all-setimport`. Apply writes only from there. The browser
calls `apply` until it says `applied`: planned → pausing (stream disable requested) → applying
(40 writes a call) → resuming (bulkupdate row written, stream re-enabled) → applied. An import
idle for 10 minutes with the stream paused gets the stream back and the status `interrupted`;
`apply` continues it.

## /artcheck

The Admin page's Artist check and the card editor's Check artist (`artcheck.js`; the admin guide
is `docs/admin/artist-check.md`). Handled by the `ootv-admin` Lambda (ootv-search
`admin/artcheck.mjs`), which only queues and reads jobs in `oracle-all-artcheck`: a worker on our
LAN (ootv-tools `artcheck/worker.py`) does the check and writes the result. Nothing is written to
cards.

inputs: JSON `{uid, database, action, ...}`, with the Cognito token in `Authorization`. Groups
allowing `artcheck` (or `*`) for the game or for every game: level `admin`, every action. Any other
permission on the game (whoever may search by photo; the Photo button's Find the artist): level
`member`, only `queue` with an `image`, within the `all/artcheck` limits (429 when used up), and
`job` for their own jobs.

| action | input | output |
|---|---|---|
| `queue` | `cardid`, `printingid` (the printing must have an image; admins) | `{job, worker}` |
| `queue` | `image` (a JPEG or PNG data URL, 4 MB at most), `kind` (`card` or `art`), `name` | `{job, worker, left: {day, minute}}` |
| `jobs` | optional `after` (a page's `next`) | `{jobs: [...] (newest first, 50), next, worker}` |
| `job` | `id` | `{job, worker}` |
| `sigsubmit` | `id` (a finished job of yours, or any for admins), `artist` | `{submission}`: an admin's is filed in the catalogue at once (`status: approved`), anyone else's is `pending` |
| `sigqueue` | optional `pending` (true: waiting ones only), `after` (admins) | `{submissions: [...] (newest first, 50), next}` |
| `sigdecide` | `id`, `decision` (`approve` / `reject`), optional `artist` (approve: the name to file it under), `note` (admins) | `{submission}` |

The signature catalogue (Admin → Artists; ootv-search `admin/signatures.mjs`, table
`oracle-all-signatures`, key `artist` + `file`) uses the same route with `database: "all"` and the
Artists editor's permission (`artists` or `*` in groups `all` or `*`). `n` is the length of the
signature's `updatelog` as loaded: if it changed since, the call is refused with 409.

| action | input | output |
|---|---|---|
| `siglist` | optional `artist` (an entry's name) | `{artist, path, signatures: [item + n]}`, or without `artist` `{counts: {artist: n}}` |
| `sigedit` | `artist`, `file`, `n`, any of `read`, `how`, `note` (empty removes it) | `{signature}` (or `message: "no changes"`) |
| `sigmove` | `artist`, `file`, `n`, `to` (an artist entry; an alias moves it to its main entry) | `{signature, from}` |
| `sigdetach` | `artist`, `file`, `n` | `{submission}`: a pending row in the game's Signature submissions, no artist |
| `sigdelete` | `artist`, `file`, `n` | `{deleted, trash}`: the crop moved to `removed/<time>-<file>`, an `oracle-all-imagetrash` row (reason `signature-deleted`) with the item |

A job: `{game, id, status: queued / running / done / error, created, started, finished, cardid,
printingid, title, set, artist (the credit when queued), uid, uname, result, error}`; an upload has
`image` (its key in the reports bucket, `artcheck/<game>/<id>.jpg`) and `kind` instead of the card,
`title` = the file name, `set` = "whole card" or "art only", and `same` entries carry `artvec`
(the upload's cosine to that printing, ≥ 0.80). `result`:
`{credit, style: {candidates: [{artist, share}], nearest: [{cardid, printingid, title, set, artist,
score}]}, same: [{cardid, printingid, title, set, artist, style, artvec}], signature: {read, match:
name / initials / "", error, where: {box, read, crop, file}, known: [...], catalogued: [{artist, file,
cardid, printingid}]}, model, reference: {built, credited}}`. `where.file` is the found signature's
PNG in the reports bucket (`artcheck/<game>/<id>-signature.png`); `catalogued` lists the catalogue
rows of the same painting (non-empty: nothing to submit). After a submission the job carries
`signaturesub: {id, status, artist}`.

A submission: a row `game = "sigsub/<game>"` in `oracle-all-artcheck` (no expiry) `{id, status: pending /
approved / rejected, created, job, file (its PNG, kept at artcheck-signatures/<game>/<id>.png), crop,
read, cardid, printingid, title, set, credit, artist, uid, uname, decided, decidedby, note, filed:
{artist, path, file}}`; a signature detached in Admin → Artists also has `detached: {from, file, how,
note, by, approved, added, at, byname, updatelog}` and no `artist` until approved. Filing copies the
PNG to `artists/<slug>/signatures/` on the images bucket and puts an `oracle-all-signatures` item
(`how: submitted`, `by`, `approved`, `job`, `added`, an updatelog row `source: sigsubmit`; a detached
one keeps its own), then stamps row
`game = "worker", id = "catalogue"` (`updated`, `artist`) so the worker reloads its catalogue. `worker`: `{seen, host, state,
references, online}` (`online` false when the heartbeat is older than 10 minutes, or `{online:
false}` when it never ran).

## /setimportverify

After a set import's apply: compares every card the import wrote with its copy in search, as
ootv-import's `set-import.py verify` does. Handled by lambda: ootv-search/routes/setimportverify.js

inputs: JSON `{uid, database, job}` with the Cognito token; same permission as /setimport.

outputs: `{checked, matched, mismatched: [{cardid, why}]}`

