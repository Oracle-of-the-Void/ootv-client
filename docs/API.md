## API gateway endpoints

### Not needing Authentication

* [/attributes (POST or GET)](#attributes)            -> Pulls attributes from games (for use in pull-downs)
* [/oracle-fetch (GET) (POST)](#oracle-fetch)  -> Get cards by cardid
* [/search (POST)](#search)                    -> Search cards, return results
* [/verify-jwt (POST)](#verify-jwt)            -> For use in authentication
* [/oracle-structure (GET)](#oracle-structure) -> Returns information about games (templating, etc)

### Needing Authentication

* [/user (GET)](#user)                          -> Verify user account and return user data 
* [/import (POST)](#import)                     -> import decks/lists from external files
* [/list (GET)](#list)                          -> deck/list handling routines
* [/update (POST)](#update)                     -> database modification routines

## Note

In general, when table is required for most things, oracle- is added as a prefix and used as the table name for dynamodb, index name for elastic.  This is a general selector to get to the game desired.

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

inputs:

* table (required)
* sort (optional)
  * default: [{'title.keyword': {"order" : "asc"} }]
  * "random": random order
  * any other valid elastic sort clause
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

outputs:

* {cognito:{name: payload.name,email: payload.email,email_verified: payload.email_verified},oracle: userdata.Items}
  * payload is the cognito token information
  * userdata.Items is the user info from DynamoDB

codes:

* 200: success
* 404: not found
* other: passed from various actions

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
  * '': retrieve metadata for all lists for current user
  * otherwise needs to be a valid listid owned by the user, or set public by another user
* database (required for 'new' or '' listid)
  * basically the same as table elsewhere, but psuedo-optional here
* updatefield (optional)
  * ignored if 'new' operation happening
  * user must be the list's owner
  * one of ['name','notes','public','type','list']
    * list name, list notes, public flag, list type, list data: { {cardid: x, quantity: x, printing: x }, ... }
  * if this is set we update that field of the list
  * TODO: when updating 'list' field, we should have a field that has the quantity of cards in it that gets updated as well, so general listing can have that info
* action (optional)
  * remove
    * delete that list

outputs:

*  listid ''
  * lists.Items: array of { createdate, listid, notes, public, owner, game, name, modified }
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
