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
// potential for language stuff:
const searcherror = {'empty': '<div class="error"><img src="res/splatout-150.png"><br>No cards found.</div>',
		     'error': '<div class="error"><img src="res/splatout-150.png"><br>Something went wrong with the search.</div>',
		     'more': '<div class="more">More Results (Click to load)</div>',
		     'moreloading': '<div class="moreloading">Loading <img width=20 src="res/shuriken-150x150.png-animated.gif" /></div>',
		     'loading': '<img src="res/shuriken-150x150.png-animated.gif" />',
		     'numresults': 'XXX cards found',
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
if(found = window.location.href.match(/(\w+)\.html/)) {
  if(found && found[1] != 'index') {
	  database = found[1];
	  console.log("database: "+database);
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
    $('#userinfo-drop').html(hellotemplate.render({cognito: info.cognito, oracle: info.oracle[0]}));
//    $(".helloplace").replaceWith(hellotemplate.render({cognito: info.cognito, oracle: info.oracle[0]}));
    //	  $(".infoplace:first-child").before(hellotemplate.render({cognito: data.cognito, oracle: data.oracle[0]}));
    listinfo(); // TODO:  more intelligently decide if we need to do listinfo or just the callback
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
			      console.log('nosort set');
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
		    var listid = $("#importlistid").val();
		    erasemodal();
		    cache_thing("list",listid,null,true); //TODO  we might seed the cache..  but we get no verification that it took.  DynamoDB has no guarantee it's fresh, so might blow cache here.
		    listinfo(listid);
	    }
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
  $(listertemplate.render(cache_thing("list","data").lists.Items)).insertAfter(".directorylistheader");
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
    modal(title,importtemplate.render({"listid": listid, "database": database}));
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
    }
    var editcardtemplate = $.templates("#template-editcard");
    modal(title,editcardtemplate.render({"cardid": cardid, "printid": printid, "carddata": JSON.stringify(printing,null,2), "database": database}));
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
        cardfetch(requestdata.cardid,status.olddata.printingid?status.olddata.printingid:null,null,nomodal);
      } else if(status.cardids) {
        cardfetch(status.cardids[0],null,null,nomodal);
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
        cardfetch(requestdata.cardid,printid,null,nomodal);
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
	              console.log("Card missing a printimagehash: "+JSON.stringify(card));
	          }
             }
        }
        //printing: {{if ~datarequest.field_printing_edition}}{{imagehashfromset ~datarequest.field_printing_edition printing /}}/printing_{{:cardid}}_{{printingidfromset ~datarequest.field_printing_edition printing /}}_select.jpg{{else}}{{:imagehash}}/card_{{:cardid}}__icon.jpg{{/if}}
    
    card.printingreverse = {printingid: {}};
    for(var p = 0; p < card.printing.length; p++) {
        card.printingreverse.printingid[card.printing[p].printingid] = p;
    }
    for(seakey in searchables[database]) {
        sea = searchables[database][seakey];
        if((typeof sea === 'object') && ('reverse' in sea)) {
            card.printingreverse[seakey.replace("printing.","")] = {};
            for(var p = 0; p < card.printing.length; p++) {
                if(seakey.replace("printing.","") in card.printing[p]) {
                    card.printingreverse[seakey.replace("printing.","")][card.printing[p][seakey.replace("printing.","")][0]] = p;
                }
            }
            if(jQuery.isEmptyObject(card.printingreverse[seakey.replace("printing.","")])) {
                delete card.printingreverse[seakey.replace("printing.","")];
            }
        }
    }
    return card;
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

  console.log(['dosearch.datarequest',datarequest]);
  var qs = $.param(datarequest);

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
		    } else {
      		$("#resultsearch").html(searcherror['empty']);
		    }
	    },
	    error: function(error) {
    		console.log("Epic Fail: "+JSON.stringify(error));
		    console.log(error);
		    $("#resultsearch").html(searcherror['error']);
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
    listdata.sort(databasesort[database][sort] != undefined?databasesort[database][sort]:
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
	    var html = getactivetemplate('list').render(headerize[database][sort] != undefined ? headerize[database][sort](listdata) : listdata,{
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
	    var text = templates[database]['compiled'][textparts[0]].render((headerize[database]['deck'] != undefined && sort == 'deck' && textparts.indexOf('noheaders')<0) ? headerize[database]['deck'](listdata) : listdata,{
		"labels": labels[database],
		datarequest:{'listid':listid,'sort':sort},
		"database":database
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
	    $("#resultlist").html(html);
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

function dolist(listdata=[],listlist=[],sort,listid=null,listoutput=null) {
    console.log(["dolist: "+sort,listid]);
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

function getDataUri(url, callback) {
    var image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = function () {
      var canvas = document.createElement('canvas');
      if(this.naturalWidth <= this.naturalHeight) {
        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size
        ctx = canvas.getContext('2d');
        ctx.drawImage(this, 0, 0);
        //        canvas.rotate(90*Math.PI/180);
      } else {
        //console.log(["WxH",this.naturalWidth,this.naturalHeight]);
        canvas.height = this.naturalWidth;
        canvas.width = this.naturalHeight;
        ctx = canvas.getContext('2d');
        ctx.save();
        ctx.translate(canvas.width/2,canvas.height/2);
        ctx.rotate(90*Math.PI/180);
        ctx.drawImage(this,-this.width/2,-this.height/2);
        ctx.restore();
      }
      callback(canvas.toDataURL('image/png'));
    };
    image.src = url;
}

function checkfilename(data) {
    return data.startsWith("filename:");
}
function createpdf(data,listoutput='') {
    // TODO: createpdf
    var metadata = listoutput.split(",");
    console.log(metadata.find(checkfilename));
    var fn = metadata.find(checkfilename)?metadata.find(checkfilename).replace("filename:",''):"decklist";
    console.log('createpdf');
    console.log(data);
    var images = [];
    for(card of data) {
	    for(p of card.printing) {
	      if(p.printingid == ((card.listprinting>0)?card.listprinting:card.printingprimary)) {
          if(p.image) {
		        for(i of p.image) {  // NEW STYLE
		          for(cn = 0; cn < card.listquantity; cn++) {
                images.push(dbinfo[database].imageuri+p.imagehash+'/'+i.details+'?x-corsworkaround=true');
		          }
            }
          } else {
		        for(i of p.images) {  // OLD STYLE:  as soon as all games get updated, you can remove this and the code above mentioning printimagehash
		          for(cn = 0; cn < card.listquantity; cn++) {
			          images.push(i+'details.jpg?x-corsworkaround=true'); 
		          }
		        }
          }
	      }
	    }
    }
    console.log(images);

    var imagedata = [];
    for(image of images) {
	    getDataUri(image,function(data) {
	      imagedata.push(data);
	      if(imagedata.length == images.length) {
		      const doc = new PDFDocument({
		        "layout": "portrait", // landscape
		        "size": "letter", // A4, etc
		        margins: { top: 18, bottom: 18, left: 18, right: 18 }
		      });
		      doc.info['Title'] = fn;
		      const stream = doc.pipe(blobStream());
		      ix = 2.5*72;
		      mx = (612-3*ix)/2;
		      iy = 3.5*72;
		      my = (792-3*iy)/2;

		      for(var i=0 ; i < imagedata.length; i++) {
		        doc.image(imagedata[i],mx+(i%3)*ix,my+Math.floor((i%9)/3)*iy,{fit: [ ix,iy ]});
		        if(i%9 == 8 && (i<imagedata.length -1)) {
			        doc.addPage();
		        }
		      }
		      doc.end();
		      stream.on('finish', function() {
            //		    const url = stream.toBlobURL('application/pdf');
            //		    window.open(url);
		        data_url_to_download(stream.toBlobURL('application/pdf'),fn+".pdf");
		      });

// TODO:   https://stackoverflow.com/questions/30965249/pdfkit-js-how-to-save-document-to-file-win-8-app
          
	      }
	    });
    }
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
function docard(carddata,prid=null,qs=null,pop=false) {
  console.log("rendering: "+carddata['cardid']+(prid?'/'+prid:''));
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
    if(searchables[database][key].clickable == true) {
      if(key.includes('.')) {
        var keys = key.split('.');
        for (let i=0;i<carddata[keys[0]].length;i++) {
          if(carddata[keys[0]][i][keys[1]]) {
            carddata[keys[0]][i][keys[1]] = carddata[keys[0]][i][keys[1]].map(function(x){return process_keywordlink(x,key,searchables[database][key].type);});
          }
        }
      } else {
        if(carddata[key]) {
          carddata[key] = carddata[key].map(function(x){return process_keywordlink(x,key,searchables[database][key].type);});
        }
      }
    }
  }
  var override = getactivetemplateoverride('card');
  for ( v in override.var?override.var:{}) {
    tmpl[v] = override.var[v];
  }
	console.log(["rendering card",tmpl,carddata]);
  var html = getactivetemplate('card').render(carddata,tmpl);
  $("#resultcard").html(html);
  updates[database]('#resultcard');
  var primary = $("#printingprimary").val();
  $(".printing:not([data-printingid="+(prid?prid:primary)+"])").hide();
  $("#lastprintid").val(prid?prid:primary);

  if($("#resultsearch").is(":visible")) {
	  history.pushState({'cardid':carddata['cardid'], 'prid': prid, 'qs': qs}, 'Oracle - '+carddata['title'], '#game='+database+',#cardid='+carddata['cardid']);
  } else if($("#resultcard").is(":visible")) {
	  // TODO:   don't replace if new is a cut/paste..... only on cardnext/cardprev (cnprintingid changes not handled here)
	  history.replaceState({'cardid':carddata['cardid'], 'prid': prid, 'qs': qs}, 'Oracle - '+carddata['title'], '#game='+database+',#cardid='+carddata['cardid']+(prid?',#cnprintingid='+prid:''));
  }
  showcard();
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
  return getactivetemplate('search').render(data,tmpl);
}


// ******************** PAGING HELPERS ********************
// sets up "MORE" and numresultsearchs...   both cached and non-cached searches use it
function dosearchpostcallback(qs) {
    if(!$('.error').length) {
	if(searchcache[database]['querydata'][qs].length < searchcache[database]['querytotal'][qs]) {
	    $("#resultsearch").append('<a href="" onclick="scrollforceload(); return false;">'+searcherror['more']+'</a>');
	}
	//	if(!$('.numresults').length) {
	$(".numresults").html(searcherror['numresults'].replace('XXX',searchcache[database]['querytotal'][qs]));
	//	}
    }
}

function showcard() {
    $('#tabs a[name=resultcard]').click();
//    $("#resultsearch").hide();
//    $("#resultlist").hide();
//    $("#resultcard").show();
}
function showlist() {
    $('#tabs a[name=resultlist]').click();
//    $("#resultsearch").hide();
//    $("#resultlist").show();
//    $("#resultcard").hide();
}
function showsearch() {
    $('#tabs a[name=resultsearch]').click();
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
        for(att in card.printingreverse) {
            if("field_printing_"+att in datarequest) {
                if(datarequest["field_printing_"+att] in card.printingreverse[att]) {
                    pr = card.printingreverse[att][datarequest["field_printing_"+att]];
                }
            } else if("field_"+att in datarequest) {
                if(datarequest["field_"+att] in card.printingreverse[att]) {
                    pr = card.printingreverse[att][datarequest["field_"+att]];
                }
            }
        }
    }
    return card.printing[pr];
}
function templatefetchimage(card,size,id=false,datarequest={}) {
//  console.log(['templatefetchimage',card,size,id,datarequest]);
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
  updatetemplatedropdown(type);
}
function getactivetemplate(type) {
    return templates[database]['compiled'][templates[database]['active'][type]];
}
function getactivetemplateoverride(type) {
  var t=templates[database]['available'][templates[database]['active'][type]];
  return t.override?t.override:{};
}
function updatetemplatedropdown(type) {
  var pulldown = "";
  for ( key in templates[database].available ) {
	  if(templates[database]['available'][key].places.includes(type)) {
	    pulldown += "<li "+(templates[database]['active'][type] == key?'class="menuactive" ':'')+"onclick=\"activatetemplate('"+type+"','"+key+"');\">"+templates[database]['available'][key]['longname']+"</li>";
	  }
  }
  if(type == 'search') {
	  pulldown += updatesortdropdown(type);
  }
  $("#"+type+"templatedropdown").html(pulldown);
}
function updatesortdropdown(type) {
  var sortdown = '<li class="menunone pullmenuright menusort">Sort<ul>';
  for (key in searchsorts[database]) {
	  sortdown += '<li'+(templates[database]['sort'][type] == key?' class="menuactive'+(templates[database]['sortdir'][type]&&templates[database]['sortdir'][type]=='desc'?' searchdesc"':'"'):'')+" onclick=\"changesort('"+type+"','"+encodeURI(key)+"');\">"+searchsorts[database][key]+'</li>';
  }
  return sortdown+'</ul></li>';
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
    updatetemplatedropdown(type);
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
  $("#tabs li:first").attr("id","current"); // Activate the first tab
  $("#resultabout").fadeIn(); // Show first tab's content
  $('#tabs a').click(function(e) {
    e.preventDefault();
    if ($(this).closest("li").attr("id") == "current"){ //detection for current tab
      return;
    }
    else{
	    $(".ui-layout-center div[id^=result]").hide(); // Hide all content
      $("#tabs li").attr("id",""); //Reset id's
      $(this).parent().attr("id","current"); // Activate this
      $('#' + $(this).attr('name')).fadeIn(); // Show content for the current tab
    }
  });
  
  //TODO:  put some stuff in here into functions.   make sure order optimized.
  searchcache[database] = {
	  'data': {},    'querydata': {},    'querytotal': {}
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
		      updatetemplatedropdown(type);
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
  
  $('.gameinfo-game').html(dbinfo[database].name);
  $('.gameinfo-gameshort').html(dbinfo[database].nameshort);
  $('.gameinfo-gamelogo15').html('<img src="gamelogos/15/'+dbinfo[database].logo+'">');
  
  urlparser();
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
    $("input#qs").val(matchstruct["quicksearch"]);
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
        printlog.cardids.forEach(function(uplogcard) {
          printlog['card'] = cache_card_fetch(uplogcard);
          printlog['cardid'] = uplogcard;
          printlog['database'] = database;
          $('#updatelog').prepend(updatelogtemplate.render(printlog));
        });
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

function scrollforceload() {
    // ajax call get data from server and append to the div
    if($('.more').length) {
	$('.more').remove();
	dosearch(searchcache[database]['querydata'][$('#lastsearchquery').val()].length);
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
    if((index >= searchcache[database]['querydata'][qs].length - 5) && (searchcache[database]['querydata'][qs].length < searchcache[database]['querytotal'][qs])) {
	dosearch(searchcache[database]['querydata'][$('#lastsearchquery').val()].length);
    }
    if(index < searchcache[database]['querydata'][qs].length - 1) {
	docardid(searchcache[database]['querydata'][qs][searchcache[database]['querydata'][qs].indexOf(id)+1],null,qs);
    }
}

function sidebarcloser() {
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
    return     JSON.parse(JSON.stringify(searchcache[database]['data'][cardid]));
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
