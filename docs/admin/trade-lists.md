# Trade lists and messages

Last updated: 2026-10-26

Players open have and want lists to trade, the site matches them, and they talk it over in
messages. Plan and decisions: ootv-claude `TRADE-LISTS.md`. Player help: Help → Trading and messages.

## Who shows up in trades

A list counts when all of these hold:

- its type is **Have** or **Want** (collections don't count: the user's call, 2026-10-24);
- its owner set it to **Open to trade** (`trade: true` on the list; that also makes it public);
- the owner has a **display name** and **accepts messages**;
- the owner hasn't **gone quiet** (below).

These are the `trade` and `tradeable` fields in the public lists search index, rebuilt on every list save
and nightly.

## Matching

By card: a want matches any printing unless both sides name different printings. Foil (the list entry's
foil toggle: none, `foil`, or `either` on a want) must agree unless either side says `either`. An entry for a
printing only printed in foil is indexed as `foil` whatever the entry holds (`entryFoil()` in
ootv-search `lib/publiclists.js`). Your matches put players who match
both ways first, then by how many cards match.

## Going quiet

The user's numbers (2026-10-24): **30 days** without signing in (or editing a trade list) sends a warning
email; **60 days** hides that player's trade lists from everyone's matches and sends a second email. The
lists stay public and unchanged. Signing in shows them again. It runs on prod's nightly public lists
rebuild (`lib/tradequiet.js`); the state is `tradenotice` on the user (`warned`, `hidden` dates) and
`lastseen` (the last day they used the site signed in).

## Messages

- One conversation per pair of players. Tables `oracle-all-messages` and `oracle-all-threads`.
- Limits: a verified email and a display name to send; 20 new conversations and 200 messages a day.
- A player can switch messages off (Settings), mute or block someone.
- Emails name the sender and link to the site, never the text, once per conversation until read.

## Reports

**Report** on a conversation emails the admins (an `[OotV] Message report` alert) with the conversation id,
both uids, the reason and a link. Signed in as a site admin (groups `*` holding `*`), that link opens the
conversation read only. Nothing else lets an admin read messages.
