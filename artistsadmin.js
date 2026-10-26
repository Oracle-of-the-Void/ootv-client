// Admin → Artists: the entries of oracle-all-artists (one per artist credit, shared by every game) that
// the card page's artist modal shows. Loaded on first use by loadartistsadmin() in oracle.js. Read with
// GET /artist?all=1, saved with POST /update operation 'artists' (ootv-search lib/artists.js). Guide:
// docs/admin/artists.md.
window.artistsadminloaded = true;
var artistsadmin = {list: [], byname: {}, filter: '', only: '', edit: null};
const artistsshown = 200;   // rows drawn at once; the filter narrows the rest
const artistsimages = 'https://images.oracleofthevoid.com/';   // + signatures.path + index.json / a file

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
       ['sigs', 'With signatures ('+count(a => a.signatures)+')']]
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
    if(only == 'sigs' && !a.signatures) { return false; }
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

// the entry's known signatures (the catalogue: index.json in signatures.path on the images site, written by
// ootv-tools artists/signatures/ and Artist check submissions); an alias's are on its main entry
function artistssigs(a) {
  var main = a.aliasof && artistsadmin.byname[a.aliasof];
  var own = a.signatures ? a : main && main.signatures ? main : null;
  if(!own) { $('#artistssigs').html('<p class="fielddescsnote">No known signatures in the catalogue.</p>'); return; }
  var from = own === a ? '' : ' (on the entry of <i>'+htmlEncode(own.name)+'</i>)';
  $('#artistssigs').html('<p class="fielddescsnote">Loading the known signatures...</p>');
  $.ajax({url: artistsimages+own.signatures.path+'index.json', dataType: 'json', cache: false, timeout: 30000})
    .done(function(list) {
      if(artistsadmin.edit !== a.name) { return; }
      list = list || [];
      // the catalogue is L5R's: link each to its card on the L5R site whatever game is open
      $('#artistssigs').html('<p><b>Known signatures</b>'+from+': '+list.length+'</p>'+
        '<div class="artchecksigstrip artistssigstrip">'+list.map(m =>
          '<a href="'+htmlEncode(location.pathname+'#game=l5r,#cardid='+m.cardid+(m.printingid ? ',#cnprintingid='+m.printingid : ''))+'" target="_blank" '+
            'title="'+htmlEncode(m.title+' ('+String(m.set || '').replace(/&amp;/g,'&').replace(/&ndash;/g,'–')+')'+
              (m.read ? ', read as "'+m.read+'"' : '')+(m.how ? ', '+m.how : ''))+'">'+
          '<img src="'+htmlEncode(artistsimages+own.signatures.path+m.file)+'" alt="'+htmlEncode(m.title)+'" loading="lazy" /></a>').join('')+'</div>');
    })
    .fail(function(raw) {
      if(artistsadmin.edit !== a.name) { return; }
      $('#artistssigs').html('<p class="error">Could not load the known signatures'+from+': '+raw.status+'</p>');
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
