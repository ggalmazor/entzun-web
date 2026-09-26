// The spacing sliders in the accessibility section reshape the text beside them, the reader frames
// narrate, and on the home page each section holds still for a while as the page scrolls, then gives
// way to the next. The page reads fine without this file: the sliders stay hidden, each reader frame
// is a still of the narrating page, and the sections scroll as an ordinary page.
(function () {
  var needsScript = document.querySelectorAll('[data-needs-script]');
  for (var i = 0; i < needsScript.length; i++) needsScript[i].hidden = false;

  var demo = document.querySelector('[data-spacing-demo]');
  if (!demo) return;
  var map = {
    characters: function (v) { demo.style.letterSpacing = v + 'px'; },
    words: function (v) { demo.style.wordSpacing = v + 'px'; },
    lines: function (v) { demo.style.lineHeight = v; },
    paragraphs: function (v) { demo.style.gap = v + 'px'; }
  };
  var inputs = document.querySelectorAll('[data-spacing]');
  for (var j = 0; j < inputs.length; j++) {
    (function (input) {
      var apply = map[input.getAttribute('data-spacing')];
      if (!apply) return;
      input.addEventListener('input', function () { apply(input.value); });
      apply(input.value);
    })(inputs[j]);
  }
})();

(function () {
  var frames = document.querySelectorAll('[data-reader-emu]');
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var PLAYED = 10 * 3600 + 5 * 60 + 42;
  var TOTAL = PLAYED + 14 * 3600 + 31 * 60 + 18;
  var WORDS_BEFORE_TAP = 9;
  var STILL_WORD = 7;

  function clock(seconds) {
    var s = Math.floor(seconds), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60;
    return h + ':' + (m < 10 ? '0' : '') + m + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
  }

  // Splits a sentence into word spans, leaving quotes, punctuation and dashes outside the marker.
  function words(sentence) {
    var list = [];
    var text = sentence.textContent;
    sentence.textContent = '';
    text.split(/(\s+|\u2014)/).forEach(function (piece) {
      if (!piece) return;
      var parts = /^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u.exec(piece);
      if (!parts[2]) { sentence.appendChild(document.createTextNode(piece)); return; }
      if (parts[1]) sentence.appendChild(document.createTextNode(parts[1]));
      var span = document.createElement('span');
      span.className = 'w';
      span.textContent = parts[2];
      sentence.appendChild(span);
      if (parts[3]) sentence.appendChild(document.createTextNode(parts[3]));
      // Roughly a narrator's pace: longer words take longer, and punctuation is a breath.
      var ms = 170 + 38 * parts[2].length;
      if (/[.!?]/.test(parts[3])) ms += 380;
      else if (/[,;:]/.test(parts[3])) ms += 220;
      list.push({ el: span, sentence: sentence, ms: ms });
    });
    return list;
  }

  function setUp(frame) {
    var page = frame.querySelector('.emu-page');
    var text = frame.querySelector('.emu-text');
    var tap = frame.querySelector('.emu-tap');
    var played = frame.querySelector('[data-emu-played]');
    var left = frame.querySelector('[data-emu-left]');
    var first = words(frame.querySelector('[data-emu-first]'));
    var second = words(frame.querySelector('[data-emu-second]'));
    var hiding = frame.getAttribute('data-reader-emu') === 'hide';

    var steps = [];
    function narrate(list) { list.forEach(function (word) { steps.push({ word: word, ms: word.ms }); }); }
    if (hiding) {
      // The narration never stops: controls go away, the reading carries on, and they come back.
      narrate(first.slice(0, 6));
      steps.push({ ripple: frame.querySelector('.emu-tools > :last-child'), hide: true, ms: 500 });
      narrate(first.slice(6, 22));
      steps.push({ ripple: frame.querySelector('.emu-show'), hide: false, ms: 500 });
      narrate(first.slice(22, 28));
    } else {
      narrate(first.slice(0, WORDS_BEFORE_TAP));
      var skipped = first.slice(WORDS_BEFORE_TAP).reduce(function (sum, word) { return sum + word.ms; }, 0);
      steps.push({ ripple: second[0].el, skip: skipped, ms: 450 });
      narrate(second);
    }
    steps.push({ ms: 1400 });
    steps.push({ reset: true, ms: 450 });

    var step = 0, seconds = PLAYED, timer = null, current = null;
    var userPaused = false, visible = false;

    function showClock() {
      played.textContent = clock(seconds);
      left.textContent = '-' + clock(TOTAL - seconds);
    }

    function centre(sentence) {
      var box = sentence.getBoundingClientRect();
      var top = box.top - text.getBoundingClientRect().top;
      var y = page.clientHeight * 0.47 - (top + box.height / 2);
      text.style.setProperty('--emu-y', Math.round(y) + 'px');
    }

    function mark(word) {
      if (current) current.el.classList.remove('is-now');
      if (word && (!current || current.sentence !== word.sentence)) {
        var lit = text.querySelector('.s.is-lit');
        if (lit) lit.classList.remove('is-lit');
        word.sentence.classList.add('is-lit');
        centre(word.sentence);
      }
      current = word;
      if (word) word.el.classList.add('is-now');
    }

    function showTap(el) {
      var at = el.getBoundingClientRect(), screen = frame.getBoundingClientRect();
      tap.style.left = (at.left + at.width / 2 - screen.left) + 'px';
      tap.style.top = (at.top + at.height / 2 - screen.top) + 'px';
      tap.classList.remove('is-on');
      void tap.offsetWidth;
      tap.classList.add('is-on');
    }

    function begin() {
      frame.classList.add('is-snapping');
      frame.classList.remove('is-hidden');
      mark(first[0]);
      seconds = PLAYED;
      showClock();
      void text.offsetWidth;
      frame.classList.remove('is-snapping');
    }

    function run() {
      var next = steps[step];
      if (next.word) {
        mark(next.word);
        seconds += next.ms / 1000;
        showClock();
      } else if (next.ripple) {
        showTap(next.ripple);
        if (next.skip) seconds += next.skip / 1000;
        if (next.hide !== undefined) frame.classList.toggle('is-hidden', next.hide);
      } else if (next.reset) {
        frame.classList.add('is-fading');
        timer = setTimeout(function () {
          begin();
          frame.classList.remove('is-fading');
          step = 1;
          timer = setTimeout(run, first[0].ms);
        }, next.ms);
        return;
      }
      step = (step + 1) % steps.length;
      timer = setTimeout(run, next.ms);
    }

    function going() { return timer !== null; }
    function stop() { clearTimeout(timer); timer = null; }
    function go() { if (!going() && visible && !userPaused) timer = setTimeout(run, 400); }

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'loop-toggle';
    function label() {
      button.textContent = userPaused ? 'Play' : 'Pause';
      frame.classList.toggle('is-paused', userPaused);
    }
    button.addEventListener('click', function () {
      userPaused = !userPaused;
      label();
      if (userPaused) stop(); else go();
    });
    frame.parentNode.appendChild(button);

    if (reduce && reduce.matches) {
      userPaused = true;
      mark(first[STILL_WORD]);
    } else {
      begin();
      step = 1;
    }
    label();

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) go(); else stop();
      }).observe(frame);
    } else {
      visible = true;
      go();
    }

    if (reduce && reduce.addEventListener) {
      reduce.addEventListener('change', function (event) {
        if (!event.matches) return;
        userPaused = true;
        stop();
        label();
      });
    }

    var recentre = function () { if (current) { frame.classList.add('is-snapping'); centre(current.sentence); void text.offsetWidth; frame.classList.remove('is-snapping'); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(recentre);
    window.addEventListener('resize', recentre);
  }

  for (var i = 0; i < frames.length; i++) setUp(frames[i]);

  // The pictures in "Who it is for": each narrates its line once when it comes into view, a few
  // seconds, and comes to rest on a marked word. Scrolling away and back plays it again.
  function walk(art) {
    var line = words(art.querySelector('[data-walk]'));
    var tap = art.querySelector('.who-tap');
    var REST = Math.min(line.length - 1, 12);
    var timer = null, current = null;
    function mark(word) {
      if (current) current.el.classList.remove('is-now');
      current = word;
      word.el.classList.add('is-now');
    }
    function play() {
      var at = 0;
      art.classList.add('is-playing');
      if (tap) {
        var box = line[0].el.getBoundingClientRect(), frame = art.getBoundingClientRect();
        tap.style.left = (box.left + box.width / 2 - frame.left) + 'px';
        tap.style.top = (box.top + box.height / 2 - frame.top) + 'px';
        tap.classList.remove('is-on');
        void tap.offsetWidth;
        tap.classList.add('is-on');
      }
      (function next() {
        mark(line[at]);
        if (at >= REST) { art.classList.remove('is-playing'); timer = null; return; }
        timer = setTimeout(next, line[at++].ms);
      })();
    }
    function stop() { clearTimeout(timer); timer = null; art.classList.remove('is-playing'); }
    mark(line[Math.min(REST, line.length - 1)]);
    if ((reduce && reduce.matches) || !window.IntersectionObserver) return;
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { if (!timer) play(); } else stop();
    }, { threshold: 0.8 }).observe(art);
  }
  var arts = document.querySelectorAll('[data-walk-art]');
  for (var k = 0; k < arts.length; k++) walk(arts[k]);
})();

(function () {
  if (!document.body.classList.contains('home') || !window.matchMedia) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var root = document.documentElement;
  var sections = [].filter.call(document.querySelectorAll('main > *'), function (section) {
    return section.querySelector(':scope > .wrap');
  });
  var ROOM = 0.9;
  var EDGE = 32;
  var height = 0, room = 0, queued = false;

  function clamp(value) { return Math.max(0, Math.min(1, value)); }

  // A section that fits the window is held in its middle; a taller one scrolls until its end is in
  // view and is held there.
  function measure() {
    height = window.innerHeight;
    room = height * ROOM;
    root.style.setProperty('--pin-room', room + 'px');
    sections.forEach(function (section) {
      var wrap = section.querySelector(':scope > .wrap');
      var own = wrap.offsetHeight;
      var stick = own <= height - 2 * EDGE ? (height - own) / 2 : height - own - EDGE;
      section.style.setProperty('--stick', Math.round(stick) + 'px');
      section.pinnedBottom = stick + own;
    });
  }

  // Coming in: fully shown once it is a little way up the window. Going out: it fades and lifts away
  // as the next section rises to meet it, so one gives way to the other with no empty window between.
  function update() {
    queued = false;
    var visible = sections.filter(function (section) { return section.offsetHeight; });
    visible.forEach(function (section, i) {
      var wrap = section.querySelector(':scope > .wrap');
      var box = wrap.getBoundingClientRect();
      var shown = clamp((height - box.top) / (height * 0.45));
      var next = visible[i + 1];
      var gone = 0;
      if (next) {
        var nextTop = next.querySelector(':scope > .wrap').getBoundingClientRect().top;
        gone = clamp((height - nextTop) / Math.max(height - section.pinnedBottom, height * 0.3));
      }
      wrap.style.opacity = Math.min(shown, 1 - gone);
      wrap.style.transform = 'translateY(' + Math.round((1 - shown) * 28 - gone * 28) + 'px)';
    });
  }

  function queue() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }

  function apply() {
    var on = !reduce.matches;
    root.classList.toggle('js-pin', on);
    if (on) {
      measure();
      update();
    } else {
      root.style.removeProperty('--pin-room');
      sections.forEach(function (section) {
        var wrap = section.querySelector(':scope > .wrap');
        section.style.removeProperty('--stick');
        wrap.style.opacity = '';
        wrap.style.transform = '';
      });
    }
  }

  apply();
  window.addEventListener('scroll', function () { if (!reduce.matches) queue(); }, { passive: true });
  window.addEventListener('resize', function () { if (!reduce.matches) { measure(); queue(); } });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
  if (reduce.addEventListener) reduce.addEventListener('change', apply);
})();
