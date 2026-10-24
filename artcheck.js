// Admin -> Artist check (ootv-claude ARTIST-CHECK.md; guide docs/admin/artist-check.md): who painted
// a printing, by painting style and by any signature in the art. POST /artcheck (ootv-search
// admin/artcheck.mjs) only queues and reads jobs; a LAN worker (ootv-tools artcheck/worker.py)
// does the work and writes the result. Nothing is written to the card. Loaded on demand by
// loadartcheck() and artcheckinline() in oracle.js.

var artcheckpoll = {};     // target element id -> timer of the job being waited for
var artcheckpictures = {}; // job id -> the uploaded picture (a data URL), shown with its result while the page is open
var ARTCHECK_LONG = 1600;  // an upload's long side, as Search by photo (artphoto.js)

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
    '<input type="button" value="Check" onclick="artcheckgo()" /></p>'+
    '<p>or a picture <input type="file" id="artcheckfile" accept="image/jpeg,image/png" onchange="artcheckupload(this)" /> '+
    '<label><input type="radio" name="artcheckkind" value="card" checked /> a whole card</label> '+
    '<label><input type="radio" name="artcheckkind" value="art" /> the art alone</label></p>'+
    '<div id="artcheckone"></div><p id="artcheckworker"></p><table class="artchecklist" id="artchecklist"></table>');
  artchecklist();
  if(cardid) { artcheckgo(); }
}

function artcheckgo() {
  var cardid = $.trim($('#artcheckcard').val()), printingid = $.trim($('#artcheckprinting').val());
  if(!/^\d+$/.test(cardid) || !printingid) { $('#artcheckone').html('<span class="error">A card id and a printing id, please.</span>'); return; }
  artcheckrun('artcheckone', cardid, printingid, artchecklist);
}

// queue a check and draw it into #target as it moves along; then(job) runs when it's finished.
// pick: the card editor's instance, drawn with artist checkboxes and Fill in artist (artcheckfill)
function artcheckrun(target, cardid, printingid, then, pick) {
  artcheckqueue(target, {cardid: cardid, printingid: printingid}, then, pick);
}

// a picture file -> shrunk and upright (as Search by photo) -> queued as an upload
function artcheckupload(input) {
  var file = input.files && input.files[0];
  input.value = '';
  if(!file) { return; }
  var kind = $('input[name=artcheckkind]:checked').val() || 'card';
  $('#artcheckone').html('Reading the picture...');
  var url = URL.createObjectURL(file), img = new Image();
  img.onload = function() {
    URL.revokeObjectURL(url);
    var k = Math.min(1, ARTCHECK_LONG / Math.max(img.naturalWidth, img.naturalHeight));
    var canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * k));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * k));
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    var data = canvas.toDataURL('image/jpeg', 0.88);
    artcheckqueue('artcheckone', {image: data, kind: kind, name: file.name}, artchecklist, null, data);
  };
  img.onerror = function() {
    URL.revokeObjectURL(url);
    $('#artcheckone').html('<span class="error">That file could not be read as a picture. Try a JPEG or PNG.</span>');
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

// one finished job as HTML; pick (the card editor's instance id) adds the artist checkboxes
function artcheckresult(job, pick) {
  if(job.status == 'error') { return '<span class="error">The check failed: '+artcheckesc(job.error)+'</span>'; }
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

function artchecklist() {
  artcheckapi('jobs').then(function(r) {
    $('#artcheckworker').html(artcheckworker(r.worker));
    var rows = (r.jobs || []).map(function(j) {
      var top = ((j.result || {}).style || {}).candidates || [];
      var sig = (j.result || {}).signature || {};
      return '<tr><td>'+new Date(j.created).toLocaleString()+'</td><td>'+artcheckcard(j)+' #'+artcheckesc(j.printingid)+'</td>'+
        '<td>'+artcheckesc((j.artist || []).join(', '))+'</td><td>'+artcheckesc(j.status)+'</td>'+
        '<td>'+(top[0] ? artcheckesc(top[0].artist)+' '+Math.round(top[0].share*100)+'%' : '')+'</td>'+
        '<td>'+(sig.read ? '"'+artcheckesc(sig.read)+'"' : '')+'</td>'+
        '<td><a href="" onclick="artcheckshow(\''+artcheckesc(j.id)+'\'); return false">show</a></td><td>'+artcheckesc(j.uname)+'</td></tr>';
    });
    $('#artchecklist').html(rows.length ? '<tr><th>Queued</th><th>Printing</th><th>Credit</th><th>Status</th><th>Top by style</th><th>Signature</th><th></th><th>By</th></tr>'+rows.join('')
                                        : '<tr><td>No checks yet for this game.</td></tr>');
  }, function(e) { $('#artchecklist').html('<tr><td class="error">'+artcheckesc(artcheckerr(e))+'</td></tr>'); });
}

function artcheckshow(id) {
  artcheckapi('job', {id: id}).then(r => $('#artcheckone').html(r.job.status == 'done' || r.job.status == 'error' ? artcheckresult(r.job) : 'Job '+artcheckesc(id)+' is '+artcheckesc(r.job.status)+'.'),
                                    e => $('#artcheckone').html('<span class="error">'+artcheckesc(artcheckerr(e))+'</span>'));
}
