# Card editor

Last updated: 2026-10-19

The **Edit** button at the top right of a card (shown to anyone with an edit permission on the
game) opens one editor for the whole card: its own fields, every instance (printing), and which
instance is the MRP one. **Admin → New Card** opens the same editor on a blank card.

Nothing is saved while you edit. **Commit** saves everything at once, and **Close** (or clicking
outside the box) asks before throwing changes away.

## Views

- **Regular**: values shown as they appear on the site (bold, links, line breaks) and edited
  in place.
- **HTML**: the same values as raw text with their tags (`<b>`, `&nbsp;`), for exact edits.
  Typing in Regular view can change the markup slightly (a browser writes a typed line break as
  `<br>` or `<div>`, and `&#8217;` as `’`), so use HTML view when the markup matters.
- **JSON**: the whole card as JSON, like the old editor. Instances are in `printing`, and the MRP
  instance's `printingid` is in `printingprimary`. An instance with a `printingid` the card doesn't
  have yet counts as a new instance. JSON that doesn't parse can't leave the view or be committed.

## Card details and Printing details

- Each field has an **x** to remove it. A list field has an **x** on each value and **+ value**
  to add an empty one to fill in.
- **Add field** offers the fields this game uses that the card (or instance) doesn't have yet
  (from the game's card template and every card loaded this session), or **Other...** for a new
  name. A list field starts as one empty value, a text field as empty text.
- Fields holding structured data (`image`, true/false flags such as `notmrp`) are edited as JSON
  in their own box. A true/false field added with Add field starts as `true`.
  If the box doesn't parse it turns red and the field keeps its last good value.
- Empty values left in a list are dropped on commit. A field you added and left empty is dropped
  too, but a field the card already had is kept even if it ends up as an empty list. To remove
  a field, use its **x**.
- The version buttons pick the instance shown, as on the card page (`*` marks the MRP instance,
  `•` an instance with changes). **Make MRP** makes the instance shown the MRP one. **New
  instance** adds a blank one (it needs a set). **Delete instance** marks it for deletion, and an
  **undo** link stays until you commit. A card keeps at least one instance.
- **Upload image** (instances already saved) uploads to S3 straight away, as before, but adds
  the image to the instance only in the editor. Commit to save it on the card.
- **Delete card** asks, then deletes the card immediately rather than on commit.

## Commit

Commit asks first when anything is being removed (fields, list values, instances) and lists
what. It then checks that nobody saved the card since you opened it (if they did, nothing is
sent, and your edits stay in the editor), and sends the changes as separate `/update` calls,
one at a time: changed instances, new instances, deleted instances, then the card's own fields
and the MRP instance. New instances are added before deleted ones are removed, so a new
instance never reuses a deleted one's `printingid` (deck lists point at those). Each call needs
its own permission (`updateinstance`, `newinstance`, `removeinstance`, `update`) and writes its
own update log row. If one fails, the editor stops and shows which steps were saved.
