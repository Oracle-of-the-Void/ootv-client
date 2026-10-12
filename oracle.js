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
function filenamecleaner(val) {
    return val.replace(/[^\-a-z0-9]/gi,'_').toLowerCase().replace(/_{2,}/,'_');
}
$.views.converters("filenamecleaner", function(val) {return filenamecleaner(val);});
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
  if(cache_select("legality.sortregex")) {
      for(flegality in cache_select("legality.sortregex")) {
        var thislegality = cache_select("legality.sortregex")[flegality].replace(/&nbsp;/g, " ");
        // saved lists may hold a value with only the first &nbsp; replaced, so compare normalized
        sel += '<option value="'+thislegality+'"'+(thislegality==(legality||'').replace(/&nbsp;/g, " ")?' selected':'')+'>'+thislegality+'</option>';
      }
  }
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
	$("#all_template").append('<script src="templates/test.js"></script>');
  addgametolist('test');
}

$.views.converters("addslashes",addslashes);

var apiuri = "https://api.oracleofthevoid.com";
// https://sweve5sd4d.execute-api.us-east-1.amazonaws.com
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
var activelists = [];
var savetimeout = '';
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
}
function logoutcallback() {
    console.log("Not logged in");
    $('#loginfo').html("");
    $('.loginfo').hide()
    $('#loginbutton').show();
    $('.showonlogin').hide();
    $('.hideonlogin').show();
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
    refreshauthvar = setTimeout(refreshauth,45*60*1000); // refresh every 45 min...   tokens last 1h
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
    var info = cache_thing("user","data");
    $('#loginfo').html(info.cognito.name);
//    $('#userinfo-id').html("Uid: "+info.oracle[0].uid);
//    $('#userinfo-email').html(info.oracle[0].emails.join("<br />"));
//    $('#userinfo-joined').html(info.oracle[0].insert_date);
//    $('#userinfo-lists').html(info.oracle[0].deckcount);
    hellotemplate = $.templates("#template-hello");
    $('#userinfo-drop').html(hellotemplate.render({cognito: info.cognito, oracle: info.oracle[0]},{"pdfallowed": pdfallowed()}));
//    $(".helloplace").replaceWith(hellotemplate.render({cognito: info.cognito, oracle: info.oracle[0]}));
    //	  $(".infoplace:first-child").before(hellotemplate.render({cognito: data.cognito, oracle: data.oracle[0]}));
    listinfo(); // TODO:  more intelligently decide if we need to do listinfo or just the callback
    if (("oracle" in cache_thing("user","data")) && ("groups" in cache_thing("user","data").oracle[0])) {
      $('.showonadmin').show();
    }
    updateviewbuttons();
    applyviewdefaults();
}
function getuid() {
    return cache_thing("user","data").oracle[0].uid;
}

//**********************88     LIST STUFFF ****************
// TODO: cache this better...
function listinfo(listid=null,switchview=true,listoutput=null) {
  console.log(["listinfo",listid,switchview,listoutput]);
  if(listid && cache_thing("list",listid) != null) {
	  console.log("cached");
	  $("#lastlistid").val(listid);
	  renderlist(cache_thing("list",listid).list.Items[0],switchview,listoutput+(outputheaders?'':',noheaders'));
  } else {
    console.log("listinfo_ajax");
	  $.ajax({
	    type: 'GET',
	    url: apiuri+"/list?uid="+getuid()+"&database="+database+(listid?"&listid="+listid:""),
	    contentType: 'application/json',
	    dataType: 'json',
	    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
	    responseType: 'application/json',
	    success: function(data) {
		    console.log(data);
		    if(listid) {
		      if(data.list.Items[0].sort == undefined) {
			      if(data.list.Items[0].type == 'deck') {
			        data.list.Items[0].sort = 'deck';
			        console.log('setting deck');
			      } else {
			        data.list.Items[0].sort = '';
			      }
		      }
		      cache_thing("list",listid,data);
		      $("#lastlistid").val(listid);
		      renderlist(data.list.Items[0],switchview,listoutput+(outputheaders?'':',noheaders'));
		      renderlisteditarea();
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
	    error: function(error) { console.log("Epic Fail: "+JSON.stringify(error)); }
	  });
  }
}
function listinfoupdate(listid,field,value) {
  // valid fields:
  //     name=text, notes=text, public=t/f, type=short text, list = JSON.stringify(data)
  //   for the first 4, just do on change
  //   for the list, periodically do an update if stuff has changed to decrease traffic (have some sort of unsaved/saving/saved area)
  // TODO: rethink calling listinfo.. that might overwrite pending stuff?   or wait.. that's not the actual list..  might be ok
  //    either way, we need to trap pulling new list info if we have pending updates.
  // TODO:   when listinfoupdate is called, and lastmod is newer than what we have and we have a list, force update or dump cache
  var message_status = $('#list_modified\\:'+listid);
  var url = apiuri+"/list?uid="+getuid()+"&database="+database+"&listid="+listid+"&updatefield="+field+"&updatevalue="+encodeURI(value);
  console.log(url);
  $.ajax({
	  type: "GET",
	  url: url,
	  contentType: 'application/json',
	  dataType: 'json',
	  beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());},
	  responseType: 'application/json',
	  success: function(status) {
      //message_status.show();
      message_status.text("List Updated");
      //hide the message
      setTimeout(function(){message_status.text(formatdate(new Date()))},3000);
	    //            setTimeout(function(){message_status.hide()},3000);
	    $("#list_prev_"+field).text(value);
	    if($("#importlistid").length) {
		    listid = $("#importlistid").val();
		    erasemodal();
      }
      console.log("clear listid cache:"+listid);
		    cache_thing("list",listid,null,true); //TODO  we might seed the cache..  but we get no verification that it took.  DynamoDB has no guarantee it's fresh, so might blow cache here.
        listinfo();
		    listinfo(listid,false);
	    //}
	  },
	  error: function(status) {
	    console.log(status);
	  }
  });
}

function listinfocallback() {
  cache_thing("list","datareverse",cache_thing("list","data").lists.Items.reduce((hsh,list,index) => { hsh[list.listid]=index; return hsh;},{}));
  listertemplate = $.templates("#template-lists");
  $(".directorylistitem").remove();
  $(listertemplate.render(cache_thing("list","data").lists.Items,{"pdfallowed": pdfallowed(), "snm": snmallowed()})).insertAfter(".directorylistheader");
  //acknowledgement message
  $('.listitem div[contenteditable=true][id^="list_"]').blur(function(){
    var field_userid = $(this).attr("id").split(/:/) ;
    var value = $(this).text() ;
	  //TODO:   update value
	  if($("#list_prev_"+field_userid[0].replace('list_','')+'\\:'+field_userid[1]).text() != value) {
	    //console.log($("#list_prev_"+field_userid[0].replace('list_','')+'\\:'+field_userid[1]).text());
	    console.log(field_userid);
	    listinfoupdate(field_userid[1],field_userid[0].replace('list_',''),value);
	  }
  });
  // nothing in the list view yet: load the first list in the directory behind the scenes
  var lists = cache_thing("list","data").lists.Items;
  if(!$("#lastlistid").val() && lists.length) {
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

function activatelist(listid) {
    listinfo(listid,false);
    var index = activelists.indexOf(listid);
    if (index > -1) {
       activelists.splice(index, 1);
    }
    activelists.unshift(listid);
    $("#listinactive"+listid).hide();
    $("#listactive"+listid).show();
    renderlisteditarea();
}

function deactivatelist(listid) {
    var index = activelists.indexOf(listid);
    if (index > -1) {
       activelists.splice(index, 1);
    }
    $("#listactive"+listid).hide();
    $("#listinactive"+listid).show();
    renderlisteditarea();
}

function newlist(json=null) {
    /*
    Create new list.   json example:
    {
    "name": "new list name",  // default: "New List"
    "list": [ { cardid: 6974, printing: 0, quantity: 3 },   // default: empty list
              { cardid:  123, printing: 2, quanity: 1}
	      ],
    "public": true, // default false
    "type": "collection"   // default 'deck'
    }
    game is set from queryString
    owner is set from authentication information and matching queryString
    createdate, modified are automatically set and non-modifiable currently
    */
    $.ajax({
	type: 'GET',
	url: apiuri+"/list?uid="+getuid()+"&database="+database+"&listid=new"+(json?encodeURIComponent(JSON.stringify(json)):''),
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
	},
	error: function(error) { console.log("Epic Fail: "+JSON.stringify(error)); }
    });
}

function duplicatelist(listid) {
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
    },
    error: function(error) { console.log("Epic Fail: "+JSON.stringify(error)); }
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
	var ind = $("#listitem_"+listid).index();
	oldlists.lists.Items.splice(ind-1,1);
	cache_thing("list","data",oldlists);
	$("#listitem_"+listid).remove();
	if($("#lastlistid").val() == listid) {
	    $("#lastlistid").val('');
	    $("#resultlist").html('<div class="randarea">No list selected, click on Directory</div>');
	}
	listinfocallback();
    }
}

function savecallback() {
    console.log("Saving....");
    for(listid in updatepending) {
	      listinfoupdate(listid,'list',JSON.stringify(cache_thing("list",listid).list.Items[0].list));
	      delete updatepending[listid];
    }
    renderlisteditarea(); // update card counts
    clearTimeout(savetimeout);
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
    //var list=cache_thing("list","data").lists.Items[cache_thing("list","datareverse")[listid]];
    // listinfoupdate(listid,'list',JSON.stringify(cache_thing("list",listid).list.Items[0].list));
    var list = cache_thing("list",listid);
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
    list.list.Items[0].distinctcount = list.list.Items[0].list.length;
    list.list.Items[0].totalcount = list.list.Items[0].list.reduce(function (total,card) {
	return total + parseInt(card['quantity']);
    },0);
    cache_thing("list",listid,list);
    $('span.listqty[data-list="'+listid+'"][data-card="'+cardid+'"]').filter(function() { return $(this).data('printing') == (prid||0); }).text(listquantity(listid,cardid,prid));
    $("#lastlistid").val(listid);
    renderlist(cache_thing("list",$("#lastlistid").val()).list.Items[0],false);
    if(Object.keys(updatepending).length < 1) {
	      savetimeout = setTimeout(savecallback,60*1000);
    }
    updatepending[listid]=1;
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
function loadpica(callback) {
  if(typeof pica !== 'undefined') { callback(); return; }
  $.ajax({url: 'pica.min.js', dataType: 'script', cache: true})
    .done(callback)
    .fail(function() {
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

// Presigned PUTs from /upload (at most 10 files per request), then the uploads.
// Each /upload call logs an 'upload' row (with cardid) to the updatelog.
// files: [{name, blob, legacy}]. A legacy copy that already exists (412) was copied
// by an earlier attempt and counts as done; any other existing file is an error.
function uploadimagefiles(db,hash,files,overwrite,cardid,printid) {
  var chunks = [];
  for (let i = 0; i < files.length; i += 10) { chunks.push(files.slice(i,i+10)); }
  return chunks.reduce(function(prev,chunk) {
    return prev.then(function() {
      return Promise.resolve($.ajax({
        type: "POST",
        url: apiuri+"/upload",
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({"uid": getuid(), "database": db, "imagehash": hash, "overwrite": overwrite,
                              "cardid": cardid, "printingid": printid,
                              "files": chunk.map(f => ({"name": f.name, "contentType": f.blob.type}))}),
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization', getidtoken());}
      })).then(function(ret) {
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
	    url: 'https://api.oracleofthevoid.com/import',
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
	  if(Array.isArray(data)) {
	      data.forEach(function(c) { cache_card(imagehashtourl(c)); });
	  } else if(typeof data == 'object') {
	      cache_card(imagehashtourl(data));
	  }
	  if(callback) {
	      callback[0](callback[1],callback[2],callback[3],callback[4],callback[5]);
	  }
    },
    error: function(error) { console.log("Epic Fail: "+JSON.stringify(error)); }
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
	docardid( $("#lastcardid").val(), $("#lastprintid").val()?$("#lastprintid").val():null,$("#lastsearchquery").val()?$("#lastsearchquery").val():null);
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
	  history.pushState({'qs': qs}, 'Oracle - Search Results', '#search='+encodeURIComponent(qs));
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
		    searchcache[database]['querytotal'][qs] = raw.hits.total;
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
    if(listlist.length>0) {
	listdata = [];
	listlist.forEach(function(c){
	    //console.log(c);
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
	if(templates[database]['available'][templates[database]['active']['list']].headerizable && (sort=='deck')) {
	    var html = getactivetemplate('list').render(gameheaderize[sort] != undefined ? gameheaderize[sort](listdata) : listdata,{
		"labels": labels[database],
		datarequest:{'listid':listid,'sort':sort},
		"database":database
	    });
	} else {
	    var html = getactivetemplate('list').render(listdata,{
		"labels": labels[database],
		datarequest:{'listid':listid,'sort':sort},
		"database":database
	    });
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
	    $("#resultlist").html(listheader(listid)+html);
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

// header line for the list view: the list's details as the directory shows them
function listheader(listid) {
    var meta = null;
    var dir = cache_thing("list","data");
    var rev = cache_thing("list","datareverse");
    if(dir && rev && rev[listid] !== undefined) {
	meta = dir.lists.Items[rev[listid]];
    } else if(cache_thing("list",listid)) {
	meta = cache_thing("list",listid).list.Items[0];
    }
    if(!meta) {
	return '';
    }
    return $.templates("#template-listheader").render(meta,{"listtypes": listtypes});
}
function dolist(listdata=[],listlist=[],sort,listid=null,listoutput=null) {
    console.log(["dolist: "+sort,listid,listoutput,listdata,listlist]);
    refreshlist(listdata,listlist,sort,listid,listoutput);
    /*
      // TODO:  put this in url history???
    if($("#resultsearch").is(":visible")) {
	history.pushState({'cardid':carddata['cardid'], 'prid': prid, 'qs': qs}, 'Oracle - '+carddata['title'], '#cardid='+carddata['cardid']);
    } else if($("#resultcard").is(":visible")) {
	history.replaceState({'cardid':carddata['cardid'], 'prid': prid, 'qs': qs}, 'Oracle - '+carddata['title'], '#cardid='+carddata['cardid']);
    }
*/
    showlist();
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
  $("#lastcardid").val(carddata.cardid);
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
            return process_keywordlink(x,key,searchables[database][key].type);
          });
          for (let i=0;i<carddata.printing.length;i++) {
            //console.log(i);
            if(carddata.printing[i][key]) {
              carddata.printing[i][key] = carddata.printing[i][key].map(function(x){return process_keywordlink(x,key,searchables[database][key].type);});
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
  var html = getactivetemplate('card').render(bubbleup([carddata],qs,prid)[0],tmpl);
  $("#resultcard").html(html);
  updates[database]('#resultcard');
  var primary = $("#printingprimary").val();
  // Show the printing the link asked for (versioned search links carry it), else the one qs matched, else the primary
  var defpr = prid ? null : templatefetch(carddata,false,qs ? $.deparam(qs) : {})["printingid"];
  var showpr = prid?prid:((defpr>0)?defpr:primary);
  $(".printing:not([data-printingid="+showpr+"])").hide();
  $("#lastprintid").val(showpr);

  if(!switchview) {
	  return;
  }
  if($("#resultsearch").is(":visible")) {
	  history.pushState({'cardid':carddata['cardid'], 'prid': prid, 'qs': qs}, 'Oracle - '+carddata['title'], '#game='+database+',#cardid='+carddata['cardid']+(prid?',#cnprintingid='+prid:''));
  } else if($("#resultcard").is(":visible")) {
	  // TODO:   don't replace if new is a cut/paste..... only on cardnext/cardprev (cnprintingid changes not handled here)
	  history.replaceState({'cardid':carddata['cardid'], 'prid': prid, 'qs': qs}, 'Oracle - '+carddata['title'], '#game='+database+',#cardid='+carddata['cardid']+(prid?',#cnprintingid='+prid:''));
  }
  showcard();
}

function bubbleup(data,request=null,prid=null) {
  // takes a printingid that matches one of the reverse lookups that is being used in the current query
  // and displays its text instead of default
  // prid: use this printing instead of re-matching it from the query (single card view)
  // note: expects array of cards - for a single card send array of one, and deref
  // TODO: some of this can be one-time things on activating a database
  //console.log(data,request);
  if(request == null) { return data;}
  if(typeof request === "string") {
    request = $.deparam(request);
    //console.log(request);
  }
  const revkeys = Object.keys(data[0].printingreverse);
  var hasrev = 0;
  revkeys.forEach(function(key) {
    if((("field_printing_"+key) in request) || (("field_"+key) in request)) {
      hasrev=1;
    }
  });
  // (If the request has rev stuff set)
  if(hasrev>0) {
    //console.log("hasrev");
    //    var bubblekill = ["print.*"];
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
    // IF reversables are set:
    // rebuild whole array with structuredClone
    var newdata = [];
    for (let i = 0; i < data.length; i++) {
      newdata[i] = structuredClone(data[i]);
      var matchedpr = templatefetch(data[i], prid ? prid : false, request);
      if (matchedpr && matchedpr["printingid"] > 0) {
        const mkeys = Object.keys(matchedpr).filter(
          (key) => !key.match(bkillre)
        );
        mkeys.forEach(function (key) {
          newdata[i][key] = matchedpr[key];
        });
      }
    }
    return newdata;
  } else {
    return data;
  }
}

function process_keywordlink(data,fieldname,type) {
  fieldname = fieldname.replace('.','_');
  var cleandata = data.replace(new RegExp("<[^<]+>","g"),"");
  return '<a href="" id="'+
    '#search='+
    encodeURIComponent(
      'table='+database+'&type_'+ 
        fieldname+'='+type+'&field_'+
        fieldname+'='+encodeURIComponent(cleandata)
    )+
    '" onclick="window.location.hash=this.id; return false;">'+data+'</a>';
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
  return getactivetemplate('search').render(bubbleup(data,request),tmpl);
}


// ******************** PAGING HELPERS ********************
// how many of a search's results can be paged through (the API stops at searchwindow)
function searchpageable(qs) {
    return Math.min(searchcache[database]['querytotal'][qs], searchwindow);
}

// sets up "MORE" and numresultsearchs...   both cached and non-cached searches use it
function dosearchpostcallback(qs) {
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
    if(e.originalEvent.pointerType == 'mouse') {
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
    if(lastpointertype != 'mouse') {
	e.preventDefault(); // Android's long-press menu would cover the label
    }
});
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
    if($('#' + view).is(":visible")) {
	return;
    }
    $(".ui-layout-center div[id^=result]").hide(); // Hide all content
    $(".viewicons button").removeClass("searchviewactive");
    $('.viewicons button[data-view=' + view + ']').addClass("searchviewactive");
    $('#' + view).fadeIn();
    updateviewbuttons();
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
function sortbyselect(items,key,valuefn) {
    // sort items into the order of a cached select that is grouped into optgroups, e.g.
    // legality: [{"Arc":[...]},{"Format":[...]}]   printing.set: [{"Clan War (Imperial)":{"Imperial Edition":[rarities]}}]
    // older legality caches may be a flat array (same order). Games without arcs cache printing.set
    // as a plain object in alphabetical order, not chronological, so leave the stored order alone.
    var sel = cache_select(key);
    if(!Array.isArray(items) || !Array.isArray(sel)) {
        return items;
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
    order = order.map(selectplaintext);
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
  out = "";
  for (i=0; i< arguments.length; i++) {
    out += "<a href=\""+arguments[i]+"\">"+arguments[i]+"</a>";
  }
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
                if(checkatt in card.printingreverse[att]) {
                    pr = card.printingreverse[att][checkatt];
                }
              }
            }
        }
    }
    //console.log("onx ret: "+pr);
    return card.printing[pr];
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
	    docardid( $("#lastcardid").val(), $("#lastprintid").val()?$("#lastprintid").val():null,$("#lastsearchquery").val()?$("#lastsearchquery").val():null);
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
// full permissions on this game: groups[database] or groups['*'] allows every operation (same rule as /update)
function fullgamepermission() {
  var user = cache_thing("user","data");
  if(!(user && ("oracle" in user) && ("groups" in user.oracle[0]))) {
	  return false;
  }
  var groups = user.oracle[0].groups;
  return [database,'*'].some(function(g) { return Array.isArray(groups[g]) && groups[g].includes('*'); });
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
  // directory, about, help, admin have no formats: hide the whole format/size/sort group there
  var formatview = ['search','card','list'].includes(currentresulttab());
  $(".searchviewbuttons").toggle(formatview);
  $(".sortbuttons").toggle(formatview && type == 'search'); // sort only applies to search results
  updatesizebuttons();
  $("#templatebuttons").toggle($("#templatebuttons button[data-template]").filter(function() { return this.style.display != 'none'; }).length > 0);
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
// saved view defaults: users.settings[database] = {search, card, list, sort, sortdir, mobile: {same keys}}, saved via /user?settings=
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
  if(templates[database]['sort']['search'] == saved.sort && templates[database]['sortdir'] && templates[database]['sortdir']['search'] == dir) {
	  return false;
  }
  templates[database]['sort']['search'] = saved.sort;
  templates[database]['sortdir'] = templates[database]['sortdir'] || {};
  templates[database]['sortdir']['search'] = dir;
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
  }
  updatesizebuttons();
}
// size buttons follow the view in play; the group hides where the game has no large version
function updatesizebuttons() {
  var type = viewbuttontype();
  var large = templates[database]['available'][(type == 'card' ? 'card' : 'visual')+'-premium'];
  $("#sizebuttons").toggle(large !== undefined && large.places.includes(type));
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


// ********************** STARTUP ************************8
$(document).ready(function(){
  // TODO: doing double-load of lists when startup
  auth = initCognitoSDK();
  var curUrl = window.location.href;
  if(curUrl.includes('#access_token=') || curUrl.includes('?code=') ) {
	  auth.parseCognitoWebResponse(curUrl);
  } else {
	  auth.parseCognitoWebResponse('');
  }
  if(auth.isUserSignedIn() || auth.getSignInUserSession().getRefreshToken().refreshToken!="") {
	  logincallback(auth.getSession());
  } else {
	  logoutcallback();
  }
  // load layout
  (function ($){
	  $.fn.selector = { split: function() { return ""; }};
  })(jQuery);
  
  $(".ui-layout-center div[id^=result]").hide(); // Hide all content
  showview('resultabout');
  
  //TODO:  put some stuff in here into functions.   make sure order optimized.
  searchcache[database] = {
	  'data': {},    'querydata': {},    'querytotal': {},    'queryrequest': {}
  };
  templateactive[database] = {};
  
  templates[database]['sort']['search'] = Object.keys(searchsorts[database])[0];
  templates[database]['sortdir'] = {'search': 'asc'};
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
  applysortdefault(); // login ran before the sorts existed
  // phones default search results to the Visual Spoiler, unless a saved phone default says otherwise
  if(narrowscreen() && templates[database]['available']['visual'] && !(viewdefaults() || {})['search']) {
	  templates[database]['default']['search'] = 'visual';
  }
  
  // TODO: check for premium
  $.each(templates[database]['available'],function(key,val) {
	  console.log("initiating template load: "+key);
	  $.ajax({
	    url: "templates/template-"+(val.generic?'':(database+"-"))+((val.override&&val.override.templatekey)?val.override.templatekey:key)+".html",
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
  
  urlparser();
  // phones start on the search form, unless the url asked for something (beyond the game)
  if(narrowscreen() && !location.hash.replace(/#game=[^#]*/,'')) {
	  showview('resultsearch');
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


// This handles history back changes/etc
//TODO:  will need to do lists here too
$(window).on('popstate', function (e) {
  var state = e.originalEvent.state;
  console.log(['popstate',state]);
  //	console.log(location.hash);
  if (state !== undefined && state !== null) {
	  if(state.cardid !== undefined) {
	    docardid(state.cardid,state.prid,state.qs,true);
	  } else if(state.qs !== undefined) {
      if($('#lastsearchquery').val() == state.qs) {
	      showsearch();
      } else {
        urlparser();
      }
	  } else if(state.search !== undefined) {
      
	  } else {
	    showcard();
	  }
  } else if(location.hash.match(/#cardid=/) || location.hash.match(/#search=/)) {
	  urlparser();
  } else {
    console.log(['new location',location.hash]);
    console.log(['previous',$('#lastsearchquery').val()]);
	  showsearch();
  }
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

function urlparser() {
  // Load bookmarks / shared urls
  var patt = /#[^#]+/g;
  var matches = location.hash.match(patt);
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
  console.log(['matchstruct',matchstruct]);
  if(typeof(matchstruct["game"]) != "undefined") {
    if((matchstruct["game"] != database) && (matchstruct["game"] != "")) {
      cache_session("database",matchstruct["game"]);
      location.reload();
    }
  }
  if(typeof(matchstruct["quicksearch"]) != "undefined") {
    console.log("detected quicksearch");
    $("input#qs").val(decodeURIComponent(matchstruct["quicksearch"]));
    dosearch(0,false,true);
  } else if(typeof(matchstruct["quicksearchtitle"]) != "undefined") {
    console.log("detected quicksearchtitle");
    $("input#field_title").val(decodeURIComponent(matchstruct["quicksearchtitle"]));
    dosearch(0,false,true);
  } else if(typeof(matchstruct["cardid"]) != "undefined") {
	  console.log("detected card in URL");
	  cardfetch(matchstruct["cardid"],typeof(matchstruct['cnprintingid']) != 'undefined' ? matchstruct['cnprintingid'] : null);
  } else if(typeof(matchstruct['search']) != 'undefined') {
	  console.log(["detected search in URL",matchstruct['search']]);
	  console.log(uri2json(decodeURIComponent(matchstruct['search'])));
	  populatecallback.push(function() {populate($("#searchform"),uri2json(decodeURIComponent(matchstruct['search'])));});
	  fdata = uri2json(decodeURIComponent(matchstruct['search']));
	  for( param in fdata ) {
	    if(param.match(/^(field_|querystring)/)) {
        console.log(['yo',$('#'+param).prop('type'),$('#'+param).val(),fdata[param]]);
        switch($('#'+param).prop('type')) {
        case 'select-multiple':
          if($('#'+param).val()) {
            if(Array.isArray($('#'+param).val())) {
              $('#'+param).val($('#'+param).val().concat([fdata[param]]));
            } else {
              $('#'+param).val([$('#'+param).val(),fdata[param]]);
            }
          } else {
		        $('#'+param).val(fdata[param]);
          }
          break;
        case 'text':
          if($('#'+param).val()) {
            $('#'+param).val($('#'+param).val()+" "+fdata[param]);
          } else {
		        $('#'+param).val(fdata[param]);
          }
          break;
        default:
		      $('#'+param).val(fdata[param]);
        }
        $('#'+param).trigger("chosen:updated");
        console.log(['msparam',param]);
	    }
	    if(param == 'sort') {
		    changesort('search',fdata[param],false);
	    }
	  }
	  dosearch(0,fdata);
	  // TODO this needs to update search and the form.
  } else {
    /*	$(window).on('beforeunload', function(e){
	      return 'Are you sure you want to leave?';
	      });    */
  }
}

// this builds the search form after all 'select' data is loaded
function initializeform(db) {
  var fdata = $.map(searchables[db],function( value,key ) {
	  console.log(["initialize form: ",key,value]);
	  if(key == "quick") { return ''; }
	  if(value.type == "hidden") { return ''; }
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
	    if(searchables[db][key]['sub'] !== undefined) {
//        console.log('sub');
		    noundsub = searchables[db][key]['sub'].replace("printing.","printing_");
        var sel = cache_select(key);
        console.log(['sel', sel]);
		    ret += makeselectarray([''].
                               concat(//(Array.isArray(sel[0])||true)?
                                   !Array.isArray(sel)?
                                      Object.keys(sel):
                                      sel.map(function(x){var a = {}; a[Object.keys(x)[0]] = Object.keys(x[Object.keys(x)[0]]); return a;})),
                               {id: 'field_'+nound, name: 'field_'+nound, onchange: "onchangesub('"+key+"','"+nound+"','"+noundsub+"','"+db+"');" });
	    } else {
//        console.log(["makeselect",nound]);
		    ret += makeselectarray([''].concat(cache_select(key)),{id: 'field_'+nound, name: 'field_'+nound});
	    }
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

// cards linked per updatelog row; matches FETCH_PER_ROW in ootv-search routes/updatelog.js
const updatelogshown = 50;
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
      // stow them in the card cache
      var cards = raw.cards.hits.hits.map(x=>x._source).map(imagehashtourl);
      var updatelogtemplate = $.templates("#template-updatelog");
      cards.forEach(function(dataitem) {
			  cache_card(dataitem);
		  }); 
      raw.logs.reverse().forEach(function(uplog) {
        //console.log(['uplog',uplog]);
        var printlog = JSON.parse(JSON.stringify(uplog));
        printlog.timestamp = new Date(printlog.timestamp).toLocaleString();
        // one block per log row; long card lists (and bulkupdates with a
        // description) start collapsed. A bulkupdate can list thousands of
        // cards: link only the first updatelogshown (the ones the API fetched)
        // and count the rest, so the page doesn't build a link per card.
        var cardids = printlog.cardids || [];
        printlog.total = cardids.length;
        printlog.cards = cardids.slice(0, updatelogshown).map(function(uplogcard) {
          var card = cache_card_fetch(uplogcard);
          return { cardid: uplogcard, database: database,
                   title: card.title ? card.title[0] : 'card #'+uplogcard };
        });
        printlog.more = printlog.total - printlog.cards.length;
        printlog.collapse = printlog.total > 5 || !!printlog.description;
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

function loadselectables(db) {
  $.each(searchables[db],function( key, value ) {
	  if(value.type == 'select' || key.match(/\.sortregex$/)) {
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
  $('.printing').hide();
  $("#lastprintid").val(prid);
  $('.printing[data-printingid='+prid+']').show();
  history.replaceState({'cardidid':id, 'prid': prid, 'qs': qs}, 'Oracle - '+title, '#game='+database+',#cardid='+id+',#cnprintingid='+prid);
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
