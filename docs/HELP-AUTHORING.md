# Writing the help pages

The site's Help view (the **?** icon in the menu bar) shows the topics in `docs/help/`, one
Markdown file each, rendered in the browser with marked by `help.js`. The deploy workflow
publishes `docs/help/*.md` with no-cache, as it does the admin docs, so an edit is live on the
next load. (Planned: once the topics settle, they move into the database, so they can be
edited on the site. Project `help-pages` in ootv-claude.)

## Topics

The topic list, in order, is `HELPTOPICS` in `help.js`. A new topic is a new `docs/help/<id>.md`
plus a line there. `fields` is generated, not a file: it lists the game's field descriptions
(Admin → Field descriptions; `oracle-all-structure` `<game>/fields` and `all/fields`), so
describing a field there puts it in the help.

## Sections and their ids

Each heading is a section: the heading and what follows it, up to the next heading of the same
or a higher level. Give a heading a fixed id by ending it with `{#id}`:

```
## The All box {#all}
```

Without one, the id is the heading's text as a slug (`## The search form` → `the-search-form`),
which changes when the heading does, so give an id to every heading something links to.

Keep sections short: a "?" popup shows one section, and on a desktop it shows only what fits.

## Links

- To another topic: `[Card fields](fields.md)`, or to a section of one: `[the All box](searching.md#all)`.
- Within the same topic: `[search language](#syntax)`.
- Outside links open in a new tab.

They become site links (`#help=<topic>,#helpsec=<id>`), so they can be bookmarked and shared.

## "?" links next to controls

```html
<span class="helpq" data-help="searching#all" aria-label="Help: the All box">?</span>
```

`data-help` is `<topic>#<section id>` (just `<topic>#` for the whole topic). Hovering (mouse)
shows the section in a popup, a long-press (touch) shows it with Open help and Close buttons,
and a click or tap opens the Help view at that section, the same as a ruling's rulebook link on
a card page. They work anywhere on the page, including inside templates.

## Style

Write for players, not for us: what the control does and how to use it, in plain words. No API
names, field internals or history. Name buttons as they're labelled on the site, in bold.
Check examples on the live site before putting them in.
