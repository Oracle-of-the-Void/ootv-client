# Patreon supporters

Last updated 2026-10-24.

Supporters of [our Patreon](https://www.patreon.com/oracleofthevoid) get site privileges by tier.
The site keeps a list of who supports at which tier, and each feature decides what a tier gets.

## The supporter list

`oracle-all-patreon` holds one row per member of the campaign (paying, free, declined and former),
with their entitled tiers, their pledge status and the Oracle account they're tied to (`uid`). It's
kept by the `ootv-webhooks` Lambda (ootv-search `webhooks/`):

- **Patreon's webhooks** send every membership and pledge change to
  `https://api.oracleofthevoid.com/patreon/webhook`, and the row is updated within seconds.
- **A nightly sync** (08:17 UTC) rereads every member, as a backup.

A former supporter keeps their row but loses their tiers, so their privileges stop at once.

## Tying supporters to accounts

Automatic, by email: a supporter is tied to the Oracle account that has their Patreon email among
its emails (the same lookup login uses), unless that email isn't verified on the login side. Only
a hash of the Patreon email is stored. A supporter whose Patreon email isn't on their account can
add it under their profile's emails; the tie appears on the next webhook or nightly sync.

By Patreon login: **Link with Patreon** (Settings → Account → Patreon) signs the user in to
Patreon (scope `identity`, nothing else is read) and ties that Patreon account to theirs
(`linkedby: oauth`), whatever its email. Patreon sends the browser back through
`https://api.oracleofthevoid.com/patreon/oauth`, which has to be listed as a redirect URI on our
Patreon API client. A Patreon account that isn't a member of the campaign yet (not even free) can't
be linked; the user is told to join first.

**Unlink** unties every membership tied to the account and marks them `nomatch`, so email matching
leaves them alone; only Link with Patreon ties them again.

## What tiers get

| Feature | Where the tiers are set |
|---|---|
| Photo: Find the card and Find the artist | Admin → Config → [Limits](limits.md), levels `patreon-<tier>` |

A new privilege adds its own tier → privilege setting in that feature's config; the supporter list
doesn't change. Tier keys are `patreon-` plus the tier's title in lower case, so renaming a tier on
Patreon means renaming its keys.

## By hand

- Counts (no emails): `aws lambda invoke --function-name ootv-webhooks --payload '{"job":"patreon-sync","dry":true}' --cli-binary-format raw-in-base64-out out.json`; without `"dry":true` it syncs.
- The webhook: `{"job":"patreon-webhook"}` lists it, `{"job":"patreon-webhook","uri":"..."}` moves it.
- Secrets are in SSM under `/ootv/patreon/`; the Lambda renews the Patreon token itself and emails
  an alert if it can't.
