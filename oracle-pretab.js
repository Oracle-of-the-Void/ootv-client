//TODO
// maybe look at jquery mobile
// TODO:  allow for multiple display formats... a way to select another format
// TODO: selectable change operations on text:   regexp/match/etc
// TODO: loading symbol on fetchcard (since it's ajax)

	/*
	  general stuff: { "sort": [ "random", "_script", { "default": "cardtitle" } ],
	                   "size": int,
                           "table": gametablestub }

    keyword for text field, not for int
var sort = [
	{   'cost.keyword': {"order" : "asc"} }
    ];
datarequest['sort'] = JSON.stringify(sort);

field_field_name -> input
type_field_name -> hidden as below

quick: passed as querystring, no type needed   -> query_string/query (lucene)
text: [ ... ],         -> match (fulltext keywords) - Operator: AND

regexp: [ ... ],    -> regexp
wildcard
match_and
match_or
match_phrase

select: [ ... ],       -> term  (case sensitive)
keyword: [ ... ]       -> match_phrase or match  (case insensitive)

need to be more specific:  what's int vs. text  for (range) and (sort)

	*/

$.views.settings.allowCode(true);
$.views.tags("printingidfromset",templateprintingidfromset);
$.views.tags("imagehashfromset",templateimagehashfromset);
$.views.tags("printingfromid",templateprintingfromid);
$.views.converters("formatDate", function(val) {
    return (new Date(val)).toLocaleDateString('en-US', {
	day:   'numeric',
	month: 'long',
	year:  'numeric'
    });
});
    
var apiuri = "https://api.oracleofthevoid.com";
// https://sweve5sd4d.execute-api.us-east-1.amazonaws.com
var searchcache = {};
// potential for language stuff:
const searcherror = {'empty': '<div class="error"><img src="res/splatout-150.png"><br>No cards found.</div>',
		     'error': '<div class="error"><img src="res/splatout-150.png"><br>Something went wrong with the search.</div>',
		     'more': '<div class="more">More Results</div>',
		     'moreloading': '<div class="moreloading">Loading <img width=20 src="res/shuriken-150x150.png-animated.gif" /></div>',
		     'loading': '<img src="res/shuriken-150x150.png-animated.gif" />',
		     'numresults': '<div class="numresults">XXX cards found</div><br>',
		     'searchmiddle': 'Loading more search terms <img width=25 src="res/shuriken-150x150.png-animated.gif" />'
		    };
var oraclelayout;
var nolocalstore = {};
var searchables = {};
var searchselectload = {};
var searchtemplate = [];
var templateload = {};
var templateactive = {};
var updates = {};
var updatecallback = {};
var cardtemplate = [];
var listtemplate = [];
var database = 'l5r';
var labels = {};
var populatecallback = [];
var auth;
var authinfo;
var sort = {};
var headerize = {};
var refreshauthvar;

// *************************     AUTHENTICATION   *******************************
function dologin() {
    auth.getSession();
}
function dologout() {
    authinfo = '';
    auth.signOut();
}
function logoutcallback() {
    console.log("Not logged in");
    $('#loginfo').html("Not&nbsp;logged&nbsp;in");
    $('#loginbutton').show();
    $('#logoutbutton').hide();
}
function logincallback(session) {
    if (session) {
	authinfo = auth.getCachedSession().idToken.payload;
        console.log("Logged in");
        $('#loginfo').html(authinfo.name+"&nbsp;("+authinfo.email+")");
 	$('#loginbutton').hide();
 	$('#logoutbutton').show();
    }
    if(window.location.href.includes("#access_token") || window.location.href.includes("?code=")) {
	window.location = location.protocol + '//' + location.host + location.pathname;
    }
    refreshauthvar = setTimeout(refreshauth,45*60*1000); // refresh every 45 min...   tokens last 1h
    if(cache_thing("user","data")) {
	userinfocallback();
    } else {
	userinfo();
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
	    //				alert("Error!" + err);
	}
    };
    auth.useCodeGrantFlow()
    return auth;
}
function refreshauth() {
    clearTimeout(refreshauthvar);
    let user = auth.getCachedSession();
    auth.refreshSession(user.getRefreshToken().getToken());
    console.log("Session refreshed");
    refreshauthvar = setTimeout(refreshauth,45*60*1000); // refresh every 45 min...   tokens last 1h
}
function getidtoken() {
    return auth.getCachedSession().idToken.jwtToken;
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
    hellotemplate = $.templates("#template-hello");
    $(".helloplace").replaceWith(hellotemplate.render({cognito: cache_thing("user","data").cognito, oracle: cache_thing("user","data").oracle[0]}));
    //	  $(".infoplace:first-child").before(hellotemplate.render({cognito: data.cognito, oracle: data.oracle[0]}));
}
function getuid() {
    return cache_thing("user","data").oracle[0].uid;
}

//**********************88     LIST STUFFF ****************88
function listinfo(listid=null) {
  $.ajax({
      type: 'GET',
      url: apiuri+"/list?uid="+getuid()+(listid?"&listid="+listid:""),
      contentType: 'application/json',
      dataType: 'json',
      beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
      responseType: 'application/json',
      success: function(data) {
	  console.log(data);
	  if(listid) {
	      cache_thing("list",listid,data);
	  } else {
	      cache_thing("list","data",data);
	  }
	  listinfocallback();
      },
      error: function(error) { console.log("Epic Fail: "+JSON.stringify(error)); }
  });
}
function listinfocallback() {
//    hellotemplate = $.templates("#template-hello");
//    $(".helloplace").replaceWith(hellotemplate.render({cognito: cache_thing("list","data").cognito, oracle: cache_thing("list","data").oracle[0]}));
    //	  $(".infoplace:first-child").before(hellotemplate.render({cognito: data.cognito, oracle: data.oracle[0]}));
}


//   *********************************   fetching / querying the api ******************8
// TODO: sometimes this fails if I do a card not primed from c/p
//   e.g: https://dev.oracleofthevoid.com/#cardid=999
function cardfetch(cardid,prid=null,qs=null) {
  $.ajax({
    type: 'GET',
    url: apiuri+"/oracle-fetch?table="+database+"&cardid="+cardid,
    contentType: 'application/json',
    dataType: 'json',
    responseType: 'application/json',
      success: function(data) {
	  cache_card(data);
	  docard(data,prid,qs);
    },
    error: function(error) { console.log("Epic Fail: "+error); }
  });
}
function listprefetch(listids,callback=null) {
  $.ajax({
    type: 'GET',
      url: apiuri+"/oracle-fetch?table="+database+"&cardid="+listids.join(),
    contentType: 'application/json',
    dataType: 'json',
    responseType: 'application/json',
      success: function(data) {
	  console.log(data);
	  if(Array.isArray(data)) {
	      data.forEach(function(c) { cache_card(c); });
	  } else if(typeof data == 'object') {
	      cache_card(data);
	  }
	  if(callback) {
	      callback[0](callback[1],callback[2]);
	  }
    },
    error: function(error) { console.log("Epic Fail: "+error); }
  });    
}

function updateselect(select) {
    // creates an array consisting of the sorted elements of that field
    $.ajax({
	type: 'POST',
	url: apiuri+"/attributes",
	data: {   
	    table: database,
	    lookup: select
	},
	contentType: 'application/json',
	dataType: 'json',
	responseType: 'application/json',
	success: function(raw) {
	    console.log("select lookup results: "+select+":"+raw);
	    cache_select(select,raw);
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
	    lookup: one+":"+two
	},
	contentType: 'application/json',
	dataType: 'json',
	responseType: 'application/json',
	success: function(raw) {
	    console.log("multi select lookup: "+one+":"+two+" ::"+raw);
	    cache_select(one,raw);
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

function renderlist(list,switchview=true,sort='deck') {
    // TODO:  batchget has limits, so fetch least number.  also it's not in order, so meh
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
	listprefetch(needfetched,[switchview?dolist:refreshlist,[],list.list]);
    } else {
	if(switchview) {
	    dolist([],list.list);
	} else {
	    refreshlist([],list.list);
	}
    }
    // foreach on list
    // add card to array
    // $("#searchresult").html(rendercards...)
}

// do a search and display a list.   Pop onto history.
// if the search is cached, display the cache
// TODO: this should be more than one function
// forcedata forces datarequest - if the actual post is seperated out might simplify this a little
//   also doesn't need forms to be loaded
//   TODO: why did i blow past waiting on templates... is that right?   i think i messed this up
// from is for continuing and getting more entries from a query
function dosearch(from=0,sort='',forcedata=false) {
    if((searchtemplate[database] === undefined) && !forcedata) {
	console.log("templates not loaded yet");
	return;
    }
    console.log(from);
    var datarequest = {}; 
    $.each($('#searchform').serializeArray(), function (i, field) { datarequest[field.name] = field.value || ""; });
    datarequest['table'] = database;
    datarequest['sort'] = sort;
    if(forcedata!== false) {
	datarequest = forcedata;
    }

    console.log(datarequest);
    var qs = $.param(datarequest);

    if(from == 0 && !forcedata) {
	history.pushState({'qs': qs}, 'Oracle - Search Results', '#search='+encodeURIComponent(qs));
    }

    // Note: if from > 0, we are triggering from paging, not from searching
    datarequest['size'] = 50;
    datarequest['from'] = from;
    $('#lastsearchquery').val(qs);
    $('#lastsearchsort').val(sort);

    // Cache lookup
    if(searchcache[database]['querydata'][qs] !== undefined && searchcache[database]['querydata'][qs].length > from) {
	console.log("pulling "+qs+" from local cache");
	showsearch();
	var data = [];
	searchcache[database]['querydata'][qs].forEach(function(cid) {
	    data.push(cache_card_fetch(cid));
	});
	$("#searchresult").html(rendercards(data,datarequest,qs));
	dosearchpostcallback(qs);
	updates[database]('#searchresult');
    } else {
	if(from<1){
	    $("#searchresult").html(searcherror['loading']);
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
		console.log(dataret);
		searchcache[database]['querytotal'][qs] = raw.hits.total;
		if(dataret.length>0) {
		    var html = rendercards(dataret,datarequest,qs);
		    if(from > 0) {
			$(".moreloading").remove();
			$("#searchresult").append(html);
		    } else {
			$("#searchresult").html(html);
			searchcache[database]['querydata'][qs] = [];
		    }
		    updates[database]('#searchresult');
		    dataret.forEach(function(dataitem) {
			searchcache[database]['querydata'][qs].push(dataitem.cardid);
			cache_card(dataitem);
		    });
		    dosearchpostcallback(qs);
		} else {
      		    $("#searchresult").html(searcherror['empty']);
		}
	    },
	    error: function(error) {
    		console.log("Epic Fail: "+error);
		$("#searchresult").html(searcherror['error']);
		// This works to force a query failure:  * 234Sdfjkl:sjdfkl23dsf $^@$%
		// TODO: trap to handle compile-ish failure on lambda
	    }
	});
    }
	
    return false;
}


// *****************************88 RENDERING DATA ********************
function docardid(id,prid=null,qs=null,pop=false) {
    docard(cache_card_fetch(id),prid,qs,pop);
}
function refreshlist(listdata=[],listlist=[]) {
    console.log("rendering list");
    if(cardtemplate[database] === undefined) {
	console.log("templates not loaded yet");
	return;
    }
    if(listlist.length>0) {
	listdata = [];
	listlist.forEach(function(c){
	    console.log(c);
	    if(c.cardid>0) {
		var card = cache_card_fetch(c.cardid);
		card.listprinting = c.printing;
		card.listquantity = c.quantity;
		listdata.push(card);
	    } else {
		listdata.push(c);
	    }
	});
    }
    listdata.sort(sort[database]['deck']);
    
    var html = listtemplate[database].render(headerize[database]['deck'](listdata),{"labels": labels[database],datarequest:{}});

    $("#listresult").html(html);
}
function dolist(listdata=[],listlist=[]) {
    refreshlist(listdata,listlist);
    /*
      // TODO:  put this in url history???
    if($("#searchresult").is(":visible")) {
	history.pushState({'cardid':carddata['cardid'], 'prid': prid, 'qs': qs}, 'Oracle - '+carddata['title'], '#cardid='+carddata['cardid']);
    } else if($("#cardresult").is(":visible")) {
	history.replaceState({'cardid':carddata['cardid'], 'prid': prid, 'qs': qs}, 'Oracle - '+carddata['title'], '#cardid='+carddata['cardid']);
    }
*/
    showlist();
}

// If a list is being displayed, render card and switch to it, pop onto history so back comes back to the list
// If a card is being displayed, render new card, and replace state on history, so back still goes back to the list
// prid = printingid.   Note: This should only happen on a page load, otherwise javascript handles switches
function docard(carddata,prid=null,qs=null,pop=false) {
    console.log("rendering: "+carddata['cardid']);
    if(cardtemplate[database] === undefined) {
	console.log("templates not loaded yet");
	return;
    }
    var html = cardtemplate[database].render(carddata,{"labels": labels[database], "qs": qs});
    $("#cardresult").html(html);
    updates[database]('#cardresult');
    var primary = $("#printingprimary").val();
    $(".printing:not([data-printingid="+(prid?prid:primary)+"])").hide();

    if($("#searchresult").is(":visible")) {
	history.pushState({'cardid':carddata['cardid'], 'prid': prid, 'qs': qs}, 'Oracle - '+carddata['title'], '#cardid='+carddata['cardid']);
    } else if($("#cardresult").is(":visible")) {
	// TODO:   don't replace if new is a cut/paste..... only on cardnext/cardprev (cnprintingid changes not handled here)
	history.replaceState({'cardid':carddata['cardid'], 'prid': prid, 'qs': qs}, 'Oracle - '+carddata['title'], '#cardid='+carddata['cardid']+(prid?',#cnprintingid='+prid:''));
    }
    showcard();
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
    return searchtemplate[database].render(data,{"labels": labels[database], "datarequest": request, "qs": querystring});
}


// ******************** PAGING HELPERS ********************
// sets up "MORE" and numsearchresults...   both cached and non-cached searches use it
function dosearchpostcallback(qs) {
    if(!$('.error').length) {
	if(searchcache[database]['querydata'][qs].length < searchcache[database]['querytotal'][qs]) {
	    $("#searchresult").append(searcherror['more']);
	}
	if(!$('.numresults').length) {
	    $("#searchresult").prepend(searcherror['numresults'].replace('XXX',searchcache[database]['querytotal'][qs]));
	}
    }
}

function showcard() {
    $("#searchresult").hide();
    $("#listresult").hide();
    $("#cardresult").show();
}
function showlist() {
    $("#searchresult").hide();
    $("#listresult").show();
    $("#cardresult").hide();
}
function showsearch() {
    $("#searchresult").show();
    $("#listresult").hide();
    $("#cardresult").hide();
}


// *********************************** TEMPLATE HELPERS **************
// TODO:   make both of these be able to handle rarity as well...
// TODO:   make {{imageurlfromhash set rarity card}}   that returns fully built url
function templateprintingidfromset(set,hashes) {
    var ret = '';
    hashes.forEach(function(e) {
	if(e.set.includes(set)) {
	    ret=e.printingid;
	}
    });
    return ret;
}
function templateimagehashfromset(set,hashes) {
    var ret = '';
    hashes.forEach(function(e) {
	if(e.set.includes(set)) {
	    ret=e.printimagehash[0];
	}
    });
    return ret;
}
function templateprintingfromid(id,hashes,data) {
    var ret = '';
    hashes.forEach(function(e) {
	if(e.printingid == id) {
	    ret=e[data];
	}
    });
    return ret;
}


// ********************** STARTUP ************************8
$(document).ready(function(){
    auth = initCognitoSDK();
    var curUrl = window.location.href;
    if(curUrl.includes('#access_token=') || curUrl.includes('?code=') ) {
	auth.parseCognitoWebResponse(curUrl);
    } else {
	auth.parseCognitoWebResponse('');
    }
    if(auth.isUserSignedIn()) {
	logincallback(auth.getSession());
    } else {
	logoutcallback();
    }
    // load layout
    (function ($){
	$.fn.selector = { split: function() { return ""; }};
    })(jQuery);
    oraclelayout = $('body').layout({ 
	applyDefaultStyles: true,
	spacing_open: 5,
	spacing_closed: 5,
	west: {
	    size: 240,
	    resizable: true,
	    resizeWhileDragging:   true,
	    slidable:              true,
	    slideTrigger_open:  "mouseover"
	},
	north: {
	    size: 62
	}
    });
/*                var westSelector = "body > .ui-layout-west"; // outer-west pane
                var eastSelector = "body > .ui-layout-east"; // outer-east pane
                // CREATE SPANs for close-buttons - using unique IDs as identifiers
                $("<span></span>").attr("id", "west-closer" ).prependTo( westSelector );
                $("<span></span>").attr("id", "east-closer").prependTo( eastSelector );
                // BIND layout events to close-buttons to make them functional
                outerLayout.addCloseBtn("#west-closer", "west");
                outerLayout.addCloseBtn("#east-closer", "east"); */
    
    //TODO:  put some stuff in here into functions.   make sure order optimized.  
    searchcache[database] = {
	'data': {},    'querydata': {},    'querytotal': {}
    };
    templateactive[database] = {};

    // Load templates
    $.each(templateload[database]['search'],function(key,val) {
	$.ajax({
	    url: "templates/"+key+"-"+database+".html",
	    type: "GET",
	    datatype: 'text',
	    cache: true,
	    success: function(contents) {
		$("#all_template").append('<script id="template-'+key+'-'+database+'" type="text/x-jsrender">'+contents+'</script>'); 
		if(Object.keys(templateload[database]['search'])[0] == key) {
		    searchtemplate[database] = $.templates(["#template",key,database].join("-"));
		    templateactive[database]['search'] = key;
		}
	    }
	});
    });
    $.each(templateload[database]['list'],function(key,val) {
	$.ajax({
	    url: "templates/"+key+"-"+database+".html",
	    type: "GET",
	    datatype: 'text',
	    cache: true,
	    success: function(contents) {
		$("#all_template").append('<script id="template-'+key+'-'+database+'" type="text/x-jsrender">'+contents+'</script>'); 
		if(listtemplate[database] === undefined) {
		    listtemplate[database] = $.templates(["#template",key,database].join("-"));
		    templateactive[database]['list'] = key;
		}
	    }
	});
    });
    $.each(templateload[database]['card'],function(key,val) {
	$.ajax({
	    url: "templates/"+key+"-"+database+".html",
	    type: "GET",
	    datatype: 'text',
	    cache: true,
	    success: function(contents) {
		$("#all_template").append('<script id="template-'+key+'-'+database+'" type="text/x-jsrender">'+contents+'</script>'); 
		if(cardtemplate[database] === undefined) {
		    cardtemplate[database] = $.templates(["#template",key,database].join("-"));
		    templateactive[database]['card'] = key;
		}
	    }
	});
    });

    // Load selects
    $('#searchmiddle').html(searcherror['searchmiddle']);
    loadselectables(database);
    if(searchables[database]["quick"] !== undefined && searchables[database]["quick"] == false) {
	$('#searchtop').html('');
    }

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

    urlparser();

});

// This handles history back changes/etc
//TODO:  will need to do lists here too
$(window).on('popstate', function (e) {
    var state = e.originalEvent.state;
    console.log('popstate');
    console.log(state);
    //	console.log(location.hash);
    if (state !== undefined && state !== null) {
	if(state.cardid !== undefined) {
	    docardid(state.cardid,state.prid,state.qs,true);
	} else if(state.qs !== undefined) {
	    showsearch();
	} else if(state.search !== undefined) {
	    
	} else {
	    showcard();
	}
    } else if(location.hash.match(/#cardid=/)) {
	urlparser();
    } else {
	showsearch();
    }
}); 

// Keyboard navigation inside a list of cards
$(document).on('keydown', function ( e ) {
    if(e.target.nodeName=='BODY') {
	if($("#cardresult").is(":visible")) {
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

function urlparser() {
    // Load bookmarks / shared urls
    var patt = /#[^#]+/g;
    var matches = location.hash.match(patt);
    var matchstruct = {};
    var structpatt = /#(\w+)=?((?:\w|%)+)?/;
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
    if(typeof(matchstruct["cardid"]) != "undefined") {
	console.log("detected card in URL");
	cardfetch(matchstruct["cardid"],typeof(matchstruct['cnprintingid']) != 'undefined' ? matchstruct['cnprintingid'] : null);
    } else if(typeof(matchstruct['search']) != 'undefined') {
	console.log("detected search in URL");
	console.log(uri2json(decodeURIComponent(matchstruct['search'])));
	populatecallback.push(function() {populate($("#searchform"),uri2json(decodeURIComponent(matchstruct['search'])));});
	dosearch(0,'',uri2json(decodeURIComponent(matchstruct['search'])));
    } else {
/*	$(window).on('beforeunload', function(e){ 
	    return 'Are you sure you want to leave?';
	});    */
    }
}

// this builds the search form after all 'select' data is loaded
function initializeform(db) {
    var fdata = $.map(searchables[db],function( value,key ) {
	    console.log("initialize form: "+key+"/"+value);
	if(key == "quick") { return ''; }
	    var nound = key.replace("printing.","printing_");
	    var nop = key.replace("printing.","").replace("card",'');
	    var ret = '<input type="hidden" name="type_'+nound+'" value="'+value.type+'">'+
		'<dt>'+labels[db]["short"+nop]+'</dt><dd>';
	    switch(value.type) {
	    case "text":
		ret += '<input type="text" id="field_'+nound+'" name="field_'+nound+'">';
		break;
	    case "keyword":
		ret += '<input type="text" id="field_'+nound+'" name="field_'+nound+'">';
		break;
	    case 'select':
		if(searchables[db][key]['sub'] !== undefined) {
		    noundsub = searchables[db][key]['sub'].replace("printing.","printing_");
		    ret += makeselectarray([''].concat(Object.keys(cache_select(key))),{id: 'field_'+nound, name: 'field_'+nound, onchange: "onchangesub('"+key+"','"+nound+"','"+noundsub+"','"+db+"');" });
		} else {
		    ret += makeselectarray([''].concat(cache_select(key)),{id: 'field_'+nound, name: 'field_'+nound});
		}
		break;
	    }
	    return ret+'</dd>'
    });
    $('#searchmiddle').html(fdata.join("\n"));
    $('#searchmiddle').append('<input type="hidden" name="selectsloaded" id="selectsloaded" value="1">');
    while (populatecallback.length){ 
	populatecallback.shift().call(); 
    }
}

// changes values for a select chained to another select
function onchangesub(key,nound,noundsub,db) {
    var fval = $('#field_'+noundsub).val();
    $('#field_'+noundsub).replaceWith(
	makeselectarray([''].concat(
	    $('#field_'+nound).val() ?
		cache_select(key)[$('#field_'+nound).val()] :
		cache_select(searchables[db][key]['sub'])
	),
			{id: 'field_'+noundsub, name: 'field_'+noundsub}
		       )
    );
    $('#field_'+noundsub).val(fval);
}

function loadselectables(db) {
    $.each(searchables[db],function( key, value ) {
	if(value.type == 'select') {
	    if(cache_select(key)) {
		console.log('select cached: '+key);
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
	memo[i[0]] = i[1] == '' ? '' : (i[1] == +i[1] ? parseFloat(i[1],10) : decodeURIComponent(i[1])); 
	return memo;
    }, {});
}

// make a select with attrs from att.   values and display are identical
function makeselectarray(arr,atts={}) {
    return '<select '+$.map(atts,function(v,i){ return i+'="'+v+'"'; }).join(" ")+'>'+arr.map(x=>'<option value="'+htmlEncode(x)+'">'+x+'</option>').join("")+'</select>';
}

// *********************** NAVIGATION ******************
function scrollcheck() {
    // window for no jquery layout containers
    //    if($(window).scrollTop() > $(document).height() - $(window).height() - 100) {
    if($('.ui-layout-center').scrollTop() > $('.ui-layout-center')[0].scrollHeight - $('.ui-layout-center').height() - 200) {
        // ajax call get data from server and append to the div
	if($('.more').length) {
	    $('.more').remove();
	    dosearch(searchcache[database]['querydata'][$('#lastsearchquery').val()].length,$('#lastsearchsort').val());
	    $("#searchresult").append(searcherror['moreloading']);
	    // if we want transitions
	    // new_element.hide().appendTo('.your_div').fadeIn(); $(window).scrollTop($(window).scrollTop()-1);
	}
    }
}

function changeprinting(id,prid,qs,title) {
    //    console.log({id,prid,qs,title});
    $('.printing').hide();
    $('.printing[data-printingid='+prid+']').show();
    history.replaceState({'cardidid':id, 'prid': prid, 'qs': qs}, 'Oracle - '+title, '#cardid='+id+',#cnprintingid='+prid);
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
    if((index >= searchcache[database]['querydata'][qs].length - 5) && (searchcache[database]['querydata'][qs].length < searchcache[database]['querytotal'][qs])) {
	dosearch(searchcache[database]['querydata'][$('#lastsearchquery').val()].length,$('#lastsearchsort').val());
    }
    if(index < searchcache[database]['querydata'][qs].length - 1) {
	docardid(searchcache[database]['querydata'][qs][searchcache[database]['querydata'][qs].indexOf(id)+1],null,qs);
    }
}

//TDOO;  maybe ex should go back to search period - maybe scrolling through cards in search should do replacestate
//TODO:  going back to top level should clear search. 
//TODO: button to reset/clear search  (escape as a keystroke as well?)
//TODO:  better right/left buttons
//TODO: right after a search, if right arrow is hit before any other keystroke, open first card in the list
//TODO:  keywords in search results clickable to make new search, etc.
//TODO: inside cardtemplate, choose picture corresponding to the search if a particular set

// ********************* CACHING ********************
function cache_card(carddata) {
    searchcache[database]['data'][carddata.cardid] = carddata;
}
function cache_card_fetch(cardid) {
    return     searchcache[database]['data'][cardid];
}
function cache_card_is(cardid) {
    return searchcache[database]['data'].hasOwnProperty(cardid);
}
function cache_select(sel,selval=null) {
    return cache_thing("searchselect",sel,selval);
}
function cache_thing(thing,sel,selval=null) {
        // query
    if(selval === null) {
	if (typeof(Storage) !== "undefined") {
	    return JSON.parse(window.localStorage.getItem(thing+"_"+sel));
	} else {
	    return nolocalstore[thing+"_"+sel];
	}
    } else {
	// set
	if (typeof(Storage) !== "undefined") {
	    if(selval === undefined) {
		window.localStorage.removeItem(thing+"_"+sel);
	    } else {
		window.localStorage.setItem(thing+"_"+sel,JSON.stringify(selval));
	    }
	} else {
	    if(selval === undefined) {
		delete nolocalstore[thing+"_"+sel]
	    } else {
		nolocalstore[thing+"_"+sel] = selval;
	    }
	}
    }
}
