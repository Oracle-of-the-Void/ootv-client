// Admin → Config → Limits (loaded on first use by loadlimitsadmin in oracle.js; docs/admin/limits.md):
// how many times a day and a minute each level may use the photo features. Each feature is an
// oracle-all-structure item, database all: artphoto (Search by photo, read by ootv-search artembed)
// and artcheck (Photo → Find the artist, read by ootv-admin artcheck.mjs), {limits: {<level>: {day,
// minute}}}, read with GET /structure and saved with POST /update operation limits (site admins).
// The APIs reread them every 5 minutes. A missing item means the API's own defaults, shown here.

var LIMITSFEATURES = [
  {key: 'artphoto', name: 'Search by photo (Photo → Find the card)',
   levels: {admin: 'full permission on the game', maintainer: 'any other permission on the game'},
   defaults: {admin: {day: 500, minute: 10}, maintainer: {day: 100, minute: 5}}},
  {key: 'artcheck', name: 'Find the artist (Photo → Find the artist; uploads in Admin → Artist check too)',
   levels: {admin: 'artcheck or full permission on the game', member: 'any other permission on the game'},
   defaults: {admin: {day: 500, minute: 10}, member: {day: 30, minute: 3}}}
];
var limitsadminloaded = true;
var limitsitems = {};   // key -> the stored item, or null when there is none yet

function limitsopen() {
  $('#limitsadmin').html('<h3>Limits</h3><p>How many times each level may use a photo feature, per day (UTC) and per minute. '+
    '0 means not at all. The API rereads these every 5 minutes. Levels come from the user\'s permissions on the game '+
    '(Patreon tiers will add more). Site admins only; see the <a href="" onclick="loadadmindoc(\'limits\'); return false">guide</a>.</p>'+
    LIMITSFEATURES.map(f => '<div class="limitsfeature" id="limits-'+f.key+'">Loading '+htmlEncode(f.name)+'...</div>').join(''));
  LIMITSFEATURES.forEach(function(f) {
    $.ajax({url: apiuri+'/structure?database=all&key='+f.key, dataType: 'json', cache: false})
      .done(function(item) { limitsitems[f.key] = item; limitsdraw(f); })
      .fail(function(xhr) {
        if(xhr.status == 404) { limitsitems[f.key] = null; limitsdraw(f); }
        else { $('#limits-'+f.key).html('<span class="error">Could not read '+htmlEncode(f.key)+'.</span>'); }
      });
  });
}

function limitsdraw(f) {
  var item = limitsitems[f.key];
  var lim = (item && item.limits) || f.defaults;
  var levels = Object.keys(f.levels).concat(Object.keys(lim).filter(l => !(l in f.levels)));
  var row = l => '<tr data-level="'+htmlEncode(l)+'"><td><b>'+htmlEncode(l)+'</b><br><span class="limitsnote">'+htmlEncode(f.levels[l] || 'a level the API doesn\'t know yet')+'</span></td>'+
    ['day','minute'].map(p => '<td><input type="number" min="0" step="1" class="limitsval" data-period="'+p+'" value="'+
      htmlEncode(String(lim[l] && lim[l][p] !== undefined ? lim[l][p] : ''))+'" /></td>').join('')+'</tr>';
  $('#limits-'+f.key).html('<h4>'+htmlEncode(f.name)+'</h4>'+
    '<table class="limitstable"><tr><th>Level</th><th>Per day</th><th>Per minute</th></tr>'+levels.map(row).join('')+'</table>'+
    '<p class="limitsnote">'+(item ? 'Version '+(item.version || 0)+(item.uname ? ', last saved by '+htmlEncode(item.uname)+
      (item.updated ? ' on '+new Date(item.updated).toLocaleString() : '') : '') : 'Not saved yet: the API uses these defaults.')+
    (item && item.note ? '<br>'+htmlEncode(item.note) : '')+'</p>'+
    '<input type="button" value="Save" onclick="limitssave(\''+f.key+'\')" /> <span class="limitsstatus"></span>');
}

function limitssave(key) {
  var box = $('#limits-'+key), limits = {}, problem = null;
  box.find('tr[data-level]').each(function() {
    var level = $(this).data('level'), v = {};
    $(this).find('.limitsval').each(function() {
      var s = $.trim(this.value);
      if(!/^\d+$/.test(s)) { problem = level+': '+$(this).data('period')+' must be a whole number from 0'; }
      v[$(this).data('period')] = parseInt(s, 10);
    });
    limits[level] = v;
  });
  var status = (msg, err) => box.find('.limitsstatus').html('<span'+(err ? ' class="error"' : '')+'>'+htmlEncode(msg)+'</span>');
  if(problem) { status(problem, 1); return; }
  status('Saving...');
  $.ajax({type: 'POST', url: apiuri+'/update', contentType: 'application/json', dataType: 'json',
          data: JSON.stringify({uid: getuid(), database: 'all', operation: 'limits', key: key,
                                version: limitsitems[key] ? limitsitems[key].version || 0 : 0, data: {limits: limits}}),
          beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', getidtoken()); }})
    .done(function(r) {
      if(r.message == 'no changes') { status('No changes to save.'); return; }
      $.ajax({url: apiuri+'/structure?database=all&key='+key, dataType: 'json', cache: false})
        .done(function(item) { limitsitems[key] = item; limitsdraw(LIMITSFEATURES.find(f => f.key == key)); $('#limits-'+key+' .limitsstatus').text('Saved (version '+r.version+'). The API uses it within 5 minutes.'); });
    })
    .fail(function(xhr) { status((xhr.responseJSON && xhr.responseJSON.error) || 'The save failed.', 1); });
}
