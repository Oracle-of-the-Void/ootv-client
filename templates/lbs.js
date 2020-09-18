// advanced/basic switch  (tri-level)?
// hide search switch
console.log('Loading lbs');
dbinfo['lbs'] = {
    'name': "Legend of the Burning Sands",
    'nameshort':"LBS",
    'logo': 'lbs.png',
    'imageuri': 'https://images.oracleofthevoid.com/lbs/',
    'description':''
};
databasesort['lbs'] = {
    deck: function (a,b) {
	if (a.deck.join() == "Pre-Game" && b.deck.join() != "Pre-Game") return -1;
	if (b.deck.join() == "Pre-Game" && a.deck.join() != "Pre-Game") return 1;
	
//	if (a.deck.join() == "Dynasty" && b.deck.join() != "Dynasty") return -1;
//	if (b.deck.join() == "Dynasty" && a.deck.join() != "Dynasty") return 1;
	
	if (a.type.join() > b.type.join()) return 1;
	if (b.type.join() > a.type.join()) return -1;
	
	if (a.title.join() > b.title.join()) return 1;
	if (b.title.join() > a.title.join()) return -1;
	
	return 0;
    }
}
// deck headerizer is generalizable as any game that uses multiple "decks" and "types".
// even though lbs uses a single deck, useful for "deck" sorting to have strongholds/city sections as their own deck type
headerize['lbs'] = {
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
		listout.push({cardid: 0, title: lastdeck+" - ("+sumsdeck[lastdeck]+")", decktitle: true});
	    }
	    if(c.type.join() != lasttype) {
		lasttype = c.type.join();
		listout.push({cardid: 0, subtitle: lasttype+" - ("+sumstype[lasttype]+")", typetitle: true});
	    }
	    listout.push(c);
	});
	return listout;
    }
}

searchables['lbs'] = {
    "quick": true,
    "title": { "type": "text" },
    "text": { "type": "text" },
    "printing.set": { "sub": "printing.rarity",
			  "type": "select" },
    "printing.rarity": { "type": "select" },
    "type": { "type": "select" },
//    "keywords": { "type": "keyword" },
//    "clan": { "type": "select" },
//    "legality": { "type": "select" },
    "deck": { "type": "select" },
    "strength": { "type": "numeric",
	       "advanced": true},
    "ka": { "type": "numeric",
	       "advanced": true},
    "water": { "type": "numeric",
	       "advanced": true},
    "copper": { "type": "numeric",
	       "advanced": true},
    "influence": { "type": "numeric",
	       "advanced": true},
    "city": { "type": "numeric",
	       "advanced": true},
    "fate": { "type": "numeric",
	       "advanced": true}
};

labels['lbs'] = {
    "tagtitle": "Card Title",                  "shorttitle": "Title",
    "tagtype": "Card Type",                    "shorttype": "Type",
    "tagstrength": "Strength",                       "shortstrength": "S",
    "tagka": 	"Ka",                         "shortka": "K",
    "tagwater":	"Water",           "shortwater": "W",
    "tagcopper":	"Copper",                   "shortcopper": "C",
    "taginfluence":	"Influence",              "shortinfluence":  "I",
    "tagcity":	"City Points",   "shortcity": "CP",
    "tagfate":	"Fate",     "shortfate": "F",
    "tagtext":		"Card Text",           "shorttext": "Text",
    "tagset":		"Set",                 "shortset": "Set",
    "tagrarity":	"Rarity",              "shortrarity": "Rarity",
    "tagflavor":	"Flavor Text",         "shortflavor": "Flavor",
    "tagartist":	"Artist",              "shortartist": "Artist",
    "tagnumber":	"Card Number",         "shortnumber": "Number",
    "tagdeck":		"Deck",                "shortdeck":  "Deck",
    "tagnotes":		"Notes",               "shortnotes": "Notes"
};

/*
templateload['lbs'] = {
    'search': { 'searchtemplate': "Details",
		'visualspoiler': "Visual Spoiler",
	      },
    'card': {'cardtemplate': "Details"},
    'list': {'listtemplate': "List" }
};
*/
// Will have template-database- prepended
//       if generic, will use a generic template-   TODO
templates['lbs'] = {
    'available': {
	'search': { 
	    'longname': 'Detailed Search',
	    'shortname': 'Detail',
	    'places': [ 'search','list' ]
	},
        'visualnew': {
            'longname': 'NEW Visual Spoiler',
            'shortname': 'NEW Visual',
            'places': [ 'search','list' ],
            'generic': true
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
    if(database == 'lbs') {
	$('body').css("background-image","url('res/background-lbs.jpg')");
    }
});

/* callbacks after lookups happen - parameterized initial version, leaving hooks in case they are needed for special things */
//  updatecallback['lbs'] = function() { ...   ;  updatecallbackgeneral('lbs')}

/* replacements for text on page (updates) */
// maybe figure out how to parameterize, and set that a section has been done already via classes/jquery, to avoid infinite scroll slowness
updates['lbs'] = function (area) {

};
