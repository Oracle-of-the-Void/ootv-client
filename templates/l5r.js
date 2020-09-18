/* TODO */
// advanced/basic switch  (tri-level)?
// hide search switch
dbinfo['l5r'] = {
    'name': "Legend of the Five Rings",
    'nameshort':'L5R',
    'logo': 'l5r.png',
    'imageuri': 'https://images.oracleofthevoid.com/l5r/',
    'description':'A collectible card game, set in a fantasy empire called Rokugan, based loosely upon medieval Japan and Japanese Mythology.\n<br /><br />\nThe factions available have changed over the editions, but generally include the 7 Great Clans: Crab, Crane, Dragon, Lion, Phoenix, Scorpion, and Unicorn. Each has specific thematic elements, which are consistent across editions and descendant games. The other currently legal factions include the Spider, Mantis, and an unaligned ronin stronghold.\n<br /><br />\nThe Rokugan setting has been changed over the years by participation in the storyline tournaments for the L5R CCG.\n<br /><br />\nLegend of the Five Rings is different from other collectible card games due to the concept of Clan loyalty. The Clans of the game are what you build your deck around, and the communities that have built up around the Crane Clan, Lion Clan, etc are the backbone of the game. When you say "I\'m a Crab player" you instantly find yourself with hundreds and thousands of clan-mates who are there to help you become a better player. When one member of the Clan wins, all benefit.\n<br /><br />\nL5R was the first CCG to introduce cards that players directly influenced. These are still a core part of the game.\n<br /><br />\nThe L5R CCG has spun off a number of related games: \n<ul>\n<li>Clan War, a miniatures game.\n<li>Diskwars: Legend of the Five Rings, a Rokugan-themed set of the Diskwars tabletop combat game.\n<li>Legend of the Five Rings Roleplaying Game\n</ul>\nAs of 2006, only the CCG and Clan War have had storyline tournaments. Though the RPG players have been heavily involved in the ongoing plot in recent years.\n<br /><br />\nIn 2008, L5R held the first "Mega-Game" which incorporated various methods of competition for the Clans and their supporters, not only in CCG form, but in contests (art, writing, poster-design, etc.), community work (charity, fundraising, food-drives), and more. The Dragon Clan ultimately won the first mega-game, and as such earned the privilege of having the next Empress come from their clan.\n<br /><br />\nIn 2009, L5R released its first graphic novel, Death at Koten, which also included exclusive story-themed cards for the CCG.\n<br /><br />\nAlso in 2009, L5R released The Imperial Gift the first completely free expansion in CCG history.\n<br /><br />\nIn 2010 L5R celebrated its 15th Anniversary with many major events, new prizes, more free cards, and a special flashback set that brought back some of the most popular cards in the history of the game. 2010 also saw the largest World Championships event at Gen Con in the past 7 years.\n<br /><br />\n2011 saw the release of War of Honor, an all new tile-based multiplayer format for L5R that comes with 4 pre-constructed decks.\n<br /><br />\nIn september 2015, AEG and Fantasy Flight Games announced that FFG had bought the L5R brand from AEG and will relaunch the card game as a LCG (non-collectible), with significant rules changes and a new design. The game went on hiatus following the release of Evil Portents, the final expansion from AEG, and was relaunched as an LCG, ending the CCG.   There are significant differences between the LCG and CCG making them not the same game in the least.\n' 
};
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
};
// deck headerizer is generalizable as any game that uses multiple "decks" and "types".
headerize['l5r'] = {
    deck: function(listdata) {
	var sumstype = {};
	var sumsdeck = {};
	var counttype = {};
	var countdeck = {};
	listdata.forEach(function(c) {
	    if(sumstype[c.type.join()] === undefined) { sumstype[c.type.join()] = 0; counttype[c.type.join()] = 0; }
	    sumstype[c.type.join()]+=c.listquantity;
	    counttype[c.type.join()] += 1;
	    if(sumsdeck[c.deck.join()] === undefined) { sumsdeck[c.deck.join()] = 0; countdeck[c.deck.join()] = 0; }
	    sumsdeck[c.deck.join()]+=c.listquantity;
	    countdeck[c.deck.join()] += 1;
	});
	var lasttype = '';
	var lastdeck = '';
	var listout = [];
	listdata.forEach(function(c) {
	    if(c.deck.join() != lastdeck) {
		lastdeck = c.deck.join();
		listout.push({cardid: 0, title: lastdeck+" - ("+sumsdeck[lastdeck]+") ["+countdeck[lastdeck]+" distinct]", decktitle: true});
	    }
	    if(c.type.join() != lasttype) {
		lasttype = c.type.join();
		listout.push({cardid: 0, subtitle: lasttype+" - ("+sumstype[lasttype]+") ["+counttype[lasttype]+" distinct]", typetitle: true});
	    }
	    listout.push(c);
	});
	return listout;
    }
};

searchables['l5r'] = {
    "quick": true,
    "title": { "type": "text" },
    "printing.set": { "sub": "printing.rarity",
			                "type": "select",
                      "reverse": true
                    },
    "printing.rarity": { "type": "select",
                         "reverse": true
                       },
    "type": { "type": "select" },
    "keywords": { "type": "keyword" },
    "text": { "type": "text" },
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
	              "advanced": true,
                "reverse": true
              },
    "notes": { "type": "text",
	       "advanced": true },
    "number": { "type": "numeric" ,
	       "advanced": true},
    "legaldate": { "type": "text",
		   "advanced": true },
    "banned": { "type": "exists",
		"advanced": true },
    "erratum": { "type": "exists",
		 "advanced": true },
    "mrp": { "type": "exists",
		"advanced": true }
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
    "tagbanned":	"Banned",          "shortbanned": "Banned",
    "tagerratum":	"Erratum",          "shorterratum": "Erratum",
    "tagmrp":	"MRP",          "shortmrp": "MRP",
    "tagdeck":		"Deck",                "shortdeck":  "Deck",
    "tagnotes":		"Notes",               "shortnotes": "Notes"
};

/*
templateload['l5r'] = {
    'search': { 'searchtemplate': "Details",
		'visualspoiler': "Visual Spoiler",
	      },
    'card': {'cardtemplate': "Details"},
    'list': {'listtemplate': "List" }
};
*/
templates['l5r'] = {
    'available': {
	'search': { 
	    'longname': 'Detailed Search',
	    'shortname': 'Detail',
	    'places': [ 'search','list' ]
	},
	'visual': { 
	    'longname': 'Visual Spoiler',
	    'shortname': 'Visual',
	    'places': [ 'search','list' ],
	    'generic': true
	},
	'visual-deck': { 
	    'longname': 'Visual Deck',
	    'shortname': 'Deck',
	    'places': [ 'list' ],
	    'generic': true,
	    'headerizable': true
	},
	'visual-premium': { 
	    'longname': 'Visual Spoiler - Large',
	    'shortname': 'Visual(L)',
	    'places': [ 'search','list' ],
	    'premium': true,
	    'generic':true
	},
	'card':  { 
	    'longname': 'Card Details',
	    'shortname': 'Card',
	    'places': [ 'card' ]
	},
	'card-premium':  { 
	    'longname': 'Card Large',
	    'shortname': 'Card(L)',
	    'places': [ 'card' ]
	},
	'list': {
	    'longname': 'Simple List',
	    'shortname': 'List',
	    'places': [ 'search','list'],
	    'headerizable': true,
	    'generic':true
	},
	'pdf': {
	    'longname': 'PDF Print-n-Play',
	    'shortname': 'PDF',
	    'places': [ ],
	    'generic':true
	},
	'text': {
	    'longname': 'Plain text',
	    'shortname': 'Text',
	    'places': [ ],
	    'headerizable': true,
	    'generic': true
	},
	'textsnm': {
	    'longname': 'Sun and Moon Text',
	    'shortname': 'Text',
	    'places': [ ],
	    'headerizable': true,
	    'generic': true
	},
	'texttab': {
	    'longname': 'Tab-delimited text',
	    'shortname': 'Text',
	    'places': [ ],
	    'headerizable': true,
	    'generic': true
	},
	'texteopk': {
	    'longname': 'Egg of Pan\'Ku text',
	    'shortname': 'Text',
	    'places': [ ],
	    'headerizable': true,
	    'generic': true
	},
	'textlackey': {
	    'longname': 'Lackey text',
	    'shortname': 'Text',
	    'places': [ ],
	    'headerizable': true,
	    'generic': true
	},
	'html': {
	    'longname': 'Plain text',
	    'shortname': 'Text',
	    'places': [ 'list' ],
	    'headerizable': true,
	    'generic': true
	}
    },
    'default': { 
	'search': 'search',
	'card': 'card',
	'list': 'list' 
    },
    'compiled': {},
    'active': {},
    'sort': {'search':''}
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
