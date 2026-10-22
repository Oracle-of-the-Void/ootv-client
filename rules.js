// Rules section: the rulebook shelf and page viewer. Loaded on first use by rulesshow() in oracle.js.
// The shelf is the structure item <game>/rulebooks (books: {<id>: {title, pages, cover, built, order, type, tags, arc, ...}});
// each book lives on the images bucket, per game: <imageuri>rulebooks/<id>/book.json, text.json,
// <NNN>_{select,details,master}.webp per page and lines/<NNN>.json (the page's words and their boxes)
// (built by ootv-import SCRIPTS/rulebook-convert.py; docs/admin/rulebooks.md).
// Urls: #view=rules is the shelf, #rulebook=<id>,#page=<n> a page, and #find=<phrase> (without #page: its
// first page), #line=<n> or #at=<percent> a place on it, zoomed to the page's width. Turning pages replaces
// the history entry, so Back leaves the book rather than stepping through every page.
window.rulesloaded = true;

var rulesshelf = null;      // the shelf ({game, books: [...] by date: year, then order}), once loaded
var rulesbook = null;       // book.json of the open book
var rulestext = null;       // text.json of the open book, loaded on the first search
var ruleslines = {};        // page -> lines/<NNN>.json of the open book ([[block, [[x0, y0, x1, y1, word], ...]], ...]), or a request
var rulesselect = false;    // select mode: the text layer takes the mouse and fingers (selecting, copying) instead of turning and dragging
var rulesmarkzoomed = '';   // the mark (rulesmarkkey) last zoomed to, so redrawing the page doesn't zoom again
var rulespanel = null;      // side panel shown: 'contents', 'pages', 'search' or null
var ruleszoom = 1;          // 1: the page(s) fit the stage; more: larger, dragged or scrolled around (ruleszoomto)
var rulesloading = null;    // the book id being fetched
var rulesdownloads = false; // show the book's download buttons (book.json downloads); off for now (2026-10-20)

function rulesbase() {
  return dbinfo[database].imageuri+'rulebooks/';
}
// page images keep their names across rebuilds (cached a day), so ?v=<built> makes browsers fetch a rebuilt book's
function rulespageurl(n,size) {
  return rulesbase()+rulesbook.id+'/'+String(n).padStart(3,'0')+'_'+size+'.webp'+(rulesbook.built ? '?v='+rulesbook.built : '');
}
function rulesesc(s) {
  return $('<div>').text(s == null ? '' : String(s)).html();
}
// last page read per book, this browser only
function ruleslastpages() {
  try { return JSON.parse(localStorage.getItem('rulebookpages') || '{}') || {}; } catch(e) { return {}; }
}
function rulessavepage(id,page) {
  try {
    var pages = ruleslastpages();
    pages[database+'/'+id] = page;
    localStorage.setItem('rulebookpages', JSON.stringify(pages));
  } catch(e) {}
}

// draw what rulesstate says: the shelf, or a book at a page
function rulesrender() {
  if(rulesstate.book) {
    if(rulesbook && rulesbook.id == rulesstate.book) {
      rulessizestage();   // the window may have changed while another view was up
      rulesgo(rulesstate.page, false);
    } else {
      rulesopenbook(rulesstate.book, rulesstate.page);
    }
  } else {
    rulesdrawshelf();
  }
}

// ********** the shelf **********
function rulesloadshelf(done) {
  if(rulesshelf !== null && rulesshelf.game == database) { done(); return; }
  $.ajax({url: apiuri+'/structure?database='+database+'&key=rulebooks', dataType: 'json'})
    .done(function(data) {
      var books = Object.values((data && data.books) || {});
      // by date: the book's year, then its place in the list (order) within a year
      books.sort(function(a,b) {
        return ((+a.year || 9999) - (+b.year || 9999)) || ((a.order ?? 999) - (b.order ?? 999)) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
      });
      rulesshelf = {game: database, books: books};
      done();
    })
    .fail(function() { rulesshelf = {game: database, books: []}; done(); });
}
function rulesdrawshelf() {
  if(rulesisfull()) { rulesfullscreen(false); }
  rulesbook = null;
  rulestext = null;
  $('body').removeClass('rulesreading');
  var area = $('#rulesarea');
  if(rulesshelf === null || rulesshelf.game != database) {
    area.html('<div class="rulesshelf"><h2>Rules</h2><p>Loading&hellip;</p></div>');
  }
  rulesloadshelf(function() {
    if(rulesstate.book) { return; }  // a book was opened meanwhile
    var game = dbinfo[database].name || database;
    var out = '<div class="rulesshelf"><h2>Rules</h2>';
    if(!rulesshelf.books.length) {
      out += '<p>No rulebooks for '+rulesesc(game)+' yet.</p></div>';
      area.html(out);
      return;
    }
    out += '<h3>Rulebooks</h3>'+rulesfilterbar()+'<div class="rulesbooks"></div>';
    area.html(out+'</div>');
    rulesdrawbooks();
  });
}

// ********** shelf filters **********
// Each book has a type (Complete, Addendum, Special: rules for one format, like draft or siege), or a list of
// them when it's more than one, tags (Base set, Last complete rules in arc, ...) and an arc. The bar offers only the values some book has;
// the choice is kept per game in this browser.
var RULESTYPES = ['Complete', 'Addendum', 'Special'];   // the order on the bar; other types follow
var rulesfilter = null;   // {game, type, arc, tags: [...]}
function rulesbooktypes(b) { return Array.isArray(b.type) ? b.type : (b.type ? [b.type] : []); }
function rulesfilterload() {
  if(rulesfilter && rulesfilter.game == database) { return rulesfilter; }
  var saved = {};
  try { saved = (JSON.parse(localStorage.getItem('rulebookfilter') || '{}') || {})[database] || {}; } catch(e) {}
  rulesfilter = {game: database, type: saved.type || '', arc: saved.arc || '', tags: saved.tags || []};
  return rulesfilter;
}
function rulesfiltersave() {
  try {
    var all = JSON.parse(localStorage.getItem('rulebookfilter') || '{}') || {};
    all[database] = {type: rulesfilter.type, arc: rulesfilter.arc, tags: rulesfilter.tags};
    localStorage.setItem('rulebookfilter', JSON.stringify(all));
  } catch(e) {}
}
// the values books have, in shelf order (types in RULESTYPES order)
function rulesfiltervalues() {
  var types = [], tags = [], arcs = [];
  rulesshelf.books.forEach(function(b) {
    rulesbooktypes(b).forEach(function(t) { if(!types.includes(t)) { types.push(t); } });
    (b.tags || []).forEach(function(t) { if(!tags.includes(t)) { tags.push(t); } });
    if(b.arc && !arcs.includes(b.arc)) { arcs.push(b.arc); }
  });
  var rank = function(t) { var i = RULESTYPES.indexOf(t); return i < 0 ? RULESTYPES.length : i; };
  types.sort(function(a,b) { return rank(a) - rank(b); });
  return {types: types, tags: tags, arcs: arcs};
}
function rulesfilterbar() {
  var f = rulesfilterload(), v = rulesfiltervalues();
  // a saved choice no book has any more is dropped
  if(!v.types.includes(f.type)) { f.type = ''; }
  if(!v.arcs.includes(f.arc)) { f.arc = ''; }
  f.tags = f.tags.filter(function(t) { return v.tags.includes(t); });
  if(!v.types.length && !v.tags.length && v.arcs.length < 2) { return ''; }
  var pill = function(kind, value, label, on) {
    return '<button type="button" class="rulespill'+(on ? ' rulespillon' : '')+'" data-kind="'+kind+'" data-value="'+rulesesc(value)+'"'+
      ' aria-pressed="'+(on ? 'true' : 'false')+'">'+rulesesc(label)+'</button>';
  };
  var out = '<div class="rulesfilters">';
  if(v.types.length) {
    out += '<span class="rulesfiltergroup"><span class="rulesfilterlabel">Type</span>'+pill('type', '', 'All', !f.type)+
      v.types.map(function(t) { return pill('type', t, t, f.type == t); }).join('')+'</span>';
  }
  if(v.tags.length) {
    out += '<span class="rulesfiltergroup"><span class="rulesfilterlabel">Tags</span>'+
      v.tags.map(function(t) { return pill('tag', t, t, f.tags.includes(t)); }).join('')+'</span>';
  }
  if(v.arcs.length > 1) {
    out += '<span class="rulesfiltergroup"><label class="rulesfilterlabel" for="rulesarc">Arc</label>'+
      '<select id="rulesarc" class="rulesarc"><option value="">All arcs</option>'+
      v.arcs.map(function(a) { return '<option'+(f.arc == a ? ' selected' : '')+'>'+rulesesc(a)+'</option>'; }).join('')+
      '</select></span>';
  }
  out += '<span class="rulesfiltercount"></span></div>';
  return out;
}
function rulesfilterpass(b) {
  var f = rulesfilter;
  return (!f.type || rulesbooktypes(b).includes(f.type)) && (!f.arc || b.arc == f.arc) &&
    f.tags.every(function(t) { return (b.tags || []).includes(t); });
}
$(document).on('click', '.rulesfilters button.rulespill', function() {
  var f = rulesfilterload(), kind = $(this).data('kind'), value = String($(this).data('value'));
  if(kind == 'type') {
    f.type = f.type == value ? '' : value;
  } else {
    f.tags = f.tags.includes(value) ? f.tags.filter(function(t) { return t != value; }) : f.tags.concat([value]);
  }
  rulesfiltersave();
  $('.rulesfilters button.rulespill').each(function() {
    var k = $(this).data('kind'), val = String($(this).data('value'));
    var on = k == 'type' ? f.type == val : f.tags.includes(val);
    $(this).toggleClass('rulespillon', on).attr('aria-pressed', on ? 'true' : 'false');
  });
  rulesdrawbooks();
});
$(document).on('change', '.rulesfilters select.rulesarc', function() {
  rulesfilterload().arc = $(this).val();
  rulesfiltersave();
  rulesdrawbooks();
});

function rulesdrawbooks() {
  var last = ruleslastpages(), out = '', shown = 0;
  rulesfilterload();
  rulesshelf.books.forEach(function(b) {
    if(!rulesfilterpass(b)) { return; }
    shown++;
    var cover = rulesbase()+b.id+'/001_select.webp'+(b.built ? '?v='+b.built : '');
    var at = last[database+'/'+b.id];
    // the types show, except the usual Complete
    var marks = rulesbooktypes(b).filter(function(t) { return t != 'Complete'; }).concat(b.tags || []);
    out += '<a class="rulesbookcard" href="#game='+database+',#rulebook='+b.id+(at > 1 ? ',#page='+at : '')+'" data-book="'+rulesesc(b.id)+'">'+
      '<span class="rulescover"><img loading="lazy" alt="" src="'+cover+'"'+
      (b.cover ? ' width="'+b.cover[0]+'" height="'+b.cover[1]+'"' : '')+'></span>'+
      '<span class="rulesbooktitle">'+rulesesc(b.title)+'</span>'+
      (b.subtitle ? '<span class="rulesbooksub">'+rulesesc(b.subtitle)+'</span>' : '')+
      '<span class="rulesbookmeta">'+[b.year, b.arc, b.pages+' pages'].filter(x => x).map(rulesesc).join(' &middot; ')+
      (at > 1 ? ' &middot; <b>at p. '+at+'</b>' : '')+'</span>'+
      (marks.length ? '<span class="rulesbookmarks">'+marks.map(function(m) { return '<span class="rulesbookmark">'+rulesesc(m)+'</span>'; }).join('')+'</span>' : '')+
      (b.note ? '<span class="rulesbooknote">'+rulesesc(b.note)+'</span>' : '')+'</a>';
  });
  $('#rulesarea .rulesbooks').html(shown ? out : '<p class="rulesnomatch">No rulebooks match these filters.</p>');
  $('#rulesarea .rulesfiltercount').text(shown < rulesshelf.books.length ? shown+' of '+rulesshelf.books.length+' books' : '');
}
$(document).on('click', 'a.rulesbookcard', function(e) {
  if(e.ctrlKey || e.metaKey || e.shiftKey || e.button) { return; }  // a new tab keeps the link
  e.preventDefault();
  var id = $(this).data('book');
  rulesopenbook(id, ruleslastpages()[database+'/'+id] || 1, true);
});

// ********** a book **********
function rulesopenbook(id,page,push=false) {
  if(push || rulesstate.book != id) { ruleslines = {}; }
  rulesstate.book = id;
  rulesstate.page = page ?? 1;
  if(push) {
    rulesclearmark();
    seturl(viewstate('rules'));
  }
  if(rulesloading == id) { return; }
  rulesloading = id;
  $('#rulesarea').html('<div class="rulesshelf"><p>Loading&hellip;</p></div>');
  $.ajax({url: rulesbase()+id+'/book.json', dataType: 'json', cache: true})
    .done(function(book) {
      rulesloading = null;
      if(rulesstate.book != id) { return; }
      rulesbook = book;
      rulestext = null;
      ruleslines = {};
      ruleszoom = 1;
      rulesdrawreader();
      rulesgo(rulesstate.page, false);
    })
    .fail(function() {
      rulesloading = null;
      $('#rulesarea').html('<div class="rulesshelf"><p class="error">No rulebook "'+rulesesc(id)+'".</p>'+
        '<p><span class="button gray" onclick="rulesclosebook();">All rulebooks</span></p></div>');
    });
}
function rulesclosebook() {
  rulesstate.book = null;
  rulesstate.page = 1;
  rulesclearmark();
  seturl(viewstate('rules'));
  rulesdrawshelf();
}

function rulesicon(name) {
  return '<svg class="feather"><use xlink:href="res/feather-sprite.svg#'+name+'"></svg>';
}
function rulesdrawreader() {
  var b = rulesbook, n = b.pages.length;
  if(rulespanel == 'contents' && !(b.toc && b.toc.length)) { rulespanel = null; }
  var title = rulesesc(b.title)+(b.subtitle ? ' <span class="rulesbooksub">'+rulesesc(b.subtitle)+'</span>' : '');
  var dl = (rulesdownloads && b.downloads || []).map(function(d) {
    return '<a class="button gray" href="'+rulesbase()+b.id+'/'+encodeURIComponent(d.file)+'" target="_blank" download>'+
      rulesicon('download')+' '+rulesesc(d.label)+(d.bytes ? ' <small>'+rulessize(d.bytes)+'</small>' : '')+'</a>';
  }).join(' ');
  $('#rulesarea').html(
    '<div class="rulesreader">'+
    '<div class="rulestop">'+
      '<button class="rulesbtn" onclick="rulesclosebook();" aria-label="All rulebooks" data-balloon-pos="down-left">'+rulesicon('book')+'</button>'+
      '<span class="rulestitle">'+title+'</span>'+
      '<span class="rulestools">'+
      (b.toc && b.toc.length ? '<button class="rulesbtn" data-panel="contents" onclick="rulestogglepanel(\'contents\');" aria-label="Contents" data-balloon-pos="down">'+rulesicon('list')+'</button>' : '')+
      '<button class="rulesbtn" data-panel="pages" onclick="rulestogglepanel(\'pages\');" aria-label="Pages" data-balloon-pos="down">'+rulesicon('grid')+'</button>'+
      (b.text ? '<button class="rulesbtn" data-panel="search" onclick="rulestogglepanel(\'search\');" aria-label="Search this book" data-balloon-pos="down">'+rulesicon('search')+'</button>' : '')+
      (b.lines ? '<button class="rulesbtn rulesselectbtn'+(rulesselect ? ' searchviewactive' : '')+'" onclick="rulestoggleselect();" aria-label="Select text to copy or link (T)" data-balloon-pos="down">'+rulesicon('type')+'</button>' : '')+
      '<button class="rulesbtn rulesspreadbtn" onclick="rulestogglespread();" aria-label="One page / two pages" data-balloon-pos="down">'+rulesicon('columns')+'</button>'+
      '<button class="rulesbtn" onclick="rulesstepzoom(-1);" aria-label="Zoom out (-)" data-balloon-pos="down">'+rulesicon('zoom-out')+'</button>'+
      '<button class="rulesbtn ruleszoomlabel" onclick="ruleszoomto(1);" aria-label="Fit the page (0)" data-balloon-pos="down">100%</button>'+
      '<button class="rulesbtn" onclick="rulesstepzoom(1);" aria-label="Zoom in (+, Ctrl+wheel, pinch)" data-balloon-pos="down">'+rulesicon('zoom-in')+'</button>'+
      (b.text ? '<button class="rulesbtn" onclick="rulescopypage();" aria-label="Copy the text of this page (C)" data-balloon-pos="down-right">'+rulesicon('copy')+'</button>' : '')+
      '<button class="rulesbtn" onclick="rulescopylink();" aria-label="Copy a link to this page (or to the text selected)" data-balloon-pos="down-right">'+rulesicon('link')+'</button>'+
      '<button class="rulesbtn rulesfullbtn" onclick="rulesfullscreen();" aria-label="Full screen (F)" data-balloon-pos="down-right">'+rulesicon(rulesisfull() ? 'minimize' : 'maximize')+'</button>'+
      '</span>'+
    '</div>'+
    '<div class="rulesbody">'+
      '<div class="rulespanel" style="display:none"></div>'+
      '<div class="rulesstage'+(rulesselect && b.lines ? ' rulesselecting' : '')+'" tabindex="-1"><div class="rulesspread"></div>'+
        '<div class="rulesturn rulesturnprev" onclick="rulesturnclick(-1);" title="Previous page"></div>'+
        '<div class="rulesturn rulesturnnext" onclick="rulesturnclick(1);" title="Next page"></div>'+
      '</div>'+
    '</div>'+
    '<div class="rulesbottom">'+
      '<button class="rulesbtn" onclick="rulesgo(1);" aria-label="First page" data-balloon-pos="up-left">'+rulesicon('chevrons-left')+'</button>'+
      '<button class="rulesbtn" onclick="rulesstep(-1);" aria-label="Previous (left arrow)" data-balloon-pos="up">'+rulesicon('chevron-left')+'</button>'+
      '<span class="rulespageno"><input type="text" inputmode="numeric" class="rulespageinput" size="3" aria-label="Page"> / '+n+'</span>'+
      '<button class="rulesbtn" onclick="rulesstep(1);" aria-label="Next (right arrow)" data-balloon-pos="up">'+rulesicon('chevron-right')+'</button>'+
      '<button class="rulesbtn" onclick="rulesgo('+n+');" aria-label="Last page" data-balloon-pos="up">'+rulesicon('chevrons-right')+'</button>'+
      '<input type="range" class="rulesslider" min="1" max="'+n+'" value="1" aria-label="Flip through">'+
      (b.note ? '<span class="rulesnote">'+rulesesc(b.note)+'</span>' : '')+
      '<span class="rulesdownloads">'+dl+'</span>'+
    '</div>'+
    '</div>');
  $('body').addClass('rulesreading');
  window.scrollTo(0, 0);   // the whole reader on screen, wherever the shelf was scrolled to
  rulesdrawpanel();
  rulessizestage();
  // the arrow keys turn pages straight away, not move the cursor in the sidebar's search box
  if($(document.activeElement).is('input, textarea, select')) { document.activeElement.blur(); }
  var stage = $('#rulesarea .rulesstage')[0];
  stage.focus({preventScroll: true});
  // Ctrl+wheel (and a trackpad pinch, which arrives as one) zooms at the pointer; jQuery can't make it non-passive.
  // Not zoomed, the plain wheel turns pages (rulesturnwheel); zoomed, it scrolls the page.
  stage.addEventListener('wheel', function(e) {
    if(e.ctrlKey) {
      e.preventDefault();
      ruleszoomto(ruleszoom * Math.exp(-e.deltaY * 0.002), e.clientX, e.clientY);   // a wheel notch (100) is about 1.2x
    } else if(ruleszoom <= 1.001) {
      e.preventDefault();
      rulesturnwheel(e);
    }
  }, {passive: false});
  // the phone's own pinch-zoom of the whole page would fight ours (iOS doesn't always honour touch-action: none)
  var nogesture = function(e) { e.preventDefault(); };
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function(t) { stage.addEventListener(t, nogesture, {passive: false}); });
  stage.addEventListener('touchmove', function(e) { if(!rulesselecting()) { e.preventDefault(); } }, {passive: false});
}

// Full screen: the reader covers the window (rulesfull), and the browser goes full screen where it can
// (not iPhones, which only do that for video). Leaving the browser's full screen (Esc) leaves ours.
function rulesisfull() {
  return $('body').hasClass('rulesfull');
}
function rulesfullscreen(on) {
  if(on === undefined) { on = !rulesisfull(); }
  $('body').toggleClass('rulesfull', on);
  var de = document.documentElement;
  if(on && !document.fullscreenElement && de.requestFullscreen) {
    de.requestFullscreen().catch(function() {});
  } else if(!on && document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(function() {});
  }
  $('#rulesarea .rulesfullbtn').html(rulesicon(on ? 'minimize' : 'maximize'));
  if(rulesbook) {
    rulessizestage();
    rulesgo(rulesstate.page, false);
  }
}
$(document).on('fullscreenchange', function() {
  if(!document.fullscreenElement && rulesisfull()) { rulesfullscreen(false); }
});
function rulessize(bytes) {
  return bytes > 1048576 ? (bytes/1048576).toFixed(1)+' MB' : Math.ceil(bytes/1024)+' KB';
}

// two pages side by side: portrait pages on a wide enough stage, unless turned off. Landscape pages
// (scanned spreads) are always one at a time. Page 1 is the cover, so spreads are 2-3, 4-5, ...
function rulesspreadon() {
  try { if(localStorage.getItem('rulebookspread') == 'off') { return false; } } catch(e) {}
  var stage = $('#rulesarea .rulesstage');
  return stage.width() > stage.height() * 1.05 && !narrowscreen();
}
function rulesshown(page) {
  var n = rulesbook.pages.length;
  page = Math.max(1, Math.min(n, page));
  var portrait = function(p) { return p >= 1 && p <= n && rulesbook.pages[p-1][0] < rulesbook.pages[p-1][1]; };
  if(!rulesspreadon() || page == 1 || !portrait(page)) { return [page]; }
  var left = page % 2 == 0 ? page : page - 1;
  if(left < 2 || !portrait(left)) { return [page]; }
  return portrait(left + 1) ? [left, left + 1] : [left];
}
function rulestogglespread() {
  try { localStorage.setItem('rulebookspread', rulesspreadon() ? 'off' : 'on'); } catch(e) {}
  rulesgo(rulesstate.page, false);
}
// zoom: 1 fits the page(s) in the stage, up to RULESMAXZOOM times that. The point at clientX/Y (default: the
// stage's middle) stays where it is on screen.
var RULESMAXZOOM = 8;
function ruleszoomto(z,cx,cy) {
  var el = $('#rulesarea .rulesstage')[0];
  if(!el) { return; }
  z = Math.max(1, Math.min(RULESMAXZOOM, z));
  var r = el.getBoundingClientRect();
  if(cx === undefined) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
  // where the point falls on the pages, as a fraction of their extent
  var before = rulespagesrect();
  var fx = (cx - before.left) / before.width, fy = (cy - before.top) / before.height;
  ruleszoom = z;
  ruleslayout();
  var after = rulespagesrect();
  el.scrollLeft += after.left + fx * after.width - cx;
  el.scrollTop += after.top + fy * after.height - cy;
}
function rulesstepzoom(dir) {
  ruleszoomto(ruleszoom * (dir > 0 ? 1.25 : 0.8));
}
// the box around the pages shown, in client coordinates
function rulespagesrect() {
  var pages = $('#rulesarea .rulespage');
  var a = pages.first()[0].getBoundingClientRect(), b = pages.last()[0].getBoundingClientRect();
  return {left: a.left, top: Math.min(a.top, b.top), width: b.right - a.left, height: Math.max(a.bottom, b.bottom) - Math.min(a.top, b.top)};
}
// the image size for a page drawn px device pixels on its long side: the smallest that's sharp enough
function rulesimagesize(px) {
  var sizes = rulesbook.sizes;
  if(px > sizes.master * 1.1 && sizes.zoom) { return 'zoom'; }
  return px > sizes.details * 1.1 ? 'master' : 'details';
}
var rulesimageorder = ['details', 'master', 'zoom'];
// size the pages shown for the stage and the zoom; a page drawn larger than its image gets the next size up
function ruleslayout() {
  var stage = $('#rulesarea .rulesstage');
  var r = stage[0].getBoundingClientRect();
  var pages = stage.find('.rulespage');
  var dims = pages.map(function() { return [rulesbook.pages[$(this).data('page')-1]]; }).get();
  var ratio = dims.reduce((w, d) => w + d[0] / d[1], 0);
  var h = Math.floor(Math.min(r.height, r.width / ratio) * ruleszoom);
  var dpr = window.devicePixelRatio || 1;
  pages.each(function(i) {
    var w = Math.floor(h * dims[i][0] / dims[i][1]);
    $(this).css({width: w+'px', height: h+'px'});
    var img = $(this).find('img');
    img.attr({width: w, height: h});
    // only ever upgrade, so zooming out doesn't reload a page already drawn
    var want = rulesimagesize(Math.max(w, h) * dpr);
    var have = ((img.attr('src') || '').match(/_([a-z]+)\.webp/) || [])[1];
    if(have && rulesimageorder.indexOf(want) > rulesimageorder.indexOf(have)) {
      img.attr('src', rulespageurl($(this).data('page'), want));
    }
  });
  stage.toggleClass('ruleszoomed', ruleszoom > 1.001);
  $('#rulesarea .ruleszoomlabel').text(Math.round(ruleszoom * 100)+'%');
}

function rulesstep(dir) {
  var shown = rulesshown(rulesstate.page);
  rulesgo(dir > 0 ? shown[shown.length-1] + 1 : shown[0] - 1);
}
// the wheel, not zoomed: one notch turns one page. A trackpad sends a stream of small deltas (and
// momentum after the fingers lift), so those add up to one turn, and the rest of the stream is ignored
// until it pauses; a big delta (a wheel notch) a moment after the last turn turns again.
var ruleswheel = {acc: 0, last: 0, turned: 0, locked: false};
function rulesturnwheel(e) {
  var w = ruleswheel, now = e.timeStamp;
  if(now - w.last > 200) { w.acc = 0; w.locked = false; }   // a pause ends the gesture
  w.last = now;
  var dy = e.deltaY * (e.deltaMode == 1 ? 40 : e.deltaMode == 2 ? 800 : 1);   // lines, pages → pixels
  var notch = Math.abs(dy) >= 50 && now - w.turned > 250;
  if(w.locked && !notch) { return; }
  w.acc += dy;
  if(Math.abs(w.acc) < 50 && !notch) { return; }
  rulesstep(w.acc > 0 ? 1 : -1);
  w.acc = 0;
  w.locked = true;
  w.turned = now;
}
// show page (and its spread partner); url: the address bar follows (replacing the entry)
function rulesgo(page,url=true) {
  if(!rulesbook) { return; }
  if(page === 0 && rulesstate.find) { rulesfindpage(url); return; }   // #find without #page: its first page
  var n = rulesbook.pages.length;
  page = Math.max(1, Math.min(n, parseInt(page, 10) || 1));
  if(page != rulesstate.page) { rulesclearmark(); }   // the place marked was on the page left
  rulesstate.page = page;
  rulessavepage(rulesbook.id, page);
  var shown = rulesshown(page);
  var stage = $('#rulesarea .rulesstage');
  // details first; ruleslayout sizes the pages and moves them to the master when they're drawn large
  stage.find('.rulesspread').html(shown.map(function(p) {
    return '<div class="rulespage" data-page="'+p+'" style="background-image:url('+rulespageurl(p,'select')+')">'+
      '<img alt="Page '+p+'" src="'+rulespageurl(p,'details')+'" onload="rulesimageloaded(this)"></div>';
  }).join(''));
  ruleslayout();
  stage.scrollTop(0).scrollLeft(0);   // a turned page keeps the zoom, from its top left
  rulesdrawtext(shown);
  $('#rulesarea .rulespageinput').val(shown.length > 1 ? shown[0]+'-'+shown[1] : page);
  $('#rulesarea .rulesslider').val(page);
  $('#rulesarea .rulesspreadbtn').toggleClass('searchviewactive', shown.length > 1);
  $('#rulesarea .rulesturnprev').toggle(shown[0] > 1);
  $('#rulesarea .rulesturnnext').toggle(shown[shown.length-1] < n);
  rulesmarkpanel(shown);
  rulespreload(shown);
  if(url) {
    seturl(viewstate('rules'), true);
  }
}
// the page's image is in: drop the thumbnail drawn under it while it loaded
function rulesimageloaded(img) {
  img.classList.add('loaded');
  img.parentNode.style.backgroundImage = 'none';
}
// the neighbouring spreads' images, so turning a page shows it at once
function rulespreload(shown) {
  var n = rulesbook.pages.length;
  var size = (($('#rulesarea .rulespage img').attr('src') || '').match(/_([a-z]+)\.webp/) || [0, 'details'])[1];
  [shown[0]-2, shown[0]-1, shown[shown.length-1]+1, shown[shown.length-1]+2].forEach(function(p) {
    if(p >= 1 && p <= n) {
      (new Image()).src = rulespageurl(p, size);
    }
  });
}
// the stage fills the window below the toolbar
function rulessizestage() {
  var stage = $('#rulesarea .rulesstage');
  if(!stage.length || !stage.is(':visible')) { return; }
  var bottom = $('#rulesarea .rulesbottom').outerHeight() || 0;
  // from the stage's place on the page, not on screen: opened from far down the shelf, the window is
  // scrolled and the stage would come out taller than the window (a fitted page that can't be zoomed out to fit)
  var top = stage[0].getBoundingClientRect().top + (rulesisfull() ? 0 : window.scrollY);
  var h = Math.max(240, window.innerHeight - top - bottom - (rulesisfull() ? 0 : 8));
  $('#rulesarea .rulesbody').css('height', h+'px');
}
$(window).on('resize', _.debounce(function() {
  if(rulesbook && $('#resultrules').is(':visible')) {
    rulessizestage();
    rulesgo(rulesstate.page, false);
  }
}, 150));

// ********** the text layer: selecting, copying, finding, marked places **********
// Each page's words (lines/<NNN>.json) are laid over its image as transparent text, one span per word on its
// box, sized in the page's own units (cqh) so it follows every zoom without redrawing. The browser's find
// (Ctrl+F) sees it always; in select mode (rulesselect) it also takes the mouse and fingers, to select and copy.
function rulesselecting() {
  return rulesselect && !!(rulesbook && rulesbook.lines);
}
function rulestoggleselect() {
  rulesselect = !rulesselect;
  if(!rulesselect) { window.getSelection().removeAllRanges(); }
  $('#rulesarea .rulesstage').toggleClass('rulesselecting', rulesselecting());
  $('#rulesarea .rulesselectbtn').toggleClass('searchviewactive', rulesselect);
  if(rulesselect) { rulesflash('Select text to copy it, or copy a link to it'); }
}
// the page's lines, loaded once per book; done(lines) gets null when the page has none
function rulesloadlines(page, done) {
  var have = ruleslines[page];
  if(Array.isArray(have)) { done(have); return; }
  var id = rulesbook.id;
  if(!have) {
    have = ruleslines[page] = $.ajax({url: rulesbase()+id+'/lines/'+String(page).padStart(3, '0')+'.json', dataType: 'json', cache: true})
      .done(function(lines) { if(rulesbook && rulesbook.id == id) { ruleslines[page] = lines; } })
      .fail(function() { if(rulesbook && rulesbook.id == id) { ruleslines[page] = []; } });
  }
  have.always(function() { if(rulesbook && rulesbook.id == id) { done(ruleslines[page] || []); } });
}
// how wide a word comes out at font-size 1px, to stretch it across its box
var rulesmeasure = null;
function ruleswordwidth(word) {
  if(!rulesmeasure) {
    rulesmeasure = document.createElement('canvas').getContext('2d');
    rulesmeasure.font = '100px sans-serif';
  }
  return rulesmeasure.measureText(word).width / 100;
}
function rulesdrawtext(shown) {
  if(!rulesbook.lines) { rulesmarkplace(); return; }
  var left = shown.length;
  shown.forEach(function(p) {
    rulesloadlines(p, function(lines) {
      var el = $('#rulesarea .rulespage[data-page="'+p+'"]');
      if(el.length && !el.find('.rulestextlayer').length) {
        var d = rulesbook.pages[p-1], aspect = d[0] / d[1];
        // spaces between the words: the copied text and the browser's find see words, not one long run
        el.append('<div class="rulestextlayer">'+lines.map(function(line, i) {
          return '<div class="rulesline" data-line="'+i+'" data-block="'+line[0]+'">'+line[1].map(function(w, j) {
            var bw = (w[2] - w[0]) / 10000, bh = (w[3] - w[1]) / 10000;
            var fs = bh * 100 * 0.85, width = ruleswordwidth(w[4]) * fs / 100 / aspect;   // in page widths
            var sx = width > 0 ? bw / width : 1;
            return '<span data-word="'+j+'" style="left:'+(w[0] / 100)+'%;top:'+(w[1] / 100)+'%;font-size:'+fs.toFixed(3)+'cqh;'+
              'line-height:'+(bh * 100).toFixed(3)+'cqh;transform:scaleX('+sx.toFixed(4)+')">'+rulesesc(w[4])+'</span>';
          }).join(' ')+'</div>';
        }).join('')+'</div>');
      }
      if(--left == 0) {
        rulesdrawmarks();
        rulesmarkplace();
      }
    });
  });
}
function rulesclearmark() {
  rulesstate.find = '';
  rulesstate.line = 0;
  rulesstate.at = 0;
  rulesmarkzoomed = '';
}
function rulesmarkkey() {
  return rulesstate.book+'/'+rulesstate.page+'/'+(rulesstate.find || '')+'/'+rulesstate.line+'/'+rulesstate.at;
}
// letters and digits only, so a phrase matches across spaces, line ends, hyphens, quotes and punctuation
function rulesnorm(s) {
  return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');
}
// the words of a page's lines that spell q (rulesnorm'd): [[line, word], ...], or [] when it isn't there
function rulesfindwords(lines, q) {
  var chars = '', at = [];
  lines.forEach(function(line, i) {
    line[1].forEach(function(w, j) {
      var n = rulesnorm(w[4]);
      chars += n;
      for(var k = 0; k < n.length; k++) { at.push([i, j]); }
    });
  });
  var from = q ? chars.indexOf(q) : -1;
  if(from < 0) { return []; }
  var out = [];
  for(var k = from; k < from + q.length; k++) {
    var last = out[out.length-1];
    if(!last || last[0] != at[k][0] || last[1] != at[k][1]) { out.push(at[k]); }
  }
  return out;
}
// #find without #page: the first page with the phrase (from text.json), then the page as usual
function rulesfindpage(url) {
  var q = rulesnorm(rulesstate.find), id = rulesbook.id;
  var go = function() {
    var page = (rulestext || []).findIndex(function(t) { return rulesnorm(t).indexOf(q) >= 0; }) + 1;
    if(!page) {
      var find = rulesstate.find;
      rulesclearmark();
      rulesgo(1, url);
      rulesflash('"'+find+'" isn\'t in this book');
      return;
    }
    rulesstate.page = page;
    rulesgo(page);   // the address bar gets the page, so the link copied from it opens there at once
  };
  if(rulestext || !rulesbook.text) { go(); return; }
  $.ajax({url: rulesbase()+id+'/text.json', dataType: 'json', cache: true})
    .done(function(t) { if(rulesbook && rulesbook.id == id) { rulestext = t; go(); } })
    .fail(function() { if(rulesbook && rulesbook.id == id) { rulestext = []; go(); } });
}
// the boxes to mark on each page shown: the place linked to (find, line) and the words searched for
function rulesdrawmarks() {
  var stage = $('#rulesarea .rulesstage');
  stage.find('.rulesmark').remove();
  var words = rulessearchwords();
  stage.find('.rulespage').each(function() {
    var page = +$(this).data('page'), lines = ruleslines[page];
    if(!Array.isArray(lines)) { return; }
    var boxes = [];
    if(page == rulesstate.page) {
      // one band per line, around its words in the place
      var bands = {};
      rulesplacewords(lines).forEach(function(lw) {
        var w = lines[lw[0]][1][lw[1]], band = bands[lw[0]];
        bands[lw[0]] = band ? [Math.min(band[0], w[0]), Math.min(band[1], w[1]), Math.max(band[2], w[2]), Math.max(band[3], w[3])] : w.slice(0, 4);
      });
      Object.values(bands).forEach(function(band) { boxes.push(['rulesmarkplace', band]); });
    }
    if(words.length) {
      lines.forEach(function(line) {
        line[1].forEach(function(w) {
          var low = w[4].toLowerCase();
          if(words.some(function(q) { return low.indexOf(q) >= 0; })) { boxes.push(['rulesmarksearch', w]); }
        });
      });
    }
    $(this).append(boxes.map(function(b) {
      var w = b[1];
      return '<div class="rulesmark '+b[0]+'" style="left:'+(w[0] / 100)+'%;top:'+(w[1] / 100)+'%;width:'+((w[2] - w[0]) / 100)+
        '%;height:'+((w[3] - w[1]) / 100)+'%"></div>';
    }).join(''));
  });
}
// the words of the marked place (#find, #line) on its page: [[line, word], ...]
function rulesplacewords(lines) {
  if(rulesstate.find) {
    return rulesfindwords(lines, rulesnorm(rulesstate.find));
  } else if(rulesstate.line && lines[rulesstate.line-1]) {
    return lines[rulesstate.line-1][1].map(function(w, j) { return [rulesstate.line-1, j]; });
  }
  return [];
}
// zoom to the marked page's width and scroll the place into view, a third of the way down; once per mark,
// so a redraw (a resize, the panel) doesn't undo the reader's own zooming
function rulesmarkplace() {
  if(!(rulesstate.find || rulesstate.line || rulesstate.at) || rulesmarkzoomed == rulesmarkkey()) { return; }
  var y = null, lines = ruleslines[rulesstate.page];
  if(rulesstate.at) {
    y = rulesstate.at / 100;
  } else if(Array.isArray(lines)) {
    var lw = rulesplacewords(lines);
    if(lw.length) {
      y = lines[lw[0][0]][1][lw[0][1]][1] / 10000;
    }
  }
  rulesmarkzoomed = rulesmarkkey();
  if(y === null) {
    rulesflash(rulesstate.find ? '"'+rulesstate.find+'" isn\'t on this page' : 'No line '+rulesstate.line+' on this page');
    return;
  }
  var el = $('#rulesarea .rulesstage')[0], page = $('#rulesarea .rulespage[data-page="'+rulesstate.page+'"]')[0];
  if(!el || !page) { return; }
  var r = el.getBoundingClientRect();
  ruleszoomto(ruleszoom * el.clientWidth / page.getBoundingClientRect().width);
  var p = page.getBoundingClientRect();
  el.scrollLeft += p.left - r.left;
  el.scrollTop += p.top + y * p.height - r.top - el.clientHeight / 3;
}
// the text selected on the pages: {page, text} (the page it starts on), or null
function rulesselection() {
  var sel = window.getSelection();
  if(!sel || sel.isCollapsed || !sel.rangeCount) { return null; }
  var start = $(sel.getRangeAt(0).startContainer).closest('.rulespage');
  if(!start.length || !start.closest('#rulesarea').length) { return null; }
  var text = rulesseltext(sel);
  return text ? {page: +start.data('page'), text: text} : null;
}
// words as text to paste ([{page, block, line, word}] in reading order): a line's words joined by spaces, lines
// of a block into one paragraph (words broken across lines by a hyphen joined again), blocks and pages apart by a
// blank line, unless the text runs on (no full stop, the next starting in lower case: a block break that isn't a
// paragraph). A line that ended early (a heading, a list item, a paragraph's last line: rulesendedearly) or ends in
// a number before a capital (contents, indexes) keeps its line break.
function rulesjoinwords(words) {
  var out = '', last = null;
  words.forEach(function(here) {
    var word = here.word, runon = /^[a-z]/.test(word) && /[a-z0-9,;-]$/i.test(out);
    var newline = last && (last.page != here.page || last.line != here.line);
    if(!last) {
      out = word;
    } else if(newline && runon && /[a-z]-$/i.test(out)) {
      out = out.slice(0, -1)+word;
    } else if((last.page != here.page || last.block != here.block) && !runon) {
      out += '\n\n'+word;
    } else if(newline && !runon && (rulesendedearly(last.page, last.line, here.line) || (/[0-9]$/.test(out) && /^[A-Z]/.test(word)))) {
      out += '\n'+word;
    } else {
      out += ' '+word;
    }
    last = here;
  });
  return out.trim();
}
// line i of page ended early: the first word of line j, the next, would have fitted after it, with as much room as
// line j itself takes. Text wrapping around a picture has lines short for want of room, which this doesn't break.
function rulesendedearly(page, i, j) {
  var lines = ruleslines[page];
  if(!Array.isArray(lines) || !lines[i] || !lines[j] || i == j) { return false; }
  var a = lines[i][1], b = lines[j][1];
  var right = function(ws) { return Math.max.apply(null, ws.map(function(w) { return w[2]; })); };
  var space = a.length > 1 ? Math.max(0, a[1][0] - a[0][2]) : 100;
  return right(a) + space + (b[0][2] - b[0][0]) < right(b);
}
// the selection as text to paste (rulesjoinwords)
function rulesseltext(sel) {
  var range = sel.getRangeAt(0), words = [];
  $('#rulesarea .rulestextlayer span').each(function() {
    if(!range.intersectsNode(this)) { return; }
    // the words at either end may be selected only in part
    var word = this.textContent, node = this.firstChild;
    word = word.substring(node == range.startContainer ? range.startOffset : 0, node == range.endContainer ? range.endOffset : word.length);
    if(!word) { return; }
    var line = this.parentNode;
    words.push({page: $(this).closest('.rulespage').data('page'), block: line.getAttribute('data-block'), line: line.getAttribute('data-line'), word: word});
  });
  return rulesjoinwords(words);
}
// the whole text of the page(s) shown, to the clipboard: from the word boxes where the book has them (paragraphs
// joined as a selection copies), else text.json as extracted
function rulescopypage() {
  var shown = rulesshown(rulesstate.page), id = rulesbook.id;
  var copy = function(text) {
    if(!text) { rulesflash('No text on this page'); return; }
    var label = shown.length > 1 ? 'Text of pages '+shown.join('-')+' copied' : 'Page text copied';
    if(navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() { rulesflash(label); }, function() { prompt('Page text', text); });
    } else {
      prompt('Page text', text);
    }
  };
  if(rulesbook.lines) {
    var pages = {}, left = shown.length;
    shown.forEach(function(p) {
      rulesloadlines(p, function(lines) {
        pages[p] = lines;
        if(--left) { return; }
        var words = [];
        shown.forEach(function(q) {
          pages[q].forEach(function(line, i) {
            line[1].forEach(function(w) { words.push({page: q, block: line[0], line: i, word: w[4]}); });
          });
        });
        copy(rulesjoinwords(words));
      });
    });
    return;
  }
  var fromtext = function() { copy(shown.map(function(p) { return (rulestext[p-1] || '').trim(); }).filter(t => t).join('\n\n')); };
  if(rulestext) { fromtext(); return; }
  $.ajax({url: rulesbase()+id+'/text.json', dataType: 'json', cache: true})
    .done(function(t) { if(rulesbook && rulesbook.id == id) { rulestext = t; fromtext(); } })
    .fail(function() { rulesflash('Could not load the text'); });
}
$(document).on('copy', function(e) {
  var sel = window.getSelection();
  if(!sel || sel.isCollapsed || !$(sel.anchorNode).closest('#rulesarea .rulestextlayer').length) { return; }
  var text = rulesseltext(sel);
  if(!text) { return; }
  e.originalEvent.clipboardData.setData('text/plain', text);
  e.preventDefault();
});

// ********** the side panel: contents, page thumbnails, search **********
function rulestogglepanel(which) {
  rulespanel = rulespanel == which ? null : which;
  rulesdrawpanel();
  rulesgo(rulesstate.page, false);
  if(rulespanel == 'search') {
    $('#rulesarea .rulessearch').focus();
  }
}
function rulesdrawpanel() {
  var panel = $('#rulesarea .rulespanel');
  $('#rulesarea .rulestools button[data-panel]').each(function() {
    $(this).toggleClass('searchviewactive', $(this).data('panel') == rulespanel);
  });
  if(!rulespanel) { panel.hide().empty(); return; }
  var b = rulesbook, out = '';
  if(rulespanel == 'contents') {
    out = '<ul class="rulestoc">'+b.toc.map(function(t) {
      return '<li class="rulestoclevel'+Math.min(t.level || 0, 3)+'" data-page="'+t.page+'"><a href="#" onclick="rulespanelgo('+t.page+'); return false;">'+
        rulesesc(t.title)+'</a> <span class="rulestocpage">'+t.page+'</span></li>';
    }).join('')+'</ul>';
  } else if(rulespanel == 'pages') {
    out = '<div class="rulesthumbs">'+b.pages.map(function(d, i) {
      var p = i + 1, w = 100, h = Math.round(100 * d[1] / d[0]);
      if(h > 140) { w = Math.round(w * 140 / h); h = 140; }
      return '<a href="#" class="rulesthumb" data-page="'+p+'" onclick="rulespanelgo('+p+'); return false;">'+
        '<img loading="lazy" alt="" width="'+w+'" height="'+h+'" src="'+rulespageurl(p,'select')+'"><span>'+p+'</span></a>';
    }).join('')+'</div>';
  } else if(rulespanel == 'search') {
    out = '<form class="rulessearchform" onsubmit="rulessearch(); return false;"><input type="search" class="rulessearch" placeholder="Search this book" value="'+
      rulesesc(rulesstate.q || '')+'"></form><div class="rulesresults"></div>';
  }
  panel.html(out).show();
  if(rulespanel == 'search' && rulesstate.q) { rulessearch(); }
  rulesdrawmarks();
}
function rulespanelgo(page) {
  rulesclearmark();
  if(narrowscreen()) {   // the panel covers the page on phones
    rulespanel = null;
    rulesdrawpanel();
  }
  rulesgo(page);
}
// highlight the page(s) shown in the thumbnails / contents, and keep it in view
function rulesmarkpanel(shown) {
  var panel = $('#rulesarea .rulespanel');
  if(rulespanel == 'pages') {
    panel.find('.rulesthumb').removeClass('rulescurrent');
    var cur = panel.find(shown.map(p => '.rulesthumb[data-page="'+p+'"]').join(',')).addClass('rulescurrent').first();
    if(cur.length) { cur[0].scrollIntoView({block: 'nearest'}); }
  } else if(rulespanel == 'contents') {
    // the last entry starting at or before the page
    var items = panel.find('li[data-page]').removeClass('rulescurrent');
    var last = items.filter(function() { return +$(this).data('page') <= shown[shown.length-1]; }).last().addClass('rulescurrent');
    if(last.length) { last[0].scrollIntoView({block: 'nearest'}); }
  }
}
// the words searched for, while the search panel is open (marked on the pages shown too)
function rulessearchwords() {
  return rulespanel == 'search' && (rulesstate.q || '').length >= 2 ? rulesstate.q.toLowerCase().split(/\s+/).filter(w => w) : [];
}
function rulessearch() {
  var q = $('#rulesarea .rulessearch').val().trim();
  rulesstate.q = q;
  var res = $('#rulesarea .rulesresults');
  if(q.length < 2) { res.empty(); rulesdrawmarks(); return; }
  var run = function() {
    var words = rulessearchwords();
    var hits = [];
    rulestext.forEach(function(t, i) {
      var low = t.toLowerCase();
      if(words.every(w => low.indexOf(w) >= 0)) {
        var at = low.indexOf(words[0]);
        var from = Math.max(0, at - 60);
        var snip = (from ? '…' : '')+t.substring(from, at + words[0].length + 90).replace(/\s+/g, ' ')+'…';
        var mark = rulesesc(snip);
        words.forEach(function(w) {
          mark = mark.replace(new RegExp('('+_.escapeRegExp(rulesesc(w))+')', 'gi'), '<mark>$1</mark>');
        });
        hits.push('<li><a href="#" onclick="rulespanelgo('+(i+1)+'); return false;"><b>p. '+(i+1)+'</b> '+mark+'</a></li>');
      }
    });
    res.html(hits.length ? '<p>'+hits.length+' page'+(hits.length == 1 ? '' : 's')+'</p><ul>'+hits.join('')+'</ul>' : '<p>No pages match.</p>');
    rulesdrawmarks();
  };
  if(rulestext) { run(); return; }
  res.html('<p>Loading the text&hellip;</p>');
  var id = rulesbook.id;
  $.ajax({url: rulesbase()+id+'/text.json', dataType: 'json', cache: true})
    .done(function(t) { if(rulesbook && rulesbook.id == id) { rulestext = t; run(); } })
    .fail(function() { res.html('<p class="error">Could not load the text.</p>'); });
}
$(document).on('input', '#rulesarea .rulessearch', _.debounce(rulessearch, 250));

// a link to the page shown (with its marked place), or with text selected on a page, to that text (#find=)
function rulescopylink() {
  var state = viewstate('rules'), sel = rulesselection();
  if(sel) {
    // the first dozen words find it; more would only break on a rebuilt book's small differences
    Object.assign(state, {page: sel.page, find: sel.text.split(/\s+/).slice(0, 12).join(' '), line: 0, at: 0});
  }
  var url = location.href.split('#')[0]+statehash(state);
  var label = sel ? 'Link to this text' : 'Link to this page';
  var done = function() { rulesflash(sel ? 'Link to the text copied' : 'Link copied'); };
  if(navigator.clipboard) {
    navigator.clipboard.writeText(url).then(done, function() { prompt(label, url); });
  } else {
    prompt(label, url);
  }
}
function rulesflash(msg) {
  var tools = $('#rulesarea .rulestools').attr('data-copied', msg);
  clearTimeout(rulesflash.timer);
  rulesflash.timer = setTimeout(function() { tools.removeAttr('data-copied'); }, msg.length > 20 ? 2500 : 1500);
}

// ********** input: keys, page box, slider, double-click zoom, swipes **********
$(document).on('keydown', function(e) {
  if(!rulesbook || !$('#resultrules').is(':visible') || $(e.target).is('input, textarea, select') || $('.modal-box:visible').length) { return; }
  if(e.ctrlKey || e.metaKey || e.altKey) { return; }   // the browser's own: Ctrl+F finds in the text layer, Ctrl+C copies
  var keys = {ArrowRight: 1, ArrowDown: 1, PageDown: 1, ' ': 1, ArrowLeft: -1, ArrowUp: -1, PageUp: -1};
  if(ruleszoom > 1 && (e.key == 'ArrowDown' || e.key == 'ArrowUp' || e.key == ' ')) { return; }   // scroll the zoomed page
  if(keys[e.key]) {
    rulesstep(e.shiftKey && e.key == ' ' ? -1 : keys[e.key]);
  } else if(e.key == 'Home') {
    rulesgo(1);
  } else if(e.key == 'End') {
    rulesgo(rulesbook.pages.length);
  } else if(e.key == '+' || e.key == '=') {
    rulesstepzoom(1);
  } else if(e.key == '-') {
    rulesstepzoom(-1);
  } else if(e.key == '0' || (e.key == 'Escape' && ruleszoom > 1)) {
    ruleszoomto(1);
  } else if(e.key == 'f' || e.key == 'F') {
    rulesfullscreen();
  } else if((e.key == 't' || e.key == 'T') && rulesbook.lines) {
    rulestoggleselect();
  } else if((e.key == 'c' || e.key == 'C') && rulesbook.text) {
    rulescopypage();
  } else if(e.key == 'Escape' && rulesisfull()) {
    rulesfullscreen(false);
  } else {
    return;
  }
  e.preventDefault();
});
$(document).on('change', '#rulesarea .rulespageinput', function() {
  rulesgo(parseInt($(this).val(), 10));
});
$(document).on('focus', '#rulesarea .rulespageinput', function() { this.select(); });
// dragging the slider shows each page's thumbnail at once; the full page loads where it's let go
$(document).on('input', '#rulesarea .rulesslider', function() {
  var p = +$(this).val();
  $('#rulesarea .rulespageinput').val(p);
  var page = $('#rulesarea .rulespage').first();
  page.siblings('.rulespage').remove();
  page.css('background-image', 'url('+rulespageurl(p,'select')+')').find('img').removeClass('loaded').removeAttr('src');
});
$(document).on('change', '#rulesarea .rulesslider', function() {
  rulesgo(+$(this).val());
});
// Pointer gestures on the stage (mouse, touch and pen alike; touch-action: none leaves them all to us):
// - one pointer, zoomed in: drag the page around
// - one finger, not zoomed: swipe left/right to turn
// - two fingers: pinch to zoom around them (and move them to pan)
// - a double click or double tap: zoom in there (2.5x), or back to fit
// - a single click or tap on the left or right side, not zoomed: turn (the .rulesturn areas, rulesturnclick)
var rulesptrs = {};          // pointers down on the stage: id -> {x, y}
var rulesgesture = null;     // {type: 'pan', x, y, sl, st, moved, touch} or {type: 'pinch', d, x, y}
var rulesnoclick = false;    // a drag or a double tap just ended: the click that follows doesn't turn the page
var ruleslasttap = null;     // {t, x, y} of the last tap, for double taps
// the pinch's transform becomes the real zoom: the point that was under the fingers' start goes where they ended
function rulespinchend(el, g) {
  var sp = $(el).find('.rulesspread')[0];
  sp.style.transform = '';
  sp.style.transformOrigin = '';
  ruleszoomto(ruleszoom * g.scale, g.x, g.y);
  el.scrollLeft -= g.tx;
  el.scrollTop -= g.ty;
  g.scale = 1;   // ended: a later finger lift doesn't apply it again
}
function rulesturnclick(dir) {
  if(!rulesnoclick) { rulesstep(dir); }
}
function rulespinchpoints() {
  var p = Object.values(rulesptrs);
  return {d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2};
}
function rulespanstart(e, moved) {
  var el = $('#rulesarea .rulesstage')[0];
  rulesgesture = {type: 'pan', x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop, moved: moved, touch: e.pointerType != 'mouse'};
}
$(document).on('pointerdown', '#rulesarea .rulesstage', function(ev) {
  var e = ev.originalEvent;
  if(e.pointerType == 'mouse' && e.button != 0) { return; }
  // selecting text: a mouse or pen drags a selection, and fingers are the browser's (scroll, long-press to select)
  if(rulesselecting()) { return; }
  rulesptrs[e.pointerId] = {x: e.clientX, y: e.clientY};
  var n = Object.keys(rulesptrs).length;
  if(n == 1) {
    rulespanstart(e, false);
  } else if(n == 2) {
    // the pages are scaled with a transform while the fingers move (cheap, no image swaps), then laid out
    // once at the new zoom when they lift (rulespinchend)
    var start = rulespinchpoints(), sp = $(this).find('.rulesspread')[0], r = sp.getBoundingClientRect();
    rulesgesture = {type: 'pinch', d: start.d, x: start.x, y: start.y, scale: 1, tx: 0, ty: 0};
    sp.style.transformOrigin = (start.x - r.left)+'px '+(start.y - r.top)+'px';
    $(this).addClass('rulesdragging');
  }
});
$(document).on('pointermove', '#rulesarea .rulesstage', function(ev) {
  var e = ev.originalEvent;
  if(!rulesptrs[e.pointerId] || !rulesgesture) { return; }
  rulesptrs[e.pointerId] = {x: e.clientX, y: e.clientY};
  var el = this;
  if(rulesgesture.type == 'pinch' && Object.keys(rulesptrs).length == 2) {
    var g = rulesgesture, now = rulespinchpoints();
    var z = Math.max(1, Math.min(RULESMAXZOOM, ruleszoom * now.d / g.d));
    g.scale = z / ruleszoom;
    g.tx = now.x - g.x;
    g.ty = now.y - g.y;
    $(el).find('.rulesspread')[0].style.transform = 'translate('+g.tx+'px,'+g.ty+'px) scale('+g.scale+')';
    $('#rulesarea .ruleszoomlabel').text(Math.round(z * 100)+'%');
  } else if(rulesgesture.type == 'pan') {
    var dx = e.clientX - rulesgesture.x, dy = e.clientY - rulesgesture.y;
    if(!rulesgesture.moved && Math.hypot(dx, dy) > 6) {
      rulesgesture.moved = true;
      el.setPointerCapture(e.pointerId);   // keep dragging when the pointer leaves the stage
      if(ruleszoom > 1) { $(el).addClass('rulesdragging'); }
    }
    if(rulesgesture.moved && ruleszoom > 1) {
      el.scrollLeft = rulesgesture.sl - dx;
      el.scrollTop = rulesgesture.st - dy;
    }
  }
});
$(document).on('pointerup pointercancel', '#rulesarea .rulesstage', function(ev) {
  var e = ev.originalEvent;
  if(!rulesptrs[e.pointerId]) { return; }
  delete rulesptrs[e.pointerId];
  var g = rulesgesture;
  $(this).removeClass('rulesdragging');
  if(g && g.type == 'pinch') {
    rulespinchend(this, g);
  }
  if(Object.keys(rulesptrs).length == 1) {
    // one finger left after a pinch: it pans from here, and lifting it isn't a tap
    var rest = Object.values(rulesptrs)[0];
    rulespanstart({clientX: rest.x, clientY: rest.y, pointerType: 'touch'}, true);
    return;
  }
  rulesgesture = null;
  if(!g || g.type != 'pan' || ev.type == 'pointercancel') { return; }
  if(g.moved) {
    rulesnoclick = true;
    setTimeout(function() { rulesnoclick = false; }, 0);
    var dx = e.clientX - g.x, dy = e.clientY - g.y;
    if(g.touch && ruleszoom <= 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      rulesstep(dx < 0 ? 1 : -1);
    }
    return;
  }
  // a tap or click: the second of two close together zooms. Not on the turn areas, where quick clicks flip pages
  if($(e.target).hasClass('rulesturn')) { ruleslasttap = null; return; }
  var t = Date.now(), last = ruleslasttap;
  if(last && t - last.t < 350 && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 30) {
    ruleslasttap = null;
    rulesnoclick = true;
    setTimeout(function() { rulesnoclick = false; }, 0);
    ruleszoomto(ruleszoom > 1 ? 1 : 2.5, e.clientX, e.clientY);
  } else {
    ruleslasttap = {t: t, x: e.clientX, y: e.clientY};
  }
});
