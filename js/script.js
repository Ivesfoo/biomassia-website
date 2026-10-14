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
        let advanceTimer = null;
        let paused = false;
        // Only a backstop: used when there is no clip to wait on, or when
        // 'ended' cannot fire because autoplay was blocked or decoding failed.
        const FALLBACK_MS = 9000;

        const activeVideo = () => bgs[currentSlide] && bgs[currentSlide].querySelector('video');

        function clearAdvance() {
            clearTimeout(advanceTimer);
            advanceTimer = null;
        }

        // Normally the clip's own 'ended' event moves the hero on; this timer
        // just guarantees the slider never stalls if that event never arrives.
        function armAdvance() {
            clearAdvance();
            if (paused) return;
            const v = activeVideo();
            let ms = FALLBACK_MS;
            if (v && !reduceMotion && isFinite(v.duration) && v.duration > 0) {
                ms = Math.max(0, (v.duration - v.currentTime) * 1000) + 1500;
            }
            advanceTimer = setTimeout(() => goToSlide(currentSlide + 1), ms);
        }

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
                    // restart, so each slide always shows the clip from the top
                    try { video.currentTime = 0; } catch (e) {}
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
            armAdvance();
        }

        bgs.forEach((b, i) => {
            const v = b.querySelector('video');
            if (!v) return;
            // looping would mean 'ended' never fires
            v.loop = false;
            v.addEventListener('ended', () => {
                if (i === currentSlide && !paused) goToSlide(currentSlide + 1);
            });
            // duration is often unknown on the first pass, so re-arm the
            // backstop with the real length once metadata arrives
            v.addEventListener('loadedmetadata', () => {
                if (i === currentSlide) armAdvance();
            });
        });

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => goToSlide(i));
        });

        if (hero) {
            hero.addEventListener('mouseenter', () => {
                paused = true;
                clearAdvance();
                const v = activeVideo();
                if (v) v.pause();
            });
            hero.addEventListener('mouseleave', () => {
                paused = false;
                const v = activeVideo();
                if (v && !reduceMotion) v.play().catch(() => {});
                armAdvance();
            });
        }

        goToSlide(0);
    }

    /* ---------- Horizontal Carousels ---------- */
    function initCarousel(track, prevBtn, nextBtn, itemSelector) {
        if (!track || !prevBtn || !nextBtn) return;

        const step = () => {
            const card = track.querySelector(itemSelector);
            if (!card) return track.clientWidth;
            const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            return card.getBoundingClientRect().width + gap;
        };

        const maxIndex = () => Math.max(0, Math.ceil((track.scrollWidth - track.clientWidth) / step()));

        const syncButtons = () => {
            const max = track.scrollWidth - track.clientWidth;
            prevBtn.disabled = track.scrollLeft <= 1;
            nextBtn.disabled = track.scrollLeft >= max - 1;
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

        prevBtn.addEventListener('click', () => go(index - 1));
        nextBtn.addEventListener('click', () => go(index + 1));

        // Only trust scrollLeft for the index when the user drove the scroll;
        // mid-animation values would otherwise undo rapid arrow clicks.
        track.addEventListener('scroll', () => {
            if (!programmatic) index = Math.round(track.scrollLeft / step());
            syncButtons();
        }, { passive: true });

        window.addEventListener('resize', syncButtons);
        syncButtons();
    }

    initCarousel(
        document.getElementById('productTrack'),
        document.getElementById('prodPrev'),
        document.getElementById('prodNext'),
        '.pitem'
    );
    initCarousel(
        document.getElementById('reviewTrack'),
        document.getElementById('revPrev'),
        document.getElementById('revNext'),
        '.rcard'
    );

    /* ---------- Contact form ---------- */
    const contactForm = document.getElementById('contactForm');
    const contactStatus = document.getElementById('contactStatus');

    if (contactForm && contactStatus) {
        // Nothing is wired up to receive this yet. Holding the submit keeps the
        // browser from navigating away and dropping whatever was typed.
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!contactForm.reportValidity()) return;
            contactStatus.textContent =
                'This form is not connected yet — please email info@biomassia.com in the meantime.';
        });
    }

    /* ---------- Gallery card photo cycle ---------- */
    const eventCards = document.querySelectorAll('.gevent');

    if (eventCards.length && !reduceMotion) {
        const PHOTO_INTERVAL = 1400;

        eventCards.forEach((card) => {
            const photos = card.querySelectorAll('.gevent-photo');
            if (photos.length < 2) return;

            let index = 0;
            let timer = null;

            const show = (next) => {
                photos[index].classList.remove('is-on');
                index = (next + photos.length) % photos.length;
                photos[index].classList.add('is-on');
            };

            card.addEventListener('mouseenter', () => {
                if (timer) return;
                timer = setInterval(() => show(index + 1), PHOTO_INTERVAL);
            });

            // Back to the first photo so every card rests on the same image
            card.addEventListener('mouseleave', () => {
                clearInterval(timer);
                timer = null;
                show(0);
            });
        });
    }

    /* ---------- Stat count-up ---------- */
    const counters = document.querySelectorAll('[data-count]');

    if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
        const DURATION = 1400;
        const easeOut = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

        const run = (el) => {
            const digits = el.querySelector('.mstat-digits');
            const target = parseInt(el.dataset.count, 10);
            if (!digits || isNaN(target)) return;

            // Lock the box at its final width while it still shows the final
            // value, so counting up through fewer digits can't shift the label.
            digits.style.minWidth = digits.getBoundingClientRect().width + 'px';

            const start = performance.now();
            const tick = (now) => {
                const t = Math.min(1, (now - start) / DURATION);
                digits.textContent = Math.round(easeOut(t) * target);
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };

        const countObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                obs.unobserve(entry.target);
                run(entry.target);
            });
        }, { threshold: 0.4 });

        counters.forEach((el) => countObserver.observe(el));
    }

    /* ---------- Parallax band ---------- */
    const band = document.querySelector('.fullbleed-media');
    const bandInner = band && band.querySelector('.fullbleed-inner');

    if (bandInner && !reduceMotion) {
        const RANGE = 0.3; // matches the inner's 130% height
        let ticking = false;

        const update = () => {
            ticking = false;
            const rect = band.getBoundingClientRect();
            // 0 as the band enters from the bottom, 1 as it leaves past the top.
            // Clamped rather than skipped off-screen, so the band is already in
            // the right position when it scrolls into view instead of jumping.
            const raw = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
            const progress = Math.min(1, Math.max(0, raw));
            const shift = (0.5 - progress) * RANGE * rect.height;
            bandInner.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        update();
    }

    /* ---------- Scroll Reveal ---------- */
    const revealEls = document.querySelectorAll('.reveal, .reveal-stagger, .reveal-mask, .reveal-letters, .reveal-cards, .reveal-pop');

    if (revealEls.length) {
        // Stripping the classes once the animation ends hands each element
        // back its own CSS, so hover transitions aren't left overridden.
        const clear = (el) => el.classList.remove(
            'reveal', 'reveal-stagger', 'reveal-mask', 'reveal-letters', 'reveal-cards', 'reveal-pop',
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
