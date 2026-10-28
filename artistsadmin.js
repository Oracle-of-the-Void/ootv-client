// Admin → Artists: the entries of oracle-all-artists (one per artist credit, shared by every game) that
// the card page's artist modal shows. Loaded on first use by loadartistsadmin() in oracle.js. Read with
// GET /artist?all=1, saved with POST /update operation 'artists' (ootv-search lib/artists.js). Each entry's
// known signatures (oracle-all-signatures) are read and edited with POST /artcheck siglist / sigedit /
// sigmove / sigdetach / sigdelete (ootv-search admin/signatures.mjs). Guide: docs/admin/artists.md.
window.artistsadminloaded = true;
var artistsadmin = {list: [], byname: {}, filter: '', only: '', edit: null, counts: null, sigs: null, sig: null};
const artistsshown = 200;   // rows drawn at once; the filter narrows the rest
const artistsimages = 'https://images.oracleofthevoid.com/';   // + the signature's folder + file

// POST /artcheck with database 'all' (the signature catalogue is every game's), as artcheck.js artcheckapi()
function artistssigapi(action, data) {
  return Promise.resolve($.ajax({
    type: 'POST',
    url: apiuri+'/artcheck',
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify(Object.assign({uid: getuid(), database: 'all', action: action}, data || {})),
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
    timeout: 60000
  }));
}

function artistssigerr(e) {
  return (e && e.responseJSON && e.responseJSON.error) || (e && e.status) || String(e);
}

// signatures per artist entry ({name: n}), for the list's "With signatures"; null until loaded
function artistssigcount(a) {
  var c = artistsadmin.counts;
  return c ? (c[a.name] || 0) : (a.signatures ? a.signatures.count || 1 : 0);
}

// name: the entry to open in the form (undefined keeps the one open); note: a status line to show
// once drawn (after a save)
function artistsopen(name, note) {
  artistsadmin.edit = name === undefined ? artistsadmin.edit : name;
  $('#artistsadmin').text('Loading artist entries...');
  $.ajax({url: apiuri+'/artist', data: {all: 1}, dataType: 'json', cache: false, timeout: 30000})
    .done(function(r) {
      artistsadmin.list = r.artists || [];
      artistsadmin.byname = {};
      artistsadmin.list.forEach(a => artistsadmin.byname[a.name] = a);
      artistsshow();
      artistssigapi('siglist').then(function(c) { artistsadmin.counts = c.counts || {}; artistsshowcount(); }, function() {});
      if(note) {
        if($('#artistsstatus').length) { $('#artistsstatus').text(note); }
        else { $('#artistsedit').html($('<p class="fielddescsnote">').text(note)); }
      }
    })
    .fail(function(raw) {
      $('#artistsadmin').text('Could not load the artist entries: '+((raw.responseJSON && raw.responseJSON.error) || raw.status));
    });
}

function artistsshow() {
  var allowed = artistsallowed();
  var list = artistsadmin.list;
  var count = f => list.filter(f).length;
  $('#artistsadmin').html(
    '<h3>Artists</h3>'+
    '<p class="fielddescsnote">'+list.length+' entries, one per artist credit (exactly as on the printings), shared by every game. '+
      'Clicking a credit on a card shows its entry. <a href="" onclick="loadadmindoc(\'artists\'); return false">Guide</a></p>'+
    (allowed ? '' : '<p class="error">Viewing only: saving needs the artists (or full) permission on every game.</p>')+
    '<div id="artistsedit"></div>'+
    '<p><input type="search" id="artistsfilter" placeholder="Filter: name, link, note" value="'+htmlEncode(artistsadmin.filter)+'" '+
      'oninput="artistsadmin.filter = this.value; artistsrows();" /> '+
      '<select id="artistsonly" onchange="artistsadmin.only = this.value; artistsrows();">'+
      [['', 'All entries'], ['review', 'Waiting for review ('+count(artistsreview)+')'], ['nolinks', 'No links, not an alias ('+count(a => !a.aliasof && !(a.links || []).length)+')'],
       ['alias', 'Aliases ('+count(a => a.aliasof)+')'], ['notalias', 'Not an alias ('+count(a => !a.aliasof)+')'],
       ['sigs', 'With signatures ('+count(a => artistssigcount(a))+')']]
        .map(o => '<option value="'+o[0]+'"'+(artistsadmin.only == o[0] ? ' selected' : '')+'>'+o[1]+'</option>').join('')+
      '</select> '+
      (allowed ? '<input type="button" value="New entry" onclick="artistsform(null);" />' : '')+
    '</p>'+
    '<table class="fielddescstable artiststable"><thead><tr><th>Credit</th><th>Links</th><th>Note</th></tr></thead><tbody></tbody></table>'+
    '<p id="artistsmore" class="fielddescsnote"></p>'+
    '<datalist id="artistsmains">'+list.filter(a => !a.aliasof).map(a => '<option value="'+htmlEncode(a.name)+'">').join('')+'</datalist>');
  artistsrows();
  if(artistsadmin.edit !== null) { artistsform(artistsadmin.edit); }
}

// the "With signatures" count once the counts have come in
function artistsshowcount() {
  var n = artistsadmin.list.filter(a => artistssigcount(a)).length;
  $('#artistsonly option[value=sigs]').text('With signatures ('+n+')');
  if(artistsadmin.only == 'sigs') { artistsrows(); }
}

// an entry whose note says a possible match is waiting for review (ootv-tools artists/links extra.py MAYBE)
function artistsreview(a) {
  return /waiting for review/i.test(a.note || '');
}

function artistsrows() {
  var q = artistsadmin.filter.trim().toLowerCase(), only = artistsadmin.only;
  var rows = artistsadmin.list.filter(function(a) {
    if(only == 'review' && !artistsreview(a)) { return false; }
    if(only == 'nolinks' && (a.aliasof || (a.links || []).length)) { return false; }
    if(only == 'alias' && !a.aliasof) { return false; }
    if(only == 'notalias' && a.aliasof) { return false; }
    if(only == 'sigs' && !artistssigcount(a)) { return false; }
    if(!q) { return true; }
    return [a.name, a.aliasof, a.fandom, a.note].concat((a.links || []).map(l => l.url+' '+l.label))
      .some(s => s && s.toLowerCase().includes(q));
  });
  $('#artistsadmin .artiststable tbody').html(rows.slice(0, artistsshown).map(function(a) {
    var links = a.aliasof ? 'same artist as <i>'+htmlEncode(a.aliasof)+'</i>' :
      (a.links || []).map(l => htmlEncode(l.label || l.url)+(l.archived ? ' (archived)' : '')).join(', ');
    return '<tr><td><a href="" data-name="'+htmlEncode(a.name)+'" onclick="artistsform(this.getAttribute(\'data-name\')); return false">'+
      htmlEncode(a.name)+'</a></td><td>'+links+'</td><td>'+htmlEncode(a.note || '')+'</td></tr>';
  }).join(''));
  $('#artistsmore').text(rows.length > artistsshown ? 'Showing '+artistsshown+' of '+rows.length+': narrow the filter to see the rest.' :
    rows.length+' shown.');
}

// the edit form for one entry (name), or a new one (null)
function artistsform(name) {
  var a = name === null ? null : artistsadmin.byname[name];
  if(name !== null && !a) {
    // a credit with no entry yet (from the artist modal): start a new one with its name filled in
    artistsadmin.edit = null;
    artistsform(null);
    $('#artistsname').val(name);
    return;
  }
  artistsadmin.edit = name;
  var allowed = artistsallowed();
  var dis = allowed ? '' : ' disabled';
  var aliases = a ? artistsadmin.list.filter(x => x.aliasof == a.name).map(x => x.name) : [];
  var html = '<div class="artistsform">'+
    '<h4>'+(a ? htmlEncode(a.name) : 'New entry')+'</h4>'+
    (a ? '' : '<p><label>Credit <input type="text" id="artistsname" size="40" placeholder="exactly as on the printings" /></label></p>')+
    '<p><label>Same artist as <input type="text" id="artistsaliasof" size="40" list="artistsmains" value="'+htmlEncode((a && a.aliasof) || '')+'"'+dis+' /></label> '+
      '<span class="fielddescsnote">another credit\'s entry: the modal shows its links, so this one has none of its own</span></p>'+
    (aliases.length ? '<p class="fielddescsnote">Aliases of this entry: '+aliases.map(htmlEncode).join(', ')+'</p>' : '')+
    '<p><label>l5r.fandom.com page <input type="text" id="artistsfandom" size="40" value="'+htmlEncode((a && a.fandom) || '')+'"'+dis+' /></label>'+
      (a && a.fandom ? ' <a href="https://l5r.fandom.com/wiki/'+encodeURIComponent(a.fandom.replace(/ /g,'_'))+'" target="_blank" rel="noopener">open</a>' : '')+'</p>'+
    '<p><label for="artistsnote">Note</label><br><textarea id="artistsnote" class="fielddescstext" rows="2"'+dis+'>'+htmlEncode((a && a.note) || '')+'</textarea></p>'+
    '<div id="artistssigs"></div>'+
    '<table class="fielddescstable artistslinks"><thead><tr><th>Link</th><th>Label</th><th>Archived copy</th><th></th></tr></thead><tbody></tbody></table>'+
    '<p>'+(allowed ? '<input type="button" value="Add link" onclick="artistslinkrow({});" /> '+
      '<input type="button" value="Save" onclick="artistssave();" /> '+
      (a ? '<input type="button" value="Delete" onclick="artistsdelete();" /> ' : '') : '')+
      '<input type="button" value="Close" onclick="artistsadmin.edit = null; $(\'#artistsedit\').empty();" /> '+
      '<span id="artistsstatus"></span></p>'+
    (a && a.updated ? '<p class="fielddescsnote">Last changed '+htmlEncode(new Date(a.updated).toLocaleString())+'</p>' : '')+
    '</div>';
  $('#artistsedit').html(html);
  ((a && a.links) || []).forEach(artistslinkrow);
  if(a && !(a.links || []).length && allowed && !a.aliasof) { artistslinkrow({}); }
  if(a) { artistssigs(a); }
  $('#artistsedit')[0].scrollIntoView({block: 'nearest'});
}

// htmlEncode() for attribute values too: it leaves " alone, and readings often hold quotes
function artistsq(s) {
  return htmlEncode(s === undefined || s === null ? '' : String(s)).replace(/"/g, '&quot;');
}

// the entry's known signatures (oracle-all-signatures: ootv-tools artists/signatures/, Artist check
// submissions, signatures moved here); an alias's are on its main entry. Click one to edit it.
function artistssigs(a) {
  var own = a.aliasof ? (artistsadmin.byname[a.aliasof] || {name: a.aliasof}) : a;
  var from = own === a ? '' : ' (on the entry of <i>'+artistsq(own.name)+'</i>)';
  artistsadmin.sigs = null;
  artistsadmin.sig = null;
  $('#artistssigs').html('<p class="fielddescsnote">Loading the known signatures...</p>');
  artistssigapi('siglist', {artist: own.name}).then(function(r) {
    if(artistsadmin.edit !== a.name) { return; }
    var list = r.signatures || [];
    artistsadmin.sigs = {artist: own.name, path: r.path, list: list, from: from, entry: a.name};
    if(!list.length) { $('#artistssigs').html('<p class="fielddescsnote">No known signatures in the catalogue'+from+'.</p>'); return; }
    artistssigsdraw();
  }, function(e) {
    if(artistsadmin.edit !== a.name) { return; }
    $('#artistssigs').html('<p class="error">Could not load the known signatures'+from+': '+artistsq(String(artistssigerr(e)))+'</p>');
  });
}

function artistssigsdraw() {
  var g = artistsadmin.sigs;
  $('#artistssigs').html('<p><b>Known signatures</b>'+g.from+': '+g.list.length+
      (artistsallowed() ? ' <span class="fielddescsnote">(click one to edit, move, detach or delete it)</span>' : '')+'</p>'+
    '<div class="artchecksigstrip artistssigstrip">'+g.list.map((m, i) =>
      '<a href="" data-i="'+i+'" class="'+(artistsadmin.sig === m.file ? 'artistssigpicked' : '')+'" onclick="artistssigpick('+i+'); return false" '+
        'title="'+artistsq(artistssigtitle(m))+'">'+
      '<img src="'+artistsq(artistsimages+g.path+m.file)+'" alt="'+artistsq(m.title || m.file)+'" loading="lazy" /></a>').join('')+'</div>'+
    '<div id="artistssigedit"></div>');
  var i = g.list.findIndex(m => m.file === artistsadmin.sig);
  if(i >= 0) { artistssigpick(i); }
}

function artistssigtitle(m) {
  return (m.title || m.file)+(m.set ? ' ('+String(m.set).replace(/&amp;/g,'&').replace(/&ndash;/g,'–')+')' : '')+
    (m.read ? ', read as "'+m.read+'"' : '')+(m.how ? ', '+m.how : '')+(m.note ? '. '+m.note : '');
}

// the signature's card on the L5R site (the catalogue is L5R's), whatever game is open
function artistssigcard(m) {
  return m.cardid ? '<a href="'+artistsq(location.pathname+'#game='+(m.game || 'l5r')+',#cardid='+m.cardid+(m.printingid ? ',#cnprintingid='+m.printingid : ''))+
    '" target="_blank">'+artistsq(m.title || m.file)+'</a>' : artistsq(m.title || 'an uploaded picture');
}

// one signature's panel: what it is, and (with the artists permission) edit / move / detach / delete
function artistssigpick(i) {
  var g = artistsadmin.sigs, m = g.list[i];
  artistsadmin.sig = m.file;
  $('#artistssigs .artistssigstrip a').removeClass('artistssigpicked').filter('[data-i='+i+']').addClass('artistssigpicked');
  var dis = artistsallowed() ? '' : ' disabled';
  var last = (m.updatelog || [])[(m.updatelog || []).length - 1];
  var hows = ['matched', 'confirmed', 'submitted', 'review', 'spots'];
  if(m.how && !hows.includes(m.how)) { hows.push(m.how); }
  $('#artistssigedit').html('<div class="artistssigpanel" data-i="'+i+'">'+
    '<img class="artistssigbig" src="'+artistsq(artistsimages+g.path+m.file)+'" alt="signature" />'+
    '<div class="artistssigfields">'+
    '<p>'+artistssigcard(m)+(m.set ? ' <span class="fielddescsnote">'+artistsq(String(m.set).replace(/&amp;/g,'&').replace(/&ndash;/g,'–'))+'</span>' : '')+
      '<br><span class="fielddescsnote">credited: '+artistsq(m.credit || '?')+(m.by ? '; sent by '+artistsq(m.by) : '')+
      (m.approved ? ', approved by '+artistsq(m.approved) : '')+'</span></p>'+
    '<p><label>Read as <input type="text" class="artistssigread" size="20" value="'+artistsq(m.read || '')+'"'+dis+' /></label> '+
      '<label>How <select class="artistssighow"'+dis+'>'+hows.map(h => '<option'+(h == m.how ? ' selected' : '')+'>'+h+'</option>').join('')+'</select></label></p>'+
    '<p><label>Note <input type="text" class="artistssignote" size="40" value="'+artistsq(m.note || '')+'"'+dis+' /></label></p>'+
    (dis ? '' :
    '<p><input type="button" value="Save" onclick="artistssigsave()" /> '+
      '<label>Move to <input type="text" class="artistssigto" size="20" list="artistsmains" placeholder="another artist" /></label> '+
      '<input type="button" value="Move" onclick="artistssigdo(\'sigmove\')" /></p>'+
    '<p><input type="button" value="Detach" title="Take it off this artist and send it to Admin → Artist check, Signature submissions, to be given an artist" onclick="artistssigdo(\'sigdetach\')" /> '+
      '<input type="button" value="Delete" title="Not a signature (or not worth keeping): take it out of the catalogue" onclick="artistssigdo(\'sigdelete\')" /> '+
      '<input type="button" value="Close" onclick="artistsadmin.sig = null; artistssigsdraw();" /></p>')+
    '<p class="artistssigstatus"></p>'+
    (last ? '<p class="fielddescsnote">Last change: '+artistsq(last.op+(last.source ? ' ('+last.source+')' : '')+', '+(last.uname || '')+', '+
      new Date(Number(last.timestamp)).toLocaleString())+'</p>' : '')+
    '</div></div>');
}

function artistssigcurrent() {
  var g = artistsadmin.sigs, i = $('#artistssigedit .artistssigpanel').data('i');
  return {g: g, m: g.list[i], i: i};
}

function artistssigstatus(html) {
  $('#artistssigedit .artistssigstatus').html(html);
}

function artistssigsave() {
  var c = artistssigcurrent(), p = $('#artistssigedit');
  artistssigstatus('Saving...');
  artistssigapi('sigedit', {artist: c.g.artist, file: c.m.file, n: c.m.n, read: p.find('.artistssigread').val(),
                            how: p.find('.artistssighow').val(), note: p.find('.artistssignote').val()}).then(function(r) {
    c.g.list[c.i] = r.signature;
    artistssigsdraw();
    artistssigstatus(r.message == 'no changes' ? 'No changes to save.' : 'Saved.');
  }, function(e) { artistssigstatus('<span class="error">Not saved: '+artistsq(String(artistssigerr(e)))+'</span>'); });
}

// sigmove, sigdetach or sigdelete the open signature; on success it leaves this artist's strip
function artistssigdo(action) {
  var c = artistssigcurrent(), to = $.trim($('#artistssigedit .artistssigto').val());
  var what = (c.m.title || c.m.file)+' ('+c.m.file+')';
  if(action == 'sigmove' && !to) { artistssigstatus('<span class="error">Name the artist to move it to.</span>'); return; }
  if(action == 'sigdetach' && !window.confirm('Detach '+what+' from '+c.g.artist+'? It goes to Admin → Artist check, Signature submissions, to be given an artist.')) { return; }
  if(action == 'sigdelete' && !window.confirm('Delete '+what+' from the catalogue? The crop is kept aside (image trash), but it won\'t be offered for anyone.')) { return; }
  $('#artistssigedit input[type=button]').prop('disabled', true);
  artistssigstatus(action == 'sigmove' ? 'Moving...' : action == 'sigdetach' ? 'Detaching...' : 'Deleting...');
  artistssigapi(action, {artist: c.g.artist, file: c.m.file, n: c.m.n, to: to}).then(function(r) {
    c.g.list.splice(c.i, 1);
    artistsadmin.sig = null;
    if(artistsadmin.counts) {
      artistsadmin.counts[c.g.artist] = c.g.list.length;
      if(r.signature) { artistsadmin.counts[r.signature.artist] = (artistsadmin.counts[r.signature.artist] || 0) + 1; }
      artistsshowcount();
    }
    var done = action == 'sigmove' ? 'Moved '+what+' to '+r.signature.artist+'.' :
      action == 'sigdetach' ? 'Detached '+what+': it waits in Admin → Artist check, Signature submissions.' : 'Deleted '+what+'.';
    if(c.g.list.length) { artistssigsdraw(); } else { $('#artistssigs').html('<p class="fielddescsnote">No known signatures in the catalogue'+c.g.from+'.</p>'); }
    $('#artistssigs').prepend($('<p class="fielddescsnote">').text(done));
  }, function(e) {
    $('#artistssigedit input[type=button]').prop('disabled', false);
    artistssigstatus('<span class="error">Not done: '+artistsq(String(artistssigerr(e)))+'</span>');
  });
}

function artistslinkrow(l) {
  var dis = artistsallowed() ? '' : ' disabled';
  var row = $('<tr>').html(
    '<td><input type="url" class="fielddescstext artistsurl" placeholder="https://..."'+dis+' /></td>'+
    '<td><input type="text" class="fielddescstext artistslabel" placeholder="e.g. Instagram"'+dis+' /></td>'+
    '<td><input type="checkbox" class="artistsarchived" title="a Wayback Machine copy of a dead site"'+dis+' /></td>'+
    '<td>'+(dis ? '' : '<a href="" title="Remove this link" onclick="$(this).closest(\'tr\').remove(); return false">&times;</a>')+'</td>');
  row.find('.artistsurl').val(l.url || '');
  row.find('.artistslabel').val(l.label || '');
  row.find('.artistsarchived').prop('checked', !!l.archived);
  $('#artistsedit .artistslinks tbody').append(row);
}

function artistssave() {
  var name = artistsadmin.edit;
  var a = name === null ? null : artistsadmin.byname[name];
  if(!a) {
    name = $('#artistsname').val().replace(/ /g,' ').trim();
    if(!name) { $('#artistsstatus').html('<span class="error">The credit is needed.</span>'); return; }
    if(artistsadmin.byname[name]) { $('#artistsstatus').html('<span class="error">'+htmlEncode(name)+' already has an entry.</span>'); return; }
  }
  var links = [];
  $('#artistsedit .artistslinks tbody tr').each(function() {
    var url = $(this).find('.artistsurl').val().trim(), label = $(this).find('.artistslabel').val().trim();
    if(!url && !label) { return; }
    var l = {url: url, label: label};
    if($(this).find('.artistsarchived').prop('checked')) { l.archived = true; }
    links.push(l);
  });
  var data = {links: links, aliasof: $('#artistsaliasof').val().trim(), fandom: $('#artistsfandom').val().trim(), note: $('#artistsnote').val().trim()};
  $('#artistsstatus').text('Saving...');
  $.ajax({
    type: 'POST',
    url: apiuri+'/update',
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({uid: getuid(), database: 'all', operation: 'artists', action: 'put', name: name, version: a ? a.version : 0, data: data}),
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
    success: function(r) {
      artistinfo = {};
      if(r.message == 'no changes') { $('#artistsstatus').text('No changes to save.'); return; }
      artistsopen(name, (r.message == 'created' ? 'Created ' : 'Saved ')+name+'.');
    },
    error: artistsfail
  });
}

function artistsdelete() {
  var a = artistsadmin.byname[artistsadmin.edit];
  if(!a || !window.confirm('Delete the entry for '+a.name+'? The credit on the cards stays; the modal then offers the search only.')) { return; }
  $('#artistsstatus').text('Deleting...');
  $.ajax({
    type: 'POST',
    url: apiuri+'/update',
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({uid: getuid(), database: 'all', operation: 'artists', action: 'delete', name: a.name, version: a.version}),
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
    success: function() {
      artistinfo = {};
      artistsopen(null, 'Deleted '+a.name+'.');
    },
    error: artistsfail
  });
}

function artistsfail(raw) {
  var msg = (raw.responseJSON && raw.responseJSON.error) || raw.status;
  $('#artistsstatus').html('<span class="error">Not saved: '+htmlEncode(String(msg))+'</span>'+
    (raw.status == 409 ? ' Copy your changes, then <a href="" onclick="artistsopen(); return false">reload</a>.' : ''));
}
