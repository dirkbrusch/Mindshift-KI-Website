/* Dirk Brusch — Keynote Speaker · Interaktion */
(function () {
  'use strict';

  /* ---- Nav: Hintergrund bei Scroll ---- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile-Menü ---- */
  var burger = document.getElementById('burger');
  var links = document.querySelector('.nav__links');
  function closeMenu() {
    links.classList.remove('open');
    burger.classList.remove('x');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Menü öffnen');
  }
  burger.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    burger.classList.toggle('x', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add('in'); });
  }

  /* ---- Counter ---- */
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1800, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.innerHTML = Math.round(easeOutQuart(p) * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(function (c) { c.innerHTML = c.getAttribute('data-count') + (c.getAttribute('data-suffix') || ''); });
  }

  /* ---- Keynote-Buttons: gewählte Keynote ins Formular übernehmen ---- */
  var keynoteField = document.getElementById('keynoteField');
  document.querySelectorAll('[data-keynote]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (keynoteField) keynoteField.value = btn.getAttribute('data-keynote');
      var msg = document.getElementById('nachricht');
      if (msg && !msg.value) {
        msg.value = 'Interesse an: ' + btn.getAttribute('data-keynote') + '\n\n';
      }
    });
  });

  /* ---- Klebriger Mobile-CTA ---- */
  var sticky = document.getElementById('stickyCta');
  var anfrageSection = document.getElementById('anfrage');
  var anfrageVisible = false;
  if (sticky && anfrageSection && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (entries) {
      anfrageVisible = entries[0].isIntersecting;
      updateSticky();
    }, { threshold: 0.15 });
    sio.observe(anfrageSection);
    function updateSticky() {
      var past = window.scrollY > window.innerHeight * 0.7;
      sticky.classList.toggle('show', past && !anfrageVisible);
    }
    window.addEventListener('scroll', updateSticky, { passive: true });
    updateSticky();
  }

  /* ---- Spam-Schutz: Ladezeitpunkt setzen (Zeit-Falle) ---- */
  var tsField = document.getElementById('tsField');
  if (tsField) tsField.value = String(Date.now());

  /* ---- Formular-Versand ---- */
  var form = document.getElementById('anfrageForm');
  var status = document.getElementById('formStatus');
  var submitBtn = document.getElementById('submitBtn');
  var ENDPOINT = 'https://api.mindshift-ki.de/contact.php';

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form__status';
      status.textContent = '';

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      submitBtn.disabled = true;
      var original = submitBtn.textContent;
      submitBtn.textContent = 'Wird gesendet …';

      var data = new FormData(form);
      fetch(ENDPOINT, { method: 'POST', body: data })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && res.j.success !== false) {
            form.reset();
            status.className = 'form__status ok';
            status.textContent = 'Vielen Dank — Ihre Anfrage ist da. Ich melde mich persönlich bei Ihnen.';
          } else {
            throw new Error('fail');
          }
        })
        .catch(function () {
          status.className = 'form__status err';
          status.innerHTML = 'Das hat leider nicht geklappt. Schreiben Sie mir direkt an <a href="mailto:dirk.brusch@mindshift-ki.de">dirk.brusch@mindshift-ki.de</a>.';
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = original;
        });
    });
  }

  /* ---- Jahr im Footer aktuell halten (falls gewünscht) ---- */
})();
