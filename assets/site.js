// The spacing sliders in the accessibility section reshape the text beside them.
// Nothing else on the site runs script; the page reads fine without this file.
(function () {
  var demo = document.querySelector('[data-spacing-demo]');
  if (!demo) return;
  var map = {
    characters: function (v) { demo.style.letterSpacing = v + 'px'; },
    words: function (v) { demo.style.wordSpacing = v + 'px'; },
    lines: function (v) { demo.style.lineHeight = v; },
    paragraphs: function (v) { demo.style.gap = v + 'px'; }
  };
  var inputs = document.querySelectorAll('[data-spacing]');
  for (var i = 0; i < inputs.length; i++) {
    (function (input) {
      var apply = map[input.getAttribute('data-spacing')];
      if (!apply) return;
      input.addEventListener('input', function () { apply(input.value); });
      apply(input.value);
    })(inputs[i]);
  }
})();
