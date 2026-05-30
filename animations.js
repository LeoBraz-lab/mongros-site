/* ============================================================
   MONGROS FILM STUDIO — ANIMATIONS ENHANCED
   Scroll reveals dramatiques, glitch, cursor magnétique
   ============================================================ */

(function () {
  'use strict';

  /* ── INTERSECTION OBSERVER — Reveals ── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-clip, .stagger, .section-line');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ── SPLIT TEXT — Char by char reveal ── */
  function splitTextReveal(selector, delay = 0) {
    document.querySelectorAll(selector).forEach(el => {
      if (el.dataset.split) return; // already done
      el.dataset.split = '1';
      const text = el.innerText;
      el.innerHTML = '';
      [...text].forEach((char, i) => {
        const span = document.createElement('span');
        span.className = char === ' ' ? 'char space' : 'char';
        span.textContent = char === ' ' ? ' ' : char;
        span.style.transitionDelay = `${delay + i * 0.035}s`;
        el.appendChild(span);
      });

      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.char').forEach(c => c.classList.add('lit'));
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      obs.observe(el);
    });
  }
  splitTextReveal('.hero-kicker', 0.3);

  /* ── TITLE SWEEP — scan line avant affichage ── */
  function addSweepToTitles() {
    document.querySelectorAll('.services-head h2, .contact h2').forEach(el => {
      el.style.position = 'relative';
      el.style.overflow = 'hidden';
      const sweep = document.createElement('div');
      sweep.style.cssText = `
        position:absolute; inset:0; z-index:2; pointer-events:none;
        background: linear-gradient(90deg, transparent 0%, var(--orange) 50%, transparent 100%);
        transform: translateX(-110%);
        transition: transform 0s;
        opacity: .15;
      `;
      el.appendChild(sweep);

      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            sweep.style.transition = 'transform .7s cubic-bezier(.7,0,.2,1)';
            sweep.style.transform = 'translateX(110%)';
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      obs.observe(el);
    });
  }
  addSweepToTitles();

  /* ── PARALLAX HERO — léger déplacement au scroll ── */
  const heroVideo = document.querySelector('.hero-video');
  const heroInner = document.querySelector('.hero-inner');
  if (heroVideo && heroInner) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          heroVideo.style.transform = `translateY(${y * 0.25}px) scale(1.05)`;
          heroInner.style.transform = `translateY(${y * 0.12}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── CURSOR MAGNÉTIQUE amélioré ── */
  const dot = document.querySelector('.cursor-dot');
  if (dot && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let mx = -100, my = -100;
    let cx = -100, cy = -100;
    let isActive = false;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      if (!isActive) {
        dot.classList.add('active');
        document.body.classList.add('has-cursor');
        isActive = true;
      }
    });

    // Magnetic effect on CTA buttons
    document.querySelectorAll('.cta, .service').forEach(el => {
      el.addEventListener('mouseenter', () => {
        el.dataset.magnetic = '1';
      });
      el.addEventListener('mouseleave', () => {
        el.dataset.magnetic = '';
        el.style.transform = '';
      });
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${relX * 0.18}px, ${relY * 0.18}px)`;
      });
    });

    // Smooth cursor follow
    function animateCursor() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      dot.style.transform = `translate(${cx - dot.offsetWidth / 2}px, ${cy - dot.offsetHeight / 2}px)`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor states
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => dot.classList.add('hover-link'));
      el.addEventListener('mouseleave', () => dot.classList.remove('hover-link'));
    });
    document.querySelectorAll('.tile').forEach(el => {
      el.addEventListener('mouseenter', () => { dot.classList.remove('hover-link'); dot.classList.add('hover-play'); });
      el.addEventListener('mouseleave', () => dot.classList.remove('hover-play'));
    });
  }

  /* ── TRAIL DOTS améliorés ── */
  const trailDots = document.querySelectorAll('.trail-dot');
  if (trailDots.length) {
    const history = [];
    const maxHistory = trailDots.length;
    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    function animateTrail() {
      history.unshift({ x: mouseX, y: mouseY });
      if (history.length > maxHistory) history.pop();

      trailDots.forEach((dot, i) => {
        if (!history[i]) return;
        const pos = history[i];
        const size = Math.max(2, 10 - i * (8 / maxHistory));
        dot.style.width  = size + 'px';
        dot.style.height = size + 'px';
        dot.style.opacity = 1 - i / maxHistory;
        dot.style.transform = `translate(${pos.x - size/2}px, ${pos.y - size/2}px)`;
      });
      requestAnimationFrame(animateTrail);
    }
    animateTrail();
  }

  /* ── COUNTER ANIMATION — chiffres stats ── */
  function animateCounter(el, target, duration = 1800) {
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  document.querySelectorAll('.num-count').forEach(el => {
    const target = parseInt(el.textContent, 10);
    if (isNaN(target)) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(el, target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.7 });
    obs.observe(el);
  });

  /* ── GLITCH SPORADIQUE sur les tuiles vidéo ── */
  const tiles = document.querySelectorAll('.tile:not(.soon)');
  tiles.forEach(tile => {
    tile.addEventListener('mouseenter', () => {
      tile.classList.add('glitch-active');
      setTimeout(() => tile.classList.remove('glitch-active'), 400);
    });
  });

  /* ── NAV SCROLL STATE ── */
  const nav = document.querySelector('nav');
  if (nav) {
    const updateNav = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  /* ── SECTION LINE REVEALS — ajouter la class stagger aux grilles ── */
  document.querySelectorAll('.work-grid, .services-head, .clients .lead').forEach(el => {
    el.classList.add('stagger');
  });

  /* ── AJOUTER section-line avant chaque titre de section ── */
  document.querySelectorAll('.services-head, .contact-inner').forEach(container => {
    const line = document.createElement('span');
    line.className = 'section-line';
    container.prepend(line);

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          line.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    obs.observe(container);
  });

  /* ── VIDEO LAZY LOAD — play au hover ── */
  document.querySelectorAll('.tile video').forEach(video => {
    const tile = video.closest('.tile');
    tile.addEventListener('mouseenter', () => { try { video.play(); } catch(e){} });
    tile.addEventListener('mouseleave', () => { video.pause(); });
  });

  console.log('%cMongros Film Studio — Design système chargé', 'color:#E85002;font-family:monospace;font-size:12px;');

})();
