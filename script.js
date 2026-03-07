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