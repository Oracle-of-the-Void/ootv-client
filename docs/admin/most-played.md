# Most played cards (public decks)

Last updated 2026-10-25.

**Public lists → Most played** (the bar chart button) ranks the cards in the public decks, and a
card's page shows how many public decks play it, as a number next to the globe beside its title. Both
read the public lists index, so there is nothing to edit: a list counts as soon as its owner makes it
public, and stops counting when they make it private.

## What counts

- **Decks only.** Lists of type deck. Collections, haves, wants and other lists don't count.
- **At least one copy.** A deck entry with quantity 0 doesn't count. The card page's count, and the
  decks a "card" filter finds, use the same rule.
- **Per card, not per title.** Each `cardid` is its own row, so two cards with the same title (Border
  Keep 1106 and 1107) are counted apart, as the card page counts them.
- **Two counts.** *Decks*: how many of the decks found have the card, shown with their share of
  those decks. *Copies*: the copies summed over them. **Most decks** (the default) or **Most copies**
  picks which one ranks the list.
- **The usual filters.** Search box, contains card, clan, stronghold, format, pre-constructed and
  tournament results narrow the decks first. The format is the deck's own, else the one inferred from
  its name or its cards (the Formats view's "guessed"). **Any card type** narrows the cards.
- **Archives weigh in.** Old tournament archives (moderator-set tournament results) are a large share
  of the L5R decks, so their eras weigh more in the overall list. The biggest is kempy's L5RRules deck
  archive: 1,066 decks (Imperial through Onyx, most from Emperor, Celestial and Twenty Festivals),
  owner "Kempy Nezumi - L5RRules archive", added 2026-10-25. Pick a format or tournament results for a
  fairer view of one era.

## How it's built

ootv-search `GET /publiclists?group=cards` (ootv-client `docs/API.md`, ootv-search `CLAUDE.md` "Public
lists search"): a nested aggregation over each deck's cards. The card page's count is a plain
`/publiclists` search for decks with the card. Images come from the card data, as in search results.
