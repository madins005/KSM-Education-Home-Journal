// ===== DASHBOARD USER - FINAL VERSION =====
// Pure user functions only - dropdowns handled by script.js

feather.replace();

// ===== LOGIN STATUS CHECK =====
function checkLoginStatus() {
  return sessionStorage.getItem("userLoggedIn") === "true";
}

// ===== LOAD ARTICLES =====
function loadArticles() {
  const journals = JSON.parse(localStorage.getItem("journals") || "[]");
  const opinions = JSON.parse(localStorage.getItem("opinions") || "[]");
  
  // Add type to each article for navigation
  const journalsWithType = journals.map(j => ({...j, type: 'jurnal'}));
  const opinionsWithType = opinions.map(o => ({...o, type: 'opini'}));
  
  return [...journalsWithType, ...opinionsWithType].sort((a, b) => {
    const dateA = new Date(a.uploadDate || a.date || 0);
    const dateB = new Date(b.uploadDate || b.date || 0);
    return dateB - dateA; // Newest first
  });
}

let articles = loadArticles();

// ===== NAVIGATE TO ARTICLE DETAIL =====
function openArticleDetail(articleId, articleType) {
  console.log('Opening article:', articleId, articleType);
  window.location.href = `explore_jurnal_user.html?id=${articleId}&type=${articleType}`;
}

// ===== RENDER ARTICLES =====
function renderArticles() {
  const grid = document.getElementById("articlesGrid");
  articles = loadArticles();

  if (articles.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
        </svg>
        <h3>BELUM ADA ARTIKEL</h3>
        <p>ARTIKEL AKAN MUNCUL DI SINI SETELAH ADMIN MENGUPLOAD JURNAL</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = articles
    .slice(0, 6)
    .map((article) => {
      // Get article data (support both jurnal and opini formats)
      const title = article.title || article.judul || "UNTITLED";
      const author = Array.isArray(article.authors) 
        ? article.authors[0] 
        : (Array.isArray(article.author) 
          ? article.author[0] 
          : (article.author || article.penulis || "ADMIN"));
      
      const date = article.date || article.uploadDate || new Date().toISOString();
      const formattedDate = new Date(date).toLocaleDateString("id-ID", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      const coverImage = article.coverImage || article.cover || 
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=400&fit=crop";
      
      const views = article.views || 0;
      const abstract = article.abstract || article.abstrak || "";
      const truncatedAbstract = abstract.length > 100 
        ? abstract.substring(0, 100) + "..." 
        : abstract;
      
      const typeLabel = article.type === 'opini' ? 'OPINI' : 'JURNAL';
      const typeClass = article.type === 'opini' ? 'badge-opini' : 'badge-jurnal';
      
      return `
        <div class="article-card" onclick="openArticleDetail('${article.id}', '${article.type}')" style="cursor: pointer;">
          <div class="article-image-container">
            <img src="${coverImage}" alt="${title}" class="article-image">
            <span class="article-type-badge ${typeClass}">${typeLabel}</span>
          </div>
          <div class="article-content">
            <div class="article-meta">
              <span><i data-feather="user" style="width: 14px; height: 14px;"></i> ${author}</span>
              <span><i data-feather="calendar" style="width: 14px; height: 14px;"></i> ${formattedDate}</span>
              <span><i data-feather="eye" style="width: 14px; height: 14px;"></i> ${views}</span>
            </div>
            <div class="article-title">${title}</div>
            ${truncatedAbstract ? `<div class="article-excerpt">${truncatedAbstract}</div>` : ''}
          </div>
        </div>
      `;
    })
    .join("");
  
  feather.replace();
}

// ===== SYNC VISITOR COUNT =====
function syncVisitorCount() {
  const oldVisitorKey = parseInt(localStorage.getItem("visitorCount") || "0");
  if (oldVisitorKey > 0) {
    const stats = JSON.parse(localStorage.getItem("siteStatistics") || "{}");
    stats.visitors = Math.max(stats.visitors || 0, oldVisitorKey);
    stats.lastVisit = new Date().toISOString();
    stats.uniqueVisitorId =
      stats.uniqueVisitorId ||
      "visitor_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("siteStatistics", JSON.stringify(stats));
    localStorage.removeItem("visitorCount");
  }
}

// ===== LOGOUT HANDLER =====
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("YAKIN INGIN LOGOUT?")) {
        sessionStorage.removeItem("userLoggedIn");
        sessionStorage.removeItem("userEmail");
        sessionStorage.removeItem("userType");
        sessionStorage.removeItem("visitorTracked");
        localStorage.removeItem("userEmail");
        window.location.href = "./login_user.html";
      }
    });
  }
}

// ===== NEWSLETTER SUBSCRIPTION =====
function setupNewsletter() {
  const subscribeBtn = document.getElementById("subscribeBtn");
  const newsletterEmail = document.getElementById("newsletterEmail");
  
  if (subscribeBtn && newsletterEmail) {
    subscribeBtn.addEventListener("click", () => {
      const email = newsletterEmail.value.trim();
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("TERIMA KASIH! ANDA TELAH BERHASIL SUBSCRIBE NEWSLETTER");
        newsletterEmail.value = "";
      } else {
        alert("MOHON MASUKKAN EMAIL YANG VALID");
      }
    });
  }
}

// ===== SET USER NAME =====
function setUserName() {
  const userEmail = sessionStorage.getItem("userEmail");
  if (userEmail) {
    const userName = userEmail.split("@")[0].toUpperCase();
    const userNameEl = document.querySelector(".user-name");
    const userAvatarEl = document.querySelector(".user-avatar");
    if (userNameEl) userNameEl.textContent = userName;
    if (userAvatarEl) userAvatarEl.textContent = userName.charAt(0);
  }
}

// ===== GUEST MODE SETUP =====
function setupGuestMode() {
  const isLoggedIn = checkLoginStatus();

  const loggedInElements = [
    document.getElementById("userProfile"),
    document.getElementById("logoutBtn"),
    document.querySelector(".user-info-section"),
  ];

  if (!isLoggedIn) {
    // GUEST MODE
    loggedInElements.forEach((el) => {
      if (el) el.style.display = "none";
    });

    // Show login button in navbar
    const navbar = document.querySelector(".navbar");
    if (navbar && !document.getElementById("guestLoginBtn")) {
      const loginBtn = document.createElement("a");
      loginBtn.id = "guestLoginBtn";
      loginBtn.href = "./login_user.html";
      loginBtn.className = "btn-guest-login";
      loginBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        LOGIN
      `;
      navbar.appendChild(loginBtn);
    }

    const userNameEl = document.querySelector(".user-name");
    const userAvatarEl = document.querySelector(".user-avatar");
    if (userNameEl) userNameEl.textContent = "GUEST";
    if (userAvatarEl) userAvatarEl.textContent = "G";
  } else {
    // LOGGED IN MODE
    loggedInElements.forEach((el) => {
      if (el) el.style.display = "block";
    });

    const guestBtn = document.getElementById("guestLoginBtn");
    if (guestBtn) guestBtn.remove();

    setUserName();
  }
}

// ===== REAL-TIME SYNC =====
function startRealTimeSync() {
  setInterval(() => {
    const currentCount = articles.length;
    articles = loadArticles();
    
    if (articles.length !== currentCount) {
      renderArticles();
      if (window.statsManager) {
        window.statsManager.updateArticleCount();
      }
    }
  }, 5000);
}

// ===== SEARCH FUNCTIONALITY =====
function setupSearch() {
  const searchInput = document.querySelector('.search-box input');
  
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          // Simple search - filter and show results
          performSearch(query);
        }
      }
    });
  }
}

function performSearch(query) {
  const articles = loadArticles();
  const results = articles.filter(article => {
    const title = (article.title || article.judul || '').toLowerCase();
    const abstract = (article.abstract || article.abstrak || '').toLowerCase();
    const author = Array.isArray(article.authors) 
      ? article.authors.join(' ').toLowerCase()
      : (article.author || article.penulis || '').toLowerCase();
    
    const searchQuery = query.toLowerCase();
    return title.includes(searchQuery) || 
           abstract.includes(searchQuery) || 
           author.includes(searchQuery);
  });
  
  // You can either redirect to journals page or show modal
  // For now, let's redirect to journals page with search query
  window.location.href = `journals_user.html?search=${encodeURIComponent(query)}`;
}

// ===== INITIALIZE USER DASHBOARD =====
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing User Dashboard...");

  syncVisitorCount();

  if (typeof StatisticsManager !== "undefined" && !window.statsManager) {
    window.statsManager = new StatisticsManager();
  }

  setupGuestMode();
  setupLogout();
  setupNewsletter();
  setupSearch();
  renderArticles();
  startRealTimeSync();

  feather.replace();

  console.log("User Dashboard ready");
});