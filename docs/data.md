## Notes on data for new databases

### json top:

* cardid (absolutely required and unique)
* title (required unless you set up a visual-only search, meh)
* type (not technically required, but use this label if you can)
* printingprimary (required)
* imagehash (this might be deprecated.... need to set up a new game without it - will save a lot of objects)
  * use new method below if no imagehash

### printing  (nested)

* printing.set (not sure if technically required, strongly recommended)
* printing.rarity (not sure if technically required, strongly recommended)
* printing.imagehash (required)
* printing.printingid (required)
* NEW: image: hash of images:
 * ```json
{
 select: filename,    long side 210px  (other 150 or so)
 details: filename    long side 600px  (other 288 or so)
 master: filename,    no spec yet
 original: filename (optional),
 numeric: filename (optional sizing)
}
```
  * new method is simpler.   just gameurlbase+imagehash+images[size]

### optional

* formattedtitle (with bold html/whatnot)
* puretexttitle (text spoiler ver.. remove special chars, \&149\; Exp to -exp, etc)

### image path
```database/{lookup printimagehash via printingprimary}/printing_{cardid}_{printingid}_select.jpg```

```database/{hash}/printing_{cardid}_{printingid}_details.jpg```
```_master.jpg```

```database/{imagehash}/card_{cardid}_icon.jpg```

* note: lbs is using icon, l5r is just using lookup printimagehash via printingprimary

* premium should be using _master, but it's inconsistent?

* _detail = max 600 dimension

* _master = 750x1050 or so


