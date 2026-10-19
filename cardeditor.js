// Card editor: one editor for a whole card (its fields, every printing, the MRP printing, new and
// deleted instances). Loaded on demand by cardeditor() in oracle.js. Every change is made in memory
// (cardedit.card); Commit turns the difference from the card as fetched (cardedit.base) into /update
// calls (docs/API.md): updateinstance, newinstance, removeinstance, then one update for the card's
// own fields and printingprimary. New instances go in before deleted ones are removed, so a new
// printingid never reuses a deleted one (lists point at printingids).
//
// Views: regular (values rendered, edited in place), html (raw strings in textareas), json (the
// whole card). New printings carry a temporary printingid ("new1", ...) until they are saved.

var cardedit = null;
// {db, cardid (null: a new card), base (as fetched; null for a new card), card (working copy),
//  printid (printing shown), view, invalid ({key: message} for per-field JSON that doesn't parse),
//  jsonerror, nextnew, running}

// card keys the editor doesn't show as fields: managed by the API, or by the printing section
var cardeditmanaged = ['cardid','printing','printingreverse','printingprimary','updatelog','@timestamp','@SequenceNumber'];

function cardeditopen(cardid,printid) {
  if(!cardid) {
    var structure = cache_thing("structuretemplate",database);
    if(!structure) {
      modal('Insert new card','<span class="error">The card structure for this game hasn\'t loaded yet. Try again in a moment.</span>');
      return;
    }
    cardeditloadorder(database).then(() => cardeditstart(database,null,null,printid));
    return;
  }
  modal('Edit card','Loading the card...');
  Promise.all([cardeditfetch(database,cardid), cardeditloadorder(database)]).then(function(r) {
    cardeditstart(database,cardid,r[0],printid);
  }).catch(function(e) {
    $('#modal-content').html('<span class="error">Could not load card '+cardid+': '+htmlEncode(cardediterr(e))+'</span>');
  });
}

// the card as stored (no updatelog), straight from the API rather than the page's cache
function cardeditfetch(db,cardid) {
  return Promise.resolve($.ajax({
    type: 'GET',
    url: apiuri+"/oracle-fetch?table="+db+"&cardid="+cardid,
    dataType: 'json',
    cache: false
  })).then(function(card) {
    card = [].concat(card)[0];
    if(!card || !card.cardid) { throw new Error('card not found'); }
    ['updatelog','@timestamp','@SequenceNumber','printingreverse'].forEach(k => delete card[k]);
    card.printing.forEach(function(p) { p.printingid = String(p.printingid); });
    return card;
  });
}

// The order and grouping of the card page (templates/template-<game>-card.html): each <dt>...</dd>
// row is a group of fields (F/C, HR/Cost/PH, Publisher and its URL), card fields before
// template-card-middle, printing fields after. Words in the row's {{...}} tags that aren't fields
// (if, join, converters) are dropped when the order is used. Never fails: no template, no order.
var cardeditorder = {};
function cardeditloadorder(db) {
  if(cardeditorder[db]) { return Promise.resolve(cardeditorder[db]); }
  return Promise.resolve($.ajax({url: 'templates/template-'+db+'-card.html?v='+ootvversion, dataType: 'text', cache: true}))
    .then(function(text) {
      var at = text.indexOf('template-card-middle');
      var parts = at >= 0 ? [text.slice(0,at), text.slice(at)] : [text, ''];
      var groups = parts.map(part => (part.match(/<dt>[\s\S]*?<\/dd>/g) || []).map(function(row) {
        var names = [];
        (row.match(/\{\{[\s\S]*?\}\}/g) || []).forEach(function(tag) {
          tag.replace(/~[\w.]+/g,' ').replace(/"[^"]*"|'[^']*'/g,' ').replace(/\.\w+/g,' ')
             .replace(/[A-Za-z_]\w*/g, function(w) { if(!names.includes(w)) { names.push(w); } return w; });
        });
        return names;
      }));
      return cardeditorder[db] = {card: groups[0], printing: groups[1]};
    })
    .catch(() => cardeditorder[db] = {card: [], printing: []});
}

function cardediterr(e) {
  return (e && e.responseJSON && e.responseJSON.error) || (e && e.responseText) || (e && e.message) || String(e);
}

function cardeditstart(db,cardid,base,printid) {
  var card;
  if(base) {
    card = JSON.parse(JSON.stringify(base));
    delete card.cardid;
  } else {
    // a new card: the game's template fields, blank, and one blank printing
    var template = cache_thing("structuretemplate",db).template;
    card = {};
    Object.keys(template).filter(k => !cardeditmanaged.includes(k)).forEach(k => card[k] = cardeditblank(template[k]));
    card.printing = [cardeditnewprinting(db,'new1')];
    card.printingprimary = 'new1';
  }
  cardedit = {db: db, cardid: cardid, base: base, card: card, view: (cardedit && cardedit.view) || 'regular',
              invalid: {}, jsonerror: null, nextnew: base ? 1 : 2, running: false};
  card.printingprimary = String(card.printingprimary);
  var ids = card.printing.map(p => p.printingid);
  cardedit.printid = ids.includes(String(printid)) ? String(printid) : (ids.includes(String(card.printingprimary)) ? String(card.printingprimary) : ids[0]);
  modal(base ? 'Edit card: '+[].concat(base.title || '')[0] : 'Insert new card','<div id="cardedit"></div>');
  $('#modal').addClass('cardeditmodal').data('guard',cardeditclose);
  cardeditrender();
}

// an empty value shaped like v: [''] for an array, '' for a string, {} for an object
function cardeditblank(v) {
  if(Array.isArray(v)) { return (v.length && v[0] !== null && typeof v[0] === 'object') ? [] : ['']; }
  if(v !== null && typeof v === 'object') { return {}; }
  return '';
}

// a blank instance with the template's printing fields (no image: upload one once it's saved)
function cardeditnewprinting(db,id) {
  var template = ((cache_thing("structuretemplate",db) || {}).template || {}).printing;
  var p = {};
  Object.keys((template && template[0]) || {set: ['']}).filter(k => !['printingid','image','imagehash'].includes(k))
    .forEach(k => p[k] = cardeditblank(template[0][k]));
  p.printingid = id;
  return p;
}

function cardeditprinting() {
  return cardedit.card.printing.find(p => p.printingid == cardedit.printid);
}

function cardeditisnew(id) {
  return !cardedit.base || !cardedit.base.printing.some(p => p.printingid == id);
}

// the fields this game uses, for Add field and the layout: the structure template, then every card in
// the page's cache. {card: {field: 'array'|'string'|'number'|'boolean'|'object'}, printing: {...},
// len: {card: {field: longest value, tags stripped}, printing: {...}}, count: values seen, same shape}
function cardeditknownfields() {
  var known = {card: {}, printing: {}, len: {card: {}, printing: {}}, count: {card: {}, printing: {}}};
  var kind = v => Array.isArray(v) ? 'array' : (v !== null && typeof v === 'object') ? 'object' : typeof v == 'number' ? 'number' : typeof v == 'boolean' ? 'boolean' : 'string';
  var note = function(scope,k,v) {
    if(!(k in known[scope])) { known[scope][k] = kind(v); }
    [].concat(v).forEach(function(x) {
      if(typeof x === 'string' || typeof x === 'number') {
        known.len[scope][k] = Math.max(known.len[scope][k] || 0, String(x).replace(/<[^>]*>/g,'').replace(/&\w+;/g,' ').length);
        known.count[scope][k] = (known.count[scope][k] || 0) + 1;
      }
    });
  };
  var add = function(card,istemplate) {
    Object.keys(card).filter(k => !cardeditmanaged.includes(k)).forEach(k => istemplate ? (known.card[k] = known.card[k] || kind(card[k])) : note('card',k,card[k]));
    [].concat(card.printing || []).forEach(function(p) {
      Object.keys(p || {}).filter(k => k != 'printingid').forEach(k => istemplate ? (known.printing[k] = known.printing[k] || kind(p[k])) : note('printing',k,p[k]));
    });
  };
  if(searchcache[cardedit.db]) { Object.values(searchcache[cardedit.db].data || {}).forEach(c => add(c,false)); }
  if(cardedit.base) { add(cardedit.base,false); }
  var structure = cache_thing("structuretemplate",cardedit.db);
  if(structure && structure.template) { add(structure.template,true); }  // its values are placeholders, so no lengths
  if(gamepermission('updateinstance') || gamepermission('update')) { known.card.needsreview = known.card.needsreview || 'array'; }
  // fields the page derives for display, not stored
  ['formattedtitlelink','setclean','rarityclean','textprinting','textversion','textdiff','updatelogformatted','listquantity','listprinting']
    .forEach(function(k) { delete known.card[k]; delete known.printing[k]; });
  return known;
}

// a field that fits beside others: numbers and short values, up to 40 characters on every card
// seen. With fewer than 10 values seen, a field searched as text (card text, flavor) counts as long.
function cardeditshort(scope,key,v,known) {
  if(typeof v === 'boolean') { return true; }
  var simple = x => x === null || ['string','number'].includes(typeof x);
  if(!(Array.isArray(v) ? v.every(simple) : simple(v))) { return false; }
  var sea = (searchables[cardedit.db] || {});
  var s = sea[key] || sea['printing.'+key];
  if((known.count[scope][key] || 0) < 10 && s && s.type == 'text') { return false; }
  var now = Math.max(0, ...[].concat(v).map(x => String(x === null ? '' : x).replace(/<[^>]*>/g,'').length));
  return Math.max(now, known.len[scope][key] || 0) <= 40;
}

// The fields in rows: needsreview first, then the card page's rows, then the rest. Fields named
// like each other stay together (every *title*, image with imagehash). A card page row of several
// fields (F/C, HR/Cost/PH) keeps its own row; short fields on their own share one, up to 4 and
// as many as fit on a line (roughly: label and values, in characters). A row with a long field
// in it puts each field on its own line (full), so the labels line up.
function cardeditrows(scope,keys,obj,known) {
  var order = (cardeditorder[cardedit.db] || {})[scope] || [];
  var families = [/title/, /^image/];
  var placed = {};
  var groups = [];
  var family = g => g.concat(...families.filter(re => g.some(k => re.test(k))).map(re => keys.filter(k => re.test(k) && !g.includes(k))));
  var take = function(g) {
    g = family(g).filter((k,i,a) => keys.includes(k) && !placed[k] && a.indexOf(k) == i);
    g.forEach(k => placed[k] = true);
    if(g.length) { groups.push(g); }
  };
  if(scope == 'card') { take(['needsreview']); }
  order.forEach(take);
  keys.forEach(k => take([k]));
  var lab = labels[cardedit.db] || {};
  var width = k => String(lab['short'+k] || lab['tag'+k] || k).length+3+
                   [].concat(obj[k]).reduce((n,x) => n+String(x === null ? '' : x).replace(/<[^>]*>/g,'').length+5, 0);
  var rows = [];
  groups.forEach(function(g) {
    var last = rows[rows.length-1];
    var short = g.every(k => cardeditshort(scope,k,obj[k],known));
    var single = short && g.length == 1 && g[0] != 'needsreview';
    if(single && last && last.single && last.keys.length < 4 && last.width+width(g[0]) <= 95) {
      last.keys = last.keys.concat(g);
      last.width += width(g[0]);
    } else {
      rows.push({keys: g, single: single, width: single ? width(g[0]) : 0, full: !short});
    }
  });
  return rows;
}

// the card page's short label (F, HR, Text), with the long one and the field's name on hover
function cardeditlabel(key) {
  var l = labels[cardedit.db] || {};
  var short = l['short'+key] || l['tag'+key] || key;
  return '<span title="'+htmlEncode((l['tag'+key] ? l['tag'+key]+': ' : '')+key)+'">'+htmlEncode(short)+'</span>';
}

// ************* rendering *************

function cardeditrender() {
  var c = cardedit.card;
  var html = '<div class="cardedittop">'+
    '<span class="cardeditviews">'+[['regular','Regular'],['html','HTML'],['json','JSON']].map(v =>
      '<label><input type="radio" name="cardeditview" value="'+v[0]+'"'+(cardedit.view == v[0] ? ' checked' : '')+
      ' onchange="cardeditview(this.value);" /> '+v[1]+'</label>').join(' ')+'</span>'+
    (cardedit.cardid ? '<span class="button gray buttonsmall cardeditdelcard" onclick="cardeditdeletecard();">Delete card<span class="iiconic inegative"><svg class="feather"><use xlink:href="res/feather-sprite.svg#trash-2"></svg></span></span>' : '')+
    '</div>';
  if(cardedit.view == 'json') {
    html += '<textarea id="cardeditjson" rows="40">'+htmlEncode(JSON.stringify(c,null,2))+'</textarea>'+
      '<div id="cardeditjsonerror" class="error"></div>';
  } else {
    var known = cardeditknownfields();
    html += '<fieldset class="cardeditsection"><legend>Card details</legend>'+
      cardeditfields('card',c,known)+'</fieldset>';
    html += '<fieldset class="cardeditsection"><legend>Printing details</legend>'+cardeditprintings();
    var p = cardeditprinting();
    if(p) {
      var isnew = cardeditisnew(p.printingid);
      html += '<div class="cardeditprintingbar"><b>'+(isnew ? 'New instance' : 'Instance '+htmlEncode(p.printingid))+'</b>'+
        (p.printingid == c.printingprimary ? ' <span class="cardeditmrp">MRP</span>'
          : ' <span class="button gray buttonsmall" onclick="cardeditmrp();">Make MRP<span class="iiconic iyellow"><svg class="feather"><use xlink:href="res/feather-sprite.svg#award"></svg></span></span>')+
        ' <span class="button gray buttonsmall" onclick="cardeditdeleteprinting();">Delete instance<span class="iiconic inegative"><svg class="feather"><use xlink:href="res/feather-sprite.svg#file-minus"></svg></span></span>'+
        '</div>';
      html += cardeditimages(p,isnew);
      html += cardeditfields('printing',p,known);
    }
    html += '</fieldset>';
  }
  html += '<div class="cardeditfoot"><span id="cardeditsummary"></span> '+
    '<input type="button" id="cardeditcommit" value="Commit" onclick="cardeditcommit();" /> '+
    '<input type="button" value="Close" onclick="modalclose();" />'+
    '<div id="cardeditstatus"></div></div>';
  $('#cardedit').html(html);
  if(cardedit.view == 'json' && cardedit.jsonerror) { $('#cardeditjsonerror').text(cardedit.jsonerror); }
  cardeditsummary();
}

// the fields in rows (cardeditrows), each a label with its x, then its values
function cardeditfields(scope,obj,known) {
  var keys = Object.keys(obj).filter(k => scope == 'card' ? !cardeditmanaged.includes(k) : k != 'printingid');
  var html = '<div class="cardeditfields">';
  cardeditrows(scope,keys,obj,known).forEach(function(row) {
    html += '<div class="cardeditrow">'+row.keys.map(key =>
      '<div class="cardeditfield '+(cardeditshort(scope,key,obj[key],known) ? 'cardeditshort' : 'cardeditlong')+(row.full ? ' cardeditfull' : '')+'" data-scope="'+scope+'" data-field="'+htmlEncode(key)+'">'+
      '<span class="cardeditlabel">'+cardeditlabel(key)+'<span class="cardeditx" title="Remove this field" onclick="cardeditremovefield(this);">&#x2715;</span></span>'+
      '<span class="cardeditvals">'+cardeditvalues(scope,key,obj[key],cardeditshort(scope,key,obj[key],known))+'</span></div>').join('')+
      '</div>';
  });
  var missing = Object.keys(known[scope]).filter(k => !keys.includes(k)).sort();
  html += '<div class="cardeditaddrow"><select class="cardeditaddfield" onchange="$(this).next().toggle(this.value == \'\');">'+
    missing.map(k => '<option value="'+htmlEncode(k)+'" data-kind="'+known[scope][k]+'">'+htmlEncode(k)+'</option>').join('')+
    '<option value="">Other...</option></select>'+
    '<input type="text" class="cardeditaddname" placeholder="field name" size="14"'+(missing.length ? ' style="display:none"' : '')+' /> '+
    '<span class="button gray buttonsmall" onclick="cardeditaddfield(this,\''+scope+'\');">Add field<span class="iiconic ipositive"><svg class="feather"><use xlink:href="res/feather-sprite.svg#plus-circle"></svg></span></span>'+
    '</div></div>';
  return html;
}

// A list of strings/numbers: one editor per value with an x, + after the last one. A single
// string or number: one editor. true/false: a checkbox. Anything else (image, objects): JSON.
function cardeditvalues(scope,key,v,short) {
  var simple = x => x === null || ['string','number'].includes(typeof x);
  var plus = '<span class="cardeditaddvalue" title="Add a value" onclick="cardeditaddvalue(this);">+</span>';
  if(Array.isArray(v) && v.every(simple)) {
    if(!v.length) { return plus; }
    return v.map((x,i) => '<span class="cardeditvalue">'+cardediteditor(x,i,short)+
        '<span class="cardeditx" title="Remove this value" onclick="cardeditremovevalue(this,'+i+');">&#x2715;</span>'+
        (i == v.length-1 ? plus : '')+'</span>').join('');
  }
  if(simple(v)) {
    return '<span class="cardeditvalue">'+cardediteditor(v,-1,short)+'</span>';
  }
  if(typeof v === 'boolean') {
    return '<label class="cardeditvalue"><input type="checkbox" class="cardeditbool"'+(v ? ' checked' : '')+' onchange="cardeditbool(this);" /> '+v+'</label>';
  }
  var bad = cardedit.invalid[scope+'/'+key];
  return '<span class="cardeditvalue"><textarea class="cardeditjsonfield'+(bad ? ' cardeditbad' : '')+'" rows="'+Math.min(12,JSON.stringify(v,null,1).split('\n').length)+'"'+
    ' onchange="cardeditjsonfield(this);">'+htmlEncode(bad ? bad.text : JSON.stringify(v,null,1))+'</textarea></span>'+
    (bad ? '<div class="error">'+htmlEncode(bad.message)+'</div>' : '');
}

function cardediteditor(x,i,short) {
  var s = (x === null || x === undefined) ? '' : String(x);
  if(cardedit.view == 'html') {
    if(short) {
      return '<input type="text" class="cardeditval" data-i="'+i+'" size="'+Math.max(3,s.length+1)+'" value="'+htmlEncode(s).replace(/"/g,'&quot;')+'" />';
    }
    var rows = Math.min(10, Math.max(1, s.split('\n').length, Math.ceil(s.length/70)));
    return '<textarea class="cardeditval" data-i="'+i+'" rows="'+rows+'">'+htmlEncode(s)+'</textarea>';
  }
  return '<div class="cardeditval" contenteditable="true" data-i="'+i+'">'+s+'</div>';
}

// Versions, like the card page's: (id) set/rarity, * on the MRP one; new instances last
function cardeditprintings() {
  var clean = x => [].concat(x || [''])[0];
  var strip = s => String(s === undefined || s === null ? '' : s).replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ');
  var c = cardedit.card;
  var saved = templatesortprintings(c.printing.filter(p => !cardeditisnew(p.printingid)));
  var list = saved.concat(c.printing.filter(p => cardeditisnew(p.printingid)));
  var changed = cardeditchangedprintings();
  var html = '<div class="cardeditversions">'+list.map(p =>
    '<span class="printinglink gray button buttonsmall'+(p.printingid == cardedit.printid ? ' cardeditselected' : '')+'" data-id="'+p.printingid+'"'+
    ' onclick="cardeditselect(\''+p.printingid+'\');">('+(cardeditisnew(p.printingid) ? 'new' : htmlEncode(p.printingid))+') '+
    htmlEncode(strip(clean(p.set)))+'/'+htmlEncode(strip(clean(p.rarity)))+(p.printingid == c.printingprimary ? ' *' : '')+
    '<span class="cardeditdot" title="Changed">'+(changed.includes(p.printingid) ? ' &bull;' : '')+'</span></span>').join(' ')+
    ' <span class="button gray buttonsmall" onclick="cardeditnewinstance();">New instance<span class="iiconic ipositive"><svg class="feather"><use xlink:href="res/feather-sprite.svg#file-plus"></svg></span></span></div>';
  var deleted = cardedit.base ? cardedit.base.printing.filter(p => !c.printing.some(q => q.printingid == p.printingid)) : [];
  if(deleted.length) {
    html += '<div class="cardeditdeleted">To be deleted: '+deleted.map(p => '('+htmlEncode(p.printingid)+') '+
      htmlEncode(strip(clean(p.set)))+'/'+htmlEncode(strip(clean(p.rarity)))+
      ' <a href="" onclick="cardeditundelete(\''+p.printingid+'\'); return false;">undo</a>').join(', ')+'</div>';
  }
  return html;
}

// the printing's images, and the upload form (uploadimagetrigger in oracle.js) once it's saved
function cardeditimages(p,isnew) {
  var html = '';
  if(p.image && p.image.length && typeof p.imagehash === 'string') {
    html += '<div class="cardeditimagelist">'+p.image.map(e => '<img src="'+dbinfo[cardedit.db].imageuri+p.imagehash+'/'+(e.select || e.details)+'" />').join(' ')+'</div>';
  }
  if(isnew) {
    return html+'<div class="cardeditnote">Commit the new instance before uploading its image.</div>';
  }
  var up = imageuploaddefaults(cardedit.cardid,p.printingid,p);
  return html+'<details class="cardeditupload"><summary>Upload image</summary><fieldset id="editimage">'+
    '<input type="file" id="editimagefile" accept="image/png,image/jpeg" /><br />'+
    'Directory <input type="text" id="editimagehash" size="12" value="'+htmlEncode(up.imagehash)+'"'+(up.locked ? ' readonly title="All images of an instance share its directory"' : '')+' /> '+
    'File name <input type="text" id="editimagestem" size="16" value="'+htmlEncode(up.stem)+'" />_master / _details / _select '+
    '<label><input type="checkbox" id="editimageoverwrite" /> Replace existing files</label><br />'+
    '<input type="button" id="editimagebutton" value="Upload image" onclick="uploadimagetrigger();" />'+
    '<div id="editimagestatus"></div><div id="editimagepreview"></div></fieldset></details>';
}

// ************* editing (all in memory) *************

function cardeditobj(scope) {
  return scope == 'card' ? cardedit.card : cardeditprinting();
}

// typing in a value: store it without redrawing, so the cursor stays put
$(document).on('input', '#cardedit .cardeditval', function() {
  var row = $(this).closest('.cardeditfield');
  var obj = cardeditobj(row.data('scope'));
  var key = row.attr('data-field');
  var i = parseInt($(this).data('i'));
  var old = i >= 0 ? obj[key][i] : obj[key];
  var v = this.isContentEditable ? this.innerHTML : this.value;
  if(this.tagName == 'INPUT') { this.size = Math.max(3,v.length+1); }
  if(cardedit.view != 'html' && v == '<br>') { v = ''; } // a contenteditable emptied by the browser
  if(typeof old === 'number' && /^-?\d+(\.\d+)?$/.test(v.trim())) { v = Number(v); }
  if(i >= 0) { obj[key][i] = v; } else { obj[key] = v; }
  cardeditsummary();
});

// a field whose value is JSON (image, objects): keep the last value that parsed
function cardeditjsonfield(el) {
  var row = $(el).closest('.cardeditfield');
  var key = row.attr('data-field');
  var id = row.data('scope')+'/'+key;
  try {
    cardeditobj(row.data('scope'))[key] = JSON.parse(el.value);
    delete cardedit.invalid[id];
  } catch(e) {
    cardedit.invalid[id] = {text: el.value, message: 'Not valid JSON, so not changed: '+e.message};
  }
  cardeditrender();
}

function cardeditbool(el) {
  var row = $(el).closest('.cardeditfield');
  cardeditobj(row.data('scope'))[row.attr('data-field')] = el.checked;
  cardeditrender();
}

function cardeditaddvalue(el) {
  var row = $(el).closest('.cardeditfield');
  var obj = cardeditobj(row.data('scope'));
  obj[row.attr('data-field')].push('');
  cardeditrender();
  $('#cardedit .cardeditfield[data-scope="'+row.data('scope')+'"][data-field="'+row.attr('data-field')+'"] .cardeditval').last().focus();
}

function cardeditremovevalue(el,i) {
  var row = $(el).closest('.cardeditfield');
  cardeditobj(row.data('scope'))[row.attr('data-field')].splice(i,1);
  cardeditrender();
}

function cardeditremovefield(el) {
  var row = $(el).closest('.cardeditfield');
  delete cardeditobj(row.data('scope'))[row.attr('data-field')];
  delete cardedit.invalid[row.data('scope')+'/'+row.attr('data-field')];
  cardeditrender();
}

function cardeditaddfield(el,scope) {
  var th = $(el).closest('.cardeditaddrow');
  var sel = th.find('.cardeditaddfield');
  var key = sel.val() || th.find('.cardeditaddname').val().trim();
  var kind = sel.val() ? sel.find('option:selected').data('kind') : 'array';
  var obj = cardeditobj(scope);
  if(!key) { return; }
  if(!/^[A-Za-z0-9_.@-]+$/.test(key)) { cardeditstatus('Field names are letters, digits, _ . @ or - only.',1); return; }
  if(key in obj || (scope == 'card' ? cardeditmanaged.includes(key) : key == 'printingid')) { cardeditstatus(htmlEncode(key)+' is already there, or is managed by the editor.',1); return; }
  obj[key] = kind == 'string' || kind == 'number' ? '' : kind == 'boolean' ? true : kind == 'object' ? {} : [''];
  cardeditrender();
  $('#cardedit .cardeditfield[data-scope="'+scope+'"][data-field="'+key+'"] .cardeditval').first().focus();
}

function cardeditselect(id) {
  cardedit.printid = id;
  cardeditrender();
}

function cardeditmrp() {
  cardedit.card.printingprimary = cardedit.printid;
  cardeditrender();
}

function cardeditnewinstance() {
  var id = 'new'+(cardedit.nextnew++);
  cardedit.card.printing.push(cardeditnewprinting(cardedit.db,id));
  cardedit.printid = id;
  cardeditrender();
}

function cardeditdeleteprinting() {
  var c = cardedit.card;
  var p = cardeditprinting();
  if(c.printing.length < 2) { cardeditstatus('A card needs at least one instance. Delete the card instead.',1); return; }
  var what = cardeditisnew(p.printingid) ? 'this new instance' : 'instance '+htmlEncode(p.printingid)+
      ' ('+[].concat(p.set || '').join(', ')+' / '+[].concat(p.rarity || '').join(', ')+')';
  cardeditconfirm('Delete instance','Delete '+what+'?'+(cardeditisnew(p.printingid) ? '' : ' It is only removed when you commit.'), function() {
    c.printing = c.printing.filter(q => q.printingid != p.printingid);
    if(c.printingprimary == p.printingid) { c.printingprimary = c.printing[0].printingid; }
    cardedit.printid = c.printingprimary;
    cardeditrender();
  });
}

function cardeditundelete(id) {
  var p = cardedit.base.printing.find(q => q.printingid == id);
  cardedit.card.printing.push(JSON.parse(JSON.stringify(p)));
  cardedit.printid = id;
  cardeditrender();
}

function cardeditdeletecard() {
  var title = [].concat(cardedit.base.title || '')[0];
  cardeditconfirm('Delete card','Delete <b>'+title+'</b> (card '+cardedit.cardid+') and all its instances? This happens right away, not on commit.', function() {
    var cardid = cardedit.cardid;
    cardedit = null;
    $('#modal').removeData('guard');
    deletecardtrigger(database,cardid,null);
  });
}

function cardeditview(view) {
  if(cardedit.view == 'json' && !cardeditreadjson()) {
    $('#cardedit input[name=cardeditview][value=json]').prop('checked',true);
    return;
  }
  cardedit.view = view;
  cardeditrender();
}

// JSON view → cardedit.card. Printings whose printingid the card doesn't have yet are new ones.
function cardeditreadjson() {
  var c;
  try {
    c = JSON.parse($('#cardeditjson').val());
    if(!c || typeof c !== 'object' || Array.isArray(c)) { throw new Error('the card must be a JSON object'); }
    if(!Array.isArray(c.printing) || !c.printing.length || c.printing.some(p => !p || typeof p !== 'object' || Array.isArray(p))) {
      throw new Error('printing must be a list of at least one instance (objects)');
    }
  } catch(e) {
    cardedit.jsonerror = 'Not changed: '+e.message;
    $('#cardeditjsonerror').text(cardedit.jsonerror);
    return false;
  }
  var seen = {};
  c.printing.forEach(function(p) {
    var id = (p.printingid === undefined || p.printingid === null) ? '' : String(p.printingid);
    if(!id || seen[id] || (cardeditisnew(id) && !/^new\d+$/.test(id))) {
      var newid = 'new'+(cardedit.nextnew++);
      if(String(c.printingprimary) == id && !seen[id]) { c.printingprimary = newid; }
      id = newid;
    }
    p.printingid = id;
    seen[id] = true;
  });
  c.printingprimary = String(c.printingprimary);
  if(!seen[c.printingprimary]) { c.printingprimary = c.printing[0].printingid; }
  ['cardid','updatelog','printingreverse','@timestamp','@SequenceNumber'].forEach(k => delete c[k]);
  cardedit.card = c;
  cardedit.jsonerror = null;
  if(!seen[cardedit.printid]) { cardedit.printid = c.printingprimary; }
  return true;
}

// ************* changes and commit *************

// blank values left in lists are dropped; a field that ends up empty stays only if the card already had it
function cardeditclean(obj,baseobj) {
  var out = {};
  Object.keys(obj).forEach(function(k) {
    var v = obj[k];
    var had = !!baseobj && (k in baseobj);
    if(Array.isArray(v)) {
      v = v.filter(x => !(typeof x === 'string' && x.trim() === '') && x !== null);
      if(!v.length && !had) { return; }
    } else if(typeof v === 'string' && v.trim() === '' && !had) {
      return;
    }
    out[k] = v;
  });
  return out;
}

// key → new value (null: remove it), and what is being removed, between two objects
function cardeditdiff(newobj,oldobj,skip,removed,where) {
  var change = {};
  Object.keys(newobj).filter(k => !skip.includes(k)).forEach(function(k) {
    if(!_.isEqual(newobj[k],oldobj[k])) {
      change[k] = newobj[k];
      // a list that got shorter lost values (a value edited in place isn't a removal)
      var now = [].concat(newobj[k]);
      if(Array.isArray(oldobj[k]) && now.length < oldobj[k].length) {
        var gone = oldobj[k].filter(x => !_.some(now, y => _.isEqual(x,y))).slice(0, oldobj[k].length-now.length);
        gone.forEach(x => removed.push(where+k+': value '+(typeof x === 'object' ? JSON.stringify(x) : '"'+x+'"')));
      }
    }
  });
  Object.keys(oldobj).filter(k => !skip.includes(k) && !(k in newobj)).forEach(function(k) {
    change[k] = null;
    removed.push(where+'field '+k);
  });
  return change;
}

function cardeditchangedprintings() {
  if(!cardedit.base) { return []; }
  return cardedit.card.printing.filter(function(p) {
    var b = cardedit.base.printing.find(q => q.printingid == p.printingid);
    return !b || !_.isEqual(cardeditclean(p,b),b);
  }).map(p => p.printingid);
}

// the /update calls Commit would make: {steps, removed, errors}
function cardeditplan() {
  var c = cardedit.card, base = cardedit.base;
  var plan = {steps: [], removed: [], errors: []};
  Object.values(cardedit.invalid).length && plan.errors.push('A field\'s JSON doesn\'t parse (marked red).');
  var nonempty = v => [].concat(v === undefined ? [] : v).some(x => String(x).trim() !== '');
  var card = cardeditclean(Object.fromEntries(Object.entries(c).filter(e => !cardeditmanaged.includes(e[0]))),
                           base ? Object.fromEntries(Object.entries(base).filter(e => !cardeditmanaged.includes(e[0]))) : null);
  if(!nonempty(card.title)) { plan.errors.push('The card needs a title.'); }
  if(!nonempty(card.type)) { plan.errors.push('The card needs a type.'); }
  var printings = c.printing.map(function(p) {
    var b = base && base.printing.find(q => q.printingid == p.printingid);
    var clean = cardeditclean(p,b);
    clean.printingid = p.printingid;
    if(!nonempty(clean.set)) { plan.errors.push('Every instance needs a set ('+(b ? 'instance '+p.printingid : 'a new instance')+' has none).'); }
    return clean;
  });

  if(!base) {
    // a new card: one "new" call, with printingids 1, 2, ...
    var ids = {};
    printings.forEach((p,i) => ids[p.printingid] = String(i+1));
    var data = Object.assign({}, card, {
      printing: printings.map(p => Object.assign({}, p, {printingid: ids[p.printingid]})),
      printingprimary: ids[c.printingprimary] || '1'
    });
    plan.steps.push({operation: 'new', data: [data], label: 'add the card'});
    return plan;
  }

  printings.forEach(function(p) {
    var b = base.printing.find(q => q.printingid == p.printingid);
    if(!b) { return; }
    var change = cardeditdiff(p,b,['printingid'],plan.removed,'instance '+p.printingid+': ');
    if(Object.keys(change).length) {
      plan.steps.push({operation: 'updateinstance', printingid: p.printingid, data: change, label: 'update instance '+p.printingid});
    }
  });
  printings.filter(p => cardeditisnew(p.printingid)).forEach(function(p) {
    var data = Object.assign({}, p);
    delete data.printingid;
    plan.steps.push({operation: 'newinstance', data: data, tempid: p.printingid,
                     updateprintingprimary: c.printingprimary == p.printingid, label: 'add a new instance ('+[].concat(p.set)[0]+')'});
  });
  base.printing.filter(b => !c.printing.some(p => p.printingid == b.printingid)).forEach(function(b) {
    plan.removed.push('instance '+b.printingid+' ('+[].concat(b.set || '').join(', ')+' / '+[].concat(b.rarity || '').join(', ')+')');
    plan.steps.push({operation: 'removeinstance', printingid: b.printingid, data: {remove: true}, label: 'delete instance '+b.printingid});
  });
  var basecard = Object.fromEntries(Object.entries(base).filter(e => !cardeditmanaged.includes(e[0])));
  var change = cardeditdiff(card,basecard,[],plan.removed,'');
  // printingprimary goes last (cardeditrun fills it in). A new instance that is the MRP sets it as
  // it's added (updateprintingprimary); a saved one that isn't the MRP yet needs it here, also when
  // the old MRP is deleted (/update would fall back to printingid-1).
  var target = String(c.printingprimary);
  if(Object.keys(change).length || (!cardeditisnew(target) && target != String(base.printingprimary))) {
    plan.steps.push({operation: 'update', data: change, primary: String(c.printingprimary), label: 'update the card'});
  }
  return plan;
}

function cardeditsummary() {
  if(!cardedit || cardedit.view == 'json') { $('#cardeditsummary').text(''); return; }
  var plan = cardeditplan();
  var n = plan.steps.length;
  $('#cardeditsummary').html(n ? n+' change'+(n > 1 ? 's' : '')+' to save'+(plan.removed.length ? ', removing '+plan.removed.length+' thing'+(plan.removed.length > 1 ? 's' : '') : '')
                               : 'No changes');
  var changed = cardeditchangedprintings();
  $('#cardedit .cardeditversions .printinglink').each(function() {
    $(this).find('.cardeditdot').html(changed.includes(String($(this).data('id'))) ? ' &bull;' : '');
  });
}

function cardeditstatus(msg,err) {
  $('#cardeditstatus').html(msg ? '<span'+(err ? ' class="error"' : '')+'>'+msg+'</span>' : '');
}

function cardeditcommit() {
  if(cardedit.running) { return; }
  if(cardedit.view == 'json' && !cardeditreadjson()) { return; }
  var plan = cardeditplan();
  if(plan.errors.length) { cardeditstatus(plan.errors.map(htmlEncode).join('<br />'),1); return; }
  if(!plan.steps.length) { cardeditstatus('No changes to save.'); return; }
  if(plan.removed.length) {
    cardeditconfirm('Remove these?','Committing removes:<ul>'+plan.removed.map(r => '<li>'+htmlEncode(r)+'</li>').join('')+'</ul>Go ahead?',
                    () => cardeditrun(plan));
  } else {
    cardeditrun(plan);
  }
}

// send the calls one at a time; stop at the first error
function cardeditrun(plan) {
  cardedit.running = true;
  $('#cardeditcommit').prop('disabled',true);
  var done = [];
  var log = function(extra,err) {
    cardeditstatus('<ul class="cardeditlog">'+done.map(d => '<li>&#x2713; '+htmlEncode(d)+'</li>').join('')+(extra ? '<li>'+extra+'</li>' : '')+'</ul>',err);
  };
  var post = function(step,extra) {
    return Promise.resolve($.ajax({
      type: "POST",
      url: apiuri+"/update",
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(Object.assign({"uid": getuid(), "database": cardedit.db, "cardid": cardedit.cardid, "operation": step.operation, "data": step.data}, extra)),
      beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());}
    }));
  };
  var newids = {};   // temporary printingid → the one the API gave it
  var primary = cardedit.base ? String(cardedit.base.printingprimary) : null;  // printingprimary as the API will have it
  var chain;
  if(cardedit.base) {
    // someone else may have saved this card since it was opened
    log('Checking the card hasn\'t changed since it was opened...');
    chain = cardeditfetch(cardedit.db,cardedit.cardid).then(function(live) {
      if(!_.isEqual(live,cardedit.base)) {
        throw new Error('This card was changed by someone else after you opened it, so nothing was saved. Your edits are still here: '+
                        'copy what you need from the JSON view, then close and reopen the editor.');
      }
    });
  } else {
    chain = Promise.resolve();
  }
  plan.steps.forEach(function(step) {
    chain = chain.then(function() {
      log('Sending: '+htmlEncode(step.label)+'...');
      var extra = {};
      if(step.printingid) { extra.printingid = step.printingid; }
      if(step.operation == 'new') { extra.cardid = undefined; }  // JSON.stringify leaves it out
      if(step.operation == 'newinstance' && step.updateprintingprimary) { extra.updateprintingprimary = true; }
      if(step.operation == 'update') {
        var want = newids[step.primary] || step.primary;
        if(want != primary) { step.data = Object.assign({}, step.data, {printingprimary: want}); }
        if(!Object.keys(step.data).length) { return; }
      }
      return post(step,extra).then(function(ret) {
        if(step.operation == 'newinstance') {
          newids[step.tempid] = String(ret.olddata.printingid);
          if(step.updateprintingprimary) { primary = newids[step.tempid]; }
        }
        if(step.operation == 'removeinstance' && step.printingid == primary) {
          primary = String(parseInt(step.printingid)-1);  // what /update falls back to; the last step puts it right
        }
        if(step.operation == 'new') {
          cardedit.cardid = ret.cardids[0];
        }
        done.push(step.label);
      });
    });
  });
  chain.then(function() {
    log('Saved. Reloading the card...');
    var show = newids[cardedit.printid] || (cardedit.printid.startsWith('new') ? null : cardedit.printid);
    var cardid = cardedit.cardid;
    cardedit = null;
    $('#modal').removeData('guard');
    cache_card_remove(cardid);
    cardfetch(cardid,show,$('#lastsearchquery').val(),nomodal);
  }).catch(function(e) {
    cardedit.running = false;
    $('#cardeditcommit').prop('disabled',false);
    log('<span class="error">'+(done.length ? 'Stopped: ' : '')+htmlEncode(cardediterr(e))+'</span>'+
        (done.length ? '<br />The steps ticked above were saved; the rest weren\'t. Close and reopen the editor to see the card as it is now.' : ''),
        false);
  });
}

// ************* confirm and close *************

// a Yes/No box over the editor (modalconfirm would replace the editor)
function cardeditconfirm(title,html,yes) {
  $('#cardeditconfirm-title').html(title);
  $('#cardeditconfirm-content').html(html);
  $('#cardeditconfirm-yes').off('click').on('click', function() { $('#cardeditconfirm').hide(); yes(); });
  $('#cardeditconfirm').show();
}

// the modal's guard: closing with unsaved changes asks first. true: close now.
function cardeditclose() {
  if(!cardedit) { return true; }
  if(cardedit.running) { return false; }
  if(cardedit.view == 'json') {
    // whatever is in the box counts as an edit
    var base = JSON.stringify(cardedit.card,null,2);
    if($('#cardeditjson').val() == base) { cardedit = null; return true; }
  } else if(!cardeditplan().steps.length && !Object.keys(cardedit.invalid).length) {
    cardedit = null;
    return true;
  }
  cardeditconfirm('Discard changes?','This card has changes that haven\'t been committed. Close and lose them?', function() {
    cardedit = null;
    $('#modal').removeData('guard');
    nomodal();
  });
  return false;
}

window.cardeditloaded = true;
