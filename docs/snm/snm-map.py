#!/usr/bin/env python3
"""Build docs/snm/l5r-snm.json: OotV l5r set name -> Sun and Moon edition code, plus per-printing codes.

The Sun and Moon text export writes "2x Card (CODE)". S&M only shows a printing it
has under that edition, so this script matches every OotV printing against S&M's
own card database by the name the export writes (titletextsnm, puretexttitle, title).

Output:
  sets       OotV set name (as stored, HTML entities and all) -> S&M edition code.
             Sets missing here (proxies, Oracle of the Void) export with no set.
  printings  "cardid/printingid" -> code, only where the set's code is wrong for that
             printing: the code S&M uses instead, or "" to write no set and let S&M
             show its default printing. These live on the cards, as the printing field
             `snmsetcode` (ootv-tools/printings/snm-printings.py writes them).

Usage (paths default to the workspace layout):
  python3 -I docs/snm/snm-map.py [S&M database.xml] [dir of per-card l5r JSON]

The file isn't served. The site reads the set codes from the oracle-all-structure item l5r/snm
(push them with docs/snm/snm-push.py --go) and the printing codes from the cards
(ootv-tools/printings/snm-printings.py --go).
"""
import collections, html, json, os, re, sys
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
WS = os.path.normpath(os.path.join(HERE, '../../..'))
SNMDB = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    WS, 'SnM/Sun and Moon - Onyx/Sun and Moon_Data/StreamingAssets/Database/database.xml')
CARDS = sys.argv[2] if len(sys.argv) > 2 else os.path.join(WS, 'ootv-backups/work/cur-l5r/split2')
OUT = os.path.join(HERE, 'l5r-snm.json')

# Codes from the S&M Discord list (issue #214) for sets the S&M database files under
# other editions. Always written, even though the database has no such edition.
DISCORD = {
    'Samurai Edition Banzai': 'SamuraiBanzai',
    'Battle of Kyuden Tonbo': 'BoKT',
    'L5R Experience': 'L5REXP',
    'Top Deck Booster Pack': 'TDBP',
    'Crab vs. Lion': 'CvL',
    'Three Dynasties': '3D',  # code given before release; S&M's database may not have it yet
}
# Sets whose cards are mostly reprints, so title matching can't pick the code.
FIXED = {
    'Emperor Edition Demo Decks': 'Emperor',
    'Celestial Edition 15th Anniversary': 'CE15MRP',
    'Pre-Imperial Edition': 'pre',
    'Promotional&ndash;Samurai': 'CotM',
}
# Second choices when a printing's set code isn't one S&M has for that card.
ALTERNATES = {
    'Celestial Edition 15th Anniversary': ['CE15'],
    'Promotional&ndash;Samurai': ['Promo'],
}
NOSET = re.compile(r'^(Proxies|Oracle of the Void$)')


def key(s):
    return re.sub(r'[^a-z0-9]', '', html.unescape(re.sub(r'<[^>]+>', '', s)).lower())


def exportname(card):
    t = card.get('titletextsnm') or card.get('puretexttitle') or card['title']
    return t[0] if isinstance(t, list) else t


# the S&M file has a few stray non-UTF-8 bytes in card text
root = ET.fromstring(open(SNMDB, encoding='utf-8', errors='replace').read())
snm = collections.defaultdict(set)
edsize = collections.Counter()
for c in root:
    eds = {e.text for e in c.findall('edition')}
    snm[key(c.findtext('name') or '')] |= eds
    edsize.update(eds)
# S&M lists 3 cards under "RoU" beside "ROU" (Rise of Otosan Uchi); export only ROU
edsize.pop('RoU', None)

cards = [json.load(open(os.path.join(CARDS, f))) for f in sorted(os.listdir(CARDS))]

votes = collections.defaultdict(collections.Counter)
setsize = collections.Counter()
for card in cards:
    eds = snm.get(key(exportname(card)), set())
    for p in card['printing']:
        for s in p.get('set', []):
            setsize[s] += 1
            votes[s].update(e for e in eds if e in edsize)

sets = {}
for s, v in votes.items():
    if NOSET.match(s):
        continue
    if s in DISCORD:
        sets[s] = DISCORD[s]
    elif s in FIXED:
        sets[s] = FIXED[s]
    elif s.startswith('Promotional'):
        sets[s] = 'Promo'
    elif v:
        # score by the share of the S&M edition matched, so base sets full of reprints
        # don't outvote the expansion; the edition must also cover half the set, so a
        # small reprint edition (CE15MRP) doesn't win the set it reprints (Celestial)
        big = [e for e in v if v[e] >= setsize[s] / 2] or list(v)
        sets[s] = max(big, key=lambda e: (v[e] / edsize[e], v[e]))

printings = {}
for card in cards:
    eds = snm.get(key(exportname(card)), set())
    if not eds:
        continue  # name not in S&M: keep the set code, it's the best guess
    for p in card['printing']:
        for s in p.get('set', [])[:1]:
            code = sets.get(s)
            if code is None or code in eds or s in DISCORD:
                continue
            alt = next((a for a in ALTERNATES.get(s, []) if a in eds), '')
            printings[f"{card['cardid']}/{p['printingid']}"] = alt

text = json.dumps({'sets': dict(sorted(sets.items())), 'printings': dict(sorted(printings.items()))},
                  indent=0) + '\n'
open(OUT, 'w').write(text)
print(f"{len(sets)} sets, {len(printings)} printing overrides "
      f"({sum(1 for v in printings.values() if not v)} with no set) -> {os.path.relpath(OUT)}")
print("then: python3 docs/snm/snm-push.py --go (set codes -> structure item l5r/snm) and")
print("      ../ootv-tools/printings/snm-printings.py --go (printing codes -> the cards' snmsetcode)")
