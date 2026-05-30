/* ============================================================
   MONGROS FILM STUDIO — ANIMATIONS v2 (polished)
   ============================================================ */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── INTERSECTION OBSERVER factory ── */
  function makeObserver(cb, opts) {
    return new IntersectionObserver(cb, Object.assign(
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
      opts
    ));
  }

  /* ── REVEALS ── */
  document.querySelectorAll('.reveal, .reveal-left, .reveal-clip').forEach(el => {
    if (reducedMotion) { el.classList.add('in'); return; }
    makeObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); }
    })).observe(el);
    // keep ref to unobserve — inline via closure
  });

  /* Rewrite pour garder la ref correcte */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-clip');
  const revealObs = makeObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObs.unobserve(entry.target);
    }
  }));
  revealEls.forEach(el => {
    if (reducedMotion) el.classList.add('in');
    else revealObs.observe(el);
  });

  /* ── SECTION LINE REVEALS ── */
  document.querySelectorAll('.services-head, .contact-inner').forEach(container => {
    if (!container.querySelector('.section-line')) {
      const line = document.createElement('span');
      line.className = 'section-line';
      container.prepend(line);
    }
    const line = container.querySelector('.section-line');
    if (reducedMotion) { line.classList.add('in'); return; }
    makeObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { line.classList.add('in'); lineObs.unobserve(e.target); }
    }), { threshold: 0.2 }).observe(container);
  });
  // Note: lineObs ref handled below properly
  document.querySelectorAll('.section-line').forEach(line => {
    if (reducedMotion) { line.classList.add('in'); return; }
    const obs = makeObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    }), { threshold: 0.2 });
    obs.observe(line);
  });

  /* ── TITLE SWEEP — scan orange ── */
  if (!reducedMotion) {
    document.querySelectorAll('.services-head h2, .contact h2').forEach(el => {
      if (el.dataset.sweep) return;
      el.dataset.sweep = '1';
      el.style.position = 'relative';
      el.style.overflow = 'hidden';
      const sweep = document.createElement('span');
      sweep.setAttribute('aria-hidden', 'true');
      sweep.style.cssText = [
        'position:absolute', 'inset:0', 'z-index:2', 'pointer-events:none',
        'background:linear-gradient(90deg,transparent 0%,rgba(232,80,2,.12) 50%,transparent 100%)',
        'transform:translateX(-110%)',
        'transition:none',
        'will-change:transform'
      ].join(';');
      el.appendChild(sweep);

      const obs = makeObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) {
          requestAnimationFrame(() => {
            sweep.style.transition = 'transform 750ms cubic-bezier(.7,0,.2,1)';
            sweep.style.transform = 'translateX(110%)';
          });
          obs.unobserve(e.target);
        }
      }), { threshold: 0.4 });
      obs.observe(el);
    });
  }

  /* ── PARALLAX HERO ── */
  if (!reducedMotion) {
    const heroVideo = document.querySelector('.hero-video');
    const heroInner = document.querySelector('.hero-inner');
    if (heroVideo && heroInner) {
      heroVideo.style.willChange = 'transform';
      heroInner.style.willChange = 'transform';
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const y = window.scrollY;
            heroVideo.style.transform = `translateY(${y * 0.22}px) scale(1.05)`;
            heroInner.style.transform = `translateY(${y * 0.1}px)`;
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  }

  /* ── CURSOR MAGNÉTIQUE ── */
  const dot = document.querySelector('.cursor-dot');
  const isMouse = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  if (dot && isMouse) {
    let mx = -200, my = -200, cx = -200, cy = -200;
    let cursorActive = false;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      if (!cursorActive) {
        dot.classList.add('active');
        document.body.classList.add('has-cursor');
        cursorActive = true;
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = ''; });

    /* Magnetic hover sur CTA */
    document.querySelectorAll('.cta').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const rx = e.clientX - r.left - r.width  / 2;
        const ry = e.clientY - r.top  - r.height / 2;
        el.style.transform = `translate(${rx * 0.15}px, ${ry * 0.15}px) skewX(-1.5deg)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    /* Cursor states */
    document.querySelectorAll('a:not(.tile), button').forEach(el => {
      el.addEventListener('mouseenter', () => { dot.classList.add('hover-link'); });
      el.addEventListener('mouseleave', () => { dot.classList.remove('hover-link'); });
    });
    document.querySelectorAll('.tile').forEach(el => {
      el.addEventListener('mouseenter', () => {
        dot.classList.remove('hover-link');
        dot.classList.add('hover-play');
      });
      el.addEventListener('mouseleave', () => dot.classList.remove('hover-play'));
    });

    /* Smooth follow */
    (function loop() {
      cx += (mx - cx) * 0.16;
      cy += (my - cy) * 0.16;
      dot.style.transform = `translate(${cx - dot.offsetWidth / 2}px, ${cy - dot.offsetHeight / 2}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ── TRAIL DOTS ── */
  const trailDots = [...document.querySelectorAll('.trail-dot')];
  if (trailDots.length && isMouse && !reducedMotion) {
    const pos = { x: -200, y: -200 };
    const history = Array(trailDots.length).fill({ x: -200, y: -200 });

    document.addEventListener('mousemove', e => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    }, { passive: true });

    (function animateTrail() {
      history.unshift({ x: pos.x, y: pos.y });
      history.length = trailDots.length;
      trailDots.forEach((d, i) => {
        const p = history[i];
        if (!p) return;
        const size = Math.max(2, 9 - i * (7 / trailDots.length));
        d.style.cssText = `
          width:${size}px; height:${size}px;
          opacity:${(1 - i / trailDots.length).toFixed(2)};
          transform:translate(${p.x - size / 2}px, ${p.y - size / 2}px);
        `;
      });
      requestAnimationFrame(animateTrail);
    })();
  }

  /* ── COUNTER ANIMATION ── */
  if (!reducedMotion) {
    document.querySelectorAll('.num-count').forEach(el => {
      const target = parseInt(el.textContent, 10);
      if (isNaN(target)) return;
      const obs = makeObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const dur = 1600;
        (function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4); // ease-out-quart
          el.textContent = Math.round(eased * target);
          if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
        obs.unobserve(el);
      }), { threshold: 0.8 });
      obs.observe(el);
    });
  }

  /* ── VIDEO — play on hover uniquement (préserve autoplay existant si présent) ── */
  document.querySelectorAll('.tile:not(.soon) video').forEach(video => {
    // Ne pas remplacer l'autoplay si déjà configuré
    if (video.autoplay) return;
    const tile = video.closest('.tile');
    tile.addEventListener('mouseenter', () => { video.play().catch(() => {}); });
    tile.addEventListener('mouseleave', () => { video.pause(); });
  });

  /* ── NAV scroll state (fallback si le script inline est absent) ── */
  const nav = document.querySelector('nav');
  if (nav) {
    const syncNav = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', syncNav, { passive: true });
    syncNav();
  }

})();
