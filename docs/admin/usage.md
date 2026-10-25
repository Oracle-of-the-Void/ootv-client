# Usage log (photo features)

Last updated 2026-10-24.

**Admin → Audit → Usage** shows every use of the photo features, in every game, including the
ones that were refused, so we can see how much they're used, by whom and at what level, and whether
the [limits](limits.md) fit. Site admins only (full permission on every game). Days are UTC.

| Feature | What counts as one use |
|---|---|
| Find the card | a photo sent from Photo → Find the card (re-searching an existing result link doesn't count) |
| Find the artist | a picture uploaded to Photo → Find the artist, or on Admin → Artist check (kind `card` or `art`) |
| Artist check | an admin's check of a printing (Admin → Artist check, or the card editor's Check artist); not charged against the limits |

Each use has an **outcome**:

| Outcome | Meaning |
|---|---|
| `ok` | it ran (for the artist features: the job was queued) |
| `limited` | refused by the limits (429) |
| `denied` | not logged in, not their account, or no permission or Patreon tier (401/403) |
| `bad` | a request the API couldn't take: no picture, an unreadable image, a missing printing (400/404) |
| `error` | something broke on our side (500) |

The page shows totals by day and feature, by feature, by level and by person, then the uses
themselves, newest first (the newest 300). **Left** is how many uses the person had left that day
and minute after an `ok` (empty: that period isn't limited for their level). **Seconds** is how
long the request took (Find the card: the whole embedding; the artist features: only the queueing,
not the worker's check). Pick up to 31 days at a time, and a game to narrow it.

Where it lives: DynamoDB `oracle-all-usage`, one row per use, kept for good (no expiry): key `day`
(`YYYY-MM-DD`, UTC) + `id` (`<time>#<feature>#<random>`); fields `ts`, `feature`, `game`, `uid`,
`level`, `outcome`, `status`, `ms`, `ref` (the photo search id or the artist check job id), `kind`,
`left`, `message`. Only the user id is stored: no names, emails or pictures (the page looks the
names up). Written by ootv-search `artembed/app.py` (Find the card) and `admin/index.mjs`
(the artist features); read with `POST /artcheck` action `usage`. Query recipe: ootv-search
`CLAUDE.md`, "Photo feature usage log".
