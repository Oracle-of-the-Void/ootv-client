# ootv-client issues — index

Grouped view of the GitHub issues on `Oracle-of-the-Void/ootv-client`. The full text
and comments for each issue are in [issues.json](issues.json), a snapshot taken
on 2026-10-09: **56 open, 152 closed** (refreshed after closing #14, #72, #190 and #191, and opening #220 and #224). GitHub is
authoritative, so check there before acting on anything here. Section 4 records a
status check of the open issues against the code and live data on the same date.

Refresh the cache from `ootv-client/` (the grouping below is hand-maintained, so
update it to match):

```
gh issue list --state all --limit 1000 --json number,title,state,stateReason,labels,author,assignees,milestone,createdAt,updatedAt,closedAt,body,comments,url \
  | jq 'sort_by(.number)' > docs/issues/issues.json
```

Handy queries:

```
jq -r '.[]|select(.state=="OPEN")|"\(.number)\t\([.labels[].name]|join(","))\t\(.title)"' docs/issues/issues.json
jq '.[]|select(.number==216)' docs/issues/issues.json
```

Links point at GitHub. Issues still open are in **bold**. ◐ marks an open issue
that is almost done; the note says what's left (details in section 4). The annotations ("likely
done", "duplicate of") are the snapshot's own reading of the comments and commits.
Nobody has confirmed them on GitHub.

[gh]: https://github.com/Oracle-of-the-Void/ootv-client/issues

---

## 1. Open issues by type

### Bugs: site and app (7)

| # | Title | Notes |
|---|---|---|
| **[216][i216]** | Legality search shows MRP instead of the printing from that arc | ◐ Front end done (PR #217: every printing value is indexed). **Left:** per-printing `legality` data for pre-Onyx printings (back end/data). See cluster A. |
| **[220][i220]** | Cached select lists in `localStorage` never refresh | Opened 2026-10-09 after #190. Needs a cache version so a deploy can invalidate old caches. |
| **[224][i224]** | Paging a search opened from a URL or card link throws in `dosearch` | Opened 2026-10-09 while testing #191. `scrollforceload`/`cardnext` take `from` from the URL query but `dosearch` rebuilds the query from the form, so `querydata[qs]` is undefined. Cards render, but only the first 50 are cached, so next/prev likely stops near card 50. Fix: page with `forcedata` from `#lastsearchquery`. |
| **[188][i188]** | Deleted cards break lists | No description. Lists keep `cardid`s that no longer resolve. |
| **[79][i79]** | Top menu not working on iPhone Safari | Template body never filled in. |
| **[76][i76]** | Wrong or missing rank/kabuto icon | ◐ Most icons fixed. **Left:** the symbol font lacks the 4 and 5 glyphs (not checked visually). |
| **[12][i12]** | Online card editor not finished | ◐ Add/edit/delete cards and instances, set MRP and the "New Card" admin link work. **Left:** image upload. |

### Enhancements by functional area (30)

| Area | Open issues |
|---|---|
| Search and filters | **[31][i31]** ◐ more search options (multi-select done; **left:** strict-arc legalities such as 20F Strict and Ivory Strict) · **[212][i212]** ◐ search by format, show that arc's MRP (same work as #216; **left:** pre-Onyx per-printing legality data) · **[201][i201]** add whole search result to list · **[8][i8]** sort by clan (primary clan problem) · **[213][i213]** quick link to "Soul of" versions · **[39][i39]** set/card chronology |
| Legality and formats | **[57][i57]** new legalities with ban lists (AEG Legacy, Big Deck) · **[212][i212]** · **[31][i31]** |
| Card display | **[205][i205]** look of the Holding GP stat · **[30][i30]** GP on pre-20F holdings (data-heavy) · **[94][i94]** hover rules text on traits · **[169][i169]** Legacy rulings per card |
| Data model | **[202][i202]** per-instance erratum/keywords · **[204][i204]** proxy as an `isProxy` flag, not a type · **[203][i203]** two-way proxy ↔ creator links |
| Lists and decks | **[28][i28]** add/remove cards in views other than simple list · **[193][i193]** edit inside visual deck list · **[194][i194]** groups (smart groups) in lists · **[36][i36]** list folders and sorting · **[189][i189]** sort the list directory by created/name · **[104][i104]** deck statistics |
| Sun and Moon interop | **[214][i214]** export S&M set codes · **[16][i16]** import S&M set acronyms |
| PDF / print-and-play | **[35][i35]** spacing, multiples, sizes, sorting · **[22][i22]** ◐ card backs and double-sided printing (backs exist as cards, double-sided instances print both sides; **left:** automatic front/back pairing for duplex) |
| Accounts and integrations | **[21][i21]** user profile management · **[38][i38]** Patreon OAuth · **[84][i84]** embeddable card-hover widget for other sites · **[20][i20]** Discord bot (see `ootv-claude/DISCORD-BOT.md`, abandoned 2020) |
| Content | **[17][i17]** host old rulebooks |
| Game-specific | **[75][i75]** LBS faction filter (needs faction pulled out of the data) |

### Data errors (19)

These are fixed in DynamoDB, not in this repo, but they're tracked here.

| Game | Kind | Open issues |
|---|---|---|
| L5R | Missing cards/printings | **[47][i47]** missing reprints · **[112][i112]** 2014 foil promos · **[113][i113]** foil Bamboo Harvesters · **[196][i196]** 11 20F story premium cards · **[98][i98]** ◐ Gold koku cards (a 5 Koku exists in Ivory/Emperor; **left:** Gold 5 Koku, and Gold 10/50 rarity/set) · **[53][i53]** Obsidian box-art strongholds (scans were emailed) |
| L5R | Wrong printing/order | **[208][i208]** Brothers in Battle defaults to old printing · **[199][i199]** full-bleed Yasuki Palaces on the wrong card · **[135][i135]** The Deciding Moment I–VIII order, flavor, story |
| L5R | Field values | **[206][i206]** Daigotsu Gyoken missing Celestial · **[180][i180]** null → `0` GC on Ivory/20F strategies · **[197][i197]** Kiho keyword inconsistent · **[195][i195]** Ambush Pass artist |
| L5R | S&M set names | **[82][i82]** "Dark Journey Home" set name · **[198][i198]** Shattered Empire export (set codes, quotes in titles) |
| Dune | | **[69][i69]** missing reprints (built from OCTGN) · **[71][i71]** fan-template images |
| LBS | | **[186][i186]** most cards missing artist · **[75][i75]** factions (also an enhancement) |
| 7th Sea | | **[80][i80]** missing Parting Shot (a card by that name now exists; see section 4) |

---

## 2. Overlap clusters

These groups share code paths or data, so fixing one usually touches the others.
Closed issues are included for history.

### A. Which printing gets shown (MRP vs. per-printing selection)

How `templatefetch`/`printingreverse` in `oracle.js` choose a printing when a search
or list names a set, an arc, an artist or an instance.

- Open: **[216][i216]** ◐, **[212][i212]** ◐, **[208][i208]**, **[199][i199]**, **[135][i135]**
- Closed: [1][i1] (artist done; legality done for Onyx+), [107][i107] (fixed in PR #183), [191][i191] (card page uses the link's printing instead of re-matching the search; PR #223), [41][i41] (visual deck ignored chosen edition), [173][i173] (multi-instance PDF, `doublesided` flag), [81][i81], [52][i52], [123][i123], [97][i97]
- **#216 and #212 are the same feature.** #212 asks for the behaviour #216 diagnoses.
  Both are blocked on per-printing `legality` data for pre-Onyx arcs. That is one
  data job in `ootv-backups`/DynamoDB.
- **#202** (per-instance erratum/keywords) is the same "instance overrides card"
  pattern that `printingreverse` already uses for set and legality.

### B. Legality and formats

- Open: **[216][i216]** ◐, **[212][i212]** ◐, **[57][i57]**, **[31][i31]** ◐, **[39][i39]**, **[206][i206]**
- Closed features: [15][i15] (Modern), [66][i66] (Unreleased), [105][i105] (dropdown in edition order), [108][i108] (Modern listed twice), [190][i190] (chronological legality on card page, plus Versions and search results sorted by set; PRs #221, #222)
- Closed data fixes: [10][i10], [46][i46], [120][i120], [124][i124], [158][i158], [159][i159], [160][i160], [164][i164], [165][i165], [166][i166], [174][i174], [175][i175], [177][i177], [178][i178]
- **#190, #105 and #39 all need an ordering for arcs.** #105 put the legality dropdown
  in arc order, and #190 (closed; PR #221) reuses that `/attributes` order on the card
  page. The same mechanism (`sortbyselect()` in `oracle.js`) also sorts the card's
  **Versions** and the search results' version buttons (PR #222) by the `printing.set` select, which L5R groups by arc in release order.
  That's a first step toward #39 for L5R. The other games' set selects are ungrouped
  and alphabetical, so their Versions keep the stored order until their set data has
  a chronology.
- **#31 "strict" legalities and #57 ban-list formats** are both "derived legality =
  base legality ± explicit list". One mechanism could serve both.

### C. Sun and Moon import/export

- Open: **[214][i214]**, **[198][i198]**, **[82][i82]**, **[16][i16]**
- Closed: [34][i34] (CRLF output)
- **All four need one per-printing S&M set-code field.** #16's comment already
  sketches it (`shortset` per printing, copied to a searchable `printingset`). #214
  includes the full acronym list from the S&M Discord. With that field, #214, #82
  and the set-code half of #198 become export-side lookups, and #16 becomes the
  import-side reverse lookup. #198 also needs quotes in titles handled.

### D. List/deck editing and management

- Open: **[28][i28]**, **[193][i193]**, **[194][i194]**, **[36][i36]**, **[189][i189]**, **[201][i201]**, **[104][i104]**, **[188][i188]**
- Closed: [5][i5] (copy deck), [6][i6] (card counts), [11][i11] (import), [25][i25], [42][i42], [43][i43] (force update), [102][i102], [154][i154] (section counts), [168][i168], [171][i171] (tokens without `deck` broke loading), [172][i172] (rename)
- **#28 and #193 overlap almost completely.** Both ask for +/- controls outside the
  simple list view (detailed view in #28, visual view in #193). One change to the
  list renderers would close both.
- **#194 builds on #193** (its author cites #193's screenshot).
- **#36 and #189 both cover organising the list directory** (folders, sorting).
- **#188 and #171 are the same failure mode:** a list holds a card that doesn't
  render (deleted in #188, bad `deck` field in #171). A defensive guard in the list
  renderer would cover both.

### E. PDF / print-and-play

- Open: **[35][i35]**, **[22][i22]** ◐
- Closed: [23][i23] (duplicate of #22), [56][i56] (card backs added as cards), [24][i24] (CORS), [26][i26], [100][i100], [103][i103] (landscape rotation), [173][i173], [187][i187] (missing images)
- ◐ **#22 is mostly done.** #56 added card backs as cards, and PR #185 prints both
  sides of double-sided instances. What's left is pairing fronts with backs
  automatically for duplex output. Re-scope it to that, or close it.
- #35's "spoiler (one of each) vs. proxy (quantity)" overlaps #173's printing selection.

### F. Proxy *cards* (in-game tokens, not PDF proxies)

- Open: **[204][i204]**, **[203][i203]**
- Closed: [171][i171], [125][i125] (zombie troops)
- #204 (an `isProxy` flag that replaces the "Proxy" type) and #203 (proxy ↔ creator
  links) are one data-model change. Both touch the L5R template searchables and the
  ES mapping. Be careful with the word "proxy": in #22, #35 and #173 it means PDF
  print-and-play.

### G. Search fields and field consistency

- Open: **[31][i31]** ◐, **[197][i197]**, **[180][i180]**, **[8][i8]**, **[201][i201]**, **[213][i213]**, **[94][i94]**
- Closed: [27][i27] (MRP/erratum/banned fields), [37][i37], [44][i44] (click set → search), [65][i65] (`-`/`*` in numeric fields), [101][i101] (Warlord level), [107][i107], [184][i184] (search printed titles/notes), [162][i162] (Ninja faction), [32][i32]
- **#197 (Kiho keyword) and #180 (null vs. 0 GC)** are both "normalise data so the
  structured filter matches what text search finds". The closed #157 (Fist of the
  Earth missing Kiho) is one instance of #197.

### H. Gold Production (GP) on holdings

- Open: **[30][i30]**, **[205][i205]**
- Closed: [78][i78] (closed as duplicate of #30), [77][i77] (Fortifications missing GP; closed, but it's really the same as #30)
- #30 is a data backfill and #205 changes how GP displays. Doing them together means
  touching the GP template code once.

### I. Errata, rulings and per-card notes

- Open: **[169][i169]** (Legacy rulings), **[202][i202]** (per-instance erratum)
- Closed: [3][i3], [4][i4] (erratum display), [27][i27]

### J. Site availability and back-end outages (all closed)

[7][i7], [19][i19], [32][i32], [33][i33] (Node 8→12), [95][i95], [99][i99] (Lambda Buffer deprecation), [155][i155] (rawgit CDN; see also PRs #210, #219 that vendored CDN deps), [170][i170] (502/503, moved OpenSearch to t3), [207][i207], [215][i215] (2026-09). Back-end causes are covered in `ootv-search/CLAUDE.md`.

---

## 3. Closed data-correction issues (L5R unless noted)

These are kept for reference. They're useful as examples of recurring data problems.

| Kind | Issues |
|---|---|
| Artist credit | [58][i58] [59][i59] [60][i60] [61][i61] [110][i110] [118][i118] [119][i119] [126][i126] [127][i127] [128][i128] [129][i129] [130][i130] [132][i132] [133][i133] [134][i134] [137][i137] [138][i138] [139][i139] [141][i141] [142][i142] [152][i152] [156][i156] |
| Legality | [10][i10] [46][i46] [120][i120] [124][i124] [158][i158] [159][i159] [160][i160] [164][i164] [165][i165] [166][i166] [174][i174] [175][i175] [177][i177] [178][i178] |
| Missing cards/printings | [143][i143] [144][i144] [145][i145] [146][i146] [147][i147] [148][i148] [149][i149] [150][i150] [151][i151] [163][i163] [97][i97] |
| Wrong/missing image | [9][i9] [52][i52] [131][i131] [136][i136] [81][i81] |
| Rarity / set | [50][i50] [54][i54] [55][i55] [111][i111] [161][i161] [123][i123] |
| Text, typos, keywords, stats | [2][i2] [48][i48] [49][i49] [62][i62] [63][i63] [140][i140] [153][i153] [157][i157] [167][i167] [176][i176] [179][i179] [64][i64] [18][i18] |
| Misc card fixes | [73][i73] [83][i83] [86][i86]–[93][i93] (Jade Edition batch) [89][i89] [96][i96] [109][i109] [114][i114] [115][i115] [116][i116] [117][i117] [121][i121] [122][i122] [125][i125] [200][i200] |
| LBS | [74][i74] (duplicate Abd al-Zhayn) |
| Dune | [72][i72] (Eye of the Storm missing ~80 cards; closed 2026-10-09 after the database matched ccgtrader's 301-card count) |
| Other / void | [85][i85] (deleted by reporter), [68][i68] (Warlord added), [13][i13] (API docs → `docs/API.md`), [14][i14] (deploy pipeline → GitHub Actions, PR #218) |

Closed UI/cosmetic work not listed above: [29][i29], [45][i45], [51][i51] (clear-cache menu), [70][i70].

---

## 4. Status check (2026-10-09)

Each open issue was checked against `oracle.js`/templates, the git log and read-only
queries to the live `/search` and `/attributes` API. The query strings are included
so the counts can be re-run, for example
`curl -s -X POST https://api.oracleofthevoid.com/search --data-urlencode table=l5r --data-urlencode 'querystring=...'`.

Closed as a result: **#14** (deploy now runs through GitHub Actions, PR #218) and
**#72** (Dune EoS has 301 cards, matching ccgtrader's count of 301). Closed later the
same day: **#190** (fixed and released in PRs #221 and #222; see cluster B) and **#191**
(released in PR #223; see cluster A).

### Possibly done (needs confirmation)

| # | Finding |
|---|---|
| **[80][i80]** | A 7th Sea card titled *Parting Shot* exists (cardid 977, Strange Vistas). If the issue meant that card, it's done. If it meant a *set* by that name, it isn't: the 7th Sea set list has no Parting Shot. |

### Almost done (one piece left)

| # | Done | Left |
|---|---|---|
| **[216][i216]** / **[212][i212]** | Front end indexes every printing value (PR #217). | Per-printing `legality` for pre-Onyx printings (data). |
| **[12][i12]** | Add/edit/delete cards and instances, set MRP, "New Card" admin link. | Image upload. The admin page still lists it under "Need to have". |
| **[31][i31]** | Multi-select search. | "Strict" arc legalities (20F Strict, Ivory Strict). None exist in `/attributes` `legality`. Could be split off into its own issue. |
| **[22][i22]** | Card backs exist as cards (#56). Double-sided instances print both sides (PR #185). | Automatically pairing fronts with backs for duplex output. |
| **[76][i76]** | Most rank icons fixed (per the issue comment). | Glyphs for 4 and 5 are missing from the symbol font. Not checked visually. |
| **[98][i98]** | A 5 Koku card exists (Ivory and Emperor premium printings). | No Gold Edition 5 Koku. Gold 10/50 Koku are still `Promo` / `Promotional–Gold` instead of `Premium` / `Gold Edition`. |

### Confirmed still open

| # | Evidence |
|---|---|
| **[206][i206]** | cardid 1720 legality has no `Destroyer War (Celestial)`, despite a Celestial printing. |
| **[208][i208]** | cardid 1164 `printingprimary` is still 1 (Before the Dawn). The Emperor promo is printing 2. |
| **[199][i199]** | cardid 9458 (Yasuki Palaces) still has the Promotional–Emperor full-bleed printing (3). |
| **[195][i195]** | Ambush Pass (10195) still credits Noah Bradley. |
| **[135][i135]** | cardid 10119 still has one promo printing with all seven artists, not eight versions. |
| **[113][i113]** | No foil printing on any Bamboo Harvesters. |
| **[53][i53]** | Ancestral Home of the Lion Obsidian printing is still the Emerald art (Christina Wald). |
| **[180][i180]** | `type:strategy AND (legality:*Ivory* OR legality:*Festivals*)`: 440 with no `cost`, 78 with. |
| **[197][i197]** | `text:kiho AND NOT keywords:kiho`: 222 cards; `keywords:kiho`: 297. |
| **[30][i30]** | `type:holding`: 159 with `production`, 789 without. |
| **[186][i186]** | LBS: 8 of 684 cards have `artist`. |
| **[75][i75]** | LBS: no card has a `faction` field. |
| **[214][i214]** / **[82][i82]** / **[198][i198]** | `template-textsnm.html` exports the full printing `set` name, not an S&M code. |
| **[188][i188]** | `renderlist`/`listprefetch` have no handling for a `cardid` that no longer exists. |

---

## 5. Suggested housekeeping

- Confirm what **#80** meant and close it if it was the card.
- Narrow **#12** to "image upload" and **#31** to "strict legalities", or split them.
- Re-scope or close **#22** (see cluster E).
- Merge **#28 into #193**, or the reverse.
- Link **#212 ↔ #216** and **#214 ↔ #198 ↔ #82 ↔ #16** on GitHub so the clusters
  show up there too.
- Fill in or close the empty-template issues **#79** and **#94** (the #94 body is
  the unedited template; only its title says what it wants).

<!-- link targets -->
[i1]: https://github.com/Oracle-of-the-Void/ootv-client/issues/1
[i2]: https://github.com/Oracle-of-the-Void/ootv-client/issues/2
[i3]: https://github.com/Oracle-of-the-Void/ootv-client/issues/3
[i4]: https://github.com/Oracle-of-the-Void/ootv-client/issues/4
[i5]: https://github.com/Oracle-of-the-Void/ootv-client/issues/5
[i6]: https://github.com/Oracle-of-the-Void/ootv-client/issues/6
[i7]: https://github.com/Oracle-of-the-Void/ootv-client/issues/7
[i8]: https://github.com/Oracle-of-the-Void/ootv-client/issues/8
[i9]: https://github.com/Oracle-of-the-Void/ootv-client/issues/9
[i10]: https://github.com/Oracle-of-the-Void/ootv-client/issues/10
[i11]: https://github.com/Oracle-of-the-Void/ootv-client/issues/11
[i12]: https://github.com/Oracle-of-the-Void/ootv-client/issues/12
[i13]: https://github.com/Oracle-of-the-Void/ootv-client/issues/13
[i14]: https://github.com/Oracle-of-the-Void/ootv-client/issues/14
[i15]: https://github.com/Oracle-of-the-Void/ootv-client/issues/15
[i16]: https://github.com/Oracle-of-the-Void/ootv-client/issues/16
[i17]: https://github.com/Oracle-of-the-Void/ootv-client/issues/17
[i18]: https://github.com/Oracle-of-the-Void/ootv-client/issues/18
[i19]: https://github.com/Oracle-of-the-Void/ootv-client/issues/19
[i20]: https://github.com/Oracle-of-the-Void/ootv-client/issues/20
[i21]: https://github.com/Oracle-of-the-Void/ootv-client/issues/21
[i22]: https://github.com/Oracle-of-the-Void/ootv-client/issues/22
[i23]: https://github.com/Oracle-of-the-Void/ootv-client/issues/23
[i24]: https://github.com/Oracle-of-the-Void/ootv-client/issues/24
[i25]: https://github.com/Oracle-of-the-Void/ootv-client/issues/25
[i26]: https://github.com/Oracle-of-the-Void/ootv-client/issues/26
[i27]: https://github.com/Oracle-of-the-Void/ootv-client/issues/27
[i28]: https://github.com/Oracle-of-the-Void/ootv-client/issues/28
[i29]: https://github.com/Oracle-of-the-Void/ootv-client/issues/29
[i30]: https://github.com/Oracle-of-the-Void/ootv-client/issues/30
[i31]: https://github.com/Oracle-of-the-Void/ootv-client/issues/31
[i32]: https://github.com/Oracle-of-the-Void/ootv-client/issues/32
[i33]: https://github.com/Oracle-of-the-Void/ootv-client/issues/33
[i34]: https://github.com/Oracle-of-the-Void/ootv-client/issues/34
[i35]: https://github.com/Oracle-of-the-Void/ootv-client/issues/35
[i36]: https://github.com/Oracle-of-the-Void/ootv-client/issues/36
[i37]: https://github.com/Oracle-of-the-Void/ootv-client/issues/37
[i38]: https://github.com/Oracle-of-the-Void/ootv-client/issues/38
[i39]: https://github.com/Oracle-of-the-Void/ootv-client/issues/39
[i41]: https://github.com/Oracle-of-the-Void/ootv-client/issues/41
[i42]: https://github.com/Oracle-of-the-Void/ootv-client/issues/42
[i43]: https://github.com/Oracle-of-the-Void/ootv-client/issues/43
[i44]: https://github.com/Oracle-of-the-Void/ootv-client/issues/44
[i45]: https://github.com/Oracle-of-the-Void/ootv-client/issues/45
[i46]: https://github.com/Oracle-of-the-Void/ootv-client/issues/46
[i47]: https://github.com/Oracle-of-the-Void/ootv-client/issues/47
[i48]: https://github.com/Oracle-of-the-Void/ootv-client/issues/48
[i49]: https://github.com/Oracle-of-the-Void/ootv-client/issues/49
[i50]: https://github.com/Oracle-of-the-Void/ootv-client/issues/50
[i51]: https://github.com/Oracle-of-the-Void/ootv-client/issues/51
[i52]: https://github.com/Oracle-of-the-Void/ootv-client/issues/52
[i53]: https://github.com/Oracle-of-the-Void/ootv-client/issues/53
[i54]: https://github.com/Oracle-of-the-Void/ootv-client/issues/54
[i55]: https://github.com/Oracle-of-the-Void/ootv-client/issues/55
[i56]: https://github.com/Oracle-of-the-Void/ootv-client/issues/56
[i57]: https://github.com/Oracle-of-the-Void/ootv-client/issues/57
[i58]: https://github.com/Oracle-of-the-Void/ootv-client/issues/58
[i59]: https://github.com/Oracle-of-the-Void/ootv-client/issues/59
[i60]: https://github.com/Oracle-of-the-Void/ootv-client/issues/60
[i61]: https://github.com/Oracle-of-the-Void/ootv-client/issues/61
[i62]: https://github.com/Oracle-of-the-Void/ootv-client/issues/62
[i63]: https://github.com/Oracle-of-the-Void/ootv-client/issues/63
[i64]: https://github.com/Oracle-of-the-Void/ootv-client/issues/64
[i65]: https://github.com/Oracle-of-the-Void/ootv-client/issues/65
[i66]: https://github.com/Oracle-of-the-Void/ootv-client/issues/66
[i68]: https://github.com/Oracle-of-the-Void/ootv-client/issues/68
[i69]: https://github.com/Oracle-of-the-Void/ootv-client/issues/69
[i70]: https://github.com/Oracle-of-the-Void/ootv-client/issues/70
[i71]: https://github.com/Oracle-of-the-Void/ootv-client/issues/71
[i72]: https://github.com/Oracle-of-the-Void/ootv-client/issues/72
[i73]: https://github.com/Oracle-of-the-Void/ootv-client/issues/73
[i74]: https://github.com/Oracle-of-the-Void/ootv-client/issues/74
[i75]: https://github.com/Oracle-of-the-Void/ootv-client/issues/75
[i76]: https://github.com/Oracle-of-the-Void/ootv-client/issues/76
[i77]: https://github.com/Oracle-of-the-Void/ootv-client/issues/77
[i78]: https://github.com/Oracle-of-the-Void/ootv-client/issues/78
[i79]: https://github.com/Oracle-of-the-Void/ootv-client/issues/79
[i80]: https://github.com/Oracle-of-the-Void/ootv-client/issues/80
[i81]: https://github.com/Oracle-of-the-Void/ootv-client/issues/81
[i82]: https://github.com/Oracle-of-the-Void/ootv-client/issues/82
[i83]: https://github.com/Oracle-of-the-Void/ootv-client/issues/83
[i84]: https://github.com/Oracle-of-the-Void/ootv-client/issues/84
[i85]: https://github.com/Oracle-of-the-Void/ootv-client/issues/85
[i86]: https://github.com/Oracle-of-the-Void/ootv-client/issues/86
[i89]: https://github.com/Oracle-of-the-Void/ootv-client/issues/89
[i93]: https://github.com/Oracle-of-the-Void/ootv-client/issues/93
[i94]: https://github.com/Oracle-of-the-Void/ootv-client/issues/94
[i95]: https://github.com/Oracle-of-the-Void/ootv-client/issues/95
[i96]: https://github.com/Oracle-of-the-Void/ootv-client/issues/96
[i97]: https://github.com/Oracle-of-the-Void/ootv-client/issues/97
[i98]: https://github.com/Oracle-of-the-Void/ootv-client/issues/98
[i99]: https://github.com/Oracle-of-the-Void/ootv-client/issues/99
[i100]: https://github.com/Oracle-of-the-Void/ootv-client/issues/100
[i101]: https://github.com/Oracle-of-the-Void/ootv-client/issues/101
[i102]: https://github.com/Oracle-of-the-Void/ootv-client/issues/102
[i103]: https://github.com/Oracle-of-the-Void/ootv-client/issues/103
[i104]: https://github.com/Oracle-of-the-Void/ootv-client/issues/104
[i105]: https://github.com/Oracle-of-the-Void/ootv-client/issues/105
[i107]: https://github.com/Oracle-of-the-Void/ootv-client/issues/107
[i108]: https://github.com/Oracle-of-the-Void/ootv-client/issues/108
[i109]: https://github.com/Oracle-of-the-Void/ootv-client/issues/109
[i110]: https://github.com/Oracle-of-the-Void/ootv-client/issues/110
[i111]: https://github.com/Oracle-of-the-Void/ootv-client/issues/111
[i112]: https://github.com/Oracle-of-the-Void/ootv-client/issues/112
[i113]: https://github.com/Oracle-of-the-Void/ootv-client/issues/113
[i114]: https://github.com/Oracle-of-the-Void/ootv-client/issues/114
[i115]: https://github.com/Oracle-of-the-Void/ootv-client/issues/115
[i116]: https://github.com/Oracle-of-the-Void/ootv-client/issues/116
[i117]: https://github.com/Oracle-of-the-Void/ootv-client/issues/117
[i118]: https://github.com/Oracle-of-the-Void/ootv-client/issues/118
[i119]: https://github.com/Oracle-of-the-Void/ootv-client/issues/119
[i120]: https://github.com/Oracle-of-the-Void/ootv-client/issues/120
[i121]: https://github.com/Oracle-of-the-Void/ootv-client/issues/121
[i122]: https://github.com/Oracle-of-the-Void/ootv-client/issues/122
[i123]: https://github.com/Oracle-of-the-Void/ootv-client/issues/123
[i124]: https://github.com/Oracle-of-the-Void/ootv-client/issues/124
[i125]: https://github.com/Oracle-of-the-Void/ootv-client/issues/125
[i126]: https://github.com/Oracle-of-the-Void/ootv-client/issues/126
[i127]: https://github.com/Oracle-of-the-Void/ootv-client/issues/127
[i128]: https://github.com/Oracle-of-the-Void/ootv-client/issues/128
[i129]: https://github.com/Oracle-of-the-Void/ootv-client/issues/129
[i130]: https://github.com/Oracle-of-the-Void/ootv-client/issues/130
[i131]: https://github.com/Oracle-of-the-Void/ootv-client/issues/131
[i132]: https://github.com/Oracle-of-the-Void/ootv-client/issues/132
[i133]: https://github.com/Oracle-of-the-Void/ootv-client/issues/133
[i134]: https://github.com/Oracle-of-the-Void/ootv-client/issues/134
[i135]: https://github.com/Oracle-of-the-Void/ootv-client/issues/135
[i136]: https://github.com/Oracle-of-the-Void/ootv-client/issues/136
[i137]: https://github.com/Oracle-of-the-Void/ootv-client/issues/137
[i138]: https://github.com/Oracle-of-the-Void/ootv-client/issues/138
[i139]: https://github.com/Oracle-of-the-Void/ootv-client/issues/139
[i140]: https://github.com/Oracle-of-the-Void/ootv-client/issues/140
[i141]: https://github.com/Oracle-of-the-Void/ootv-client/issues/141
[i142]: https://github.com/Oracle-of-the-Void/ootv-client/issues/142
[i143]: https://github.com/Oracle-of-the-Void/ootv-client/issues/143
[i144]: https://github.com/Oracle-of-the-Void/ootv-client/issues/144
[i145]: https://github.com/Oracle-of-the-Void/ootv-client/issues/145
[i146]: https://github.com/Oracle-of-the-Void/ootv-client/issues/146
[i147]: https://github.com/Oracle-of-the-Void/ootv-client/issues/147
[i148]: https://github.com/Oracle-of-the-Void/ootv-client/issues/148
[i149]: https://github.com/Oracle-of-the-Void/ootv-client/issues/149
[i150]: https://github.com/Oracle-of-the-Void/ootv-client/issues/150
[i151]: https://github.com/Oracle-of-the-Void/ootv-client/issues/151
[i152]: https://github.com/Oracle-of-the-Void/ootv-client/issues/152
[i153]: https://github.com/Oracle-of-the-Void/ootv-client/issues/153
[i154]: https://github.com/Oracle-of-the-Void/ootv-client/issues/154
[i155]: https://github.com/Oracle-of-the-Void/ootv-client/issues/155
[i156]: https://github.com/Oracle-of-the-Void/ootv-client/issues/156
[i157]: https://github.com/Oracle-of-the-Void/ootv-client/issues/157
[i158]: https://github.com/Oracle-of-the-Void/ootv-client/issues/158
[i159]: https://github.com/Oracle-of-the-Void/ootv-client/issues/159
[i160]: https://github.com/Oracle-of-the-Void/ootv-client/issues/160
[i161]: https://github.com/Oracle-of-the-Void/ootv-client/issues/161
[i162]: https://github.com/Oracle-of-the-Void/ootv-client/issues/162
[i163]: https://github.com/Oracle-of-the-Void/ootv-client/issues/163
[i164]: https://github.com/Oracle-of-the-Void/ootv-client/issues/164
[i165]: https://github.com/Oracle-of-the-Void/ootv-client/issues/165
[i166]: https://github.com/Oracle-of-the-Void/ootv-client/issues/166
[i167]: https://github.com/Oracle-of-the-Void/ootv-client/issues/167
[i168]: https://github.com/Oracle-of-the-Void/ootv-client/issues/168
[i169]: https://github.com/Oracle-of-the-Void/ootv-client/issues/169
[i170]: https://github.com/Oracle-of-the-Void/ootv-client/issues/170
[i171]: https://github.com/Oracle-of-the-Void/ootv-client/issues/171
[i172]: https://github.com/Oracle-of-the-Void/ootv-client/issues/172
[i173]: https://github.com/Oracle-of-the-Void/ootv-client/issues/173
[i174]: https://github.com/Oracle-of-the-Void/ootv-client/issues/174
[i175]: https://github.com/Oracle-of-the-Void/ootv-client/issues/175
[i176]: https://github.com/Oracle-of-the-Void/ootv-client/issues/176
[i177]: https://github.com/Oracle-of-the-Void/ootv-client/issues/177
[i178]: https://github.com/Oracle-of-the-Void/ootv-client/issues/178
[i179]: https://github.com/Oracle-of-the-Void/ootv-client/issues/179
[i180]: https://github.com/Oracle-of-the-Void/ootv-client/issues/180
[i184]: https://github.com/Oracle-of-the-Void/ootv-client/issues/184
[i186]: https://github.com/Oracle-of-the-Void/ootv-client/issues/186
[i187]: https://github.com/Oracle-of-the-Void/ootv-client/issues/187
[i188]: https://github.com/Oracle-of-the-Void/ootv-client/issues/188
[i189]: https://github.com/Oracle-of-the-Void/ootv-client/issues/189
[i190]: https://github.com/Oracle-of-the-Void/ootv-client/issues/190
[i191]: https://github.com/Oracle-of-the-Void/ootv-client/issues/191
[i193]: https://github.com/Oracle-of-the-Void/ootv-client/issues/193
[i194]: https://github.com/Oracle-of-the-Void/ootv-client/issues/194
[i195]: https://github.com/Oracle-of-the-Void/ootv-client/issues/195
[i196]: https://github.com/Oracle-of-the-Void/ootv-client/issues/196
[i197]: https://github.com/Oracle-of-the-Void/ootv-client/issues/197
[i198]: https://github.com/Oracle-of-the-Void/ootv-client/issues/198
[i199]: https://github.com/Oracle-of-the-Void/ootv-client/issues/199
[i200]: https://github.com/Oracle-of-the-Void/ootv-client/issues/200
[i201]: https://github.com/Oracle-of-the-Void/ootv-client/issues/201
[i202]: https://github.com/Oracle-of-the-Void/ootv-client/issues/202
[i203]: https://github.com/Oracle-of-the-Void/ootv-client/issues/203
[i204]: https://github.com/Oracle-of-the-Void/ootv-client/issues/204
[i205]: https://github.com/Oracle-of-the-Void/ootv-client/issues/205
[i206]: https://github.com/Oracle-of-the-Void/ootv-client/issues/206
[i207]: https://github.com/Oracle-of-the-Void/ootv-client/issues/207
[i208]: https://github.com/Oracle-of-the-Void/ootv-client/issues/208
[i212]: https://github.com/Oracle-of-the-Void/ootv-client/issues/212
[i213]: https://github.com/Oracle-of-the-Void/ootv-client/issues/213
[i214]: https://github.com/Oracle-of-the-Void/ootv-client/issues/214
[i215]: https://github.com/Oracle-of-the-Void/ootv-client/issues/215
[i216]: https://github.com/Oracle-of-the-Void/ootv-client/issues/216
[i220]: https://github.com/Oracle-of-the-Void/ootv-client/issues/220
[i224]: https://github.com/Oracle-of-the-Void/ootv-client/issues/224
