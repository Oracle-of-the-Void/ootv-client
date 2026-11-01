# Clan mons

The L5R clan mons the card rows draw before a clan's name, and the lists before a deck's name (game config `clanmons`,
docs/admin/game-config.md). `oracle-plain-color/`: ootv-assets `mons/oracle_plain/color/`
(the flat mons in clan colour), scaled to 48x48. `oracle-plain-contrast-onlight/` and `oracle-plain-contrast-ondark/`: ootv-assets `mons/oracle_plain/contrast/onlight/` and `ondark/`, the same mons recoloured for light and dark backgrounds, scaled to 64x64 (LANCZOS). `oracle-plain-glow-black/` and `oracle-plain-glow-light/`: the earlier glow versions, not used since 2026-10-31. Only the mons of clans that cards carry are
here; another clan is another file and an entry in the config. Another style is another
directory here and a new `path` (or `onlight` + `ondark`) in the config.
