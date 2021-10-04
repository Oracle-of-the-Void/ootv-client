dbinfo['initiald'] = {
    'name': "Initial D CCG",
    'nameshort':'initiald',
    'logo': 'initiald.png',
    'imageuri': 'https://images.oracleofthevoid.com/initiald/',
    'description':'A collectible card game about the Initial D anime series.'
};
databasesort['initiald'] = {
    deck: function (a,b) {
	if (a.type.join() > b.type.join()) return 1;
	if (b.type.join() > a.type.join()) return -1;
	
	if (a.title.join() > b.title.join()) return 1;
	if (b.title.join() > a.title.join()) return -1;
	
	return 0;
    }
};
// deck headerizer is generalizable as any game that uses multiple "decks" and "types".
headerize['initiald'] = {
    deck: function(listdata) {
	var sumstype = {};
	var counttype = {};
	listdata.forEach(function(c) {
	    if(sumstype[c.type.join()] === undefined) { sumstype[c.type.join()] = 0; counttype[c.type.join()] = 0; }
	    sumstype[c.type.join()]+=c.listquantity;
	    counttype[c.type.join()] += 1;
	});
	var lasttype = '';
	var listout = [];
	listdata.forEach(function(c) {
	    if(c.type.join() != lasttype) {
		lasttype = c.type.join();
		listout.push({cardid: 0, subtitle: lasttype+" - ("+sumstype[lasttype]+") ["+counttype[lasttype]+" distinct]", typetitle: true});
	    }
	    listout.push(c);
	});
	return listout;
    }
};

searchables['initiald'] = {
  "quick": { "type": "quick" },
  "title": { "type": "text" },
  "printing.set": { "type": "select", "sub": "printing.rarity"
  }, "printing.rarity": { "type": "select" },
  "type": { "type": "select" },
  "traits": { "type": "keyword" },
  "only": { "type": "text" },
  "text": { "type": "text" },
  "stages": { "type": "select", "advanced": true },
  "tactic": { "type": "numeric", "advanced": true },
  "turn": { "type": "numeric", "advanced": true },
  "speed": { "type": "numeric", "advanced": true },
  "straight": { "type": "numeric", "advanced": true },
  "curves": { "type": "numeric", "advanced": true },
  "obstacles": { "type": "numeric", "advanced": true },
  "requires": { "type": "numeric", "advanced": true },
  "requiretype": { "type": "select", "advanced": true },
  "power": { "type": "numeric", "advanced": true },
  "traction": { "type": "numeric", "advanced": true },
  "cost": { "type": "numeric", "advanced": true },
  "mods": { "type": "numeric", "advanced": true },
  "printing.flavor": { "type": "text", "advanced": true },
  "notes": { "type": "text", "advanced": true },
  "printing.cardno": { "type": "numeric", "advanced": true }
};

labels['initiald'] = {
  "tagquick": "All",
  "shortquick": "All",
  "tagtitle": "Card Title",
  "shorttitle": "Title",
  "tagset": "Set",
  "shortset": "Set",
  "tagrarity": "Rarity",
  "shortrarity": "Rarity",
  "tagtype": "Card Type",
  "shorttype": "Type",
  "tagtraits": "Traits",
  "shorttraits": "Traits",
  "tagonly": "Only Used By",
  "shortonly": "Only",
  "tagtext": "Card Text",
  "shorttext": "Text",
  "tagstages": "Stages",
  "shortstages": "Stages",
  "tagtactic": "Tactic",
  "shorttactic": "Ta",
  "tagturn": "Turn",
  "shortturn": "Tu",
  "tagspeed": "Speed",
  "shortspeed": "Sp",
  "tagstraight": "Straight",
  "shortstraight": "St",
  "tagcurves": "Curves",
  "shortcurves": "Cu",
  "tagobstacles": "Obstacles",
  "shortobstacles": "Ob",
  "tagrequires": "Requires",
  "shortrequires": "Requires",
  "tagrequiretype": "Require Type",
  "shortrequiretype": "Require Type",
  "tagpower": "Power",
  "shortpower": "Power",
  "tagtraction": "Traction",
  "shorttraction": "Traction",
  "tagcost": "Cost",
  "shortcost": "Cost",
  "tagmods": "Max # Mods",
  "shortmods": "Mods",
  "tagflavor": "Flavor Text",
  "shortflavor": "Flavor",
  "tagnotes": "Notes",
  "shortnotes": "Notes",
  "tagcardno": "Card Number",
  "shortcardno": "Number",
  "tagsetno": "Cards in Set",
  "shortsetno": "In Set",
  "tagcopy": "Copyright",
  "shortcopy": "Copyright"
};

/*
templateload['initiald'] = {
    'search': { 'searchtemplate': "Details",
		'visualspoiler': "Visual Spoiler",
	      },
    'card': {'cardtemplate': "Details"},
    'list': {'listtemplate': "List" }
};
*/
templates['initiald'] = {
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
	    'generic':true,
	    'override': {
                   'templatekey': 'visual',
                   'var': { 'imageclass': 'details' }
            }
	},
	'card':  { 
	    'longname': 'Card Details',
	    'shortname': 'Card',
	    'places': [ 'card' ]
	},
	'card-premium':  { 
	    'longname': 'Card Large',
	    'shortname': 'Card(L)',
	    'places': [ 'card' ],
	    'override': {
                   'templatekey': 'card',
                   'var': { 'imageclass': 'master' }
            }
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
	'texttab': {
	    'longname': 'Tab-delimited text',
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
//  updatecallback['initiald'] = function() { ...   ;  updatecallbackgeneral('initiald')}

/* replacements for text on page (updates) */
// maybe figure out how to parameterize, and set that a section has been done already via classes/jquery, to avoid infinite scroll slowness
updates['initiald'] = function (area) {
};
