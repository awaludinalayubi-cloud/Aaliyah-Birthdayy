(function () {
  'use strict';

  var $ = function (sel) { return document.querySelector(sel); };

  /* ---------- Confetti ---------- */
  var canvas = $('#confetti');
  var ctx = canvas.getContext('2d');
  var W, H;

  function sizeCanvas() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', sizeCanvas);
  sizeCanvas();

  var COLORS = ['#e63946', '#ff5d8f', '#ffd166', '#ffffff', '#ff8fab', '#c1121f'];
  var EMOJIS = ['🎈', '💗', '🎀', '✨', '⭐', '🌸'];
  var pieces = [];

  function makePiece(fromTop) {
    var useEmoji = Math.random() < 0.22;
    return {
      x: Math.random() * W,
      y: fromTop ? -20 : Math.random() * -H,
      size: 6 + Math.random() * 8,
      speed: 2 + Math.random() * 3.5,
      sway: (Math.random() * 2 - 1) * 1.2,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      emoji: useEmoji ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : null,
      alpha: 0.75 + Math.random() * 0.25
    };
  }

  function burst(n) {
    for (var i = 0; i < n; i++) pieces.push(makePiece(true));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = pieces.length - 1; i >= 0; i--) {
      var p = pieces[i];
      p.y += p.speed;
      p.x += p.sway + Math.sin(p.y * 0.02 + p.rot) * 1.1;
      p.rot += p.rotSpeed;
      if (p.y > H + 40) { pieces.splice(i, 1); continue; }
      ctx.globalAlpha = p.alpha;
      if (p.emoji) {
        ctx.font = (p.size * 2.2) + 'px serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.emoji, p.x, p.y);
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
    }
    requestAnimationFrame(draw);
  }
  burst(90);
  draw();

  /* ---------- Balloons ---------- */
  var balloonsWrap = $('#balloons');
  var BALLOON_COLORS = ['#e63946', '#ff5d8f', '#ffd166', '#ff8fab', '#ffffff', '#c1121f'];
  for (var bi = 0; bi < 16; bi++) {
    var b = document.createElement('div');
    b.className = 'balloon';
    var size = 46 + Math.random() * 36;
    b.style.width = size + 'px';
    b.style.height = Math.round(size * 1.18) + 'px';
    b.style.left = (Math.random() * 100) + '%';
    b.style.background = BALLOON_COLORS[bi % BALLOON_COLORS.length];
    b.style.animationDuration = (9 + Math.random() * 9) + 's';
    b.style.animationDelay = (Math.random() * 12) + 's';
    balloonsWrap.appendChild(b);
  }

  /* ---------- Reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- Photo wall ---------- */
  var STORAGE_KEY = 'aaliyah-photos';
  var photos = [];
  try { photos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { photos = []; }

  var grid = $('#photoGrid');
  var dropzone = $('#dropzone');
  var fileInput = $('#fileInput');

  function savePhotos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(photos.slice(0, 40)));
    } catch (e) { /* storage full — keep in memory */ }
  }

  function esc(s) {
    return (s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderGrid() {
    grid.innerHTML = '';
    if (!photos.length) {
      var hint = document.createElement('div');
      hint.className = 'polaroid empty-hint';
      hint.textContent = 'No photos yet — add the first one above! 🎀';
      grid.appendChild(hint);
      return;
    }
    photos.forEach(function (photo, i) {
      var card = document.createElement('figure');
      card.className = 'polaroid';
      card.style.setProperty('--rot', photo.rot + 'deg');
      card.innerHTML =
        '<span class="tape"></span>' +
        '<img src="' + photo.src + '" alt="Birthday photo ' + (i + 1) + '">' +
        '<figcaption>' +
        '<input class="caption" value="' + esc(photo.caption) + '" placeholder="Write something cute…" aria-label="Caption">' +
        '<button class="delete" aria-label="Remove photo">&times;</button>' +
        '</figcaption>';

      card.querySelector('img').addEventListener('click', function () { openLightbox(i); });
      card.querySelector('.delete').addEventListener('click', function (e) {
        e.stopPropagation();
        photos.splice(i, 1);
        renderGrid();
        savePhotos();
      });
      card.querySelector('.caption').addEventListener('input', function (e) {
        photo.caption = e.target.value;
        savePhotos();
      });
      grid.appendChild(card);
    });
  }

  function addPhotos(files) {
    var pending = 0;
    Array.prototype.forEach.call(files, function (file) {
      if (!file.type || file.type.indexOf('image/') !== 0) return;
      pending++;
      var reader = new FileReader();
      reader.onload = function () {
        photos.push({
          src: reader.result,
          caption: '',
          rot: Math.round(Math.random() * 10 - 5)
        });
        pending--;
        renderGrid();
        savePhotos();
        if (pending === 0) burst(60);
      };
      reader.readAsDataURL(file);
    });
  }

  ['dragenter', 'dragover'].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) {
      e.preventDefault();
      dropzone.classList.add('drag');
    });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) {
      e.preventDefault();
      dropzone.classList.remove('drag');
    });
  });
  dropzone.addEventListener('drop', function (e) { addPhotos(e.dataTransfer.files); });
  $('#pickBtn').addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function () {
    addPhotos(fileInput.files);
    fileInput.value = '';
  });

  renderGrid();

  /* ---------- Letter typewriter ---------- */
  var letterCard = $('.letter-card');

  function startTyping() {
    var paras = letterCard.querySelectorAll('p');
    var queues = [];
    var totalChars = 0;

    paras.forEach(function (p) {
      var nodes = Array.prototype.slice.call(p.childNodes);
      var segs = [];
      nodes.forEach(function (n) {
        if (n.nodeType === 3 && n.nodeValue) {
          segs.push({ node: n, text: n.nodeValue });
          totalChars += n.nodeValue.length;
        }
      });
      if (!segs.length) return;
      p.innerHTML = '';
      nodes.forEach(function (n) {
        if (n.nodeType === 3) n.nodeValue = '';
        p.appendChild(n);
      });
      queues.push({ segs: segs });
    });

    var cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    letterCard.appendChild(cursor);

    var speed = totalChars > 900 ? 22 : 30;
    var paraDelay = 500;
    var qIdx = 0, sIdx = 0, cIdx = 0;

    function tick() {
      if (qIdx >= queues.length) { cursor.remove(); return; }
      var q = queues[qIdx];
      if (sIdx >= q.segs.length) {
        qIdx++; sIdx = 0; cIdx = 0;
        setTimeout(tick, paraDelay);
        return;
      }
      var seg = q.segs[sIdx];
      cIdx++;
      seg.node.nodeValue = seg.text.slice(0, cIdx);
      if (cIdx >= seg.text.length) { sIdx++; cIdx = 0; }
      setTimeout(tick, speed);
    }
    tick();
  }

  if (letterCard) {
    var ioLetter = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          ioLetter.disconnect();
          startTyping();
        }
      });
    }, { threshold: 0.2 });
    ioLetter.observe(letterCard);
  }

  /* ---------- Music ---------- */
  var audio = $('#bgm');
  var musicBtn = $('#musicBtn');

  function setPlaying(on) {
    musicBtn.classList.toggle('playing', on);
    musicBtn.setAttribute('aria-pressed', on);
    musicBtn.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
  }

  musicBtn.addEventListener('click', function () {
    if (musicBtn.classList.contains('playing')) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  });
  audio.addEventListener('pause', function () { setPlaying(false); });
  audio.addEventListener('play', function () { setPlaying(true); });

  /* ---------- Lightbox ---------- */
  var lightbox = $('#lightbox');
  var lbImg = $('#lbImg');

  function openLightbox(i) {
    if (!photos[i]) return;
    lbImg.src = photos[i].src;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }
  $('#lbClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
})();
