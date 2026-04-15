// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NAVBAR — scroll state + active section highlighting
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const navbar   = document.getElementById('navbar');
const heroEl   = document.getElementById('hero');
const navLinks = document.querySelectorAll('.nav-links a');

if (heroEl) {
  new IntersectionObserver(([e]) => {
    navbar.classList.toggle('scrolled', !e.isIntersecting);
  }, { threshold: 0.05 }).observe(heroEl);
}

const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting)
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${e.target.id}`));
  });
}, { rootMargin: '-40% 0px -55% 0px' });

['me','skills','experience','education','writeup'].forEach(id => {
  const el = document.getElementById(id);
  if (el) sectionObs.observe(el);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REVEAL ON SCROLL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
    setTimeout(() => entry.target.classList.add('visible'), siblings.indexOf(entry.target) * 80);
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
