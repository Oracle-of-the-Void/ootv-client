// Admin → Audit → Usage (loaded on first use by loadusageadmin in oracle.js; docs/admin/usage.md):
// every use of the photo features, refusals included, from oracle-all-usage (written by ootv-search
// artembed/app.py and admin/index.mjs; shape in admin/usage.mjs). POST /artcheck action usage
// {from, to} (UTC days, at most 31) → {rows, names}. Every game's rows, so site admins only.

var usageadminloaded = true;
var USAGEFEATURES = {findcard: 'Find the card', findartist: 'Find the artist', artcheck: 'Artist check'};
var USAGEOUTCOMES = ['ok', 'limited', 'denied', 'bad', 'error'];
var USAGEROWS = 300;      // the newest this many uses are listed one by one
var usagedata = null;

function usageday(offset) {
  return new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
}

function usageopen() {
  $('#usageadmin').html('<h3>Usage</h3><p>Every use of Photo → Find the card, Photo → Find the artist and Admin → Artist check, in every game, '+
    'including the ones the <a href="" onclick="loadlimitsadmin(); return false">limits</a> refused. Days are UTC. Site admins only; see the '+
    '<a href="" onclick="loadadmindoc(\'usage\'); return false">guide</a>.</p>'+
    '<p>From <input type="date" id="usagefrom" value="'+usageday(-6)+'" /> to <input type="date" id="usageto" value="'+usageday(0)+'" /> '+
    '<input type="button" value="Show" onclick="usageload()" /> '+
    '<select id="usagegame" onchange="usagedraw()"><option value="">every game</option></select> <span class="usagestatus"></span></p>'+
    '<div id="usageresult"></div>');
  usageload();
}

function usageload() {
  var from = $('#usagefrom').val(), to = $('#usageto').val();
  $('#usageadmin .usagestatus').text('Loading...');
  $.ajax({
    type: 'POST',
    url: apiuri+"/artcheck",
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({uid: getuid(), database: database, action: 'usage', from: from, to: to}),
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());}
  }).done(function(r) {
    usagedata = r;
    var games = [...new Set(r.rows.map(x => x.game).filter(x => x))].sort(), sel = $('#usagegame'), was = sel.val();
    sel.html('<option value="">every game</option>'+games.map(g => '<option value="'+htmlEncode(g)+'">'+htmlEncode(dbinfo[g] ? dbinfo[g].name : g)+'</option>').join(''));
    if(games.includes(was)) { sel.val(was); }
    $('#usageadmin .usagestatus').text('');
    usagedraw();
  }).fail(function(e) {
    $('#usageadmin .usagestatus').html('<span class="error">'+htmlEncode((e.responseJSON && e.responseJSON.error) || 'Could not load the usage log.')+'</span>');
  });
}

// counts of rows by key(row) and outcome → a table, one line per key, with a total line
function usagetable(rows, title, key, label) {
  var by = {};
  rows.forEach(function(x) {
    var k = key(x), c = by[k] = by[k] || {all: 0};
    c.all++;
    c[x.outcome] = (c[x.outcome] || 0) + 1;
  });
  var keys = Object.keys(by).sort(), total = {all: rows.length};
  rows.forEach(x => { total[x.outcome] = (total[x.outcome] || 0) + 1; });
  var line = (name, c, cls) => '<tr'+(cls ? ' class="'+cls+'"' : '')+'><td>'+name+'</td><td>'+c.all+'</td>'+
    USAGEOUTCOMES.map(o => '<td>'+(c[o] || '')+'</td>').join('')+'</tr>';
  return '<h4>'+title+'</h4><table class="loginlog usagetable"><tr><th></th><th>Uses</th>'+USAGEOUTCOMES.map(o => '<th>'+o+'</th>').join('')+'</tr>'+
    keys.map(k => line(label(k), by[k])).join('')+(keys.length > 1 ? line('<b>all</b>', total, 'usagetotal') : '')+'</table>';
}

function usagedraw() {
  if(!usagedata) { return; }
  var game = $('#usagegame').val(), names = usagedata.names || {};
  var rows = usagedata.rows.filter(x => !game || x.game == game);
  var who = uid => uid === undefined ? '(not logged in)' : htmlEncode(names[uid] || String(uid));
  if(!rows.length) { $('#usageresult').html('<p>No uses in these days.</p>'); return; }
  var feature = f => htmlEncode(USAGEFEATURES[f] || f);
  var html = usagetable(rows, 'By day and feature', x => x.day+'|'+x.feature, k => htmlEncode(k.split('|')[0])+' '+feature(k.split('|')[1])) +
    usagetable(rows, 'By feature', x => x.feature, feature) +
    usagetable(rows, 'By level', x => x.level || '(none)', htmlEncode) +
    usagetable(rows, 'By person', x => String(x.uid === undefined ? '' : x.uid), k => who(k === '' ? undefined : parseInt(k, 10)));
  var recent = rows.slice().reverse().slice(0, USAGEROWS);
  html += '<h4>Uses, newest first'+(rows.length > USAGEROWS ? ' (the newest '+USAGEROWS+' of '+rows.length+')' : '')+'</h4>'+
    '<table class="loginlog usagerows"><tr><th>Time</th><th>Feature</th><th>Game</th><th>Who</th><th>Level</th><th>Outcome</th><th>Left (day, minute)</th><th>Seconds</th><th>Note</th></tr>'+
    recent.map(x => '<tr class="usage-'+htmlEncode(x.outcome)+'"><td>'+htmlEncode(new Date(x.ts).toLocaleString())+'</td><td>'+feature(x.feature)+
      (x.kind ? ' ('+htmlEncode(x.kind)+')' : '')+'</td><td>'+htmlEncode(x.game || '')+'</td><td>'+who(x.uid)+'</td><td>'+htmlEncode(x.level || '')+
      '</td><td>'+htmlEncode(x.outcome)+'</td><td>'+(x.left && Object.keys(x.left).length ? htmlEncode([x.left.day, x.left.minute].map(n => n === undefined ? '-' : n).join(', ')) : '')+
      '</td><td>'+(x.ms === undefined ? '' : (x.ms / 1000).toFixed(1))+'</td><td>'+htmlEncode(x.message || x.ref || '')+'</td></tr>').join('')+'</table>';
  $('#usageresult').html(html);
}
