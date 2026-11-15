# Users (look up and edit accounts)

Last updated 2026-10-30.

**Admin → Audit → Users** finds an account and changes it. Site admins only (`*: *`). Every
search, every account you open and every change goes into the [audit log](admin-editing.md)
under your name, so only look up people for a reason.

## Finding someone

Search for an email address (exact), a uid, or part of a name, display name or email. One match
opens it; several give a list to pick from (at most 50: narrow the search if there are more).

An account shows when it was created, its lists per game (and how many are public), its Patreon
tier, its recent sign-ins (from the login log, when they're recent enough to be there), and a
link to the audit log rows about it.

## Changing an account

- **Names**: first name (required), last name, and display name (what other players see on shared
  decks; empty shows initials). A display name change updates their public decks within a minute.
- **Email addresses**: add one (it's added at once, with no code sent: only add an address you
  know is theirs, for example after they emailed us from it), or remove one (not the last). The
  removed address gets the usual "removed from your account" email. An address that already
  belongs to another account can't be added: merging two accounts is still done by hand.
  *(notices go here)* marks the address the account was made with, where the site's emails to
  them go.
- **Permission groups**: one line per game, or `*` for every game: `game: op, op`. For example

  ```
  *: listedit
  l5r: update, new, setimport
  ```

  Ops: the card editing operations (`update`, `new`, `newinstance`, `updateinstance`,
  `removeinstance`, `remove`), `setimport`, `artcheck`, `artists`, `fields`, `gameconfig`,
  `listaward` (tournament results and pre-constructed marks), `listedit` (edit anyone's lists),
  or `*` (everything for that game). `*: *` is a site admin. Empty removes every permission.
  You can't take `*` out of your own `*` line (so you can't lock yourself out by accident).

Each change is saved only if the account hasn't changed since you opened it; otherwise reload
it and try again.
