# Most played cards (public decks)

Last updated 2026-11-16.

**Public lists → Most played** (the bar chart button) ranks the cards in the public decks, and a
card's page shows how many public decks play it, as a number next to the globe beside its title. The
Detail search results show the same globe and number beside each card in a deck, and the search **Sort**
menu's **Public decks** orders any search by that number (most first, up to 10 minutes behind). With exactly one Legality
searched, both count only decks of that format (the deck's own, else inferred; Hidden Emperor (Jade) means Jade decks, by the deck legality check's format list; Paper and Unreleased aren't formats there, so all decks), and the globe opens those decks;
with none or several, all decks. The card page always counts all decks. All of them
read the public lists index, so there is nothing to edit: a list counts as soon as its owner makes it
public, and stops counting when they make it private.

## What counts

- **All decks, or public.** **All decks** (the first pull-down, Formats and Most played only, for everyone; the
  default there since 2026-11-16, Public lists is `mine=public` in the URL) counts private decks too: `scope=all` reads the index's all-lists alias, drops the name search
  and owner filter, and only answers counts, never lists or people (the user, 2026-11-15).
- **Legal decks only** (a check box, on by default; `legal=1`). Leaves out a deck whose construction check fails
  (`buildbad`, its saved summary, the listing's red Illegal) or whose format is one the cards are checked in while not
  all its cards are legal there. A list nobody has opened since its rules changed may have an old summary; ootv-tools
  `lists/list-summary.py` refreshes them. The card page's globe and the search results' counts don't use it.
- **Decks only.** Lists of type deck. Collections, haves, wants and other lists don't count.
- **At least one copy.** A deck entry with quantity 0 doesn't count. The card page's count, and the
  decks a "card" filter finds, use the same rule.
- **Per card, not per title.** Each `cardid` is its own row, so two cards with the same title (Border
  Keep 1106 and 1107) are counted apart, as the card page counts them.
- **Two counts.** *Decks*: how many of the decks found have the card, shown with their share of
  those decks. *Copies*: the copies summed over them, shown as the average in those decks
  (`avg: 2.4 copies` = copies ÷ decks; the hover shows the total).
- **Sorts.** **Most decks** (the default) ranks every card. **Most copies**, **Name** and **Card type**
  (type, then name) sort only the 100 cards in the most decks; the number before each card stays its
  place by decks.
- **CSV.** The **CSV** button downloads the statistics on screen: every card found (the 100 for the
  other sorts), in the order shown, with rank by decks, card ID, title, type, decks, deck %, copies and
  average copies.
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
`/publiclists` search for decks with the card. The Detail search results get every card's count at
once from `group=cardcounts`, one call per game and single Legality per visit (2026-10-29, search #155, client #480; Legality 2026-11-02). The Public decks sort is a `/search` script sort on the same counts (2026-11-02, search #169, client #561). Images come from the card data, as in search results.
