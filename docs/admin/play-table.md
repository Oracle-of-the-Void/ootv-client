# Play table

Last updated: 2026-11-23 (more decisions-page changes, ootv-play [#760](https://github.com/Oracle-of-the-Void/ootv-play/pull/760) and [#762](https://github.com/Oracle-of-the-Void/ootv-play/pull/762) to [#766](https://github.com/Oracle-of-the-Void/ootv-play/pull/766), l5r/play versions 230 to 233, `l5r/fields` 160 to 165 (the `play` description says all of it). Config: version 230, `scenes.turn.says.passfree` ("Pass the free action ({card})"), the phase button while a free action holds the Events Phase ([#760](https://github.com/Oracle-of-the-Void/ootv-play/pull/760)); version 231, `costwords.actionfree`/`actionadd`/`actionraise` and `oneaction`, a held cost entry's action part in words ([#762](https://github.com/Oracle-of-the-Void/ootv-play/pull/762)); version 232, `terms.nosides`, the card word `noattack: owner` inside `control` ([#763](https://github.com/Oracle-of-the-Void/ootv-play/pull/763), [#764](https://github.com/Oracle-of-the-Void/ootv-play/pull/764)); version 233, the moment `leftplay` (`{left: pile}`: a card in play gone to a pile, any way) ([#766](https://github.com/Oracle-of-the-Void/ootv-play/pull/766)). Card words: `{resume: subject}` after `prevents: revealing`, the Event resolves after a free action ([#760](https://github.com/Oracle-of-the-Void/ootv-play/pull/760), The Time is Now); a held cost entry's `action: {keywords}`, the actions whose own cost it changes ([#762](https://github.com/Oracle-of-the-Void/ootv-play/pull/762), Chinoko); a control's `until` and `noattack`, an `until` list (whichever first), `until {start: turn, of: owner}` ([#763](https://github.com/Oracle-of-the-Void/ootv-play/pull/763), Akodo Kage); `{terrain: self}`, a card that places itself as the Terrain ([#765](https://github.com/Oracle-of-the-Void/ootv-play/pull/765), Mystical Terrain); a held bonus `to: {target: n}`, `opposed {of: own, card: {target: n}}`, a held `until {at, of: {target: n}}` ([#766](https://github.com/Oracle-of-the-Void/ootv-play/pull/766), Nemesis). Written cards: The Time is Now, Chinoko, Akodo Kage, Mystical Terrain, Nemesis.)

Before that: 2026-11-23 (the decisions-page changes, ootv-play [#745](https://github.com/Oracle-of-the-Void/ootv-play/pull/745) to [#759](https://github.com/Oracle-of-the-Void/ootv-play/pull/759), l5r/play versions 226 to 229, `l5r/fields` 159 (the `play` description says all of it); the "What's in it" table now lists every top-level key of the item. Config: version 226, `matching.names.not: "notnames"`, a card field naming what the card is not for the name rule (Mystical Terrain's `notnames: ["Terrain"]`, not yet written) ([#748](https://github.com/Oracle-of-the-Void/ootv-play/pull/748)); version 227, `control.attached: "host"`, an attached card (a token made on another player's Personality too) is controlled by its host's controller unless the move says `control` ([#750](https://github.com/Oracle-of-the-Void/ootv-play/pull/750)); version 228, `scenes.battle.local.areaown: true` with its message `areaownwhy`, a card attached to a Province acts only in the battle at that Province (Bridged Pass, Tunnel System) ([#754](https://github.com/Oracle-of-the-Void/ootv-play/pull/754)); version 229, the duel's Strike step also starts with `{"sceneset": {"faceup": ["challenger", "challenged"]}}`, so a focus added after the reveal counts (Yoshi) ([#758](https://github.com/Oracle-of-the-Void/ootv-play/pull/758)). Card words: a move's `"onto"` takes any who word (`"onto": "chosen"`) ([#745](https://github.com/Oracle-of-the-Void/ootv-play/pull/745)); `{"look": {"top": n | {"until": match}, "from", "reveal", "then"}}`, each card looked at goes to a place the card's code lists ([#746](https://github.com/Oracle-of-the-Void/ootv-play/pull/746)); a cost's `"bow"` takes a list, several cards bowed as one cost ([#747](https://github.com/Oracle-of-the-Void/ootv-play/pull/747)); the name rule reaches an `if`'s `has`, an `in`'s cards, an event's `by`, attach limits and timing windows ([#749](https://github.com/Oracle-of-the-Void/ootv-play/pull/749)); a held bonus `"to": "all"` with `"all": {"whose", "type"}` keeps the cards it picked, its `if` checked all along ([#751](https://github.com/Oracle-of-the-Void/ootv-play/pull/751)); `"moves": false` is gone ([#752](https://github.com/Oracle-of-the-Void/ootv-play/pull/752)); `"once": {"until": "lasting"}` counts a use only while the held rule it made still stands ([#753](https://github.com/Oracle-of-the-Void/ootv-play/pull/753)); an `if` key the table can't read refuses the action instead of being ignored ([#755](https://github.com/Oracle-of-the-Void/ootv-play/pull/755)); `{"if": {"player": {"lowest": <counter>}}}`, a tie counting as lowest ([#756](https://github.com/Oracle-of-the-Void/ootv-play/pull/756)); `{"choose": {"by": "player"}}`, the targeted player picks (Dark Lord's Favor) ([#757](https://github.com/Oracle-of-the-Void/ootv-play/pull/757)); `{"duelset": {"field": <stat>}}`, the duel compares that stat instead (Hida O-Ushi's duel of Force) ([#759](https://github.com/Oracle-of-the-Void/ootv-play/pull/759)). Cards written: Goblin Sneaks, Those Who Stand Alone, Dark Lord's Favor, Yoshi, Hida O-Ushi. Before that, use limits, ootv-play [#744](https://github.com/Oracle-of-the-Void/ootv-play/pull/744), `l5r/fields` 158, no l5r/play change: an effect's `"once"` is one shape, `{"per", "times", "until"}`: `"per"` what the count is kept for (`"action"`, `"card"`, `"title"`, `"target"`, `"player"`, or a list: Sunabe's each value once per Personality, `["action", "target"]`), `"times"` how many (a number, or an amount read as it is used: Essence of Water, as many times a battle as its Shugenja's Chi), `"until"` `"turn"`, `"ever"` or a scene; the written short forms (`"turn"`, `"battle"`, `"target"`, ...) work as before, an object form with no `"until"` is refused instead of ignored; the `play` description says so. Before that, moments, ootv-play [#743](https://github.com/Oracle-of-the-Void/ootv-play/pull/743), `l5r/fields` 157, no l5r/play change: a trigger's `"from": "discard"` now means "while the card lies in its discard pile", however it got there, so a card discarded from the hand hears its phase there (Shiryo no Shiba); `"dead"` still narrows it to the dead (Oni no Shikibu, Shiba Ujimitsu); a Reaction may answer a moment, `{"after": {"event": {"revealing": {"match": ...}}}}` as an Event is about to resolve (The Time is Now) or a moment the game names (`"destroyed"`); `"until"` takes a moment, `{"at": "straightened", "of": "target"}`; `"if"` reads `{"destroyed": false}` and `{"dead": true}`; the `play` description says so. Before that, one move, ootv-play [#742](https://github.com/Oracle-of-the-Void/ootv-play/pull/742), `l5r/fields` 156, no l5r/play change: switching two units' places counts as moving (the user's ruling), so a card that stops units moving into an attack stops a switch too (Ki-Rin), unless the move says `"moves": false`, not considered to be moving; a move to a pile takes `"at": "top"` or `"bottom"` for any card, not only an Event being cancelled (Ichiin: a card from the hand to the bottom of the Fate deck); sending a unit home with no battle going on moves nothing instead of being refused, and a `bow` with it still bows the unit (Mantle of Fire); the `play` description says so. Before that, one duration model, ootv-play [#741](https://github.com/Oracle-of-the-Void/ootv-play/pull/741), l5r/play version 225 (`until` is now one default per kind of lasting thing, `{"change": "turn", "gain": "ever", "held": "next"}`, the defaults the table used before, moved out of its code): every card `until` is read the same way, `"next"` (the beginning of its player's next turn) and `{"end": phase}` on any change too; a gained trait can last for the turn; an `until` the table can't read is refused instead of quietly becoming "the end of the turn"; `"while"` takes a condition read from the card it came from; `l5r/fields` 155: the `play` description says so. Before that, one cost model, ootv-play [#740](https://github.com/Oracle-of-the-Void/ootv-play/pull/740), l5r/play version 224 (`purchase.floor: 0`, `costwords.raise`): an Event's held cost change may raise a cost as well as lower it (The Price of War, `{"cost": {"add": 2}, "players": "each"}`; before, a raise was dropped), a held or a host's cost change takes `"if"` / `"unless"` on the card being paid for and `"players"`, and a cost never goes below the game's floor (L5R 0); a cost pick, a discard from the hand or cards bowed, takes `"min"` (`"min": 0`: the player may skip it, Merchant Caravan; the table offers Done with none picked), `"match"`, and for bowing `"whose"`, `"other": true` and `"count": "any"`; `"upto"` still means one or more; `l5r/fields` 154: the `play` description says so. Before that, one reader for who an effect reaches, ootv-play [#739](https://github.com/Oracle-of-the-Void/ootv-play/pull/739), l5r/play version 223 (`targeting.areas: ["province"]`): an effect for every player (`"to": "each"`) goes in turn order from the current player; a search with `"to"` gives each of those players a search of their own deck in turn, each asked first (Battle At Isawa Palace); `"to": "controller"` in a choice that chose a card is that card's controller (Dragon Sword Is Broken); a gold bonus with `"to"` reaches only those cards (Sailors); a produce modifier's `"whose": "yours"` keeps it to its player's cards (Sunken City; none: everyone's, Corrupted Iron Mine); an Event's held cost change takes `"players"` (`"each"`: every player's purchases; none: a reduction is its own player's, as Alliance); a target `"from": "province"` picks a card lying in a Province, and a Province picked for a move reaches its card (Koichi, Divine the Future). Before that, one amount and bonus reader, ootv-play [#738](https://github.com/Oracle-of-the-Void/ootv-play/pull/738): a bonus's `per` is counted from the card receiving it (its own unit, its army or the one facing it, only while that battle is fought; also `yours`, `inplay`, `discard`); a card's bonus and an Event's held bonus are read the same way, every key on each card it reaches; a held rule (`lasting`) also holds `gain` (traits and actions for the cards that fit while it lasts: Fearful Populace) and `produce`, and is judged again all the time, so cards that come later get it (rulings 9 and 14); an effect's `add` takes `max` (Akodo Hari) and `per`; a card that just left play is read as it was as it left (Kakita Shijin, ruling 16). l5r/play version 222: `terms.in` reads a `per`'s `in: opposing` as the army facing it; `l5r/fields` 152: the `play` description says so. Before that, one reader for every `prevents` and `negate` entry, ootv-play [#737](https://github.com/Oracle-of-the-Void/ootv-play/pull/737): every key of an entry is read wherever the table checks the action, and an entry with a key nothing reads is never in force; see "One reader" under "One rule for what a card may not do"; no l5r/play change. Before that, l5r/play version 221: the name rule is on, the "foo" rule (`matching.names.keys: ["keywords"]`): a trait named in a card's match is matched by title or by trait, as Scorpion Clan Coup p. 31 reads it ("Weapon" matches Weapons Master, "Dragon" Flight of Dragons, "Shadowlands" Shadowlands Sickness; a trait "Dragon Clan" is no Dragon; a trait "Defender of Forests" is a Defender, no Forest); `l5r/fields` 151: the `play` description says so, ootv-play [#736](https://github.com/Oracle-of-the-Void/ootv-play/pull/736). Before that, the same day, l5r/play version 220: the attack's sides say `allies: true`, so a card's "the Attacker" or "the Defender" (a target's `whose: attacker | defender`) names that side's player and their allies (the user's ruling 5); `terms.to` reads a bonus's `to: opposing` as the army facing it; `l5r/fields` 150: the `play` description's target words (`whose: attacker | defender` is now a player, that player's cards wherever they are; `side: attacking | defending` is the position), `which: all | chosen`, a bonus's `to: army | opposing` (only while that battle is fought) and the condition `if: {here: true}` (only at the battle at this card's Province, a Fortification's "this battle"); where a card is is read one way (E3), ootv-play [#735](https://github.com/Oracle-of-the-Void/ootv-play/pull/735). Before that, the same day, `l5r/fields` 149: the `play` description's "Conditions (E2)" passage at the end: every `if` and `unless` read one way, keys about a card judged on each card an effect reaches, `in {scene}` for a battle too, `in {..., match}`, a bonus's `opposed` in the scene its `if.in.scene` names; no l5r/play change, ootv-play [#734](https://github.com/Oracle-of-the-Void/ootv-play/pull/734). Before that, the same day, l5r/play version 219: the one matcher's config `matching`: which cards make a unit (`group.of`, a Personality and its Followers, for `{unit: {all}}` and `{unit: {none}}` matches), equal values (`aliases`: keywords Creature and Nonhuman, clans Mantis and Yoritomo Alliance) and the name rule (`names`: a name by title or trait, SCC p. 31; built, switched off, `keys: []`); `l5r/fields` 148: the `play` description's "One matcher (E4)" passage, ootv-play [#733](https://github.com/Oracle-of-the-Void/ootv-play/pull/733). Before that, the same day, l5r/play version 218: a challenge that can't be refused is read from the challenged card's own prevents, the challenge's Refuse option an `if` on it; a card's `faceup`, `win` and `lose` are its open's own words; the scene terms and their mappings gone; Test of the Emerald Champion without `accept.may`; `l5r/fields` 147: two passages of the `play` description; "The duel's last terms" at the end, ootv-play [#732](https://github.com/Oracle-of-the-Void/ootv-play/pull/732). Before that, the same day, l5r/play version 217: the last English sentences the engine built for L5R and LBS are config `says` keys with the same words (the turn mark's pass count, the verdict, the scene panel, the phase button), config `forms` gives each word its article, plural and case, and an Event's own pick is gone: Test of the Emerald Champion was rewritten as a chooser `choose`; `l5r/fields` 146: "Config says and forms, the Event pick gone" at the end, ootv-play [#720](https://github.com/Oracle-of-the-Void/ootv-play/pull/720) to [#730](https://github.com/Oracle-of-the-Void/ootv-play/pull/730). Before that, the same day, l5r/play version 215: who goes first is one word, `first {by: <amount>, best, tie}`; the AEG base defines the effects `lay` and `higher` the duel and battle resolve with; the sentences the engine still had are `says` keys with the same words and `terms.turn` is required; asking for allies is a player's rule action (`ruleactions` `invite`, `doneinvite`) and allies' turns are order entries; the Emerald Champion's series is answered as any challenge; 32 cards rewritten in general words (Glimpse of the Unicorn, Celestial Alignment, Foxwife, Oni no Sanru, Tsuburu no Oni, Inheritance, Debt of Honor, Mercy, False Alliance and 23 duel cards), with `modifiers.bring`, `moments.turnend.zones` and `honorloss {by: card}`, and the old words (`bringtokens`, `bringdestroy`, `staying`, the duel terms) gone; the bare table gets a pile per deck: "One question list, allying as rule actions, duel terms as card words, who goes first by an amount" at the end, ootv-play [#690](https://github.com/Oracle-of-the-Void/ootv-play/pull/690) to [#719](https://github.com/Oracle-of-the-Void/ootv-play/pull/719). Before that, the same day, version 210: Holdings enter play bowed by a game trigger (top-level `enter` gone; `triggers` and the moment `arrived`), the word `reduce` for a loss lessened, a scene's outcome is `case` and what follows it is its `after`, the clan price in the price list's shape with its sentences in `says`, the last seven turn-mark and phase-button sentences in `scenes.turn.says`, Hearts' tricks and Cribbage's count and show as config scenes, no config `round`, and a bare table for games with no play support: "Game triggers, reduce, scene after and case, round games as scenes, the bare table" at the end, ootv-play [#667](https://github.com/Oracle-of-the-Void/ootv-play/pull/667) to [#688](https://github.com/Oracle-of-the-Void/ootv-play/pull/688); the Honor Requirement in config (version 210) and the dishonor floor for every reader, the two sections before it. Before that, 2026-11-20, l5r/play version 206: a Shrine's "does not refill" is the modifier `zone` (the card key `attached` is gone), cost changes are one entry shape and the clan price combines with other reductions, an overlay effect says what it keeps, Avoid Fate is written in general words (`subject`, `{zone, at}`, `refill {zone}`, `shuffle {zone}`), "must attack" is `owes` entries, a `when: attacking` change counts only once assigned, and more of the table's words come from config: "Prices, zone modifiers, the subject, must attack as owes, the table's words" at the end, ootv-play [#622](https://github.com/Oracle-of-the-Void/ootv-play/pull/622) to [#666](https://github.com/Oracle-of-the-Void/ootv-play/pull/666). Before that, the same day, version 202: every card that asked with `must`, an Event's pick, `bid` or `demand` now asks with the chooser and those words are gone, Terrains act by ordinary triggers (`takes` and `atonce` gone), held stat changes are bonus entries, and the rule shapes for "which action", "a card left play" and "a card being brought in" are one each: "Every card on the chooser, Terrains as triggers" at the end, ootv-play [#610](https://github.com/Oracle-of-the-Void/ootv-play/pull/610) to [#621](https://github.com/Oracle-of-the-Void/ootv-play/pull/621). Before that, 2026-11-19, version 199: `drawing` says what a draw checks, a counter loss in `afters` is written as an event, the chooser can ask what `must`, an Event's pick, `bid` and `demand` ask, and a card with no spot is placed by each screen: "Drawing, the chooser's new words, unplaced cards" at the end, ootv-play [#601](https://github.com/Oracle-of-the-Void/ootv-play/pull/601) to [#609](https://github.com/Oracle-of-the-Void/ootv-play/pull/609). Before that, the same day, version 198: a scene's opening cards are written like any target, a granted action and a scene's move can be cancelled, Honor routes hear give-backs and restoring, "right" follows turn order, a starred cost is its number, and no game in the address opens the chooser: "Opening cards as targets, cancels and counter routes" at the end, ootv-play [#576](https://github.com/Oracle-of-the-Void/ootv-play/pull/576) to [#600](https://github.com/Oracle-of-the-Void/ootv-play/pull/600). Before that, the same day, l5r/play still version 197: the repo's game files now sit on shared base files, `"extends": "aeg"`, while the item holds the merged config, so nothing in it changed; who words, players words, amounts and `until` values work in more places: "Shared bases, and words that work in more places" at the end, ootv-play #543 to #566. Before that, 2026-11-18, version 197: what players owe before a phase can end is the step's `owes` list, the End Phase's `{"whose": "turn", "discard": {"zone": "hand"}, "downto": {"of": "counter", "counter": "handsize"}}`, ootv-play #542; version 196, l5r/fields version 136: the Events Phase is a scene run at each Province, `"each": {"$area": "provinces"}, "scene": "reveal"`, its flip, resolve, discard and refill written as effects, ootv-play #541; version 195, 135: the game's Setup is the Setup step's `start` effects, `{"shuffle": {"zone": "dynasty"}}` and `{"move": {"zones": ["dynasty"], "top": 1}, "to": {"zone": "province1"}}`, and Hearts' score is effects too, ootv-play #540; version 194: the Samurai and Emperor Events Phase flip is a `start` effect, #539. Before that, l5r/play version 193, l5r/fields version 134: a phase's `start` is a list of effects, the same as any scene step's; the Straighten Phase is `{"straighten": "yours", "as": "phase"}` and the End Phase's draw `{"draw": 1, "as": "phase"}`, ootv-play #536; Hearts' and Cribbage's deal and passing are effects too, #537 and #538. Before that, l5r/play version 192, l5r/fields version 133: a challenge's "accept or refuse?" is written in the play config as a choice, ootv-play #533. Before that, l5r/play 191, l5r/fields 132: a game's config can define its own effects, ootv-play #532, none defined for L5R yet. Before that: Reactions may be played while a choice waits, ootv-play #531. Before that, l5r/fields 131: a choice's options can be conditional and can name a result, ootv-play #530; Doji Hoturi's choice is rewritten. Before that, l5r/fields 130: a choice a duel's loser makes is written like any other choice, ootv-play #529; `scenes.duel.choices` is gone. Before that, l5r/play 190, l5r/fields 129: picks, asked payments, bids and tests say what their result runs with `case` too, ootv-play #527; the eight cards are rewritten and the earlier places are no longer read, #528. Before that: `case` is the one way a play code says what an effect's result runs, and a card that opens a duel reads the duel's result for one side, ootv-play #525; the four cards are rewritten and the earlier `on` lists are no longer read, #526. Before that: flipping is one piece: every card whose face changes, by a card, a phase, a scene or by hand, goes through one function, and the word is `{"flip": who, "to": "up" | "down" | "toggle"}`; a card in play flipped up by an effect, phase or scene enters play (`flipping.<reason>.enter`), by hand it does not; the phase step `faceup` is `{"flip": {"zones"}, "to": "up", "show"}`; "flip" replaces "turn up" in every log line and menu; ootv-play [#523](https://github.com/Oracle-of-the-Void/ootv-play/pull/523). l5r/fields version 124: the older move words are removed: `{"move": "home", "to": who}`, `{"move": "area"}` and the like, an effect's `{"attach": n}`, `{"intoplay": true}`, `bring`, `put`, `insert`; written that way an effect does nothing; all 34 cards that used them are on `{"move": who, "to": where}`; ootv-play [#522](https://github.com/Oracle-of-the-Void/ootv-play/pull/522). l5r/play version 189, l5r/fields version 123: entering play is one boundary: a card that comes into play, however it got there, runs its `enter` effects and is held to the unique and join rules (`moving.<reason>.enter`, checks `unique`, `join`); a move may say `"enter": false` (Unexpected Allies); by hand a card that may not be moved stays and attach limits hold (`moving.hand` checks `prevents`, `attach`), and a card put into play by hand does not enter; a card sent to a discard pile from out of play is discarded like any other, only without the leaving-play triggers; the move word across the boundary, `{"move": who, "to": "play"}` (with `onto`, `control`, `face`, `pay`, `aged`), `{"to": {"zone": zone}}`, `{"to": {"under": "self"}}`, `{"move": "event", "to": {"deck": "bottom"}}`, the older `intoplay`, `bring`, `put`, `insert` still read until the cards are rewritten; ootv-play [#521](https://github.com/Oracle-of-the-Void/ootv-play/pull/521). l5r/play version 188, l5r/fields version 122: the move card word, `{"move": who, "to": where}`, like `bow` and `destroy`: where is `home`, `here`, `area`, `switch`, `{"target": n}` (a Province picked) or `{"host": who}` (onto another card), with `bow: true`, `require`, `name`, `then` / `else`; the battle and attack `end` effects and the Favor's use are written with it; the older forms (`{"move": "home", "to": who}`, `{"attach": n}`) are still read until the cards are rewritten; ootv-play [#520](https://github.com/Oracle-of-the-Void/ootv-play/pull/520). l5r/play version 187: `moving`, what is checked when a card moves, by why; every move on the table, by a card, the rules or by hand, now goes one way, and nothing plays differently; ootv-play [#519](https://github.com/Oracle-of-the-Void/ootv-play/pull/519). l5r/fields version 121: a token destroyed is heard as a destroy, `destroying` before and `destroyed` after, by the card it was on; only a trigger with `if: {token: <type or name> | "*"}` hears it, so a card's own "when this is destroyed" doesn't fire for a token on it; ootv-play [#512](https://github.com/Oracle-of-the-Void/ootv-play/pull/512). l5r/play version 186, l5r/fields version 120: removing a card from the game is a third way beside destroying and discarding, with its own `removing` block (L5R checks nothing for it); the card word `{remove: who}` (Test of the Emerald Champion's `{remove: true}` unchanged) sends cards to their owner's removed pile, said once in the log ("… is removed from the game"); a player leaving the game removes their cards in play the same way; ootv-play [#511](https://github.com/Oracle-of-the-Void/ootv-play/pull/511). l5r/play version 185: Find a deck's filters by the public lists' names, `finder.facets` `align` and `home` (clan and stronghold), [ootv-play #510](https://github.com/Oracle-of-the-Void/ootv-play/pull/510))

The play table (`/play/`, repo `ootv-play`; on preview only so far) plays a game from its table config: the
zones, the layout rows, setup, card states, counters, the turn's phases and the attack, and the rules that
change by arc. The live site reads it from the settings (`oracle-all-structure`), item **`<game>/play`**; L5R's
is `l5r/play`, created 2026-11-03 at version 1, now version 233. There's no Admin editor for it yet.

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
- Since 2026-11-19 a game's file may sit on a shared base file, `games/base/<name>.json`, named by its key `"extends"`
  (L5R and LBS: `aeg`; Hearts and Cribbage: `cards52`). The item never has `extends`: it holds the file and its base
  merged, and `test/structure-diff.mjs` compares the merged config with it. See "Shared bases, and words that work in
  more places" at the end.

## What's in it

| Key | What |
|---|---|
| `zones` | the piles and areas (L5R's include the active area): who sees them, whether they're in play (`play`, since version 142: a face-up card there is in play, and moving out is leaving play; L5R the play area), how they're laid out, which back a discard takes, what a tap does, which pile refills a province, where a destroyed province's cards go, which cards attach to the zone itself (`attach`, L5R's provinces: Regions and Fortifications), and the card menu's word for moving a card there (`moveword`, since version 204: L5R Home "Put into play", a discard pile "Discard"; none: "To <name>") |
| `table.rows` | the order of the piles and provinces along a player's row |
| `table.arrange` | Arrange's rows of card types, nearest first (L5R: stronghold, sensei, wind, holdings, regions, celestials; then personalities; then the rest), and the types it stacks (Holding) |
| `placement`, `scenes.main` Setup | where each deck card starts (L5R: the stronghold and pre-game cards in play, in the corner; spots in card widths from the near right-hand corner) and the opening shuffles and deals (the main scene's Setup step, its `start` effects since version 195: `shuffle {zone}` and `move {zones, top: n}` to a zone, for each player (`top` an amount since ootv-play [#704](https://github.com/Oracle-of-the-Void/ootv-play/pull/704)); the step list `setup` until then, top-level `setup` until version 95) |
| `cardfields` | the card fields the rules read (L5R: type, keywords, title, and every numeric search field) |
| `triggers`, `moments.<m>.into` | rules no card carries, written as triggers (since ootv-play [#671](https://github.com/Oracle-of-the-Void/ootv-play/pull/671), l5r/play version 207; top-level `enter` until then): `[{id, at, match, text, effects}]`, fired at their moment before the cards' own. A moment may be a card coming into a zone: `moments.arrived {"into": {"zone": "home"}}`, fired as a card lands there from any other zone, however it came (bought, played, put into play by a card or by hand, made). L5R: `holdingsbowed`, "Holdings enter play bowed", at `arrived`, `{"bow": "self"}` for a Holding that is not a Fortification (up to Lotus; from Samurai on every Holding, the arcs' patch `{"$items": {"holdingsbowed": {"match": {"not": null}}}}`). A trigger with `"for": "player"` fires once for each player a player's moment is about (Ivory and Three Dynasties: `honortaken`, see "The Honor Requirement in config") |
| `matching` | how a card's match is read (since version 219, ootv-play [#733](https://github.com/Oracle-of-the-Void/ootv-play/pull/733)): `group.of`, the roles whose cards make a unit for a `{unit: {all: match}}` or `{unit: {none: match}}` match (L5R `leader`, `follower`: a unit is Cavalry only if its Personality and every Follower are, SCC p. 63; Pikemen); `aliases`, values that match alike (`keywords` Creature and Nonhuman, `clan` Mantis and Yoritomo Alliance); `names`, the name rule (a name in a title or a trait, plural allowed, "Foo of Bar" a Foo, reserved words such as Clan only whole: SCC p. 31), on for the match keys `keys` lists (L5R `keywords` since version 221, the "foo" rule: "Weapon" matches Weapons Master and Concealed Weapon, "Dragon" Flight of Dragons, "Shadowlands" Shadowlands Sickness; "Dragon Clan" is no Dragon; none before); `not`, the card field whose values are names a card is not, whatever its title and traits say (since version 226: `notnames`) |
| `cardstates`, `counters` | bow and dishonor (upside down), with their words (`is`: "bowed", "dishonored", since version 52; `isnot`: "unbowed", "honorable", since version 117, every sentence about a state takes these words; `unname`: Straighten); Honor, Gold and Hand size, and Rings (since version 172: worked out from the Rings in play, `from: {collect}`, `seatbar: false`, read by Enlightenment); tokens on cards: `tokens` below |
| `stats` | a card's numbers (Force, Chi, Personal Honor): which include what's attached printed as a bonus (`aggregate`: Force, Chi), and which have no Change menu (`change: false`: Personal Honor) |
| `tokens` | token types (since version 137; were `tokens` as a list, `cardcounters`, `customtokens`, `made` and `stats[].token`), each token on the table its own piece: `favor`, the Imperial Favor, one player holds it or nobody does (`on: player`, one in the game), the keyword its actions carry (`keyword`) and what it's given up for (`uses`), lobbied for by the lobbying scene's `opens`; `token`, tokens on cards (`on: card`), any name typed or one press away (+1F, +1C, +1F/+1C, -1F: `quick`), their Force and Chi read from the name (`attrs`: +1F adds 1 Force); `proxy`, cards made in play (any card type, a Follower unless the card says, titled Proxy unless it says; Fate back, a Personality Dynasty), cards for every rule and never tokens (moving a token, destroying tokens to bring a card in, counting tokens), and whenever one leaves play (destroyed, discarded, shuffled in) it leaves the game (`leaving`, since version 141) entirely, in no pile (`leaves: gone`, since version 138; the removed pile in 137). Destroying or counting tokens (Setsuban Festival) touches only `token` tokens, never a proxy or the Favor. How each is drawn (`look`, since version 139): `token` tokens are glass beads on the card's bottom edge, coloured by their numbers (`tint: attrs`: green a bonus, red a penalty, both halves for one of each, blue a word token), dots when the card is zoomed far out; the Favor is the Imperial mon (`icon`), in the top bar while nobody holds it, beside its holder's name once taken. A token's own action (Shosuro Hametsu's Poison) holds only while the card that gave it is in play. A proxy is drawn on a blank frame of its type, its name, numbers, keywords and text written in (`proxy.look.frames.<rule set>.<type>`: `src` under the image address, `layout` where each goes, as fractions of the card; since version 145, Imperial's eleven types at `l5r/frames/imperial/`; since version 146 every rule set: Jade's twelve, Celestial's eleven, a rule set's entry may say `like` another and add its own, as Gold adds the Wind and Ivory the Sensei); a framed proxy fills the card with a blue glow on the frame's black border; a type with no frame gets a plain one drawn by the table inside a ghost edge |
| `timing` | when each kind of action may be taken (L5R: Limited, Open, Battle, Reaction). A window must name its `scene` (since 2026-11-20: one with only a `step` opens nothing) |
| `joins` | the rules a card must meet to come into play for its player (since ootv-play [#685](https://github.com/Oracle-of-the-Void/ootv-play/pull/685), 2026-11-21; `requirement` until then, `honorreq` until version 115), each `{id, name, article, match, unless, <counter>: {min, max}, ignore}`: a bound is a number or the card's own printed number in a field (`{"of": "self", "field": "honor"}`). L5R: the Honor Requirement (a Personality's `honor` against its player's Family Honor; not a card made in play) and a second, unnamed rule for any other card with an `honor` number (Temple of Bishamon). `ignore`, read in order, the ways past a rule: a card of the player's with the modifier named (`{"modifier": "waive"}`, The Hidden Temples of the Naga), paying more (`cost {add, resource}`, `phases`, `name`, `text`: Clan allegiance, Samurai to Emperor) or a mark the player has (`mark: "lost Honor"`, with `claim`, the question the table asks and the log line: Ivory and Three Dynasties); `match.buyer {same: clan}` limits one to the player's own clan. The same rules against the card attached to: `attaching.joins` (a Follower or Ancestor against its Personality's Personal Honor, `on: leader`; none from Ivory on) |
| `resources.gold`, `purchase` | what produces Gold and whether what's left after a payment is lost (before Ivory); what a purchase is and what it costs (`purchase`; `gold.buy` in early versions), its cost changes (`purchase.changes`: a Personality of the player's clan adds its Personal Honor when paid in full, else costs 2 less when short; not Shadowlands; none from Ivory on). Since ootv-play [#673](https://github.com/Oracle-of-the-Void/ootv-play/pull/673) a change is `{"match": {"type", "buyer": {"same" \| "differs": <field>, "except"}}, "cost": {"add", "resource", "when": "short"}, "full", "says"}`, its sentences its `says` ([#677](https://github.com/Oracle-of-the-Void/ootv-play/pull/677)); see the last section |
| `handplay` | playing a card from the hand: which cards attach to the card they're played on (`attach`: L5R Item, Follower, Spell, Ancestor) and where the rest go while they resolve (`to`: the active area; required since 2026-11-20, with none the card can't be played); the Gold Cost is paid as a purchase is; `name`: the table's word for it (since version 204: "Play") |
| `actions` | card actions: `fromhand`, the hand cards played for their actions (Strategy, Ring). Each action is in its card's menu while its timing (`timing`) is open; using one picks its targets, pays its costs, makes the Force and Chi changes its text gives ("+2F for attacking until the end of the turn", "a 1F/2C bonus", tokens; a choice of bonuses or a condition is left to the players) and hands the action to the next player unless it was a Reaction |
| `terrain` | which hand cards are Terrains (`keyword`: Terrain): played at the battle being fought, one at a time, shown at that battle; its text takes effect when everyone has passed in the Battle Action Segment; discarded when the battle ends |
| `finder` | the deck finder's filters beyond name, card and format (`facets`: the public lists' `align` and `home`, L5R's clan and stronghold (since version 185; `clan` and `stronghold` until the lists index renamed them), each with its pulldown's label), shown on each deck too; the Dynasty and Fate counts come from the deck zones (since version 53) |
| `duel` | challenges and duels (who can duel, L5R a Personality: `scenes.challenge.opens.cards`), where focus cards go face down (the active area) and which (Fate cards), the stat compared (Chi) and the card field added to it (Focus Value), who doubles it (Double Chi); a token's C counted in a duel; the duel's Strike step turns both sides' focus cards face up and marks them so (since version 229: a focus added after the reveal counts); a card may make the duel compare another stat, `{"duelset": {"field": "force"}}` (Hida O-Ushi) |
| `types`, `targetwords` | the card types an action's target can name, and the traits it can name instead (Shugenja, Terrain) |
| `roles` | what the rules mean by a card's role: `leader` (L5R: Personality: leads a unit, can't be targeted bowed by its own player, the default to accept a challenge), `follower` (Follower: Fear, Ranged Attacks), `stronghold` (Stronghold: Province Strength; `gives` the player's clan); each with its name for messages. (`dead`, who goes to the Honorable or Dishonorable Dead, went in version 140: that is `leaving` now) |
| `leaving` | what happens as a card leaves play (since version 140; `deaths` and the role `dead` until then): rules in order. A rule says one or more of: the card's mark in the pile (`exit`, with its name), where it goes instead of where it was sent (`to`: `owner`, its owner's; `gone`, out of the game; or a pile), and what becomes of the cards attached to it (`attachments`: `detach`, each stays in play on its own; `regroup`, they stay together where it was, the first leading; `discard`, each to its owner's discard pile, since version 142). Cards an effect spared (Final Charge) stay together whatever the rule. For each of those, the first rule that says it and fits decides (since version 141). A rule fits by how the card left (`destroyed`, `discarded`, or any other way), which cards (`match`), a state it had, whether it was attached, whether it was made in play (`made`), whether another player controlled it (`controlled`). L5R: a proxy leaves the game; a card another player controls goes to its owner's pile; a Personality destroyed while dishonored is Dishonorable Dead, otherwise Honorable Dead; one discarded is neither (SCC p. 54); the cards on a card leaving play are discarded, as for a Personality returned to a hand or deck without being destroyed (since version 142; detached until then). Cards still say `dead` for the mark. A rule with a `name` and no `exit` gives the card menu's word for leaving that way by hand (since version 204: "Destroy", "Discard") |
| `destroying`, `discarding` | what is checked when a card is destroyed or discarded, by why (since version 182; the user, 2026-11-17: "two blocks. each will have potentially different triggers"): for each reason (`cost`, `effect`, `hand` the card menu, `scene` a battle's or duel's resolution or a Terrain's end (`battle` until ootv-play [#708](https://github.com/Oracle-of-the-Void/ootv-play/pull/708), 2026-11-21), `rule` the game's rules such as Chi 0, `phase` the turn's end, `enter` an overlay's old card), `checks`, in this order: `spare` (a card an event run again spares: Utter Defeat), `kept` (a Terrain that may not be destroyed: Oracle of Earth), `prevents` (a card that may not be destroyed or discarded: The Jade Hand; one tied to a stat only for that stat: Wounded in Battle), `instead` (its own trigger replaces it: Goblin Warmonger); `moments: false` keeps the destroyed trigger from hearing it. L5R: every destroy but by hand checks all four, no discard checks anything. A destroyed card goes as `leaving` says (a Personality to the dead); a discarded one doesn't. The card menu's Discard (and a drop on a discard pile) asks Destroy or Discard for a card in play; a card not in play is discarded (the user, 2026-11-17). |
| `moving` | what is checked when a card moves, by why (since version 187; the user, 2026-11-18: "let's tackle moving with the same pattern"). A move is a card going to another zone, onto another card or off its own, its unit going out to a battle or home, or its control changing, alone or together. For each reason (`cost`, `effect` a card's effect, `hand` the card menu and drags, `play` a card bought or played, `scene` a battle or duel ending, `rule` the game's rules, `phase` a phase step, `enter` an overlay; `battle` until ootv-play [#708](https://github.com/Oracle-of-the-Void/ootv-play/pull/708)): `checks`, those named: `prevents` (a card that may not be moved off the card it is on, or whose control may not be taken: The Jade Hand, the Porcelain Mask of Fu Leng), `attach` (the new card's limits on what attaches to it), `assign` (the Province's limits on who goes there); `moments: false` (the `detached` moment doesn't hear it). Also `unique` and `join` (a card entering play: the unique rule, and whether it will join its new player), and `enter: true` (a card entering play for this reason does what its `enter` effects say; since version 189). A reason with nothing named checks nothing and nothing enters. L5R: `effect` checks `prevents`, `unique`, `join`; `hand` checks `prevents`, `attach` and does not enter; every reason but `hand` enters. |
| `relations` | whether a card is in play by what it's on, over its zone (since version 143): `under` (under a card), `zone` (attached to a zone itself), `area` (played at a battle), `attached` (on a card), each `{play: true \| false}`. L5R: a card under another is out of play (Forgotten Tomb, The Armor of Sun Tao); a Region or Fortification on a province, and a Terrain at a battle, are in play. A card in a unit but not in play adds nothing to its Force |
| `overlay` | buying a card onto an earlier version of it in play (since version 144): which cards (`match`), its level (`level`: a word in a field; L5R keywords Inexperienced, none, Experienced, Experienced 2 …), how many steps are free (`free`) and what more costs (`pay: difference`, the difference in cost), what the new card keeps (`keeps`), the old card's actions added to the new one (`actions`), where the old card goes (`old: under`), and none of the game's join rules (`joins: false`; `requirement: false` until 2026-11-21). Only a more experienced version goes on top. On the table: a province card's menu, Buy onto <name>. L5R: Personalities, one step free, two or more pay the difference; the old card lies under the new one, out of play, and is destroyed and counted with it |
| `memory` | what a card forgets as it moves (since version 141; fixed in the table until then): rules, every one that fits applying, each saying when (as it leaves play, `leaves`; the zone it lands in, `into` its layout, zone, hidden or not, in play or not, a discard pile or not (`discard`, since version 181); the face it lands with) and what it forgets (`states`, `tokens`, its own ongoing changes `mods`, `flags`, what it gained `gains` or only gained `triggers`, its mark `exit`, `copy`, `production`, `expires`, another player's `control` of it, the battle it was in, `area`; since version 142). A zone where a rule forgets states can't hold a bowed or dishonored card. An edition can change it in `arcrules`. L5R: leaving play, states, tokens, gained triggers, copies, production, control, the battle it was in (Emperor CR p. 29), and the same into a discard pile from anywhere (since version 181: an Event discarded from the active area, which isn't in play, such as Inheritance, no longer keeps its end-of-turn mark and is no longer "destroyed" again from the discard pile); into a pile or a hand, states and tokens; into a hidden zone, or face down out of play, its own changes and its mark (Emperor CR p. 55; Celestial CR X.4) |
| `piles`, `honor` | the deck an effect draws from, the hand, and the removed pile (L5R: fate, hand, removed); the counter that is Honor and the state that is dishonored |
| `spellwork`, `unique`, `fortification` | what counts as spell-work (a Spell; a Shugenja's own ability), the Unique rule (the keyword, by title), and what a Fortification is (the trait) |
| `scenes.main` First player | who goes first (the main scene's step `first`): `{by: <amount>, best: highest \| lowest, tie: random \| again}`, L5R the highest Honor, a tie at random (since ootv-play [#704](https://github.com/Oracle-of-the-Void/ootv-play/pull/704), version 211; `{counter, tie}` until then, top-level `firstplayer` until version 95) |
| `scenes.turn.steps` | the turn's phases (top-level `phases` until version 95): what each phase does as it starts, its `start`, a list of effects like any scene step's (since version 193; the step words `clearstate`, `flip` and `draw` in `enter` until then). An effect that is the phase's own says `"as": "phase"`: `{"straighten": "yours", "as": "phase"}` (the Straighten Phase: cards whose text replaces the straightening or keeps them bowed are left), `{"draw": 1, "as": "phase"}` (the End Phase's draw, with what cards add to it or have happen instead), `{"flip": {"zones": [...]}, "to": "up", "as": "phase"}` (from Ivory on: the Provinces' cards turned up in the Action Phase). Since version 196 the Events Phase (before Ivory) is written as a scene run at each Province: the step says `each` (the Provinces), `scene` (`reveal`) and `then`; the scene `scenes.reveal` has three steps, each a `start` effect list, done at one Province at a time in row order: `{"flip": {"zones": "here"}, "to": "up", "show": {"type": "Event"}, "as": "phase"}`, `{"resolve": {"zones": "here", "match": {"type": "Event"}, "face": "up"}}` (the Event takes effect; one that waits on a player, or has no code, holds the phase there until that is done or Continue), then `{"discard": ..., "as": "phase"}` and `{"refill": "province", "as": "phase"}`. `then` runs once every Province is done: `{"move": {"zones": ..., "match": {"type": "Region"}, "face": "up"}, "to": {"area": "own"}, "max": 1, "as": "phase"}` (a face-up Region attaches to its Province unless one already is), and a refill. `scenes.reveal.pickers: each` has every player pick for a one-pick Event. (The step word `reveal` `{zones, stopat, attach, pickers}` in `enter` until then.) Who acts first is the step key `turns` (L5R's Action Phase `"turns": "turn"`; an entry `{"turns": ...}` of the step's `enter` list until ootv-play [#668](https://github.com/Oracle-of-the-Void/ootv-play/pull/668)). Since version 197 `owes` is the list of what players owe before the phase can end, said as it begins and named on the phase button until done: `{"whose": "turn", "discard": {"zone": "hand"}, "downto": {"of": "counter", "counter": "handsize"}}` (the End Phase: the turn's player discards from the hand down to the hand size; `whose: all`, every player; `downto` may be a number); the engine also takes `{"whose", "movetoken": {"type", "from", "to": {"area"}}, "rest": "lost"}` (a token type moved off some cards onto an area's own cards, LBS). (The step key `handlimit` `{zone, counter, whose}` with `{"handlimit": true}` in `enter` until then.) Also whose action it is, and the attack: `attack.scene` names the scene it opens (`scenes` below holds its steps); the steps (Maneuvers: `assign`, the attacker then the defender; `infantry`, `cavalry` or `any`; Three Dynasties' Cavalry `onlywithunits`; `skip` `{players}`: passed over with that many players or fewer, the Declaration with two), the battle's steps (Resolution: `resolve`), who may be assigned (`commit`: L5R, a unit led by an unbowed Personality; Cavalry when the Personality and all its Followers are) and the Honor a resolution gives (`honor`: 2 a card destroyed to the winner, 1 each on a tie). Since versions 204 and 205 a step also says the turn mark's words while it runs (`acting`: "Not started", "Finish events"), `scenes.turn.says` the phase button's sentences (`skip`, `done`, `end`, `pick`, `continue`, `rest`; and since version 209 `check`, `resolve`, `nextarea`, `noscene`, `finish`, `begin`, `over`, see the last section), and a step's `owes` what must be placed or opened before it can be left (see the last section) |
| `scenes.battle` panel, off | how the table shows a battle (since version 116): `panel` `"middle"` puts it big in the middle of the screen at Resolution, with Hide; `off` is ending it with no outcome, its button's words (`name`: End without resolving) and the question asked first (`detail`, `yes`, `no`); `local`, which actions must involve the battle being fought (Open and Battle actions), and since version 228 `areaown: true`: a card attached to a Province acts only in the battle at that Province (`areaownwhy`, the message) |
| `control` | what a change of control brings (`with`, `scene`, `returns`, `join`), and since version 227 `attached: "host"`: an attached card is controlled by whoever controls the card it is on, unless the move that put it there says `control` |
| `base` | the rule set the top-level config is (L5R `Imperial`); every other edition is an `arcrules` patch on it |
| `terms` | the game's words for the engine's general ones (bow for a quarter turn, unit for a group, ...): card code and config are read through them, and the table says them |
| `forms` | a game word's forms in the table's sentences: `a` (with its article), `many` (plural), `up`, `low` (case) |
| `effects` | the game's own effects, each defined once out of other effects with parameters (L5R `lay`, `higher`); card code names them like any effect |
| `modifiers` | the rule names a card's `play.modifiers` may use (prevents, instead, produce, assign, bring, zone, ...) and how each is applied |
| `gates`, `afters`, `afterwords`, `watches` | facts about scenes that action gates and Reaction triggers name ("only at the battle being fought", "just after a battle"), the words their refusals say, and the facts the table watches for (L5R: an attack over the Province Strength) |
| `targeting`, `zonetargets` | target rules: your own bowed card can't be your target unless the card says so, a target with no `from` is a card in play, whose discard pile a target is taken from, the area kinds a target may be (L5R Provinces) |
| `effectkinds` | effects with a strength that cards name as a kind (L5R Ranged and Fear: how strong, against what, combined how) |
| `areacards` | area cards (L5R Terrains): which hand cards they are, where and when they're played, how many, what they do and when they go |
| `attachlimits` | what a card may hold: how many of a kind (L5R one Weapon and one Armor on a Personality), checked as a card is attached |
| `statdestroy` | cards a stat destroys (L5R a Personality whose Chi is 0 or less, below its printed Chi) |
| `inplay`, `enterface` | what counts as in play (L5R face up only) and the face a card lands with where its zone says none (`up`) |
| `stacks` | states that stack into one value (L5R bowed and dishonored, read as a rotation) |
| `turning`, `flipping` | what is checked and what follows when a card turns (bows, straightens) or flips, by why: cost, effect, the card menu, a phase, a scene |
| `drawing`, `drawshort` | what a draw checks first, by why it happens, and what a draw from a deck with too few cards does (L5R `fewer`: the cards there) |
| `search` | what a search does beyond its own words (L5R `shuffle: true`: the pile is shuffled once the search is over) |
| `cancel` | what cancelling an action does with its costs (L5R `keep`: they stay paid) |
| `negates` | the actions a card's `negate` may name (straighten, destroy, move, rehonor, effects, fear, draw, resolution, control) |
| `preventwords`, `costwords` | the words the table says for a held `prevents` on every player, and for a held cost change, by kind |
| `reacting`, `reactions`, `reactorder` | the timing words that answer an event (L5R Reaction), the reaction model (`stack`: the table is taken back to the event and the Reaction resolves first), and the order of Reactions to one event (`turns`) |
| `interrupted` | an action a Reaction came before, resolving after it: `players: true`, a player reached through a target gone by then still is |
| `opponent` | which player `to: opponent` means when the table didn't ask (L5R `choose`: the acting player picks) |
| `ruleactions` | the rulebook's own actions on the cards that have them, in the play-code action shape |
| `totals` | the numbers added up over a scene's cards (L5R a unit's Force, the duel's Chi and Focus Value, the lobbying total of Honor) |
| `turncounts` | counts kept for each player each turn that card limits read (L5R spell effects produced) |
| `victory` | winning and losing: each check a counter at a mark (L5R -20 Honor is out, five Rings win) or none of a kind of area left (L5R no Provinces: out), the last player left wins (L5R: Military, Dishonor, Enlightenment and Honor victories) |
| `cardnames` | how a card's name is said at the table: patterns dropped from the title (L5R "(Experienced)", a parenthesis) and its short name |
| `discardvalue` | the play key a recorded card's value is read from in a total (L5R `focus`) |
| `cardratio`, `imageuri`, `backs`, `symbols` | the card's shape (width ÷ height, 0.714), where the images and card backs are, and the card-text symbol font and classes |
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
| `terms.turn`, `terms.turnseat` | the game's word for a turn and for the player whose turn it is (Hearts "Hand", "dealer": "Hand 2 (dealer: Player B)."); since ootv-play [#688](https://github.com/Oracle-of-the-Void/ootv-play/pull/688), 2026-11-21 (config `round {name, seatword}` until then). The main scene's Turns step says `"auto": true`: the game deals at once as it is made |
| `scenes.turn.steps[].start`, `.enter` | the round's steps. `start` effects (since 2026-11-18, ootv-play #537 and #538; step words `gather`, `shuffle`, `dealout`, `zero`, `choose` until then): every card moved back to the deck, the deck shuffled, the deal (the move word since 2026-11-19: `{"move": {"zones": ["deck"]}, "to": {"zone": "hand", "each": "players"}}`, evenly; the word `deal` until then), the points `set` to 0, and `choose` with `together` (every player passes cards at once, unseen: left, right, across, none by hand; left, right, none with three). The tricks are a config scene, `scenes.trick`, opened by the Tricks step's `scene` (since ootv-play [#675](https://github.com/Oracle-of-the-Void/ootv-play/pull/675), 2026-11-21; the `enter` step `tricks` until then): every player a side, a Play step whose move puts a card on the shared trick once a trick, its `prevents` the rules (the 2 of Clubs leads, follow suit, Hearts not led until broken, no points on the first trick), the effect `sceneflag` for Hearts broken, a Take step that resolves by itself (`resolve [{"best": "high", "field": "value", "among": {"follow": "suit"}}]`, the winner taking the trick face down and its points by the scene's `case.win`, `outcome` until ootv-play [#692](https://github.com/Oracle-of-the-Void/ootv-play/pull/692)), looped until every hand is empty, the winner leading the next; the score is the Score phase's `start` effects (since ootv-play #540; the step `score` until then): each player's points added to their score, or, when someone took all 26 ("shooting the moon"), 26 to each other player |
| `victory.atleast` | the game ends when a hand ends with someone at 100, lowest score winning |

## Cribbage (2026-11-10)

`?game=cribbage` plays standard cribbage, 2 or 3 players, or 4 as two partnerships, on one screen (ootv-play
[#318](https://github.com/Oracle-of-the-Void/ootv-play/pull/318); preview only, from `games/cribbage.json`, in the game
chooser; no `cribbage/play` item). Like Hearts it grows the engine with general keys: a running count, scoring from
patterns, a dealer's own pile, partnerships, a pegging board and a game that ends the moment a score is reached.

| Key | What |
|---|---|
| `deck.ranks` | any key beyond `value` becomes a card field: Cribbage's `count` (face cards 10, Ace 1) beside `value` (order, for runs) |
| `scenes.main` First dealer | the first dealer by cut (`first {by: {of: cut, field: value}, best: lowest, tie: again}` since ootv-play [#704](https://github.com/Oracle-of-the-Void/ootv-play/pull/704); `first.cut` until then, `round.first.cut` until 2026-11-11): a card each, low deals, a tie cuts again |
| `teams`, `counters[].team` | partners by player count (four: A and C, B and D), one shared score |
| `counters[].board` | the score drawn as a pegging board: front peg at the score, back peg where it was |
| `scenes.turn.steps[].start`, `.enter` | `start` effects: the deal, the move word with `"each": "players"` and `count` per player count, then `"top": {"of": "players", "by": {"3": 1}}` to the crib (`"top": {"3": 1}` until ootv-play [#704](https://github.com/Oracle-of-the-Void/ootv-play/pull/704)) (three players: one card to the crib; the word `deal` with `extra` until 2026-11-19); `choose` with `together`, given to the dealer (discards to the crib). Since ootv-play [#687](https://github.com/Oracle-of-the-Void/ootv-play/pull/687) (2026-11-21; the `enter` steps `turnup`, `count`, `show` and config `count.patterns`, `count.last`, `show.patterns`, `turnup.points` until then): the Play step turns the starter up with `start` effects (the deck's top card, a flip, `{"score": "starter"}`: his heels); the count is `scenes.count` (pegging to 31: the player after the last winner first, `nomove: "Go"` passes over a player with no card that fits, a play over 31 refused, `resolve [{"best": "last"}]` and the last card by the scene's `case.win`, `outcome` until [#692](https://github.com/Oracle-of-the-Void/ootv-play/pull/692)); the show is `scenes.show` (each hand from the dealer's left, the dealer, then the crib, with the starter; Count, Count the crib, Next hand). What scores is config `patterns` (`starter`, `count`, `go`, `show`: fifteens, thirty-one, pairs 2/6/12, runs and double runs, flushes, his nobs, his heels, the last card) and the effect `score` |
| `victory.instant`, `victory.margins` | the game ends at 121 the moment it's reached, mid-play or mid-show; a loser under 91 is skunked, under 61 double skunked |
| `options`, `claim`, `steal` | **Count it yourself** (2026-11-10, ootv-play [#326](https://github.com/Oracle-of-the-Void/ootv-play/pull/326)): a checkbox in the table's bar, for everyone, any time. On, nothing is scored for you: after the turned-up card, each card you peg and your hand and crib in the show, press what you scored (Fifteen, A pair, A run, …) once per piece, then Done (the last card's point is always scored for you). In the show pick the cards first: 10, K, 5, 5 and Fifteen twice is two fifteens. What you don't claim is lost and logged. Off mid-claim, the rest is counted for you. **Muggins** (needs Count it yourself): after a player's Done, the other side (not partners) may take what they missed with the same buttons, first come, until the next move; a wrong call gives what it claims to the player called on; what nobody takes is lost. In the config the engine calls this a steal (`"claim": "manual"`, `"steal": "muggins"` on each `score` effect since [#687](https://github.com/Oracle-of-the-Void/ootv-play/pull/687); on each counting step, 2026-11-13, ootv-play [#444](https://github.com/Oracle-of-the-Void/ootv-play/pull/444)); what players see is the option's name, Muggins |

**Pass and play** (2026-11-11, ootv-play [#372](https://github.com/Oracle-of-the-Void/ootv-play/pull/372); Hearts and
Cribbage): the Start screen's **On one screen** picks Pass and play (the default) or Open (one person sees and plays
every seat). In Pass and play each person sees only their own hand: when a move makes it someone else's turn, the table
is covered by a screen with no cards on it (**Pass to** the next player, the status, scores and the last moves) until
they press **I'm <name>: show my hand**; the one who just moved can **undo my move** there. Opening or reloading a game
is covered too. Undo takes back only your own last move. A **Pass and play** checkbox in the bar switches it during
the game. Not a config key: the table's own mode, kept per game in the browser.

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
52; Gold p. 32; Lotus pp. 22, 29; Samurai CR p. 20; Emperor CR p. 19); from Ivory on only Personalities have one. (All of this is config `joins` since 2026-11-21: see "The Honor Requirement in config" below.)

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

Rules a card brings to the table live on the card, not in `l5r/play` (the user, 2026-11-03, the same way `deckconstruction` does for deck checks). `{"modifiers": {"Imperial": {"zone": {...}}}}` changes the zone the card is attached to while it's there face up (until 2026-11-20 the key `attached`, which is gone); only `autorefill` can be changed so far (`l5r/play` `modifiers.zone.settings`). Shinsei's Shrine (card 6992): `{"modifiers": {"Imperial": {"zone": {"autorefill": false}}}}`, "This province does not hold Dynasty cards (do not refill it)". `{"force": [{"when": "attacking", "add": 2}]}` adds to a card's Force in a battle while it's in the attacking army (`defending` for the defending one), for a card like Matsu Gohei ("+2F while attacking"). The province doesn't refill by itself; a player can still refill it by hand. Edit it in the card editor like any field. `{"actions": {"Imperial": [...]}}` holds the card's printed actions for a rule set (the user, 2026-11-05), one entry each: `name` (the label, e.g. "Battle", "Political Reaction"), `timing` (the timing words it may be used under: "Battle/Open" is `["Battle", "Open"]`, either may be used), `keywords` (the rest of the label: Repeatable, Elemental, ...), `cost` (`bow`: `true` bows the card, a word such as "Shugenja" bows the card it's attached to; `counter`: `{"id": "gold", "n": 2}` a counter paid, `n` a number, `"X"` (as much as the player spends) or any amount (since 2026-11-20: `{"of": "target", "unit": "counted", "field": "force"}`, the target unit's Force as a battle counts it, bowed cards adding nothing; `{"of": "unit"}` until then); the game's Gold counter is paid from Gold produced, any other counter is taken off the player's own; until 2026-11-09 `gold`), `targets` (`count`, `type` such as Personality or Follower, `whose`: `yours` or `theirs`, `bowed`/`unbowed`, `upto`, `text`) and `effect` (the printed words), and `effects`, what the table does (the user, 2026-11-05): a list of `{"add": {"force": 2}, "to": "target", "when": "attacking", "until": "turn"}` (`add`: a card's `force`/`chi`, or a player's `honor`/`gold` with `to` `you` or `opponent`; `to`: `target`, `self`, `you`, `opponent`, `all` with `all` `{type, side}`; `if`/`unless`: a match the card must or mustn't fit, for "3F to a Lion, or 2F to any other"; `when`: the change counts only while attacking or defending, its badge dimmed otherwise; `until`: `turn`, `battle`, `ever`), `{"token": "+2F/+2C Weapon", "to": "target"}`, or `{"dishonored": "target"}`; and battle effects (2026-11-05, Scorpion Clan Coup pp. 55–57): `{"ranged": 3, "to": "target"}` (a Ranged Attack: at an opposing Personality without Followers, or a Follower, in the battle being fought, destroyed when the strength is at least its Force; `{"stat": "chi", "of": "self"|"host", "plus": 2}` for "equal to her Chi" or "the Shugenja's Chi+2"; cards of one unit can combine theirs), `{"fear": 3, "to": "target"}` (bows the target unit's Followers with Force 3 or less, once a battle per card), `{"destroy": true, "to": "self"}`, and `add {"ranged": 2}` (Blazing Arrows). A bow is always the card's own `cost`, never the Ranged rule (the user, 2026-11-05: Shuriken of Serpents' cost is being destroyed instead). A target's `match` limits what it may be: `{"clan": ["Lion"]}`, `keywords`, `type`, or a current value `{"ph": {"min": 3}}`, `{"chi": {"max": 4}}`. The Ancestral Home of the Lion: target `{"match": {"clan": ["Lion"]}}`, effects `[{"add": {"force": 2}, "to": "target", "when": "attacking", "until": "turn"}]`; The Esteemed House of the Crane: `[{"add": {"honor": 2}, "to": "you"}]`. Without `effects` the table reads them from `effect`; "if", "when ..." and "for each" stay with the players. For Imperial they're read from the Clan Wars printing (Obsidian, Emerald or Imperial), not today's wording. A card without them has its text read the same way. Structured `effects` and `match` written 2026-11-05 on the 28 Imperial cards whose effects the table can do (each read by hand), then Ranged Attacks and Fear on 25 more (Goblin Mob's redirect stays with the players). Written 2026-11-05 for 186 Imperial Edition cards (ootv-tools `field-fixes/play-actions.py`; the printing's text went on 268 printings), with the targets and costs checked twice (a parser and the qwen3-vl model each read every action; disagreements ruled by hand). Search never reads `play`: since `l5r-os4` the index stores it unmapped. A game picks a card's change up when it's opened again or reset (both reload the card data, 2026-11-04); before that, a game kept the data from when its decks were loaded.

### Reactions (2026-11-05)

Nobody is asked whether they have a Reaction: that would hint at what's in their hand (the user, 2026-11-05). A player who wants one presses Reaction in the top bar, triple-clicks with a mouse (not on a deck or pile), or taps with three fingers, then picks the event from a list of what happened, back to their own last action (a Pass counts). The table shows the game as it stood just after that event, and the Reaction is played there; everything after it is taken back, not replayed, and the log says what was. Reactions answering an event form a stack (the user, 2026-11-05: "If reactions set up a chain, they are treated as a stack, that has to be fully resolved to get back to the original trigger to take the second reaction"): a new Reaction answers the top or a link further down, with nothing taken back, and answering one further down closes everything above it (no longer offered). So one player can react twice to the same event (Master of the Tea Ceremony, then Kakita Yinobu, on one loss), the second reading the game as it is then. The order is Scorpion Clan Coup p. 49's: after an action, Reactions in turn from the player on the actor's left until all pass. Since 2026-11-15 (l5r/play version 171, `reactorder: "turns"`; ootv-play [#475](https://github.com/Oracle-of-the-Void/ootv-play/pull/475)) the table keeps that order when two players answer the same event: still nobody is asked, but a Reaction from a player earlier in the order goes before one already played by a player later in it (turn order from the player after the one who acted, that player last). The later one is taken back and played again after it, as it was; if it can't be played now, it is taken back and the log says why. Its player may then take it back with **Take back Reaction** in the top bar (its card and costs come back, and Reactions that answered it go with it) until anything but Reactions happens. The user, 2026-11-15: "if two players try to react to the same event, do it in the order of the rules say"; "Stays, C may withdraw". A cancelling Reaction has the effect `{"cancel": {"keywords": [...], "type": [...], "targeting": "you" | a match, "token": true}}`: it cancels only an action with one of those keywords on its label or card, from a card of that type, aimed at you or one of your cards that fits the match (Resist Magic: `{"type": "Personality"}`), or (with `token`) the use of a token such as the Imperial Favor. The event's effects are undone and its log lines struck through; its costs stay paid and a card played from the hand still goes to its discard pile. `"to": "actor"` is the player whose action the Reaction answers: Investigation `[{"cancel": {"keywords": ["Ninja", "Kolat", "Assassin"], "targeting": "you"}}, {"add": {"honor": -5}, "to": "actor"}]`. `{"prevents": "revealing"}` stops an Event in the Events Phase (Avoid Fate; until 2026-11-09 `{"stopevent": "deck"}`, then `cancel`, then `prevents {revealing: true, to: deck}`): react to the Event turning up; once it has taken effect it is too late. It has no effect and its Province counts as revealed this phase; the steps in its `instead` happen in its place, about that Event, each a general effect any card can use (the user, 2026-11-10: no one-card engine code): `{"insert": {"which": "event", "into": "deck", "at": "bottom"}}` (into its own deck, face down), `{"refill": "province"}` (the Province it was in refills now, face down, not turned up this phase), `{"shuffle": "deck"}`. Avoid Fate runs them in that order (the user, 2026-11-06: "the imperial wording shuffles it into the dynasty immediately after refilling the province"). An event's kind ("after a Personality is destroyed") is checked where a play code says so (`after`, Honor actions below). The `l5r/fields` description of `play` has `cancel` and `actor` since version 19. It has `stopevent` since version 36, `cancel` `revealing` since version 46, Avoid Fate's `prevents` with `instead` since version 76.

### Honor actions (2026-11-05)

The Honor group of card actions (the user: "do the honor cards"). Most answer something that just happened, so a play code can say when it may be used, checked before anything is paid: `{"after": ...}` what the event reacted to did, or the battle just resolved (`battledestroy`: you destroyed an army or a Province as the Attacker or Defender, Brilliant Victory and Famous Poet; `battlewin`: you won and destroyed the other army, Mercy; `provinceheld`: your Province was attacked and stood, Ring of Earth; `honorloss`: you lost Family Honor in it, Master of the Tea Ceremony and Kakita Yinobu; `restored`: this card was restored to Honorable status in it, Toturi; `destroyed` (until 2026-11-09 `death`): a Personality of yours was destroyed in it, Martyr; `seppuku`: the target was dishonored in it, or you lost Honor, Honorable Seppuku; since version 53 `restored`, `seppuku`, `enddraw` (Ring of the Void) and `attackend` (Counterattack) are named in `l5r/play` `afters` like the battle ones: an event predicate (`took`/`lost` a state, `who`: self or target, `phase: yours`, `filled`: a pile empty before; `or`: other afters that also do) or an attack predicate (`role`, `unused`), with `why` per failing key); `{"battle": "outforced" | "outforcing"}` (the other army's Force higher, or lower with units: Legendary Victory, Refuse Advantage); `{"once": "battle" | "ever"}`. What they do: `{"take": "favor"}` (Kakita Yoshi), `{"award": {"double": true} | {"plus": 8}}` (if you win the battle being fought), `{"add": {"force": {"of": "ahead", "times": -1}}, "to": "army"}` (your army's Force lowered to the other's for the battle: Refuse Advantage), `{"add": {"honor": {"of": "lost", "less": 1}}, "to": "you"}` (Honor lost in the event given back: down to 1 with `less`, all without, or at most `"max": {"of": "discard"}`), `{"undo": {"destroyed": "opposing", "award": "back"}}` then `{"add": {"honor": {"of": "undone", "times": 3}}, "to": "you"}` (Mercy: the army comes back as it stood, its award taken back, 3 Honor a card instead; until 2026-11-09 these were `even`, `refund` and `spare`), `{"intoplay": true}` (a Ring comes into play). `"to": "highest"` is the player or players with the highest Family Honor (Breach of Etiquette), `"to": "owner"` the target's player (Shame); an amount can be `{"of": "target", "field": "ph"}` or `{"of": "discard"}`; a target can need `"state": "dishonored"`; a cost can discard hand cards, `{"discard": {"count": 1}}` (picked after the targets). Left to the players: Shame's "only one each time a Personality is dishonored". Ring of Earth's "at any point in the battle" is checked since 2026-11-09 (its `"over": true` names the config watch `over`). The `l5r/fields` description of `play` has these since version 20.

### Into play, tokens, take control (2026-11-06)

The next group of card actions (the user: "Can you do the next group?"). `{"make": {"title", "type", "force", "chi", "ph", "keywords"}}` puts a token card into play, attached to `"to": "self"` or the target, or on its own (Matsu Imura's animal, Summon Swamp Spirits, Summon Undead Champion); the table shows it as a text card with its name, numbers and traits, and it leaves the game when it leaves play. `{"control": {...}}` takes control of the target and what is attached to it, into the player's play area: `"attach": "self"` attaches it to the card (Matsu Imura, The Demon Bride of Fu Leng), `"drop"` destroys the attached cards that fit first (Kolat Master: Followers with required Honor above zero), `"while": "source"` holds it only while the card stays in play (Blackmail). A card under another player's control is tagged with its owner's name and goes to its owner's piles when it leaves play. `{"bring": {"attach": "self" | "host" | n, "face": "down", "reveal": {"timing": "Open"}, "pay": "cost"}}` brings the target into play under the player's control, picked from a hand or discard pile with the target's `"from": "hand" | "discard" | "discards"` (Necromancer, Animate the Dead, Cloak of Night face down, revealed as an Open action, Feign Death, Scribe onto its Shugenja paying the Spell's Gold Cost); clicking a discard pile then offers its cards that fit. `{"gain": {"keywords", "actions"}}` adds traits and actions while the card stays in play (Animate the Dead: Shadowlands and "Battle: Fear 3"; Kolat Master: Kolat). `{"intoplay": {"as": "target"}}` (until 2026-11-09 `{"copy": true}`) brings the card into play as a duplicate of the target with its permanent changes (The Egg of P'an Ku; it shows the copied card's picture, tagged with its own name). `"after": "gone"`: the target left play in the event reacted to. An action's `"ask": {"max", "text"}` asks the player for a number, used by a token's `"count": {"of": "x"}` (Togashi Mitsu's fire tokens, at most 5). Left to the players: Debt of Honor, Mitsu's straightening and bowing, Blackmail's and Cloak of Night's reveals, the Egg's Unique, Scribe's once per spell. Matsu Imura takes a Follower with the trait Creature (the user, 2026-11-06: later sets have some). Written on 14 Imperial cards; the `l5r/fields` description of `play` has these since version 21.

### Destroy (2026-11-06)

The Destroy group (the user: "start on destroy"). Most use `{"destroy": true}` on what is there already: the target (Alhundro Cornejo, Explosives, Kolat Assassin, Remorseful Seppuku on a Dishonored Samurai, Touch of Death on a bowed Personality with `"state": "bowed"`), `"to": "self"` for "destroy this spell" (Fist of Osano-Wo, Touch of Death, Heart of the Inferno), `"to": "all"` with `"if"` for everything that fits in the battle (Flight of Dragons: the trait Dragon, either side, not Dragon Clan; Heart of the Inferno: the opposing army's Personalities and Followers with Force 2 or less). A target's `match` can name keywords (a Retainer, a Holding's trait: Kolat Assassin, Matsu Hiroru) or a `title` (Terrible Standard of Fu Leng: Hida Sukune, once a game, +4F). New: a target's `"army": "opposing"` (in the opposing army at the battle being fought, with this card's unit there: Hida Yakamo) and `"attacked": true` (attached to the Province this card's unit is attacking: Battering Ram Crew, Fire Breather), and `{"destroy": {"attached": {"type": "Follower"}}}`, which destroys the target's attached cards that fit, not the target (Break Morale). Written on 14 Imperial cards; the `l5r/fields` description of `play` has these since version 22.

### Force, Chi, Province Strength (2026-11-06)

The next group of card actions. `"to": "inplay"` gives an effect to every face-up card in play, either side, and `"to": "yours"` to the player's, each narrowed by `"if"` and `"unless"` (Naga Shugenja: +1F to every Naga card; Evil Portents: Shadowlands Personalities and Followers +1F/+1C, every other Personality −1F/−1C); a match's `"clan": "yours"` is the player's clan. `{"set": {"clan": "yours"}}` (until 2026-11-09 `{"align": true}`) aligns the cards with the player's clan, losing their own (Oath of Fealty, with +1F/+1C `"until": "ever"`; tagged with the clan). `{"swap": ["force", "chi"]}` switches two of the target's stats until the end of the turn (Energy Transference; its `"iftarget": "theirs"` destroys the spell only when the target is another player's). `{"scale": {"force": 2, "chi": 2}}` multiplies the target's stats for the rest of the game, once a card (Immortal Steel; tagged "F ×2, C ×2"; until 2026-11-09 `{"double": true}`). `{"flag": "nodestroy"}` (until 2026-11-09 `{"nodestroy": true}`) marks a card for the turn: an army containing it destroys neither the opposing army nor the Province at Resolution (Mists of Illusion; tagged "Can't destroy"). `{"strength": n or {"of": "discard"}, "to": "target" | "provinces"}` changes a Province's Strength, until the end of the turn unless `"until": "ever"`, which stops at zero (Castle of Water and The War Fortress of the Crab +3 on a Province, picked by tapping it or its card; Isawa Tadaka on all the player's Provinces by the Focus Value discarded; Alhundro Cornejo −1 for good); a changed Province shows a "Str +3" badge and the battle totals count it. An action's `"anywhere": true` can be used in a battle the player has no units in. `{"battle": "defending" | "attacking" | "unopposed"}` and `{"once": "turn"}` say when an action may be used (Earth Dragon once a turn while defending). A token's `"hold": true` keeps it only while the card stays bowed in play (Bayushi Kachiko's seduction token; straightening her by hand, or her leaving play, takes them all off). Since 2026-11-08 Tsuburu no Oni and Kachiko's extra token each turn are triggers (below). Gaijin Mercenaries needed nothing new. Written on 14 Imperial cards; the `l5r/fields` description of `play` has these since version 23.

### Cards: draw, discard, look, search (2026-11-06)

`{"draw": n}` draws from the player's Fate deck (Look into the Void, Isawa Kaede). `{"discard": true}` on a Province target discards its card, and the Province refills as usual (Kaede on the player's own, Winds of Change on anyone's). `{"discard": {"random": n}, "to": "opponent"}` discards hand cards at random (Kuni Yori), `{"discard": "hand"}` all of them (Void Dragon). `{"look": "hand" | "provinces", "to": "opponent"}` lets the player see the other player's hand or face-down Province cards (Ninja Spy); the log names them to the looker alone and tells the table a look happened. `{"look": {"count": n | {"of": "x"} | {"of": "discard"}}}` lets the player look at that many face-down cards of anyone's on the table (Oracle of Wind's X Gold, Isawa Uona's Focus Value): another player's face-down card then has "Look (N left)" in its menu. A target's `"facedown": true` is a face-down card on the table that isn't in play; `{"turn": true}` turns it up (Call Upon the Wind). `{"test": {"pile": "draw", "field": "focus", "above": "ph", "then": [{"dishonored": "target"}, {"destroy": true}]}}` makes the target's controller discard the top Fate card: a Focus Value above its Personal Honor runs the `then` effects on it, here dishonoring it, then destroying it (Test of Honor; until 2026-11-09 `{"test": "honor"}`). `{"search": "fate", "draws": 1}` opens a search of the player's Fate deck from which only that many cards may leave, to the hand, and the deck is shuffled when the search ends (Walking the Way). `"after": "provincefell"`: the battle just resolved destroyed a Province with this card in the attacking army (Void Dragon); `"after": "enddraw"`: the End Phase just drew into the player's empty hand (no card uses it since 2026-11-09: Ring of the Void's draw is the modifier `phasedraw`, below). An action's `"inplay": true` can't be used to play the card from the hand. Written on 12 Imperial cards (13 actions); the `l5r/fields` description of `play` has these since version 24.
With more than two players still in (2026-11-09), `"to": "opponent"` means the player picked as the action is played (the table asks "on which player?"), and Declare attack asks which player to attack; with two, it's the other player as before. Since 2026-11-15 (`opponent: choose`, version 168) the pick is required: an action that means the opponent is refused without one ("pick which player"), never given to the next player by default.

### Move, remove from battle, send home, assign (2026-11-06)

**Today's words (since 2026-11-18): every move is `{"move": who, "to": where}`**, like `bow` and `destroy`. `who` is `"self"`, `"host"`, `"target"`, `{"target": n}`, `{"named": name}`, `"all"` (with `"all": {"whose"}`, `"other": "picked"`) or `"event"` (the Event an effect is about). `where` is `"home"` (Retreat, Block Supply Lines, Miya Yoto with `"bow": true`; Kakita Yuri without; Nageteppo `{"move": "host", "to": "home"}`), `"area"` (assigned to the battle being fought: Oracle of Water, Forced March), `"here"` (into this battle: Traversable Terrain), `"switch"` (Way of Deception), `{"target": n}` (the Province picked as target n: Isawa Tomo, Superior Tactics), `{"host": who}` (onto another card, under its controller: Iuchi Karasu, Ninja Thief, Ratling Thief), `"play"` (into play, entering it: the Rings, Mountain Goblin and Oni no Shikibu with `"self"`; Feign Death, Animate the Dead, Necromancer, Scribe, Cloak of Night, Forgotten Tomb, Rise of the Phoenix with a target and `"onto": who`, `"control": "owner"`, `"face": "down"` + `"reveal"`, `"pay": "cost"`, `"aged"`), `{"under": "self"}` (under this card: Forgotten Tomb, The Armor of Sun Tao), `{"zone": zone}` (a duel's Focus), `{"deck": "bottom"}` (Avoid Fate). With it: `"require"` (a card that doesn't fit isn't moved), `"name"` (the cards moved, for `{"named": name}` later), `"then"` / `"else"`, `"enter": false` (nothing happens as it enters: Unexpected Allies). The words in the paragraphs below and above that say `home`, `{"move": "battle"}`, `{"move": n}`, `{"attach": n}`, `{"intoplay": true}`, `bring`, `put` and `insert` are how these were written before; written that way now, an effect does nothing.

**Today's words (since 2026-11-18): every flip is `{"flip": who, "to": "up" | "down" | "toggle"}`** ("flip", not "turn": turning is rotation). `who` is `"self"`, `"host"`, `"target"`, `{"target": n}` or `{"named": name}`; a Province target means the cards in it. Options: `"stay": true` (a Province's card flipped down isn't flipped up at its player's next Events Phase: Bayushi Kyoto), `"show"`, `"require"`, `"name"`, `"then"`, `"else"`. `"toggle"` flips a face-up card down and a face-down one up (no L5R card uses it). A card in play flipped up by an effect enters play, with its `enter` effects; flipped down it stops counting and nothing else happens. A flip by hand (Flip face up / Flip face down in the card's menu) never runs `enter` effects, except a card a card put into play face down (Cloak of Night), which does what that card says. `{"flip": {"pile": ...}}` (Unexpected Allies: the top card of a deck flipped over, then into play or discarded) is its own word. The older `{"flip": "down", "to": "target"}` and `{"flip": true, "to": "target"}` are removed: written that way an effect does nothing (ootv-play [#524](https://github.com/Oracle-of-the-Void/ootv-play/pull/524)); Bayushi Kyoto and Call Upon The Wind are on the new word.

**What an effect's result runs (since 2026-11-18, ootv-play #525): `"case"`.** An effect can carry `"case": {result: [effects], "else": [effects]}`: the list for its result runs. `"then"` is short for the result `"done"`, and `"else"` runs for any other result that has no list of its own. Bow, straighten, destroy, discard, remove, move and flip end `"done"` (every card ended so) or `"failed"`. An effect that opens a duel (`{"open": {"scene": "challenge", ...}}`) ends `"win"`, `"lose"`, `"tie"`, `"refused"` or `"none"` (there was nobody to challenge), read for one side: the effect's `"side"` (`"challenger"` or `"challenged"`; left out, the side of the card's player). A tie with no `"tie"` list runs `"lose"`, since both duelists lose a tie. Enough Talk!: `{"open": {...}, "side": "challenger", "case": {"win": [{"negate": {"keywords": ["Political"]}}]}}`. The lists run once the duel is over. Four cards use this (Defend Your Honor, Enough Talk!, Mamoru, Ratling Thief). The earlier form, `"on": {"win": {side: [...]}, "lose": {side: [...]}, "refused": [...], "none": [...]}` inside `"open"`, is no longer read: a card still written that way opens its duel and does nothing on the result.

**The other results (ootv-play #527).** A pick, `{"must": {...}}`: `"case": {"none": [...]}` runs when there is nothing to pick (Shuten Doji loses 3 tokens), `{"declined": [...]}` when a pick the player may skip is skipped, and `"then"` once the picking is over, whoever picked (Encircled Terrain: the other units go home). An asked payment, `{"demand": {...}}`: `"case": {"short": [...]}` when it can't be paid (Oni no Ogon, Gaijin Mercenaries), `{"declined": [...]}` when a payment the player may skip is skipped; with no `"declined"` list, `"short"` runs. A bid, `{"bid": {...}}`: `"case": {"more": [...], "tie": [...]}` (A Gift of Honor). A test, `{"test": {"pile", "field", "min"}}`: `"then"` when the discarded card's value is above the target's, `"else"` when it isn't, `"case": {"none": [...]}` when there is no card to discard; each is done to the target (Test of Honor). Two words that used to be `"then"` and are not results: `"end"` beside `"lasting"` is what happens as the lasting effect ends (Dead Walk The Earth), and `"bought"` beside `"produce"` is what the card bought with that Gold gets (The Sacred Temple of the Phoenix). The eight cards named here are written this way. The earlier places for these lists (inside `"must"`, `"demand"`, `"bid"` and `"test"`, and `"then"` beside `"lasting"` and `"produce"`) are no longer read: a card still written that way does nothing with the result.

**A choice in a duel's outcome (ootv-play #529).** A duel's `"lose"` or `"win"` list can ask that side's player to choose, with the same `"choose"` any play code uses: `{"choose": {"by": "loser", "text": "Commit seppuku, or be dishonored?", "options": [{"text": "Commit seppuku", "effects": [{"destroy": "loser"}]}, {"text": "Be dishonored", "effects": [{"dishonored": "loser"}]}]}}` (Doji Hoturi). The duel waits until the choice is made, then ends. `"loser"` and `"winner"` in the options' effects are those duelists. The earlier form, `{"choose": true, "to": "loser"}` with the options in the config's `scenes.duel.choices`, no longer does anything, Doji Hoturi is rewritten, and that config list is removed (the mentions of it further down are history).

**Wider choices (ootv-play #530).** Any option of a `"choose"` may carry `"if": {...}`: it is offered only while that holds. An option may carry `"result": "name"`: after its effects, the effect's own `"case": {"name": [...]}` runs. An option for each card, `{"each": "card", ...}`, takes `"whose": "yours"` or `"theirs"` (the chooser's own cards, or not) and `"text"`, shown before each card's name. No card uses these yet.

**Reactions while a choice waits (ootv-play #531).** While a player is being asked a `"choose"`, Reactions may be played, by anyone. A Reaction to the action that asked takes the table back to it: the question is asked again afterwards, or not at all if the Reaction cancels that action. Nothing else can be done until the answer. A choice written with `"reactions": false` allows no Reactions either.

**A game's own effects (ootv-play #532).** The play config can define an effect once, out of other effects, under `effects`: `{"name": {"params": {"n": 1}, "effects": [...]}}`. A play code that says `{"name": {"n": 2}}` then does what the definition says, with its own values filled in, so a card only states what is particular to it. Inside a definition, `{"$": "n"}` stands for the value given, `"$with"` adds the keys of an object given, and `"$when"` / `"$unless"` keep a step only when a value is given / not given. L5R defines none yet.

**A challenge's answer (ootv-play #533).** The question a challenged player answers is no longer built into the engine. It is a choice in the play config, on the challenge's step: `scenes.challenge.steps[0]` is `{"name": "Answer", "asks": "challenged", "into": "duel", "refuse": "refuse", "start": [{"choose": {"by": "challenged", "always": true, "text": "Accept the challenge?", "options": [...]}}]}`. Accept is `{"duelset": {"accept": true}}`; Refuse is `{"duelset": {"refused": true}}` and is left out when the challenge can't be refused. On the table the buttons are in the duel's panel as before, and Reactions may be played while the question waits. When the challenged Personality is still to be picked (Defend Your Honor), accepting asks a second question with a button for each Personality that may accept; it is no longer picked on the table. No card's play code changed. The earlier step words `answer` and `accept` (mentioned further down) are history.

`{"home": "bowed" | "unbowed" | true}` sends the target's unit home from its battle: bowed (Block Supply Lines, Retreat, Miya Yoto), unbowed (Kakita Yuri). `{"move": "battle"}` assigns an unassigned unit of the player's to the battle being fought (Oracle of Water); `{"move": n}` moves the target's unit to the Defender's Province picked as target n (Isawa Tomo, Superior Tactics); `{"move": "switch"}` has two units trade places, assigned or at home, without moving (Way of Deception). `{"attach": n}` moves the target, attached to a Personality, to the Personality picked as target n, under that Personality's controller (Iuchi Karasu's Follower, Ninja Thief's Item). `{"endbattle": true}` sends every unit at the battle home bowed and ends it without resolution (Torrential Rain). `{"destroy": "terrain"}` destroys the Terrain at the battle being fought (Superior Tactics, whose either/or is two actions, as its Soul of the Empire printing has it). `{"ambush": true}`: target 0 (the player's unit) and target 1 (another player's) fight a battle of their own in the Action Phase, on a battlefield made for it (an empty zone, no Province card, Region, Fortification or Stronghold Strength; Strength 0) that is removed when the battle ends; no other unit joins it or moves from it, and the next player acts after it (Ambush). `"while": {"battle": {"force": "ahead"}}` makes an effect happen only while the player's army has the higher Force (`while` takes a gate name or the same battle conditions the gates use; until 2026-11-09 `"ahead": true`), and `"to": "leader"` aims it at the Personality leading the target's unit (Retreat's dishonor, seen before the unit leaves). Gates `{"battle": "defender"}` (only as the Defender: Kakita Yuri) and `{"battle": "outside"}` (only at a battle where the player has no units and isn't the Defender: Miya Yoto). Targets `"whose": "attacking" | "defending"` (a unit on that side of the battle being fought), `"whose": "defender"` on a Province, `"at": "battle" | "assigned" | "home"`; `"unbowed"` on a unit is its Personality's. A Gold cost `{"of": "unit"}` is the target unit's Force, its unbowed cards counted (Kakita Yuri). A modifier, `"modifiers": {"Imperial": {"assign": "defender"}}` (until 2026-11-09 `"assign": {"Imperial": "defender"}`): while the card is in play, the defender assigns first in each Maneuvers segment of its owner's turn (Ring of Water). Written on 13 Imperial cards (14 actions); the `l5r/fields` description of `play` has these since version 25.

### Copy, rule changes (2026-11-06)

`{"perform": {...}}` produces another card's action now, as this card's: the player picks a card in play and which of its actions, then that action's targets. `"action"` limits which actions (`{"keywords": "Elemental"}`), `"from"` which cards (`{"keywords": "Oni"}`); its timing must be open; its costs aren't paid (this action's are the price) unless `"pay": true`, and its "destroy this card" is left out; `"once": {"per": "source", "if": "selfdestroys"}` copies each card once, and with `if` only an action that destroys its own card (Naka Kuro: a spell that must be discarded, once; until 2026-11-09 `"discarded"`). `{"copy": {...}}` (`"learn"` until 2026-11-14) gives the picked action, copied as it is, until the end of the turn, used with its own costs, so a bow cost makes it once a turn and an action without one can be used again (the user: "the action is copied perfectly"): the target's own action with `"source": "target"` (Water Dragon, Ninja Shapeshifter's "one ability"), to the target with `"to": "target"` (Reflective Pool) or to the card this one is on with `"to": "host"` (Mask of the Oni). `{"mimic": "force" | "chi" | "ph"}` takes the target's value for the turn (Ninja Shapeshifter; its four choices are four actions sharing one `{"once": "turn", "key": "copy"}`). `{"redirect": {"match": {"type": "Spell"}}}` (`match`: what may be redirected, which also words its errors; until 2026-11-09 `true`), a Reaction to a spell being used: its effects are undone (its costs stay paid) and done again at targets the player picks anew, as its caster's (Ring of Air, once a turn). `{"priority": "attacker" | "defender" | "you"}` with the gate `{"battle": "start"}` (before anyone has acted in the battle): that player takes the next action in the battle (Sneak Attack: the Attacker). `{"attack": {"attacker": "you", "defender": "lastattacker" | "lastdefender"}}` with `"after": "attackend"` (an opponent's attack in which you were the Defender has just ended): an extra Attack Phase, named for the card on the table, in which you attack the former Attacker; the phase it was played in goes on after (Counterattack). `{"straighten": {"record": "battle", "path": "bowedby"}}` with `"after": "fought"`: your cards the battle's combat bowed straighten (Rallying Cry). Until 2026-11-09 these three were `first`, `counter` and `unbow`. The Rings' conditions: `{"hand": "empty"}` (no other card in your hand: Ring of the Void), `{"produced": 3}` (three spells or Shugenja abilities used this turn: Ring of Air), `"after": "terrains"` (in the battle just resolved you destroyed a Terrain, played a new one, and destroyed an army or a Province: Ring of Water). `"gain"` also takes `"until": "turn"`, `"uses"` and `"to": "self" | "host"`. Water Dragon's action has the gate `{"phase": "Events"}`, and the card rule `"waits": {"Imperial": {"phase": "Events", "action": 0, "prompt": "Copy an ability…", "note": "may copy an ability"}}` (the phase box's words come from it since 2026-11-09) keeps the Events Phase from going on by itself while the Dragon is in play and hasn't copied this turn (the user: "no reason the water dragon couldn't suspend the auto-proceed"): its owner gets Copy an ability… and, while last turn's Shugenja is still in play, Keep (the same copy); the phase button goes on without it. Written on 11 Imperial cards (12 actions); the `l5r/fields` description of `play` has these since version 26, Water Dragon's `waits` since 27. `"with": [effects]` on a copy adds effects to the copied action (the user, 2026-11-14: "it needs to accept arguments that are tacked on to the ability"); `{"unmake": "turn"}` in an action: what it makes (tokens on cards, made cards, lasting stat changes) goes at the end of the turn. Ninja Shapeshifter copies with `"with": [{"unmake": "turn"}]` (its ruling: "All effects of a copied ability are destroyed or removed at the end of the turn"); ootv-play [#458](https://github.com/Oracle-of-the-Void/ootv-play/pull/458).

### Bow, straighten, dishonor; Gold and costs; Cavalry; Terrain swaps (2026-11-06)

The last four groups of card actions (the user: "Do all 4 groups"), 23 actions on 22 Imperial cards. `{"bow": "target"}` bows a target and `{"straighten": "target"}` straightens one; `{"bow": {"target": n}}` the cards of target slot n, for an action that also bows one of your own cards (Sake Works, Yasuki Taka); `{"straighten": "host"}` the card it's on (Spirit Guide straightens its Shugenja). `{"nostraighten": ...}` keeps the target bowed: `"bowed"` while this card stays bowed, which its player chooses at each of its Straighten Phases (Kolat Servant; straightening it lets go), `"there"` while this card is on the table (Shady Dealings, with `"to": "stronghold"`), `"next"` at its controller's next Straighten (Summon Faeries, only with a Phoenix caster: `"by": {"clan": ["Phoenix"]}`). Ikoma Ujiaki's gate `"after": "killed"` with `"killed": {"clan": ["Lion"], "type": "Personality"}` needs one of your Lion Personalities destroyed in the battle just resolved; his target's `"army": "opposed"` is one that was in the army facing yours.

`{"gold": n}` or `{"gold": {"of": "discard"}}` produces Gold for you (Shady Dealings' 5; Asahina Tamako: the discarded card's Focus Value). `{"goldplus": 1, "match": {"type": "Holding"}}` makes every Holding that produces Gold produce one more this turn (Bountiful Harvest). `{"free": match}` makes the next card of yours that fits, with a number Gold Cost, come into play free this turn (School of Wizardry, since 2026-11-14 offered as you bring a Shugenja Personality in, not a Naga, Nonhuman or variable-cost one; Alhundro Cornejo, since 2026-11-14 `"free": "bringing"`: the Explosives card being played as his Reaction goes with it); the table doesn't ask about paying for it. Shady Dealings stays in the active area until it's repaid: its second action (Limited, 5 Gold) destroys it, and the Stronghold may straighten again.

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

`{"add": {"force", "chi", "ph"}}` or `{"strength": n}`, to `"self"` (the default: an Item's own bonus), `"host"` (the card it's attached to: Night Medallion, Apprentice), `"unit"` (the other cards in its unit that fit `"match"`: Naga Warlord), `"inplay"` (Greater Mujina's Lesser Mujina), `"attackers"`/`"defenders"` (units at the Province it's on: Moat, Fort on a Hill, Barbican) `"province"` (its Strength: Unscalable Walls) or `"provinces"` (every standing Province of its player, from anywhere in play: Ring of Earth's +3). `"per": {"match", "in": "unit" | "army" | "opposing" | "yours" | "inplay" | "discard", "other", "tokens"}`: so much for each card that fits, counted from the card receiving the bonus (its own unit; its army or the one facing it only while that battle is fought) (Ratling Bushi's Ratling Packs; an Ancestral Sword's clan Personalities you control; since 2026-11-22, ootv-play #738). `"if": {"host": match}`: only on a Personality that fits (an Ancestral Sword on its own clan). `"when": "attacking" | "defending"` (Hida Tampako, Otaku Kamoko). `"opposed": match`: while facing such a card in a battle or a duel (Crystal Katana, The Jade Hand: Shadowlands). `"while": ["spell", "innate"]`: while its Shugenja uses a Spell or his own ability (Apprentice; Agasha Tamori spells only).

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
- **Gold for one kind of card** (an effect's `{"gold": n, "for": a match or a list}`): Blacksmiths' 4 for a Weapon or Armor, Forest's 2 for a Nonhuman or Creature Personality or Follower, Jade Works' 5 for a Jade card, the Temple of the Phoenix's 5 or 7 for a Spell or Shugenja. Each is an action in the card's menu (bowing it); since 2026-11-14 the Temple's is offered as you bring a Spell or Shugenja in instead, its Gold for that card alone. The Gold is kept apart and pays for the next card that fits, with no "did you pay?" question; paying for anything else loses it, as Gold produced is, and it goes at the end of the turn. The Temple's 7 (`"then": {"noproclaim": true, "gain": {"keywords": ["Shadowlands"]}}`): no Honor for buying a Shugenja of your clan with it, and the Shugenja (or the one a Spell attaches to: "the Shugenja involved") gains Shadowlands for as long as it is in play.
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
- **Solar Eclipse** (code rewritten 2026-11-09 to the `negate` rule above): every lasting change an action makes carries the type and traits of the card that made it (the user: "they should be tagged with the card type who caused it and the traits of that card as well"). While the eclipse lasts, changes from a Spell, or from a Personality with the Shugenja trait, are turned off; they come back afterwards unless they ran out. An attached Spell's printed bonus counts for nothing meanwhile. Since 2026-11-14 the same goes for tokens such a card put on cards (set aside, back afterwards) and for a card whose control it took (back with its owner meanwhile, then with the taker again if it's still in play).
- **Cloak of Night** (code unchanged): the face-down card is revealed with Turn face up in its menu, which is an Open action. If it can't legally attach then, it's destroyed; otherwise it enters play with its on-entering effects. While face down it adds no Force.

Written on Rally Troops, Ring of Earth and Togashi Mitsu (ootv-backups operation 2026-11-08T174227-play-actions, plan ootv-tools `work/field-fixes/imperial-play/plan-byhand-2.json`); `l5r/fields` version 38 describes the new keys.

### Imperial cards finished out, third set (2026-11-08)

The next batch (the user: "build the next batch"), ootv-play [#119](https://github.com/Oracle-of-the-Void/ootv-play/pull/119):

- **Unique** (The Egg of P'an Ku): no Unique card comes into play while a Unique card of the same name is in play (Scorpion Clan Coup p. 28). This is checked for a buy, a hand card attached, and a card's "bring into play". A card Unexpected Allies turns over is discarded instead, and a Region isn't attached. Moves by hand aren't checked. It goes by the card's own printed title and traits, so the Egg copying a Unique Personality is still the Egg ("the Unique trait only applies to its identity as the Egg"). Imperial's book (p. 25) is stricter: "Two cards with the same name cannot be in play simultaneously if either is labeled Unique". The table follows Scorpion Clan Coup, as it does for the rest of this arc.
- **Fan of Command**: its Personality gets Battle: Tactician in its menu (`l5r/play` version 24, `traitactions`, above; `ruleactions` since version 174). Imperial's book (p. 47, "Tactics") adds the value at Resolution instead.
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
- **Chi reduced to zero** (SCC p. 53: "If the Chi of a Personality drops to zero for any reason, that Personality is destroyed"): config `statdestroy {"stat": "chi", "match": {"type": "Personality"}}` (`statdeath` until version 140). Checked after each action; the Personality goes with its attachments, Honorable Dead unless dishonored. One printed at 0 Chi isn't reduced and stays.

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
- **Another player's action, after your own answer:** your answer to a question another player's scene asked is their action to you. Refusing an Iaijutsu Challenge costs you 7 Honor by the challenger's action, so Defend Your Honor (`{"after": {"event": {"by": "other", "counter": {"lost": "honor", "who": "you"}}}}`) may answer it, and its `actor` is the challenger.
- **Bayushi Goshiu:** `{"after": "honorloss"}`, then your loss `{"of": "lost", "who": "you", "times": -1}` to another player.
- **Shosuro Taberu** (Political, as his Battle of Beiden Pass printing): `{"after": "holdinghonor"}`; you gain what the other player gained, and they lose it.
- **Togashi Gaijutsu:** `{"after": "boughtfull"}`, a target of yours with clan Dragon and the Samurai trait: no Personal Honor gain, the top Fate card discarded, its Focus Value in Force and Chi for good.
- **Crystal Arrow, Jade Arrow:** gate `{"capable": "ranged"}` (the Personality has a Ranged Attack of its own, gained, or from another attachment); `{"ranged": {"sure": true}, "any": true}` (destroys the card whatever its Force; counted as a Ranged Attack); the host bows, the arrow is destroyed. Crystal only at an opposing Shadowlands card.
- **Han-kyu, Ikiryo:** `"withfollowers": true` (may hit a Personality with Followers). Ikiryo: Ranged equal to its Personality's Chi, Honor lost `{"of": "host", "field": "chi", "times": -1}`, its Personality dishonored, Ikiryo destroyed.
- **Kitsu Motso:** Battle, cost `{"bow": "self", "token": {"name": "Master"}}`, `{"again": 2}`: his player takes the next two actions before the next player (a pass ends it).
- **Twist of Fate:** `{"after": "dynastyend"}`, `{"window": {"timing": ["Limited", "Open"]}}`: one Limited or Open card action in the End Phase, offered in the menu. Lobbying is shut out; "You may not attach cards" is left to the players (to look at again).

Written (ootv-backups operation 2026-11-09T233800 play-actions: play codes on 10 cards, read back from the table, all match; and the printed text of five printings that had none, read from their scans: Shosuro Taberu and Crystal Arrow, Battle of Beiden Pass; Ikiryo, Emperor and Gold; Twist of Fate, Emperor). No Holdings; the reprinted cards' numbers were checked with the redirects group.

### Shadowlands, Province and Stronghold rules (2026-11-09)

ootv-play [#254](https://github.com/Oracle-of-the-Void/ootv-play/pull/254), [#255](https://github.com/Oracle-of-the-Void/ootv-play/pull/255) (by the cards' rulings); `l5r/play` version 64 (modifier `ruin`), `l5r/fields` version 67.

- **Bayushi Kyoto:** Limited, bow, a Province target: `{"turn": "down", "stay": true}`. Its card goes face down and isn't turned up at its player's next Events Phase; a face-down one is kept down too ("May be used on a face-down Province").
- **Desperate Measures:** an Event: `{"province": "destroy", "which": "self"}` first, then a pick `{"province": true, "other": "self"}` (any other Province still standing, from buttons in the pick bar) whose effects destroy the one picked (`"which": "picked"`) and take 5 Honor. In its player's last Province they lose at once and there's no pick ("you lose immediately and no more effects are generated", Rules Archive p. 70).
- **Oni no Kamu:** as he enters, lose 6 Honor and the Stronghold is bowed; while he's in play, however he came in (`play.holding`, since 2026-11-14: brought in by Unexpected Allies it isn't bowed but still stops), the Stronghold doesn't straighten, produces no Gold and takes no actions of its own; continuous effects still count (as ruled). An `Oni turn` token as each of your turns begins, destroyed in the End Phase at three ("Its three-turn lifespan only counts your full turns", FAQ 3.1).
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
- **One reader (2026-11-22, ootv-play [#737](https://github.com/Oracle-of-the-Void/ootv-play/pull/737)):** every `prevents` and `negate` entry is read in one place, with all its keys, for whatever is being tried (an action, a target, an assignment, a move, a focus, a destroy, a straighten, a draw, a win). Whose attempt it binds: `"on"` (`"self"`, `"unit"`, `"yours"`: what is done to it, to its unit, to its player's cards), `"who"` (other cards that fit), `"side": "other"` (another player's cards). With none of these, an entry with `"where"` binds everything tried at that place (Deadly Ground, Fog: the battle it is at), and without `"where"` it binds the card itself (or its player: Ring of the Void's draw). Then `"by"`, `"where"` (`"battle"`, `"duel"`, `"here"`, `"yours"`), `"step"`, `"from"`, `"match"`, `"with"`, `"against"`, `"moves"`, `"stat"`, `"unless"`, `"while"`, `"if"`. An entry with a key or value nothing reads is refused and never in force (none of the written codes has one). Soshi Bantaro's immunity to Fear now holds only while he is at the battle; Mists of Illusion's Personality outside a battle no longer keeps a duel's loser alive.
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

- **Obsidian Mirror** (the user: "the card doesn't disallow targetting yourself"): `to: 'player'`, any player still in, yourself too, asked before the name. The name matches a card by its title or its short name (the title less its first word, a family name; less `(...)`, an epithet and "Experienced"): "Toshimoko" is Kakita Toshimoko, experienced too, not Toshimoko no Sensei. Since 2026-11-14 the name box takes only a real card's title (the titles face up on the table, and the card search's as you type), so a miss is a miss; until then the other player could discard a card close enough by hand.
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
(`{"move": "scene", "to": "home", "bow": true, "whose": "attacker"}`). A change made for a while can now last
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
scene, `scenes.main`, open for the whole game. Its steps run in order as a game is made: Setup (its `start` effects since version 195, `setup` before: the shuffles
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
- Ring of Water still has the Defender's side, its allies too, assign first. Since 2026-11-14 only when its player uses its benefit, in their own attack before any unit is assigned ("you may"), and for that attack.

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
- With three or more players (2026-11-15, ootv-play [#474](https://github.com/Oracle-of-the-Void/ootv-play/pull/474)):
  a player on neither side says which side each speaker or gift backs, the Favor's holder or the lobbier (SCC
  pp. 50–51); the table asks. Before, it always went to the lobbier.
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


## One resolution and verdict for every scene (2026-11-11, l5r/play version 122)

Engine generic step 8d ([ootv-play #363](https://github.com/Oracle-of-the-Void/ootv-play/pull/363)): battles, duels
and lobbying resolve and word their verdict the same way. The rules that hold give the winner and the losers. The
scene's `outcome` then applies to each side, and each rule's own effects run. A card put down by a move (a focus card)
can still set the result.

- `scenes.<id>.resolved {moment, before}`: the moment fired for each side's cards once the scene resolves.
  `scenes.battle.resolved: {moment: "battleend"}` fires after the losers are destroyed, for the cards still in play.
  `scenes.duel.resolved: {moment: "duelresolved", before: true}` fires before the loser is destroyed.
- The log line for the count is named by the step ("Strike: …", "Resolution at …: …", "Count: …"). The verdict follows
  in one shape: "Kakita Toshimoko (Player A) wins: Doji Hoturi commits seppuku or is dishonored.", "A tie: both are
  destroyed.", "Nobody wins: nothing happens."
- The last battle's record names its winning side, not that side's player.

## One check for opening any scene (2026-11-11, l5r/play version 123)

Engine generic step 9d ([ootv-play #366](https://github.com/Oracle-of-the-Void/ootv-play/pull/366)): what may open an
attack, a battle, a challenge or a lobbying effort is now a piece of each scene's config, `scenes.<id>.opens`, and one
check reads it for every scene.

- `turn`: the turn's player opens it. `alone`: one at a time (`"scene"`), or not while anything else is going on
  (`"any"`). `token`: the token it is for; its holder can't open it. `timing`, `perturn` (once a turn).
- `against`: the player it is against may be named. `at: "pick"`: an area the scene around it is picking now.
- `cards`: the cards it is opened with, in order: what kind (`who`), yours or another player's (`own`), `unbowed`,
  `above` (a stat above zero, and not dishonored), `bow` (bowed as the cost). `to`: whom its moves go to ("the Emperor").
  Since version 198 each is written like any target, `{"match", "whose", "unbowed", "any", "bow"}`: see "Opening cards
  as targets, cancels and counter routes" at the end.
- Then a held rule naming the scene (Emperor's Peace), the player's prevents (Twist of Fate) and the card's (Kakita
  Yoshi) are checked as before. A held rule now reads the same for every scene: "no player may lobby: Quiet Court,
  until …".
- Moved: the Imperial Favor's `lobby` block went to `scenes.lobby.opens` (its `keyword` stays on the token, for its
  uses too); `duel.who` went to `scenes.challenge.opens.cards`.

## Placing units in turn as a general step (2026-11-11, l5r/play version 124)

Engine generic step 9e ([ootv-play #367](https://github.com/Oracle-of-the-Void/ootv-play/pull/367)): whose turn it is
to assign units is kept by the scene whose step has `assign`, not by attack code. Its words come from that scene's
config, `scenes.<id>.assign.words`: L5R `scenes.attack.assign.words` says "assigns", "assigns or passes", "passes",
"is done assigning", "assigning", "assign", and "the attack" / "the defense" for a side an ally joins. The table reads
as before. A game whose config gives no words gets plain ones ("places", "is done placing").

## One scene view, and the table's open buttons from config (2026-11-11, l5r/play version 125)

Engine generic step 10c ([ootv-play #370](https://github.com/Oracle-of-the-Void/ootv-play/pull/370)): the scene panel
for a battle, a duel and a lobbying effort is built one way, from the scene's config: what the step asks (an answer,
turns of moves, a count), the sides and their totals, the moves. Totals stay hidden while a scene's cards are face down
(a duel's focus cards) until its count. Words the table used to fix itself now come from config:

- `scenes.<id>.opens.name`: the button or menu item that opens a scene. L5R: `attack` "Declare attack" (with `ask`
  "Attack which player?"), `challenge` "Create challenge", `lobby` "Lobby" (shown as "Lobby for the Imperial Favor").
- `scenes.<id>.area {name, many}`: the words for the areas a scene is fought at. L5R `battle`: "battlefield",
  "Battlefields" (the phase button, the turn mark, the Battlefields pane).
- A count step's `button`: the count's button. L5R lobbying's Count step: "Count"; with none, "Resolve the <scene>".
- The phase button's "end the attack", "resolve the battle", "(no attack)" use the scenes' own `name`s.

The table reads as before.

## Cards name scenes by their config id (2026-11-12, l5r/play version 126, l5r/fields version 86)

Engine generic step 11b ([ootv-play #373](https://github.com/Oracle-of-the-Void/ootv-play/pull/373)): 74 L5R cards'
play codes were rewritten so they name a battle, duel or attack by its scene id instead of words built into the engine.

- `open {scene, ...}`: opens that scene on those terms (a duel effect: `{"open": {"scene": "challenge", ...}}`; the
  Emerald Champion's series: `champion`; Counterattack: `attack`). Was `duel`, `challenges`, `attack`.
- `in {scene, ...}`: while that scene is on, or just after it under `after` (`{"in": {"scene": "duel", "stage": ...}}`,
  `{"in": {"scene": "battle", "role": ...}}`, a named gate `{"in": {"scene": "battle", "is": "defending"}}`). Was
  `induel`, `battle`, `after.attack`.
- `sceneset` (was `duelset`), `sceneput` (`duelfocus`), `sceneend` (`endbattle`), modifier `placebow` (`attackbow`),
  `"sidecard"` (`"duelist"`), targets `side` / `atarea` (`army` / `attacked`), `"groups"` (`"army"`), `move: "area"`
  (`move: "battle"`), `if {side: "attacking", has: ...}` (`if {attacking}`).
- Config: `afters` battledestroy / terrains use `in {scene: "battle"}`, `afterwords.battle.destroyed.groups`,
  `modifiers.placebow`, `bringin.values` `area`. The card field description (`l5r/fields` play) lists the new words.

Undo record: ootv-backups `reverts/2026-11-11-l5r-play-actions.jsonl` (operation 2026-11-12T043954-play-actions).

## Once a scene, flags and scene choices from config (2026-11-12, l5r/play version 127, l5r/fields version 87)

Engine generic step 11c ([ootv-play #374](https://github.com/Oracle-of-the-Void/ootv-play/pull/374)), no card writes:

- `once: <scene id>` works for any scene, not only `battle`: once each time that scene is open (an effect's, or an
  effect kind's: Fear). The card field description (`l5r/fields` play) says so.
- `flags` (new): the rules an effect puts on a card for a while, with their words. L5R `mustattack` (Shosuro Tage):
  `{place: "attack", text, why, open}`. These were built into the engine.
- `scenes.duel.choices` (was `duel.choices`): a Duel of Personal Honor's loser's choice, seppuku or being dishonored.
- `effectkinds.ranged.one` / `effectkinds.fear.one`: "a Ranged Attack", "a Fear effect" (a cancel's refusal words).
- Tactician's trait action: its gate is `{"in": {"scene": "battle", "is": "in"}}` (was `{"battle": "in"}`, which the
  engine stopped reading in 11b, so the action could be used outside the battle).

## Duel terms name counters and states (2026-11-12, l5r/play version 128, l5r/fields version 88)

Engine generic step 11d ([ootv-play #375](https://github.com/Oracle-of-the-Void/ootv-play/pull/375)): 16 L5R cards'
play codes were rewritten (your yes, "Yes, all as proposed"):

- A duel's `refuse` / `win` / `lose`: `honor: n` → `add {honor: n}` (negative for a loss), `dishonor: true` →
  `set {dishonored: true}` (Iaijutsu Challenge, Iaijutsu Duel, Test of Might, Test of Stone, Test of the Emerald
  Champion, Hida O-Ushi, Kakita Toshimoko, Mirumoto House Guard, The Hooded Ronin, Doji Hoturi).
- Ki-Rin: `while {honorable}` → `while {not: {state: "dishonored"}}`.
- `if {duel}` → `if {in: {scene: "duel", result?}}` (Bloodsword, Hiruma Kage, Kakita Toshimoko, Tetsubo, The Nameless
  One); Bayushi Hisa's `if {army}` → `if {side: "in", has}`.
- Config: `honor` removed. Added `afters.honorloss` / `offending` / `acted` `{counterloss: "honor"}` and the lobby
  speaker's `not {state: "dishonored"}`. The card field description (`l5r/fields` play) lists the new words.

Undo record: ootv-backups `reverts/2026-11-11-l5r-play-actions.jsonl` (operation 2026-11-12T050702-play-actions).

## L5R concepts out of the engine, wave 1 (2026-11-12, l5r/play versions 129–130, l5r/fields version 89)

Engine generic step 12a–12e ([ootv-play #376](https://github.com/Oracle-of-the-Void/ootv-play/pull/376)–[#381](https://github.com/Oracle-of-the-Void/ootv-play/pull/381)):
the play table's engine no longer knows Gold, spells, Honor, clans or lobbying; `l5r/play` builds them from general pieces.

- **Resources**: `gold` became `resources.gold` (any number of resources side by side) and `purchase` (buying from the
  Provinces, the clan discount, Honor for the full price). Effects say `produce {gold: n}`; Bloom of the White Orchid
  `cost {free: gold}`; Threat of War gives the opponent a trigger at the new `paying` moment that adds "bow a Samurai"
  to each Holding's production.
- **Spells**: no spell rule in the engine; `turncounts.produced` counts actions of a Spell or a Shugenja Personality by a
  match, not from hand and not gained. Agasha Tamori and Apprentice say `if.using`, Hida Kisada `by` a match, Celestial
  Alignment `using`.
- **Honor and clan**: the four ways to win (Military, Dishonor, Enlightenment, Honor) are `victory.checks`; the afters
  are read by shape; clan is a player field from the Stronghold (`roles.stronghold.gives`), seat colours from
  `table.seatcolour`; `honorwaive` → `waive` (The Hidden Temples of the Naga), `withfollowers` → `notwith: false`
  (Han-kyu, Ikiryo), Rally Troops places attached Followers with `with: host`, the Sacred Temple of the Phoenix's
  Shadowlands gain says `to`.
- **Lobbying**: `scenes.lobby.opens.seats` (the lobbier against the Favor's holder or the most Honor), `holds`, and the
  log lines as templates in `opens.says`.
- 21 cards' play codes rewritten (operation 2026-11-12T144649-play-actions, undo record ootv-backups
  `reverts/2026-11-12-l5r-play-actions.jsonl`); the card field description (`l5r/fields` play) lists the new words.

## The attack, battle and duel out of the engine (2026-11-12, l5r/play versions 131–132, l5r/fields version 90)

Engine generic steps 12f–12h ([ootv-play #382](https://github.com/Oracle-of-the-Void/ootv-play/pull/382),
[#383](https://github.com/Oracle-of-the-Void/ootv-play/pull/383), [#384](https://github.com/Oracle-of-the-Void/ootv-play/pull/384)):
the engine no longer knows attacks, battles or duels; `l5r/play` builds them from general scenes.

- **Attack**: a scene whose step opens a child scene at each area (`scenes.attack` opens a battle at each Province); one
  step walker for any scene; a card out at a scene is `card.out`.
- **Battle rules**: what a card's "after a battle..." or "during a battle..." means is a named fact on the open scene or
  its record (`afters`, `gates`: fell, stood, undefended, won, recent, unopposed, ahead, ...); targets say `side:
  same|opposed` and `out: here|true|false`; actions must involve the scene by `scenes.battle.local`; Ambush opens a made
  area (`scenes.attack.make`); the moments (combat, step start/end, attack end, Province fell) are named in config.
- **Duel**: a scene opened with side cards (`scenes.challenge`), its terms (`answer` with refuse or a refusal cost,
  `value`, `premove`, `nomove`, `faceup`, `outcome`, `endfx`), one answer step, `on {win, lose, refused, none}`,
  record rules for the Focus Value (`discardvalue`), and the Emerald Champion's duel against each player in turn.
- 69 cards' play codes rewritten (operation 2026-11-12T155838-play-actions, undo record ootv-backups
  `reverts/2026-11-12-l5r-play-actions.jsonl`); the card field description (`l5r/fields` play) lists the new words.

## Game terms in config, and the table's last L5R words (2026-11-12, l5r/play versions 133–134)

Engine generic steps 12i–12k ([ootv-play #386](https://github.com/Oracle-of-the-Void/ootv-play/pull/386),
[#387](https://github.com/Oracle-of-the-Void/ootv-play/pull/387), [#388](https://github.com/Oracle-of-the-Void/ootv-play/pull/388)):

- **Card play codes are written in the game's own words.** `l5r/play` `terms` maps each L5R word to the engine's
  general element: `bow`/`bowed` → `rot90` (a quarter turn), `unbowed` → `rot0`, `dishonored` → `rot180` (a half
  turn; bowed and dishonored is `rot270`), `straighten`/`rehonor` → `unrot90`/`unrot180`, `unit`/`units`/`ownunit` →
  the group words, `placebow`, `bowout`, `bowedby`, `resolution`. A card editor keeps writing `cost {"bow": true}` or
  `"unbowed": true`; no card had to change for this.
- The UI draws any scene with child scenes in one areas pane (L5R's Battlefields), with its words from config; the
  start page names the game from config.
- The table never uses the word "tap": touch gestures are "press".
- **L5R's words back on the cards** (l5r/play version 135, l5r/fields version 91, [ootv-play #390](https://github.com/Oracle-of-the-Void/ootv-play/pull/390)–[#392](https://github.com/Oracle-of-the-Void/ootv-play/pull/392)):
  61 cards that steps 12b–12h had rewritten in the table's general words say L5R's again (`on: unit`, a target's
  `at: battle|assigned|home` and `side: opposing`, `duelist`, a duel's `unrefusable`, `refuse`, `win`/`lose`, `chi`,
  `duelset`, `endbattle`, `assignlate`, `fought`, ...); `terms` maps a word together with its value and only where it
  belongs, so `chi` as a stat or `win` on Dashmar keep their meaning. Test of Might's "opposing" Personality is read
  against its first target.

## Four Shadowlands cards added (2026-11-13, l5r/play version 147, l5r/fields version 92)

Mantis Bushi, Force of Will, Arrows from the Woods and Darkness Feeds... had been missed when the Shadowlands set was
added. Their play codes now follow the Shadowlands wording, which is each card's only Imperial-arc printing
([ootv-play #413](https://github.com/Oracle-of-the-Void/ootv-play/pull/413); operation 2026-11-13T214501-play-actions,
undo record ootv-backups `reverts/2026-11-13-l5r-play-actions.jsonl`). New words a card can use:

- `{"after": {"event": {"kind": "ranged", "by": "you"}}}`: a Reaction to an action of yours with a Ranged Attack in it.
- `{"raise": {"ranged": 2}}`: the action reacted to has its Ranged Attack that much stronger, before it resolves.
- A Strategy played from the hand can make a Ranged Attack (Arrows from the Woods' "Ranged 2 Attack").
- An amount `{"of": "target", "target": 0, "field": "force"}` reads the card in that target slot (Darkness Feeds...: the
  destroyed Personality's Force and Chi, given to the second target).
- `"until": "nextturn"`: until the end of its player's next turn; the card shows "end of <player>'s next turn".

`l5r/play` gained `afterwords.event.by.you`; the card field description (`l5r/fields` play) lists the new words.

## Mara, Be Prepared to Dig Two Graves, Threat of War; Terrains by code (2026-11-13, l5r/fields version 93)

- **Mara**: two Open actions, one adding a −2F Change token and one removing one; the tokens stack (she has Cavalry while
  she holds any). **Be Prepared to Dig Two Graves**: its target must be in the battle being fought (`"out": "here"`), and
  five of its printings that had no text have it now, read from the scans (operation 2026-11-13T222910-play-actions).
- **Threat of War**: a Holding bowed for its own action's cost is taxed too: bow a samurai with it, or the action is used
  and paid but does nothing ([ootv-play #417](https://github.com/Oracle-of-the-Void/ootv-play/pull/417)).
- **Terrains** ([ootv-play #419](https://github.com/Oracle-of-the-Void/ootv-play/pull/419)): a Terrain can carry
  `{"takes": {"Imperial": [effects]}}`, what it does as it takes effect, in place of the table reading its text. After
  both players pass the Terrain takes effect (any picks it asks for come first, and nothing else can be done until
  they're made), then the battle waits at Resolution for the players to resolve it. New words: `"to": "all"` with
  `"all": {"type", "whose"}` (the cards at the battle), also for `gain` and `{"move": "home"}`; `{"move": "here"}`;
  `must` with `"each": ["attacker", "defender"]`, `"then"`, `"ifpass"`, and a pick's `"where"`, `"type": "unit"`,
  `"unbowed"`, `"whose"`, `"or": {"discard": "hand"}`; `{"fallinstead": [effects]}`; `"unpreventable": true` (Suspended
  Terrain's "This cannot be prevented"); `grant` to `["attacker", "defender"]` (Accessible Terrain).
  All 12 Terrains are written with these codes (operation 2026-11-13T230315-play-actions), and 60 of their printings that
  had no text have it now, read from the scans. Occupied Terrain: the Attacker picks one of the Defender's Holdings as the
  Terrain takes effect; it is destroyed instead of the Province only if the Province falls when the battle is resolved.
  `l5r/fields` version 94. (Since 2026-11-20 a Terrain's `takes` is a `when` trigger and its picks are the chooser's: see
  "Every card on the chooser, Terrains as triggers" at the end.)

## Always-on text by code (2026-11-13, l5r/fields version 95, l5r/play version 148)

Text that works all the time, which the table left to the players, now has code
([ootv-play #423](https://github.com/Oracle-of-the-Void/ootv-play/pull/423)). New words:

- the moment `attackassigned` (`l5r/play` `moments`: `{"assign": "attacker", "when": "first", "face": "up"}`): a unit
  first assigned to attack in the step; its face-up cards' triggers fire (`"when": "every"` would fire each time). With a demand of the card's own player's, `{"demand": {"amount": 3, "from": "you", "may":
  true, "short": [...]}}`, they may pay, or decline and the short effects happen (Gaijin Mercenaries: pay them 3 Gold, or
  they are destroyed; the answer panel shows **Don't pay**);
- a card's own cost: `{"cost": {"Imperial": [{"on": "self", "players": {"clan": "Crane"}, "cost": {"set": 5}}]}}`
  (Fantastic Gardens), or `"set": {"per": {"in": "army", "can": {"kind": "ranged", "from": "self"}}}`, a Gold for each
  card in your army at the battle with a Ranged Attack in one of its own actions (Blazing Arrows);
- a token cost's `"unless"`, a match on the card using it (Secrets on the Wind: a Scorpion Shugenja destroys no token);
- a token count `{"of": "record", "record": "battle", "path": "destroyed.{cardopp}", "match": {"type": ["Personality"]}}`,
  the cards the resolution destroyed on the other side that fit (Terrible Standard of Fu Leng's +1F tokens, a unit each);
- a bonus's `"per"` with `"other": true`, not counting the card itself (Naga Abomination's Chi).

The codes for 19 cards are planned (Honor lost entering play, Kyoso no Oni's Holding, no Followers or Items, Toturi
dishonored and the clans he won't join, the bonuses above, the Fury of Osano-Wo's tokens, one Plea of the Peasants a
Province), with the text of 71 printings that had none, read from the scans: written (operation
2026-11-13T234212-play-actions, read back and checked in search).

**Game choices in config, not the engine** (the user, 2026-11-13; [ootv-play #427](https://github.com/Oracle-of-the-Void/ootv-play/pull/427),
`l5r/play` version 151, `l5r/fields` version 98): the words above say each choice (`when`, `face`, `can.from`, `match`),
and Blazing Arrows' and Terrible Standard's codes are rewritten to them. Weapons and Armor: `l5r/play` `attachlimits`,
`[{"on": {"type": ["Personality"]}, "match": {"keywords": ["Weapon"]}, "max": 1, "name": "Weapon", "face": "up", "raise":
{"modifier": "attachlimit", "from": ["attaching", "attached"], "take": "highest"}}, ...Armor]` (SCC p. 23: "No
Personality may have more than one weapon and one armor attached to him or her"), checked when a card is played onto a
card or moved there by a card; Wakizashi's modifier `{"attachlimit": {"match": {"keywords": ["Weapon"]}, "max": 2}}` is
the raise.

## Stats that destroy, a duelist leaving play, in play, Wounded in Battle (2026-11-13, l5r/play version 153, l5r/fields version 100)

[ootv-play #429](https://github.com/Oracle-of-the-Void/ootv-play/pull/429). Every part of the rule is in config now, not
the engine (the user: "those are clearly game rules and should never have been in the engine"):

- `l5r/play` `statdestroy` is a list, one rule per stat:
  `[{"stat": "chi", "match": {"type": "Personality"}, "max": 0, "below": "printed", "attached": false}]` (SCC p. 53: "If
  the Chi of a Personality drops to zero for any reason, that Personality is destroyed"; a Personality printed with 0 Chi
  isn't destroyed until its Chi drops). After every action the table destroys the cards in play that fit a rule. With no
  rule nothing is destroyed this way; another stat would be another entry.
- A card's `{"negate": {"action": "destroy", "stat": "chi"}}` keeps it from that stat's destroying only (for Wounded in
  Battle).
- `scenes.<id>.leave`: if a Personality that was in play when the challenge or duel began leaves play before it ends, it
  ends without resolution: nobody wins or loses, and the focus cards go to their discard piles (`"records": "discard"`).
  Leaving play works as always (a destroyed Personality's attachments are destroyed with it). The user, from the
  Poisoned Weapon rulings: "if a personality is destroyed before the end of the duel, the duel ends without resolution".
- `l5r/play` `inplay` `{"face": "up"}`: what counts as in play for the rules (the zones' `play` says where play is). The
  table and the screen both read it ([ootv-play #430](https://github.com/Oracle-of-the-Void/ootv-play/pull/430)); a game
  with no `inplay` rule counts face-down cards too.
- **Wounded in Battle** is coded and written (the Shadowlands wording): −2C until the end of the turn; a Samurai target
  can't be destroyed for its Chi until the battle ends (`{"negate": {"action": "destroy", "stat": "chi", "on": "self"},
  "until": "battle", "if": {"keywords": ["Samurai"]}}`), and is destroyed then if still at 0 Chi or below; only one on a
  Personality each turn, whichever copy (`{"once": {"per": "target", "of": "title", "until": "turn"}}`). Seven of its
  printings that had no text have it now, read from the scans.

## Game rules out of the engine: caps, values, zones, attaching, turns (2026-11-13, l5r/play version 155)

Every choice the engine made by itself is a game rule now (the user, 2026-11-13). The game's config says it; with the
key absent, the engine does the neutral thing (no limit, nothing turned, nothing moved). A generic model like the
reaction stack stays in the engine, but the game chooses it. The play words' description in `l5r/fields` is updated to
match. For L5R nothing plays differently, except where noted.
[ootv-play #433](https://github.com/Oracle-of-the-Void/ootv-play/pull/433),
[#434](https://github.com/Oracle-of-the-Void/ootv-play/pull/434),
[#435](https://github.com/Oracle-of-the-Void/ootv-play/pull/435),
[#436](https://github.com/Oracle-of-the-Void/ootv-play/pull/436),
[#437](https://github.com/Oracle-of-the-Void/ootv-play/pull/437),
[#438](https://github.com/Oracle-of-the-Void/ootv-play/pull/438).

- **No caps** (#433): the engine's fixed limits on card-code numbers are gone (draw 20, tokens 99, made cards 10,
  targets 6, effects per action 8, and many more). What the card says happens, limited only by the pile, what was
  produced, or the card's own `max`. Loop guards stay (nesting, undo depth, chain walks).
- **Deck entries**: one row of a saved list makes at most 250 cards (the server's input limit, `DECKMAX`). A game can
  set its own with `deckmax`. L5R has none.
- **Values and paying** (#434): `totals.<t>.value` (`skip`, `least`: L5R skips bowed cards, least 0), `totals.<t>.seats:
  highest`, `stats[].floors: highest`, `stats[].times` (the parts multiplied), `stats[].min` and `effectkinds.<k>.min`,
  `effectkinds.<k>.times: first`, `resources.<r>.produce.bonus: producing`, `produce.by: owner`,
  `resources.<r>.earmarked: lost`, `resources.<r>.short: allowed` (the "anyway?" question shows only then),
  `requirement.unless` (L5R: made cards), `modifiers.<m>.gained: both`. Paying by hand follows `leftover`.
- **Zones and names** (#435): `unique.scope` (L5R `table`), `cardnames {drop, short}` (the patterns that make a card's
  name and its short name), the Events Phase's Region `max` and `pickers: each`, `scenes.<id>.movein`, `targeting.inplay`,
  `targeting.whose`, `targeting.areas` (the area kinds a target `from` may name, a card lying there: L5R `province`), `handplay.resolved` (where a resolved action card goes), `scenes.<id>.make.leftover`, top-level
  `enterface`.
- **Required**: `enterface`, a made area's `leftover`, and the first player (the main scene's `first` step: `seat`,
  `counter` or `cut`; a `counter` one needs `tie`). Without them the config is refused as it loads and as a game is made.
  L5R: `up`; `{to: discard, face: up}`; `{counter: honor, tie: random}`.
- **Searching**: the shuffle after a search is the game rule `search {shuffle: true}` (L5R has it). Without it the pile
  keeps its order. A card's `search` says how many it takes (`draw`); none: any number.
- **Attaching and leaving** (#436): `attaching` (`whose`, `move.from`, `user: host`, `payer: host`, `turnwith:
  producing`), `overlay` (`whose`, `same: name`, `order: higher`), `requirement.attach.on`, `control` (`with`, `scene`,
  `returns`), `zones[].leaveas` (L5R's discard piles: `destroyed`). Destroying or discarding a card no longer takes its
  attachments along by itself: `leaving` says what becomes of them, with a new `attachments: destroy`. L5R: destroyed
  takes them destroyed, anything else discards them. **You can see one change**: a Personality dragged by hand to a
  discard pile now destroys its attachments (they were discarded).
- **When no leaving rule fits** (#438): the attachments go where the host went, the same way (destroyed, discarded,
  moved), each to its own owner's zone of that kind. `detach` is still a word a rule can say. L5R's rules always fit.
- **Turns and winning** (#437): `turns.order` (`next`, the seats clockwise; `previous`), `turns.passed: all`,
  `turns.after: next`, `turns.ends` (scenes, home, made), `opponent: next` (`choose` since version 168), `until: turn`, `drawshort: fewer`,
  `staying {until, unused}`, `clearstate.whose`, `handlimit.whose` (now `owes[].whose`), enter `turns: "turn"`, `victory.outends`,
  `victory.lastleft`. A draw with no count draws none.
- **Reactions**: `reactions: "stack"` chooses the stack model. Without it a Reaction is refused. Hearts and Cribbage have
  none.
- **"The opponent"** is the next seat. That is right with two players, wrong with more; there are no multiplayer rules
  yet.

**Card words changed**: Torrential Rain's `endbattle: true` no longer bows; it needs `{endbattle: {bowed: true}}`. Free
effects that refuse variable-cost cards say `fixed: true` (Ninja Stronghold, School of Wizardry). A face-down attachment
revealed while illegal is destroyed by its own word, `bring.reveal.illegal: "destroy"` (Cloak of Night). These four
cards' writes wait for the user's yes.

## Ally cards (2026-11-16, l5r/play version 173, l5r/fields version 112)

Five Imperial cards about allies in multiplayer attacks now work at the table. Their codes are written to the cards
(ootv-backups operation 2026-11-16T053944-play-actions), with their printings' text filled in from the scans.

- **Factionism** (Event): for the rest of the game, each player may ask at most one player to ally each turn. A second
  ask is refused, naming the card. Code: `{"lasting": {"prevents": {"action": "invite", "max": 1}}, "until": "ever"}`.
- **Debt of Honor**: a Reaction right after a battle in which you allied, with units, for the player you pick
  (after `aided`). The card stays in play and remembers that player (`remember: "player"`). Later, in an attack you
  lead before any unit is assigned (gate `leading`), destroy it and name one of their units and one of the Defender's
  Provinces (target `whose: "remembered"`). An illegal request is refused. That player chooses: send the unit there
  (`assign`: they join your side and gain the 2 Honor for allying), or lose 8 Honor. The code follows the
  Emerald/Obsidian wording. The Imperial Edition printing's older wording is stored as printed.
- **False Alliance**: a Battle action only an ally can play (`if {ally: true}`). Your units in this battle go over to
  the other army, at this battle only (`switchside: "yours"`), and you lose 4 Honor.
- **When Darkness Draws Near**: a Battle action that sends an allying unit in this battle (target `allied: true`) home,
  bowed. If its player has no other unit in the attack, they lose the 2 Honor for allying (`unaward`).
- **Moto Tsume**: bows the Personalities with Personal Honor above 1 in his own army, including an ally's units
  (`all {whose: "same"}`, was `yours`).

A unit's side is now read where it stands: a unit that went over with False Alliance counts for the other army at that
battle only.

## Shared bases, and words that work in more places (2026-11-19, l5r/play version 197, unchanged)

A pass over the whole table code (ootv-play [#543](https://github.com/Oracle-of-the-Void/ootv-play/pull/543) to [#566](https://github.com/Oracle-of-the-Void/ootv-play/pull/566)) put many repeated pieces into one place each. No
card and no setting was written for it, and `l5r/play` is still version 197. Two things matter to anyone editing a
game's play config or a card's play code.

**The repo's game files sit on shared bases.** ([#547](https://github.com/Oracle-of-the-Void/ootv-play/pull/547), [#549](https://github.com/Oracle-of-the-Void/ootv-play/pull/549), [#560](https://github.com/Oracle-of-the-Void/ootv-play/pull/560))

- `games/l5r.json` and `games/lbs.json` now start with `"extends": "aeg"`. The 20 keys the two games wrote word for
  word are held once, in `games/base/aeg.json`: `cardratio`, `reacting`, `reactions`, `reactorder`, `interrupted`,
  `opponent`, `until`, `search`, `staying`, `enterface`, `inplay`, `control`, `relations`, `turning`, `destroying`,
  `discarding`, `removing`, `moving`, `flipping`, `cancel`. They are no longer in the game files.
- `games/hearts.json` and `games/cribbage.json` say `"extends": "cards52"`: the 52 cards' suits and ranks are in
  `games/base/cards52.json`, and each game gives only its own values (Hearts its order too, Ace high).
- The table puts the base under the game's file as it loads the config, the same way an arc's rules go over a game.
  In the game's file: write one entry of a base map to change just that entry; write `null` to take a base key out;
  don't repeat a key that is the same as the base's (a test refuses it). A change both L5R and LBS should get goes in
  the base file.
- **The live `l5r/play` item holds the merged config.** It has no `extends` key and still has all 20 keys itself, so
  nothing in it changed and its version did not move. Edit those keys in the item as before. `test/structure-diff.mjs`
  compares the item with the file and its base merged.
- A base is something a game chooses. A game with no `extends` gets nothing from one, and the table still does nothing
  where a game says nothing.

**Words that work in more places.** Each of these is now read by one piece of the table, so a word that worked with
one effect works with every effect of that kind. The words themselves are the same.

- **Which cards** ([#554](https://github.com/Oracle-of-the-Void/ootv-play/pull/554)). The who words are `self`, `host`, `target`, `{"target": n}`, `{"named": ...}`,
  `chosen`, `wasat`, `recorded`, `attached`, `unit`, `ownunit`, `leader`, `duelist`, `samecard`, `inplay`, `yours`,
  `all`, `{"zones": [...]}`, `{"record", "path"}` and a role. All of them now work with `flip`, `move` (home, to an
  area, onto a card, into a zone) and `record`, as they did with bow, destroy and stat changes:
  `{"flip": "unit", "to": "down"}` did nothing before. `{"move": "self", "to": {"zone": ...}}` moves the card
  itself (it moved the first target before). An effect that names a target slot the action doesn't have now does
  nothing (some effects used every picked card instead).
- **Which players** ([#557](https://github.com/Oracle-of-the-Void/ootv-play/pull/557)). The players words for an effect's `"to"` are `you`, `opponent`, `each`, `others`
  (both with `"players": {...}`), `player` (the one picked, or `"player": {"highest": "honor"}` / `"lowest"`), `actor`,
  `controller` (with `"of": "host"` or `"unpicked": "actor"`) and a scene's seat word (`attacker`, `defender`). All of
  them now work with Honor and other counter changes (`add`, `set`), `draw`, `discard` from a pile, `look`, `mark` and
  `gain` of a trigger. `draw` goes to the players its `"to"` names. `attacker` and `defender` mean the player of the
  open scene, or of the one that just ended, for counter changes too. A player who is out of the game is never
  included. When several players are meant they are taken in turn order, starting with the card's player.
- **How much** ([#561](https://github.com/Oracle-of-the-Void/ootv-play/pull/561)). Where an effect takes a number it may take an amount, `{"of": word}`. The words: `x`,
  `target`, `host`, `self`, `unit`, `named`, `duelist` (each with `"field"`), `discard`, `counter` (with
  `"counter"`), `lost`, `gained`, `ahead`, `undone`, `record`. Every amount can add `"div"`, `"plus"`, `"max"` and
  `"times"`, worked out in that order. They are read the same way for `add` (a counter, a Province's Strength),
  `draw`, `discard` counts, a token's or made card's `count`, an added number in a scene, a number asked of a player,
  `produce` and a bonus. Six places still have their own, smaller list: a stat's `{"of": "own"}`, a cost change's
  `{"of": "card"}`, a cost's `{"of": "unit"}`, a target count's `{"of": "discard"}`, a duel term's
  `{"of": "x"}` and `produce`'s `{"of": "discard"}`.
- **How long** ([#558](https://github.com/Oracle-of-the-Void/ootv-play/pull/558)). `"until"` takes `turn`, `ever` or any scene's id (`battle`, `attack`, `duel`) on a stat or
  Strength change, a flag, a player's prevents, a trigger a player gains, more production
  (`{"produce": {"gold": {"add": 1, "match": ...}}}`) and gained actions or modifiers (with none, or `ever`, those
  stay). `nextturn` (the end of your next turn) works on a card change and on a player's prevents. With no `"until"`, a
  change lasts as the game's `until` says (L5R: the turn). A held rule (`lasting`) keeps its own words: `next`, `turn`,
  `ever`, a scene's id, `{"start": phase}`. Fixed on the way: a player's prevents with `"until": "nextturn"`, made
  during that player's own turn, never ended.
- **Printed numbers** ([#561](https://github.com/Oracle-of-the-Void/ootv-play/pull/561)). A number printed with a sign or a star (`+2`, `2*`) is read in one place. As before,
  a stat takes either, and a cost counted only a plain number. Changed since: a starred cost is its number (next
  section).

Not changed for a card: counter changes all go through one place but each kind still does what it did; "once" limits
are kept one way but the card words (`"once": "turn"`, `"battle"`, `"event"`, `"ever"`, `"target"`) are the same; a
granted action (Blackmail) and a scene's move still couldn't be answered by a cancelling Reaction. The next section
changes the counter routes, the granted action and the scene's move.

## Opening cards as targets, cancels and counter routes (2026-11-19, l5r/play version 198)

The second half of the pass over the table code (ootv-play [#576](https://github.com/Oracle-of-the-Void/ootv-play/pull/576) to [#600](https://github.com/Oracle-of-the-Void/ootv-play/pull/600)). This time some things play differently. No
card was written. `l5r/play` went to version 198: the opening cards of the challenge and the lobby took the target
form, `gains.honor.instead.if` became one flat condition, and the entries that said nothing were taken out
(`discarding`, `removing`, `turning.effect`, `turning.enter`, `turning.phase`, `turning.scene`, `destroying.hand`,
`flipping.hand`). A reason with nothing to check is simply not written; the table does the same with or without it.

**In the config.**

- **Opening cards are target slots** ([#583](https://github.com/Oracle-of-the-Void/ootv-play/pull/583)). `scenes.<id>.opens.cards` is a list of targets, read by the same check
  as a card's targets. L5R's challenge:
  `[{"match": {"type": "Personality"}, "whose": "yours", "any": true}, {"match": {"type": "Personality"}, "whose": "theirs"}]`
  (`"any": true`: your own bowed Personality may issue it). The lobby:
  `[{"match": {"type": "Personality", "ph": {"min": 1}, "dishonored": false}, "whose": "yours", "unbowed": true, "bow": true}]`.
  The old words `who`, `own`, `above` and `not` are gone: `who` is `match`, `own` is `whose`, `above` is a
  `{"min": 1}` on the stat, `not` goes into the match.
- **The card as it is now** ([#576](https://github.com/Oracle-of-the-Void/ootv-play/pull/576)). Opening cards, the `enter` rules and the hand-play matches read a card with what
  it has gained. A copy of a Personality can open a challenge or be set in one, and a copy of a Holding enters bowed.
  They read the printed card before.
- **`face` and `role` in a match** ([#588](https://github.com/Oracle-of-the-Void/ootv-play/pull/588)). Any match on a card may say `"face": "up"` or `"down"` and
  `"role": "leader"` (a key of `roles`). So `gains.honor.instead.if` is now one flat condition,
  `{"state": "dishonored", "type": "Personality"}`, with no `match` inside it; a total's `skip` and `zero` are
  written the same way.
- **A made card reads `enter`** ([#580](https://github.com/Oracle-of-the-Void/ootv-play/pull/580)). A card made by an effect comes into play like any other, so the game's `enter`
  rules apply to it: a made Holding enters bowed.
- **The base holds 18 keys** ([#593](https://github.com/Oracle-of-the-Void/ootv-play/pull/593)). `discarding` and `removing` are gone from `games/base/aeg.json` with six empty
  entries of `turning`, `destroying` and `flipping`. A game that wants a discard or a removal to check something
  writes the table again.
- **Dealing is the move word** ([#598](https://github.com/Oracle-of-the-Void/ootv-play/pull/598)). The config word `deal` is gone. Hearts and Cribbage deal with
  `{"move": {"zones": ["deck"]}, "to": {"zone": "hand", "each": "players", "count": {"2": 6, "3": 5, "4": 5}}}`:
  one card at a time round the table from the dealer's left; `count` is a number or a number by how many play, and
  with none the cards are dealt evenly. A `"top"` may be written by how many play too
  (`"top": {"3": 1}`: one card to the crib with three). `cardratio` is width ÷ height in every game now (0.714;
  Hearts and Cribbage wrote 1.4, [#594](https://github.com/Oracle-of-the-Void/ootv-play/pull/594)).

**At the table.**

- **A granted action can be answered** ([#585](https://github.com/Oracle-of-the-Void/ootv-play/pull/585)). An action a card grants another player (Blackmail's Reveal,
  Accessible Terrain, Rampant Plague) now leaves a record like a card's own action. A Reaction to it resolves before
  its effects, and a cancel stops them. By its timing it also passes the turn to the next player; the player had to
  press Pass before.
- **A scene's move can be cancelled** ([#591](https://github.com/Oracle-of-the-Void/ootv-play/pull/591)). A lobby's speaker or gift and a duel's Focus leave a record too. A
  Reaction to one comes after its effects; a cancel undoes them, and the move stays made (its turn is taken, its once
  is used). No card with play code cancels one yet.
- **A negate held with a duel** ([#578](https://github.com/Oracle-of-the-Void/ootv-play/pull/578)). When a cancelling Reaction starts a duel, the event waits for the duel. A
  negate (`"negate": true`) of it now undoes only what nothing has changed since the duel began, the same as a cancel.
  It put everything back before.
- **A sparing Reaction cancelled** ([#595](https://github.com/Oracle-of-the-Void/ootv-play/pull/595)). When a Reaction that spared a card (ran the event again) is cancelled,
  negated or redirected, the first run is put back in every case: its lines stand in the log again and the
  destruction is open to Reactions. Before, a cancel played as the first answer left it undone (Utter Defeat, Final
  Charge).
- **Counter routes** ([#582](https://github.com/Oracle-of-the-Void/ootv-play/pull/582)). Every gain or loss of a counter goes one of three ways. A card's or a rule's gain or
  loss, a battle's award, an ally's award, a cost, the full-price gain, a production loss and a change by hand hear
  everything: a gain the cards involved turn into something else (a dishonored Personality restored to honor), a loss
  a Reaction gave back beforehand, team counters, and the victory checks after the action. Gold produced, paid, left
  over or cleared, a starting value and a worked-out counter (the Rings) hear none of it. A counting game's points
  hear all of it at once and can end the game mid-action. What plays differently: an ally's award names the ally's
  units as involved, so a dishonored Personality among them is restored instead of the Honor; give-backs meet losses
  on all the first kind (When Darkness Draws Near's lost award); a team's score set or changed by hand changes for
  both partners (Cribbage with four).
- **"Right" in turn order** ([#586](https://github.com/Oracle-of-the-Void/ootv-play/pull/586)). "The player on your right" (`"whose": "right"`, `"pass": "right"`) is the player
  before you in the game's turn order. It was the seat before by number.
- **Picks in turn order from the turn's player** ([#600](https://github.com/Oracle-of-the-Void/ootv-play/pull/600)). When every player must pick (`"must"` with `"each"`), they
  pick in turn order starting with the player whose turn it is, each making all of their picks before the next. It
  started from the card's player before, so a card played in another player's turn asked in the wrong order. Side
  effect: `"each": ["attacker", "defender"]` (Encircled Terrain, Impassable Terrain) asks the turn's player first even
  when the Defender played the Terrain.
- **Questions wait their turn** ([#579](https://github.com/Oracle-of-the-Void/ootv-play/pull/579)). The Events Phase waits on a question an Event asks; the next Province is not
  turned up until it is answered. A second question met while one stands is worked out when it is asked, so it never
  offers a card the first answer destroyed.
- **Click and drag do the same thing** ([#590](https://github.com/Oracle-of-the-Void/ootv-play/pull/590)). In the seven places where a click after a selection and a drag
  differed, both now do the same thing. A hand card dragged onto a card in a battle is played onto it. A Region or
  Fortification let go on its own Province still attaches ([#600](https://github.com/Oracle-of-the-Void/ootv-play/pull/600)).
- **No game in the address** ([#594](https://github.com/Oracle-of-the-Void/ootv-play/pull/594)). The table opened the first live game when the address named none. It now opens
  the chooser, which keeps the rest of the address (an invite, a server) for the game picked.
- **No limit on "once" marks** ([#587](https://github.com/Oracle-of-the-Void/ootv-play/pull/587)). The table forgot the oldest marks past 40 targets on a card, 20 titles on a
  target and 20 events. It keeps them all now, until the turn, scene or state they belong to is over.

**Card words.**

- **The move word** ([#575](https://github.com/Oracle-of-the-Void/ootv-play/pull/575), [#581](https://github.com/Oracle-of-the-Void/ootv-play/pull/581), [#584](https://github.com/Oracle-of-the-Void/ootv-play/pull/584), [#589](https://github.com/Oracle-of-the-Void/ootv-play/pull/589)). `{"move": who, "to": where}` is read one way wherever it goes, and
  `"require"`, `"name"`, `"then"` and `"else"` work on every where: into play, a zone, under a card, a deck, as they
  did for home, an area and onto a card. A card put under another is still found by a later effect on `target`.
  `{"move": ..., "to": {"host": "self"}}` checks this card's attach limits before anything is paid.
- **Every `"if"` knows every key** ([#592](https://github.com/Oracle-of-the-Void/ootv-play/pull/592)). `turn`, `capable`, `hand`, `phase`, `counters`, `target` and `ally` work
  in a trigger's `"if"` or `"unless"`, a bonus's and a `negate` or `prevents` entry's, not only an action's: Ring of
  the Void's `{"hand": "empty"}` on its negate holds now. An action's or effect's `"if"` reads `inplay`, `count` and
  `destroyed` too. `token` and `players` still mean one thing on a trigger and another on an action.
- **A starred cost is its number** ([#586](https://github.com/Oracle-of-the-Void/ootv-play/pull/586)). A printed cost of `2*` costs 2 (it read as no cost). A bare `*` is still
  no number until the card's own code says what it costs. No card with play code prints a starred number.
- **The player who is out** ([#577](https://github.com/Oracle-of-the-Void/ootv-play/pull/577)). Their cards leave like any other card: those in play are removed from the game,
  hidden cards get new ids, and what a card forgets as it leaves (`memory`) applies.

Still as it was: a move that ends its step with effects of its own (LBS's Thrust and Parry) can't be answered; the six
smaller amount lists; held rules, drawing and Terrains keep their own readers. (Drawing changed since: next section.)

## Drawing, the chooser's new words, unplaced cards (2026-11-19, l5r/play version 199)

ootv-play [#601](https://github.com/Oracle-of-the-Void/ootv-play/pull/601) to [#609](https://github.com/Oracle-of-the-Void/ootv-play/pull/609). No card was written and no card plays differently. `l5r/play` went to version 199: `drawing`
added, and `afters.honorloss`, `afters.offending`, `afters.acted` and the `or` of `afters.seppuku` rewritten.

**In the config.**

- **`drawing`** ([#602](https://github.com/Oracle-of-the-Void/ootv-play/pull/602)). What a draw checks first, by why it happens, like `turning`, `destroying`, `moving` and
  `flipping`. L5R and LBS (in the base `aeg`, which holds 19 keys now): `{"phase": {"checks": ["negate", "more"]}}`.
  `negate`: a card of the player's that replaces the draw (Ring of the Void: five cards instead of one with an empty
  hand). `more`: a held rule that adds cards (Glimpse of the Unicorn). The reasons are `phase` (a phase's own draw,
  `{"draw": 1, "as": "phase"}`) and `effect` (a card's or a rule's). A reason that is not written checks nothing, so a
  card's own draw is still never replaced or added to.
- **A counter loss is an event** ([#601](https://github.com/Oracle-of-the-Void/ootv-play/pull/601)). The `afters` entries that mean "you lost Honor" are written in the same form
  as the other events: `{"event": {"counter": {"who": "you", "lost": "honor"}}}`, with `"by": "actor"` (in an action
  this card took) or `"by": ["actor", "target"]` (took or was aimed at) and `"who": "target"`. The old form
  `{"counterloss": "honor", "by": "took" | "tookortarget"}` is gone. `uptoloss` stays beside it.

**At the table.**

- **Gold produced and paid is heard** ([#604](https://github.com/Oracle-of-the-Void/ootv-play/pull/604)). Producing and paying a resource now go the same way as a card's gain or
  loss: a payment is a loss of what is paid. Gold left over, taken back or cleared, a starting value and a worked-out
  counter still hear nothing. A loss a Reaction gives back is never turned into something else (it undoes a loss, it
  is no gain). The Honor for a Personality paid in full names the card bought as involved, and a gain from a card's
  cost rule names that card.
- **A starred cost is a fixed cost** ([#604](https://github.com/Oracle-of-the-Void/ootv-play/pull/604)). For a rule that only works on a card of fixed cost (`"fixed": true`:
  Ninja Stronghold, School of Wizardry), `2*` counts as fixed. Only a card with no number, a bare `*`, varies.
- **A card with no spot** ([#606](https://github.com/Oracle-of-the-Void/ootv-play/pull/606)). A card that comes into play with nowhere said to put it (a made card, a card
  brought in or taken, a duplicate) has no place in the saved game until someone moves it. Each screen places it where
  it has room, so a desktop and a phone may show it in different spots. Dragging it or pressing Arrange gives it a
  real place.

**Card words.** These are read now. Cards still use the old asking words (`must`, an Event's `pick`, `bid`, `demand`),
which work as before, until they are rewritten. (Rewritten 2026-11-20, and the old words gone: next section.)

- **`draw` may name its zones** ([#602](https://github.com/Oracle-of-the-Void/ootv-play/pull/602)). `{"draw": 2}` draws from the game's deck pile to its hand pile.
  `{"draw": {"n": 2, "from": zone, "to": zone}}` names them; the effect's `"to"` is still the players who draw.
- **The chooser asks several players** ([#603](https://github.com/Oracle-of-the-Void/ootv-play/pull/603)). `{"choose": {"by": ..., "text", "options"}}`: `"by": "each"` asks every
  player, a list of who words asks those, both in turn order from the player whose turn it is.
  `"by": {"pass": "right"}` asks each player to the right in turn until one takes an answer that isn't the decline.
  `"unless": {"player": {"mark": ...}}` leaves a player out. `"picks": [{"text", "options"}, ...]`: a player answers
  each in order before the next player. `"may": true` adds an answer that declines; `"mayif": result` allows declining
  only when just answers of that result are left. `"case": {"none": [...]}` runs when there is nothing to choose,
  `{"declined": [...]}` when it was declined. `"name"` keeps the cards chosen for `{"named": ...}`; `"then"` runs once
  everyone asked has answered.
- **Card answers are written like targets** ([#605](https://github.com/Oracle-of-the-Void/ootv-play/pull/605)). An option `{"each": "card", ...}` takes a target's words (`type`,
  `match`, `whose`, `from`, `other`, `unbowed`, `at`, `side`) and is checked the same way for the player choosing. A
  card is offered once, by the first option it fits. `{"each": "area", "kind": "province"}` offers areas (its effects
  say `"which": "chosen"`); `{"each": "value", "of", "values"}` offers words (`{"chosen": "value"}`).
- **A number answer and paying** ([#607](https://github.com/Oracle-of-the-Void/ootv-play/pull/607)). `{"choose": {"by", "number": {"counter": "honor"}, "against": amount}}` with
  `"case": {"more": [...], "tie": [...]}` is the word for a bid. The effect
  `{"pay": {"counter": {"id": "honor", "n": 3}}, "by", "may"}` with `"case": {"short": [...], "declined": [...]}` is
  the word for a demand. One asked while another question stands waits behind it.
- **What a chosen card's effects may say** ([#608](https://github.com/Oracle-of-the-Void/ootv-play/pull/608)). `{"move": who, "to": "off"}` takes a card off the card it is on; it
  stays in play. `{"move": who, "to": {"host": "chosen"}, "control": "you" | "chooser"}` puts it onto the card chosen.
  `{"overlay": who}`: this card takes that card's place. `{"open": {"scene", "sides": {side: {"named": name}}}}`
  opens a scene with the cards choices named. A trigger may carry `"choose"` itself.

## Every card on the chooser, Terrains as triggers (2026-11-20, l5r/play version 202)

ootv-play [#610](https://github.com/Oracle-of-the-Void/ootv-play/pull/610) to [#621](https://github.com/Oracle-of-the-Void/ootv-play/pull/621), and 70 cards written with them (ootv-tools `play-actions.py`, every write checked for
conflicts, none). `l5r/play` went from 199 to 202: `afters.restored.resolves` (200); `afters.destroyed`,
`turncounts.produced.counts` and `terms.aimed` in place of `terms.at` (201); `areacards.terrain.played` and
`moments.placed` added, `areacards.terrain.takes` and `modifiers.atonce` removed (202).

**Asking.** Every card that asked a player something now asks through the chooser, `{"choose": {...}}` (24 cards: 8
that used `must`, 7 an Event's pick, 3 `bid` or `demand`, and 6 Terrains and Rampant Plague). The words `must`, `bid`
and `demand` are gone from the table ([#621](https://github.com/Oracle-of-the-Void/ootv-play/pull/621)): an old code with one does nothing. What changes at the table:

- A trigger that says `"may": true` (Oni no Shikibu: "may return to play") asks its player as a choice: use it, or
  Decline.
- The yellow pick bar says who is choosing, and answers that are not a card on the table (a number, a word, Decline)
  are buttons ([#620](https://github.com/Oracle-of-the-Void/ootv-play/pull/620)).
- A choice offers your own bowed cards, as a must pick did ([#616](https://github.com/Oracle-of-the-Void/ootv-play/pull/616)). A question an Event's effects ask is always asked,
  even with only one answer ([#617](https://github.com/Oracle-of-the-Void/ootv-play/pull/617)).
- A phase that goes on by itself (Straighten, Events) goes on once the last question is answered ([#613](https://github.com/Oracle-of-the-Void/ootv-play/pull/613)).
- Only Test of the Emerald Champion still uses an Event's pick, until its duel series is rewritten (rewritten 2026-11-22, the pick gone: "Config says and forms, the Event pick gone" at the end).

**Terrains act by triggers** ([#619](https://github.com/Oracle-of-the-Void/ootv-play/pull/619)). A Terrain's effects are its own triggers, like any card's: the battle's moments
fire for the cards at the battle. `{"when": [{"at": "stepend", "if": {"step": "Battle actions"}, "effects": [...]}]}`
is what it does as the Battle actions end; `"if": {"step": ...}` is a new condition, the step the moment is in.
`areacards.terrain.played: "placed"` names the moment fired as a Terrain is put into the battle (Accessible Terrain's
`{"at": "placed"}`). A card there with `"negate": {"action": "resolution", "instead": [...]}` calls the battle off
before it resolves (Entrapping Terrain), and one with `"prevents": {"action": [timings], "where": "battle"}` shuts
those actions out there (Deadly Ground). The card key `takes`, the kind's `takes {step}` and the modifier `atonce` are
gone; all 12 Terrains are rewritten. Occupied Terrain asks the Attacker with the chooser, and the Holding picked is
destroyed instead of the Province if it falls (its kept effect says `{"destroy": "target"}`).

**Held stat changes are bonus entries** ([#618](https://github.com/Oracle-of-the-Void/ootv-play/pull/618)). A held rule that changes stats writes
`{"lasting": {"bonus": {"add", "to": "yours" | "inplay", "match", "opposed"}}}`, read like a card's `play.bonus`
for every card that gets it: `"add": {"force": {"of": "own", "field": "ph", "times": -1}}` (The Falling Darkness) or
`"opposed"` (Be Prepared to Dig Two Graves). The change shows with the green "from" badge of the card that made the
rule. The old `{"lasting": {"add", "match"}}` and `{"per"}` forms are gone; 5 cards rewritten.

**One shape each** ([#610](https://github.com/Oracle-of-the-Void/ootv-play/pull/610), [#611](https://github.com/Oracle-of-the-Void/ootv-play/pull/611), [#614](https://github.com/Oracle-of-the-Void/ootv-play/pull/614), [#615](https://github.com/Oracle-of-the-Void/ootv-play/pull/615)).

- **Which action** (21 cards): a cancel is `{"negate": {"card": {"type": ...}, "action": {"keywords", "kinds",
  "token"}, "aimed", "by"}}`, a copy `{"card", "action", "source", ...}`, a redirect `{"card", "action": {"kinds"},
  "aimed", "to"}`, and config `turncounts.<name>.counts` `{"card", "action": {"fromhand", "gained"}}`. L5R's word for
  "at your army" is `aimed: army` (was `at`). A `negate` whose `action` is a name or a list (`"straighten"`) is still a
  rule on the card it is on.
- **A card left play** (2 cards, `afters.destroyed`): `{"after": {"event": {"left": true, "match", "whose", "at",
  "stat", "by"}}}`, in place of a card's own `destroyed {...}` beside the `after`.
- **A card being brought in** (5 cards): `{"after": {"event": {"entering": {"match", "unless", "fixed",
  "unique"}}}}`, in place of `after {bringing}`.
- **`token` and `players` in an `if`** (1 card): they mean one thing everywhere. `"token"`: its player holds it;
  `"about"`: the token a moment is about; `"players": {field, counters, mark, min, max, all}`: how many players still
  in fit (Rampant Plague: `{"mark": "immune", "all": true}`).

**Honor and who is involved** ([#612](https://github.com/Oracle-of-the-Void/ootv-play/pull/612)). An effect's Honor gain involves the card whose action it is and the cards bowed
for its cost, when they are the gaining player's: a dishonored Personality gaining Honor by its own action is
restored instead. A Reaction to a card being restored (L5R `afters.restored`, `"resolves": "after"`) is answered once
the restoring has happened, so Toturi is honorable when his 5 Honor comes.

## Prices, zone modifiers, the subject, must attack as owes, the table's words (2026-11-20, l5r/play version 206)

ootv-play [#622](https://github.com/Oracle-of-the-Void/ootv-play/pull/622) to [#666](https://github.com/Oracle-of-the-Void/ootv-play/pull/666), and 20 cards written with them (ten Shrines, six cards with cost changes, Shiba Ujimitsu,
Avoid Fate, Rampant Plague, Kakita Yuri). `l5r/play` went from 202 to 206: `totals.duel.skip` and the four
`victory.checks[].word` (203); `flags.mustattack` without `place`, `why`, `open` and three `owes` in their place,
`zones[].moveword`, `purchase.name` and `onto`, two `leaving[].name`, `handplay.name`, `scenes.battle.says` `home`,
`homes`, `falls`, `stands`, `cantfall` and `scenes.attack.says.over` (204); `scenes.turn.steps[].acting`, `turns.says`,
`scenes.turn.says` (205); `modifiers.zone` and `scenes.reveal.moments` (206).

**What plays differently.** A person coding cards or config should know these:

- **The clan price combines with other reductions** ([#658](https://github.com/Oracle-of-the-Void/ootv-play/pull/658)). A same-clan Personality's 2 Gold less (or its full price
  for Honor) used to apply alone; it now applies beside what a held rule (Alliance) or the card it attaches to takes
  off. A clan Personality costing 6 under a held rule's 3 less costs 3 in full, with its Personal Honor in Honor, and
  1 when the player is short of 3. The table's question and the log say both prices ("costs 1 (3 for non-Lion players,
  6 printed)"). A held reduction that works once is used up by a clan Personality it lowers.
- **A `"when": "attacking"` change counts only once assigned** ([#650](https://github.com/Oracle-of-the-Void/ootv-play/pull/650)). A bonus or modifier for one side (`attacking`,
  `defending`) used to count in every Force or Chi read outside a battle. It now counts once the card's unit is
  assigned on that side, at any battlefield; until then its badge is dimmed. Of the live cards only The Ancestral Home
  of the Lion's Open shows it: its +2F is not in the total until the unit is assigned to attack.
- **A hand and a discard pile are named by the zone's label in the log** ([#657](https://github.com/Oracle-of-the-Void/ootv-play/pull/657)): "has no cards in Player B's Hand",
  "it goes to Player A's Fate discard", where the log said "in hand" and "the discard pile".
- **No caps on gained actions** ([#624](https://github.com/Oracle-of-the-Void/ootv-play/pull/624)). A card kept at most six gained actions or triggers and four gained modifiers;
  it keeps them all now. What a card gains, and a copied action, last for the effect's `"until"`, else the game's
  `until` (L5R: the turn).
- **A timing window needs `scene`** ([#624](https://github.com/Oracle-of-the-Void/ootv-play/pull/624)). A `timing` window with only a `step` was open at that step of any scene
  but the turn's; it opens nothing now.
- **Stated in config, not assumed** ([#624](https://github.com/Oracle-of-the-Void/ootv-play/pull/624)): a recorded card still face down adds nothing to a total only because the
  total says `"skip": [{"face": "down"}]` (L5R `totals.duel`); `"award": {"times": n}` takes any number (only 2 was
  read); `handplay.to` is required.
- An area added or destroyed by a card, and a pile's flip, are for the players the effect's `"to"` names; with no
  `"to"`, the effect's player ([#628](https://github.com/Oracle-of-the-Void/ootv-play/pull/628); every player before, which no live card relied on).

**Config keys** (each in `l5r/play` unless said).

- `modifiers.zone` `{text, settings: ["autorefill"]}`: the settings a card's `zone` modifier may change on the zone
  it is attached to ([#664](https://github.com/Oracle-of-the-Void/ootv-play/pull/664)).
- `scenes.<id>.moments.<word>` `{step, before: true, why}`: a moment a scene declares on one of its steps, which a
  card's `"prevents"` can name ([#665](https://github.com/Oracle-of-the-Void/ootv-play/pull/665)). L5R `scenes.reveal.moments.revealing`: the Resolve step, "as an Event flips up
  in the Events Phase, before it takes effect".
- `scenes.<id>.says` `home`, `homes`, `falls`, `stands`, `cantfall`: a scene at an area gives its own words for what
  the log says of it ("goes home", "go home", "falls", "stands", "can't fall"); `over`: the line as a made area
  closes ("The {name} is over. Every unit there goes home.") ([#655](https://github.com/Oracle-of-the-Void/ootv-play/pull/655)). With none, the key itself is shown.
- `owes` entry kinds ([#652](https://github.com/Oracle-of-the-Void/ootv-play/pull/652)), beside a phase's owed discards: on a step of an attack,
  `{"whose": "attacker", "assign": {"flag": "mustattack"}, "why": ...}`: while it is that player's turn to assign, a
  card of theirs with the flag whose unit could be assigned now must be, before they are done; on a phase,
  `{"whose": "turn", "open": "attack", "flag": "mustattack", "why": ...}`: while the attack is not declared and such a
  card could attack, the phase can't be left forward and the turn can't end. `flags.<id>.place`, `why` and `open`
  are gone: a flag keeps only its `text`.
- `purchase.name`, `purchase.onto` ("Buy", "Buy onto {card}"), `zones[].moveword` ("Put into play", "Discard"),
  `handplay.name` ("Play"), `leaving[].name` on a rule with no `exit` ("Destroy", "Discard"): the card menu's words
  ([#656](https://github.com/Oracle-of-the-Void/ootv-play/pull/656)).
- `scenes.turn.steps[].acting` ("Not started", "Finish events", "Finish action"), `turns.says` `{action, free}`
  ("Take an action", "Free action ({card}) or pass"), `scenes.turn.says` `{skip, done, end, pick, continue, rest}`:
  the turn mark's and the phase button's sentences ([#659](https://github.com/Oracle-of-the-Void/ootv-play/pull/659)).
- `totals.<t>.skip`: the recorded cards a total leaves out (`[{"face": "down"}]`) ([#624](https://github.com/Oracle-of-the-Void/ootv-play/pull/624)).
- `victory.checks[].word`: the victory's whole name ("Military Victory"; the table added " Victory" before) ([#629](https://github.com/Oracle-of-the-Void/ootv-play/pull/629)).

**Card words.**

- **Modifier `zone`** ([#664](https://github.com/Oracle-of-the-Void/ootv-play/pull/664), ten Shrines): `{"modifiers": {"Imperial": {"zone": {"autorefill": false}}}}`. The card
  key `attached` is gone. `attached` was read under every rule set; the modifier is read under its own rule set only.
- **One cost-change entry** ([#661](https://github.com/Oracle-of-the-Void/ootv-play/pull/661), 6 cards), on a card's `play.cost` and in a held rule's `lasting.cost`:
  `{"match", "cost": {"add": -n, "min", "resource"} | {"free": true, "resource"} | {"set": n}, "once"}`; `free` with
  no resource is the whole cost. Alliance: `{"lasting": {"cost": {"match": {...}, "cost": {"add": -2}}}}`. Gone:
  `{"match", "free": true}` on a card, `{"match", "add": -n}` and `{"match", "free": <resource>}` on a held rule.
- **`overlay` says what it keeps** ([#662](https://github.com/Oracle-of-the-Void/ootv-play/pull/662), Shiba Ujimitsu): `{"overlay": who, "keeps": ["attachments", "tokens",
  "lasting", "gains", "states", "area"], "old": "discard" | "under"}`. `keeps` names what the card takes over from
  the one it replaces (none named: nothing); `old` where the replaced card goes (none said: nothing happens, and the
  log says so). The table kept a fixed list before.
- **The subject** ([#665](https://github.com/Oracle-of-the-Void/ootv-play/pull/665), Avoid Fate). `"prevents": "revealing"` names the moment the game declares; the Event passed
  over is the **subject** of the `instead` list: who `"subject"` (`{"move": "subject", "to": {"zone": "dynasty",
  "at": "bottom"}, "face": "down"}`), where `{"zone", "at": "top" | "bottom"}`, `{"refill": {"zone": "subject"}}`
  (the zone the subject was in; `{"zone": <id>}` that zone of the player's), `{"shuffle": {"zone": "dynasty"}, "to":
  "controller", "of": "subject"}` (that zone of the players `to` names; `of` says whose controller). Gone: who
  `"event"`, where `{"deck": "top" | "bottom"}`, `"shuffle": "deck"`, and `"refill": <area kind>` without
  `"as": "phase"`.
- **An Event that stays in play** is `{"move": "self", "to": "play"}` ([#666](https://github.com/Oracle-of-the-Void/ootv-play/pull/666), Rampant Plague). `{"stay": {"until":
  "ever"}}` is gone; `{"stay": {"produce": ...}}` (Inheritance) is unchanged.
- **Amounts** ([#651](https://github.com/Oracle-of-the-Void/ootv-play/pull/651), [#663](https://github.com/Oracle-of-the-Void/ootv-play/pull/663)): an amount's `"plus"` may be an amount, added as it is
  (`{"of": "target", "field": "force", "plus": {"of": "self", "field": "force", "times": -1}}`: the target's Force
  less this card's). A range bound in an effect's `"if"` or `"unless"` may be an amount, worked out as the effect
  comes (`{"dishonored": "target", "unless": {"ph": {"min": {"of": "discard", "field": "focus"}}}}`). A cost's
  `"n"` is any amount, and `"unit": "counted"` on a target amount is the unit's value as the game's total counts it
  (Kakita Yuri: `{"counter": {"id": "gold", "n": {"of": "target", "unit": "counted", "field": "force"}}}`);
  `"unit": true` stays every card of the unit (Imperial Levying).
- `{"award": {"times": n}}` with any number; a copy's `"until"` ([#624](https://github.com/Oracle-of-the-Void/ootv-play/pull/624)).

**Inside the table, no word changed.** The turn is a scene frame like any other and whose move it is is one record
per scene ([#627](https://github.com/Oracle-of-the-Void/ootv-play/pull/627), [#641](https://github.com/Oracle-of-the-Void/ootv-play/pull/641)): there is one `pass` for the table's turns, a scene's turns and assigning (the actions
`scenepass` and `scenedone` are gone, [#637](https://github.com/Oracle-of-the-Void/ootv-play/pull/637)). The view tells the table who acts, what the phase button does and what
a seat may do (`acting`, `next`, `may`; the view's `opened` is gone, [#625](https://github.com/Oracle-of-the-Void/ootv-play/pull/625), [#634](https://github.com/Oracle-of-the-Void/ootv-play/pull/634)), and whether a one-side change
counts (`mods[].counts`). Preview games saved before [#641](https://github.com/Oracle-of-the-Void/ootv-play/pull/641) don't play on.

## The Honor Requirement in config (2026-11-21, ootv-play #685; l5r/play: the sync after version 209)

ootv-play [#685](https://github.com/Oracle-of-the-Void/ootv-play/pull/685) (whole-code pass 9a). The Honor Requirement was the engine's own rule, read from config
`requirement`; it is now the game's rules, written in config. **Nothing plays differently**: every refusal, question
and log line is the same sentence, and no card was rewritten. A preview game in progress under Ivory or Three Dynasties
where a player had already said they lost Honor to another player asks them once more.

**Config keys.**

- `joins`: a list of rules a card must meet to come into play for its player, `{id, name, article, match, unless,
  <counter>: {min, max}, ignore}`. A bound is a number or `{"of": "self", "field": "honor"}`, the card's own printed
  number in that field ("–" or none: no bound). L5R has two: `requirement`, the Honor Requirement (a Personality,
  not one made in play, needs its `honor` in Family Honor: "Hida Kisada has an Honor Requirement of 7: Player A has 5
  Family Honor"), and `ownrequirement` (any other card with an `honor` number needs that much: "Temple of Bishamon
  needs 5 Family Honor to come into play: Player A has 4"; nothing waives it). A card's own `join` modifier
  (`{"honor": {"max": 0}}`, Moto Tsume) is unchanged.
- `joins[].ignore`, the ways past a rule, read in order, each `{id, match}` and one of:
  `{"modifier": "waive"}` (a face-up card of the player's in play carries that modifier and the card fits it: The
  Hidden Temples of the Naga); `{"cost": {"add": 2, "resource": "gold"}, "phases", "name", "text"}` (paying that much
  more when the player asks: Clan allegiance, Samurai and Celestial in the Dynasty Phase, Emperor any time);
  `{"mark": "lost Honor", "claim": {"ask", "says", "detail"}}` (the player has that mark; with `claim` the table asks
  "Has Player A lost Honor to another player's card or the rules this game?", and a yes gives the mark: Ivory, Three
  Dynasties). `"match": {"buyer": {"same": "clan"}}` keeps an entry to the player's own clan's cards. An arc patches
  an entry as `joins.$items["Honor Requirement"].ignore.$items["Clan allegiance"]`.
- `attaching.joins`: the same rule against the card attached to, by a stat of it: L5R `{"match": [{"type":
  "Follower"}, {"type": "Ancestor"}], "on": "leader", "ph": {"min": {"of": "self", "field": "honor"}}}` ("Battle
  Maidens has an Honor Requirement of 3: Shinjo Kinto's Personal Honor is 2"). Ivory and Three Dynasties: `attaching:
  {"joins": null}`.
- `overlay.joins: false` (was `overlay.requirement`): an Experienced card bought onto its earlier version is not held to
  the game's join rules.
- A moment for a player: `moments.honortaken {"counterloss": "honor", "by": "others"}`, another player's played card
  or token took that player's Honor; and a game trigger for a player, `triggers[] {"for": "player", "unless": {"mark":
  ...}, "says", "effects"}`, fired once for each player the moment is about. Ivory and Three Dynasties: the trigger
  `honortaken` marks the player "lost Honor", with the log line "Player A has lost Honor to another player's card: the
  Honor Requirements of their clan's Personalities are ignored for the rest of the game".
- Gone: `requirement` (`name`, `article`, `field`, `counter`, `when`, `unless`, `waivers`, `attach`) and
  `overlay.requirement`.

## The dishonor floor for every reader; Test of Honor without `test` (2026-11-21, ootv-play #686)

ootv-play [#686](https://github.com/Oracle-of-the-Void/ootv-play/pull/686), whole-code pass H2 (a). No `l5r/play` path
changed. A dishonored Personality's Personal Honor is 0 for every reader (SCC p. 52: "Dishonored Personalities have a
Personal Honor of zero."): every match and condition, every amount, and the number the table shows. Before, only Test of
Honor and a Follower's or Ancestor's Honor Requirement saw the 0. The stat's `floor` is applied with the card's own caps,
before any attachment's minimum, so Foxwife's `{"min": {"ph": 5}}` still holds her dishonored Personality at 5 (SCC p. 10,
Cardinal Rule 1). Switches and copies of a card's own numbers (Force of Will, Shapeshifting) move the printed numbers, as
before. 23 cards name Personal Honor; one was rewritten: Test of Honor (7922) is now a top discard,
`{"discard": {"top": true, "from": "draw"}, "to": "controller", "then": [{"dishonored": "target", "unless": {"ph": {"min":
{"of": "discard", "field": "focus"}}}}, {"destroy": "target", "unless": {"ph": {"min": {"of": "discard", "field":
"focus"}}}}]}` (written 2026-11-21, ootv-backups operation 2026-11-21T140654-play-actions). The card word `test` is gone.

## Game triggers, reduce, scene after and case, round games as scenes, the bare table (2026-11-21, ootv-play #667 to #684, #687, #688; l5r/play versions 207 to 209)

ootv-play [#667](https://github.com/Oracle-of-the-Void/ootv-play/pull/667) to [#684](https://github.com/Oracle-of-the-Void/ootv-play/pull/684), [#687](https://github.com/Oracle-of-the-Void/ootv-play/pull/687) and [#688](https://github.com/Oracle-of-the-Void/ootv-play/pull/688) (the whole-code pass; #685 and #686 are the two sections before
this one). `l5r/play` went from 206 to 209: `reduce` in the Favor's Prevent use and the Samurai rule action,
`purchase.changes[0]` in its new shape, `moments.arrived`, `triggers` (and the four arcs' patches of it) with top-level
`enter` removed, `scenes.turn.steps[2].turns` (and two arcs' Action steps), `scenes.attack.after` and
`scenes.attack.make.after`, `scenes.battle.case`, `scenes.duel.case` (207); `purchase.changes[0].says` (208); seven
`scenes.turn.says` sentences (209). Hearts, Cribbage, LBS and the bare table are repo configs only: none of them is
live, and nothing in their items changed.

**What plays differently.**

- **Holdings enter play bowed by a game trigger** ([#671](https://github.com/Oracle-of-the-Void/ootv-play/pull/671)). The log says "Holdings enter play bowed: Gold Mine: is
  bowed." before the line of the move that brought it in, and a Reaction to a card bowing does not hear a card new to
  play.
- **A loss lessened is the word `reduce`** ([#670](https://github.com/Oracle-of-the-Void/ootv-play/pull/670)). An `add` is always a gain: written
  `{"add": {"honor": {"of": "lost"}}}` it gives Honor beside the loss instead of preventing it. The Favor's Prevent use,
  the Samurai's Seppuku and four cards say `reduce` now (Master of the Tea Ceremony, Kakita Yinobu, Honorable Seppuku,
  Defend Your Honor; rewritten 2026-11-21).
- **Ninja Shapeshifter** ([#667](https://github.com/Oracle-of-the-Void/ootv-play/pull/667)) adds the difference between the two Personalities' totals, so they are made
  equal (a +2F Follower on the target counts); it compared their own numbers before. The card word `mimic` is gone.
- **A scene's outcome runs as ordinary effects** ([#674](https://github.com/Oracle-of-the-Void/ootv-play/pull/674)). An Honor change in a battle's or duel's outcome is
  said in the verdict's line ("… wins: Player B loses 2 Honor; Player A gains 1 Honor"), not on lines of its own; a
  loser that may not be destroyed "is not destroyed"; any effect word works in an outcome list.
- **A called-off attack ends its changes** ([#678](https://github.com/Oracle-of-the-Void/ootv-play/pull/678)). Back before the attack's first step, or its player out of the game,
  ends the changes that last "until the attack ends", with the line the normal end says ("A change to stats ends with
  the attack."); Back out of a battle at its first step ends those "until the battle ends". They stood until the turn
  ended before, and counted in a second attack that turn. No end effects, record or Terrain removal, as before.
- **A new turn says its first phase's heading** ([#680](https://github.com/Oracle-of-the-Void/ootv-play/pull/680)): "Turn 2: Player B." then "Straighten phase.".
- **Undo of an event kept with a duel** ([#684](https://github.com/Oracle-of-the-Void/ootv-play/pull/684)): when the duel cancels the event, the open scenes are put back
  frame by frame and a frame's lists by what the event put there, so a speaker's record leaves with its bow while a
  Reaction's +2 added during the duel stays (tested first in [#681](https://github.com/Oracle-of-the-Void/ootv-play/pull/681)).

**Config keys** (each in `l5r/play` unless said).

- `triggers`, `moments.<m>.into`: see the row in "What's in it" ([#671](https://github.com/Oracle-of-the-Void/ootv-play/pull/671)). Top-level `enter` is gone; LBS has the same trigger.
- `scenes.<id>.after` ([#672](https://github.com/Oracle-of-the-Void/ootv-play/pull/672)): what follows a scene once it is over, no default: `"phase"` (the turn goes on
  to its next phase: L5R's attack; the engine did that by itself before), `"turns"` (the step goes on, the turns the
  scene interrupted as they stood: LBS's attack and raid, `"ends": "turns"` until then), `"next"` (the player after its
  opener acts: L5R's Ambush, `make.after`, `make.resume` until then). None: nothing follows.
- `scenes.<id>.case {win, lose}` ([#674](https://github.com/Oracle-of-the-Void/ootv-play/pull/674); `outcome` until then): L5R `scenes.battle.case {"lose": [{"destroy": "loser"}]}`,
  `scenes.duel.case {"lose": [{"destroy": "loser"}], "win": []}`. `to: winner | loser` is the main card of each of that
  side's units, `who: winner | loser` its player. A card's own terms `outcome {win, lose}` (Test of Might, Doji
  Hoturi's duel) keep their name. Hearts' and Cribbage's round scenes still write `outcome`, which their resolving step
  reads.
- `scenes.turn.steps[].turns` ([#668](https://github.com/Oracle-of-the-Void/ootv-play/pull/668)): who acts first in a phase, the step's own key as a scene step has
  (`"turns": "turn"` on the Action Phase and the Ivory and Three Dynasties Action overrides; LBS Day and Night). The
  entry `{"turns": ...}` in a step's `enter` list is gone.
- `purchase.changes[]` ([#673](https://github.com/Oracle-of-the-Void/ootv-play/pull/673)): `match.buyer {"same" | "differs": <field>, "except"}` (the card's field holds, or
  does not hold, the buyer's value) and `cost {"add", "resource", "when": "short"}` (that much less only when what can pay
  does not cover the price in full; without `when`, always); `full {counter, field, prevent}` unchanged. L5R:
  `{"match": {"type": "Personality", "buyer": {"same": "clan", "except": ["Shadowlands"]}}, "cost": {"add": -2,
  "resource": "gold", "when": "short"}, "full": {...}, "says": {...}}`. LBS: `{"match": {"type": "hero", "buyer":
  {"differs": "faction", "except": ["Unaligned"]}}, "cost": {"add": 2, "resource": "copper"}}`. The keys `same`,
  `differs`, `except`, `short`, `add` directly on a change are gone, not read.
- `purchase.changes[].says` ([#677](https://github.com/Oracle-of-the-Void/ootv-play/pull/677)): the table's and the log's price sentences, with `{value}`, `{n}`, `{price}`,
  `{full}`: L5R `less` "{n} less for a {value} player", `both` "{price} for a {value} player, {full} for others",
  `others` "{full} for non-{value} players"; LBS `more` "more as it isn't {value}". None: the price alone.
- `scenes.turn.says` ([#676](https://github.com/Oracle-of-the-Void/ootv-play/pull/676)), seven more sentences, the words the table had (L5R and LBS):

  | Key | Words | When |
  |---|---|---|
  | `check` | both: check the {scene} totals | every seat of a scene's sides checks its totals (lobbying) |
  | `resolve` | resolve the {scene} | the phase button counts the scene at an area ("Resolve the battle") |
  | `nextarea` | next {area} | on to the next area with a scene to open (LBS: "Next City Section") |
  | `noscene` | {next} (no {scene}) | the step passed without opening its scene ("Skip to Dynasty (no attack)") |
  | `finish` | finish the {scene} first | a card turned up waits for a scene it opened ("Finish the duel first") |
  | `begin` | begin the {phase} (pass {card}) | a phase a free action holds begins, passing it |
  | `over` | Game over | the button's heading once the game is over (Hearts and Cribbage write this one too) |

  A game that writes none gets the bare word or nothing.

**Card words.**

- **`reduce`** ([#670](https://github.com/Oracle-of-the-Void/ootv-play/pull/670)): `{"reduce": {"honor": n | amount}, "to": "you"}`, that much of the player's loss of the
  counter in the event reacted to does not happen (still waiting: it shields; already happened: given back, never a
  gain; an unpreventable loss refuses it). The Favor: `{"reduce": {"honor": {"of": "x", "max": {"of": "lost"}}}, "to":
  "you"}`; Seppuku: `{"reduce": {"honor": {"of": "lost", "plus": -1}}, "to": "you"}`.
- **`mimic` is gone** ([#667](https://github.com/Oracle-of-the-Void/ootv-play/pull/667)): Ninja Shapeshifter is `{"add": {"force": {"of": "target", "field": "force", "plus":
  {"of": "self", "field": "force", "times": -1}}}, "to": "self", "until": "turn"}` (and `chi`, `ph`).

**Hearts and Cribbage** (repo configs `games/hearts.json`, `games/cribbage.json`; see their sections near the top).
Their tricks, count and show are config scenes ([#675](https://github.com/Oracle-of-the-Void/ootv-play/pull/675), [#687](https://github.com/Oracle-of-the-Void/ootv-play/pull/687)), in words any game can use:

- a turn step `{"scene": "<id>"}` with no `each` opens that scene holding the table's turns, the step going on as it
  closes; in it no turn is passed;
- a scene's `sides {"each": "players"}`, `loop {from, to, until: [{"empty": {zone, whose}}]}`, `resolved.records {zone,
  whose: winner, face}`;
- a step's `first` (`{"last": "winner"}`, `{"holds": {zone, match}}`, `{"after": "winner"}`, `{"after": "turn"}`),
  `nomove` (a player with no move they could make is passed over and says the word, Cribbage's "Go"), `resolve
  [{"best": "high" | "low" | "last", field, among}]` (resolves by itself);
- a move's `once: "step"` and `prevents [{match, if, why}]` with `if` words `follow {field}`, `holds`, `records`, `round`,
  `flag`, `over {field, limit}` (a `why` may say `{sum}`: "over 31: the count is 25");
- the effects `sceneflag` (Hearts broken) and `score {score: <patterns name>, series | zone, with, all, word, counter,
  to, claim, steal}` over config `patterns {starter, count, go, show}` (pattern words `sums`, `same`, `run`, `flush`,
  `with`, and new `each` (his heels) and a `total` range `{min, max}` (the last card)). Cribbage's last card is always
  scored for the player, never a claim (`count.last.auto` gone).

No config `round` ([#688](https://github.com/Oracle-of-the-Void/ootv-play/pull/688)): `terms.turn {name}` and `terms.turnseat {name}` give "Hand 2 (dealer: Player B)."
(L5R and LBS still "Turn 2: Player B."), and `"auto": true` on the main scene's step that opens the turns has the game
go on by itself as it is made. The round table opens for a game with config `deck`. Gone: config `round`,
`count.patterns`, `count.last`, `show.patterns`, `turnup.points`, the step `tricks`, `turnup`, `count`, `show`.

**LBS** (repo only): leaving by hand says "Bury" where it said "Destroy" (`leaving[2].name`, [#669](https://github.com/Oracle-of-the-Void/ootv-play/pull/669)): the menu's
Discard on a card in play asks "Bury or discard Abresax?" (Bury, Discard, Cancel). Its attacks and raids say
`"after": "turns"`, its duels `case`, its faction price is the shape above, and its Holdings enter bowed by the same
trigger.

**The bare table for games with no play support** ([#683](https://github.com/Oracle-of-the-Void/ootv-play/pull/683)). A game with no table config of its own (no
`<game>/play` item live, no `games/<game>.json` on preview) opens the bare table, `games/default.json`: a Deck (every
card starts there, unshuffled), a Discard pile, a Play area and a Hand; one rule set, By hand; one turn step; no phases,
costs, counters or rules. Players load a deck (Find a deck…, a list link or a pasted list) and move cards by hand, alone
or with several decks. Its name, image address and card size come from the site's `<game>/game` item (`info.name`,
`info.imageuri`, `info.cardsize`, as the card shape `cardratio`); a game the site doesn't have says "`No table for <game>.`" Its config `note`, "There is no direct play support for {game} yet: you can load a deck and move cards by
hand." (a placeholder wording), shows on the start page and in the log as a table opens. The chooser (`games/index.json`)
lists 12 such games, not live: 7th Sea, Warlord, Dune, Initial D, L5R LCG, Netrunner, Doomtown CCG, Doomtown: Reloaded,
Quest for the Grail, 7th Sea: Five Sails, Warhammer 40,000, Mythos; Pathfinder Pawns is left out, its `<game>/game` item
has no card size. Nothing needs creating for a game to get the bare table; a game gets its own table with a
`<game>/play` item (ootv-tools `structure/create.py`). Two-player server games (Advertise, Invite) are not covered yet:
the play server answers "`no table for <game>`"; a logged-in solo game works.

**Inside the table, no word changed:** every scene closes one way (`closeframe` with the pieces `CLOSING` in each
place's order `CLOSES`, [#672](https://github.com/Oracle-of-the-Void/ootv-play/pull/672)); who acts is one reader for every game ([#688](https://github.com/Oracle-of-the-Void/ootv-play/pull/688)). Tests only: [#679](https://github.com/Oracle-of-the-Void/ootv-play/pull/679), [#681](https://github.com/Oracle-of-the-Void/ootv-play/pull/681), [#682](https://github.com/Oracle-of-the-Void/ootv-play/pull/682).

## One question list, allying as rule actions, duel terms as card words, who goes first by an amount (2026-11-21, ootv-play #690 to #719; l5r/play versions 211 to 215)

ootv-play [#690](https://github.com/Oracle-of-the-Void/ootv-play/pull/690) to [#719](https://github.com/Oracle-of-the-Void/ootv-play/pull/719) (the whole-code pass, its next wave). `l5r/play` went from 210 to 215 (each synced from
`games/l5r.json` on `games/base/aeg.json`, `structure-diff` clean after each):

- **211**: `scenes.main.steps[1].first` (who goes first, [#704](https://github.com/Oracle-of-the-Void/ootv-play/pull/704)); `effects` (`lay`, `higher`) and the battle's and duel's rows written
  with them ([#707](https://github.com/Oracle-of-the-Void/ootv-play/pull/707)); `turns.says.*`, three `scenes.turn.says` keys, `scenes.attack.says` `allyonly`, `allykeeps`, `unally` and
  `terms.turn` ([#705](https://github.com/Oracle-of-the-Void/ootv-play/pull/705)); `destroying.battle` and `moving.battle` removed ([#708](https://github.com/Oracle-of-the-Void/ootv-play/pull/708)); `modifiers.bring` and `moments.turnend.zones`
  ([#710](https://github.com/Oracle-of-the-Void/ootv-play/pull/710)).
- **212**: `scenes.champion.steps[0].terms` removed ([#714](https://github.com/Oracle-of-the-Void/ootv-play/pull/714)).
- **213**: `ruleactions` `invite` and `doneinvite`, `scenes.attack.assign.order`, `scenes.attack.says.invite` and `.doneinvite`
  ([#717](https://github.com/Oracle-of-the-Void/ootv-play/pull/717)); after the card write, `drawing.phase.checks` (`more` removed), `modifiers.bringtokens` and `.bringdestroy` removed,
  `staying` removed, `moments.honorloss.by` `"card"` ([#716](https://github.com/Oracle-of-the-Void/ootv-play/pull/716)).
- **214**: eleven more `scenes.attack.says` keys ([#718](https://github.com/Oracle-of-the-Void/ootv-play/pull/718)).
- **215**: `scenes.challenge.terms.{must, value, plus, field, nomove, premove, safe, endfx}` removed (`answer.text.cost` kept),
  `terms["answer.cost"]` removed, two `within` lists in `terms`, `turns.says.ornot` removed ([#719](https://github.com/Oracle-of-the-Void/ootv-play/pull/719)).

`l5r/fields` went to 145 with the card words below. LBS, Hearts, Cribbage and the bare table are repo configs only.

**Cards rewritten 2026-11-21.** Test of Honor (7922; ootv-backups operation 2026-11-21T140654-play-actions, the section
"The dishonor floor for every reader" above) and 32 cards in operation 2026-11-21T161313-play-actions, all read back
equal from the play index:

| Cards | Was | Is now |
|---|---|---|
| Glimpse of the Unicorn (2818) | a held draw, `lasting {draw}` | a trigger its player gains, `{"gain": {"when": [{"at": {"start": "End"}, "effects": [{"draw": 1}]}]}, "to": "you", "until": "turn"}` |
| Celestial Alignment (1250) | a held cost entry's bare `bow: false` | `{"lasting": {"cost": {"match": …, "cost": {"bow": false}, "once": true, "using": …}}}` |
| Foxwife (2691) | the moment `honorloss` heard by the cards attached to the acting card | `honorloss` is the acting card's (its host's when attached), heard `"of": "host"` |
| Oni no Sanru (5745), Tsuburu no Oni (8771) | modifiers `bringtokens: 4`, `bringdestroy {match, count}` | one modifier, `{"bring": {"cost": {"destroy": {"pick": {"whose": "yours", "tokens": true, "count": 4}}}}}` (Tsuburu: `"match": {"type": "Personality"}, "count": 1`) |
| Inheritance (3754) | `stay {produce}` (config `staying`) | `{"move": "self", "to": {"zone": "active"}, "face": "up"}`, `{"production": {"gold": 5}, "to": "self"}`, and a gained `turnend` trigger destroying it unused |
| Debt of Honor (1906) | `remember: "player"`, `whose: "remembered"`, `assign: 1` | `{"name": "aided", "to": "player"}`, later a target `"whose": {"named": "aided"}` and `{"move": "target", "join": "you", "to": {"target": 1}}` (Send it, or lose 8 Honor) |
| Mercy (5032) | `undo {destroyed, award}` | `{"move": {"record": "battle", "path": "destroyed.{theirs}"}, "to": "back"}`, then `{"add": {"honor": {"of": "gained", "times": -1}}}` and 3 Honor a card spared |
| False Alliance (2457) | `switchside: "yours"` | `{"move": "all", "all": {"whose": "yours"}, "to": {"side": "other"}}` |
| The 23 duel cards (Asako Yasu, Doji Hoturi 2089 and 2091, Enough Talk!, Geisha Assassin, Hida O-Ushi, Iaijutsu Challenge, Iaijutsu Duel, Isawa Tsuke, Kakita Toshimoko, Mamoru, Matsu Hiroru, Mirumoto House Guard, Naga Abomination, Ratling Thief, Test of Might, Test of Stone, The Hooded Ronin, The Nameless One, Yuki no Onna, He's Mine!, Kitsuki Yasu, Personal Champion) | the challenge's terms (`answer {cost}`, `must`, `value`, `plus`, `field`, `nomove`, `premove`, `safe`, `endfx`) | ordinary words on the duelists, `"to": "sidecard"` (`"other": true` for the other one, `"side": "challenged"` for a side by name): may not refuse `{"prevents": {"action": "refuse"}, "until": "challenge"}`, may not focus `{"prevents": {"action": "focus"}}`, a duel stat `{"set": {"chi": {"of": "own", "field": "force"}}, "until": "duel"}`, not destroyed by it `{"negate": {"action": "destroy", "by": "resolve", "where": "duel", "on": "self"}}`, the winner's or loser's lot a gained `duelresolved` trigger, a refusal's cost the opening card's `case {refused}` |

What plays differently on those cards: Isawa Tsuke's and Matsu Hiroru's Fate card is played with the action, before
the answer (no "focuses" line); what the opening card put on a duelist stays on that card if another Personality takes
its place (He's Mine!, Personal Champion), and Doji Hoturi's results no longer cancel another card's winner's gain; a
Chi set or added for the duel shows on the card as a change until the duel ends. The opening line still says the
refusal's cost in today's words ("Kakita Toshimoko challenges Player B's Doji Hoturi (refusing costs being dishonored)",
the scene's `answer.text.cost`), and a Reaction to that Honor loss (a Samurai's Seppuku, Defend Your Honor) works as before.

**What else plays differently.**

- **The Emerald Champion's series** ([#714](https://github.com/Oracle-of-the-Void/ootv-play/pull/714)): each other player is asked "Accept the challenge?" (Accept / Refuse),
  then "Accept with a Personality of yours", instead of the pick bar; a player with no Personality is passed over.
  Log: "Player A's Champion challenges Player B (Player B accepts with a Personality of theirs; the winner gains 3
  Honor)." or "Player C refuses the challenge.".
- **A player out on their own turn** ([#706](https://github.com/Oracle-of-the-Void/ootv-play/pull/706)), with three or more players: the next player's Straighten Phase begins (their
  cards straighten) and the automatic phases go on, as after the phase button's end of a turn.
- **Owed discards in the pick bar** ([#701](https://github.com/Oracle-of-the-Void/ootv-play/pull/701)): at the End Phase, "Player A: discard 2" is shown for the player who owes
  it, no button.
- **Buying past a join rule** ([#691](https://github.com/Oracle-of-the-Void/ootv-play/pull/691)): the question the table asks comes from the engine's refusal; a rule's `max` bound
  offers its ignore entries too (none written). The Reaction carried with a purchase of a card that fits no named join
  rule ends "…goes ahead, with its cost." ([#711](https://github.com/Oracle-of-the-Void/ootv-play/pull/711); a Personality's is unchanged, "…with its cost and Honor Requirement.").
- **No Response button where nothing reacts** ([#695](https://github.com/Oracle-of-the-Void/ootv-play/pull/695)): a game with no config `reacting` (the bare table, Hearts, Cribbage)
  shows no Response button, triple click or three-finger press.

**Config keys** (in `l5r/play` unless said).

- `scenes.main.steps[].first` ([#704](https://github.com/Oracle-of-the-Void/ootv-play/pull/704)): who goes first, one word for every game, `{"by": <amount>, "best": "highest" |
  "lowest", "tie": "random" | "again", "word"?, "wins"?}`. L5R `{"by": {"of": "counter", "counter": "honor"}, "best":
  "highest", "tie": "random"}`; LBS a cut of the Fate deck (`{"of": "cut", "from": "deck", "field": "fate"}`, highest,
  again); Cribbage `{"of": "cut", "field": "value"}`, lowest, again. `best` and `tie` are required. New amounts: `cut
  {field, from?}` (a card turned for the player; it stays where it is), `areas {kind}`, `players {by?}`. A deal's `top`
  is an amount (LBS `{"of": "areas", "kind": "section", "plus": 4}`, Cribbage `{"of": "players", "by": {"3": 1}}`). Gone:
  `first {counter, tie}`, `first {cut}`, `top {n, per}` and the bare by-players `top`.
- `effects` in the AEG base ([#707](https://github.com/Oracle-of-the-Void/ootv-play/pull/707)): `lay {face}` (a card from the hand put face down or up and recorded: the
  duel's Focus, LBS's Thrust and Parry and raid cards) and `higher {side, other, also?, award?, tieaward?}` (the higher
  total wins, a tie both lose): the duel's Strike `"resolution": [{"higher": {"side": "challenger", "other":
  "challenged"}}]`, the battle's `{"higher": {"side": "defend", "other": "attack", "also": {"units": ["attack",
  "defend"]}, "award": 2, "tieaward": 1}}` before its Province row. Expanded, the config is what it was.
- `scenes` in the AEG base ([#712](https://github.com/Oracle-of-the-Void/ootv-play/pull/712), repo only): attack, battle, challenge and duel as skeletons; L5R and LBS write only
  what differs, their steps as `$items` over the base's. The merged item is unchanged.
- `turns.says` ([#705](https://github.com/Oracle-of-the-Void/ootv-play/pull/705)): the turn mark's words `placing` "place {what}", `pick` "pick for the card", `bid` "answer the
  bid", `choose`, `absorb`, `pay`, `answer` "accept or refuse the {scene}", `once` "{move} (once)", `pass`, `or` "{list}
  or {last}", `search`, `discard` "discard {n}", `owed` "place {n} {name}", and the free action's log lines `freetook`,
  `freepassed`, `freeused`, `freebegins` (`pick` gone in version 217). `scenes.turn.says` `picksfirst` "{name} picks first" (gone in 217), `searchfirst` "finish the
  search first", `nothing` "nothing (Undo or Reset)". `scenes.attack.says` `allyonly` "only as an ally", `allykeeps`
  "{who} has other {groups} in it: keeps what allying gave", `unally` "{who} loses the {n} {counter} gained as an
  ally". The words are the ones the table had; a key not written says nothing. `ornot` came and went (#719).
- `terms.turn {name}` is required ([#705](https://github.com/Oracle-of-the-Void/ootv-play/pull/705)): L5R and LBS `"Turn"`.
- `destroying.battle`, `moving.battle` removed ([#708](https://github.com/Oracle-of-the-Void/ootv-play/pull/708)): a battle's and a duel's losers and a falling Province are
  removed for the reason `scene`.
- `joins[]` ([#711](https://github.com/Oracle-of-the-Void/ootv-play/pull/711)): a rule with `ignore` entries needs its `name` (the config is refused otherwise); L5R's second rule has
  none and needs none.
- Allying ([#717](https://github.com/Oracle-of-the-Void/ootv-play/pull/717), [#718](https://github.com/Oracle-of-the-Void/ootv-play/pull/718)): asking for allies is a player's rule action, a `ruleactions` entry with
  `who` and no `match`: `{"id": "invite", "name": "Ask for allies", "who": {"side": ["attack", "defend"]}, "at":
  {"scene": "attack", "step": "Declaration"}, "order": "after", "targets": [{"player": "nosides"}], "effects": [{"list":
  "invited", "add": "target"}]}` and `doneinvite` "Done asking" (`{"list": "inviting", "add": "side"}`). Factionism's
  `prevents {action: invite, max: 1}` names it. `scenes.attack.assign.order` entries are `{side, seats, from?, pass?}`:
  `"seats": "side"` (the side's own player) or `{"list": "invited", "or": "side"}`, `"from": "attacker"`, `"pass":
  "may"` (an ally may pass); `allies` gone. The lines, refusals and buttons are `scenes.attack.says` keys with the words
  from before: `invite` "{who} asks {target} to join {for}.", `doneinvite` "{who} is done asking for allies.",
  `invitebutton` "{who}: ask {target} to join", `doneinvitebutton` "{who}: done asking for allies", `inviteonly` "only
  the {sides} asks for allies", `inviteat` "allies are asked for at the declaration", `invitedone`, `invitefirst` "{who}
  asks for allies first", `invitewaiting` "{who} hasn't finished asking for allies", `invitetarget` "ask a player on
  neither side", `inviteagain` "asked already", `inviteprevented` "ask a player to ally", `invitemore` "ask another
  player to ally this turn". Nothing a player reads changed.
- `scenes.champion` ([#714](https://github.com/Oracle-of-the-Void/ootv-play/pull/714)): the step `{"each": {"players": "others", "from": "challenger"}, "scene": "challenge"}`
  opens one challenge a player, answered as any; `steps[0].terms` (`unrefusable`, which nothing read) removed.
- `modifiers.bring` ([#710](https://github.com/Oracle-of-the-Void/ootv-play/pull/710)) replaces `bringtokens` and `bringdestroy` ([#716](https://github.com/Oracle-of-the-Void/ootv-play/pull/716)).
- `moments.honorloss {"counterloss": "honor", "by": "card"}` (was `"by": "attached"`) and `moments.turnend {"zones":
  [{"area": "active"}]}` (the active area's face-up cards hear the turn's end) ([#710](https://github.com/Oracle-of-the-Void/ootv-play/pull/710), [#716](https://github.com/Oracle-of-the-Void/ootv-play/pull/716)).
- `drawing.phase.checks` is `["negate"]`; `staying` is gone ([#716](https://github.com/Oracle-of-the-Void/ootv-play/pull/716)).
- `scenes.challenge.terms` ([#719](https://github.com/Oracle-of-the-Void/ootv-play/pull/719)): only the words left, `answer.text {refuse, cost}`, `faceup.text`, `outcome.text`; the
  terms a card's `duelset` may still set are `answer {refuse: false}` (L5R `unrefusable`), `faceup` and `outcome`. (All gone in the next version: see "The duel's last terms".)

**Card words** (new; each written in the cards above): a trigger a player gains `at: {"start": <phase>}`; a held cost
entry `cost {"bow": false}`; `modifiers.bring {cost}`; `{"name": <word>, "to": <players>}` with a target's `whose:
{"named": <word>}`; a move's `join: "you"`, the where `back` (who `{record, path}`) and the where `{"side": "other"}`;
`to: "sidecard"` with `side: <side name>`; a condition `controller {"inplay": <match>}` (Yuki no Onna's `if`); `set`
with an amount. Every number-taking word takes an amount, a target's `count` and `{of: own}` too ([#694](https://github.com/Oracle-of-the-Void/ootv-play/pull/694); an add's
`{of: own}` reads the card's total). Gone: the held `draw` and `more`, `bringtokens`, `bringdestroy`, `stay
{produce}`, `remember`, `whose: "remembered"`, `assign: n`, `undo`, `switchside`, and the duel terms above.

**Hearts and Cribbage** (repo only): the trick's and the count's outcome is `case {win}` ([#692](https://github.com/Oracle-of-the-Void/ootv-play/pull/692)); Cribbage's first
dealer is the `first {by: cut}` above; counting by hand and Muggins are one engine action, `declare`, and the bar's
options say which may be turned on now ([#700](https://github.com/Oracle-of-the-Void/ootv-play/pull/700), no config key changed). **LBS** (repo only): the duel's
Thrust step says `"pass": true` (its `{id: pass}` move gone, [#709](https://github.com/Oracle-of-the-Void/ootv-play/pull/709)); its attack gets the same rule actions; its raid's order
is `[{"side": "attack", "seats": "side"}, {"side": "defend", "seats": "side"}]`.

**The bare table** ([#695](https://github.com/Oracle-of-the-Void/ootv-play/pull/695); `games/default.json`, preview only): a deck's Pre-Game cards start in the Play area in a
line, the Setup step shuffles the Deck, and each deck the game's site item names (`<game>/game`
`deckconstruction.decks`, or `sort.first` when `sort.group` is the cards' `deck`) gets a pile of its own beside the
Deck, "<deck> Deck", shuffled on its own: Dune House and Imperial; L5R LCG Province, Role, Dynasty and Conflict (Treaty
stays in the Deck); 7th Sea: Five Sails Leader, Approach, Faction and City. Quest for the Grail's item names no decks
(Court and Quest share the Deck); the other eight games have one Deck. A deck the item doesn't name stays in the Deck.
Nothing to set up: the piles follow the `<game>/game` item.

**Inside the table, no word changed:** every question is one list, `state.asks`, answered by the one action
`answer` ([#696](https://github.com/Oracle-of-the-Void/ootv-play/pull/696), [#699](https://github.com/Oracle-of-the-Void/ootv-play/pull/699)) and drawn by one renderer ([#701](https://github.com/Oracle-of-the-Void/ootv-play/pull/701)); the challenge accepted into its duel, an `ends` move and the
Events walk go through the ordinary frame steps ([#697](https://github.com/Oracle-of-the-Void/ootv-play/pull/697), [#698](https://github.com/Oracle-of-the-Void/ootv-play/pull/698)); `autopass` gone ([#693](https://github.com/Oracle-of-the-Void/ootv-play/pull/693)); the round tables share
`ui/session.js` ([#702](https://github.com/Oracle-of-the-Void/ootv-play/pull/702)). Tests and comments only: [#690](https://github.com/Oracle-of-the-Void/ootv-play/pull/690), [#703](https://github.com/Oracle-of-the-Void/ootv-play/pull/703).

## Config says and forms, the Event pick gone (2026-11-22, ootv-play #720 to #730; l5r/play versions 216 and 217)

ootv-play [#720](https://github.com/Oracle-of-the-Void/ootv-play/pull/720) to [#730](https://github.com/Oracle-of-the-Void/ootv-play/pull/730) (the whole-code pass, the L5R/LBS leftovers page: the user's answers L1 to L19).
`l5r/play` went from 215 to 217 (each synced from `games/l5r.json` on `games/base/aeg.json`, `structure-diff` clean after
each); `l5r/fields` from 145 to 146. LBS, Hearts, Cribbage and the bare table are repo configs only.

- **216** (42 paths, [#724](https://github.com/Oracle-of-the-Void/ootv-play/pull/724) to [#727](https://github.com/Oracle-of-the-Void/ootv-play/pull/727)): the turn mark's pass count `turns.says.passed` "({n} passed)"; the verdict's
  words in `scenes.battle.says`, `scenes.duel.says` and `scenes.lobby.says`: `wins` "{side} wins", `tie` "A tie", `nobody`
  "Nobody wins", `cancelled` "The {scene} is cancelled", `nothing` "nothing happens", what happens to a side
  (`destroyed`, `notdestroyed`, `cantdestroy`, `kept` "can't be destroyed by this {scene}", `turned` "is {state}",
  `unturned` "is no longer {state}", for a side of several units `destroyedmany`, `notdestroyedmany`, `turnedmany`,
  `unturnedmany`, for both sides at once `bothdestroyed`, `bothnotdestroyed`, `neither`, `neitherkept`, `bothturned`,
  `bothunturned`), an area's `more` "({a} is more than {b})", `notmore`, `plus` " + ", `madefalls` "nothing {falls} in
  {area}", `area` "the {noun}", and `source` "The {scene}"; `turns.says.chooses` "chooses: {choice}" ([#725](https://github.com/Oracle-of-the-Void/ootv-play/pull/725)). The
  counting step's button `scenes.battle.steps[1].button` "Resolve the battle" and `scenes.duel.steps[1].button` "Resolve
  the duel"; the lobbying panel's title `scenes.lobby.says.title` "{scene} for the {token}"; a move's refusals
  `turns.says` `cantmove` "{card} can't {move}: {end}", `oncein` "once a {step}", `onlyside` "only {side}", `nohand` "no
  cards in hand"; the words beside a challenge `scenes.challenge.says` `accepts` "{who} accepts with {what} of theirs",
  `card` "{who}'s card", `otherwise`, `ifwin` "if {side} wins", `iflose`, `iftie`, `ifresult` "if {side}: {result}",
  `ifrefused` "if it is refused", `goeson` "{card} goes on {list}" ([#726](https://github.com/Oracle-of-the-Void/ootv-play/pull/726)). The phase button's
  `scenes.turn.says.turnof` "{who}'s turn" and `press` "{title}. Press for {next}", the placing button's
  `scenes.attack.assign.words.button` "done assigning", a hidden option's `turns.says.hidden` "a card" ([#727](https://github.com/Oracle-of-the-Void/ootv-play/pull/727)).
- **217** ([#729](https://github.com/Oracle-of-the-Void/ootv-play/pull/729), [#730](https://github.com/Oracle-of-the-Void/ootv-play/pull/730)): `forms` added; `turns.says.pick`, `scenes.turn.says.picksfirst` and
  `scenes.reveal.pickers` removed.

**Nothing a player reads changed** with 216 and with `forms`: the words are the ones the engine wrote (checked by the
says trace and seeded full games, L5R and LBS, identical before and after). A scene or step with no such key now says
nothing where the engine used to make up an English sentence (no "Resolve the …" button without `button`, no verdict
line without `says`).

**`forms`** ([#730](https://github.com/Oracle-of-the-Void/ootv-play/pull/730)): `{"<word>": {"a": …, "many": …, "up": …, "low": …}}`, each config word's own article (`a`: "an
Ambush"), plural (`many`: "Personalities") and capital or small first letter (`up`: "Battle", `low`: "province"). A
phrase takes its first word's `a`, `up` and `low` and its last word's `many`; a word with no entry is used as written.
L5R has 54 words, LBS 18, Hearts 4, Cribbage 5, the bare table 1 ("area"). The engine no longer adds "a"/"an" or a
plural "s" to config words, or raises or lowers their first letter. A new card type or keyword in card code needs its
forms (an ootv-play test checks every one in live card code).

**Test of the Emerald Champion (7933), rewritten 2026-11-22** (ootv-backups operation 2026-11-22T021359-play-actions,
read back equal): its Event `pick` is now a chooser question, `{"choose": {"name": "champion", "options": [{"each":
"card", "match": {"type": ["Personality"]}, "whose": "yours"}], "text": "their Champion"}, "then": [{"open": {"scene":
"champion", "accept": …, "win": …, "survive": …}, "to": "named", "named": "champion"}]}`: an effect `open` naming a series
scene with a card opens it with that card ([#728](https://github.com/Oracle-of-the-Void/ootv-play/pull/728)). The series plays as before (each other player in turn, the
winner of each duel gains 3 Honor, a surviving Champion gives a Province and is removed from the game). What a player
sees: the chooser's question "their Champion" (another player's actions wait until it is answered), "choose" on the
turn mark, the phase button "Continue (discards it, flips up the rest)" (refused until the question is answered), and
the log "Player A chooses: <Champion> (Test of the Emerald Champion)."

**An Event's own pick is gone** ([#729](https://github.com/Oracle-of-the-Void/ootv-play/pull/729)): every Event asks through the chooser (`choose`), the one question list.
Fixed with it: a series' challenge that can't be refused waits for its card to be picked instead of being accepted at
once; an Event whose player goes out of the game by its own effects asks nothing more (Desperate Measures in the last
Province). `l5r/fields` 146: the `play` description's four Event passages say Events ask through `choose`.

**Also merged** (no config path, nothing a player reads): with no `assign.order` each seated side places in turn again
([#722](https://github.com/Oracle-of-the-Void/ootv-play/pull/722), a fix no config reaches); the Events Phase walk takes one frame per Province ([#723](https://github.com/Oracle-of-the-Void/ootv-play/pull/723)); stale comments and
README/CLAUDE.md lines ([#720](https://github.com/Oracle-of-the-Void/ootv-play/pull/720), [#721](https://github.com/Oracle-of-the-Void/ootv-play/pull/721)). The bare table's `games/default.json` gets `turnof`, `press`, `hidden` and
`forms` (its phase button keeps "Player B's turn").

## The duel's last terms (2026-11-22, ootv-play #732; l5r/play version 218)

ootv-play [#732](https://github.com/Oracle-of-the-Void/ootv-play/pull/732) (the whole-code pass 9f, its last proposal, accepted by the user 2026-11-22). `l5r/play` 217 →
218, synced from `games/l5r.json` on `games/base/aeg.json`; `l5r/fields` 146 → 147 (the `play` description's list of words `terms` maps, and an option's `if` with the challenge's Refuse). LBS's challenge gets the same Refuse option (repo config only).

- `scenes.challenge.terms` is removed. Its words are now `scenes.challenge.says`, unchanged:
  - `unrefusable` "can't be refused"
  - `refusecost` "refusing costs {effects}"
  - `faceup` "{player} {does} face up in this duel"
  - `outcomewin` "the winner {effects}"
  - `outcomenowin` "the winner merely survives"
  - `outcomelose` "the loser {effects}"
- The challenge's Refuse option: `"unless": {"in": {"scene": "challenge", "terms": {"unrefusable": true}}}` became `"if": {"in": {"scene": "challenge", "side": "challenged", "canmove": "refuse"}}`.
  It is offered only while the challenged card has no prevents of `refuse` (Kakita Toshimoko's own, or one an opening card or a Reaction puts on it).
  An `in`'s `canmove` with a `side` and no `is` reads that side's card, whoever's it is.
- `terms` keys `answer.refuse` (the card word `unrefusable`, used by no card), `outcome.win` and `outcome.lose` are removed.
  A card's `win` / `lose` on an open or a duelset are read as written: the effects for the duel's winner and loser.

**Nothing a player reads changed.** The same options, opening lines and panel words appear in the challenge and the
duel. The says trace and seeded full games (L5R and LBS) were identical before and after.

**Card:** Test of the Emerald Champion (7933) loses `open.accept.may` (written 2026-11-22, ootv-backups operation 2026-11-22T040425-play-actions, read back equal), which the engine no longer reads. A series'
challenge may be refused at no cost unless the card asked may not, as its printed "which may be accepted" says.
