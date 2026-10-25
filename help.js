// Help pages: the Help view and the "?" links next to the site's controls. Loaded on first use by helpload() in
// oracle.js. Each topic is docs/help/<topic>.md (published by deploy.yml), rendered with marked; the Fields topic is
// drawn from the game's field descriptions (fielddescsload). How to write them: docs/HELP-AUTHORING.md.
// A heading's id is its {#id} (written at the end of the heading, then dropped), else its text as a slug; a
// section is a heading and what follows it up to the next heading of the same or a higher level.
// Urls: #view=help is the first topic, #help=<topic>,#helpsec=<id> a topic scrolled to a section.
// "?" links: <span class="helpq" data-help="<topic>#<id>">?</span>. Hover (mouse) or long-press (touch) shows
// the section in the trait popup, as a ruling's rulebook link does; a click or tap opens the Help view there.
window.helploaded = true;

var HELPTOPICS = [
  {id: 'getting-started', title: 'Getting started'},
  {id: 'searching', title: 'Searching'},
  {id: 'cards', title: 'The card page'},
  {id: 'identify', title: 'Identifying L5R cards'},
  {id: 'lists', title: 'Decks and lists'},
  {id: 'public-lists', title: 'Public lists'},
  {id: 'rules', title: 'Bookshelf'},
  {id: 'settings', title: 'Account and settings'},
  {id: 'fields', title: 'Card fields', generated: true},
  {id: 'discord-bot', title: 'Discord bot'}
];
var helpdocs = {};   // '<game>/<topic>' (the Fields topic) or '<topic>' -> promise of the rendered topic (a detached div)

function helpesc(s) {
  return $('<div>').text(s == null ? '' : String(s)).html();
}
function helptopic(id) {
  return HELPTOPICS.find(t => t.id == id) || null;
}
function helpslug(text) {
  return text.toLowerCase().replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, '').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}
// the topic rendered, its headings given ids and its links pointed at the Help view
function helpdoc(id) {
  var t = helptopic(id);
  if(!t) { return Promise.reject('no help topic '+id); }
  var key = t.generated ? database+'/'+id : id;
  if(!helpdocs[key]) {
    var loadmarked = window.marked ? Promise.resolve() : Promise.resolve($.ajax({url: markedurl, dataType: 'script', cache: true}));
    var md = t.generated ? helpfieldsmd() : Promise.resolve($.ajax({url: 'docs/help/'+id+'.md', dataType: 'text', cache: false}));
    helpdocs[key] = Promise.all([loadmarked, md]).then(function(r) {
      var div = $('<div>').html(marked.parse(r[1]));
      div.find('h1, h2, h3, h4').each(function() {
        var h = $(this), m = /\s*\{#([\w-]+)\}\s*$/.exec(h.html());
        if(m) { h.html(h.html().slice(0, m.index)); }
        h.attr('id', 'help-'+(m ? m[1] : helpslug(h.html())));
      });
      helptoc(div, id);
      div.find('a[href]').each(function() {
        var a = $(this), href = a.attr('href');
        var local = /^(?:\.\/)?([\w-]+)\.md(?:#([\w-]+))?$/.exec(href) || /^#([\w-]+)$/.exec(href) && [null, id, href.slice(1)];
        if(local) {
          a.attr('href', '#help='+local[1]+(local[2] ? ',#helpsec='+local[2] : '')).addClass('helplink').data('help', local[1]+'#'+(local[2] || ''));
        } else if(/^https?:/.test(href)) {
          a.attr('target', '_blank');
        }
      });
      return div;
    });
    helpdocs[key].catch(function() { delete helpdocs[key]; });   // a failed load is tried again next time
  }
  return helpdocs[key];
}
// the topic's contents, under its title: a link to each section (h2) and its subsections (h3)
function helptoc(div,id) {
  if(div.find('h2').length < 2) { return; }
  // a div, not a <nav>: the menubar's nav styles would apply to it
  var nav = $('<div class="helptoc"><ul></ul></div>'), top = nav.children('ul'), last = null;
  div.find('h2, h3').each(function() {
    var h = $(this), sec = h.attr('id').slice(5);
    var li = $('<li>').append($('<a class="helplink">').attr('href', '#help='+id+',#helpsec='+sec).data('help', id+'#'+sec).html(h.html()));
    if(h.is('h3') && last) {
      (last.children('ul').length ? last.children('ul') : $('<ul>').appendTo(last)).append(li);
    } else {
      top.append(li);
      last = li;
    }
  });
  var h1 = div.find('h1').first();
  nav.insertAfter(h1.length ? h1 : div.children().first());
}
// a section of a rendered topic (its heading and what follows, up to the next heading as high), or null
function helpsection(div,sec) {
  var h = sec ? div.find('#help-'+sec) : $();
  if(!h.is('h1, h2, h3, h4')) { return null; }
  var level = parseInt(h.prop('tagName').slice(1), 10);
  var stop = ['h1','h2','h3','h4'].slice(0, level).join(', ');
  return {title: h.text(), body: h.nextUntil(stop).clone()};
}

// The Fields topic: the game's field descriptions (Admin → Field descriptions), card fields then printing fields
function helpfieldsmd() {
  return fielddescsload(database).then(function() {
    var known = fielddescsknown(database);
    var list = function(scope) {
      return known[scope].map(function(k) {
        var d = fielddesc(database, scope, k);
        return d ? '<dt><code>'+helpesc(k)+'</code></dt><dd>'+helpesc(d)+'</dd>' : '';
      }).join('');
    };
    var game = dbinfo[database] ? dbinfo[database].name : database;
    return '# Card fields: '+helpesc(game)+'\n\n'+
      'What each field of a '+helpesc(game)+' card holds. Use these names in the [All box](searching.md#all), for '+
      'example <code>clan:crab</code>. Each game has its own fields: pick another game to see its list.\n\n'+
      '## Card fields {#card}\n\nOne value (or list) for the whole card.\n\n<dl class="helpfields">'+list('card')+'</dl>\n\n'+
      '## Printing fields {#printing}\n\nEach printing (version) of a card has its own. The All box can\'t search these: '+
      'use the search form\'s boxes ([why](searching.md#printing)).\n\n<dl class="helpfields">'+list('printing')+'</dl>\n';
  });
}

// the Help view: the topic list, then helpstate's topic scrolled to its section
function helprender() {
  var id = helptopic(helpstate.topic) ? helpstate.topic : HELPTOPICS[0].id;
  $('#helpnav').html(HELPTOPICS.map(t => '<a href="#help='+t.id+'" class="helplink'+(t.id == id ? ' helpnavactive' : '')+
    '" data-help="'+t.id+'#">'+helpesc(t.title)+'</a>').join(''));
  $('#helpdoc').html('<p>Loading&hellip;</p>');
  helpdoc(id).then(function(div) {
    if(helpstate.topic && helpstate.topic != id) { return; }
    $('#helpdoc').empty().append(div.clone(true));
    var h = helpstate.sec ? $('#helpdoc #help-'+helpstate.sec) : $();
    $('#helpdoc .helpsecactive').removeClass('helpsecactive');
    if(h.length) {
      h.addClass('helpsecactive');
      h[0].scrollIntoView({block: 'start'});
    } else {
      $('#resulthelp').scrollTop(0);
    }
  }, function(e) {
    console.log(['helprender fail', e]);
    $('#helpdoc').html('<span class="error">Could not load this help page.</span>');
  });
}

// "?" (and a link inside a help page): the Help view at that topic and section
$(document).on('click', '.helpq, a.helplink', function(e) {
  if(e.ctrlKey || e.metaKey || e.shiftKey) { return; }   // a link opened in a new tab, as usual
  e.preventDefault();
  $('#traitpop').hide();
  var t = String($(this).data('help')).split('#');
  helpopen(t[0], t[1] || null);
});

// the section a "?" points at, in the trait popup: under el on hover (mouse), or centred after a long-press (touch)
function helppeek(el,touch) {
  var t = String($(el).data('help')).split('#'), pop = $('#traitpop');
  if(!pop.length) { pop = $('<div id="traitpop"></div>').appendTo('body'); }
  pop.data('help', el);
  helpdoc(t[0]).then(function(div) {
    if(pop.data('help') != el) { return; }   // the pointer moved on while it loaded
    var s = helpsection(div, t[1]);
    var title = s ? s.title : helptopic(t[0]).title;
    pop.toggleClass('traitpoptouch', touch).html('<div class="traitpophead">'+helpesc(title)+'</div><div class="helppeek"></div>'+
      (touch ? '<span class="button gray traitpopopen">Open help</span><span class="button gray traitpopclose" onclick="$(\'#traitpop\').hide();">Close</span>' :
        '<div class="traitpopfoot">Click for the whole help page</div>'));
    pop.find('.helppeek').append(s ? s.body : div.children().not('h1, .helptoc').slice(0, 2).clone());
    pop.find('.traitpopopen').on('click', function() { pop.hide(); helpopen(t[0], t[1] || null); });
    var w = Math.min(touch ? 420 : 480, window.innerWidth - 16);
    if(touch) {
      pop.css({width: w, left: (window.innerWidth - w) / 2, top: '6vh', bottom: 'auto'}).show().scrollTop(0);
    } else {
      popnear(pop, el, w);
    }
  });
}
