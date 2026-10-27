# The Discord bot

The Oracle of the Void bot looks up cards from inside Discord. Type `/` in a server that has
it, and its commands show up in the list. `/oraclehelp` gives a short version of this page in
Discord, only to you; add `public:True` to post it for the whole channel.

| Command | What it does |
|---|---|
| `/card` | One card: its image, or its rules text with `show:text` |
| `/cardtext` | One card's rules text, stats and legality |
| `/rulings` | One card's rulings and errata, and its Rules Q&A answers with `full:True` |
| `/search` | A search, with the same syntax as the site's search box |
| `/rule` | A rule from the rulebooks, with a link that opens the book at it |
| `/oraclebug` | Report a problem with the site or a card |
| `/oraclehelp` | Help on the commands: pick one from the list under the reply (or add `command:`) for more; `public:True` posts it to the channel |

A server can rename its commands (e.g. `/oracle` instead of `/card`) or turn some off.
`/oraclehelp` always shows the names that server uses.

## Which game {#which-game}

Most channels have a game of their own: in #l5r the bot searches Legend of the Five Rings,
in #dune it searches Dune, and so on. Add `game:` to search another game, e.g.
`/card name:Paul Atreides, Son of Duke Leto game:Dune`. In a channel without a game (a
general channel), `game:` is needed every time.

Some channels also narrow every search, e.g. only cards with an Onyx Lives printing, or only
cards legal in one arc. `/oraclehelp` says what the channel you're in does. Adding `game:` with
another game leaves those filters out.

## One card: /card, /cardtext {#card}

Start typing after `name:` and pick the card from the list. Picking from the list gets you
exactly that card; if you type a name and send it, the bot shows the closest match and says
how many others there were.

- `/card name:Kakita Toshimoko` shows the card image.
- `/card name:Doji Hoturi show:text` (or `/cardtext name:Doji Hoturi`) shows the rules text,
  stats and legality, with a small image.
- `/card name:Hida Kisada set:Imperial Edition` shows that printing.

## Rulings: /rulings {#rulings}

`/rulings name:A Test of Courage` shows the card's rulings and errata. Links to rulebooks open
the page on the site. The reply also says how many answers the card has in the
Rules Q&A (the rules team's answers from the mailing lists, AEG's forum and Discord); `full:True` shows them too. If someone just
posted `/rulings` for the same card in the same channel, `full:True` shows only the Q&A, so the
rulings aren't posted twice. Long replies have **Previous** and **Next** buttons.

## Searching: /search {#search}

`/search query:Toshimoko` finds cards with that word. The query takes the same syntax as the
site's All box ([search language](searching.md#syntax)), e.g.
`/search query:type:Personality AND clan:Crane`. With one match the bot
shows the card; with more it lists the first 10, and the title links to all the results on the
site.

The query can be left out when an option narrows the search:
`/search clan:Crab type:Personality legality:Jade Extended`.

## Rules: /rule {#rule}

`/rule term:Cavalry` finds a rule in the [Bookshelf](rules.md) rulebooks and shows the passage,
the book and page, and a small picture of the page. The title opens the book on the site at that
place, marked. **Also on** lists other pages with the term.

- `term`: a keyword or trait (Cavalry, Yu), a rule's heading (Ranged Attacks, Battle
  Resolution) or any words. It autocompletes with the traits and the headings of the book it will
  look in.
- `arc:` looks in that arc's latest complete rules, e.g. `arc:Clan Wars (Imperial)` reads Scorpion
  Clan Coup and `arc:Hidden Emperor (Jade)` The Spirit Wars.
- `book:` looks in one rulebook instead, e.g. `book:Jade Edition`.
- Without either, the bot reads the channel's arc, if the channel is for one arc, and otherwise the
  newest AEG rules, the Twenty Festivals Comprehensive Rules.

When the term isn't there, the reply names the arcs (or books) whose rules define it, e.g.
`/rule term:Yu` lists the arcs that have Yu; add one as `arc:` (or `book:`) to see it.

The Onyx Lives datasheets only hold the rules they change. When the term isn't in one, the bot
looks in the rules it builds on (the Onyx/Shattered Empire datasheet, then the Twenty Festivals
Comprehensive Rules) and says where it found it. Rules from fan-made books are marked **Fan Made**.

## Options {#options}

`/card`, `/cardtext`, `/rulings` and `/search` take the site's search form fields as options.
The ones marked "list" autocomplete: start typing and pick a value.

| Option | Means |
|---|---|
| `set` (list) | Printed in this set. Also picks the printing shown. |
| `rarity` (list) | Printed at this rarity. Also picks the printing shown. |
| `type` (list) | Card type |
| `clan` (list) | Clan |
| `keywords` | Keywords, e.g. Samurai |
| `text` | Words in the card text |
| `legality` (list) | Legal in this arc or format |

Not every game has every option, just as on the site's search form:

| Game | Options |
|---|---|
| Legend of the Five Rings | all seven |
| Legend of the Burning Sands, 7th Sea, Warlord, Initial D | `set`, `rarity`, `type`, `text` |
| Dune | `set`, `rarity`, `type` |
| Pathfinder Pawns | `set`, `type` |
| Legend of the Five Rings: The Card Game | `set`, `type`, `clan`, `text`, `legality` |

In a channel that already narrows searches, an option narrows them further: `legality:Jade
Extended` in a channel for another arc finds cards legal in both.

Every card command also takes:

- `game`: another game than the channel's.
- `private:True`: only you see the reply. Otherwise the whole channel does. When something
  goes wrong or nothing matches, only you see the reply anyway.
- `paper:True` (Legend of the Five Rings only): only cards with a paper printing (FRPG, WotC
  or AEG, not Onyx Lives), shown on that printing. It's the site's "Paper: only" box.

## Reporting a problem: /oraclebug {#oraclebug}

`/oraclebug` opens a short form: a title, what's wrong, and if you like the card's name, the
steps to reproduce a website problem, and your device and browser. Sending it files an issue
on our GitHub, and only you see the reply, with a link to it. The form can't take
screenshots, so add those on GitHub. Each person can send 3 reports every 15 minutes.
