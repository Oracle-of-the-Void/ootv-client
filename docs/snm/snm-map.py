#!/usr/bin/env python3
"""Build docs/snm/l5r-snm.json: OotV l5r set name -> Sun and Moon edition code, plus per-printing name and code.

The Sun and Moon text export writes "2x Card (CODE)". S&M only shows a printing it
has under that name and edition, so this script matches every OotV printing against S&M's
own card database by the name the export writes (titletextsnm, puretexttitle, title).
S&M sometimes splits one OotV card into several by name ("Market Place" for pre-Imperial
to Jade, "Marketplace" from Pearl on), so each printing gets the S&M card that has its
edition, exact name first. A printing's own printed name (printing printedtitle or title:
"Kamoto" in Anvil of Despair) is tried before the card's, S&M's double-sided strongholds
("X (1)", "X (2)") match X on side 1, and ALIASES below covers the names only S&M uses.

S&M has two builds with their own card databases, and they are never mixed (the user,
2026-10-27): every pre-Onyx printing is matched against the Win build (Kempy 1.3.4, 2017) only,
and Onyx Lives printings (sets the set list marks as digital releases: The Blackest Storm, Onyx
Edition, Shattered Empire, ...) against the Onyx build only. Onyx re-keyed some old cards to their
Onyx printing and dropped the old editions (Jade Works has only Onyx and ShE there), so matching
old printings against it sends them out with no set.

A printing S&M doesn't have under any of the card's names (starter reprints, The L5R
Experience, other codes S&M's database lacks) exports as the card's most recent printing of the
same era released before it that its build does have (its name and edition); with none, as no set.
Release dates come from ootv-import/l5r-sets-wikipedia.tsv, plus DATES below.

Output:
  sets       OotV set name (as stored, HTML entities and all) -> S&M edition code.
             Sets missing here (proxies, Oracle of the Void, RULEONLY) export with no set.
  printings  "cardid/printingid" -> {"code": CODE[, "name": NAME]}, only where the set's code
             or the card's export name is wrong for that printing: the code S&M uses ("" =
             write no set, S&M shows its default printing) and the S&M card name when it
             differs from the card's. These live on the cards, as the printing fields
             `snmsetcode` and `titletextsnm` (ootv-tools/printings/snm-printings.py writes them).

Usage (paths default to the workspace layout):
  python3 -I docs/snm/snm-map.py [Win database.xml] [dir of per-card l5r JSON] [l5r-sets-wikipedia.tsv]
                                 [Onyx database.xml]

The file isn't served. The site reads the set codes from the oracle-all-structure item l5r/snm
(push them with docs/snm/snm-push.py --go) and the printing codes and names from the cards
(ootv-tools/printings/snm-printings.py --go).
"""
import collections, csv, html, json, os, re, sys
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
WS = os.path.normpath(os.path.join(HERE, '../../..'))
SNMXML = 'SnM/Sun and Moon - %s/Sun and Moon_Data/StreamingAssets/Database/database.xml'
WINDB = sys.argv[1] if len(sys.argv) > 1 else os.path.join(WS, SNMXML % 'Win')
ONYXDB = sys.argv[4] if len(sys.argv) > 4 else os.path.join(WS, SNMXML % 'Onyx')
CARDS = sys.argv[2] if len(sys.argv) > 2 else os.path.join(WS, 'ootv-backups/work/cur-l5r/split2')
OUT = os.path.join(HERE, 'l5r-snm.json')
SETLIST = sys.argv[3] if len(sys.argv) > 3 else os.path.join(WS, 'ootv-import/l5r-sets-wikipedia.tsv')

# Codes from the S&M Discord list (issue #214) for sets the S&M database files under
# other editions. The set's code even though the database has no such edition; a printing of a
# card S&M has takes the most-recent-earlier printing instead (S&M can't show the code).
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
# Sets with no S&M edition of their own (starter reprints spanning several expansions): no set
# code; their printings always take the most-recent-earlier printing.
RULEONLY = {'Hidden Emperor Starter', 'Scorpion Clan Coup Starter'}
# Discord codes S&M gave before the set reached its database: always written.
KEEPCODE = {'Three Dynasties'}
# Release dates (year, month, order) the set list lacks. Promos sit just after their arc's base
# set, Banzai just after Samurai Edition, the starter sets at their first episode/scroll.
DATES = {
    'Hidden Emperor Starter': (1998, 6, 0),
    'Scorpion Clan Coup Starter': (1997, 12, 0),
    'Scorpion Clan Coup 2': (1998, 1, 0),
    'Samurai Edition Banzai': (2007, 7, 1),
    'Emperor Edition Demo Decks': (2012, 2, 1),
    'Promotional&ndash;Imperial': (1995, 10, 1),
    'Promotional&ndash;Jade': (1998, 5, 1),
    'Promotional&ndash;CWF': (1998, 5, 1),
    'Promotional&ndash;Gold': (2001, 6, 1),
    'Promotional&ndash;Diamond': (2003, 10, 1),
    'Promotional&ndash;Lotus': (2005, 10, 1),
    'Promotional&ndash;Samurai': (2007, 7, 1),
    'Promotional&ndash;Celestial': (2009, 6, 1),
    'Promotional&ndash;Emperor': (2012, 2, 1),
    'Promotional&ndash;Ivory': (2014, 3, 1),
    'Promotional&ndash;Twenty Festivals': (2015, 3, 1),
}
# S&M card names that no OotV name reaches: S&M's typos, its "- exp" names for experienced
# printings, and its shortened or changed subtitles (the printed names are checked against the
# scans; where the scan shows S&M's name, it's in printing printedtitle instead). S&M name ->
# cardid. A name only matches the printings in its own S&M editions.
ALIASES = {
    'Amoral Wave Man': 12193,
    'Beseech Sakkau': 9884,
    'Daidoji Akeha, Iron Crane - exp': 13088,
    'Daidoji Senshi, Aerie Governor': 13681,
    'Daigotsu - wind': 989,
    'Dark Oracle of Water, Hida Saiyuki - exp2': 14023,
    'Doji Kurizima': 14229,
    'Goju Hitomi - exp3': 2850,
    'Gusai Ichido, Clan Champion - exp2': 14431,
    'Hida Sazeren, Soul of Hida Sozen': 12746,
    'Hoturi the Heartless - exp3 KYD': 3487,
    'Isawa Kaname, Advisor the the Ruby Champion': 11759,
    'Judgement of the Kami': 4062,
    'Karda': 12733,
    'Kitsu Kouki - exp': 14380,
    'Kitsune Toshitaka': 14128,
    'Militia Training Grounds': 5056,
    'Mirumoto Hitomi - exp2': 3356,
    'Oracle of Thunder - exp': 5774,
    'Otaku Xieng Chi - exp': 9111,
    'Pierce the Tapestry': 10388,
    'Polvara Cache': 12208,
    'Reincarnation': 13006,
    "Scholar's Facade": 14289,
    'Shahadet - exp 4': 14129,
    'Shiba Heirei': 10865,
    "Shiba Tamashii, Shiba's Soul": 13437,
    'Shosuro Takumi, Governor of Ryoko Owari': 13765,
    'Soshi Matashichi': 13281,
    'Spiritual Coelescence': 10393,
    'Suiteru no Oni': 7618,
    'Suzume Ryosuke, Sparrow Clan Champion': 14167,
    'The Austere Valley of the Sparrow - exp': 14199,
    'The Obsidian Halls of the Lost': 5657,
    'Togashi Mitsu - exp': 5191,
    'Togashi Yoshi - exp': 9666,
    'Watanabe Masutaro, Soul of Yoritomo Uyko': 13732,
    'Winter Seige': 9349,
    'Yogo Mizogushi': 12481,
}
# S&M's two sides of a double-sided stronghold: "The Eternal Temple of the Phoenix (1)"
SIDE = re.compile(r' \((\d)\)$')


def key(s):
    return re.sub(r'[^a-z0-9]', '', html.unescape(re.sub(r'<[^>]+>', '', s)).lower())


def exportname(card):
    t = card.get('titletextsnm') or card.get('puretexttitle') or card['title']
    return t[0] if isinstance(t, list) else t


def snmeds(card, db):
    """All of one build's S&M editions of the cards the export's name finds (the loose key)."""
    return db.snm.get(key(exportname(card)), set())


def printednames(p):
    """The printing's own names (printedtitle, title), as plain text."""
    return [html.unescape(re.sub(r'<[^>]+>', '', t)) for f in ('printedtitle', 'title') for t in p.get(f, [])]


def snmcards(card, db):
    """[(S&M name, editions)] in one build for the card under its export name, its printings'
    printed names and ALIASES; the exact export name first, side 1 of a stronghold before side 2."""
    name = html.unescape(exportname(card))
    names = [name] + [n for p in card['printing'] for n in printednames(p)] + aliases.get(card['cardid'], [])
    found = {}
    for n in names:
        found.update(db.snmnames.get(key(n), {}))
    return sorted(found.items(), key=lambda ne: (ne[0] != name, ne[0]))


def snmprimary(card, db):
    """The S&M names under the card's export name alone. A printed name or alias only counts
    where S&M has that very edition: an experienced card's printed name is the base card's."""
    name = html.unescape(exportname(card))
    return sorted(db.snmnames.get(key(name), {}), key=lambda n: (n != name, n))


def ym(text):
    """(year, month, 0) from the set list's "8/1995", "03/24/2014", "Digital 2/2025", "Digital 2023"."""
    m = re.match(r'(?:Digital\s*)?(\d{1,2})/(?:\d{1,2}/)?(\d{4})', (text or '').strip())
    if m:
        return (int(m.group(2)), int(m.group(1)), 0)
    m = re.match(r'Digital\s*(\d{4})$', (text or '').strip())
    return (int(m.group(1)), 0, 0) if m else None


class Build:
    """One S&M build's card database: loose key -> editions (snm), loose key -> {S&M name:
    editions} (snmnames; S&M keeps "Market Place" (pre-Imperial to Jade) and "Marketplace" (Pearl
    on) as separate cards, which key() alone would merge), edition -> card count (edsize), and
    (S&M name, code) -> the cards whose own export name reaches it there (claimed)."""
    def __init__(self, path):
        # the S&M file has a few stray non-UTF-8 bytes in card text
        root = ET.fromstring(open(path, encoding='utf-8', errors='replace').read())
        self.snm = collections.defaultdict(set)
        self.snmnames = collections.defaultdict(lambda: collections.defaultdict(set))
        self.edsize = collections.Counter()
        self.claimed = collections.defaultdict(set)
        for c in root:
            eds = {e.text for e in c.findall('edition')}
            name = html.unescape(c.findtext('name') or '')
            self.snm[key(name)] |= eds
            self.snmnames[key(name)][name] |= eds
            if SIDE.search(name):
                self.snmnames[key(SIDE.sub('', name))][name] |= eds
            self.edsize.update(eds)
        # Onyx lists 3 cards under "RoU" beside "ROU" (Rise of Otosan Uchi); export only ROU
        self.edsize.pop('RoU', None)


WIN, ONYX = Build(WINDB), Build(ONYXDB)
aliases = collections.defaultdict(list)   # cardid -> S&M names
for n, cid in ALIASES.items():
    aliases[cid].append(n)

# release dates and eras: the set list's by set name, else by S&M code when only one OotV set has it.
# Onyx Lives sets are the set list's digital releases (The Blackest Storm on); every other set,
# and every set the list lacks (promos, starters), is pre-Onyx.
setlist = list(csv.DictReader(open(SETLIST), delimiter='\t', quoting=csv.QUOTE_NONE))
byname = {key(r['set']): ym(r['released']) for r in setlist}
onyxlives = {key(r['set']) for r in setlist if r['released'].strip().startswith('Digital')}


def build(s):
    """The S&M build a printing of OotV set s is matched against: never the other one."""
    return ONYX if key(s) in onyxlives else WIN


cards = [json.load(open(os.path.join(CARDS, f))) for f in sorted(os.listdir(CARDS))]

votes = collections.defaultdict(collections.Counter)
setsize = collections.Counter()
for card in cards:
    for p in card['printing']:
        for s in p.get('set', []):
            db = build(s)
            setsize[s] += 1
            votes[s].update(e for e in snmeds(card, db) if e in db.edsize)

sets = {}
for s, v in votes.items():
    if NOSET.match(s) or s in RULEONLY:
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
        edsize = build(s).edsize
        big = [e for e in v if v[e] >= setsize[s] / 2] or list(v)
        sets[s] = max(big, key=lambda e: (v[e] / edsize[e], v[e]))

bycode = {}
for r in setlist:
    bycode.setdefault(r['snm_code'], ym(r['released']))
codecount = collections.Counter(sets.values())


def setdate(s):
    if s in DATES:
        return DATES[s]
    if byname.get(key(s)):
        return byname[key(s)]
    code = sets.get(s)
    return bycode.get(code) if codecount[code] == 1 else None


def own(card, p, cands, db):
    """(S&M name, code) for a printing build db has under one of the card's names, else None."""
    s = (p.get('set') or [''])[0]
    if s in RULEONLY:
        return None
    # the printing's own printed name first ("The Shattered Stormfront" in Gathering Storms)
    mine = {key(n) for n in printednames(p)}
    cands = sorted(cands, key=lambda ne: key(SIDE.sub('', ne[0])) not in mine)
    if s in KEEPCODE:
        return (snmprimary(card, db) or [html.unescape(exportname(card))])[0], sets[s]
    prim = snmprimary(card, db)
    for code in [sets.get(s)] + ALTERNATES.get(s, []):
        for name, eds in cands:
            if code and code in eds:
                # a printed name or alias never takes another card's own S&M card and edition
                if name not in prim and db.claimed.get((name, code), {card['cardid']}) - {card['cardid']}:
                    continue
                return name, code
    return None


for card in cards:
    for p in card['printing']:
        s = (p.get('set') or [''])[0]
        db = build(s)
        code = sets.get(s)
        for name in snmprimary(card, db):
            if code in db.snmnames[key(name)][name]:
                db.claimed[(name, code)].add(card['cardid'])


# loose key of each card's export name -> cardids, across both eras
owners = collections.defaultdict(set)
for card in cards:
    owners[key(exportname(card))].add(card['cardid'])


def printednamed(card, p, cands, db):
    """The S&M names (of cands) that are this printing's own printed name, other than the card's
    export name, where no other card's export name reaches them in any edition, nor is that name
    in either era (Kakita Shinichi - exp3, printed "Kakita Shinichi", in Chaos Reigns III)."""
    mine = {key(n) for n in printednames(p)} - {key(exportname(card))}
    return [name for name, eds in cands if key(SIDE.sub('', name)) in mine
            and not owners.get(key(SIDE.sub('', name)), set()) - {card['cardid']}
            and not any(db.claimed.get((name, e), set()) - {card['cardid']} for e in eds)]


printings = {}
undated = collections.Counter()
borrowed = 0
for card in cards:
    name0 = html.unescape(exportname(card))
    for db in (WIN, ONYX):
        # each era's printings against its own build only, borrowing only from that era
        mine_era = [p for p in card['printing'] if build((p.get('set') or [''])[0]) is db]
        cands = snmcards(card, db)
        if not mine_era or not cands:
            continue  # name not in this build: keep the set code, it's the best guess
        have = [(setdate(p['set'][0]), own(card, p, cands, db)) for p in mine_era if own(card, p, cands, db)]
        for p in mine_era:
            s = (p.get('set') or [''])[0]
            if NOSET.match(s):
                continue
            hit = own(card, p, cands, db)
            if not hit:
                # the most recent printing S&M has, released before this one
                d = setdate(s)
                earlier = [h for h in have if h[0] and d and h[0] < d]
                # S&M's card under this printing's own printed name first ("Yogo Junzo's Army" on the
                # Imperial promo of The Shadowlands Horde): its earlier printing, else that name with
                # no set; never a name another card's export name reaches (an experienced card's
                # printed name is the base card's)
                mine = printednamed(card, p, cands, db)
                if mine:
                    earlier = [h for h in earlier if h[1][0] in mine]
                if mine and not earlier:
                    hit = (mine[0], '')
                elif earlier:
                    hit = max(earlier, key=lambda h: h[0])[1]
                    borrowed += 1
                elif snmprimary(card, db):
                    if not d:
                        undated[s] += 1
                    hit = (snmprimary(card, db)[0], '')
                else:
                    continue  # only a printed name or alias reaches S&M, in other editions
            name, code = hit
            if key(name) == key(name0) and len(db.snmnames[key(name0)]) == 1:
                name = name0  # one S&M card: a spelling difference only (case, punctuation)
            if code != sets.get(s, '') or name != name0:
                entry = {'code': code}
                if name != name0:
                    entry['name'] = name
                printings[f"{card['cardid']}/{p['printingid']}"] = entry

text = json.dumps({'sets': dict(sorted(sets.items())), 'printings': dict(sorted(printings.items()))},
                  indent=0) + '\n'
open(OUT, 'w').write(text)
print(f"{len(sets)} sets, {len(printings)} printing overrides "
      f"({sum(1 for v in printings.values() if 'name' in v)} with an S&M name, "
      f"{sum(1 for v in printings.values() if not v['code'])} with no set, "
      f"{borrowed} from an earlier printing) -> {os.path.relpath(OUT)}")
if undated:
    print("no release date (no earlier printing picked):", dict(undated.most_common()))
print("then: python3 docs/snm/snm-push.py --go (set codes -> structure item l5r/snm) and")
print("      ../ootv-tools/printings/snm-printings.py --go (printing codes and names -> the cards'")
print("      snmsetcode and titletextsnm)")
