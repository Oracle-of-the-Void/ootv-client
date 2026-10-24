#!/usr/bin/env python3
"""Write the Sun and Moon set codes into DynamoDB: oracle-all-structure item l5r / snm.

The S&M export (oracle.js snmsetload), ootv-search's /import (lib/snm.js) and the Admin set
import read the set codes from that item (`sets` only). Per-printing codes aren't in the item:
they're the cards' printing field `snmsetcode` (ootv-tools/printings/snm-printings.py). Run this after
snm-map.py rebuilds docs/snm/l5r-snm.json.

  python3 docs/snm/snm-push.py [map.json]          # dry run: what would change
  python3 docs/snm/snm-push.py [map.json] --go     # write the item

Set codes already in the item that the file doesn't have (a set registered by the set import
before S&M's database knew it) are kept. A `printings` attribute left from the old layout is dropped.
"""
import json, os, sys, time
import boto3

HERE = os.path.dirname(os.path.abspath(__file__))
args = [a for a in sys.argv[1:] if not a.startswith('--')]
GO = '--go' in sys.argv
SRC = args[0] if args else os.path.join(HERE, 'l5r-snm.json')
GAME, KEY, TABLE = 'l5r', 'snm', 'oracle-all-structure'


def session():
    if 'ksuquix' in boto3.Session().available_profiles:
        return boto3.Session(profile_name='ksuquix', region_name='us-east-1')
    return boto3.Session(region_name='us-east-1')


new = json.load(open(SRC))
tbl = session().resource('dynamodb').Table(TABLE)
old = tbl.get_item(Key={'database': GAME, 'key': KEY}).get('Item') or {}
oldsets = old.get('sets') or {}
kept = {s: c for s, c in oldsets.items() if s not in new['sets']}
sets = dict(sorted({**new['sets'], **kept}.items()))
changed = sorted(s for s in new['sets'] if oldsets.get(s) != new['sets'][s])
print('%s: %d sets' % (os.path.relpath(SRC), len(new['sets'])))
print('item %s/%s: %s' % (GAME, KEY, 'exists, %d sets' % len(oldsets) if old else 'not there yet'))
if 'printings' in old:
    print('  drops the old printings attribute (%d entries; now on the cards)' % len(old['printings']))
for s in changed[:20]:
    print('  set %s: %s -> %s' % (s, oldsets.get(s, '(none)'), new['sets'][s]))
if len(changed) > 20:
    print('  ... %d more set changes' % (len(changed) - 20))
for s, c in sorted(kept.items()):
    print('  kept from the item (not in the file): %s = %s' % (s, c))
if not GO:
    print('dry run; --go writes the item')
    sys.exit(0)
tbl.put_item(Item={'database': GAME, 'key': KEY, 'sets': sets,
                   'updated': int(time.time() * 1000), 'source': 'snm-push.py ' + os.path.basename(SRC)})
print('wrote %s/%s' % (GAME, KEY))
