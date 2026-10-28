#!/usr/bin/env python3
"""Write the Sun and Moon set codes into DynamoDB: oracle-all-structure item l5r / snm.

The S&M export (oracle.js snmsetload), ootv-search's /import (lib/snm.js) and the Admin set
import read the set codes from that item (`sets` only). Per-printing codes aren't in the item:
they're the cards' printing field `snmsetcode` (ootv-tools/printings/snm-printings.py). Run this after
snm-map.py rebuilds docs/snm/l5r-snm.json.

  python3 docs/snm/snm-push.py [map.json]          # dry run: what would change
  python3 docs/snm/snm-push.py [map.json] --go     # write the item

Only the set codes that change are written: one conditional update_item per batch that SETs
`sets.<set>` for each changed code, each conditioned on the code it replaces (so a set registered by the
set import meanwhile, or any other attribute, is never overwritten). Set codes already in the item that the
file doesn't have are left alone. A `printings` attribute left from the old layout is removed. The whole
item is never written back (workspace CLAUDE.md: change only what changes, in the live table).
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
old = tbl.get_item(Key={'database': GAME, 'key': KEY}, ConsistentRead=True).get('Item') or {}
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
    print('dry run; --go writes the changed set codes')
    sys.exit(0)
key = {'database': GAME, 'key': KEY}
stamp = {':now': int(time.time() * 1000), ':src': 'snm-push.py ' + os.path.basename(SRC)}
if not old:
    # a brand-new item: create it, refusing if someone made it meanwhile
    tbl.put_item(Item=dict(key, sets=sets, updated=stamp[':now'], source=stamp[':src']),
                 ConditionExpression='attribute_not_exists(#k)', ExpressionAttributeNames={'#k': 'key'})
elif 'sets' not in old:
    tbl.update_item(Key=key, UpdateExpression='SET #s = :s, updated = :now, #src = :src',
                    ConditionExpression='attribute_not_exists(#s)', ExpressionAttributeNames={'#s': 'sets', '#src': 'source'},
                    ExpressionAttributeValues=dict(stamp, **{':s': sets}))
else:
    todo = list(changed) or [None]
    for b in range(0, len(todo), 40):                  # UpdateExpression is capped at 4 KB
        names, values = {'#s': 'sets', '#src': 'source'}, dict(stamp)
        sets_, conds = ['updated = :now', '#src = :src'], []
        for i, s in enumerate(x for x in todo[b:b + 40] if x is not None):
            names['#c%d' % i] = s
            values[':v%d' % i] = new['sets'][s]
            sets_.append('#s.#c%d = :v%d' % (i, i))
            if s in oldsets:
                values[':o%d' % i] = oldsets[s]
                conds.append('#s.#c%d = :o%d' % (i, i))
            else:
                conds.append('attribute_not_exists(#s.#c%d)' % i)
        expr = 'SET ' + ', '.join(sets_)
        if b == 0 and 'printings' in old:
            expr += ' REMOVE printings'
        tbl.update_item(Key=key, UpdateExpression=expr, ConditionExpression=' AND '.join(conds or ['attribute_exists(#s)']),
                        ExpressionAttributeNames=names, ExpressionAttributeValues=values)
print('wrote %d set code(s) to %s/%s' % (len(changed), GAME, KEY))
