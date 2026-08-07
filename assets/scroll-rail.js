(function () {
  function initScrollRail() {
    var rail = document.getElementById('ScrollRail');
    var main = document.getElementById('MainContent');
    if (!rail || !main) return;

    var wrappers = Array.prototype.slice.call(main.querySelectorAll(':scope > .shopify-section'));
    var sections = wrappers
      .map(function (wrapper) {
        return wrapper.querySelector(':scope > section[id]');
      })
      .filter(function (section) {
        return section && section.offsetHeight > 40;
      });

    if (sections.length < 2) return;

    sections.forEach(function (section) {
      var heading = section.querySelector('h1, h2');
      var label = heading ? heading.textContent.trim() : section.id;
      var a = document.createElement('a');
      a.href = '#' + section.id;
      a.setAttribute('aria-label', label);
      rail.appendChild(a);
    });

    rail.hidden = false;

    var links = Array.prototype.slice.call(rail.querySelectorAll('a'));

    function sync() {
      var mid = window.scrollY + window.innerHeight * 0.42;
      var current = 0;
      sections.forEach(function (section, i) {
        if (section.offsetTop <= mid) current = i;
      });
      links.forEach(function (a, i) {
        a.classList.toggle('on', i === current);
      });
    }

    var ticking = false;
    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          sync();
          ticking = false;
        });
      },
      { passive: true }
    );

    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollRail);
  } else {
    initScrollRail();
  }
})();
