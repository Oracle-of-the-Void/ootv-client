# Discord bot settings

Last updated: 2026-10-25 (/rule)

The Oracle Discord bot (`/card`, `/cardtext`, `/rulings`, `/search`, `/rule`, `/oraclebug` and `/oraclehelp` by default) answers in each server it has been
invited to. The **Discord bot** link on this Admin tab edits its settings: which game a
channel searches, filters that narrow every search in a channel, and which commands a
server gets under which names. The bot picks up a change within 5 minutes, with no deploy.

## Rows

Each server has a table. Every row is one of these:

- **Server default** (the first row): applies to every channel of that server that has no row
  of its own. Its **Commands** column also sets the server's commands. Its **private replies
  there** checkbox makes replies in those channels visible only to the person who ran the
  command, unless they add `private:False`; channels with a row of their own follow their own
  checkbox instead.
- **A channel**: identified by its Discord channel ID. In Discord, turn on Developer Mode
  (User Settings → Advanced), then right-click the channel → Copy Channel ID. Server IDs are
  copied the same way from the server icon. Its **private replies** checkbox does the same for
  that channel; unticked, the channel is public even when the server default is private.

**Name** is only a label for this page. The site can't look names up in Discord.

## Game

- **A game**: commands search that game unless the user adds `game:`.
- **(game: required)**: no default. Users have to add `game:` every time, which suits a
  general channel. A server with no rows at all works this way.

## Filters

A filter adds a field value to every search in the row's game. For example, `printing.publisher
= Onyx Lives` makes a channel see only cards with an Onyx Lives printing. The card is then
shown on that printing (the last one carrying the value), just as the site shows a card
found by a Publisher search. Several lines for one field match any of their values. Filters
on different fields must all match. **Test** counts the cards the row's game and filters leave.

Tick **required** on a line when the card must match it on top of everything else, as the
site's "Paper: only" checkbox does. For example, #ivory has two Legality lines, the Ivory
Edition and Twenty Festivals arcs (either one), plus `legality = Paper` marked required. Lines
for the same field without the tick match any of them; required lines must all match.

When a user adds `game:` with another game, the channel's filters don't apply.

Values come from the field's own list (start typing to see it). Derived values such as Paper
or Legacy work too, and the bot shows the printing the site would.

## Command options

Besides the card name or query, `/card`, `/cardtext`, `/rulings` and `/search` take the site's search form fields:
`set`, `rarity`, `type`, `clan`, `keywords`, `text` and `legality`. The list fields
autocomplete from the game's values. Each game offers the ones its search form has; L5R has all
seven. They narrow the channel's own filters. On a field the channel already filters, both must
match: `legality:Jade` in #imperial finds cards legal in both arcs. `/search` can leave out the
query when an option is given, e.g. `/search clan:Crab type:Stronghold`.

## The paper option

`/card`, `/cardtext`, `/rulings` and `/search` (or a server's own names for them) take `paper:true` for L5R: only cards
with a paper printing (FRPG, WotC or AEG), shown on that printing. It adds the same
requirement as a required `legality = Paper` line, on top of the channel's filters.

## Card text (/cardtext)

`/cardtext` is `/card show:text` without the option, for people who'd rather not use options: the
card's rules text, stats and legality, with a small image.

## Rulings (/rulings)

`/rulings` shows the card's rulings and errata (the `ruling` field, `rulings.md`). Rulebook links
open the page in the site's Rules viewer. The footer says how many Rules Q&A answers (`rulingref`)
the card has; `full:true` adds them after the rulings. When `/rulings` for the same card was just
posted in the same channel (within 10 minutes), `full:true` shows only the Q&A, so the rulings
aren't posted twice. The bot remembers this only while it stays warm, so now and then the rulings
come again. A long answer is paged: **Previous** and **Next** buttons under it turn the page in
place, and anyone in the channel can press them. A card with neither gets an only-you "No rulings"
reply.

## Rulebook lookup (/rule)

`/rule term:<words> [arc:] [book:]` reads the game's Bookshelf, as published for the site (the
shelf item, the `traits` item behind the trait links, and each book's `book.json` and `text.json`;
[Bookshelf](rulebooks.md)), so a new or rebuilt book reaches it with no bot change. Which book:

- `book:` picks one;
- `arc:`, or the channel's arc (a channel whose filter is a `legality` that is an arc), picks the
  arc's book tagged **Last complete rules in arc**. Ivory Edition has none and takes its block's,
  the Twenty Festivals Comprehensive Rules (the user, 2026-10-25); Onyx Edition, with no books,
  takes the first of its `editions` books in the traits item;
- otherwise the newest book tagged Last complete rules (in arc) that isn't **Fan Made**: the 20F
  Comprehensive Rules for L5R, the Rules Reference for the LCG.

A term not in that book is looked for in the arc's other `editions` books (the Onyx Lives
datasheets hold only what they change), and the reply says so. In a book the bot takes the
trait links' entry first, then a contents entry, then the text, a heading for the term first.
Running heads and page numbers (lines on a third of the pages) are left out of passages. Tagging
a book Last complete rules in arc on the shelf changes which book `arc:` reads.

## Bug reports (/oraclebug)

`/oraclebug` opens a form straight away (title, what's wrong, and optionally a card name, steps
to reproduce and device) based on the site's GitHub issue templates, and files an issue on
ootv-client. With a card name in a channel that has a game, it gets that game's database label
(e.g. `l5r database`) and a link to the card; without a card name it gets `bug`. All get
`discord`, and the issue names the reporter's Discord account and channel.
Each user can file 3 reports per 15 minutes. To stop a server filing issues, untick
`oraclebug` in its Commands column and re-register its commands.

## Help (/oraclehelp)

`/oraclehelp` answers only the person who asked, unless they add `public:True` to post it to the
channel (e.g. to show a newcomer). Without options it lists the server's commands
under the server's own names, and says what game the channel searches and which filters apply.
`command:` (a pick list of the server's commands) explains one command: usage, examples and every
option. Every help reply also ends with a **More on a command…** pick list, so `/oraclehelp`
plus Enter is one click away from any command's help. The options come from the bot's own
command definitions, so they're always current. The
players' help page, `docs/help/discord-bot.md`, says the same at more length.

## Commands

Each command can be switched off for a server or registered under another name, e.g.
`/oracle` instead of `/card`. Discord names are 1–32 lowercase letters, digits, `-` or `_`.
With every box ticked and the names unchanged, the server gets the defaults.

Discord only learns about a server's commands when someone runs
`node scripts/register-commands.js <server ID>` in ootv-discord. Run it after adding a server
or changing its commands. A new server also needs the bot invited first; the invite link is
in the ootv-discord README, under "First-time setup", step 6.

## Where it lives

- DynamoDB `oracle-all-discord`: key `guild` + `channel`, where `*` is the server row. The
  table belongs to the `ootv-discord` CloudFormation stack.
- This page reads and writes it through `GET`/`POST /discord` (ootv-search
  `routes/discord.js`, site admins only).
- The bot reads it in `src/config.js` (ootv-discord). Its README, "Settings", has the field
  reference.
