// Trades and Messages (ootv-claude TRADE-LISTS.md), loaded on first use by tradeload() in oracle.js.
//   Trades (#view=trades): your matches, GET /trade mode=matches: the players who have what your want lists
//     want and want what your have lists have, two-way first. With tradestate.card (#tradecard=<cardid>, the
//     card page's traders link): who has / wants that card, GET /trade mode=cards.
//   Messages (#view=messages, #thread=<id>): the inbox and one conversation at a time, /messages. A Message
//     button opens the conversation with that player (msgstate.other), carrying the trade's cards as context.
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
// a card entry: its title as a card link, with quantity, printing and foil
function tradecard(e, yourslabel) {
  var bits = [];
  if(e.quantity) bits.push(e.quantity+'&times;');
  var link = '<a href="#game='+database+',#cardid='+parseInt(e.cardid)+'" onclick="docardid('+parseInt(e.cardid)+'); return false;">'+tradeesc(e.title || 'card #'+e.cardid)+'</a>';
  bits.push(link);
  if(e.printing) bits.push('<small>(printing '+tradeesc(e.printing)+')</small>');
  if(e.foil) bits.push('<small class="tradefoil">'+(e.foil == 'either' ? 'foil or not' : 'foil')+'</small>');
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
  area.html('<h2>Trades <span class="helpq" data-help="trading" aria-label="Help: trading">?</span></h2><div class="tradestatus">Loading&hellip;</div>');
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
  area.html('<h2>Traders: <a href="#game='+database+',#cardid='+parseInt(cardid)+'" onclick="docardid('+parseInt(cardid)+'); return false;">'+tradeesc(title)+'</a></h2>'+
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
      area.find('.msgstatus').html(threads.length ? '' :
	'No conversations yet. Message someone from <a href="" onclick="showview(\'resulttrades\'); return false;">Trades</a>.');
      area.append('<div class="msginbox">'+threads.map(function(t) {
	return '<div class="msgthreadrow'+(t.unread && !t.muted ? ' msgunread' : '')+'" data-thread="'+tradeattr(t.threadid)+'" data-other="'+parseInt(t.other)+'">'+
	  '<span class="msgwho">'+tradeesc(t.othername)+'</span>'+
	  (t.subject ? ' <span class="msgsubject">'+tradeesc(t.subject)+'</span>' : '')+
	  (t.muted ? ' <small>(muted)</small>' : '')+(t.blocked ? ' <small>(blocked)</small>' : '')+
	  (t.unread && !t.muted ? ' <span class="msgcount">'+parseInt(t.unread)+'</span>' : '')+
	  '<span class="msgwhen">'+tradeesc(formatdateshort(new Date(t.lastmessage)))+'</span></div>';
      }).join('')+'</div>');
    },
    error: function(xhr) { area.find('.msgstatus').html('<span class="error">'+tradeesc(tradeerror(xhr))+'</span>'); }
  });
}
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
  area.html('<div class="msghead"><a href="" onclick="messagesback(); return false;">&larr; All messages</a> <h2 class="msgtitle">'+tradeesc(msgstate.othername || '')+'</h2></div>'+
    '<div class="msgflags"></div><div class="msgthread"><div class="msgstatus">Loading&hellip;</div></div>'+
    '<form class="msgcompose" onsubmit="messagesend(this); return false;">'+
      (msgstate.context && (msgstate.context.cardids || []).length ? '<div class="msgcontext">About a trade of '+msgstate.context.cardids.length+' card'+(msgstate.context.cardids.length == 1 ? '' : 's')+'</div>' : '')+
      '<textarea name="text" maxlength="2000" rows="3" placeholder="Write a message" aria-label="Message"></textarea>'+
      '<button type="submit" class="button"><svg class="feather"><use xlink:href="res/feather-sprite.svg#send"></svg> Send</button> <span class="msgsendstatus"></span>'+
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
	area.find('.msgthread').html('<div class="msgstatus"><i>No messages yet. Say what you\'d like to trade.</i></div>');
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
    var ctx = m.context && (m.context.cardids || []).length ? '<div class="msgctx">Trade: '+m.context.cardids.map(function(id) {
      var c = cache_card_is(id) ? cache_card_fetch(id) : null;
      var t = c && c.title ? $('<div>').html([].concat(c.title).join(', ')).text() : 'card #'+id;
      return '<a href="#game='+tradeesc(m.context.game || database)+',#cardid='+parseInt(id)+'" onclick="docardid('+parseInt(id)+'); return false;">'+tradeesc(t)+'</a>';
    }).join(', ')+'</div>' : '';
    return '<div class="msg'+(m.from == me ? ' msgmine' : '')+'"><div class="msgmeta">'+tradeesc(m.from == me ? 'You' : (names[m.from] || ''))+' &middot; '+
      tradeesc(formatdate(new Date(m.time)))+'</div>'+ctx+'<div class="msgtext">'+tradeesc(m.text).replace(/\n/g, '<br>')+'</div></div>';
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
