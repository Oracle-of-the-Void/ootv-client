// Rules section: the rulebook shelf and page viewer. Loaded on first use by rulesshow() in oracle.js.
// Books live on the images bucket, per game: <imageuri>rulebooks/index.json (the shelf) and
// <imageuri>rulebooks/<id>/book.json, text.json and <NNN>_{select,details,master}.webp per page
// (built by ootv-import SCRIPTS/rulebook-convert.py; docs/admin/rulebooks.md).
// Urls: #view=rules is the shelf, #rulebook=<id>,#page=<n> a page. Turning pages replaces the
// history entry, so Back leaves the book rather than stepping through every page.
window.rulesloaded = true;

var rulesshelf = null;      // index.json, once loaded (false: the game has none)
var rulesbook = null;       // book.json of the open book
var rulestext = null;       // text.json of the open book, loaded on the first search
var rulespanel = null;      // side panel shown: 'contents', 'pages', 'search' or null
var ruleszoom = 1;          // 1: the page(s) fit the stage; more: larger, dragged or scrolled around (ruleszoomto)
var rulesloading = null;    // the book id being fetched

function rulesbase() {
  return dbinfo[database].imageuri+'rulebooks/';
}
function rulespageurl(n,size) {
  return rulesbase()+rulesbook.id+'/'+String(n).padStart(3,'0')+'_'+size+'.webp';
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
  $.ajax({url: rulesbase()+'index.json', dataType: 'json', cache: true})
    .done(function(data) { rulesshelf = data; rulesshelf.game = database; done(); })
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
    var last = ruleslastpages();
    out += '<h3>Rulebooks</h3><div class="rulesbooks">';
    rulesshelf.books.forEach(function(b) {
      var cover = rulesbase()+b.id+'/001_select.webp';
      var at = last[database+'/'+b.id];
      out += '<a class="rulesbookcard" href="#game='+database+',#rulebook='+b.id+(at > 1 ? ',#page='+at : '')+'" data-book="'+rulesesc(b.id)+'">'+
        '<span class="rulescover"><img loading="lazy" alt="" src="'+cover+'"'+
        (b.cover ? ' width="'+b.cover[0]+'" height="'+b.cover[1]+'"' : '')+'></span>'+
        '<span class="rulesbooktitle">'+rulesesc(b.title)+'</span>'+
        (b.subtitle ? '<span class="rulesbooksub">'+rulesesc(b.subtitle)+'</span>' : '')+
        '<span class="rulesbookmeta">'+[b.year, b.arc, b.pages+' pages'].filter(x => x).map(rulesesc).join(' &middot; ')+
        (at > 1 ? ' &middot; <b>at p. '+at+'</b>' : '')+'</span></a>';
    });
    out += '</div>';
    if(rulesshelf.credit) {
      out += '<p class="rulescredit">'+rulesesc(rulesshelf.credit)+'</p>';
    }
    area.html(out+'</div>');
  });
}
$(document).on('click', 'a.rulesbookcard', function(e) {
  if(e.ctrlKey || e.metaKey || e.shiftKey || e.button) { return; }  // a new tab keeps the link
  e.preventDefault();
  var id = $(this).data('book');
  rulesopenbook(id, ruleslastpages()[database+'/'+id] || 1, true);
});

// ********** a book **********
function rulesopenbook(id,page,push=false) {
  rulesstate.book = id;
  rulesstate.page = page || 1;
  if(push) {
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
  var dl = (b.downloads || []).map(function(d) {
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
      '<button class="rulesbtn rulesspreadbtn" onclick="rulestogglespread();" aria-label="One page / two pages" data-balloon-pos="down">'+rulesicon('columns')+'</button>'+
      '<button class="rulesbtn" onclick="rulesstepzoom(-1);" aria-label="Zoom out (-)" data-balloon-pos="down">'+rulesicon('zoom-out')+'</button>'+
      '<button class="rulesbtn ruleszoomlabel" onclick="ruleszoomto(1);" aria-label="Fit the page (0)" data-balloon-pos="down">100%</button>'+
      '<button class="rulesbtn" onclick="rulesstepzoom(1);" aria-label="Zoom in (+, Ctrl+wheel, pinch)" data-balloon-pos="down">'+rulesicon('zoom-in')+'</button>'+
      '<button class="rulesbtn" onclick="rulescopylink();" aria-label="Copy a link to this page" data-balloon-pos="down-right">'+rulesicon('link')+'</button>'+
      '<button class="rulesbtn rulesfullbtn" onclick="rulesfullscreen();" aria-label="Full screen (F)" data-balloon-pos="down-right">'+rulesicon(rulesisfull() ? 'minimize' : 'maximize')+'</button>'+
      '</span>'+
    '</div>'+
    '<div class="rulesbody">'+
      '<div class="rulespanel" style="display:none"></div>'+
      '<div class="rulesstage" tabindex="-1"><div class="rulesspread"></div>'+
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
      '<span class="rulesdownloads">'+dl+'</span>'+
    '</div>'+
    '</div>');
  $('body').addClass('rulesreading');
  rulesdrawpanel();
  rulessizestage();
  // the arrow keys turn pages straight away, not move the cursor in the sidebar's search box
  if($(document.activeElement).is('input, textarea, select')) { document.activeElement.blur(); }
  var stage = $('#rulesarea .rulesstage')[0];
  stage.focus({preventScroll: true});
  // Ctrl+wheel (and a trackpad pinch, which arrives as one) zooms at the pointer; jQuery can't make it non-passive
  stage.addEventListener('wheel', function(e) {
    if(!e.ctrlKey) { return; }
    e.preventDefault();
    ruleszoomto(ruleszoom * Math.exp(-e.deltaY * 0.002), e.clientX, e.clientY);   // a wheel notch (100) is about 1.2x
  }, {passive: false});
  // the phone's own pinch-zoom of the whole page would fight ours (iOS doesn't always honour touch-action: none)
  var nogesture = function(e) { e.preventDefault(); };
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function(t) { stage.addEventListener(t, nogesture, {passive: false}); });
  stage.addEventListener('touchmove', nogesture, {passive: false});
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
    var have = ((img.attr('src') || '').match(/_([a-z]+)\.webp$/) || [])[1];
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
// show page (and its spread partner); url: the address bar follows (replacing the entry)
function rulesgo(page,url=true) {
  if(!rulesbook) { return; }
  var n = rulesbook.pages.length;
  page = Math.max(1, Math.min(n, parseInt(page, 10) || 1));
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
  var size = (($('#rulesarea .rulespage img').attr('src') || '').match(/_([a-z]+)\.webp$/) || [0, 'details'])[1];
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
  var h = Math.max(240, window.innerHeight - stage[0].getBoundingClientRect().top - bottom - (rulesisfull() ? 0 : 8));
  $('#rulesarea .rulesbody').css('height', h+'px');
}
$(window).on('resize', _.debounce(function() {
  if(rulesbook && $('#resultrules').is(':visible')) {
    rulessizestage();
    rulesgo(rulesstate.page, false);
  }
}, 150));

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
}
function rulespanelgo(page) {
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
function rulessearch() {
  var q = $('#rulesarea .rulessearch').val().trim();
  rulesstate.q = q;
  var res = $('#rulesarea .rulesresults');
  if(q.length < 2) { res.empty(); return; }
  var run = function() {
    var words = q.toLowerCase().split(/\s+/).filter(w => w);
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
  };
  if(rulestext) { run(); return; }
  res.html('<p>Loading the text&hellip;</p>');
  var id = rulesbook.id;
  $.ajax({url: rulesbase()+id+'/text.json', dataType: 'json', cache: true})
    .done(function(t) { if(rulesbook && rulesbook.id == id) { rulestext = t; run(); } })
    .fail(function() { res.html('<p class="error">Could not load the text.</p>'); });
}
$(document).on('input', '#rulesarea .rulessearch', _.debounce(rulessearch, 250));

function rulescopylink() {
  var url = location.href.split('#')[0]+statehash(viewstate('rules'));
  var done = function() { $('#rulesarea .rulestools').attr('data-copied', 'Link copied'); setTimeout(function() { $('#rulesarea .rulestools').removeAttr('data-copied'); }, 1500); };
  if(navigator.clipboard) {
    navigator.clipboard.writeText(url).then(done, function() { prompt('Link to this page', url); });
  } else {
    prompt('Link to this page', url);
  }
}

// ********** input: keys, page box, slider, double-click zoom, swipes **********
$(document).on('keydown', function(e) {
  if(!rulesbook || !$('#resultrules').is(':visible') || $(e.target).is('input, textarea, select') || $('.modal-box:visible').length) { return; }
  var keys = {ArrowRight: 1, PageDown: 1, ' ': 1, ArrowLeft: -1, PageUp: -1};
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
