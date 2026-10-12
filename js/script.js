/* ================================================================
   BIOMASSIA SDN. BHD. — Shared JS
   ================================================================ */

document.addEventListener('DOMContentLoaded', function () {

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Mobile Nav Toggle ---------- */
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    /* ---------- Hero Slider ---------- */
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dots .dot');
    const bgs = document.querySelectorAll('.hero-bg');
    const hero = document.querySelector('.hero');

    // Entrance is set in <head> to avoid a flash; drop it once it has played so
    // slide changes don't replay it.
    if (document.documentElement.classList.contains('hero-anim')) {
        setTimeout(() => document.documentElement.classList.remove('hero-anim'), 2400);
    }

    if (reduceMotion) {
        document.querySelectorAll('.hero-video').forEach(v => {
            v.removeAttribute('autoplay');
            v.pause();
        });
    }

    if (slides.length > 0 && dots.length === slides.length) {
        let currentSlide = 0;
        let autoTimer = null;
        const AUTO_INTERVAL = 6000;

        function goToSlide(index) {
            currentSlide = (index + slides.length) % slides.length;
            slides.forEach((s, i) => {
                s.classList.toggle('active', i === currentSlide);
            });
            dots.forEach((d, i) => {
                d.classList.toggle('active', i === currentSlide);
                d.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
            });
            bgs.forEach((b, i) => {
                b.classList.toggle('active', i === currentSlide);
                const video = b.querySelector('video');
                if (!video) return;
                if (i === currentSlide && !reduceMotion) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }

        function startAuto() {
            stopAuto();
            autoTimer = setInterval(() => goToSlide(currentSlide + 1), AUTO_INTERVAL);
        }
        function stopAuto() {
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
            }
        }

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                goToSlide(i);
                startAuto();
            });
        });

        if (hero) {
            hero.addEventListener('mouseenter', stopAuto);
            hero.addEventListener('mouseleave', startAuto);
        }

        startAuto();
    }

    /* ---------- Industry Carousel ---------- */
    const track = document.getElementById('industryTrack');
    const indPrev = document.getElementById('indPrev');
    const indNext = document.getElementById('indNext');

    if (track && indPrev && indNext) {
        const step = () => {
            const card = track.querySelector('.icard');
            if (!card) return track.clientWidth;
            const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            return card.getBoundingClientRect().width + gap;
        };

        const maxIndex = () => Math.max(0, Math.ceil((track.scrollWidth - track.clientWidth) / step()));

        const syncButtons = () => {
            const max = track.scrollWidth - track.clientWidth;
            indPrev.disabled = track.scrollLeft <= 1;
            indNext.disabled = track.scrollLeft >= max - 1;
        };

        let index = 0;
        let programmatic = false;
        let settle;

        const go = (i) => {
            index = Math.max(0, Math.min(i, maxIndex()));
            programmatic = true;
            clearTimeout(settle);
            settle = setTimeout(() => { programmatic = false; }, 600);
            track.scrollTo({ left: index * step() });
        };

        indPrev.addEventListener('click', () => go(index - 1));
        indNext.addEventListener('click', () => go(index + 1));

        // Only trust scrollLeft for the index when the user drove the scroll;
        // mid-animation values would otherwise undo rapid arrow clicks.
        track.addEventListener('scroll', () => {
            if (!programmatic) index = Math.round(track.scrollLeft / step());
            syncButtons();
        }, { passive: true });

        window.addEventListener('resize', syncButtons);
        syncButtons();
    }

    /* ---------- Scroll Reveal ---------- */
    const revealEls = document.querySelectorAll('.reveal, .reveal-stagger, .reveal-mask, .reveal-letters');

    if (revealEls.length) {
        // Stripping the classes once the animation ends hands each element
        // back its own CSS, so hover transitions aren't left overridden.
        const clear = (el) => el.classList.remove(
            'reveal', 'reveal-stagger', 'reveal-mask', 'reveal-letters',
            'reveal-left', 'reveal-right', 'is-visible'
        );

        if (reduceMotion || !('IntersectionObserver' in window)) {
            revealEls.forEach(clear);
        } else {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                    setTimeout(() => clear(entry.target), 1400);
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

            revealEls.forEach(el => observer.observe(el));
        }
    }

    /* ---------- Shadow on sticky header after scroll ---------- */
    const header = document.getElementById('siteHeader');
    if (header) {
        const onScroll = () => {
            header.classList.toggle('scrolled', window.scrollY > 10);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }
});
