dbinfo['dune'] = {
    'name': "Dune CCG",
    'nameshort':'dune',
    'logo': 'dune.png',
    'imageuri': 'https://images.oracleofthevoid.com/dune/',
    'description':'A collectible card game about the Dune movies / books.'
};
databasesort['dune'] = {
    deck: function (a,b) {
        if (a.deck.join() == "Imperial" && b.deck.join() != "Imperial") return -1;
        if (b.deck.join() == "Imperial" && a.deck.join() != "Imperial") return 1;

        if (a.deck.join() == "House" && b.deck.join() != "House") return -1;
        if (b.deck.join() == "House" && a.deck.join() != "House") return 1;

        if (a.type.join() > b.type.join()) return 1;
        if (b.type.join() > a.type.join()) return -1;

        if (a.title.join() > b.title.join()) return 1;
        if (b.title.join() > a.title.join()) return -1;

        return 0;
    }
};
// deck headerizer is generalizable as any game that uses multiple "decks" and "types".
headerize['dune'] = {
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

searchables['dune'] = {
  "quick": { "type": "quick" },
  "title": { "type": "text" },
  "printing.set": { "type": "select", "sub": "printing.rarity" },
  "printing.rarity": { "type": "select" },
  "type": { "type": "select" },
  "subtype": { "type": "select" },
  "decktype": { "type": "select" },
  "allegiance": { "type": "select" },
  "operation": { "type": "text" },
  "deploymentcost": { "type": "numeric", "advanced": true },
  "talentrequirementbase": { "type": "select", "advanced": true },
  "command": { "type": "numeric", "advanced": true },
  "resistance": { "type": "numeric", "advanced": true },
  "dueling": { "type": "numeric", "advanced": true },
  "battle": { "type": "numeric", "advanced": true },
  "intrigue": { "type": "numeric", "advanced": true },
  "arbitration": { "type": "numeric", "advanced": true },
  "weirding": { "type": "numeric", "advanced": true },
  "prescience": { "type": "numeric", "advanced": true },
  "printing.flavor": { "type": "text", "advanced": true },
  "printing.artist": { "type": "text", "advanced": true },
  "errata": { "type": "exists", "advanced": true }
};

labels['dune'] = {
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
  "tagsubtype": "Subtype",
  "shortsubtype": "Subtype",
  "tagdecktype": "Deck",
  "shortdecktype": "Deck",
  "tagallegiance": "Allegiance",
  "shortallegiance": "Allegiance",
  "tagoperation": "Operation",
  "shortoperation": "Operation",
  "tagdeploymentcost": "Deployment Cost",
  "shortdeploymentcost": "Cost",
  "tagtalentrequirementbase": "Talent Requirement",
  "shorttalentrequirementbase": "Require",
  "tagcommand": "Command",
  "shortcommand": "Command",
  "tagresistance": "Resistance",
  "shortresistance": "Resistance",
  "tagdueling": "Dueling",
  "shortdueling": "Dueling",
  "tagbattle": "Battle",
  "shortbattle": "Battle",
  "tagintrigue": "Intrigue",
  "shortintrigue": "Intrigue",
  "tagarbitration": "Arbitration",
  "shortarbitration": "Arbitration",
  "tagweirding": "Weirding",
  "shortweirding": "Weirding",
  "tagprescience": "Prescience",
  "shortprescience": "Prescience",
  "tagflavor": "Flavor Text",
  "shortflavor": "Flavor",
  "tagartist": "Artist",
  "shortartist": "Artist",
  "tagerrata": "Errata",
  "shorterrata": "Errata"
};


/*
templateload['dune'] = {
    'search': { 'searchtemplate': "Details",
		'visualspoiler': "Visual Spoiler",
	      },
    'card': {'cardtemplate': "Details"},
    'list': {'listtemplate': "List" }
};
*/
templates['dune'] = {
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
	'card':  { 
	    'longname': 'Card Details',
	    'shortname': 'Card',
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
//  updatecallback['dune'] = function() { ...   ;  updatecallbackgeneral('initiald')}

/* replacements for text on page (updates) */
// maybe figure out how to parameterize, and set that a section has been done already via classes/jquery, to avoid infinite scroll slowness
updates['dune'] = function (area) {
};

