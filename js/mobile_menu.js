// ===== MOBILE MENU - CLEAN & PROFESSIONAL =====

document.addEventListener('DOMContentLoaded', function() {
  
  // ===== Utilities =====
  const isMobile = () => window.innerWidth <= 767;

  // ===== Create Elements =====
  
  function createHamburgerMenu() {
    const headerContainer = document.querySelector('.header-container');
    if (!headerContainer || document.querySelector('.hamburger-menu')) return null;

    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger-menu';
    hamburger.setAttribute('aria-label', 'Toggle Menu');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.innerHTML = `
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    `;

    headerContainer.appendChild(hamburger);
    return hamburger;
  }

  function createOverlay() {
    if (document.querySelector('.mobile-overlay')) {
      return document.querySelector('.mobile-overlay');
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);
    return overlay;
  }

  function createMobileAuthButtons() {
    const nav = document.querySelector('nav');
    if (!nav || document.querySelector('.mobile-auth-buttons')) return null;

    const authButtons = document.createElement('div');
    authButtons.className = 'mobile-auth-buttons';
    authButtons.innerHTML = `
      <a href="./login_user.html" class="btn-mobile-login btn-mobile-user">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>User</span>
      </a>
      <button class="btn-mobile-login btn-mobile-admin" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
        <span>Admin</span>
      </button>
    `;

    // Add admin button click handler
    const adminBtn = authButtons.querySelector('.btn-mobile-admin');
    if (adminBtn) {
      adminBtn.addEventListener('click', function() {
        const registerBtn = document.querySelector('.btn-register');
        if (registerBtn) {
          registerBtn.click();
        }
      });
    }

    nav.appendChild(authButtons);
    return authButtons;
  }

  function createMobileSearchButton() {
    const nav = document.querySelector('nav');
    if (!nav || document.querySelector('.mobile-search-btn')) return null;

    const searchBtn = document.createElement('button');
    searchBtn.className = 'mobile-search-btn';
    searchBtn.type = 'button';
    searchBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <span>Search</span>
    `;

    searchBtn.addEventListener('click', function() {
      closeMenu();
      setTimeout(() => {
        const headerSearch = document.querySelector('.search-box input');
        if (headerSearch) {
          headerSearch.focus();
          headerSearch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    });

    const authButtons = nav.querySelector('.mobile-auth-buttons');
    if (authButtons) {
      nav.insertBefore(searchBtn, authButtons);
    } else {
      nav.appendChild(searchBtn);
    }
    
    return searchBtn;
  }

  // ===== Initialize =====
  
  const hamburger = createHamburgerMenu();
  const overlay = createOverlay();
  const nav = document.querySelector('nav');
  const navDropdown = document.querySelector('.nav-dropdown');
  const navDropdownBtn = document.querySelector('.nav-link.has-caret');

  if (!hamburger || !nav || !overlay) {
    console.warn('Mobile menu: Required elements not found');
    return;
  }

  createMobileAuthButtons();
  createMobileSearchButton();

  // === Tambahan untuk menghapus tombol Search kecil ===
  const mobileSearchBtn = document.querySelector('.mobile-search-btn');
  if (mobileSearchBtn) {
    mobileSearchBtn.remove();
    console.log('🔍 Tombol Search kecil dihapus karena sudah ada search bar utama.');
  }
  // =====================================================

  // ===== Menu Functions =====
  
  function toggleMenu() {
    const isActive = nav.classList.toggle('active');
    hamburger.classList.toggle('active');
    overlay.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isActive);
    
    document.body.style.overflow = isActive ? 'hidden' : '';
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  function closeMenu() {
    nav.classList.remove('active');
    hamburger.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    
    // Reset dropdown
    if (navDropdown) {
      navDropdown.classList.remove('active');
    }
  }

  // ===== Event Listeners =====
  
  // Hamburger click
  hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMenu();
  });

  // Overlay click
  overlay.addEventListener('click', closeMenu);

  // Nav links click
  const navLinks = nav.querySelectorAll('a:not(.btn-mobile-login)');
  navLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      if (isMobile()) {
        setTimeout(closeMenu, 200);
      }
    });
  });

  // Dropdown toggle
  if (navDropdownBtn && navDropdown) {
    navDropdownBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if (isMobile()) {
        navDropdown.classList.toggle('active');
      }
    });
  }

  // Prevent nav clicks from closing menu
  nav.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  // Window resize
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth > 767) {
        closeMenu();
      }
    }, 250);
  });

  // ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && nav.classList.contains('active')) {
      closeMenu();
    }
  });

  // ===== Touch Gestures =====
  
  let touchStartX = 0;
  let touchEndX = 0;

  nav.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  nav.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    const swipeDistance = touchEndX - touchStartX;
    
    // Swipe right to close (>100px)
    if (swipeDistance > 100) {
      closeMenu();
    }
  }, { passive: true });

  // ===== Smooth Scroll =====
  
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      if (href !== '#' && href.length > 1) {
        const target = document.querySelector(href);
        
        if (target) {
          e.preventDefault();
          closeMenu();
          
          setTimeout(function() {
            target.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }, 300);
        }
      }
    });
  });

  console.log('✅ Mobile menu initialized successfully');
});
