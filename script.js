// ── Frames ─────────────────────────────────────────
// The three shipped frames, in candump order. Alt text and the TSSI /
// Eigen descriptions are the ones the site already used.
const frames = [
    {
        id: '0x1A0',
        name: 'Flight Controller',
        sig: 'ESP32 · MPU6050 · PID control',
        state: 'DONE',
        title: 'Flight controller test stand',
        desc: 'One-degree-of-freedom pitch rig: a complementary filter on MPU6050 data feeds a PID control loop driving coreless motors via N-channel MOSFETs.',
        link: { href: 'https://github.com/dinud2/Pitch-Axis-Stabilization-loop' },
        media: [
            { src: 'media/pitch_demo.mp4', w: 720, h: 1280, alt: 'The arm returning to level after a disturbance',
              poster: 'media/pitch_1.jpg' },
            { src: 'media/pitch_1.jpg', w: 540, h: 960, alt: 'Pitch-axis rig: the arm level on its stand, ESP32 and MPU6050 wired to a laptop running the serial plot' },
        ],
    },
    {
        id: '0x0D5',
        name: 'Tractive System Status Indicator',
        sig: 'Altium',
        state: 'DONE',
        title: 'Tractive System Status Indicator',
        desc: "Built for University of Toronto Formula Racing's 2026 electric car. It monitors the electrical and driverless systems and visually flags faults to the team.",
        link: null,
        media: [
            { src: 'media/web/tssi_1.webp', w: 1200, h: 1600, alt: 'Front of the tractive system status indicator printed circuit board' },
            { src: 'media/web/tssi_2.webp', w: 1200, h: 1600, alt: 'Back of the tractive system status indicator printed circuit board' },
        ],
    },
    {
        id: '0x7E0',
        name: 'Eigen',
        sig: 'React · FastAPI · ChromaDB',
        state: 'DONE',
        title: 'Eigen',
        desc: 'Semantic search for study material. Upload PDFs, EPUBs, videos and images, then search across them by meaning. Generates summaries and quizzes automatically.',
        link: { href: 'https://github.com/Parzival129/eigen' },
        media: [
            { src: 'media/web/eigen_1.webp', w: 1600, h: 884, alt: 'Eigen semantic search results' },
            { src: 'media/web/eigen_2.webp', w: 1600, h: 877, alt: 'Eigen document library' },
        ],
    },
];

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

// ── Staggered entrances ────────────────────────────
// each .fade-row waits a little longer than the one above it.
// Replayed when a section opens, because a hidden panel never runs the animation.
function replayRows(panel) {
    if (!panel || reduceMotion.matches) return;
    const rows = [...panel.querySelectorAll('.fade-row')];
    rows.forEach((row, i) => {
        row.style.setProperty('--i', String(i));
        row.style.animation = 'none';
    });
    void panel.offsetWidth;
    rows.forEach(row => row.style.removeProperty('animation'));
}

// ── Frames: media ──────────────────────────────────
const isVideo = item => /\.(mp4|webm)$/i.test(item.src);

const OPENABLE = '.gallery-frame img, .driver-photo img';

function buildMediaEl(item) {
    if (!isVideo(item)) {
        const img = el('img');
        img.src    = item.src;
        img.alt    = item.alt;
        img.width  = item.w;
        img.height = item.h;
        img.tabIndex = 0;   // stills open in the lightbox, so they need to be reachable by keyboard
        img.setAttribute('role', 'button');
        return img;
    }

    const video = document.createElement('video');
    video.src = item.src;
    video.width = item.w;
    video.height = item.h;
    if (item.poster) video.poster = item.poster;
    video.addEventListener('playing', () => { video.dataset.started = 'true'; }, { once: true });
    video.muted       = true;   // required for autoplay to be permitted
    video.loop        = true;
    video.playsInline = true;
    video.controls    = true;
    video.autoplay    = !reduceMotion.matches;
    video.setAttribute('aria-label', item.alt);
    return video;
}

// Stop a video decoding once it is replaced.
function stopMedia(node) {
    if (node && node.tagName === 'VIDEO') {
        node.pause();
        node.removeAttribute('src');
        node.load();
    }
}

function buildGallery(frame) {
    const items = frame.media || [];
    if (!items.length) return null;

    // styles.css sizes the media from --ratio, so nothing is letterboxed
    const frameEl = el('div', 'gallery-frame');
    const gallery = el('div', 'project-gallery');
    const place = item => {
        frameEl.style.setProperty('--ratio', (item.w / item.h).toFixed(4));
        gallery.classList.toggle('is-wide', item.w > item.h);
        frameEl.replaceChildren(buildMediaEl(item));
    };
    place(items[0]);
    gallery.appendChild(frameEl);

    if (items.length > 1) {
        let index = 0;

        const prev = el('button', 'gallery-btn', '‹');
        prev.type = 'button';
        prev.disabled = true;
        prev.setAttribute('aria-label', 'Previous item');

        const next = el('button', 'gallery-btn', '›');
        next.type = 'button';
        next.setAttribute('aria-label', 'Next item');

        const counter = el('span', 'gallery-counter', `1 / ${items.length}`);

        const show = step => {
            index = Math.max(0, Math.min(items.length - 1, index + step));

            stopMedia(frameEl.firstElementChild);
            place(items[index]);

            counter.textContent = `${index + 1} / ${items.length}`;
            prev.disabled = index === 0;
            next.disabled = index === items.length - 1;

            // a button that just disabled itself would drop keyboard focus
            if (step < 0 && prev.disabled) next.focus();
            if (step > 0 && next.disabled) prev.focus();
        };

        prev.addEventListener('click', () => show(-1));
        next.addEventListener('click', () => show(1));

        const controls = el('div', 'gallery-controls');
        controls.append(prev, counter, next);
        gallery.appendChild(controls);
    }

    return gallery;
}

// ── Frames: rows + decoded panel ───────────────────
const frameList = document.getElementById('frame-list');
const decoded = document.getElementById('decoded');

let activeFrame = -1;

function buildDecoded(frame) {
    const heading = el('div', 'decoded-heading');
    heading.append(
        el('div', 'decoded-id', `${frame.id} · decoded`),
        el('div', 'decoded-title', frame.title)
    );

    const desc = el('p', 'decoded-desc');
    desc.textContent = frame.desc;
    if (frame.link) {
        desc.append(' ');
        const link = el('a', null, 'GitHub →');
        link.href = frame.link.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        desc.appendChild(link);
    }

    const gallery = buildGallery(frame);
    const body = el('div', gallery ? 'decoded-body has-media' : 'decoded-body no-media');
    if (gallery) {
        const copy = el('div', 'decoded-copy');
        copy.append(heading, desc);
        body.append(gallery, copy);
    } else {
        body.append(heading, desc);
    }
    return body;
}

function showFrame(i) {
    // clicking the open frame again would rebuild its video and undo a pause
    if (i === activeFrame) return;
    activeFrame = i;

    frameList.querySelectorAll('.frame-row').forEach((btn, n) => {
        btn.setAttribute('aria-pressed', String(n === i));
    });

    decoded.querySelectorAll('video').forEach(stopMedia);
    decoded.replaceChildren(buildDecoded(frames[i]));
}

if (frameList && decoded) {
    frames.forEach((frame, i) => {
        const btn = el('button', 'frame-row fade-row');
        btn.type = 'button';
        btn.style.setProperty('--i', String(i));
        btn.setAttribute('aria-pressed', 'false');

        const state = el('span', 'frame-state', frame.state);
        state.dataset.state = frame.state;

        btn.append(
            el('span', 'frame-id', frame.id),
            el('span', 'frame-name', frame.name),
            el('span', 'frame-sig', frame.sig),
            state
        );
        btn.addEventListener('click', () => showFrame(i));
        frameList.appendChild(btn);
    });

    showFrame(0);
}

// ── Tabs ───────────────────────────────────────────
const tabs = [...document.querySelectorAll('.tab')];

const panelFor = tab => document.getElementById(tab.getAttribute('aria-controls'));

function activateTab(tab, { focus = false, updateHash = true } = {}) {
    tabs.forEach(t => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        panelFor(t).hidden = !selected;
    });

    // a hidden panel would otherwise keep its video decoding
    // ...but one the viewer paused themselves should stay paused on return
    document.querySelectorAll('.panel video').forEach(video => {
        if (video.closest('.panel').hidden) {
            video.dataset.resume = String(!video.paused || !video.dataset.started);
            video.pause();
        } else if (video.dataset.resume === 'true' && !reduceMotion.matches) {
            video.play().catch(() => {});
        }
    });

    replayRows(panelFor(tab));
    if (focus) tab.focus();
    if (updateHash) history.replaceState(null, '', `#${tab.dataset.tab}`);
}

tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab));

    tab.addEventListener('keydown', e => {
        const target = {
            ArrowRight: tabs[(i + 1) % tabs.length],
            ArrowLeft:  tabs[(i - 1 + tabs.length) % tabs.length],
            Home:       tabs[0],
            End:        tabs[tabs.length - 1],
        }[e.key];

        if (target) {
            e.preventDefault();
            activateTab(target, { focus: true });
        }
    });
});

// Open the tab named in the URL so each section stays linkable.
// Skills used to be its own tab and now sits inside About.
const hashAliases = { '#skills': '#about' };

function tabFromHash() {
    const hash = hashAliases[location.hash] || location.hash;
    return tabs.find(t => `#${t.dataset.tab}` === hash);
}

activateTab(tabFromHash() || tabs[0], { updateHash: false });

window.addEventListener('hashchange', () => {
    const tab = tabFromHash();
    if (tab) activateTab(tab, { updateHash: false });
});

// ── Image lightbox ────────────────────────────────
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

let lightboxOpener = null;

function openLightbox(src, alt) {
    lightboxOpener = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
}

function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lightboxOpener && lightboxOpener.isConnected) lightboxOpener.focus();
    lightboxOpener = null;
}

if (lightbox) {
    document.addEventListener('click', e => {
        const img = e.target.closest(OPENABLE);
        if (img) openLightbox(img.currentSrc || img.src, img.alt);
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('open')) {
            if (e.key === 'Escape') closeLightbox();
            // the close button is the only control, so focus stays on it
            if (e.key === 'Tab') { e.preventDefault(); lightboxClose.focus(); }
            return;
        }

        const img = e.target.closest && e.target.closest(OPENABLE);
        if (img && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            openLightbox(img.currentSrc || img.src, img.alt);
        }
    });
}
