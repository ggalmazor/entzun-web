// The spacing sliders in the accessibility section reshape the text beside them, and the reader
// frames narrate: the marker walks through a sentence, a later word is tapped, and the narration
// moves there. The page reads fine without this file: the sliders stay hidden and each reader
// frame is a still of the narrating page.
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
  if (!frames.length) return;
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

    var steps = [];
    first.slice(0, WORDS_BEFORE_TAP).forEach(function (word) { steps.push({ word: word, ms: word.ms }); });
    var skipped = first.slice(WORDS_BEFORE_TAP).reduce(function (sum, word) { return sum + word.ms; }, 0);
    steps.push({ tap: second[0], skip: skipped, ms: 450 });
    second.forEach(function (word) { steps.push({ word: word, ms: word.ms }); });
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

    function showTap(word) {
      var at = word.el.getBoundingClientRect(), screen = frame.getBoundingClientRect();
      tap.style.left = (at.left + at.width / 2 - screen.left) + 'px';
      tap.style.top = (at.top + at.height / 2 - screen.top) + 'px';
      tap.classList.remove('is-on');
      void tap.offsetWidth;
      tap.classList.add('is-on');
    }

    function begin() {
      frame.classList.add('is-snapping');
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
      } else if (next.tap) {
        showTap(next.tap);
        seconds += next.skip / 1000;
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
})();
