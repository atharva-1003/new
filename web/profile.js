// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
  initializeProfile();
  initializeTheme();
  setupTabNavigation();
  setupFormHandlers();
  setupSettingsHandlers();
});

// ═══════════════════════════════════════════════
// Theme Management (shared with main site)
// ═══════════════════════════════════════════════

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
    themeToggle.setAttribute('aria-label', isDarkMode ? 'Switch to light mode' : 'Switch to dark mode');
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

if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!getSavedTheme()) {
    setTheme(e.matches);
  }
});

// ═══════════════════════════════════════════════
// Profile Management
// ═══════════════════════════════════════════════

const getProfile = () => {
  try {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : getDefaultProfile();
  } catch {
    return getDefaultProfile();
  }
};

const getDefaultProfile = () => ({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1 (555) 123-4567',
  bio: 'Passionate reader and book enthusiast. Love discovering new genres and sharing thoughts on literature.',
  location: 'San Francisco, CA',
  booksRented: 12,
  booksReviewed: 8,
  wishlistCount: 24,
  memberSince: '2024-05-01',
  theme: 'light'
});

const saveProfile = (profileData) => {
  try {
    localStorage.setItem('userProfile', JSON.stringify(profileData));
  } catch {
    // Ignore storage failures.
  }
};

const initializeProfile = () => {
  const profile = getProfile();

  // Calculate initials
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  document.querySelector('.avatar-initials').textContent = initials;

  // Update profile display
  document.getElementById('profileName').textContent = `${profile.firstName} ${profile.lastName}`;
  document.getElementById('profileEmail').textContent = profile.email;

  // Format member since date
  const memberDate = new Date(profile.memberSince);
  const memberSinceText = memberDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  document.getElementById('profileMemberSince').textContent = `Member since ${memberSinceText}`;

  // Update stats
  document.getElementById('booksRented').textContent = profile.booksRented;
  document.getElementById('booksReviewed').textContent = profile.booksReviewed;
  document.getElementById('wishlistCount').textContent = profile.wishlistCount;

  // Populate form fields
  document.getElementById('firstName').value = profile.firstName;
  document.getElementById('lastName').value = profile.lastName;
  document.getElementById('email').value = profile.email;
  document.getElementById('phone').value = profile.phone;
  document.getElementById('bio').value = profile.bio;
  document.getElementById('location').value = profile.location;

  // Load preferences
  const prefs = loadPreferences();
  document.getElementById('emailNotifications').checked = prefs.emailNotifications;
  document.getElementById('smsNotifications').checked = prefs.smsNotifications;
  document.getElementById('rentReminders').checked = prefs.rentReminders;
};

// ═══════════════════════════════════════════════
// Tab Navigation
// ═══════════════════════════════════════════════

const setupTabNavigation = () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabContents.forEach((content) => content.classList.remove('active'));

      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');

      // Save active tab
      try {
        localStorage.setItem('activeProfileTab', tabName);
      } catch {
        // Ignore storage failures.
      }
    });
  });

  // Restore last active tab
  try {
    const activeTab = localStorage.getItem('activeProfileTab') || 'account';
    const activeButton = document.querySelector(`[data-tab="${activeTab}"]`);
    if (activeButton) {
      activeButton.click();
    }
  } catch {
    // Ignore storage failures.
  }
};

// ═══════════════════════════════════════════════
// Form Handlers
// ═══════════════════════════════════════════════

const setupFormHandlers = () => {
  const profileForm = document.getElementById('profileForm');
  const changeAvatarBtn = document.getElementById('changeAvatarBtn');
  const changePasswordBtn = document.getElementById('changePasswordBtn');

  // Save profile form
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const updatedProfile = {
        ...getProfile(),
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        bio: document.getElementById('bio').value,
        location: document.getElementById('location').value,
      };

      saveProfile(updatedProfile);
      initializeProfile();

      // Show success message
      showNotification('Profile updated successfully!', 'success');
    });
  }

  // Change avatar
  if (changeAvatarBtn) {
    changeAvatarBtn.addEventListener('click', () => {
      const colors = ['#4f7df3', '#ff9f43', '#10b981', '#f43f5e', '#8b5cf6'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const avatar = document.getElementById('profileAvatar');
      avatar.style.backgroundColor = randomColor;
      
      showNotification('Avatar updated!', 'success');
    });
  }

  // Change password
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
      const oldPassword = prompt('Enter your current password:');
      if (!oldPassword) return;

      const newPassword = prompt('Enter your new password:');
      if (!newPassword) return;

      const confirmPassword = prompt('Confirm your new password:');
      if (confirmPassword !== newPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
      }

      showNotification('Password changed successfully!', 'success');
    });
  }

  // 2FA button
  const enable2FABtn = document.getElementById('enable2FABtn');
  if (enable2FABtn) {
    enable2FABtn.addEventListener('click', () => {
      showNotification('Two-factor authentication setup initiated. Check your email for next steps.', 'success');
    });
  }
};

// ═══════════════════════════════════════════════
// Settings Handlers
// ═══════════════════════════════════════════════

const loadPreferences = () => {
  try {
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : {
      emailNotifications: true,
      smsNotifications: false,
      rentReminders: true
    };
  } catch {
    return {
      emailNotifications: true,
      smsNotifications: false,
      rentReminders: true
    };
  }
};

const savePreferences = (prefs) => {
  try {
    localStorage.setItem('userPreferences', JSON.stringify(prefs));
  } catch {
    // Ignore storage failures.
  }
};

const setupSettingsHandlers = () => {
  const emailNotifications = document.getElementById('emailNotifications');
  const smsNotifications = document.getElementById('smsNotifications');
  const rentReminders = document.getElementById('rentReminders');
  const downloadDataBtn = document.getElementById('downloadDataBtn');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // Save notification preferences
  const savePrefs = () => {
    const prefs = {
      emailNotifications: emailNotifications.checked,
      smsNotifications: smsNotifications.checked,
      rentReminders: rentReminders.checked
    };
    savePreferences(prefs);
    showNotification('Settings updated!', 'success');
  };

  emailNotifications?.addEventListener('change', savePrefs);
  smsNotifications?.addEventListener('change', savePrefs);
  rentReminders?.addEventListener('change', savePrefs);

  // Download data
  downloadDataBtn?.addEventListener('click', () => {
    const profile = getProfile();
    const prefs = loadPreferences();
    const data = { profile, preferences: prefs };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lidia-profile-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showNotification('Profile data downloaded!', 'success');
  });

  // Delete account
  deleteAccountBtn?.addEventListener('click', () => {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmed) return;

    const doublyConfirmed = confirm('Type "DELETE" to confirm account deletion.');
    if (doublyConfirmed) {
      try {
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userPreferences');
      } catch {
        // Ignore errors
      }
      showNotification('Account deleted. Redirecting...', 'success');
      setTimeout(() => window.location.href = 'index.html', 1500);
    }
  });

  // Logout
  logoutBtn?.addEventListener('click', () => {
    const confirmed = confirm('Are you sure you want to logout?');
    if (confirmed) {
      showNotification('Logged out successfully. Redirecting...', 'success');
      setTimeout(() => window.location.href = 'index.html', 1500);
    }
  });
};

// ═══════════════════════════════════════════════
// Notification Helper
// ═══════════════════════════════════════════════

const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
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
