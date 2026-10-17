// Set import ETL: spreadsheet CSV rows -> OotV card objects, driven by an import profile
// (JSON stored in oracle-all-structure, <game> / import/<name>; edited on Admin -> Import profiles).
// The profile says which columns feed which fields and lists the transforms; the transforms
// themselves are the named functions below. Used by the Admin set import (setimport.js) and by
// ootv-import/SCRIPTS/etl-compare.js, which checks a profile against parse.jq. No jQuery, no DOM.
//
// Profile shape (ootv-import/profiles/*.json are the seed copies; docs/admin/set-import.md has the reference):
//   params:   [{name, label, default, required, pattern, type, options, help}]  asked at the start;
//             "{{name}}" in values and defaults, "{{name|filter:arg}}" with pad, initials, lower, upper
//   tables:   {name: [[regex, replacement, flags], ...] or {key: value}}   used by transforms by name
//   columns:  [{to, from: [alias...], do: [...]}]   row aliases: an alias column that exists replaces `to`
//   rowsteps: ["l5rflavorsplit", ...]               named steps that change the row before the fields
//   fields:   rules, in order, each making one card field (later rules can read card.<field>):
//     {to: "title" | "printing.rarity" | "$temp", from: "Col" | ["Col", {col, do}] | "card.title" | "$temp",
//      value: "{{template}}" | [..],  each: [...], join: " ", list: true, do: [...],
//      when: {source: matcher}, unless: {...}, always: true, as: "string"}
//     or a step: {step: "copytoprinting" | "images", ...}
//   required: ["title", "type", ...]               card fields that must not be empty
(function(root) {
  'use strict';

  // ---------------------------------------------------------------- CSV

  // RFC 4180: quoted fields, "" escapes, newlines inside quotes, a BOM. Returns rows of strings.
  function parsecsv(text) {
    if(text.charCodeAt(0) == 0xFEFF) { text = text.slice(1); }
    var rows = [], row = [], field = '', i = 0, q = false, c;
    while(i < text.length) {
      c = text[i];
      if(q) {
        if(c == '"') {
          if(text[i+1] == '"') { field += '"'; i += 2; continue; }
          q = false; i++; continue;
        }
        field += c; i++; continue;
      }
      if(c == '"') { q = true; i++; continue; }
      if(c == ',') { row.push(field); field = ''; i++; continue; }
      if(c == '\r' || c == '\n') {
        row.push(field); field = '';
        rows.push(row); row = [];
        i += (c == '\r' && text[i+1] == '\n') ? 2 : 1;
        continue;
      }
      field += c; i++;
    }
    if(field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  // header + rows -> objects, like csv2json: a repeated header keeps the last value; rows
  // whose cells are all empty (the trailing ,,,,, a spreadsheet export leaves) are dropped
  function csvobjects(text) {
    var rows = parsecsv(text);
    var header = rows.shift() || [];
    var out = [];
    rows.forEach(function(r) {
      if(!r.some(x => x.trim() !== '')) { return; }
      var o = {};
      header.forEach(function(h,i) { o[h] = (r[i] === undefined) ? '' : r[i]; });
      out.push(o);
    });
    return {header: header, rows: out};
  }

  // ---------------------------------------------------------------- helpers

  function isempty(v) {
    return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length == 0);
  }

  function flat1(a) { return [].concat.apply([], a); }

  function rx(pattern, flags) {
    return new RegExp(pattern, Array.from(new Set((flags || '').replace(/[^gimsu]/g,''))).join(''));
  }

  // jq's split(str): "" -> []
  function jqsplit(s, sep) { return s === '' ? [] : s.split(sep); }

  function pad(v, n) {
    v = String(v);
    while(v.length < n) { v = '0' + v; }
    return v;
  }

  function initials(s) {
    return String(s).split(/\s+/).filter(w => w).map(function(w) {
      return /^[IVX]+$/.test(w) ? w : w[0].toUpperCase();
    }).join('').replace(/[^A-Za-z0-9_-]/g,'');
  }

  // A param's answer, cleaned by its kind (a param's `clean`; set, imagehash and snm have one by default):
  //   text: &nbsp; (with or without ;) becomes a space, whitespace runs collapse, ends trimmed. Set
  //         names are stored with plain spaces everywhere (cards, sort patterns, arcs, the S&M map).
  //   id:   only letters, digits, _ and - (image stubs, Sun and Moon codes)
  var CLEANDEFAULT = {set: 'text', imagehash: 'id', snm: 'id'};
  function cleanparam(v, kind) {
    if(v === undefined || v === null) { return v; }
    v = String(v);
    if(kind == 'text') { return v.replace(/&nbsp;?/gi, ' ').replace(/\s+/g, ' ').trim(); }
    if(kind == 'id') { return v.replace(/[^A-Za-z0-9_-]/g, ''); }
    return v;
  }
  function cleankind(d) { return d.clean === undefined ? CLEANDEFAULT[d.name] : d.clean; }

  // "{{name}}" / "{{name|filter:arg}}" against ctx (params, row, card.<field>)
  function render(tmpl, ctx) {
    if(Array.isArray(tmpl)) { return tmpl.map(t => render(t, ctx)); }
    if(typeof tmpl != 'string') { return tmpl; }
    return tmpl.replace(/\{\{\s*([^}|]+?)\s*(?:\|([^}]*))?\}\}/g, function(all, name, filters) {
      var v = lookupvalue(name, ctx);
      if(Array.isArray(v)) { v = v.length ? v[0] : ''; }
      v = (v === undefined || v === null) ? '' : String(v);
      (filters ? filters.split('|') : []).forEach(function(f) {
        var bits = f.split(':'), fn = bits[0].trim(), arg = bits.slice(1).join(':').trim();
        if(fn == 'pad') {
          var n = /^\d+$/.test(arg) ? parseInt(arg,10) : parseInt(lookupvalue(arg, ctx),10);
          v = pad(v, n || 0);
        }
        else if(fn == 'initials') { v = initials(v); }
        else if(fn == 'lower') { v = v.toLowerCase(); }
        else if(fn == 'upper') { v = v.toUpperCase(); }
        else { throw new Error('unknown template filter "'+fn+'"'); }
      });
      return v;
    });
  }

  // a source name: $temp, card.<field>[.<field>], params.<name> / <param>, row (number), or a CSV column
  function lookupvalue(name, ctx) {
    if(name[0] == '$') { return ctx.temp[name]; }
    if(name.indexOf('card.') == 0) {
      var v = ctx.card;
      name.slice(5).split('.').forEach(function(k) {
        if(v === undefined || v === null) { return; }
        if(Array.isArray(v) && !/^\d+$/.test(k)) { v = v[0]; }
        v = (v === undefined || v === null) ? undefined : v[k];
      });
      return v;
    }
    if(name == 'row') { return ctx.row; }
    if(name.indexOf('params.') == 0) { return ctx.params[name.slice(7)]; }
    if(ctx.params && Object.prototype.hasOwnProperty.call(ctx.params, name) && !(ctx.data && name in ctx.data)) {
      return ctx.params[name];
    }
    return ctx.data ? ctx.data[name] : undefined;
  }

  function table(ref, ctx) {
    if(typeof ref != 'string') { return ref; }
    var t = (ctx.profile.tables || {})[ref];
    if(t === undefined) { throw new Error('no table "'+ref+'"'); }
    return t;
  }

  // ---------------------------------------------------------------- transforms

  // named transforms on one string (arrays are mapped element by element by apply())
  var named = {
    // spaces, &nbsp (with or without ;) and <br> at the start, all of them; at the end, a run of
    // spaces/&nbsp or one <br>. As parse.jq's trim under jq 1.6, whose gsub lets ^ match again
    // where the previous match ended, so a leading "<br> <br>" goes entirely.
    trim: function(s) {
      var lead = /^(?:(?: |&nbsp;?)+|<br>)/i, m;
      while((m = lead.exec(s)) && m[0].length) { s = s.slice(m[0].length); }
      return s.replace(/(?: |&nbsp;?)+$|<br>$/i, '');
    },
    nodblspc: s => s.replace(/  */g, ' '),
    // <br> inside a cell is a line wrap; (spc) is a real line break
    nobrk: s => s.replace(/<br>/g, ' ').replace(/\(spc\)/g, '<br>'),
    nospec: s => s.replace(/“/g,'"').replace(/”/g,'"').replace(/–/g,'-').replace(/’/g,"'")
                  .replace(/ΓÇó/g,'&#149;').replace(/•/g,'&#149;').replace(/&#8226;/g,'&#149;'),
    upperfirst: s => s ? s[0].replace(/[a-z]/, x => x.toUpperCase()) + s.slice(1) : s,
    lower: s => s.toLowerCase(),
    upper: s => s.toUpperCase(),
    nbsp: s => s.replace(/ /g, '&nbsp;'),
    // L5R keywords: "A &#149; B &#149; <b>Unique &#149; Kharmic</b>" -> ["A","B","<b>Unique</b>","<b>Kharmic</b>"]
    // (parse.jq's keyword rule, kept as code)
    l5rkeywords: function(s, arg, ctx) {
      // "Experienced 2<br>Kuni Adokenai" is one keyword when the name after the line break is a live
      // card (ctx.known, from transform's opts.titles); otherwise the line break separates keywords
      if(ctx && ctx.known) {
        s = s.replace(/(Experienced(?: +\d+\w*)?) *<br> *([^<&•]+?)(?= *(?:&#149;|•|<\/b>|<br>|$))/gi,
                      (all, exp, name) => ctx.known(name) ? exp+' '+name.trim() : all);
      }
      if(/<b>.*<b>/i.test(s)) { return s.split(/ *&#149; */); }
      s = s.replace(/<b>&#149; /gi, '&#149; <b>').replace(/<br>/gi, ' &#149; ').replace(/<\/b> *$/i, '');
      if(s === '') { return []; }
      var sp = s.split(/(?: |&#149;)*<b>/);
      var out = [];
      if(sp[0] !== '') { out = out.concat(sp[0].split(/ *&#149; */)); }
      if(sp.length > 1 && sp[1] !== '') { out = out.concat(sp[1].split(/ *&#149; */).map(x => '<b>'+x+'</b>')); }
      return out;
    }
  };

  // parameterised transforms: {name: args}
  var parameterised = {
    // sequential global regex replacements: a table name or [[regex, replacement, flags], ...]
    replace: (s, arg, ctx) => table(arg, ctx).reduce((v, r) => v.replace(rx(r[0], (r[2]||'')+'g'), r[1]), s),
    // the same, first occurrence only (jq sub)
    sub: (s, arg, ctx) => table(arg, ctx).reduce((v, r) => v.replace(rx(r[0], r[2]), r[1]), s),
    // exact lookup in {key: value}; a value may be a list; no match leaves the value
    lookup: function(s, arg, ctx) {
      var t = table(typeof arg == 'object' && !Array.isArray(arg) && arg.table ? arg.table : arg, ctx);
      return Object.prototype.hasOwnProperty.call(t, s) ? t[s] : s;
    },
    // the value of the first [regex, value, flags] whose regex matches
    firstmatch: function(s, arg, ctx) {
      var t = table(arg, ctx);
      for(var i = 0; i < t.length; i++) {
        if(rx(t[i][0], t[i][2]).test(s)) { return t[i][1]; }
      }
      return s;
    },
    split: (s, arg) => jqsplit(s, arg),
    splitre: (s, arg) => s.split(rx(arg)),
    match: function(s, arg) { var m = rx(arg).exec(s); return m ? m[0] : ''; },
    wrap: (s, arg) => arg[0] + s + arg[1],
    prefix: (s, arg) => arg + s,
    suffix: (s, arg) => s + arg
  };

  // transforms that take the whole value (array or string)
  var whole = {
    index: (v, n) => Array.isArray(v) ? v[n] : (n == 0 ? v : undefined),
    join: (v, sep) => Array.isArray(v) ? v.join(sep) : v,
    default: (v, d) => isempty(v) ? d : v
  };

  function apply1(v, t, ctx) {
    var name, arg;
    if(typeof t == 'string') { name = t; }
    else {
      var keys = Object.keys(t);
      if(keys.length != 1) { throw new Error('a transform object has one key: '+JSON.stringify(t)); }
      name = keys[0]; arg = t[name];
    }
    if(whole[name]) { return whole[name](v, render(arg, ctx)); }
    var fn = named[name] || parameterised[name];
    if(!fn) { throw new Error('unknown transform "'+name+'"'); }
    var one = function(s) {
      if(s === undefined || s === null) { return s; }
      return fn(String(s), arg, ctx);
    };
    if(Array.isArray(v)) { return flat1(v.map(one).map(x => Array.isArray(x) ? x : [x])).filter(x => x !== undefined); }
    return one(v);
  }

  function applyall(v, list, ctx) {
    (list || []).forEach(function(t) { v = apply1(v, t, ctx); });
    return v;
  }

  // ---------------------------------------------------------------- conditions

  // matcher: "Proxy" (equals), {test, flags}, {in: [...]}, {empty: true}, {nonempty: true};
  // a list value matches when any element does
  function matches(v, m) {
    if(m && typeof m == 'object' && !Array.isArray(m)) {
      if('empty' in m) { return isempty(v) == !!m.empty; }
      if('nonempty' in m) { return !isempty(v) == !!m.nonempty; }
    }
    if(Array.isArray(v)) { return v.some(x => matches(x, m)); }
    if(v === undefined || v === null) { v = ''; }
    if(typeof m == 'string') { return String(v) === m; }
    if(m && m.test !== undefined) { return rx(m.test, m.flags).test(String(v)); }
    if(m && m.in) { return m.in.indexOf(String(v)) >= 0; }
    throw new Error('bad matcher '+JSON.stringify(m));
  }

  function condition(c, ctx) {
    return Object.keys(c).every(k => matches(lookupvalue(k, ctx), c[k]));
  }

  // ---------------------------------------------------------------- fields

  function setpath(ctx, to, v) {
    if(to[0] == '$') { ctx.temp[to] = v; return; }
    if(to.indexOf('printing.') == 0) { ctx.card.printing[0][to.slice(9)] = v; return; }
    ctx.card[to] = v;
  }

  // one source of a rule: its raw value (empty = skipped) and the value after its own transforms
  function source(src, rule, ctx) {
    var col = typeof src == 'string' ? src : src.col;
    var raw = lookupvalue(col, ctx);
    if(isempty(raw)) { return null; }
    var v = applyall(raw, rule.each, ctx);
    if(typeof src == 'object') { v = applyall(v, src.do, ctx); }
    return v;
  }

  function runrule(rule, ctx) {
    if(rule.when && !condition(rule.when, ctx)) { return; }
    if(rule.unless && condition(rule.unless, ctx)) { return; }
    var v;
    if('value' in rule) {
      v = render(rule.value, ctx);
      if(isempty(v) && !rule.always) { return; }
      v = applyall(v, rule.do, ctx);
    } else {
      var srcs = Array.isArray(rule.from) ? rule.from : [rule.from];
      var parts = srcs.map(s => source(s, rule, ctx)).filter(x => x !== null);
      if(!parts.length) {
        if(!rule.always) { return; }
        v = rule.list ? [] : '';
      } else if(rule.list) {
        v = flat1(parts.map(p => Array.isArray(p) ? p : [p]));
      } else if(parts.length > 1 || 'join' in rule) {
        v = parts.map(p => Array.isArray(p) ? p.join(rule.join || ' ') : p).join('join' in rule ? rule.join : ' ');
      } else {
        v = parts[0];
      }
      v = applyall(v, rule.do, ctx);
    }
    if((v === undefined || v === null || v === '') && !rule.always) { return; }
    if(rule.as == 'string') {
      v = Array.isArray(v) ? v[0] : v;
    } else if(!Array.isArray(v)) {
      v = (v === undefined || v === null || v === '') && rule.list ? [] : [v];
    }
    if(rule.to[0] != '$' && Array.isArray(v)) { v = v.map(x => typeof x == 'string' ? x : String(x)); }
    setpath(ctx, rule.to, v);
  }

  // ---------------------------------------------------------------- steps

  var rowsteps = {
    // L5R: flavor text left in the game text as a trailing <i>...</i> (or an unclosed <i>) moves
    // to FlavorText when FlavorText is empty (parse.jq's rule)
    l5rflavorsplit: function(row, args) {
      var tcol = (args && args.text) || 'GameText', fcol = (args && args.flavor) || 'FlavorText';
      var text = row[tcol];
      if(text === undefined || text === null) { return; }
      var t = named.trim(text);
      var opens = jqsplit(t, '<i>').length, closes = jqsplit(t, '</i>');
      var last = closes.length ? closes[closes.length-1] : null;
      var noflavor = () => isempty(row[fcol]);
      var cut = () => text.split('<i>').slice(0,-1).join('<i>').replace(/<br> *$/i, '');
      if(noflavor() && opens > closes.length) {
        var parts = jqsplit(t, '<i>');
        row[fcol] = parts[parts.length-1];
        row[tcol] = cut();
      }
      if(noflavor() && opens == closes.length && last === '') {
        var parts2 = jqsplit(t, '<i>');
        row[fcol] = (parts2[parts2.length-1] || '').replace(/<\/i>$/i, '');
        row[tcol] = cut();
      }
    }
  };

  var cardsteps = {
    // copy card fields onto the printing (as parse.jq does, so the printing keeps its own text);
    // except: {field: condition} skips a field when the condition holds
    copytoprinting: function(step, ctx) {
      var p = ctx.card.printing[0];
      step.fields.forEach(function(f) {
        if(!(f in ctx.card) || ctx.card[f] === null) { return; }
        if(step.except && step.except[f] && condition(step.except[f], ctx)) { return; }
        p[f] = ctx.card[f];
      });
    },
    // printing.imagehash and printing.image: [{master, details, select}] named from a template,
    // plus extra images (a stronghold's back) when their condition holds
    images: function(step, ctx) {
      var p = ctx.card.printing[0];
      var base = render(step.name, ctx);
      var ext = step.ext || 'png';
      var one = sfx => ({details: base+sfx+'_details.'+ext, select: base+sfx+'_select.'+ext, master: base+sfx+'_master.'+ext});
      p.imagehash = render(step.imagehash || '{{imagehash}}', ctx);
      p.image = [one('')].concat((step.extra || []).filter(x => !x.when || condition(x.when, ctx)).map(x => one(x.suffix)));
    }
  };

  // ---------------------------------------------------------------- run

  // rows: CSV objects; params: {name: value}. -> {cards: [{file, row, card, reprint, errors, warnings}], errors}
  // names as the server's matching compares them (setimport.mjs norm)
  function namekey(s) {
    return String(s || '').replace(/<[^>]*>/g, '').replace(/&nbsp;?/gi, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'").replace(/[’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  // opts.titles: the live card names (the admin titles action), for transforms that need to know them
  function transform(profile, rows, params, header, opts) {
    var out = [], errors = [];
    var titleset = opts && opts.titles ? new Set(opts.titles) : null;
    var knownname = titleset ? (name => titleset.has(namekey(name))) : null;
    var p = Object.assign({}, params);
    (profile.params || []).forEach(function(d) {
      if(isempty(p[d.name]) && d.default !== undefined) { p[d.name] = render(d.default, {params: p, temp: {}}); }
      p[d.name] = cleanparam(p[d.name], cleankind(d));
      if(d.type == 'int' && !isempty(p[d.name])) { p[d.name] = parseInt(p[d.name], 10); }
    });
    var digits = parseInt(p.imagedigits, 10) || 3;
    if(header) {
      var known = new Set(header);
      var used = [];
      (profile.columns || []).forEach(c => used.push.apply(used, c.from));
      (profile.fields || []).forEach(function(f) {
        [].concat(f.from || []).forEach(s => used.push(typeof s == 'string' ? s : s.col));
      });
      var missing = used.filter(c => c && c[0] != '$' && c.indexOf('card.') != 0 && !known.has(c) &&
                                     !(profile.columns || []).some(a => a.to == c));
      var aliased = new Set();
      (profile.columns || []).forEach(a => { if(a.from.some(x => known.has(x))) { aliased.add(a.to); } });
      missing = missing.filter(c => !aliased.has(c) && !(profile.columns || []).some(a => a.from.indexOf(c) >= 0));
      if(missing.length) { errors.push({level: 'warn', message: 'columns the profile reads that the CSV doesn\'t have: '+Array.from(new Set(missing)).join(', ')}); }
    }
    rows.forEach(function(raw, i) {
      var row = Object.assign({}, raw);
      var n = i + 1;
      var file = render('{{imagehash}}', {params: p, temp: {}}) + '_' + pad(n, digits) + '.json';
      var item = {file: file, row: n, errors: [], warnings: []};
      try {
        (profile.columns || []).forEach(function(a) {
          a.from.forEach(function(col) {
            if(col in row && row[col] !== null) { row[a.to] = applyall(row[col], a.do, {profile: profile, params: p, temp: {}, data: row}); }
          });
        });
        (profile.rowsteps || []).forEach(function(s) {
          var name = typeof s == 'string' ? s : s.step;
          if(!rowsteps[name]) { throw new Error('unknown row step "'+name+'"'); }
          rowsteps[name](row, typeof s == 'string' ? {} : s);
        });
        var ctx = {profile: profile, params: p, temp: {}, data: row, row: n, known: knownname,
                   card: {printing: [{}]}};
        (profile.fields || []).forEach(function(rule) {
          try {
            if(rule.step) {
              if(!cardsteps[rule.step]) { throw new Error('unknown step "'+rule.step+'"'); }
              cardsteps[rule.step](rule, ctx);
            } else {
              runrule(rule, ctx);
            }
          } catch(e) {
            item.errors.push((rule.to || rule.step) + ': ' + e.message);
          }
        });
        var card = ctx.card;
        card.printing[0].printingid = '1';
        card.printingprimary = '1';
        (profile.required || []).forEach(function(f) {
          var v = f.indexOf('printing.') == 0 ? card.printing[0][f.slice(9)] : card[f];
          if(isempty(v) || (Array.isArray(v) && v.every(x => isempty(x)))) { item.errors.push(f+' is empty'); }
        });
        item.reprint = String(row[profile.reprintcolumn || 'Reprint'] || '') == '1';
        if('Reprint' in card) { delete card.Reprint; }
        item.card = card;
      } catch(e) {
        item.errors.push(e.message);
      }
      out.push(item);
    });
    return {cards: out, errors: errors, params: p};
  }

  // the card as set-import.py's out/ files hold it (Reprint carried for the plan)
  function outfile(item) {
    var c = Object.assign({}, item.card);
    c.Reprint = item.reprint ? '1' : '0';
    return c;
  }

  // ---------------------------------------------------------------- JSON display

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // JSON as HTML with spans for keys, strings, numbers, literals and punctuation (classes json-*)
  function jsonhtml(v, indent) {
    indent = indent || '';
    var next = indent + '  ';
    if(Array.isArray(v)) {
      if(!v.length) { return '<span class="json-p">[]</span>'; }
      var simple = v.every(x => x === null || typeof x != 'object');
      if(simple && JSON.stringify(v).length < 80) {
        return '<span class="json-p">[</span>' + v.map(x => jsonhtml(x)).join('<span class="json-p">, </span>') + '<span class="json-p">]</span>';
      }
      return '<span class="json-p">[</span>\n' + v.map(x => next + jsonhtml(x, next)).join('<span class="json-p">,</span>\n') +
             '\n' + indent + '<span class="json-p">]</span>';
    }
    if(v && typeof v == 'object') {
      var keys = Object.keys(v);
      if(!keys.length) { return '<span class="json-p">{}</span>'; }
      return '<span class="json-p">{</span>\n' + keys.map(k => next + '<span class="json-k">"' + esc(k) + '"</span><span class="json-p">: </span>' +
             jsonhtml(v[k], next)).join('<span class="json-p">,</span>\n') + '\n' + indent + '<span class="json-p">}</span>';
    }
    if(typeof v == 'string') { return '<span class="json-s">' + esc(JSON.stringify(v)) + '</span>'; }
    if(typeof v == 'number') { return '<span class="json-n">' + v + '</span>'; }
    return '<span class="json-l">' + String(v) + '</span>';
  }

  var api = {parsecsv: parsecsv, csvobjects: csvobjects, transform: transform, outfile: outfile, render: render,
             cleanparam: cleanparam, cleankind: cleankind,
             jsonhtml: jsonhtml, initials: initials, transforms: Object.keys(named).concat(Object.keys(parameterised), Object.keys(whole)),
             rowsteps: Object.keys(rowsteps), cardsteps: Object.keys(cardsteps)};
  if(typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.setimportetl = api; }
})(this);
