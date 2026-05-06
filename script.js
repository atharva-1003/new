const themeToggle = document.getElementById('theme-toggle');

const getSavedTheme = () => {
  try {
    return localStorage.getItem('theme');
  } catch {
    return null;
  }
};

const setTheme = (isDarkMode) => {
  document.documentElement.classList.toggle('dark-theme', isDarkMode);

  if (themeToggle) {
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const themeLabel = themeToggle.querySelector('.theme-label');

    if (themeIcon) {
      themeIcon.textContent = isDarkMode ? '☀' : '🌙';
    }

    if (themeLabel) {
      themeLabel.textContent = isDarkMode ? 'Light' : 'Dark';
    }

    themeToggle.setAttribute('aria-label', isDarkMode ? 'Toggle light mode' : 'Toggle dark mode');
    themeToggle.setAttribute('aria-pressed', String(isDarkMode));
  }
};

const initializeTheme = () => {
  const savedTheme = getSavedTheme();
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDarkMode = savedTheme ? savedTheme === 'dark' : systemPrefersDark;

  setTheme(isDarkMode);
};

const toggleTheme = () => {
  const isDarkMode = !document.documentElement.classList.contains('dark-theme');
  setTheme(isDarkMode);

  try {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  } catch {
    // Ignore storage failures.
  }
};

// Smooth scroll behavior for anchor links
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.focus();
    }
  });
});

// Reveal animation on scroll
const revealElements = document.querySelectorAll('.reveal');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  revealElements.forEach((element) => element.classList.add('active'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealElements.forEach((element) => observer.observe(element));
}

// Enhanced keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-nav');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});

// Initialize theme and set up event listeners
document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!getSavedTheme()) {
    setTheme(e.matches);
  }
});
