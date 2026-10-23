#!/usr/bin/env python3
"""Write build.js's items to oracle-all-structure (PRODUCTION with --go).

  python3 docs/gameconfig/push.py DIR [--go]

DIR is build.js's --out. Writes all/games, all/templates, and per game <game>/game and the
`settings` of <game>/fields (the field list; the descriptions in `fields` are left alone). Each item
gets version + 1 and a history entry (the last 50), and is written only if its version is still the
one read. Without --go it shows what would change. ootv-claude GAME-TEMPLATES.md §2.
"""
import argparse, glob, json, os, sys, time
from decimal import Decimal
import boto3

TABLE, HISTORY, KEEPOLD = 'oracle-all-structure', 50, 10   # full old copies only in the newest 10 (item size)
UID, UNAME = 21069, 'Don Eisele'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('dir')
    ap.add_argument('--go', action='store_true')
    a = ap.parse_args()
    t = boto3.Session(profile_name='ksuquix', region_name='us-east-1').resource('dynamodb').Table(TABLE)
    load = lambda name: json.load(open(os.path.join(a.dir, name)))
    todo = [('all', 'games', load('all-games.json'), None), ('all', 'templates', load('all-templates.json'), None)]
    for f in sorted(glob.glob(os.path.join(a.dir, '*-game.json'))):
        g = os.path.basename(f)[:-len('-game.json')]
        todo.append((g, 'game', load(g + '-game.json'), None))
        todo.append((g, 'fields', None, load(g + '-settings.json')))
    now = int(time.time() * 1000)
    for db, key, body, settings in todo:
        old = t.get_item(Key={'database': db, 'key': key}, ConsistentRead=True).get('Item')
        version = int(old['version']) if old and 'version' in old else 0
        if settings is not None:
            if not old:
                sys.exit('%s/%s: no fields item to add settings to' % (db, key))
            same = old.get('settings') == json.loads(json.dumps(settings), parse_float=Decimal, parse_int=Decimal)
            item = dict(old, settings=settings)
            entry_changes = {'settings': 'field list settings (labels, search) from docs/gameconfig/build.js'}
        else:
            same = old is not None and all(old.get(k) == v for k, v in
                                           json.loads(json.dumps(body), parse_float=Decimal, parse_int=Decimal).items())
            item = dict(body, database=db, key=key)
            entry_changes = {'all': 'written by docs/gameconfig/push.py'}
        print('%-26s %s (version %d)' % (db + '/' + key, 'unchanged' if same else ('new' if not old else 'changed'), version))
        if same or not a.go:
            continue
        entry = {'version': version + 1, 'updated': now, 'uid': UID, 'uname': UNAME, 'changes': entry_changes}
        if settings is None and old:
            entry['old'] = {k: v for k, v in old.items() if k not in ('history', 'database', 'key')}
        item.update(version=version + 1, updated=now, uid=UID, uname=UNAME,
                    history=([entry] + list((old or {}).get('history') or []))[:HISTORY])
        for h in item['history'][KEEPOLD:]:
            h.pop('old', None)
        item = json.loads(json.dumps(item, default=lambda d: float(d) if d % 1 else int(d)), parse_float=Decimal)
        if old:
            t.put_item(Item=item, ConditionExpression='#v = :v', ExpressionAttributeNames={'#v': 'version'},
                       ExpressionAttributeValues={':v': old['version']})
        else:
            t.put_item(Item=item, ConditionExpression='attribute_not_exists(#k)', ExpressionAttributeNames={'#k': 'key'})
        print('   written, version %d' % (version + 1))
    if not a.go:
        print('dry run; --go writes production')


if __name__ == '__main__':
    main()
