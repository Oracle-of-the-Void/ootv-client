# Searching

Search is on the left (on a phone, under **Edit search**). Fill in any boxes and press
**Search** or Enter. Every box you fill in has to match, so each one narrows the results.

## The search form {#form}

The boxes are different for each game: they're that game's card fields.

- **Advanced** shows more boxes (numbers, flavor, artist and so on); **Basic** hides them again.
- **Reset** clears the form, back to your default search if you saved one.
- **Save Search** keeps the form under a name. Saved searches are listed under the
  **Search** button. **Save as Default** makes the form start that way (and Reset go back to it).
- Clicking a value on a card (a clan, a keyword, a type, an artist) searches for it, keeping the
  rest of your form. An artist opens a small box first, with the search and the artist's links.

### Kinds of box {#boxes}

- **Word boxes** (Title, Text, Flavor...) find cards with every word you type, in any order.
  `kisada hida` finds *Hida Kisada*. They also look at each printing's own printed text.
- **Keywords** looks in the card's keywords. In some games the words have to be together, as a
  phrase; in L5R each word has to be there, and the subtitle counts too.
- **Pull-downs** match the value exactly. Pick more than one and a card can have any of them.
- **Number boxes** come in pairs, lowest and highest. Leave one empty for "at least" or "at most".

## The All box {#all}

The All box searches the whole card at once, and it understands a search language, so you can
ask for things the form can't. Type a word and it's found in any field. Put a field name and
a colon in front to look in one field: `clan:crab`. The field names for this game are on the
[Card fields](fields.md) page.

The All box adds to the form: it has to match too.

## Search language {#syntax}

Terms are joined with AND unless you say otherwise.

| To find | Type |
|---|---|
| words in a field | `clan:crab`, `type:personality` |
| a phrase | `keywords:"dark virtue"` |
| either one | `clan:(crab OR crane)` or `crab OR crane` |
| leave cards out | `title:kisada -keywords:experienced` or `NOT keywords:experienced` |
| grouping | `clan:crab AND (force:10 OR chi:6)` |
| numbers | `force:>15`, `force:>=15`, `force:[5 TO 8]` (5 to 8), `force:{5 TO 8}` (6 and 7) |
| the start of a word | `title:hida*`; `?` stands for one letter: `title:h?da*` |
| close spellings | `title:otaku~` also finds *Utaku* |
| words near each other | `title:"oni no"~2` finds *Oni no ...* and *... no Oni* |
| cards that have a field | `story:*`, `erratum:*` |
| cards without one | `NOT story:*` |

### Things that trip people up {#syntax-traps}

- **OR, AND and NOT must be in capitals.** A lowercase `or` is searched for as a word.
- **A colon means a field name.** To search for text with a colon in it, put a backslash before
  it: `Reaction\: battle`. The other characters that need one are `+ - && || ! ( ) { } [ ] ^ " ~ * ? \ /`.
- **Upper and lower case don't matter**: `clan:crab` and `clan:Crab` are the same.

## Printing fields {#printing}

Each card has one or more printings (the versions in different sets), and each printing has
its own set, rarity, artist, flavor text and so on. The All box only sees the card, not
its printings, so `artist:...` or `set:...` there finds nothing. Use the form's boxes for
those: Set, Rarity and Artist (under Advanced) search the printings, and the result shows the
printing that matched.

## Results {#results}

- More results load as you scroll down. The count is in the menu bar.
- The buttons on the right of the menu bar change how results look (detailed list, card images,
  simple list), their size, and their order (**Sort**).
- Click a card to open it. On the card, the arrows (or arrow keys, or a sideways swipe on a
  phone) go to the next or previous result.
- Searches are kept in the address bar, so you can bookmark or share them, and Back returns to
  the last one.

## Add all to list {#add-all}

Logged in, **Add all to list** at the top of the results puts every card found in your active
list, up to a little more than the game's largest set. A search on set, rarity, legality,
publisher or artist adds the printing the result shows; any other search adds the cards without
choosing a printing.

## Search by photo {#photo}

**Photo** (next to the Search button) is for logged-in users with access to the game, and for our
[Patreon](https://www.patreon.com/oracleofthevoid) supporters: a free Patreon membership gets 1
photo search a day, paid tiers more (each search runs image models on servers we pay for, so heavy
use has a real cost). Without access, the button says how to get it. Supporters are
recognized by the email on their Patreon account matching one of the emails on their Oracle
account, or by **Link with Patreon** in [Settings](settings.md#account). It asks what you want from the picture:

- **Find the card** finds a card from a picture of it, or of its art. The photo is only used for
  the search and isn't kept. After a search you can drag the corners of the card outline and search
  again if it picked the wrong part of the picture.
- **Find the artist** suggests who may have painted it. Say whether the picture is a whole card or
  the art alone, then pick the picture. A few seconds later you get any signature found in the art
  (zoomed in, with known signatures of the likely artists beside it to compare),
  cards that use the same painting (with their credited artist), and the artists whose paintings are
  nearest in style, with each one's share of the vote. These are leads, not answers: a share of 50%
  or more was right about nine times in ten when tested on credited L5R art, and the signature
  reader often misreads small signatures. The picture is kept for 90 days so the site's maintainers
  can look at it.

The two share one daily and per-minute allowance (for supporters it grows with the tier: Free 1 a
day, Ashigaru 5, Samurai 25, Maker 500); if you use it up, the message says when it resets.
