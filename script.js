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
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

toggleBtn.addEventListener('click', () => {
    applyTheme(html.dataset.theme === 'dark' ? 'light' : 'dark');
});

// ── Projects: data ─────────────────────────────────
const projects = [
    {
        title: 'Pitch-Axis Stabilization Loop',
        category: 'Embedded',
        desc: 'A single-axis flight controller running on an ESP32 — an MPU6050 IMU is fused with a '
            + 'complementary filter to estimate pitch, and a PID loop drives two brushed motors '
            + 'to hold the arm level against artificial disturbances. Gains, setpoint and motor '
            + 'mix are tunable live over the serial console.',
        tags: ['ESP32', 'C++'],
        media: [
            { src: 'media/pitch_1.jpg', alt: 'Pitch-axis rig: the arm level on its stand, ESP32 and MPU6050 wired to a laptop running the serial plot' },
            { src: 'media/pitch_demo.mp4', alt: 'The arm returning to level after a disturbance',
              poster: 'media/pitch_1.jpg' },
        ],
        link: { href: 'https://github.com/dinud2/Pitch-Axis-Stabilization-loop',
                label: 'View on GitHub →' },
    },
    {
        title: 'Tractive System Status Indicator',
        category: 'Hardware',
        desc: "Designed and built my first PCB for the UofT Formula Racing 2026 electric vehicle — a hardware component that monitors and visually notifies the team of any hardware issues within the car's electrical & driverless system.",
        tags: ['Altium', 'Soldering'],
        media: [
            { src: 'media/tssi_1.png', alt: 'TSSI PCB front' },
            { src: 'media/tssi_2.png', alt: 'TSSI PCB back'  },
        ],
        link: null,
    },
    {
        title: 'Eigen',
        category: 'Software',
        desc: 'A semantic document search platform for educational content — upload PDFs, EPUBs, videos, and images, then search across them using AI-powered vector similarity. Features automated summaries and quiz generation.',
        tags: ['React', 'TypeScript', 'FastAPI', 'Python', 'ChromaDB'],
        media: [
            { src: 'media/eigen_1.png', alt: 'Eigen semantic search results' },
            { src: 'media/eigen_2.png', alt: 'Eigen document library' },
        ],
        link: { href: 'https://github.com/Parzival129/eigen', label: 'View on GitHub →' },
    },
];

// ── Projects: render ───────────────────────────────
const projectsList = document.getElementById('projects-list');

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

const isVideo = item => /\.(mp4|webm)$/i.test(item.src);

function buildMediaEl(item) {
    if (!isVideo(item)) {
        const img = el('img');
        img.src = item.src;
        img.alt = item.alt;
        return img;
    }

    const video = document.createElement('video');
    video.src = item.src;
    if (item.poster) video.poster = item.poster;
    video.muted       = true;   // required for autoplay to be permitted
    video.loop        = true;
    video.playsInline = true;
    video.controls    = true;
    video.autoplay    = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    video.setAttribute('aria-label', item.alt);
    return video;
}

// Stop a video decoding once it is off-screen or replaced.
function stopMedia(node) {
    if (node && node.tagName === 'VIDEO') {
        node.pause();
        node.removeAttribute('src');
        node.load();
    }
}

function buildGallery(project) {
    const items = project.media || [];
    if (!items.length) return null;

    const gallery = el('div', 'project-gallery');
    gallery.dataset.imgIndex = '0';

    gallery.appendChild(buildMediaEl(items[0]));

    if (items.length > 1) {
        const prev = el('button', 'gallery-btn gallery-prev', '‹');
        prev.type = 'button';
        prev.disabled = true;
        prev.setAttribute('aria-label', 'Previous item');

        const next = el('button', 'gallery-btn gallery-next', '›');
        next.type = 'button';
        next.setAttribute('aria-label', 'Next item');

        const controls = el('div', 'gallery-controls');
        controls.append(prev, el('span', 'gallery-counter', `1 / ${items.length}`), next);
        gallery.appendChild(controls);
    }

    return gallery;
}

function buildPanelText(project) {
    const text = el('div', 'project-panel-text');
    text.appendChild(el('p', 'project-desc', project.desc));

    const tags = el('div', 'project-tags');
    project.tags.forEach(t => tags.appendChild(el('span', 'tag', t)));
    text.appendChild(tags);

    if (project.link) {
        const link = el('a', 'project-github-link', project.link.label);
        link.href   = project.link.href;
        link.target = '_blank';
        link.rel    = 'noopener noreferrer';
        text.appendChild(link);
    }

    return text;
}

function buildRow(project, i) {
    const panelId = `proj-panel-${i}`;

    const row = el('article', 'project-row fade-in');
    row.dataset.index = String(i);
    row.style.setProperty('--delay', `${(i * 0.06).toFixed(2)}s`);

    // a project may legitimately have no media yet; render the row without a
    // thumbnail rather than throwing and taking the rest of the script with it
    const items = project.media || [];
    const still = items.find(m => !isVideo(m)) || items[0];
    let thumbWrap = null;

    if (still) {
        const thumb = el('img', 'project-thumb');
        thumb.src     = still.poster || still.src;
        thumb.alt     = '';
        thumb.loading = 'lazy';

        thumbWrap = el('div', 'project-thumb-wrap');
        thumbWrap.appendChild(thumb);
    } else {
        row.classList.add('no-media');
    }

    const toggle = el('span', 'project-toggle');
    toggle.setAttribute('aria-hidden', 'true');

    const head = el('button', 'project-row-head');
    head.type = 'button';
    head.setAttribute('aria-expanded', 'false');
    head.setAttribute('aria-controls', panelId);
    const meta = el('div', 'project-row-meta');
    meta.append(
        el('span', 'project-num', String(i + 1).padStart(2, '0')),
        el('span', 'project-category', project.category)
    );

    head.append(
        ...(thumbWrap ? [thumbWrap] : []),
        meta,
        toggle,
        el('span', 'project-row-title', project.title),
        el('span', 'project-row-blurb', project.desc),
        el('span', 'project-row-tags', project.tags.join(' · '))
    );

    const gallery = buildGallery(project);
    const body = el('div', 'project-panel-body');
    body.append(buildPanelText(project), ...(gallery ? [gallery] : []));

    const inner = el('div', 'project-panel-inner');
    inner.appendChild(body);

    const panel = el('div', 'project-panel');
    panel.id = panelId;
    panel.inert = true;
    panel.appendChild(inner);

    row.append(head, panel);
    return row;
}

if (projectsList) {
    projects.forEach((project, i) => projectsList.appendChild(buildRow(project, i)));
}

// ── Projects: expand / collapse ────────────────────
function closeRow(row) {
    row.classList.remove('open');
    row.querySelector('.project-row-head').setAttribute('aria-expanded', 'false');
    row.querySelector('.project-panel').inert = true;
    // a collapsed panel is 0-height but a video in it would keep decoding
    row.querySelectorAll('video').forEach(v => v.pause());
}

if (projectsList) {
    projectsList.addEventListener('click', e => {
        const head = e.target.closest('.project-row-head');
        if (!head) return;

        const row      = head.closest('.project-row');
        const willOpen = !row.classList.contains('open');

        projectsList.querySelectorAll('.project-row.open').forEach(closeRow);

        if (willOpen) {
            row.classList.add('open');
            head.setAttribute('aria-expanded', 'true');
            row.querySelector('.project-panel').inert = false;
        }
    });

    // ── Projects: image gallery ────────────────────
    projectsList.addEventListener('click', e => {
        const btn = e.target.closest('.gallery-prev, .gallery-next');
        if (!btn) return;

        const gallery = btn.closest('.project-gallery');
        const items = projects[Number(gallery.closest('.project-row').dataset.index)].media;
        const step  = btn.classList.contains('gallery-next') ? 1 : -1;
        const index = Math.max(0, Math.min(items.length - 1, Number(gallery.dataset.imgIndex) + step));

        gallery.dataset.imgIndex = String(index);

        const current = gallery.querySelector('img, video');
        stopMedia(current);
        current.replaceWith(buildMediaEl(items[index]));

        gallery.querySelector('.gallery-counter').textContent = `${index + 1} / ${items.length}`;
        gallery.querySelector('.gallery-prev').disabled = index === 0;
        gallery.querySelector('.gallery-next').disabled = index === items.length - 1;
    });
}

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

    const hoverTargets = 'a, button, .project-row-head, .contact-link, .btn-primary, .btn-secondary, .theme-toggle';
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
    document.addEventListener('click', e => {
        const img = e.target.closest('.project-gallery img');
        if (img) openLightbox(img.src, img.alt);
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

