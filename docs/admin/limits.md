# Limits (photo features)

Last updated 2026-10-24.

**Admin → Config → Limits** sets how many times a person may use the photo features, per day (days
run midnight to midnight UTC) and per minute, by level. **Find the card and Find the artist share
one count** (the user's call, 2026-10-23): a Samurai supporter has 25 a day between the two. Site
admins only (full permission on every game). A save takes effect within 5 minutes: the APIs
reread the limits that often.

| Level | Who |
|---|---|
| `admin` | full permission on the game (for Find the artist, also the `artcheck` permission) |
| `maintainer` | any other permission on the game |
| `patreon-<tier>` | a Patreon supporter at that tier (`patreon-free`, `patreon-ashigaru`, `patreon-samurai`, `patreon-maker`); see [Search by photo](art-search.md) |

Someone with none of these can't use either feature. A supporter is tied to their account in
`oracle-all-patreon` (by email, kept current by Patreon's webhooks; ootv-claude `PATREON.md`).

- **0** turns the features off for that level; an **empty box** means no limit (admins and
  maintainers, set 2026-10-23). A level shown in the panel but never saved stays off while both
  its boxes are empty.
- When someone uses up a limit, they get "you have used your N photo searches per day/minute" until it resets.
- Every use and every refusal is in [Admin → Audit → Usage](usage.md): check there how often people hit a limit before changing it.
- A never-saved item shows the APIs' built-in defaults (admin and maintainer: no limit); the first save stores them.
- Each save keeps the last 20 versions in the item's history (with the limits before the save).
  If someone else saved in between, the save is refused: reload the panel and redo the change.

Where they live: `oracle-all-structure`, database `all`, key `artphoto`, field `limits`:
`{<level>: {day, minute}}`, read by ootv-search `artembed/app.py` (Find the card) and
`admin/artcheck.mjs` (Find the artist). Both count in `oracle-all-artquery` (`rate#<uid>#<day or
minute>`). The old `all/artcheck` item (separate Find the artist limits, until 2026-10-23) is no
longer read.
