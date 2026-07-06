/* ================================================================
   MINDSHIFT KI — Consent-Manager (DSGVO / TDDDG)
   - Keine externen Ressourcen vor Einwilligung
   - Google Fonts nur mit Consent
   - Google Analytics 4 mit Consent Mode v2
   - Einwilligung widerrufbar, gleichrangige Ablehnung
   ================================================================ */

(function () {
  'use strict';

  // ---- KONFIGURATION ----
  // Google Analytics 4 Measurement-ID hier eintragen (Platzhalter).
  // Wird erst NACH Einwilligung geladen.
  var GA_MEASUREMENT_ID = 'G-YPDXBRBTGS';

  var STORAGE_KEY = 'mindshift_consent';
  var STORAGE_VERSION = 1;
  var CONSENT_TTL_DAYS = 365; // 12 Monate

  // ---- Google Consent Mode v2: Default = denied ----
  // Muss VOR jedem Google-Tag gesetzt werden.
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  // ---- Status lesen/schreiben ----
  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || obj.v !== STORAGE_VERSION) return null;
      // Ablauf prüfen
      var now = Date.now();
      if (obj.ts && (now - obj.ts) > CONSENT_TTL_DAYS * 24 * 60 * 60 * 1000) return null;
      return obj;
    } catch (e) { return null; }
  }

  function writeConsent(fonts, analytics) {
    var obj = {
      v: STORAGE_VERSION,
      ts: Date.now(),
      fonts: !!fonts,
      analytics: !!analytics
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch (e) {}
    return obj;
  }

  // ---- Schriftarten werden lokal gehostet (kein Google Fonts, kein Consent nötig) ----

  // ---- Google Analytics 4 dynamisch laden ----
  var gaLoaded = false;
  function loadGoogleAnalytics() {
    if (gaLoaded) return;
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.indexOf('XXXX') !== -1) {
      // Keine gültige ID konfiguriert — still überspringen
      return;
    }
    gaLoaded = true;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(s);

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  // ---- Consent auf Tools anwenden ----
  function applyConsent(state) {
    // Consent-Mode-Update
    gtag('consent', 'update', {
      analytics_storage: state.analytics ? 'granted' : 'denied'
    });

    if (state.analytics) loadGoogleAnalytics();
  }

  // ---- Banner ----
  var banner = document.getElementById('consent-banner');
  var fontsCheckbox = document.getElementById('consent-fonts');
  var anCheckbox = document.getElementById('consent-analytics');
  var btnAcceptAll = document.getElementById('consent-accept-all');
  var btnSave = document.getElementById('consent-save');
  var btnDecline = document.getElementById('consent-decline');
  var reopenLink = document.getElementById('consent-reopen');

  function showBanner(prefill) {
    if (!banner) return;
    if (prefill) {
      if (fontsCheckbox) fontsCheckbox.checked = !!prefill.fonts;
      if (anCheckbox) anCheckbox.checked = !!prefill.analytics;
    }
    banner.hidden = false;
    // nach kleinem Tick Klasse setzen für Transition
    setTimeout(function () { banner.classList.add('open'); }, 20);
  }
  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('open');
    setTimeout(function () { banner.hidden = true; }, 250);
  }

  // Erstaufruf: Banner zeigen, wenn kein gültiger Consent vorliegt
  var existing = readConsent();
  if (!existing) {
    showBanner(null);
  } else {
    applyConsent(existing);
  }

  if (btnAcceptAll) btnAcceptAll.addEventListener('click', function () {
    var s = writeConsent(true, true);
    applyConsent(s);
    hideBanner();
  });

  if (btnDecline) btnDecline.addEventListener('click', function () {
    var s = writeConsent(false, false);
    applyConsent(s);
    hideBanner();
  });

  if (btnSave) btnSave.addEventListener('click', function () {
    var s = writeConsent(
      !!(fontsCheckbox && fontsCheckbox.checked),
      !!(anCheckbox && anCheckbox.checked)
    );
    applyConsent(s);
    hideBanner();
  });

  if (reopenLink) reopenLink.addEventListener('click', function (e) {
    e.preventDefault();
    showBanner(readConsent());
  });
})();
