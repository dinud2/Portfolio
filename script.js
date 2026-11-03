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
    if (btn.getAttribute('aria-pressed') === 'true') return;
    filterBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    let shown = 0;
    projectRows.forEach(row => {
        row.hidden = f !== 'all' && !categoriesOf(row).includes(f);
        row.classList.remove('is-filtered-in');
        if (row.hidden) return;
        row.classList.add('is-visible');
        // Restart the fade, staggering each visible row slightly
        void row.offsetWidth;
        row.style.animationDelay = `${shown++ * 60}ms`;
        row.classList.add('is-filtered-in');
    });
}));

// ── Respect reduced motion for the demo video ──
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('video[autoplay]').forEach(v => { v.autoplay = false; v.pause(); });
}

// ── Project page carousels ──
const carousels = new Map();
document.querySelectorAll('.post-gallery').forEach(gallery => {
    const slides = [...gallery.querySelectorAll('[role="button"]')];
    const thumbs = [];
    gallery.classList.add('is-carousel');

    const show = i => {
        const index = (i + slides.length) % slides.length;
        slides.forEach((slide, n) => {
            const on = n === index;
            slide.classList.toggle('is-active', on);
            if (slide.tagName !== 'VIDEO') return;
            if (on && slide.autoplay) slide.play().catch(() => {});
            else slide.pause();
        });
        thumbs.forEach((thumb, n) => thumb.setAttribute('aria-current', String(n === index)));
        gallery.dataset.index = index;
    };
    carousels.set(gallery, { slides, show });

    if (slides.length > 1) {
        const step = d => show(Number(gallery.dataset.index) + d);
        [['is-prev', 'Previous image', '\u2039', -1], ['is-next', 'Next image', '\u203A', 1]].forEach(([cls, label, glyph, d]) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `carousel-nav ${cls}`;
            btn.setAttribute('aria-label', label);
            btn.textContent = glyph;
            btn.addEventListener('click', () => step(d));
            gallery.append(btn);
        });

        const strip = document.createElement('div');
        strip.className = 'carousel-thumbs';
        slides.forEach((slide, n) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'carousel-thumb';
            btn.setAttribute('aria-label', `Show item ${n + 1} of ${slides.length}`);
            const img = document.createElement('img');
            img.src = slide.tagName === 'VIDEO' ? slide.getAttribute('poster') : slide.getAttribute('src');
            img.alt = '';
            btn.append(img);
            btn.addEventListener('click', () => show(n));
            strip.append(btn);
            thumbs.push(btn);
        });
        gallery.after(strip);

        [gallery, strip].forEach(el => el.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
        }));
    }
    show(0);
});

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
    // Leave the carousel on whatever was last viewed in the lightbox
    const viewed = group[current];
    const carousel = viewed && carousels.get(viewed.closest('.post-gallery'));
    if (carousel) { carousel.show(carousel.slides.indexOf(viewed)); viewed.focus(); }
    else if (opener) opener.focus();
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
