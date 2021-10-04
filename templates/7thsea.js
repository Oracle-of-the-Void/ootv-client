dbinfo['7thsea'] = {
    'name': "7th Sea CCG",
    'nameshort':'7thsea',
    'logo': '7thsea.png',
    'imageuri': 'https://images.oracleofthevoid.com/7thsea/',
    'description':'A collectible card game about pirates. Each player starts with a ship and captain. Players strengthen their ships by hiring crew and collecting items. Conflict is usually done through cannon attacks or boarding/sword fights. Generally, players win by having the last standing captain.'
};
databasesort['7thsea'] = {
    deck: function (a,b) {
	if (a.type.join() > b.type.join()) return 1;
	if (b.type.join() > a.type.join()) return -1;
	
	if (a.title.join() > b.title.join()) return 1;
	if (b.title.join() > a.title.join()) return -1;
	
	return 0;
    }
};
// deck headerizer is generalizable as any game that uses multiple "decks" and "types".
headerize['7thsea'] = {
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

searchables['7thsea'] = {
  "quick": { "type": "quick" },
  "title": { "type": "text" },
  "printing.set": { "type": "select", "sub": "printing.rarity" },
  "printing.rarity": { "type": "select" },
  "type": { "type": "select" },
  "trait": { "type": "keyword" },
  "text": { "type": "text" },
  "tocomplete": { "type": "text" },
  "faction": { "type": "keyword" },
  "affiliation": { "type": "keyword" },
  "cannon": { "type": "numeric", "advanced": true },
  "sailing": { "type": "numeric", "advanced": true },
  "adventuring": { "type": "numeric", "advanced": true },
  "influence": { "type": "numeric", "advanced": true },
  "swashbuckling": { "type": "numeric", "advanced": true },
  "cost": { "type": "numeric", "advanced": true },
  "costtype": { "type": "select", "advanced": true },
  "cancel": { "type": "numeric", "advanced": true },
  "canceltype": { "type": "select", "advanced": true },
  "movecost": { "type": "numeric", "advanced": true },
  "startingwealth": { "type": "numeric", "advanced": true },
  "attack": { "type": "keyword", "advanced": true },
  "parry": { "type": "keyword", "advanced": true },
  "printing.flavor": { "type": "text", "advanced": true },
  "printing.artist": { "type": "text", "advanced": true },
  "notes": { "type": "text", "advanced": true },
  "printing.number": { "type": "numeric", "advanced": true },
  "errata": { "type": "exists", "advanced": true }
};

labels['7thsea'] = {
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
  "tagtrait": "Traits",
  "shorttrait": "Traits",
  "tagtext": "Card Text",
  "shorttext": "Text",
  "tagtocomplete": "To Complete",
  "shorttocomplete": "Complete",
  "tagfaction": "Faction",
  "shortfaction": "Faction",
  "tagaffiliation": "Affiliation",
  "shortaffiliation": "Affiliation",
  "tagcannon": "Cannon",
  "shortcannon": "Can",
  "tagsailing": "Sailing",
  "shortsailing": "Sail",
  "tagadventuring": "Adventuring",
  "shortadventuring": "Adv",
  "taginfluence": "Influence",
  "shortinfluence": "Inf",
  "tagswashbuckling": "Swashbuckling",
  "shortswashbuckling": "Swash",
  "tagcost": "Cost",
  "shortcost": "Cost",
  "tagcosttype": "Cost Type",
  "shortcosttype": "CostType",
  "tagcancel": "Cancel",
  "shortcancel": "Cancel",
  "tagcanceltype": "Cancel Type",
  "shortcanceltype": "CancType",
  "tagmovecost": "Move Cost",
  "shortmovecost": "Move",
  "tagstartingwealth": "Starting Wealth",
  "shortstartingwealth": "Wealth",
  "tagattack": "Attack",
  "shortattack": "Attack",
  "tagparry": "Parry",
  "shortparry": "Parry",
  "tagflavor": "Flavor Text",
  "shortflavor": "Flavor",
  "tagartist": "Artist",
  "shortartist": "Artist",
  "tagnotes": "Notes",
  "shortnotes": "Notes",
  "tagnumber": "Card Number",
  "shortnumber": "Number",
  "tagerrata": "Errata",
  "shorterrata": "Errata",
  "tagprod": "Produces",
  "shortprod": "Produces"
};

/*
templateload['7thsea'] = {
    'search': { 'searchtemplate': "Details",
		'visualspoiler': "Visual Spoiler",
	      },
    'card': {'cardtemplate': "Details"},
    'list': {'listtemplate': "List" }
};
*/
templates['7thsea'] = {
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
//  updatecallback['7thsea'] = function() { ...   ;  updatecallbackgeneral('7thsea')}

/* replacements for text on page (updates) */
// maybe figure out how to parameterize, and set that a section has been done already via classes/jquery, to avoid infinite scroll slowness
updates['7thsea'] = function (area) {
};
