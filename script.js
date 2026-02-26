// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
const navMobileLinks = document.querySelectorAll('.nav-mobile-link');

navToggle.addEventListener('click', () => {
    navMobile.classList.toggle('active');

    // Animate hamburger icon
    const hamburger = navToggle.querySelector('.hamburger');
    if (navMobile.classList.contains('active')) {
        hamburger.style.background = 'transparent';
        hamburger.style.transform = 'rotate(45deg)';
    } else {
        hamburger.style.background = 'white';
        hamburger.style.transform = 'rotate(0)';
    }
});

// Close mobile menu when clicking on a link
navMobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMobile.classList.remove('active');
        const hamburger = navToggle.querySelector('.hamburger');
        hamburger.style.background = 'white';
        hamburger.style.transform = 'rotate(0)';
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.nav').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Add scroll effect to navigation (class-based instead of inline style)
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 0) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Scroll reveal observer — adds .visible class + stagger index
const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe project cards with stagger index
document.querySelectorAll('.project-card').forEach((el, i) => {
    el.style.setProperty('--i', i);
    revealObserver.observe(el);
});

// Observe skill categories with stagger index
document.querySelectorAll('.skill-category').forEach((el, i) => {
    el.style.setProperty('--i', i);
    revealObserver.observe(el);
});

// Observe section titles
document.querySelectorAll('.section-title').forEach(el => {
    revealObserver.observe(el);
});

// Add active state to navigation links based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link, .nav-mobile-link');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Magnetic Buttons — lerp-based rAF loop for smooth tracking
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!prefersReducedMotion.matches) {
    document.querySelectorAll('.btn').forEach(btn => {
        let targetX = 0, targetY = 0;
        let currentX = 0, currentY = 0;
        let rafId = null;
        let isHovered = false;

        function lerp(a, b, t) { return a + (b - a) * t; }

        function tick() {
            currentX = lerp(currentX, targetX, 0.1);
            currentY = lerp(currentY, targetY, 0.1);
            btn.style.transform = `translate(${currentX}px, ${currentY}px)`;

            const dist = Math.abs(targetX - currentX) + Math.abs(targetY - currentY);
            if (isHovered || dist > 0.05) {
                rafId = requestAnimationFrame(tick);
            } else {
                btn.style.transform = '';
                rafId = null;
            }
        }

        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            targetX = (e.clientX - rect.left - rect.width / 2) * 0.3;
            targetY = (e.clientY - rect.top - rect.height / 2) * 0.3;
            isHovered = true;
            if (!rafId) rafId = requestAnimationFrame(tick);
        });

        btn.addEventListener('mouseleave', () => {
            isHovered = false;
            targetX = 0;
            targetY = 0;
            if (!rafId) rafId = requestAnimationFrame(tick);
        });
    });
}
