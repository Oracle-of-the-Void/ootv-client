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
var ruleszoom = false;      // the page at full size, scrolled, instead of fitted
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
      ruleszoom = false;
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
      '<button class="rulesbtn ruleszoombtn" onclick="rulestogglezoom();" aria-label="Zoom (double-click the page)" data-balloon-pos="down">'+rulesicon('zoom-in')+'</button>'+
      '<button class="rulesbtn" onclick="rulescopylink();" aria-label="Copy a link to this page" data-balloon-pos="down-right">'+rulesicon('link')+'</button>'+
      '</span>'+
    '</div>'+
    '<div class="rulesbody">'+
      '<div class="rulespanel" style="display:none"></div>'+
      '<div class="rulesstage" tabindex="-1"><div class="rulesspread"></div>'+
        '<div class="rulesturn rulesturnprev" onclick="rulesstep(-1);" title="Previous page"></div>'+
        '<div class="rulesturn rulesturnnext" onclick="rulesstep(1);" title="Next page"></div>'+
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
  $('#rulesarea .rulesstage')[0].focus({preventScroll: true});
}
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
function rulestogglezoom() {
  ruleszoom = !ruleszoom;
  rulesgo(rulesstate.page, false);
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
  var spread = stage.find('.rulesspread');
  var sw = stage.width(), sh = stage.height();
  var dpr = window.devicePixelRatio || 1;
  // the pages' total width at the stage's height, then fitted (zoom: as wide as the stage, or the master's size if larger)
  var ratio = shown.reduce((w, p) => w + rulesbook.pages[p-1][0] / rulesbook.pages[p-1][1], 0);
  var h = Math.min(sh, sw / ratio);
  if(ruleszoom) {
    h = Math.max(sw / ratio, sh * 1.6);
  }
  h = Math.floor(h);
  var html = shown.map(function(p) {
    var w = Math.floor(h * rulesbook.pages[p-1][0] / rulesbook.pages[p-1][1]);
    var size = Math.max(w, h) * dpr > rulesbook.sizes.details * 1.1 ? 'master' : 'details';
    return '<div class="rulespage" data-page="'+p+'" style="width:'+w+'px;height:'+h+'px;background-image:url('+rulespageurl(p,'select')+')">'+
      '<img alt="Page '+p+'" width="'+w+'" height="'+h+'" src="'+rulespageurl(p,size)+'" onload="this.classList.add(\'loaded\')"></div>';
  }).join('');
  spread.html(html);
  stage.toggleClass('ruleszoomed', ruleszoom);
  stage.scrollTop(0);
  $('#rulesarea .rulespageinput').val(shown.length > 1 ? shown[0]+'-'+shown[1] : page);
  $('#rulesarea .rulesslider').val(page);
  $('#rulesarea .ruleszoombtn').toggleClass('searchviewactive', ruleszoom);
  $('#rulesarea .rulesspreadbtn').toggleClass('searchviewactive', shown.length > 1);
  $('#rulesarea .rulesturnprev').toggle(shown[0] > 1);
  $('#rulesarea .rulesturnnext').toggle(shown[shown.length-1] < n);
  rulesmarkpanel(shown);
  rulespreload(shown);
  if(url) {
    seturl(viewstate('rules'), true);
  }
}
// the neighbouring spreads' images, so turning a page shows it at once
function rulespreload(shown) {
  var n = rulesbook.pages.length;
  var size = $('#rulesarea .rulespage img').attr('src').match(/_(details|master)\.webp$/)[1];
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
  var h = Math.max(240, window.innerHeight - stage.offset().top - bottom - 8);
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
  if(ruleszoom && (e.key == 'ArrowDown' || e.key == 'ArrowUp' || e.key == ' ')) { return; }   // scroll the zoomed page
  if(keys[e.key]) {
    rulesstep(e.shiftKey && e.key == ' ' ? -1 : keys[e.key]);
  } else if(e.key == 'Home') {
    rulesgo(1);
  } else if(e.key == 'End') {
    rulesgo(rulesbook.pages.length);
  } else if(e.key == 'Escape' && ruleszoom) {
    rulestogglezoom();
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
$(document).on('dblclick', '#rulesarea .rulesspread', function() {
  rulestogglezoom();
});
// swipe left/right to turn (not while zoomed: then a drag scrolls the page)
var rulestouch = null;
$(document).on('touchstart', '#rulesarea .rulesstage', function(e) {
  var t = e.originalEvent.touches;
  rulestouch = (t.length == 1 && !ruleszoom) ? {x: t[0].clientX, y: t[0].clientY} : null;
});
$(document).on('touchend', '#rulesarea .rulesstage', function(e) {
  if(!rulestouch) { return; }
  var t = e.originalEvent.changedTouches[0];
  var dx = t.clientX - rulestouch.x, dy = t.clientY - rulestouch.y;
  rulestouch = null;
  if(Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    rulesstep(dx < 0 ? 1 : -1);
  }
});
