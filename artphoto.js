// Search by photo (loaded on first use by artphotostart in oracle.js; docs/admin/art-search.md).
//
// Logged-in users with a permission on the game only (artphotoallowed in oracle.js; the API checks too).
// The photo is shrunk here (long side ARTPHOTO_LONG px, re-encoded as JPEG, so it is upright and
// small) and sent to POST /artphoto (ootv-search artembed/), which finds and straightens the card,
// embeds its art in every orientation and answers an id plus the outlines it tried. The search is
// then an ordinary #search=table=...&artphoto=<id> url: the vectors last a week, the photo itself
// is never stored. The photo stays in this page (artphotostate), so the results can show the card
// that was matched (/search answers which outline, artphoto.card) and the user can drag its corners
// and search again.

var ARTPHOTO_LONG = 1600;
var artphotostate = null;   // {id, canvas, size: [w, h], cards: [[[x, y] x4]], previews: [dataurl], crops: [[card, rotation]], card, rot, left: {day, minute}}

function artphotofile(input) {
  var file = input.files && input.files[0];
  input.value = '';         // the same file again still fires change
  if(!file) {
    nomodal();
    return;
  }
  modal('Search by photo', '<p>Reading the photo…</p>');
  var url = URL.createObjectURL(file);
  var img = new Image();
  img.onload = function() {
    URL.revokeObjectURL(url);
    // drawing applies the photo's EXIF orientation (every current browser), so the canvas is upright
    var k = Math.min(1, ARTPHOTO_LONG / Math.max(img.naturalWidth, img.naturalHeight));
    var canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * k));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * k));
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    artphotosend(canvas, null);
  };
  img.onerror = function() {
    URL.revokeObjectURL(url);
    modal('Search by photo', '<p>That file could not be read as a picture. Try a JPEG or PNG photo.</p>');
  };
  img.src = url;
}

// photo (+ corners the user set, in the canvas's pixels) -> /artphoto -> the search
function artphotosend(canvas, corners) {
  modal('Search by photo', '<p>Looking for the card…</p>');
  var body = {uid: getuid(), table: database, image: canvas.toDataURL('image/jpeg', 0.88)};
  if(corners) {
    body.corners = corners;
  }
  $.ajax({type: 'POST', url: apiuri+'/artphoto', contentType: 'application/json', dataType: 'json',
          beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', getidtoken()); },
          data: JSON.stringify(body)})
    .done(function(r) {
      artphotostate = {id: r.id, canvas: canvas, size: r.size, cards: r.cards || [], previews: r.previews || [],
                       crops: r.crops || [], card: 0, rot: 0, left: r.left || {}};
      nomodal();
      var fdata = {table: database, artphoto: r.id};
      fillsearchform(fdata);
      seturl({'view': 'search', 'qs': $.param(fdata)});
      dosearch(0, fdata);
    })
    .fail(function(xhr) {
      var msg = (xhr.responseJSON && xhr.responseJSON.message && xhr.status != 401) ? xhr.responseJSON.message :
        xhr.status == 401 ? 'Your login has expired: log in again, then try the photo again.' :
        (xhr.status == 429 || xhr.status == 503 ? 'The photo search is busy. Try again in a moment.' : 'The photo search failed. Try again in a moment.');
      modal('Search by photo', '<p>'+htmlEncode(msg)+'</p>');
    });
}

// above the results of a photo search: the card that was matched, and a way to correct its outline.
// match: /search's artphoto ({crop, card}) for a fresh search, null when redrawn from the cache.
function artphotoresults(id, match) {
  var st = artphotostate && artphotostate.id == id ? artphotostate : null;
  if(st && match && match.card >= 0) {
    st.card = match.card;
    st.rot = st.crops[match.crop] ? st.crops[match.crop][1] : 0;
  }
  var html = '<div class="artphotopanel">';
  if(st && st.previews[st.card]) {
    // turned the way the card matched (the crop's rotation is counter-clockwise, CSS turns clockwise)
    html += '<img class="artphotopreview artphotorot'+((360 - st.rot) % 360)+'" src="'+st.previews[st.card]+'" alt="The card found in your photo" />'+
      '<div class="artphotonote">Cards whose art looks most like the card in your photo, closest first.<br />'+
      'Not the right card, or the wrong part of the photo? '+
      '<span class="button gray" onclick="artphotoedit();">Adjust the outline</span></div>';
  } else if(st) {
    html += '<div class="artphotonote">No card outline was found in your photo, so the whole picture was searched. '+
      'For a better match, <span class="button gray" onclick="artphotoedit();">mark the card\'s corners</span></div>';
  } else {
    html += '<div class="artphotonote">Cards whose art looks most like a photo (the photo isn\'t kept; its search lasts a week).</div>';
  }
  if(st && st.left && st.left.day !== undefined) {
    html += '<div class="artphotoleft">'+st.left.day+' photo search'+(st.left.day == 1 ? '' : 'es')+' left today</div>';
  }
  html += '</div>';
  $('#resultsearch .artphotopanel').remove();
  $('#resultsearch').prepend(html);
}

// the corner editor: the photo with the outline's 4 corners to drag, then search again with them
function artphotoedit() {
  var st = artphotostate;
  if(!st) {
    return;
  }
  var w = st.size[0], h = st.size[1];
  var corners = st.cards[st.card] ? st.cards[st.card].map(function(p) { return p.slice(); })
    : [[0.2 * w, 0.2 * h], [0.8 * w, 0.2 * h], [0.8 * w, 0.8 * h], [0.2 * w, 0.8 * h]];
  modal('Mark the card', '<p>Drag the four dots onto the corners of the card, then search again.</p>'+
    '<div class="artphotoedit"><img src="'+st.canvas.toDataURL('image/jpeg', 0.8)+'" alt="Your photo" />'+
    '<svg viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none"><polygon /></svg>'+
    [0, 1, 2, 3].map(function(i) { return '<div class="artphotohandle" data-i="'+i+'"></div>'; }).join('')+'</div><br />'+
    '<span class="button gray" id="artphotoagain">Search with this outline<span class="iiconic ipositive"><svg class="feather"><use xlink:href="res/feather-sprite.svg#search"></svg></span></span>');
  $('#modal').addClass('artphotomodal');
  var box = $('#modal .artphotoedit');
  var draw = function() {
    box.find('polygon').attr('points', corners.map(function(p) { return p[0]+','+p[1]; }).join(' '));
    box.find('.artphotohandle').each(function() {
      var p = corners[$(this).data('i')];
      $(this).css({left: (100 * p[0] / w)+'%', top: (100 * p[1] / h)+'%'});
    });
  };
  draw();
  box.find('.artphotohandle').on('pointerdown', function(e) {
    var handle = this, i = $(handle).data('i');
    handle.setPointerCapture(e.originalEvent.pointerId);
    $(handle).on('pointermove.artphoto', function(ev) {
      var r = box[0].getBoundingClientRect();
      corners[i] = [Math.max(0, Math.min(w, (ev.clientX - r.left) / r.width * w)),
                    Math.max(0, Math.min(h, (ev.clientY - r.top) / r.height * h))];
      draw();
    }).on('pointerup.artphoto pointercancel.artphoto', function() {
      $(handle).off('.artphoto');
    });
    e.preventDefault();
  });
  $('#artphotoagain').on('click', function() {
    artphotosend(st.canvas, corners.map(function(p) { return [Math.round(p[0]), Math.round(p[1])]; }));
  });
}
