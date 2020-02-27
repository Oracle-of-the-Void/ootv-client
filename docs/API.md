## API gateway endpoints

### Not needing Authentication

* [/attributes (POST)](#attributes)
* /oracle-fetch (GET) (POST)
* /search (POST)
* /verify-jwt (POST)

### Needing Authentication

* /user (GET) 
* /import (POST) 
* /list (GET)

## Note

In general, when table is required for most things, oracle- is added as a prefix and used as the table name for dynamodb, index name for elastic.  This is a general selector to get to the game desired.

## /attributes

Retrieves an array of options suitable for a select pulldown


Handled by lambda: oracle-search


inputs:

* table (required)
* lookup (required) "field" to aggregate (returns array)
  * "field1:field2" returns an hash with keys of field1, and values of all field2 contained by cards with field1
  * E.G.   "set a": { "R", "U", "C" }

