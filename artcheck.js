// Admin -> Artist check (ootv-claude ARTIST-CHECK.md; guide docs/admin/artist-check.md): who painted
// a printing, by painting style and by any signature in the art. L5R also has Check bugs (task
// "bugs", ootv-claude CARD-ARC-IDENTIFIER.md): the arc bugs printed on the card (bugcheckresult). POST /artcheck (ootv-search
// admin/artcheck.mjs) only queues and reads jobs; a LAN worker (ootv-tools artcheck/worker.py)
// does the work and writes the result. Nothing is written to the card. Loaded on demand by
// loadartcheck() and artcheckinline() in oracle.js.

var artcheckpoll = {};     // target element id -> timer of the job being waited for
var artcheckpictures = {}; // job id -> the uploaded picture (a data URL), shown with its result while the page is open
var ARTCHECK_LONG = 1600;  // an upload's long side, as Search by photo (artphoto.js)
var ARTCHECK_IMAGES = 'https://images.oracleofthevoid.com/';   // + a known signature's path + file
var artcheckartists = null; // GET /artist?all=1, loaded when a signature's artist box first gets focus

function artcheckapi(action, data) {
  return Promise.resolve($.ajax({
    type: 'POST',
    url: apiuri+"/artcheck",
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify(Object.assign({"uid": getuid(), "database": database, "action": action}, data || {})),
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());}
  }));
}

function artcheckerr(e) {
  return (e && e.responseJSON && e.responseJSON.error) || (e && e.message) || 'request failed';
}

function artcheckesc(s) {
  return String(s === undefined || s === null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function artcheckworker(w) {
  if(!w || !w.seen) { return '<span class="error">The artist check worker has never run: jobs wait until it starts.</span>'; }
  var when = new Date(w.seen).toLocaleString();
  return w.online ? 'Worker online ('+artcheckesc(w.host)+', '+artcheckesc(w.state)+', seen '+when+').'
                  : '<span class="error">The worker is offline (last seen '+when+'): jobs wait until it is back.</span>';
}

// the Admin panel: a form for one printing, the worker's state and the game's recent jobs
function artcheckopen(cardid, printingid) {
  $('#artcheck').html('<h3>Artist check: '+artcheckesc(dbinfo[database].name)+'</h3>'+
    '<p>Who painted a printing: the artists of the paintings nearest in style, the same painting\'s other credits, '+
    'and any signature read in the art. Nothing is written to the card; see the '+
    '<a href="" onclick="loadadmindoc(\'artist-check\'); return false">guide</a>.</p>'+
    '<p>Card id <input type="text" id="artcheckcard" size="7" value="'+artcheckesc(cardid || '')+'" /> '+
    'printing <input type="text" id="artcheckprinting" size="4" value="'+artcheckesc(printingid || '1')+'" /> '+
    '<input type="button" value="Check" onclick="artcheckgo()" />'+
    (database == 'l5r' ? ' <input type="button" value="Check bugs" title="The arc bugs printed on the card" onclick="artcheckgo(\'bugs\')" />' : '')+'</p>'+
    '<p>or a picture <input type="file" id="artcheckfile" accept="image/jpeg,image/png" onchange="artcheckupload(this)" /> '+
    '<label><input type="radio" name="artcheckkind" value="card" checked /> a whole card</label> '+
    '<label><input type="radio" name="artcheckkind" value="art" /> the art alone</label>'+
    (database == 'l5r' ? ' <label title="A scan or photo of the whole card: a photo is cut out and straightened (best on a pale background)"><input type="radio" name="artcheckkind" value="bugs" /> the bugs on a whole card</label>' : '')+'</p>'+
    '<div id="artcheckone"></div><p id="artcheckworker"></p><table class="artchecklist" id="artchecklist"></table>'+
    '<h4>Signature submissions</h4><p class="artchecknote">Signatures found by Find the artist and sent in by people '+
    'who aren\'t admins, and signatures detached from an artist in Admin → Artists. Approve files one in the signature catalogue '+
    'under the artist in its box (fix the name first if needed; a detached one needs a name).</p>'+
    '<p><label><input type="checkbox" id="artchecksuball" onchange="artchecksubs()" /> show decided ones too</label></p>'+
    '<div id="artchecksubs"></div>');
  artchecklist();
  artchecksubs();
  if(cardid) { artcheckgo(); }
}

function artcheckgo(task) {
  var cardid = $.trim($('#artcheckcard').val()), printingid = $.trim($('#artcheckprinting').val());
  if(!/^\d+$/.test(cardid) || !printingid) { $('#artcheckone').html('<span class="error">A card id and a printing id, please.</span>'); return; }
  artcheckrun('artcheckone', cardid, printingid, artchecklist, undefined, task);
}

// queue a check and draw it into #target as it moves along; then(job) runs when it's finished.
// pick: the card editor's instance, drawn with artist checkboxes and Fill in artist (artcheckfill),
// or for task 'bugs' with Set printedbugs (bugcheckfill)
function artcheckrun(target, cardid, printingid, then, pick, task) {
  artcheckqueue(target, Object.assign({cardid: cardid, printingid: printingid}, task ? {task: task} : {}), then, pick);
}

// a picture file -> shrunk and upright (as Search by photo) -> queued as an upload
function artcheckupload(input) {
  var kind = $('input[name=artcheckkind]:checked').val() || 'card';
  artcheckpicture(input, kind == 'bugs' ? 'card' : kind, 'artcheckone', artchecklist, kind == 'bugs' ? 'bugs' : undefined);
}

// the Photo button's Find the artist (photochooser in oracle.js): the result in the popup
function artcheckphoto(input, kind) {
  modal('Find the artist', '<div id="artcheckmodal"></div><p class="artchecknote">The candidates are leads to check, not answers: '+
    'read any printed credit first.</p>');
  $('#modal').addClass('artphotomodal');
  artcheckpicture(input, kind, 'artcheckmodal', null);
}

function artcheckpicture(input, kind, target, then, task) {
  var file = input.files && input.files[0];
  input.value = '';
  if(!file) { return; }
  $('#'+target).html('Reading the picture...');
  var url = URL.createObjectURL(file), img = new Image();
  img.onload = function() {
    URL.revokeObjectURL(url);
    var k = Math.min(1, ARTCHECK_LONG / Math.max(img.naturalWidth, img.naturalHeight));
    var canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * k));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * k));
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    var data = canvas.toDataURL('image/jpeg', 0.88);
    artcheckqueue(target, Object.assign({image: data, kind: kind, name: file.name}, task ? {task: task} : {}), then, null, data);
  };
  img.onerror = function() {
    URL.revokeObjectURL(url);
    $('#'+target).html('<span class="error">That file could not be read as a picture. Try a JPEG or PNG.</span>');
  };
  img.src = url;
}

function artcheckqueue(target, data, then, pick, picture) {
  clearTimeout(artcheckpoll[target]);
  $('#'+target).html('Queueing...');
  artcheckapi('queue', data).then(function(r) {
    if(picture) { artcheckpictures[r.job.id] = picture; }
    var wait = function(job, worker) {
      if(job.status == 'done' || job.status == 'error') {
        $('#'+target).html(artcheckresult(job, pick));
        if(then) { then(job); }
        return;
      }
      $('#'+target).html((job.status == 'running' ? 'Checking' : 'Queued')+' (job '+artcheckesc(job.id)+')... '+
                         (worker && !worker.online ? artcheckworker(worker) : ''));
      artcheckpoll[target] = setTimeout(function() {
        artcheckapi('job', {id: job.id}).then(r2 => wait(r2.job, r2.worker), e => $('#'+target).html('<span class="error">'+artcheckesc(artcheckerr(e))+'</span>'));
      }, 4000);
    };
    wait(r.job, r.worker);
  }, function(e) { $('#'+target).html('<span class="error">'+artcheckesc(artcheckerr(e))+'</span>'); });
}

function artcheckcard(m) {
  if(!m.cardid) { return artcheckesc(m.title)+' ('+artcheckesc(m.set || '')+')'; }   // an uploaded picture
  var url = location.pathname+statehash({'view': 'card', 'cardid': m.cardid, 'prid': m.printingid});
  return '<a href="'+artcheckesc(url)+'" target="_blank">'+artcheckesc(m.title)+'</a> ('+artcheckesc(String(m.set || '').replace(/&ndash;/g,'–'))+')';
}

// the artists a finished check names, for the editor's checkboxes: the same painting's credits
// first, then the style candidates; [{artist, why}], each artist once
function artcheckpicks(job) {
  var r = job.result || {}, out = [], seen = {};
  var add = (a, why) => { if(a && a != 'N/A' && !seen[a.toLowerCase()]) { seen[a.toLowerCase()] = 1; out.push({artist: a, why: why}); } };
  (r.same || []).forEach(m => (m.artist || []).forEach(a => add(a, 'same painting: '+m.title)));
  ((r.style || {}).candidates || []).forEach(c => add(c.artist, 'style '+Math.round(c.share*100)+'%'));
  return out;
}

// the signature found in the art, zoomed; the catalogue signatures closest to it (by the crop's
// vector and the reading); artists the reading names; known signatures of the likely artists
// (the catalogue: images site artists/<slug>/signatures/, ootv-tools artists/signatures/)
function artchecksigimg(path, m, label) {
  return '<a'+(m.cardid ? ' href="'+artcheckesc(location.pathname+statehash({'view': 'card', 'cardid': m.cardid, 'prid': m.printingid}))+'" target="_blank"' : '')+
    ' title="'+artcheckesc((m.title || 'an uploaded picture')+(m.set ? ' ('+String(m.set).replace(/&amp;/g,'&').replace(/&ndash;/g,'–')+')' : ''))+'">'+
    '<img src="'+artcheckesc(ARTCHECK_IMAGES+path+m.file)+'" alt="'+artcheckesc(m.title || '')+'" loading="lazy" />'+(label || '')+'</a>';
}

function artchecksignatures(sig) {
  var known = sig.known || [], closest = sig.closest || [], html = '';
  if(sig.where && sig.where.crop) {
    html += '<div class="artchecksigfound"><img src="'+artcheckesc(sig.where.crop)+'" alt="signature" /><div class="artchecknote">Found in the art'+
      (sig.where.read ? ': read as "'+artcheckesc(sig.where.read)+'"' : '')+'. Compare the hand with the known signatures.</div></div>';
  }
  var bare = (sig.named || []).filter(n => !n.signatures);
  if(bare.length) {
    html += '<div class="artchecknote">The reading may name '+bare.map(n => '<b>'+artcheckesc(n.artist)+'</b>').join(', ')+
      ' (no signatures in the catalogue yet).</div>';
  }
  if(closest.length) {
    html += '<div class="artchecksigartist"><b>Closest known signatures</b> <span class="artchecknote">('+
      (sig.where ? 'by the look of the hand, and the reading' : 'by the reading')+'; a signal only: compare by eye)</span>'+
      '<div class="artchecksigstrip artchecksigclosest">'+closest.map(c => artchecksigimg(c.path, c,
        '<span class="artchecksigcap">'+artcheckesc(c.artist)+'<br><span class="artchecknote">'+
        (c.image !== null && c.image !== undefined ? 'look '+Math.round(c.image*100)+'%' : '')+
        (c.text >= 0.75 ? (c.image !== null && c.image !== undefined ? ', ' : '')+'reading '+Math.round(c.text*100)+'%' : '')+'</span></span>')).join('')+'</div></div>';
  }
  if(!known.length) { return html; }
  var rows = known.map(k => '<div class="artchecksigartist"><b>'+artcheckesc(k.artist)+'</b>'+
    (k.match ? ' <span class="artcheckstrong">(the reading matches)</span>' : '')+
    ' <span class="artchecknote">'+k.samples.length+' of '+k.count+'</span><div class="artchecksigstrip">'+
    k.samples.map(m => artchecksigimg(k.path, m)).join('')+'</div></div>').join('');
  return html+'<details class="artchecksigknown"'+(sig.where && !closest.length ? ' open' : '')+'><summary>Known signatures by artist</summary>'+rows+'</details>';
}

// a found signature not in the catalogue yet: a box for the artist's name and Add to the catalogue
// (an admin: filed at once) or Submit for approval (anyone else: waits in Admin -> Artist check).
// POST /artcheck sigsubmit (ootv-search admin/artcheck.mjs; ootv-claude ARTIST-CHECK.md)
function artchecksubmitform(job, sig) {
  if(!sig.where || !sig.where.file) { return ''; }
  if((sig.catalogued || []).length) {
    return '<div class="artchecknote">This signature is in the catalogue already (under '+
      artcheckesc(sig.catalogued.map(c => c.artist).filter((a,i,l) => a && l.indexOf(a) == i).join(', ') || 'its artist')+').</div>';
  }
  if(job.signaturesub) { return artchecksubstate(job.signaturesub); }
  var admin = gamepermission('artcheck');
  // the likely names first: the credit, the artists whose signatures are shown, the style vote
  var likely = [].concat(job.artist || [], (sig.named || []).map(n => n.artist), (sig.known || []).filter(k => k.match).map(k => k.artist),
                         (sig.closest || []).map(c => c.artist),
                         (((job.result || {}).style || {}).candidates || []).map(c => c.artist))
    .filter((a,i,l) => a && a != 'N/A' && l.indexOf(a) == i);
  var id = 'artchecksub'+artcheckesc(job.id);
  return '<div class="artchecksubmit" id="'+id+'"><b>Add this signature to the catalogue</b>: whose is it? '+
    '<input type="text" class="artchecksubartist" list="'+id+'list" size="24" value="'+artcheckesc((job.artist || [])[0] || '')+'"'+
    ' placeholder="the artist\'s name" onfocus="artcheckartistlist(this)" /><datalist id="'+id+'list">'+
    likely.map(a => '<option value="'+artcheckesc(a)+'">').join('')+'</datalist> '+
    '<input type="button" value="'+(admin ? 'Add to the catalogue' : 'Submit for approval')+'" onclick="artchecksubmit(this,\''+artcheckesc(job.id)+'\')" />'+
    '<div class="artchecknote">'+(admin ? 'You\'re an admin: it\'s filed at once, under an artist from the artists list.' :
      'An admin looks at it before it goes in the catalogue.')+' Only send a signature you can read or recognise.</div>'+
    '<div class="artchecksubstatus"></div></div>';
}

function artchecksubstate(s) {
  return '<div class="artchecknote">This signature was '+(s.status == 'pending' ? 'submitted for approval' : artcheckesc(s.status))+
    ' (artist: '+artcheckesc(s.artist)+').</div>';
}

// the artists list behind the name box's suggestions, after the likely names
function artcheckartistlist(input) {
  var list = $('#'+$(input).attr('list'));
  var fill = function() {
    var have = {};
    list.find('option').each(function() { have[this.value] = 1; });
    list.append(artcheckartists.filter(a => !have[a]).map(a => $('<option>').attr('value', a)));
  };
  if(list.data('full')) { return; }
  list.data('full', 1);
  if(!artcheckartists) {
    artcheckartists = Promise.resolve($.ajax({url: apiuri+'/artist', data: {all: 1}, dataType: 'json', timeout: 30000}))
      .then(r => (r.artists || []).map(a => a.name).sort(), () => []);
  }
  Promise.resolve(artcheckartists).then(names => { artcheckartists = names; fill(); });
}

function artchecksubmit(el, id) {
  var box = $(el).closest('.artchecksubmit'), artist = $.trim(box.find('.artchecksubartist').val());
  if(!artist) { box.find('.artchecksubstatus').html('<span class="error">The artist\'s name, please.</span>'); return; }
  $(el).prop('disabled', true);
  box.find('.artchecksubstatus').text('Sending...');
  artcheckapi('sigsubmit', {id: id, artist: artist}).then(function(r) {
    var s = r.submission;
    box.html(s.status == 'approved' ? '<div class="artchecknote">Added to the catalogue under <b>'+artcheckesc(s.artist)+'</b>.</div>' :
      '<div class="artchecknote">Submitted for approval (artist: '+artcheckesc(s.artist)+'). Thank you!</div>');
    if($('#artchecksubs').length) { artchecksubs(); }
  }, function(e) {
    $(el).prop('disabled', false);
    box.find('.artchecksubstatus').html('<span class="error">'+artcheckesc(artcheckerr(e))+'</span>');
  });
}

// Admin -> Artist check: the submissions waiting (or all), with Approve / Reject
function artchecksubs() {
  artcheckapi('sigqueue', {pending: !$('#artchecksuball').prop('checked')}).then(function(r) {
    var subs = r.submissions || [];
    if(!subs.length) { $('#artchecksubs').html('<p>No signatures waiting.</p>'); return; }
    $('#artchecksubs').html('<table class="artchecklist artchecksubs"><tr><th>Signature</th><th>From</th><th>Read</th><th>Artist</th><th>By</th><th></th></tr>'+
      subs.map(function(s) {
        var pending = s.status == 'pending';
        return '<tr data-id="'+artcheckesc(s.id)+'"><td><img src="'+artcheckesc(s.crop)+'" alt="signature" /></td>'+
          '<td>'+artcheckcard(s)+(s.cardid ? '' : ' <span class="artchecknote">(an uploaded picture)</span>')+
            '<br><span class="artchecknote">credited: '+artcheckesc((s.credit || []).join(', ') || 'none')+'</span></td>'+
          '<td>'+(s.read ? '"'+artcheckesc(s.read)+'"' : '')+'</td>'+
          '<td>'+(pending ? '<input type="text" class="artchecksubartist" list="artchecksubslist" size="20" value="'+artcheckesc(s.artist || '')+'"'+
              (s.detached ? ' placeholder="the artist"' : '')+' onfocus="artcheckartistlist(this)" />' : artcheckesc(s.artist))+'</td>'+
          // a signature detached from an artist in Admin → Artists (ootv-search admin/signatures.mjs) waits here for one
          '<td>'+(s.detached ? 'detached from <b>'+artcheckesc(s.detached.from)+'</b> by '+artcheckesc(s.uname) : artcheckesc(s.uname))+
            '<br><span class="artchecknote">'+new Date(s.created).toLocaleString()+'</span></td>'+
          '<td>'+(pending ? '<input type="button" value="Approve" onclick="artcheckdecide(this,\'approve\')" /> '+
                            '<input type="button" value="Reject" onclick="artcheckdecide(this,\'reject\')" /><div class="artchecksubstatus"></div>' :
              artcheckesc(s.status)+' by '+artcheckesc(s.decidedby))+'</td></tr>';
      }).join('')+'</table><datalist id="artchecksubslist"></datalist>');
  }, function(e) { $('#artchecksubs').html('<span class="error">'+artcheckesc(artcheckerr(e))+'</span>'); });
}

function artcheckdecide(el, decision) {
  var row = $(el).closest('tr'), artist = $.trim(row.find('.artchecksubartist').val());
  row.find('input[type=button]').prop('disabled', true);
  artcheckapi('sigdecide', {id: row.data('id'), decision: decision, artist: artist}).then(artchecksubs, function(e) {
    row.find('input[type=button]').prop('disabled', false);
    row.find('.artchecksubstatus').html('<span class="error">'+artcheckesc(artcheckerr(e))+'</span>');
  });
}

// one finished job as HTML; pick (the card editor's instance id) adds the artist checkboxes
function artcheckresult(job, pick) {
  if(job.status == 'error') { return '<span class="error">The check failed: '+artcheckesc(job.error)+'</span>'; }
  if(job.task == 'bugs') { return bugcheckresult(job, pick); }
  var r = job.result || {}, s = r.style || {}, sig = r.signature || {};
  var credit = (job.artist || []).join(', ') || '(no credit)';
  var html = '<div class="artcheckresult">'+(job.image ?
    (artcheckpictures[job.id] ? '<img class="artcheckpicture" src="'+artcheckpictures[job.id]+'" alt="" />' : '')+
      'Uploaded picture <b>'+artcheckesc(job.title)+'</b> ('+artcheckesc(job.set)+').' :
    '<b>'+artcheckesc(job.title)+'</b>, printing '+artcheckesc(job.printingid)+
    ' ('+artcheckesc(String(job.set || '').replace(/&ndash;/g,'–'))+'). Credited: <b>'+artcheckesc(credit)+'</b>');
  html += '<div><b>Signature</b>: '+(sig.error ? '<span class="error">not read ('+artcheckesc(sig.error)+')</span>' :
    sig.read ? '"'+artcheckesc(sig.read)+'"'+(job.image ? ' (the model misreads small signatures: look at the art)' : sig.match ? ' (matches the credit: '+sig.match+')' :
      ' (doesn\'t match the credit: look at the art, the model misreads small signatures)') : 'none read')+'</div>';
  html += artchecksignatures(sig);
  html += artchecksubmitform(job, sig);
  if((r.same || []).length) {
    html += '<div><b>'+(job.image ? 'Maybe the same painting' : 'Same painting')+'</b>: '+r.same.map(m => artcheckcard(m)+' '+artcheckesc((m.artist || []).join(', '))+
      (job.image ? ' <span class="artchecknote">('+(m.artvec >= 0.9 ? 'very close' : 'close')+', '+m.artvec+')</span>' : '')).join('; ')+'</div>';
  }
  html += '<div><b>By style</b> (the 10 nearest other paintings): '+(s.candidates || []).map(c =>
    '<span class="'+(c.share >= 0.5 ? 'artcheckstrong' : '')+'">'+artcheckesc(c.artist)+' '+Math.round(c.share*100)+'%</span>').join(', ')+
    ' <span class="artchecknote">(a share of 50% or more was the right artist 88% of the time in testing; below that, candidates only)</span></div>';
  html += '<details><summary>Nearest paintings</summary><ol>'+(s.nearest || []).map(m =>
    '<li>'+artcheckcard(m)+': '+artcheckesc((m.artist || []).join(', '))+' <span class="artchecknote">'+m.score+'</span></li>').join('')+'</ol></details>';
  if(pick !== undefined && pick !== null) {
    var picks = artcheckpicks(job);
    // ticked: the names already in the instance's artist field; with none there, a lone same-painting
    // artist (the strongest evidence, still to be checked by eye)
    var inst = window.cardedit && cardedit.card ? cardedit.card.printing.find(x => x.printingid == pick) : null;
    var now = ((inst && inst.artist) || []).filter(x => String(x).trim()).map(x => String(x).toLowerCase());
    var sameartists = picks.filter(p => p.why.startsWith('same painting'));
    var ticked = (p,i) => now.length ? now.includes(p.artist.toLowerCase()) : sameartists.length == 1 && i == 0;
    html += '<div class="artcheckpick"><b>Artist for this instance</b>: '+(picks.length ? picks.map((p,i) =>
      '<label title="'+artcheckesc(p.why)+'"><input type="checkbox" class="artcheckpickbox" value="'+artcheckesc(p.artist)+'"'+
      (ticked(p,i) ? ' checked' : '')+' /> '+artcheckesc(p.artist)+
      ' <span class="artchecknote">('+artcheckesc(p.why)+')</span></label>').join(' ') : 'no artists to suggest')+
      (picks.length ? ' <input type="button" value="Fill in artist" title="Set this instance\'s artist field to the ticked artists (Commit saves it)"'+
        ' onclick="artcheckfill(this,\''+artcheckesc(pick)+'\');" />' : '')+
      '<div class="artchecknote">Read the printed credit first; tick more than one for a joint credit.</div></div>';
  }
  return html+'</div>';
}

// the card editor: the ticked artists become the instance's artist field (in memory; Commit saves it)
function artcheckfill(el, printingid) {
  var names = $(el).closest('.artcheckpick').find('.artcheckpickbox:checked').map(function() { return this.value; }).get();
  if(!names.length) { cardeditstatus('Tick an artist first.', 1); return; }
  var p = cardedit.card.printing.find(x => x.printingid == printingid);
  if(!p) { return; }
  var was = (p.artist || []).filter(x => String(x).trim());
  p.artist = names;
  cardeditrender();
  cardeditstatus('Artist set to '+artcheckesc(names.join(', '))+(was.length ? ' (was '+artcheckesc(was.join(', '))+')' : '')+'. Commit to save it.');
}

// ---- printed bugs (task "bugs"): the worker's legality/bugs.py result ----

var BUGCHECK_NAMES = {jade: 'Jade', gold: 'Gold', diamond: 'Diamond', lotus: 'Lotus', samurai: 'Samurai',
  celestial: 'Celestial', emperor: 'Emperor', ivory: 'Ivory', twentyfestivals: 'Twenty Festivals', onyx: 'Onyx',
  shatteredempire: 'Shattered Empire'};

function bugchecknames(list) {
  return (list || []).map(v => BUGCHECK_NAMES[v] || v).join(', ');
}

// one finished bugs job: the bugs found and the unsure ones, each zoomed, and what to review.
// pick (the card editor's instance): Set printedbugs, and Add review note when there's something to review
function bugcheckresult(job, pick) {
  var r = job.result || {}, crops = r.crops || {};
  var crop = (v, unsure) => crops[v] ? '<figure class="bugcheckcrop'+(unsure ? ' bugcheckunsure' : '')+'"><img src="'+artcheckesc(crops[v])+'" alt="'+artcheckesc(v)+'" />'+
    '<figcaption>'+artcheckesc(BUGCHECK_NAMES[v] || v)+(unsure ? ' ?' : '')+' <span class="artchecknote">'+artcheckesc((r.scores || {})[v])+'</span></figcaption></figure>' : '';
  var html = '<div class="artcheckresult">'+(job.image ?
    (artcheckpictures[job.id] ? '<img class="artcheckpicture" src="'+artcheckpictures[job.id]+'" alt="" />' : '')+
      'Uploaded picture <b>'+artcheckesc(job.title)+'</b>.' :
    '<b>'+artcheckesc(job.title)+'</b>, printing '+artcheckesc(job.printingid)+' ('+artcheckesc(String(job.set || '').replace(/&ndash;/g,'–'))+').');
  html += '<div><b>Printed bugs</b>: '+((r.printedbugs || []).length ? artcheckesc(bugchecknames(r.printedbugs)) : 'none found')+
    ((r.unsure || []).length ? '; <b>unsure</b>: '+artcheckesc(bugchecknames(r.unsure)) : '')+
    (r.stored ? ' <span class="artchecknote">(stored printedbugs: '+artcheckesc(bugchecknames(r.stored) || 'none')+')</span>' : '')+'</div>';
  var figs = (r.printedbugs || []).map(v => crop(v)).join('')+(r.unsure || []).map(v => crop(v, 1)).join('');
  if(figs) { html += '<div class="bugcheckcrops">'+figs+'</div>'; }
  if(r.photo && r.photo.found) {
    html += '<div class="artchecknote">The card was found in the photo and straightened'+(r.photo.turned ? ' (it was upside down)' : '')+'.</div>';
  }
  // from Gold Edition on: the set code printed along the bottom (ootv-tools identify/setcode.py)
  var sc = r.setcode;
  if(sc) {
    html += '<div><b>Printed set</b>: '+(sc.error ? '<span class="artchecknote">not read (the vision model is off)</span>' :
      sc.set ? artcheckesc(String(sc.set).replace(/&amp;/g,'&').replace(/&ndash;/g,'–'))+(sc.sure ? '' : ' <span class="artchecknote">(a guess)</span>') :
      'not recognised')+(sc.read ? ' <span class="artchecknote">(read: "'+artcheckesc(sc.read.replace(/\n/g,' / '))+'")</span>' : '')+'</div>';
  }
  // pre-Gold cards: the set by the border (ootv-tools identify/sets.py), within the arc the bugs allow
  var b = r.border;
  if(b) {
    html += '<div><b>Set by the border</b>: '+(b.known ? artcheckesc(b.say)+' <span class="artchecknote">('+
      (b.sure ? 'sure: '+Math.round(b.share*100)+'% of the nearest scans agree' : 'a guess: '+Math.round(b.share*100)+'% of the nearest scans agree')+')</span>' :
      'not recognised <span class="artchecknote">(not like any pre-Gold set\'s border: a promo or a later set?)</span>')+'</div>';
  }
  html += (r.review || []).length ? '<div><b>To review</b>:<ul>'+r.review.map(x => '<li>'+artcheckesc(x)+'</li>').join('')+'</ul></div>'
    : '<div class="artchecknote">Nothing to review'+(job.image ? '.' : ': the bugs match the printing\'s legality.')+'</div>';
  if(pick !== undefined && pick !== null) {
    html += '<div class="artcheckpick"><input type="button" value="Set printedbugs" title="Set this instance\'s printedbugs to the bugs found, plus any a misprint note names (Commit saves it)"'+
      ' onclick="bugcheckfill(\''+artcheckesc(pick)+'\','+artcheckesc(JSON.stringify(r.suggested || r.printedbugs || []))+');" />'+
      ((r.review || []).length ? ' <input type="button" value="Add review note" title="Add the review lines to the card\'s needsreview (Commit saves it)"'+
        ' onclick="bugchecknote(\''+artcheckesc(pick)+'\','+artcheckesc(JSON.stringify(r.review))+');" />' : '')+
      '<div class="artchecknote">A misprint meant to carry a bug it doesn\'t show gets that bug too: give the instance a note '+
        '"Misprinted without the X bug: ..." and check again, or add it by hand.</div></div>';
  }
  return html+'</div>';
}

// the card editor: printedbugs of the instance (in memory; Commit saves it)
function bugcheckfill(printingid, bugs) {
  var p = cardedit.card.printing.find(x => x.printingid == printingid);
  if(!p) { return; }
  var was = p.printedbugs;
  p.printedbugs = bugs.slice();
  cardeditrender();
  cardeditstatus('printedbugs set to ['+artcheckesc(bugs.join(', '))+']'+(was ? ' (was ['+artcheckesc(was.join(', '))+'])' : '')+'. Commit to save it.');
}

function bugchecknote(printingid, review) {
  var c = cardedit.card, p = c.printing.find(x => x.printingid == printingid);
  var set = p && p.set ? String(p.set[0]).replace(/&ndash;/g,'–') : 'printing '+printingid;
  var day = new Date().toISOString().slice(0, 10);
  c.needsreview = (c.needsreview || []).concat(['The '+set+' printing '+printingid+': printed bugs: '+review.join('; ')+' (bug check, '+day+')']);
  cardeditrender();
  cardeditstatus('Review note added. Commit to save it.');
}

function artchecklist() {
  artcheckapi('jobs').then(function(r) {
    $('#artcheckworker').html(artcheckworker(r.worker));
    var rows = (r.jobs || []).map(function(j) {
      var top = ((j.result || {}).style || {}).candidates || [];
      var sig = (j.result || {}).signature || {};
      var bugs = j.task == 'bugs' ? 'bugs: '+(bugchecknames((j.result || {}).printedbugs) || (j.status == 'done' ? 'none' : ''))+
        (((j.result || {}).review || []).length ? ' (to review)' : '') : '';
      return '<tr><td>'+new Date(j.created).toLocaleString()+'</td><td>'+artcheckcard(j)+' #'+artcheckesc(j.printingid)+'</td>'+
        '<td>'+artcheckesc((j.artist || []).join(', '))+'</td><td>'+artcheckesc(j.status)+'</td>'+
        '<td>'+(bugs ? artcheckesc(bugs) : top[0] ? artcheckesc(top[0].artist)+' '+Math.round(top[0].share*100)+'%' : '')+'</td>'+
        '<td>'+(sig.read ? '"'+artcheckesc(sig.read)+'"' : '')+'</td>'+
        '<td><a href="" onclick="artcheckshow(\''+artcheckesc(j.id)+'\'); return false">show</a></td><td>'+artcheckesc(j.uname)+'</td></tr>';
    });
    $('#artchecklist').html(rows.length ? '<tr><th>Queued</th><th>Printing</th><th>Credit</th><th>Status</th><th>Top by style / bugs</th><th>Signature</th><th></th><th>By</th></tr>'+rows.join('')
                                        : '<tr><td>No checks yet for this game.</td></tr>');
  }, function(e) { $('#artchecklist').html('<tr><td class="error">'+artcheckesc(artcheckerr(e))+'</td></tr>'); });
}

function artcheckshow(id) {
  artcheckapi('job', {id: id}).then(r => $('#artcheckone').html(r.job.status == 'done' || r.job.status == 'error' ? artcheckresult(r.job) : 'Job '+artcheckesc(id)+' is '+artcheckesc(r.job.status)+'.'),
                                    e => $('#artcheckone').html('<span class="error">'+artcheckesc(artcheckerr(e))+'</span>'));
}
