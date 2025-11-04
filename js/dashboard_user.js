// ===== NAV DROPDOWN TOGGLE =====
class NavDropdownManager {
  constructor() {
    this.navDropdown = document.getElementById("navDropdown");
    this.navDropdownBtn = document.getElementById("navDropdownBtn");
    this.navDropdownMenu = document.getElementById("navDropdownMenu");
    this.init();
  }

  init() {
    if (!this.navDropdownBtn || !this.navDropdownMenu) return;

    // Click button untuk toggle
    this.navDropdownBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });

    // Click di luar untuk close
    document.addEventListener("click", () => {
      this.close();
    });

    // Prevent close saat click di dalam menu
    this.navDropdownMenu.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  toggle() {
    this.navDropdown.classList.toggle("open");
  }

  open() {
    this.navDropdown.classList.add("open");
  }

  close() {
    this.navDropdown.classList.remove("open");
  }
}

// ===== DROPDOWN MANAGER (User Profile) =====
class DropdownManager {
  constructor() {
    this.userProfile = document.getElementById("userProfile");
    this.dropdownMenu = document.getElementById("dropdownMenu");
    this.init();
  }

  init() {
    if (!this.userProfile || !this.dropdownMenu) return;

    // Click pada profile untuk toggle dropdown
    this.userProfile.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Click di luar untuk close dropdown
    document.addEventListener("click", () => {
      this.closeDropdown();
    });

    // Prevent dropdown close saat click di dalam menu
    this.dropdownMenu.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  toggleDropdown() {
    this.dropdownMenu.classList.toggle("show");
  }

  openDropdown() {
    this.dropdownMenu.classList.add("show");
  }

  closeDropdown() {
    this.dropdownMenu.classList.remove("show");
  }
}

// ===== INITIALIZE FEATHER ICONS =====
feather.replace();

// ===== LOAD ARTICLES FROM LOCALSTORAGE =====
function loadArticles() {
  const stored = localStorage.getItem("journals");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing journals:", e);
      return [];
    }
  }
  return [];
}

let articles = loadArticles();

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
        <h3>Belum Ada Artikel</h3>
        <p>Artikel akan muncul di sini setelah admin mengupload jurnal!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = articles
    .map(
      (article) => `
    <div class="article-card">
      <div class="article-image-container">
        <img src="${
          article.coverImage ||
          "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=400&fit=crop"
        }" alt="${article.title || article.judul}" class="article-image">
      </div>
      <div class="article-content">
        <div class="article-meta">${
          article.author ? (Array.isArray(article.author) ? article.author.join(", ") : article.author).toUpperCase() : "ADMIN"
        } • ${article.date || new Date().toLocaleDateString("id-ID")}</div>
        <div class="article-title">${article.title || article.judul || "Untitled"}</div>
      </div>
    </div>
  `
    )
    .join("");
}

// ===== AUTO REFRESH ARTICLES EVERY 5 SECONDS =====
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

// ===== SYNC VISITOR COUNT KE STATISTICSMANAGER =====
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

// ===== LOGOUT FUNCTIONALITY =====
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Yakin ingin logout?")) {
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
        alert("Terima kasih! Anda telah berhasil subscribe newsletter.");
        newsletterEmail.value = "";
      } else {
        alert("Mohon masukkan email yang valid.");
      }
    });
  }
}

// ===== SET USER NAME FROM SESSION =====
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

// ===== CHECK IF USER IS LOGGED IN =====
if (sessionStorage.getItem("userLoggedIn") !== "true") {
  window.location.href = "./login_user.html";
}

// ===== INITIALIZE =====
document.addEventListener("DOMContentLoaded", () => {
  // Init dropdowns
  window.navDropdownManager = new NavDropdownManager();
  window.dropdownManager = new DropdownManager();

  // Sync visitor count
  syncVisitorCount();

  // Init StatisticsManager
  if (typeof StatisticsManager !== "undefined" && !window.statsManager) {
    window.statsManager = new StatisticsManager();
  }

  // Setup UI
  setUserName();
  setupLogout();
  setupNewsletter();

  // Render artikel
  renderArticles();

  // Feather replace
  feather.replace();
});
