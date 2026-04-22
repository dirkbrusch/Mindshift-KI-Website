/* ================================================================
   MINDSHIFT KI — PREMIUM LANDING PAGE
   JavaScript: Reveal animations, counters, navigation
   ================================================================ */

(function () {
  'use strict';

  // -- NAVBAR --
  var navbar = document.getElementById('navbar');
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        var offset = navbar.offsetHeight + 24;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'smooth'
        });
      }
    });
  });

  // Active link highlight
  var sections = document.querySelectorAll('section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function highlightNav() {
    var y = window.scrollY + 140;
    sections.forEach(function (sec) {
      var top = sec.offsetTop;
      var id = sec.getAttribute('id');
      if (y >= top && y < top + sec.offsetHeight) {
        navAnchors.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }
  window.addEventListener('scroll', highlightNav, { passive: true });

  // -- REVEAL ON SCROLL --
  var reveals = document.querySelectorAll('.reveal');

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var delay = parseInt(entry.target.getAttribute('data-delay') || '0', 10);
        setTimeout(function () {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

  reveals.forEach(function (el) { revealObserver.observe(el); });

  // -- ANIMATED COUNTERS --
  var counters = document.querySelectorAll('.stat-num[data-count]');

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(function (el) { counterObserver.observe(el); });

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 2200;
    var start = performance.now();

    function tick(now) {
      var t = Math.min((now - start) / duration, 1);
      // easeOutQuart
      var v = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.floor(v * target);
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(tick);
  }

  // -- PARALLAX HERO PORTRAIT (subtle) --
  var portrait = document.querySelector('.hero-portrait-frame');
  if (portrait && window.matchMedia('(min-width: 769px)').matches) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < window.innerHeight) {
        portrait.style.transform = 'translateY(' + (y * 0.06) + 'px)';
      }
    }, { passive: true });
  }

  // -- COOKIE CONSENT --
  var COOKIE_KEY = 'mindshift_cookie_consent';
  var banner = document.getElementById('cookie-banner');
  var acceptAll = document.getElementById('cookie-accept-all');
  var acceptNecessary = document.getElementById('cookie-accept-necessary');
  var settingsLink = document.getElementById('cookie-settings-link');

  function getCookieConsent() {
    try { return localStorage.getItem(COOKIE_KEY); } catch (e) { return null; }
  }

  function setCookieConsent(value) {
    try { localStorage.setItem(COOKIE_KEY, value); } catch (e) { /* silent */ }
  }

  function showBanner() {
    if (banner) {
      banner.setAttribute('aria-hidden', 'false');
      banner.classList.add('visible');
    }
  }

  function hideBanner() {
    if (banner) {
      banner.setAttribute('aria-hidden', 'true');
      banner.classList.remove('visible');
    }
  }

  if (!getCookieConsent()) {
    setTimeout(showBanner, 800);
  }

  if (acceptAll) {
    acceptAll.addEventListener('click', function () {
      setCookieConsent('all');
      hideBanner();
    });
  }

  if (acceptNecessary) {
    acceptNecessary.addEventListener('click', function () {
      setCookieConsent('necessary');
      hideBanner();
    });
  }

  if (settingsLink) {
    settingsLink.addEventListener('click', function (e) {
      e.preventDefault();
      try { localStorage.removeItem(COOKIE_KEY); } catch (err) { /* silent */ }
      showBanner();
    });
  }

  // -- CONTACT FORM (AJAX Submit an eigenes PHP-Script) --
  var contactForm = document.getElementById('contact-form');
  var formSuccess = document.getElementById('form-success');
  var submitBtn = contactForm ? contactForm.querySelector('.btn-form-submit') : null;

  if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Button deaktivieren
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Wird gesendet\u2026';

      var formData = new FormData(contactForm);

      fetch(contactForm.action, {
        method: 'POST',
        body: formData
      })
      .then(function (res) {
        if (res.ok) {
          contactForm.style.display = 'none';
          formSuccess.style.display = 'block';
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          throw new Error('Server-Fehler');
        }
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Ja, ich will mein Strategiegespräch';
        alert('Die Nachricht konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie direkt an dirk.brusch@mindshift-ki.de');
      });
    });
  }

})();
