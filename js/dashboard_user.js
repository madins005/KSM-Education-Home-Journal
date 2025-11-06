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

// ===== CEK LOGIN STATUS =====
function checkLoginStatus() {
  return sessionStorage.getItem("userLoggedIn") === "true";
}

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
        <h3>BELUM ADA ARTIKEL</h3>
        <p>ARTIKEL AKAN MUNCUL DI SINI SETELAH ADMIN MENGUPLOAD JURNAL</p>
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
        <div class="article-title">${article.title || "UNTITLED"}</div>
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

// ===== SETUP GUEST MODE =====
function setupGuestMode() {
  const isLoggedIn = checkLoginStatus();

  // ELEMENT YANG CUMA MUNCUL UNTUK LOGGED IN USER
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

    // TAMPILKAN LOGIN BUTTON DI NAVBAR
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

    // SET AVATAR DEFAULT UNTUK GUEST
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

// HAPUS REDIRECT LOGIN REQUIREMENT
// if (sessionStorage.getItem("userLoggedIn") !== "true") {
//   window.location.href = "./login_user.html";
// }

document.addEventListener("DOMContentLoaded", () => {
  setupNavDropdown();
  window.dropdownManager = new DropdownManager();

  syncVisitorCount();

  if (typeof StatisticsManager !== "undefined" && !window.statsManager) {
    window.statsManager = new StatisticsManager();
  }

  // SETUP GUEST MODE TERLEBIH DAHULU
  setupGuestMode();
  setupLogout();
  setupNewsletter();

  renderArticles();

  // SYNC REAL-TIME SETIAP 5 DETIK
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
