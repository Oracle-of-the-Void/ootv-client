// Admin -> Set import and Admin -> Import profiles. Loaded on demand (loadsetimport in oracle.js),
// with setimport-etl.js, the engine that turns CSV rows into cards from an import profile.
// The server side is ootv-search's ootv-admin Lambda (POST /setimport: profiles, check, register,
// plan, export, apply, ...) and /setimportverify (the ES check). docs/admin/set-import.md is the
// admin's guide; STEPS.md in ootv-import points here.

var setimp = {db: null, profiles: null, pname: null, params: {}, edited: {}, csv: null, result: null,
              check: null, plan: null, overrides: {}, job: null, meta: null, run: null};

function setimpesc(s) {
  return String(s === undefined || s === null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function setimperr(e) {
  return (e && e.responseJSON && e.responseJSON.error) || (e && e.responseText) || (e && e.message) || String(e);
}

// POST /setimport (ootv-admin); db defaults to the set import's game
function setimpapi(action, data, db) {
  return Promise.resolve($.ajax({
    type: 'POST',
    url: apiuri+"/setimport",
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify(Object.assign({"uid": getuid(), "database": db || setimp.db, "action": action}, data || {})),
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());}
  }));
}

function setimpstatus(id, msg, cls) {
  $('#'+id).html(msg ? '<span'+(cls ? ' class="'+cls+'"' : '')+'>'+msg+'</span>' : '');
}

function setimpprofile() {
  return (setimp.profiles || []).find(p => p.name == setimp.pname) || null;
}

// ---------------------------------------------------------------- open

function setimportopen() {
  $('#setimport').show();
  if(!gamepermission('setimport')) {
    $('#setimport').text('The set import needs the setimport (or full) permission on '+dbinfo[database].name+'.');
    setimp.db = null;
    return;
  }
  if(setimp.db == database && $('#setimp-setup').length) {   // keep the import in progress
    if(!setimp.profiles) { setimpreloadprofiles(); }          // saved in Import profiles meanwhile
    return;
  }
  if(setimp.run) { return; }
  setimp = {db: database, profiles: null, pname: null, params: {}, edited: {}, csv: null, result: null,
            check: null, plan: null, overrides: {}, job: null, meta: null, run: null};
  $('#setimport').html(
    '<h3>Set import: '+setimpesc(dbinfo[database].name)+'</h3>'+
    '<p>From a spreadsheet (CSV) to cards on the live site. Each step can be redone until Go live; nothing changes a card before Apply. '+
    '<a href="" onclick="loadadmindoc(\'set-import\'); return false">How it works</a></p>'+
    '<div id="setimp-jobs" class="setimp-section"></div>'+
    '<div id="setimp-setup" class="setimp-section"></div>'+
    '<div id="setimp-preview" class="setimp-section"></div>'+
    '<div id="setimp-register" class="setimp-section"></div>'+
    '<div id="setimp-images" class="setimp-section"></div>'+
    '<div id="setimp-plan" class="setimp-section"></div>'+
    '<div id="setimp-live" class="setimp-section"></div>');
  $('#setimp-setup').html('<h4>1. Setup</h4>Loading import profiles...');
  setimpapi('profiles').then(function(r) {
    setimp.profiles = r.profiles;
    setimp.pname = r.profiles.length ? r.profiles[0].name : null;
    setimprendersetup();
  }).catch(function(e) {
    $('#setimp-setup').html('<h4>1. Setup</h4><span class="error">'+setimpesc(setimperr(e))+'</span>');
  });
  setimploadjobs();
}

function setimpreloadprofiles() {
  setimpapi('profiles').then(function(r) {
    setimp.profiles = r.profiles;
    if(!setimpprofile()) { setimp.pname = r.profiles.length ? r.profiles[0].name : null; setimp.edited = {}; }
    setimprendersetup();
    (setimpprofile() ? setimpprofile().profile.params || [] : []).forEach(d => {
      if(setimp.edited[d.name]) { $('#setimp-p-'+d.name).val(setimp.params[d.name]); }
    });
  });
}

// ---------------------------------------------------------------- earlier imports

function setimploadjobs() {
  setimpapi('jobs').then(function(r) {
    var open = r.jobs.filter(j => !['done'].includes(j.status));
    if(!r.jobs.length) { $('#setimp-jobs').empty(); return; }
    var html = '<details'+(open.some(j => j.status != 'planned') ? ' open' : '')+'><summary>Earlier imports ('+r.jobs.length+
               (open.length ? ', '+open.length+' not finished' : '')+')</summary><table class="setimp-table"><tr><th>Started</th><th>Set</th><th>By</th><th>Status</th><th>Cards</th><th></th></tr>';
    r.jobs.forEach(function(j) {
      html += '<tr><td>'+new Date(j.created).toLocaleString()+'</td><td>'+setimpesc(j.set)+'</td><td>'+setimpesc(j.uname)+
              '</td><td>'+setimpesc(j.status)+(j.problems ? ' ('+j.problems+' problems)' : '')+'</td><td>'+
              (j.counts ? j.counts.new+' new, '+j.counts.printings+' reprints' : '')+(j.written ? '; '+j.written+' written' : '')+
              '</td><td><a href="" onclick="setimpopenjob(\''+setimpesc(j.job)+'\'); return false">open</a></td></tr>';
    });
    $('#setimp-jobs').html(html+'</table></details>');
  }).catch(function(e) { $('#setimp-jobs').html('<span class="error">'+setimpesc(setimperr(e))+'</span>'); });
}

// pick up an earlier import where it stopped (its plan, export, apply and verify)
function setimpopenjob(job) {
  setimpapi('job', {"job": job}).then(function(m) {
    setimp.job = job;
    setimp.meta = m;
    setimp.plan = {job: job, ready: !m.problems.length, problems: m.problems, warnings: m.warnings, infos: m.infos,
                   counts: m.counts, description: m.description, set: m.set, imagehash: m.imagehash, fromjob: true};
    setimprenderplan();
    setimprenderlive();
    $('html, body').animate({scrollTop: $('#setimp-plan').offset().top - 60}, 200);
  }).catch(e => alert(setimperr(e)));
}

// ---------------------------------------------------------------- 1. setup

function setimprendersetup() {
  var p = setimpprofile();
  var html = '<h4>1. Setup</h4>';
  if(!setimp.profiles.length) {
    $('#setimp-setup').html(html+'No import profiles for this game yet. <a href="" onclick="importprofilesopen(); return false">Create one in Import profiles</a>.');
    return;
  }
  html += '<p>Profile <select id="setimp-profile" onchange="setimp.pname = this.value; setimp.edited = {}; setimp.params = {}; setimprendersetup();">'+
          setimp.profiles.map(x => '<option'+(x.name == setimp.pname ? ' selected' : '')+'>'+setimpesc(x.name)+'</option>').join('')+
          '</select> <small>'+setimpesc(p.description)+' (version '+p.version+') &middot; <a href="" onclick="importprofilesopen(); return false">manage profiles</a></small></p>';
  html += '<table class="setimp-params">';
  (p.profile.params || []).forEach(function(d) {
    html += '<tr><td><label for="setimp-p-'+setimpesc(d.name)+'">'+setimpesc(d.label || d.name)+(d.required ? ' *' : '')+'</label></td>'+
            '<td><input type="text" id="setimp-p-'+setimpesc(d.name)+'" data-param="'+setimpesc(d.name)+'" size="40"'+
            (d.options ? ' list="setimp-o-'+setimpesc(d.name)+'"' : '')+' oninput="setimpparam(this)" onchange="setimpparam(this, true)" />'+
            (setimportetl.cleankind(d) == 'id' ? ' <small>letters, digits, _ and - only</small>' : '')+
            (d.options ? '<datalist id="setimp-o-'+setimpesc(d.name)+'"></datalist>' : '')+
            (d.help ? ' <small>'+setimpesc(d.help)+'</small>' : '')+'</td></tr>';
  });
  html += '<tr><td>Spreadsheet (CSV)</td><td><input type="file" id="setimp-csv" accept=".csv,text/csv" onchange="setimpreadcsv(this)" />'+
          (setimp.csv ? ' <small>'+setimpesc(setimp.csv.name)+': '+setimp.csv.rows.length+' rows</small>' : '')+'</td></tr></table>';
  html += '<input type="button" value="Pre-Process Cards" onclick="setimptransform()" /> <span id="setimp-setupstatus"></span>';
  $('#setimp-setup').html(html);
  setimpdefaults();
  (p.profile.params || []).filter(d => typeof d.options == 'string' && d.options.indexOf('vocab:') == 0).forEach(function(d) {
    $.ajax({type: 'POST', url: apiuri+"/attributes", contentType: 'application/json', dataType: 'json',
            data: JSON.stringify({"table": setimp.db, "lookup": d.options.slice(6)})})
      .done(vals => $('#setimp-o-'+d.name).html((vals || []).map(v => '<option value="'+setimpesc(v)+'">').join('')));
  });
}

// id answers lose other characters as they're typed; text answers (the set name) are tidied when
// the field is left: &nbsp; becomes a space, never the other way round
function setimpparam(el, done) {
  var name = $(el).data('param');
  var d = (setimpprofile().profile.params || []).find(x => x.name == name) || {};
  var kind = setimportetl.cleankind(d);
  if(kind == 'id' || (kind && done)) {
    var v = setimportetl.cleanparam(el.value, kind);
    if(v !== el.value) {
      var at = Math.max(0, (el.selectionStart || 0) - (el.value.length - v.length));
      el.value = v;
      if(!done) { el.setSelectionRange(at, at); }
    }
  }
  setimp.params[name] = el.value;
  // a field being typed in keeps what's typed, even empty; left empty, it goes back to its default
  setimp.edited[name] = !done || el.value !== '';
  setimpdefaults();
}

// defaults follow the other values ({{set|initials}}) until a field is typed into
function setimpdefaults() {
  var p = setimpprofile();
  if(!p) { return; }
  // defaults are worked out from the other answers as they'll be used (cleaned)
  var clean = {};
  (p.profile.params || []).forEach(d => { clean[d.name] = setimportetl.cleanparam(setimp.params[d.name], setimportetl.cleankind(d)); });
  (p.profile.params || []).forEach(function(d) {
    if(setimp.edited[d.name]) { return; }
    var v = d.default === undefined ? '' : setimportetl.render(String(d.default), {params: clean, temp: {}});
    clean[d.name] = v;
    v = setimportetl.cleanparam(v, setimportetl.cleankind(d));
    setimp.params[d.name] = v;
    $('#setimp-p-'+d.name).val(v);
  });
}

function setimpreadcsv(input) {
  var f = input.files[0];
  if(!f) { return; }
  f.text().then(function(text) {
    var parsed = setimportetl.csvobjects(text);
    setimp.csv = {name: f.name, text: text, header: parsed.header, rows: parsed.rows};
    setimpstatus('setimp-setupstatus', setimpesc(f.name)+': '+parsed.rows.length+' rows, '+parsed.header.length+' columns');
  });
}

function setimptransform() {
  var p = setimpprofile();
  if(!setimp.csv) { setimpstatus('setimp-setupstatus', 'Choose the CSV first.', 'error'); return; }
  var params = {};
  Object.keys(setimp.params).forEach(function(k) {
    var d = (p.profile.params || []).find(x => x.name == k) || {name: k};
    params[k] = setimportetl.cleanparam(String(setimp.params[k]).trim(), setimportetl.cleankind(d));
    $('#setimp-p-'+k).val(params[k]);
    setimp.params[k] = params[k];
  });
  var missing = (p.profile.params || []).filter(d => d.required && !params[d.name]).map(d => d.label || d.name);
  var badpat = (p.profile.params || []).filter(d => d.pattern && params[d.name] && !new RegExp(d.pattern).test(params[d.name])).map(d => d.label || d.name);
  if(missing.length || badpat.length) {
    setimpstatus('setimp-setupstatus', (missing.length ? 'Needed: '+setimpesc(missing.join(', '))+'. ' : '')+
                 (badpat.length ? 'Not valid: '+setimpesc(badpat.join(', '))+'.' : ''), 'error');
    return;
  }
  try {
    setimp.result = setimportetl.transform(p.profile, setimp.csv.rows, params, setimp.csv.header);
  } catch(e) {
    setimpstatus('setimp-setupstatus', 'The profile failed: '+setimpesc(e.message), 'error');
    return;
  }
  setimp.result.profile = {name: p.name, version: p.version};
  setimp.check = null;
  setimp.plan = null;
  setimp.job = null;
  setimp.meta = null;
  setimp.overrides = {};
  setimp.match = null;
  setimpstatus('setimp-setupstatus', '');
  setimprenderpreview();
  setimpmatch();
  setimprenderregister();
  setimprenderimages();
  $('#setimp-plan').html('<h4>5. Plan</h4><p>Checks everything against the live cards (read-only): cardids, reprint matches, '+
                         'set registration, images, values the site hasn\'t seen. Plan again after any change.</p>'+
                         '<input type="button" value="Plan" onclick="setimpdoplan()" /> <span id="setimp-planstatus"></span>');
  $('#setimp-live').empty();
}

// ---------------------------------------------------------------- 2. preview

// each row checked against the live cards (the server's classify, as Plan uses it): new, reprint,
// duplicate (its card already has this set), unmatched or ambiguous
function setimpmatch() {
  var r = setimp.result;
  setimpapi('match', {"params": r.params, "overrides": setimp.overrides,
                      "cards": r.cards.filter(c => c.card).map(c => ({"file": c.file, "reprint": c.reprint, "card": c.card}))})
    .then(function(m) {
      if(setimp.result !== r) { return; }
      setimp.match = m;
      setimprenderpreview();
    }).catch(e => setimproots().forEach($root => $root.find('.setimp-matchstatus').html('<span class="error">Couldn\'t check against the live cards: '+setimpesc(setimperr(e))+'</span>')));
}

// after a Plan, the preview follows it: each row's status, the cardid a new card gets and the
// printing a reprint becomes, with the reprint list's changes. Rows Plan couldn't place keep the
// preview check's status (no match, several).
function setimpmatchfromplan(p) {
  if(!setimp.match || p.fromjob || !p.reprints) { return; }
  var rows = {};
  Object.keys(setimp.match.rows).forEach(f => {
    var o = setimp.match.rows[f];
    if(SETIMP_PROBLEM[o.status]) { rows[f] = o; }
  });
  p.new.forEach(n => { rows[n.file] = {"status": "new", "cardid": n.cardid, "planned": true}; });
  p.reprints.forEach(r => { rows[r.file] = {"status": "reprint", "cardid": r.cardid, "title": r.title, "how": r.how,
                                            "printingid": r.printingid, "primary": r.primary, "planned": true}; });
  (p.duplicates || []).forEach(d => { rows[d.file] = {"status": "duplicate", "cardid": d.cardid, "title": d.title, "planned": true}; });
  var counts = {};
  Object.values(rows).forEach(o => {
    counts[o.status] = (counts[o.status] || 0)+1;
    if(o.status == 'reprint' && o.how == 'found') { counts.found = (counts.found || 0)+1; }
  });
  setimp.match = Object.assign({}, setimp.match, {"rows": rows, "counts": counts, "planned": true});
  setimprenderpreview();
}

var SETIMP_PROBLEM = {"unmatched": 1, "ambiguous": 1, "missing": 1};

function setimpsummary() {
  var r = setimp.result, m = setimp.match;
  var errs = r.cards.filter(c => c.errors.length).length, marked = r.cards.filter(c => c.reprint).length;
  var html = '<b>'+r.cards.length+' cards</b> from '+setimp.csv.rows.length+' rows'+
             (errs ? ', <span class="error">'+errs+' with errors</span>' : '');
  if(!m) {
    return html+'; '+marked+' marked Reprint. <span class="setimp-matchstatus">Checking them against the live cards...</span>';
  }
  var n = m.counts, parts = [];
  parts.push((n.new || 0)+' new');
  parts.push((n.reprint || 0)+' reprints'+(n.found ? ' ('+n.found+' found by title, not marked Reprint)' : ''));
  if(n.duplicate) { parts.push('<b>'+n.duplicate+' already on the site</b> (duplicates, skipped)'); }
  var probs = (n.unmatched || 0)+(n.ambiguous || 0)+(n.missing || 0);
  if(probs) { parts.push('<span class="error">'+probs+' to resolve</span> (no match or several)'); }
  return html+'. '+(m.planned ? 'As of the last Plan' : 'Against the '+m.live+' live cards')+': '+parts.join(', ')+'.';
}

// The preview is drawn in the page and, once opened, in a window of its own (setimppopupopen) to
// keep beside Plan; each copy ("root") has its own filter, search and open cards, and both redraw
// whenever the preview changes. Handlers are bound here, not inline: the window's own globals
// don't have these functions.
function setimproots() {
  var roots = [$('#setimp-preview')];
  if(setimp.popup && !setimp.popup.closed) { roots.push($(setimp.popup.document).find('#setimp-preview')); }
  return roots.filter($r => $r.length);
}

function setimprenderpreview() {
  if(!setimp.result) { return; }
  setimproots().forEach(setimprenderroot);
}

function setimprenderroot($root) {
  var r = setimp.result, m = setimp.match, popup = $root[0].ownerDocument !== document;
  var html = '<h4>2. Cards</h4><p>'+setimpsummary()+'</p>';
  r.errors.forEach(e => { html += '<p class="setimp-warn">'+setimpesc(e.message)+'</p>'; });
  var f = $root.find('.setimp-filter').val() || '', q = $root.find('.setimp-search').val() || '';
  var opts = [['', 'all'], ['errors', 'with errors'], ['new', 'new cards'], ['reprint', 'reprints']];
  if(m) { opts.push(['found', 'reprints not marked'], ['duplicate', 'duplicates'], ['problem', 'no match / several']); }
  html += '<p><input type="button" class="setimp-expand" value="Expand all" /> <input type="button" class="setimp-collapse" value="Collapse all" /> '+
          'Show <select class="setimp-filter">'+
          opts.map(o => '<option value="'+o[0]+'"'+(o[0] == f ? ' selected' : '')+'>'+o[1]+'</option>').join('')+'</select> '+
          '<input type="search" class="setimp-search" placeholder="title" size="16" value="'+setimpesc(q)+'" /> '+
          'View <select class="setimp-viewsel">'+
          [['json', 'JSON'], ['card', 'Card details']].map(o => '<option value="'+o[0]+'"'+(o[0] == setimpview() ? ' selected' : '')+'>'+o[1]+'</option>').join('')+'</select> '+
          (popup ? '<small>(this window follows the import page)</small>' :
                   '<input type="button" class="setimp-popupbtn" value="Open in another window" title="To keep the cards beside Plan" /> '+
                   '<input type="button" class="setimp-download" value="Download out/ (zip)" title="The cards as set-import.py reads them" />')+'</p>'+
          '<div class="setimp-cards"></div>';
  // keep which cards were open across a redraw
  var open = $root.find('.setimp-cards > details[open]').map((i, d) => d.dataset.i).get();
  $root.html(html);
  $root.find('.setimp-expand').on('click', () => setimpexpand($root, true));
  $root.find('.setimp-collapse').on('click', () => setimpexpand($root, false));
  $root.find('.setimp-filter').on('change', () => setimprendercards($root));
  $root.find('.setimp-search').on('input', () => setimprendercards($root));
  $root.find('.setimp-viewsel').on('change', function() { setimpsetview(this.value); });
  $root.find('.setimp-popupbtn').on('click', setimppopupopen);
  $root.find('.setimp-download').on('click', setimpdownload);
  // <details> toggle doesn't bubble: listen in the capture phase, and draw a card when it's first opened
  $root.find('.setimp-cards')[0].addEventListener('toggle', function(ev) {
    var d = ev.target;
    if(d.open && d.dataset && d.dataset.i !== undefined && !d.dataset.drawn) { setimpdrawcard(d); }
  }, true);
  setimprendercards($root);
  open.forEach(i => { var d = $root.find('.setimp-cards > details[data-i="'+i+'"]')[0]; if(d) { d.open = true; } });
}

function setimpcardlink(cardid, title) {
  return '<a href="#game='+setimp.db+',#cardid='+cardid+'" target="_blank" onclick="event.stopPropagation()">'+cardid+(title ? ' '+title : '')+'</a>';
}

// the row's badge: what it is against the live cards (or, after a Plan, in the plan), or (before
// that check) whether it's marked Reprint
function setimpbadge(c) {
  var m = setimp.match && setimp.match.rows[c.file];
  if(!m) { return c.reprint ? ' <span class="setimp-badge">marked reprint</span>' : ''; }
  switch(m.status) {
    case 'new': return ' <span class="setimp-badge setimp-badgenew">new'+(m.cardid ? ' '+m.cardid : '')+'</span>';
    case 'reprint': return ' <span class="setimp-badge'+(m.how == 'found' ? ' setimp-badgewarn' : '')+'">'+
                           (m.how == 'found' ? 'reprint, not marked' : m.how == 'picked' ? 'reprint (picked)' : 'reprint')+'</span> of '+
                           setimpcardlink(m.cardid, m.title)+(m.printingid ? ' as #'+m.printingid+(m.primary ? ' (primary)' : '') : '');
    case 'duplicate': return ' <span class="setimp-badge setimp-badgedup">duplicate</span> already on '+setimpcardlink(m.cardid, m.title);
    case 'ambiguous': return ' <span class="setimp-badge setimp-badgeerr">several matches</span> '+m.cands.map(x => setimpcardlink(x.cardid, x.title)).join(', ');
    case 'unmatched': return ' <span class="setimp-badge setimp-badgeerr">marked reprint, no match</span>'+
                             (m.near && m.near.length ? ' close: '+m.near.map(x => setimpcardlink(x.cardid, x.title)).join(', ') : '');
    default: return ' <span class="setimp-badge setimp-badgeerr">'+setimpesc(m.status)+'</span>';
  }
}

function setimpshown(c, f) {
  var m = setimp.match && setimp.match.rows[c.file];
  var st = m ? m.status : (c.reprint ? 'reprint' : 'new');
  switch(f) {
    case 'errors': return c.errors.length > 0;
    case 'new': return st == 'new';
    case 'reprint': return st == 'reprint';
    case 'found': return st == 'reprint' && m.how == 'found';
    case 'duplicate': return st == 'duplicate';
    case 'problem': return !!SETIMP_PROBLEM[st];
  }
  return true;
}

function setimprendercards($root) {
  var r = setimp.result, f = $root.find('.setimp-filter').val(), q = ($root.find('.setimp-search').val() || '').toLowerCase();
  var html = '';
  r.cards.forEach(function(c, i) {
    if(!setimpshown(c, f)) { return; }
    var card = c.card || {};
    var title = (card.title || [''])[0];
    if(q && String(title).toLowerCase().indexOf(q) < 0) { return; }
    var p = (card.printing || [{}])[0];
    html += '<details class="setimp-card'+(c.errors.length ? ' setimp-haserr' : '')+'" data-i="'+i+'"><summary>'+
            '<span class="setimp-file">'+setimpesc(c.file.replace(/\.json$/,''))+'</span> <b>'+title+'</b>'+
            ' <span class="setimp-meta">'+setimpesc([(card.type || []).join(', '), (card.clan || []).join(', '), (p.rarity || []).join(', ')].filter(x => x).join(' · '))+'</span>'+
            setimpbadge(c)+
            (c.errors.length ? ' <span class="setimp-badge setimp-badgeerr">'+c.errors.length+' error'+(c.errors.length == 1 ? '' : 's')+'</span>' : '')+
            '</summary><div class="setimp-cardbody"></div></details>';
  });
  $root.find('.setimp-cards').html(html || '<p>No cards match.</p>');
}

// the preview shows each card as JSON or as the Card Details page would (remembered per browser)
function setimpview() {
  if(!setimp.view) {
    try { setimp.view = localStorage.getItem('setimpview') || 'json'; } catch(e) { setimp.view = 'json'; }
  }
  return setimp.view;
}

function setimpsetview(v) {
  setimp.view = v;
  try { localStorage.setItem('setimpview', v); } catch(e) {}
  setimproots().forEach(function($root) {
    $root.find('.setimp-viewsel').val(v);
    $root.find('.setimp-cards > details').each(function() {
      delete this.dataset.drawn;
      if(this.open) { setimpdrawcard(this); }
    });
  });
}

function setimpdrawcard(d) {
  var c = setimp.result.cards[parseInt(d.dataset.i, 10)];
  var html = c.errors.map(e => '<div class="error">'+setimpesc(e)+'</div>').join('');
  if(setimpview() == 'card' && c.card) {
    html += '<div class="setimp-cardview">Drawing the card...</div>';
  } else {
    html += '<pre class="setimp-json">'+setimportetl.jsonhtml(c.card || null)+'</pre>';
  }
  html += '<details class="setimp-raw"><summary>CSV row '+c.row+'</summary><pre class="setimp-json">'+setimportetl.jsonhtml(setimp.csv.rows[c.row-1])+'</pre></details>';
  $(d).children('.setimp-cardbody').html(html);
  d.dataset.drawn = 1;
  if(setimpview() == 'card' && c.card) { setimpcardview(c, $(d).find('.setimp-cardview')[0]); }
}

// the row drawn with the Card Details template: a new card on its own; a reprint as the live card
// with this printing added (the card's own fields stay as they are); a duplicate as the live card.
// It's drawn in a hidden spot in this page first (the game's updates() works on this document),
// then moved into el, which may be in the preview window.
function setimpcardview(c, el) {
  var m = setimp.match && setimp.match.rows[c.file];
  var newp = JSON.parse(JSON.stringify(c.card.printing[0]));
  var draw = function(card, pid, note) {
    try {
      delete card.updatelog;
      card = imagehashtourl(card);
      var out = cardhtml(card, pid, null);
      var $stage = $('#setimp-stage');
      if(!$stage.length) { $stage = $('<div id="setimp-stage" style="display: none"></div>').appendTo('body'); }
      $stage.html('<p class="setimp-cardnote">'+note+'</p><div class="setimp-cardviewbody">'+out.html+'</div>');
      // the template's ids belong to the real Card Details view
      $stage.find('[id]').removeAttr('id');
      updates[database]('#setimp-stage');
      $stage.find('.printing').not('[data-printingid="'+pid+'"]').hide();
      $stage.find('.listimage img').on('error', function() {
        $(this).replaceWith('<div class="setimp-noimage">'+setimpesc(this.src.split('/').slice(-2).join('/'))+'<br>isn\'t uploaded yet</div>');
      });
      $(el).empty().append($stage.children());
    } catch(e) {
      $(el).html('<div class="error">Couldn\'t draw the card: '+setimpesc(e.message)+'</div>');
    }
  };
  if(m && m.cardid && (m.status == 'reprint' || m.status == 'duplicate')) {
    var go = function() {
      var live = cache_card_fetch(m.cardid);
      if(!live.cardid) { $(el).html('<div class="error">Card '+m.cardid+' couldn\'t be fetched.</div>'); return; }
      var link = setimpcardlink(m.cardid, m.title);
      if(m.status == 'duplicate') {
        var set = (newp.set || [''])[0];
        var dup = live.printing.find(p => (p.set || [''])[0] == set) || live.printing[0];
        draw(live, dup.printingid, 'Already on the site: '+link+' as it is now, at its '+setimpesc(set)+' printing.');
        return;
      }
      var max = live.printing.reduce((a, p) => Math.max(a, parseInt(p.printingid, 10) || 0), 0);
      newp.printingid = m.printingid || String(max+1);
      live.printing.push(newp);
      if(m.primary) { live.printingprimary = newp.printingid; }
      draw(live, newp.printingid, 'A reprint: '+link+' with this printing added (#'+newp.printingid+(m.primary ? ', primary' : '')+
                                  '); the card\'s own text isn\'t changed.');
    };
    if(cache_card_is(m.cardid)) { go(); } else { listprefetch([m.cardid], [go]); }
    return;
  }
  var card = JSON.parse(JSON.stringify(c.card));
  card.cardid = (m && m.cardid) || card.cardid || 0;
  card.printing[0].printingid = card.printing[0].printingid || '1';
  card.printingprimary = card.printingprimary || card.printing[0].printingid;
  draw(card, card.printing[0].printingid, (m && m.cardid ? 'A new card, cardid '+m.cardid+' in the last Plan.' :
                                           'A new card'+(m ? '' : ' (not checked against the live cards yet)')+'; its cardid is given at Plan.'));
}

function setimpexpand($root, open) {
  $root.find('.setimp-cards > details').each(function() { this.open = open; });
}

// the preview in a window of its own (setimport-preview.html: the site's stylesheets and an empty
// #setimp-preview); when it has loaded (or is reloaded) it calls setimppopupready, which draws in it
function setimppopupopen() {
  var w = setimp.popup;
  if(w && !w.closed) { w.focus(); return; }
  w = window.open('setimport-preview.html?v='+ootvversion, 'setimppreview', 'width=1000,height=900');
  if(!w) { alert('The browser blocked the new window: allow pop-ups for this site and try again.'); return; }
  setimp.popup = w;
  if(!setimp.popupunload) {
    setimp.popupunload = true;
    // the window only works while this page is open
    window.addEventListener('beforeunload', function() { if(setimp.popup && !setimp.popup.closed) { setimp.popup.close(); } });
  }
}

function setimppopupready(w) {
  setimp.popup = w;
  w.document.title = 'Set import cards: '+((setimp.result && setimp.result.params) || {}).set;
  setimprenderpreview();
}

function setimpdownload() {
  var go = function() {
    var zip = new JSZip();
    setimp.result.cards.filter(c => c.card).forEach(c => zip.file('out/'+c.file, JSON.stringify(setimportetl.outfile(c))+'\n'));
    zip.generateAsync({type: 'blob'}).then(function(blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = setimp.result.params.imagehash+'-out.zip';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    });
  };
  if(window.JSZip) { go(); return; }
  $.ajax({url: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', dataType: 'script', cache: true}).done(go)
    .fail(() => alert('Could not load JSZip'));
}

// ---------------------------------------------------------------- 3. the set: registration

function setimprenderregister() {
  var pr = setimp.result.params;
  var html = '<h4>3. The set</h4><p>"'+setimpesc(pr.set)+'": is it on the site already, where it sorts, its arc, '+
             (pr.snm !== undefined ? 'its Sun and Moon code, ' : '')+'and the image directory.</p>'+
             '<input type="button" value="Check the set" onclick="setimpcheck()" /> <span id="setimp-checkstatus"></span><div id="setimp-checkbody"></div>';
  $('#setimp-register').html(html);
}

function setimpcheck() {
  var pr = setimp.result.params;
  setimpstatus('setimp-checkstatus', 'Checking...');
  setimpapi('check', {"set": pr.set, "imagehash": pr.imagehash, "snm": pr.snm}).then(function(c) {
    setimp.check = c;
    setimpstatus('setimp-checkstatus', '');
    setimprendercheck();
  }).catch(e => setimpstatus('setimp-checkstatus', setimpesc(setimperr(e)), 'error'));
}

function setimprendercheck() {
  var c = setimp.check, pr = setimp.result.params, st = c.setup;
  var li = (ok, text) => '<li class="'+(ok ? 'setimp-ok' : 'setimp-warn')+'">'+text+'</li>';
  var html = '<ul>';
  html += li(!c.livecards, c.livecards ? c.livecards+' live cards already have a "'+setimpesc(c.set)+'" printing (e.g. '+c.livesample.join(', ')+')' :
                                         'No live card has the set yet.');
  html += li(true, c.images ? c.images+' files in the image directory '+setimpesc(setimp.db+'/'+c.imagehash)+'/ already' :
                              'The image directory '+setimpesc(setimp.db+'/'+c.imagehash)+'/ is empty.');
  html += li(c.sortat >= 0, c.sortat >= 0 ? 'Sorts at #'+c.sortat+' (pattern <code>'+setimpesc(c.sortpattern)+'</code>)' : 'Not in the set order yet.');
  html += li(c.arcs.length > 0, c.arcs.length ? 'Arc: '+setimpesc(c.arcs.join(', ')) : 'In no arc yet.');
  if(st.snm) {
    html += li(c.snmcode == pr.snm || (!pr.snm && c.snmcode), c.snmcode ? 'Sun and Moon code: '+setimpesc(c.snmcode) : 'No Sun and Moon code yet.');
    if(c.snmused && c.snmused.length) { html += li(false, 'The code '+setimpesc(pr.snm)+' is already used by '+setimpesc(c.snmused.join(', '))); }
  } else if(pr.snm !== undefined) {
    html += li(false, 'The Sun and Moon map isn\'t in the structure table yet (docs/snm/snm-push.py), so the code can\'t be registered here.');
  }
  html += '</ul>';
  // registration form
  var esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var pos = c.sortat >= 0 ? c.sortat : st.sortregex.length;
  html += '<details'+(c.sortat < 0 || !c.arcs.length || (st.snm && c.snmcode != pr.snm) ? ' open' : '')+'><summary>Register</summary><table class="setimp-params">';
  html += '<tr><td>Sort position</td><td><select id="setimp-r-pos"><option value="">leave as is</option>'+
          st.sortregex.map((rx, i) => '<option value="'+i+'"'+(c.sortat < 0 && i == st.sortregex.length - 1 ? ' selected' : '')+'>before #'+i+' '+setimpesc(rx)+'</option>').join('')+
          '<option value="'+st.sortregex.length+'"'+(c.sortat < 0 ? '' : '')+'>at the end</option></select>'+
          (c.sortat >= 0 ? ' <small>it matches #'+c.sortat+' now; a new pattern must come at or before it</small>' : '')+'</td></tr>';
  html += '<tr><td>Pattern</td><td><input type="text" id="setimp-r-pattern" size="40" value="'+setimpesc('^'+esc(pr.set)+'$')+'" /></td></tr>';
  html += '<tr><td>Arc</td><td><select id="setimp-r-arc" onchange="$(\'#setimp-r-newarc\').toggle(this.value == \'+\')"><option value="">leave as is</option>'+
          st.arcs.map(g => '<option'+(c.arcs.length == 0 && g.name == (st.arcs[st.arcs.length - 2] || {}).name ? ' selected' : '')+'>'+setimpesc(g.name)+'</option>').join('')+
          '<option value="+">a new arc...</option></select> <span id="setimp-r-newarc" style="display: none">name <input type="text" id="setimp-r-newarcname" size="24" /></span></td></tr>';
  if(st.snm) {
    html += '<tr><td>Sun and Moon code</td><td><input type="text" id="setimp-r-snm" size="12" value="'+setimpesc(pr.snm || '')+'" '+
            'oninput="this.value = setimportetl.cleanparam(this.value, \'id\')" /> <small>letters, digits, _ and - only</small></td></tr>';
  }
  html += '</table><input type="button" value="Register" onclick="setimpregister()" /> <span id="setimp-regstatus"></span></details>';
  $('#setimp-checkbody').html(html);
}

function setimpregister() {
  var pr = setimp.result.params;
  var arc = $('#setimp-r-arc').val();
  var data = {"set": pr.set};
  if($('#setimp-r-pos').val() !== '') {
    data.position = parseInt($('#setimp-r-pos').val(), 10);
    data.pattern = $('#setimp-r-pattern').val().trim();
  }
  if(arc == '+') { data.newarc = {"name": $('#setimp-r-newarcname').val().trim()}; }
  else if(arc) { data.arc = arc; }
  if($('#setimp-r-snm').length && $('#setimp-r-snm').val().trim()) { data.snm = $('#setimp-r-snm').val().trim(); }
  setimpstatus('setimp-regstatus', 'Registering...');
  setimpapi('register', data).then(function(r) {
    setimp.registration = r.changes;
    setimpstatus('setimp-regstatus', r.changes.length ? 'Done: '+setimpesc(r.changes.join('; '))+
                 (r.coldstart.length ? ' (the search Lambdas restart within a minute)' : '') : 'Nothing to change.');
    setTimeout(setimpcheck, 1500);
  }).catch(e => setimpstatus('setimp-regstatus', setimpesc(setimperr(e)), 'error'));
}

// ---------------------------------------------------------------- 4. images

function setimpimagenames() {
  var names = new Set();
  setimp.result.cards.forEach(c => ((c.card || {}).printing || []).forEach(p => (p.image || []).forEach(im => {
    ['master', 'details', 'select'].forEach(s => { if(im[s]) { names.add(im[s]); } });
  })));
  return Array.from(names).sort();
}

function setimprenderimages() {
  var pr = setimp.result.params;
  $('#setimp-images').html('<h4>4. Images</h4><p>The cards name '+setimpimagenames().length+' image files in '+
    setimpesc(dbinfo[setimp.db].imageuri+pr.imagehash)+'/. Upload them with the mass image upload (it makes _details and _select from each _master), '+
    'then come back here with Set import.</p><input type="button" value="Check the images" onclick="setimpimagecheck()" /> '+
    '<input type="button" value="Open the mass image upload" onclick="setimpimageupload()" /> <span id="setimp-imagestatus"></span>');
}

function setimpimagecheck() {
  var pr = setimp.result.params, names = setimpimagenames();
  setimpstatus('setimp-imagestatus', 'Checking...');
  checkimages(setimp.db, pr.imagehash, names).then(function(exists) {
    var have = new Set(exists.map(e => e.name));
    var miss = names.filter(n => !have.has(n));
    setimpstatus('setimp-imagestatus', miss.length ? miss.length+' of '+names.length+' missing, e.g. '+setimpesc(miss.slice(0, 6).join(', ')) :
                 'All '+names.length+' images are there.', miss.length ? 'error' : 'setimp-ok');
  }).catch(e => setimpstatus('setimp-imagestatus', setimpesc(setimperr(e)), 'error'));
}

function setimpimageupload() {
  loadmassimage();
  $('#massimagestub').val(setimp.result.params.imagehash);
  $('html, body').animate({scrollTop: $('#massimage').offset().top - 60}, 200);
}

// ---------------------------------------------------------------- 5. plan

function setimpdoplan() {
  var r = setimp.result;
  setimpstatus('setimp-planstatus', 'Planning (reads every live card; about 10 seconds)...');
  $('#setimp-live').empty();
  setimpapi('plan', {"params": r.params, "profile": r.profile, "overrides": setimp.overrides,
                     "description": $('#setimp-desc').length ? $('#setimp-desc').val() : '',
                     "registration": setimp.registration || null,
                     "csv": setimp.csv ? {"name": setimp.csv.name, "text": setimp.csv.text} : null,
                     "cards": r.cards.filter(c => c.card).map(c => ({"file": c.file, "reprint": c.reprint, "card": c.card}))})
    .then(function(p) {
      setimp.plan = p;
      setimp.job = p.job;
      setimp.meta = null;
      setimprenderplan();
      setimpmatchfromplan(p);
      setimprenderlive();
      setimploadjobs();
    }).catch(e => setimpstatus('setimp-planstatus', setimpesc(setimperr(e)), 'error'));
}

function setimplist(kind, items, cls, openmax) {
  if(!items || !items.length) { return ''; }
  return '<details class="'+cls+'"'+(items.length <= openmax ? ' open' : '')+'><summary>'+items.length+' '+kind+'</summary><ul>'+
         items.map(x => '<li>'+setimpesc(x)+'</li>').join('')+'</ul></details>';
}

function setimprenderplan() {
  var p = setimp.plan;
  var html = '<h4>5. Plan</h4>';
  if(!p.fromjob) {
    html += '<p>Checks everything against the live cards (read-only). Plan again after any change.</p>'+
            '<input type="button" value="Plan again" onclick="setimpdoplan()" /> <span id="setimp-planstatus"></span>';
  }
  html += '<p class="'+(p.ready ? 'setimp-ok' : 'error')+'"><b>'+(p.ready ? 'Ready to go live' : 'Not ready: '+p.problems.length+' problem'+(p.problems.length == 1 ? '' : 's'))+'</b>'+
          ' &middot; '+p.counts.new+' new cards'+(p.cardids ? ' (cardids '+p.cardids[0]+'-'+p.cardids[1]+')' : '')+', '+
          p.counts.printings+' reprint printings on '+p.counts.reprinted+' cards, '+
          (p.counts.duplicates ? p.counts.duplicates+' duplicates skipped, ' : '')+p.counts.images+' images</p>';
  html += setimplist('problems', p.problems, 'setimp-problems', 50)+setimplist('warnings', p.warnings, 'setimp-warnings', 10)+
          setimplist('notes', p.infos, 'setimp-infos', 0);
  if(!p.fromjob) {
    html += '<p>Update log description <input type="text" id="setimp-desc" size="60" value="'+setimpesc(p.description)+'" /></p>';
    // the reprint matches, and a way to change any card's (the old reprint-map.tsv)
    html += '<details'+((p.reprints.length || p.problems.some(x => /reprint/.test(x))) ? ' open' : '')+'><summary>Reprints ('+p.reprints.length+' matched)</summary>'+
            '<p><small>A reprint adds a printing to the card; its own text isn\'t changed. Set a cardid to change the match, '+
            '"new" to make it a new card, and tick primary to show the new printing by default. Then plan again.</small></p>'+
            '<table class="setimp-table"><tr><th>File</th><th>Card</th><th>Matched by</th><th>New printing</th><th>Change</th></tr>';
    p.reprints.forEach(function(r) {
      html += '<tr><td>'+setimpesc(r.file)+'</td><td>'+r.cardid+' <a href="#game='+setimp.db+',#cardid='+r.cardid+'" target="_blank">'+r.title+'</a></td><td>'+
              setimpesc(r.how)+'</td><td>#'+r.printingid+(r.primary ? ' (primary)' : '')+'</td><td>'+setimpoverride(r.file)+'</td></tr>';
    });
    html += '</table>';
    var unmatched = setimp.result.cards.filter(c => c.card && !p.reprints.some(r => r.file == c.file) && !p.new.some(n => n.file == c.file) &&
                                                 !(p.duplicates || []).some(d => d.file == c.file));
    if(unmatched.length) {
      html += '<p><b>To resolve (no match, or several)</b></p><table class="setimp-table"><tr><th>File</th><th>Title</th><th>Change</th></tr>';
      unmatched.forEach(c => { html += '<tr><td>'+setimpesc(c.file)+'</td><td>'+(c.card.title || [''])[0]+'</td><td>'+setimpoverride(c.file)+'</td></tr>'; });
      html += '</table>';
    }
    html += '</details>';
    if(p.duplicates && p.duplicates.length) {
      html += '<details><summary>Duplicates ('+p.duplicates.length+', already on the site: skipped)</summary>'+
              '<p><small>The card already has a printing in this set, so nothing is written for these rows. '+
              'To add another printing anyway, type the cardid.</small></p>'+
              '<table class="setimp-table"><tr><th>File</th><th>Already on</th><th>Change</th></tr>';
      p.duplicates.forEach(function(d) {
        html += '<tr><td>'+setimpesc(d.file)+'</td><td>'+setimpcardlink(d.cardid, d.title)+'</td><td>'+setimpoverride(d.file)+'</td></tr>';
      });
      html += '</table></details>';
    }
    html += '<details><summary>New cards ('+p.new.length+')</summary><table class="setimp-table"><tr><th>Cardid</th><th>File</th><th>Title</th><th>Type</th><th>Clan</th><th>Rarity</th><th>Make it a reprint of</th></tr>';
    p.new.forEach(function(n) {
      html += '<tr><td>'+n.cardid+'</td><td>'+setimpesc(n.file)+'</td><td>'+n.title+'</td><td>'+setimpesc(n.type)+'</td><td>'+setimpesc(n.clan)+
              '</td><td>'+setimpesc(n.rarity)+'</td><td>'+setimpoverride(n.file)+'</td></tr>';
    });
    html += '</table></details>';
  }
  $('#setimp-plan').html(html);
}

function setimpoverride(file) {
  var o = setimp.overrides[file] || {};
  return '<input type="text" size="7" placeholder="cardid/new" value="'+setimpesc(o.cardid || '')+'" '+
         'onchange="setimpsetoverride(\''+setimpesc(file)+'\', this.value, null)" /> '+
         '<label><input type="checkbox"'+(o.primary ? ' checked' : '')+' onchange="setimpsetoverride(\''+setimpesc(file)+'\', null, this.checked)" /> primary</label>';
}

function setimpsetoverride(file, cardid, primary) {
  var o = setimp.overrides[file] || {};
  if(cardid !== null) { o.cardid = cardid.trim(); }
  if(primary !== null) { o.primary = primary; }
  if(!o.cardid && !o.primary) { delete setimp.overrides[file]; } else { setimp.overrides[file] = o; }
}

// ---------------------------------------------------------------- 6. go live

function setimprenderlive() {
  var p = setimp.plan;
  if(!setimp.job) { $('#setimp-live').empty(); return; }
  var html = '<h4>6. Go live</h4><p>Export takes the backup every bulk write needs (5-10 minutes; start it ahead of time). '+
             'Apply pauses the search index stream, writes the cards, puts the stream back and then checks every card in search.</p>'+
             '<div id="setimp-export"></div><div id="setimp-apply"></div><div id="setimp-verify"></div>';
  $('#setimp-live').html(html);
  setimprefreshjob();
}

// the job's export/apply state from the server, and the buttons that fit it
function setimprefreshjob() {
  return setimpapi('job', {"job": setimp.job}).then(function(m) {
    setimp.meta = m;
    var ex = m.export, p = setimp.plan;
    var exhtml = '<p><b>Export</b>: ';
    if(!ex) { exhtml += 'not started. '; }
    else {
      exhtml += setimpesc(ex.status)+(ex.snapshot ? ', snapshot '+new Date(ex.snapshot).toLocaleString() : '')+
                (ex.items !== null ? ', '+ex.items+' items' : '')+(ex.failure ? ' <span class="error">'+setimpesc(ex.failure)+'</span>' : '')+'. ';
    }
    if(['planned', 'interrupted'].includes(m.status) && (!ex || ex.status != 'IN_PROGRESS')) {
      exhtml += '<input type="button" value="'+(ex ? 'Export again' : 'Start the export')+'" onclick="setimpexport('+(ex ? 'true' : 'false')+')" />';
    }
    $('#setimp-export').html(exhtml+'</p>');
    if(ex && ex.status == 'IN_PROGRESS' && !setimp.exportpoll) {
      setimp.exportpoll = setTimeout(function() { setimp.exportpoll = null; setimprefreshjob(); }, 15000);
    }
    var ah = '<p><b>Apply</b>: '+setimpesc(m.status)+(m.written ? ', '+m.written+' cards written' : '')+
             (m.conflicts && m.conflicts.length ? ', <span class="error">'+m.conflicts.length+' conflicts</span>' : '')+
             (m.note ? ' <small>('+setimpesc(m.note)+')</small>' : '')+'</p>';
    if(['planned', 'interrupted'].includes(m.status)) {
      var ok = p.ready && ex && ex.status == 'COMPLETED';
      ah += '<p><label><input type="checkbox" id="setimp-applyok"'+(ok ? '' : ' disabled')+' onchange="$(\'#setimp-applybtn\').prop(\'disabled\', !this.checked)" /> '+
            'Yes, write '+p.counts.new+' new cards and '+p.counts.printings+' reprint printings to the live '+setimpesc(dbinfo[setimp.db].name)+' cards</label> '+
            '<input type="button" id="setimp-applybtn" value="Apply" disabled onclick="setimpapply()" />'+
            (ok ? '' : ' <small>'+(!p.ready ? 'the plan has problems' : 'needs a completed export')+'</small>')+'</p>';
    } else if(['pausing', 'applying', 'resuming'].includes(m.status) && !setimp.run) {
      ah += '<p><input type="button" value="Continue" onclick="setimpapply()" /> <small>The stream stays paused until the import finishes; '+
            'if nothing happens for 10 minutes it is put back automatically and the import is marked interrupted.</small></p>';
    }
    ah += '<div id="setimp-applystatus"></div>';
    $('#setimp-apply').html(ah);
    if(['applied', 'done'].includes(m.status)) { setimprenderverify(); }
    return m;
  }).catch(e => $('#setimp-export').html('<span class="error">'+setimpesc(setimperr(e))+'</span>'));
}

function setimpexport(fresh) {
  setimpapi('export', {"job": setimp.job, "fresh": !!fresh}).then(() => setimprefreshjob())
    .catch(e => $('#setimp-export').append(' <span class="error">'+setimpesc(setimperr(e))+'</span>'));
}

// apply is a state machine on the server: call until it says applied
function setimpapply() {
  if(setimp.run) { return; }
  var run = setimp.run = {stop: false, start: Date.now()};
  $('#setimp-applybtn').prop('disabled', true);
  var status = (msg, cls) => setimpstatus('setimp-applystatus', msg, cls);
  var step = function() {
    setimpapi('apply', {"job": setimp.job}).then(function(r) {
      if(r.blocked) {
        status('Not applied:<ul>'+r.blocked.map(b => '<li>'+setimpesc(b)+'</li>').join('')+'</ul>', 'error');
        setimp.run = null;
        setimprefreshjob();
        return;
      }
      var label = {pausing: 'Pausing the search index stream...', applying: 'Writing cards: '+(r.written || 0)+' written'+(r.left ? ', '+r.left+' to go' : ''),
                   resuming: 'Putting the search index stream back...', interrupted: 'Interrupted: the stream was turned back on; Apply again to continue.',
                   applied: 'Written: '+r.written+' cards'+(r.conflicts && r.conflicts.length ? ', '+r.conflicts.length+' conflicts' : '')+'.'}[r.status] || r.status;
      status(label+' <small>('+Math.round((Date.now() - run.start)/1000)+' s)</small>', r.status == 'interrupted' ? 'error' : '');
      if(r.status == 'applied') {
        setimp.run = null;
        setimprefreshjob();
        return;
      }
      if(r.status == 'interrupted') { setimp.run = null; setimprefreshjob(); return; }
      setTimeout(step, (r.status == 'pausing' || r.status == 'resuming') ? 3000 : 100);
    }).catch(function(e) {
      if(e.status == 409) { setTimeout(step, 3000); return; }   // the previous call still holds the lock
      status('Error: '+setimpesc(setimperr(e))+'. Press Continue to retry; the stream is put back after 10 minutes without activity.', 'error');
      setimp.run = null;
      setimprefreshjob();
    });
  };
  status('Starting...');
  step();
}

// ---------------------------------------------------------------- verify

function setimprenderverify() {
  var m = setimp.meta;
  var html = '<p><b>Verify</b>: '+(m.status == 'done' ? 'done'+(m.verify ? ': '+m.verify.matched+' of '+m.verify.checked+' cards match in search' : '')+
             (m.eserrors ? ', <span class="error">'+m.eserrors+' ES errors in the stream since the apply</span>' : '') :
             'every written card is compared with its search copy (the stream takes a minute or two to catch up).')+'</p>';
  if(m.status == 'applied') { html += '<input type="button" value="Verify" onclick="setimpverify(0)" /> '; }
  html += '<span id="setimp-verifystatus"></span><div id="setimp-verifybody"></div>';
  $('#setimp-verify').html(html);
  // verify on its own once, right after the apply; after that it's the button
  if(m.status == 'applied' && !setimp.verifying && setimp.autoverified != setimp.job) {
    setimp.autoverified = setimp.job;
    setimpverify(0);
  }
}

function setimpverifycall() {
  return Promise.resolve($.ajax({type: 'POST', url: apiuri+"/setimportverify", contentType: 'application/json', dataType: 'json',
    data: JSON.stringify({"uid": getuid(), "database": setimp.db, "job": setimp.job}),
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());}}));
}

// poll until every card matches or 10 minutes pass; then offer to re-send the mismatched ones
function setimpverify(round) {
  setimp.verifying = true;
  var start = Date.now();
  var status = (msg, cls) => setimpstatus('setimp-verifystatus', msg, cls);
  var poll = function() {
    setimpverifycall().then(function(v) {
      status(v.matched+' of '+v.checked+' cards match in search'+(v.mismatched.length ? '; waiting for the stream...' : '.'));
      if(!v.mismatched.length) { setimp.verifying = false; setimpfinish(v); return; }
      if(Date.now() - start < (round ? 3 : 10)*60000) { setTimeout(poll, 20000); return; }
      setimp.verifying = false;
      status(v.mismatched.length+' cards still differ in search.', 'error');
      $('#setimp-verifybody').html('<ul>'+v.mismatched.slice(0, 50).map(x => '<li>'+x.cardid+': '+setimpesc(x.why)+'</li>').join('')+'</ul>'+
        (round < 2 ? '<input type="button" value="Re-send them to search" onclick="setimpreindex()" /> ' : '')+
        '<input type="button" value="Finish anyway" onclick="setimpfinish(setimp.lastverify)" />');
      setimp.lastverify = v;
      setimp.verifyround = round;
    }).catch(function(e) { setimp.verifying = false; status(setimpesc(setimperr(e)), 'error'); });
  };
  poll();
}

function setimpreindex() {
  var ids = setimp.lastverify.mismatched.map(x => x.cardid);
  setimpstatus('setimp-verifystatus', 'Re-sending '+ids.length+' cards...');
  $('#setimp-verifybody').empty();
  setimpapi('reindex', {"job": setimp.job, "cardids": ids}).then(function() {
    setTimeout(() => setimpverify((setimp.verifyround || 0) + 1), 15000);
  }).catch(e => setimpstatus('setimp-verifystatus', setimpesc(setimperr(e)), 'error'));
}

function setimpfinish(v) {
  setimpapi('finish', {"job": setimp.job, "verify": v ? {"checked": v.checked, "matched": v.matched,
                                                         "mismatched": v.mismatched.slice(0, 100)} : null}).then(function(r) {
    setimprefreshjob();
    setimploadjobs();
    setimpstatus('setimp-verifystatus', 'Done.'+(r.eserrors ? ' '+r.eserrors+' ES errors were logged by the stream since the apply.' : '')+
                 ' The search Lambdas restart so the set shows in the pulldowns; refresh the page after a minute.', 'setimp-ok');
  }).catch(e => setimpstatus('setimp-verifystatus', setimpesc(setimperr(e)), 'error'));
}

// ================================================================ Import profiles

var impprof = {db: null, list: null, editing: null};

function importprofilesopen() {
  $('#loginlog').empty();
  $('#discordadmin').empty();
  $('#admindoc').empty();
  $('#massimage, #setimport').hide();
  $('#importprofiles').show();
  if(!gamepermission('setimport')) {
    $('#importprofiles').text('Import profiles need the setimport (or full) permission on '+dbinfo[database].name+'.');
    return;
  }
  impprof.db = database;
  $('#importprofiles').html('<h3>Import profiles: '+setimpesc(dbinfo[database].name)+'</h3>Loading...');
  setimpapi('profiles', {}, impprof.db).then(function(r) {
    impprof.list = r.profiles;
    importprofilesrender();
  }).catch(e => $('#importprofiles').html('<span class="error">'+setimpesc(setimperr(e))+'</span>'));
}

function importprofilesrender() {
  var html = '<h3>Import profiles: '+setimpesc(dbinfo[impprof.db].name)+'</h3>'+
             '<p>A profile says how a spreadsheet\'s columns become card fields: the questions asked at the start, column aliases, '+
             'lookup tables and the transform list for each field. <a href="" onclick="loadadmindoc(\'set-import\'); return false">Reference</a></p>';
  html += '<table class="setimp-table"><tr><th>Name</th><th>Description</th><th>Version</th><th>Saved</th><th></th></tr>';
  impprof.list.forEach(function(p, i) {
    html += '<tr><td>'+setimpesc(p.name)+'</td><td>'+setimpesc(p.description)+'</td><td>'+p.version+'</td><td>'+
            new Date(p.updated).toLocaleString()+' by '+setimpesc(p.uname)+'</td><td>'+
            '<a href="" onclick="importprofileedit('+i+'); return false">edit</a> &middot; '+
            '<a href="" onclick="importprofileclone('+i+'); return false">clone</a> &middot; '+
            '<a href="" onclick="importprofilehistory('+i+'); return false">history</a> &middot; '+
            '<a href="" onclick="importprofiledelete('+i+'); return false">delete</a></td></tr>';
  });
  html += '</table><p><input type="button" value="New profile" onclick="importprofilenew()" /></p><div id="impprof-editor"></div>';
  $('#importprofiles').html(html);
}

// the editor: name, the JSON, a test run against the CSV loaded in Set import, save
function importprofileeditor(name, version, profile, isnew) {
  impprof.editing = {name: name, version: version, isnew: isnew};
  var html = '<h4>'+(isnew ? 'New profile' : 'Edit '+setimpesc(name)+' (version '+version+')')+'</h4>'+
             (isnew ? '<p>Name <input type="text" id="impprof-name" size="30" value="'+setimpesc(name)+'" /></p>' : '')+
             '<p><small>Load a file: <input type="file" accept=".json,application/json" onchange="importprofileloadfile(this)" /> '+
             '(e.g. ootv-import/profiles/'+setimpesc(impprof.db)+'-onyx.json)</small></p>'+
             '<textarea id="impprof-json" class="setimp-editor" spellcheck="false">'+setimpesc(JSON.stringify(profile, null, 2))+'</textarea>'+
             '<p><input type="button" value="Test" onclick="importprofiletest()" title="Check the JSON and run it on the CSV loaded in Set import" /> '+
             '<input type="button" value="Save" onclick="importprofilesave()" /> <input type="button" value="Cancel" onclick="$(\'#impprof-editor\').empty()" /> '+
             '<span id="impprof-status"></span></p><div id="impprof-test"></div>';
  $('#impprof-editor').html(html);
  $('html, body').animate({scrollTop: $('#impprof-editor').offset().top - 60}, 200);
}

function importprofileedit(i) {
  var p = impprof.list[i];
  importprofileeditor(p.name, p.version, p.profile, false);
}

function importprofileclone(i) {
  var p = JSON.parse(JSON.stringify(impprof.list[i].profile));
  p.name = impprof.list[i].name+'-copy';
  importprofileeditor(p.name, 0, p, true);
}

function importprofilenew() {
  importprofileeditor('', 0, {"name": "", "description": "", "game": impprof.db,
    "params": [{"name": "set", "label": "Set name", "required": true},
               {"name": "imagehash", "label": "Image stub", "default": "{{set|initials}}", "required": true, "pattern": "^[A-Za-z0-9_-]+$"},
               {"name": "imagedigits", "label": "Digits in image numbers", "default": "3", "type": "int"}],
    "required": ["title", "type"], "tables": {}, "columns": [], "rowsteps": [],
    "fields": [{"to": "title", "from": "Title", "always": true, "do": ["trim"]},
               {"to": "type", "from": "Type", "do": ["trim"]},
               {"to": "printing.set", "value": "{{set}}"},
               {"to": "printing.number", "value": "{{row}}"},
               {"step": "images", "name": "{{imagehash}}_{{row|pad:imagedigits}}"}]}, true);
}

function importprofileloadfile(input) {
  var f = input.files[0];
  if(!f) { return; }
  f.text().then(function(text) {
    try {
      var p = JSON.parse(text);
      $('#impprof-json').val(JSON.stringify(p, null, 2));
      if(impprof.editing.isnew && !$('#impprof-name').val()) { $('#impprof-name').val(p.name || ''); }
      setimpstatus('impprof-status', 'Loaded '+setimpesc(f.name)+'; not saved yet.');
    } catch(e) {
      setimpstatus('impprof-status', setimpesc(f.name)+' isn\'t JSON: '+setimpesc(e.message), 'error');
    }
  });
}

function importprofileparse() {
  try {
    return JSON.parse($('#impprof-json').val());
  } catch(e) {
    setimpstatus('impprof-status', 'Not valid JSON: '+setimpesc(e.message), 'error');
    return null;
  }
}

function importprofiletest() {
  var p = importprofileparse();
  if(!p) { return; }
  if(!Array.isArray(p.fields)) { setimpstatus('impprof-status', 'A profile needs a fields list.', 'error'); return; }
  if(!setimp.csv || setimp.db != impprof.db) {
    setimpstatus('impprof-status', 'Valid JSON. Choose a CSV in Set import to test it on real rows.', 'setimp-ok');
    return;
  }
  var params = Object.assign({}, setimp.params);
  if(!params.set) { params.set = 'Test Set'; }
  try {
    var r = setimportetl.transform(p, setimp.csv.rows, params, setimp.csv.header);
    var errs = r.cards.filter(c => c.errors.length);
    setimpstatus('impprof-status', 'Ran on '+setimpesc(setimp.csv.name)+': '+r.cards.length+' cards, '+errs.length+' with errors.', errs.length ? 'error' : 'setimp-ok');
    var html = r.errors.map(e => '<p class="setimp-warn">'+setimpesc(e.message)+'</p>').join('');
    html += errs.slice(0, 20).map(c => '<div class="error">'+setimpesc(c.file)+': '+setimpesc(c.errors.join('; '))+'</div>').join('');
    var c0 = r.cards.find(c => c.card);
    if(c0) { html += '<details><summary>First card</summary><pre class="setimp-json">'+setimportetl.jsonhtml(c0.card)+'</pre></details>'; }
    $('#impprof-test').html(html);
  } catch(e) {
    setimpstatus('impprof-status', 'The profile failed: '+setimpesc(e.message), 'error');
  }
}

function importprofilesave() {
  var p = importprofileparse();
  if(!p) { return; }
  var ed = impprof.editing;
  var name = ed.isnew ? $('#impprof-name').val().trim() : ed.name;
  p.name = name;
  setimpstatus('impprof-status', 'Saving...');
  setimpapi('saveprofile', {"name": name, "version": ed.version, "profile": p}, impprof.db).then(function(r) {
    setimpstatus('impprof-status', 'Saved as version '+r.version+'.', 'setimp-ok');
    impprof.editing = {name: r.name, version: r.version, isnew: false};
    if(setimp.db == impprof.db) { setimp.profiles = null; }   // Set import reloads them next time
    return setimpapi('profiles', {}, impprof.db).then(function(l) {
      impprof.list = l.profiles;
      var keep = $('#impprof-editor').detach();
      importprofilesrender();
      $('#impprof-editor').replaceWith(keep);
      keep.find('h4').text('Edit '+r.name+' (version '+r.version+')');
      keep.find('#impprof-name').parent().remove();
    });
  }).catch(e => setimpstatus('impprof-status', setimpesc(setimperr(e)), 'error'));
}

function importprofiledelete(i) {
  var p = impprof.list[i];
  if(!confirm('Delete the import profile '+p.name+'? (Its history goes too.)')) { return; }
  setimpapi('deleteprofile', {"name": p.name, "version": p.version}, impprof.db).then(function() {
    if(setimp.db == impprof.db) { setimp.profiles = null; }
    importprofilesopen();
  }).catch(e => alert(setimperr(e)));
}

// earlier versions: view one, or load it into the editor to save it back as the newest
function importprofilehistory(i) {
  var p = impprof.list[i];
  $('#impprof-editor').html('Loading history...');
  setimpapi('profile', {"name": p.name}, impprof.db).then(function(full) {
    impprof.history = full;
    var html = '<h4>History of '+setimpesc(full.name)+'</h4><table class="setimp-table"><tr><th>Version</th><th>Saved</th><th></th></tr>'+
               '<tr><td>'+full.version+' (current)</td><td>'+new Date(full.updated).toLocaleString()+' by '+setimpesc(full.uname)+'</td><td></td></tr>';
    full.history.forEach(function(h, j) {
      html += '<tr><td>'+h.version+'</td><td>'+new Date(h.updated).toLocaleString()+' by '+setimpesc(h.uname)+'</td><td>'+
              '<a href="" onclick="importprofileview('+j+'); return false">view</a> &middot; '+
              '<a href="" onclick="importprofilerestore('+j+'); return false">restore into the editor</a></td></tr>';
    });
    $('#impprof-editor').html(html+'</table><div id="impprof-view"></div>');
  }).catch(e => $('#impprof-editor').html('<span class="error">'+setimpesc(setimperr(e))+'</span>'));
}

function importprofileview(j) {
  $('#impprof-view').html('<pre class="setimp-json">'+setimportetl.jsonhtml(impprof.history.history[j].profile)+'</pre>');
}

function importprofilerestore(j) {
  var full = impprof.history;
  importprofileeditor(full.name, full.version, full.history[j].profile, false);
  setimpstatus('impprof-status', 'Version '+full.history[j].version+' loaded; Save makes it version '+(full.version + 1)+'.');
}
