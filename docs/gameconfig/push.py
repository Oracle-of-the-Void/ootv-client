#!/usr/bin/env python3
"""Edit the structure-driven game config as JSON files: pull the items, edit, push them back
(PRODUCTION with --go). FOR REAL BULK EDITS ONLY (many settings, a restructure, a new game's first items).
One value (a key, a flag, a mon) is a targeted update: ootv-tools structure/set.py or the Admin editor,
never this (workspace CLAUDE.md, the user 2026-10-28: change only what changes, in the live table).

  python3 docs/gameconfig/push.py pull DIR [GAME...]   # items -> DIR (no GAME: every game in all/games)
  python3 docs/gameconfig/push.py DIR [--go]           # DIR -> items; without --go shows what would change

DIR holds all-games.json (all/games), all-templates.json (all/templates), and per game <game>-game.json
(<game>/game) and <game>-settings.json (the `settings` of <game>/fields, the field list; the
descriptions in `fields` are left alone, edited in Admin -> Field descriptions). A push writes the files
that are there: all/games merged into the stored list (a game missing from the file keeps its entry and
place), all/templates, <game>/game, the fields settings. Each item gets version + 1 and a history entry
(the last 50), and is written only if its version is still the one pulled (DIR/versions.json, written by
pull): if anyone saved the item since your pull, the push stops for it, dry run included; pull again. The items are the source since every game moved off templates/<game>.js (2026-10-23; the
old build.js that made them from those files is in ootv-claude DEPRECATED.md). ootv-claude
GAME-TEMPLATES.md §2-3.
"""
import argparse, glob, json, os, sys, time
from decimal import Decimal
import boto3

VERSIONS = 'versions.json'   # the version of each item at pull time: a push refuses an item that moved since
TABLE, HISTORY, KEEPOLD = 'oracle-all-structure', 50, 10   # full old copies only in the newest 10 (item size)
UID, UNAME = 21069, 'Don Eisele'


META = ('database', 'key', 'version', 'updated', 'uid', 'uname', 'history')


def plain(item):
    return json.loads(json.dumps(item, default=lambda d: float(d) if d % 1 else int(d)))


def pull(t, out, games):
    os.makedirs(out, exist_ok=True)
    get = lambda db, key: t.get_item(Key={'database': db, 'key': key}, ConsistentRead=True).get('Item')
    write = lambda name, obj: open(os.path.join(out, name), 'w').write(json.dumps(plain(obj), indent=1, ensure_ascii=False) + '\n')
    strip = lambda item: {k: v for k, v in item.items() if k not in META}
    versions = {}
    seen = lambda db, key, item: versions.__setitem__(db + '/' + key, int(item.get('version', 0)) if item else None)
    allgames, templates = get('all', 'games'), get('all', 'templates')
    seen('all', 'games', allgames); seen('all', 'templates', templates)
    write('all-games.json', strip(allgames))
    write('all-templates.json', strip(templates))
    for g in games or [x['table'] for x in allgames['games']]:
        game, fields = get(g, 'game'), get(g, 'fields')
        if not game:
            sys.exit('%s/game: no such item' % g)
        seen(g, 'game', game); seen(g, 'fields', fields)
        write(g + '-game.json', strip(game))
        write(g + '-settings.json', (fields or {}).get('settings') or {})
        print('%s: game version %s, fields version %s' % (g, game.get('version'), (fields or {}).get('version')))
    write(VERSIONS, versions)
    print('pulled into %s; edit, then: push.py %s (dry run), --go to write' % (out, out))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('args', nargs='+', help='DIR, or pull DIR [GAME...]')
    ap.add_argument('--go', action='store_true')
    a = ap.parse_args()
    t = boto3.Session(profile_name='ksuquix', region_name='us-east-1').resource('dynamodb').Table(TABLE)
    if a.args[0] == 'pull':
        if len(a.args) < 2:
            ap.error('pull DIR [GAME...]')
        return pull(t, a.args[1], a.args[2:])
    a.dir = a.args[0]
    load = lambda name: json.load(open(os.path.join(a.dir, name)))
    has = lambda name: os.path.exists(os.path.join(a.dir, name))
    todo = [(db, key, load(name), None) for db, key, name in (('all', 'games', 'all-games.json'), ('all', 'templates', 'all-templates.json'))
            if has(name)]
    for f in sorted(glob.glob(os.path.join(a.dir, '*-game.json'))):
        g = os.path.basename(f)[:-len('-game.json')]
        todo.append((g, 'game', load(g + '-game.json'), None))
        if has(g + '-settings.json'):
            todo.append((g, 'fields', None, load(g + '-settings.json')))
    if not has(VERSIONS):
        sys.exit('%s has no %s: pull into it first (push.py pull %s [game])' % (a.dir, VERSIONS, a.dir))
    pulled = load(VERSIONS)
    now = int(time.time() * 1000)
    for db, key, body, settings in todo:
        old = t.get_item(Key={'database': db, 'key': key}, ConsistentRead=True).get('Item')
        live = int(old.get('version', 0)) if old else None
        if db + '/' + key not in pulled and old:
            sys.exit('%s/%s: not in %s (a file copied in from elsewhere?): pull again' % (db, key, VERSIONS))
        if old and pulled.get(db + '/' + key) != live:
            sys.exit('%s/%s: changed since your pull (version %s -> %s, by %s): pull again and redo the edit; '
                     'a push now would wipe that save' % (db, key, pulled.get(db + '/' + key), live, old.get('uname', '?')))
        if (db, key) == ('all', 'games') and old:
            # a game missing from the file keeps its entry and place
            built = {g['table']: g for g in body['games']}
            games = [built.pop(g['table'], g) for g in old['games']] + list(built.values())
            body = dict(body, games=games)
        version = int(old['version']) if old and 'version' in old else 0
        if settings is not None:
            if not old:
                sys.exit('%s/%s: no fields item to add settings to' % (db, key))
            same = old.get('settings') == json.loads(json.dumps(settings), parse_float=Decimal, parse_int=Decimal)
            item = dict(old, settings=settings)
            entry_changes = {'settings': 'field list settings (labels, search) from docs/gameconfig/push.py'}
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
        if old and 'version' in old:
            t.put_item(Item=item, ConditionExpression='#v = :v', ExpressionAttributeNames={'#v': 'version'},
                       ExpressionAttributeValues={':v': old['version']})
        elif old:
            t.put_item(Item=item, ConditionExpression='attribute_exists(#k) AND attribute_not_exists(#v)',
                       ExpressionAttributeNames={'#k': 'key', '#v': 'version'})
        else:
            t.put_item(Item=item, ConditionExpression='attribute_not_exists(#k)', ExpressionAttributeNames={'#k': 'key'})
        pulled[db + '/' + key] = version + 1
        open(os.path.join(a.dir, VERSIONS), 'w').write(json.dumps(pulled, indent=1) + '\n')
        print('   written, version %d' % (version + 1))
    if not a.go:
        print('dry run; --go writes production')


if __name__ == '__main__':
    main()
