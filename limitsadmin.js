// Admin → Config → Limits (loaded on first use by loadlimitsadmin in oracle.js; docs/admin/limits.md):
// how many times a day and a minute each level may use the photo features: Find the card and Find
// the artist share one count (the user's call, 2026-10-23), so one oracle-all-structure item,
// database all, key artphoto (read by ootv-search artembed and ootv-admin artcheck.mjs),
// {limits: {<level>: {day, minute}}}, read with GET /structure and saved with POST /update operation
// limits (site admins). An empty box = no limit. The APIs reread it every 5 minutes. A missing item
// means the APIs' own defaults, shown here.
// Also the card page's Larger image and the Large card view (all/largeimage, read by ootv-search
// routes/largeimage.js and oracle.js imagetier()): {limits: {<level>: {size: 'master' | 'large'}}}, a
// pulldown per level; a level left out gets neither.

var LIMITSFEATURES = [
  {key: 'artphoto', name: 'Photo: Find the card and Find the artist (one count; uploads in Admin → Artist check too)',
   levels: {admin: 'full permission on the game (Find the artist: or artcheck)', maintainer: 'any other permission on the game',
            'patreon-free': 'Patreon Free tier', 'patreon-ashigaru': 'Patreon Ashigaru tier',
            'patreon-samurai': 'Patreon Samurai tier', 'patreon-hatamoto': 'Patreon Hatamoto tier',
            'patreon-daimyo': 'Patreon Daimyo tier', 'patreon-kami': 'Patreon Kami tier'},
   defaults: {admin: {}, maintainer: {}}},
  {key: 'largeimage', type: 'size', name: 'Larger image and the Large card view',
   levels: {admin: 'full permission on the game', maintainer: 'any other permission on the game',
            'patreon-free': 'Patreon Free tier', 'patreon-ashigaru': 'Patreon Ashigaru tier',
            'patreon-samurai': 'Patreon Samurai tier', 'patreon-hatamoto': 'Patreon Hatamoto tier',
            'patreon-daimyo': 'Patreon Daimyo tier', 'patreon-kami': 'Patreon Kami tier'},
   defaults: IMAGESIZEDEFAULTS}
];
var LIMITSSIZES = [['', 'Neither'], ['master', 'Master (full-size scan, 745 px)'], ['large', 'Large (1490 px where a printing has one, else the master)']];
var limitsadminloaded = true;
var limitsitems = {};   // key -> the stored item, or null when there is none yet

function limitsopen() {
  $('#limitsadmin').html('<h3>Limits</h3><p>What each level gets: how many times it may use a photo feature, per day (UTC) and per minute '+
    '(0 means not at all; an empty box means no limit; a level with both boxes empty that was never saved stays off), and which larger card image it sees. '+
    'The APIs reread these every 5 minutes. Levels come from the user\'s '+
    'permissions on the game, or their Patreon tier (patreon- and the tier\'s name; staff on every game: the tier they picked in Settings). Site admins only; see the <a href="" onclick="loadadmindoc(\'limits\'); return false">guide</a>.</p>'+
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
  // a level not saved yet stays unsaved (no access) while both its boxes are empty
  var cells = f.type == 'size' ?
    l => '<td><select class="limitssize">'+LIMITSSIZES.map(o => '<option value="'+o[0]+'"'+(((lim[l] || {}).size || '') == o[0] ? ' selected' : '')+'>'+
                                                     htmlEncode(o[1])+'</option>').join('')+'</select></td>' :
    l => ['day','minute'].map(p => '<td><input type="number" min="0" step="1" class="limitsval" data-period="'+p+'" value="'+
      htmlEncode(String(lim[l] && lim[l][p] !== undefined ? lim[l][p] : ''))+'" /></td>').join('');
  var row = l => '<tr data-level="'+htmlEncode(l)+'" data-saved="'+(l in lim ? 1 : 0)+'"><td><b>'+htmlEncode(l)+'</b><br><span class="limitsnote">'+htmlEncode(f.levels[l] || 'a level the API doesn\'t know yet')+'</span></td>'+
    cells(l)+'</tr>';
  $('#limits-'+f.key).html('<h4>'+htmlEncode(f.name)+'</h4>'+
    '<table class="limitstable"><tr><th>Level</th>'+(f.type == 'size' ? '<th>Image</th>' : '<th>Per day</th><th>Per minute</th>')+'</tr>'+levels.map(row).join('')+'</table>'+
    '<p class="limitsnote">'+(item ? 'Version '+(item.version || 0)+(item.uname ? ', last saved by '+htmlEncode(item.uname)+
      (item.updated ? ' on '+new Date(item.updated).toLocaleString() : '') : '') : 'Not saved yet: the API uses these defaults.')+
    (item && item.note ? '<br>'+htmlEncode(item.note) : '')+'</p>'+
    '<input type="button" value="Save" onclick="limitssave(\''+f.key+'\')" /> <span class="limitsstatus"></span>');
}

function limitssave(key) {
  var box = $('#limits-'+key), limits = {}, problem = null;
  box.find('tr[data-level]').each(function() {
    var level = $(this).data('level'), v = {};
    if($(this).find('.limitssize').length) {
      var size = $(this).find('.limitssize').val();
      if(size) { limits[level] = {size: size}; }
      return;
    }
    if(!$(this).data('saved') && $(this).find('.limitsval').filter(function() { return $.trim(this.value) !== ''; }).length == 0) {
      return;
    }
    $(this).find('.limitsval').each(function() {
      var s = $.trim(this.value);
      if(s === '') { return; }      // no limit
      if(!/^\d+$/.test(s)) { problem = level+': '+$(this).data('period')+' must be a whole number from 0, or empty for no limit'; }
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
      var saved = 'Saved (version '+r.version+'). The API uses it within 5 minutes.';
      status(saved);
      $.ajax({url: apiuri+'/structure?database=all&key='+key, dataType: 'json', cache: false})
        .done(function(item) { limitsitems[key] = item; limitsdraw(LIMITSFEATURES.find(f => f.key == key)); $('#limits-'+key+' .limitsstatus').text(saved); });
    })
    .fail(function(xhr) { status((xhr.responseJSON && xhr.responseJSON.error) || 'The save failed.', 1); });
}
