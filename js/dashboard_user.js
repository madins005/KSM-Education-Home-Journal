// ===== INITIALIZE FEATHER ICONS =====
feather.replace();

// ===== LOAD ARTICLES FROM LOCALSTORAGE =====
function loadArticles() {
  const stored = localStorage.getItem('journals');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing journals:', e);
      return [];
    }
  }
  return [];
}

let articles = loadArticles();

// ===== RENDER ARTICLES =====
function renderArticles() {
  const grid = document.getElementById('articlesGrid');
  
  // Reload articles from localStorage setiap render
  articles = loadArticles();
  
  if (articles.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
        </svg>
        <h3>Belum Ada Artikel</h3>
        <p>Artikel akan muncul di sini setelah admin mengupload jurnal!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = articles.map(article => `
    <div class="article-card">
      <div class="article-image-container">
        <img src="${article.coverImage || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=400&fit=crop'}" alt="${article.judul}" class="article-image">
      </div>
      <div class="article-content">
        <div class="article-meta">${article.authors ? article.authors.join(', ').toUpperCase() : 'ADMIN'} • ${article.uploadDate || new Date().toLocaleDateString('id-ID')}</div>
        <div class="article-title">${article.judul || article.title || 'Untitled'}</div>
      </div>
    </div>
  `).join('');
}

// ===== AUTO REFRESH ARTICLES EVERY 5 SECONDS =====
setInterval(() => {
  const currentCount = articles.length;
  articles = loadArticles();
  if (articles.length !== currentCount) {
    renderArticles();
    updateStatistics();
  }
}, 5000);

// ===== UPDATE STATISTICS WITH REAL DATA =====
function updateStatistics() {
  const articleCount = articles.length;
  const visitorCount = parseInt(localStorage.getItem('visitorCount') || '0');
  
  animateCount(document.getElementById('articleCount'), articleCount);
  animateCount(document.getElementById('visitorCount'), visitorCount);
}

// ===== ANIMATE COUNTER =====
function animateCount(element, target) {
  let current = parseInt(element.textContent) || 0;
  const increment = Math.ceil(Math.abs(target - current) / 50);
  
  const timer = setInterval(() => {
    if (current < target) {
      current = Math.min(current + increment, target);
      element.textContent = current;
      element.classList.add('counting');
    } else if (current > target) {
      current = Math.max(current - increment, target);
      element.textContent = current;
      element.classList.add('counting');
    } else {
      element.classList.remove('counting');
      clearInterval(timer);
    }
  }, 20);
}

// ===== DROPDOWN FUNCTIONALITY =====
const userProfile = document.getElementById('userProfile');
const dropdownMenu = document.getElementById('dropdownMenu');

userProfile.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('show');
});

document.addEventListener('click', () => {
  dropdownMenu.classList.remove('show');
});

// ===== LOGOUT FUNCTIONALITY =====
document.getElementById('logoutBtn').addEventListener('click', () => {
  if (confirm('Yakin ingin logout?')) {
    sessionStorage.removeItem('userLoggedIn');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    window.location.href = './login_user.html';
  }
});

// ===== NEWSLETTER SUBSCRIPTION =====
document.getElementById('subscribeBtn').addEventListener('click', () => {
  const email = document.getElementById('newsletterEmail').value.trim();
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Terima kasih! Anda telah berhasil subscribe newsletter.');
    document.getElementById('newsletterEmail').value = '';
  } else {
    alert('Mohon masukkan email yang valid.');
  }
});

// ===== CHECK IF USER IS LOGGED IN =====
if (sessionStorage.getItem('userLoggedIn') !== 'true') {
  window.location.href = './login_user.html';
}

// ===== SET USER NAME FROM SESSION =====
const userEmail = sessionStorage.getItem('userEmail');
if (userEmail) {
  const userName = userEmail.split('@')[0].toUpperCase();
  document.querySelector('.user-name').textContent = userName;
  document.querySelector('.user-avatar').textContent = userName.charAt(0);
}

// ===== INITIALIZE =====
renderArticles();
updateStatistics();
feather.replace();