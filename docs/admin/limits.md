# Limits (photo features)

Last updated 2026-10-24.

**Admin → Config → Limits** sets how many times a person may use each photo feature, per day (days
run midnight to midnight UTC) and per minute, by level. Site admins only (full permission on every
game). A save takes effect within 5 minutes: the APIs reread the limits that often.

| Feature | Levels |
|---|---|
| **Search by photo** (Photo → Find the card) | `admin`: full permission on the game; `maintainer`: any other permission on the game |
| **Find the artist** (Photo → Find the artist, and uploads in Admin → Artist check) | `admin`: `artcheck` or full permission on the game; `member`: any other permission on the game |

Someone without any permission on the game can't use either feature. Patreon tiers will add levels
(project `patreon-privileges`); until the APIs know a new level, a row for it here does nothing.

- **0** turns the feature off for that level.
- When someone uses up a limit, they get "you have used your N … per day/minute" until it resets.
- A feature that was never saved shows the API's built-in defaults; the first save stores them.
- Each save keeps the last 20 versions in the item's history (with the limits before the save).
  If someone else saved in between, the save is refused: reload the panel and redo the change.

Where they live: `oracle-all-structure`, database `all`, keys `artphoto` (read by ootv-search
`artembed/app.py`) and `artcheck` (read by ootv-search `admin/artcheck.mjs`), field `limits`:
`{<level>: {day, minute}}`.
