function setupNavDropdown() {
  document.querySelectorAll(".nav-dropdown").forEach((dd) => {
    const btn = dd.querySelector(".nav-link.has-caret");
    const menu = dd.querySelector(".dropdown-menu");

    if (!btn || !menu) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll(".nav-dropdown.open").forEach((x) => {
        if (x !== dd) x.classList.remove("open");
      });
      dd.classList.toggle("open");
    });
  });

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-dropdown.open")
      .forEach((x) => x.classList.remove("open"));
  });
}

class DropdownManager {
  constructor() {
    this.userProfile = document.getElementById("userProfile");
    this.dropdownMenu = document.getElementById("dropdownMenu");
    this.init();
  }

  init() {
    if (!this.userProfile || !this.dropdownMenu) return;

    this.userProfile.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    document.addEventListener("click", () => {
      this.closeDropdown();
    });

    this.dropdownMenu.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  toggleDropdown() {
    this.dropdownMenu.classList.toggle("show");
  }

  closeDropdown() {
    this.dropdownMenu.classList.remove("show");
  }
}

feather.replace();

function loadArticles() {
  const journals = JSON.parse(localStorage.getItem("journals") || "[]");
  const opinions = JSON.parse(localStorage.getItem("opinions") || "[]");
  return [...journals, ...opinions].sort((a, b) => b.id - a.id);
}

let articles = loadArticles();

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
    .slice(0, 6)
    .map(
      (article) => `
    <div class="article-card">
      <div class="article-image-container">
        <img src="${
          article.coverImage ||
          "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=400&fit=crop"
        }" alt="${article.title}" class="article-image">
      </div>
      <div class="article-content">
        <div class="article-meta">${
          Array.isArray(article.author)
            ? article.author.join(", ")
            : article.author || "ADMIN"
        } • ${article.date || new Date().toLocaleDateString("id-ID")}</div>
        <div class="article-title">${article.title || "Untitled"}</div>
      </div>
    </div>
  `
    )
    .join("");
}

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

if (sessionStorage.getItem("userLoggedIn") !== "true") {
  window.location.href = "./login_user.html";
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavDropdown();
  window.dropdownManager = new DropdownManager();

  syncVisitorCount();

  if (typeof StatisticsManager !== "undefined" && !window.statsManager) {
    window.statsManager = new StatisticsManager();
  }

  setUserName();
  setupLogout();
  setupNewsletter();

  renderArticles();

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

  feather.replace();
});
