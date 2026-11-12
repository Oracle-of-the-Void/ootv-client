# Play table

Last updated: 2026-11-11 (l5r/play version 94: steps under scenes, below). Before that: 2026-11-11 (l5r/play version 93: scenes, below). Before that: 2026-11-11 (l5r/play version 92: Province checks by area kind, below). Before that: 2026-11-11 (l5r/play version 91: the battle rule from config, below). Before that: 2026-11-11 (l5r/play version 90: Province Strength as an area property, below). Before that: 2026-11-11 (l5r/play version 89: held rules in the general words, below). Before that: 2026-11-11 (l5r/play version 88: printed negate and prevents with instead, below). Before that: 2026-11-10 (l5r/play version 87: held rules' negate and prevents, below). Before that: 2026-11-11 (l5r/play version 85: negate vs prevents, below). Before that: 2026-11-11 (l5r/play version 83: the generalization review). Before that: 2026-11-09 (l5r/play version 57: Shadowlands groups J and G, the gates `declared` and `assigned`, the after `heldagainst`, the moment `attackover`, the modifiers `noassign`, `notbeside`, `attackbow`. Version 55: Shadowlands group A, the after `undefended`, the modifier `honorreq`, the moment `destroyed`. Version 54: the modifier `phasedraw`, Ring of the Void's End Phase draw. Version 53: the afters `attackend`, `enddraw`, `restored`, `seppuku` as config predicates; `honorreq.lost` with its words; the deck finder's `finder` facets. Version 52: the card states' words `is`, for "stays bowed" in the log. Version 51: the Terrain modifiers `lockout`, `calloff`, `atonce`. Version 50: the Imperial Favor's `uses` are action specs like a card's, `targets`, `effects` and `ask` (Draw `{"draw": 1}`; Restore a target `"state": "dishonored"` and `{"set": {"dishonored": false}}`; Send home `{"home": "bowed"}`; Prevent asks how much, gate `"after": "honorloss"`, `{"add": {"honor": {"of": "x", "max": {"of": "lost"}}}}`), done by the same engine as card effects, in place of the keys `draw`, `clear`, `sendhome` and `counter`; version 49: `modifiers`, the names a card's `play.modifiers` may use, each with its words; version 48: `madebattle`, the battlefield an Ambush is fought on, from config; version 46: every rule so far is Imperial's (`base`), other editions are patches in `arcrules`; game nouns, targeting words, piles, gates and afters as predicates, lasting-rule hooks (`lastinghooks`), battle watches (`watches`) and per-turn counts (`turncounts`) in config; one-card play keys replaced by compositions (Solar Eclipse, Kolat Infiltrator, the Honor refunds, Refuse Advantage, Mercy). Version 31: the engine adds up battle, duel and lobbying totals; card types, roles, piles, Honor, spell-work, Unique, Fortifications and stats as config keys; Events shown as they turn up (`faceup.show`). Version 25: Samurai seppuku; trait actions; the Declaration skipped with two players; Honor Requirements; structured card effects; Ranged Attacks and Fear; End without resolving; Reactions; Honor actions; into play, tokens, take control; Destroy; Force, Chi, Province Strength; draw, discard, look, search; move, remove from battle, send home, assign; copy, rule changes; Water Dragon's Events Phase wait; bow, straighten, dishonor; Gold and costs; Cavalry; Terrain swaps; Events that resolve themselves; Events that change the rules, stay, or duel; bonuses while in play; on entering play; Gold and costs from card text, l5r/fields version 33)

The play table (`/play/`, repo `ootv-play`; on preview only so far) plays a game from its table config: the
zones, the layout rows, setup, card states, counters, the turn's phases and the attack, and the rules that
change by arc. The live site reads it from the settings (`oracle-all-structure`), item **`<game>/play`**; L5R's
is `l5r/play`, created 2026-11-03 at version 1, now version 48. There's no Admin editor for it yet.

## Where it comes from

- `ootv-play` `games/<game>.json` is the working copy. Preview and local copies of the table play by that file,
  so rules can be tried there without touching the settings; `?config=structure` on the table's address makes
  preview play by the item instead.
- Before a release, the item is brought up to date from the file, one key at a time on the live version (ootv-tools
  `structure/set.py`). `ootv-play` `test/structure-diff.mjs` lists the keys that differ.
- `l5r/play` is kept in step with `games/l5r.json` as the table's work is merged (the user, 2026-11-03), one changed
  path at a time. Version 2 (2026-11-03) added `tokens`, `table.arrange` and the provinces' `attach`, and moved
  `placement` to card widths. Version 3 (2026-11-03): Gold only from Ivory on (`counters` per arc, `clear: phase`). Version 4 (2026-11-03): battles (each arc's `phases[].attack`: Maneuvers segments `assign`, the Resolution step `resolve`, `commit`, `honor`). Version 5 (2026-11-03): Shinsei's Shrine keeps its province empty (the provinces' `norefill`; `title` among the `cardfields`). Version 6 (2026-11-03): the Events Phase turns provinces up one at a time and waits at each Event (the Events phase `reveal`, which also attaches Regions); tokens by name (`cardcounters` +1F, +1C, +1F/+1C, -1F; `customtokens`; `tokenforce` counts a token's F in battle); dishonored cards turn upside down (`cardstates` look `turn`); Arrange: Standard (`table.arrange.standard`). Version 7 (2026-11-03): the provinces' `norefill` title rule is gone; Shinsei's Shrine's own card field `play` says it (`cardfields` gains `play`; see below). Version 8 (2026-11-03): Gold (`gold`: bowing a card with Gold Production adds it; a card bought from a province in the Dynasty Phase pays its cost and the rest is lost; a Personality of the player's clan paid in full adds its Personal Honor, else costs 2 less; a Gold counter before Ivory too; Ivory and Three Dynasties keep a pool with no clan rule), `cardfields` cost, production, conditionalvalues, clan, ph; who goes first (`firstplayer`: the highest starting Honor, a tie at random, SCC p. 58); seats are Player A and Player B. Version 9 (2026-11-03): Province 5 and 6 (`zones[].extra`), out of the game until a player picks Add a province; every province list (`table.rows`, `gold.buy.from`, the Events `reveal`/`faceup` zones, `attack.battlefields`, in each arc) names them. Version 10 (2026-11-04): `stats` (Force, Chi), the stats a card's menu can change by hand for a while (until the end of the turn, the battle, or taken off). Version 11 (2026-11-04): `table.offscreen`, the colours of the small triangles that point at cards out of view (`clan`: by the unit's main card's clan; `type`: Holdings white, Regions and Events tan; `default`). Version 12 (2026-11-04): `victory`, winning and losing: 40 Family Honor as a player's turn begins wins; a player with no provinces left, or at –20 Family Honor, is out (`dishonorat`: at once up to Emperor, at the end of their own turn from Ivory on, in `arcrules` Ivory and Three Dynasties, as each arc's book says); five Rings of different elements in play wins; the last player in wins. Version 13 (2026-11-04): the active area (a zone `active`, area `active`, layout `strip`: cards with something going on that aren't in play, an action being resolved or a lasting Event, left of each play area); `handplay`, playing a hand card: an Item, Follower, Spell or Ancestor attaches to the card it's played on, paid for; anything else goes to the active area, on its target if it has one; `actions`, how the table finds a card's actions in its text (a bold label ending in a colon with a timing word: Battle, Open, Limited, ...) and names the icons in them (`:bow:` Bow, `:g1:` 1 Gold), for the "Play / Use … on …?" questions. Version 14 (2026-11-04): duels, by Scorpion Clan Coup pp. 54–55 (`duel`: who can duel, a Personality; focus cards go face down to the active area, Fate cards only; Chi plus the Focus Values decides it, doubled for Double Chi; `tokenchi`: a token's C counts in a duel). Version 15 (2026-11-04): the rulebook's own actions, by Scorpion Clan Coup pp. 48 and 50–51: `timing`, when each kind of action may be taken (Limited in the player's own Action Phase; Open in any Action Phase or a battle's Battle actions segment; Battle in that segment, with a unit in the battle; Reaction any time); the Imperial Favor's `lobby` (once a turn, a Limited and Political action: bow a Personality with Personal Honor; the highest Family Honor takes an unheld Favor, otherwise speakers and one gift each decide it) and `uses` (given up to draw a Fate card, restore a Dishonored Personality, send a unit home from a battle bowed, or prevent a loss of Family Honor). Version 16 (2026-11-05): card actions: `actions.fromhand` (which hand cards are played for their actions: Strategy, Ring) replaces `actions.words` and `actions.icons`; a card's actions now come from its own `play.actions` (below), else from its text read the same way, and their timing words are `timing`'s. Version 17 (2026-11-05): `terrain` (`keyword`: Terrain), a Terrain from the hand is played at the battle being fought, one there at a time, and its text takes effect once everyone has passed in the Battle Action Segment, before Force is compared (Imperial pp. 31, 38; Scorpion Clan Coup pp. 39, 48); it's discarded when the battle ends. Version 18 (2026-11-05): `phases[].auto`, a phase that goes on by itself once it has done what it does and nothing waits (an Event being resolved, a discard, a duel or lobbying): Straighten in every arc that has it, and the Events Phase from Clan Wars to Age of Enlightenment (provinces turn up one at a time and it stops at each Event, then goes on to Action). Samurai's and Emperor's Events Phase stays manual. A new game waits in its first phase; Back one step doesn't run a phase again. Version 19 (2026-11-05): `cardfields` gains `force` and `chi`, so a card action's target limit on Chi or Force ("Chi of less than five") is checked. Version 20 (2026-11-05): `cardfields` holds every numeric search field (the user: "All of the numeric search Fields should be in card fields"), adding `focus`, `honor`, `strength` and `startinghonor`; Focus Values discarded for a card's action (Kitsu Toju, Togashi Yoshi) counted as 0 before. A numeric field added to a game's search goes in `cardfields` too. Version 21 (2026-11-06): `timing.Dynasty` and `codetiming` (Forgotten Tomb, below). Version 22 (2026-11-06): `honorreq`, Honor Requirements, in the base rules and in `arcrules` Samurai, Emperor, Ivory and Three Dynasties (see Honor Requirements below). Version 23 (2026-11-07): an attack segment's `skip` `{players}` passes it over with that many players in or fewer; the Declaration (in the base rules and every arc) has `{players: 2}`, so with two players Declare attack goes straight to the Infantry Maneuvers (the user: "Skip to infantry maneuvers automatically with only two players"), and Back one step from there calls the attack off. Version 24 (2026-11-08): `traitactions` `{trait: [action]}`, the rulebook's actions of a trait, which every face-up card in play with the trait (printed, or lent by a card such as Fan of Command) gets while it has it: Tactician (Scorpion Clan Coup p. 57), a Battle action that plays a Fate card from the hand for its Focus Value in Force until the end of the turn, once a battle. Version 25 (2026-11-08): `traitactions` Samurai (Scorpion Clan Coup p. 57): every Samurai in play has a Reaction: Seppuku, after an action it took or was targeted by costs your family Honor (gate `"after": "offending"`); the loss is reduced to 1, and the Samurai is re-honored and destroyed, so it is Honorable Dead. Version 26 (2026-11-08): `moments`, the moments a card's trigger (`play.when`) may name and what fires each (see Triggers below); one not listed never fires. Version 77 (2026-11-10): one-off words standardized: nine one-card `afters` dropped (the condition is on the card), `afterwords` added, moments `phasestraighten`, `honorloss`, `attackend` (were `straighten`, `honorlost`, `attackover`). Version 78 (2026-11-10): the Imperial Favor's Prevent use asks how much with no cap of its own (its `max: 99` dropped): the loss reacted to limits it. A card's `ask` has a `max` only when the card prints one ("up to five"); otherwise what the player can pay, or the effect's own cap, limits the number (ootv-play [#291](https://github.com/Oracle-of-the-Void/ootv-play/pull/291)). Version 79 (2026-11-10): one-off words, second batch: `afters.dynastyend`, `timing.Dynasty`, `codetiming` and the modifiers `lockout`, `nofort`, `nogifts`, `nohonorwin` gone (the cards say it with `prevents`, `after: {end}`, `if: {phase}`; see below); the `prevents` text names gift, win and `where: battle` (ootv-play [#290](https://github.com/Oracle-of-the-Void/ootv-play/pull/290)). Version 80 (2026-11-10): the `afters` `holdingbowed` and `holdinghonor` gone: the cards say `after: {bowed: match, by, produces}` (ootv-play [#293](https://github.com/Oracle-of-the-Void/ootv-play/pull/293)). Version 81 (2026-11-10): `afters.lobbying` (a Reaction during a lobbying effort for the Imperial Favor: Winning Kachiko's Favor, ootv-play [#295](https://github.com/Oracle-of-the-Void/ootv-play/pull/295)) and `afterwords.bringing` (a Reaction as you bring a card into play: Change of Loyalty, [#298](https://github.com/Oracle-of-the-Void/ootv-play/pull/298)). Version 82 (2026-11-10): `interrupted: {players: true}`: when an action's target is gone before the action resolves (a Reaction comes before its effects, ootv-play [#302](https://github.com/Oracle-of-the-Void/ootv-play/pull/302)), the player reached through it is still affected (Shame after the Samurai's seppuku); the Imperial reading of SCC pp. 49, 57, other arcs not checked ([#306](https://github.com/Oracle-of-the-Void/ootv-play/pull/306)). Version 84 (2026-11-10): moment `detached` (an attached card no longer on its card: it left play, a made token gone from the game included, or was moved off; Levy Troops' Ashigaru tokens, ootv-play [#311](https://github.com/Oracle-of-the-Void/ootv-play/pull/311)).
- New items are made with ootv-tools `structure/create.py <game>/play <file>`, which refuses if the item exists.

## What's in it

| Key | What |
|---|---|
| `zones` | the piles and areas (L5R's include the active area): who sees them, how they're laid out, which back a discard takes, what a tap does, which pile refills a province, where a destroyed province's cards go, which cards attach to the zone itself (`attach`, L5R's provinces: Regions and Fortifications) |
| `table.rows` | the order of the piles and provinces along a player's row |
| `table.arrange` | Arrange's rows of card types, nearest first (L5R: stronghold, sensei, wind, holdings, regions, celestials; then personalities; then the rest), and the types it stacks (Holding) |
| `placement`, `scenes.main` Setup | where each deck card starts (L5R: the stronghold and pre-game cards in play, in the corner; spots in card widths from the near right-hand corner) and the opening shuffles and deals (the main scene's Setup step, `setup`; top-level `setup` until version 95) |
| `cardfields`, `enter` | the card fields the rules read (L5R: type, keywords, title) and what happens as a card comes into play (L5R: Holdings enter bowed; Fortifications not, up to Lotus) |
| `cardstates`, `counters`, `cardcounters`, `customtokens` | bow and dishonor (upside down), with their words (`is`: "bowed", "dishonored", since version 52; `isnot`: "unbowed", "honorable", since version 117, every sentence about a state takes these words; `unname`: Straighten); Honor, Gold and Hand size; tokens on cards, by name (+1F, ...; any name typed) |
| `stats` | a card's numbers (Force, Chi, Personal Honor): a token's number that adds to one (`token`: +1F), which include what's attached printed as a bonus (`aggregate`: Force, Chi), and which have no Change menu (`change: false`: Personal Honor) |
| `tokens` | a token one player holds or nobody does (L5R: the Imperial Favor), how it's lobbied for (`lobby`) and what it's given up for (`uses`) |
| `timing` | when each kind of action may be taken (L5R: Limited, Open, Battle, Reaction) |
| `requirement` | the Honor Requirement (`honorreq` until version 115): the card field (`honor`) and counter (`honor`) compared; `waivers` per arc, each for a Personality of the player's own clan: `pay` (Clan allegiance: Gold more to ignore it, and in which phases) or `lost` (ignored once others have cost them Honor; `text` the words the log gives); `attach` (which attachments need the Personality's Personal Honor: Follower, Ancestor) |
| `gold` | what produces Gold (`produce`), what a purchase is and what it costs (`buy`), its cost changes (`buy.changes`: a Personality of the player's clan adds its Personal Honor when paid in full, else costs 2 less; not Shadowlands; none from Ivory on), and whether what's left after a payment is lost (`spendall`, before Ivory) |
| `handplay` | playing a card from the hand: which cards attach to the card they're played on (`attach`: L5R Item, Follower, Spell, Ancestor) and where the rest go while they resolve (`to`: the active area); the Gold Cost is paid as a purchase is |
| `actions` | card actions: `fromhand`, the hand cards played for their actions (Strategy, Ring). Each action is in its card's menu while its timing (`timing`) is open; using one picks its targets, pays its costs, makes the Force and Chi changes its text gives ("+2F for attacking until the end of the turn", "a 1F/2C bonus", tokens; a choice of bonuses or a condition is left to the players) and hands the action to the next player unless it was a Reaction |
| `terrain` | which hand cards are Terrains (`keyword`: Terrain): played at the battle being fought, one at a time, shown at that battle; its text takes effect when everyone has passed in the Battle Action Segment; discarded when the battle ends |
| `finder` | the deck finder's filters beyond name, card and format (`facets`: clan and stronghold, each with its pulldown's label), shown on each deck too; the Dynasty and Fate counts come from the deck zones (since version 53) |
| `duel` | challenges and duels: who can duel (L5R: a Personality), where focus cards go face down (the active area) and which (Fate cards), the stat compared (Chi) and the card field added to it (Focus Value), who doubles it (Double Chi); a token's C counted in a duel |
| `types`, `targetwords` | the card types an action's target can name, and the traits it can name instead (Shugenja, Terrain) |
| `roles` | what the rules mean by a card's role: `leader` (L5R: Personality: leads a unit, can't be targeted bowed by its own player, the default to accept a challenge), `follower` (Follower: Fear, Ranged Attacks), `stronghold` (Stronghold: Province Strength; `gives` the player's clan), `dead` (who goes to the Honorable or Dishonorable Dead, by `deaths`: Dishonorable while dishonored); each with its name for messages |
| `piles`, `honor`, `made` | the deck an effect draws from, the hand, and the removed pile (L5R: fate, hand, removed); the counter that is Honor and the state that is dishonored; a made token's default type and back (a Follower, Fate) |
| `spellwork`, `unique`, `fortification` | what counts as spell-work (a Spell; a Shugenja's own ability), the Unique rule (the keyword, by title), and what a Fortification is (the trait) |
| `scenes.main` First player | who goes first (the main scene's step `first`): the highest of a counter (L5R: Honor), a tie at random (top-level `firstplayer` until version 95) |
| `scenes.turn.steps` | the turn's phases (top-level `phases` until version 95): what each phase does as it starts (straighten, turn provinces up, draw), whose action it is, the hand limit, and the attack: `attack.scene` names the scene it opens (`scenes` below holds its steps); the steps (Maneuvers: `assign`, the attacker then the defender; `infantry`, `cavalry` or `any`; Three Dynasties' Cavalry `onlywithunits`; `skip` `{players}`: passed over with that many players or fewer, the Declaration with two), the battle's steps (Resolution: `resolve`), who may be assigned (`commit`: L5R, a unit led by an unbowed Personality; Cavalry when the Personality and all its Followers are) and the Honor a resolution gives (`honor`: 2 a card destroyed to the winner, 1 each on a tie) |
| `scenes.battle` panel, off | how the table shows a battle (since version 116): `panel` `"middle"` puts it big in the middle of the screen at Resolution, with Hide; `off` is ending it with no outcome, its button's words (`name`: End without resolving) and the question asked first (`detail`, `yes`, `no`) |
| `arcrules`, `rulesets` | what changes by arc or format, and the rule sets a player can pick at the start (see below) |

## Hearts (2026-11-10)

`?game=hearts` on the table's address plays standard Hearts, 3 or 4 players on one screen (ootv-play
[#314](https://github.com/Oracle-of-the-Void/ootv-play/pull/314); preview only, from `games/hearts.json`; no
`hearts/play` item and no card table: the 52 cards are in the config). It's there to grow the engine past one deck per
player: the new config keys are general, for any game dealt from one deck and played in tricks.

| Key | What |
|---|---|
| `seats`, `deck` | how many may play (Hearts 3–4); the game's own deck, one card per suit and rank, with cards left out by player count (`remove`: the 2 of Diamonds with three) |
| `zones[].shared` | one zone for the whole table (the deck, the trick) instead of one per player |
| `round` | the game is played in rounds (Hearts' hands): deal, pass, tricks, score, then the next dealer |
| `scenes.turn.steps[].enter` | the round's steps: `gather` and `shuffle` the cards, `dealout` evenly, `choose` (every player passes cards at once, unseen: left, right, across, none by hand; left, right, none with three), `tricks` (follow suit, highest of the led suit wins, the 2 of Clubs leads, no Hearts or Queen of Spades on the first trick, Hearts not led until broken), `score` (taking every point, "shooting the moon", gives 26 to each other player) |
| `victory.atleast` | the game ends when a hand ends with someone at 100, lowest score winning |

## Cribbage (2026-11-10)

`?game=cribbage` plays standard cribbage, 2 or 3 players, or 4 as two partnerships, on one screen (ootv-play
[#318](https://github.com/Oracle-of-the-Void/ootv-play/pull/318); preview only, from `games/cribbage.json`, in the game
chooser; no `cribbage/play` item). Like Hearts it grows the engine with general keys: a running count, scoring from
patterns, a dealer's own pile, partnerships, a pegging board and a game that ends the moment a score is reached.

| Key | What |
|---|---|
| `deck.ranks` | any key beyond `value` becomes a card field: Cribbage's `count` (face cards 10, Ace 1) beside `value` (order, for runs) |
| `scenes.main` First dealer | the first dealer by cut (`first.cut`; `round.first.cut` until 2026-11-11): a card each, low deals, a tie cuts again |
| `teams`, `counters[].team` | partners by player count (four: A and C, B and D), one shared score |
| `counters[].board` | the score drawn as a pegging board: front peg at the score, back peg where it was |
| `scenes.turn.steps[].enter` | `dealout` with `count` per player count and `extra` (three players: one card to the crib); `choose` to the dealer (discards to the crib); `turnup` (the starter; a Jack is 2 for the dealer, his heels); `count` (pegging to 31: fifteen and thirty-one 2, pairs 2/6/12, runs, Go said by the table, last card 1); `show` (each hand from the dealer's left, the dealer, then the crib, with the starter: fifteens, pairs, runs and double runs, flushes, his nobs; one at a time, Next to go on) |
| `victory.instant`, `victory.margins` | the game ends at 121 the moment it's reached, mid-play or mid-show; a loser under 91 is skunked, under 61 double skunked |
| `options`, `claim` | **Count it yourself** (2026-11-10, ootv-play [#326](https://github.com/Oracle-of-the-Void/ootv-play/pull/326)): a checkbox in the table's bar, for everyone, any time. On, nothing is scored for you: after the turned-up card, each card you peg and your hand and crib in the show, press what you scored (Fifteen, A pair, A run, …) once per piece, then Done (the last card's point is always scored for you). In the show pick the cards first: 10, K, 5, 5 and Fifteen twice is two fifteens. What you don't claim is lost and logged. Off mid-claim, the rest is counted for you. **Muggins** (needs Count it yourself): after a player's Done, the other side (not partners) may take what they missed with the same buttons, first come, until the next move; what nobody takes is lost |

## L5R rules by arc

From the last complete rulebook of each arc (`ootv-play` `docs/l5r/turn-sequence`). The start screen asks for the
arc, which filters the deck lists, and the rules, which default to the arc's own; the legacy formats (Legacy,
BigDeck, Modern, Obsidian Hand) default to the latest arc's, Three Dynasties. Any rule set can be picked.

| Rules | Phases | Each battle | Starting hand |
|---|---|---|---|
| Clan Wars to Age of Enlightenment | Straighten, Events, Action, Attack, Dynasty, End | Battle actions, Resolution | 5 |
| Race for the Throne (Samurai) | the same | Combat, Resolution | 5 |
| Destroyer War (Celestial) | the same | Combat, Resolution | 6 |
| Age of Conquest (Emperor) | the same | Engage (attacker first), Combat, Resolution | 6 |
| Ivory, Twenty Festivals, Onyx / Shattered Empire | Action, Attack, Dynasty, End of turn | Engage, Combat, Resolution | 5 |
| Three Dynasties | the same, Infantry and Cavalry Maneuvers back | Engage, Combat, Resolution | 5 |

Everywhere: starting Honor from the stronghold, four provinces, a hand size of 8 (a counter players can change),
the defender acting first in battle unless noted.

Gold: before Ivory there's no pool (excess Gold is "taxed by the Emperor" and lost, Samurai and Emperor rules), so
there's no Gold counter. From Ivory on (Ivory, Twenty Festivals, Onyx, Shattered Empire, Three Dynasties and the
legacy formats) a Gold counter is the pool, emptied for both players as each phase ends.

Honor Requirements (`honorreq`, 2026-11-06; the user: "Honor requirements for bringing personalities into play
aren't implemented"): a Personality whose Honor Requirement is above its player's Family Honor isn't bought or brought
into play by a card; a "–" has none, and one in play stays whatever the Honor does (Scorpion Clan Coup p. 25, Gold
p. 31, Lotus p. 19). Samurai and Celestial: a Personality of the player's clan may be bought for 2 Gold more in the
Dynasty Phase, ignoring it (Samurai CR p. 71, Celestial CR p. 69); Emperor: at any time (CR III.2.3.3). The table asks
"Pay 2 more Gold to ignore it?" before the Gold questions; paid in full (cost + 2) it adds the Personal Honor, with the
clan discount it costs the printed cost and adds none. From Ivory on: once anything but the player's own cards has
cost them Honor, their clan's Honor Requirements are ignored for the rest of the game (Ivory CR III.2.2.3): set when
another player's card action takes their Honor, or by answering yes to "lost Honor to another player's card or the
rules?" when a buy is refused. Clan Wars to Emperor: a Follower or Ancestor won't attach to a Personality whose
Personal Honor is below its Honor Requirement, a dishonored one's counting as 0 at most (Scorpion Clan Coup pp. 25,
52; Gold p. 32; Lotus pp. 22, 29; Samurai CR p. 20; Emperor CR p. 19); from Ivory on only Personalities have one.

Battles (all arcs): units assigned to the defender's provinces stand in a Battlefields pane, one column per province.
Resolution totals each army's printed Force (bowed cards add nothing, a bowed Personality makes its unit nothing, a
side with no units has none) and the province's Strength (the Stronghold's `strength`, plus attachments printing one),
which players adjust for card effects. The loser's army is destroyed, both on a tie with units on both sides; the
province falls when the attacking Force is more than the defence plus its Strength. End without resolving (beside
Resolve, 2026-11-05) ends a battle with no outcome, for a card that ends it or players agreeing: nothing destroyed,
no Honor, but the attackers still bow and go home and its Terrain is discarded (Emperor CR XIII.1.4). Attackers bow and go home after
each battle; defenders at the end of the attack, or when their province falls (Scorpion Clan Coup pp. 37–42, Ivory
CR XII.7–8, Emperor CR XIII). A destroyed province leaves the row.

## Card field `play`

`play` isn't in search documents and isn't searchable (since 2026-11-05): the table and the card editor read it with `/oracle-fetch`, and changes to it aren't written to the card's update log while the play table is in development (the user, 2026-11-05).

Rules a card brings to the table live on the card, not in `l5r/play` (the user, 2026-11-03, the same way `deckconstruction` does for deck checks). `{"attached": {...}}` changes the zone the card is attached to while it's there face up; only `autorefill` can be changed so far. Shinsei's Shrine (card 6992): `{"attached": {"autorefill": false}}`, "This province does not hold Dynasty cards (do not refill it)". `{"force": [{"when": "attacking", "add": 2}]}` adds to a card's Force in a battle while it's in the attacking army (`defending` for the defending one), for a card like Matsu Gohei ("+2F while attacking"). The province doesn't refill by itself; a player can still refill it by hand. Edit it in the card editor like any field. `{"actions": {"Imperial": [...]}}` holds the card's printed actions for a rule set (the user, 2026-11-05), one entry each: `name` (the label, e.g. "Battle", "Political Reaction"), `timing` (the timing words it may be used under: "Battle/Open" is `["Battle", "Open"]`, either may be used), `keywords` (the rest of the label: Repeatable, Elemental, ...), `cost` (`bow`: `true` bows the card, a word such as "Shugenja" bows the card it's attached to; `counter`: `{"id": "gold", "n": 2}` a counter paid, `n` a number, `"X"` (as much as the player spends) or `{"of": "unit"}` (the target unit's Force); the game's Gold counter is paid from Gold produced, any other counter is taken off the player's own; until 2026-11-09 `gold`), `targets` (`count`, `type` such as Personality or Follower, `whose`: `yours` or `theirs`, `bowed`/`unbowed`, `upto`, `text`) and `effect` (the printed words), and `effects`, what the table does (the user, 2026-11-05): a list of `{"add": {"force": 2}, "to": "target", "when": "attacking", "until": "turn"}` (`add`: a card's `force`/`chi`, or a player's `honor`/`gold` with `to` `you` or `opponent`; `to`: `target`, `self`, `you`, `opponent`, `all` with `all` `{type, side}`; `if`/`unless`: a match the card must or mustn't fit, for "3F to a Lion, or 2F to any other"; `when`: the change counts only while attacking or defending, its badge dimmed otherwise; `until`: `turn`, `battle`, `ever`), `{"token": "+2F/+2C Weapon", "to": "target"}`, or `{"set": {"dishonored": true}, "to": "target"}`; and battle effects (2026-11-05, Scorpion Clan Coup pp. 55–57): `{"ranged": 3, "to": "target"}` (a Ranged Attack: at an opposing Personality without Followers, or a Follower, in the battle being fought, destroyed when the strength is at least its Force; `{"stat": "chi", "of": "self"|"host", "plus": 2}` for "equal to her Chi" or "the Shugenja's Chi+2"; cards of one unit can combine theirs), `{"fear": 3, "to": "target"}` (bows the target unit's Followers with Force 3 or less, once a battle per card), `{"destroy": true, "to": "self"}`, and `add {"ranged": 2}` (Blazing Arrows). A bow is always the card's own `cost`, never the Ranged rule (the user, 2026-11-05: Shuriken of Serpents' cost is being destroyed instead). A target's `match` limits what it may be: `{"clan": ["Lion"]}`, `keywords`, `type`, or a current value `{"ph": {"min": 3}}`, `{"chi": {"max": 4}}`. The Ancestral Home of the Lion: target `{"match": {"clan": ["Lion"]}}`, effects `[{"add": {"force": 2}, "to": "target", "when": "attacking", "until": "turn"}]`; The Esteemed House of the Crane: `[{"add": {"honor": 2}, "to": "you"}]`. Without `effects` the table reads them from `effect`; "if", "when ..." and "for each" stay with the players. For Imperial they're read from the Clan Wars printing (Obsidian, Emerald or Imperial), not today's wording. A card without them has its text read the same way. Structured `effects` and `match` written 2026-11-05 on the 28 Imperial cards whose effects the table can do (each read by hand), then Ranged Attacks and Fear on 25 more (Goblin Mob's redirect stays with the players). Written 2026-11-05 for 186 Imperial Edition cards (ootv-tools `field-fixes/play-actions.py`; the printing's text went on 268 printings), with the targets and costs checked twice (a parser and the qwen3-vl model each read every action; disagreements ruled by hand). Search never reads `play`: since `l5r-os4` the index stores it unmapped. A game picks a card's change up when it's opened again or reset (both reload the card data, 2026-11-04); before that, a game kept the data from when its decks were loaded.

### Reactions (2026-11-05)

Nobody is asked whether they have a Reaction: that would hint at what's in their hand (the user, 2026-11-05). A player who wants one presses Reaction in the top bar, triple-clicks with a mouse (not on a deck or pile), or taps with three fingers, then picks the event from a list of what happened, back to their own last action (a Pass counts). The table shows the game as it stood just after that event, and the Reaction is played there; everything after it is taken back, not replayed, and the log says what was. Reactions answering an event form a stack (the user, 2026-11-05: "If reactions set up a chain, they are treated as a stack, that has to be fully resolved to get back to the original trigger to take the second reaction"): a new Reaction answers the top or a link further down, with nothing taken back, and answering one further down closes everything above it (no longer offered). So one player can react twice to the same event (Master of the Tea Ceremony, then Kakita Yinobu, on one loss), the second reading the game as it is then. The order is Scorpion Clan Coup p. 49's: after an action, Reactions in turn from the player on the actor's left until all pass. A cancelling Reaction has the effect `{"cancel": {"keywords": [...], "type": [...], "targeting": "you" | a match, "token": true}}`: it cancels only an action with one of those keywords on its label or card, from a card of that type, aimed at you or one of your cards that fits the match (Resist Magic: `{"type": "Personality"}`), or (with `token`) the use of a token such as the Imperial Favor. The event's effects are undone and its log lines struck through; its costs stay paid and a card played from the hand still goes to its discard pile. `"to": "actor"` is the player whose action the Reaction answers: Investigation `[{"cancel": {"keywords": ["Ninja", "Kolat", "Assassin"], "targeting": "you"}}, {"add": {"honor": -5}, "to": "actor"}]`. `{"prevents": "revealing"}` stops an Event in the Events Phase (Avoid Fate; until 2026-11-09 `{"stopevent": "deck"}`, then `cancel`, then `prevents {revealing: true, to: deck}`): react to the Event turning up; once it has taken effect it is too late. It has no effect and its Province counts as revealed this phase; the steps in its `instead` happen in its place, about that Event, each a general effect any card can use (the user, 2026-11-10: no one-card engine code): `{"insert": {"which": "event", "into": "deck", "at": "bottom"}}` (into its own deck, face down), `{"refill": "province"}` (the Province it was in refills now, face down, not turned up this phase), `{"shuffle": "deck"}`. Avoid Fate runs them in that order (the user, 2026-11-06: "the imperial wording shuffles it into the dynasty immediately after refilling the province"). An event's kind ("after a Personality is destroyed") is checked where a play code says so (`after`, Honor actions below). The `l5r/fields` description of `play` has `cancel` and `actor` since version 19. It has `stopevent` since version 36, `cancel` `revealing` since version 46, Avoid Fate's `prevents` with `instead` since version 76.

### Honor actions (2026-11-05)

The Honor group of card actions (the user: "do the honor cards"). Most answer something that just happened, so a play code can say when it may be used, checked before anything is paid: `{"after": ...}` what the event reacted to did, or the battle just resolved (`battledestroy`: you destroyed an army or a Province as the Attacker or Defender, Brilliant Victory and Famous Poet; `battlewin`: you won and destroyed the other army, Mercy; `provinceheld`: your Province was attacked and stood, Ring of Earth; `honorloss`: you lost Family Honor in it, Master of the Tea Ceremony and Kakita Yinobu; `restored`: this card was restored to Honorable status in it, Toturi; `destroyed` (until 2026-11-09 `death`): a Personality of yours was destroyed in it, Martyr; `seppuku`: the target was dishonored in it, or you lost Honor, Honorable Seppuku; since version 53 `restored`, `seppuku`, `enddraw` (Ring of the Void) and `attackend` (Counterattack) are named in `l5r/play` `afters` like the battle ones: an event predicate (`took`/`lost` a state, `who`: self or target, `phase: yours`, `filled`: a pile empty before; `or`: other afters that also do) or an attack predicate (`role`, `unused`), with `why` per failing key); `{"battle": "outforced" | "outforcing"}` (the other army's Force higher, or lower with units: Legendary Victory, Refuse Advantage); `{"once": "battle" | "ever"}`. What they do: `{"take": "favor"}` (Kakita Yoshi), `{"award": {"double": true} | {"plus": 8}}` (if you win the battle being fought), `{"add": {"force": {"of": "ahead", "times": -1}}, "to": "army"}` (your army's Force lowered to the other's for the battle: Refuse Advantage), `{"add": {"honor": {"of": "lost", "less": 1}}, "to": "you"}` (Honor lost in the event given back: down to 1 with `less`, all without, or at most `"max": {"of": "discard"}`), `{"undo": {"destroyed": "opposing", "award": "back"}}` then `{"add": {"honor": {"of": "undone", "times": 3}}, "to": "you"}` (Mercy: the army comes back as it stood, its award taken back, 3 Honor a card instead; until 2026-11-09 these were `even`, `refund` and `spare`), `{"intoplay": true}` (a Ring comes into play). `"to": "highest"` is the player or players with the highest Family Honor (Breach of Etiquette), `"to": "owner"` the target's player (Shame); an amount can be `{"of": "target", "field": "ph"}` or `{"of": "discard"}`; a target can need `"state": "dishonored"`; a cost can discard hand cards, `{"discard": {"count": 1}}` (picked after the targets). Left to the players: Shame's "only one each time a Personality is dishonored". Ring of Earth's "at any point in the battle" is checked since 2026-11-09 (its `"over": true` names the config watch `over`). The `l5r/fields` description of `play` has these since version 20.

### Into play, tokens, take control (2026-11-06)

The next group of card actions (the user: "Can you do the next group?"). `{"make": {"title", "type", "force", "chi", "ph", "keywords"}}` puts a token card into play, attached to `"to": "self"` or the target, or on its own (Matsu Imura's animal, Summon Swamp Spirits, Summon Undead Champion); the table shows it as a text card with its name, numbers and traits, and it leaves the game when it leaves play. `{"control": {...}}` takes control of the target and what is attached to it, into the player's play area: `"attach": "self"` attaches it to the card (Matsu Imura, The Demon Bride of Fu Leng), `"drop"` destroys the attached cards that fit first (Kolat Master: Followers with required Honor above zero), `"while": "source"` holds it only while the card stays in play (Blackmail). A card under another player's control is tagged with its owner's name and goes to its owner's piles when it leaves play. `{"bring": {"attach": "self" | "host" | n, "face": "down", "reveal": {"timing": "Open"}, "pay": "cost"}}` brings the target into play under the player's control, picked from a hand or discard pile with the target's `"from": "hand" | "discard" | "discards"` (Necromancer, Animate the Dead, Cloak of Night face down, revealed as an Open action, Feign Death, Scribe onto its Shugenja paying the Spell's Gold Cost); clicking a discard pile then offers its cards that fit. `{"gain": {"keywords", "actions"}}` adds traits and actions while the card stays in play (Animate the Dead: Shadowlands and "Battle: Fear 3"; Kolat Master: Kolat). `{"intoplay": {"as": "target"}}` (until 2026-11-09 `{"copy": true}`) brings the card into play as a duplicate of the target with its permanent changes (The Egg of P'an Ku; it shows the copied card's picture, tagged with its own name). `"after": "gone"`: the target left play in the event reacted to. An action's `"ask": {"max", "text"}` asks the player for a number, used by a token's `"count": {"of": "x"}` (Togashi Mitsu's fire tokens, at most 5). Left to the players: Debt of Honor, Mitsu's straightening and bowing, Blackmail's and Cloak of Night's reveals, the Egg's Unique, Scribe's once per spell. Matsu Imura takes a Follower with the trait Creature (the user, 2026-11-06: later sets have some). Written on 14 Imperial cards; the `l5r/fields` description of `play` has these since version 21.

### Destroy (2026-11-06)

The Destroy group (the user: "start on destroy"). Most use `{"destroy": true}` on what is there already: the target (Alhundro Cornejo, Explosives, Kolat Assassin, Remorseful Seppuku on a Dishonored Samurai, Touch of Death on a bowed Personality with `"state": "bowed"`), `"to": "self"` for "destroy this spell" (Fist of Osano-Wo, Touch of Death, Heart of the Inferno), `"to": "all"` with `"if"` for everything that fits in the battle (Flight of Dragons: the trait Dragon, either side, not Dragon Clan; Heart of the Inferno: the opposing army's Personalities and Followers with Force 2 or less). A target's `match` can name keywords (a Retainer, a Holding's trait: Kolat Assassin, Matsu Hiroru) or a `title` (Terrible Standard of Fu Leng: Hida Sukune, once a game, +4F). New: a target's `"army": "opposing"` (in the opposing army at the battle being fought, with this card's unit there: Hida Yakamo) and `"attacked": true` (attached to the Province this card's unit is attacking: Battering Ram Crew, Fire Breather), and `{"destroy": {"attached": {"type": "Follower"}}}`, which destroys the target's attached cards that fit, not the target (Break Morale). Written on 14 Imperial cards; the `l5r/fields` description of `play` has these since version 22.

### Force, Chi, Province Strength (2026-11-06)

The next group of card actions. `"to": "inplay"` gives an effect to every face-up card in play, either side, and `"to": "yours"` to the player's, each narrowed by `"if"` and `"unless"` (Naga Shugenja: +1F to every Naga card; Evil Portents: Shadowlands Personalities and Followers +1F/+1C, every other Personality −1F/−1C); a match's `"clan": "yours"` is the player's clan. `{"set": {"clan": "yours"}}` (until 2026-11-09 `{"align": true}`) aligns the cards with the player's clan, losing their own (Oath of Fealty, with +1F/+1C `"until": "ever"`; tagged with the clan). `{"swap": ["force", "chi"]}` switches two of the target's stats until the end of the turn (Energy Transference; its `"iftarget": "theirs"` destroys the spell only when the target is another player's). `{"scale": {"force": 2, "chi": 2}}` multiplies the target's stats for the rest of the game, once a card (Immortal Steel; tagged "F ×2, C ×2"; until 2026-11-09 `{"double": true}`). `{"flag": "nodestroy"}` (until 2026-11-09 `{"nodestroy": true}`) marks a card for the turn: an army containing it destroys neither the opposing army nor the Province at Resolution (Mists of Illusion; tagged "Can't destroy"). `{"strength": n or {"of": "discard"}, "to": "target" | "provinces"}` changes a Province's Strength, until the end of the turn unless `"until": "ever"`, which stops at zero (Castle of Water and The War Fortress of the Crab +3 on a Province, picked by tapping it or its card; Isawa Tadaka on all the player's Provinces by the Focus Value discarded; Alhundro Cornejo −1 for good); a changed Province shows a "Str +3" badge and the battle totals count it. An action's `"anywhere": true` can be used in a battle the player has no units in. `{"battle": "defending" | "attacking" | "unopposed"}` and `{"once": "turn"}` say when an action may be used (Earth Dragon once a turn while defending). A token's `"hold": true` keeps it only while the card stays bowed in play (Bayushi Kachiko's seduction token; straightening her by hand, or her leaving play, takes them all off). Since 2026-11-08 Tsuburu no Oni and Kachiko's extra token each turn are triggers (below). Gaijin Mercenaries needed nothing new. Written on 14 Imperial cards; the `l5r/fields` description of `play` has these since version 23.

### Cards: draw, discard, look, search (2026-11-06)

`{"draw": n}` draws from the player's Fate deck (Look into the Void, Isawa Kaede). `{"discard": true}` on a Province target discards its card, and the Province refills as usual (Kaede on the player's own, Winds of Change on anyone's). `{"discard": {"random": n}, "to": "opponent"}` discards hand cards at random (Kuni Yori), `{"discard": "hand"}` all of them (Void Dragon). `{"look": "hand" | "provinces", "to": "opponent"}` lets the player see the other player's hand or face-down Province cards (Ninja Spy); the log names them to the looker alone and tells the table a look happened. `{"look": {"count": n | {"of": "x"} | {"of": "discard"}}}` lets the player look at that many face-down cards of anyone's on the table (Oracle of Wind's X Gold, Isawa Uona's Focus Value): another player's face-down card then has "Look (N left)" in its menu. A target's `"facedown": true` is a face-down card on the table that isn't in play; `{"turn": true}` turns it up (Call Upon the Wind). `{"test": {"pile": "draw", "field": "focus", "above": "ph", "then": [{"set": {"dishonored": true}}, {"destroy": true}]}}` makes the target's controller discard the top Fate card: a Focus Value above its Personal Honor runs the `then` effects on it, here dishonoring it, then destroying it (Test of Honor; until 2026-11-09 `{"test": "honor"}`). `{"search": "fate", "draws": 1}` opens a search of the player's Fate deck from which only that many cards may leave, to the hand, and the deck is shuffled when the search ends (Walking the Way). `"after": "provincefell"`: the battle just resolved destroyed a Province with this card in the attacking army (Void Dragon); `"after": "enddraw"`: the End Phase just drew into the player's empty hand (no card uses it since 2026-11-09: Ring of the Void's draw is the modifier `phasedraw`, below). An action's `"inplay": true` can't be used to play the card from the hand. Written on 12 Imperial cards (13 actions); the `l5r/fields` description of `play` has these since version 24.
With more than two players still in (2026-11-09), `"to": "opponent"` means the player picked as the action is played (the table asks "on which player?"), and Declare attack asks which player to attack; with two, it's the other player as before.

### Move, remove from battle, send home, assign (2026-11-06)

`{"home": "bowed" | "unbowed" | true}` sends the target's unit home from its battle: bowed (Block Supply Lines, Retreat, Miya Yoto), unbowed (Kakita Yuri). `{"move": "battle"}` assigns an unassigned unit of the player's to the battle being fought (Oracle of Water); `{"move": n}` moves the target's unit to the Defender's Province picked as target n (Isawa Tomo, Superior Tactics); `{"move": "switch"}` has two units trade places, assigned or at home, without moving (Way of Deception). `{"attach": n}` moves the target, attached to a Personality, to the Personality picked as target n, under that Personality's controller (Iuchi Karasu's Follower, Ninja Thief's Item). `{"endbattle": true}` sends every unit at the battle home bowed and ends it without resolution (Torrential Rain). `{"destroy": "terrain"}` destroys the Terrain at the battle being fought (Superior Tactics, whose either/or is two actions, as its Soul of the Empire printing has it). `{"ambush": true}`: target 0 (the player's unit) and target 1 (another player's) fight a battle of their own in the Action Phase, on a battlefield made for it (an empty zone, no Province card, Region, Fortification or Stronghold Strength; Strength 0) that is removed when the battle ends; no other unit joins it or moves from it, and the next player acts after it (Ambush). `"while": {"battle": {"force": "ahead"}}` makes an effect happen only while the player's army has the higher Force (`while` takes a gate name or the same battle conditions the gates use; until 2026-11-09 `"ahead": true`), and `"to": "leader"` aims it at the Personality leading the target's unit (Retreat's dishonor, seen before the unit leaves). Gates `{"battle": "defender"}` (only as the Defender: Kakita Yuri) and `{"battle": "outside"}` (only at a battle where the player has no units and isn't the Defender: Miya Yoto). Targets `"whose": "attacking" | "defending"` (a unit on that side of the battle being fought), `"whose": "defender"` on a Province, `"at": "battle" | "assigned" | "home"`; `"unbowed"` on a unit is its Personality's. A Gold cost `{"of": "unit"}` is the target unit's Force, its unbowed cards counted (Kakita Yuri). A modifier, `"modifiers": {"Imperial": {"assign": "defender"}}` (until 2026-11-09 `"assign": {"Imperial": "defender"}`): while the card is in play, the defender assigns first in each Maneuvers segment of its owner's turn (Ring of Water). Written on 13 Imperial cards (14 actions); the `l5r/fields` description of `play` has these since version 25.

### Copy, rule changes (2026-11-06)

`{"perform": {...}}` produces another card's action now, as this card's: the player picks a card in play and which of its actions, then that action's targets. `"action"` limits which actions (`{"keywords": "Elemental"}`), `"from"` which cards (`{"keywords": "Oni"}`); its timing must be open; its costs aren't paid (this action's are the price) unless `"pay": true`, and its "destroy this card" is left out; `"once": {"per": "source", "if": "selfdestroys"}` copies each card once, and with `if` only an action that destroys its own card (Naka Kuro: a spell that must be discarded, once; until 2026-11-09 `"discarded"`). `{"learn": {...}}` gives the picked action, copied as it is, until the end of the turn, used with its own costs, so a bow cost makes it once a turn and an action without one can be used again (the user: "the action is copied perfectly"): the target's own action with `"source": "target"` (Water Dragon, Ninja Shapeshifter's "one ability"), to the target with `"to": "target"` (Reflective Pool) or to the card this one is on with `"to": "host"` (Mask of the Oni). `{"mimic": "force" | "chi" | "ph"}` takes the target's value for the turn (Ninja Shapeshifter; its four choices are four actions sharing one `{"once": "turn", "key": "copy"}`). `{"redirect": {"match": {"type": "Spell"}}}` (`match`: what may be redirected, which also words its errors; until 2026-11-09 `true`), a Reaction to a spell being used: its effects are undone (its costs stay paid) and done again at targets the player picks anew, as its caster's (Ring of Air, once a turn). `{"priority": "attacker" | "defender" | "you"}` with the gate `{"battle": "start"}` (before anyone has acted in the battle): that player takes the next action in the battle (Sneak Attack: the Attacker). `{"attack": {"attacker": "you", "defender": "lastattacker" | "lastdefender"}}` with `"after": "attackend"` (an opponent's attack in which you were the Defender has just ended): an extra Attack Phase, named for the card on the table, in which you attack the former Attacker; the phase it was played in goes on after (Counterattack). `{"set": {"bowed": false}, "to": "combat"}` with `"after": "fought"`: your cards the battle's combat bowed straighten (Rallying Cry). Until 2026-11-09 these three were `first`, `counter` and `unbow`. The Rings' conditions: `{"hand": "empty"}` (no other card in your hand: Ring of the Void), `{"produced": 3}` (three spells or Shugenja abilities used this turn: Ring of Air), `"after": "terrains"` (in the battle just resolved you destroyed a Terrain, played a new one, and destroyed an army or a Province: Ring of Water). `"gain"` also takes `"until": "turn"`, `"uses"` and `"to": "self" | "host"`. Water Dragon's action has the gate `{"phase": "Events"}`, and the card rule `"waits": {"Imperial": {"phase": "Events", "action": 0, "prompt": "Copy an ability…", "note": "may copy an ability"}}` (the phase box's words come from it since 2026-11-09) keeps the Events Phase from going on by itself while the Dragon is in play and hasn't copied this turn (the user: "no reason the water dragon couldn't suspend the auto-proceed"): its owner gets Copy an ability… and, while last turn's Shugenja is still in play, Keep (the same copy); the phase button goes on without it. Written on 11 Imperial cards (12 actions); the `l5r/fields` description of `play` has these since version 26, Water Dragon's `waits` since 27.

### Bow, straighten, dishonor; Gold and costs; Cavalry; Terrain swaps (2026-11-06)

The last four groups of card actions (the user: "Do all 4 groups"), 23 actions on 22 Imperial cards. `{"set": {"bowed": true}}` bows a target and `false` straightens one; `"target": n` picks which target slot, for an action that also bows one of your own cards (Sake Works, Yasuki Taka); `"to": "host"` is the card it's on (Spirit Guide straightens its Shugenja). `{"nostraighten": ...}` keeps the target bowed: `"bowed"` while this card stays bowed, which it may (Kolat Servant; straighten it by hand to let go), `"there"` while this card is on the table (Shady Dealings, with `"to": "stronghold"`), `"next"` at its controller's next Straighten (Summon Faeries, only with a Phoenix caster: `"by": {"clan": ["Phoenix"]}`). Ikoma Ujiaki's gate `"after": "killed"` with `"killed": {"clan": ["Lion"], "type": "Personality"}` needs one of your Lion Personalities destroyed in the battle just resolved; his target's `"army": "opposed"` is one that was in the army facing yours.

`{"gold": n}` or `{"gold": {"of": "discard"}}` produces Gold for you (Shady Dealings' 5; Asahina Tamako: the discarded card's Focus Value). `{"goldplus": 1, "match": {"type": "Holding"}}` makes every Holding that produces Gold produce one more this turn (Bountiful Harvest). `{"free": match}` makes the next card of yours that fits, with a number Gold Cost, come into play free this turn (School of Wizardry: a Shugenja Personality, `"unless"` Naga or Nonhuman; Alhundro Cornejo: the Strategy Explosives); the table doesn't ask about paying for it. Shady Dealings stays in the active area until it's repaid: its second action (Limited, 5 Gold) destroys it, and the Stronghold may straighten again.

`{"trait": "Cavalry", "until": "turn"}` gives the target, or with `"to": "unit"` every card in the target's unit, the Cavalry keyword for the turn (Iuchi Takaai, Wind Born Speed, Wings of Fire, The Provincial Estate of the Unicorn; Shinjo Yasamura's target must be in his unit, `"same": "unit"`, once a turn). Cavalry Maneuvers counts it, and a printed `<b>Cavalry</b>` now counts too.

`{"terrain": "target"}` plays the target Terrain at the battle being fought, destroying the Terrain there (Go Master); `"keep": true` means it can't be destroyed or replaced (Oracle of Earth). `{"store": true}` puts a Terrain from the hand face down under The Armor of Sun Tao (the other player isn't told which, target `"hidden": true`); its Battle action plays one from there (target `"from": "under"`; on a phone, tap the Armor while picking to choose from a list).

### Events that resolve themselves (2026-11-06)

The first two groups of Events (the user: "do 1&2"), on 10 Imperial Events. An Event with `{"event": {"Imperial": {"effect", "effects"}}}` in `play` takes effect by itself when it turns up in the Events Phase, as its player's, and is discarded; the phase goes on. An Event without one still waits for Continue and is resolved by hand.

One-time: `{"to": "inplay", "if": match, "destroy": true}` (Iris Festival: every Shadowlands card in play; Plague: Followers with Force 3 or less). `"to": "each"` is every player still in, `"to": "lowest"` the player or players with the lowest Family Honor. `{"add": {"honor": {"of": "dead", "times": 3}}}` is 3 Honor for each of the player's Honorable Dead (Bon Festival). `{"province": "destroy", "which": "rightmost"}` (Evil Feeds Upon Itself) and `{"province": "add", "side": "left"}` (Chrysanthemum Festival; the new Province turns up at the next Events Phase). A search may name a `"match"` and `"reveal"` it (Imperial Gift: an Item, shown to everyone; the phase waits for the search).

Each player: `{"pick": {"whose": "right" or "own", "from": "dead", "match", "may", "text"}, "effects": [...]}`: each player in turn, from the Event's player, picks a card in a yellow bar (or on the table), then the `effects` run on all the picked cards: `{"destroy": true, "to": "target"}` (Hurricane: a Holding of the player to the right; Occult Murders: a Personality or Retainer, `match` a list of choices) or `{"bring": {"under": "owner"}, "to": "target"}`, back into play at its owner's home (Rise of the Phoenix: one of their own Honorable Dead, or none). Until 2026-11-09 the pick had keys of its own, `"destroy": true` and `"toplay": true`. A player with nothing to pick is passed over. "To his right" is the player before in turn order, since play passes to the left (Imperial p. 15). `{"turnover": "dynasty", "keep": match}` turns over each player's top Dynasty card: into play free, with no Honor, if it fits, else discarded (Unexpected Allies).

Honorable Dead: a Personality destroyed into its discard pile is marked Honorable Dead, or Dishonorable Dead if it was dishonored (Imperial p. 43); a discarded one is neither (SCC p. 54). The mark shows on the card in the pile.

### Events that change the rules, stay, or duel (2026-11-06)

The last three groups of Events (the user: "Go"), on 14 Imperial Events.

Rules for a while: `{"lasting": {...}, "until", "turns", "then"}` holds a rule for every player until the beginning of the Event's player's next turn (`"turns": 2`: the second, Proposal of Peace), the end of this turn (`"until": "end"`), the rest of the game (`"ever"`) or the player's next phase of that name (`"until": "Events"`, with `"then"`: effects run as it ends, Dead Walk The Earth destroying every Shadowlands card in play). The rules: `"noattack": true` (Emperor's Peace; no Declare attack button), `"skip": "Dynasty"` (Emergence of the Tortoise), `"free": match` (Bloom of the White Orchid: Spells for no Gold), `"nobow": match` (Celestial Alignment: Shugenja don't bow for spells or innate abilities, each used once while it lasts), `"negate": match` (Solar Eclipse, `{"any": [{"type": "Spell"}, {"type": "Personality", "keywords": {"has": "Shugenja"}}]}`: those cards use no actions, and what their actions did is put aside while it lasts; until 2026-11-09 `"nospells": true`), `"nohonor": "buy"` (Proposal of Peace), `"force": 4` with `"match"` (Dead Walk The Earth, cards coming into play too), `"nostraighten": match` (Peasant Revolt, after bowing them with `"set": {"bowed": true}`), `"draw": 1` (Glimpse of the Unicorn, the Event's player's End Phase) and `"discount": 2` with `"match"` (the Event's player's: Alliance). The phase bar lists what's in effect, in words.

Picks made by the Event's player: `"pick"` as a list, picked in order, with `"whose": "any"` or `"others"` and `"unbowed": true`, or a choice of words `{"choose": "clan", "options": [...], "not": "yours"}` (Alliance: buttons for the Clans; the choice fills in `"chosen"` in the rule). After the picks, `"effects"` on the cards picked: `{"duel": {..., "pair": true}}` pairs the two picked Personalities in a duel (Test of Stone: can't be refused, so it begins at once, `"safe"` both, `"lose": {"dishonor": true}`, the winner's family gains 4 Honor; until 2026-11-09 a `"duel"` key of the pick), or anything else (Imperial Quest, since 2026-11-08: bowed, and it gains the quest's triggers with `{"gain": {"when": [...], "key": "quest"}}`: it stays bowed at each of its Straighten Phases, 2 Honor to its family and a Quest turn token each time; straightened within 3 turns, it is dishonored; either way the quest's triggers and tokens go, `{"ungain": "quest"}`), `"challenges": {"accept", "win", "survive"}` (Test of the Emerald Champion: a duel against each other player in turn, who may accept with any Personality, bowed or not, or let it go; 3 Honor a win; surviving all, its `survive` effects: `{"province": "add", "to": "you"}` and `{"remove": true, "to": "target"}`, a Province more and the Champion removed from the game; until 2026-11-09 `"champion"`). The Events Phase waits for each duel.

Inheritance: `{"stay": {"produce": 5}}` leaves it in its player's active area for the turn (`production` 5, `expires: turn`); bowing it gives 5 Gold, and its trigger `{"at": "produced"}` destroys it; it is destroyed at the end of the turn if unused.

Readings to check: Alliance offers Crab, Crane, Dragon, Lion, Phoenix, Scorpion, Unicorn, Mantis and Naga; Imperial Quest counts its controller's Straighten Phases; the Emerald Champion's new Province goes on the right.

### Bonuses while in play (2026-11-06)

Card text that isn't an action, first group (the user: "do force/chi/strength bonuses"), on 21 Imperial cards. The card rule `play.bonus.Imperial` lists what a card gives while it's in play; the table works it out again after every action, so a bonus goes when its card leaves play (an attachment discarded or destroyed). Each shows as a green badge on the card it reaches, titled "from X, while it's in play", and can't be taken off by hand.

`{"add": {"force", "chi", "ph"}}` or `{"strength": n}`, to `"self"` (the default: an Item's own bonus), `"host"` (the card it's attached to: Night Medallion, Apprentice), `"unit"` (the other cards in its unit that fit `"match"`: Naga Warlord), `"inplay"` (Greater Mujina's Lesser Mujina), `"attackers"`/`"defenders"` (units at the Province it's on: Moat, Fort on a Hill, Barbican) `"province"` (its Strength: Unscalable Walls) or `"provinces"` (every standing Province of its player, from anywhere in play: Ring of Earth's +3). `"per": {"match", "in": "unit" | "yours" | "inplay"}`: so much for each card that fits (Ratling Bushi's Ratling Packs; an Ancestral Sword's clan Personalities you control). `"if": {"host": match}`: only on a Personality that fits (an Ancestral Sword on its own clan). `"when": "attacking" | "defending"` (Hida Tampako, Otaku Kamoko). `"opposed": match`: while facing such a card in a battle or a duel (Crystal Katana, The Jade Hand: Shadowlands). `"while": ["spell", "innate"]`: while its Shugenja uses a Spell or his own ability (Apprentice; Agasha Tamori spells only).

A Personality's Force and Chi, wherever they're checked (a target's limit, "equal to her Chi", the Force a Ranged Attack must reach, a duel), are its own plus what's attached printed as a bonus ("+1F", "+2C"); such an attachment is its own number for itself, and a unit's Force counts each card once (the user). Fixed with it: a duelist's Chi counted a +2C Item twice.

Left to the players: Barbican's doubled Ranged Attacks (a later group), Night Medallion's other numbers (Gold, Honor, numbers in abilities). Readings to check: Hida Yakamo (Oni) counts himself among your Crab Personalities, and an Ancestral Sword counts the Personality carrying it.

### On entering play (2026-11-06)

Card text that isn't an action, second group (the user: "Attachments cause state to change when attached ... they could add honor when attached"; "Honor gains tend to be immediate and one-time (don't take them back)"), on 15 Imperial cards. The card rule `play.enter.Imperial` (`{effect, effects, first}`) is what a card does as it comes into play: bought from a Province, played from the hand onto a card, brought into play by a card, or returned by an Event's pick (Rise of the Phoenix). A card moved by hand doesn't trigger it, nor does Unexpected Allies ("No effects are generated"). Its effects run as its player's, and Honor gained or lost this way stays when the card goes.

Honor: Hawk Riders −2, Lesser Mujina −1, Greater Mujina −2, Moto Tsume −4 (`{"add": {"honor": -2}, "to": "you"}`). An Ancestral Sword gives its player +4 and every other player of its clan −6 (`"to": "others"` with `"players": {"clan": "Crab"}`; a player's clan is their Stronghold's). Oni no Akuma loses 3 and destroys the Province it came from (`{"province": "destroy", "which": "entered"}`). Foxwife rehonors its Personality (`{"to": "host", "set": {"dishonored": false}}`; its Personal Honor of 5 is a later group). Shuten Doji comes in with four +1F/+1C tokens. Shadow Samurai's Force becomes that of the top Honorable Dead Samurai in its player's discard piles, for as long as it's in play (`{"set": {"force": {"of": "dead", "match": {"keywords": ["Samurai"]}}}, "until": "ever"}`: `set` takes a stat with a number or an amount; until 2026-11-09 `becomes`); with none, it stays as printed and the log says so.

Oni no Shikibu, the first time this game (`"first": "game"`), must take one of its player's other Personalities with it (`{"must": {"destroy": true, "type": "Personality", "whose": "yours", "other": true, "text": ...}}`). The user: "this is a non-optional effect (most effects are non-optional unless they say "may"). If you have no other personalities, shikibu comes in and destroys himself, otherwise you have to choose a personality to get whacked." The pick bar names the choices (bowed ones too) and nothing else can be done until one is picked; with one choice it's done at once. Targets also take `"other": true` (not this card) and `"any": true` (your own bowed Personality too).

Written on the 15 cards (ootv-tools `work/field-fixes/imperial-play/plan-enter.json`; checked against search, all match); the `l5r/fields` description of `play` has these since version 32. ootv-play [#64](https://github.com/Oracle-of-the-Void/ootv-play/pull/64), [#65](https://github.com/Oracle-of-the-Void/ootv-play/pull/65).

### Gold and costs from card text (2026-11-06)

Card text that isn't an action, third group (the user: "Gold and costs"), on 11 Imperial cards.

- **Production that counts cards** (card rule `play.produce.Imperial`, `{"per": a match, "n": 1}`): bowing the card adds n Gold for each face-up card in play that fits, anyone's. Port +1 for each Marketplace, Pearl Divers +1 for each Port, Trade Route +2 for each Marketplace, Blacksmiths +1 for each Iron Mine. A starred production ("2*") counts as its number; it used to produce nothing.
- **Gold for one kind of card** (an effect's `{"gold": n, "for": a match or a list}`): Blacksmiths' 4 for a Weapon or Armor, Forest's 2 for a Nonhuman or Creature Personality or Follower, Jade Works' 5 for a Jade card, the Temple of the Phoenix's 5 or 7 for a Spell or Shugenja. Each is an action in the card's menu (bowing it). The Gold is kept apart and pays for the next card that fits, with no "did you pay?" question; paying for anything else loses it, as Gold produced is, and it goes at the end of the turn. The Temple's 7 (`"then": {"noproclaim": true, "gain": {"keywords": ["Shadowlands"]}}`): no Honor for buying a Shugenja of your clan with it, and the Shugenja (or the one a Spell attaches to: "the Shugenja involved") gains Shadowlands for as long as it is in play.
- **Costs from the card attached to** (card rule `play.cost.Imperial`, `[{"match", "less": n} | {"match", "free": true}]`): Hida Tsuru's Followers cost 2 less; Bayushi Togai's Poison cards (a title or keyword with "Poison" in it: a match's `{"has": "Poison"}`) are free. The pay question uses the lower price.
- **Ninja Stronghold**: bow it and the next Ninja card you bring into play this turn costs no Gold (not a variable cost), as Obsidian words it.
- **Sacrificial Altar**: bow it and destroy one of your Personalities or Followers for twice its Force in Gold (`{"gold": {"of": "target", "field": "force", "times": 2}}`), losing Honor equal to its Force (an amount's `"times": -1`).

Togashi Hoshi's "2 less for a Brotherhood player" is on his Pearl printing only, not his Imperial-arc (Obsidian) one: left out. Written on the 11 cards (ootv-tools `work/field-fixes/imperial-play/plan-gold.json`; checked against search, all match); the `l5r/fields` description of `play` has these since version 33. ootv-play [#66](https://github.com/Oracle-of-the-Void/ootv-play/pull/66).

### Limits from card text (2026-11-06)

(Since 2026-11-09 the attach, assign, target and keep rules here are written as `prevents` entries: see "One rule for what a card may not do" below. The forms here still work until those cards are rewritten.)

Card text that isn't an action, fourth and fifth groups (the user: "do both of these groups": attach, join and assign limits; can't be targeted, negated), on 22 Imperial cards. One card rule, `play.modifiers.Imperial` (until 2026-11-09 `play.limits.Imperial`), an object of these; only the names `l5r/play` `modifiers` declares count, and the same object also holds the battle, assign and duelist rules below:

- **Attaching:** `"noattach": [matches]`: cards that fit will not attach to it (Ogre Bushi and Togashi Hoshi: Followers or Armor; Air Dragon: Followers or Items; Hida Amoro: Armor; Hida Yakamo the Oni: Followers, the Hero: Items; Otaku Kamoko: `{"type": ["Follower"], "not": {"keywords": ["Cavalry"]}}`). `"attachto"`: a match or a list; it only attaches to a card that fits (Climbing Gear and Dripping Poison: a Ninja Personality; Night Medallion: a Ninja or Kolat). `"attachok": [matches]`: ones that attach to it whatever their own limits say (Bayushi Togai: "May attach Dripping Poison"). Checked when a hand card is played onto a card, when a card's effect moves an attachment, and when a card is brought into play attached; not when a player moves cards by hand.
- **Joining:** `"join": {"clan": [...]}` or `{"honor": {"max": 0}}`: the player it joins when bought or brought into play (Matsu Tsuko a Lion Clan player, Togashi Yokuni a Dragon, Hida Kisada a Crab, as his Obsidian printing says; Moto Tsume not a player with Family Honor above 0).
- **Assigning:** `"alone": true`: in the Maneuvers it won't assign to an army with other units, nor other units to its army (Hida Yakamo the Oni). `"notwith"`: a match; not where the enemy army holds a card that fits (Togashi Hoshi: a Dragon, a Personality with that keyword). `"keepout": {"ph": [0, 4, 5], "while": {"unbowed": true, "honorable": true}}`: Personalities with those Personal Honors can't assign or move into attacks on its player's Provinces while it is so (Ki-Rin).
- **Can't be targeted:** `"notarget": {"by": ["ranged" | "spell" | a match], "unit": true}`: actions of that kind can't target it, or with `unit` any card in its unit ("spell": a Spell or a Shugenja's own ability). Iuchi Daiyu and Matsu Agetoki: Ranged Attacks, unit; Air Dragon: Ranged Attacks and Spells (Obsidian: no Kiho); Hida Kisada: Spells and Shugenja, unit.
- **Negated:** `"nofear": true`: Fear doesn't bow the Followers in its unit (Mirumoto Hitomi). `"negate": {"match": [...], "tokens": "Poison"}`: effects of cards that fit, and tokens with that word, have no effect on it (Bayushi Togai). `"nofort": true`: while its unit attacks, the Fortifications at that battlefield give no Strength or bonuses (Climbing Gear).
- **Kept or replaced:** `"keep": true`: a card's effect can't destroy or move it (The Jade Hand; it is still discarded with its Personality). `"minph": 5`: the Personality it's attached to has at least that Personal Honor (Foxwife). `"instead"`: `{"unit": match, "set": {"bowed": true}}`; when it would be destroyed with a card in its unit that fits, the rest of its unit is destroyed instead and it takes those states, by an effect or with its army (Goblin Warmonger: Goblin Followers; until 2026-11-09 `"shield": match`).

A match also takes `{"not": a match}`. A buy or a card played onto another that the text forbids is refused at once, before the table asks about Gold or jumping to the Dynasty Phase. Written on the 22 cards (ootv-tools `work/field-fixes/imperial-play/plan-limits.json`; checked against search, all match); the `l5r/fields` description of `play` has these since version 34. ootv-play [#68](https://github.com/Oracle-of-the-Void/ootv-play/pull/68).

Rules an Event holds for a while (Emperor's Peace, Proposal of Peace, Alliance) now show as a note in their player's Active area until they end, and the log says what is no longer in effect when they do (the user). ootv-play [#67](https://github.com/Oracle-of-the-Void/ootv-play/pull/67).

### Triggers, traits and other rules, duels (2026-11-06)

Card text that isn't an action, the last three groups (the user: "do all the remaining"), on 21 Imperial cards, read from their Obsidian wording.

- **Triggers** (card rule `play.when.Imperial`, a list of `{"at", "from", "if", "unless", "text", "effects", "must", "ifnone", "instead"}`). One runner does them all (2026-11-08), so a new card that "works like" one of these is a card edit, not a table change:
  - `at`: a phase's name (its player's phase begins), or a moment `l5r/play` `moments` declares (one it doesn't never fires): `always` (checked after every action), `straighten` (with `"instead": true` it stays bowed), `straightened` (bowed to unbowed, any way), `combat` (a battle begins where its unit is), `stepend` (a battle step ends), `battleend` (resolved or ended), `duelwon` (it, or the card it's on, wins a duel), `provincefell` (one of its player's Provinces), `honorlost` (its player loses Honor in an action of the card it's on), `produced` (it produced Gold). A card can also gain triggers in play (`{"gain": {"when": [...]}}`: Imperial Quest). `from`: `dead` or `honorabledead`, for a phase's trigger on a card dead in its player's discard pile.
  - `if` / `unless`: `self` or `host` (a match, plus `state`, `tokens` as a word or `{"has", "min", "max"}`, and `holds`), `count` (`{"of": "honorabledead", "min": 1}`), `battle` (`{"morethan": 2}`: its army's Force more than twice the other's, which a battle ended without resolution doesn't have, so it doesn't fire; `"side"`, `"unopposed": true`, `"step"`: a battle step's name). A condition the table doesn't know never fires.
  - `effects`: any of an action's effects, its player acting. `must`: a pick its player makes first (another card in its unit to destroy, with `ifhost` `{"pass": "right", "attach": ...}` for what happens when that's its own Personality, itself back from the dead, a Personality to overlay, or any card in play with a token, with the pick's own `effects`); `"may": true` gives it a Decline button. `ifnone`: what happens when there's nothing to pick. `text`: what the log calls it.
  - Effects gained for these: `"other": true` (not the card itself), `if`/`unless` with `state` and `tokens`, and a negative token `count` (that many off; token `"*"`: any kind).
  - The cards: Shuten Doji eats a token on another card in play and gains one (nothing to eat: 3 off). The Marsh Troll devours another card in its unit; if that's its Personality, the players to the right in turn may attach it to one of theirs (nobody: destroyed). Oni no Shikibu may come back from the discard pile, losing 2 Honor. Shiba Ujimitsu may take the place of a Personality of its player's, keeping what was on it (that Personality is discarded, not dead). The Mountain Keep of the Dragon: each remaining Province +2 Strength for good. Moto Tsume: as a battle begins, the others in his army with Personal Honor above one bow. Hida Amoro: destroyed after a battle unless his army's Force was more than twice the other's. Bloodsword: a +2F/+2C token when its Personality wins a duel. Shadow Samurai: destroyed when its player has no Honorable Dead. Foxwife: destroyed when her Personality is dishonored or his action loses his player Honor. Togashi Mitsu: a fire token off instead of straightening; bows after any battle while he has them. Bayushi Kachiko: holding seduction tokens, she stays bowed at Straighten and each gets one more (`{"holds": "grow"}`). Tsuburu no Oni: +6F at the end of the Battle actions segment, attacking with no defending units there (`stepend`, no longer a Reaction). Imperial Quest and Inheritance: above. For example, Hida Amoro is `[{"at": "battleend", "unless": {"battle": {"morethan": 2}}, "effects": [{"destroy": true, "to": "self"}]}]`.
- **Traits while in play** (a bonus's `"trait"`): Fan of Command (Tactician), The Star of Laramun (Double Chi, counted in a duel), Shinjo Yokatsu's Followers (Cavalry).
- **Battle rules** (modifiers in `play.modifiers.Imperial`; until 2026-11-09 `play.battle.Imperial`): Barbican `{"double": "defenders"}` doubles a defending Ranged Attack at its battlefield, after everything else, but not while Climbing Gear is attacking there. Scout `{"scout": true}`: with one in the attacking army, the attacker may play a Terrain before the defender's first battle action, as an extra action.
- **Draw rules** (modifiers in `play.modifiers.Imperial`, `l5r/play` version 54): `{"phasedraw": {"n": 5, "empty": true}}`: while the card is in play, its player's End Phase draw is that many cards instead of one; with `empty`, only when their hand is empty then. It happens by itself, and the log names the card (Ring of the Void, card 6338, 2026-11-09: until then a Reaction to click after the draw, which drew four more). Glimpse of the Unicorn's extra card still adds on top.
- **Terrain rules** (modifiers in `play.modifiers.Imperial`, `l5r/play` version 51; until 2026-11-09 read from the Terrain's printed text): Deadly Ground `{"lockout": true, "atonce": true}`: it takes effect as soon as it's played, and while it's at the battle every action there is refused unless its effects destroy a Terrain or it targets one (Reactions aren't actions and stay open). Entrapping Terrain `{"calloff": true}`: when it takes effect, the battle ends without resolution and every unit there goes home unbowed.
- **Forgotten Tomb:** three actions in its player's Dynasty Phase: no timing word, each starts with `if: {phase: 'Dynasty', turn: 'yours'}` (until 2026-11-10 the config's `timing.Dynasty` and `codetiming`, `l5r/play` versions 21–78).
  - Place a Shadowlands Personality or Follower from your hand or Provinces under it, shown to everyone (targets `"from": "reserve"`, effect `{"store": "shown"}`).
  - Bring a Personality out at no cost after as many turns as its Force (`{"bring": {"aged": "force"}}`); every player's turns count.
  - Bring a Follower out the same way, onto a Personality of yours.
  - Cards under the Tomb are destroyed with it, and a Personality destroyed that way isn't Honorable Dead.
- **Doji Yosai:** `limits` `{"nogifts": true}`: when he lobbies, nobody may give a gift for the other side.
- **Duels** (card rule `play.focus.Imperial`):
  - Feint `{"more": 1}`: after the reveal, its player may focus one more card from the hand (a "Focus one more" button). A Feint added that way gives no more.
  - Kharmic Strike `{"result": "tie"}`: the duel is a tie (Obsidian); `"win"` or `"lose"` would set it for the focus card's own side (until 2026-11-09 `{"tie": true}`). Today's Repeatable Limited draw isn't in Obsidian, so it's left out.
  - The Armor of the Golden Samurai, modifier `{"focusfloor": "ph"}` (until 2026-11-09 `play.focus` `{"floor": "ph"}`): the other duelist can't focus a card with a Focus Value below its Personality's Personal Honor.
  - Hida Yakamo, the Oni, modifier `{"nofocus": true}` (until 2026-11-09 `play.focus` `{"none": true}`): may not focus; the duel panel says he strikes.

Also from Obsidian: Shiba Ujimitsu only joins a Phoenix Clan player, and Shinjo Yokatsu only joins a Unicorn Clan player (modifier `join`). Written on the 21 cards (ootv-tools `work/field-fixes/imperial-play/plan-remaining.json`; checked against search, all match); the `l5r/fields` description of `play` has these since version 35. ootv-play [#72](https://github.com/Oracle-of-the-Void/ootv-play/pull/72).

Fixes from play the same day (the user): a card's search asks first ("Imperial Gift: Search Fate deck for an Item now?"), and Undo goes back to before a search ([#69](https://github.com/Oracle-of-the-Void/ootv-play/pull/69)). An action's Province target can be picked by its battlefield, picked targets are outlined, and a battle's totals show from its start ([#70](https://github.com/Oracle-of-the-Void/ootv-play/pull/70)). A card's actions that aren't open now stay in its menu, greyed, with the reason ([#71](https://github.com/Oracle-of-the-Void/ootv-play/pull/71)).

### Imperial cards finished out (2026-11-07)

Five Imperial cards whose parts were still done by hand (the user: "Let's see which imperial cards we can finish out"), ootv-play [#113](https://github.com/Oracle-of-the-Void/ootv-play/pull/113) and [#114](https://github.com/Oracle-of-the-Void/ootv-play/pull/114):

- **Shame** `{"once": "dishonored"}`: one Shame each time a Personality is dishonored. Once it's restored and dishonored again, another may be played. `"once"` can name any card state this way.
- **Scribe** `{"once": "target"}`: this card once for each target (once per spell per Scribe).
- **Kolat Infiltrator** `{"after": "holdingbowed"}`, `{"negate": true}` (until 2026-11-09 `unproduce`; `holdingbowed` is a config condition on the event: a card in play that took the bow and is a Holding): a Reaction to a Holding being bowed. If it was bowed for Gold, the Gold is taken back. If it was bowed to use its own action, that action's effects are undone, as a cancel does (the user: "Kolat infiltrator will also negate actions on the holding"). The Holding stays bowed. If it was bowed to pay for another card's action, only its Gold goes. A card's bow and the Gold it produces are one point to react to.
- **Goblin Mob** `{"redirect": {"ranged": true, "at": "unit", "to": "self"}}`: a Reaction to a Ranged Attack at a card in its unit. The attack is undone and made at the Mob instead.
- **Be Prepared to Dig Two Graves** `{"after": "destroyed", "killed": {"clan": "yours"}}` (one of your Personalities of your clan has just died; `"clan": "yours"` is the player's clan), then `{"lasting": {"grudge": {"add": {"force": 2, "chi": 2}, "match": {"type": "Personality", "clan": "yours"}}}, "until": "ever"}`. For the rest of the game, your clan's Personalities have +2F/+2C while they oppose the target in a battle or a duel. Each card played is its own rule, against its own target. Reading: the target is any Personality of another player.

Written on the 5 cards (ootv-backups operation 2026-11-08T031012-play-actions, plan ootv-tools `work/field-fixes/imperial-play/plan-byhand.json`); `l5r/fields` version 37 describes the new keys. Unexpected Allies already waives Honor Requirements, Gold and on-entering effects.

### Imperial cards finished out, second set (2026-11-08)

The next five (the user: "Yes and do the next five"), ootv-play [#115](https://github.com/Oracle-of-the-Void/ootv-play/pull/115) and [#116](https://github.com/Oracle-of-the-Void/ootv-play/pull/116):

- **Togashi Mitsu**: two triggers in `play.when`. `{"at": "straighten", "do": "token", "token": "+1F/+1C fire"}`: while he's bowed with a fire token, one comes off in the Straighten Phase instead of him straightening. `{"at": "battleend", "do": "bow", "token": "+1F/+1C fire"}`: he bows after any battle he's in, resolved or ended, while he has a fire token.
- **Ring of Earth** `{"after": "provinceheld", "over": true}`: only after an attack in which the attacking army's Force was above the Province Strength at some point. The table checks after each action, and the totals confirmed at Resolution count too.
- **Rally Troops** `{"place": {"cards": "destroyed", "unassigned": true}}` (until 2026-11-09 `{"rally": "hold"}`), no targets: any card can set cards aside this way to be placed by hand (`"onto"`: a match for the cards that may take them, by default Personalities; `"what"`: the words in the bar). the destroyed Personality's Followers go to your Active area at once (the user: "move them to a temporary space, let the user redistribute them, then click done"). You drag each onto one of your Personalities. Nothing else happens until you click Done in the bar at the top. Done checks that each Follower is on a Personality not assigned to a battle; if you have no Personality to take them, they're discarded.
- **Solar Eclipse** (code rewritten 2026-11-09 to the `negate` rule above): every lasting change an action makes carries the type and traits of the card that made it (the user: "they should be tagged with the card type who caused it and the traits of that card as well"). While the eclipse lasts, changes from a Spell, or from a Personality with the Shugenja trait, are turned off; they come back afterwards unless they ran out. An attached Spell's printed bonus counts for nothing meanwhile.
- **Cloak of Night** (code unchanged): the face-down card is revealed with Turn face up in its menu, which is an Open action. If it can't legally attach then, it's destroyed; otherwise it enters play with its on-entering effects. While face down it adds no Force.

Written on Rally Troops, Ring of Earth and Togashi Mitsu (ootv-backups operation 2026-11-08T174227-play-actions, plan ootv-tools `work/field-fixes/imperial-play/plan-byhand-2.json`); `l5r/fields` version 38 describes the new keys.

### Imperial cards finished out, third set (2026-11-08)

The next batch (the user: "build the next batch"), ootv-play [#119](https://github.com/Oracle-of-the-Void/ootv-play/pull/119):

- **Unique** (The Egg of P'an Ku): no Unique card comes into play while a Unique card of the same name is in play (Scorpion Clan Coup p. 28). This is checked for a buy, a hand card attached, and a card's "bring into play". A card Unexpected Allies turns over is discarded instead, and a Region isn't attached. Moves by hand aren't checked. It goes by the card's own printed title and traits, so the Egg copying a Unique Personality is still the Egg ("the Unique trait only applies to its identity as the Egg"). Imperial's book (p. 25) is stricter: "Two cards with the same name cannot be in play simultaneously if either is labeled Unique". The table follows Scorpion Clan Coup, as it does for the rest of this arc.
- **Fan of Command**: its Personality gets Battle: Tactician in its menu (`l5r/play` version 24, `traitactions`, above). Imperial's book (p. 47, "Tactics") adds the value at Resolution instead.
- **Blackmail** `{"grant": {"to": 0, "action": {"name": "Reveal", "timing": ["Open"], "effects": [{"destroy": true, "to": "self"}, {"province": "destroy", "which": "granted"}, {"add": {"honor": -10}, "to": "controller"}]}}}` (until 2026-11-09 `{"expose": {"province": 0, "honor": -10}}`): a granted action. The player whose Province it named sees "Reveal Blackmail (Open)" in its menu, greyed with the reason outside their Open action; using it runs those effects as theirs. Any card can grant another player an action on it this way. Revealing it destroys Blackmail and that Province, gives back the Holding, and its player loses 10 Honor. Once the Province is destroyed, it can't be revealed.

### Shadowlands, group A (2026-11-09)

The Shadowlands set, still under Imperial (SCC) rules (the user, 2026-11-09). Every Shadowlands printing's rules text was read from its scan (149 printings changed; 10 already matched), and 58 cards got play codes that the table already does, with these new pieces (ootv-play [#231](https://github.com/Oracle-of-the-Void/ootv-play/pull/231); `l5r/play` version 55, `l5r/fields` version 60):

- **A target relative to the card using it:** `{"force": {"max": {"of": "self", "plus": -1}}}`, "lower Force than O-Ushi".
- **Ranged twice a stat:** `{"ranged": {"stat": "chi", "of": "host", "times": 2}}` (The Fire from Within).
- **Duels:** `"must": {"card": a match, "has": a match}` makes a challenge unrefusable when the challenged fits, or its player has a card in play that fits (The Hooded Ronin: Shadowlands must accept; Yuki no Onna: with a Forest). A refusal's `"chi": -1` takes Chi for good (Hida O-Ushi).
- **A card's own Honor need:** the modifier `{"honorreq": 5}` (Temple of Bishamon: 5 Family Honor to bring it in).
- **Bonuses:** `"to": "attached"` (Yasuki Nokatsu's Followers +1F); `"opposedin": "duel"` (Hiruma Kage, The Nameless One: only while dueling a Shadowlands Personality).
- **Triggers:** the moment `destroyed`, a card that went from play to a discard pile (Ashigaru: lose 2 Honor).
- **Amounts:** `{"of": "facing", "field": "ph"}`, the duel opponent's (The Obsidian Hand); `times` on `{"of": "discard"}` (Kakita Yogoso: you and an opponent lose the Focus Value).
- **After a battle:** `"after": "undefended"` (a Province fell with no defenders) with `"to": "attacker"` (Plea of the Peasants).
- **Every player:** `{"discard": "hand", "draw": 5, "to": "each"}` (New Year's Celebration).

Pearl Bed also got `play.produce` (+1 Gold per Pearl Divers in play). Written (ootv-backups operations 2026-11-09T185418-play-actions and 2026-11-09T185702-play-actions; printed text checked in search, play codes read back from the table, all match). The rest of the set, by group, is in the ootv-claude notes.

### Shadowlands, battle flow and Dooms (2026-11-09)

ootv-play [#233](https://github.com/Oracle-of-the-Void/ootv-play/pull/233) and [#234](https://github.com/Oracle-of-the-Void/ootv-play/pull/234); `l5r/play` version 57, `l5r/fields` version 61.

- **Bayushi Tomaru:** `{"after": "heldagainst"}`, `{"discard": true, "which": "battle"}`: after a battle he attacked in left the Province standing, its card is discarded.
- **Ikoma Kaoku:** `"to": "fought"`: your Personalities from the battle just resolved get +1F/+1C for good.
- **Strike At the Tail:** a destroy's `"cap"`: the Followers picked may add up to no more than your bowed unit's Force (+2 led by a Unicorn).
- **Forced March:** a target's `"fought": "turn"` (a unit that fought elsewhere this turn); it straightens and joins, bows after this battle (a gained trigger with `"once"`), and doesn't straighten next.
- **Call to Arms:** the gate `"declared"`; your bowed Personalities straighten, and all bow at the attack's end (moment `attackover`, kept on your Stronghold).
- **Earthworks:** the modifier `{"noassign": ["cavalry"]}`.
- **Dark Oracle of Water, Shinjo House Guard:** the gate `"assigned"` and `{"late": "yours"}` / `{"late": "self"}`: after the Maneuvers, before the first battle, assign as in the Maneuvers.
- **Dooms:** Doom of the Dragon (a token, and while a Dragon holds it the modifier `notbeside`: not in one army with another Dragon Personality); Doom of the Lion (a token and `attackbow`: assigning it to attack, the table asks which other Personality to bow); Doom of the Unicorn (`{"untrait": "Cavalry", "until": "ever"}`); Doom of the Scorpion (lasting `basestrength`: Scorpion players' Provinces lose their Stronghold Strength until the revealer's next turn); Doom of the Crane (Holdings whose actions gain Honor: the condition `"gives": "honor"`).
- **The Falling Darkness, The Rising Sun:** lasting `per`: every Personality's Force down, or Chi up, by its own Personal Honor until the revealer's next turn.

Written (ootv-backups operations 2026-11-09 play-actions: 8 cards, then 7 Events; read back from the table, all match). Left to come back to: Final Charge, and Shinjo House Guard's "only Follower, Cavalry Personality" condition (the players judge it).

### Shadowlands, duels, Followers and cancels (2026-11-09)

ootv-play [#240](https://github.com/Oracle-of-the-Void/ootv-play/pull/240), [#241](https://github.com/Oracle-of-the-Void/ootv-play/pull/241), [#243](https://github.com/Oracle-of-the-Void/ootv-play/pull/243) and [#244](https://github.com/Oracle-of-the-Void/ootv-play/pull/244); `l5r/play` version 60, `l5r/fields` version 62.

- **Test of Might:** duel rules `"stat": "force"` and `"lose": {"bow": true}`: Force is compared, and the loser is bowed, not destroyed.
- **Ratling Thief:** duel rules `"plus"` and `"take"`: +3C for this duel; if it wins, it takes the Item, and nobody dies.
- **Mirumoto House Guard:** `"challenger": "host"`: the Personality it is attached to challenges.
- **He's Mine!, Bayushi Aramoro:** `{"duelset": {"replace": "target" | "self"}}`: take a duelist's place. He's Mine! bows the one replaced (`bowout`), and Aramoro bows after the duel (`bowafter`).
- **Dark Oracle of Fire:** focus `"faceup": "theirs"`: your opponent's focus cards go face up.
- **Tetsubo:** the modifier `strikefirst` and a bonus with `"induel"`: when its Personality challenges, it focuses or strikes first, and it has −1C only while dueling.
- **Levy Troops:** a make's `"count": {"of": "x", "div": 3}`: one 1F Ashigaru token per 3 Gold paid.
- **Doji House Guard, Shiba House Guard:** a bonus add of `{"of": "host", "field"}`: Force from the Personality's Personal Honor (+1) or Chi.
- **Porcelain Mask of Fu Leng:** tokens equal to its Personality's Chi, one off each Events Phase; none left: its Personality is destroyed.
- **Gambling House:** `{"production": an amount}`: it produces the Focus Value it discarded as it came in.
- **The Hidden Temples of the Naga**, from its Time of the Void wording (its most recent Imperial-arc printing): a Limited action makes a 1F Naga Follower token on a Naga Personality; the modifiers `nofearfor` (your Nagas are immune to Fear), `nohonorwin` (no Honor Victory) and `honorwaive` (Honor Requirements of Nagas ignored while you have no Shadowlands cards in play; the buy's log names the Temples).
- **A Stout Heart, Matsu Chokoku, The Turtle's Shell:** a cancel's `"kinds"` (`fear`, `ranged`), with `"targeting": "army"` for Chokoku: they cancel a Fear or Ranged Attack aimed at the card or unit they name.
- **Another Time, Nageteppo:** a focus card's `"result": "none"` and `{"duelset": {"end": true}}`: the duel ends with no effect. Nageteppo's Battle action sends its unit home unbowed (`"home"` with `"to": "host"`).

Written (ootv-backups operations 2026-11-09 play-actions: 7, 5 and 6 cards; read back from the table, all match). Left to come back to: Levy Troops' Honor loss when a token goes, and the Porcelain Mask when it is destroyed some other way.

### Shadowlands, redirects and moving tokens; Imperial numbers (2026-11-09)

ootv-play [#246](https://github.com/Oracle-of-the-Void/ootv-play/pull/246); `l5r/play` unchanged (version 60), `l5r/fields` version 63.

- **Shinjo Tsuburo:** a redirect `"at": "army"`, `"to": "self"`: he takes a Ranged Attack aimed at another card in his army. If it isn't strong enough to destroy him, it has no effect.
- **Gust of Wind:** a redirect `"at": "army"`, `"to": "battle"`: a Ranged Attack aimed at its Shugenja's army goes to any card in the battle it can be aimed at, in either army.
- **Soshi Bantaro:** a redirect `"to": "self"` with no `"at"`: a spell's effect goes to him, where he is a legal target.
- **Sympathetic Energies:** `{"movetoken": true}`: a token moves from the first Personality picked to the second. A made token card only goes where it could attach. When the first Personality has more than one token, the table asks which one.
- **Kolat Oyabun:** a target match `"counters": {"conspiracy": {"min": {"own": "ph", "plus": 1}}}`: its Open bows a Personality with more conspiracy tokens than its Personal Honor.

**`play.fields`** (ootv-play [#247](https://github.com/Oracle-of-the-Void/ootv-play/pull/247)). A card stores its most recent printing's numbers. `{"fields": {"Imperial": {"cost": ["10"]}}}` gives the numbers an older era printed where they differ, stored like the card's own fields. The table uses them when it builds decks under that rule set. Written for Imperial:

- The Ancestral Home of the Lion: Strength 6.
- The War Fortress of the Crab: Strength 7.
- From the Shadowlands printings, read by eye against all 79 Shadowlands cards reprinted after the Imperial arc:
  - Obsidian Mirror: cost 10.
  - Mirumoto Taki: cost 8, also on its Battle of Beiden Pass printing.
  - Thunder Dragon: cost 14, Honor Requirement 12.
  - Wakizashi: focus 1.
- From the Clan Wars printings of every other play-coded card that was reprinted after the Imperial arc (224 cards, read by eye, 2026-11-09):
  - Castle of Water: cost 3.
  - Earth Dragon: cost 11.
  - Explosives: cost 8.
  - Fan of Command: cost 5.
  - Fire Dragon: Force 6, cost 14.
  - Investigation: cost 2.
  - Void Dragon: Force 7, cost 11.
  - Wyrm Riders: cost 6.
  - Spearmen: Honor Requirement 1.
  - Kakita Yoshi: Personal Honor 1.
  - Not changed: the number in the corner of the Honor Holdings (Famous Poet, Fantastic Gardens, Hawks and Falcons, Temple of Bishamon) is the Honor they give, which no field stores.

Written (ootv-backups operations 2026-11-09T215807, T220221 and T223158 play-actions; read back from the table, all match). Also:
- Printed text read from the scans for two printings that had none: Shinjo Tsuburo (Battle of Beiden Pass) and Sympathetic Energies (Promotional–CWF).
- Temple of Bishamon's missing `production` filled: it produces 1 Gold (operation 2026-11-09T220243 fill-variable-values).

### Shadowlands, Corruption on the host; Chi reduced to zero (2026-11-09)

ootv-play [#250](https://github.com/Oracle-of-the-Void/ootv-play/pull/250) and [#251](https://github.com/Oracle-of-the-Void/ootv-play/pull/251); `l5r/play` version 61 (`statdeath`), `l5r/fields` version 64.

- **The Corruption token:** Dark Divination, Shapeshifting, Touch of Despair and Touch of Fu Leng each carry `{"at": "straightened", "of": "host", "effects": [{"token": "-1C Corruption", "to": "host"}]}` in `play.when`. A trigger with `"of": "host"` fires at the moment of the card it's attached to, so the Shugenja gets a −1C token each time he straightens, at Straighten or any other way.
- **Dark Divination:** `{"look": {"top": 5}}`: its player may look at the top 5 cards of any one deck, anyone's, from that deck's menu (Look at top).
- **Shapeshifting:** `{"swap": ["force", "chi", "ph"], "base": true, "until": "ever"}`: the table asks which two to switch. Base values are the printed ones plus changes for good, not tokens or changes for a while.
- **Touch of Despair:** `{"trait": "Shadowlands", "until": "ever"}`.
- **Touch of Fu Leng:** the target gains "Battle: Fear X" until the end of the turn, its Fear `{"stat": "chi", "of": "giver"}`: the Chi of the Shugenja who gave it, read when the Fear is used.
- **Chi reduced to zero** (SCC p. 53: "If the Chi of a Personality drops to zero for any reason, that Personality is destroyed"): config `statdeath {"stat": "chi", "match": {"type": "Personality"}}`. Checked after each action; the Personality goes with its attachments, Honorable Dead unless dishonored. One printed at 0 Chi isn't reduced and stays.

Written (ootv-backups operation 2026-11-09T224923 play-actions, 4 cards, read back from the table, all match). Each has one printing, with text; no numbers differ for Imperial.

### Shadowlands, tokens toggled and counted (2026-11-09)

ootv-play [#252](https://github.com/Oracle-of-the-Void/ootv-play/pull/252); `l5r/play` version 62 (`modifiers.bringtokens`), `l5r/fields` version 65.

- **Mara and Shabura:** `{"token": "-2F Change", "toggle": true, "to": "self"}` (Shabura's `-2F/+3C Change`): one off if she has one, else one on, so never more than one. Mara's bonus `{"trait": "Cavalry", "if": {"self": {"tokens": "Change"}}}` makes her Cavalry while she holds a Change token.
- **Kitsu Motso:** his Limited, `{"token": "Master", "to": "self"}`. His Battle action (two consecutive actions) comes with the next group.
- **Oni no Sanru:** the modifier `"bringtokens": 4`: he is bought only by destroying 4 tokens on his player's cards (counters or token cards). With more than 4 the table asks which, one at a time, before the Gold; with fewer it says why. His bonus `{"add": {"force": 1}, "per": {"tokens": true, "in": "opposing"}}`: +1F for each token in the army his unit faces in a battle.

Written (ootv-backups operation 2026-11-09T231011 play-actions: play codes on 4 cards, read back from the table, all match; and the printed text of four printings that had none, read from their scans: Shabura Promotional–Ivory, Kitsu Motso Emerald, Obsidian and Promotional–Jade). No Holdings; no numbers differ for Imperial. Card play codes are kept out of search (ootv-dynamo), so they are checked in the table.

### Shadowlands, Honor events, arrows and extra actions (2026-11-09)

ootv-play [#253](https://github.com/Oracle-of-the-Void/ootv-play/pull/253); `l5r/play` version 63 (`afters` `actorloss`, `holdinghonor`, `boughtfull`, `dynastyend`), `l5r/fields` version 66. The new reaction conditions read the whole action the picked log line belongs to (a purchase is its move, its Personal Honor and its refill).

- **Court Jester:** `{"after": "actorloss", "once": "event"}`, then `{"add": {"honor": {"of": "lost", "who": "actor", "times": -1}}, "to": "actor"}`: the other player loses their own loss again; one Jester a loss.
- **Bayushi Goshiu:** `{"after": "honorloss"}`, then your loss `{"of": "lost", "who": "you", "times": -1}` to another player.
- **Shosuro Taberu** (Political, as his Battle of Beiden Pass printing): `{"after": "holdinghonor"}`; you gain what the other player gained, and they lose it.
- **Togashi Gaijutsu:** `{"after": "boughtfull"}`, a target of yours with clan Dragon and the Samurai trait: no Personal Honor gain, the top Fate card discarded, its Focus Value in Force and Chi for good.
- **Crystal Arrow, Jade Arrow:** gate `{"capable": "ranged"}` (the Personality has a Ranged Attack of its own, gained, or from another attachment); `{"ranged": {"sure": true}, "any": true}` (destroys the card whatever its Force; counted as a Ranged Attack); the host bows, the arrow is destroyed. Crystal only at an opposing Shadowlands card.
- **Han-kyu, Ikiryo:** `"withfollowers": true` (may hit a Personality with Followers). Ikiryo: Ranged equal to its Personality's Chi, Honor lost `{"of": "host", "field": "chi", "times": -1}`, its Personality dishonored, Ikiryo destroyed.
- **Kitsu Motso:** Battle, cost `{"bow": true, "token": {"name": "Master"}}`, `{"again": 2}`: his player takes the next two actions before the next player (a pass ends it).
- **Twist of Fate:** `{"after": "dynastyend"}`, `{"window": {"timing": ["Limited", "Open"]}}`: one Limited or Open card action in the End Phase, offered in the menu. Lobbying is shut out; "You may not attach cards" is left to the players (to look at again).

Written (ootv-backups operation 2026-11-09T233800 play-actions: play codes on 10 cards, read back from the table, all match; and the printed text of five printings that had none, read from their scans: Shosuro Taberu and Crystal Arrow, Battle of Beiden Pass; Ikiryo, Emperor and Gold; Twist of Fate, Emperor). No Holdings; the reprinted cards' numbers were checked with the redirects group.

### Shadowlands, Province and Stronghold rules (2026-11-09)

ootv-play [#254](https://github.com/Oracle-of-the-Void/ootv-play/pull/254), [#255](https://github.com/Oracle-of-the-Void/ootv-play/pull/255) (by the cards' rulings); `l5r/play` version 64 (modifier `ruin`), `l5r/fields` version 67.

- **Bayushi Kyoto:** Limited, bow, a Province target: `{"turn": "down", "stay": true}`. Its card goes face down and isn't turned up at its player's next Events Phase; a face-down one is kept down too ("May be used on a face-down Province").
- **Desperate Measures:** an Event: `{"province": "destroy", "which": "self"}` first, then a pick `{"province": true, "other": "self"}` (any other Province still standing, from buttons in the pick bar) whose effects destroy the one picked (`"which": "picked"`) and take 5 Honor. In its player's last Province they lose at once and there's no pick ("you lose immediately and no more effects are generated", Rules Archive p. 70).
- **Oni no Kamu:** as he enters, lose 6 Honor and the Stronghold `{"set": {"bowed": true}, "nostraighten": "there", "silence": "there"}`: no straightening, no Gold, no actions of its own while he's in play; continuous effects still count (as ruled). An `Oni turn` token as each of your turns begins, destroyed in the End Phase at three ("Its three-turn lifespan only counts your full turns", FAQ 3.1).
- **The Ruined Fortress of the Scorpion:** modifiers `{"ruin": true, "nohonorwin": true}`: at -20 Honor its player isn't out; their unadjusted Province Strengths are zero for the rest of the game (Fortifications still add); no Honor Victory.
- **Threat of War:** Open, `{"theirturn": true}`, bowing a Samurai of yours; `{"tax": {"on": Holding, "bow": Samurai Personality}, "to": "opponent"}` for the turn: when that player bows a Holding the table asks which samurai to bow with it, or "Produce nothing". A Holding bowed as an action's cost isn't asked about.
- **Evil Ward:** Open, bow the Shugenja, anywhere: `{"strength": 5, "until": "turn", "while": {"attacking": Shadowlands}}` on a Province: counts only while a Shadowlands card is in the attacking army there.

Written (ootv-backups operation 2026-11-10T001158 play-actions: play codes on 6 cards, read back from the table, all match; and the printed text of The Ruined Fortress of the Scorpion's Time of the Void and Promotional-Imperial printings, read from their scans). Oni no Kamu's Shadowlands printing (titled Oni no Ogon) and the Fortress's show the stored numbers. The Fortress's Shadowlands and Promotional-Imperial images are the same file: one may be wrong.

### One rule for what a card may not do; tokens, Fear, duels (2026-11-09)

The user: "we are going to be adding more and more cards, so let's get things standardized now." ootv-play [#260](https://github.com/Oracle-of-the-Void/ootv-play/pull/260), [#261](https://github.com/Oracle-of-the-Void/ootv-play/pull/261), [#262](https://github.com/Oracle-of-the-Void/ootv-play/pull/262), [#264](https://github.com/Oracle-of-the-Void/ootv-play/pull/264) to [#267](https://github.com/Oracle-of-the-Void/ootv-play/pull/267); `l5r/play` version 70 (modifier `prevents`'s words, moment `duelresolved`, modifier `fearplus` removed).

- **`prevents`:** one entry `{"action", ...}` for what a card may not do, read wherever the table checks that action.
  - What the card may not do: a card action by its label's last part (the rulebook's "Reaction: Seppuku" is `seppuku`), or `challenge` (be the challenger), `refuse` (a challenge: it can't be refused), `focus`, `attack`, `defend` (be assigned in the Maneuvers; `"moves": true`, or moved in by an effect; `"with": true | match`, not in one army with other units or such a card, either way; `"against": match`, not where the enemy army holds one), `straighten` (`"by": "phase"`, only its player's Straighten; `"by": "effect"`, only a card's).
  - What may not be done to it, the same verbs with `"on": "self"` (or `"unit"`: it and the rest of its unit): `target` (`"by"`: `ranged`, `spell` or a match), `attach` (`"by"`: the cards that won't attach to it), `move`, `destroy` (by a card's effect), `restore` (to honor).
  - Other cards kept out: `"who": match`, `"where": "yours" | "here"`, `"step": [kinds]` (Ki-Rin: Personal Honor 0, 4 or 5 may not attack your Provinces; Earthworks: no units here in cavalry segments). `"while": {"unbowed", "honorable"}` and `"if"` (conditions on the card: Togashi Mitsu, while he has a fire token).
  - Where it comes from: the card's `play.modifiers.Imperial.prevents`; an effect's `{"prevents": entry, "until", "to"}` (Utter Defeat), or held by the effect's card, `"while": "bowed" | "there"` with `"whileholds": token` (Kolat Servant, Shady Dealings, Oni no Kamu, Kakita Torikago while you keep the Favor), or `"until": "straighten"` (the next Straighten: Summon Faeries, Forced March); on a player, `"to": "you"` etc. (`attach`, `lobby`: Twist of Fate); an Event's `"lasting": {"prevents": {"action", "who"}}` (Peasant Revolt); a duel's own, `"duel": {"prevents": {"action": "focus", "side"} | {"action": "refuse"}}`.
  - Replaces `noattach`, `notarget`, `keep`, `alone`, `notbeside`, `notwith`, `keepout`, `noassign`, `nofocus`, a duel's `nofocus` and `refuse: false`, and `nostraighten`; removed 2026-11-10 once every card was rewritten (below).
- **Duel results:** the moment `duelresolved` fires for each duelist and its attachments, with `"if": {"duel": {"result": "win" | "lose" | "tie"}}` for its own side (Kakita Toshimoko: lose 5 Honor when he loses; Bloodsword on `win`).
- **Fear raised like Ranged:** a bonus's `{"add": {"fear": n}}` (Shadowlands Madmen: `"to": "unit"`); the modifier `fearplus` is gone.
- **Tokens:** `{"destroy": {"tokens": word | "*"}}` destroys every token with that word in its name, on cards and token cards alike, with no `to` (Setsuban Festival); `{"remove": {"tokens", "count": n | "all"}}` takes them off the cards of `to` (one if not said). `token` only adds.
- **Ashlim:** one target, another of your unbowed Personalities, bowed and losing Shadowlands for good.

The rewrites were written 2026-11-10 (below).

### Hand straightening, "May remain bowed", rules picked by a rule, token rules (2026-11-10)

From the user's review of the codes. ootv-play [#269](https://github.com/Oracle-of-the-Void/ootv-play/pull/269) to [#272](https://github.com/Oracle-of-the-Void/ootv-play/pull/272); `l5r/play` version 71 (`lastinghooks.nostraighten`, `modifiers.nofocus`, `moments.duelwon` removed), `l5r/fields` version 68.

- **Straightening by hand** obeys `prevents straighten` and held rules, as the Straighten Phase and card effects already did. Kakita Torikago's target can't be straightened by hand; straightening a whole unit by hand leaves such a card bowed and says why. The card holding the rule may still be straightened by hand, which lets go.
- **"May remain bowed":** the card's own `{"prevents": {"action": "straighten", "optional": true}}`, as printed, with no restriction. Effects and hands still straighten it. At its Straighten the table keeps it bowed while it holds a rule on another card, and straightens it otherwise; the player does the other by hand. Kakita Torikago, Kolat Servant.
- **`select`:** an effect's targets picked by a rule: `{"select": {"units": true, "match", "where": {stat: n | {"min", "max"} | "highest" | "lowest"}}}` (the user: "not unit.force == max(unit.force)?"). Then the usual effects: an amount `{"of": "target", "field", "unit": true}` is the unit's total, and `"to": "owner"` counts each owner's own. Imperial Levying: `select` highest Force, `add {"honor": {"of": "target", "field": "force", "unit": true}}` to `owner`, `destroy` to `unit`. Replaces `topunits` (on no card).
- **Token rules:** a token effect's `"rules": {"when", "actions", "each"}` are what the token itself does, on every card holding one, wherever it was moved (Sympathetic Energies) and whoever put it there; not where it is negated (Bayushi Togai). `"each"`: one per token held. Shosuro Hametsu's Poison (the user: "each token gets it's own reaction, so you can react with one for -2C, or do it twice for -4C"): each token is its holder's Reaction to entering a duel; the token is destroyed and, when a strike is declared, the other duelist gets -2C until the end of the turn.
- **A named gained rule** (`gain` with `"key"`) gained again replaces the one the card has, so it isn't doubled.
- **Old forms removed:** the modifiers `noattach`, `notarget`, `keep`, `alone`, `notbeside`, `notwith`, `keepout`, `noassign`, `nofocus`; `nostraighten` (effect, flag, hold, lasting hook); a duel's `refuse: false` and `nofocus` as card terms; negative token counts; the moment `duelwon`.

Written 2026-11-10 (the user's review page): ootv-backups operation 2026-11-10T035113 play-actions, the rewrites (52 entries: the cards moved onto the standard forms; Kakita Yoshi, Ide Tadaji, Kakita Toshimoko, Twist of Fate, Togashi Mitsu coded; the Imperial and Emerald text of Yoshi, Tadaji and Toshimoko from their scans), and 2026-11-10T035410 play-actions, Shadowlands group N rows the user accepted (Ashlim, Bayushi Hisa, Shadowlands Madmen, Corrupted Iron Mine, Setsuban Festival, and 17 printings' text read from their scans). Read back: 82 values match; search: 57 cards, 0 differ. Kakita Torikago, Imperial Levying, His Most Favored, Goblin Shaman and Minor Oni Servant written later that day (below); Shosuro Tage, Obsidian Mirror, Mountain Goblin, Utter Defeat, Shadowmadness and Shosuro Hametsu wait on the user's review.

### Shadowlands group N, from the user's review (2026-11-10)

ootv-play [#273](https://github.com/Oracle-of-the-Void/ootv-play/pull/273) to [#276](https://github.com/Oracle-of-the-Void/ootv-play/pull/276); `l5r/play` version 72 (eight old modifier declarations dropped), `l5r/fields` version 69.

- **His Most Favored** (the user: "Why does his most favored use the word tie?"): `{"stay": {"while": "target"}}`, the card stays on the table while the Personality is in play, then goes to the discard pile; the 10 Honor lost if the Personality is destroyed is a `destroyed` trigger it gains (a gained trigger counts as its card leaves play). `tie` is gone.
- **Goblin Shaman** (the user: "not using the focus value to limit the targets, but limiting the targets in the effects?"): the target's `"count": {"of": "discard"}`, as many goblins as the Focus Value discarded; the table asks for the discard first, then the targets. The effect's `most` is gone.
- **Minor Oni Servant** (the user: "Shouldn't it be something like honor: subtract: cost? Or add negative cost?"): the cost rule's `"add": {"honor": {"of": "card", "field": "cost", "times": -1}}`, the card being the Spell paid for. `honor: 'cost'` is gone.
- **Shosuro Tage** (the user: "declare and attack, then not be able to go past the infantry phase if the card is infantry ... not go past the cavalry phase if the card is Calvary"): `mustattack` also refuses a jump past the Attack Phase (a buy's jump to the Dynasty Phase too) and End turn with no attack declared; a Cavalry unit is held only in the Cavalry Maneuvers.

Written (operation 2026-11-10T153515 play-actions, ootv-backups [71c8dfa](https://github.com/Oracle-of-the-Void/ootv-backups/commit/71c8dfa)): Kakita Torikago, Imperial Levying, His Most Favored, Goblin Shaman, Minor Oni Servant; read back, all match.

### Shadowlands group N, rows 11–16, walked through with the user (2026-11-10)

ootv-play [#278](https://github.com/Oracle-of-the-Void/ootv-play/pull/278) to [#285](https://github.com/Oracle-of-the-Void/ootv-play/pull/285); `l5r/play` version 76, `l5r/fields` version 70.

- **Obsidian Mirror** (the user: "the card doesn't disallow targetting yourself"): `to: 'player'`, any player still in, yourself too, asked before the name. The name matches a card by its title or its short name (the title less its first word, a family name; less `(...)`, an epithet and "Experienced"): "Toshimoko" is Kakita Toshimoko, experienced too, not Toshimoko no Sensei. On a miss the other player may discard a card close enough by hand. A full L5R name search is for later.
- **Mountain Goblin** and **Oni no Shikibu** (the user: "how does must {self: true} equate to entering play?"): a trigger's `may: true` (its player is asked first) and the effect `intoplay`, from the discard pile at no cost, entering play. `must {self}` is gone; Oni no Shikibu was rewritten (operation 2026-11-10T185149).
- **Utter Defeat** (the user: "destroy and bring back is very different than preventing the destruction"): `spare: true`. The battle's resolution or the duel's result is taken back and run again without destroying the Personality: it never leaves play, nothing of its destruction happens, and nothing can react to it, unless Utter Defeat is cancelled, which puts the destruction back. The first run's log lines are struck. In a battle its Followers are still destroyed. The verb for being restored to honor is `rehonor` (`prevents`, and the Imperial Favor's use id).
- **Shadowmadness** (the user: "we should have some generic trigger when: end -> destroy"): each non-Shadowlands Follower gains a one-time trigger at the moment `turnend` that destroys it; the flag `doomed` is gone. During a battle, an Open or Battle action must come from a card at that battle, bring one in, or target one there or the Province (SCC p. 39; config `timing` `atbattle`).

Written (operation 2026-11-10T205906 play-actions, ootv-backups [410d1f5](https://github.com/Oracle-of-the-Void/ootv-backups/commit/410d1f5)): Shosuro Tage, Obsidian Mirror, Mountain Goblin, Utter Defeat, Shadowmadness, Shosuro Hametsu, in the words of ootv-play [#284](https://github.com/Oracle-of-the-Void/ootv-play/pull/284); read back, all match.

### One-off play code words standardized (2026-11-10)

The user went through every play code form only one or two cards used (rows L1–L14, all "standardize"). ootv-play
[#284](https://github.com/Oracle-of-the-Void/ootv-play/pull/284), [#287](https://github.com/Oracle-of-the-Void/ootv-play/pull/287),
[#288](https://github.com/Oracle-of-the-Void/ootv-play/pull/288); `l5r/play` version 77.

- **When a Reaction may be used** (`after`): a name `l5r/play` declares, or the condition written on the card itself,
  `{battle: {...}}`, `{attack: {...}}` or `{event: {...}}`. The nine names one card each used (Bayushi Tomaru, Ring of
  Earth, Plea of the Peasants, ...) are gone from the config; the message when it can't be used is built from
  `afterwords`. `after: 'destroyed'` with a target from a pile covers Feign Death and Scribe (was `gone`).
- **Moments**: `phasestraighten` (the Straighten Phase straightening a card), `honorloss`, `attackend`.
- **The dead** are a mark on a card in its discard pile (the user: "dead ... is a trait kept in the discard pile"):
  `{from | of: 'discard', dead: true | 'honorable'}`. Any player's discard pile: `from: 'discard', whose: 'any'`.
- **Attacker and defender**, never plural: targets' `whose`, bonuses' `to`, Barbican's `double`. What they mean comes
  from where they're used (a card: in that army of the battle being fought; a Province: that player's).
- **The other duelist**: `other: true` (Poisoned Weapon, The Obsidian Hand, Shiba Tsukune); challenger and challenged
  stay (who started the duel).
- `all` takes `whose`; a lasting rule ends with `until: 'turn'`; Marsh Troll picks `at: 'unit'` (`in` only counts,
  `to` only applies); `field` names a card number everywhere (was `stat` in some places).
- **Provinces** (the user: "I don't like the plural mixing"): `to: 'province', which: 'current'` (the one it's on) or
  `'yours'` (every one of yours).
- **Bayushi Kachiko**: her seduction tokens are tokens by name, wherever they are moved: she stays bowed in her
  Straighten Phase while any is in play and each card with one gets one more; when she straightens or is destroyed,
  every seduction token comes off.

Written (operation 2026-11-10T211239 play-actions): 55 cards; read back, all match.

Second batch (rows L15–L27): ootv-play [#289](https://github.com/Oracle-of-the-Void/ootv-play/pull/289),
[#290](https://github.com/Oracle-of-the-Void/ootv-play/pull/290), [#292](https://github.com/Oracle-of-the-Void/ootv-play/pull/292); `l5r/play` version 79.

- **Turning cards over** is `flip` (`true`, `'down'`, or `{pile}` for the top cards of a deck: Unexpected Allies);
  `turns` stays a count of turns.
- **Searching a deck**: `search: {from: 'fate', draw: 1}`.
- **One `if`**: an entry in an action's effects that is only an `if` is checked before costs are paid
  (`{if: {turn: 'theirs'}}`: Threat of War); an `if` on an effect skips just that effect. Its situation words are
  `turn`, `capable`, `hand`, `phase`, `counters`, `token`, `self` (`{not: ...}` for one it must not meet; `notself` until
  2026-11-11), `battle`, `target`; anything else is a match
  on the card. `while` is only ever "for as long as".
- `max` (was `cap`), `gold: {add, match}` (was `goldplus`), `remove: {trait}` and `remove: {gained}` (were `untrait`,
  `ungain`), a bonus's `if: {duel: true}` and `if: {casting}`.
- **Players by rank**: `to: 'player', player: {highest | lowest: 'honor'}` (Breach of Etiquette, Evil Feeds Upon Itself).
- **Controller, not owner** (the user: "owner = person whose deck the card came from. controller = person who has the
  card on their side right now"): Shame and Imperial Levying say `controller`.
- **"No X" rules are `prevents`**: Doji Yosai `{action: 'gift', on: 'self'}`; The Hidden Temples of the Naga and The
  Ruined Fortress of the Scorpion `{action: 'win', by: 'honor'}`; Deadly Ground `{action: ['open', 'battle'], where:
  'battle', unless: {destroy: 'terrain'}}`; Climbing Gear `{action: 'effects', who: {keywords: ['Fortification']},
  where: 'battle', if: {attacking: true}}`.
- **Phases ticking over** are said alike: a trigger `at: {start: 'Dynasty'}` (was the bare phase name, for every
  phase), a Reaction's `after: {end: 'Dynasty'}` (Twist of Fate; was `dynastyend`). "During your Dynasty Phase" is an
  `if: {phase}` (Forgotten Tomb).

Written (operation 2026-11-10T215448 play-actions): 46 cards; read back, all match.

Rows L18 and L28: ootv-play [#293](https://github.com/Oracle-of-the-Void/ootv-play/pull/293),
[#294](https://github.com/Oracle-of-the-Void/ootv-play/pull/294); `l5r/play` version 80.

- **Free actions** (the user: "freeaction:count", with traits that limit the action): `freeaction: {count, timing?,
  prevents?}`. Kitsu Motso `{count: 2}` (two actions in a row before the next player; was `again`); Twist of Fate
  `{count: 1, timing: ['Limited', 'Open'], prevents: ['attach', 'lobby']}` (one Limited or Open action now; no
  attaching or lobbying while it is open, where before it was for the whole turn; was `window`).
- **Bowing** (the user: "it should come along with the type of card, if it produces gold, honor or whatnot"): one word,
  `after: {bowed: match, by: 'other', produces: counter}`. Kolat Infiltrator `{bowed: {type: 'Holding'}}`, Shosuro
  Taberu `{bowed: {type: 'Holding'}, by: 'other', produces: 'honor'}` (were `holdingbowed`, `holdinghonor`).

Written (operation 2026-11-10T223511 play-actions): 4 cards; read back, all match.

### Negate vs prevents (2026-11-11)

Review L30 (the user, 2026-11-10). ootv-play [#312](https://github.com/Oracle-of-the-Void/ootv-play/pull/312);
`l5r/play` version 85; 35 cards rewritten.

- **`negate`**: the event happens (costs paid, cards discarded, the phase straightens, a destroy goes off) and does
  nothing to the card. Printed "negate", "cancel", "prevent the effects", "immune", "cannot straighten" are all negates.
  **`prevents`**: it can't even be attempted (attaching, challenging, attacking, Seppuku, an Honor Victory).
- The negate actions are config `negates`: straighten, destroy, move, rehonor, effects, fear, written `negate:
  {action, ...}` (Togashi Mitsu, The Jade Hand, Climbing Gear, Qamar, Kolat Servant's "may remain bowed" with
  `optional: true`). Under `prevents` they are not read.
- A Reaction negating the action it answers: effect `negate {keywords, type, targeting, kinds, token, by}` (`cancel`
  until now: Investigation, Elemental Ward, Mamoru, The Code of Bushido). Avoid Fate is a prevents: the Event doesn't
  happen, `prevents: 'revealing'`, with `instead: [insert, refill, shuffle]` (above).
- A trigger that replaces what would happen names it and lists what happens instead: `negate: 'straighten', instead:
  [effects]` (Togashi Mitsu, Bayushi Kachiko, Imperial Quest); Goblin Warmonger at the new moment `destroying`, `negate:
  'destroy', instead: [the rest of his unit destroyed, he bows]`, `if: {unit: {match: Goblin Follower, min: 1}}`.

### Generalization review (2026-11-11)

The rules drawn from the one-off review, applied to the words still used by only a few cards (the user: "proceed on
each"). ootv-play [#308](https://github.com/Oracle-of-the-Void/ootv-play/pull/308),
[#309](https://github.com/Oracle-of-the-Void/ootv-play/pull/309); `l5r/play` version 83.

- **"May not" is `prevents`.** Fear: `{action: 'fear', on: 'unit', match}` (Mirumoto Hitomi, the Ancient Spear of the
  Naga, Qamar: Followers; Matsu Chokoku, every card in the unit), `{action: 'fear', on: 'yours', match}` (The Hidden
  Temples of the Naga). An Event's rule for a while: `prevents {action: 'attack'}` (Emperor's Peace), `'proclaim'`
  (Proposal of Peace; the Sacred Temple of the Phoenix's `then`), `{action: 'phase', phase: 'Dynasty'}` (Emergence of
  the Tortoise). Oni no Kamu's Stronghold: `{action: ['straighten', 'effects'], while: 'there'}`. Mists of Illusion:
  `{action: 'destroy', where: 'battle', by: 'resolution'}`. The Armor of the Golden Samurai: `{action: 'focus', side:
  'other', from: 'hand', match: {focus: {max: {of: 'host', field: 'ph', plus: -1}}}}`.
- **Waived costs** sit together: `free: {gold: match}` (Bloom of the White Orchid), `free: {bow: match}` (Celestial
  Alignment).
- **Limits are `min` / `max`** with `{of, field, plus}`: Foxwife's bonus `{min: {ph: 5}, to: 'host'}`, Test of Honor
  `{min: {of: 'target', field: 'ph', plus: 1}}`, Kolat Oyabun `{of: 'self', field: 'ph', plus: 1}`, Ring of Fire
  `induel: {chi: {max: {of: 'duelist', other: true}}}` (now equal Chi counts too, as printed). Temple of Bishamon's
  requirement is its own Honor Requirement field (`play.fields.Imperial.honor: 5`).
- **Arithmetic** is `add`, `times`, `plus`, `div`: the battle award `{add: 8}` (Refuse Advantage) and `{times: 2}`
  (Legendary Victory); a cost `{cost: {add: -2, min?}}` (Hida Tsuru, Otaku Kamoko, Ratling Scavenger "to a minimum of
  1"); an Event's `cost: {add: -n, match}` (Alliance, Festering Pit of Fu Leng); `times: {force: 2, chi: 2}` (Immortal
  Steel); `{of: 'x', div: 2}` (Geisha Assassin); `{of: 'lost', plus: -1}` (Master of the Tea Ceremony, the Samurai
  trait's seppuku); the modifiers `gold: {add: -1, match}` (Corrupted Iron Mine) and `ranged: {times: 2, whose:
  'defender'}` (Barbican); Feint's focus `{add: 1}`.
- **Destroyed** (the user's word): `destroyed: {by: ['battle', 'duel']}` (Utter Defeat's target, Mountain Goblin's
  `if`), `destroyed: {match}` (Be Prepared to Dig Two Graves; Ikoma Ujiaki's `after: {battle: {destroyed: {match}}}`).
- **Face**: `face: 'down'` (Call Upon The Wind's target), `duelset: {focus: {face: 'up', side: 'other'}}` (Dark Oracle
  of Fire).
- **Until a phase**: `until: {start: 'Straighten'}` (Forced March, Summon Faeries), `{start: 'Events'}` (Dead Walk The
  Earth).
- **Moves**: `move: 'home'`, with `bowed: true` for the whole unit bowed (Block Supply Lines, Miya Yoto, Retreat;
  Kakita Yuri, Nageteppo unbowed; the Imperial Favor's Battle use); `put: 'under', face: 'down' | 'up'` (The Armor of
  Sun Tao, Forgotten Tomb); `bring: {control: 'owner'}` (Rise of the Phoenix); a battle `role: 'attacker'` (Tsuburu no
  Oni).
- Kept as they are: `overlay`, `keep`, `hidden`, `fought`, `attacked`, `recent`, the seat words, `mustattack`,
  `honorwaive`, `phasedraw`, Hida Amoro's `morethan` ("more than twice").

Written (operation 2026-11-11T010823 play-actions): 52 cards; read back, all match.

## Held rules: negate and prevents, not hooks (2026-11-10, l5r/play version 87)

An Event's rule for a while (`lasting`) now keeps `negate` and `prevents` as the cards write them, the same words as
everywhere else, instead of turning them into the config hooks `noattack`, `skip`, `nohonor` and `negate` (removed from
`lastinghooks`). ootv-play [#317](https://github.com/Oracle-of-the-Void/ootv-play/pull/317); no card changed.

- `prevents` with `who`: the cards in play that fit may not (as before). With no `who`: no player may: `attack`
  (Emperor's Peace), `{action: 'phase', phase: 'Dynasty'}` (Emergence of the Tortoise), `proclaim` (Proposal of
  Peace), and now any other player action (lobby, attach, a card action's name).
- `negate`: a match, those cards' actions and what they did are negated (Solar Eclipse), or `{action, who}` for a
  negate action (Peasant Revolt's straighten: the cards straighten in their phase and stay bowed; no longer kept as a
  `prevents`).
- New config `preventwords`: the words for a `prevents` on every player (L5R: "no attacks", "no {phase} Phases", "no
  Honor for bringing Personalities into play"; otherwise "no player may ...").

## Printed negate and prevents with instead (2026-11-11, l5r/play version 88)

A card's own `negate` or `prevents` entry may carry `instead: [effects]`: what happens in its place. Three one-card
modifiers became these general words (ootv-play [#319](https://github.com/Oracle-of-the-Void/ootv-play/pull/319)):

| Card | Code | Was |
|---|---|---|
| Ring of the Void | `negate {action: 'draw', by: 'phase', if: {hand: 'empty'}, instead: [{draw: 5}]}`: with an empty hand its player's End Phase draw is replaced by five | `phasedraw` |
| Entrapping Terrain | `negate {action: 'resolve', instead: [{endbattle: {bowed: false}}]}`: the battle doesn't resolve; it ends and every unit goes home unbowed | `calloff` |
| The Ruined Fortress of the Scorpion | `prevents {action: 'lose', by: 'dishonor', instead: [{lasting: {basestrength: {players: 'you'}}, until: 'ever'}]}` (beside `prevents {action: 'win', by: 'honor'}`): not out at -20 Honor; the first time, their unadjusted Province Strengths are zero for the rest of the game, shown as a held rule in their Active area | `ruin` |

Config `negates` gains `draw` (a phase's draw) and `resolve` (a battle's resolution); `endbattle` takes `{bowed: false}`;
a held `basestrength` takes `players: 'you'`. Written (operation 2026-11-11T034919-play-actions): 3 cards; read back,
all match. `l5r/fields` version 77.

## Held rules in the general words (2026-11-11, l5r/play version 89)

The last per-hook names of an Event's rule for a while are gone: config `lastinghooks` is removed, and a held rule is
written only in the general words (ootv-play [#321](https://github.com/Oracle-of-the-Void/ootv-play/pull/321)):

| Card | Held rule | Was |
|---|---|---|
| Bloom of the White Orchid | `cost {gold: 0, match: {type: [Spell]}}` | `free {gold: match}` |
| Celestial Alignment | `cost {bow: false, once: true, match: {keywords: [Shugenja]}}` | `free {bow: match}` |
| Alliance, Festering Pit of Fu Leng | `cost {add: -n, match}` (unchanged) | |
| Dead Walk The Earth | `add {force: 4}, match` | `force: 4` |
| Glimpse of the Unicorn | `draw {by: 'phase', add: 1}` | `draw: 1` |

New config `costwords` words a held `cost` (like `preventwords` for a held `prevents`). `afters.enddraw` is removed (no
card used it). Written (operation 2026-11-11T042533-play-actions): 4 cards; read back, all match. `l5r/fields` version 78.

## Province Strength as an area property (2026-11-11, l5r/play version 90)

A Province is an area on the table, and Strength is a property the L5R rules give it; the play engine no longer builds
it in (ootv-play [#323](https://github.com/Oracle-of-the-Void/ootv-play/pull/323)). In `l5r/play`, the Province zone
has `kind: "province"` (the word card codes name it by) and `props.strength`: name Strength, short Str, never below
0, the one a battle weighs, made of the Stronghold's `strength` field and the attached cards' `strength` fields, plus
what effects add. The top-level `strength` key is removed.

Card codes change Strength like a stat:

| Card | Now | Was |
|---|---|---|
| Alhundro Cornejo, Castle of Water, Evil Ward, The War Fortress of the Crab | `add {strength: n}, to: 'target'` | `strength: n` |
| Dark Oracle of Earth, Isawa Tadaka, The Mountain Keep of the Dragon | `add {strength: n}, to: 'province', which: 'yours'` | `strength: n` |
| Ring of Earth, Unscalable Walls (bonus) | `add {strength: n}, to: 'province'` | `strength: n` |
| Doom of the Scorpion | `lasting {base: {strength: 0}, players: {clan: [Scorpion]}}` | `basestrength {players}` |
| The Ruined Fortress of the Scorpion | `lasting {base: {strength: 0}, players: 'you'}` | `basestrength {players: 'you'}` |

Written (operation 2026-11-11T050027-play-actions): 11 cards; read back, all match. `l5r/fields` version 79.

## The battle rule from config (2026-11-11, l5r/play version 91)

How a battle resolves is now in `l5r/play` rather than the play engine (ootv-play
[#324](https://github.com/Oracle-of-the-Void/ootv-play/pull/324)). The Attack phase's `attack.outcome`, next to
`attack.honor`, is `{"tie": "both", "falls": {"attack": {"over": ["defend", "strength"]}}}`:

- The army with more Force wins and destroys the other army (the engine's own rule).
- `tie: "both"`: equal Force, with units on both sides, destroys both armies.
- `falls`: the Province is destroyed when the winning attackers' Force is more than the defenders' Force plus its
  Strength.

The game plays the same as before; no cards changed.

## Province checks by area kind (2026-11-11, l5r/play version 92)

The play table now finds a Province by its area's `kind` everywhere (ootv-play
[#325](https://github.com/Oracle-of-the-Void/ootv-play/pull/325)), instead of by the zone setting `destroyto`, which
now only says an area can be destroyed and where its cards go. In `l5r/play`, `victory.provinces: true` became
`victory.fallen: "province"` (a player is out when none of their Provinces stands; still named Military by
`names.fallen`). Card words: `look: 'province'` (was `'provinces'`; Ninja Spy, written in operation
2026-11-11T052317-play-actions, read back matching). `l5r/fields` version 80.

## Scenes: the battle's and the attack's ends (2026-11-11, l5r/play version 93)

The first step of moving the battle out of the play engine (ootv-play
[#327](https://github.com/Oracle-of-the-Void/ootv-play/pull/327)). `l5r/play` has `scenes`: `battle` (fought at
one area; when it ends, the attackers bow and go home) and `attack` (when it ends, the units still out go home, the
attackers bowed). What happens at those ends is written in the same effect words as cards
(`{"move": "home", "bowed": true, "to": "scene", "whose": "attacker"}`). A change made for a while can now last
"until the end of the attack" as well as the battle or the turn. No cards changed.

## Steps under scenes (2026-11-11, l5r/play version 94)

The second step (ootv-play [#328](https://github.com/Oracle-of-the-Void/ootv-play/pull/328)). The attack's steps and
each battle's steps moved from the Attack phase (`phases[3].attack.segments`, `battlefields`, `battle`) into
`scenes.attack.steps` and `scenes.battle.steps`. The attack's last step, Battles, says where its battles are fought
and who picks: `{"name": "Battles", "each": {"$area": "provinces"}, "pick": "attacker", "scene": "battle"}`. The
phase keeps `attack {scene, commit, honor, outcome}`. The arcs that change these steps (Samurai, Emperor, Ivory, Three
Dynasties) now patch `scenes.attack.steps` and `scenes.battle.steps` by step name; every arc's steps were checked to
be the same as before. Nothing changes in play, and no cards changed.

## The main scene (2026-11-11, l5r/play version 95)

The fourth step (ootv-play [#330](https://github.com/Oracle-of-the-Void/ootv-play/pull/330)). The game itself is now a
scene, `scenes.main`, open for the whole game. Its steps run in order as a game is made: Setup (`setup`: the shuffles
and deals, for each player), First player (`first: {"counter": "honor"}`), then Turns (`{"scene": "turn"}`), which
opens the turn scene one turn after another. The turn scene's steps, `scenes.turn.steps`, are the phases. So the
top-level `setup`, `firstplayer` and `phases` are gone from `l5r/play`; Hearts and Cribbage moved the same way
(Cribbage's cut for the first dealer is its First dealer step). The arcs that changed them now patch
`scenes.main.steps` (Celestial and Emperor: 6 cards in the hand) and `scenes.turn.steps` (Samurai, Emperor, Ivory,
Three Dynasties) by name; every arc was checked to be the same as before. Nothing changes in play, and no cards
changed.

## Groups, sides and totals (2026-11-11, l5r/play version 96)

The battle plan's second step (ootv-play [#331](https://github.com/Oracle-of-the-Void/ootv-play/pull/331)). What a
unit is and how an army's Force adds up are now in `l5r/play`, not in the table's code:

- `groups.unit` `{"of": "attached"}`: a unit is a card and everything attached to it.
- `totals.force`: the Force an army adds up. Face-down and bowed cards add nothing (`skip`); a bowed Personality makes
  its whole unit add nothing (`zero`; a unit with no Personality, Final Charge's Followers, only loses its bowed cards);
  each card adds at least 0, a side with no units has 0. The Attack phase's `attack.total` names it.
- `scenes.attack.sides`: the attacker's side and the defender's side. In a game of three or more, a player on neither
  side may join one before the battles begin (a button on the phase box), and assigns units in that side's turn.
  Before this, every player but the attacker counted as defending, and only the attacker and the defender assigned.

Nothing else changes in play, and no cards changed.

## Resolution as rules, allies (2026-11-11, l5r/play version 97)

The battle plan's third step (ootv-play [#332](https://github.com/Oracle-of-the-Void/ootv-play/pull/332)). How a
battle resolves is now a list of rules in `l5r/play` (the Attack phase's `attack.resolve`), not the table's code. Each
rule whose condition holds runs:

- more Force, with units on both sides: that side wins and destroys the other army, 2 Honor a card destroyed;
- equal Force, with units on both sides: both armies are destroyed, 1 Honor a card to each;
- the attackers' Force more than the defenders' plus the Province's Strength: the Province falls.

**A change in play:** an army with nobody against it no longer wins (SCC p. 40: "the battle is not considered a
victory"). It destroys nothing and gains no Honor, but the Province still falls if its Force is more than the Strength.
The table used to make an unopposed attacker the winner, so Reactions that need a win (Brilliant Victory, Mercy) could
be played after one.

**Allies** (SCC pp. 35-37), in games of three or more: at the Declaration the Attacker and the Defender may ask the
other players to join them (Ask buttons on the phase box). Only a player who was asked may join, never both sides, and
an ally gains 2 Honor once, when it first assigns a unit. The Honor for cards destroyed still goes to the Attacker or
Defender. Players on neither side are the `other` side, whose units go home as the attack ends. Not yet: allies
assigning in seat order after their side's player (plan step 6). `attack.honor` and `attack.outcome` are gone; no
cards changed.

## Area modifiers (2026-11-11, l5r/play version 98)

The battle plan's fourth step (ootv-play [#333](https://github.com/Oracle-of-the-Void/ootv-play/pull/333)). What a
Terrain is moved from the table's code into `l5r/play`, as an area card kind: `areacards.terrain` `{name: Terrain,
match: {keywords: Terrain}, scene: battle, limit: 1, full: refuse, takes: {step: "Battle actions"}, end: [{discard:
true}]}`. It reads: a hand card with the Terrain keyword is played onto the battlefield being fought; one there at a
time, a second refused (SCC pp. 39, 48); it takes effect as the Battle actions end; it is discarded as the battle ends.
A game can have more than one kind (`full: replace` would destroy the oldest instead of refusing). The top-level
`terrain {keyword}` is gone, and the after gate on Ring of Water's kind of card is now `terrain: [destroyed,
played]`. Cards' words (`destroy: terrain`, Go Master's `terrain: target`) read the same. Nothing changes in play,
and no cards changed.

## Ranged Attacks and Fear (2026-11-11, l5r/play version 99)

The battle plan's fifth step (ootv-play [#334](https://github.com/Oracle-of-the-Void/ootv-play/pull/334)). What a
Ranged Attack and Fear do is now in `l5r/play` (`effectkinds`), written as steps cards use, not the table's code:

- `ranged` (Ranged Attack, SCC p. 55): at an opposing Personality without Followers attached, or a Follower; the target
  is destroyed if its Force is no more than the strength; cards of one unit may combine theirs.
- `fear` (Fear, SCC p. 57): at an opposing unit; its unbowed Followers with Force no more than the strength bow; once a
  battle for each card.

Cards keep their words (`{ranged: 3}`, `{fear: 2}`, a strength from a Chi): the card says how strong, the rulebook says
what it does, so no cards changed. `battleeffects` and `combine` are gone. Log lines now read "Ranged Attack 3 at X
(Force 4): not enough". One small fix: a Force bonus that counts only when attacking (or defending) now counts only on
that side when a card's Force is checked during a battle.

## Maneuvers: whose turn it is to assign, allies (2026-11-11, l5r/play version 100)

The battle plan's sixth step (ootv-play [#335](https://github.com/Oracle-of-the-Void/ootv-play/pull/335)). Who assigns
units when in the Infantry and Cavalry Maneuvers is now in `l5r/play` (the attack scene's `assign.order`), following
the book (SCC pp. 36-37):

- the Attacker; then each player asked to join the attack, one turn each, starting on the Attacker's left, sending units
  or passing (sending a unit joins the attack); then the Defender; then each player asked to join the defense, also
  from the Attacker's left ("follows the same procedure").
- The phase button names whose turn it is ("Player C passes" for an ally who has sent nothing). Before, an ally
  assigned during its side's player's turn.
- Ring of Water still has the Defender's side, its allies too, assign first.

The Cavalry rule moved onto the Cavalry Maneuvers step (`units`: every Personality and Follower of the unit has
Cavalry); `commit` keeps "led by an unbowed Personality". Cavalry may still go in the Infantry Maneuvers, as before. The
Battles step names whose Provinces are fought at (`whose: defender`). With three or more players on one screen, Play as
now goes round every seat.

## Ambush and side names (2026-11-11, l5r/play version 101)

The battle plan's last step (ootv-play [#336](https://github.com/Oracle-of-the-Void/ootv-play/pull/336)). What an
Ambush is now sits in `l5r/play` (`madebattle`) rather than the table's code. It opens the attack's battles on an area
made in the defender's row, between the owners of the two units picked. Nobody else joins and no unit moves in or out.
It is one battle, and then play goes back to the next player. The card keeps `{ambush: true}`. The log now reads
"Ninja Spy's unit against Doji Hoturi's unit at Player B's Ambush: a battle of their own that no other unit joins".

Each side of an attack now also names its card word in `l5r/play` (`as`: attacking, defending), and the table finds
sides only through those words. A game with differently named sides needs no code change. Nothing changes in play.

## Battle actions (2026-11-11, l5r/play version 102)

Step 8 of the battle plan (ootv-play [#337](https://github.com/Oracle-of-the-Void/ootv-play/pull/337)). When each
kind of action may be played is now named by the part of the game it belongs to. In `l5r/play` `timing`, a window is
a scene and a step: Limited is `{scene: turn, step: Action, own: true}`, Open is that without `own` plus
`{scene: battle, step: Battle actions, unit: true, there: true}`, and Battle is the battle one alone. A window is open
while the innermost part of the game being played is at that step, so an Ambush, a battle in the Action Phase, still
takes Battle and Open actions but not Limited ones. `unit` (was `inbattle`) lets only a player with a unit in that
battle take them; `there` (was `atbattle`) is the rulebook's list of what such an action must come from or aim at
(SCC p. 39). The old words still work.

The table also keeps an attack's players and the battle just fought under the words `l5r/play` gives its sides
(`attacker`, `defender`) instead of names of its own, and the Resolution panel's rows ("Attacking Force", "Defending
Force") come from the sides' words. Nothing changes in play, and no card changed. Scout is unchanged for now.

## Scout as its own card rule (2026-11-11, l5r/play version 103)

Step 9 of the battle plan (ootv-play [#338](https://github.com/Oracle-of-the-Void/ootv-play/pull/338)). Scout no
longer depends on a rule of the table's own (`scout` is gone from `l5r/play`). The card carries its rule: as a battle's
Battle actions begin with a Scout in the attacking army, the Attacker (also when an ally sent the Scout) gets one free
Battle action, a Terrain only, before the Defender's first action. Nobody else acts until the Attacker uses or passes it
(the Pass button). It is built from general words any card can use: the trigger moment `stepstart` (new in
`l5r/play` `moments`) and a free action's `to`, `only` and `first`.

Scout (6505) was rewritten on 2026-11-11 (ootv-backups operation 2026-11-11T152250-play-actions): its play code, and
the printed text on its Imperial, Emerald, Battle of Beiden Pass, Jade and Pearl printings, read from the scans.

## The battle's last L5R words (2026-11-11, l5r/play version 104)

Step 10 of the battle plan (ootv-play [#339](https://github.com/Oracle-of-the-Void/ootv-play/pull/339)): the words the
engine still had of its own, now from `l5r/play`. No card changed.

- `stat` (new, `"chi"`): the stat a card's play code means when it names none (a Ranged Attack or a count read from a
  card with no `field`). Where the code reads an army's or a unit's number, the default is the battle's own total
  (`totals`, Force).
- `watches.over.when` is now `{"more": ["attack", "strength"]}`: "the attacking army's Force was above the Province
  Strength", written with the same names as the battle's resolution rules. Cards still say `"over": true`. Card code
  may use `"more": [a, b]` in a battle condition too.
- `scenes.turn.stepword` `"Phase"`, `scenes.attack.stepword` and `scenes.battle.stepword` `"segment"`: the words the
  table's messages put after a step's name ("your Action Phase", "the Battle actions segment").
- Messages name the step and the area rather than "Cavalry" or "the Province".

The `l5r/fields` description of `play` (version 82) says the same.

## Lobbying as a scene (2026-11-11, l5r/play version 105)

Step 1 of the lobbying plan (ootv-play [#340](https://github.com/Oracle-of-the-Void/ootv-play/pull/340)): a lobbying
effort for the Imperial Favor is now a scene from `l5r/play`, like an attack. No card changed.

- `scenes.lobby` (new): the effort. Its sides are `for` (seat word `lobbier`) and `against` (seat word `opponent`).
  `against.pick` says who the lobbier lobbies against: whoever holds the Favor (`{"holds": "favor"}`), else the other
  players with the most Family Honor (`{"most": "honor"}`). On a tie that is every tied player, and the lobbier must
  beat each of them.
- Its steps: `Lobbying` (`"turns": "lobbier"`: each player in turn from the lobbier until everyone passes in a row, the
  same turns as the battle actions) and `Count` (`"resolve": true`: the totals, changes by hand, then Resolve).
- `tokens[0].lobby.scene` (new, `"lobby"`): the Favor's Lobby action opens that scene. The other `lobby` words are as
  before.
- No `timing` window names the lobby scene, so only Reactions can be played while it's open.

## Lobbying's moves and total (2026-11-11, l5r/play version 106, l5r/fields version 83)

Step 2 of the lobbying plan (ootv-play [#341](https://github.com/Oracle-of-the-Void/ootv-play/pull/341)). No card
changed.

- `scenes.lobby.steps[0].moves` (new): what a player may do on their turn in the effort besides passing. `speak`
  (Send a speaker: bow a Personality of yours; its Personal Honor counts) and `gift` (Give a gift: a card from your
  hand to the discard pile; its Focus Value counts; `"once": "scene"`, one a player an effort). Each is shaped like the
  Favor's uses (`targets`, `effects`).
- New effect word: `{"record": "target", "field": ...}` (the move's target counts for its side, by that field). The
  gift discards with `{"discard": true, "to": "target"}`.
- `discard` works from anywhere (ootv-play [#342](https://github.com/Oracle-of-the-Void/ootv-play/pull/342), the user:
  "Discard should be able to work from anywhere"; `l5r/play` 107, `l5r/fields` 84): `{"discard": true}` on a card
  target sends it to its owner's discard pile from the hand, a pile or play (what's attached goes with it; discarded,
  not destroyed, so not Honorable Dead); on a Province target, the card in it, as before. The card editor's `play`
  description says so.
- `totals.lobby` (new) and `scenes.lobby.total` `"lobby"`: a side's Family Honor plus its recorded cards' fields; a
  dishonored speaker counts none, no card less than 0.
- `tokens[0].lobby` loses `counter` and `gift` (now the total and the gift move).
- Rules change: any Personality of yours may speak, whatever its Personal Honor (the rulebook doesn't limit it). The
  Personality bowed to lobby still needs Personal Honor above zero.

## Lobbying's take and count as rules (2026-11-11, l5r/play version 108)

Step 3 of the lobbying plan (ootv-play [#343](https://github.com/Oracle-of-the-Void/ootv-play/pull/343)). No card
changed, no rule changed: the same take and count, now in the config.

- `scenes.lobby.open` (new): rules checked as the effort opens, once its sides are seated. One holds: its effects run
  and the effort ends at once. L5R: nobody holds the Favor (`"free": "favor"`) and the lobbier is ahead of the side
  against (the other players with the most Family Honor): the lobbier takes it (`{"take": "favor"}`).
- `scenes.lobby.steps[1].resolve` (the Count) is now a list of the same rules in place of `true`: the lobbier ahead
  takes the Favor; no rule holds, it stays where it was. The rules are the battle's `{if, win, effects}`; a side's name
  stands for its lobbying total (against several tied players, the highest of them).
- The Resolve lobbying button sends the battle's `resolve` action (`lobbyresult` still works). The log reads
  "Count: Player A 7, Player B 5." then "The lobbying effort: Player A takes the Imperial Favor from Player B.", or
  "Nothing changes: the Imperial Favor stays with Player B."

## Lobbying's card words and panel (2026-11-11, l5r/play version 109, l5r/fields version 85)

Step 4 of the lobbying plan, the last (ootv-play [#344](https://github.com/Oracle-of-the-Void/ootv-play/pull/344)).
No rule changed.

- `afters.lobbying` is `{"scene": "lobby"}`: a Reaction with `after: "lobbying"` may be played while the lobbying
  effort is open (any scene can be named this way).
- One card changed: Winning Kachiko's Favor's `{"lobbyadd": {"of": "x"}, "to": "you"}` is now
  `{"add": {"lobby": {"of": "x"}}, "to": "you"}` (`add` with the name of a total a scene counts by). The card editor's
  `play` description says so. The old word still works.
- Twist of Fate's `"prevents": ["attach", "lobby"]` and Doji Yosai's `{"action": "gift", "on": "self"}` are unchanged:
  `lobby` is the id of the scene the lobbying action opens, `gift` the id of the move.
- The lobbying panel's words come from the config: "Lobbying effort for the Imperial Favor: Player A lobbying, Player
  B opposing", a button per move (Send a speaker, Give a gift), Pass, and the count button named by its step (Count).

## The duel as a scene (2026-11-11, l5r/play version 110)

Step 1 of the duel plan (ootv-play [#345](https://github.com/Oracle-of-the-Void/ootv-play/pull/345)). No card
changed, no rule changed.

- `duel.scene` (new) `"challenge"`: the scene a duel card or Create challenge opens.
- `scenes.challenge` (new): sides `challenger` and `challenged`, one step, Answer, where the challenged player accepts
  or refuses (`"answer": "challenged"`); accepted, the duel opens (`"accept": "duel"`).
- `scenes.duel` (new): the same sides; steps Focus and Strike (`"resolve": true`, the count).
- While a challenge or a duel is on, only Reactions may be played ("finish the duel first"), Undo takes the whole duel
  back, and "until the end of the duel" starts at acceptance. Focusing, striking, the totals and who wins work as
  before (later steps move them into the config).

## The duel's total, rules and outcome (2026-11-11, l5r/play version 111)

Step 2 of the duel plan (ootv-play [#346](https://github.com/Oracle-of-the-Void/ootv-play/pull/346)). No card changed.

- `totals.duel` (new): a duelist's total. Its Chi as a whole (`field`), plus its focus cards' Focus Values
  (`focus.field`, named `focus.name`), doubled for a duelist with Double Chi (`focus.double`), plus what the players
  added by hand, never below 0 (`least`). `scenes.duel.total` names it. A card's duel terms still change it for one
  duel (Test of Might's Force, Geisha Assassin's and Personal Champion's set Chi, Ratling Thief's +3).
- Gone from `duel`: `stat`, `focus`, `focusname`, `double` (moved into `totals.duel`).
- `scenes.duel` Strike step, `resolve` (was `true`): three rules. The challenger higher wins and the challenged loses;
  the challenged higher wins; a tie, both lose. A focus card that sets the result (Kharmic Strike, Another Time,
  Bloodsword) still decides over them.
- `scenes.duel.outcome` (new): `lose`, the loser is destroyed; `win`, nothing. A card's terms change this for its
  duel: the loser bowed (Test of Might), dishonored (Test of Stone), or losing Honor and choosing (Duel of Personal
  Honor); the winner's player gains Honor (Iaijutsu Duel); a side that can't be destroyed (`safe`).
- `duel.choices`: Seppuku and Be dishonored now carry `effects` (a destroy; set dishonored) instead of `destroy` and
  `state`.
- `gains` (new), `gains.honor.instead` (Scorpion Clan Coup p. 52, "Removing the Stain of Dishonor"): when one or more
  dishonored Personalities are involved in a Family Honor gain, they are restored to honor instead and the player
  gains nothing. In a duel: the winning duelist. In a battle (rule change, the user 2026-11-11): the Personalities in
  the gaining player's army as it stood at the resolution; a destroyed one brings nothing and isn't restored. Other
  players in the same battle gain as usual.

## Focus and strike as the duel's moves (2026-11-11, l5r/play version 112)

Step 3 of the duel plan (ootv-play [#347](https://github.com/Oracle-of-the-Void/ootv-play/pull/347)). No card changed,
no rule changed.

- `scenes.duel` Focus step: `turns` `"challenged"` (the challenged player starts); `first` (who starts instead, when it
  holds): the challenger, when its Personality's unit carries `strikefirst` (Tetsubo).
- Its `moves`, one a turn: Focus (a Fate card from the hand, `back`, put face down in the active area and recorded as
  the side's focus card) and Strike (`ends`: the step ends). A Personality that may not focus has only Strike; so does
  a player with no Fate card in hand.
- The Strike step: `start` turns the focus cards up; `moment` `"strike"` is when Poison and Shosuro Hametsu act.
- Gone from `duel`: `to`, `back` (now the Focus move's).

## Duel card words and the Emerald Champion's series (2026-11-11, l5r/play version 113)

Step 4 of the duel plan (ootv-play [#348](https://github.com/Oracle-of-the-Void/ootv-play/pull/348)). No card changed,
no rule changed.

- The duel's two sides are the ones `scenes.duel.sides` names (challenger, challenged); card words that name a side use
  those names.
- `duel.stages` (new): when a duel card's moment word is open. `asked`: as a challenge is issued; `entering`: the duel
  begun, before the first focus; `focusing`: your turn to focus or strike; `strike`: the focus cards turned up, before
  the duel resolves; `won`: just after a duel your Personality won.
- `scenes.challenge` Answer step, `refuse` (new): the action a card can prevent ("may not refuse"). A card can also
  prevent `challenge` (the challenge scene) and `focus` (the Focus move).
- `duel.series` (new) `"champion"` and `scenes.champion` (new): Test of the Emerald Champion's challenges, one to each
  other player in turn from the Champion's player, none of which can be refused. The series ends when the Champion
  falls or every player has answered.

## One panel for duels and lobbying (2026-11-11, l5r/play version 113)

Step 5 of the duel plan, the last (ootv-play [#349](https://github.com/Oracle-of-the-Void/ootv-play/pull/349)). No
card changed, no rule changed, no config changed.

- Duels and lobbying efforts now use the same panel over the table. Its words come from config: the scene's name, each
  side's `as` word (challenger, challenged; lobbying, opposing), the step's name and its moves.
- The heading names the scene and each side, e.g. "Duel: Kakita Toshimoko (Player A) challenger, Doji Hoturi
  (Player B) challenged"; before an answer, "Challenge: … challenging, … challenged".
- A move that can't be made right now (a card's terms say that side can't focus; no cards in hand; a lobbying move
  already used) shows disabled, with the reason when you point at it.
- The duel's count button now reads "Resolve the duel". Before the duel, a card's optional focus (Matsu Hiroru) is
  skipped with Pass, as in lobbying.

## Games saved before 2026-11-11 no longer open as they were (2026-11-11, l5r/play version 113)

Step 1 of the generic-engine plan (ootv-play [#350](https://github.com/Oracle-of-the-Void/ootv-play/pull/350)). The play
table is still in development, so the table no longer converts games saved by older versions of it: an attack,
lobbying effort or duel saved in an old shape, a game from before the play areas lost their edges, or one with zones
the config has since dropped may not open correctly. Start such a game again. No card, rule or config changed: the
words a card's play code uses were checked, and no live card used any of the old ones that were removed.

## The table's words come from the game's config (2026-11-11, l5r/play version 114)

Step 2 of the generic-engine plan (ootv-play [#351](https://github.com/Oracle-of-the-Void/ootv-play/pull/351)). The
table's own code no longer spells out L5R's words: Gold, Honor, Personality, Fate deck, Province, Attacker and Defender,
Chi, Clan and Honor Requirement in its messages and questions now come from `l5r/play`. New there: `words` (`clan`,
`spells`), `honorreq.name` and `article`, a zone's plural (`zones[].many`: Provinces), the attack's side names, the
Clan allegiance question's `name` and `text` (its "2 more Gold" now reads the rule's own number), the Ivory question's
`lost.detail`, `customtokens.example` (the hint when naming a token) and `symbols` (the L5R Symbol font and its
classes, before in the table's style sheet). What players see reads the same, except that "it stays in the province"
is now "it stays in the Province".

## Buying and the Honor Requirement as general rules (2026-11-11, l5r/play version 115)

Step 4 of the generic-engine plan (ootv-play [#353](https://github.com/Oracle-of-the-Void/ootv-play/pull/353)). The
L5R buying rules in `l5r/play` are now written as general pieces, and play the same: the clan Personality price is a
cost change (`gold.buy.changes`, was `gold.clan`), the Honor Requirement is `requirement` (was `honorreq`) with Clan
allegiance and the Ivory rule as its `waivers`, the player's clan is what the Stronghold role `gives` (was
`gold.clan.from`), Unique is a `match` (`unique`), the Honorable and Dishonorable Dead are `deaths` (were
`honor.dead`), and a dishonored Personality's Personal Honor of 0 at most is the stat's `floor` (was
`honorreq.statefloor`). No card codes changed.

## The battle in the table's one panel (2026-11-11, l5r/play version 116)

Step 5 of the generic-engine plan (ootv-play [#354](https://github.com/Oracle-of-the-Void/ootv-play/pull/354)), the
last one. A battle at Resolution is now shown by the same panel as a duel or a lobbying effort: big in the middle of
the screen as before, with each army's Force and the Province's Strength, − and + for card effects, what they come to,
Resolve the battle, End without resolving (which still asks first) and Hide. New in `l5r/play`: `scenes.battle.panel`
(`"middle"`) and `scenes.battle.off` (the End without resolving button's words and its question). The Resolve button
now reads "Resolve the battle". No card codes changed.

## Card-state and move words (2026-11-11, l5r/play version 117)

Engine generic step 6 ([ootv-play #355](https://github.com/Oracle-of-the-Void/ootv-play/pull/355)): `cardstates[].isnot`
("unbowed", "honorable") joins `is`, and the table's sentences about bowing and dishonor ("goes home bowed", "none
unbowed", "bow your cards to produce", "is dishonored") take their words from `cardstates` instead of fixed English. The
duel's Focus and Strike moves carry `does` ("focuses", "strikes"), the log's verb for them.

## One total and one rule check for every scene (2026-11-11, l5r/play versions 118–119)

Engine generic step 7 ([ootv-play #356](https://github.com/Oracle-of-the-Void/ootv-play/pull/356),
[#357](https://github.com/Oracle-of-the-Void/ootv-play/pull/357), [#358](https://github.com/Oracle-of-the-Void/ootv-play/pull/358)):
the battle, the duel and lobbying stop having their own totals and rule checks.

- `totals.<name>` is one shape for all three: `group` + `field` (the Force of a side's units at the area), `field` on
  the side's own card (a duelist's Chi), `counter` (Family Honor), `recorded` (the cards a side recorded: focus cards,
  speakers, gifts; `{field, name, double}` for the duel, was `focus`), `least` per card, `min` for the whole (was the
  duel's `least`; `totals.force.min` added), `empty`.
- `scenes.battle.total: "force"` (version 118) and the battle's resolve rules on `scenes.battle` Resolution `resolve`
  (version 119): both were on the turn's Attack step (`attack.total`, `attack.resolve`), now removed there.
- The rules' conditions (`units`, `free`, `more`, `equal`) read the same way in every scene; an area property is named
  by its id (`strength`).

## Battle winnings and losers like the duel's (2026-11-11, l5r/play versions 120–121)

Engine generic step 8 ([ootv-play #359](https://github.com/Oracle-of-the-Void/ootv-play/pull/359),
[#360](https://github.com/Oracle-of-the-Void/ootv-play/pull/360)):

- `scenes.battle.award: "honor"`: the counter a battle's winnings are paid in (the engine no longer assumes Honor); an
  ally's payment is `scenes.attack.sides.<side>.join.award` (was `join.honor`).
- The battle's resolve rules name `win`, `lose` and `award` (per card destroyed), the duel's shape;
  `scenes.battle.outcome.lose: [{destroy: true, to: "loser"}]` says what losing does. The `{destroy: "army", of, honor}`
  effects are gone from the rules; the Province's `{destroy: "area"}` stays.

