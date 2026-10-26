// Admin → Audit → Patreon supporters (loaded on first use by loadpatreonadmin in oracle.js;
// docs/admin/patreon.md): every member of the Patreon campaign from oracle-all-patreon, with the
// Oracle account they're tied to and, when they connected Discord on Patreon, who they are on
// Discord and in which of the bot's servers. POST /patreon/supporters {uid} (ootv-webhooks, ootv-search
// webhooks/) → {supporters}. Site admins only.

var patreonadminloaded = true;
var PATREONSTATUS = {active_patron: 'Active', declined_patron: 'Declined', free: 'Free', former_patron: 'Former'};
var patreondata = null;

function patreonopen() {
  $('#patreonadmin').html('<h3>Patreon supporters</h3><p>Every member of the Patreon campaign: their tier, the Oracle account they\'re tied to, '+
    'and who they are on Discord when they connected Discord in their Patreon settings. Discord names and servers are as of the last '+
    'nightly sync or Patreon update. Site admins only; see the <a href="" onclick="loadadmindoc(\'patreon\'); return false">guide</a>.</p>'+
    '<p><select id="patreonshow" onchange="patreondraw()"><option value="current">Current supporters (active, declined)</option>'+
    '<option value="discord">Everyone on Discord</option><option value="all">Everyone</option></select> '+
    '<input type="text" id="patreonfilter" placeholder="Filter by name or tier" oninput="patreondraw()" /> '+
    '<span class="patreonstatus"></span></p><div id="patreonresult"></div>');
  patreonload();
}

function patreonload() {
  $('#patreonadmin .patreonstatus').text('Loading...');
  $.ajax({
    type: 'POST',
    url: apiuri+"/patreon/supporters",
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({uid: getuid()}),
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());}
  }).done(function(r) {
    patreondata = r.supporters;
    $('#patreonadmin .patreonstatus').text('');
    patreondraw();
  }).fail(function(e) {
    $('#patreonadmin .patreonstatus').html('<span class="error">'+htmlEncode((e.responseJSON && e.responseJSON.error) || 'Could not load the supporters.')+'</span>');
  });
}

function patreondiscord(d) {
  if(!d) { return ''; }
  if(d.missing) { return '<i>no such Discord user</i> <span class="discordid">'+htmlEncode(d.id)+'</span>'; }
  if(!d.username) { return '<span class="discordid">'+htmlEncode(d.id)+'</span>'+(d.error ? ' <span class="error">lookup failed</span>' : ''); }
  return (d.name ? htmlEncode(d.name)+' ' : '')+'@'+htmlEncode(d.username)+' <span class="discordid">'+htmlEncode(d.id)+'</span>'+
    (d.error ? ' <span class="error" title="'+htmlEncode(d.error)+'">(last check failed)</span>' : '');
}

function patreonservers(d) {
  if(!d || !d.servers) { return ''; }
  if(!d.servers.length) { return '<i>none</i>'; }
  return d.servers.map(s => htmlEncode(s.name)+(s.nick ? ' (as '+htmlEncode(s.nick)+')' : '')).join('<br>');
}

function patreonaccount(x) {
  if(x.uid === undefined) { return x.nomatch ? '<i>unlinked by the user</i>' : '<i>not tied</i>'; }
  return htmlEncode(x.name || String(x.uid))+' <span class="discordid">'+htmlEncode(String(x.uid))+'</span>'+
    (x.linkedby && x.linkedby != 'email' ? ' ('+htmlEncode(x.linkedby == 'oauth' ? 'Patreon login' : x.linkedby)+')' : '');
}

function patreondraw() {
  if(!patreondata) { return; }
  var show = $('#patreonshow').val(), q = ($('#patreonfilter').val() || '').trim().toLowerCase();
  var rows = patreondata.filter(function(x) {
    if(show == 'current' && x.status != 'active_patron' && x.status != 'declined_patron') { return false; }
    if(show == 'discord' && !x.discord) { return false; }
    if(!q) { return true; }
    var d = x.discord || {};
    return [x.name, d.name, d.username, (x.tiers || []).join(' '), (d.servers || []).map(s => s.nick).join(' ')]
      .some(v => v && String(v).toLowerCase().includes(q));
  });
  var count = s => patreondata.filter(x => x.status == s).length;
  var html = '<p>'+patreondata.length+' members: '+count('active_patron')+' active, '+count('declined_patron')+' declined, '+
    count('free')+' free, '+count('former_patron')+' former. '+patreondata.filter(x => x.uid !== undefined).length+' tied to an Oracle account, '+
    patreondata.filter(x => x.discord).length+' on Discord.</p>';
  if(!rows.length) { $('#patreonresult').html(html+'<p>No one matches.</p>'); return; }
  html += '<table class="loginlog patreonrows"><tr><th>Status</th><th>Tier</th><th>Pledge</th><th>Last charge</th><th>Oracle account</th>'+
    '<th>Discord</th><th>Servers</th></tr>'+
    rows.map(x => '<tr class="patreon-'+htmlEncode(x.status)+'"><td>'+htmlEncode(PATREONSTATUS[x.status] || x.status)+'</td><td>'+
      htmlEncode((x.tiers || []).join(', '))+'</td><td>'+(x.cents ? '$'+(x.cents / 100).toFixed(2) : '')+'</td><td>'+
      (x.lastcharge ? htmlEncode(x.lastcharge.slice(0, 10))+(x.lastchargestatus && x.lastchargestatus != 'Paid' ? ' '+htmlEncode(x.lastchargestatus) : '') : '')+
      '</td><td>'+patreonaccount(x)+'</td><td>'+patreondiscord(x.discord)+'</td><td>'+patreonservers(x.discord)+'</td></tr>').join('')+'</table>';
  $('#patreonresult').html(html);
}
