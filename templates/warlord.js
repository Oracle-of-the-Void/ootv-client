dbinfo['warlord'] = {
    'name': "Warlord: Saga of the Storm CCG",
    'nameshort':'warlord',
    'logo': 'warlord.png',
    'imageuri': 'https://images.oracleofthevoid.com/warlord/',
    'description':'A collectible card game: Warlord: Saga of the Storm'
};
databasesort['warlord'] = {
    deck: function (a,b) {
	if (a.type.join() > b.type.join()) return 1;
	if (b.type.join() > a.type.join()) return -1;
	
	if (a.title.join() > b.title.join()) return 1;
	if (b.title.join() > a.title.join()) return -1;
	
	return 0;
    }
};
// deck headerizer is generalizable as any game that uses multiple "decks" and "types".
headerize['warlord'] = {
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

searchables['warlord'] = {
  "quick": { "type": "quick" },
  "title": { "type": "text" },
  "printing.set": { "type": "select", "sub": "printing.rarity" },
  "printing.rarity": { "type": "select" },
  "type": { "type": "select" },
  "traits": { "type": "select" },
  "featsbase": { "type": "select" },
  "alignment": { "type": "select" },
  "class": { "type": "select" },
  "text": { "type": "text" },
  "faction": { "type": "select" },
  "editions": { "type": "select" },
  "attack": { "type": "numeric", "advanced": true },
  "armorClass": { "type": "numeric", "advanced": true },
  "hitPoints": { "type": "numeric", "advanced": true },
  "level": { "type": "numeric" },
  "skill": { "type": "numeric", "advanced": true },
  "printing.flavorTraits": { "type": "select", "advanced": true },
  "printing.flavorText": { "type": "text", "advanced": true },
  "printing.artist": { "type": "text", "advanced": true },
  "errata": { "type": "exists", "advanced": true },
  "challengeLord": { "type": "exists" },
  "printing.setnumber": { "type": "numeric", "advanced": true }
};


labels['warlord'] = {
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
  "tagfeatsbase": "Feats",
  "shortfeatsbase": "Feats",
  "tagalignment": "Alignment",
  "shortalignment": "Alignment",
  "tagclass": "Class",
  "shortclass": "Class",
  "tagtext": "Card Text",
  "shorttext": "Text",
  "tagfaction": "Faction",
  "shortfaction": "Faction",
  "tageditions": "Formats",
  "shorteditions": "Formats",
  "tagattack": "Attack",
  "shortattack": "Att",
  "tagarmorClass": "Armor Class",
  "shortarmorClass": "AC",
  "taghitPoints": "Hit Points",
  "shorthitPoints": "HP",
  "taglevel": "Level",
  "shortlevel": "Level",
  "tagskill": "Skill",
  "shortskill": "Skill",
  "tagflavorTraits": "Flavor Traits",
  "shortflavorTraits": "F Traits",
  "tagflavorText": "Flavor Text",
  "shortflavorText": "Flavor",
  "tagartist": "Artist",
  "shortartist": "Artist",
  "tagerrata": "Errata",
  "shorterrata": "Errata",
  "tagchallengeLord": "Challenge Lords",
  "shortchallengeLord": "Ch Lords",
  "tagsetnumber": "Set Number",
  "shortsetnumber": "Set #"
};


/*
templateload['warlord'] = {
    'search': { 'searchtemplate': "Details",
		'visualspoiler': "Visual Spoiler",
	      },
    'card': {'cardtemplate': "Details"},
    'list': {'listtemplate': "List" }
};
*/
templates['warlord'] = {
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
//  updatecallback['warlord'] = function() { ...   ;  updatecallbackgeneral('warlord')}

/* replacements for text on page (updates) */
// maybe figure out how to parameterize, and set that a section has been done already via classes/jquery, to avoid infinite scroll slowness
updates['warlord'] = function (area) {
};

