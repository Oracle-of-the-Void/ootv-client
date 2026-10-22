# Card editor

Last updated: 2026-10-21

The **Edit** button at the top right of a card (shown to anyone with an edit permission on the
game) opens one editor for the whole card: its own fields, every instance (printing), and which
instance is the MRP one. **Admin → New Card** opens the same editor on a blank card.

Nothing is saved while you edit. **Commit** saves everything at once. **Reset** asks, then puts
the card back the way it was when the editor opened, without closing it (images already uploaded
stay on the server). **Close** (or clicking outside the box) asks before throwing changes away.

## Views

- **Regular**: values shown as they appear on the site (bold, links, line breaks) and edited
  in place.
- **HTML**: the same values as raw text with their tags (`<b>`, `&nbsp;`), for exact edits.
  Pasting into Regular view keeps bold, italics and line breaks only: colours, highlighting,
  fonts and links from Word, Google Docs or a web page are dropped (paragraphs become line
  breaks). Colour or highlighting the browser adds while you type is dropped too.
  Typing in Regular view can change the markup slightly (a browser writes a typed line break as
  `<br>` or `<div>`, and `&#8217;` as `’`), so use HTML view when the markup matters.
- **JSON**: the whole card as JSON, like the old editor. Instances are in `printing`, and the MRP
  instance's `printingid` is in `printingprimary`. An instance with a `printingid` the card doesn't
  have yet counts as a new instance. JSON that doesn't parse can't leave the view or be committed.

## Card details and Printing details

- Fields follow the card page's order and rows (read from the game's card template), with Needs
  review first, every `*title*` field next to the title, and fields the page doesn't show at the
  end. Short fields (values up to about 40 characters on the cards seen) sit side by side. Labels
  are the card page's short ones; hover for the full name and the field's name in the JSON.
- Each field has an **x** to remove it. A list field has an **x** on each value and a **+** after
  the last one to add an empty value to fill in.
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
  `•` an instance with changes). The arrows either side of the instance's heading
  ("Instance 3 (1 of 3)", the card page's arrows) step to the previous and next instance, as do
  the **←** and **→** keys when no value has the cursor (while typing in one, **Alt+,** and
  **Alt+.**, since the arrows move the cursor there). Changes stay when you move
  between instances. **Make MRP** makes the instance shown the MRP one, and removes
  `notmrp` from it if it has it (the MRP instance can't be one the MRP lookup skips). **New
  instance** adds a blank one (it needs a set). **Delete instance** marks it for deletion, and an
  **undo** link stays until you commit. A card keeps at least one instance.
- Click an instance's image to open it at full size in a panel that stays open while you edit,
  to compare the printed card with the fields. Zoom from the whole card (1x) up to 16x with the
  slider, **+**/**−**, the mouse wheel (zooms where the pointer is) or a double-click; drag the
  image to look around, **Fit** to see it all again. Drag the panel's title bar to move it and its
  bottom-right corner to resize it. It follows the instance you pick.
- **Upload image** (instances already saved) uploads to S3 straight away, as before, but adds
  the image to the instance only in the editor. Commit to save it on the card.
- **Delete card** asks, then deletes the card immediately rather than on commit.

## Commit

Commit first checks fields kept on both the card and its instances (legality, keywords, text...):
if the commit changes one side and leaves the other alone, while the other has values, it lists
those and offers to make the same change there too (the values added, removed, or edited in
place, not a copy, so an instance's own extra values stay). A box is ticked already when the card has only
one instance, or when both sides held the same values before the edit; notes and needsreview are
never checked. Yes commits with the ticked changes, No goes back to editing.

Commit then asks when anything is being removed (fields, list values, instances) and lists
what. It then checks that nobody saved the card since you opened it (if they did, nothing is
sent, and your edits stay in the editor), and sends the changes as separate `/update` calls,
one at a time: changed instances, new instances, deleted instances, then the card's own fields
and the MRP instance. New instances are added before deleted ones are removed, so a new
instance never reuses a deleted one's `printingid` (deck lists point at those). Each call needs
its own permission (`updateinstance`, `newinstance`, `removeinstance`, `update`) and writes its
own update log row. If one fails, the editor stops and shows which steps were saved.
