// Trades and Messages (ootv-claude TRADE-LISTS.md), loaded on first use by tradeload() in oracle.js.
//   Trades (#view=trades): your matches, GET /trade mode=matches: the players who have what your want lists
//     want and want what your have lists have, two-way first. With tradestate.card (#tradecard=<cardid>, the
//     card page's traders link): who has / wants that card, GET /trade mode=cards.
//   Messages (#view=messages, #thread=<id>): the inbox and one conversation at a time, /messages. A Message
//     button opens the conversation with that player (msgstate.other), carrying the trade's cards as context.
//   Play ties (ootv-claude ONLINE-PLAY-MESSAGING.md): a game invite in a conversation (context.play) links to the
//     play table's #join; a conversation's Invite to a game opens the table with that player (/play/#with=<uid>);
//     stars (favourite) put people first; talk links (#talk=<uid>-<code>) connect friends from outside the site.
// Only lists their owners opened to trade count (list header: Open to trade).
window.tradeloaded = true;

function tradeesc(s) {
  return htmlEncode(s == null ? '' : String(s));
}
function tradeattr(s) {
  return tradeesc(s).replace(/"/g, '&quot;');
}
function tradeauth(xhr) {
  xhr.setRequestHeader('Authorization', getidtoken());
}
function tradeloggedin() {
  var u = cache_thing("user","data");
  return signedin() && u && u.oracle && u.oracle[0];
}
function tradeloginprompt(what) {
  return '<p>Log in to '+what+'. <span class="button gray" onclick="dologin();">Log&nbsp;In/Register</span></p>';
}
function tradeerror(xhr) {
  return (xhr.responseJSON && xhr.responseJSON.error) || xhr.statusText || 'failed';
}
// "2026-10-20" → "active 4 days ago"
function tradeseen(day) {
  if(!day) return '';
  var days = Math.floor((Date.now() - Date.parse(day)) / 86400000);
  return days <= 0 ? 'active today' : (days == 1 ? 'active yesterday' : 'active '+days+' days ago');
}
// open a card from a trade or message link: these cards usually aren't cached yet, which docardid needs
function tradeopencard(id) {
  if(cache_card_is(id)) {
    docardid(id);
  } else {
    listprefetch([id], [function() { docardid(id); }]);
  }
}
// a card entry: its title as a card link (card peek: a.cardpeeklink in oracle.js), with quantity, printing and foil
function tradecard(e, yourslabel) {
  var bits = [];
  if(e.quantity) bits.push(e.quantity+'&times;');
  var link = '<a class="cardpeeklink" data-card="'+parseInt(e.cardid)+'"'+(e.printing ? ' data-printing="'+parseInt(e.printing)+'"' : '')+' href="#game='+database+',#cardid='+parseInt(e.cardid)+'" onclick="tradeopencard('+parseInt(e.cardid)+'); return false;">'+tradeesc(e.title || 'card #'+e.cardid)+'</a>';
  bits.push(link);
  if(e.printing) bits.push('<small>(printing '+tradeesc(e.printing)+')</small>');
  if(e.foil) bits.push(templatefoilmark(e.foil));
  if(yourslabel && e.yours) bits.push('<small>('+yourslabel+' '+parseInt(e.yours)+')</small>');
  return '<li>'+bits.join(' ')+'</li>';
}
// a trader's last activity and their lists
function tradeownermeta(t) {
  return [tradeesc(tradeseen(t.ownerlastseen)), tradelists(t.lists)].filter(function(x) { return x; }).join(' &middot; ');
}
function tradelists(lists) {
  return (lists || []).map(function(l) {
    return '<a href="#game='+database+',#listid='+l.listid+'" onclick="openpubliclist('+l.listid+'); return false;">'+tradeesc(l.name || 'Unnamed list')+'</a> <small>('+tradeesc(listtypes[l.type] || l.type)+')</small>';
  }).join(', ');
}

// ******************** TRADES ********************
function tradesrender() {
  var area = $('#tradesarea');
  if(tradestate.card) {
    tradesforcard(area, tradestate.card);
    return;
  }
  // matching is a preview (the user, 2026-11-17): it may become a Patreon supporter feature; card search stays open
  area.html('<h2>Trades <span class="gamepreviewtag">preview</span> <span class="helpq" data-help="trading#matches" aria-label="Help: trading">?</span></h2>'+
    '<p class="tradepreviewnote">Matching is a preview and may become a <a href="https://www.patreon.com/oracleofthevoid" target="_blank" rel="noopener">Patreon</a> supporter feature later.</p>'+
    '<div class="tradestatus">Loading&hellip;</div>');
  if(!tradeloggedin()) {
    area.find('.tradestatus').html(tradeloginprompt('see who you can trade with')+
      '<p>Any card page shows who has it or wants it for trade (the <svg class="feather"><use xlink:href="res/feather-sprite.svg#repeat"></svg> link beside the public lists globe).</p>');
    return;
  }
  $.ajax({
    url: apiuri+'/trade?mode=matches&game='+encodeURIComponent(database)+'&owner='+getuid(),
    dataType: 'json',
    success: function(data) { tradesmatches(area, data); },
    error: function(xhr) { area.find('.tradestatus').html('<span class="error">Could not load your matches: '+tradeesc(tradeerror(xhr))+'</span>'); }
  });
}
function tradesmatches(area, data) {
  var mine = data.mine || {};
  var status = area.find('.tradestatus');
  if(!(mine.lists || []).length) {
    status.html('<p>None of your '+tradeesc(dbinfo[database] ? dbinfo[database].name || database : database)+' lists is open to trade yet.</p>'+
      '<p>Make a <b>Want</b> list of the cards you\'re after and a <b>Have</b> list of the ones you\'d trade away, then set each one to '+
      '<b>Open to trade</b> in the list view. You need a display name (Settings) for that; others see it and can message you.</p>');
    return;
  }
  status.html('Your lists open to trade: '+tradelists(mine.lists)+' &middot; '+mine.wants+' cards wanted, '+mine.haves+' to trade away');
  var traders = data.traders || [];
  if(!traders.length) {
    area.append('<div class="randarea">Nobody has what you want or wants what you have yet. New lists are opened to trade all the time; look again later.</div>');
    return;
  }
  var html = traders.map(function(t) {
    var both = t.theyhave.length && t.theywant.length;
    var cardids = t.theyhave.concat(t.theywant).map(function(e) { return e.cardid; });
    return '<div class="directorycard tradecard'+(both ? ' tradeboth' : '')+'">'+
      '<div class="dircardhead"><span class="dircardname">'+tradeesc(t.ownername)+'</span>'+
	(both ? ' <span class="tradetag">two-way</span>' : '')+'</div>'+
      '<div class="dircardbody">'+
	'<div class="dircardmeta">'+tradeownermeta(t)+'</div>'+
	(t.theyhave.length ? '<div class="tradeside"><b>Has '+t.score.theyhave+' you want</b><ul>'+t.theyhave.map(function(e) { return tradecard(e, 'you want'); }).join('')+'</ul></div>' : '')+
	(t.theywant.length ? '<div class="tradeside"><b>Wants '+t.score.theywant+' you have</b><ul>'+t.theywant.map(function(e) { return tradecard(e, 'you have'); }).join('')+'</ul></div>' : '')+
	'<button type="button" class="button gray" data-cardids="'+tradeattr(JSON.stringify(cardids))+'" data-listids="'+tradeattr(JSON.stringify(t.lists.map(function(l) { return l.listid; })))+'" '+
	  'data-name="'+tradeattr(t.ownername)+'" onclick="messagestart('+parseInt(t.owner)+', this);"><svg class="feather"><use xlink:href="res/feather-sprite.svg#mail"></svg> Message</button>'+
      '</div></div>';
  }).join('');
  area.append('<div class="tradelist">'+html+'</div>');
}
function tradesforcard(area, cardid) {
  var cached = cache_card_is(cardid) ? cache_card_fetch(cardid) : null;
  var title = cached && cached.title ? $('<div>').html([].concat(cached.title).join(', ')).text() : 'card #'+cardid;
  area.html('<h2>Traders: <a class="cardpeeklink" data-card="'+parseInt(cardid)+'" href="#game='+database+',#cardid='+parseInt(cardid)+'" onclick="tradeopencard('+parseInt(cardid)+'); return false;">'+tradeesc(title)+'</a></h2>'+
    '<p><a href="" onclick="tradestate.card = null; tradeviewshow(\'resulttrades\'); return false;">Your matches</a> <span class="helpq" data-help="trading#card" aria-label="Help: traders for a card">?</span></p>'+
    '<div class="tradeside" data-side="have"><h3>Have it</h3><div>Loading&hellip;</div></div>'+
    '<div class="tradeside" data-side="want"><h3>Want it</h3><div>Loading&hellip;</div></div>');
  if(!cached) {   // opened from a link: the card's title once it's fetched
    listprefetch([cardid], [function() {
      var c = cache_card_is(cardid) ? cache_card_fetch(cardid) : null;
      if(c && c.title && tradestate.card == cardid) area.find('h2 a').text($('<div>').html([].concat(c.title).join(', ')).text());
    }]);
  }
  ['have','want'].forEach(function(side) {
    $.ajax({
      url: apiuri+'/trade?mode=cards&game='+encodeURIComponent(database)+'&cardid='+parseInt(cardid)+'&side='+side,
      dataType: 'json',
      success: function(data) {
	var me = tradeloggedin() ? getuid() : null;
	var html = (data.traders || []).map(function(t) {
	  return '<div class="directorycard tradecard"><div class="dircardhead"><span class="dircardname">'+tradeesc(t.ownername)+'</span></div>'+
	    '<div class="dircardbody"><div class="dircardmeta">'+tradeownermeta(t)+'</div>'+
	    '<ul>'+t.cards.map(function(e) { return tradecard(e); }).join('')+'</ul>'+
	    (t.owner == me ? '<small>(you)</small>' : '<button type="button" class="button gray" data-cardids="'+tradeattr(JSON.stringify([parseInt(cardid)]))+'" data-listids="'+tradeattr(JSON.stringify(t.lists.map(function(l) { return l.listid; })))+'" '+
	      'data-name="'+tradeattr(t.ownername)+'" onclick="messagestart('+parseInt(t.owner)+', this);"><svg class="feather"><use xlink:href="res/feather-sprite.svg#mail"></svg> Message</button>')+
	    '</div></div>';
	}).join('');
	area.find('.tradeside[data-side="'+side+'"] > div').html(html || '<i>Nobody '+(side == 'have' ? 'has it open to trade' : 'wants it')+' right now.</i>');
      },
      error: function(xhr) {
	area.find('.tradeside[data-side="'+side+'"] > div').html('<span class="error">'+tradeesc(tradeerror(xhr))+'</span>');
      }
    });
  });
}

// ******************** MESSAGES ********************
// a Message button: the conversation with that player, with the trade's cards as the first message's context
function messagestart(uid, el) {
  if(!tradeloggedin()) {
    dologin();
    return;
  }
  var me = getuid();
  var ids = [me, uid].sort(function(a, b) { return a - b; });
  msgstate = {thread: ids.join('-'), other: uid, othername: $(el).data('name') || null,
    context: {game: database, cardids: $(el).data('cardids') || [], listids: $(el).data('listids') || []}};
  if($('#resultmessages').is(':visible')) {
    seturl(viewstate('messages'));
    messagesrender();
  } else {
    showview('resultmessages');
  }
}
function messagesrender() {
  var area = $('#messagesarea');
  if(sessionStorage.getItem('talkpending')) {
    talktake();
    return;
  }
  if(!tradeloggedin()) {
    area.html('<h2>Messages</h2>'+tradeloginprompt('read your messages'));
    return;
  }
  if(msgstate.thread) {
    messagesthread(area);
  } else {
    messagesinbox(area);
  }
}
function messagesinbox(area) {
  area.html('<h2>Messages <span class="helpq" data-help="trading#messages" aria-label="Help: messages">?</span></h2><div class="msgstatus">Loading&hellip;</div>');
  $.ajax({
    url: apiuri+'/messages?uid='+getuid(),
    dataType: 'json',
    beforeSend: tradeauth,
    success: function(data) {
      $('.msgbadge').text(data.unread > 99 ? '99+' : data.unread).toggle(data.unread > 0);
      var threads = data.threads || [];
      // favourites first, each group newest first as the server sent it
      threads = threads.filter(function(t) { return t.favourite; }).concat(threads.filter(function(t) { return !t.favourite; }));
      area.find('.msgstatus').html(threads.length ? '' :
	'No conversations yet. Message someone from <a href="" onclick="showview(\'resulttrades\'); return false;">Trades</a>, or invite a friend to talk below.');
      area.append('<div class="msginbox">'+threads.map(function(t) {
	return '<div class="msgthreadrow'+(t.unread && !t.muted ? ' msgunread' : '')+'" data-thread="'+tradeattr(t.threadid)+'" data-other="'+parseInt(t.other)+'">'+
	  msgstar(t.other, t.favourite)+
	  '<span class="msgwho">'+tradeesc(t.othername)+'</span>'+
	  (t.subject ? ' <span class="msgsubject">'+tradeesc(t.subject)+'</span>' : '')+
	  (t.muted ? ' <small>(muted)</small>' : '')+(t.blocked ? ' <small>(blocked)</small>' : '')+
	  (t.unread && !t.muted ? ' <span class="msgcount">'+parseInt(t.unread)+'</span>' : '')+
	  '<span class="msgwhen">'+tradeesc(formatdateshort(new Date(t.lastmessage)))+'</span></div>';
      }).join('')+'</div>');
      talklinksdraw(area);
    },
    error: function(xhr) { area.find('.msgstatus').html('<span class="error">'+tradeesc(tradeerror(xhr))+'</span>'); }
  });
}
// a star: favourite or not (POST /messages favourite|unfavourite); favourites go first here and on the play table
function msgstar(other, on) {
  return '<button type="button" class="msgstar'+(on ? ' msgstarred' : '')+'" data-other="'+parseInt(other)+'" aria-pressed="'+(on ? 'true' : 'false')+'"'+
    ' title="'+(on ? 'Favourite: click to unstar' : 'Star as a favourite')+'" aria-label="Favourite">'+(on ? '&#9733;' : '&#9734;')+'</button>';
}
$(document).on('click', '#messagesarea .msgstar', function(e) {
  e.stopPropagation();
  var btn = $(this), on = !btn.hasClass('msgstarred');
  $.ajax({
    type: 'POST', url: apiuri+'/messages', contentType: 'application/json', dataType: 'json',
    data: JSON.stringify({uid: getuid(), action: on ? 'favourite' : 'unfavourite', other: btn.data('other')}),
    beforeSend: tradeauth,
    success: function() { btn.replaceWith(msgstar(btn.data('other'), on)); },
    error: function(xhr) { alert('Could not change the star: '+tradeerror(xhr)); }
  });
});
$(document).on('click', '#messagesarea .msgthreadrow', function() {
  msgstate = {thread: String($(this).data('thread')), other: $(this).data('other'), othername: $(this).find('.msgwho').text(), context: null};
  seturl(viewstate('messages'));
  messagesrender();
});
function messagesback() {
  msgstate = {thread: null, other: null, othername: null, context: null};
  seturl(viewstate('messages'));
  messagesrender();
}
function messagesthread(area) {
  var tid = msgstate.thread;
  // opened by its address (#thread=<uid>-<uid>, the play table's Message): the other player is the uid that isn't yours,
  // so a conversation not started yet can be
  var parts = String(tid).split('-'), me = String(getuid());
  if(!msgstate.other && parts.length == 2 && parts.indexOf(me) >= 0) msgstate.other = parseInt(parts[0] == me ? parts[1] : parts[0], 10);
  area.html('<div class="msghead"><a href="" onclick="messagesback(); return false;">&larr; All messages</a> <h2 class="msgtitle">'+tradeesc(msgstate.othername || '')+'</h2></div>'+
    '<div class="msgflags"></div><div class="msgthread"><div class="msgstatus">Loading&hellip;</div></div>'+
    '<form class="msgcompose" onsubmit="messagesend(this); return false;">'+
      (msgstate.context && msgstate.context.play ? '<div class="msgcontext">With a game invite'+(msgstate.context.play.arc ? ' ('+tradeesc(msgstate.context.play.arc)+')' : '')+'</div>' : '')+
      (msgstate.context && (msgstate.context.cardids || []).length ? '<div class="msgcontext">About a trade of '+msgstate.context.cardids.length+' card'+(msgstate.context.cardids.length == 1 ? '' : 's')+'</div>' : '')+
      '<textarea name="text" maxlength="2000" rows="3" placeholder="Write a message" aria-label="Message"></textarea>'+
      '<button type="submit" class="button gray"><svg class="feather"><use xlink:href="res/feather-sprite.svg#send"></svg> Send</button> <span class="msgsendstatus"></span>'+
    '</form>');
  $.ajax({
    url: apiuri+'/messages?uid='+getuid()+'&threadid='+encodeURIComponent(tid),
    dataType: 'json',
    beforeSend: tradeauth,
    success: function(data) {
      if(tid != msgstate.thread) return;
      if(tid.split('-').indexOf(String(getuid())) < 0) {
	// a site admin reading a reported conversation: read only
	area.find('.msgtitle').text(Object.values(data.names || {}).join(' and ')+' (reported)');
	area.find('.msgcompose, .msgflags').remove();
	messagesdraw(area, data.messages, data.names);
	return;
      }
      msgstate.other = data.other.uid;
      msgstate.othername = data.other.name;
      area.find('.msgtitle').text(data.other.name);
      messagesflags(area, data.thread);
      messagesdraw(area, data.messages, data.names);
      msgunread();
    },
    error: function(xhr) {
      if(xhr.status == 404 && msgstate.other) {   // a new conversation
	if(!msgstate.othername) area.find('.msgtitle').text('New conversation');
	area.find('.msgthread').html('<div class="msgstatus"><i>No messages yet. Say hello, or what you\'d like to trade.</i></div>');
	messagesflags(area, {});
	return;
      }
      area.find('.msgthread').html('<span class="error">'+tradeesc(tradeerror(xhr))+'</span>');
    }
  });
}
function messagesdraw(area, messages, names) {
  var me = getuid();
  area.find('.msgthread').html((messages || []).map(function(m) {
    var ctx = m.context && m.context.play ? msgplaycard(m.context.play, m.from == me) : '';
    ctx += m.context && (m.context.cardids || []).length ? '<div class="msgctx">Trade: '+m.context.cardids.map(function(id) {
      var c = cache_card_is(id) ? cache_card_fetch(id) : null;
      var t = c && c.title ? $('<div>').html([].concat(c.title).join(', ')).text() : 'card #'+id;
      // card peek only for this game's cards (it reads this game's cache)
      var peek = (m.context.game || database) == database ? ' class="cardpeeklink" data-card="'+parseInt(id)+'"' : '';
      return '<a'+peek+' href="#game='+tradeesc(m.context.game || database)+',#cardid='+parseInt(id)+'" onclick="tradeopencard('+parseInt(id)+'); return false;">'+tradeesc(t)+'</a>';
    }).join(', ')+'</div>' : '';
    return '<div class="msg'+(m.from == me ? ' msgmine' : '')+'"><div class="msgmeta">'+tradeesc(m.from == me ? 'You' : (names[m.from] || ''))+' &middot; '+
      tradeesc(formatdate(new Date(m.time)))+'</div>'+ctx+(m.text ? '<div class="msgtext">'+tradeesc(m.text).replace(/\n/g, '<br>')+'</div>' : '')+'</div>';
  }).join('') || '<div class="msgstatus"><i>No messages yet.</i></div>');
  // the cards named in trade contexts: fetch the ones not cached, then draw their titles
  var missing = [];
  (messages || []).forEach(function(m) {
    (m.context && m.context.cardids || []).forEach(function(id) { if(!cache_card_is(id)) missing.push(id); });
  });
  if(missing.length && !area.data('fetched')) {
    area.data('fetched', true);
    listprefetch(missing, [function() { messagesdraw(area, messages, names); }]);
  }
  var box = area.find('.msgthread')[0];
  box.scrollTop = box.scrollHeight;
}
function messagesflags(area, thread) {
  var other = msgstate.other;
  if(!other) return;
  var b = function(action, label, icon) {
    return '<button type="button" class="button gray buttonsmaller" onclick="messageflag(\''+action+'\');"><svg class="feather"><use xlink:href="res/feather-sprite.svg#'+icon+'"></svg> '+label+'</button> ';
  };
  area.find('.msgflags').html(
    (thread.blocked ? '' : '<a class="button gray buttonsmaller" href="'+tradeattr(playurl(null, '#with='+parseInt(other)))+'"><svg class="feather"><use xlink:href="res/feather-sprite.svg#play"></svg> Invite to a game</a> ')+
    (thread.favourite ? b('unfavourite', 'Unstar', 'star') : b('favourite', 'Star', 'star'))+
    (thread.muted ? b('unmute', 'Unmute', 'bell') : b('mute', 'Mute', 'bell-off'))+
    (thread.blocked ? b('unblock', 'Unblock', 'user-check') : b('block', 'Block', 'user-x'))+
    (thread.threadid ? b('report', 'Report', 'flag') : ''));
  area.find('.msgcompose').toggle(!thread.blocked);
}
function messageflag(action) {
  var body = {uid: getuid(), action: action};
  if(action == 'report') {
    var reason = prompt('Report this conversation to the site admins. What\'s wrong? (optional)');
    if(reason === null) return;
    body.threadid = msgstate.thread;
    body.reason = reason;
  } else {
    if(action == 'block' && !confirm('Block '+(msgstate.othername || 'this player')+'? Neither of you can send the other messages until you unblock.')) return;
    body.other = msgstate.other;
  }
  $.ajax({
    type: 'POST', url: apiuri+'/messages', contentType: 'application/json', data: JSON.stringify(body), dataType: 'json',
    beforeSend: tradeauth,
    success: function() {
      if(action == 'report') alert('Reported. Thank you; the admins will look at it.');
      messagesrender();
    },
    error: function(xhr) { alert('Could not '+action+': '+tradeerror(xhr)); }
  });
}
// the play table's address on this site (served at /play/, ootv-play README); table: the game (?game=), none for
// the table's own default
function playurl(table, hash) {
  return location.origin+'/play/'+(table ? '?game='+encodeURIComponent(table) : '')+(hash || '');
}
// a game invite in a conversation: the invite link (the play table's #join with its code) for the one invited
function msgplaycard(p, mine) {
  var what = 'a game'+(p.arc ? ' ('+tradeesc(p.arc)+')' : '');
  if(mine) return '<div class="msgctx msgplay">You invited them to '+what+'.</div>';
  var link = p.code ? playurl(p.table, '#join='+encodeURIComponent(p.game)+'&code='+encodeURIComponent(p.code)) : null;
  return '<div class="msgctx msgplay">Invited you to '+what+'.'+
    (link ? ' <a class="button gray buttonsmaller" href="'+tradeattr(link)+'"><svg class="feather"><use xlink:href="res/feather-sprite.svg#play"></svg> See the invite</a>' : '')+
    '</div>';
}

// ******************** TALK LINKS ********************
// Invite a friend to talk: links you give outside the site, each with its own expiry and uses
// (POST /messages talklink / talkdelete; GET ?talklinks=1). Taking one: #talk=<uid>-<code> (talktake).
var TALKEXPIRES = [['7d', '7 days'], ['1d', '1 day'], ['30d', '30 days'], ['never', 'Never']];
function talklinkurl(link) {
  return location.origin+'/#talk='+link;
}
function talklinksdraw(area) {
  area.find('.talklinks').remove();
  area.append('<div class="talklinks"><h3>Invite a friend to talk</h3>'+
    '<p>A link to give a friend any way you like. Whoever opens it, logged in, can message you and invite you to games, and you them.</p>'+
    '<form class="talkmake" onsubmit="talklinkmake(this); return false;">'+
      '<label>Expires <select name="expires">'+TALKEXPIRES.map(function(e) { return '<option value="'+e[0]+'">'+e[1]+'</option>'; }).join('')+'</select></label> '+
      '<label>Uses <select name="once"><option value="true">Once</option><option value="false">Any number</option></select></label> '+
      '<button type="submit" class="button gray buttonsmaller"><svg class="feather"><use xlink:href="res/feather-sprite.svg#link"></svg> Make a link</button> '+
      '<span class="talkstatus"></span>'+
    '</form><div class="talklist"></div></div>');
  $.ajax({
    url: apiuri+'/messages?uid='+getuid()+'&talklinks=1',
    dataType: 'json',
    beforeSend: tradeauth,
    success: function(data) { talklistdraw(area, data.talklinks || []); },
    error: function(xhr) { area.find('.talklist').html('<span class="error">'+tradeesc(tradeerror(xhr))+'</span>'); }
  });
}
function talklistdraw(area, links) {
  area.find('.talklist').html(links.map(function(t) {
    var url = talklinkurl(t.link);
    var state = !t.live ? (t.once && t.used ? 'used' : 'expired') :
      (t.expires ? 'expires '+formatdateshort(new Date(t.expires)) : 'never expires')+(t.once ? ', once' : '');
    return '<div class="talkrow'+(t.live ? '' : ' talkgone')+'">'+
      (t.live ? '<input type="text" readonly value="'+tradeattr(url)+'" aria-label="Talk link" onclick="this.select();"> '+
	'<button type="button" class="button gray buttonsmaller" onclick="talklinkcopy(this);"><svg class="feather"><use xlink:href="res/feather-sprite.svg#copy"></svg> Copy</button> ' : '')+
      '<small>'+tradeesc(state)+' &middot; made '+tradeesc(formatdateshort(new Date(t.created)))+' &middot; taken '+parseInt(t.used || 0)+'&times;</small> '+
      '<button type="button" class="button gray buttonsmaller" onclick="talklinkdelete(\''+tradeattr(t.code)+'\');"><svg class="feather"><use xlink:href="res/feather-sprite.svg#trash-2"></svg> Delete</button>'+
      '</div>';
  }).join(''));
}
function talklinkmake(form) {
  var status = $(form).find('.talkstatus');
  status.text('Making...');
  $.ajax({
    type: 'POST', url: apiuri+'/messages', contentType: 'application/json', dataType: 'json',
    data: JSON.stringify({uid: getuid(), action: 'talklink', expires: $(form).find('[name="expires"]').val(), once: $(form).find('[name="once"]').val() == 'true'}),
    beforeSend: tradeauth,
    success: function() { talklinksdraw($('#messagesarea')); },
    error: function(xhr) { status.text('Not made: '+tradeerror(xhr)); }
  });
}
function talklinkcopy(btn) {
  var input = $(btn).prev('input')[0];
  var done = function() { $(btn).html('Copied'); };
  if(navigator.clipboard) navigator.clipboard.writeText(input.value).then(done, function() { input.select(); });
  else { input.select(); }
}
function talklinkdelete(code) {
  if(!confirm('Delete this link? Nobody can connect with it after.')) return;
  $.ajax({
    type: 'POST', url: apiuri+'/messages', contentType: 'application/json', dataType: 'json',
    data: JSON.stringify({uid: getuid(), action: 'talkdelete', code: code}),
    beforeSend: tradeauth,
    success: function() { talklinksdraw($('#messagesarea')); },
    error: function(xhr) { alert('Could not delete: '+tradeerror(xhr)); }
  });
}
// a talk link opened (#talk=, kept in sessionStorage across the login): connect, then open the conversation
function talktake() {
  var link = sessionStorage.getItem('talkpending');
  if(!link) return;
  if(!tradeloggedin()) {
    $('#messagesarea').html('<h2>Messages</h2><p>Someone sent you a link to connect with them.</p>'+tradeloginprompt('connect'));
    return;
  }
  sessionStorage.removeItem('talkpending');
  $.ajax({
    type: 'POST', url: apiuri+'/messages', contentType: 'application/json', dataType: 'json',
    data: JSON.stringify({uid: getuid(), action: 'talk', link: link}),
    beforeSend: tradeauth,
    success: function(data) {
      if(data.own) { msgstate = {thread: null, other: null, othername: null, context: null}; }
      else { msgstate = {thread: data.threadid, other: data.other.uid, othername: data.other.name, context: null}; }
      seturl(viewstate('messages'));
      messagesrender();
    },
    error: function(xhr) {
      $('#messagesarea').html('<h2>Messages</h2><p class="error">Could not connect: '+tradeesc(tradeerror(xhr))+'</p>');
    }
  });
}

function messagesend(form) {
  var text = $(form).find('[name="text"]').val().trim();
  var status = $(form).find('.msgsendstatus');
  if(!text) return;
  var body = {uid: getuid(), to: msgstate.other, text: text};
  if(msgstate.context) body.context = msgstate.context;
  status.text('Sending...');
  $(form).find('button').prop('disabled', true);
  $.ajax({
    type: 'POST', url: apiuri+'/messages', contentType: 'application/json', data: JSON.stringify(body), dataType: 'json',
    beforeSend: tradeauth,
    success: function(data) {
      msgstate.context = null;   // the context rides on the first message only
      msgstate.thread = data.threadid;
      messagesrender();
    },
    error: function(xhr) {
      status.text('Not sent: '+tradeerror(xhr));
      $(form).find('button').prop('disabled', false);
    }
  });
}
