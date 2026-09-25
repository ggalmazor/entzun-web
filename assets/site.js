// The spacing sliders in the accessibility section reshape the text beside them, and the looping
// videos get a quiet pause button. The page reads fine without this file: the sliders stay hidden
// and the videos keep their native controls.
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
  var videos = document.querySelectorAll('video[data-loop]');
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  for (var i = 0; i < videos.length; i++) {
    (function (video) {
      var sources = video.querySelectorAll('source');
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'video-toggle';

      function label() { button.textContent = video.paused ? 'Play' : 'Pause'; }
      video.addEventListener('play', label);
      video.addEventListener('pause', label);
      if (sources.length) {
        sources[sources.length - 1].addEventListener('error', function () { button.hidden = true; });
      }

      button.addEventListener('click', function () {
        if (!video.paused) { video.pause(); return; }
        // Under reduced motion no source matched its media query, so nothing is loaded until
        // the reader asks for it here.
        if (!video.currentSrc) {
          for (var k = 0; k < sources.length; k++) sources[k].removeAttribute('media');
          video.load();
        }
        var playing = video.play();
        if (playing && playing.catch) playing.catch(function () {});
      });

      // For browsers that ignore media on <source>.
      if (reduce && reduce.matches) {
        video.removeAttribute('autoplay');
        video.pause();
      }

      video.removeAttribute('controls');
      label();
      video.parentNode.appendChild(button);
    })(videos[i]);
  }

  if (reduce && reduce.addEventListener) {
    reduce.addEventListener('change', function (event) {
      if (!event.matches) return;
      for (var i = 0; i < videos.length; i++) videos[i].pause();
    });
  }
})();
