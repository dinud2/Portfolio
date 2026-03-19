// ── Theme toggle ───────────────────────────────────
const html        = document.documentElement;
const toggleBtn   = document.getElementById('theme-toggle');
const toggleIcon  = document.getElementById('toggle-icon');
const toggleLabel = document.getElementById('toggle-label');

function applyTheme(theme) {
    html.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
        toggleIcon.textContent  = '☾';
        toggleLabel.textContent = 'Dark';
    } else {
        toggleIcon.textContent  = '☀';
        toggleLabel.textContent = 'Light';
    }
}

// Restore saved preference
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

toggleBtn.addEventListener('click', () => {
    applyTheme(html.dataset.theme === 'dark' ? 'light' : 'dark');
});

// ── Custom cursor ──────────────────────────────────
const dot = document.getElementById('cursor-dot');

if (dot) {
    document.addEventListener('mousemove', e => {
        dot.style.left = e.clientX + 'px';
        dot.style.top  = e.clientY + 'px';
    });

    document.addEventListener('mouseleave', () => {
        dot.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        dot.style.opacity = '1';
    });

    const hoverTargets = 'a, button, .project-card, .stat-card, .contact-link, .btn-primary, .btn-secondary, .theme-toggle';
    document.querySelectorAll(hoverTargets).forEach(el => {
        el.addEventListener('mouseenter', () => dot.classList.add('expanded'));
        el.addEventListener('mouseleave', () => dot.classList.remove('expanded'));
    });
}

// ── Nav: shrink on scroll + active section ─────────
const nav      = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    // Shrink nav
    if (window.scrollY > 60) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }

    // Active link
    let current = '';
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) {
            current = sec.id;
        }
    });
    navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
}, { passive: true });

// ── Intersection observer: fade-in ────────────────
const fadeEls = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

fadeEls.forEach(el => observer.observe(el));

// ── TSSI image cycler ──────────────────────────────
const tssiSrcs    = ['media/tssi_1.png', 'media/tssi_2.png'];
const tssiImg     = document.getElementById('tssi-img');
const tssiPrev    = document.getElementById('tssi-prev');
const tssiNext    = document.getElementById('tssi-next');
const tssiCounter = document.getElementById('tssi-counter');
let tssiIndex     = 0;

function tssiShow(index) {
    tssiIndex = index;
    tssiImg.src = tssiSrcs[tssiIndex];
    tssiCounter.textContent = `${tssiIndex + 1} / ${tssiSrcs.length}`;
    tssiPrev.disabled = tssiIndex === 0;
    tssiNext.disabled = tssiIndex === tssiSrcs.length - 1;
}

if (tssiPrev && tssiNext) {
    tssiPrev.addEventListener('click', () => tssiShow(tssiIndex - 1));
    tssiNext.addEventListener('click', () => tssiShow(tssiIndex + 1));
}

// ── Eigen image cycler ───────────────────────────────
const eigenSrcs    = ['media/eigen_1.png', 'media/eigen_2.png'];
const eigenImg     = document.getElementById('eigen-img');
const eigenPrev    = document.getElementById('eigen-prev');
const eigenNext    = document.getElementById('eigen-next');
const eigenCounter = document.getElementById('eigen-counter');
let eigenIndex     = 0;

function eigenShow(index) {
    eigenIndex = index;
    eigenImg.src = eigenSrcs[eigenIndex];
    eigenCounter.textContent = `${eigenIndex + 1} / ${eigenSrcs.length}`;
    eigenPrev.disabled = eigenIndex === 0;
    eigenNext.disabled = eigenIndex === eigenSrcs.length - 1;
}

if (eigenPrev && eigenNext) {
    eigenPrev.addEventListener('click', () => eigenShow(eigenIndex - 1));
    eigenNext.addEventListener('click', () => eigenShow(eigenIndex + 1));
}

// ── Project carousel ──────────────────────────────
const projTrack  = document.getElementById('projects-track');
const projPrev   = document.getElementById('proj-prev');
const projNext   = document.getElementById('proj-next');
const projDots   = document.getElementById('carousel-dots');
const projCards  = projTrack ? projTrack.querySelectorAll('.project-card') : [];
let projIndex    = 0;

function projShow(index) {
    projIndex = index;
    const card = projCards[projIndex];
    const viewportWidth = projTrack.parentElement.offsetWidth;
    const cardLeft = card.offsetLeft;
    // Clamp so the card is never cut off: don't scroll further than needed
    const maxScroll = projTrack.scrollWidth - viewportWidth;
    const offset = Math.min(cardLeft, maxScroll);
    projTrack.style.transform = `translateX(-${Math.max(0, offset)}px)`;
    projPrev.disabled = projIndex === 0;
    projNext.disabled = projIndex === projCards.length - 1;
    projDots.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === projIndex);
    });
}

if (projTrack && projCards.length) {
    // Create dots
    projCards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to project ${i + 1}`);
        dot.addEventListener('click', () => projShow(i));
        projDots.appendChild(dot);
    });

    projPrev.addEventListener('click', () => projShow(projIndex - 1));
    projNext.addEventListener('click', () => projShow(projIndex + 1));
    projPrev.disabled = true;
    projNext.disabled = projCards.length <= 1;
}

// ── Image lightbox ────────────────────────────────
const lightbox    = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

if (lightbox) {
    document.querySelectorAll('.tssi-images img, .eigen-images img').forEach(img => {
        img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
}

// ── Hamburger menu ────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('nav-links');

if (hamburger && navLinksEl) {
    const navEl = document.getElementById('nav');

    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('open');
        navLinksEl.classList.toggle('open');
        navEl.classList.toggle('menu-open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinksEl.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinksEl.classList.remove('open');
            navEl.classList.remove('menu-open');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
}

// ── Touch swipe for project carousel ──────────────
if (projTrack && projCards.length > 1) {
    let touchStartX = 0;
    let touchEndX = 0;

    projTrack.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    projTrack.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && projIndex < projCards.length - 1) {
                projShow(projIndex + 1);
            } else if (diff < 0 && projIndex > 0) {
                projShow(projIndex - 1);
            }
        }
    }, { passive: true });
}

// ── Smooth scroll for nav links ────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

