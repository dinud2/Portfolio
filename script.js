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

// ── Project filters ──
const filterBtns = document.querySelectorAll('.filter-btn');
const projectRows = document.querySelectorAll('.project-row[data-category]');
const categoriesOf = row => row.dataset.category.split(' ');

// Hide categories that have no projects yet; they appear once a row is tagged
filterBtns.forEach(btn => {
    const f = btn.dataset.filter;
    if (f !== 'all') btn.hidden = ![...projectRows].some(row => categoriesOf(row).includes(f));
});

filterBtns.forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filterBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    projectRows.forEach(row => {
        row.hidden = f !== 'all' && !categoriesOf(row).includes(f);
        if (!row.hidden) row.classList.add('is-visible');
    });
}));

// ── Respect reduced motion for the demo video ──
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('video[autoplay]').forEach(v => { v.autoplay = false; v.pause(); });
}

// ── Lightbox ──
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxVideo = document.getElementById('lightbox-video');
const closeBtn = document.getElementById('lightbox-close');
const prevBtn = document.getElementById('lightbox-prev');
const nextBtn = document.getElementById('lightbox-next');
let group = [];
let current = 0;
let opener = null;

const showItem = i => {
    current = (i + group.length) % group.length;
    const item = group[current];
    const isVideo = item.tagName === 'VIDEO';
    lightboxImg.hidden = isVideo;
    lightboxVideo.hidden = !isVideo;
    if (isVideo) {
        lightboxImg.src = '';
        lightboxVideo.src = item.currentSrc || item.src;
        lightboxVideo.setAttribute('aria-label', item.getAttribute('aria-label'));
        lightboxVideo.play().catch(() => {});
    } else {
        lightboxVideo.pause();
        lightboxVideo.removeAttribute('src');
        lightboxImg.src = item.currentSrc || item.src;
        lightboxImg.alt = item.alt;
    }
};

const openLightbox = item => {
    opener = item;
    // Arrows only cycle through media from the same project
    group = [...item.closest('.project-media').querySelectorAll('[role="button"]')];
    prevBtn.hidden = nextBtn.hidden = group.length < 2;
    showItem(group.indexOf(item));
    lightbox.hidden = false;
    closeBtn.focus();
};

const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxImg.src = '';
    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    if (opener) opener.focus();
};

document.querySelectorAll('.project-media [role="button"]').forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(item); }
    });
});

prevBtn.addEventListener('click', () => showItem(current - 1));
nextBtn.addEventListener('click', () => showItem(current + 1));

lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
closeBtn.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (group.length < 2) return;
    else if (e.key === 'ArrowLeft') { e.preventDefault(); showItem(current - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); showItem(current + 1); }
});
