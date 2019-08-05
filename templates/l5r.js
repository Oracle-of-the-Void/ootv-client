/* TODO */
// advanced/basic switch  (tri-level)?
// hide search switch
databasesort['l5r'] = {
    deck: function (a,b) {
	if (a.deck.join() == "Pre-Game" && b.deck.join() != "Pre-Game") return -1;
	if (b.deck.join() == "Pre-Game" && a.deck.join() != "Pre-Game") return 1;
	
	if (a.deck.join() == "Dynasty" && b.deck.join() != "Dynasty") return -1;
	if (b.deck.join() == "Dynasty" && a.deck.join() != "Dynasty") return 1;
	
	if (a.type.join() > b.type.join()) return 1;
	if (b.type.join() > a.type.join()) return -1;
	
	if (a.title.join() > b.title.join()) return 1;
	if (b.title.join() > a.title.join()) return -1;
	
	return 0;
    }
}
// deck headerizer is generalizable as any game that uses multiple "decks" and "types".
headerize['l5r'] = {
    deck: function(listdata) {
	var sumstype = {};
	var sumsdeck = {};
	listdata.forEach(function(c) {
	    if(sumstype[c.type.join()] === undefined) { sumstype[c.type.join()] = 0; }
	    sumstype[c.type.join()]++;
	    if(sumsdeck[c.deck.join()] === undefined) { sumsdeck[c.deck.join()] = 0; }
	    sumsdeck[c.deck.join()]++;
	});
	var lasttype = '';
	var lastdeck = '';
	var listout = [];
	listdata.forEach(function(c) {
	    if(c.deck.join() != lastdeck) {
		lastdeck = c.deck.join();
		listout.push({cardid: 0, title: lastdeck+" - ("+sumsdeck[lastdeck]+")"});
	    }
	    if(c.type.join() != lasttype) {
		lasttype = c.type.join();
		listout.push({cardid: 0, subtitle: lasttype+" - ("+sumstype[lasttype]+")"});
	    }
	    listout.push(c);
	});
	return listout;
    }
}

searchables['l5r'] = {
    "quick": true,
    "title": { "type": "text" },
    "printing.set": { "sub": "printing.rarity",
			  "type": "select" },
    "printing.rarity": { "type": "select" },
    "type": { "type": "select" },
    "keywords": { "type": "keyword" },
    "clan": { "type": "select" },
    "legality": { "type": "select" },
    "deck": { "type": "select" },
    "force": { "type": "numeric",
	       "advanced": true},
    "chi": { "type": "numeric",
	       "advanced": true},
    "honor": { "type": "numeric",
	       "advanced": true},
    "cost": { "type": "numeric",
	       "advanced": true},
    "ph": { "type": "numeric",
	       "advanced": true},
    "strength": { "type": "numeric",
	       "advanced": true},
    "production": { "type": "numeric",
	       "advanced": true},
    "startinghonor": { "type": "numeric",
	       "advanced": true},
    "focus": { "type": "numeric",
	       "advanced": true},
    "flavor": { "type": "text",
	       "advanced": true },
    "story": { "type": "text",
	       "advanced": true },
    "artist": { "type": "text",
	       "advanced": true },
    "notes": { "type": "text",
	       "advanced": true },
    "number": { "type": "text" ,
	       "advanced": true},
    "legaldate": { "type": "text",
	       "advanced": true }
/* TODO:  erratum, banned, mrp checkboxes from old one?  */
/*
  advanced:
  force
  chi
  HR
  GC
  PH
  PS
  GP
  SH
  text
  focus
  flavor
  storyline
  artist
  number
  legal date
  notes
*/
};

labels['l5r'] = {
    "tagtitle": "Card Title",                  "shorttitle": "Title",
    "tagtype": "Card Type",                    "shorttype": "Type",
    "tagforce": "Force",                       "shortforce": "F",
    "tagchi": 	"Chi",                         "shortchi": "C",
    "taghonor":	"Honor Requirement",           "shorthonor": "HR",
    "tagcost":	"Gold Cost",                   "shortcost": "Cost",
    "tagph":	"Personal Honor",              "shortph":  "PH",
    "tagstrength":	"Province Strength",   "shortstrength": "PS",
    "tagproduction":	"Gold Production",     "shortproduction": "GP",
    "tagstartinghonor":	"Starting Family Honor",  "shortstartinghonor": "SH",
    "tagclan":		"Clan",                "shortclan":    "Clan",
    "tagkeywords":	"Keywords",            "shortkeywords": "Keywords",
    "tagtext":		"Card Text",           "shorttext": "Text",
    "tagfocus":		"Focus Value",         "shortfocus":    "Focus",
    "tagset":		"Set",                 "shortset": "Set",
    "tagrarity":	"Rarity",              "shortrarity": "Rarity",
    "taglegality":	"Legality",            "shortlegality": "Legality",
    "tagflavor":	"Flavor Text",         "shortflavor": "Flavor",
    "tagstory":		"Storyline Credit",    "shortstory": "Story",
    "tagartist":	"Artist",              "shortartist": "Artist",
    "tagnumber":	"Card Number",         "shortnumber": "Number",
    "taglegaldate":	"Legal Date",          "shortlegaldate": "Date",
    "tagdeck":		"Deck",                "shortdeck":  "Deck",
    "tagnotes":		"Notes",               "shortnotes": "Notes"
};

templateload['l5r'] = {
    'search': { 'searchtemplate': "Details",
		'visualspoiler': "Visual Spoiler",
	      },
    'card': {'cardtemplate': "Details"},
    'list': {'listtemplate': "List" }
};

$(document).ready(function(){
});

/* callbacks after lookups happen - parameterized initial version, leaving hooks in case they are needed for special things */
//  updatecallback['l5r'] = function() { ...   ;  updatecallbackgeneral('l5r')}

/* replacements for text on page (updates) */
// TODO: some things seem to be missing... were some defined as [Rank-15] instead of with colons?
// maybe figure out how to parameterize, and set that a section has been done already via classes/jquery, to avoid infinite scroll slowness
updates['l5r'] = function (area) {
  $(area+" .listbody").html(function(index, html) {
    return html.replace(/:g1:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_01.png" />'). //   | Gold symbol with 01 on top   |
    replace(/:g2:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_02.png" />'). //   | Gold symbol with 02 on top   |
    replace(/:g3:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_03.png" />'). //   | Gold symbol with 03 on top   |
    replace(/:g4:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_04.png" />'). //   | Gold symbol with 04 on top   |
    replace(/:g5:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_05.png" />'). //   | Gold symbol with 05 on top   |
    replace(/:g6:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_06.png" />'). //   | Gold symbol with 06 on top   |
    replace(/:g7:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_07.png" />'). //   | Gold symbol with 07 on top   |
    replace(/:g8:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_08.png" />'). //   | Gold symbol with 08 on top   |
    replace(/:g9:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_09.png" />'). //   | Gold symbol with 09 on top   |
    replace(/:g10:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_10.png" />'). //   | Gold symbol with 10 on top   |
    replace(/:g11:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_11.png" />'). //   | Gold symbol with 11 on top   |
    replace(/:g12:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_12.png" />'). //   | Gold symbol with 12 on top   |
    replace(/:g13:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_13.png" />'). //   | Gold symbol with 13 on top   |
    replace(/:g14:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_14.png" />'). //   | Gold symbol with 14 on top   |
    replace(/:g15:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_15.png" />'). //   | Gold symbol with 15 on top   |
    replace(/:g16:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_16.png" />'). //   | Gold symbol with 16 on top   |
    replace(/:g17:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_17.png" />'). //   | Gold symbol with 17 on top   |
    replace(/:g18:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_18.png" />'). //   | Gold symbol with 18 on top   |
    replace(/:g19:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_19.png" />'). //   | Gold symbol with 19 on top   |
    replace(/:g20:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_20.png" />'). //   | Gold symbol with 20 on top   |
    replace(/:gstar:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_star.png" />'). // | Gold symbol with star on top |
    replace(/:\*:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_star.png" />'). // | Gold symbol with star on top |
    replace(/:X:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_star.png" />'). // | Gold symbol with star on top |
    replace(/:g\*:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_star.png" />'). // | Gold symbol with star on top |
    replace(/:g0:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_00.png" />'). //   | Gold symbol with 0 on top    |
    replace(/:0:/g,'<img class="inlinesymbol" src="res/icon-cards-small/g_00.png" />'). //   | Gold symbol with 0 on top    |
    replace(/:bow:/g,'<span class="l5rsym">w</span>'). //                                                    | Bowing symbol                |
    replace(/:Rank:/g,'<span class="l5rsym" style="font-size: 200%;">c</span>'). //                           | Blank Rank symbol            |
    replace(/:Rank-1:/g,'<span class="l5rsym" style="font-size: 200%;">f</span>'). //                           | -1 rank symbol               |
    replace(/:Rank-3:/g,'<span class="l5rsym" style="font-size: 200%;">d</span>'). //                           | rank -3 symbol               |
    replace(/:Rank-2:/g,'<span class="l5rsym" style="font-size: 200%;">e</span>'). //                           | rank -2 symbol               |
    replace(/:Rank+1:/g,'<span class="l5rsym" style="font-size: 200%;">g</span>'). //                           | rank +1 symbol               |
    replace(/:Rank+2:/g,'<span class="l5rsym" style="font-size: 200%;">h</span>'). //                           | rank +2 symbol               |
    replace(/:Rank+3:/g,'<span class="l5rsym" style="font-size: 200%;">i</span>'). //                           | rank +3 symbol               |
    replace(/:Rank10:/g,'<span class="l5rsym" style="font-size: 200%;">j</span>'); //                           | rank 10 symbol               |
  });
};
