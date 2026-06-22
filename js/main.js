/* ============================================================
   KoKo — Kochattante Kolayi | Main JS
   Pure vanilla, no frameworks
   ============================================================ */

(function () {
  'use strict';

  /* ── Scroll-reveal (IntersectionObserver) ── */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show all immediately
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ── Sticky nav state ── */
  const nav = document.getElementById('site-nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Scroll background colour transitions ── */
  const pageBg  = document.getElementById('page-bg');
  const bgSects = Array.from(document.querySelectorAll('[data-bg]'));

  if (pageBg && bgSects.length) {
    function updatePageBg() {
      const midY = window.scrollY + window.innerHeight * 0.5;
      let active = bgSects[0];
      for (const s of bgSects) {
        if (s.offsetTop <= midY) active = s;
      }
      pageBg.style.backgroundColor = active.dataset.bg;
    }
    window.addEventListener('scroll', updatePageBg, { passive: true });
    updatePageBg();
  }

  /* ── Mobile hamburger toggle ── */
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
    // Close menu on link click
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Smooth scroll for nav links ── */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Interactive spots map ──
     Two-way sync between map markers and spot cards.
     Progressive enhancement: with JS off, the map image and every
     spot card (names, couplets, story links) remain fully readable. */
  const spotsSection = document.getElementById('spots');
  if (spotsSection) {
    const markers = Array.from(spotsSection.querySelectorAll('.map-marker'));
    const cards   = Array.from(spotsSection.querySelectorAll('.spot-card'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cardFor   = (key) => spotsSection.querySelector('.spot-card[data-spot="' + key + '"]');
    const markerFor = (key) => spotsSection.querySelector('.map-marker[data-spot="' + key + '"]');

    let activeKey = null;

    function clearActive() {
      if (!activeKey) return;
      const card = cardFor(activeKey);
      const marker = markerFor(activeKey);
      if (card) card.classList.remove('active');
      if (marker) marker.setAttribute('aria-pressed', 'false');
      activeKey = null;
    }

    function setActive(key, scroll) {
      if (activeKey === key) { clearActive(); return; } // re-tap toggles off
      clearActive();
      const card = cardFor(key);
      const marker = markerFor(key);
      if (!card) return;
      activeKey = key;
      card.classList.add('active');
      if (marker) marker.setAttribute('aria-pressed', 'true');
      if (scroll) {
        card.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'center' });
      }
    }

    markers.forEach((m) => {
      m.addEventListener('click', () => setActive(m.dataset.spot, true));
    });

    cards.forEach((c) => {
      c.addEventListener('click', (e) => {
        if (e.target.closest('a')) return; // let "Read the story" links work
        setActive(c.dataset.spot, false);
      });
    });
  }

})();
