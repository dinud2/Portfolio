// ── Reveal on scroll ──
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
        });
    }, { threshold: 0.12 });
    reveals.forEach(node => io.observe(node));
} else {
    reveals.forEach(node => node.classList.add('is-visible'));
}

// ── Mobile nav ──
const toggle = document.getElementById('nav-toggle');
const links = document.getElementById('nav-links');
const setNav = open => {
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
};
toggle.addEventListener('click', () => setNav(!links.classList.contains('is-open')));
links.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });

// ── Respect reduced motion for the demo video ──
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('video[autoplay]').forEach(v => { v.autoplay = false; v.pause(); });
}

// ── Lightbox ──
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.getElementById('lightbox-close');
let opener = null;

const openLightbox = img => {
    opener = img;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    lightbox.hidden = false;
    closeBtn.focus();
};

const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxImg.src = '';
    if (opener) opener.focus();
};

document.querySelectorAll('img[role="button"]').forEach(img => {
    img.addEventListener('click', () => openLightbox(img));
    img.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(img); }
    });
});

lightbox.addEventListener('click', e => { if (e.target !== lightboxImg) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lightbox.hidden) closeLightbox(); });
