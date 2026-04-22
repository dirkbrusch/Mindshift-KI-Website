/* ================================================================
   MINDSHIFT KI — PREMIUM LANDING PAGE V2
   Kompakt: Nav-Scroll, Reveal, Smooth-Scroll, Formular
   ================================================================ */

(function () {
  'use strict';

  // ---------- NAV: transparent -> solid beim Scrollen ----------
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- REVEAL-Animationen ----------
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  }

  // ---------- Smooth-Scroll mit Offset für fixierte Nav ----------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', targetId);
    });
  });

  // ---------- Kontaktformular ----------
  const form = document.getElementById('contact-form');
  const msg = document.getElementById('form-message');

  if (form && msg) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Pflichtfelder prüfen
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const originalLabel = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Wird gesendet…'; }
      msg.className = 'form-message';
      msg.textContent = '';

      try {
        const data = new FormData(form);
        const res = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        const json = await res.json().catch(() => ({}));

        if (res.ok && json.success) {
          msg.textContent = 'Danke. Ich melde mich innerhalb von 24 Stunden.';
          msg.className = 'form-message';
          form.reset();
        } else {
          msg.textContent = (json.error || 'Fehler beim Senden. Bitte per E-Mail: dirk.brusch@mindshift-ki.de');
          msg.className = 'form-message error';
        }
      } catch (err) {
        msg.textContent = 'Netzwerkfehler. Bitte per E-Mail: dirk.brusch@mindshift-ki.de';
        msg.className = 'form-message error';
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = originalLabel; }
      }
    });
  }
})();
