# Discord bot settings

Last updated: 2026-10-15

The Oracle Discord bot (`/card` and `/search` by default) answers in each server it has been
invited to. The **Discord bot** link on this Admin tab edits its settings: which game a
channel searches, filters that narrow every search in a channel, and which commands a
server gets under which names. The bot picks up a change within 5 minutes, with no deploy.

## Rows

Each server has a table. Every row is one of these:

- **Server default** (the first row): applies to every channel of that server that has no row
  of its own. Its **Commands** column also sets the server's commands.
- **A channel**: identified by its Discord channel ID. In Discord, turn on Developer Mode
  (User Settings → Advanced), then right-click the channel → Copy Channel ID. Server IDs are
  copied the same way from the server icon.

**Name** is only a label for this page. The site can't look names up in Discord.

## Game

- **A game**: commands search that game unless the user adds `game:`.
- **(game: required)**: no default. Users have to add `game:` every time, which suits a
  general channel. A server with no rows at all works this way.

## Filters

A filter adds a field value to every search in the row's game. For example, `printing.publisher
= Onyx Lives` makes a channel see only cards with an Onyx Lives printing. The card is then
shown on that printing (the last one carrying the value), just as the site shows a card
found by a Publisher search. Several values for one field match any of them. Filters on
different fields must all match. **Test** counts the cards the row's game and filters leave.

When a user adds `game:` with another game, the channel's filters don't apply.

Values come from the field's own list (start typing to see it). A derived value such as
Paper or Legacy filters correctly, but the card is shown on its primary printing.

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
