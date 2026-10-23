// Admin -> Artist check (ootv-claude ARTIST-CHECK.md; guide docs/admin/artist-check.md): who painted
// a printing, by painting style and by any signature in the art. POST /artcheck (ootv-search
// admin/artcheck.mjs) only queues and reads jobs; a LAN worker (ootv-backups artcheck-worker.py)
// does the work and writes the result. Nothing is written to the card. Loaded on demand by
// loadartcheck() and artcheckinline() in oracle.js.

var artcheckpoll = {};     // target element id -> timer of the job being waited for

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
    '<div id="artcheckone"></div><p id="artcheckworker"></p><table class="artchecklist" id="artchecklist"></table>');
  artchecklist();
  if(cardid) { artcheckgo(); }
}

function artcheckgo() {
  var cardid = $.trim($('#artcheckcard').val()), printingid = $.trim($('#artcheckprinting').val());
  if(!/^\d+$/.test(cardid) || !printingid) { $('#artcheckone').html('<span class="error">A card id and a printing id, please.</span>'); return; }
  artcheckrun('artcheckone', cardid, printingid, artchecklist);
}

// queue a check and draw it into #target as it moves along; then() runs when it's finished
function artcheckrun(target, cardid, printingid, then) {
  clearTimeout(artcheckpoll[target]);
  $('#'+target).html('Queueing...');
  artcheckapi('queue', {cardid: cardid, printingid: printingid}).then(function(r) {
    var wait = function(job, worker) {
      if(job.status == 'done' || job.status == 'error') {
        $('#'+target).html(artcheckresult(job));
        if(then) { then(); }
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
  var url = location.pathname+statehash({'view': 'card', 'cardid': m.cardid, 'prid': m.printingid});
  return '<a href="'+artcheckesc(url)+'" target="_blank">'+artcheckesc(m.title)+'</a> ('+artcheckesc(String(m.set || '').replace(/&ndash;/g,'–'))+')';
}

// one finished job as HTML
function artcheckresult(job) {
  if(job.status == 'error') { return '<span class="error">The check failed: '+artcheckesc(job.error)+'</span>'; }
  var r = job.result || {}, s = r.style || {}, sig = r.signature || {};
  var credit = (job.artist || []).join(', ') || '(no credit)';
  var html = '<div class="artcheckresult"><b>'+artcheckesc(job.title)+'</b>, printing '+artcheckesc(job.printingid)+
    ' ('+artcheckesc(String(job.set || '').replace(/&ndash;/g,'–'))+'). Credited: <b>'+artcheckesc(credit)+'</b>';
  html += '<div><b>Signature</b>: '+(sig.error ? '<span class="error">not read ('+artcheckesc(sig.error)+')</span>' :
    sig.read ? '"'+artcheckesc(sig.read)+'"'+(sig.match ? ' (matches the credit: '+sig.match+')' :
      ' (doesn\'t match the credit: look at the art, the model misreads small signatures)') : 'none read')+'</div>';
  if((r.same || []).length) {
    html += '<div><b>Same painting</b>: '+r.same.map(m => artcheckcard(m)+' '+artcheckesc((m.artist || []).join(', '))).join('; ')+'</div>';
  }
  html += '<div><b>By style</b> (the 10 nearest other paintings): '+(s.candidates || []).map(c =>
    '<span class="'+(c.share >= 0.5 ? 'artcheckstrong' : '')+'">'+artcheckesc(c.artist)+' '+Math.round(c.share*100)+'%</span>').join(', ')+
    ' <span class="artchecknote">(a share of 50% or more was the right artist 88% of the time in testing; below that, candidates only)</span></div>';
  html += '<details><summary>Nearest paintings</summary><ol>'+(s.nearest || []).map(m =>
    '<li>'+artcheckcard(m)+': '+artcheckesc((m.artist || []).join(', '))+' <span class="artchecknote">'+m.score+'</span></li>').join('')+'</ol></details>';
  return html+'</div>';
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
