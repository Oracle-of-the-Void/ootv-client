//TODO
// TODO: selectable change operations on text:   regexp/match/etc
// TODO: loading symbol on fetchcard (since it's ajax)
// TODO: active card name in dipslay ( like results returned)
// TODO: # cards in list in display (like numresults)

//  See:  oracle.api for api documentation currently

$.views.settings.allowCode(true);
$.views.tags("printingidfromset",templateprintingidfromset);
$.views.tags("imagehashfromset",templateimagehashfromset);
$.views.tags("imagefromset",templateimagefromset);
$.views.tags("setfromset",templatesetfromset);
$.views.tags("printingfromid",templateprintingfromid);
$.views.tags("snmset",templatesnmset);
$.views.tags("fetchimage",templatefetchimage);
$.views.tags("fetchdata",templatefetchdata);
$.views.tags("fetchfull",templatefetch);
$.views.helpers("concatarrays",templateconcatarrays);
$.views.helpers("makelinks",templatemakelinks);
$.views.helpers("sortlegality",templatesortlegality);
$.views.helpers("sortprintings",templatesortprintings);
$.views.helpers("printingidfromset",templateprintingidfromset);
$.views.helpers("listqty",listquantity);
$.views.helpers("hasval",templatehasval);
function formatdate(val) {
    return (new Date(val)).toLocaleDateString('en-US', {
	day:   'numeric',
	month: 'long',
	year:  'numeric'
    });
}
$.views.converters("formatDate", function(val) {return formatdate(val);});
// short form for the list directory: "Oct 3" this year, "Oct 3, 2025" before
function formatdateshort(val) {
    var d = new Date(val);
    var opts = {day: 'numeric', month: 'short'};
    if(d.getFullYear() != (new Date()).getFullYear()) {
	opts.year = 'numeric';
    }
    return d.toLocaleDateString('en-US', opts);
}
$.views.converters("formatDateShort", function(val) {return formatdateshort(val);});
function filenamecleaner(val) {
    return val.replace(/[^\-a-z0-9]/gi,'_').toLowerCase().replace(/_{2,}/,'_');
}
$.views.converters("filenamecleaner", function(val) {return filenamecleaner(val);});
// a title naming the card it's the soul of ("Agasha Kyoko, Soul of Isawa Miniko") links the
// "Soul of ..." part to a title search for that card. Titles that are just a "Soul of" phrase
// (Soul of Battle, The Soul of Akodo) need a comma or two words before it, so they stay plain.
function soultitle(val) {
  return [].concat(val === undefined || val === null ? [] : val).map(function(t) {
    var m = String(t).match(/^(.+?)((?:,|\s|&nbsp;)+)(Soul(?:\s|&nbsp;)+of(?:\s|&nbsp;)+.+)$/i);
    if(!m || !(m[2].includes(',') || /\S(?:\s|&nbsp;)+\S/.test(m[1]))) {
      return t;
    }
    return m[1]+m[2]+process_keywordlink(m[3],'keywords',searchables[database]['keywords'].type);
  }).join(', ');
}
$.views.converters("soultitle", soultitle);
var listtypes = {'deck':'Deck',
		 'collection':'Collection',
		 'have':'Have',
		 'want':'Want',
		 'other':'Other'};
$.views.converters("listTypeSelect",function(type) {
    var sel='';
    for (ltype in listtypes) {
	sel += '<option value="'+ltype+'"'+(ltype==type?' selected':'')+'>'+listtypes[ltype]+'</option>';
    }
    return sel;
});
$.views.converters("listLegalitySelect",function(legality) {
  var sel='<option value=""></option>';
  var base = (cache_select("legality.sortregex") || []).map(function(l) { return l.replace(/&nbsp;/g, " "); });
  // derived formats (Ivory Strict, Jade Extended, ...) go right after their base format; the rest
  // (BigDeck) at the end. Some (Legacy, Modern) are already in sortregex. Entries with
  // listable: false (Paper) are search filters, not formats, so they're left out.
  var derived = (cache_select("legality.derived") || []).filter(function(d) { return d.listable !== false; })
      .map(function(d) { return d.name.replace(/&nbsp;/g, " "); })
      .filter(function(d) { return base.indexOf(d) == -1; });
  var all = [];
  base.forEach(function(b) {
    all.push(b);
    derived.filter(function(d) { return d.indexOf(b+" ") == 0; }).forEach(function(d) {
      all.push(d);
      derived.splice(derived.indexOf(d),1);
    });
  });
  all = all.concat(derived);
  // saved lists may hold a value with only the first &nbsp; replaced, so compare normalized
  var current = (legality||'').replace(/&nbsp;/g, " ");
  all.forEach(function(thislegality) {
    sel += '<option value="'+thislegality+'"'+(thislegality==current?' selected':'')+'>'+thislegality+'</option>';
  });
  return sel;
});
$.views.converters("nbsptospace",function(val) {
  return (val||'').replace(/&nbsp;/g, " ");
});
$.views.converters("databaseitemlookup",function(item) {
  if(item=="blurb" && typeof blurb !== 'undefined' && blurb[database]) {
    return "<div>"+blurb[database]+"</div><br /><br />";
  }
  // a converter returning undefined makes JsViews render the raw argument ("blurb")
  return "";
});
function addslashes(str) {
    if(str) {
	if(Array.isArray(str)) {
	    return str.map(addslashes);
	} else {
	    return str.replace(/\\/g, '\\\\').replace(/\'/g, '\\\'').replace(/\"/g, '\\"').replace(/\0/g, '\\0');
	}
    } else {
	return str;
    }
}

function chunkArrayInGroups(arr, size) {
  var myArray = [];
  for(var i = 0; i < arr.length; i += size) {
    myArray.push(arr.slice(i, i+size));
  }
  return myArray;
}

function escapequotes(str) {
    return str.replace('"','&quot;');
}

function htmlEncode(value){
    if (value) {
        return jQuery('<div />').text(value).html();
    } else {
        return '';
    }
}

function htmlDecode(value) {
    if (value) {
        return $('<div />').html(value).text();
    } else {
        return '';
    }
}

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
function jsondiff(object, base) {
	function changes(object, base) {
		return _.transform(object, function(result, value, key) {
			if (!_.isEqual(value, base[key])) {
				result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
			}
		});
	}
	return changes(object, base);
}

function loadtest() {
	console.log("load test template");
	$("#all_template").append('<script src="templates/test.js?v='+ootvversion+'"></script>');
  addgametolist('test');
}

$.views.converters("addslashes",addslashes);

// preview (and local testing) uses the dev API stack, which runs the dev-ootv-search Lambda;
// the data behind it (DynamoDB, Elasticsearch) is shared with prod, so writes are still live
var apiuri = /^(preview\.|localhost|127\.0\.0\.1)/.test(location.hostname)
    ? "https://api-dev.oracleofthevoid.com"
    : "https://api.oracleofthevoid.com";
var searchcache = {};
// the API (Elasticsearch's max_result_window) only pages through the first 10000 results
const searchwindow = 10000;
// potential for language stuff:
const searcherror = {'empty': '<div class="error"><img src="res/splatout-150.png"><br>No cards found.</div>',
		     'error': '<div class="error"><img src="res/splatout-150.png"><br>Something went wrong with the search.</div>',
		     'more': '<div class="more">More Results (Click to load)</div>',
		     'moreloading': '<div class="moreloading">Loading <img width=20 src="res/shuriken-150x150.png-animated.gif" /></div>',
		     'loading': '<img src="res/shuriken-150x150.png-animated.gif" />',
		     'numresults': 'XXX cards found',
		     'window': '<div class="morelimit">Only the first '+searchwindow.toLocaleString()+' cards can be shown. Narrow the search to see the rest.</div>',
		     'moreerror': '<div class="morelimit">Loading more results failed.</div>',
		     'searchmiddle': 'Loading more search terms <img width=25 src="res/shuriken-150x150.png-animated.gif" />'
		    };
var oraclelayout;
var nolocalstore = {};
var searchables = {};
var searchselectload = {};
var templates = {'loaded':{}};
var templateactive = {};
var updates = {};
var updatepending = {};
var updatecallback = {};
var database = 'l5r';
var outputheaders = true;
var largeview = {'search': false, 'card': false, 'list': false};   // menubar size toggle per view: card-premium / visual-premium
if(found = window.location.href.match(/([\w_-]+)\.html/)) {
  if(found && found[1] != 'index') {
	  database = found[1];
	  console.log("database: "+database);
    cache_session("database",found[1]);
    window.location = location.protocol + '//' + location.host + location.pathname;
  }
}
if(cache_session("database")) {
  database = cache_session("database");
} else if(cache_session("favoritegame") && !/#game=/.test(location.hash)) {
  // no game picked in this browser yet: open the logged-in user's favorite (settings.all.game, copied by applyfavoritegame)
  database = cache_session("favoritegame");
}
var labels = {};
var populatecallback = [];
var auth;
var databasesort = {};
var headerize = {};
var refreshauthvar;
var dbinfo = {};
var blurb = {};
var searchsorts = {'':{}};
searchsorts[''][JSON.stringify([{'title.keyword':{'order': 'asc'}}])] = 'Title';
//	'random': 'Random'
searchsorts[database] = searchsorts[''];
// how /search compares text sorts (all case-insensitive); the first is the default
var sortmodes = {'lex': 'A\u2013Z', 'punct': 'Skip leading punctuation', 'library': 'Library (skip A/An/The)'};
var activelists = [];
var savetimeout = '';    // fires 15s after the last list edit
var savecheckpoint = ''; // fires at most 60s after the first unsaved edit
var missingimage = {"select": '/res/missing-stamp-rot150.png',
                    "details": '/res/missing-stamp-rot150.png',
                    "master": '/res/missing-stamp-rot150.png'
                   };

// *************************     AUTHENTICATION   *******************************
function dologin() {
    auth.getSession();
}
function dologout() {
    auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
}
// Clear Cache menu: drop cached data but keep the Cognito login tokens
function clearcache() {
    for (var i = localStorage.length - 1; i >= 0; i--) {
	var key = localStorage.key(i);
	if (key.indexOf("CognitoIdentityServiceProvider.") !== 0) {
	    localStorage.removeItem(key);
	}
    }
    window.location = window.location.href.split('#')[0];
}
function logoutcallback() {
    console.log("Not logged in");
    $('#loginfo').html("");
    $('.loginfo').hide()
    $('#loginbutton').show();
    $('.showonlogin').hide();
    $('.hideonlogin').show();
    rendersettings(); // logged out it shows only the search settings kept in this browser
    rendersavedsearches();
    updateviewbuttons();
}
function logincallback(session) {
    if (session) {
        console.log("Logged in");
	$('.loginfo').css({display:'block'});
 	$('#loginbutton').hide();
	$('.loginfo').show();
	$('.showonlogin').show();
	$('.hideonlogin').hide();
    }
    if(window.location.href.includes("#access_token") || window.location.href.includes("?code=")) {
	window.location = location.protocol + '//' + location.host + location.pathname;
    }
    if(!refreshauthvar) {
	// check every minute rather than one 45-minute timer: background tabs and sleep delay timers past the 1h expiry
	refreshauthvar = setInterval(refreshauth,60*1000);
	document.addEventListener('visibilitychange', function() { if(!document.hidden) refreshauth(); });
    }
    if(cache_thing("user","data")) {
	userinfocallback();
	refreshviewdefaults(); // pick up defaults saved from another tab/device
    } else {
	userinfo();
    }
  if (cache_thing("user","data") && ("oracle" in cache_thing("user","data")) && ("groups" in cache_thing("user","data").oracle[0])) {
    if(!cache_thing("structuretemplate",database)) {
        $.ajax({
          type: 'GET',
          url: apiuri+"/structure?database="+database+"&key=template",
          contentType: 'application/json',
          dataType: 'json',
          responseType: 'application/json',
          success: function(data) {
            cache_thing("structuretemplate",database,data);
            console.log(["structures loaded",data]);
          },
          error: function(error) { console.log("Structure Fetch Fail: "+JSON.stringify(error)); }
        });
    }
  }
    
}
function initCognitoSDK() {
    var authData = {
	ClientId : '2l3lsebipenkm36upk6e02uh7n',
	AppWebDomain : 'login.oracleofthevoid.com',
	TokenScopesArray : ['openid','email','profile'],
	RedirectUriSignIn : location.protocol + '//' + location.host + location.pathname,
	RedirectUriSignOut : location.protocol + '//' + location.host + location.pathname,
	UserPoolId : 'us-east-1_aIvSiSZy5',
	AdvancedSecurityDataCollectionFlag : false
    };
    var auth = new AmazonCognitoIdentity.CognitoAuth(authData);
    // You can also set state parameter     // auth.setState(<state parameter>);
    auth.userhandler = {
	onSuccess: function(result) {
	    logincallback(result);
	},
	onFailure: function(err) {
	    console.log("initcognito failure - logging out");
	    dologout();
	    logoutcallback();
	    //				alert("Error!" + err);
	}
    };
    auth.useCodeGrantFlow()
    return auth;
}
// refresh the ID token once it has under 10 minutes left
function refreshauth() {
    if(!authdead && refreshtoken()) {
	freshtoken(10*60).catch(function() {});
    }
}
function getidtoken() {
    return auth.getCachedSession().idToken.jwtToken;
}
function refreshtoken() {
    try { return auth.getCachedSession().getRefreshToken().getToken(); } catch(e) { return ''; }
}
// resolves once the cached ID token has more than minleft seconds left (0: refresh anyway), using the refresh token.
// Talks to the token endpoint itself: auth.refreshSession re-runs logincallback on success, redirects the page
// to the login screen when the refresh token is refused, and logs out (clearing localStorage) on a network error.
var authrefreshing = null;
var authdead = false; // the refresh token was refused: only logging in again helps
function freshtoken(minleft=0) {
    var exp = 0;
    try { exp = auth.getCachedSession().getIdToken().getExpiration() || 0; } catch(e) {}
    if(minleft && exp - Date.now()/1000 > minleft) {
	return $.Deferred().resolve().promise();
    }
    if(authrefreshing) {
	return authrefreshing;
    }
    authrefreshing = $.ajax({
	type: 'POST',
	url: 'https://' + auth.getAppWebDomain() + '/oauth2/token',
	data: {grant_type: 'refresh_token', client_id: auth.getClientId(), refresh_token: refreshtoken()}
    }).then(function(r) {
	// the same localStorage keys the Cognito SDK reads, so every open tab picks the new tokens up
	var key = 'CognitoIdentityServiceProvider.' + auth.getClientId() + '.' + auth.getLastUser();
	localStorage.setItem(key + '.idToken', r.id_token);
	localStorage.setItem(key + '.accessToken', r.access_token);
	if(r.refresh_token) {
	    localStorage.setItem(key + '.refreshToken', r.refresh_token);
	}
	auth.signInUserSession = auth.getCachedSession();
	console.log("Session refreshed");
    }, function(xhr) {
	if(xhr.status == 400 || xhr.status == 401) {
	    authdead = true; // expired or revoked; a network error can be retried
	}
	console.log("Session refresh failed: " + xhr.status);
	return $.Deferred().reject(xhr).promise();
    }).always(function() { authrefreshing = null; });
    return authrefreshing;
}
// an API call answered 401 (the token expired, e.g. the computer slept): refresh the token, or ask the
// user to log in again in a pop-up, then resend the call. Its own callbacks and promises only see the
// outcome of the resend, so nothing is lost and the page doesn't reload.
var authresends = $.Deferred().resolve().promise();
$.ajaxPrefilter(function(opts, orig, jqxhr) {
    if(orig.authretried || !opts.url || opts.url.indexOf(apiuri) !== 0) {
	return;
    }
    var result = $.Deferred();
    jqxhr.done(function() { result.resolveWith(this, arguments); });
    jqxhr.fail(function(xhr) {
	var ctx = this, args = arguments;
	if(xhr.status != 401 || !refreshtoken()) {
	    result.rejectWith(ctx, args);
	    return;
	}
	(authdead ? loginagain() : freshtoken().catch(loginagain)).then(function() {
	    // one resend at a time, oldest first, so an older deck save can't land after a newer one
	    authresends = authresends.then(function() {
		return $.ajax($.extend({}, orig, {authretried: true, success: null, error: null, complete: null}))
		    .done(function() { result.resolveWith(ctx, arguments); })
		    .fail(function() { result.rejectWith(ctx, arguments); })
		    .catch($.noop);
	    });
	}, function() { result.rejectWith(ctx, args); });
    });
    result.promise(jqxhr); // $.ajax attaches success/error and the caller's .done/.then to this
});
// the "Your login has expired" box; one at a time, shared by every call waiting on it
var loginwait = null;
function loginagain() {
    if(!loginwait) {
	loginwait = $.Deferred();
	$('#loginmodal-status').text('');
	$('#loginmodal').css('display','block');
    }
    return loginwait.promise();
}
// its Log in button: a click, so the pop-up isn't blocked
function loginpopup() {
    var w = window.open(auth.getFQDNSignIn(), 'ootvlogin', 'width=480,height=680');
    $('#loginmodal-status').text(w ? 'Log in in the new window; this page carries on afterwards.'
				 : 'The login window was blocked. Allow pop-ups for this site and try again.');
}
function logincancel() {
    $('#loginmodal').css('display','none');
    if(loginwait) {
	loginwait.reject();
	loginwait = null;
    }
}
// the pop-up has stored the new tokens (finishloginpopup)
function loginpopupdone() {
    var olduser = auth.username;
    auth.username = auth.getLastUser();
    auth.signInUserSession = auth.getCachedSession();
    authdead = false;
    $('#loginmodal').css('display','none');
    if(olduser && auth.username != olduser) {
	logincancel();
	window.location = location.protocol + '//' + location.host + location.pathname; // logged in as someone else
	return;
    }
    if(loginwait) {
	loginwait.resolve();
	loginwait = null;
    }
}
// this page is the login pop-up, back from the login screen with ?code=
function isloginpopup() {
    try {
	return location.search.includes('code=') && window.opener && window.opener !== window
	    && window.opener.location.origin == location.origin && typeof window.opener.loginpopupdone == 'function';
    } catch(e) {
	return false;
    }
}
function finishloginpopup() {
    document.body.innerHTML = '<p style="padding:2em">Logging in&hellip;</p>';
    var popupauth = initCognitoSDK();
    popupauth.userhandler = {
	onSuccess: function() {
	    window.opener.loginpopupdone();
	    window.close();
	},
	onFailure: function(err) {
	    document.body.innerHTML = '<p style="padding:2em">Login failed: ' + htmlEncode(String(err)) + '<br>Close this window and try again.</p>';
	}
    };
    popupauth.parseCognitoWebResponse(location.href);
}

//**********************88     ACCOUNT STUFFF ****************88
function userinfo() {
  $.ajax({
      type: 'GET',
      url: apiuri+"/user",
      contentType: 'application/json',
      dataType: 'json',
      beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
      responseType: 'application/json',
      success: function(data) {
	  console.log(data);
	  cache_thing("user","data",data);
	  userinfocallback();
      },
      error: function(error) { console.log("Epic Fail: "+JSON.stringify(error)); }
  });
}
function userinfocallback() {
    var info = cache_thing("user","data");
    showloginfo(info);
//    $('#userinfo-id').html("Uid: "+info.oracle[0].uid);
//    $('#userinfo-email').html(info.oracle[0].emails.join("<br />"));
//    $('#userinfo-joined').html(info.oracle[0].insert_date);
//    $('#userinfo-lists').html(info.oracle[0].deckcount);
    rendersettings();
//    $(".helloplace").replaceWith(hellotemplate.render({cognito: info.cognito, oracle: info.oracle[0]}));
    //	  $(".infoplace:first-child").before(hellotemplate.render({cognito: data.cognito, oracle: data.oracle[0]}));
    listinfo(); // TODO:  more intelligently decide if we need to do listinfo or just the callback
    if (("oracle" in cache_thing("user","data")) && ("groups" in cache_thing("user","data").oracle[0])) {
      $('.showonadmin').show();
    }
    updateviewbuttons();
    applyviewdefaults();
    rendersavedsearches();
    applysearchdefault();
    applyfavoritegame();
}
// the name to show: the one saved on the user (firstname/lastname, editable on Settings, #21), else the login's
function username(user) {
    var o = user && ("oracle" in user) && user.oracle[0];
    var name = o ? [o.firstname, o.lastname].filter(function(n) { return n; }).join(' ') : '';
    return name || (user && user.cognito && user.cognito.name) || '';
}
// the menubar name: in full, and on phones (the .phonehide/.phoneonly swap) just the first name, so it fits
function showloginfo(user) {
    var full = username(user);
    var o = user && ("oracle" in user) && user.oracle[0];
    var first = (o && o.firstname) || full.split(/\s+/)[0];
    $('#loginfo').empty().append($('<span class="phonehide">').text(full), $('<span class="phoneonly">').text(first));
}
function getuid() {
    return cache_thing("user","data").oracle[0].uid;
}
// signed in (or able to refresh the session), even before /user has answered
function signedin() {
    return auth.isUserSignedIn() || auth.getSignInUserSession().getRefreshToken().refreshToken!="";
}

//**********************88     LIST STUFFF ****************
// TODO: cache this better...
// done: called once the list's data is in the cache (listid set)
function listinfo(listid=null,switchview=true,listoutput=null,done=null) {
  console.log(["listinfo",listid,switchview,listoutput]);
  // exports (listoutput: text, Sun and Moon, PDF) skip the cache, so they never use a copy another computer has changed
  if(listid && !listoutput && cache_thing("list",listid) != null) {
	  console.log("cached");
	  $("#lastlistid").val(listid);
	  renderlist(cache_thing("list",listid).list.Items[0],switchview,listoutput+(outputheaders?'':',noheaders'));
	  if(done) {
	    done();
	  }
	  listrevalidate(listid);
  } else {
    console.log("listinfo_ajax");
	  $.ajax($.extend(listrequest(listid), {
	    type: 'GET',
	    dataType: 'json',
	    responseType: 'application/json',
	    success: function(data) {
		    console.log(data);
		    if(listid) {
		      if(listunsaved(listid) && cache_thing("list",listid)) {
			// unsaved local edits are newer than the server's copy
			data = cache_thing("list",listid);
		      } else {
			listsetbase(listid,data.list.Items[0].list,data.list.Items[0].rev);
		      }
		      listsortdefault(data);
		      cache_thing("list",listid,data);
		      $("#lastlistid").val(listid);
		      renderlist(data.list.Items[0],switchview,listoutput+(outputheaders?'':',noheaders'));
		      renderlisteditarea();
		      if(done) {
			done();
		      }
          /*		    console.log('here');
		                if(data.list.Items[0].list.length > 0 && typeof(data.list.Items[0].totalcount) == "undefined") {
			              console.log('fixing');
			              // fix the counts if they don't exist by adding 0 of first card.
			              addlistitem(listid,data.list.Items[0].list[0].cardid,data.list.Items[0].list[0].printing,0);
			              renderlist(data.list.Items[0],false,listoutput);
		                } */
		    } else {
		      cache_thing("list","data",data);
		      listinfocallback();
          renderlisteditarea();
		    }
	    },
	    error: function(error) {
		    console.log("Epic Fail: "+JSON.stringify(error));
		    if(listid && switchview && !listoutput && (error.status == 403 || error.status == 404)) {
		      listunavailable();
		    }
	    }
	  }));
  }
}
// a list's GET: your own lists (and others' public ones) through /list; logged out, a public list through
// /publiclist, as a CORS simple request (no Content-Type or Authorization: it has no OPTIONS route)
function listrequest(listid) {
  if(!listid || listloggedin()) {
    return {
      url: apiuri+"/list?uid="+getuid()+"&database="+database+(listid?"&listid="+listid:""),
      contentType: 'application/json',
      beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());}
    };
  }
  return {url: apiuri+"/publiclist?listid="+encodeURIComponent(listid)};
}
function listloggedin() {
  var user = cache_thing("user","data");
  return !!(user && ("oracle" in user));
}
// the list is the logged-in user's own: in their directory, or owned by them (a list fetched before the
// directory loaded). Only then does the list view show editing tools (listheader, the card rows' ~listmine).
function listmine(listid) {
  if(!listid || !listloggedin()) {
    return false;
  }
  var rev = cache_thing("list","datareverse");
  if(rev && rev[listid] !== undefined) {
    return true;
  }
  var list = cache_thing("list",listid);
  return !!(list && list.list && list.list.Items[0] && list.list.Items[0].owner == getuid());
}
// a #listid link to a list that's private, deleted or never existed (the API answers all three alike)
function listunavailable() {
  $('#resultlist').html('<div class="randarea">This list is private or doesn\'t exist.'+
    (listloggedin() ? '' : ' If it\'s yours, log in to see it.')+'</div>');
  showviewkeepurl('resultlist');
}
function listsortdefault(data) {
  if(data.list.Items[0].sort == undefined) {
    data.list.Items[0].sort = data.list.Items[0].type == 'deck' ? 'deck' : '';
  }
}
// edits not saved yet, or a save on its way: the local copy is newer than the server's
var listsaving = {};
function listunsaved(listid) {
  return !!(updatepending[listid] || listsaving[listid]);
}
// The server's copy local edits started from: when another computer saved first (409), the cards are
// merged three ways, so both computers' changes are kept.
function listsetbase(listid,list,rev) {
  cache_thing("listbase",listid,{"rev": rev || 0, "list": list});
}
function listmerge(listid,server) {
  var local = cache_thing("list",listid);
  var base = cache_thing("listbase",listid);
  if(!(server && server.Items && server.Items[0]) || !(local && local.list && local.list.Items && local.list.Items[0])) {
    return;
  }
  var key = function(c) { return c.cardid+'/'+(c.printing||0); };
  var qty = function(list) {
    var q = {};
    (list || []).forEach(function(c) { q[key(c)] = (q[key(c)] || 0) + parseInt(c.quantity); });
    return q;
  };
  // no base (cached before this version): this computer's copy wins, as saves used to
  var lq = qty(local.list.Items[0].list), bq = base ? qty(base.list) : lq, sq = qty(server.Items[0].list);
  var merged = [], seen = {};
  // the server's order first, then cards only this computer added; each count is the server's plus this computer's change
  server.Items[0].list.concat(local.list.Items[0].list).forEach(function(c) {
    var k = key(c);
    if(seen[k]) {
      return;
    }
    seen[k] = 1;
    var n = base ? (sq[k] || 0) + (lq[k] || 0) - (bq[k] || 0) : (lq[k] || 0);
    if(n > 0) {
      merged.push({"cardid": c.cardid, "printing": c.printing || 0, "quantity": n});
    }
  });
  console.log("list changed elsewhere, merged: "+listid);
  var data = {"list": server};
  listsortdefault(data);
  listsetbase(listid,server.Items[0].list,server.Items[0].rev);
  data.list.Items[0].list = merged;
  listcounts(data);
  cache_thing("list",listid,data);
  $('#list_modified\\:'+listid).text("Merged with changes from another computer");
  if($("#lastlistid").val() == listid) {
    renderlist(data.list.Items[0],false,null+(outputheaders?'':',noheaders'));
  }
  renderlisteditarea();
  refreshactivelistviews();
  // save the merged cards soon
  updatepending[listid] = 1;
  clearTimeout(savetimeout);
  savetimeout = setTimeout(savecallback,1000);
}
// A list shown from its cached copy: fetch the server's copy behind it, and if another computer changed
// the list (#337), cache it and redraw what shows it. Local edits not yet saved win.
function listrevalidate(listid) {
  $.ajax($.extend(listrequest(listid), {
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      var cached = cache_thing("list",listid);
      if(listunsaved(listid) || !cached || !(data && data.list && data.list.Items && data.list.Items[0])) {
        return;
      }
      listsortdefault(data);
      listsetbase(listid,data.list.Items[0].list,data.list.Items[0].rev);
      if(JSON.stringify(data.list.Items[0]) == JSON.stringify(cached.list.Items[0])) {
        return;
      }
      console.log("list changed elsewhere: "+listid);
      cache_thing("list",listid,data);
      if($("#lastlistid").val() == listid) {
        renderlist(data.list.Items[0],false,null+(outputheaders?'':',noheaders'));
      }
      renderlisteditarea();
      refreshactivelistviews();
    },
    error: function(error) { console.log("list refresh failed: "+listid); }
  }));
}
// back on this tab (maybe after editing on another computer): refresh the directory and the lists in use.
// A tab left on screen checks its lists every 30s too (polling 'visible': no directory), for two windows side
// by side, and every tab checks them hourly ('hourly'), even in the background.
var listsrevalidated = 0;
function listsrevalidate(polling) {
  if((document.hidden && polling !== 'hourly') || !refreshtoken() || !cache_thing("list","data") || Date.now() - listsrevalidated < 5*1000) {
    return;
  }
  listsrevalidated = Date.now();
  if(polling !== 'visible' && polling !== 'hourly') {
    listinfo();
  }
  var ids = activelists.slice();
  var shown = $("#lastlistid").val();
  if(shown && ids.indexOf(shown) < 0) {
    ids.push(shown);
  }
  ids.forEach(function(listid) {
    if(cache_thing("list",listid)) {
      listrevalidate(listid);
    }
  });
}
document.addEventListener('visibilitychange', listsrevalidate);
window.addEventListener('focus', listsrevalidate);
setInterval(function() { listsrevalidate('visible'); }, 30*1000);
setInterval(function() { listsrevalidate('hourly'); }, 60*60*1000);

// failed: called if the update doesn't go through
function listinfoupdate(listid,field,value,failed=null) {
  // valid fields:
  //     name=text, notes=text, public=t/f, type=short text, list = JSON.stringify(data)
  //   for the first 4, just do on change
  //   for the list, periodically do an update if stuff has changed to decrease traffic (have some sort of unsaved/saving/saved area)
  // TODO: rethink calling listinfo.. that might overwrite pending stuff?   or wait.. that's not the actual list..  might be ok
  //    either way, we need to trap pulling new list info if we have pending updates.
  // TODO:   when listinfoupdate is called, and lastmod is newer than what we have and we have a list, force update or dump cache
  var message_status = $('#list_modified\\:'+listid);
  var url = apiuri+"/list?uid="+getuid()+"&database="+database+"&listid="+listid+"&updatefield="+field+"&updatevalue="+encodeURIComponent(value);
  console.log(url);
  var cachedlist = cache_thing("list",listid);
  if(field == 'list') {
    listsaving[listid] = (listsaving[listid] || 0) + 1;
    if(cachedlist && cachedlist.list && cachedlist.list.Items && cachedlist.list.Items[0]) {
      // save over the version these edits started from; another computer's save since gets a 409 (#337)
      url += "&baserev="+(cachedlist.list.Items[0].rev || 0);
    }
  }
  $.ajax({
	  type: "GET",
	  url: url,
	  contentType: 'application/json',
	  dataType: 'json',
	  beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
	  responseType: 'application/json',
	  success: function(status) {
      if(field == 'list' && status && status.rev) {
        listsetbase(listid,JSON.parse(value),status.rev);
        var saved = cache_thing("list",listid);
        if(saved && saved.list && saved.list.Items && saved.list.Items[0]) {
          saved.list.Items[0].rev = status.rev;
          cache_thing("list",listid,saved);
        }
      }
      //message_status.show();
      message_status.text("List Updated");
      //hide the message
      setTimeout(function(){message_status.text(formatdateshort(new Date())).attr('title','Modified '+formatdate(new Date()))},3000);
	    //            setTimeout(function(){message_status.hide()},3000);
	    $("#list_prev_"+field).text(value);
	    if($("#importlistid").length) {
		    listid = $("#importlistid").val();
		    erasemodal();
      }
      if(field == 'list' && updatepending[listid]) {
        // edited again while this save was in flight: keep the newer local copy, the next save sends it
        console.log("keep listid cache, edits pending:"+listid);
        return;
      }
      console.log("clear listid cache:"+listid);
		    cache_thing("list",listid,null,true); //TODO  we might seed the cache..  but we get no verification that it took.  DynamoDB has no guarantee it's fresh, so might blow cache here.
        listinfo();
		    listinfo(listid,false);
	    //}
	  },
	  error: function(status) {
	    console.log(status);
	    if(field == 'list' && status.status == 409 && status.responseJSON && status.responseJSON.list) {
		listmerge(listid,status.responseJSON.list);
		return;
	    }
	    if(failed) {
		failed();
	    }
	  }
  }).always(function() {
    if(field == 'list' && !--listsaving[listid]) {
      delete listsaving[listid];
    }
  });
}

// ***********************  directory view and sort **************
// view: 'table' (detailed list) or 'cards'; phones default to cards. sort: {field, desc}, default newest modified first.
// Both are kept per browser (not per game) in localStorage.
var dirsortdefaults = {'modified': true, 'created': true, 'name': false, 'listid': false, 'type': false, 'legality': false};
var dirsortlabels = {'modified': 'Last Modified', 'created': 'Created', 'name': 'Name', 'listid': 'Id', 'type': 'Type', 'legality': 'Legality'};
function dirviewstate() {
  var view = cache_session("dirview");
  return (view == 'table' || view == 'cards') ? view : (narrowscreen() ? 'cards' : 'table');
}
function dirsortstate() {
  var sort = cache_session("dirsort");
  return (sort && dirsortdefaults.hasOwnProperty(sort.field)) ? sort : {'field': 'modified', 'desc': true};
}
function setdirview(view) {
  cache_session("dirview",view);
  renderdirectory();
}
// pick a sort field; picking the current one again flips the direction (like the search sort)
function setdirsort(field) {
  var sort = dirsortstate();
  if(sort.field == field) {
    sort.desc = !sort.desc;
  } else {
    sort = {'field': field, 'desc': dirsortdefaults[field]};
  }
  cache_session("dirsort",sort);
  renderdirectory();
}
function dirsortkey(list,field) {
  switch(field) {
    case 'modified': return Date.parse(list.modified || list.createdate) || 0;
    case 'created':  return Date.parse(list.createdate) || 0;
    case 'type':     return (listtypes[list.type] || list.type || '').toLowerCase();
    case 'legality': return (list.legality || '').replace(/&nbsp;/g," ").trim().toLowerCase();
    default:         return String(list[field] || '').trim().toLowerCase();
  }
}
// a sorted copy: the cached array's order backs the "datareverse" index, so it is never reordered
function sortlists(lists,sort) {
  var dir = sort.desc ? -1 : 1;
  var cmp = function(a,b) { return typeof a == 'number' ? a-b : a.localeCompare(b,undefined,{numeric: true}); };
  return lists.slice().sort(function(a,b) {
    var ka = dirsortkey(a,sort.field), kb = dirsortkey(b,sort.field);
    // lists with no name/legality go last whichever way it's sorted
    if(ka === '' || kb === '') {
      if(ka !== kb) { return ka === '' ? 1 : -1; }
    } else if(ka !== kb) {
      return dir*cmp(ka,kb);
    }
    // ties: newest modified first, then name
    return cmp(dirsortkey(b,'modified'),dirsortkey(a,'modified')) || cmp(dirsortkey(a,'name'),dirsortkey(b,'name'));
  });
}
function renderdirectory() {
  var dir = cache_thing("list","data");
  if(!dir || !dir.lists) { return; }
  var view = dirviewstate(), sort = dirsortstate();
  var path = dirpath();
  var ctx = {"pdfallowed": pdfallowed(), "snm": snmallowed(), "folderoptions": folderoptions};
  applyfolderselect();
  var listtemplate = $.templates(view == 'cards' ? "#template-listcards" : "#template-lists");
  var foldertemplate = $.templates(view == 'cards' ? "#template-dirfoldercard" : "#template-dirfolderrow");
  // the open folder's subfolders (by name), each with every folder under it (tree: shown as far as it's
  // expanded, see applydirtree), then its lists (in the directory sort). depth counts from the open folder.
  var pathdepth = path ? path.split('/').length : 0;
  var folderitem = function(folder) {
    var counts = foldercounts(folder);
    return {"folder": folder, "name": foldername(folder), "lists": counts.lists, "folders": counts.folders,
            "depth": folder.split('/').length - pathdepth - 1};
  };
  var subfolders = folderchildren(path).map(function(folder) {
    var item = folderitem(folder);
    item.tree = foldertree(folder).map(folderitem);
    return item;
  });
  // the table draws the tree as rows after its folder; a folder card holds its own
  var folderrows = view == 'cards' ? subfolders : subfolders.reduce(function(rows,item) { return rows.concat([item],item.tree); },[]);
  var lists = sortlists(dir.lists.Items.filter(function(list) { return listfolder(list) == path; }),sort);
  var html = foldertemplate.render(folderrows) + listtemplate.render(lists,ctx);
  if(!subfolders.length && !lists.length && path) {
    html += '<div class="directorylistitem dirempty"><div class="randarea">This folder is empty. New lists made here go in it, or drag a list onto a folder (or use its Folder menu).</div></div>';
  }
  $("#dirpathbar").html($.templates("#template-dirpath").render({"path": path, "parent": folderparent(path), "crumbs": foldercrumbs(path)})).show();
  $(".directorylistitem").remove();
  if(view == 'cards') {
    $("#directorycards").html($.templates("#template-listnewcard").render({})+html).show();
    $("#directorytable").hide();
  } else {
    $("#directorycards").empty().hide();
    $(html).insertAfter(".directorylistheader");
    $("#directorytable").show();
  }
  applydirtree();
  updatedirbuttons();
  //acknowledgement message
  $('#resultdir [contenteditable=true][id^="list_"], #resultdir .dirlistname').blur(function(){
    var field_userid = $(this).attr("id").split(/:/) ;
    // notes keep their line breaks
    var value = field_userid[0] == 'list_notes' ? editortext(this) : $(this).text() ;
	  //TODO:   update value
	  if($("#list_prev_"+field_userid[0].replace('list_','')+'\\:'+field_userid[1]).text() != value) {
	    //console.log($("#list_prev_"+field_userid[0].replace('list_','')+'\\:'+field_userid[1]).text());
	    console.log(field_userid);
	    listinfoupdate(field_userid[1],field_userid[0].replace('list_',''),value);
	  }
  });
  activelists.forEach(function(listid) {
    showlisttoggle(listid,true);
  });
}

// The text of a contenteditable box with its line breaks. Browsers store a typed Enter as a newline
// (white-space: pre-wrap), a <br>, or a new <div> line, and a blank line as <div><br></div>.
function editortext(el) {
  var out = '';
  (function walk(node) {
    node.childNodes.forEach(function(n) {
      if(n.nodeType == 3) {
        out += n.nodeValue;
      } else if(n.nodeName == 'BR') {
        out += '\n';
      } else {
        var block = /^(DIV|P)$/.test(n.nodeName);
        if(block && out && !out.endsWith('\n')) { out += '\n'; }
        walk(n);
        if(block && !out.endsWith('\n')) { out += '\n'; }
      }
    });
  })(el);
  return out.replace(/\n+$/,'');
}
// List names in the directory: a click or tap opens the list; a long press (or the pencil, shown with a mouse)
// edits the name in place. Enter or leaving the name saves it (the blur handler in renderdirectory), Escape undoes.
var dirnamepress = null;
function dirnameedit(el) {
  var name = $(el).closest('.directorylistitem').find('.dirlistname')[0];
  $(name).attr('contenteditable','true').focus();
  var range = document.createRange();
  range.selectNodeContents(name);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}
$(document).on('pointerdown', '#resultdir .dirlistname:not([contenteditable=true])', function(e) {
  if(e.button > 0) { return; }
  var el = this;
  clearTimeout(dirnamepress && dirnamepress.timer);
  dirnamepress = {x: e.clientX, y: e.clientY, long: false};
  dirnamepress.timer = setTimeout(function() { dirnamepress.long = true; dirnameedit(el); }, 500);
});
$(document).on('pointermove', function(e) {
  if(dirnamepress && !dirnamepress.long && Math.hypot(e.clientX - dirnamepress.x, e.clientY - dirnamepress.y) > 10) {
    clearTimeout(dirnamepress.timer);
    dirnamepress = null;
  }
});
$(document).on('pointerup pointercancel', function() {
  if(dirnamepress) { clearTimeout(dirnamepress.timer); }
});
$(document).on('click', '#resultdir .dirlistname', function() {
  var press = dirnamepress;
  dirnamepress = null;
  if($(this).attr('contenteditable') == 'true' || (press && press.long)) { return; }  // editing: the click places the caret
  listinfo(String($(this).data('list')),true);
});
// the list actions (grid) menu (directory and list view header) is placed against the window, so the scrolling directory (phones) can't clip it,
// and opens upward when there's no room below
$(document).on('click', '#resultdir .dirmenucell nav > ul > li, #resultlist .dirmenucell nav > ul > li', function() {
  var li = this, ul = $(li).children('ul');
  var r = li.getBoundingClientRect();
  ul.css({'position': 'fixed', 'top': r.bottom, 'left': 'auto', 'right': window.innerWidth - r.right});
  requestAnimationFrame(function() {
    var h = ul.outerHeight();
    if(r.bottom + h > window.innerHeight && r.top - h >= 0) {
      ul.css('top', r.top - h);
    }
  });
});
// with a mouse, a click opens or closes a grid menu (touch already toggles menus, see menutap); a click on
// an item or anywhere else closes it
$(document).on('click', function(e) {
  if(lastpointertype != 'mouse') {
    return;
  }
  var li = $(e.target).closest('#resultdir .dirmenucell nav > ul > li, #resultlist .dirmenucell nav > ul > li');
  var open = li.length && !$(e.target).closest('ul.dirlistmenu').length && !li.hasClass('menuopen');
  $('#resultdir .dirmenucell li.menuopen, #resultlist .dirmenucell li.menuopen').removeClass('menuopen');
  if(open) {
    li.addClass('menuopen');
  }
});
// a press anywhere on a list's card or table row that isn't one of its controls opens the list
$(document).on('click', '#directorycards [id^="listitem_"], #directorytable [id^="listitem_"]', function(e) {
  if($(e.target).closest('select, button, a, input, nav, [contenteditable=true], .dircardnotes, .dirnotes, .dirlistname, .dirdraghandle').length) { return; }
  listinfo(this.id.replace('listitem_',''),true);
});
$(document).on('contextmenu', '#resultdir .dirlistname:not([contenteditable=true])', function(e) {
  if(dirnamepress) { e.preventDefault(); }   // the long press is a rename, not the browser's menu
});
$(document).on('keydown', '#resultdir .dirlistname[contenteditable=true]', function(e) {
  if(e.key == 'Enter') {
    e.preventDefault();
    this.blur();
  } else if(e.key == 'Escape') {
    $(this).text($(document.getElementById(this.id.replace('list_name','list_prev_name'))).text());
    this.blur();
  }
});
$(document).on('blur', '#resultdir .dirlistname', function() {
  $(this).removeAttr('contenteditable');
});

// ***********************  directory folders **************
// A list's folder is its "folder" field: a path like "Tournament/2026" ('' or missing = top level).
// The directory shows one folder at a time (dirpath, kept per browser and game), with a path bar to go back up.
// Folders are saved in the user's settings[database].folders, so empty ones last; a folder named only by
// a list's path shows too. Folder names can't contain "/".
function listfolder(list) {
  return String(list.folder || '').trim();
}
function foldername(folder) {
  return folder.split('/').pop();
}
function folderparent(folder) {
  return folder.split('/').slice(0,-1).join('/');
}
function foldercmp(a,b) {
  return a.localeCompare(b,undefined,{numeric: true, sensitivity: 'base'});
}
function savedfolders() {
  var saved = savedgamesettings();
  return (saved && Array.isArray(saved.folders)) ? saved.folders.filter(function(f) { return typeof f == 'string' && f; }) : [];
}
// every folder: the saved ones and the ones lists are in, with all their parents
function dirfolders() {
  var dir = cache_thing("list","data");
  var all = {};
  var add = function(folder) {
    while(folder) { all[folder] = true; folder = folderparent(folder); }
  };
  savedfolders().forEach(add);
  ((dir && dir.lists) ? dir.lists.Items : []).forEach(function(list) { add(listfolder(list)); });
  return Object.keys(all).sort(foldercmp);
}
function folderchildren(path) {
  return dirfolders().filter(function(folder) { return folderparent(folder) == path; })
    .sort(function(a,b) { return foldercmp(foldername(a),foldername(b)); });
}
// every folder under folder, depth first (each folder's subfolders right after it, by name)
function foldertree(folder) {
  return folderchildren(folder).reduce(function(all,child) { return all.concat([child],foldertree(child)); },[]);
}
function foldercounts(folder) {
  var dir = cache_thing("list","data");
  return {"lists": dir.lists.Items.filter(function(list) { return listfolder(list) == folder; }).length,
          "folders": folderchildren(folder).length};
}
// the path bar: Top, then each folder down to the open one
function foldercrumbs(path) {
  var parts = path ? path.split('/') : [];
  return parts.map(function(name,i) { return {"folder": parts.slice(0,i+1).join("/"), "name": name, "last": i == parts.length-1}; });
}
// the open folder; falls back to the nearest parent that still exists (renamed or removed elsewhere)
function dirpath(set) {
  if(set !== undefined) { cache_thing("dir","path",set); return set; }
  var path = cache_thing("dir","path") || '';
  var folders = dirfolders();
  while(path && folders.indexOf(path) < 0) { path = folderparent(path); }
  return path;
}
function opendirfolder(folder) {
  dirpath(folder || '');
  renderdirectory();
  $("#resultdir").scrollTop(0);
}
// the folder of the clicked directory element (paths go through data-folder, so they need no quoting in onclick)
function eventfolder(el) {
  return $(el).closest("[data-folder]").attr("data-folder") || '';
}
// <option>s for a list's Folder select: every folder by its path
function folderoptions(current) {
  current = String(current || '').trim();
  return '<option value=""'+(current ? '' : ' selected')+'>Top level</option>' +
    dirfolders().map(function(folder) {
      return '<option value="'+_.escape(folder)+'"'+(folder == current ? ' selected' : '')+'>'+folder.split('/').map(_.escape).join(' &rsaquo; ')+'</option>';
    }).join('') +
    '<option value="\u0001new">New folder here&hellip;</option>';
}
// a new folder's path inside parent, or null (cancelled, or too long for the API's 255 characters)
function newfolderpath(parent,name) {
  if(!name) { return null; }
  var folder = parent ? parent+'/'+name : name;
  if(folder.length > 255) {
    alert("That folder path is too long (at most 255 characters, counting the folders it's in).");
    return null;
  }
  return folder;
}
function askfoldername(message,value) {
  var name = prompt(message,value || '');
  if(name === null) { return null; }
  name = name.trim();
  if(!name) { return null; }
  if(name.indexOf('/') > -1) {
    alert("Folder names can't contain \"/\".");
    return null;
  }
  return name;
}
// Save the folder set to the user's settings for this game (merged with the view defaults kept there).
// done(true) when saved; on failure it says so and reloads the user, so the folders shown are what's saved.
function savefolders(folders,done) {
  var gamesettings = Object.assign({}, savedgamesettings() || {});
  gamesettings['folders'] = folders.filter(function(f,i) { return f && folders.indexOf(f) == i; }).sort(foldercmp);
  $.ajax({
    type: 'GET',
    url: apiuri+"/user?database="+database+"&settings="+encodeURIComponent(JSON.stringify(gamesettings)),
    dataType: 'json',
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
    success: function(data) {
      var user = data && data.oracle && data.oracle[0];
      if(!user || !user.settings || !user.settings[database] || !Array.isArray(user.settings[database].folders)) {
        alert("Couldn't save your folders.");
        if(done) { done(false); }
        return;
      }
      cache_thing("user","data",data);
      if(done) { done(true); }
    },
    error: function(error) {
      console.log(error);
      alert("Couldn't save your folders: "+((error.responseJSON && error.responseJSON.error) || error.statusText || "network error"));
      if(done) { done(false); }
    }
  });
}
function newfolder() {
  var path = dirpath();
  var name = askfoldername("New folder"+(path ? " in \""+foldername(path)+"\"" : "")+":");
  var folder = newfolderpath(path,name);
  if(!folder) { return; }
  savefolders(dirfolders().concat([folder]),function() { renderdirectory(); });
}
// a list's Folder select changed
function setlistfolder(listid,select) {
  var folder = select.value;
  if(folder == '\u0001new') {
    var path = dirpath();
    var name = askfoldername("New folder"+(path ? " in \""+foldername(path)+"\"" : "")+":");
    folder = newfolderpath(path,name);
    if(!folder) { renderdirectory(); return; }
    savefolders(dirfolders().concat([folder]),function(ok) {
      if(ok) { updatelistfolders([listid],function() { return folder; }); } else { renderdirectory(); }
    });
    return;
  }
  updatelistfolders([listid],function() { return folder; });
}
function infolder(folder,path) {
  return path == folder || path.indexOf(folder+'/') == 0;
}
// rename keeps the folder where it is; its subfolders and lists move with it
function renamefolder(el) {
  var folder = eventfolder(el);
  var name = askfoldername("Rename folder \""+foldername(folder)+"\" to:",foldername(folder));
  if(!name || name == foldername(folder)) { return; }
  var renamed = newfolderpath(folderparent(folder),name);
  if(!renamed) { return; }
  if(dirfolders().indexOf(renamed) > -1 && !confirm("\""+name+"\" already exists here. Merge the two folders?")) { return; }
  var move = function(path) { return infolder(folder,path) ? renamed+path.slice(folder.length) : path; };
  movefolders(folder,move);
}
// removing a folder keeps what's in it: its lists and subfolders move up into its parent
function removefolder(el) {
  var folder = eventfolder(el), parent = folderparent(folder);
  var counts = foldercounts(folder);
  if((counts.lists || counts.folders) && !confirm("Remove folder \""+foldername(folder)+"\"? What's in it ("+
      counts.lists+" list"+(counts.lists == 1 ? "" : "s")+", "+counts.folders+" folder"+(counts.folders == 1 ? "" : "s")+
      ") moves up to "+(parent ? "\""+foldername(parent)+"\"" : "the top level")+".")) { return; }
  var move = function(path) {
    if(path == folder) { return parent; }
    return infolder(folder,path) ? (parent ? parent+'/' : '')+path.slice(folder.length+1) : path;
  };
  movefolders(folder,move,true);
}
// apply move(path) to the saved folders and to the lists under folder
function movefolders(folder,move,removing) {
  var folders = (removing ? dirfolders().filter(function(f) { return f != folder; }) : dirfolders()).map(move);
  var listids = cache_thing("list","data").lists.Items.filter(function(list) { return infolder(folder,listfolder(list)); }).map(function(list) { return list.listid; });
  savefolders(folders,function(ok) {
    if(!ok) { renderdirectory(); return; }
    var path = dirpath();
    if(infolder(folder,path)) { dirpath(removing && path == folder ? folderparent(folder) : move(path)); }
    // expanded folders stay expanded under their new paths
    cache_thing("dir","expanded",direxpanded().filter(function(f) { return !(removing && f == folder); }).map(move));
    updatelistfolders(listids,function(list) { return move(listfolder(list)); });
  });
}
// drag a folder into another (or to the top level): like a rename, its subfolders and lists move with it
function movefolderinto(folder,target) {
  var moved = newfolderpath(target,foldername(folder));
  if(!moved) { return; }
  if(dirfolders().indexOf(moved) > -1 && !confirm("\""+foldername(folder)+"\" already exists in "+
      (target ? "\""+foldername(target)+"\"" : "the top level")+". Merge the two folders?")) { return; }
  movefolders(folder,function(path) { return infolder(folder,path) ? moved+path.slice(folder.length) : path; });
}

// ***********************  directory folder tree **************
// A folder with subfolders has a toggle that shows them under it (all of them are drawn; applydirtree hides
// the ones under collapsed folders). The expanded folders are kept per browser and game.
function direxpanded() {
  var expanded = cache_thing("dir","expanded");
  return Array.isArray(expanded) ? expanded : [];
}
function setdirexpanded(folder,open) {
  var expanded = direxpanded().filter(function(f) { return f != folder; });
  if(open) { expanded.push(folder); }
  cache_thing("dir","expanded",expanded);
  applydirtree();
}
function toggledirfolder(el) {
  var folder = eventfolder(el);
  setdirexpanded(folder,direxpanded().indexOf(folder) < 0);
}
// a tree folder shows when every folder between the open one and it is expanded
function applydirtree() {
  var expanded = direxpanded(), path = dirpath();
  $("#resultdir .dirtreeitem[data-folder]").each(function() {
    var shown = true, up = folderparent(this.getAttribute("data-folder"));
    while(shown && up && up != path) {
      shown = expanded.indexOf(up) > -1;
      up = folderparent(up);
    }
    $(this).toggle(shown);
  });
  $("#resultdir .dirfoldertree").each(function() {
    $(this).toggle(expanded.indexOf(eventfolder(this)) > -1);
  });
  $("#resultdir .dirtoggle").each(function() {
    var open = expanded.indexOf(eventfolder(this)) > -1;
    $(this).toggleClass("direxpanded",open).attr("aria-label",open ? "Hide subfolders" : "Show subfolders");
  });
}

// ***********************  directory drag and drop **************
// Drag a list (by its move handle) or a folder onto a folder (a row, a card, or a folder in an expanded tree)
// or onto the path bar (All lists = the top level) to move it there. Holding it over a collapsed folder
// opens that folder's tree. The Folder menu does the same without dragging.
// Mice use HTML5 drag and drop. Touch has its own drag (Android Chrome doesn't drag from touch): a list
// drags from its handle straight away, a folder after a long-press, so a swipe across folders still scrolls.
// Both show the same label by the pointer, naming what's moving and where it would go; the item moved fades.
var dirdrag = null;            // what's being dragged: {"listid": id} or {"folder": path}
var dirdragexpand = null;      // timer for opening the folder held over
var dirtouch = null;           // a touch on something draggable: {el, handle, x, y, timer, scroll}
var dirghost = null;           // the drag label
// mouse drags show the label instead of the browser's drag image, which can't change as it moves
var dirblankimage = new Image();
dirblankimage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
function dirdragsource(el) {
  return $(el).closest("#resultdir [data-draglist], #resultdir [data-dragfolder]");
}
function dirdroptarget(el) {
  return $(el).closest("#resultdir [data-dirdrop]");
}
function dirdragof(el) {
  return el.is("[data-draglist]") ? {"listid": el.attr("data-draglist")} : {"folder": el.attr("data-folder")};
}
function dirdropok(drag,target) {
  if(!drag || typeof target != 'string') { return false; }
  if(drag.listid) {
    var dir = cache_thing("list","data"), index = cache_thing("list","datareverse")[drag.listid];
    return !!dir.lists.Items[index] && listfolder(dir.lists.Items[index]) != target;
  }
  return target != folderparent(drag.folder) && !infolder(drag.folder,target);
}
function dirdropclear() {
  $("#resultdir .dirdropover").removeClass("dirdropover");
  clearTimeout(dirdragexpand);
  dirdragexpand = null;
}
function dirdragdone() {
  dirdrag = null;
  dirdropclear();
  $("#resultdir").removeClass("dirdragging");
  $("#resultdir .dirdragsource").removeClass("dirdragsource");
  if(dirghost) {
    dirghost.remove();
    dirghost = null;
  }
  if(dirtouch) {
    clearTimeout(dirtouch.timer);
    clearInterval(dirtouch.scroll);
    dirtouch = null;
  }
}
// start showing the drag: the label, and source (the handle or folder dragged) faded
function dirghostshow(source) {
  var label = dirdrag.listid ? $(document.getElementById("list_name:"+dirdrag.listid)).text() : foldername(dirdrag.folder);
  dirghost = $('<div class="dirdragghost"><div class="dirghostname"><svg class="feather"><use xlink:href="res/feather-sprite.svg#'+
    (dirdrag.listid ? 'move' : 'folder')+'"></svg> <span></span></div><div class="dirghosttarget"></div></div>').appendTo("body");
  dirghost.find(".dirghostname span").text(label || dirdrag.listid);
  $("#resultdir").addClass("dirdragging");
  source.closest(".directorylistitem, .dirsubfolder").addClass("dirdragsource");
}
// the label at the pointer (x,y): above a finger, below and right of a mouse pointer, kept on screen.
// ok: the folder under the pointer takes the drop.
function dirghostat(x,y,ok,folder,touch) {
  if(!dirghost) { return; }
  dirghost.toggleClass("dirghostok",ok).find(".dirghosttarget")
    .text(ok ? "\u2192 "+(folder ? foldername(folder) : "All lists (top level)") : "Drag onto a folder");
  var w = dirghost.outerWidth(), h = dirghost.outerHeight();
  var left = touch ? x-w/2 : x+16, top = touch ? y-h-40 : y+20;
  dirghost.css({"left": Math.max(6,Math.min(left,window.innerWidth-w-6)), "top": Math.max(6,Math.min(top,window.innerHeight-h-6))});
}
// dragging over el: highlight it if it takes the drop, and open it if it's held there; true when it takes it
function dirdragover(el) {
  if(!el.length || !dirdropok(dirdrag,el.attr("data-folder"))) {
    dirdropclear();
    return false;
  }
  if(el.hasClass("dirdropover")) { return true; }
  dirdropclear();
  el.addClass("dirdropover");
  var folder = el.attr("data-folder");
  if(el.find(".dirtoggle").filter(function() { return eventfolder(this) == folder; }).length && direxpanded().indexOf(folder) < 0) {
    dirdragexpand = setTimeout(function() { setdirexpanded(folder,true); },700);
  }
  return true;
}
// the drop: file the list or move the folder into el's folder
function dirdropon(el) {
  var drag = dirdrag, target = el.length ? el.attr("data-folder") : null;
  dirdragdone();
  if(!dirdropok(drag,target)) { return; }
  if(drag.listid) {
    updatelistfolders([drag.listid],function() { return target; });
  } else {
    movefolderinto(drag.folder,target);
  }
}
$(document).on("dragstart",function(e) {
  var el = dirdragsource(e.target);
  if(!el.length) { return; }
  if(dirtouch || !gestureon('dirdragmouse')) {          // iOS drags from touch too: the touch drag below handles it
    e.preventDefault();
    return;
  }
  var dt = e.originalEvent.dataTransfer;
  dirdrag = dirdragof(el);
  if(dt.setDragImage) { dt.setDragImage(dirblankimage,0,0); }
  dt.setData("text/plain",dirdrag.listid ? $(document.getElementById("list_name:"+dirdrag.listid)).text() : dirdrag.folder);
  dt.effectAllowed = "move";
  var x = e.originalEvent.clientX, y = e.originalEvent.clientY;
  // after the drag has started, so the browser doesn't snapshot the fading and outlines
  setTimeout(function() {
    if(dirdrag && !dirghost) {
      dirghostshow(el);
      dirghostat(x,y,false,null);
    }
  },0);
});
$(document).on("dragover",function(e) {
  if(!dirdrag || dirtouch) { return; }
  var el = dirdroptarget(e.target), ok = dirdragover(el);
  dirghostat(e.originalEvent.clientX,e.originalEvent.clientY,ok,el.attr("data-folder"));
  if(ok) {
    e.preventDefault();
    e.originalEvent.dataTransfer.dropEffect = "move";
  }
});
$(document).on("drop",function(e) {
  if(!dirdrag || dirtouch) { return; }
  var el = dirdroptarget(e.target);
  if(el.length) { e.preventDefault(); }
  dirdropon(el);
});
$(document).on("dragend",function() {
  if(!dirtouch) { dirdragdone(); }
});
// touch drag: what's under the finger is the target
function dirtouchbegin() {
  if(!dirtouch || dirdrag) { return; }
  dirdrag = dirdragof(dirtouch.el);
  if(window.getSelection) { window.getSelection().removeAllRanges(); }
  dirghostshow(dirtouch.el);
  if(navigator.vibrate) { navigator.vibrate(15); }
  dirtouchmove(dirtouch.x,dirtouch.y);
}
function dirtouchover() {
  var el = dirdroptarget(document.elementFromPoint(dirtouch.x,dirtouch.y));
  dirghostat(dirtouch.x,dirtouch.y,dirdragover(el),el.attr("data-folder"),true);
}
function dirtouchmove(x,y) {
  dirtouch.x = x;
  dirtouch.y = y;
  dirtouchover();
  // held near the top or bottom: scroll the directory
  var step = y < 80 ? -14 : (y > window.innerHeight-80 ? 14 : 0);
  clearInterval(dirtouch.scroll);
  if(step) {
    dirtouch.scroll = setInterval(function() {
      if(!dirtouch) { return; }
      document.getElementById("resultdir").scrollTop += step;
      window.scrollBy(0,step);
      dirtouchover();
    },30);
  }
}
document.addEventListener("touchstart",function(e) {
  if(dirdrag || e.touches.length != 1) { return; }
  var el = dirdragsource(e.target);
  if(!el.length || !gestureon('dirdragtouch')) { return; }
  var t = e.touches[0];
  dirtouch = {"el": el, "handle": el.is("[data-draglist]"), "x": t.clientX, "y": t.clientY, "x0": t.clientX, "y0": t.clientY};
  // a handle also starts on a short hold, before the browser's long-press can select text
  dirtouch.timer = setTimeout(dirtouchbegin,dirtouch.handle ? 150 : 400);
},{passive: true});
document.addEventListener("touchmove",function(e) {
  if(!dirtouch) { return; }
  var t = e.touches[0];
  if(!dirdrag) {
    var moved = Math.hypot(t.clientX-dirtouch.x,t.clientY-dirtouch.y);
    if(!dirtouch.handle) {
      if(moved > 10) { dirdragdone(); }   // a swipe before the long-press: let it scroll
      return;
    }
    if(moved < 5) { return; }
    dirtouchbegin();
  }
  e.preventDefault();
  if(Math.hypot(t.clientX-dirtouch.x0,t.clientY-dirtouch.y0) >= 5) { dirtouch.moved = true; }
  dirtouchmove(t.clientX,t.clientY);
},{passive: false});
document.addEventListener("touchend",function(e) {
  if(!dirtouch) { return; }
  if(!dirdrag) {
    clearTimeout(dirtouch.timer);
    dirtouch = null;
    return;
  }
  if(dirtouch.handle && !dirtouch.moved) {     // held still and let go: a tap (the table's Id cell opens the list)
    dirdragdone();
    return;
  }
  e.preventDefault();     // no click on whatever is under the finger
  dirdropon(dirdroptarget(document.elementFromPoint(dirtouch.x,dirtouch.y)));
},{passive: false});
document.addEventListener("touchcancel",function() {
  if(dirtouch) { dirdragdone(); }
});
// a long-press on a handle or folder mustn't select text or open the browser's link or copy menu
document.addEventListener("contextmenu",function(e) {
  if(dirtouch && dirdragsource(e.target).length) { e.preventDefault(); }
});
document.addEventListener("selectstart",function(e) {
  if(dirtouch) { e.preventDefault(); }
});

// File lists: folderof(list) gives each list's new folder. One update per list, then the directory is
// redrawn from the cache (filing doesn't change modified, so the cached directory stays right without a refetch).
function updatelistfolders(listids,folderof) {
  var dir = cache_thing("list","data");
  var rev = cache_thing("list","datareverse");
  var failed = 0;
  $.when.apply($, listids.map(function(listid) {
    var folder = folderof(dir.lists.Items[rev[listid]]);
    return $.ajax({
      type: "GET",
      url: apiuri+"/list?uid="+getuid()+"&database="+database+"&listid="+listid+"&updatefield=folder&updatevalue="+encodeURIComponent(folder),
      contentType: 'application/json',
      dataType: 'json',
      beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
      success: function() {
        dir.lists.Items[rev[listid]].folder = folder;
        var cached = cache_thing("list",listid);
        if(cached) {
          cached.list.Items[0].folder = folder;
          cache_thing("list",listid,cached);
        }
      },
      error: function(status) {
        failed++;
        console.log(status);
      }
    }).then(null,function() { return $.Deferred().resolve(); }); // one failure doesn't stop waiting for the rest
  })).then(function() {
    cache_thing("list","data",dir);
    renderdirectory();
    if(failed) {
      alert("Couldn't move "+failed+" list"+(failed == 1 ? "" : "s")+"; the directory has been reloaded.");
      listinfo();
    }
  });
}

// menubar on the Directory tab: its view buttons and sort dropdown (the search ones are hidden there)
function updatedirbuttons() {
  var ondir = currentresulttab() == 'dir';
  var view = dirviewstate(), sort = dirsortstate();
  $("#templatebuttons button[data-dirview]").each(function() {
    $(this).toggle(ondir).toggleClass("searchviewactive", $(this).data("dirview") == view);
  });
  $(".dirsortbuttons").toggle(ondir);
  $("#dirsortdropdown").html(Object.keys(dirsortlabels).map(function(key) {
    return '<li'+(sort.field == key ? ' class="menuactive'+(sort.desc ? ' searchdesc' : '')+'"' : '')+' onclick="setdirsort(\''+key+'\');">'+dirsortlabels[key]+'</li>';
  }).join(''));
}

function listinfocallback() {
  cache_thing("list","datareverse",cache_thing("list","data").lists.Items.reduce((hsh,list,index) => { hsh[list.listid]=index; return hsh;},{}));
  renderdirectory();
  syncactivelists();
  searchaddall($('#lastsearchquery').val()); // logged in after the search showed
  // nothing in the list view yet: load the first list in the directory behind the scenes
  var lists = cache_thing("list","data").lists.Items;
  if(urlpendinglist) {
	  // a #listid link opened before login finished
	  var listid = urlpendinglist;
	  urlpendinglist = null;
	  urlrestoring = 'list';
	  listinfo(listid,true);
  } else if(!$("#lastlistid").val() && lists.length) {
	  listinfo(lists[0].listid,false);
  }
  //	  $(".infoplace:first-child").before(hellotemplate.render({cognito: data.cognito, oracle: data.oracle[0]}));
}

function toggleheaders() {
    if(outputheaders) {
	$(".toggleheaderson").hide();
	$(".toggleheadersoff").show();
    } else {
	$(".toggleheaderson").show();
	$(".toggleheadersoff").hide();
    }
    outputheaders = !outputheaders;
}

// ***********************  list edits **************
function renderlisteditarea() {
    if(activelists.length < 1) {
	$("#deckarea").html(Object.keys(updatepending).length >0 ? '<div class="randarea"><span style="background-color:red;" onclick="savecallback();">Updates Pending</span></div>' :'');
    } else {
	listactivetemplate = $.templates("#template-listactive");
	$("#deckarea").html(
	    '<div class="randarea">Active Lists:<br />'+
		(Object.keys(updatepending).length >0 ? '<span style="background-color:red;" onclick="savecallback();">Updates Pending</span>' :'')+
		listactivetemplate.render(activelists.map(function(listid) {
		    var list=cache_thing("list","data").lists.Items[cache_thing("list","datareverse")[listid]];
		    if(cache_thing("list",listid)) {
			list.listdata = cache_thing("list",listid);
		    }
		    return list;
		}))+
		'</div><br /><br />'
	);
    }
}

// a list's activate toggle, in the directory and the list view header
function showlisttoggle(listid,on) {
    var hdr = $('#resultlist .listviewheader[data-list="'+listid+'"]');
    $("#listinactive"+listid).add(hdr.find('.listtoggleoff')).toggle(!on);
    $("#listactive"+listid).add(hdr.find('.listtoggleon')).toggle(on);
}

// done: once the list's cards are loaded (the swipe list picker adds the card then)
function activatelist(listid, done=null) {
    var index = activelists.indexOf(listid);
    if (index > -1) {
       activelists.splice(index, 1);
    }
    activelists.unshift(listid);
    showlisttoggle(listid,true);
    saveactivelists();
    renderlisteditarea();
    // after activelists has it: a cached list calls back at once, and the refresh renders its controls
    listinfo(listid,false,null,function() {
	refreshactivelistviews();
	if(done) {
	    done();
	}
    });
}

function deactivatelist(listid) {
    var index = activelists.indexOf(listid);
    if (index > -1) {
       activelists.splice(index, 1);
    }
    showlisttoggle(listid,false);
    saveactivelists();
    renderlisteditarea();
    refreshactivelistviews();
}

// Active lists are per tab: sessionStorage keeps them across a reload, and a new tab starts with none.
function saveactivelists() {
    try { sessionStorage.setItem(database+"_activelists", JSON.stringify(activelists)); } catch(e) {}
}

// Called whenever the list directory is drawn (it needs the list data, so login is done). The first time,
// restore this tab's active lists. Every time, drop lists that no longer exist and set the directory toggles.
var activelistsrestored = false;
function syncactivelists() {
    var rev = cache_thing("list","datareverse");
    var restoring = !activelistsrestored;
    if(restoring) {
	activelistsrestored = true;
	var saved = null;
	try { saved = JSON.parse(sessionStorage.getItem(database+"_activelists")); } catch(e) {}
	if(Array.isArray(saved) && !activelists.length) {
	    activelists = saved;
	}
    }
    var before = activelists.length;
    activelists = activelists.filter(function(listid) { return rev.hasOwnProperty(listid); });
    activelists.forEach(function(listid) {
	showlisttoggle(listid,true);
    });
    saveactivelists();
    if(restoring && activelists.length) {
	renderlisteditarea();
	// load each list for its counts and controls; the last one loaded fills the list view, so oldest first
	activelists.slice().reverse().forEach(function(listid) { listinfo(listid,false,null,refreshactivelistviews); });
    } else if(activelists.length != before) {
	renderlisteditarea();
	refreshactivelistviews();
    }
}

// The search results and the card view show controls for the active lists. Re-render them in place after
// a list is activated or deactivated: no new search, no history entry, the tab on screen and scroll stay.
function refreshactivelistviews() {
    var qs = $('#lastsearchquery').val();
    if(qs && searchcache[database] && searchcache[database]['querydata'][qs] && searchcache[database]['querydata'][qs].length) {
	var request = $.extend(true, {}, searchcache[database]['queryrequest'][qs] || $.deparam(qs));
	var data = searchcache[database]['querydata'][qs].map(cache_card_fetch);
	var scrolled = [window, '#maincontent', '#resultsearch'].map(function(el) { return [el, $(el).scrollTop()]; });
	$("#resultsearch").html(rendercards(data,request,qs));
	dosearchpostcallback(qs);
	updates[database]('#resultsearch');
	scrolled.forEach(function(s) { $(s[0]).scrollTop(s[1]); });
    }
    if($("#lastcardid").val()) {
	docardid($("#lastcardid").val(), lastcardprid(), qs || null, false, false);
    }
}

// done(listid): after the new list is in the directory (default: make it active)
function newlist(json=null, done=null) {
    // from the directory or the swipe list picker: ask for a name (cancel: no list), and it goes in the open folder
    if(json === null) {
	var path = dirpath();
	var name = prompt("New list"+(path ? " in \""+foldername(path)+"\"" : "")+":", "New List");
	if(name === null) {
	    return;
	}
	json = {"name": name.trim() || "New List", "list": [], "public": false, "type": "deck"};
	if(path) {
	    json.folder = path;
	}
    }
    /*
    Create new list.   json example:
    {
    "name": "new list name",  // default: "New List"
    "list": [ { cardid: 6974, printing: 0, quantity: 3 },   // default: empty list
              { cardid:  123, printing: 2, quanity: 1}
	      ],
    "public": true, // default false
    "type": "collection",   // default 'deck'
    "folder": "Tournament decks"   // default unfiled
    }
    json replaces the whole default item, so give every field
    game is set from queryString
    owner is set from authentication information and matching queryString
    createdate, modified are automatically set and non-modifiable currently
    */
    $.ajax({
	type: 'GET',
	url: apiuri+"/list?uid="+getuid()+"&database="+database+"&listid=new"+(json?"&json="+encodeURIComponent(JSON.stringify(json)):''),
	contentType: 'application/json',
	dataType: 'json',
	beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
	responseType: 'application/json',
	success: function(data) {
	    console.log(data);
	    var oldlists = cache_thing("list","data");
	    oldlists.lists.Items.unshift(data.list.Item);
	    cache_thing("list","data",oldlists);
	    listinfocallback();
	    if(done) {
		done(data.list.Item.listid);
	    } else {
		activatelist(String(data.list.Item.listid));
	    }
	},
	error: function(error) { console.log("Epic Fail: "+JSON.stringify(error)); }
    });
}

// done(item): the new list, once it's in the directory; failed: the copy didn't go through
function duplicatelist(listid, done=null, failed=null) {
  $.ajax({
    type: 'GET',
    url: apiuri+"/list?uid="+getuid()+"&database="+database+"&listid="+listid+"&action=duplicate",
    contentType: 'application/json',
    dataType: 'json',
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
    responseType: 'application/json',
    success: function(data) {
  console.log(data);
  var oldlists = cache_thing("list","data");
  oldlists.lists.Items.unshift(data.list.Item);
  cache_thing("list","data",oldlists);
  listinfocallback();
  if(done) {
    done(data.list.Item);
  }
    },
    error: function(error) {
      console.log("Epic Fail: "+JSON.stringify(error));
      if(failed) {
        failed(error);
      }
    }
  })
}

function removelist(listid) {
    if(confirm("Really remove list: "+listid+"?")) {
	$.ajax({
	    type: 'GET',
	    url: apiuri+"/list?uid="+getuid()+"&database="+database+"&listid="+listid+"&action=remove",
	    contentType: 'application/json',
	    dataType: 'json',
	    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
	    responseType: 'application/json',
	    success: function(data) {
		console.log(data);

	    },
	    error: function(error) { console.log("Epic Fail: "+JSON.stringify(error)); }
	});
	var oldlists = cache_thing("list","data");
	oldlists.lists.Items = oldlists.lists.Items.filter(function(list) { return list.listid != listid; });
	cache_thing("list","data",oldlists);
	$("#listitem_"+listid).remove();
	if($("#lastlistid").val() == listid) {
	    $("#lastlistid").val('');
	    $("#resultlist").html('<div class="randarea">No list selected, click on Directory</div>');
	}
	listinfocallback();
    }
}

// a list was edited: save 15s after the last edit, and at least every minute while edits keep coming
function listedited(listid) {
    updatepending[listid]=1;
    clearTimeout(savetimeout);
    savetimeout = setTimeout(savecallback,15*1000);
    if(!savecheckpoint) {
	savecheckpoint = setTimeout(savecallback,60*1000);
    }
}
function savecallback() {
    console.log("Saving....");
    clearTimeout(savetimeout);
    clearTimeout(savecheckpoint);
    savecheckpoint = '';
    Object.keys(updatepending).forEach(function(listid) {
	var list = cache_thing("list",listid);
	delete updatepending[listid];
	if(!(list && list.list && list.list.Items && list.list.Items[0])) {
	    console.warn("savecallback: list "+listid+" isn't cached, nothing to save");
	    return;
	}
	var retry = function() {
	    // keep it pending and try again at the next checkpoint
	    updatepending[listid]=1;
	    if(!savecheckpoint) {
		savecheckpoint = setTimeout(savecallback,60*1000);
	    }
	    renderlisteditarea();
	};
	try {
	    listinfoupdate(listid,'list',JSON.stringify(list.list.Items[0].list),retry);
	} catch(e) {
	    console.log(e);
	    retry();
	}
    });
    renderlisteditarea(); // update card counts
}

// how many of this card (and printing) the list holds, shown beside its +/- buttons (span.listqty)
function listquantity(listid,cardid,prid=0) {
    var list = cache_thing("list",listid);
    if(!(list && list.list && list.list.Items && list.list.Items[0])) {
	return '';
    }
    var item = list.list.Items[0].list.find(function(ele) { return ele.cardid == cardid && ele.printing == (prid||0); });
    return item ? item.quantity : 0;
}
function addlistitem(listid,cardid,prid=0,n=1,abs=false,sort=null) {
    if(!listmine(listid)) {
	console.warn("addlistitem: list "+listid+" isn't yours");
	return;
    }
    //var list=cache_thing("list","data").lists.Items[cache_thing("list","datareverse")[listid]];
    // listinfoupdate(listid,'list',JSON.stringify(cache_thing("list",listid).list.Items[0].list));
    var list = cache_thing("list",listid);
    listitemchange(list,cardid,prid,n,abs);
    listcounts(list);
    cache_thing("list",listid,list);
    $('span.listqty[data-list="'+listid+'"][data-card="'+cardid+'"]').filter(function() { return $(this).data('printing') == (prid||0); }).text(listquantity(listid,cardid,prid));
    listitemsdone(listid);
}
// many cards at once (search "Add all to list"): items = [[cardid, prid], ...], n copies of each; one render and save
function addlistitems(listid,items,n=1) {
    if(!listmine(listid)) {
	console.warn("addlistitems: list "+listid+" isn't yours");
	return;
    }
    var list = cache_thing("list",listid);
    items.forEach(function(item) {
	listitemchange(list,item[0],item[1],n,false);
    });
    listcounts(list);
    cache_thing("list",listid,list);
    listitemsdone(listid);
    refreshactivelistviews(); // the search results' counts
}
// one card's change in a cached list (cache_thing): n copies more (abs: exactly n; null: remove)
function listitemchange(list,cardid,prid=0,n=1,abs=false) {
    var ind = list.list.Items[0].list.findIndex(function(ele) { return ele.cardid == cardid && ele.printing == prid; });
    if(ind<0 && n != null) {
	list.list.Items[0].list.push({'cardid':cardid,'printing':prid,'quantity':n});
    } else {
	if(n == null) {
	    list.list.Items[0].list.splice(ind,1);
	} else {
	    if(abs) {
		list.list.Items[0].list[ind].quantity = n;
	    } else {
		list.list.Items[0].list[ind].quantity += n;
	    }
	}
    }
}
function listcounts(list) {
    list.list.Items[0].distinctcount = list.list.Items[0].list.length;
    list.list.Items[0].totalcount = list.list.Items[0].list.reduce(function (total,card) {
	return total + parseInt(card['quantity']);
    },0);
}
// after a list changed: show it in the list view, and save it
function listitemsdone(listid) {
    $("#lastlistid").val(listid);
    renderlist(cache_thing("list",$("#lastlistid").val()).list.Items[0],false);
    listedited(listid);
    renderlisteditarea(); // update card counts
}

function importlist(listid=null,name=null) {
    // this will initiate a file dialog to upload a file to a list
    var title = "Import a file from disk into: "+name;
    var importtemplate = $.templates("#template-import");
    modal(title,importtemplate.render({"listid": listid, "database": database, "snm": snmallowed()}));
}

function deletecard(cardid=null,printid=null) {
  if(cardid&&printid) {
    var carddata = cache_card_fetch(cardid);
    modalconfirm("Delete instance "+printid+" from: "+carddata.title[0],
                 "Are you sure you want to delete this instance:<br><br>"+
                 "Card: "+carddata.title[0]+"<br>"+
                 (carddata.printing[carddata.printingreverse.printingid[printid]].set ? "Set: "+carddata.printing[carddata.printingreverse.printingid[printid]].set : '')+"<br>"+
                 (carddata.printing[carddata.printingreverse.printingid[printid]].rarity ? "Rarity: "+carddata.printing[carddata.printingreverse.printingid[printid]].rarity : '')+"<br>"+
                 "<br><br>",
                 "deletecardtrigger('"+database+"',"+cardid+","+printid+");"
                );
  } else if(cardid) {
    var carddata = cache_card_fetch(cardid);
    modalconfirm("Delete: "+carddata.title[0],
                 "Are you sure you want to delete this card:<br><br>"+
                 "Card: "+carddata.title[0]+"<br>"+
                 "<br><br>",
                 "deletecardtrigger('"+database+"',"+cardid+",null);"
                );
  }
}

function deletecardtrigger(database=null,cardid=null,printid=null) {
  var url = apiuri+"/update";
  var requestdata = {
    "uid": getuid(),
    "database": database,
    "cardid": cardid,
    "data": {"remove":true}  // dummy data
  };
  if(cardid&&printid) {
    requestdata['printingid'] = printid;
    requestdata['operation'] = 'removeinstance';
  } else if(cardid) {
    requestdata['operation'] = 'remove';
  }
  var request = {
	  type: "POST",
	  url: url,
	  contentType: 'application/json',
	  dataType: 'json',
    data: JSON.stringify(requestdata),
	  beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
	  responseType: 'application/json',
	  success: function(status) {
      console.log(["update ret",status]);
      nomodal();
      if(requestdata.cardid) {
        cache_card_remove(requestdata.cardid);
        $('#modal-content').html('<div id="submitafter" class="error">REMOVED</div>');
        $('#resultcard').html('');
      } 
	  },
	  error: function(status) {
      $('#modal-content').append('<div id="submitafter" class="error">Error</div><br /> '+status.responseText);
	    console.log(status);
	  }
  };
  console.log(["posting",request]);
  $.ajax(request);
}

function editcard(cardid=null,printid=null) {
  if(cardid&&printid) {
    var carddata = cache_card_fetch(cardid);
    var title;
    var printing;
    if(printid == Number.MAX_SAFE_INTEGER) {
      title = "Add instance to: "+carddata.title[0];
      // new printing version
      var structure = cache_thing("structuretemplate",database);
      printing = structure.template.printing[0];
    } else {
      title = "Edit card information for: "+carddata.title[0]+' - instance '+printid;
      // edit just a printing version
      printing = carddata.printing[carddata.printingreverse.printingid[printid]];
      delete printing.printingid;
      var imageupload = imageuploaddefaults(cardid,printid,printing);
    }
    var editcardtemplate = $.templates("#template-editcard");
    modal(title,editcardtemplate.render({"cardid": cardid, "printid": printid, "carddata": htmlEncode(JSON.stringify(printing,null,2)), "database": database, "imageupload": imageupload}));
  } else if(cardid) {
    // This edits just the main card data, no instance info
    var carddata = cache_card_fetch(cardid);
    delete carddata.printing;
    delete carddata.printingreverse;
    delete carddata.printingprimary;
    delete carddata.cardid;
    delete carddata.updatelog;
    delete carddata['@timestamp'];
    delete carddata['@SequenceNumber'];
    var title = "Edit card information for: "+carddata.title[0];
    var editcardtemplate = $.templates("#template-editcard");
    modal(title,editcardtemplate.render({"cardid": cardid, "carddata": htmlEncode(JSON.stringify(carddata,null,2)), "database": database}));
  } else {
    var structure = cache_thing("structuretemplate",database);
    var title = "Insert new card";
    var editcardtemplate = $.templates("#template-editcard");
    modal(title,editcardtemplate.render({"cardid": "", "carddata": htmlEncode(JSON.stringify(structure.template,null,2)), "database": database}));
  }    
}

function editcardtrigger() {
  // https://github.com/Oracle-of-the-Void/ootv-client/blob/master/docs/API.md#update
  // authenticated:  /update
  // Header, uid
  // cardid, database, data
  // operation: update (hash of keys to update) - replace contents
  // printingid + operation: updateinstance (hash of keys to update for printing) - replace contents
  //    new / newinstance laterz
  //    remove / removeinstance laterz

  // Note, this one is just doing an edit on main card (so just update)

  var printid = $('#editcardprint').val();
  var cardid = $('#editcardid').val();
  var url = apiuri+"/update";
  var requestdata = {
    "uid": getuid(),
    "database": $('#editcarddb').val(),
    "cardid": cardid,
    "operation": "update",
    "printingid": printid,
    "data": {}
  };
  var newdata;
  var changedata = {};
  try {
    newdata = JSON.parse($('#editcard').val());
  } catch(e) {
    $('#editcardbuttonafter').replaceWith('<div id="editcardbuttonafter" class="error">Failed to parse</div>');
    return;
  }
  // TODO:  enforce requirements
  if (printid) {
    if(printid == Number.MAX_SAFE_INTEGER) {
      // new instance
      requestdata.operation = "newinstance";
      var structure = cache_thing("structuretemplate",database);
      for (let def in structure.operation.new.defaultprinting) { 
        if(!newdata[def]) {
            newdata[def] = structure.operation.new.defaultprinting[def];
        }
      }
      delete newdata.printingid;
      requestdata.data = newdata;
      console.log(["NEW",requestdata]);
       // TODO HERE
    } else {
      // update instance
      requestdata.operation = "updateinstance";
      carddata = cache_card_fetch(cardid);
      printing = carddata.printing[carddata.printingreverse.printingid[printid]];
      console.log(printing);
      delete printing.printingid;
      if(_.isEqual(newdata,printing)) {
        $('#editcardbuttonafter').replaceWith('<div id="editcardbuttonafter" class="error">No Change</div>');
        return;
      }
      console.log(["differences",jsondiff(newdata,printing)]);
      for (key in newdata) {
        if(!_.isEqual(newdata[key],printing[key])) {
          changedata[key] = newdata[key];
        }
      }
      for (key in printing) {
        if(!(key in newdata)) {
          changedata[key] = null;
        }
      }
      requestdata.data = changedata;
    }
  } else if(cardid) {
    // update card main
    // kill things managed in different ways
    carddata = cache_card_fetch(cardid);
    delete carddata.printing;
    delete carddata.printingreverse;
    delete carddata.printingprimary;
    delete carddata.cardid;
    delete carddata.updatelog;
    delete carddata['@timestamp'];
    delete carddata['@SequenceNumber'];
    // make sure nobody "adds" anything restricted.
    delete newdata.printing;
    delete newdata.printingreverse;
    delete newdata.printingprimary;
    delete newdata.cardid;
    delete newdata.updatelog;
    delete newdata['@timestamp'];
    delete newdata['@SequenceNumber'];
    if(_.isEqual(newdata,carddata)) {
      $('#editcardbuttonafter').replaceWith('<div id="editcardbuttonafter" class="error">No Change</div>');
      return;
    }
    console.log(["differences",jsondiff(newdata,carddata)]);
    for (key in newdata) {
      if(!_.isEqual(newdata[key],carddata[key])) {
        changedata[key] = newdata[key];
      }
    }
    for (key in carddata) {
      if(!(key in newdata)) {
        changedata[key] = null;
      }
    }
    requestdata.data = changedata;
  } else {
    // NEW
    requestdata.operation = "new";
    delete requestdata.cardid;
    delete requestdata.printingid;
    // TODO:  enforce "required" things
    var structure = cache_thing("structuretemplate",database);
    for (let rem of structure.operation.new.remove) {
      delete newdata[rem];
    }
    for (let def in structure.operation.new.default) {
      if(!newdata[def]) {
        newdata[def] = structure.operation.new.default[def];
      }
    }
    for (let i = 0; i< newdata.printing.length ; i++) {
      for (let def in structure.operation.new.defaultprinting) { 
        if(!newdata.printing[i][def]) {
          newdata.printing[i][def] = structure.operation.new.defaultprinting[def];
        }
      }
    }
    requestdata.data = [newdata];
    console.log(["NEW",requestdata]);
  }

  $('#editcardbuttonafter').replaceWith('<div id="editcardbuttonafter" class="error">Updating</div>');
  $('#editcardbutton').hide();
  console.log(["updating card data",requestdata]);
  var request = {
	  type: "POST",
	  url: url,
	  contentType: 'application/json',
	  dataType: 'json',
    data: JSON.stringify(requestdata),
	  beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
	  responseType: 'application/json',
	  success: function(status) {
      $('#editcardbuttonafter').replaceWith('<div id="editcardbuttonafter" class="error">Updated Successfully</div>');
      console.log(["update ret",status]);
      if(requestdata.cardid) {
        cardfetch(requestdata.cardid,status.olddata.printingid?status.olddata.printingid:null,$('#lastsearchquery').val(),nomodal);
      } else if(status.cardids) {
        cardfetch(status.cardids[0],null,$('#lastsearchquery').val(),nomodal);
      }
	  },
	  error: function(status) {
      $('#editcardbuttonafter').replaceWith('<div id="editcardbuttonafter" class="error">Error</div><br /> '+status.responseText);
	    console.log(status);
	  }
  };
  console.log(["posting",request]);
  $.ajax(request);

}

// Card image upload (#12). Images use the modern layout only: printing.imagehash is the
// directory and printing.image[] holds {master, details, select} file names, so the URL
// is imageuri + imagehash + "/" + file. A printing has one directory, so every image of
// a printing lives in it. Uploads add to image[]; they never drop existing images.
// Legacy printings (printimagehash, #227) are converted on the way: their files are
// copied from the old hash directories into the printing's directory.
function imageuploaddefaults(cardid,printid,printing) {
  var hasimages = !!(printing.image && printing.image.length);
  var hash = (typeof printing.imagehash === 'string') ? printing.imagehash : '';
  if(!hash && printing.set && printing.set[0]) {
    // initials of the set name: "Rise of Jigoku" -> "RoJ"
    hash = printing.set[0].replace(/&[a-z]+;|<[^>]*>/gi,' ').split(/\s+/).map(w => w.charAt(0)).join('');
  }
  hash = hash.replace(/[^A-Za-z0-9_-]/g,'');
  // base name: the first uploaded (not legacy-copied) image's, else <hash>_<number>, else <cardid>_<printid>
  var own = hasimages ? printing.image.find(e => e.master && !e.master.startsWith('printing_')) : null;
  var stem = own ? own.master.replace(/_master\.[a-z]+$/i,'')
           : (hash && printing.number && printing.number[0]) ? hash+'_'+String(printing.number[0]).padStart(3,'0')
           : cardid+'_'+printid;
  if(hasimages) {
    // another image of the same printing: number it past the ones already there
    stem += '_'+(printing.image.length+1);
  }
  return {"imagehash": hash, "stem": stem.replace(/[^A-Za-z0-9_.-]/g,''), "locked": hasimages,
          "legacy": (printing.printimagehash && printing.printimagehash.length) || 0};
}

// The legacy images of a printing, as files to copy: printimagehash[i] is a directory
// holding printing_<cardid>_<printingid>_{master,details,select}.jpg. The copies are named
// the same, with _<i+1> added after the first so directories don't collide.
function legacyimages(db,cardid,printid,printing) {
  if(!printing.printimagehash || !printing.printimagehash.length) { return []; }
  return printing.printimagehash.map(function(dir,i) {
    var from = 'printing_'+cardid+'_'+printid+'_';
    var to = 'printing_'+cardid+'_'+printid+'_'+(i ? (i+1)+'_' : '');
    var sizes = {};
    for (let size of ['master','details','select']) {
      sizes[size] = {"url": dbinfo[db].imageuri+dir+'/'+from+size+'.jpg', "name": to+size+'.jpg'};
    }
    return sizes;
  });
}

// pica (vendored, ~54KB) is only needed here, so load it on first use.
function loadpica(callback,fail) {
  if(typeof pica !== 'undefined') { callback(); return; }
  $.ajax({url: 'pica.min.js?v='+ootvversion, dataType: 'script', cache: true})
    .done(callback)
    .fail(fail || function() {
      $('#editimagestatus').html('<span class="error">Could not load pica.min.js</span>');
      $('#editimagebutton').prop('disabled',false);
    });
}

// Fit within w x h without enlarging, Lanczos3 + unsharp, like
// ootv-import/SCRIPTS/imagemogrify-generic.sh (convert -resize WxH -unsharp 0x.5).
function resizeimage(resizer,bitmap,w,h,mime) {
  var scale = Math.min(w/bitmap.width, h/bitmap.height, 1);
  var canvas = document.createElement('canvas');
  canvas.width = Math.max(1,Math.round(bitmap.width*scale));
  canvas.height = Math.max(1,Math.round(bitmap.height*scale));
  return resizer.resize(bitmap, canvas, {filter: 'lanczos3', unsharpAmount: 100, unsharpRadius: 0.5, unsharpThreshold: 0})
    .then(c => resizer.toBlob(c, mime, 0.92));
}

// Presigned PUT URLs from /upload for at most 10 files of one directory:
// {urls: [{name, url, headers}], backups: [{name, backup}]}. With overwrite, the server first copies
// each file that exists to a backup (<name>.bak-<time>.<ext>, listed in the image trash).
// Each call logs an 'upload' row (with cardid, when there is one) to the updatelog, except in a
// batch: log {logbatch: true} on the first call opens one row (the reply's logid), {logid} on the
// later ones adds to it, and uploadlogdone() writes the outcome.
function presignimages(db,hash,files,overwrite,cardid,printid,log) {
  return Promise.resolve($.ajax({
    type: "POST",
    url: apiuri+"/upload",
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify(Object.assign({"uid": getuid(), "database": db, "imagehash": hash, "overwrite": overwrite,
                          "cardid": cardid, "printingid": printid,
                          "files": files.map(f => ({"name": f.name, "contentType": f.blob.type}))}, log || {})),
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());}
  }));
}

// The outcome of a batch of uploads, as its log row's description: done {uploaded, failed, existing, replaced}
function uploadlogdone(db,hash,logid,done) {
  return Promise.resolve($.ajax({
    type: "POST",
    url: apiuri+"/upload",
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({"uid": getuid(), "database": db, "imagehash": hash, "logid": logid, "done": done}),
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());}
  }));
}

// Which of these file names already exist in the directory: [{name, size, lastmodified}]
function checkimages(db,hash,names) {
  var chunks = [];
  for (let i = 0; i < names.length; i += 3000) { chunks.push(names.slice(i,i+3000)); }
  return Promise.all(chunks.map(chunk => Promise.resolve($.ajax({
    type: "POST",
    url: apiuri+"/upload",
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({"uid": getuid(), "database": db, "imagehash": hash, "check": true, "files": chunk.map(n => ({"name": n}))}),
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());}
  })))).then(rets => [].concat(...rets.map(r => r.exists)));
}

// Presigned PUTs from /upload (at most 10 files per request), then the uploads.
// files: [{name, blob, legacy}]. A legacy copy that already exists (412) was copied
// by an earlier attempt and counts as done; any other existing file is an error.
function uploadimagefiles(db,hash,files,overwrite,cardid,printid) {
  var chunks = [];
  for (let i = 0; i < files.length; i += 10) { chunks.push(files.slice(i,i+10)); }
  return chunks.reduce(function(prev,chunk) {
    return prev.then(function() {
      return presignimages(db,hash,chunk,overwrite,cardid,printid).then(function(ret) {
        return Promise.all(ret.urls.map(function(u) {
          var f = chunk.find(f => f.name == u.name);
          return fetch(u.url, {method: 'PUT', headers: u.headers, body: f.blob}).then(function(r) {
            if(r.status == 412 && f.legacy) { return; }
            if(r.status == 412) { throw new Error(u.name+' already exists. Tick "Replace existing files" to overwrite it, or change the file name.'); }
            if(!r.ok) { throw new Error(u.name+': upload failed ('+r.status+')'); }
          });
        }));
      });
    });
  }, Promise.resolve());
}

function uploadimagetrigger() {
  var file = $('#editimagefile')[0].files[0];
  var hash = $('#editimagehash').val().trim();
  var stem = $('#editimagestem').val().trim();
  var overwrite = $('#editimageoverwrite').is(':checked');
  var db = $('#editcarddb').val();
  var cardid = $('#editcardid').val();
  var printid = $('#editcardprint').val();
  var status = function(msg,err) { $('#editimagestatus').html('<span'+(err?' class="error"':'')+'>'+msg+'</span>'); };
  var printing;
  try {
    printing = JSON.parse($('#editcard').val());
  } catch(e) {
    status('The instance JSON below does not parse. Fix it before uploading.',1); return;
  }
  var existing = (printing.image && printing.image.length) ? printing.image : [];
  if(existing.length && printing.imagehash && hash != printing.imagehash) {
    status('This instance keeps its images in "'+htmlEncode(printing.imagehash)+'"; new images have to go there too.',1); return;
  }
  var legacy = legacyimages(db,cardid,printid,printing);
  if(!file && !legacy.length) { status('Choose an image file first.',1); return; }
  if(file && file.type != 'image/png' && file.type != 'image/jpeg') { status('The image must be PNG or JPEG.',1); return; }
  if(!hash.match(/^[A-Za-z0-9_-]+$/)) { status('Directory: letters, digits, _ or - only.',1); return; }
  if(file && !stem.match(/^[A-Za-z0-9_.-]+$/)) { status('File name: letters, digits, _ . or - only.',1); return; }
  var names = null;
  if(file) {
    var ext = (file.type == 'image/png') ? 'png' : 'jpg';
    names = {"master": stem+'_master.'+ext, "details": stem+'_details.'+ext, "select": stem+'_select.'+ext};
    if(!overwrite && existing.some(e => e.master == names.master)) {
      status('This instance already has '+htmlEncode(names.master)+'. Change the file name, or tick "Replace existing files".',1); return;
    }
  }
  // Replacing: if any of the files is already there, say so and wait for a second press
  var confirmkey = (overwrite && names) ? db+'/'+hash+'/'+names.master : null;
  if(confirmkey && $('#editimagebutton').data('confirmed') !== confirmkey) {
    $('#editimagebutton').prop('disabled',true);
    status('Checking for existing files...');
    checkimages(db,hash,Object.values(names)).then(function(exists) {
      $('#editimagebutton').data('confirmed',confirmkey).prop('disabled',false);
      if(!exists.length) { uploadimagetrigger(); return; }
      status(exists.map(e => htmlEncode(e.name)).join(', ')+(exists.length > 1 ? ' are' : ' is')+' already there and will be replaced. '+
             'The old files are kept as backups (<i>name</i>.bak-<i>time</i>). Press Upload image again to replace them.',1);
    }).catch(function(e) {
      $('#editimagebutton').prop('disabled',false);
      status('Could not check for existing files: '+htmlEncode((e.responseJSON && e.responseJSON.error) || e.responseText || e.message || String(e)),1);
    });
    return;
  }
  $('#editimagebutton').removeData('confirmed');
  var files = [];
  var legacyentries = [];

  $('#editimagebutton').prop('disabled',true);
  status(legacy.length ? 'Copying the old images...' : 'Resizing...');
  // fetch the legacy files (skipping sizes that don't exist), then make the new sizes
  Promise.all(legacy.map(function(sizes) {
    var entry = {};
    return Promise.all(Object.keys(sizes).map(function(size) {
      // The card view already loaded these as plain <img>s, and CloudFront answers those with no
      // CORS header and no Vary: Origin, so the browser's cached copy fails a CORS fetch.
      // Bypass it, with the same query string the PDF code uses (x-corsworkaround).
      return fetch(sizes[size].url+'?x-corsworkaround=true', {mode: 'cors', cache: 'no-store'}).catch(function() {
        throw new Error('Could not read the old image '+sizes[size].url+' (the browser blocked or lost the request), so nothing was uploaded.');
      }).then(function(r) {
        if(!r.ok) { return; }
        return r.blob().then(function(b) {
          entry[size] = sizes[size].name;
          files.push({"name": sizes[size].name, "blob": new Blob([b], {type: 'image/jpeg'}), "legacy": true});
        });
      });
    })).then(function() { if(Object.keys(entry).length) { legacyentries.push(entry); } });
  }))
    .then(function() {
      if(!file) { return; }
      status('Resizing...');
      return new Promise(function(resolve,reject) { loadpica(resolve); })
        .then(function() { return createImageBitmap(file); })
        .then(function(bitmap) {
          var resizer = pica();
          files.push({"name": names.master, "blob": file});
          return resizeimage(resizer,bitmap,1000,600,file.type)
            .then(function(b) { files.push({"name": names.details, "blob": b}); return resizeimage(resizer,bitmap,1000,210,file.type); })
            .then(function(b) { files.push({"name": names.select, "blob": b}); });
        });
    })
    .then(function() {
      if(legacy.length && !legacyentries.length) { throw new Error('None of the old image files could be read, so nothing was changed.'); }
      status('Uploading...');
      return uploadimagefiles(db,hash,files,overwrite,cardid,printid);
    })
    .then(function() {
      // Old images first, then the existing ones, then the new one (or replace it in place).
      // The user reviews the JSON and presses Update to save.
      var image = legacyentries.concat(existing);
      if(names) {
        var at = image.findIndex(e => e.master == names.master);
        if(at >= 0) { image[at] = names; } else { image.push(names); }
      }
      printing.imagehash = hash;
      printing.image = image;
      delete printing.printimagehash;
      $('#editcard').val(JSON.stringify(printing,null,2));
      var base = dbinfo[db].imageuri+hash+'/';
      $('#editimagepreview').html(image.map(e => '<img src="'+base+e.select+'?t='+Date.now()+'" />').join(' '));
      $('#editimagehash').prop('readonly',true);
      $('#editimagestem').val(imageuploaddefaults(cardid,printid,printing).stem);
      $('#editimagefile').val('');
      status((legacyentries.length ? 'Copied '+legacyentries.length+' old image(s). ' : '')+(names ? 'Uploaded '+htmlEncode(names.master)+'. ' : '')+
             'The image list below now has '+image.length+' image(s): review it and press Update to save.');
    })
    .catch(function(e) {
      status('Error: '+htmlEncode(e.responseText || e.message || String(e)),1);
    })
    .finally(function() { $('#editimagebutton').prop('disabled',false); });
}

// Admin mass image upload: every chosen image goes to imageuri + <stub>/ as <name>_master.<ext>,
// with _details/_select made the same way as the card editor's upload. No card is changed: the
// set import (ootv-import set-import.py) or the card editor points printings at the files.
// Needs updateinstance (or *) on the game; /upload checks that again.
// Check files lists every irregularity (renamed files, files already there, corners, skipped
// files) and Upload then confirms them; replacing files needs its own tick as well.
var massimagerun = null;    // the upload in progress: {stop}
var massimageplan = null;   // the checked files waiting for Upload: {db, stub, imageuri, items, todo}
function loadmassimage() {
  $('#loginlog').empty();
  $('#discordadmin').empty();
  $('#admindoc').empty();
  $('#setimport, #importprofiles').hide();
  $('#updatelogpage').empty();
  $('#massimage').show();
  if(massimagerun) { return; }   // keep the form and results of the upload in progress
  massimageplan = null;
  if(!gamepermission('updateinstance')) {
    $('#massimage').text('Uploading images needs edit permission on '+dbinfo[database].name+'.');
    return;
  }
  $('#massimage').html($.templates("#template-massimage").render({"database": database, "name": dbinfo[database].name,
                                                                   "imageuri": dbinfo[database].imageuri}));
}

// What a chosen file uploads as: name.png -> name_master.png (a name already ending _master keeps it).
// Characters other than letters, digits, _ . - become _. _details/_select files are skipped,
// since they're made from the master.
function massimageitem(file) {
  var item = {"file": file};
  var m = /^(.*?)(_master|_details|_select)?\.(png|jpe?g)$/i.exec(file.name);
  if(file.type != 'image/png' && file.type != 'image/jpeg') { item.skip = 'not a PNG or JPEG'; }
  else if(!m) { item.skip = 'the extension doesn\'t match the file type'; }
  else if(m[2] && m[2].toLowerCase() != '_master') { item.skip = 'made from the master, so not uploaded'; }
  else {
    var stem = m[1].replace(/[^A-Za-z0-9_.-]/g,'_');
    if(stem != m[1]) { item.renamed = true; }
    var ext = (file.type == 'image/png') ? 'png' : 'jpg';
    item.names = {"master": stem+'_master.'+ext, "details": stem+'_details.'+ext, "select": stem+'_select.'+ext};
  }
  return item;
}

// Corners of a card image: transparent, or opaque and looking rounded (a card photographed or
// scanned on a background). At 400px wide, each corner pixel is compared with the card's edge
// 10% along from it: on a rounded card the corner matches neither edge.
function cornerinfo(bitmap) {
  var w = 400, h = Math.max(20, Math.round(bitmap.height*400/bitmap.width));
  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext('2d', {willReadFrequently: true});
  ctx.drawImage(bitmap,0,0,w,h);
  var px = (x,y) => ctx.getImageData(x,y,1,1).data;
  var dist = (a,b) => Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2]);
  var dx = Math.round(w*0.1), dy = Math.round(h*0.1);
  var transparent = 0, rounded = 0;
  [[0,0,1,1],[w-1,0,-1,1],[0,h-1,1,-1],[w-1,h-1,-1,-1]].forEach(function(c) {
    var corner = px(c[0],c[1]);
    if(corner[3] < 16) { transparent++; return; }
    if(dist(corner,px(c[0]+c[2]*dx,c[1])) > 60 && dist(corner,px(c[0],c[1]+c[3]*dy)) > 60) { rounded++; }
  });
  return {"transparent": transparent == 4, "rounded": transparent < 4 && rounded >= 3};
}

function massimagerow(item,imageuri) {
  var row = item.row || (item.row = $('<tr>'));
  var name = $('<td>');
  if(item.names && item.result == 'uploaded') {
    name.append($('<a target="_blank">').attr('href',imageuri+item.names.master).text(item.names.master));
  } else if(item.names) {
    name.text(item.names.master);
  }
  var notes = item.skip ? [item.skip] : [];
  if(!item.skip) {
    if(item.result) { notes.push(item.message || item.result); }
    if(item.renamed) { notes.push('renamed: characters other than letters, digits, _ . - became _'); }
    if(item.replace && !item.result) { notes.push('replaces '+item.replace.join(', ')+' (the old files are kept as backups)'); }
    if(item.corners) { notes.push(item.corners); }
  }
  row.attr('class','massimage-'+(item.skip ? 'skipped' : item.result || (item.replace || item.renamed || item.corners ? 'irregular' : 'waiting')))
    .empty().append($('<td>').text(item.file.webkitRelativePath || item.file.name), name, $('<td>').text(notes.join('; ')));
  return row;
}

// Admin -> Set import / Import profiles: setimport-etl.js and setimport.js load on demand, then
// setimportopen() or importprofilesopen() (in setimport.js) draws the panel
function loadsetimport(open) {
  $('#loginlog').empty();
  $('#discordadmin').empty();
  $('#admindoc').empty();
  $('#updatelogpage').empty();
  $('#massimage, #setimport, #importprofiles').hide();
  var load = f => window.setimportetl && f == 'setimport-etl.js' || window.setimportopen && f == 'setimport.js' ? $.Deferred().resolve() :
                  $.ajax({url: f+'?v='+ootvversion, dataType: 'script', cache: true});
  $.when(load('setimport-etl.js'), load('setimport.js'))
    .done(function() { window[open](); })
    .fail(function() { $('#setimport').show().html('<span class="error">Could not load the set import code.</span>'); });
}

// a changed stub, file choice or Replace tick needs a new check
function massimagereset() {
  if(massimagerun) { return; }
  massimageplan = null;
  $('#massimagereport').empty();
  $('#massimagetable').empty();
  $('#massimagestatus').empty();
}

function massimagestop() {
  if(massimagerun) { massimagerun.stop = true; }
  $('#massimagestatus').text('Stopping after the images being uploaded now...');
}

function massimagecontrols(disabled) {
  $('#massimagecheck, #massimagestub, #massimagedir, #massimagefiles, #massimageoverwrite').prop('disabled',disabled);
}

function massimagecheck() {
  var db = $('#massimagedb').val();
  var stub = $('#massimagestub').val().trim();
  var replace = $('#massimageoverwrite').is(':checked');
  var imageuri = dbinfo[db].imageuri+stub+'/';
  var status = function(msg,err) { $('#massimagestatus').html('<span'+(err?' class="error"':'')+'>'+msg+'</span>'); };
  massimagereset();
  if(!stub.match(/^[A-Za-z0-9_-]+$/)) { status('Stub: letters, digits, _ or - only.',1); return; }
  var chosen = Array.from($('#massimagedir')[0].files).concat(Array.from($('#massimagefiles')[0].files))
    .filter(f => !f.name.startsWith('.'));
  if(!chosen.length) { status('Choose a folder or some image files first.',1); return; }

  var items = chosen.map(massimageitem);
  var seen = {};
  items.forEach(function(item) {
    if(!item.names) { return; }
    var first = seen[item.names.master];
    if(first) { item.skip = 'uploads as the same name as '+(first.webkitRelativePath || first.name); delete item.names; }
    else { seen[item.names.master] = item.file; }
  });
  var todo = items.filter(item => !item.skip);
  massimagecontrols(true);
  var checked = 0;
  status('Checking '+todo.length+' images...');
  // corners, a few images at a time
  var queue = todo.slice();
  var worker = function() {
    var item = queue.shift();
    if(!item) { return Promise.resolve(); }
    return createImageBitmap(item.file).then(function(bitmap) {
      var c = cornerinfo(bitmap);
      bitmap.close();
      if(c.rounded && item.file.type == 'image/jpeg') {
        item.corners = 'JPEG with rounded corners: PNG with the corners transparent is preferred';
      } else if(c.rounded) {
        item.corners = 'rounded corners that aren\'t transparent: make the area outside the corners transparent';
      }
    }, function() {
      item.skip = 'could not read the image';
    }).then(function() {
      if(++checked % 20 == 0) { status('Checking '+todo.length+' images... '+checked+' done'); }
      return worker();
    });
  };
  Promise.all([worker(), worker(), worker(), worker()])
    .then(function() {
      todo = todo.filter(item => !item.skip);
      if(!todo.length) { return []; }
      return checkimages(db,stub,[].concat(...todo.map(item => Object.values(item.names))));
    })
    .then(function(exists) {
      var there = {};
      exists.forEach(e => { there[e.name] = e; });
      todo.forEach(function(item) {
        var found = Object.values(item.names).filter(n => there[n]);
        if(!found.length) { return; }
        if(replace) { item.replace = found; }
        else { item.skip = 'already there ('+found.join(', ')+'); tick "Replace existing files" to replace'; }
      });
      todo = todo.filter(item => !item.skip);
      massimageplan = {"db": db, "stub": stub, "imageuri": imageuri, "items": items, "todo": todo};
      massimagereport(massimageplan);
      status('');
    })
    .catch(function(e) {
      status('Error: '+htmlEncode((e.responseJSON && e.responseJSON.error) || e.responseText || e.message || String(e)),1);
    })
    .finally(function() { massimagecontrols(false); });
}

// the irregularities, the file list, and the buttons that confirm them
function massimagereport(plan) {
  var count = f => plan.items.filter(f).length;
  var li = (n,text) => n ? '<li>'+n+' '+text+'</li>' : '';
  var renamed = count(i => !i.skip && i.renamed), corners = count(i => !i.skip && i.corners);
  var replacing = plan.todo.filter(i => i.replace), skipped = count(i => i.skip);
  var html = '<p><b>'+plan.todo.length+' of '+plan.items.length+' files to upload</b> to '+htmlEncode(plan.imageuri)+'</p>';
  var irregular = li(renamed, 'renamed: characters other than letters, digits, _ . - become _')+
    li(replacing.length, 'replace images already there ('+replacing.reduce((n,i) => n+i.replace.length,0)+' files). '+
       'Each old file is kept as <i>name</i>.bak-<i>time</i> and listed in the image trash.')+
    li(corners, 'have rounded corners that aren\'t transparent. PNG with the area outside the corners transparent is '+
       'preferred for cards with rounded corners (JPEG can\'t be transparent).')+
    li(skipped, 'skipped (see the list)');
  html += irregular ? '<p>Irregularities:</p><ul>'+irregular+'</ul>' : '<p>No irregularities.</p>';
  if(replacing.length) {
    html += '<p><label><input type="checkbox" id="massimagereplaceok" onchange="$(\'#massimagebutton\').prop(\'disabled\',!this.checked)" /> '+
            'Yes, replace the '+replacing.length+' images already there</label></p>';
  }
  if(plan.todo.length) {
    html += '<input type="button" id="massimagebutton" value="Upload '+plan.todo.length+' images'+(irregular ? ' as listed' : '')+'" onclick="massimageupload();"'+
            (replacing.length ? ' disabled' : '')+' /> ';
  }
  html += '<input type="button" value="Cancel" onclick="massimagereset();" />';
  $('#massimagereport').html(html);
  var table = $('#massimagetable').empty().append('<tr><th>File</th><th>Uploads as</th><th>Notes</th></tr>');
  plan.items.forEach(item => table.append(massimagerow(item,plan.imageuri)));
}

function massimageupload() {
  var plan = massimageplan;
  if(!plan || massimagerun) { return; }
  if(plan.todo.some(i => i.replace) && !$('#massimagereplaceok').is(':checked')) { return; }
  var status = function(msg,err) { $('#massimagestatus').html('<span'+(err?' class="error"':'')+'>'+msg+'</span>'); };
  var run = massimagerun = {"stop": false};
  massimagecontrols(true);
  $('#massimagereport').empty();
  $('#massimagestop').show();
  var todo = plan.todo, done = 0;
  // 3 images (9 files) per /upload call, its limit being 10 files
  var groups = [];
  for (let i = 0; i < todo.length; i += 3) { groups.push(todo.slice(i,i+3)); }
  var dogroup = function(group) {
    var files = [];
    return Promise.all(group.map(function(item) {
      return createImageBitmap(item.file).then(function(bitmap) {
        var resizer = pica();
        var mine = [{"name": item.names.master, "blob": item.file, "item": item, "size": 'master'}];
        return resizeimage(resizer,bitmap,1000,600,item.file.type)
          .then(function(b) { mine.push({"name": item.names.details, "blob": b, "item": item, "size": 'details'}); return resizeimage(resizer,bitmap,1000,210,item.file.type); })
          .then(function(b) { mine.push({"name": item.names.select, "blob": b, "item": item, "size": 'select'}); files = files.concat(mine); })
          .finally(function() { bitmap.close(); });
      }).catch(function(e) {
        item.result = 'failed';
        item.message = 'could not read or resize the image: '+(e.message || e);
      });
    })).then(function() {
      if(!files.length) { return; }
      // replace only in the calls that were confirmed to; elsewhere S3 refuses to overwrite (412)
      // one updatelog row for the whole run: the first call opens it, the rest add to it
      var log = run.logid ? {"logid": run.logid} : {"logbatch": true};
      return presignimages(plan.db,plan.stub,files,group.some(i => i.replace),null,null,log).then(function(ret) {
        if(ret.logid) { run.logid = ret.logid; }
        (ret.backups || []).forEach(function(b) {
          var f = files.find(f => f.name == b.name);
          if(f) { f.backup = b.backup; }
        });
        return Promise.all(ret.urls.map(function(u) {
          var f = files.find(f => f.name == u.name);
          return fetch(u.url, {method: 'PUT', headers: u.headers, body: f.blob})
            .then(r => { f.outcome = r.ok ? 'uploaded' : (r.status == 412) ? 'already there' : 'failed ('+r.status+')'; })
            .catch(e => { f.outcome = 'failed ('+(e.message || e)+')'; });
        }));
      });
    }).then(function() {
      group.forEach(function(item) {
        var mine = files.filter(f => f.item === item);
        if(mine.length) {
          var outcomes = mine.map(f => f.outcome);
          var backups = mine.filter(f => f.backup).map(f => f.backup);
          if(outcomes.every(o => o == 'uploaded')) {
            item.result = 'uploaded';
            item.message = backups.length ? 'replaced; old files kept as '+backups.join(', ') : 'uploaded';
          } else if(outcomes.every(o => o == 'already there')) {
            item.result = 'exists';
            item.message = 'already there (added since the check), not replaced';
          } else {
            item.result = 'failed';
            item.message = mine.map(f => f.size+': '+f.outcome).join(', ')+(backups.length ? '; backups made: '+backups.join(', ') : '');
          }
        }
        done++;
        massimagerow(item,plan.imageuri);
      });
      status('Uploaded '+done+' of '+todo.length+'...');
    });
  };

  status('Uploading...');
  new Promise(function(resolve,reject) { loadpica(resolve, function() { reject(new Error('Could not load pica.min.js')); }); })
    .then(function() {
      return groups.reduce(function(prev,group) {
        return prev.then(function() { if(!run.stop) { return dogroup(group); } });
      }, Promise.resolve());
    })
    .then(function() {
      var count = r => todo.filter(item => item.result == r).length;
      var replaced = todo.filter(item => item.result == 'uploaded' && item.replace).length;
      if(run.logid) {
        uploadlogdone(plan.db,plan.stub,run.logid,{"uploaded": count('uploaded'), "failed": count('failed'),
                                                    "existing": count('exists'), "replaced": replaced})
          .catch(e => console.log(['uploadlogdone failed',e]));
      }
      var skipped = plan.items.length - todo.length;
      var left = todo.filter(item => !item.result).length;
      status((run.stop ? 'Stopped. ' : 'Done. ')+count('uploaded')+' uploaded to '+htmlEncode(plan.imageuri)+
             (replaced ? ' ('+replaced+' replaced, old files kept as backups)' : '')+
             (count('exists') ? ', '+count('exists')+' already there' : '')+
             (count('failed') ? ', '+count('failed')+' failed' : '')+
             (skipped ? ', '+skipped+' skipped' : '')+
             (left ? ', '+left+' not started' : '')+'.', count('failed') > 0);
    })
    .catch(function(e) {
      // /upload refused (permission, bad input, a backup copy failed) or pica didn't load
      if(run.logid) {
        var count = r => todo.filter(item => item.result == r).length;
        uploadlogdone(plan.db,plan.stub,run.logid,{"uploaded": count('uploaded'), "failed": count('failed'),
                                                    "existing": count('exists'),
                                                    "replaced": todo.filter(item => item.result == 'uploaded' && item.replace).length})
          .catch(e => console.log(['uploadlogdone failed',e]));
      }
      status('Error: '+htmlEncode((e.responseJSON && e.responseJSON.error) || e.responseText || e.message || String(e))+
             '. '+done+' of '+todo.length+' images were done.',1);
    })
    .finally(function() {
      massimagerun = null;
      massimageplan = null;
      massimagecontrols(false);
      $('#massimagestop').hide();
    });
}

function setprimary(cardid,printid) {
  if(cardid&&printid) {
    var url = apiuri+"/update";
    var requestdata = {
      "uid": getuid(),
      "database": database,
      "cardid": cardid,
      "operation": "update",
      "data": {"printingprimary":printid}
    };
    console.log(["updating card data",requestdata]);
    var request = {
	    type: "POST",
	    url: url,
	    contentType: 'application/json',
	    dataType: 'json',
      data: JSON.stringify(requestdata),
	    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
	    responseType: 'application/json',
	    success: function(status) {
        console.log(["update ret",status]);
        cardfetch(requestdata.cardid,printid,$('#lastsearchquery').val(),nomodal);
	    },
	    error: function(status) {
        alert('Error: '+status.responseText);
	      console.log(status);
	    }
    };
    console.log(["posting",request]);
    $.ajax(request);
  }
}

function importlisttrigger() {
    $("#importprogress").show();
    $("#importform").hide();
    $("#importstatus").html("");
    $.ajax({
	    // Your server script to process the upload
	    url: apiuri+'/import',
	    type: 'POST',
      
	    // Form data
	    data: new FormData($('#importform')[0]),
      
	    // Tell jQuery not to process data or worry about content-type
	    // You *must* include these options!
	    cache: false,
	    contentType: false,
	    processData: false,
      
	    // Custom XMLHttpRequest
	    xhr: function () {
	      var myXhr = $.ajaxSettings.xhr();
	      if (myXhr.upload) {
		      // For handling the progress of the upload
		      myXhr.upload.addEventListener('importprogress', function (e) {
		        if (e.lengthComputable) {
			        $('#importprogress').attr({
			          value: e.loaded,
			          max: e.total,
			        });
		        }
		      }, false);
	      }
	      return myXhr;
	    },
      
	    success: function(data) {
	      console.log("success");
	      console.log(data);
	      $("#importprogress").hide();
	      var importsuccess = $.templates("#template-importsuccess");
	      $("#importfailedval").val(data.failed.join("\n"));
	      $("#importdataval").val(JSON.stringify(data.list));
	      $("#importstatus").html(importsuccess.render({"numresults":data.list.length,"numfailed":data.failed.length,"failed":data.failed.join("\n")}));
	    },

	    error: function(data) {
	      console.log("error");
	      console.log(data);
	      $("#importprogress").hide();
	      $("#importstatus").html('<div class="error">Error</div><br /><br />'+(data.message ? data.message : (data.statusText ? data.statusText : print_r(data,1))));
	    }
    });
}

function importlistfinalize() {
    listinfoupdate($("#importlistid").val(),'list',$("#importdataval").val());
    nomodal();
}

//   *********************************   fetching / querying the api ******************8
// TODO: sometimes this fails if I do a card not primed from c/p
//   e.g: https://dev.oracleofthevoid.com/#cardid=999
function cardfetch(cardid,prid=null,qs=null,handler=null) {
  $.ajax({
    type: 'GET',
    url: apiuri+"/oracle-fetch?table="+database+"&cardid="+cardid,
    contentType: 'application/json',
    dataType: 'json',
    responseType: 'application/json',
    success: function(data) {
	    data = imagehashtourl(data);
	    cache_card(data);
	    docard(data,prid,qs);
      if(handler) { handler(); }
    },
    error: function(error) { console.log("Epic Fail: "+JSON.stringify(error)); }
  });
}

function listprefetch(listids,callback=null) {
    console.log(['listprefetch',listids,callback]);
  $.ajax({
    type: 'GET',
      url: apiuri+"/oracle-fetch?table="+database+"&cardid="+listids.join(),
    contentType: 'application/json',
    dataType: 'json',
    responseType: 'application/json',
      success: function(data) {
	  console.log(data);
	  // cards deleted from the site are left out of the reply (#188); refreshlist flags them
	  [].concat(data).forEach(function(c) {
	      if(c && c.cardid) { cache_card(imagehashtourl(c)); }
	  });
	  if(callback) {
	      callback[0](callback[1],callback[2],callback[3],callback[4],callback[5]);
	  }
    },
    error: function(error) {
	console.log("Epic Fail: "+JSON.stringify(error));
	// 404 "Card not found": every card fetched was deleted, still show the rest of the list
	if(error.status == 404 && callback) {
	    callback[0](callback[1],callback[2],callback[3],callback[4],callback[5]);
	}
    }
  });
}

function imagehashtourl(card) {
    //dbinfo[database].imageuri +
    if(card.imagehash) {
	    // TODO:  card.icon is effectively defunct now, right?
        card.icon = dbinfo[database].imageuri + card.imagehash+'/card_'+card.cardid+'__icon.jpg';
        card.imageurl = dbinfo[database].imageuri + card.imagehash+'/printing_'+card.cardid+'_'+card.printingprimary+'_';   // then you can add details, select, etc
    }
        for(var p = 0; p < card.printing.length; p++) {
          if(!card.printing[p].images) {
	          card.printing[p].images = [];
            stub = 'printing_';
	          if(card.printing[p].printimagehash) {
	              for(var h = 0; h < card.printing[p].printimagehash.length; h++) {
		                card.printing[p].images[h] = dbinfo[database].imageuri + card.printing[p].printimagehash[h] + '/'+stub+card.cardid+'_'+
                      card.printing[p].printingid+'_'; // then you add details, etc
	              }
	          } else {
              // NOT a problem if using new style
              if(!card.printing[p].image) {
	              console.log("Card missing a printimagehash: "+JSON.stringify(card));
              }
	          }
          }
        }
        //printing: {{if ~datarequest.field_printing_edition}}{{imagehashfromset ~datarequest.field_printing_edition printing /}}/printing_{{:cardid}}_{{printingidfromset ~datarequest.field_printing_edition printing /}}_select.jpg{{else}}{{:imagehash}}/card_{{:cardid}}__icon.jpg{{/if}}
    
    card.printingreverse = {printingid: {}};
    for(var p = 0; p < card.printing.length; p++) {
        card.printingreverse.printingid[card.printing[p].printingid] = p;
    }
    //DONE for onyx: the searchables in l5r.js are the place to specify reverse.. but i want a hidden printing.legality
    // KEEP IN SYNC: a new reverse field (one more search that picks the version shown) also goes in searchaddallversioned
    for(seakey in searchables[database]) {
        sea = searchables[database][seakey];
        if((typeof sea === 'object') && ('reverse' in sea)) {
            card.printingreverse[seakey.replace("printing.","")] = {};
            for(var p = 0; p < card.printing.length; p++) {
                if(seakey.replace("printing.","") in card.printing[p]) {
                    // index every value (a printing can be legal in several arcs), not just the first
                    [].concat(card.printing[p][seakey.replace("printing.","")]).forEach(function(v) {
                        card.printingreverse[seakey.replace("printing.","")][v] = p;
                    });
                }
            }
            if(jQuery.isEmptyObject(card.printingreverse[seakey.replace("printing.","")])) {
                delete card.printingreverse[seakey.replace("printing.","")];
            }
        }
    }
    return card;
}

function redrawcardforselect() {
    // on a cold cache the card can render before a select it sorts by arrives (sortlegality,
    // sortprintings); redraw it once the select is cached, if the card view is showing
    if($("#resultcard").is(":visible") && $("#lastcardid").val() && cache_card_is($("#lastcardid").val())) {
	docardid( $("#lastcardid").val(), lastcardprid(),$("#lastsearchquery").val()?$("#lastsearchquery").val():null);
    }
}

function updateselect(select) {
    // creates an array consisting of the sorted elements of that field
  $.ajax({
	  type: 'POST',
	  url: apiuri+"/attributes",
	  data: {
	    table: database,
	    lookup: select,
      optgroup: 1
	  },
	  contentType: 'application/json',
	  dataType: 'json',
	  responseType: 'application/json',
	  success: function(raw) {
	    console.log(["select lookup results: ",select,raw]);
	    cache_select(select,raw);
	    if(select == "legality") {
		    redrawcardforselect();
	    }
	    if(updatecallback[database] !== undefined) {
		    updatecallback[database]();
	    } else {
		    updatecallbackgeneral(database);
	    }
	  },
	  error: function(error) {
    	console.log("Epic Fail: select lookup: "+select);
	  }
  });
}

function updateselectmulti(one,two) {
    // creates a hash of "one" like updateselect, but values are arrays of associated "two" values  (set, rarities in that set)
  $.ajax({
	  type: 'POST',
	  url: apiuri+"/attributes",
	  data: {
	    table: database,
	    lookup: one+":"+two,
      optgroup: 1
	  },
	  contentType: 'application/json',
	  dataType: 'json',
	  responseType: 'application/json',
	  success: function(raw) {
	    console.log("multi select lookup: "+one+":"+two+" ::"+raw);
	    cache_select(one,raw);
	    if(one == "printing.set") {
		    redrawcardforselect();
	    }
	    if(updatecallback[database] !== undefined) {
		    updatecallback[database]();
	    } else {
		    updatecallbackgeneral(database);
	    }
	  },
	  error: function(error) {
    	console.log("Epic Fail: multi select lookup: "+one+":"+two);
	  }
  });
}

function renderlist(list,switchview=true,listoutput=null) {
    // TODO:  batchget has limits, so fetch least number.  also it's not in order, so meh
    console.log(["renderlist",list,switchview,listoutput]);
    if(listoutput && listoutput.startsWith('textsnm') && snmsets[database] === undefined) {
	snmsetload(function() { renderlist(list,switchview,listoutput); });
	return;
    }
    var needfetched = [];
    var listids = [];
    var listdata = [];
    list.list.forEach(function(card) {
	listids.push(card.cardid);
	if(card.cardid>0 && !cache_card_is(card.cardid)) {
	    needfetched.push(card.cardid);
	} else {
	    listdata.push(cache_card_fetch(card.cardid));
	}
    });
    if(needfetched.length > 0) {
	listprefetch(needfetched,[switchview?dolist:refreshlist,[],list.list,list.sort,list.listid,listoutput]);
    } else {
	if(switchview) {
	    dolist([],list.list,list.sort,list.listid,listoutput);
	} else {
	    refreshlist([],list.list,list.sort,list.listid,listoutput);
	}
    }
    // foreach on list
    // add card to array
    // $("#resultsearch").html(rendercards...)
}

// do a search and display a list.   Pop onto history.
// if the search is cached, display the cache
// TODO: this should be more than one function
// forcedata forces datarequest - if the actual post is seperated out might simplify this a little
//   also doesn't need forms to be loaded
//   TODO: why did i blow past waiting on templates... is that right?   i think i messed this up
// from is for continuing and getting more entries from a query
function dosearch(from=0,forcedata=false,skipload=false) {
  mobilesearchtoggle(false); // narrow screens: close the search panel to show the results
  if((getactivetemplate('search') === undefined) && !forcedata && !skipload) {
	  console.log("templates not loaded yet");
	  return;
  }
  console.log(from);
  var datarequest = {};
  if(forcedata!==false) {
	  datarequest = forcedata;
    console.log(['dosearch.forcedata',datarequest]);
  } else {
    var formdata = $('#searchform').serializeArray();
    console.log(['dosearch.preload',formdata]);
    $.each(formdata, function (i, field) {
      if(field.value !== "" && field.value !== null && field.name != 'selectsloaded') {
	      if(datarequest[field.name]) {
	        if(!Array.isArray(datarequest[field.name])) {
		        datarequest[field.name] = [ datarequest[field.name] ];
	        }
	        datarequest[field.name].push(field.value);
	      } else {
	        datarequest[field.name] = field.value || "";
	      }
      } 
    });
    $.each(formdata, function (i, field) {
      if(field.name.startsWith("type_")) {
        switch(field.value) {
        case 'select':
        case 'text':
        case 'exists':
        case 'keyword':
          if(Object.keys(datarequest).indexOf(field.name.replace("type_","field_"))<0) {
            delete datarequest[field.name];
          }
          break;
        case 'numeric':
          if(Object.keys(datarequest).indexOf(field.name.replace("type_","field_lower_"))<0 &&
             Object.keys(datarequest).indexOf(field.name.replace("type_","field_upper_"))<0) {
            delete datarequest[field.name];
          }
          break;
        }
      }
    });
    datarequest['table'] = database;
    datarequest['sort'] = templates[database]['sort']['search'];
    if(templates[database]['sortdir']['search'] == 'desc') {
	    datarequest['sort'] = datarequest['sort'].replace(/"asc"/,'"desc"');
    }
    datarequest['sortmode'] = templates[database]['sortmode']['search'];
  }
  $.each(datarequest, function(key,value) {
    if(match=key.match(/^field_(.*)/)) {
      var f = match[1];
      if(searchables[database].hasOwnProperty(f) && searchables[database][f].hasOwnProperty('combined')) {
        datarequest["combined_"+f] = searchables[database][f]['combined'];
      }
    }
  });

  console.log(['dosearch.datarequest',datarequest]);
  var qs = $.param(datarequest);
  // keep the request so paging reuses it instead of rebuilding from the form (#224)
  searchcache[database]['queryrequest'][qs] = $.extend(true, {}, datarequest);

  if(from == 0 && !forcedata) {
	  seturl({'view': 'search', 'qs': qs});
  }

  // Note: if from > 0, we are triggering from paging, not from searching
  datarequest['size'] = 50;
  datarequest['from'] = from;
  $('#lastsearchquery').val(qs);

  // Cache lookup
  if(searchcache[database]['querydata'][qs] !== undefined && searchcache[database]['querydata'][qs].length > from) {
	  console.log("pulling "+qs+" from local cache");
	  showsearch();
	  var data = [];
	  searchcache[database]['querydata'][qs].forEach(function(cid) {
	    data.push(cache_card_fetch(cid));
	  });
	  $("#resultsearch").html(rendercards(data,datarequest,qs));
	  dosearchpostcallback(qs);
	  if(from == 0) {
	    defaultcard(qs);
	  }
	  updates[database]('#resultsearch');
  } else {
	  if(from<1){
	    $('.searchtextversion, .searchaddall').html('');
	    $("#resultsearch").html(searcherror['loading']);
	    showsearch();
	  }

	  console.log('not cached locally: '+qs+' :: '+from);

	  // coming into here, we need these things set:
	  // datarequest: search query stuff
	  // qs: stringy search query for caching info
	  // database: global database
	  // searchcache: global searchcache structure
	  $.ajax({
	    type: 'POST',
	    url: apiuri+"/search",
	    contentType: 'application/json',
	    dataType: 'json',
	    responseType: 'application/json',
	    data: datarequest,
	    success: function(raw) {
		    console.log(raw);
		    dataret = raw.hits.hits.map(x=>x._source);
        //		    console.log(dataret);
		    // a number from the API; OpenSearch's own shape is {value, relation}
		    searchcache[database]['querytotal'][qs] = typeof raw.hits.total === 'object' ? raw.hits.total.value : raw.hits.total;
		    if(dataret.length>0) {
		      dataret = dataret.map(imagehashtourl);
		      var html = rendercards(dataret,datarequest,qs);
		      if(from > 0) {
			      $(".moreloading").remove();
			      $("#resultsearch").append(html);
		      } else {
			      $("#resultsearch").html(html);
			      searchcache[database]['querydata'][qs] = [];
		      }
		      updates[database]('#resultsearch');
		      dataret.forEach(function(dataitem) {
			      searchcache[database]['querydata'][qs].push(dataitem.cardid);
			      cache_card(dataitem);
		      });
		      dosearchpostcallback(qs);
		      if(from == 0) {
			      defaultcard(qs);
		      }
		    } else {
      		$('.searchtextversion, .searchaddall').html('');
      		$("#resultsearch").html(searcherror['empty']);
		    }
	    },
	    error: function(error) {
    		console.log("Epic Fail: "+JSON.stringify(error));
		    console.log(error);
		    if(from > 0) {
			    // a failed next page keeps the results already shown
			    $(".moreloading").remove();
			    $("#resultsearch").append(searcherror['moreerror']);
		    } else {
			    $("#resultsearch").html(searcherror['error']);
		    }
		    // This works to force a query failure:  * 234Sdfjkl:sjdfkl23dsf $^@$%
		    // TODO: trap to handle compile-ish failure on lambda
	    }
	  });
  }

  return false;
}


// *****************************88 RENDERING DATA ********************
function docardid(id,prid=null,qs=null,pop=false,switchview=true) {
    docard(cache_card_fetch(id),prid,qs,pop,switchview);
}
function refreshlist(listdata=[],listlist=[],sort,listid=null,listoutput=null) {
    console.log(["rendering list: "+sort,listid,listoutput]);
    if(getactivetemplate('list') === undefined) {
	console.log("templates not loaded yet");
	return;
    }
    //console.log(listlist);
    var missing = [];
    if(listlist.length>0) {
	listdata = [];
	listlist.forEach(function(c){
	    //console.log(c);
	    if(c.cardid>0 && !cache_card_is(c.cardid)) {
		missing.push(c); // deleted from the site (#188)
	    } else if(c.cardid>0) {
		var card = cache_card_fetch(c.cardid);
		card.listprinting = c.printing;
		card.listquantity = c.quantity;
		listdata.push(card);
	    } else {
		listdata.push(c);
	    }
	});
    }
    //console.log(listdata);
    console.log("sorting with: "+sort);
    // games without list sorts/headers (pathfinder-pawns) fall back to title order, no headers
    var gamesort = databasesort[database] || {};
    var gameheaderize = headerize[database] || {};
    listdata.sort(gamesort[sort] != undefined?gamesort[sort]:
		  function(a,b){
		      var x = a.title[0].toLowerCase();
		      var y = b.title[0].toLowerCase();
		      if (x < y) {return -1;}
		      if (x > y) {return 1;}
		      return 0;
		  });
    console.log(listdata);
    var listswitch = listoutput ? listoutput.split(",")[0] : listoutput;
    switch(listswitch) {
    case 'pdf':
	createpdf(listdata,listoutput);
	break;
    default:
	var listtmpl = {
		"labels": labels[database],
		datarequest:{'listid':listid,'sort':sort},
		"database":database,
		"listmine": listmine(listid)   // the card rows' count controls, only on your own lists
	};
	// the template's vars (visual-premium: imageclass details), and the Deck format's large size
	var override = getactivetemplateoverride('list');
	for ( v in override.var?override.var:{}) {
	    listtmpl[v] = override.var[v];
	}
	if(templates[database]['active']['list'] == 'visual-deck' && largeview['list']) {
	    listtmpl['imageclass'] = 'details';
	}
	// the views show each card's listed printing (bubbleup); the text exports below keep the card's own fields
	var shown = bubbleup(listdata,{'listid':listid});
	pagetextversion('.listtextversion', shown, 'list');
	var table = templates[database]['active']['list'] == 'table';
	if(table) {
	    $.extend(listtmpl, listtablecolumns(shown));
	}
	if(templates[database]['available'][templates[database]['active']['list']].headerizable && (sort=='deck')) {
	    var html = getactivetemplate('list').render(markprinteddiffs(gameheaderize[sort] != undefined ? gameheaderize[sort](shown) : shown),listtmpl);
	} else {
	    var html = getactivetemplate('list').render(markprinteddiffs(shown),listtmpl);
	}
	if(table) {
	    html = listtablewrap(html, listtmpl);
	}
	if(listoutput && listoutput.startsWith('text')) { 
	    var textparts = listoutput.split(",");
	    var text = templates[database]['compiled'][textparts[0]].render((gameheaderize['deck'] != undefined && sort == 'deck' && textparts.indexOf('noheaders')<0) ? gameheaderize['deck'](listdata) : listdata,{
		"labels": labels[database],
		datarequest:{'listid':listid,'sort':sort},
		"database":database,
    "listmeta": cache_thing("list",listid).list.Items[0]
	    });
	    var data = new Blob([text.replace(/\n/g, "\r\n")],{type: 'text/plain'});
	    var url = window.URL.createObjectURL(data);
	    const a = document.createElement('a');
	    a.style.display = 'none';
	    a.href = url;
	    a.download = (textparts.find(checkfilename)?textparts.find(checkfilename).replace("filename:",''):"decklist")+".txt";
	    document.body.appendChild(a);
	    a.click();
	} else {
	    $("#resultlist").html(listheader(listid)+liststats(listdata)+listmissing(listid,missing)+html);
	    liststatscutoff();
	    listtablestripe();
	    // symbols (:g2:, :gstar:, ...) as the search and card views have them; before the handlers below,
	    // since it rewrites the .listbody html
	    updates[database]('#resultlist');
	    $('span[contenteditable=true][id^="clist_quantity"]').blur(function(){
		var field_listid = $(this).attr("id").split(/:/) ;
		var value = $(this).text() ;
		if(field_listid[4] != value) {
		    console.log(field_listid);
		    addlistitem(field_listid[1],field_listid[2],field_listid[3],value,true,sort);
		}
	    });
	}
    }
}

// header for the list view: the list's details as the directory shows them, and its controls when it's the
// user's own. The list's own item wins over the directory's: an edit refetches the list before the directory.
function listheader(listid) {
    var meta = null;
    var dir = cache_thing("list","data");
    var rev = cache_thing("list","datareverse");
    var mine = listmine(listid);
    if(dir && rev && rev[listid] !== undefined) {
	meta = $.extend({}, dir.lists.Items[rev[listid]]);
    }
    if(cache_thing("list",listid)) {
	meta = $.extend(meta || {}, cache_thing("list",listid).list.Items[0]);
    }
    if(!meta) {
	return '';
    }
    return $.templates("#template-listheader").render(meta,{"listtypes": listtypes, "mine": mine,
	"active": activelists.indexOf(listid) > -1, "pdfallowed": pdfallowed(), "snm": snmallowed(),
	"loggedin": listloggedin(), "database": database});
}
// the link that opens a list for anyone (logged out: /publiclist), as the address bar has it
function sharelink(listid) {
    return location.origin+location.pathname+statehash({view: 'list', listid: listid});
}
function copysharelink(el,listid) {
    var link = sharelink(listid);
    var done = function() {
	$(el).find('.sharelinkstatus').remove();
	$(el).append($('<span class="sharelinkstatus">').text(' (copied)'));
	setTimeout(function() { $(el).find('.sharelinkstatus').remove(); }, 2000);
    };
    if(navigator.clipboard && navigator.clipboard.writeText) {
	navigator.clipboard.writeText(link).then(done, function() { prompt("Copy this link:", link); });
    } else {
	prompt("Copy this link:", link);
    }
}
// Copy to my lists: someone else's shared deck becomes your own private list (the API's duplicate, which
// records where it came from in source), then opens
function copysharedlist(el,listid) {
    $(el).prop('disabled', true);
    duplicatelist(listid, function(item) {
	listinfo(String(item.listid), true);
    }, function() {
	$(el).prop('disabled', false);
	alert("Couldn't copy the list. Try again in a moment.");
    });
}
// list view header: the pencil edits the name in place (shown on touch too: the header has no long press)
function listheaderrename(el) {
    var name = $(el).closest('.listviewheader').find('.listviewname')[0];
    $(name).attr('contenteditable','true').focus();
    var range = document.createRange();
    range.selectNodeContents(name);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}
// the header's name and notes save when they lose focus, if they changed; Enter ends a name, Escape undoes
$(document).on('blur', '#resultlist [data-listfield]', function() {
    var field = $(this).attr('data-listfield');
    var value = field == 'notes' ? editortext(this) : $(this).text().trim();
    if(field == 'name') {
	$(this).removeAttr('contenteditable');
    }
    if(value != String($(this).attr('data-prev'))) {
	$(this).attr('data-prev', value);
	listinfoupdate(String($(this).attr('data-list')), field, value);
    }
});
$(document).on('keydown', '#resultlist .listviewname[contenteditable=true]', function(e) {
    if(e.key == 'Enter') {
	e.preventDefault();
	this.blur();
    } else if(e.key == 'Escape') {
	$(this).text($(this).attr('data-prev'));
	this.blur();
    }
});

// ***********************  list statistics **************
// Derived from the game's config, so every game gets them without its own setup:
//  - the deck: the first of 'deck' / 'decktype' the game searches on (dbinfo[game].statdeck overrides; false = none).
//    'decktype' is only Dune's; drop it once Dune uses 'deck' (TODO.md)
//  - the averaged fields: the game's numeric searchables, less per-printing ones (card numbers) and 'number'
//    (dbinfo[game].statfields, a list of field names, overrides)
// Each type averages the fields its cards have, so L5R personalities get Force/Chi/HR/Cost/PH and fate cards Focus.
// A deck's own row averages only fields most of its copies have, and only when it's big enough to mean something.
var liststatsdeckshare = 0.75; // share of a deck's copies that must have a field for the deck row to show it
var liststatsdeckmin = 10;     // fewer copies than this (L5R Pre-Game): no averages on the deck row
function liststatsdeckfield() {
    var info = dbinfo[database] || {};
    if(info.statdeck !== undefined) {
	return info.statdeck;
    }
    var s = searchables[database] || {};
    return ['deck','decktype'].find(function(f) { return s[f]; }) || false;
}
function liststatsfields() {
    var info = dbinfo[database] || {};
    if(info.statfields) {
	return info.statfields;
    }
    var s = searchables[database] || {};
    return Object.keys(s).filter(function(f) {
	return s[f] && s[f].type == 'numeric' && f.indexOf('.') < 0 && f != 'number';
    });
}
// a field's number, or null when it has none (blank, '*', 'X', '-'): "+2" and "3&nbsp;" count
function liststatsnumber(v) {
    if(v === undefined || v === null) {
	return null;
    }
    var t = String(Array.isArray(v) ? v.join('') : v).replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').trim();
    return /^[+-]?\d+(\.\d+)?$/.test(t) ? parseFloat(t) : null;
}
function liststatsround(n) {
    return Math.round(n*10)/10;
}
// averages of the fields at least one of the cards has; on a deck's own row (most) only the fields
// liststatsdeckshare of its copies have (Focus on the Fate deck), since there it's a mix of types
function liststatsavgs(cards, fields, most) {
    var copies = cards.reduce(function(t,c) { return t + c.qty; }, 0);
    var out = [];
    fields.forEach(function(f) {
	var sum = 0, n = 0, has = 0;
	cards.forEach(function(c) {
	    if(c.card[f] === undefined || !String(c.card[f].join ? c.card[f].join('') : c.card[f]).trim()) {
		return;
	    }
	    has += c.qty;
	    var v = liststatsnumber(c.card[f]);
	    if(v !== null) {
		sum += v*c.qty;
		n += c.qty;
	    }
	});
	if(n > 0 && (!most || n >= copies*liststatsdeckshare)) {
	    var l = labels[database] || {};
	    out.push({"field": f, "label": l['tag'+f] || f, "short": l['short'+f] || f, "avg": liststatsround(sum/n),
		      "copies": n, "skipped": has-n});
	}
    });
    return out;
}
// keyword analysis: the game's first keyword-type searchable (L5R keywords, 7th Sea trait, Initial D traits) and
// its 'text' field; dbinfo[game].statkeywords / stattext override (false = no keyword section)
function liststatskeywordfield() {
    var info = dbinfo[database] || {};
    if(info.statkeywords !== undefined) {
	return info.statkeywords;
    }
    var s = searchables[database] || {};
    return Object.keys(s).find(function(f) { return s[f] && s[f].type == 'keyword' && f.indexOf('.') < 0; }) || false;
}
function liststatstextfield() {
    var info = dbinfo[database] || {};
    if(info.stattext !== undefined) {
	return info.stattext;
    }
    return (searchables[database] || {}).text ? 'text' : false;
}
function liststatsplain(v) {
    return String(v || '').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').trim();
}
// each deck's keywords (copies), most copies first, and how many other cards in the whole list
// name each one in their text (a whole word, as printed, plural allowed; a card's own keywords don't count)
function liststatskeywords(cards, decks) {
    var kwfield = liststatskeywordfield();
    if(!kwfield) {
	return [];
    }
    var textfield = liststatstextfield();
    var kws = function(c) {
	var v = c.card[kwfield];
	return (Array.isArray(v) ? v : (v ? [v] : [])).map(liststatsplain).filter(function(k) { return k; });
    };
    var texts = cards.map(function(c) {
	var v = textfield ? c.card[textfield] : '';
	return {"c": c, "text": liststatsplain(Array.isArray(v) ? v.join(' ') : v).replace(/\s+/g,' '), "kws": kws(c)};
    });
    var escape = function(k) { return k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); };
    var refs = {};
    var references = function(k) {
	if(!refs[k]) {
	    var re = new RegExp('(^|[^A-Za-z0-9])'+escape(k)+'s?(?![A-Za-z0-9])');
	    var by = texts.filter(function(t) { return t.kws.indexOf(k) < 0 && re.test(t.text); });
	    refs[k] = {"refcopies": by.reduce(function(n,t) { return n + t.c.qty; }, 0), "refcards": by.length,
		       "reftitles": by.map(function(t) { return liststatsplain((t.c.card.title || []).join ? t.c.card.title.join(' ') : t.c.card.title); }).join(', ')};
	}
	return refs[k];
    };
    return decks.map(function(d) {
	var counts = {};
	cards.filter(function(c) { return d.match(c); }).forEach(function(c) {
	    kws(c).forEach(function(k) {
		if(!counts[k]) {
		    counts[k] = {"name": k, "copies": 0};
		}
		counts[k].copies += c.qty;
	    });
	});
	var list = Object.keys(counts).map(function(k) { return $.extend(counts[k], references(k)); });
	list.sort(function(a,b) { return b.copies - a.copies || a.name.localeCompare(b.name); });
	return {"name": d.name, "keywords": list};
    }).filter(function(d) { return d.keywords.length; });
}
function liststatspct(part, whole) {
    return whole > 0 ? liststatsround(part*100/whole)+'%' : '';
}
function liststats(listdata) {
    var cards = listdata.filter(function(c) { return c.cardid > 0; }).map(function(c) {
	return {"card": c, "qty": parseInt(c.listquantity) || 0};
    }).filter(function(c) { return c.qty > 0; });
    var total = cards.reduce(function(t,c) { return t + c.qty; }, 0);
    if(!cards.length) {
	return '';
    }
    var deckfield = liststatsdeckfield();
    var fields = liststatsfields();
    var join = function(v) { return (Array.isArray(v) ? v.join(', ') : String(v || '')).replace(/&nbsp;/g,' ').trim(); };
    // groups in list order (the list is already in the game's deck sort)
    var group = function(items, key) {
	var out = [], index = {};
	items.forEach(function(c) {
	    var k = key(c);
	    if(index[k] === undefined) {
		index[k] = out.length;
		out.push({"name": k, "cards": []});
	    }
	    out[index[k]].cards.push(c);
	});
	return out;
    };
    var decks = group(cards, function(c) { return deckfield ? (join(c.card[deckfield]) || 'Other') : ''; }).map(function(d) {
	var copies = d.cards.reduce(function(t,c) { return t + c.qty; }, 0);
	var types = group(d.cards, function(c) { return join(c.card.type) || 'Other'; }).map(function(t) {
	    var tc = t.cards.reduce(function(s,c) { return s + c.qty; }, 0);
	    return {"name": t.name, "copies": tc, "pct": liststatspct(tc, copies),
		    "avgs": liststatsavgs(t.cards, fields, false)};
	});
	return {"name": d.name, "copies": copies, "pct": liststatspct(copies, total),
		"avgs": copies < liststatsdeckmin ? [] : liststatsavgs(d.cards, fields, true), "types": types};
    });
    var deckkey = function(c) { return deckfield ? (join(c.card[deckfield]) || 'Other') : ''; };
    var keywords = liststatskeywords(cards, decks.map(function(d) {
	return {"name": d.name, "match": function(c) { return deckkey(c) == d.name; }};
    }));
    return $.templates("#template-liststats").render({"totalcount": total, "distinctcount": cards.length,
	"decks": decks, "keywords": keywords, "open": cache_session("liststatsopen") !== false,
	"kwopen": cache_session("liststatskwopen") === true, "kwcutoff": liststatskwcutoff(), "textfield": !!liststatstextfield()});
}
// keyword counts under the cutoff (default 4, kept per browser) are hidden; a keyword with every count hidden
// hides, and so does a deck with none left
function liststatskwcutoff() {
    var n = parseInt(cache_session("liststatskwcutoff"));
    return isNaN(n) ? 4 : n;
}
function liststatscutoff(value) {
    if(value !== undefined) {
	var n = parseInt(value);
	cache_session("liststatskwcutoff", isNaN(n) ? '' : n); // blank: back to the default
    }
    var cutoff = liststatskwcutoff();
    $('#resultlist details.liststatskw tbody').each(function() {
	var shown = 0;
	$(this).find('tr.liststatskwrow').each(function() {
	    var any = false;
	    $(this).find('td[data-n]').each(function() {
		var keep = parseInt($(this).attr('data-n')) >= cutoff;
		$(this).children('span').toggle(keep);
		any = any || keep;
	    });
	    $(this).toggle(any);
	    shown += any ? 1 : 0;
	});
	$(this).toggle(shown > 0);
    });
    liststatsstripe();
}
// every other shown row in each deck is shaded (counted here, since the cutoff hides rows)
function liststatsstripe() {
    $('#resultlist table.liststatstable tbody').each(function() {
	var i = 0;
	$(this).children('tr').not('.liststatsdeck').each(function() {
	    var shown = $(this).css('display') != 'none';
	    $(this).toggleClass('liststatsstripe', shown && (i++ % 2 == 1));
	});
    });
}
// open or closed (the section, and its keyword part), kept per browser
function liststatstoggle(el) {
    cache_session($(el).hasClass('liststatskw') ? "liststatskwopen" : "liststatsopen", el.open);
}
// ***********************  list Table view (template-table) **************
// One row per card, in the list's sort (deck/type header rows as the Simple List and Deck views have them).
// Its stat columns follow the statistics box: the game's averaged fields (liststatsfields), each shown when a
// card in the list has a number for it; then the keyword field the box analyses (liststatskeywordfield).
function listtablecolumns(listdata) {
    var cards = listdata.filter(function(c) { return c.cardid > 0; });
    var l = labels[database] || {};
    var fields = liststatsfields().filter(function(f) {
	return cards.some(function(c) { return liststatsnumber(c[f]) !== null; });
    }).map(function(f) {
	return {"field": f, "label": l['tag'+f] || f, "short": l['short'+f] || f};
    });
    var kwfield = liststatskeywordfield();
    return {"tablefields": fields, "kwfield": kwfield, "kwlabel": kwfield ? (l['tag'+kwfield] || kwfield) : '',
	    "tablecols": 2 + fields.length + (kwfield ? 1 : 0),
	    "tablecell": function(card, f) {
		var v = card[f];
		return Array.isArray(v) ? v.join(', ') : (v === undefined || v === null ? '' : v);
	    }};
}
function listtablewrap(rows, cols) {
    return $.templates("#template-listtable").render(cols, {"rows": rows});
}
// every other card row under each header is shaded
function listtablestripe() {
    var i = 0;
    $('#resultlist table.listtable tbody tr').each(function() {
	if($(this).hasClass('listtablecard')) {
	    $(this).toggleClass('listtablestripe', i++ % 2 == 1);
	} else {
	    i = 0;
	}
    });
}

// list entries whose card no longer exists (#188), with a link to drop them from the list
function listmissing(listid,missing) {
    if(missing.length < 1) {
	return '';
    }
    var rev = cache_thing("list","datareverse");
    var mine = rev && rev[listid] !== undefined;
    return '<div class="listmissing">'+(missing.length == 1 ? 'A card' : missing.length+' cards')+
	' in this list no longer '+(missing.length == 1 ? 'exists' : 'exist')+' on the site (card id '+
	missing.map(function(c) { return c.cardid; }).join(', ')+').'+
	(mine ? ' <a href="#" onclick="removemissing(\''+listid+'\'); return false;">Remove from list</a>' : '')+'</div>';
}
function removemissing(listid) {
    var list = cache_thing("list",listid);
    var items = list.list.Items[0];
    items.list = items.list.filter(function(c) { return !(c.cardid>0) || cache_card_is(c.cardid); });
    items.distinctcount = items.list.length;
    items.totalcount = items.list.reduce(function (total,card) {
	return total + parseInt(card['quantity']);
    },0);
    cache_thing("list",listid,list);
    $("#lastlistid").val(listid);
    renderlist(items,false);
    listedited(listid);
    renderlisteditarea(); // update card counts
}

function dolist(listdata=[],listlist=[],sort,listid=null,listoutput=null) {
    console.log(["dolist: "+sort,listid,listoutput,listdata,listlist]);
    refreshlist(listdata,listlist,sort,listid,listoutput);
    showlist(); // the url (showview)
}

//**********************************************************  Settings page ****************
function showsettings() {
  rendersettings();
  showview('resultsettings');
}
// The page's tabs; a section joins one with data-settingstab. Logged out, only the ones kept in this browser.
var settingstabs = [['account','Account',true],['display','Display',true],['printing','Printing',true],['gestures','Gestures',false],['searches','Searches',false]];
var settingstab = null; // the tab picked this session, kept through rendersettings() after a save
function settingstablist(loggedin) {
  return settingstabs.filter(function(t) { return loggedin || !t[2]; }).map(function(t) { return {'key': t[0], 'label': t[1]}; });
}
function showsettingstab(key) {
  var area = $('#settingsarea');
  if(!area.find('button[data-settingstab="'+key+'"]').length) {
    key = area.find('button[data-settingstab]').first().attr('data-settingstab');
  } else {
    settingstab = key;
  }
  area.find('button[data-settingstab]').each(function() {
    var on = $(this).attr('data-settingstab') == key;
    $(this).toggleClass('settingstabactive', on).attr('aria-selected', on ? 'true' : 'false');
  });
  area.find('section[data-settingstab]').each(function() {
    $(this).toggle($(this).attr('data-settingstab') == key);
  });
}
// a saved view's name, or a dash when nothing is saved
function settingsviewname(key) {
  var available = templates[database]['available'];
  return (key && available[key]) ? available[key].longname : '\u2014';
}
function settingssortname(set) {
  if(!(set && set.sort)) {
    return '\u2014';
  }
  var name = (searchsorts[database] && searchsorts[database][set.sort]) || set.sort;
  var mode = (set.sortmode && set.sortmode != 'lex' && sortmodes[set.sortmode]) ? ', '+sortmodes[set.sortmode].toLowerCase() : '';
  return name+(set.sortdir == 'desc' ? ' (descending)' : '')+mode;
}
// PDF defaults in words, in the saved units
function settingspdfsummary(o) {
  var unit = pdfunits[o.units] || 72;
  var len = function(pt) { return (Math.round(pt/unit*100)/100)+' '+o.units; };
  var out = {};
  if(o.layout == 'mpc') {
    out['Layout'] = 'MakePlayingCards (one card per page)';
    out['Bleed'] = len(o.bleed)+', '+(o.bleedfill == 'extend' ? "extend the card's edge" : 'black')+(o.fixcorners ? ', corners painted over' : '');
  } else {
    out['Layout'] = 'Sheets';
    var paper = (o.paper in pdfpapers && pdfpapers[o.paper].width) ? pdfpapers[o.paper].name : 'Custom '+len(o.paperwidth)+' \u00d7 '+len(o.paperheight);
    out['Paper'] = paper+', '+o.orientation;
    out['Grid'] = (o.columns || 'fit')+' \u00d7 '+(o.rows || 'fit')+', spacing '+len(o.spacing)+', margins '+len(o.margin);
    if(o.offsetx || o.offsety) {
      out['Offset'] = len(o.offsetx)+' right, '+len(o.offsety)+' down';
    }
  }
  out['Card size'] = len(o.cardwidth)+' \u00d7 '+len(o.cardheight)+' ('+dbinfo[database].name+')';
  out['Quantity'] = o.quantity == 'spoiler' ? 'One of each' : "The list's quantities";
  out['Sort'] = o.sort == 'list' ? "The list's order" : o.sort.charAt(0).toUpperCase()+o.sort.slice(1);
  return out;
}
function rendersettings() {
  var user = cache_thing("user","data");
  var searches = searchsettings();
  var searchctx = {
    'gamename': dbinfo[database].name, 'loggedin': searchloggedin(), 'gestures': gesturesettingsctx(),
    'searchdefault': searches['default'] ? searchsummary(searches['default']) : null,
    'searches': Object.keys(searches['saved']).sort(searchnamecmp).map(function(name) {
      return {'name': name, 'summary': searchsummary(searches['saved'][name])};
    })
  };
  if(!(user && ("oracle" in user))) {
    // logged out: only the search settings (kept in this browser)
    $('#settingsarea').html($.templates("#template-settings").render(Object.assign(searchctx, {'tabs': settingstablist(false)})));
    showsettingstab(settingstab);
    return;
  }
  var saved = savedgamesettings() || {};
  var desktop = saved, phone = saved['mobile'] || {};
  var active = templates[database]['active'];
  var views = [['search','Search results'],['card','Card details'],['list','List details']].map(function(v) {
    return {'part': v[0], 'label': v[1], 'desktop': settingsviewname(desktop[v[0]]), 'phone': settingsviewname(phone[v[0]]), 'now': settingsviewname(active[v[0]])};
  });
  views.push({'part': 'sort', 'label': 'Sort', 'desktop': settingssortname(desktop), 'phone': settingssortname(phone),
              'now': settingssortname({'sort': templates[database]['sort']['search'], 'sortdir': templates[database]['sortdir'] && templates[database]['sortdir']['search'],
                                           'sortmode': templates[database]['sortmode'] && templates[database]['sortmode']['search']})});
  $('#settingsarea').html($.templates("#template-settings").render(Object.assign(searchctx, {
    'name': username(user), 'sharedname': sharedname(user.oracle[0]), 'oracle': user.oracle[0], 'emaillist': profileemails(user).emaillist, 'pending': profileemails(user).pending,
    'favorite': favoritegame() || '', 'textversion': savedtextversion(), 'games': Object.keys(dbinfo).map(function(k) { return {'key': k, 'name': dbinfo[k].name}; }),
    'phone': narrowscreen(), 'views': views, 'folders': dirfolders().length,
    'pdfallowed': pdfallowed(), 'pdfsaved': pdfsaveddefaults().saved, 'pdf': settingspdfsummary(pdfstartoptions()),
    'tabs': settingstablist(true)
  })));
  showsettingstab(settingstab);
}

//**********************************************************  Profile name ****************
// POST /user (ootv-client #21) changes your own user: {firstname, lastname}, or an email action
// (addemail, verifyemail, cancelemail, removeemail). It answers like GET /user.
function postprofile(body, status, done) {
  $.ajax({
    type: 'POST',
    url: apiuri+"/user",
    contentType: 'application/json',
    data: JSON.stringify(body),
    dataType: 'json',
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
    success: function(data) {
      // the user is cached per game: put the server's copy in each cached one, keeping its cognito part
      Object.keys(dbinfo).forEach(function(g) {
        var key = g+"_user_data";
        try {
          var cached = JSON.parse(window.localStorage.getItem(key));
          if(cached && ("oracle" in cached)) {
            cached.oracle = data.oracle;
            window.localStorage.setItem(key, JSON.stringify(cached));
          }
        } catch(e) {}
      });
      var user = cache_thing("user","data");
      if(user && ("oracle" in user)) {
        user.oracle = data.oracle;
        cache_thing("user","data",user);
      }
      showloginfo(user);
      rendersettings();
      done(data);
    },
    error: function(error) {
      console.log("Profile save failed: "+JSON.stringify(error));
      status.text("Couldn't save: "+((error.responseJSON && error.responseJSON.error) || error.statusText));
    }
  });
}
function editprofilename(el) {
  var section = $(el).closest('dd');
  section.find('.profilename').hide();
  section.find('.profilenameform').show();
  section.find('.profilefirstname').focus();
}
function saveprofilename(el) {
  var section = $(el).closest('dd');
  var status = section.find('.profilenamestatus');
  var firstname = section.find('.profilefirstname').val().trim();
  var lastname = section.find('.profilelastname').val().trim();
  if(!firstname) {
    status.text("First name can't be empty.");
    return;
  }
  if(/[<>&"]/.test(firstname+lastname)) {
    status.text("Names can't contain < > & or \".");
    return;
  }
  status.text("Saving...");
  postprofile({'firstname': firstname, 'lastname': lastname}, status, function() {
    $('.profilenamestatus').text("Saved.");
  });
}
// the name others see on your public lists: as ootv-search lib/owner.js makes ownername
function sharedname(o) {
  if(o && o.displayname) {
    return o.displayname;
  }
  var initials = [o && o.firstname, o && o.lastname].filter(function(n) { return n && n.trim(); })
    .map(function(n) { return Array.from(n.trim())[0].toUpperCase()+'.'; }).join('');
  return initials || 'another player';
}
function editprofiledisplayname(el) {
  var section = $(el).closest('dd');
  section.find('.profiledisplayname').hide();
  section.find('.profiledisplaynameform').show();
  section.find('.profiledisplaynameinput').focus();
}
// the display name goes with the current first and last name: POST /user's profile action sets all three
function saveprofiledisplayname(el) {
  var section = $(el).closest('dd');
  var status = section.find('.profiledisplaynamestatus');
  var displayname = section.find('.profiledisplaynameinput').val().trim();
  if(/[<>&"]/.test(displayname)) {
    status.text("A display name can't contain < > & or \".");
    return;
  }
  var o = cache_thing("user","data").oracle[0];
  status.text("Saving...");
  postprofile({'firstname': o.firstname, 'lastname': o.lastname || '', 'displayname': displayname}, status, function() {
    $('.profiledisplaynamestatus').text("Saved.");
  });
}
// the emails for the Profile section: which one you're signed in with, and a code waiting to be entered
function profileemails(user) {
  var login = (user.cognito && user.cognito.email || '').toLowerCase();
  var pending = user.oracle[0].emailpending;
  return {
    'emaillist': (user.oracle[0].emails || []).map(function(e) { return {'email': e, 'current': e.toLowerCase() === login}; }),
    'pending': (pending && pending.expires > Date.now()) ? pending : null
  };
}
function addprofileemail(el) {
  var section = $(el).closest('dd');
  var status = section.find('.profileemailstatus');
  var email = ($(el).data('email') || section.find('.profilenewemail').val() || '').trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    status.text("Enter an email address.");
    return;
  }
  status.text("Sending...");
  postprofile({'action': 'addemail', 'email': email}, status, function() {
    $('.profileemailstatus').text("Sent. Check that inbox (and its spam folder) for the code.");
    $('.profileemailcode').focus();
  });
}
function verifyprofileemail(el) {
  var section = $(el).closest('dd');
  var status = section.find('.profileemailstatus');
  var code = section.find('.profileemailcode').val().replace(/\s/g, '');
  var pending = profileemails(cache_thing("user","data")).pending;
  if(!/^\d{6}$/.test(code)) {
    status.text("The code is 6 digits.");
    return;
  }
  if(!pending) {
    status.text("That code has expired; ask for a new one.");
    return;
  }
  status.text("Checking...");
  postprofile({'action': 'verifyemail', 'email': pending.email, 'code': code}, status, function() {
    $('.profileemailstatus').text("Added "+pending.email+".");
  });
}
function cancelprofileemail(el) {
  var status = $(el).closest('dd').find('.profileemailstatus');
  postprofile({'action': 'cancelemail'}, status, function() {});
}
function removeprofileemail(el) {
  var status = $(el).closest('dd').find('.profileemailstatus');
  var email = $(el).data('email');
  if(!confirm("Remove "+email+" from your account?\n\nSigning in with it won't reach this account any more, and we'll email "+email+" to say it was removed.")) {
    return;
  }
  status.text("Removing...");
  postprofile({'action': 'removeemail', 'email': email}, status, function(data) {
    $('.profileemailstatus').text(data.warning || ("Removed "+email+"."));
  });
}

//**********************************************************  Favorite game ****************
// users.settings.all.game: the game to open when this browser hasn't picked one (no game menu click or
// #game= url yet: a new browser, or after logging out or Clear Cache). Without one it's L5R, as before.
// A copy is kept in localStorage (session_favoritegame) so the next page load starts on it.
function favoritegame() {
  var user = cache_thing("user","data");
  var all = user && ("oracle" in user) && user.oracle[0].settings && user.oracle[0].settings['all'];
  var game = all && all['game'];
  return (game && dbinfo[game]) ? game : null;
}
function applyfavoritegame() {
  var game = favoritegame();
  cache_session("favoritegame", game || "");
  if(game && game != database && !cache_session("database") && !/#game=/.test(location.hash)) {
    location.reload(); // first login in this browser: the top of this file now starts on the favorite
  }
}
function savefavoritegame(game,el) {
  saveallsetting('game', game || null, $(el).siblings('.favoritegamestatus'), function() {
    cache_session("favoritegame", favoritegame() || "");
    rendersettings();
    $('.favoritegamestatus').text("Saved.");
  });
}
// the Card text setting: which wording (textversionnow) a new session starts with
function savetextversion(value,el) {
  saveallsetting('textversion', value == 'mrp' ? 'mrp' : 'printed', $(el).siblings('.textversionstatus'), function() {
    rendersettings();
    $('.textversionstatus').text("Saved. New sessions start with it; the Showing: button still flips this one.");
  });
}

//**********************************************************  Gestures ****************
// users.settings.all.gestures (logged out: this browser, session_gestures): {off: [switch keys],
// search: {direction: [action, count]}, list: {...}}. Only what differs from the defaults is stored.
// Switches: each gesture's handler checks gestureon() and, when it's off, leaves the browser's own behavior alone.
var gestureswitches = [
  ['deckswipetouch', 'Swipe a card image or Simple List title to change its count (touch)'],
  ['deckswipemouse', 'Click-drag a card image or Simple List title to change its count (mouse)'],
  ['dirdragtouch', 'Drag lists and folders in the list directory (touch)'],
  ['dirdragmouse', 'Drag lists and folders in the list directory (mouse)'],
  ['dirfolderselect', 'Folder pulldown on each list in the list directory (off: move lists by dragging only)'],
  ['tooltip', "Long-press a button to see its label (touch)"]
];
// card swipes, per view: search results change the first active list, the deck/list view the list shown
var swipeviews = [['search', 'Swipes in search results'], ['list', 'Swipes in a deck or list']];
var swipedirs = [['right', 'Right'], ['upright', 'Up-right'], ['left', 'Left'], ['upleft', 'Up-left']];
var swipeactions = [['off', 'Nothing'], ['add', 'Add'], ['sub', 'Remove'], ['set', 'Set the count to'], ['zero', 'Remove all copies']];
var swipedefaults = {
  'search': {'right': ['add',1], 'upright': ['add',3], 'left': ['sub',1], 'upleft': ['zero',0]},
  'list': {'right': ['add',1], 'upright': ['add',2], 'left': ['sub',1], 'upleft': ['zero',0]}
};
function gesturesettings() {
  var g = null;
  if(searchloggedin()) {
    var settings = cache_thing("user","data").oracle[0].settings;
    g = settings && settings['all'] && settings['all']['gestures'];
  } else {
    g = cache_session("gestures");
  }
  g = g || {};
  var out = {'off': g['off'] || []};
  swipeviews.forEach(function(v) {
    out[v[0]] = Object.assign({}, swipedefaults[v[0]], g[v[0]] || {});
  });
  return out;
}
function gestureon(key) {
  return gesturesettings()['off'].indexOf(key) < 0;
}
// the Gestures section of Settings
function gesturesettingsctx() {
  var g = gesturesettings();
  return {
    'switches': gestureswitches.map(function(s) { return {'key': s[0], 'label': s[1], 'on': g['off'].indexOf(s[0]) < 0}; }),
    'views': swipeviews.map(function(v) {
      return {'view': v[0], 'label': v[1], 'rows': swipedirs.map(function(d) {
        var act = g[v[0]][d[0]];
        return {'dir': d[0], 'label': d[1], 'action': act[0], 'count': act[1] || 1};
      })};
    }),
    'actions': swipeactions.map(function(a) { return {'key': a[0], 'label': a[1]}; })
  };
}
function gesturesfromform(section) {
  var g = {'off': []};
  section.find('input[data-gesture]').each(function() {
    if(!this.checked) {
      g['off'].push($(this).attr('data-gesture'));
    }
  });
  section.find('table[data-view]').each(function() {
    var view = $(this).attr('data-view'), acts = {};
    $(this).find('tr[data-dir]').each(function() {
      var action = $(this).find('select').val();
      var count = Math.max(1, Math.min(99, parseInt($(this).find('.swipecount').val(), 10) || 1));
      acts[$(this).attr('data-dir')] = [action, (action == 'off' || action == 'zero') ? 0 : count];
    });
    if(!_.isEqual(acts, swipedefaults[view])) {
      g[view] = acts;
    }
  });
  if(!g['off'].length) {
    delete g['off'];
  }
  return $.isEmptyObject(g) ? null : g;
}
// any change in the section: show the count only where the action takes one, then save shortly after
var gesturesavetimer = null;
function gesturechanged(el) {
  var section = $(el).closest('.gesturesettings');
  section.find('tr[data-dir]').each(function() {
    $(this).find('.swipecount').toggle(['add','sub','set'].indexOf($(this).find('select').val()) >= 0);
  });
  section.find('.gesturestatus').text('');
  clearTimeout(gesturesavetimer);
  gesturesavetimer = setTimeout(function() { savegestures(section.find('.gesturestatus'), gesturesfromform(section)); }, 800);
}
function savegestures(status, g, done) {
  if(searchloggedin()) {
    saveallsetting('gestures', g, status, function() {
      status.text("Saved.");
      applyfolderselect();
      if(done) { done(); }
    });
  } else {
    cache_session("gestures", g || {});
    status.text("Saved in this browser.");
    applyfolderselect();
    if(done) { done(); }
  }
}
// the dirfolderselect switch: off hides the list directory's Folder column (table) and Folder select (cards)
function applyfolderselect() {
  $('#resultdir').toggleClass('nofolderselect', !gestureon('dirfolderselect'));
}
function resetgestures(el) {
  clearTimeout(gesturesavetimer);
  savegestures($(el).siblings('.gesturestatus'), null, function() {
    rendersettings();
    $('.gesturestatus').text("Back to the defaults.");
  });
}
// Set (or with value null, remove) one key of users.settings.all. settings.all is shared by every game
// (PDF defaults live there too) and the cached user is per game, so start from a fresh copy rather than
// overwrite something saved in another game.
function saveallsetting(key,value,status,done) {
  status.text("Saving...");
  var fail = function(error) {
    console.log("Setting "+key+" save failed: "+JSON.stringify(error));
    status.text("Couldn't save: "+((error.responseJSON && error.responseJSON.error) || error.statusText));
  };
  $.ajax({
    type: 'GET',
    url: apiuri+"/user",
    contentType: 'application/json',
    dataType: 'json',
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
    responseType: 'application/json',
    success: function(fresh) {
      var all = Object.assign({}, (fresh && ("oracle" in fresh) && fresh.oracle[0].settings && fresh.oracle[0].settings['all']) || {});
      if(value !== null) {
        all[key] = value;
      } else {
        delete all[key];
      }
      $.ajax({
        type: 'GET',
        url: apiuri+"/user?database=all&settings="+encodeURIComponent(JSON.stringify(all)),
        contentType: 'application/json',
        dataType: 'json',
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
        responseType: 'application/json',
        success: function(data) {
          cache_thing("user","data",data);
          done(data);
        },
        error: fail
      });
    },
    error: fail
  });
}

//**********************************************************  Saved searches ****************
// Per game: a default search (fills the form on a new session and on Reset) and named saved searches
// (links under the Search button that fill the form). Stored as {default: values, saved: {name: values}},
// values = {field name: value or [values]} from the search form.
// Logged in: users.settings[database+'-search'] through /user (its own settings object, so it has its
// own 4 KB and doesn't crowd the view defaults and folders in settings[database]); keys there can't be
// ordered (DynamoDB maps), so saved searches show by name. Logged out: this browser's localStorage.
function searchloggedin() {
  var user = cache_thing("user","data");
  return !!(user && ("oracle" in user));
}
function searchsettings() {
  var s = null;
  if(searchloggedin()) {
    var settings = cache_thing("user","data").oracle[0].settings;
    s = settings && settings[database+'-search'];
  } else {
    s = cache_thing("searchsaved","data");
  }
  s = Object.assign({}, s || {});
  s['saved'] = Object.assign({}, s['saved'] || {});
  return s;
}
function searchnamecmp(a,b) {
  return a.localeCompare(b,undefined,{numeric: true, sensitivity: 'base'});
}
// write the whole object; done(true) when saved
function savesearchsettings(s,done) {
  var store = {};
  if(s['default'] && Object.keys(s['default']).length) {
    store['default'] = s['default'];
  }
  if(Object.keys(s['saved'] || {}).length) {
    store['saved'] = s['saved'];
  }
  var finish = function(ok) {
    if(ok) {
      rendersavedsearches();
      rendersettings();
    }
    if(done) { done(ok); }
  };
  if(!searchloggedin()) {
    cache_thing("searchsaved","data",store);
    finish(true);
    return;
  }
  $.ajax({
    type: 'GET',
    url: apiuri+"/user?database="+encodeURIComponent(database+'-search')+"&settings="+encodeURIComponent(JSON.stringify(store)),
    dataType: 'json',
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
    success: function(data) {
      var user = data && data.oracle && data.oracle[0];
      if(!user || !user.settings || JSON.stringify(user.settings[database+'-search']) !== JSON.stringify(store)) {
        alert("Couldn't save your searches.");
        finish(false);
        return;
      }
      cache_thing("user","data",data);
      finish(true);
    },
    error: function(error) {
      console.log(error);
      var msg = (error.responseJSON && error.responseJSON.error) || error.statusText || "network error";
      if(/at most \d+ bytes/.test(msg)) {
        msg = "there's no room for more saved searches in "+dbinfo[database].name+". Delete some in Settings.";
      }
      alert("Couldn't save your searches: "+msg);
      finish(false);
    }
  });
}
// the search form's values: what's filled in (not the hidden field types)
function searchformvalues() {
  var values = {};
  $('#searchform').serializeArray().forEach(function(f) {
    if(f.value === "" || f.value === null || f.name == 'selectsloaded' || f.name.startsWith('type_')) {
      return;
    }
    if(values[f.name] === undefined) {
      values[f.name] = f.value;
    } else {
      values[f.name] = [].concat(values[f.name], f.value);
    }
  });
  return values;
}
// clear the form and fill in values (missing fields stay empty)
function fillsearchform(values) {
  var form = $('#searchform');
  form[0].reset();
  var advanced = false;
  var setvalues = function() {
    form.find('input[name], select[name]').each(function() {
      if(this.type == 'hidden' || values[this.name] === undefined) {
        return;
      }
      var want = [].concat(values[this.name]).map(String);
      if(this.type == 'checkbox' || this.type == 'radio') {
        this.checked = want.includes(this.value);
      } else if(this.multiple) {
        $(this).val(want);
      } else {
        $(this).val(want.join(' '));
      }
      advanced = advanced || $(this).closest('dd').hasClass('advanced');
    });
  };
  setvalues();
  // chained selects (set -> rarity) redraw from their parent, then take their values
  form.find('select[onchange]').trigger('change');
  setvalues();
  form.find('.chosen-select').trigger('chosen:updated');
  if(advanced) {
    showadvancedsearch(true);
  }
}
function showadvancedsearch(show) {
  $('dt.advanced, dd.advanced').toggle(show);
  $('dt.notadvanced, dd.notadvanced').toggle(!show);
}
// a new session (no search in the url) or Reset: the saved default, or an empty form
function resetsearchform() {
  var def = searchsettings()['default'];
  fillsearchform(def || {});
}
function searchformblank() {
  return Object.keys(searchformvalues()).length == 0;
}
// the form was drawn, or the user (and their settings) arrived: fill in the default if nothing else did
function applysearchdefault() {
  if(!$('#selectsloaded').length || /#(search|quicksearch|quicksearchtitle)=/.test(location.hash) || $('#lastsearchquery').val() || !searchformblank()) {
    return;
  }
  var def = searchsettings()['default'];
  if(def) {
    fillsearchform(def);
  }
}
function savesearchdefault(el) {
  var values = searchformvalues();
  var s = searchsettings();
  if(!Object.keys(values).length) {
    if(!s['default'] || !confirm("The search form is empty. Clear your default search for "+dbinfo[database].name+"?")) {
      return;
    }
    delete s['default'];
  } else {
    s['default'] = values;
  }
  savesearchsettings(s,function(ok) { if(ok) { flashsaved(el); } });
}
function savesearch(el) {
  var values = searchformvalues();
  if(!Object.keys(values).length) {
    alert("Fill in the search form first.");
    return;
  }
  var name = prompt("Save this search as:");
  if(name === null) { return; }
  name = name.trim();
  if(!name) { return; }
  var s = searchsettings();
  // same name (ignoring case) replaces the old one
  Object.keys(s['saved']).forEach(function(old) {
    if(searchnamecmp(old,name) == 0) { delete s['saved'][old]; }
  });
  s['saved'][name] = values;
  savesearchsettings(s,function(ok) { if(ok) { flashsaved(el); } });
}
function flashsaved(el) {
  $(el).addClass('saved');
  setTimeout(function() { $(el).removeClass('saved'); }, 2000);
}
function deletesavedsearch(name) {
  var s = searchsettings();
  if(s['saved'][name] === undefined || !confirm("Delete the saved search \""+name+"\"?")) {
    return;
  }
  delete s['saved'][name];
  savesearchsettings(s);
}
function deleteallsavedsearches() {
  var s = searchsettings();
  if(!confirm("Delete all "+Object.keys(s['saved']).length+" saved searches for "+dbinfo[database].name+"?")) {
    return;
  }
  s['saved'] = {};
  savesearchsettings(s);
}
function clearsearchdefault() {
  var s = searchsettings();
  if(!confirm("Clear your default search for "+dbinfo[database].name+"?")) {
    return;
  }
  delete s['default'];
  savesearchsettings(s);
}
function usesavedsearch(name) {
  var values = searchsettings()['saved'][name];
  if(values) {
    fillsearchform(values);
  }
}
// the saved searches under the Search button
function rendersavedsearches() {
  var names = Object.keys(searchsettings()['saved']).sort(searchnamecmp);
  $('#savedsearches').html($.templates("#template-savedsearches").render({'names': names}));
}
// values in words, using the form's labels: "All: crane; Type: Holding, Region; Gold Cost: 2 to 5"
function searchsummary(values) {
  var parts = [], done = {};
  Object.keys(values).forEach(function(name) {
    if(done[name]) { return; }
    var el = $('#searchform [name="'+name+'"]').first();
    var label = name == 'querystring' ? 'All' : (el.closest('dd').prev('dt').text().trim() || name.replace(/^(field_|require_)/,''));
    var range = name.match(/^field_(lower|upper)_(.*)/);
    var text;
    if(range) {
      var lo = values['field_lower_'+range[2]], hi = values['field_upper_'+range[2]];
      done['field_lower_'+range[2]] = done['field_upper_'+range[2]] = true;
      text = (lo !== undefined && hi !== undefined) ? lo+' to '+hi : (lo !== undefined ? 'at least '+lo : 'at most '+hi);
    } else if(el.prop('type') == 'checkbox') {
      text = name.startsWith('require_') ? (el.parent('label').text().trim() || 'yes') : 'yes';
    } else {
      text = [].concat(values[name]).map(function(v) { return htmlDecode(String(v)); }).join(', ');
    }
    done[name] = true;
    parts.push(label+': '+text);
  });
  return parts.join('; ');
}

//**********************************************************  PDF print-n-play ****************
// Lengths are PDF points (72 per inch). The dialog shows them in the chosen units.
var pdfpapers = {
  'letter': {'name': 'Letter (8.5 \u00d7 11 in)', 'width': 612, 'height': 792},
  'legal': {'name': 'Legal (8.5 \u00d7 14 in)', 'width': 612, 'height': 1008},
  'a4': {'name': 'A4 (210 \u00d7 297 mm)', 'width': 210*72/25.4, 'height': 297*72/25.4},
  'a3': {'name': 'A3 (297 \u00d7 420 mm)', 'width': 297*72/25.4, 'height': 420*72/25.4},
  'custom': {'name': 'Custom'}
};
var pdfunits = {'in': 72, 'mm': 72/25.4};
var pdfdefaults = {
  'layout': 'sheet', // sheet = a grid of cards on paper, mpc = one card per page with bleed (MakePlayingCards)
  'bleed': 8.64, // mpc: added on each side (MPC's poker template: 2.5 x 3.5 in cut, 2.74 x 3.74 in with bleed)
  'bleedfill': 'black', // mpc: black, or extend = stretch the card's outer pixels
  'fixcorners': true, // mpc: paint over the scans' white rounded corners and edge slivers
  'paper': 'letter', 'paperwidth': 612, 'paperheight': 792, 'orientation': 'portrait', 'units': 'in',
  'margin': 18, 'spacing': 0, 'offsetx': 0, 'offsety': 0,
  'columns': 0, 'rows': 0, // 0 = as many as fit
  'quantity': 'proxy', // proxy = the list's quantities, spoiler = one of each
  'sort': 'list' // list = the list's own order, or a key of databasesort[database], or title
};
var pdfoptions = null; // options for the next createpdf, set by the PDF dialog

// Sun and Moon is an L5R client: its list export/import only applies to games with a textsnm template
function snmallowed() {
  return !!(templates[database] && templates[database]['available'] && templates[database]['available']['textsnm']);
}
// Sun and Moon codes for the export, loaded on the first S&M export: a printing's own `snmsetcode`
// (where S&M files it under another edition; [""] = write no set, S&M shows its default printing),
// else its set's code from the structure item <game>/snm (sets: OotV set -> S&M code; the set
// import adds a new set's code there, docs/snm/snm-push.py writes the rest)
var snmsets = {};
function snmsetload(callback) {
  var db = database;
  $.ajax({
    url: apiuri+"/structure?database="+db+"&key=snm",
    dataType: "json",
    success: function(data) {
      snmsets[db] = {'sets': (data && data.sets) || {}};
      callback();
    },
    error: function(error) {
      console.log("Epic Fail: snm sets: "+JSON.stringify(error));
      snmsets[db] = {'sets': {}};
      callback();
    }
  });
}
// {{snmset listprinting printing cardid /}}: "(CODE)", or nothing when S&M has no code for that printing
function templatesnmset(id,hashes,cardid) {
  var map = snmsets[database] || {'sets': {}};
  var p = (hashes || []).find(e => parseInt(e.printingid) == parseInt(id));
  var code;
  if(p && p.snmsetcode !== undefined) {
    code = [].concat(p.snmsetcode)[0] || '';
  } else {
    code = map.sets[templateprintingfromid(id,hashes,"set")] || '';
  }
  return code ? "("+code+")" : '';
}
// games can turn PDF output off (dbinfo[game].pdfprint: false)
function pdfallowed() {
  return !(dbinfo[database] && dbinfo[database].pdfprint === false);
}
// the game's card size (dbinfo[game].cardsize, mm), in points
function pdfgamecardsize() {
  var size = (dbinfo[database] && dbinfo[database].cardsize) || [63.5, 88.9];
  return [size[0]*72/25.4, size[1]*72/25.4];
}
// options with the game's card size, for when nothing else set them
function pdfbaseoptions() {
  var size = pdfgamecardsize();
  return Object.assign({}, pdfdefaults, {'cardwidth': size[0], 'cardheight': size[1]});
}
// where the cards go: page size, grid, and the top-left corner of the grid
function pdflayout(o) {
  if(o.layout == 'mpc') {
    return {
      'pagewidth': o.cardwidth + 2*o.bleed, 'pageheight': o.cardheight + 2*o.bleed,
      'cols': 1, 'rows': 1, 'fitcols': 1, 'fitrows': 1, 'x': o.bleed, 'y': o.bleed
    };
  }
  var pw = o.paperwidth, ph = o.paperheight;
  if(o.paper in pdfpapers && pdfpapers[o.paper].width) {
    pw = pdfpapers[o.paper].width;
    ph = pdfpapers[o.paper].height;
  }
  if((o.orientation == 'landscape') != (pw > ph)) {
    var t = pw; pw = ph; ph = t;
  }
  var fitcols = Math.max(0, Math.floor((pw - 2*o.margin + o.spacing + 0.01) / (o.cardwidth + o.spacing)));
  var fitrows = Math.max(0, Math.floor((ph - 2*o.margin + o.spacing + 0.01) / (o.cardheight + o.spacing)));
  var cols = o.columns > 0 ? Math.min(o.columns, fitcols) : fitcols;
  var rows = o.rows > 0 ? Math.min(o.rows, fitrows) : fitrows;
  var gridwidth = cols*o.cardwidth + Math.max(0, cols-1)*o.spacing;
  var gridheight = rows*o.cardheight + Math.max(0, rows-1)*o.spacing;
  return {
    'pagewidth': pw, 'pageheight': ph, 'cols': cols, 'rows': rows, 'fitcols': fitcols, 'fitrows': fitrows,
    'x': (pw - gridwidth)/2 + o.offsetx, 'y': (ph - gridheight)/2 + o.offsety
  };
}
function pdftitlesort(a,b) {
  var x = a.title[0].toLowerCase();
  var y = b.title[0].toLowerCase();
  if (x < y) {return -1;}
  if (x > y) {return 1;}
  return 0;
}

// saved defaults live in users.settings.all.pdf (user-wide, not per game), with the card
// size per game in .cardsizes[game]. The session copy covers games whose cached user is older.
function pdfsaveddefaults() {
  var user = cache_thing("user","data");
  var server = (user && ("oracle" in user) && user.oracle[0].settings && user.oracle[0].settings['all'] && user.oracle[0].settings['all']['pdf']) || {};
  var session = cache_session("pdfdefaults") || {};
  return ((session.saved || '') > (server.saved || '')) ? session : server;
}
function pdfstartoptions() {
  var saved = Object.assign({}, pdfsaveddefaults());
  var cardsizes = saved.cardsizes || {};
  delete saved.cardsizes;
  delete saved.saved;
  var o = Object.assign(pdfbaseoptions(), saved);
  if(cardsizes[database]) {
    o.cardwidth = cardsizes[database][0];
    o.cardheight = cardsizes[database][1];
  }
  return o;
}
var pdfdialogstate = {};
function pdfdialog(listid,filename,layout=null) {
  if(!pdfallowed()) { return; }
  pdfdialogstate = {'mode': 'print', 'listid': listid, 'filename': filename};
  var o = pdfstartoptions();
  if(layout) { o.layout = layout; }
  pdfrender(o);
}
function pdfsettingsdialog() {
  if(!pdfallowed()) { return; }
  pdfdialogstate = {'mode': 'settings'};
  pdfrender(pdfstartoptions());
}
function pdfrender(o) {
  var unit = pdfunits[o.units] || 72;
  var v = {};
  ['paperwidth','paperheight','cardwidth','cardheight','spacing','margin','offsetx','offsety','bleed'].forEach(function(k) {
    v[k] = Math.round(o[k]/unit*1000)/1000;
  });
  if(o.paper in pdfpapers && pdfpapers[o.paper].width) {
    v.paperwidth = Math.round(pdfpapers[o.paper].width/unit*1000)/1000;
    v.paperheight = Math.round(pdfpapers[o.paper].height/unit*1000)/1000;
  }
  var sorts = {'list': "The list's order"};
  Object.keys(databasesort[database] || {}).forEach(function(k) { sorts[k] = k.charAt(0).toUpperCase()+k.slice(1); });
  if(!('title' in sorts)) { sorts['title'] = 'Title'; }
  var user = cache_thing("user","data");
  modal(pdfdialogstate.mode == 'print' ? "PDF Print-n-Play" : "PDF print settings",
        $.templates("#template-pdfoptions").render({
          'mode': pdfdialogstate.mode, 'o': o, 'v': v, 'papers': pdfpapers, 'sorts': sorts,
          'gamename': dbinfo[database].name, 'loggedin': !!(user && ("oracle" in user))
        }));
  pdfsummary();
}
// the form's values as options, in points
function pdfreadform(units=null) {
  var form = {};
  $('#pdfform').serializeArray().forEach(function(f) { form[f.name] = f.value; });
  $('#pdfform input:disabled').each(function() { form[this.name] = this.value; });
  var unit = pdfunits[units || form.units] || 72;
  var o = Object.assign(pdfbaseoptions(), {
    'layout': form.layout, 'bleedfill': form.bleedfill, 'fixcorners': form.fixcorners == 'on',
    'paper': form.paper, 'orientation': form.orientation, 'units': form.units,
    'quantity': form.quantity, 'sort': form.sort,
    'columns': Math.max(0, parseInt(form.columns) || 0), 'rows': Math.max(0, parseInt(form.rows) || 0)
  });
  ['paperwidth','paperheight','cardwidth','cardheight','spacing','margin','offsetx','offsety','bleed'].forEach(function(k) {
    var n = parseFloat(form[k]);
    if(!isNaN(n)) { o[k] = Math.round(n*unit*1000)/1000; }
  });
  ['paperwidth','paperheight','cardwidth','cardheight','spacing','margin','bleed'].forEach(function(k) {
    o[k] = Math.max(0, o[k]);
  });
  if(o.paper == 'custom' && o.paperwidth > o.paperheight) {
    var t = o.paperwidth; o.paperwidth = o.paperheight; o.paperheight = t;
  }
  return o;
}
// paper and units change which fields are enabled and how lengths read, so redraw the form
function pdfrerender() {
  var previous = pdfdialogstate.units || $('#pdfform select[name=units] option[selected]').val();
  var o = pdfreadform(previous);
  pdfdialogstate.units = o.units;
  if(o.paper in pdfpapers && pdfpapers[o.paper].width) {
    o.paperwidth = pdfpapers[o.paper].width;
    o.paperheight = pdfpapers[o.paper].height;
  }
  pdfrender(o);
}
function pdfsummary() {
  var o = pdfreadform();
  pdfdialogstate.units = o.units;
  var layout = pdflayout(o);
  var text;
  if(o.layout == 'mpc') {
    var unit = pdfunits[o.units] || 72;
    var size = function(w,h) { return (Math.round(w/unit*100)/100)+" \u00d7 "+(Math.round(h/unit*100)/100)+" "+o.units; };
    text = "A zip of one-page PDFs (1.pdf, 2.pdf, ...), one per card including repeats: "+size(o.cardwidth,o.cardheight)+" cut, "+size(layout.pagewidth,layout.pageheight)+" with bleed, 300 dpi.";
  } else if(layout.cols < 1 || layout.rows < 1) {
    text = "The cards don't fit on the page with these margins.";
  } else {
    text = layout.cols+" \u00d7 "+layout.rows+" = "+(layout.cols*layout.rows)+" cards per page";
    if((o.columns > layout.fitcols) || (o.rows > layout.fitrows)) {
      text += " (only "+layout.fitcols+" \u00d7 "+layout.fitrows+" fit)";
    }
    var right = layout.pagewidth - layout.x - layout.cols*o.cardwidth - (layout.cols-1)*o.spacing;
    var bottom = layout.pageheight - layout.y - layout.rows*o.cardheight - (layout.rows-1)*o.spacing;
    if(Math.min(layout.x, layout.y, right, bottom) < 0) {
      text += ". The offset pushes cards off the page.";
    }
  }
  $('#pdfsummary').text(text);
}
function pdfgenerate() {
  var o = pdfreadform();
  var layout = pdflayout(o);
  if(layout.cols < 1 || layout.rows < 1) {
    pdfsummary();
    return;
  }
  pdfoptions = o;
  nomodal();
  listinfo(pdfdialogstate.listid,false,'pdf,filename:'+pdfdialogstate.filename);
}
function pdfreset() {
  pdfdialogstate.units = null;
  pdfrender(pdfbaseoptions());
}
function pdfsavedefaults() {
  var o = pdfreadform();
  var previous = pdfsaveddefaults();
  var cardsizes = Object.assign({}, previous.cardsizes || {});
  var size = pdfgamecardsize();
  if(Math.abs(o.cardwidth - size[0]) < 0.01 && Math.abs(o.cardheight - size[1]) < 0.01) {
    delete cardsizes[database];
  } else {
    cardsizes[database] = [o.cardwidth, o.cardheight];
  }
  var saved = {'saved': new Date().toISOString(), 'cardsizes': cardsizes};
  Object.keys(pdfdefaults).forEach(function(k) { saved[k] = o[k]; });
  var user = cache_thing("user","data");
  var all = Object.assign({}, (user && ("oracle" in user) && user.oracle[0].settings && user.oracle[0].settings['all']) || {});
  all['pdf'] = saved;
  $('#pdfsaved').text("Saving...");
  $.ajax({
    type: 'GET',
    url: apiuri+"/user?database=all&settings="+encodeURIComponent(JSON.stringify(all)),
    contentType: 'application/json',
    dataType: 'json',
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
    responseType: 'application/json',
    success: function(data) {
      cache_thing("user","data",data);
      cache_session("pdfdefaults",saved);
      $('#pdfsaved').text("Saved as your defaults.");
      rendersettings();
    },
    error: function(error) {
      console.log("PDF defaults save failed: "+JSON.stringify(error));
      $('#pdfsaved').text("Couldn't save: "+((error.responseJSON && error.responseJSON.error) || error.statusText));
    }
  });
}

// MPC page image: the card at its cut size and 300 dpi, with the bleed added all round
function pdfmpcimage(card, o) {
  var dpi = 300/72;
  var cw = Math.round(o.cardwidth*dpi), ch = Math.round(o.cardheight*dpi), b = Math.round(o.bleed*dpi);
  var src = document.createElement('canvas');
  src.width = cw;
  src.height = ch;
  var sctx = src.getContext('2d');
  sctx.imageSmoothingQuality = 'high';
  sctx.drawImage(card, 0, 0, cw, ch);
  var fill = o.bleedfill;
  if(o.fixcorners && pdffixcorners(src) == 'lightframe' && fill == 'black') {
    fill = 'extend'; // black bleed round a white frame would show if the cut drifts
  }
  var out = document.createElement('canvas');
  out.width = cw + 2*b;
  out.height = ch + 2*b;
  var ctx = out.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, out.width, out.height);
  if(fill == 'extend' && b > 0) {
    // stretch the outermost row/column of pixels across the bleed, and the corner pixels into the corners
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, 0, 0, cw, 1, b, 0, cw, b);
    ctx.drawImage(src, 0, ch-1, cw, 1, b, ch+b, cw, b);
    ctx.drawImage(src, 0, 0, 1, ch, 0, b, b, ch);
    ctx.drawImage(src, cw-1, 0, 1, ch, cw+b, b, b, ch);
    ctx.drawImage(src, 0, 0, 1, 1, 0, 0, b, b);
    ctx.drawImage(src, cw-1, 0, 1, 1, cw+b, 0, b, b);
    ctx.drawImage(src, 0, ch-1, 1, 1, 0, ch+b, b, b);
    ctx.drawImage(src, cw-1, ch-1, 1, 1, cw+b, ch+b, b, b);
  }
  ctx.drawImage(src, b, b);
  return out.toDataURL('image/jpeg', 0.92);
}
// Scans have white rounded corners and sometimes white slivers along an edge. Paint the light
// pixels joined to the edge, within a band 4% of the card's width, with the card's edge colour.
// Cards with a light frame are left alone ('lightframe').
function pdffixcorners(canvas) {
  var w = canvas.width, h = canvas.height;
  var ctx = canvas.getContext('2d');
  var img = ctx.getImageData(0, 0, w, h);
  var d = img.data;
  var band = Math.max(4, Math.round(Math.min(w,h)*0.04));
  var light = function(i) { return d[i*4] > 170 && d[i*4+1] > 170 && d[i*4+2] > 170; };
  var inband = function(x,y) { return x < band || y < band || x >= w-band || y >= h-band; };
  // a light frame shows as light pixels along the line just inside the corners' reach
  var lit = 0, total = 0;
  for(var x = 2*band; x < w-2*band; x++) {
    lit += light(band*w+x) + light((h-1-band)*w+x);
    total += 2;
  }
  for(var y = 2*band; y < h-2*band; y++) {
    lit += light(y*w+band) + light(y*w+w-1-band);
    total += 2;
  }
  if(total == 0 || lit/total > 0.5) {
    return 'lightframe';
  }
  var mark = new Uint8Array(w*h);
  var stack = [];
  for(var x = 0; x < w; x++) { stack.push(x, (h-1)*w+x); }
  for(var y = 0; y < h; y++) { stack.push(y*w, y*w+w-1); }
  while(stack.length) {
    var i = stack.pop();
    if(mark[i] || !light(i)) { continue; }
    var x = i % w, y = (i - x)/w;
    if(!inband(x,y)) { continue; }
    mark[i] = 1;
    if(x > 0) { stack.push(i-1); }
    if(x < w-1) { stack.push(i+1); }
    if(y > 0) { stack.push(i-w); }
    if(y < h-1) { stack.push(i+w); }
  }
  // the edge colour: the average of the band's pixels that aren't white
  var sum = [0,0,0], n = 0;
  for(var y = 0; y < h; y++) {
    for(var x = 0; x < w; x++) {
      var i = y*w+x;
      if(!inband(x,y) || mark[i] || light(i)) { continue; }
      sum[0] += d[i*4]; sum[1] += d[i*4+1]; sum[2] += d[i*4+2]; n++;
    }
  }
  var fill = n ? sum.map(function(c) { return Math.round(c/n); }) : [0,0,0];
  var filllevel = (fill[0]+fill[1]+fill[2])/3;
  // the anti-aliased fringe round the white is grey: take the next pixel out, then up to two
  // more while they're clearly lighter than the edge colour
  var grow = mark.slice();
  for(var pass = 0; pass < 3; pass++) {
    var next = grow.slice();
    for(var i = 0; i < w*h; i++) {
      if(!grow[i]) { continue; }
      var x = i % w, y = (i - x)/w;
      [[x-1,y],[x+1,y],[x,y-1],[x,y+1]].forEach(function(q) {
        if(q[0] < 0 || q[1] < 0 || q[0] >= w || q[1] >= h || !inband(q[0],q[1])) { return; }
        var j = q[1]*w+q[0];
        if(!grow[j] && (pass == 0 || (d[j*4]+d[j*4+1]+d[j*4+2])/3 > filllevel + 40)) { next[j] = 1; }
      });
    }
    grow = next;
  }
  for(var i = 0; i < w*h; i++) {
    if(grow[i]) {
      d[i*4] = fill[0]; d[i*4+1] = fill[1]; d[i*4+2] = fill[2]; d[i*4+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return 'fixed';
}

function getDataUri(url, callback, landscape=false, finish=null) {
  // create a canvas for pdf images, set the source to the image url, return resulting data through callback
  // images are turned 90 degrees when they don't match the card cell's orientation
  // finish(canvas) makes the data URL (default: PNG of the canvas)
    var image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = function () {
      var canvas = document.createElement('canvas');
      if((this.naturalWidth > this.naturalHeight) == landscape || this.naturalWidth == this.naturalHeight) {
        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size
        ctx = canvas.getContext('2d');
        ctx.drawImage(this, 0, 0);
      } else {
        canvas.height = this.naturalWidth;
        canvas.width = this.naturalHeight;
        ctx = canvas.getContext('2d');
        ctx.save();
        ctx.translate(canvas.width/2,canvas.height/2);
        ctx.rotate(90*Math.PI/180);
        ctx.drawImage(this,-this.width/2,-this.height/2);
        ctx.restore();
      }
      callback(finish ? finish(canvas) : canvas.toDataURL('image/png'),url);
    };
    image.onerror = function() {
      callback(null,url);
    }
    image.src = url;  
}

function checkfilename(data) {
    return data.startsWith("filename:");
}
function createpdf(data,listoutput='') {
    var metadata = listoutput.split(",");
    var fn = metadata.find(checkfilename)?metadata.find(checkfilename).replace("filename:",''):"decklist";
    var o = pdfoptions || pdfbaseoptions();
    pdfoptions = null;
    if(!pdfallowed()) {
      alert("PDF printing isn't available for "+dbinfo[database].name+".");
      return;
    }
    var layout = pdflayout(o);
    if(layout.cols < 1 || layout.rows < 1) {
      alert("The cards don't fit on the page with these margins.");
      return;
    }
    console.log(['createpdf',o,layout,data]);
    if(o.sort != 'list') {
      var gamesort = databasesort[database] || {};
      data = data.slice().sort(gamesort[o.sort] != undefined ? gamesort[o.sort] : pdftitlesort);
    }
    // MPC prints at 300 dpi: the _master scans (~750 x 1050) instead of _details (600px long side)
    var size = (o.layout == 'mpc') ? 'master' : 'details';
    var newurl = function(p,i) { return dbinfo[database].imageuri+p.imagehash+'/'+(i[size] || i.details)+'?x-corsworkaround=true'; };
    var images = [];
    for(card of data) {
      var copies = (o.quantity == 'spoiler') ? 1 : card.listquantity;
      for(p of (card.printing || [])) {
        if(p.printingid == ((card.listprinting>0)?card.listprinting:card.printingprimary)) {
          if(p.image) {
              for(cn = 0; cn < copies; cn++) {
                if(p.doublesided) {
  	              for(i of p.image) {  // NEW STYLE
                    images.push(newurl(p,i));
                  }
                } else {
                  images.push(newurl(p,p.image[0]));
                }
              }
          } else if(p.images && p.images.length) {
            for(cn = 0; cn < copies; cn++) {
              if(p.doublesided) {
                for(i of p.images) {  // OLD STYLE:  as soon as all games get updated, you can remove this and the code above mentioning printimagehash
                  images.push(i+size+'.jpg?x-corsworkaround=true'); 
                }
              } else {
                images.push(p.images[0]+size+'.jpg?x-corsworkaround=true');
              }
            }
	        }
        }
      }
    }
    console.log(images);

    // images load asynchronously and finish in any order, so keep each one's data by URL
    // and lay out the pages from `images`, which is in list order. Each URL loads once.
    var urls = images.filter(function(url,i) { return images.indexOf(url) == i; });
    var imagedata = {};
    var imagefailed = [];
    var loaded = 0;
    if(urls.length == 0) {
      alert("No card images to print in this list.");
      return;
    }
    var perpage = layout.cols*layout.rows;
    for(image of urls) {
	    getDataUri(image,function(data,url) {
        if(data) {
  	      imagedata[url] = data;
        } else {
          imagefailed.push(url);
        }
        loaded++;
	      if(loaded == urls.length) {
          var pages = images.filter(function(url) { return imagedata[url]; });
          if(imagefailed.length>0) {
            console.log("Failed"+JSON.stringify(imagefailed));
            alert("Failed to load some images:"+JSON.stringify(imagefailed));
          }
          if(o.layout == 'mpc') {
            pdfmpczip(pages.map(function(url) { return imagedata[url]; }), layout, fn);
            return;
          }
		      const doc = new PDFDocument({
		        "size": [layout.pagewidth, layout.pageheight],
		        margins: { top: 0, bottom: 0, left: 0, right: 0 }
		      });
		      doc.info['Title'] = fn;
		      const stream = doc.pipe(blobStream());
		      for(var i=0 ; i < pages.length; i++) {
              var slot = i % perpage;
              doc.image(imagedata[pages[i]],
                        layout.x + (slot % layout.cols)*(o.cardwidth + o.spacing),
                        layout.y + Math.floor(slot / layout.cols)*(o.cardheight + o.spacing),
                        {fit: [ o.cardwidth, o.cardheight ], align: 'center', valign: 'center'});
              if(slot == perpage-1 && (i<pages.length -1)) {
                doc.addPage();
              }
		      }
		      doc.end();
		      stream.on('finish', function() {
		        data_url_to_download(stream.toBlobURL('application/pdf'),fn+".pdf");
		      });
	      }
	    }, o.cardwidth > o.cardheight, (o.layout == 'mpc') ? function(canvas) { return pdfmpcimage(canvas, o); } : null);
    }
}
// MakePlayingCards wants a separate one-page PDF per card, repeats included, named 1.pdf, 2.pdf, ...
// in list order. Build them one at a time and download them together as a zip.
function pdfmpczip(pages, layout, fn) {
  var files = [];
  var next = function(i) {
    if(i == pages.length) {
      data_url_to_download(URL.createObjectURL(pdfzip(files)), fn+".zip");
      return;
    }
    const doc = new PDFDocument({
      "size": [layout.pagewidth, layout.pageheight],
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });
    doc.info['Title'] = fn+" "+(i+1);
    const stream = doc.pipe(blobStream());
    doc.image(pages[i], 0, 0, {width: layout.pagewidth, height: layout.pageheight});
    doc.end();
    stream.on('finish', function() {
      stream.toBlob('application/pdf').arrayBuffer().then(function(buffer) {
        files.push({'name': (i+1)+".pdf", 'data': new Uint8Array(buffer)});
        next(i+1);
      });
    });
  };
  next(0);
}
// a zip of [{name, data: Uint8Array}], stored without compression (the PDFs hold JPEGs already)
var pdfcrctable = null;
function pdfcrc32(data) {
  if(!pdfcrctable) {
    pdfcrctable = new Uint32Array(256);
    for(var n = 0; n < 256; n++) {
      var c = n;
      for(var k = 0; k < 8; k++) { c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); }
      pdfcrctable[n] = c >>> 0;
    }
  }
  var crc = 0xFFFFFFFF;
  for(var i = 0; i < data.length; i++) { crc = pdfcrctable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8); }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function pdfzip(files) {
  var parts = [], central = [], offset = 0;
  var now = new Date();
  var time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  var date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  files.forEach(function(f) {
    var name = new TextEncoder().encode(f.name);
    var crc = pdfcrc32(f.data);
    var local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true); local.setUint16(4, 20, true); local.setUint16(6, 0, true);
    local.setUint16(8, 0, true); local.setUint16(10, time, true); local.setUint16(12, date, true);
    local.setUint32(14, crc, true); local.setUint32(18, f.data.length, true); local.setUint32(22, f.data.length, true);
    local.setUint16(26, name.length, true); local.setUint16(28, 0, true);
    var entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true); entry.setUint16(4, 20, true); entry.setUint16(6, 20, true);
    entry.setUint16(8, 0, true); entry.setUint16(10, 0, true); entry.setUint16(12, time, true); entry.setUint16(14, date, true);
    entry.setUint32(16, crc, true); entry.setUint32(20, f.data.length, true); entry.setUint32(24, f.data.length, true);
    entry.setUint16(28, name.length, true); entry.setUint16(30, 0, true); entry.setUint16(32, 0, true);
    entry.setUint16(34, 0, true); entry.setUint16(36, 0, true); entry.setUint32(38, 0, true); entry.setUint32(42, offset, true);
    parts.push(local, name, f.data);
    central.push(entry, name);
    offset += 30 + name.length + f.data.length;
  });
  var size = central.reduce(function(t, c) { return t + c.byteLength; }, 0);
  var end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, size, true); end.setUint32(16, offset, true);
  return new Blob(parts.concat(central, [end]), {type: 'application/zip'});
}
function data_url_to_download(data_url, filename) {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none;";
  a.href = data_url;
  a.download = filename;
  a.click();
  a.remove();
};

// If a list is being displayed, render card and switch to it, pop onto history so back comes back to the list
// If a card is being displayed, render new card, and replace state on history, so back still goes back to the list
// prid = printingid.   Note: This should only happen on a page load, otherwise javascript handles switches
// switchview=false renders the card view behind the scenes: no history entry, the view on screen stays
function docard(carddata,prid=null,qs=null,pop=false,switchview=true) {
  var carddata = JSON.parse(JSON.stringify(carddata));
  console.log(["rendering: "+carddata['cardid']+(prid?'/'+prid:''),qs]);
  if(getactivetemplate('card') === undefined) {
	  console.log("templates not loaded yet");
	  return;
  }
  $("#lastcardid").val(carddata.cardid).data({prid: prid, qs: qs});
  var drawn = cardhtml(carddata,prid,qs);
  var shown = drawn.shown;
  $("#resultcard").html(drawn.html);
  updates[database]('#resultcard');
  var primary = $("#printingprimary").val();
  // Show the printing the link asked for (versioned search links carry it), else the one qs matched, else the primary
  var defpr = prid ? null : templatefetch(carddata,false,qs ? $.deparam(qs) : {})["printingid"];
  var showpr = prid?prid:((defpr>0)?defpr:primary);
  $(".printing:not([data-printingid="+showpr+"])").hide();
  $("#lastprintid").val(showpr).data("chosen", !!shown.textprinting);

  if(!switchview) {
	  return;
  }
  // the url: a new entry from another view, the same one when the card view redraws (prev/next)
  showcard();
}

// the Card Details html for a card, {html, shown}: docard, and the Admin set import's card preview
// (it linkifies carddata in place, as docard always did before picking the printing to show)
function cardhtml(carddata,prid=null,qs=null) {
  var tmpl = {
	  "labels": labels[database],
	  "qs": qs,
	  "activelists": activelists.map(function(listid) {
	    var list=cache_thing("list","data").lists.Items[cache_thing("list","datareverse")[listid]];
	    if(cache_thing("list",listid)) {
		    list.listdata = cache_thing("list",listid);
	    }
	    return list;
	  }),
	  "database": database,
    "dbinfo": dbinfo[database],
    "groups": (cache_thing("user","data") && ("oracle" in cache_thing("user","data")) && ("groups" in cache_thing("user","data").oracle[0])) ?
      cache_thing("user","data").oracle[0].groups : {}
  };
  if(carddata.updatelog) {
    carddata['updatelogformatted'] = carddata.updatelog.reverse().map(function(ul){
      var ret = {};
      if(ul.newdata) {
        ret['newdata'] = JSON.stringify(ul.newdata);
      }
      if(ul.olddata) {
        ret['olddata'] = JSON.stringify(ul.olddata);
      }
      ret['op'] = ul.op;
      ret['uname'] = ul.uname;
      ret['timestamp'] = new Date(ul.timestamp).toLocaleString();
      return ret;
    });
  }
  for (key in searchables[database]) {
    if(searchables[database][key].clickable || key == "printing.set" || key == "printing.rarity") {
      var keys = false;
      if(key.includes('.')) {
        keys = key.split('.');
      }
      if(searchables[database][key].clickable !== true) {
        keys = [searchables[database][key].clickable,key];
      }
      if(key == "printing.set" || key == "printing.rarity") {
        keys = ["printing",key.replace('printing.','')];
      }
      if(keys.length>0) {
        //console.log([key,'^2',keys[0],keys[1]]);
        for (let i=0;i<carddata[keys[0]].length;i++) {
          //console.log(i);
          if(carddata[keys[0]][i][keys[1]]) {
            if(keys[1].match(/^(set|rarity)$/)) {
              carddata[keys[0]][i][keys[1]+'clean'] = carddata[keys[0]][i][keys[1]];
            } 
            // if you get an error here, you didn't put something in an array
            carddata[keys[0]][i][keys[1]] = carddata[keys[0]][i][keys[1]].map(function(x){return process_keywordlink(x,key,searchables[database][key].type);});
          }
        }
      } else {
        if(carddata[key]) {
          // Done:  onyx   linkify printings as well
          //console.log(["linkifying",key]);
          carddata[key] = carddata[key].map(function(x){
            //console.log([x,key,searchables[database][key].type]);
            return process_keywordlink(x,key,searchables[database][key].type,carddata.title);
          });
          for (let i=0;i<carddata.printing.length;i++) {
            //console.log(i);
            if(carddata.printing[i][key]) {
              carddata.printing[i][key] = carddata.printing[i][key].map(function(x){return process_keywordlink(x,key,searchables[database][key].type,carddata.title);});
            }
          }
        }
      }
    }
  }
  var override = getactivetemplateoverride('card');
  for ( v in override.var?override.var:{}) {
    tmpl[v] = override.var[v];
  }
  // TODO onyx: do something similar to 1578 here.  bring top values up from bottom
  //   note: might muck with editing, so care is needed
	console.log(["rendering card",tmpl,carddata]);
  var shown = markprinteddiffs(bubbleup([carddata],qs,prid))[0];
  return {"html": getactivetemplate('card').render(shown,tmpl), "shown": shown};
}

function bubbleup(data,request=null,prid=null) {
  // KEEP IN SYNC: a new way of picking the version shown also needs searchaddallversioned (search "Add all to list")
  // Lays one printing's fields over the card's, so the card shows that printing: prid (the card view's
  // version), else the list's printing (listprinting), else the one a reverse field in the request
  // matched (field_printing_<att>, field_<att>, require_*: see templatefetch). Other cards come back as
  // they are. With textversionnow() 'mrp' only the printing's own fields come up (set, rarity,
  // printingid, ...), not the ones the card has too, so the card's (MRP) wording shows. A card a printing
  // was picked for gets textprinting (its printingid, so #template-textversion shows the Showing: button),
  // textversion, and textdiff: the fields whose wording differs between the printing and the card (what
  // the button flips; empty: "No printing fields found"). markprinteddiffs highlights them in printed mode.
  // note: expects array of cards - for a single card send array of one, and deref
  if(request == null) { request = {}; }
  if(typeof request === "string") {
    request = $.deparam(request);
  }
  var bubblekill = [""];
  for (key in searchables[database]) {
    if (
      typeof searchables[database][key] === "object" &&
      "nobubbleup" in searchables[database][key]
    ) {
      bubblekill.push(key);
    }
  }
  const bkillre = new RegExp("^(" + bubblekill.join("|") + ")$");
  // fields a printing and its card can differ in that aren't wording
  const nodiff = ["imagehash", "image", "images", "printimagehash", "printingid", "printing", "printingreverse"];
  const requirerev = Object.keys(request).some(function(k) { return k.startsWith("require_"); });
  const mode = textversionnow();
  return data.map(function(card) {
    // list headers and deleted cards have no printings
    if (!card || !card.printingreverse || !Array.isArray(card.printing)) {
      return card;
    }
    var hasrev = prid || card.listprinting > 0 || requirerev ||
        Object.keys(card.printingreverse).some(function(key) {
          return (("field_printing_"+key) in request) || (("field_"+key) in request);
        });
    if (!hasrev) {
      return card;
    }
    var matchedpr = templatefetch(card, prid ? prid : false, request);
    if (!(matchedpr && matchedpr["printingid"] > 0)) {
      return card;
    }
    var shown = structuredClone(card);
    const mkeys = Object.keys(matchedpr).filter(
      (key) => !key.match(bkillre)
    );
    shown.textdiff = mkeys.filter(function (key) {
      return (key in card) && !nodiff.includes(key) && JSON.stringify(card[key]) !== JSON.stringify(matchedpr[key]);
    });
    mkeys.forEach(function (key) {
      if (mode == 'mrp' && (key in card)) {
        return;
      }
      shown[key] = matchedpr[key];
    });
    shown.textprinting = matchedpr["printingid"];
    shown.textversion = mode;
    return shown;
  });
}

// Showing the printed wording: wrap each field in textdiff (from bubbleup), the ones that differ from the
// card's, in span.printeddiff, a subtle highlight in the Printed text button's color. The MRP wording
// isn't highlighted. Run it last, right before rendering: list headers group on the plain values. The class
// is unquoted so a wrapped value can still sit inside a quoted attribute or an onclick string.
function markprinteddiffs(data) {
  var mark = function(v) {
    return (typeof v === "string" && v !== "") || typeof v === "number" ? '<span class=printeddiff>'+v+'</span>' : v;
  };
  return data.map(function(card) {
    if (!card || card.textversion == 'mrp' || !Array.isArray(card.textdiff) || !card.textdiff.length) {
      return card;
    }
    card.textdiff.forEach(function(key) {
      card[key] = Array.isArray(card[key]) ? card[key].map(mark) : mark(card[key]);
    });
    return card;
  });
}

// ******************** PRINTED / MRP TEXT ********************
// Which wording a card shows when one printing of it is picked (bubbleup): 'printed', that printing's
// own text, or 'mrp', the card's current text. The Showing: button flips it for the open session
// (sessionStorage: it lasts through reloads in this tab, not into a new one); a new session starts from
// the user's settings.all.textversion, else printed.
function textversionnow() {
  try {
    var now = window.sessionStorage.getItem("textversion");
    if(now == 'printed' || now == 'mrp') {
      return now;
    }
  } catch(e) {}
  return savedtextversion();
}
function savedtextversion() {
  var user = cache_thing("user","data");
  var all = user && ("oracle" in user) && user.oracle[0].settings && user.oracle[0].settings['all'];
  return (all && all['textversion'] == 'mrp') ? 'mrp' : 'printed';
}
function toggletextversion(el) {
  var next = (textversionnow() == 'mrp') ? 'printed' : 'mrp';
  try {
    window.sessionStorage.setItem("textversion", next);
  } catch(e) {}
  redrawtextversion();
}
// The search results' one Showing: button (menubar on desktop, #phonetextversion on phones), on every search:
// it offers the toggle when any result loaded so far shows a picked printing that differs in wording.
function searchtextversion(qs) {
  var ids = (qs && searchcache[database]['querydata'][qs]) || [];
  var request = $.extend(true, {}, searchcache[database]['queryrequest'][qs] || $.deparam(qs || ''));
  pagetextversion('.searchtextversion', bubbleup(ids.map(cache_card_fetch), request), 'search');
}
// a page's one Showing: button (kind: 'search' results or 'list' view) into the elements matching sel, from
// its cards as bubbleup returned them: "MRP text" when no card shows a picked printing
function pagetextversion(sel,shown,kind) {
  var page = {'textprinting': shown.some(function(c) { return c && c.textprinting; }),
              'textdiff': shown.some(function(c) { return c && c.textdiff && c.textdiff.length; }) ? [true] : [],
              'textversion': textversionnow()};
  $(sel).html($.templates("#template-textversionbutton").render(page, {'page': kind}));
}
// a click on a Showing: button with nothing to flip: its title as a balloon under it for a moment (touch too)
function textversionnotip(el) {
  var tip = $(el);
  var text = tip.attr('title') || tip.data('notiptitle');
  clearTimeout(tip.data('notiptimer'));
  tip.data('notiptitle', text).removeAttr('title'); // no native tooltip on top of it
  tip.attr({'aria-label': text, 'data-balloon-pos': 'down-left', 'data-balloon-length': 'large', 'data-balloon-visible': ''});
  tip.data('notiptimer', setTimeout(function() {
    tip.removeAttr('aria-label data-balloon-pos data-balloon-length data-balloon-visible').attr('title', tip.data('notiptitle'));
  }, 2500));
}
// re-render what shows card text in place: the search results and card view (refreshactivelistviews
// keeps the scroll) and the list view
function redrawtextversion() {
  refreshactivelistviews();
  var listid = $('#lastlistid').val();
  if(listid && cache_thing("list",listid)) {
    var scrolled = [window, '#maincontent', '#resultlist'].map(function(el) { return [el, $(el).scrollTop()]; });
    renderlist(cache_thing("list",listid).list.Items[0],false);
    scrolled.forEach(function(s) { $(s[0]).scrollTop(s[1]); });
  }
}
// the printing to redraw the card view with: the one shown, when it was picked (a version, the list's
// printing, a search on a printing field), or null when the card view shows the card's primary printing
function lastcardprid() {
  return ($("#lastprintid").val() && $("#lastprintid").data("chosen")) ? $("#lastprintid").val() : null;
}

// title: the card's title, for keywords that link to other versions of the card (see keywordtitle)
function process_keywordlink(data,fieldname,type,title=null) {
  fieldname = fieldname.replace('.','_');
  var cleandata = data.replace(new RegExp("<[^<]+>","g"),"");
  var findtitle = fieldname == 'keywords' && keywordtitle(cleandata,title);
  if(findtitle) {
    fieldname = 'title';
    type = searchables[database]['title'].type;
    cleandata = findtitle;
  }
  return '<a href="" id="'+
    '#search='+
    encodeURIComponent(
      'table='+database+'&type_'+ 
        fieldname+'='+type+'&field_'+
        fieldname+'='+encodeURIComponent(cleandata)
    )+
    '" onclick="window.location.hash=this.id; return false;">'+data+'</a>';
}
// the title a keyword links to instead of a keyword search, or null:
//   Soul of <name> [Experienced [n]]  -> <name>, the card it's the soul of
//   [In]experienced [n] <name>        -> <name>, the card it's a version of
//   [In]experienced [n]               -> this card's title up to a comma or bullet (n may be 2, 3.5, 2KYD, 2CW)
function keywordtitle(keyword,title) {
  keyword = keyword.replace(/&nbsp;/g,' ').trim();
  var soul = keyword.match(/^Soul\s+of\s+(.+?)(?:\s+(?:In)?[Ee]xperienced\b.*)?$/i);
  if(soul) {
    return soul[1];
  }
  var exp = keyword.match(/^(?:Inexperienced|Experienced)(?:\s+\d+(?:\.\d+)?[A-Z]*)?(?:\s+(.+))?$/);
  if(!exp) {
    return null;
  }
  if(exp[1]) {
    return exp[1];
  }
  title = [].concat(title || [])[0];
  return title ? String(title).replace(new RegExp("<[^<]+>","g"),"").replace(/&nbsp;/g,' ').replace(/(,|\u2022|&bull;).*/,'').trim() || null : null;
}

// Populate loads qs data back into the form for searching on
function populate(frm, data) {
    $.each(data, function(key, value) {
        var ctrl = $('[name='+key+']', frm);
        switch(ctrl.prop("type")) {
            case "radio": case "checkbox":
                ctrl.each(function() {
                    if($(this).attr('value') == value) $(this).attr("checked",value);
                });
                break;
            default:
                ctrl.val(value);
        }
    });
}

function rendercards(data,request,querystring) {
//    return searchtemplate[database].render(data,{"labels": labels[database], "datarequest": request, "qs": querystring});
/*    console.log(activelists.map(function(listid) {
	    var list=cache_thing("list","data").lists.Items[cache_thing("list","datareverse")[listid]];
	    if(cache_thing("list",listid)) {
		list.listdata = cache_thing("list",listid);
	    }
	    return list;
	})); */
  console.log(["rendercards",data,request,querystring]);
  var tmpl={
	    "labels": labels[database],
	    "datarequest": request,
	    "qs": querystring,
	    "activelists":activelists.map(function(listid) {
	      var list=cache_thing("list","data").lists.Items[cache_thing("list","datareverse")[listid]];
	      if(cache_thing("list",listid)) {
		      list.listdata = cache_thing("list",listid);
	      }
	      return list;
	    }),
	    "database": database
  };
  var override = getactivetemplateoverride('search');
  for ( v in override.var?override.var:{}) {
    tmpl[v] = override.var[v];
  }
  return getactivetemplate('search').render(markprinteddiffs(bubbleup(data,request)),tmpl);
}


// ******************** PAGING HELPERS ********************
// how many of a search's results can be paged through (the API stops at searchwindow)
function searchpageable(qs) {
    return Math.min(searchcache[database]['querytotal'][qs], searchwindow);
}

// sets up "MORE" and numresultsearchs...   both cached and non-cached searches use it
function dosearchpostcallback(qs) {
    searchtextversion(qs);
    searchaddall(qs);
    if(!$('.error').length) {
	if(searchcache[database]['querydata'][qs].length < searchpageable(qs)) {
	    $("#resultsearch").append('<a href="" onclick="scrollforceload(); return false;">'+searcherror['more']+'</a>');
	} else if(searchcache[database]['querytotal'][qs] > searchwindow) {
	    $("#resultsearch").append(searcherror['window']);
	}
	//	if(!$('.numresults').length) {
	$(".numresults").html(searcherror['numresults'].replace('XXX',searchcache[database]['querytotal'][qs]));
	//	}
    }
}

// a new search puts its first result in the card view, as if it had been clicked (without leaving the search view)
function defaultcard(qs) {
    var ids = searchcache[database]['querydata'][qs];
    if(ids && ids.length) {
	docardid(ids[0],null,qs,false,false);
    }
}
// Touch screens: menubar (and list download) dropdowns open on hover only with a mouse, so a tap toggles them instead.
// Tapping a menu header opens its dropdown (closing other open menus outside it); tapping an item or anywhere else closes them.
var lastpointertype = 'mouse';
$(document).on('pointerdown', function(e) {
    lastpointertype = e.originalEvent.pointerType || 'mouse';
});
$(document).on('click', function(e) {
    if(lastpointertype == 'mouse') {
	return;
    }
    menutap(e.target);
    $(e.target).closest('[data-balloon-pos]').trigger('blur'); // a tap leaves :focus behind
});
// touch: tooltips are hidden (CSS, hover: none) except after a long-press on the button, for 1.5 s
var balloonpress = null;
$(document).on('pointerdown', '[data-balloon-pos]', function(e) {
    if(e.originalEvent.pointerType == 'mouse' || !gestureon('tooltip')) {
	return;
    }
    var balloon = $(this);
    clearTimeout(balloonpress);
    balloonpress = setTimeout(function() {
	balloon.attr('data-balloon-visible', ''); // balloon.css shows it without :hover
	clearTimeout(balloon.data('balloontimer'));
	balloon.data('balloontimer', setTimeout(function() { balloon.removeAttr('data-balloon-visible'); }, 1500));
    }, 500);
});
$(document).on('pointerup pointercancel pointerleave', '[data-balloon-pos]', function() {
    clearTimeout(balloonpress);
});
$(document).on('contextmenu', '[data-balloon-pos]', function(e) {
    if(lastpointertype != 'mouse' && gestureon('tooltip')) {
	e.preventDefault(); // Android's long-press menu would cover the label
    }
});
// Card images and Simple List titles (a.deckswipe) in search results and the deck/list view (all formats):
// swipe (touch) or click-drag (mouse) to change the card's count. What each direction does is a setting per view
// (swipedefaults: search right +1, left -1, up-right +3; deck/list right +1, left -1, up-right +2; both
// up-left all copies). Going to 0 asks before removing the card. In the list view it changes the list shown; in
// search, the first active list. With none active (logged in), a swipe that adds asks which list to activate
// (deckswipepicklist); other swipes do nothing. On touch, a mostly vertical drag still scrolls.
var deckswipe = null;
var deckswipedone = 0;
function deckswipestart(target, x, y, mouse=false) {
    var a = $(target).closest('a.deckswipe');
    var listid = a.length ? (a.data('list') || activelists[0]) : null;
    deckswipe = null;
    if(a.data('list') && !listmine(String(a.data('list')))) {
	return false;   // someone else's shared deck: read only
    }
    if(listid || (a.length && searchloggedin() && cache_thing("list","data"))) {
	var g = gesturesettings();
	var acts = g[a.data('list') ? 'list' : 'search'];
	var any = Object.keys(acts).some(function(d) { return acts[d][0] != 'off'; });
	if(any && g['off'].indexOf(mouse ? 'deckswipemouse' : 'deckswipetouch') < 0) {
	    deckswipe = {a: a, listid: listid ? String(listid) : null, acts: acts, x: x, y: y, lock: null};
	}
    }
    return !!deckswipe;
}
// returns true while the drag is a swipe (the caller then blocks scrolling)
function deckswipemove(x, y) {
    if(!deckswipe) {
	return false;
    }
    var dx = x - deckswipe.x, dy = y - deckswipe.y;
    if(deckswipe.lock === null && Math.hypot(dx,dy) > 12) {
	// sideways or diagonally up is a swipe; up, down or diagonally down scrolls
	deckswipe.lock = Math.abs(dx) >= 0.5*Math.abs(dy) && !(dy > 0 && Math.abs(dx) < 2*dy);
    }
    if(deckswipe.lock === false) {
	deckswipe = null;
    }
    return !!(deckswipe && deckswipe.lock);
}
function deckswipeend(x, y) {
    var s = deckswipe;
    deckswipe = null;
    if(!(s && s.lock)) {
	return;
    }
    var dx = x - s.x, dy = y - s.y;
    if(Math.hypot(dx,dy) < 50) {
	return;
    }
    deckswipedone = Date.now();  // a swipe, even one that changes nothing, mustn't open the card
    var angle = Math.atan2(-dy,dx) * 180 / Math.PI;   // 0 = right, 90 = up, 180 = left
    var dir = (Math.abs(angle) <= 30) ? 'right' : (angle > 30 && angle <= 65) ? 'upright' :
	(Math.abs(angle) >= 150) ? 'left' : (angle >= 115 && angle < 150) ? 'upleft' : null;
    if(dir && s.acts[dir][0] != 'off' && !s.listid) {
	if(s.acts[dir][0] == 'add' || s.acts[dir][0] == 'set') {
	    deckswipepicklist(s.a.data('card'), s.a.data('printing') || 0, s.acts[dir]);
	}
    } else if(dir && s.acts[dir][0] != 'off') {
	deckswipeapply(s.listid, s.a.data('card'), s.a.data('printing') || 0, s.acts[dir], !s.a.data('list') && activelists.length > 1);
    }
}
document.addEventListener('touchstart', function(e) {
    if(e.touches.length == 1) {
	deckswipestart(e.target, e.touches[0].clientX, e.touches[0].clientY);
    } else {
	deckswipe = null;
    }
}, {passive: true});
document.addEventListener('touchmove', function(e) {
    if(deckswipemove(e.touches[0].clientX, e.touches[0].clientY) && e.cancelable) {
	e.preventDefault();
    }
}, {passive: false});
document.addEventListener('touchcancel', function() { deckswipe = null; });
document.addEventListener('touchend', function(e) {
    deckswipeend(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
});
// mouse: the left button only. Blocking mousedown stops the browser's own image/link drag and text selection.
var deckmousedown = null;
document.addEventListener('mousedown', function(e) {
    deckmousedown = null;
    if(e.button == 0 && !e.metaKey && !e.ctrlKey && deckswipestart(e.target, e.clientX, e.clientY, true)) {
	deckmousedown = {x: e.clientX, y: e.clientY};
	e.preventDefault();
    }
});
document.addEventListener('mousemove', function(e) {
    if(deckswipe && !(e.buttons & 1)) {   // released outside the window
	deckswipe = null;
    }
    deckswipemove(e.clientX, e.clientY);
});
document.addEventListener('mouseup', function(e) {
    if(e.button == 0) {
	if(deckmousedown && Math.hypot(e.clientX - deckmousedown.x, e.clientY - deckmousedown.y) > 12) {
	    deckswipedone = Date.now();  // any drag, swipe or not, isn't a click on the card
	}
	deckmousedown = null;
	deckswipeend(e.clientX, e.clientY);
    }
});
document.addEventListener('dragstart', function(e) {
    if($(e.target).closest('a.deckswipe').length && gestureon('deckswipemouse')) {
	e.preventDefault();
    }
});
// the click that ends a swipe mustn't open the card
document.addEventListener('click', function(e) {
    if(Date.now() - deckswipedone < 500 && $(e.target).closest('a.deckswipe').length) {
	e.preventDefault();
	e.stopPropagation();
    }
}, true);
// act: [action, count] from swipeactions. named: say which list changed (search with more than one active list)
function deckswipeapply(listid, cardid, prid, act, named=false) {
    var have = Number(listquantity(listid, cardid, prid)) || 0;
    var card = cache_card_fetch(cardid);
    var title = card ? [].concat(card.title).join() : 'card #' + cardid;
    if(named) {
	var lists = cache_thing("list","data").lists.Items;
	title += ' \u2192 ' + lists[cache_thing("list","datareverse")[listid]].name;
    }
    var n = {'add': act[1], 'sub': -act[1], 'set': act[1] - have, 'zero': -have}[act[0]] || 0;
    if(n == 0 || (have == 0 && n < 0)) {
	deckswipetoast(title + ' (' + have + ')');
	return;
    }
    if(have + n <= 0) {
	if(!confirm('Remove ' + $('<div>').html(title).text() + ' (' + have + ') from the list?')) {
	    return;
	}
	addlistitem(listid, cardid, prid, null);
	deckswipetoast('Removed ' + title);
    } else {
	addlistitem(listid, cardid, prid, n);
	deckswipetoast((n > 0 ? '+' : '\u2212') + Math.abs(n) + ' ' + title + ' (' + (have + n) + ')');
    }
}
// an adding swipe in search with no active list: pick a list, activate it, then add the card.
// The picker is a folder tree: folders first (by name, collapsed; a click opens or closes one), then lists (newest modified first).
var deckswipepending = null;
function deckswipepicklist(cardid, prid, act) {
    deckswipepending = {cardid: cardid, prid: prid, act: act};
    var card = cache_card_fetch(cardid);
    var title = card ? [].concat(card.title).join() : 'card #' + cardid;
    modal('Add ' + title + ' to which list?',
	'<p>No list is active. Pick one to activate and add the card to:</p><ul class="swipepicklist">' +
	'<li class="swipepicklistitem" onclick="newlist(null, deckswipepicked);"><svg class="feather"><use xlink:href="res/feather-sprite.svg#plus-circle"></svg> New list</li>' +
	deckswipepicktree(listpickroot()) + '</ul>');
}
// the user's lists as a folder tree for deckswipepicktree: {folders: {name: node}, lists: [newest modified first]}
function listpickroot() {
    var lists = cache_thing("list","data").lists.Items.slice().sort(function(a,b) { return dirsortkey(b,'modified') - dirsortkey(a,'modified'); });
    var root = {folders: {}, lists: []};
    lists.forEach(function(list) {
	var node = root;
	listfolder(list).split('/').filter(function(f) { return f; }).forEach(function(f) {
	    node = node.folders[f] = node.folders[f] || {folders: {}, lists: []};
	});
	node.lists.push(list);
    });
    return root;
}
// pick: the function a click on a list calls with its listid
function deckswipepicktree(node, pick='deckswipepicked') {
    var esc = function(t) { return $('<div>').text(t).html(); };
    return Object.keys(node.folders).sort(foldercmp).map(function(f) {
	var sub = node.folders[f];
	return '<li class="swipepickfolder"><div class="swipepicklistitem" onclick="$(this).parent().toggleClass(\'open\');">' +
	    '<svg class="feather swipepickchevron"><use xlink:href="res/feather-sprite.svg#chevron-right"></svg>' +
	    '<svg class="feather"><use xlink:href="res/feather-sprite.svg#folder"></svg> ' + esc(f) + '</div>' +
	    '<ul>' + deckswipepicktree(sub, pick) + '</ul></li>';
    }).join('') + node.lists.map(function(list) {
	return listpickitem(list, pick);
    }).join('');
}
function listpickitem(list, pick) {
    var esc = function(t) { return $('<div>').text(t).html(); };
    return '<li class="swipepicklistitem" onclick="' + pick + '(\'' + list.listid + '\');">' + esc(list.name || list.listid) +
	(list.type ? ' <span class="swipepickwhere">' + esc(list.type) + '</span>' : '') + '</li>';
}
function deckswipepicked(listid) {
    var p = deckswipepending;
    deckswipepending = null;
    nomodal();
    if(p) {
	activatelist(String(listid), function() { deckswipeapply(String(listid), p.cardid, p.prid, p.act); });
    }
}
// Search results' "Add all to list" (#201): beside the Showing: button (menubar; #phonetextversion on phones), when
// logged in. Up to dbinfo[database].addallmax cards (15% over the game's largest set, so a whole set fits); past it
// the button explains why not. Each card goes in with the version its result shows, the printing its + button adds.
function searchaddall(qs) {
    var total = (qs && searchcache[database]['querytotal'][qs]) || 0;
    var max = searchaddallmax();
    var html = '';
    if(total > 0 && searchloggedin() && cache_thing("list","data")) {
	if(total <= max) {
	    html = '<button type="button" class="button gray buttonsmaller" title="Add every card this search found to a list" onclick="searchaddallpick(); return false;">Add all ' + total.toLocaleString() + ' to list</button>';
	} else {
	    html = '<span class="button gray buttonsmaller textversionnone" title="Add all to list takes up to ' + max.toLocaleString() + ' cards (a whole set fits). Narrow the search to add these." onclick="textversionnotip(this);">Add all: too many</span>';
	}
    }
    $('.searchaddall').html(html);
}
function searchaddallmax() {
    return (dbinfo[database] && dbinfo[database].addallmax) || 500;
}
// the search fields that pick a version of a card: with none of them in the search, the cards go in without a version.
// KEEP IN SYNC with the version-picking code: the "reverse" searchables in templates/<game>.js, bubbleup and
// templatefetch. A new field that changes the version shown goes here too.
const searchaddallversioned = ['set', 'rarity', 'publisher', 'legality', 'artist'];
function searchaddallversion(request) {
    return Object.keys(request).some(function(key) {
	var m = key.match(/^(?:field|require)_(?:printing_)?(.*)$/);
	return m && searchaddallversioned.includes(m[1]) && [].concat(request[key]).some(function(v) { return v !== ''; });
    });
}
// which list, and how many copies of each card: the active lists first, then every list by folder
function searchaddallpick() {
    var qs = $('#lastsearchquery').val();
    var total = searchcache[database]['querytotal'][qs];
    var rev = cache_thing("list","datareverse") || {};
    var items = cache_thing("list","data").lists.Items;
    var active = activelists.filter(function(listid) { return rev.hasOwnProperty(listid); }).map(function(listid) { return items[rev[listid]]; });
    var request = searchcache[database]['queryrequest'][qs] || $.deparam(qs);
    modal('Add all ' + total.toLocaleString() + ' cards to which list?',
	'<p>' + (searchaddallversion(request) ? 'Each card goes in with the version the search shows.' : 'The cards go in without a version (search on set, rarity, legality, publisher or artist to add a version).') + '</p>' +
	'<p><label>Copies of each card <input id="searchaddallcopies" type="number" min="1" step="1" value="1" style="width: 4em;" /></label></p>' +
	'<ul class="swipepicklist">' +
	(active.length ? active.map(function(list) { return listpickitem(list, 'searchaddallpicked'); }).join('') + '<li class="swipepicksep">All lists</li>' : '') +
	'<li class="swipepicklistitem" onclick="newlist(null, searchaddallpicked);"><svg class="feather"><use xlink:href="res/feather-sprite.svg#plus-circle"></svg> New list</li>' +
	deckswipepicktree(listpickroot(), 'searchaddallpicked') + '</ul>');
}
function searchaddallpicked(listid) {
    var copies = parseInt($('#searchaddallcopies').val(), 10);
    if(!(copies > 0)) {
	copies = 1;
    }
    var qs = $('#lastsearchquery').val();
    listid = String(listid);
    modal('Adding to list', '<p class="searchaddallstatus">' + searcherror['loading'] + ' Loading the cards...</p>');
    activatelist(listid, function() {
	searchaddallfetch(qs, function(ids) {
	    var request = $.extend(true, {}, searchcache[database]['queryrequest'][qs] || $.deparam(qs));
	    var versioned = searchaddallversion(request);
	    var items = bubbleup(ids.map(cache_card_fetch), request).map(function(card) {
		if(!versioned) {
		    return [card.cardid, 0];
		}
		var prid = card.printingid;
		// games whose search picks no printing: a set search adds that set's, like the result's set row
		// (printingidfromset, which throws on a printing with no set)
		if(!prid && request.field_printing_set && Array.isArray(card.printing)) {
		    var sets = [].concat(request.field_printing_set);
		    card.printing.forEach(function(p) {
			if([].concat(p.set || p.edition || []).some(function(s) { return sets.includes(s); })) {
			    prid = p.printingid;
			}
		    });
		}
		return [card.cardid, parseInt([].concat(prid || 0).join(), 10) || 0]; // some games store ["1"]
	    });
	    addlistitems(listid, items, copies);
	    nomodal();
	    var lists = cache_thing("list","data").lists.Items;
	    deckswipetoast('Added ' + items.length.toLocaleString() + ' cards' + (copies > 1 ? ' \u00d7' + copies : '') + ' \u2192 ' + $('<div>').text(lists[cache_thing("list","datareverse")[listid]].name).html());
	});
    });
}
// done(cardids): every card of the search qs, in its order. The pages the results already loaded come from the
// cache; the rest are fetched 200 at a time (cached, not shown)
function searchaddallfetch(qs, done) {
    var ids = (searchcache[database]['querydata'][qs] || []).slice();
    var total = Math.min(searchcache[database]['querytotal'][qs], searchaddallmax());
    var next = function() {
	if(ids.length >= total) {
	    done(ids);
	    return;
	}
	$('.searchaddallstatus').html(searcherror['loading'] + ' Loading the cards... ' + ids.length.toLocaleString() + ' of ' + total.toLocaleString());
	var datarequest = $.extend(true, {}, searchcache[database]['queryrequest'][qs]);
	datarequest['size'] = 200;
	datarequest['from'] = ids.length;
	$.ajax({
	    type: 'POST',
	    url: apiuri+"/search",
	    contentType: 'application/json',
	    dataType: 'json',
	    data: datarequest,
	    success: function(raw) {
		var cards = raw.hits.hits.map(x=>x._source).map(imagehashtourl);
		if(!cards.length) {
		    total = ids.length; // the search shrank since: add what there is
		}
		cards.forEach(function(card) {
		    cache_card(card);
		    ids.push(card.cardid);
		});
		next();
	    },
	    error: function(error) {
		console.log(error);
		$('.searchaddallstatus').html('Loading the cards failed, so nothing was added. Try again.');
	    }
	});
    };
    next();
}
function deckswipetoast(html) {
    var t = $('#deckswipetoast');
    if(!t.length) {
	t = $('<div id="deckswipetoast"></div>').appendTo('body');
    }
    t.html(html).stop(true, true).show();
    clearTimeout(t.data('timer'));
    t.data('timer', setTimeout(function() { t.fadeOut(300); }, 1200));
}
function menutap(target) {
    // the innermost nav li whose dropdown doesn't contain the tap is the header that was tapped
    var header = $();
    for(var li = $(target).closest('nav li'); li.length; li = li.parent().closest('nav li')) {
	var sub = li.children('ul');
	if(sub.length && !$.contains(sub[0], target)) {
	    header = li;
	    break;
	}
    }
    var keep = header.length ? header.parents('nav li').addBack() : $();
    $('nav li.menuopen').not(keep).removeClass('menuopen');
    if(header.length) {
	header.toggleClass('menuopen');
    }
}
// switch the main content area to one of the result* views (menubar view icons, about, admin)
function showview(view) {
    if(view != 'resultsearch' && $('body').hasClass('mobilesearch')) {
	mobilesearchtoggle(false); // phone search panel would cover the other views
    }
    $('body').toggleClass('viewsearch', view == 'resultsearch'); // phones: shows the Edit search bar
    $('body').toggleClass('viewlist', view == 'resultlist'); // the list's Showing: button (menubar, phones above the list)
    if($('#' + view).is(":visible")) {
	seturl(viewstate(view.replace(/^result/,'')), true);
	return;
    }
    $(".ui-layout-center div[id^=result]").hide(); // Hide all content
    $(".viewicons button").removeClass("searchviewactive");
    $('.viewicons button[data-view=' + view + ']').addClass("searchviewactive");
    $('#' + view).fadeIn();
    seturl(viewstate(view.replace(/^result/,'')));
    updateviewbuttons();
    if(view == 'resultadmin') loadadmininfo();
}
function showcard() {
    showview('resultcard');
//    $("#resultsearch").hide();
//    $("#resultlist").hide();
//    $("#resultcard").show();
}
function showlist() {
    showview('resultlist');
//    $("#resultsearch").hide();
//    $("#resultlist").show();
//    $("#resultcard").hide();
}
function showsearch() {
    showview('resultsearch');
//    $("#resultsearch").show();
//    $("#resultlist").hide();
//    $("#resultcard").hide();
}


// *********************************** TEMPLATE HELPERS **************
// TODO:   make both of these be able to handle rarity as well...
// TODO:   make {{imageurlfromhash set rarity card}}   that returns fully built url
function templateconcatarrays() {
    out = [];
    for (i = 0; i < arguments.length; i++) {
        out = out.concat(arguments[i]);
    }
    return out.filter(function (el) {
        return el != null;
    });
}
function selectplaintext(val) {
    // clickable fields are already wrapped in search links by process_keywordlink, and older
    // cached selects may use spaces where the card data uses &nbsp;, so compare plain text
    return String(val).replace(new RegExp("<[^<]+>","g"),"").replace(/&nbsp;|\u00a0/g," ").trim();
}
function selectorder(key) {
    // the values of a cached select in order, as plain text, or null. Selects grouped into optgroups
    // are flattened, e.g. legality: [{"Arc":[...]},{"Format":[...]}] and printing.set:
    // [{"Clan War (Imperial)":{"Imperial Edition":[rarities]}}], whose order is the game's sortregex
    // (oracle-all-structure attributes). Older legality caches may be a flat array (same order).
    // Games without arcs cache printing.set as a plain object in alphabetical order, not
    // chronological, so they get null.
    var sel = cache_select(key);
    if(!Array.isArray(sel)) {
        return null;
    }
    var order = [];
    sel.forEach(function(group) {
        if(typeof group === 'string') {
            order.push(group);
            return;
        }
        var vals = group[Object.keys(group)[0]];
        order = order.concat(Array.isArray(vals) ? vals : Object.keys(vals));
    });
    return order.map(selectplaintext);
}
function sortbyselect(items,key,valuefn) {
    // sort items into the order of a cached select (selectorder); without one, the stored order
    var order = selectorder(key);
    if(!Array.isArray(items) || !order) {
        return items;
    }
    var pos = function(item) {
        var i = order.indexOf(selectplaintext(valuefn(item)));
        return i < 0 ? order.length : i;
    };
    // slice so the cached card data isn't reordered; unknown values keep their stored order at the end
    return items.slice().sort(function(a,b) { return pos(a) - pos(b); });
}
function templatehasval(v) {
    // card detail guards: card fields are arrays, and [""] / ["&nbsp;"] are truthy but display nothing (#236)
    if(Array.isArray(v)) {
        return v.some(templatehasval);
    }
    if(typeof v === 'string') {
        return v.replace(/&nbsp;/gi," ").trim() !== "";
    }
    return v !== undefined && v !== null && v !== false;
}
function templatesortlegality(legality) {
    // card detail legalities in chronological (arc) order (#190)
    return sortbyselect(legality,"legality",function(l) { return l; });
}
function templatesortprintings(printing) {
    // card detail Versions in chronological set order; set is linkified by docard, setclean is not
    return sortbyselect(printing,"printing.set",function(p) {
        return [].concat(p.setclean || p.set || [""])[0];
    });
}
function templatemakelinks() {
  // card fields are arrays; skip missing/blank urls so a card without one doesn't render "undefined"
  var out = "";
  [].concat.apply([],arguments).filter(templatehasval).forEach(function(u) {
    out += "<a href=\""+u+"\">"+u+"</a>";
  });
  return out;
}
function templateprintingidfromset(set,hashes) {
    if(!set) {
	console.log(["print id issue",set,hashes]);
	return null;
    }
    var ret = '';
    hashes.forEach(function(e) {
 	if(Array.isArray(set)) {
	    set.forEach(function(f) {
		if((e.set||e.edition).includes(f)) {
		    ret=e.printingid;
		}
	    });
	} else {
	    if((e.set||e.edition).includes(set)) {
		ret=e.printingid;
	    }
	}
    });
    return ret;
}
function templateimagehashfromset(set,hashes) {
    if(!set) {
	console.log(["Imagehash issue",set,hashes]);
	return null;
    }
    var ret = '';
    hashes.forEach(function(e) {
 	if(Array.isArray(set)) {
	    set.forEach(function(f) {
		if((e.set||e.edition).includes(f)) {
		    ret=e.printimagehash[0];
		}
	    });
	} else {
	    if((e.set||e.edition).includes(set)) {
		ret=e.printimagehash[0];
	    }
	}
    });
    return ret;
}
function templateimagefromset(set,hashes) {
    if(!set) {
	console.log(["Image issue",set,hashes]);
	return null;
    }
    var ret = '';
    hashes.forEach(function(e) {
	if(Array.isArray(set)) {
	    set.forEach(function(f) {
		if((e.set||e.edition).includes(f)) {
		    ret=e.images[0];
		}
	    });
	} else {
	    if((e.set||e.edition).includes(set)) {
		ret=e.images[0];
	    }
	}
    });
    return ret;
}
function templatesetfromset(set,hashes) {
    if(!set) {
	console.log(["set issue",set,hashes]);
	return null;
    }
    var ret = '';
    hashes.forEach(function(e) {
	if(Array.isArray(set)) {
	    set.forEach(function(f) {
		if((e.set||e.edition).includes(f)) {
		    ret=f;
		}
	    });
	} else {
	    if((e.set||e.edition).includes(set)) {
		ret=set;
	    }
	}
    });
    return ret;
}
function templateprintingfromid(id,hashes,data,noarray=true) {
    //console.log(["printingfromid",id,hashes,data,noarray]);
    var ret = '';
    hashes.forEach(function(e) {
	if(parseInt(e.printingid) == parseInt(id)) {
	    ret=e[data];
	}
    });
    if(noarray && Array.isArray(ret)) {
	    ret = ret[0];
    }
    return ret;
}
function printingsetpos(card) {
    // each printing's position in the chronological set order (selectorder("printing.set"));
    // sets missing from it go last, and without a cached order every printing is 0
    var order = selectorder("printing.set");
    return card.printing.map(function(p) {
        if(!order) {
            return 0;
        }
        var i = order.indexOf(selectplaintext([].concat(p.setclean || p.set || [""])[0]));
        return i < 0 ? order.length : i;
    });
}
function latestprinting(card,indices) {
    // the latest of these printing indices: the later set in the chronological set order, on a tie
    // the later stored printing; null if there are none
    var pos = printingsetpos(card);
    var best = null;
    indices.forEach(function(i) {
        if(best === null || pos[i] > pos[best] || (pos[i] == pos[best] && i > best)) {
            best = i;
        }
    });
    return best;
}
function legalityprinting(card,field,value) {
    // a legality search's printing for a stored value (e.g. Hidden Emperor (Jade)): the latest
    // printing carrying it, skipping printings marked notmrp; null if none does
    var indices = [];
    card.printing.forEach(function(p,i) {
        if(p.notmrp === true) {
            return;
        }
        if([].concat(p[field] || []).some(function(v) { return selectplaintext(v) == selectplaintext(value); })) {
            indices.push(i);
        }
    });
    return latestprinting(card,indices);
}
function storedprinting(card,att,value) {
    // the printing a search for a stored value of att shows, or null: for legality the latest
    // non-notmrp one (legalityprinting), otherwise the last stored printing carrying it
    if(att == 'legality') {
        return legalityprinting(card,att,value);
    }
    return card.printingreverse[att] && (value in card.printingreverse[att]) ? card.printingreverse[att][value] : null;
}
function templatefetch(card,id=false,datarequest={}) {
    pr = card.printingreverse.printingid[card.printingprimary];
    if(id) {
        pr = card.printingreverse.printingid[id];
    } else if(('listprinting' in card) && card.listprinting>0) {
        pr = card.printingreverse.printingid[card.listprinting];
    } else if(typeof datarequest === 'object') {
        //console.log("onyx deb 1");
        for(att in card.printingreverse) {
          //console.log("onyx deb: "+att);
            if("field_printing_"+att in datarequest) {
              console.log("printing field in search: "+att);
              if(!Array.isArray(datarequest["field_printing_"+att])) {
                datarequest["field_printing_"+att] = [datarequest["field_printing_"+att]];
              }
              for (checkatt of datarequest["field_printing_"+att]) {
                console.log(checkatt);
                if(checkatt in card.printingreverse[att]) {
                    pr = card.printingreverse[att][checkatt];
                }
              }
            } else if("field_"+att in datarequest) {
              console.log("top field in search: "+att);
              if(!Array.isArray(datarequest["field_"+att])) {
                datarequest["field_"+att] = [datarequest["field_"+att]];
              }
              for (checkatt of datarequest["field_"+att]) {
                console.log(checkatt);
                var spr = storedprinting(card,att,checkatt);
                if(spr !== null) {
                    pr = spr;
                } else {
                    // a derived value (e.g. Jade Extended) is on no printing: use one that fits its rule
                    var dpr = derivedprinting(card,att,checkatt);
                    if(dpr !== null) {
                        pr = dpr;
                    }
                }
              }
            }
        }
        // require_<field> (e.g. the "Paper only" checkbox): keep the printing chosen above if it
        // fits every required value, else switch to one that does
        Object.keys(datarequest).filter(function(k) { return k.startsWith("require_"); }).forEach(function(k) {
            var att = k.replace("require_","").replace("printing_","");
            [].concat(datarequest[k]).forEach(function(v) {
                if(!printingfits(card,pr,att,v)) {
                    var dpr = storedprinting(card,att,v);
                    if(dpr === null) {
                        dpr = derivedprinting(card,att,v);
                    }
                    if(dpr !== null && dpr !== undefined) {
                        pr = dpr;
                    }
                }
            });
        });
    }
    //console.log("onx ret: "+pr);
    return card.printing[pr];
}
function printingfits(card,pr,field,value) {
    // whether printing index pr carries value, or fits the derived value's rule on its own;
    // a printing marked notmrp never fits a legality
    var p = card.printing[pr];
    if(!p || (field == 'legality' && p.notmrp === true)) {
        return false;
    }
    if([].concat(p[field] || []).some(function(v) { return selectplaintext(v) == selectplaintext(value); })) {
        return true;
    }
    return derivedprinting(Object.assign({}, card, {printing: [p]}), field, value) === 0;
}
function derivedprinting(card,field,value) {
    // index of a printing that satisfies the derived value's rule, or null. The rules come from
    // /attributes <field>.derived (ootv-search lib/attributeopts.js): every `all` clause and at
    // least one `any` clause; card fields must match the card, `printing` fields the printing.
    // Printings marked notmrp are skipped. Among the printings that fit, prefer one carrying a value
    // in the entry's optional `prefer` list (the arc a format is named after, e.g. Ivory for Ivory
    // Extended), then the latest (latestprinting: chronological set order, then stored order).
    var derived = cache_select(field+".derived");
    if(!Array.isArray(derived)) {
        return null;
    }
    var d = derived.find(function(x) { return selectplaintext(x.name) == selectplaintext(value); });
    if(!d) {
        return null;
    }
    var has = function(vals,want) {
        want = [].concat(want).map(selectplaintext);
        return [].concat(vals || []).some(function(v) { return want.includes(selectplaintext(v)); });
    };
    var cardok = function(cl) {
        return Object.keys(cl).every(function(k) { return k == 'printing' || has(card[k],cl[k]); });
    };
    var printingok = function(cl,p) {
        return !cl.printing || Object.keys(cl.printing).every(function(k) { return has(p[k],cl.printing[k]); });
    };
    var fieldok = function(cl,p) {
        // a clause without printing fields fits a printing carrying one of its <field> values; only
        // the derived field itself, since printings can carry other card fields (type, text, ...)
        return !!cl.printing || has(p[field],cl[field] || []);
    };
    var all = d.all || [];
    var any = (d.any && d.any.length) ? d.any.filter(cardok) : [{}];
    if(!all.every(cardok) || any.length == 0) {
        return null;
    }
    var fits = [];
    card.printing.forEach(function(p,i) {
        if(p.notmrp === true) { return; }
        if(!all.every(function(cl) { return printingok(cl,p); })) { return; }
        if(any.some(function(cl) { return printingok(cl,p) && fieldok(cl,p); })) { fits.push(i); }
    });
    var preferred = d.prefer ? fits.filter(function(i) { return has(card.printing[i][field],d.prefer); }) : [];
    return latestprinting(card, preferred.length ? preferred : fits);
}
function templatefetchimage(card,size,id=false,datarequest={}) {
    console.log(['templatefetchimage',card,size,id,datarequest]);
    prdata = templatefetch(card,id,datarequest);
    if("image" in prdata) {
        //dbinfo[database].imageuri + hash + image
        if(size in prdata.image[0]) {
            return dbinfo[database].imageuri + prdata.imagehash + "/"+ prdata.image[0][size];
        } else {
            if(size in missingimage) {
                return missingimage[size];
            } 
            return missingimage[0];
        }
    } else if("images" in prdata) {
        return prdata.images[0]+size+'.jpg';
    } else {
        if(size in missingimage) {
            return missingimage[size];
        } 
        return missingimage[0];
    }
}
function templatefetchdata(card,data,id=false,datarequest={}) {
    prdata = templatefetch(card,id,datarequest);
    return prdata[data];
}

function activatetemplate(type,template) {
  templates[database]['active'][type] = template;
  // a card or visual template sets that view's size toggle
  if(['card','visual'].includes(template.replace(/-premium$/,'')) && type in largeview) {
	  largeview[type] = template.endsWith('-premium');
  }
  if(type == 'search') {
	  if( $('#lastsearchquery').val() ) {
	    dosearch(0);
	  }
  }
  if(type == 'list') {
	  if( $('#lastlistid').val() ) {
	    renderlist(cache_thing("list",$("#lastlistid").val()).list.Items[0]);
	  }
  }
  if(type == 'card') {
	  if( $("#lastcardid").val() ) {
	    docardid( $("#lastcardid").val(), lastcardprid(),$("#lastsearchquery").val()?$("#lastsearchquery").val():null);
	  }
  }
  updatemenubar(type);
}
// the result tab on screen: search, card, list, about, ...
function currentresulttab() {
  return ($(".ui-layout-center div[id^=result]:visible").attr("id") || '').replace(/^result/,'');
}
// which output the menubar template buttons drive: the search, card or list view on screen, else search
function viewbuttontype() {
  var tab = currentresulttab();
  return ['search','card','list'].includes(tab) ? tab : 'search';
}
// groups[database] or groups['*'] allows this operation (or every one, '*'): same rule as /update
function gamepermission(op) {
  var user = cache_thing("user","data");
  if(!(user && ("oracle" in user) && ("groups" in user.oracle[0]))) {
	  return false;
  }
  var groups = user.oracle[0].groups;
  return [database,'*'].some(function(g) { return Array.isArray(groups[g]) && (groups[g].includes('*') || groups[g].includes(op)); });
}
// full permissions on this game
function fullgamepermission() {
  return gamepermission('*');
}
// menubar template buttons: show the ones this game has for the view in play, highlight the active one.
// debug also needs full game permission and the debug tab itself on screen, and isn't offered on phones.
function updateviewbuttons() {
  var type = viewbuttontype();
  var available = templates[database]['available'];
  var active = (templates[database]['active'][type]||'').replace(/-premium$/,'');
  $("#templatebuttons button[data-template]").each(function() {
	  var key = $(this).data("template");
	  var show = available[key] !== undefined && available[key].places.includes(type);
	  if(key == 'debug') {
	    show = show && fullgamepermission() && currentresulttab() == type && !narrowscreen();
	  }
	  $(this).toggle(show).toggleClass("searchviewactive", key == active);
  });
  // about, help, admin have no formats: hide the whole format/size/sort group there.
  // The directory has its own view buttons and sort (updatedirbuttons), in place of the search ones.
  var tab = currentresulttab();
  var formatview = ['search','card','list'].includes(tab);
  if(tab == 'dir') {
    $("#templatebuttons button[data-template]").hide();
  }
  $(".searchviewbuttons").toggle(formatview || tab == 'dir');
  $(".sortbuttons").not(".dirsortbuttons").toggle(formatview && type == 'search'); // sort only applies to search results
  updatesizebuttons();
  if(tab == 'dir') {
    $("#sizebuttons").hide();
  }
  updatedirbuttons();
  $("#templatebuttons").toggle($("#templatebuttons button").filter(function() { return this.style.display != 'none'; }).length > 0);
}
// menubar template button: switch the view in play; visual follows the size toggle.
// debug toggles: a second click goes back to the template it replaced (the Card tab has no other button)
var debugprevious = {};
function viewbutton(template) {
  var type = viewbuttontype();
  var active = templates[database]['active'][type];
  if(template == 'debug') {
	  if(active == 'debug') {
	    template = debugprevious[type] || templates[database]['default'][type];
	  } else {
	    debugprevious[type] = active;
	  }
  }
  if(template == 'visual' && largeview[type] && templates[database]['available']['visual-premium']) {
	  template = 'visual-premium';
  }
  activatetemplate(type,template);
}
// saved view defaults: users.settings[database] = {search, card, list, sort, sortdir, sortmode, mobile: {same keys}}, saved via /user?settings=
// (settings[database].folders, the directory folders, shares the object: saves here keep it)
// (the API stores any small object; sizes come from the templates, an older saved `large` is ignored)
// phones save and read their own set under `mobile`, so they can use a different view than desktop.
function viewdefaults() {
  var saved = savedgamesettings();
  if(saved && narrowscreen()) {
	  saved = saved['mobile'] || null;
  }
  return saved;
}
// everything saved for this game, desktop and mobile
function savedgamesettings() {
  var user = cache_thing("user","data");
  if(!(user && ("oracle" in user) && user.oracle[0].settings && user.oracle[0].settings[database])) {
	  return null;
  }
  return user.oracle[0].settings[database];
}
// apply saved defaults: they become the game's defaults (so templates still loading pick them up),
// and views already loaded switch now (only the tab on screen re-renders)
function applyviewdefaults() {
  var saved = viewdefaults();
  if(!saved) {
	  return;
  }
  var sortchanged = applysortdefault();
  var searchrendered = false;
  var available = templates[database]['available'];
  for (type of ['search','card','list']) {
	  var key = saved[type];
	  if(!key || available[key] === undefined || !available[key].places.includes(type)) {
	    continue;
	  }
	  templates[database]['default'][type] = key;
	  if(['card','visual'].includes(key.replace(/-premium$/,''))) {
	    largeview[type] = key.endsWith('-premium');
	  }
	  if(templates[database]['compiled'][key] === undefined || templates[database]['active'][type] == key) {
	    continue;
	  }
	  if(currentresulttab() == type) {
	    activatetemplate(type,key);
	    searchrendered = searchrendered || type == 'search';
	  } else {
	    templates[database]['active'][type] = key;
	  }
  }
  if(sortchanged && !searchrendered && currentresulttab() == 'search' && $('#lastsearchquery').val()) {
	  dosearch(0);
  }
  updatemenubar('search');
}
// saved search sort: only a sort this game offers; returns true if it changed the current sort
function applysortdefault() {
  var saved = viewdefaults();
  if(!saved || !saved.sort || !searchsorts[database] || !(saved.sort in searchsorts[database])) {
	  return false;
  }
  var dir = (saved.sortdir == 'desc') ? 'desc' : 'asc';
  var mode = (saved.sortmode in sortmodes) ? saved.sortmode : Object.keys(sortmodes)[0];
  if(templates[database]['sort']['search'] == saved.sort && templates[database]['sortdir'] && templates[database]['sortdir']['search'] == dir &&
     templates[database]['sortmode'] && templates[database]['sortmode']['search'] == mode) {
	  return false;
  }
  templates[database]['sort']['search'] = saved.sort;
  templates[database]['sortdir'] = templates[database]['sortdir'] || {};
  templates[database]['sortdir']['search'] = dir;
  templates[database]['sortmode'] = templates[database]['sortmode'] || {};
  templates[database]['sortmode']['search'] = mode;
  return true;
}
// save one part (search, card, list, sort) or 'all' as this game's default, merged into what's already saved
function saveviewdefaults(part='all',el=null) {
  var active = templates[database]['active'];
  var gamesettings = Object.assign({}, savedgamesettings() || {});
  var settings = Object.assign({}, viewdefaults() || {});
  delete settings['large']; // older saves; sizes come from the templates now
  if(part == 'all' || part == 'sort') {
	  settings['sort'] = templates[database]['sort']['search'];
	  settings['sortdir'] = templates[database]['sortdir']['search'];
	  settings['sortmode'] = templates[database]['sortmode']['search'];
  }
  for (type of ['search','card','list']) {
	  if(part == 'all' || part == type) {
	    // debug is a temporary toggle: save what it replaced
	    settings[type] = (active[type] == 'debug') ? (debugprevious[type] || templates[database]['default'][type]) : active[type];
	  }
  }
  if(narrowscreen()) {
	  gamesettings['mobile'] = settings;
  } else {
	  settings['mobile'] = gamesettings['mobile']; // keep the phone's set (dropped by JSON if there isn't one)
	  gamesettings = settings;
  }
  $.ajax({
	  type: 'GET',
	  url: apiuri+"/user?database="+database+"&settings="+encodeURIComponent(JSON.stringify(gamesettings)),
	  dataType: 'json',
	  beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
	  success: function(data) {
	    cache_thing("user","data",data);
	    var saved = viewdefaults();
	    if(!saved || Object.keys(settings).some(function(k) { return JSON.stringify(saved[k]) !== JSON.stringify(settings[k]); })) {
		    // an API without settings support answers like a plain /user
		    alert("Couldn't save view defaults");
		    return;
	    }
	    // no applyviewdefaults(): the screen already shows what was saved, and it would reset unsaved views
	    rendersettings();
	    if(el && !document.contains(el)) { // re-rendered: flash the new copy of the button
		    el = $('#settingsarea .saveviewdefaults[onclick*="\''+part+'\'"]')[0];
	    }
	    $(el).addClass('saved');
	    setTimeout(function() { $(el).removeClass('saved'); }, 2000);
	  },
	  error: function(error) { console.log("Save view defaults failed: "+JSON.stringify(error)); alert("Couldn't save view defaults"); }
  });
}
// a fresh tab uses the cached user; re-fetch it quietly and apply defaults if they changed elsewhere
function refreshviewdefaults() {
  var before = JSON.stringify(viewdefaults());
  $.ajax({
	  type: 'GET',
	  url: apiuri+"/user",
	  dataType: 'json',
	  beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
	  success: function(data) {
	    cache_thing("user","data",data);
	    if(JSON.stringify(viewdefaults()) != before) {
		    applyviewdefaults();
	    }
	    rendersavedsearches();
	    applysearchdefault();
	  },
	  error: function(error) { console.log("User refresh failed: "+JSON.stringify(error)); }
  });
}
// menubar size toggle, for the view in play only: Card Details <-> Card Large, or a search/list
// Visual Spoiler <-> Visual Spoiler - Large (other layouts keep the choice for the grid button).
// About/Directory/Help drive search without re-rendering it (dosearch would jump to the Search tab).
function setlargeview(large) {
  var type = viewbuttontype();
  var available = templates[database]['available'];
  var active = templates[database]['active'];
  largeview[type] = large;
  var family = (type == 'card') ? 'card' : 'visual';
  var want = (large && available[family+'-premium'] && available[family+'-premium'].places.includes(type)) ? family+'-premium' : family;
  if((active[type]||'').replace(/-premium$/,'') == family && active[type] != want) {
	  if(currentresulttab() == type) {
	    activatetemplate(type,want);
	  } else {
	    active[type] = want;
	  }
  } else if(type == 'list' && active[type] == 'visual-deck' && currentresulttab() == type) {
	  activatetemplate(type,'visual-deck'); // the Deck format has no -premium template: renderlist sizes it from largeview
  }
  updatesizebuttons();
}
// size buttons follow the view in play; the group hides where the game has no large version,
// and on formats without one (Detailed, Simple List, Text). The Deck format (lists) follows the visual size.
function updatesizebuttons() {
  var type = viewbuttontype();
  var family = (type == 'card') ? 'card' : 'visual';
  var large = templates[database]['available'][family+'-premium'];
  var active = (templates[database]['active'][type]||'').replace(/-premium$/,'');
  var sized = active == family || (type == 'list' && active == 'visual-deck');
  $("#sizebuttons").toggle(large !== undefined && large.places.includes(type) && sized);
  $("#sizebuttons button[data-size]").each(function() {
	  $(this).toggleClass("searchviewactive", ($(this).data("size") == 'large') == largeview[type]);
  });
}
function getactivetemplate(type) {
    return templates[database]['compiled'][templates[database]['active'][type]];
}
function getactivetemplateoverride(type) {
  var t=templates[database]['available'][templates[database]['active'][type]];
  return t.override?t.override:{};
}
// refresh the menubar after a template or sort change: sort dropdown, view and size buttons
function updatemenubar(type) {
  if(type == 'search') {
	  $("#sortdropdown").html(sortdropdownitems(type));
  }
  updateviewbuttons();
}
function sortdropdownitems(type) {
  var sortdown = '';
  for (key in searchsorts[database]) {
	  sortdown += '<li'+(templates[database]['sort'][type] == key?' class="menuactive'+(templates[database]['sortdir'][type]&&templates[database]['sortdir'][type]=='desc'?' searchdesc"':'"'):'')+" onclick=\"changesort('"+type+"','"+encodeURI(key)+"');\">"+searchsorts[database][key]+'</li>';
  }
  sortdown += '<li class="menunone sortmodehead">Compare text</li>';
  for (mode in sortmodes) {
	  sortdown += '<li class="sortmodeitem'+(templates[database]['sortmode'][type] == mode?' menuactive':'')+'" onclick="changesortmode(\''+type+'\',\''+mode+'\');">'+sortmodes[mode]+'</li>';
  }
  return sortdown;
}
function changesort(type,key,rerender=true) {
    // need to change the actual sort value
    if(templates[database]['sort'][type] == decodeURI(key)) {
	// TODO: flip asc/desc here
	if(templates[database]['sortdir']['search'] == 'asc') {
	    templates[database]['sortdir']['search'] = 'desc';
	} else {
	    templates[database]['sortdir']['search'] = 'asc';
	}
    } else {
	templates[database]['sort'][type] = decodeURI(key);
	templates[database]['sortdir']['search'] = 'asc';
    }
    // need to update menus
    updatemenubar(type);
    // need to re-render
    if(rerender) {
	dosearch(0);
    }
}
function changesortmode(type,mode) {
  if(!(mode in sortmodes) || templates[database]['sortmode'][type] == mode) {
	  return;
  }
  templates[database]['sortmode'][type] = mode;
  updatemenubar(type);
  dosearch(0);
}


// ********************** STARTUP ************************8
// ootvversion (index.html) and version.json are stamped with the commit on deploy. A tab
// left open across a deploy still runs the old code, so when it comes back into view
// (or every 30 minutes) check version.json and offer a reload if a newer deploy is live.
// an index.html cached from before versioning doesn't define it; that page then loads
// this file unversioned, so fall back rather than throw on every runtime load
var ootvversion = (typeof ootvversion !== 'undefined') ? ootvversion : 'dev';
var versionchecked = 0;
function checkversion() {
  if(ootvversion == 'dev' || $('#newversion').is(':visible') || Date.now() - versionchecked < 300000) return;
  versionchecked = Date.now();
  $.ajax({url: 'version.json', dataType: 'json', cache: false})
    .done(function(data) {
      if(data.version && data.version != ootvversion) $('#newversion').show();
    });
}
// admin page: the live deploy (version.json, stamped by .github/stamp-version.sh) and when this
// browser cached each of this game's selects (refetched once older than selectmaxage).
function utcstamp(ms) {
  return new Date(ms).toISOString().replace('T',' ').replace(/\.\d+Z$/,' UTC');
}
function loadadmininfo() {
  var prefix = database+"_searchselecttime_";
  var store = (typeof(Storage) !== "undefined") ? window.localStorage : null;
  var keys = store ? Object.keys(store) : Object.keys(nolocalstore);
  var rows = keys.filter(function(k) { return k.indexOf(prefix) === 0; }).sort().map(function(k) {
    var t = JSON.parse(store ? store.getItem(k) : JSON.stringify(nolocalstore[k]));
    var age = Math.round((Date.now() - t) / 60000);
    return $('<tr>').append($('<td>').text(k.substr(prefix.length)),
                            $('<td>').text(t ? utcstamp(t) : 'no time'),
                            $('<td>').text(t ? age+' min ago'+(Date.now() - t >= selectmaxage ? ' (refetched on next use)' : '') : ''));
  });
  var html = $('<p class="admininfo-html">').text('Latest HTML update: loading...');
  var cached = rows.length ? $('<table>').append(rows) : $('<p>').text('No cached data for '+database+'.');
  $('#admininfo').empty().append(html, $('<p>').text('Cached data ('+database+', this browser):'), cached);
  $.ajax({url: 'version.json', dataType: 'json', cache: false})
    .done(function(data) {
      html.text('Latest HTML update: '+(data.timestamp || 'unknown')+' ('+data.version+')'+
                (ootvversion != 'dev' && data.version != ootvversion ? ' - this tab runs '+ootvversion+', reload to update' : ''));
    })
    .fail(function() {
      html.text('Latest HTML update: no version.json (not deployed: local copy)');
    });
}
document.addEventListener('visibilitychange', function() {
  if(document.visibilityState == 'visible') checkversion();
});
setInterval(checkversion, 1800000);

// anonymous visitor count: a random id kept in localStorage, reported to /visit once per
// UTC day (oracle-all-visits; ootv-search scripts/visitors.sh). No IP or account is stored.
// Off locally so testing doesn't count.
function sendvisit() {
  if(ootvversion == 'dev') return;
  try {
    var vid = window.localStorage.getItem('ootv_vid');
    if(!vid) {
      vid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0;
            return (c == 'x' ? r : (r & 3 | 8)).toString(16);
          });
      window.localStorage.setItem('ootv_vid', vid);
    }
    var today = new Date().toISOString().slice(0, 10);
    if(window.localStorage.getItem('ootv_vidday') == today) return;
    window.localStorage.setItem('ootv_vidday', today);
    $.ajax({url: apiuri + '/visit', data: {vid: vid, game: database, li: auth && auth.isUserSignedIn() ? 1 : 0}});
  } catch(e) {}
}

$(document).ready(function(){
  if(isloginpopup()) {
    finishloginpopup();
    return;
  }
  // TODO: doing double-load of lists when startup
  // per-game search state first: a cached login (a reload) runs the login callback below at once, and it needs these
  //TODO:  put some stuff in here into functions.   make sure order optimized.
  searchcache[database] = {
	  'data': {},    'querydata': {},    'querytotal': {},    'queryrequest': {}
  };
  templateactive[database] = {};
  
  templates[database]['sort']['search'] = Object.keys(searchsorts[database])[0];
  templates[database]['sortdir'] = {'search': 'asc'};
  templates[database]['sortmode'] = {'search': Object.keys(sortmodes)[0]};
  for(field in searchables[database]) {
	  if(typeof searchables[database][field] === "object") {
	    if(searchables[database][field].type == "select") {
		    var sort = [{}];
		    // TODO:   ASC / DESC - if selected when selected, just replace asc with desc... maybe do it inside dosearch on demand if desc is set?
		    // TODO: up/down arrow on ASC / DESC
		    sort[0][field.replace("printing.","printing")+'.keyword'] = {"order": "asc"};
		    searchsorts[database][JSON.stringify(sort)] = labels[database]['tag'+field.replace("printing.","")];
	    }
	    if(searchables[database][field].type == "numeric") {
		    var sort = [{}];
		    sort[0][field] = {"order": "asc"};
		    searchsorts[database][JSON.stringify(sort)] = labels[database]['tag'+field.replace("printing.","")];
	    }
	  }
  }

  auth = initCognitoSDK();
  var curUrl = window.location.href;
  if(curUrl.includes('#access_token=') || curUrl.includes('?code=') ) {
	  auth.parseCognitoWebResponse(curUrl);
  } else {
	  auth.parseCognitoWebResponse('');
  }
  if(signedin()) {
	  logincallback(auth.getSession());
  } else {
	  logoutcallback();
  }
  sendvisit();
  // load layout
  (function ($){
	  $.fn.selector = { split: function() { return ""; }};
  })(jQuery);
  
  $(".ui-layout-center div[id^=result]").hide(); // Hide all content
  showview('resultabout');
  
  // phones default search results to the Visual Spoiler, unless a saved phone default says otherwise
  if(narrowscreen() && templates[database]['available']['visual'] && !(viewdefaults() || {})['search']) {
	  templates[database]['default']['search'] = 'visual';
  }
  
  // TODO: check for premium
  $.each(templates[database]['available'],function(key,val) {
	  console.log("initiating template load: "+key);
	  $.ajax({
	    url: "templates/template-"+(val.generic?'':(database+"-"))+((val.override&&val.override.templatekey)?val.override.templatekey:key)+".html?v="+ootvversion,
	    type: "GET",
	    datatype: 'text',
	    cache: true,
	    success: function(contents) {
		    $("#all_template").append('<script id="template-'+(val.generic?'':(database+"-"))+key+'" type="text/x-jsrender">'+contents+'</script>');
		    templates[database]['compiled'][key] = $.templates("#template-"+(val.generic?'':(database+"-"))+key);
		    for (k of ['search','card','list']) {
		      if(key == templates[database]['default'][k]) {
			      templates[database]['active'][k] = key;
		      }
		    }
		    for (type of templates[database]['available'][key].places) {
		      updatemenubar(type);
		    }
		    // reference like:   templates[database]['compiled'][templates[database].active.search]
        /*		if(Object.keys(templateload[database]['search'])[0] == key) {
		          searchtemplate[database] = $.templates(["#template",key,database].join("-"));
		          templateactive[database]['search'] = key;
		          }  */
	    }
	  });
  });


  // Load selects
  $('#searchmiddle').html(searcherror['searchmiddle']);
  loadselectables(database);
  if(searchables[database]["quick"] !== undefined && searchables[database]["quick"] == false) {
	  $('#searchtop').html('');
  }

  loadupdates(database);
  
  // Enter performs a search
  $('.searchinput').keypress(function(e){
    if((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)){
      dosearch();
      return false;
    } else {
      return true;
    }
  });
  
  // update "MORE" and load more when you hit page end
  $(window).scroll(scrollcheck);
  $(".ui-layout-center").scroll(scrollcheck);
  //    $(window).on("click",function() { alert(   $(window).scrollTop() + " > "+ ($(document).height() - $(window).height())); });
  
  $('.gameinfo-game').html('<img src="gamelogos/64/'+dbinfo[database].logo+'"><span class="gamename">&nbsp;'+dbinfo[database].name+'</span>');
  $('.gameinfo-gameshort').html(dbinfo[database].nameshort);
  $('.gameinfo-gamelogo15').html('<img src="gamelogos/15/'+dbinfo[database].logo+'">');
  
  urlready = true;
  urlparser();
  // phones start on the search form, unless the url asked for something (beyond the game)
  if(narrowscreen() && !location.hash.replace(/#game=[^#]*/,'')) {
	  showviewkeepurl('resultsearch');
	  mobilesearchtoggle(true);
  }
  for (var k in dbinfo) {
	  addgametolist(k);
  }
  
  //    $('.document').bind("DOMSUbtreeModified",chosenify);
  //    chosenify();

});

function chosenify() {
    console.log("chosenify");
    $(".chosen-select").chosen({
//	no_results_text: "Oops, nothing found!",
	allow_single_deselect: true,
	placeholder_text_multiple: "Select"
//	width: "200px"
    });
}

function addgametolist(db) {
  $('.gamelist').append('<li'+(database == db?' class="menuactive"':'')+'><a href="." onclick="cache_session(\'database\',\''+db+'\');"><img src="gamelogos/15/'+dbinfo[db].logo+'">&nbsp;'+dbinfo[db].name+'</a></li>');
}


// ****************************** URL / HISTORY ******************************
// The address bar always says what's on screen, so reload, bookmarks and Back/Forward all land in the
// same place: #game=<g>, then one of
//   #search=<qs> | #cardid=N[,#cnprintingid=P] | #listid=N | #view=<dir|help|settings|admin|search|card|list>
// (the About page is #game alone). Old links (no #game, #quicksearch=, #quicksearchtitle=) still work.
// seturl() is the only place that calls history.*: showview() calls it for every view switch.
var urlready = false;      // false until the page's own url has been read (startup draws don't add history)
var urlrestoring = null;   // view urlparser is drawing: its draw replaces the entry (canonical url) rather than adding one
var urlpendinglist = null; // a #listid link opened before the directory loaded (listinfocallback opens it)

// '#a=1,#b=2' -> {a: '1', b: '2'} (a repeated key gives an array)
function parsehash(hash) {
  var matches = hash.match(/#[^#]+/g);
  var matchstruct = {};
  var structpatt = /#(\w+)=?((?:[^,=#])+)?/;
  if(matches) {
    for(i=0;i<matches.length;i++) {
      var matchdetails = structpatt.test(matches[i]);
      if(typeof(matchstruct[RegExp.$1]) == "undefined") {
        matchstruct[RegExp.$1] = RegExp.$2;
      } else if(typeof(matchstruct[RegExp.$1]) == "object") {
        matchstruct[RegExp.$1].push(RegExp.$2);
      } else {
        var oldmatch = matchstruct[RegExp.$1];
        matchstruct[RegExp.$1] = new Array();
        matchstruct[RegExp.$1].push(oldmatch);
        matchstruct[RegExp.$1].push(RegExp.$2);
      }
    }
  }
  return matchstruct;
}
// a url hash -> the page it shows: {view, qs, cardid, prid, listid}
function hashstate(hash) {
  var m = parsehash(hash);
  if(m.search !== undefined) {
    return {view: 'search', qs: decodeURIComponent(m.search)};
  } else if(m.quicksearch !== undefined || m.quicksearchtitle !== undefined) {
    return {view: 'search', qs: null};
  } else if(m.cardid !== undefined) {
    return {view: 'card', cardid: m.cardid, prid: m.cnprintingid || null};
  } else if(m.listid !== undefined) {
    return {view: 'list', listid: m.listid};
  } else if(m.view !== undefined) {
    return {view: m.view};
  }
  return {view: 'about'};
}
// the page -> its url hash (views without their content, e.g. the card view before any card, are #view=)
function statehash(state) {
  var h = '#game='+database;
  if(state.view == 'search' && state.qs) {
    return h+',#search='+encodeURIComponent(state.qs);
  } else if(state.view == 'card' && state.cardid) {
    return h+',#cardid='+state.cardid+(state.prid ? ',#cnprintingid='+state.prid : '');
  } else if(state.view == 'list' && state.listid) {
    return h+',#listid='+state.listid;
  } else if(state.view == 'about') {
    return h;
  }
  return h+',#view='+state.view;
}
// what one of the result views shows now
function viewstate(view) {
  if(view == 'search') {
    return {view: view, qs: $('#lastsearchquery').val() || null};
  } else if(view == 'card') {
    // prid: the printing the card was opened on (search row, deck, printing link), not the default one
    return {view: view, cardid: $('#lastcardid').val() || null, prid: $('#lastcardid').data('prid') || null, qs: $('#lastcardid').data('qs') || null};
  } else if(view == 'list') {
    return {view: view, listid: $('#lastlistid').val() || null};
  }
  return {view: view};
}
// point the address bar at state: a new history entry, or the current one when replace (redrawing the
// same view, e.g. card prev/next), when the url already says this, or when it's urlparser's draw
function seturl(state, replace=false) {
  if(!urlready) {
    return;
  }
  var restoring = urlrestoring;
  urlrestoring = null;
  var hash = statehash(state);
  if(statehash(hashstate(location.hash)) == hash || restoring == state.view) {
    replace = true;
  }
  if(replace) {
    history.replaceState(state, '', hash);
  } else {
    history.pushState(state, '', hash);
  }
}

// showview() without touching the url
function showviewkeepurl(view) {
  var ready = urlready;
  urlready = false;
  showview(view);
  urlready = ready;
}

// Back/Forward, and a hash typed in the address bar or set by a link (keyword links): draw what the url says
$(window).on('popstate', function (e) {
  console.log(['popstate',e.originalEvent.state,location.hash]);
  // phones: back/forward shows results or a card, so close the search panel; back to the blank start page opens it, as on load
  mobilesearchtoggle(narrowscreen() && !location.hash.replace(/#game=[^#]*/,''));
  // no state: a link or a typed url, which keeps the form's filters (urlparser)
  urlparser(!e.originalEvent.state);
});

// Keyboard navigation inside a list of cards
$(document).on('keydown', function ( e ) {
    if(e.target.nodeName=='BODY') {
	if($("#resultcard").is(":visible")) {
	    if(e.key == "ArrowRight") {
		$("#cardnext").click();
	    }
	    if(e.key == "ArrowLeft") {
		$("#cardprev").click();
	    }
	    if(e.key == "Escape") {
		$("#cardclose").click();
	    }
	}
	console.log(e);
    }
});

// filters a search link keeps from the form: format (legality), publisher, and the require_
// checkboxes (Paper only). Links from card fields only carry the field clicked.
var keptsearchfilters = /^(field_legality|field_printing_publisher|require_.*)$/;
// adds the form's kept filters to a search link's request (values of the same field are combined)
function keepsearchfilters(fdata) {
  var values = searchformvalues();
  for(var name in values) {
    if(!keptsearchfilters.test(name)) {
      continue;
    }
    var merged = [].concat(fdata[name] === undefined ? [] : fdata[name], values[name]).map(String);
    merged = merged.filter(function(v, i) { return merged.indexOf(v) == i; });
    fdata[name] = merged.length == 1 ? merged[0] : merged;
    var type = $('#searchform [name="'+name.replace(/^field_/,'type_')+'"]').val();
    if(name.startsWith('field_') && type) {
      fdata[name.replace(/^field_/,'type_')] = type;
    }
  }
}

// keepfilters: a search link (clicked, or typed in the address bar) keeps the form's kept filters.
// Page loads and back/forward to a search show that search as it was.
function urlparser(keepfilters=false) {
  // Load bookmarks / shared urls
  var matchstruct = parsehash(location.hash);
  var hstate = history.state || {};
  urlrestoring = null;
  console.log(['matchstruct',matchstruct]);
  if(typeof(matchstruct["game"]) != "undefined") {
    if((matchstruct["game"] != database) && (matchstruct["game"] != "")) {
      cache_session("database",matchstruct["game"]);
      location.reload();
      return;
    }
  }
  if(typeof(matchstruct["quicksearch"]) != "undefined") {
    console.log("detected quicksearch");
    $("input#qs").val(decodeURIComponent(matchstruct["quicksearch"]));
    urlrestoring = 'search';
    dosearch(0,false,true);
  } else if(typeof(matchstruct["quicksearchtitle"]) != "undefined") {
    console.log("detected quicksearchtitle");
    $("input#field_title").val(decodeURIComponent(matchstruct["quicksearchtitle"]));
    urlrestoring = 'search';
    dosearch(0,false,true);
  } else if(typeof(matchstruct["cardid"]) != "undefined") {
	  console.log("detected card in URL");
	  var cardid = matchstruct["cardid"];
	  var prid = typeof(matchstruct['cnprintingid']) != 'undefined' ? matchstruct['cnprintingid'] : null;
	  // the search it was opened from (prev/next) is kept in the history entry, not the url
	  var qs = hstate.cardid == cardid ? hstate.qs || null : null;
	  if($('#lastcardid').val() == cardid && String($('#lastcardid').data('prid') || '') == String(prid || '')) {
	    showcard();   // already drawn
	  } else {
	    urlrestoring = 'card';
	    if(cache_card_is(cardid)) {
	      docardid(cardid,prid,qs);
	    } else {
	      cardfetch(cardid,prid,qs);
	    }
	  }
  } else if(typeof(matchstruct['listid']) != 'undefined') {
	  console.log(["detected list in URL",matchstruct['listid']]);
	  urlrestoring = 'list';
	  if($('#lastlistid').val() == matchstruct['listid'] && cache_thing("list",matchstruct['listid'])) {
	    showlist();   // already drawn
	  } else if(cache_thing("user","data")) {
	    listinfo(matchstruct['listid'],true);
	  } else if(signedin()) {
	    urlpendinglist = matchstruct['listid'];   // opened by listinfocallback once the directory loads
	  } else {
	    listinfo(matchstruct['listid'],true);   // logged out: a public list, read only (listrequest)
	  }
  } else if(typeof(matchstruct['view']) != 'undefined') {
	  if(matchstruct['view'] == 'settings') {
	    showsettings();
	  } else if($('#result'+matchstruct['view']).length) {
	    showview('result'+matchstruct['view']);
	  }
  } else if(typeof(matchstruct['search']) != 'undefined' && !keepfilters && decodeURIComponent(matchstruct['search']) == $('#lastsearchquery').val()) {
	  showsearch();   // already drawn
  } else if(typeof(matchstruct['search']) != 'undefined') {
	  console.log(["detected search in URL",matchstruct['search']]);
	  urlrestoring = 'search';
	  fdata = uri2json(decodeURIComponent(matchstruct['search']));
	  if(keepfilters) {
	    keepsearchfilters(fdata);
	  }
	  // the form shows exactly what's searched: cleared, then filled from the url (and the kept filters)
	  if($('#selectsloaded').length) {
	    fillsearchform(fdata);
	  } else {
	    populatecallback.push(function() {fillsearchform(fdata);});
	  }
	  if('sort' in fdata) {
	    changesort('search',fdata['sort'],false);
	  }
	  dosearch(0,fdata);
  } else {
    // nothing asked for: the start page (phones: the search form), left as the blank url it is
    showviewkeepurl(narrowscreen() ? 'resultsearch' : 'resultabout');
  }
}

// this builds the search form after all 'select' data is loaded
function initializeform(db) {
  var fdata = $.map(searchables[db],function( value,key ) {
	  console.log(["initialize form: ",key,value]);
	  if(key == "quick") { return ''; }
	  if(value.type == "hidden") { return ''; }
	  if(value.type == "require") {
	    // a checkbox that sends require_<field>=<value>: ANDed with the rest of the search,
	    // including the field's own select (ootv-search routes/search.js)
	    var rname = 'require_'+value.field.replace("printing.","printing_");
	    return '<dt'+(value.advanced?' class="advanced"':'')+'>'+labels[db]["short"+key]+'</dt><dd'+(value.advanced?' class="advanced"':'')+'>'+
	      '<label><input type="checkbox" id="'+rname+'" name="'+rname+'" value="'+value.value+'"> '+labels[db]["tag"+key]+'</label></dd>';
	  }
	  var nound = key.replace("printing.","printing_");
	  var nop = key.replace("printing.","").replace("card",'');
	  var ret = '<input type="hidden" name="type_'+nound+'" value="'+value.type+'">'+
	      '<dt'+(value.advanced?' class="advanced"':'')+'>'+labels[db]["short"+nop]+'</dt><dd'+(value.advanced?' class="advanced"':'')+'>';
	  switch(value.type) {
	  case "text":
	    ret += '<input type="text" id="field_'+nound+'" name="field_'+nound+'">';
	    break;
	  case "exists":
	    ret += '<input type="checkbox" id="field_'+nound+'" name="field_'+nound+'" value=1>';
	    break;
	  case "keyword":
	    ret += '<input type="text" id="field_'+nound+'" name="field_'+nound+'">';
	    break;
	  case 'numeric':
	    ret += '<input class="searchnumeric" type="text" size="2" name="field_lower_'+nound+'">&nbsp;to&nbsp;<input class="searchnumeric" type="text" size="2" name="field_upper_'+nound+'">';
	    break;
	  case 'select':
	    ret += selectfield(db,key);
	    break;
	  }
	  return ret+'</dd>'
  });
  //console.log(["forms initialized",fdata]);
  $('#searchmiddle').html(fdata.join("\n"));
  $('#searchmiddle').append('<input type="hidden" name="selectsloaded" id="selectsloaded" value="1">');
  while (populatecallback.length){
	  populatecallback.shift().call();
  }
  chosenify();
  $('dd.advanced').hide();
  $('dt.advanced').hide();
  rendersavedsearches();
  applysearchdefault();
}

// a search form select, from the cached values
function selectfield(db,key) {
  var nound = key.replace("printing.","printing_");
  if(searchables[db][key]['sub'] !== undefined) {
    var noundsub = searchables[db][key]['sub'].replace("printing.","printing_");
    var sel = cache_select(key);
    return makeselectarray([''].
                           concat(!Array.isArray(sel)?
                                  Object.keys(sel):
                                  sel.map(function(x){var a = {}; a[Object.keys(x)[0]] = Object.keys(x[Object.keys(x)[0]]); return a;})),
                           {id: 'field_'+nound, name: 'field_'+nound, onchange: "onchangesub('"+key+"','"+nound+"','"+noundsub+"','"+db+"');" });
  }
  return makeselectarray([''].concat(cache_select(key)),{id: 'field_'+nound, name: 'field_'+nound});
}

// changes values for a select chained to another select
function onchangesub(key,nound,noundsub,db) {
  console.log(key,nound,noundsub,db);
  var fval = $('#field_'+noundsub).val();
  $('#field_'+noundsub+'_chosen').remove();
  var newvals = [];
  var sel = cache_select(key);
  if(//!Array.isArray(sel[0])) {
    Array.isArray(sel)) {
    var sel2 = {};
    sel.map(function(x){Object.assign(sel2,x[Object.keys(x)[0]]);});
    sel=sel2;
  }
  console.log(sel);
  if(Array.isArray($('#field_'+nound).val())) {
    if($('#field_'+nound).val().length < 1 ) {
      newvals = cache_select(searchables[db][key]['sub']); 
    } else {
	    $('#field_'+nound).val().forEach(function(q) {
	      newvals = newvals.concat(sel[q]);   // TODO HERE - ugh   [???][q]
	    });
    }
  } else {
	  newvals = $('#field_'+nound).val() ?
	    sel[$('#field_'+nound).val()] :     // HERE   this one too
	    cache_select(searchables[db][key]['sub'])
  }
  $('#field_'+noundsub).replaceWith(
	  makeselectarray([''].concat([...new Set(newvals)].sort()),
			              {id: 'field_'+noundsub, name: 'field_'+noundsub}
		               )
  );
  $('#field_'+noundsub).val(fval);
  chosenify();
}

// admin login log: newest 50 per page from /loginlog (site admins only).
// cursors_loginlog[n] is the `before` cursor for page n, so Newer can step back.
var cursors_loginlog = [null];
var page_loginlog = 0;
function loadloginlog(page) {
  if(page === undefined) { page = 0; }
  if(page === 0) { cursors_loginlog = [null]; }
  $('#admindoc').empty();
  $('#discordadmin').empty();
  $('#updatelogpage').empty();
  $('#massimage, #setimport, #importprofiles').hide();
  $('#loginlog').html('Loading login log...');
  var data = { uid: getuid(), limit: 50 };
  if(cursors_loginlog[page]) { data.before = cursors_loginlog[page]; }
  $.ajax({
    type: 'GET',
    url: apiuri+"/loginlog",
    data: data,
    dataType: 'json',
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
    success: function(raw) {
      page_loginlog = page;
      cursors_loginlog[page+1] = raw.next;
      raw.entries.forEach(function(e) { e.timelocal = new Date(e.time).toLocaleString(); });
      // short name of the viewer's time zone for the Time header (e.g. "CDT"); times are shown in it
      var tz = '';
      try {
        tz = Intl.DateTimeFormat(undefined, {timeZoneName: 'short'}).formatToParts(new Date())
          .find(function(p) { return p.type === 'timeZoneName'; }).value;
      } catch(e) {}
      $('#loginlog').html($.templates("#template-loginlog").render({entries: raw.entries, next: raw.next, page: page, tz: tz}));
    },
    error: function(raw) {
      console.log(['loadloginlog fail',raw]);
      $('#loginlog').text('Could not load the login log: '+((raw.responseJSON && raw.responseJSON.error) || raw.status));
    }
  });
}

// admin Discord bot settings: oracle-all-discord through /discord (site admins only). One row per
// guild + channel, channel "*" being the server's own row; see docs/admin/discord-bot.md.
var discordgames = [], discordcommands = [];
// what each bot command does, shown beside its name (a server can rename them); others show their key
var discordcommandlabels = {card: 'One card', search: 'Search', oraclebug: 'Bug report'};
function loaddiscord(note) {
  $('#loginlog').empty();
  $('#admindoc').empty();
  $('#updatelogpage').empty();
  $('#massimage, #setimport, #importprofiles').hide();
  if(!note) { $('#discordadmin').text('Loading Discord bot settings...'); }
  $.ajax({
    type: 'GET',
    url: apiuri+"/discord",
    data: { uid: getuid() },
    dataType: 'json',
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
    success: function(raw) {
      discordgames = raw.games;
      discordcommands = raw.commands;
      renderdiscord(raw.rows);
      if(note) { $('#discordadmin').prepend($('<p class="discordnote">').text(note)); }
    },
    error: function(raw) {
      console.log(['loaddiscord fail',raw]);
      $('#discordadmin').text('Could not load the Discord bot settings: '+((raw.responseJSON && raw.responseJSON.error) || raw.status));
    }
  });
}
// the fields a channel filter can use: the game's select fields (printing.publisher, clan, ...)
function discordfields(game) {
  if(!game || !searchables[game]) { return []; }
  return Object.keys(searchables[game]).filter(function(k) {
    return searchables[game][k] && searchables[game][k].type == 'select';
  });
}
// one line per filter value; a field that isn't a select any more still shows
function discordfilterrows(game, filters) {
  var fields = discordfields(game);
  var rows = [];
  (filters || []).forEach(function(f) {
    [].concat(f.values).forEach(function(v) {
      rows.push({field: f.field, value: v, require: f.require === true,
                 fields: fields.indexOf(f.field) < 0 ? fields.concat([f.field]) : fields});
    });
  });
  return rows;
}
function renderdiscord(rows) {
  var guilds = {};
  rows.forEach(function(r) {
    var g = guilds[r.guild] || (guilds[r.guild] = {guild: r.guild, settings: null, channels: []});
    var row = $.extend({}, r, {filterrows: discordfilterrows(r.game, r.filters)});
    if(r.channel == '*') { g.settings = row; } else { g.channels.push(row); }
  });
  var label = function(r) { return r.name || r.channel || r.guild; };
  var list = Object.keys(guilds).map(function(k) {
    var g = guilds[k];
    if(!g.settings) { g.settings = {guild: g.guild, channel: '*', name: '', filterrows: [], unsaved: true}; }
    g.channels.sort(function(a,b) { return label(a).localeCompare(label(b)); });
    g.newchannel = {guild: g.guild, channel: '', isnew: true, filterrows: []};
    return g;
  }).sort(function(a,b) { return label(a.settings).localeCompare(label(b.settings)); });
  $('#discordadmin').html($.templates("#template-discord").render(
    {guilds: list, newguild: {guild: '', channel: '*', isnew: true, newguild: true, filterrows: []}},
    {games: discordgames, commands: discordcommands, cmdlabels: discordcommandlabels}));
}
function discordgamechange(sel) {
  var fields = discordfields($(sel).val());
  $(sel).closest('tr').find('select[name=ffield]').each(function() {
    var cur = $(this).val();
    $(this).html($.map(fields.indexOf(cur) < 0 && cur ? fields.concat([cur]) : fields, function(f) {
      return $('<option>').val(f).text(f).prop('selected', f == cur);
    }));
  });
}
function discordaddfilter(btn) {
  var tr = $(btn).closest('tr');
  var game = tr.find('select[name=game]').val();
  if(!game) {
    tr.find('.discordmsg').text('Pick a game first: filters apply to searches in that game.');
    return;
  }
  var fields = discordfields(game);
  $(btn).before($.templates("#template-discord-filter").render({field: fields.indexOf('printing.publisher') >= 0 ? 'printing.publisher' : fields[0], value: '', fields: fields}));
}
// suggestions for a filter value: the field's values from /attributes, once per game and field
function discordvalues(input) {
  var tr = $(input).closest('tr');
  var game = tr.find('select[name=game]').val();
  var field = $(input).closest('.discordfilter').find('select[name=ffield]').val();
  if(!game || !field) { return; }
  var id = 'discordvalues-'+game+'-'+field.replace(/[^\w-]/g,'_');
  $(input).attr('list', id);
  if(document.getElementById(id)) { return; }
  var dl = $('<datalist>').attr('id', id).appendTo('#discordadmin');
  $.ajax({
    type: 'POST',
    url: apiuri+"/attributes",
    data: { table: game, lookup: field },
    dataType: 'json',
    success: function(raw) {
      var vals = [];
      [].concat(raw).forEach(function(v) {
        if(v && typeof v === 'object') { Object.keys(v).forEach(function(k) { vals = vals.concat(v[k]); }); }
        else { vals.push(v); }
      });
      dl.html($.map(vals, function(v) { return $('<option>').val(v); }));
    }
  });
}
// the row as /discord takes it; IDs stay strings (jQuery .data() would turn them into numbers)
function discordrowdata(tr) {
  var row = {
    guild: tr.attr('data-guild') || $.trim(tr.find('input[name=guild]').val()),
    channel: tr.attr('data-channel') || $.trim(tr.find('input[name=channel]').val()),
    name: $.trim(tr.find('input[name=name]').val()),
    game: tr.find('select[name=game]').val(),
    filters: []
  };
  // lines for the same field join one filter (any of its values), the required ones another
  tr.find('.discordfilter').each(function() {
    var field = $(this).find('select[name=ffield]').val();
    var value = $.trim($(this).find('input[name=fvalue]').val());
    var require = $(this).find('input[name=frequire]').prop('checked');
    if(!field || !value) { return; }
    var f = row.filters.find(function(x) { return x.field == field && !!x.require == require; });
    if(f) { f.values.push(value); }
    else { row.filters.push(require ? {field: field, values: [value], require: true} : {field: field, values: [value]}); }
  });
  if(row.channel == '*') {
    // every command under its own name is the default, so leave commands out then
    var commands = {}, defaults = true;
    discordcommands.forEach(function(c) {
      var on = tr.find('input[name=cmd_'+c+']').prop('checked');
      var name = $.trim(tr.find('input[name=cmdname_'+c+']').val()).toLowerCase();
      if(on && name) { commands[c] = name; }
      if(!on || name != c) { defaults = false; }
    });
    if(!defaults) { row.commands = commands; }
  }
  return row;
}
function discordpost(tr, data, note) {
  tr.find('.discordmsg').text('Saving...');
  data.uid = getuid();
  $.ajax({
    type: 'POST',
    url: apiuri+"/discord",
    data: JSON.stringify(data),
    contentType: 'application/json',
    dataType: 'json',
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
    success: function() { loaddiscord(note); },
    error: function(raw) {
      console.log(['discordpost fail',raw]);
      tr.find('.discordmsg').text('Not saved: '+((raw.responseJSON && raw.responseJSON.error) || raw.status));
    }
  });
}
function discordsave(btn) {
  var tr = $(btn).closest('tr');
  var row = discordrowdata(tr);
  var note = 'Saved '+(row.name || row.channel)+'. The bot uses it within 5 minutes.';
  if(row.channel == '*') {
    note += ' If this server is new or its commands changed, run scripts/register-commands.js '+row.guild+' in ootv-discord.';
  }
  discordpost(tr, {action: 'put', row: row}, note);
}
function discorddelete(btn) {
  var tr = $(btn).closest('tr');
  var guild = tr.attr('data-guild'), channel = tr.attr('data-channel');
  var what = channel == '*' ? 'the server default row of '+guild+' (its channel rows stay)' : 'channel '+channel;
  if(!confirm('Delete '+what+'?')) { return; }
  discordpost(tr, {action: 'delete', guild: guild, channel: channel}, 'Deleted '+what+'.');
}
// how many cards the row's game and filters leave, through the public /search
function discordtest(btn) {
  var tr = $(btn).closest('tr');
  var row = discordrowdata(tr);
  var out = tr.find('.discordcount');
  if(!row.game) { out.text('no game: every game'); return; }
  var data = { table: row.game, querystring: '*', size: 1 };
  row.filters.forEach(function(f) {
    var name = f.field.replace(/\./g, '_');
    if(f.require) {
      data['require_'+name] = f.values;
      return;
    }
    data['field_'+name] = f.values;
    data['type_'+name] = 'select';
  });
  out.text('counting...');
  $.ajax({
    type: 'POST',
    url: apiuri+"/search",
    data: data,
    traditional: true,
    dataType: 'json',
    success: function(raw) {
      var total = typeof raw.hits.total === 'object' ? raw.hits.total.value : raw.hits.total;
      out.text(total+' '+row.game+' cards');
    },
    error: function(raw) { out.text('search failed: '+raw.status); }
  });
}

// admin docs: docs/admin/<name>.md (published by deploy.yml), rendered with marked loaded on demand.
// Links to another docs/admin .md file open in the same viewer.
var markedurl = 'https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js';
function loadadmindoc(name) {
  $('#loginlog').empty();
  $('#discordadmin').empty();
  $('#updatelogpage').empty();
  $('#massimage, #setimport, #importprofiles').hide();
  $('#admindoc').text('Loading '+name+'...');
  var loadmarked = window.marked ? $.Deferred().resolve() : $.ajax({url: markedurl, dataType: 'script', cache: true});
  $.when(loadmarked, $.ajax({url: 'docs/admin/'+name+'.md', dataType: 'text', cache: false}))
    .done(function(m, doc) {
      $('#admindoc').html(marked.parse(doc[0]));
      $('#admindoc a[href]').each(function() {
        var href = $(this).attr('href');
        var local = /^(?:\.\/)?([\w-]+)\.md(#.*)?$/.exec(href);
        if(local) {
          $(this).attr('href', '').on('click', function() { loadadmindoc(local[1]); return false; });
        } else if(/^https?:/.test(href)) {
          $(this).attr('target', '_blank');
        }
      });
    })
    .fail(function(raw) {
      console.log(['loadadmindoc fail',raw]);
      $('#admindoc').text('Could not load '+name+': '+(raw.status || raw));
    });
}

// cards linked per updatelog row; matches FETCH_PER_ROW in ootv-search routes/updatelog.js
const updatelogshown = 10;
// /updatelog?fetchcards=true -> one template-updatelog row per log entry, newest first.
// Caches the fetched cards. A bulkupdate can list thousands of cards: link only the
// first updatelogshown (the ones the API fetched) and count the rest, so the page
// doesn't build a link per card. Long card lists (and rows with a description and more
// than one card) start collapsed; one card is shown inline, no cards (a mass image upload)
// shows nothing.
function updatelogrows(raw, db) {
  raw.cards.hits.hits.map(x=>x._source).map(imagehashtourl).forEach(function(dataitem) {
    cache_card(dataitem);
  });
  return raw.logs.map(function(uplog) {
    var printlog = JSON.parse(JSON.stringify(uplog));
    printlog.timestamp = new Date(printlog.timestamp).toLocaleString();
    var cardids = printlog.cardids || [];
    printlog.total = cardids.length;
    printlog.cards = cardids.slice(0, updatelogshown).map(function(uplogcard) {
      var card = cache_card_fetch(uplogcard);
      return { cardid: uplogcard, database: db,
               title: card.title ? card.title[0] : 'card #'+uplogcard };
    });
    printlog.more = printlog.total - printlog.cards.length;
    printlog.collapse = printlog.total > 5 || (printlog.total > 1 && !!printlog.description);
    return printlog;
  });
}

function loadupdates(db,start=null) {
  // TODO: set timer for start on max last card
  var req = { 
    type: 'GET',
    url: apiuri+"/updatelog",
    data: {
      table: database,
      limit: 110, 
      fetchcards: true
    },
    contentType: 'application/json',
    dataType: 'json',
    responseType: 'application/json',
    success: function(raw) {
      console.log(['loadupdates success',raw]);
      var updatelogtemplate = $.templates("#template-updatelog");
      updatelogrows(raw, database).reverse().forEach(function(printlog) {
        $('#updatelog').prepend(updatelogtemplate.render(printlog));
      });
    },
    error: function(raw) {
      console.log(['loadupdates fail',raw]);
    }
  };
  if(start) {
    req.data['mintime'] = start;
  }
  $.ajax(req);
}

// admin update log: this game's oracle-all-updatelog, newest first, a page at a time, with
// filters (text, name, operation, date range). /updatelog returns at most updatelogpagesize
// rows and `next`, the maxtime of the following (older) page; cursors_updatelog[n] is page
// n's maxtime. The names and operations for the form come once per game (facets).
const updatelogpagesize = 30;
var cursors_updatelog = [null], page_updatelog = 0, updatelogfilter = {}, updatelogfacets = {};
function loadupdatelogpage() {
  $('#loginlog').empty();
  $('#discordadmin').empty();
  $('#admindoc').empty();
  $('#massimage, #setimport, #importprofiles').hide();
  $('#updatelogpage').html($.templates("#template-updatelogpage").render({name: dbinfo[database].name}));
  updatelogfacetsfill();
  updatelogsearch();
}

// the form -> updatelogfilter, then its first page. Dates are local days: from = since that
// day's midnight, to = through the end of that day (mintime/maxtime are exclusive).
function updatelogsearch() {
  var f = {db: database};
  ['q', 'uname', 'operation'].forEach(function(k) {
    var v = $.trim($('#updatelog-'+k).val() || '');
    if(v) { f[k] = v; }
  });
  var from = $('#updatelog-from').val(), to = $('#updatelog-to').val();
  if(from) { f.mintime = new Date(from+'T00:00:00').getTime() - 1; }
  if(to) { var end = new Date(to+'T00:00:00'); end.setDate(end.getDate()+1); f.maxtime = end.getTime(); }
  updatelogfilter = f;
  cursors_updatelog = [f.maxtime || null];
  updatelogshow(0);
}

function updatelogclear() {
  $('#updatelogform input[type=text], #updatelogform input[type=date], #updatelogform select').val('');
  updatelogsearch();
}

function updatelogfacetsfill() {
  var facets = updatelogfacets[database];
  if(!facets) { return; }
  $('#updatelog-unames').html(facets.unames.map(u => $('<option>').attr('value', u)));
  $('#updatelog-operation').append(facets.operations.map(o => $('<option>').attr('value', o).text(o)));
}

function updatelogshow(page) {
  var f = updatelogfilter, db = f.db;
  if(db != database) { loadupdatelogpage(); return; }   // the game changed under the page
  $('#updatelogresults').html('Loading the update log...');
  var data = { table: db, limit: updatelogpagesize, fetchcards: true };
  ['q', 'uname', 'operation', 'mintime'].forEach(function(k) { if(f[k]) { data[k] = f[k]; } });
  if(cursors_updatelog[page]) { data.maxtime = cursors_updatelog[page]; }
  if(!updatelogfacets[db]) { data.facets = true; }
  $.ajax({
    type: 'GET',
    url: apiuri+"/updatelog",
    data: data,
    dataType: 'json',
    success: function(raw) {
      if(f !== updatelogfilter) { return; }   // a newer search went out meanwhile
      if(raw.facets && !updatelogfacets[db]) { updatelogfacets[db] = raw.facets; updatelogfacetsfill(); }
      page_updatelog = page;
      // an API without `next`: a full page may have more behind it
      var next = 'next' in raw ? raw.next :
                 raw.logs.length == updatelogpagesize ? raw.logs[raw.logs.length-1].timestamp : null;
      cursors_updatelog[page+1] = next;
      $('#updatelogresults').html($.templates("#template-updatelogresults").render(
        {rows: updatelogrows(raw, db), next: next, page: page, filtered: !!(f.q || f.uname || f.operation || f.mintime || f.maxtime)}));
    },
    error: function(raw) {
      console.log(['updatelogshow fail',raw]);
      $('#updatelogresults').text('Could not load the update log: '+((raw.responseJSON && raw.responseJSON.error) || raw.status));
    }
  });
}

function loadselectables(db) {
  $.each(searchables[db],function( key, value ) {
	  if(value.type == 'select' || key.match(/\.(sortregex|derived)$/)) {
	    if(cache_select(key)) {
		    console.log('select cached: '+key);
		    if(!(Date.now() - cache_thing("searchselecttime",key) < selectmaxage)) {
		      refreshselect(db,key);
		    }
	    } else {
		    console.log('load select initiate: '+key);
		    if(searchables[db][key]['sub'] !== undefined) {
		      updateselectmulti(key,searchables[db][key]['sub']);
		    } else {
		      updateselect(key);
		    }
		    searchselectload[key] = 1;
	    }
	  } else {
	    console.log('load select NOT initiate: '+key);
	  }
  });
  // if everything is cached, do updatecallbacks to remove holds
  if(updatecallback[database] !== undefined) {
	  updatecallback[database]();
  } else {
	  updatecallbackgeneral(database);
  }
}

// Cached selects (sets, rarities, legalities, sortregex, ...) are drawn from localStorage straight
// away. One cached longer than selectmaxage (or never timestamped) is refetched in the background,
// and if the data changed, the cache and its form field are updated in place, keeping the selection.
var selectmaxage = 60*60*1000;
function refreshselect(db,key) {
  var sub = searchables[db][key]['sub'];
  $.ajax({
	  type: 'POST',
	  url: apiuri+"/attributes",
	  data: {
	    table: db,
	    lookup: sub !== undefined ? key+":"+sub : key,
      optgroup: 1
	  },
	  contentType: 'application/json',
	  dataType: 'json',
	  responseType: 'application/json',
	  success: function(raw) {
	    if(db != database) { return; }
	    if(JSON.stringify(raw) == JSON.stringify(cache_select(key))) {
		    cache_thing("searchselecttime",key,Date.now());
		    return;
	    }
	    console.log("select changed, refreshing: "+key);
	    cache_select(key,raw);
	    refreshselectfield(db,key);
	    if(key == "legality" || key == "printing.set") {
		    redrawcardforselect();
	    }
	  },
	  error: function(error) {
    	console.log("Epic Fail: select refresh: "+key);
	  }
  });
}
// redraw one search form select from the cache, keeping what is selected
function refreshselectfield(db,key) {
  var nound = key.replace("printing.","printing_");
  if(searchables[db][key].type != 'select' || !$('#field_'+nound).length) {
	  return;   // not a form field, or the form isn't drawn yet (it will draw from the new cache)
  }
  // a select chained from another (rarity from set) is redrawn through its parent, which filters it
  var parent = Object.keys(searchables[db]).find(function(k) { return searchables[db][k]['sub'] == key; });
  if(parent && $('#field_'+parent.replace("printing.","printing_")).length) {
	  onchangesub(parent,parent.replace("printing.","printing_"),nound,db);
	  return;
  }
  var val = $('#field_'+nound).val();
  $('#field_'+nound+'_chosen').remove();
  $('#field_'+nound).replaceWith(selectfield(db,key));
  $('#field_'+nound).val(val);
  chosenify();
  // the select chained to this one (set -> rarity) takes its values from this one
  if(searchables[db][key]['sub'] !== undefined) {
	  onchangesub(key,nound,searchables[db][key]['sub'].replace("printing.","printing_"),db);
  }
}

function updatecallbackgeneral(db) {
  $.each(searchselectload,function(key,value) {
	  if(cache_select(key)) {
	    console.log("removing select callback: "+key);
	    delete searchselectload[key];
	  }
  });
  if(Object.keys(searchselectload).length<1 && !$('#selectsloaded').length) {
	  console.log("all select callbacks removed");
	  initializeform(db);
  }
}

// ********************** GENERIC HELPERS ************************
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    console.log("url: " + window.location.href);
    console.log("name: " + name);
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?#&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    console.log("results: " + results);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// like php htmlspecialchars()
function htmlEncode(value){
  return $('<textarea/>').text(value).html();
}

// invert the above
function htmlDecode(value){
  return $('<textarea/>').html(value).text();
}

// parse html into json structure
function uri2json(uri) {
  return uri.split('&').map(function(i) {
	  return i.split('=');
  }).reduce(function(memo, i) {
	  var v = i[1] == '' ? '' : (i[1] == +i[1] ? parseFloat(i[1],10) : decodeURIComponent(i[1]));
	  // a repeated key (two values of a multiple select, e.g. from a Discord bot link) collects
	  // into an array instead of keeping only the last value
	  if(i[0] in memo) {
	    memo[i[0]] = [].concat(memo[i[0]], v);
	  } else {
	    memo[i[0]] = v;
	  }
	  return memo;
  }, {});
}

// make a select with attrs from att.   values and display are identical
function makeselectarray(arr,atts={}) {
  //  console.log(arr);
  var sel = '<select class="chosen-select" multiple '+
    $.map(atts,function(v,i){ // atts pair value id=, name=, etc.
      return i+'="'+v+'"';
    }).join(" ")+'>';
  if(((arr[0] !== '') && (typeof arr[0] === 'string')) || ((arr[0] === '') && (typeof arr[1] === 'string')) ) {
    sel += arr.map(x=>'<option value="'+htmlEncode(x)+'">'+x+'</option>').join("");
  } else {
    arr.forEach(function(category) {
      for(let key in category) {
        sel += '<optgroup label="'+htmlEncode(key)+'">';
        if(Array.isArray(category[key])) {
          sel += category[key].map(x=>'<option value="'+htmlEncode(x)+'">'+x+'</option>').join("");
        } else {
          sel += Object.keys(category[key]).map(x=>'<option value="'+htmlEncode(x)+'">'+x+'</option>').join("");
        }
        sel += '</optgroup>';
      }
    });
  }
  sel += '</select>';
  return sel;
}

// *********************** NAVIGATION ******************
function scrollcheck() {
    // window for no jquery layout containers
    //    if($(window).scrollTop() > $(document).height() - $(window).height() - 100) {
    if($('.ui-layout-center').scrollTop() > $('.ui-layout-center')[0].scrollHeight - $('.ui-layout-center').height() - 200) {
	scrollforceload();
    }
}

// load the next page of an existing search, using the request that started it
function searchnextpage(qs) {
    dosearch(searchcache[database]['querydata'][qs].length, $.extend(true, {}, searchcache[database]['queryrequest'][qs]));
}

function scrollforceload() {
    // ajax call get data from server and append to the div
    if($('.more').length) {
	$('.more').remove();
	searchnextpage($('#lastsearchquery').val());
	$("#resultsearch").append(searcherror['moreloading']);
	// if we want transitions
	// new_element.hide().appendTo('.your_div').fadeIn(); $(window).scrollTop($(window).scrollTop()-1);
    }
}

function changeprinting(id,prid,qs,title) {
  //    console.log({id,prid,qs,title});
  // redraw rather than only show its printing block: the text above follows the version (bubbleup)
  if(cache_card_is(id)) {
    docardid(id,prid,qs||null,false,false);
  } else {
    $('.printing').hide();
    $("#lastprintid").val(prid).data("chosen", true);
    $('.printing[data-printingid='+prid+']').show();
    $("#lastcardid").data('prid', prid);
  }
  seturl(viewstate('card'), true);
  // $('.printing').hide();$('.printing[data-printingid={{:printingid}}]').show();
}

function cardprev(id,qs) {
    var index = searchcache[database]['querydata'][qs].indexOf(id);
    if(index>0) {
	docardid(searchcache[database]['querydata'][qs][index-1],null,qs);
    }
}

// TODO: er.. .lastsearchquery is getting messy with being able to load searches?  or will it work...
function cardnext(id,qs) {
    var index = searchcache[database]['querydata'][qs].indexOf(id);
    if((index >= searchcache[database]['querydata'][qs].length - 5) && (searchcache[database]['querydata'][qs].length < searchpageable(qs))) {
	searchnextpage(qs);
    }
    if(index < searchcache[database]['querydata'][qs].length - 1) {
	docardid(searchcache[database]['querydata'][qs][searchcache[database]['querydata'][qs].indexOf(id)+1],null,qs);
    }
}

// narrow screens (phones): the search sidebar is a slide-over panel, opened from the menubar (body.mobilesearch).
// Phones held sideways count too (coarse pointer, short screen); same query as the phone block in oracle.css.
function narrowscreen() {
    return window.matchMedia('(max-width: 768px), (pointer: coarse) and (max-height: 500px)').matches;
}
function mobilesearchtoggle(open) {
    $('body').toggleClass('mobilesearch', open);
    // start the panel below the menubar (when it's on screen) so the button that toggles it stays reachable
    $('#sidebar').css('top', Math.max(0, $('div.menubar')[0].getBoundingClientRect().bottom));
}
// tapping the results while the panel is open closes it
$(document).on('click', '#maincontent', function() {
    mobilesearchtoggle(false);
});
// menubar Search Results button: go to the search results; if they're already on screen, show/hide the search form
// (the slide-over panel on narrow screens, the sidebar collapse on desktop)
function searchviewbutton() {
    if(currentresulttab() != 'search') {
	showview('resultsearch');
	if(narrowscreen() && !$('#lastsearchquery').val()) {
	    mobilesearchtoggle(true); // no search yet: nothing to show but the form
	}
    } else if(narrowscreen()) {
	mobilesearchtoggle();
    } else if($('#sidebar').is(':visible')) {
	sidebarcloser();
    } else {
	sidebaropener();
    }
}
function sidebarcloser() {
    if(narrowscreen()) {
	mobilesearchtoggle(false);
	return;
    }
    $('#sidebar').hide();
    $('#sidebaropener').show();
}
function sidebaropener() {
    $('#sidebar').show();
    $('#sidebaropener').hide();
}

//TDOO;  maybe ex should go back to search period - maybe scrolling through cards in search should do replacestate
//TODO:  going back to top level should clear search.
//TODO: button to reset/clear search  (escape as a keystroke as well?)
//TODO:  better right/left buttons
//TODO: right after a search, if right arrow is hit before any other keystroke, open first card in the list
//TODO:  keywords in search results clickable to make new search, etc.
//TODO: inside cardtemplate, choose picture corresponding to the search if a particular set

// ********************* CACHING ********************
// ** searchcache could overrun localstorage pretty fast, so cache searches/cards in memory
function cache_card(carddata) {
    searchcache[database]['data'][carddata.cardid] = carddata;
}
function cache_card_remove(cardid) {
  delete searchcache[database]['data'][cardid];
}
function cache_card_fetch(cardid) {
  if(searchcache[database]['data'][cardid]) {
    return     JSON.parse(JSON.stringify(searchcache[database]['data'][cardid]));
  } else {
    return {};
  }

}
function cache_card_is(cardid) {
    return searchcache[database]['data'].hasOwnProperty(cardid);
}

// cache selects, and login info more absolutely
function cache_select(sel,selval=null) {
    if(selval !== null) {
	cache_thing("searchselecttime",sel,Date.now());
    }
    return cache_thing("searchselect",sel,selval);
}
function cache_thing(thing,sel,selval=null,del=false) {
    // query
    if(selval === null && !del) {
	if (typeof(Storage) !== "undefined") {
	    return JSON.parse(window.localStorage.getItem(database+"_"+thing+"_"+sel));
	} else {
	    return nolocalstore[database+"_"+thing+"_"+sel];
	}
    } else {
	// set
	if (typeof(Storage) !== "undefined") {
	    if(del) {
		window.localStorage.removeItem(database+"_"+thing+"_"+sel);
	    } else {
		window.localStorage.setItem(database+"_"+thing+"_"+sel,JSON.stringify(selval));
	    }
	} else {
	    if(del) {
		delete nolocalstore[database+"_"+thing+"_"+sel]
	    } else {
		nolocalstore[database+"_"+thing+"_"+sel] = selval;
	    }
	}
    }
}
function cache_session(thing,selval=null) {
  if(selval === null) {
	  if (typeof(Storage) !== "undefined") {
	    return JSON.parse(window.localStorage.getItem("session_"+thing));
	  } else {
	    return nolocalstore["session_"+thing];
	  }
  } else {
	  // set
	  if (typeof(Storage) !== "undefined") {
	    if(selval === undefined) {
		    window.localStorage.removeItem("session_"+thing);
	    } else {
		    window.localStorage.setItem("session_"+thing,JSON.stringify(selval));
	    }
	  } else {
	    if(selval === undefined) {
		    delete nolocalstore["session_"+thing]
	    } else {
		    nolocalstore["session_"+thing] = selval;
	    }
	  }
  }
}


//**********************************************************  modal window ****************

function modal(title,content) {
    $('#modal-title').html(title);
    $('#modal-content').html(content);
    $('#modal').css('display','block');
    chosenify();
}

function modalconfirm(title,content,handler,contentafter='') {
  $('#modal-title').html(title);
  $('#modal-content').html(content+$('#modalconfirm').html().replace("CONFIRMYES",handler)+contentafter);
  $('#modal').css('display','block');
  chosenify();
}

function erasemodal() {
    $('#modal-content').html('');
    $('#modal-title').html('');
}

function nomodal() {
    $('#modal').css('display','none');
}
function generalnomodal(div,event) {
    if(event.target == div) {
	nomodal();
    }
}
