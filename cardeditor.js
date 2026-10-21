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
// printing keys made by the art vector job (ootv-claude ART-MATCHING.md): kept out of the editor's copies
// of the card, so a save never sends them and the API's merge leaves the stored values alone
var cardeditartfields = ['artvec','artmodel','artimage','arthub','artvector'];

function cardeditopen(cardid,printid) {
  if(!cardid) {
    var structure = cache_thing("structuretemplate",database);
    if(!structure) {
      modal('Insert new card','<span class="error">The card structure for this game hasn\'t loaded yet. Try again in a moment.</span>');
      return;
    }
    Promise.all([cardeditloadorder(database), fielddescsload(database)]).then(() => cardeditstart(database,null,null,printid));
    return;
  }
  modal('Edit card','Loading the card...');
  Promise.all([cardeditfetch(database,cardid), cardeditloadorder(database), fielddescsload(database)]).then(function(r) {
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
    card.printing.forEach(function(p) { p.printingid = String(p.printingid); cardeditartfields.forEach(k => delete p[k]); });
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
  $('#cardeditzoom').remove();
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
      Object.keys(p || {}).filter(k => k != 'printingid' && !cardeditartfields.includes(k)).forEach(k => istemplate ? (known.printing[k] = known.printing[k] || kind(p[k])) : note('printing',k,p[k]));
    });
  };
  if(searchcache[cardedit.db]) { Object.values(searchcache[cardedit.db].data || {}).forEach(c => add(c,false)); }
  if(cardedit.base) { add(cardedit.base,false); }
  var structure = cache_thing("structuretemplate",cardedit.db);
  if(structure && structure.template) { add(structure.template,true); }  // its values are placeholders, so no lengths
  if(gamepermission('updateinstance') || gamepermission('update')) { known.card.needsreview = known.card.needsreview || 'array'; known.card.ruling = known.card.ruling || 'array'; }
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

// the card page's short label (F, HR, Text), with the long one, the field's name and its
// description (Admin → Field descriptions, fielddesc in oracle.js) on hover
function cardeditlabel(scope,key) {
  var l = labels[cardedit.db] || {};
  var short = l['short'+key] || l['tag'+key] || key;
  var desc = fielddesc(cardedit.db,scope,key);
  return '<span'+(desc ? ' class="cardeditdesc"' : '')+' title="'+htmlEncode((l['tag'+key] ? l['tag'+key]+': ' : '')+key+(desc ? '\n\n'+desc : '')).replace(/"/g,'&quot;')+'">'+htmlEncode(short)+'</span>';
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
    '<input type="button" value="Reset" title="Undo every change since the editor opened" onclick="cardeditreset();" /> '+
    '<input type="button" value="Close" onclick="modalclose();" />'+
    '<div id="cardeditstatus"></div></div>';
  $('#cardedit').html(html);
  cardeditzoomfollow();
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
      '<span class="cardeditlabel">'+cardeditlabel(scope,key)+'<span class="cardeditx" title="Remove this field" onclick="cardeditremovefield(this);">&#x2715;</span></span>'+
      '<span class="cardeditvals">'+cardeditvalues(scope,key,obj[key],cardeditshort(scope,key,obj[key],known))+'</span></div>').join('')+
      '</div>';
  });
  var missing = Object.keys(known[scope]).filter(k => !keys.includes(k)).sort();
  html += '<div class="cardeditaddrow"><select class="cardeditaddfield" onchange="$(this).next().toggle(this.value == \'\'); $(this).siblings(\'.cardeditadddesc\').text(fielddesc(cardedit.db,\''+scope+'\',this.value));">'+
    missing.map(k => '<option value="'+htmlEncode(k)+'" data-kind="'+known[scope][k]+'" title="'+htmlEncode(fielddesc(cardedit.db,scope,k)).replace(/"/g,'&quot;')+'">'+htmlEncode(k)+'</option>').join('')+
    '<option value="">Other...</option></select>'+
    '<input type="text" class="cardeditaddname" placeholder="field name" size="14"'+(missing.length ? ' style="display:none"' : '')+' /> '+
    '<span class="button gray buttonsmall" onclick="cardeditaddfield(this,\''+scope+'\');">Add field<span class="iiconic ipositive"><svg class="feather"><use xlink:href="res/feather-sprite.svg#plus-circle"></svg></span></span>'+
    '<div class="cardeditadddesc">'+htmlEncode(missing.length ? fielddesc(cardedit.db,scope,missing[0]) : '')+'</div>'+
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
  var list = cardeditsorted();
  var at = list.findIndex(p => p.printingid == cardedit.printid);
  var changed = cardeditchangedprintings();
  var step = (d,label,title) => '<span class="button gray buttonsmall cardeditstep'+(at+d < 0 || at+d >= list.length ? ' cardeditstepoff' : '')+'"'+
    ' title="'+title+'" onclick="cardeditstep('+d+');">'+label+'</span>';
  var html = '<div class="cardeditversions">'+step(-1,'&lsaquo;','Previous instance (Alt+, or &larr;)')+' '+list.map(p =>
    '<span class="printinglink gray button buttonsmall'+(p.printingid == cardedit.printid ? ' cardeditselected' : '')+'" data-id="'+p.printingid+'"'+
    ' onclick="cardeditselect(\''+p.printingid+'\');">('+(cardeditisnew(p.printingid) ? 'new' : htmlEncode(p.printingid))+') '+
    htmlEncode(strip(clean(p.set)))+'/'+htmlEncode(strip(clean(p.rarity)))+(p.printingid == c.printingprimary ? ' *' : '')+
    '<span class="cardeditdot" title="Changed">'+(changed.includes(p.printingid) ? ' &bull;' : '')+'</span></span>').join(' ')+
    ' '+step(1,'&rsaquo;','Next instance (Alt+. or &rarr;)')+
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
    var base = dbinfo[cardedit.db].imageuri+p.imagehash+'/';
    html += '<div class="cardeditimagelist">'+p.image.map(e => '<img src="'+base+(e.select || e.details)+'" title="Zoom in"'+
      ' onclick="cardeditzoom(\''+htmlEncode(base+(e.master || e.details || e.select))+'\');" />').join(' ')+'</div>';
    if(!isnew) {
      // cards whose art looks like this printing's (its stored art vector), in a new tab so edits here stay
      html += '<div class="cardeditnote"><a href="'+htmlEncode(artsimilarurl(cardedit.cardid,p.printingid))+'" target="_blank"'+
        ' title="Cards whose art looks like this instance\'s image, most alike first (a new tab)">Find similar art</a></div>';
    }
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
  var v = this.isContentEditable ? cardeditnocolor(this.innerHTML) : this.value;
  if(this.tagName == 'INPUT') { this.size = Math.max(3,v.length+1); }
  if(cardedit.view != 'html' && v == '<br>') { v = ''; } // a contenteditable emptied by the browser
  if(typeof old === 'number' && /^-?\d+(\.\d+)?$/.test(v.trim())) { v = Number(v); }
  if(i >= 0) { obj[key][i] = v; } else { obj[key] = v; }
  cardeditsummary();
});

// Pasting into a Regular view value keeps bold, italics and line breaks, and nothing else: no
// colours, highlighting, fonts, sizes, classes or links (Word and Google Docs mark bold/italic
// with styles, so those become <b>/<i>). Blocks (paragraphs, list items) become <br>.
$(document).on('paste', '#cardedit .cardeditval[contenteditable]', function(e) {
  var data = e.originalEvent.clipboardData;
  if(!data) { return; }
  e.preventDefault();
  var html = data.getData('text/html');
  var clean = html ? cardeditpasteclean(html)
    : htmlEncode(data.getData('text/plain')).replace(/\r?\n/g,'<br>');
  document.execCommand('insertHTML', false, clean); // fires input, so the value is stored as typed
});

var cardeditpastekeep = {B: 'b', STRONG: 'b', I: 'i', EM: 'i', U: 'u', SUP: 'sup', SUB: 'sub'};
function cardeditpasteclean(html) {
  var doc = new DOMParser().parseFromString(html, 'text/html');
  var walk = function(node) {
    var out = '';
    node.childNodes.forEach(function(n) {
      if(n.nodeType == 3) { out += htmlEncode(n.nodeValue.replace(/[\r\n]+/g,' ')); return; }
      if(n.nodeType != 1 || ['SCRIPT','STYLE','HEAD','META','TITLE'].includes(n.tagName)) { return; }
      if(n.tagName == 'BR') { out += '<br>'; return; }
      var inner = walk(n);
      var st = n.style || {};
      var tags = [];
      if(cardeditpastekeep[n.tagName]) { tags.push(cardeditpastekeep[n.tagName]); }
      // Google Docs wraps everything in <b style="font-weight:normal">
      if(tags[0] == 'b' && /^(normal|[1-5]00)$/.test(st.fontWeight)) { tags.shift(); }
      if(!tags.includes('b') && /^(bold|bolder|[6-9]00)$/.test(st.fontWeight)) { tags.push('b'); }
      if(!tags.includes('i') && st.fontStyle == 'italic') { tags.push('i'); }
      if(inner.replace(/<br>/g,'').trim()) {
        tags.forEach(t => inner = '<'+t+'>'+inner+'</'+t+'>');
      }
      var block = /^(P|DIV|LI|H[1-6]|TR|BLOCKQUOTE|PRE)$/.test(n.tagName);
      out += (block && out && !/<br>$/.test(out) ? '<br>' : '')+inner;
    });
    return out;
  };
  return walk(doc.body).replace(/(<br>)+$/,'');
}

// colour and highlighting a browser adds while editing (typing where pasted text was, merging
// lines): drop color/background from style attributes, then spans and fonts left with nothing
function cardeditnocolor(html) {
  if(!/style=|<font/i.test(html)) { return html; }
  var div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('[style]').forEach(function(el) {
    ['color','background','background-color','background-image'].forEach(p => el.style.removeProperty(p));
    if(!el.getAttribute('style').trim()) { el.removeAttribute('style'); }
  });
  div.querySelectorAll('font').forEach(el => el.removeAttribute('color'));
  div.querySelectorAll('span:not([style]):not([class]), font:not([face]):not([size]):not([color])').forEach(el => el.replaceWith(...el.childNodes));
  return div.innerHTML;
}

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

// the instances in the order of the version buttons: saved ones as the card page sorts them, new ones last
function cardeditsorted() {
  var c = cardedit.card;
  return templatesortprintings(c.printing.filter(p => !cardeditisnew(p.printingid)))
    .concat(c.printing.filter(p => cardeditisnew(p.printingid)));
}

// previous (-1) or next (1) instance; stops at the first and last
function cardeditstep(d) {
  if(!cardedit || cardedit.view == 'json' || cardedit.running) { return; }
  var list = cardeditsorted();
  var p = list[list.findIndex(q => q.printingid == cardedit.printid)+d];
  if(p) { cardeditselect(p.printingid); }
}

// Alt+, / Alt+. (the < > keys) step through instances from anywhere in the editor, even while
// typing in a value; plain left/right arrows do it when no field has the focus, as on the card page
$(document).on('keydown', function(e) {
  if(!cardedit || !$('#modal').hasClass('cardeditmodal') || !$('#modal').is(':visible') || $('#cardeditconfirm').is(':visible')) { return; }
  if(e.ctrlKey || e.metaKey) { return; }
  var d = 0;
  if(e.altKey && !e.shiftKey) {
    d = e.code == 'Comma' ? -1 : e.code == 'Period' ? 1 : 0;
  } else if(!e.altKey && !e.shiftKey && !$(e.target).is('input, textarea, select, [contenteditable=true]')) {
    d = e.key == 'ArrowLeft' ? -1 : e.key == 'ArrowRight' ? 1 : 0;
  }
  if(!d) { return; }
  e.preventDefault();
  cardeditstep(d);
});

// the MRP instance can't be one the MRP lookup skips, so it loses notmrp (docs/data.md)
function cardeditmrp() {
  var p = cardeditprinting();
  cardedit.card.printingprimary = cardedit.printid;
  var had = 'notmrp' in p;
  delete p.notmrp;
  cardeditrender();
  if(had) { cardeditstatus('Removed notmrp from this instance, since it is now the MRP one.'); }
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
  c.printing.forEach(p => cardeditartfields.forEach(k => delete p[k]));
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

// Fields kept on both the card and its saved instances (legality, keywords, text...) where this
// commit changes one side and leaves the other, which has values, alone:
// [{field, from ('card' or a printingid), add, remove, targets: [{id, checked}]}].
// Ticked by default with only one instance, or when the two sides matched before the edit.
var cardeditsyncskip = ['notes','needsreview','image','imagehash','printingid'];
function cardeditsyncchecks() {
  if(!cardedit.base) { return []; }
  var c = cardedit.card, base = cardedit.base;
  var vals = v => [].concat(v === undefined || v === null ? [] : v).filter(x => !(typeof x === 'string' && x.trim() === ''));
  var simple = v => vals(v).every(x => ['string','number'].includes(typeof x));
  var same = (a,b) => _.isEqual(vals(a).map(String).sort(), vals(b).map(String).sort());
  var has = (list,x) => list.some(y => String(y) == String(x));
  var printings = c.printing.filter(p => !cardeditisnew(p.printingid));
  var sides = [{id: 'card', old: base, now: c}].concat(printings.map(p => ({id: p.printingid, old: base.printing.find(q => q.printingid == p.printingid), now: p})));
  var out = [];
  sides.forEach(function(side) {
    Object.keys(Object.assign({}, side.old, side.now)).filter(k => !cardeditsyncskip.includes(k) && !cardeditmanaged.includes(k)).forEach(function(k) {
      if(same(side.old[k],side.now[k]) || !simple(side.old[k]) || !simple(side.now[k])) { return; }
      var add = vals(side.now[k]).filter(x => !has(vals(side.old[k]),x));
      var remove = vals(side.old[k]).filter(x => !has(vals(side.now[k]),x));
      // the card against each instance, an instance against the card
      var targets = sides.filter(o => (o.id == 'card') != (side.id == 'card') && vals(o.old[k]).length && simple(o.old[k]) && same(o.old[k],o.now[k]));
      if(targets.length && (add.length || remove.length)) {
        out.push({field: k, from: side.id, add: add, remove: remove,
                  targets: targets.map(o => ({id: o.id, checked: printings.length == 1 || same(o.old[k],side.old[k])}))});
      }
    });
  });
  return out;
}

// make one side's change on another: remove what it removed, add what it added (a value edited
// in place replaces the old one where it stood); a single string or number takes the new value
function cardeditsyncapply(check,obj) {
  var k = check.field;
  var src = check.from == 'card' ? cardedit.card : cardedit.card.printing.find(p => p.printingid == check.from);
  if(!Array.isArray(obj[k])) {
    obj[k] = Array.isArray(src[k]) ? src[k].slice() : src[k];
    return;
  }
  var list = obj[k].slice();
  var adds = check.add.slice();
  check.remove.forEach(function(r) {
    var i = list.findIndex(x => String(x) == String(r));
    if(i < 0) { return; }
    if(adds.length) { list[i] = adds.shift(); } else { list.splice(i,1); }
  });
  adds.forEach(a => { if(!list.some(x => String(x) == String(a))) { list.push(a); } });
  obj[k] = list;
}

function cardeditsyncdialog(checks) {
  var strip = s => String(s).replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ');
  var show = x => htmlEncode(strip(x).length > 300 ? strip(x).slice(0,297)+'...' : strip(x));
  var where = id => {
    if(id == 'card') { return 'the card'; }
    var p = cardedit.card.printing.find(q => q.printingid == id);
    return 'instance ('+id+') '+htmlEncode(strip([].concat(p.set || '')[0]))+'/'+htmlEncode(strip([].concat(p.rarity || '')[0]));
  };
  var lab = labels[cardedit.db] || {};
  return '<p>These fields are on both the card and its instances, but this commit changes only one side. Tick where the same change should be made too.</p>'+
    checks.map((ch,i) => '<div class="cardeditsync"><b>'+htmlEncode(lab['tag'+ch.field] || ch.field)+'</b> on '+where(ch.from)+': '+
      ch.add.map(x => '<span class="cardeditsyncadd">+ '+show(x)+'</span>').concat(ch.remove.map(x => '<span class="cardeditsyncremove">&minus; '+show(x)+'</span>')).join(' ')+
      '<br />Also change: '+ch.targets.map(t => '<label><input type="checkbox" class="cardeditsynctick" data-check="'+i+'" data-target="'+t.id+'"'+(t.checked ? ' checked' : '')+' /> '+where(t.id)+'</label>').join(' ')+
      '</div>').join('')+
    '<p>Yes commits, with the ticked changes. No goes back to editing.</p>';
}

// sync: false when the card/instance check has been answered for this commit
function cardeditcommit(sync=true) {
  if(cardedit.running) { return; }
  if(cardedit.view == 'json' && !cardeditreadjson()) { return; }
  var plan = cardeditplan();
  if(plan.errors.length) { cardeditstatus(plan.errors.map(htmlEncode).join('<br />'),1); return; }
  if(!plan.steps.length) { cardeditstatus('No changes to save.'); return; }
  var checks = sync ? cardeditsyncchecks() : [];
  if(checks.length) {
    cardeditconfirm('Change both?',cardeditsyncdialog(checks), function() {
      $('#cardeditconfirm-content .cardeditsynctick:checked').each(function() {
        var ch = checks[$(this).data('check')];
        var id = String($(this).data('target'));
        cardeditsyncapply(ch, id == 'card' ? cardedit.card : cardedit.card.printing.find(p => p.printingid == id));
      });
      cardeditrender();
      cardeditcommit(false);
    });
    return;
  }
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

// changes not committed yet: in the JSON view, the box's text counts as an edit too
function cardeditdirty() {
  if(cardedit.view == 'json' && $('#cardeditjson').val() != JSON.stringify(cardedit.card,null,2)) { return true; }
  return cardeditplan().steps.length > 0 || Object.keys(cardedit.invalid).length > 0;
}

// the modal's guard: closing with unsaved changes asks first. true: close now.
function cardeditclose() {
  if(!cardedit) { return true; }
  if(cardedit.running) { return false; }
  if(!cardeditdirty()) {
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

// Reset: back to the card as it was when the editor opened (a blank one for a new card), same
// view and instance; the editor stays open
function cardeditreset() {
  if(cardedit.running) { return; }
  var reset = () => cardeditstart(cardedit.db,cardedit.cardid,cardedit.base,cardedit.printid);
  if(!cardeditdirty()) {
    cardeditstatus('No changes to reset.');
    return;
  }
  cardeditconfirm('Reset changes?','Undo every change made since the editor opened? (Images already uploaded stay on the server.)', reset);
}

// ************* image zoom *************
// A thumbnail opens the instance's _master image in a panel over the page that stays open while
// fields are edited: drag its title bar to move it, its corner to resize it. The slider, the wheel
// (at the pointer) and a double-click zoom from fit (1x) to 16x; drag the image to pan. The panel
// sits inside #modal, so it hides with the editor (CSS: #modal:not(.cardeditmodal)).
var cardeditzoommax = 16;
var cardeditzoomstate = null; // {src, fit, zoom, x, y}: scale = fit*zoom, image offset x,y in the box

function cardeditzoom(src) {
  if(!$('#cardeditzoom').length) {
    $('#modal').append('<div id="cardeditzoom">'+
      '<div class="cardeditzoomhead"><b>Image</b> '+
      '<span class="cardeditzoombtn" title="Zoom out" onclick="cardeditzoomby(1/1.25);">&minus;</span>'+
      '<input type="range" id="cardeditzoomrange" min="0" max="1000" value="0" title="Zoom" oninput="cardeditzoomset(cardeditzoomfromrange(this.value));" />'+
      '<span class="cardeditzoombtn" title="Zoom in" onclick="cardeditzoomby(1.25);">+</span> '+
      '<span id="cardeditzoomlabel">1x</span> '+
      '<span class="cardeditzoombtn" title="Fit the whole image" onclick="cardeditzoomset(1);">Fit</span>'+
      '<span class="cardeditx" title="Close" onclick="cardeditzoomclose();">&#x2715;</span></div>'+
      '<div id="cardeditzoombox"><img id="cardeditzoomimg" alt="" draggable="false" /></div></div>');
    cardeditzoomwire();
  }
  if(cardeditzoomstate && cardeditzoomstate.src == src) { return; }
  cardeditzoomstate = {src: src, fit: 1, zoom: 1, x: 0, y: 0};
  $('#cardeditzoomimg').css('visibility','hidden').off('load').on('load', function() {
    cardeditzoomfit();
    $(this).css('visibility','visible');
  }).attr('src',src);
}

function cardeditzoomclose() {
  $('#cardeditzoom').remove();
  cardeditzoomstate = null;
}

// after a render: an open panel follows the instance shown, unless it already shows one of its images
function cardeditzoomfollow() {
  if(!cardeditzoomstate || !$('#cardeditzoom').length) { return; }
  var srcs = $('#cardedit .cardeditimagelist img').map(function() { return ($(this).attr('onclick').match(/'(.*)'/) || [])[1]; }).get();
  if(srcs.length && !srcs.includes(cardeditzoomstate.src)) { cardeditzoom(srcs[0]); }
}

// slider position (0..1000) <-> zoom (1..max), logarithmic so each step is the same ratio
function cardeditzoomfromrange(v) { return Math.pow(cardeditzoommax, v/1000); }
function cardeditzoomtorange(z) { return Math.round(1000*Math.log(z)/Math.log(cardeditzoommax)); }

// the scale that fits the whole image in the box, keeping the zoom; recentred at 1x
function cardeditzoomfit() {
  var img = $('#cardeditzoomimg')[0], box = $('#cardeditzoombox')[0];
  if(!cardeditzoomstate || !img || !img.naturalWidth) { return; }
  var z = cardeditzoomstate.zoom;
  cardeditzoomstate.fit = Math.min(box.clientWidth/img.naturalWidth, box.clientHeight/img.naturalHeight);
  cardeditzoomstate.zoom = 0; // force cardeditzoomset to recompute from the centre
  cardeditzoomset(z);
}

// zoom to z (clamped), keeping the image point under (px,py) in the box still (default: the centre)
function cardeditzoomset(z,px,py) {
  var st = cardeditzoomstate, img = $('#cardeditzoomimg')[0], box = $('#cardeditzoombox')[0];
  if(!st || !img || !img.naturalWidth) { return; }
  z = Math.max(1, Math.min(cardeditzoommax, z));
  var bw = box.clientWidth, bh = box.clientHeight;
  if(px === undefined) { px = bw/2; py = bh/2; }
  var w = img.naturalWidth*st.fit*z, h = img.naturalHeight*st.fit*z;
  if(st.zoom) {
    var r = z/st.zoom;
    st.x = px-(px-st.x)*r;
    st.y = py-(py-st.y)*r;
  } else {
    st.x = (bw-w)/2;
    st.y = (bh-h)/2;
  }
  st.zoom = z;
  cardeditzoomdraw();
  $('#cardeditzoomrange').val(cardeditzoomtorange(z));
  $('#cardeditzoomlabel').text((Math.round(z*10)/10)+'x');
}

function cardeditzoomby(f,px,py) {
  if(cardeditzoomstate) { cardeditzoomset(cardeditzoomstate.zoom*f,px,py); }
}

// keep the image covering the box where it's bigger than the box, centred where it's smaller
function cardeditzoomdraw() {
  var st = cardeditzoomstate, img = $('#cardeditzoomimg')[0], box = $('#cardeditzoombox')[0];
  var w = img.naturalWidth*st.fit*st.zoom, h = img.naturalHeight*st.fit*st.zoom;
  var bw = box.clientWidth, bh = box.clientHeight;
  st.x = w <= bw ? (bw-w)/2 : Math.min(0, Math.max(bw-w, st.x));
  st.y = h <= bh ? (bh-h)/2 : Math.min(0, Math.max(bh-h, st.y));
  $(img).css({width: w+'px', height: h+'px', left: st.x+'px', top: st.y+'px'});
}

// wheel, double-click and drag-to-pan on the image; drag the head to move the panel; refit on resize
function cardeditzoomwire() {
  var panel = $('#cardeditzoom'), box = $('#cardeditzoombox');
  var at = e => { var o = box[0].getBoundingClientRect(); return [e.clientX-o.left, e.clientY-o.top]; };
  box.on('wheel', function(e) {
    e.preventDefault();
    var p = at(e.originalEvent);
    cardeditzoomby(e.originalEvent.deltaY < 0 ? 1.15 : 1/1.15, p[0], p[1]);
  });
  box.on('dblclick', function(e) {
    var p = at(e), st = cardeditzoomstate;
    if(st) { cardeditzoomset(st.zoom >= cardeditzoommax ? 1 : st.zoom*2, p[0], p[1]); }
  });
  var drag = null;
  box.on('pointerdown', function(e) {
    if(!cardeditzoomstate) { return; }
    drag = {mode: 'pan', x: e.clientX, y: e.clientY, ox: cardeditzoomstate.x, oy: cardeditzoomstate.y};
    this.setPointerCapture(e.pointerId);
    box.addClass('cardeditzoompanning');
  });
  panel.find('.cardeditzoomhead').on('pointerdown', function(e) {
    if($(e.target).closest('input, .cardeditzoombtn, .cardeditx').length) { return; }
    var o = panel[0].getBoundingClientRect();
    drag = {mode: 'move', x: e.clientX, y: e.clientY, ox: o.left, oy: o.top};
    this.setPointerCapture(e.pointerId);
  });
  panel.on('pointermove', function(e) {
    if(!drag) { return; }
    var dx = e.clientX-drag.x, dy = e.clientY-drag.y;
    if(drag.mode == 'pan') {
      cardeditzoomstate.x = drag.ox+dx;
      cardeditzoomstate.y = drag.oy+dy;
      cardeditzoomdraw();
    } else {
      panel.css({left: Math.max(0, Math.min(window.innerWidth-60, drag.ox+dx))+'px',
                 top: Math.max(0, Math.min(window.innerHeight-30, drag.oy+dy))+'px', right: 'auto'});
    }
  });
  panel.on('pointerup pointercancel', function() {
    drag = null;
    box.removeClass('cardeditzoompanning');
  });
  if(window.ResizeObserver) { new ResizeObserver(() => cardeditzoomfit()).observe(box[0]); }
}

window.cardeditloaded = true;
