// Admin → Game config (this game's <game>/game item) and Admin → Templates (the master templates in
// all/templates, site admins only). The item is edited as JSON (the templates view by view, as html, and the
// shared pieces the views include, the partials, piece by piece: the select's "partial:<name>" entries),
// previewed on a card with the edit applied, and saved whole through POST /update, operations gameconfig
// and templates (ootv-search lib/gameconfigsave.js: version check, history with the earlier copies). A save
// that doesn't draw the preview card is refused here. Loaded on first use by loadgameconfigadmin() in
// oracle.js. Plan: ootv-claude GAME-TEMPLATES.md §2.6, §2.8 step 4; guide: docs/admin/game-config.md.
var gcadminloaded = true;
var gcadmin = {};   // {which: 'game'|'templates', db, item (as loaded), draft (the edited body), view, cardid}
// the view select's key for a partial is "partial:<name>": its name, or null for a view
function gcadminpart(key) {
  var m = /^partial:(.+)$/.exec(key || '');
  return m ? m[1] : null;
}
// what the editor shows for a key: the view, or the partial
function gcadminentry(body, key) {
  var part = gcadminpart(key);
  return part ? ((body || {}).partials || {})[part] : ((body || {}).views || {})[key];
}
// the views that draw a partial: those including it, or a partial that does (card-top includes textversion)
function gcadminpartviews(name) {
  var d = gcadmin.draft, parts = d.partials || {}, want = [name], grew = true;
  var has = (html, n) => typeof html == 'string' && (html.includes('"#template-'+n+'"') || html.includes("'#template-"+n+"'"));
  while(grew) {
    grew = false;
    Object.keys(parts).forEach(function(p) {
      if(!want.includes(p) && want.some(n => has(parts[p].html, n))) { want.push(p); grew = true; }
    });
  }
  var views = Object.keys(d.views || {}).filter(k => want.some(n => has(d.views[k].html, n)));
  return views.length ? views : ['card'];
}
const gcadminmeta = ['database', 'key', 'version', 'updated', 'uid', 'uname', 'history'];
// JSON with keys sorted, so the stored item and an edited copy compare equal whatever their key order
function gcadmincanon(v) {
  return JSON.stringify(v, (k, x) => x && typeof x === 'object' && !Array.isArray(x) ?
    Object.keys(x).sort().reduce((o, key) => { o[key] = x[key]; return o; }, {}) : x);
}
// an error as one short line: JsRender's syntax errors carry the whole template after "in template:"
function gcadminerr(e) {
  var m = (e && e.responseJSON && e.responseJSON.error) || (e && e.message) || (e && e.status) || String(e);
  m = String(m).split(/,? in template:/)[0].replace(/\s+/g, ' ').trim();
  return m.length > 300 ? m.slice(0, 300)+'...' : m;
}

function gcadminpane(which) {
  return $('#'+(which == 'templates' ? 'templatesadmin' : 'gameconfigadmin'));
}
function gcadminbody(item) {
  var out = {};
  Object.keys(item || {}).filter(k => !gcadminmeta.includes(k)).forEach(k => out[k] = item[k]);
  return JSON.parse(JSON.stringify(out));
}
// the templates are site admins' (full permission on every game); a game config needs gameconfig or full on it
function gcadminallowed(which) {
  var user = cache_thing("user","data");
  if(!(user && ("oracle" in user) && ("groups" in user.oracle[0]))) { return false; }
  var groups = user.oracle[0].groups;
  if(which == 'templates') { return Array.isArray(groups['*']) && groups['*'].includes('*'); }
  return gamepermission('gameconfig');
}

function gcadminopen(which) {
  $('#loginlog, #discordadmin, #artistsadmin, #admindoc, #updatelogpage, #fielddescs').empty();
  $('#massimage, #setimport, #importprofiles, #artcheck').hide();
  $('#gameconfigadmin, #templatesadmin, #limitsadmin').empty();
  var db = which == 'templates' ? 'all' : database, key = which == 'templates' ? 'templates' : 'game';
  gcadminpane(which).text('Loading...');
  var cardid = gcadmin.db == database ? gcadmin.cardid : null;
  var view = gcadmin.which == which ? gcadmin.view : 'card';
  var start = function(item) {
    gcadmin = {which: which, db: database, item: item, draft: gcadminbody(item), view: view, cardid: cardid || gcadmindefaultcard()};
    gcadminshow();
  };
  $.ajax({url: apiuri+'/structure?database='+db+'&key='+key, dataType: 'json', cache: false})
    .done(start)
    .fail(function(raw) {
      if(raw.status == 404 && which == 'game') { start(null); return; }   // a new game: no config yet
      gcadminpane(which).html('<span class="error">Could not load it: '+htmlEncode(String((raw.responseJSON && raw.responseJSON.error) || raw.status))+'</span>');
    });
}

// the card shown in the preview: the card page's, else any card this page has loaded
function gcadmindefaultcard() {
  var last = $('#lastcardid').val();
  if(last && cache_card_is(last)) { return last; }
  var any = Object.keys((searchcache[database] || {}).data || {})[0];
  return any || '';
}

function gcadminshow() {
  var g = gcadmin, item = g.item, templ = g.which == 'templates';
  var allowed = gcadminallowed(g.which);
  var html = '<h3>'+(templ ? 'Templates (every game)' : 'Game config: '+htmlEncode(dbinfo[database].name))+'</h3>'+
    '<p class="fielddescsnote">'+(item ? 'Version '+item.version+(item.updated ? ', saved '+htmlEncode(new Date(item.updated).toLocaleString()) : '')+
      (item.uname ? ' by '+htmlEncode(item.uname) : '') : 'No config saved yet.')+
    ' <a href="" onclick="loadadmindoc(\'game-config\'); return false">How this works</a>'+
    (allowed ? '' : ' <b>Saving needs '+(templ ? 'full permission on every game (site admins)' : 'the gameconfig (or full) permission on '+htmlEncode(dbinfo[database].name))+'.</b>')+'</p>';
  if(templ) {
    html += '<p>View <select id="gcview" onchange="gcadminview(this.value);"><optgroup label="Views">'+Object.keys(g.draft.views || {}).sort().map(k =>
        '<option value="'+htmlEncode(k)+'"'+(k == g.view ? ' selected' : '')+'>'+htmlEncode(k)+' ('+htmlEncode(g.draft.views[k].longname || '')+')</option>').join('')+
      '</optgroup><optgroup label="Shared pieces (partials, included by the views)">'+Object.keys(g.draft.partials || {}).sort().map(k =>
        '<option value="partial:'+htmlEncode(k)+'"'+('partial:'+k == g.view ? ' selected' : '')+'>'+htmlEncode(k)+'</option>').join('')+'</optgroup></select> '+
      '<span id="gcchanged" class="fielddescsnote"></span></p>'+
      '<p>Standard views (every game, unless its config removes one): <input type="text" id="gcstandard" class="gcstandard" value="'+
        htmlEncode((g.draft.standard || []).join(' '))+'" /></p>'+
      '<p>The view\'s html (JsRender):<br /><textarea id="gchtml" class="gcjson" rows="24" spellcheck="false"></textarea></p>'+
      '<p id="gcviewjsonlabel">Its settings (JSON: places, longname, shortname, generic, headerizable, override):<br /><textarea id="gcviewjson" class="gcjson" rows="3" spellcheck="false"></textarea></p>'+
      '<details id="gcdiffbox"><summary>Changes against the saved version</summary><pre id="gcdiff" class="gcdiff"></pre></details>';
  } else {
    html += '<p>The <code>'+htmlEncode(database)+'/game</code> item as JSON: info, rows (card, printing, detail), sort, headers, views (add, remove), search, labels, symbols, quick, default. '+
      'The field list (labels, search settings, show) is on <a href="" onclick="loadfielddescs(); return false">Fields</a>.<br />'+
      '<textarea id="gcjsontext" class="gcjson" rows="30" spellcheck="false">'+htmlEncode(JSON.stringify(g.draft, null, 1))+'</textarea></p>';
  }
  html += '<p>Preview card id <input type="text" id="gccardid" size="8" value="'+htmlEncode(String(g.cardid || ''))+'" /> '+
    '<input type="button" value="Preview" onclick="gcadminpreview();" /> '+
    (allowed ? '<input type="button" value="Save" onclick="gcadminsave();" /> ' : '')+
    '<input type="button" value="Back to the saved version" onclick="gcadminrevert();" /> '+
    '<span id="gcstatus"></span></p>'+
    '<div id="gcpreview" class="gcpreview"></div>'+
    gcadminhistory();
  gcadminpane(g.which).html(html);
  if(templ) { gcadminviewfill(); }
  if(g.cardid) { gcadminpreview(); }
}

// the save history; an entry that kept the earlier copy can be loaded into the editor
function gcadminhistory() {
  var h = (gcadmin.item && gcadmin.item.history) || [];
  if(!h.length) { return ''; }
  return '<h4>History</h4><ul class="gchistory">'+h.map(function(e, i) {
    return '<li>v'+e.version+', '+htmlEncode(new Date(e.updated).toLocaleString())+' by '+htmlEncode(e.uname || '?')+': '+
      htmlEncode(Object.keys(e.changes || {}).join(', '))+
      (e.old ? ' &middot; <a href="" onclick="gcadminloadold('+i+'); return false">load v'+(e.version-1)+' into the editor</a>' : '')+'</li>';
  }).join('')+'</ul>';
}
function gcadminloadold(i) {
  gcadmintake();
  gcadmin.draft = JSON.parse(JSON.stringify(gcadmin.item.history[i].old));
  gcadminshow();
  $('#gcstatus').text('Loaded v'+(gcadmin.item.history[i].version-1)+' into the editor; Save makes it the current version.');
}
function gcadminrevert() {
  gcadmin.draft = gcadminbody(gcadmin.item);
  gcadminshow();
}

// Templates: show one view's html and settings; switching views keeps the edits in the draft
function gcadminview(key) {
  if(!gcadmintake()) { $('#gcview').val(gcadmin.view); return; }
  gcadmin.view = key;
  gcadminviewfill();
  if(gcadmin.cardid) { gcadminpreview(); }
}
function gcadminviewfill() {
  var part = gcadminpart(gcadmin.view);
  var v = gcadminentry(gcadmin.draft, gcadmin.view) || {};
  var rest = Object.assign({}, v);
  delete rest.html;
  $('#gchtml').val(v.html || '').prop('disabled', !part && v.html === undefined)
    .attr('placeholder', !part && v.html === undefined ? 'This view uses '+((v.override || {}).templatekey || 'another view')+'\'s html.' : '');
  $('#gcviewjsonlabel').contents().first()[0].textContent = part ?
    'Its note (JSON: note, what the piece is; included as tmpl="#template-'+part+'" by '+gcadminpartviews(part).join(', ')+'):' :
    'Its settings (JSON: places, longname, shortname, generic, headerizable, override):';
  $('#gcviewjson').val(JSON.stringify(rest));
  gcadmindiff();
}
// the editor's text into the draft; false (and a message) when it isn't valid JSON
function gcadmintake() {
  var g = gcadmin;
  try {
    if(g.which == 'templates') {
      if(!$('#gcviewjson').length) { return true; }
      var v = JSON.parse($('#gcviewjson').val() || '{}');
      if(typeof v != 'object' || Array.isArray(v)) { throw new Error('the settings must be a JSON object'); }
      var part = gcadminpart(g.view);
      var html = $('#gchtml').val(), before = (gcadminentry(g.draft, g.view) || {}).html;
      // a textarea gives \r\n back as \n (the text exports have \r\n): an unedited view keeps its own
      if(typeof before == 'string' && before.replace(/\r\n/g, '\n') === html) { html = before; }
      if(!$('#gchtml').prop('disabled')) { v.html = html; }
      if(part) { g.draft.partials = g.draft.partials || {}; g.draft.partials[part] = v; } else { g.draft.views[g.view] = v; }
      g.draft.standard = $('#gcstandard').val().split(/[\s,]+/).filter(x => x);
    } else {
      if(!$('#gcjsontext').length) { return true; }
      var body = JSON.parse($('#gcjsontext').val());
      if(typeof body != 'object' || Array.isArray(body)) { throw new Error('the config must be a JSON object'); }
      g.draft = body;
    }
  } catch(e) {
    $('#gcstatus').html('<span class="error">'+htmlEncode(e.message)+'</span>');
    return false;
  }
  return true;
}

// a line diff of the view's html against the saved one (+ added, - removed), and which views changed
function gcadmindiff() {
  var g = gcadmin, saved = gcadminbody(g.item);
  var changed = Object.keys(Object.assign({}, saved.views, g.draft.views)).filter(k =>
    gcadmincanon((saved.views || {})[k]) !== gcadmincanon((g.draft.views || {})[k])).concat(
    Object.keys(Object.assign({}, saved.partials, g.draft.partials)).filter(k =>
      gcadmincanon((saved.partials || {})[k]) !== gcadmincanon((g.draft.partials || {})[k])).map(k => 'partial:'+k));
  $('#gcchanged').text(changed.length ? 'Changed: '+changed.join(', ') : 'No changes');
  var a = ((gcadminentry(saved, g.view) || {}).html || '').replace(/\r\n/g, '\n').split('\n'), b = (($('#gchtml').val()) || '').split('\n');
  var lines = gcadminlinediff(a, b);
  $('#gcdiff').html(lines.some(l => l[0] != ' ') ? lines.filter((l, i) =>
      lines.slice(Math.max(0, i-2), i+3).some(x => x[0] != ' ')).map(l =>
      '<span class="gcdiff'+(l[0] == '+' ? 'add' : l[0] == '-' ? 'del' : 'same')+'">'+htmlEncode(l)+'</span>').join('\n') : 'No changes.');
}
function gcadminlinediff(a, b) {
  var n = a.length, m = b.length, t = [];
  for(var i = n; i >= 0; i--) {
    t[i] = [];
    for(var j = m; j >= 0; j--) {
      t[i][j] = (i == n || j == m) ? 0 : a[i] === b[j] ? t[i+1][j+1] + 1 : Math.max(t[i+1][j], t[i][j+1]);
    }
  }
  var out = [];
  i = 0; j = 0;
  while(i < n || j < m) {
    if(i < n && j < m && a[i] === b[j]) { out.push('  '+a[i]); i++; j++; }
    else if(j < m && (i == n || t[i][j+1] >= t[i+1][j])) { out.push('+ '+b[j]); j++; }
    else { out.push('- '+a[i]); i++; }
  }
  return out;
}

// the preview card: from the page's cache, else fetched
function gcadmincard(cardid) {
  if(cache_card_is(cardid)) { return Promise.resolve(cache_card_fetch(cardid)); }
  return Promise.resolve($.ajax({url: apiuri+"/oracle-fetch?table="+database+"&cardid="+cardid, dataType: 'json'}))
    .then(function(data) { data = preparecard([].concat(data)[0]); cache_card(data); return cache_card_fetch(cardid); });
}

function gcadminpreview() {
  if(!gcadmintake()) { return; }
  if(gcadmin.which == 'templates') { gcadmindiff(); }
  var cardid = $.trim($('#gccardid').val());
  if(!cardid) { $('#gcpreview').html('<p>Give a card id to preview.</p>'); return; }
  gcadmin.cardid = cardid;
  $('#gcpreview').text('Drawing...');
  gcadmincard(cardid).then(function(card) {
    if(!card || !card.cardid) { $('#gcpreview').html('<span class="error">No card '+htmlEncode(cardid)+' in '+htmlEncode(dbinfo[database].name)+'.</span>'); return; }
    var part = gcadminpart(gcadmin.view);
    var views = gcadmin.which != 'templates' ? ['card', 'search', 'list'] : part ? gcadminpartviews(part) : [gcadmin.view];
    var out = gcadmindraw(card, views);
    $('#gcpreview').html(out.map(function(o) {
      return '<div class="gcpreviewpart" id="gcpart'+out.indexOf(o)+'"><h4>'+htmlEncode(o.title)+'</h4>'+(o.error ? '<p class="error">'+htmlEncode(o.error)+'</p>' :
        o.text ? '<pre class="gcpreviewtext">'+htmlEncode(o.html)+'</pre>' : '<div class="gcpreviewhtml">'+o.html+'</div>')+'</div>';
    }).join(''));
    // the drawn views carry the page's ids (#printingprimary, ...): drop them so the real views keep theirs
    $('#gcpreview .gcpreviewhtml [id]').removeAttr('id');
    out.forEach(function(o, i) {
      if(o.primary) { $('#gcpart'+i+' .printing').not('[data-printingid='+o.primary+']').hide(); }
      if(o.symbols && !o.error) { o.symbols('#gcpart'+i); }
    });
  }).catch(function(e) {
    $('#gcpreview').html('<span class="error">Could not draw the preview: '+htmlEncode(gcadminerr(e))+'</span>');
  });
}

// Draws the card in the given views with the draft (a game config, or the templates) in place of the page's,
// then puts the page's own config back. Returns [{title, html | error, text, primary, symbols}].
function gcadmindraw(card, views) {
  var db = database, g = gcadmin;
  var keep = {dbinfo: dbinfo[db], labels: labels[db], searchables: searchables[db], templates: templates[db],
              sort: databasesort[db], headers: headerize[db], updates: updates[db], conf: gameconfig[db],
              blurb: blurb[db], hidden: gamehidden[db]};
  var restore = function() {
    dbinfo[db] = keep.dbinfo; labels[db] = keep.labels; searchables[db] = keep.searchables; templates[db] = keep.templates;
    databasesort[db] = keep.sort; headerize[db] = keep.headers; updates[db] = keep.updates; gameconfig[db] = keep.conf;
    gamehidden[db] = keep.hidden;
    templatepartials(((keep.conf || {}).templates || {}).partials);   // the draft's pieces out, the page's back
    if(keep.blurb === undefined) { delete blurb[db]; } else { blurb[db] = keep.blurb; }
  };
  var out = [];
  try {
    var conf = Object.assign({}, keep.conf, g.which == 'templates' ? {templates: g.draft} : {game: g.draft});
    gameconfigapply(db, conf);
    var available = templates[db].available;
    views.forEach(function(key) {
      var val = available[key] || (conf.templates.views || {})[key];
      var title = key+(val && val.longname ? ' ('+val.longname+')' : '');
      if(!val) { out.push({title: title, error: 'This game doesn\'t offer the view '+key+'.'}); return; }
      if(!available[key]) { available[key] = val; }
      var place = (val.places || [])[0] || 'list';   // pdf has no place: it draws a list
      try {
        var base = (val.override && val.override.templatekey) ? conf.templates.views[val.override.templatekey] : val;
        templates[db].compiled[key] = $.templates(base.html);
        templates[db].active[place] = key;
        out.push(Object.assign({title: title, symbols: updates[db]}, gcadminrender(card, key, place, val)));
      } catch(e) {
        out.push({title: title, error: gcadminerr(e)});
      }
    });
  } catch(e) {
    out.push({title: 'Game config', error: gcadminerr(e)});
  } finally {
    restore();
  }
  return out;
}
// one view drawn as the page draws it: the card page, a search result, or a list of the card (two copies)
function gcadminrender(card, key, place, val) {
  var db = database;
  if(place == 'card') {
    var c = JSON.parse(JSON.stringify(card));
    return {html: cardhtml(c).html, primary: String(card.printingprimary)};
  }
  if(place == 'search') {
    return {html: rendercards([JSON.parse(JSON.stringify(card))], {}, '')};
  }
  var c = JSON.parse(JSON.stringify(card));
  c.listquantity = 2;
  c.listprinting = card.printingprimary;
  var list = [c];
  var tmpl = {"labels": labels[db], datarequest: {'listid': 0, 'sort': 'deck'}, "database": db, "listmine": false, "listmeta": {}};
  var override = val.override || {};
  for(var v in override.var || {}) { tmpl[v] = override.var[v]; }
  var shown = /^text|^pdf/.test(key) ? list : bubbleup(list, {'listid': 0});
  if(key == 'table') { $.extend(tmpl, listtablecolumns(shown)); }
  var data = val.headerizable && headerize[db] && headerize[db].deck ? headerize[db].deck(shown) : shown;
  var html = templates[db].compiled[key].render(/^text|^pdf/.test(key) ? data : markprinteddiffs(data), tmpl);
  if(key == 'table') { html = listtablewrap(html, tmpl); }
  return {html: html, text: /^text|^pdf/.test(key)};
}

function gcadminsave() {
  if(!gcadmintake()) { return; }
  var g = gcadmin, templ = g.which == 'templates';
  var cardid = $.trim($('#gccardid').val()) || g.cardid;
  if(!cardid) { $('#gcstatus').html('<span class="error">Give a preview card id first: a save has to draw it.</span>'); return; }
  $('#gcstatus').text('Checking...');
  gcadmincard(cardid).then(function(card) {
    if(!card || !card.cardid) { throw new Error('no card '+cardid+' to check with'); }
    // every view must compile and draw the card (the templates), or the card page, a search result and a list (a game config)
    var views = templ ? Object.keys(g.draft.views || {}) : ['card', 'search', 'list'];
    var failed = gcadmindraw(card, views).filter(o => o.error);
    if(failed.length) {
      $('#gcstatus').html('<span class="error">Not saved: '+failed.map(o => htmlEncode(o.title+': '+o.error)).join('; ')+'</span>');
      return;
    }
    $('#gcstatus').text('Saving...');
    $.ajax({
      type: "POST",
      url: apiuri+"/update",
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({uid: getuid(), database: templ ? 'all' : database, operation: templ ? 'templates' : 'gameconfig',
                            version: g.item ? g.item.version : 0, data: g.draft}),
      beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', getidtoken()); },
      success: function(raw) {
        if(raw.message == 'no changes') { $('#gcstatus').text('No changes to save.'); return; }
        // this browser's stored copies are dropped (the templates: every game's), so a reload draws the new
        // version; other browsers pick it up on their next loads
        (templ ? (gamemenu || [database]) : [database]).forEach(function(d) {
          try { window.localStorage.removeItem(d+"_gameconfig_"+d); } catch(e) {}
        });
        gcadminopen(g.which);
        setTimeout(function() { $('#gcstatus').text('Saved version '+raw.version+' ('+(raw.changed || []).join(', ')+'). Reload the page to use it here.'); }, 500);
      },
      error: function(raw) {
        var msg = (raw.responseJSON && raw.responseJSON.error) || raw.status;
        $('#gcstatus').html('<span class="error">Not saved: '+htmlEncode(String(msg))+'</span>'+
          (raw.status == 409 ? ' Copy your edit, then <a href="" onclick="gcadminopen(gcadmin.which); return false">reload</a>.' : ''));
      }
    });
  }).catch(function(e) {
    $('#gcstatus').html('<span class="error">Not saved: '+htmlEncode(gcadminerr(e))+'</span>');
  });
}
