/* =====================================================================
   Anel Construtora — Animation Engine v2
   Fixes: GSAP initial states applied before animations, Swiper config
   ===================================================================== */

(() => {
  'use strict';

  // ─── Register GSAP plugins ─────────────────────────────────────
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // ─── Custom Cursor ─────────────────────────────────────────────
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  if (cursorDot && cursorRing) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    const RING_LERP = 0.12;

    window.addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    const animRing = () => {
      ringX += (mouseX - ringX) * RING_LERP;
      ringY += (mouseY - ringY) * RING_LERP;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animRing);
    };
    animRing();
  }

  // ─── Preloader ─────────────────────────────────────────────────
  const preloader = document.getElementById('preloader');
  const progress = document.getElementById('preloaderProgress');

  // Animate progress bar then slide out
  gsap.to(progress, {
    width: '100%',
    duration: 1.6,
    ease: 'power2.inOut',
    onComplete: () => {
      gsap.to(preloader, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power4.inOut',
        onComplete: () => {
          preloader.style.display = 'none';
          // Only init hero after preloader is gone
          initHero();
          initScrollAnimations();
        }
      });
    }
  });

  // ─── Hero Animations ───────────────────────────────────────────
  function initHero() {
    const heroBg = document.getElementById('heroBg');
    const tag = document.querySelector('.hero-tag');
    const inners = document.querySelectorAll('.hero-title .inner');
    const subtitle = document.querySelector('.hero-subtitle');
    const cta = document.querySelector('.hero-cta');
    const scroll = document.querySelector('.scroll-indicator');

    // BG scale-in
    gsap.fromTo(heroBg,
      { scale: 1.1 },
      { scale: 1, duration: 2.2, ease: 'power2.out' }
    );

    // Hero parallax on scroll (scrub)
    gsap.to(heroBg, {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5
      },
      yPercent: 20,
      ease: 'none'
    });

    // Tag fade in
    gsap.fromTo(tag,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.1 }
    );

    // Text lines stagger (each .inner slides up)
    gsap.fromTo(inners,
      { yPercent: 105, opacity: 0 },
      {
        yPercent: 0, opacity: 1,
        duration: 1.1, stagger: 0.18,
        ease: 'power3.out', delay: 0.3
      }
    );

    // Subtitle + CTA + Scroll indicator
    gsap.fromTo([subtitle, cta, scroll],
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0,
        duration: 0.9, stagger: 0.15,
        ease: 'power2.out', delay: 0.9
      }
    );
  }

  // ─── Header scroll state ──────────────────────────────────────
  const header = document.getElementById('header');
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');

  const checkScroll = () => {
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll(); // Check on load

  // Mobile menu
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('open');
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('open');
        nav.classList.remove('open');
      });
    });
  }

  // ─── Smooth anchor scroll ─────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: target, offsetY: 80 },
        ease: 'power3.inOut'
      });
    });
  });

  // ─── Scroll Animations ─────────────────────────────────────────
  function initScrollAnimations() {

    // ── Helper: simple reveal-up ──
    function revealUp(targets, options = {}) {
      gsap.fromTo(targets,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0,
          duration: options.duration || 0.9,
          stagger: options.stagger || 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: options.trigger || targets,
            start: options.start || 'top 82%',
            once: true
          }
        }
      );
    }

    // ── Stats bar counter ──
    document.querySelectorAll('.stat-number[data-count]').forEach(el => {
      const end = parseInt(el.dataset.count, 10);
      ScrollTrigger.create({
        trigger: '.stats-bar',
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.fromTo({ v: 0 }, { v: end }, {
            duration: 1.8, ease: 'power2.out',
            onUpdate: function () { el.textContent = Math.round(this.targets()[0].v); },
            onComplete: () => { el.textContent = end; }
          });
        }
      });
    });

    // Stats items appear
    revealUp('.stat-item', { trigger: '.stats-bar', stagger: 0.1 });

    // ── About Section ──
    gsap.fromTo('.about-visual',
      { opacity: 0, x: -60 },
      {
        opacity: 1, x: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.about', start: 'top 78%', once: true }
      }
    );
    gsap.fromTo('.about-text > *',
      { opacity: 0, x: 40 },
      {
        opacity: 1, x: 0, duration: 0.9, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: '.about', start: 'top 75%', once: true }
      }
    );
    // Parallax on about image
    gsap.to('.about-img', {
      scrollTrigger: {
        trigger: '.about-img-frame',
        start: 'top bottom', end: 'bottom top', scrub: 1.5
      },
      yPercent: 15, ease: 'none'
    });
    // About floater bounce in
    gsap.fromTo('.about-floater',
      { opacity: 0, scale: 0.7 },
      {
        opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.8)',
        scrollTrigger: { trigger: '.about-visual', start: 'top 70%', once: true },
        delay: 0.4
      }
    );

    // ── Pillar hover line (CSS handles hover, just animate them in) ──
    revealUp('.pillar', { trigger: '.about-pillars', stagger: 0.12 });

    // ── Region Section ──
    gsap.fromTo('.region-text > *',
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: '.region', start: 'top 78%', once: true }
      }
    );
    gsap.fromTo('.feature-card',
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.7, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.region-features-grid', start: 'top 82%', once: true }
      }
    );

    // ── Developments Section ──
    gsap.fromTo('.section-header > *',
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: '.section-header', start: 'top 82%', once: true }
      }
    );

    // ── Contact Section ──
    gsap.fromTo('.contact-info > *',
      { opacity: 0, x: -40 },
      {
        opacity: 1, x: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: '.contact', start: 'top 78%', once: true }
      }
    );
    gsap.fromTo('.contact-item',
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: '.contact-list', start: 'top 85%', once: true }
      }
    );
    gsap.fromTo('.contact-card',
      { opacity: 0, x: 60 },
      {
        opacity: 1, x: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.contact', start: 'top 72%', once: true }
      }
    );

    // ── Footer ──
    revealUp('.footer-brand, .footer-links, .footer-contact-col', {
      trigger: '.footer-top', stagger: 0.15
    });
  }

  // ─── Swiper – Developments Carousel ───────────────────────────
  // Wait until DOM is ready (called at page level after all scripts)
  window.addEventListener('load', initSwiper);

  function initSwiper() {
    new Swiper('#devSwiper', {
      slidesPerView: 'auto',
      centeredSlides: true,
      loop: false, // Loop true breaks 3D Coverflow when you only have 4 items
      speed: 800,
      grabCursor: true,
      effect: 'coverflow',
      coverflowEffect: {
        rotate: 0,
        stretch: 80,
        depth: 250,
        modifier: 1,
        slideShadows: true,
      },
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: '#devPagination',
        clickable: true,
      },
      navigation: {
        nextEl: '#devNext',
        prevEl: '#devPrev',
      },
      breakpoints: {
        0: { coverflowEffect: { stretch: 30 } },
        640: { coverflowEffect: { stretch: 60 } },
        1024: { coverflowEffect: { stretch: 80 } },
      }
    });
  }

  // ─── Nav active link on scroll ─────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  ScrollTrigger.create({
    onUpdate: () => {
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 200) {
          current = sec.id;
        }
      });
      navLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
      });
    }
  });

})();
