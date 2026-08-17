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

  /* ---------- Photo wall (permanent local photos) ---------- */
  var PHOTOS = [
    'img/aliyah.jpg',
    'img/aliyah1.jpg', 'img/aliyah2.jpg', 'img/aliyah3.jpg',
    'img/aliyah4.jpg', 'img/aliyah5.jpg', 'img/aliyah6.jpg',
    'img/aliyah7.jpg', 'img/aliyah8.jpg', 'img/aliyah11.jpg',
    'img/aliyah13.jpg', 'img/aliyah14.jpg', 'img/aliyah16.jpg',
    'img/aliyah17.jpg', 'img/aliyah9.jpg', 'img/aliyah20.jpg',
    'img/aliyah21.jpg', 'img/aliyah22.jpg', 'img/aliyah23.jpg',
    'img/aliyah24.jpg', 'img/aliyah25.jpg', 'img/aliyah26.jpg'
  ];

  var CAPTIONS = [
    'The sweetest smile ✨', 'Hello sunshine 🌸', 'Pretty in pink 💗',
    'Little dreamer ⭐', 'Twinkle, twinkle 🎀', 'Pure joy 😊',
    'Charming as always 🧸', 'Cuteness overload 🍭', 'Sweetest girl 🎂',
    'Golden moments 🌟', 'Simply beautiful 🌷', 'Happiness unlocked 🎉',
    'Laughter & love ❤️', 'Our little star 🌟', 'Shining bright ✨',
    'Memories forever 📸', 'Heart of gold 💛', 'Positively pretty 🦋',
    'Gorgeous girl 🌺', 'Smile that glows 💕', 'With Mommy 💕',
    'with daddy ✨'
  ];

  var grid = $('#photoGrid');

  function renderGrid() {
    grid.innerHTML = '';
    PHOTOS.forEach(function (src, i) {
      var card = document.createElement('figure');
      card.className = 'polaroid';
      card.style.setProperty('--rot', Math.round(Math.random() * 10 - 5) + 'deg');
      card.innerHTML =
        '<span class="tape"></span>' +
        '<img src="' + src + '" alt="Moment ' + (i + 1) + '" loading="lazy">' +
        '<figcaption>' +
        '<p class="caption-static">' + (CAPTIONS[i] || 'A beautiful moment 💖') + '</p>' +
        '</figcaption>';

      card.querySelector('img').addEventListener('click', function () { openLightbox(src); });
      grid.appendChild(card);
    });
  }

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

  function openLightbox(src) {
    if (!src) return;
    lbImg.src = src;
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
