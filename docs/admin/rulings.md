# Rulings

Last updated: 2026-10-27 (Ivory expansion rulesheets: card notes and card-named rules; weekly Discord Rules Q&A sync)

`ruling` is a card-level field, in every game, for official rulings and clarifications about a
card. Each ruling is one entry: the ruling's text, and usually a link to where it comes from.
Answers the rules team gave on the mailing lists are a second field, `rulingref` ("Rules Q&A", below).

## What it looks like

An array of HTML strings, like `notes` or `erratum`. Put the source in an ordinary `<a href>`:

```json
"ruling": [
  "Bowing this card does not end the duel. <a href=\"#rulebook=jade,#page=42\">Jade rulebook p. 42</a>",
  "The Gold Cost reduction applies once per turn. <a href=\"https://web.archive.org/web/2003/http://www.l5r.com/rulings\">AEG rulings, 2003</a>"
]
```

The link text is what visitors see, so name the source (book and page, site and year).

## Where the links open

On the card's details page, **Rulings** sits above **Versions**. Clicking a link in a ruling:

| Link | Opens |
|---|---|
| A rulebook page on the Rules shelf: `#rulebook=<id>,#page=<n>` (copy it from the Rules viewer's address bar, without the `#game=` part), optionally with a place on the page: `,#find=<words>`, `,#line=<n>` or `,#at=<percent>` (`rulebooks.md`; with text selected, the viewer's link button copies a `#find` link). In a book with a section map (the Comprehensive Rules), `#rulebook=<id>,#sec=VII.3.9.E` with no `#page` is better: it finds the section's page from the book, so a rebuild that moves pages doesn't break it; add `,#find=<words>` for a sentence inside a long section | that page's image in a popup on the site, scrolled to the place and marked when the link has one, with **Open in Rules** to go to the book at that page, zoomed to the place. Hovering the link (mouse), or a long-press on it (touch), shows that place in a small popup, as the trait links do |
| An image (`.png`, `.jpg`, `.gif`, `.webp`), e.g. a screenshot of a ruling uploaded to the images bucket | the image in a popup on the site |
| A PDF (`.pdf`) | the PDF in a popup on the site, with **Open in a new tab** |
| Any other page (AEG's old rulings pages, forum posts, Wayback copies) | a small separate browser window, because most sites refuse to load inside another page |

Ctrl/Cmd-click opens any of them in a new tab instead.

## Imported rulings

Most L5R and LBS rulings came from the old FAQs, accumulated rulings, rules archives and errata lists
(1997 to 2007), which are on the Rules shelf as type **Rulings** (`rulebooks.md`). They were
put on the cards in bulk (ootv-tools `rulings/add-rulings.py`; the plan and how it was made are in
ootv-claude `RULINGS-IMPORT.md`):

- Each ruling is the archive's text with its citation (`[DW, l5rinfo, 11/4/96]`), then a link
  named for the document and page, e.g. `Rules Archive, August 18, 2007, p. 141`, that opens the
  page marked at the ruling (`#find=` with its first words).
- Errata, text changes and most recent printings (`Reads, "..."`) start with `Erratum:`. They
  are meant to take over from the card-level `erratum` field in time.
- Onyx Lives errata: each dated note in a card's `erratum` field that links an Onyx Lives
  announcement is also an `Erratum:` ruling, linked to that announcement and named for its date
  (`The Onyx Lives Project, 13 Aug 2024`), newest first. The `erratum` notes themselves stay. New
  Onyx errata: add both until the `erratum` field is retired.
- The newest document comes first. A ruling repeated in later archives (often reworded) is
  only kept from the newest one.
- A ruling goes to every card with the heading's title that was printed by the document's date
  (an "(Experienced)" or "(non-Experienced)" heading picks those versions). When that's still
  more than one card, each also gets a `needsreview` note saying so: check which card the
  rulings are about and remove them from the others.
- The FAQs' questions and answers (1997 to 2004) are rulings too: the question and its answer
  (`Q: ... A: ...`) go to each card the question names. A question about a title several cards
  share gets the same `needsreview` note.
- Comprehensive Rules (Samurai and Celestial, chapter "Specific Card Rulings and Most Recent Printings",
  `rulebooks.md`): each card's MRP (`Erratum: Reads, "..."`) and rulings, linked to the book page. A title several
  cards share went only to the card whose stats or text the entry quotes, so these have no `needsreview` note.
  Celestial's went on 2026-10-26; Samurai's replaced the October 2007 print's the same day, when its remaster of
  the final (2009) wiki took over that shelf id (the old ones' copies on other printings and their notes went too).
- Ivory expansion rulesheets (Thunderous Acclaim, Evil Portents, The Blackest Storm; 2026-10-27): their seven "Notes on
  Specific Cards" are on those cards, linked to the rulesheet's page (`Evil Portents rulesheet, p. 1`). Four more cards that a
  rule on them names (Yogo Mizoguchi of Evil Portents, Sannin, Utaku Zo Sia, Grievous Wound) have that rule as a ruling plus a
  `needsreview` note asking whether the card's text needs updating, for the rules team. The same notes are chapter XV of the
  Ivory and 20F Comprehensive Rules.
- Rulings on general rules topics (Costs, Timing, Tokens...) and questions that name no card stay
  in the books, not on cards.
- LBS: the 1999 LBS FAQ's card rulings went onto the LBS cards the same way (its text is OCR'd, so
  a few words carry scanning slips, like "Ifyou"). LBS has two cards for a few titles (Eyla the
  Protector, Hole in the Sky, The Weight of Dreams): both got the rulings and a `needsreview` note.
- Imperial Herald: the card game's FAQ and errata columns in the Herald (issues 1, 3–14, 16, 17 and Vol. 2 #4,
  1995–2002; the "Oracle of the Void" column and the L5R FAQ) are on the cards the same way, linked to the issue's page on
  the Newsletters shelf (`The Imperial Herald, Issue 9, p. 11`; the page number is the shelf's, not the printed folio). The
  scans' OCR drops the italic card names, so these were typed up from the page images (ootv-import `rulings-herald/`), with
  the version each one is about chosen by hand where a title has several cards. Questions a later FAQ or archive reprinted
  weren't added again. Those issues carry the shelf tag **Rulings**.

## Adding, changing, removing

Edit the card in the card editor (`docs/admin/card-editor.md`): **Add field** → `ruling` if the
card has none, then **+ value** for each ruling. The **x** on a value removes that ruling; the
**x** on the field removes them all (`"ruling": null` in the JSON view).

## Search

Advanced search has a **Rulings** text box that searches the ruling text (link text included).

## Rules Q&A (`rulingref`)

`rulingref` is a second card-level field, in every game, for the rules team's answers to players'
questions, kept apart from `ruling` because there are many of them and they're informal: answers as
they stood on the day, some later reversed or folded into the Rules Archive. Same shape as `ruling`
(HTML strings), each entry the question and the answer, then a link to where it was given:

```json
"rulingref": [
  "<b>Q:</b> There is some talk that ... the second card fills face up.<br><b>A:</b> Well, technically, it doesn't refill face-up. It fills normally, then it's revealed. <a href=\"https://images.oracleofthevoid.com/l5r/rulings-mail/2004-08-31-2045-ml.html#r5-0\">Martin Lund, \"Rules for 26 August 2004\", 31 Aug 2004</a>"
]
```

On the card's details page a **Rules Q&A** row shows a button with the count ("14 answers from the
rules team"). It opens the list in a popup; clicking an answer opens its source there, scrolled to the
answer, with **Back to the list** and **Open in a new tab** (Ctrl/Cmd-click opens it in a new tab
straight away). Newest answers come first.

### L5R: the rules digests (2000–2006)

The L5R entries come from the rules team's digests on the l5r-ccg and l5r-useful mailing lists ("Rules
for <date>", "post for <date>": Jeff Alexander, Zen Faulkes, Martin Lund, Vaughn Derderian). Each digest is
copied, whole, to a page under `https://images.oracleofthevoid.com/l5r/rulings-mail/` (an index of all
1,086 is `index.html` there), with previous/next links between digests. Each answer on a page has its own
anchor (`#r<n>-<n>`), marked when a link opens it, and lists the cards it went onto. The askers'
names (From: lines, "... wrote:") are left out.

Which answers went onto cards: the question names one to three cards (a title written as on the card;
rules words that are also titles, like Overwhelmed or The Imperial Favor, don't count), the answer
isn't a holding answer ("I'll check with Jeff"), and the card doesn't already have the same ruling from
the Rules Archive (same rules person, within a week). The answer goes to each card with that title printed
by the digest's date. When the question marks the version ("XP Yasuki Hachi", "Hachi XP2", "Wayan exp 2",
"non-XP": XP is how players wrote Experienced), only that version gets it. Otherwise, when the question and
answer clearly echo one version's own card text (words the other versions' texts don't have), that version
gets it. The answers still left on several versions were then reviewed by hand (ootv-import
`rulings-email-decisions.tsv`: each stays on every version, goes to one, or comes off), so none carry a
`needsreview` note; one left unsettled by a later rebuild would get a note saying so. Everything else, chatter included, stays only in the digests.
After a change to the scripts the cards are re-synced (ootv-tools `rulings/add-rulings.py --sync`), which replaces
only the entries linking to the digests.

The pages and the card entries are made by ootv-import `SCRIPTS/email-qa.py`, `email-plan.py` and
`email-digests.py` from the threaded mail archive (project `rules-forum-rulings`).

### L5R: the AEG rules forum (2005–2015)

When the mailing-list digests stopped (February 2005), the rules team answered on AEG's L5R CCG Rules
forum (alderac.com/forum, board 59; "L5R Rules Questions" after the July 2007 upgrade). That forum is gone.
Two copies of it are used: what the Wayback Machine saved (318 topics, February 2005 to early 2007, plus a
topic from the read-only old board) and an HTTrack copy saved on 2015-10-13 (7,286 of the board's 9,663
topics, May 2007 to October 2015; the earlier topics were no longer on the board by then). Together:
7,605 topics, 18,130 posts. They're copied to pages under
`https://images.oracleofthevoid.com/l5r/rulings-forum/`, one per topic (`t<topic>.html`, index `index.html`),
the whole thread with previous/next links by date. Each official answer has its own anchor
(`#r<post>-<n>`) and lists the cards it went onto. Players' names are left out; the officials are named.

Official answers are posts by members ranked "Rules Official" on the board (Zen Faulkes, Martin Lund,
Chris Fuchs, MaPhi Messner) and Jeff Alexander's AEG accounts, and, from when each joined the rules team
(the "Rules Junta"): Roger Giner-Sorolla (RogerGS), Alex Jones (AkodoGilador), Brook Cunningham
(MacBeth2001), Doruk Özaydın (atesh), Dan Jacobson (Kaiu Genji), Jon Palmer and Ben Higgins (Daidoji
Ryushi). The 2015 copy shows only the 2015 ranks, so there the names and dates decide. Bayushi Mamoru
and Bayushi Loïc, who helped answer, aren't counted (mostly not making calls). A quoted question followed by the official's
text is a pair; an unquoted answer answers the topic's opening post (or the post just before). The
"March 2005 Ruling Archive" topic holds the daily digests posted there ("Your Rules for <date>"): each is
cut into its items, and each answer is credited to the official who signed it. Replies that only point
elsewhere ("search the forum"), ask the asker something back, or only hold a question ("Under
discussion", "kicked up to the Rules Junta", "see below") don't count. The rest is chosen and
placed as for the digests (the topic title counts as part of the question), plus one more check: an
answer a card already has from the mailing list isn't added again. Hand decisions for titles with
several versions: ootv-import `rulings-forum-decisions.tsv`. Re-syncing replaces only the entries
linking to the forum pages (`--sync .../rulings-forum/ --sync-note "Forum rulings:"`).

Written 2026-10-25: first 1,115 entries on 462 cards (Wayback only), then the 2015 copy's plan of
10,143 entries on 3,188 cards.

Card size: a DynamoDB item stops at 400 KB, and the rulings writes used to log a card's whole old and new
`ruling` / `rulingref` list in its history, so cards synced several times neared the limit (Ring of Air and
Ring of Water first failed the 2007–2015 write). Since 2026-10-25 a rulings history row holds only the
entries removed (old data) and added (new data), marked `partial`, and ootv-tools `rulings/trim-updatelog.py`
rewrote the older rows that way on the 77 cards of 100 KB or more (Feign Death 403 → 191 KB); the whole lists
are in the table exports. A card that would still pass the limit is skipped and listed (`toobig.txt`). 247 cards whose title had several versions when answered got each such
answer on every version plus a "Forum rulings:" needsreview note; they're listed for later in ootv-games
`game-l5r/rulings-review/`. Made by ootv-import `SCRIPTS/forum-topics.py` (`--httrack` for the 2015
copy), `forum-qa.py`, `email-plan.py --base` and `forum-pages.py` from ootv-games
`game-aeg-forum-crawl/` and `game-l5r/kempy-aegrules/` (see `game-aeg-forum-crawl/rulings-work/README.md`).

### L5R: the Discord rules channels (2021–)

Since the forum, rules questions are asked on Discord: Oracle of the Void `#rules` (and the L5R CCG format
channels: Imperial … Obsidian Hand, `#l5r`), Sun and Moon `#rules-questions` and Onyx Lives `#rules-questions`.
Our bot (ootv-discord `scripts/export-channels.js`, read-only, needs the Message Content intent) copies them to
ootv-games `game-l5r/discord-rulings/`, and they're copied to pages under
`https://images.oracleofthevoid.com/l5r/rulings-discord/`, one per channel and month with at least one answered
question (`<server>-<channel>-<yyyy-mm>.html`, index `index.html`), every message included, with previous/next
links. Each question has its own anchor (`#r<message id>-0`) and lists the cards its answers went onto. Players
are shown as "A player"; the officials are named.

Official answers are Oracle of the Void staff's: Brook Cunningham (MacBeth2001), Alex Jones (AkodoGilador),
Jeremy Sumerlin (TetsuroJ) and Jeff Williamson (docangst). The site owner (Kiyoteru) isn't counted. kempy_nezumi and
saaam answer often but aren't officials: their answers go on a card only when it has no rulings and no Rules Q&A
from another source, starting "Unofficial answer:". An answer is a staff member's messages replying to a question (Discord's
reply link, or following it in the channel within a few hours); every official answer to a question is kept, in
order. The rest is chosen and placed as for the digests and the forum (an answer the card already has from
another source isn't added again). Hand decisions for titles with several versions, and for unofficial answers
that weren't rulings: ootv-import `rulings-discord-decisions.tsv`. Re-syncing replaces only the entries linking to
the Discord pages (`--sync .../rulings-discord/ --sync-note "Discord rulings:"`), so a rerun after new
questions is safe. Made by ootv-import `SCRIPTS/discord-qa.py`, `email-plan.py --base` and `discord-pages.py`
(see ootv-games `game-l5r/discord-rulings-work/README.md`).

Written 2026-10-25: 875 answers, 1,148 entries on 816 cards, no needsreview notes.

Kept current since 2026-10-27 by a weekly job (ootv-tools `rulings/discord-sync.sh`, cron on the ai box, Mondays
6:47 CDT): it exports the new messages, replans, uploads the pages and, only when something changed, re-syncs the
cards the usual way (the day's table export, an updatelog row per card, one bulkupdate row, search checked afterwards). An
unofficial answer comes off a card once the card gets a ruling. A new question that lands on several versions of a
card goes to each with a "Discord rulings:" needsreview note until a row in `rulings-discord-decisions.tsv` settles it.
First run 2026-10-27: 9 cards.

Edit `rulingref` in the card editor like `ruling`. Advanced search has a **Rules Q&A** text box for it.

## On Discord

The Discord bot's `/rulings <card>` posts a card's rulings and says how many Rules Q&A answers it
has; `full:true` adds those (`discord-bot.md`, "Rulings").
