dbinfo['pathfinder-pawns'] = {
    'name': "Pathfinder Pawns",
    'nameshort':'pathfinder-pawns',
    'logo': 'pathfinder-pawns.png',
    'imageuri': 'https://images.oracleofthevoid.com/pathfinder-pawns/',
    'description':'Printed on sturdy cardstock, each pawn contains a beautiful full-color image of a character from Pathfinder RPG, and slots into a size-appropriate plastic base, making it easy to use in play alongside traditional metal or plastic miniatures.'
};
/*databasesort['initiald'] = {
    deck: function (a,b) {
	if (a.type.join() > b.type.join()) return 1;
	if (b.type.join() > a.type.join()) return -1;
	
	if (a.title.join() > b.title.join()) return 1;
	if (b.title.join() > a.title.join()) return -1;
	
	return 0;
    }
}; */
// deck headerizer is generalizable as any game that uses multiple "decks" and "types".
/* headerize['initiald'] = {
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
}; */

searchables['pathfinder-pawns'] = {
  "quick": { "type": "quick" },
  "title": { "type": "text" },
  "printing.set": { "type": "select", "sub": "printing.rarity", "reverse":true },
  "sourcetype": { "type": "select", "clickable": true  },
  "type": { "type": "select", "clickable": true  },
  "subtype": { "type": "select", "clickable": true  },
  "alignment": { "type": "select", "clickable": true  },
  "class": { "type": "select", "clickable": true  },
  "race": { "type": "select", "clickable": true  },
  "size": { "type": "select", "clickable": true  },
  "sources": { "type": "select", "clickable": true  },
  "notes": { "type": "text", "advanced": true },
  "printing.number": { "type": "numeric", "advanced": true },
  "printing.artist": { "type": "select", "clickable":true, "reverse": true}
};

// Disable Device
// Perception
// nethys

labels['pathfinder-pawns'] = {
  "tagquick": "All",
  "shortquick": "All",
  "tagtitle": "Card Title",
  "shorttitle": "Title",
  "tagset": "Set",
  "shortset": "Set",
  "tagrarity": "Rarity",
  "shortrarity": "Rarity",
  "tagtype": "Type",
  "shorttype": "Type",
  "tagsubtype": "Subtype",
  "shortsubtype": "Sub",
  "tagsourcetype": "Category",
  "shortsourcetype": "Cat",
"tagalignment":"Alignment",
"shortalignment":"Align",
"tagclass":"Class",
"shortclass":"Class",
"tagrace":"Race",
"shortrace":"Race",
"tagsize":"Size",
"shortsize":"Size",
"tagsources":"Source",
"shortsources":"Source",
"tagnotes":"Notes",
"shortnotes":"Notes",
"tagnumber":"Number",
"shortnumber":"Number",
"tagperception":"Perception",
"shortperception":"Perception",
"tagdisable_device":"Disable Device",
"shortdisable_device":"Disable Device",
"tagnethys":"Reference Link",
"shortnethys":"Ref",
"tagartist": "Artist",
"shortartist": "Artist"
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
templates['pathfinder-pawns'] = {
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

blurb['pathfinder-pawns'] = 
`This database uses trademarks and/or copyrights owned by Paizo Inc., used under Paizo's Community Use Policy (paizo.com/licenses/communityuse). 
We are expressly prohibited from charging you to use or access this content. 
This database is not published, endorsed, or specifically approved by Paizo. 
For more information about Paizo Inc. and Paizo products, visit paizo.com.
<br /><br />
The intended purpose of this database is to be able to quickly identify and locate pawns for use in a campaign, or identify which pawn boxes to purchase.
`;

$(document).ready(function(){
});

/* callbacks after lookups happen - parameterized initial version, leaving hooks in case they are needed for special things */
//  updatecallback['initiald'] = function() { ...   ;  updatecallbackgeneral('initiald')}

/* replacements for text on page (updates) */
// maybe figure out how to parameterize, and set that a section has been done already via classes/jquery, to avoid infinite scroll slowness
updates['pathfinder-pawns'] = function (area) {
};
