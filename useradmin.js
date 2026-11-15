// Admin → Audit → Users and Audit log (loaded on first use by loaduseradmin / loadauditlogadmin in oracle.js;
// docs/admin/users.md, docs/admin/admin-editing.md). POST /admin (ootv-search routes/admin.js), site admins
// only: usersearch, userget, useredit, auditlog. Answers hold emails and names: never cached, only drawn.
// Every lookup and edit is itself an audit log row.

var useradminloaded = true;
var useradmincurrent = null;    // the userget answer drawn now
var AUDITACTIONS = {'listedit-open': 'Opened a list to edit', 'listedit-save': 'Saved a list', 'user-search': 'Searched users',
                    'user-view': 'Looked at a user', 'user-edit': 'Edited a user'};

function adminpost(data) {
  return $.ajax({
    type: 'POST',
    url: apiuri+"/admin",
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify($.extend({uid: getuid()}, data)),
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());}
  });
}
function adminerror(e, what) {
  return '<span class="error">'+htmlEncode((e.responseJSON && e.responseJSON.error) || ('Could not '+what+' ('+e.status+')'))+'</span>';
}

// ---- Users

function useropen() {
  $('#useradmin').html('<h3>Users</h3><p>Look up an account by email, uid, or part of a name or display name, then change its names, '+
    'email addresses or permission groups. Every lookup and change is in the <a href="" onclick="loadauditlogadmin(); return false">audit log</a> '+
    'under your name. Site admins only; see the <a href="" onclick="loadadmindoc(\'users\'); return false">guide</a>.</p>'+
    '<p><input type="text" id="usersearchq" size="40" placeholder="email, uid or name" onkeydown="if(event.key==\'Enter\') usersearch();" /> '+
    '<input type="button" value="Search" onclick="usersearch()" /> <span class="userstatus"></span></p>'+
    '<div id="usersearchresult"></div><div id="userdetail"></div>');
  $('#usersearchq').focus();
}

function usersearch() {
  var q = $('#usersearchq').val().trim();
  if(q.length < 2) { return; }
  $('#useradmin .userstatus').text('Searching...');
  $('#userdetail').empty();
  adminpost({action: 'usersearch', q: q}).done(function(r) {
    $('#useradmin .userstatus').text('');
    if(!r.users.length) { $('#usersearchresult').html('<p>No accounts match.</p>'); return; }
    if(r.users.length == 1) { $('#usersearchresult').empty(); userget(r.users[0].uid); return; }
    $('#usersearchresult').html('<table class="loginlog"><tr><th>uid</th><th>Name</th><th>Display name</th><th>Emails</th><th>Created</th></tr>'+
      r.users.map(function(u) {
        return '<tr><td><a href="" onclick="userget('+parseInt(u.uid)+'); return false">'+parseInt(u.uid)+'</a></td><td>'+
          htmlEncode([u.firstname, u.lastname].filter(Boolean).join(' '))+'</td><td>'+htmlEncode(u.displayname || '')+'</td><td>'+
          htmlEncode((u.emails || [u.email]).filter(Boolean).join(', '))+'</td><td>'+htmlEncode((u.insert_date || '').slice(0, 10))+'</td></tr>';
      }).join('')+'</table>'+(r.more ? '<p>More match; narrow the search.</p>' : ''));
  }).fail(function(e) { $('#useradmin .userstatus').html(adminerror(e, 'search')); });
}

function userget(uid) {
  $('#userdetail').text('Loading...');
  adminpost({action: 'userget', target: uid}).done(userdraw)
    .fail(function(e) { $('#userdetail').html(adminerror(e, 'load the user')); });
}

function userdraw(r) {
  useradmincurrent = r;
  var u = r.user, me = parseInt(getuid()) === parseInt(u.uid);
  var lists = Object.keys(r.lists || {}).sort().map(function(g) {
    return htmlEncode(dbinfo[g] ? dbinfo[g].name : g)+': '+r.lists[g].lists+' ('+r.lists[g].public+' public)';
  }).join(', ') || 'none';
  var emails = (u.emails || []).map(function(e) {
    return '<li>'+htmlEncode(e)+(u.email && u.email.toLowerCase() == e.toLowerCase() ? ' <i>(notices go here)</i>' : '')+
      ((u.emails || []).length > 1 ? ' <a href="" onclick="userremoveemail(this); return false" data-email="'+htmlEncode(e)+'">remove</a>' : '')+'</li>';
  }).join('');
  var logins = (r.logins || []).map(function(l) {
    return '<tr class="loginlog-'+htmlEncode(l.result)+'"><td>'+htmlEncode(new Date(l.time).toLocaleString())+'</td><td>'+htmlEncode(l.result)+
      '</td><td>'+htmlEncode(l.provider || '')+'</td><td>'+htmlEncode(l.ip || '')+'</td><td>'+(l.newDeviceUsed ? 'new device' : '')+'</td></tr>';
  }).join('');
  $('#userdetail').html('<h4>User '+parseInt(u.uid)+(me ? ' (you)' : '')+'</h4>'+
    (r.warning ? '<p class="error">'+htmlEncode(r.warning)+'</p>' : '')+
    '<p>Created '+htmlEncode((u.insert_date || '?').slice(0, 10))+' &middot; Lists: '+lists+
    (u.patreon ? ' &middot; Patreon: '+htmlEncode((u.patreon.tiers || []).join(', ') || u.patreon.status || '') : '')+
    ' &middot; <a href="" onclick="auditlogfor(\'user#'+parseInt(u.uid)+'\'); return false">audit log for this user</a></p>'+
    '<table class="useredit"><tr><td>First name</td><td><input type="text" id="useredit_firstname" maxlength="50" value="'+htmlEncode(u.firstname || '')+'" /></td></tr>'+
    '<tr><td>Last name</td><td><input type="text" id="useredit_lastname" maxlength="50" value="'+htmlEncode(u.lastname || '')+'" /></td></tr>'+
    '<tr><td>Display name</td><td><input type="text" id="useredit_displayname" maxlength="50" value="'+htmlEncode(u.displayname || '')+'" /> '+
    '<span class="admineditnote">what others see on shared decks; empty = initials</span></td></tr>'+
    '<tr><td></td><td><input type="button" value="Save names" onclick="useredit({field: \'name\', firstname: $(\'#useredit_firstname\').val(), '+
    'lastname: $(\'#useredit_lastname\').val(), displayname: $(\'#useredit_displayname\').val()})" /></td></tr></table>'+
    '<h4>Email addresses</h4><ul>'+emails+'</ul>'+
    '<p><input type="email" id="useredit_addemail" size="32" placeholder="another address" /> <input type="button" value="Add" '+
    'onclick="useredit({field: \'addemail\', email: $(\'#useredit_addemail\').val()})" /> <span class="admineditnote">added at once, without a code: '+
    'only for an address you know is theirs</span></p>'+
    '<h4>Permission groups</h4><p class="admineditnote">One line per game (or <code>*</code> for every game): <code>game: op, op</code>. '+
    'Ops are /update operations (<code>update</code>, <code>new</code>, ...), <code>setimport</code>, <code>artcheck</code>, <code>listaward</code>, '+
    '<code>listedit</code> (edit anyone\'s lists), or <code>*</code> (everything for that game; <code>*: *</code> is a site admin). '+
    'Empty takes all permissions away.'+(me ? ' You can\'t take <code>*</code> out of your own <code>*</code> line.' : '')+'</p>'+
    '<textarea id="useredit_groups" rows="4" cols="50">'+htmlEncode(groupstext(u.groups))+'</textarea><br>'+
    '<input type="button" value="Save groups" onclick="usersavegroups()" /> <span class="usereditstatus"></span>'+
    (logins ? '<h4>Recent sign-ins</h4><table class="loginlog"><tr><th>Time</th><th></th><th>Provider</th><th>IP</th><th></th></tr>'+logins+'</table>' : ''));
}

function groupstext(groups) {
  return Object.keys(groups || {}).sort(function(a, b) { return a == '*' ? -1 : b == '*' ? 1 : a.localeCompare(b); })
    .map(function(g) { return g+': '+(groups[g] || []).join(', '); }).join('\n');
}
function groupsparse(text) {
  var groups = {}, bad = null;
  text.split('\n').map(function(l) { return l.trim(); }).filter(Boolean).forEach(function(l) {
    var m = /^([^:\s]+)\s*:\s*(.*)$/.exec(l);
    if(!m) { bad = bad || l; return; }
    groups[m[1]] = m[2].split(',').map(function(o) { return o.trim(); }).filter(Boolean);
  });
  return bad ? {error: 'Not "game: op, op": '+bad} : {groups: groups};
}
function usersavegroups() {
  var parsed = groupsparse($('#useredit_groups').val());
  if(parsed.error) { $('.usereditstatus').html('<span class="error">'+htmlEncode(parsed.error)+'</span>'); return; }
  useredit({field: 'groups', groups: parsed.groups});
}
function userremoveemail(el) {
  var email = $(el).data('email');
  if(!confirm('Remove '+email+' from this account? Signing in with it will no longer reach it, and the address is sent a notice.')) { return; }
  useredit({field: 'removeemail', email: email});
}
function useredit(change) {
  if(!useradmincurrent) { return; }
  $('.usereditstatus').text('Saving...');
  adminpost($.extend({action: 'useredit', target: useradmincurrent.user.uid}, change)).done(function(r) {
    userdraw(r);
    $('.usereditstatus').text('Saved');
  }).fail(function(e) { $('.usereditstatus').html(adminerror(e, 'save')); });
}

// ---- Audit log

function auditopen(target) {
  var day = function(offset) { return new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10); };
  $('#auditlogadmin').html('<h3>Audit log</h3><p>What admins did with other people\'s data: opening someone\'s list to edit it, each change '+
    'to it, and every user lookup and change, refusals too. Days are UTC; at most 31 at a time. Site admins only; see the '+
    '<a href="" onclick="loadadmindoc(\'admin-editing\'); return false">guide</a>.</p>'+
    '<p>From <input type="date" id="auditfrom" value="'+day(-29)+'" /> to <input type="date" id="auditto" value="'+day(0)+'" /> '+
    'Admin uid <input type="text" id="auditadmin" size="8" /> or target <input type="text" id="audittarget" size="14" placeholder="list#123, user#456" value="'+htmlEncode(target || '')+'" /> '+
    '<input type="button" value="Show" onclick="auditload()" /> <span class="auditstatus"></span></p><div id="auditresult"></div>');
  auditload();
}
function auditlogfor(target) {
  loadauditlogadmin(target);
}

function auditload() {
  var data = {action: 'auditlog', from: $('#auditfrom').val(), to: $('#auditto').val()};
  if($('#auditadmin').val().trim()) { data.admin = $('#auditadmin').val().trim(); }
  else if($('#audittarget').val().trim()) { data.target = $('#audittarget').val().trim(); }
  $('#auditlogadmin .auditstatus').text('Loading...');
  adminpost(data).done(function(r) {
    $('#auditlogadmin .auditstatus').text(r.more ? 'Only the newest '+r.rows.length+' shown; narrow the days.' : '');
    auditdraw(r.rows);
  }).fail(function(e) { $('#auditlogadmin .auditstatus').html(adminerror(e, 'load the audit log')); });
}

function audittarget(t) {
  var m = /^list#(\d+)$/.exec(t || '');
  if(m) { return '<a href="'+htmlEncode(sharelink(m[1]))+'" target="_blank">list '+m[1]+'</a>'; }
  m = /^user#(\d+)$/.exec(t || '');
  if(m) { return '<a href="" onclick="loaduseradmin('+m[1]+'); return false">user '+m[1]+'</a>'; }
  return htmlEncode(t || '');
}
function auditdetail(x) {
  var bits = [];
  if(x.field) { bits.push('<b>'+htmlEncode(x.field)+'</b>'); }
  if(x.cards) {
    bits.push(x.cards.map(function(c) { return htmlEncode(String(c.cardid))+(c.printing ? '/'+htmlEncode(String(c.printing)) : '')+': '+c.from+' → '+c.to; }).join(', ')+
      (x.cardsmore ? ' and '+x.cardsmore+' more' : '') || '(no card changes)');
  }
  if(x.old !== undefined || x.new !== undefined) {
    bits.push('<span class="auditold">'+htmlEncode(x.old === null || x.old === undefined ? '(none)' : x.old)+'</span> → <span class="auditnew">'+
      htmlEncode(x.new === null || x.new === undefined ? '(none)' : x.new)+'</span>');
  }
  if(x.query) { bits.push('“'+htmlEncode(x.query)+'”'); }
  if(x.owner) { bits.push('owner <a href="" onclick="loaduseradmin('+parseInt(x.owner)+'); return false">'+parseInt(x.owner)+'</a>'); }
  if(x.game) { bits.push(htmlEncode(dbinfo[x.game] ? dbinfo[x.game].name : x.game)); }
  if(x.action == 'listedit-open') { bits.push((x.listpublic ? 'public' : 'private')+' list, popup '+htmlEncode(x.warning || '?')); }
  if(x.notify !== undefined) { bits.push(x.notified ? 'owner emailed' : x.notify ? 'notify on (already emailed this hour)' : 'owner not emailed'); }
  return bits.join(' &middot; ');
}
function auditdraw(rows) {
  if(!rows.length) { $('#auditresult').html('<p>Nothing in these days.</p>'); return; }
  $('#auditresult').html('<table class="loginlog auditrows"><tr><th>Time</th><th>Admin</th><th>What</th><th>Target</th><th>Result</th><th>Detail</th></tr>'+
    rows.map(function(x) {
      return '<tr class="audit-'+htmlEncode(x.result)+'"><td>'+htmlEncode(new Date(x.time).toLocaleString())+'</td><td>'+
        '<a href="" onclick="$(\'#auditadmin\').val('+parseInt(x.admin)+'); $(\'#audittarget\').val(\'\'); auditload(); return false">'+htmlEncode(x.adminname || String(x.admin))+'</a></td><td>'+
        htmlEncode(AUDITACTIONS[x.action] || x.action)+'</td><td>'+audittarget(x.target)+'</td><td>'+htmlEncode(x.result)+'</td><td>'+auditdetail(x)+'</td></tr>';
    }).join('')+'</table>');
}
