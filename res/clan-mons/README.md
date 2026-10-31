# Clan mons

The L5R clan mons the card rows draw before a clan's name, and the lists before a deck's name (game config `clanmons`,
docs/admin/game-config.md). `oracle-plain-color/`: ootv-assets `mons/oracle_plain/color/`
(the flat mons in clan colour), scaled to 48x48. `oracle-plain-glow-black/` (for light backgrounds) and
`oracle-plain-glow-light/` (for dark ones): ootv-assets `mons/oracle_plain/glow/black/` and `light/`, scaled to 64x64
(LANCZOS). The art fills 820/1024 of those, the rest is glow; `img.clanmonglow` in `oracle.css` allows for it. Only the mons of clans that cards carry are
here; another clan is another file and an entry in the config. Another style is another
directory here and a new `path` (or `onlight` + `ondark`) in the config.
