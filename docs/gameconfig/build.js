#!/usr/bin/env node
// Builds the structure-driven game config items from a game's templates/<game>.js and its rows file
// docs/gameconfig/<game>.json (ootv-claude GAME-TEMPLATES.md §2). Writes JSON files for push.py:
//
//   node docs/gameconfig/build.js [<game>...] --out DIR
//
//   DIR/all-games.json       all/games: the games with a templates/<game>.js, in index.html's script order
//                            (push.py merges it into the stored list, which keeps the structure-only games)
//   DIR/all-templates.json   all/templates: every view's settings and HTML; card and search are the
//                            masters in docs/gameconfig/masters/, the rest templates/template-<view>.html
//   DIR/<game>-game.json     <game>/game: info (dbinfo), quick, search order, extra labels, rows,
//                            sort, headers, views (add/remove against the standard set), symbols
//   DIR/<game>-settings.json the field list settings for <game>/fields (label, short, search per field)
//
// Reading only; push.py writes them (production). A game drawn only from structure (no templates/<game>.js,
// e.g. initiald since 2026-10-23) isn't rebuilt from here: its items are the source, edited in Admin.
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const args = process.argv.slice(2);
const out = args[args.indexOf('--out') + 1];
const games = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--out');
if (!out) { console.error('usage: build.js [<game>...] --out DIR   (no game: only all/games and all/templates)'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });

// every game's templates/<game>.js, in index.html's order
const order = [...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/src="templates\/([\w-]+)\.js/g)].map(m => m[1]);
const ctx = { console: { log() {} }, $: () => ({ ready() {} }), document: {} };
ctx.window = ctx;
vm.createContext(ctx);
for (const g of order) vm.runInContext(fs.readFileSync(path.join(ROOT, 'templates', g + '.js'), 'utf8'), ctx, { filename: g + '.js' });
const write = (name, obj) => fs.writeFileSync(path.join(out, name), JSON.stringify(obj, null, 1) + '\n');

write('all-games.json', { games: order.map(g => ({ table: g, name: ctx.dbinfo[g].name,
  nameshort: ctx.dbinfo[g].nameshort, logo: ctx.dbinfo[g].logo })) });

// the views: l5r offers all of them; the standard set is what most games offer
const STANDARD = ['search', 'visual', 'visual-deck', 'visual-premium', 'card', 'card-premium', 'list', 'pdf',
                  'text', 'texttab', 'html', 'table'];
const MASTERS = { card: 'card.html', search: 'search.html' };
const views = {};
for (const [key, v] of Object.entries(ctx.templates.l5r.available)) {
  const view = JSON.parse(JSON.stringify(v));
  view.generic = true;   // every view is one master now
  if (!(view.override && view.override.templatekey)) {
    view.html = fs.readFileSync(MASTERS[key] ? path.join(__dirname, 'masters', MASTERS[key])
                                             : path.join(ROOT, 'templates', 'template-' + key + '.html'), 'utf8');
  }
  views[key] = view;
}
write('all-templates.json', { standard: STANDARD, views });

for (const g of games) {
  const conf = JSON.parse(fs.readFileSync(path.join(__dirname, g + '.json'), 'utf8'));
  const sea = ctx.searchables[g], lab = ctx.labels[g], t = ctx.templates[g];
  const rowfields = place => (conf.rows[place] || []).flatMap(function f(r) { return r.fields.concat(r.else ? f(r.else) : []); });
  const printingfields = new Set(rowfields('printing'));
  const settings = { card: {}, printing: {} };
  const level = name => printingfields.has(name) ? 'printing' : 'card';
  const entry = (lvl, name) => (settings[lvl][name] = settings[lvl][name] || {});
  const search = [];
  // searchrename {old key: new key}: a card key moved to its printing field (§1.7 #8, lbs artist ->
  // printing.artist); old links and saved searches are mapped by info.renamedfields
  const rename = conf.searchrename || {};
  const renamedfields = {};
  for (let [key, s] of Object.entries(sea)) {
    if (key === 'quick' || (conf.searchdrop || []).includes(key)) continue;
    if (rename[key]) {
      renamedfields[key] = rename[key].replace('.', '_');
      s = Object.assign({}, s);
      if (s.clickable === 'printing') s.clickable = true;   // a printing.* key links its printing values itself
      key = rename[key];
    }
    search.push(key);
    const [lvl, name] = key.startsWith('printing.') ? ['printing', key.slice(9)] : [level(key), key];
    entry(lvl, name).search = s;
    if (lvl === 'printing' && !key.startsWith('printing.')) entry(lvl, name).searchkey = key;   // l5r/lbs card keys
  }
  const extra = {};
  const fieldnames = new Set([...rowfields('card'), ...rowfields('printing'), ...rowfields('detail'),
                              ...search.map(k => k.replace(/^printing\./, ''))]);
  for (const k of Object.keys(lab)) {
    const m = k.match(/^(tag|short)(.+)$/);
    if (!m) continue;
    const [, kind, name] = m;
    const prop = kind === 'tag' ? 'label' : 'short';
    if (fieldnames.has(name)) entry(level(name), name)[prop] = lab[k];
    else (extra[name] = extra[name] || {})[prop] = lab[k];
  }
  // labels the old file lacked, for fields the rows now show (fieldlabels: {field: {label, short}})
  for (const [name, l] of Object.entries(conf.fieldlabels || {})) Object.assign(entry(level(name), name), l);
  const avail = Object.keys(t.available);
  write(g + '-game.json', {
    info: Object.assign({}, ctx.dbinfo[g], conf.info,
                        Object.keys(renamedfields).length ? { renamedfields: Object.assign({}, ctx.dbinfo[g].renamedfields, renamedfields) } : {}),
    quick: sea.quick === undefined ? null : sea.quick, search, labels: extra,
    rows: conf.rows, sort: conf.sort, headers: conf.headers,
    views: { add: avail.filter(k => !STANDARD.includes(k)), remove: STANDARD.filter(k => !avail.includes(k)) },
    default: t.default, symbols: conf.symbols || []
  });
  write(g + '-settings.json', settings);
  console.log(g + ': ' + search.length + ' search fields, ' + Object.keys(settings.card).length + ' card + ' +
              Object.keys(settings.printing).length + ' printing field settings, extra labels ' + Object.keys(extra).join(','));
}
