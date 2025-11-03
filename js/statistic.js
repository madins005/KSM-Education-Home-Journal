// ===== REAL-TIME STATISTICS SYSTEM =====

class StatisticsManager {
  constructor() {
    this.articleCountElement = document.getElementById("articleCount");
    this.visitorCountElement = document.getElementById("visitorCount");
    this.isAnimating = false;

    // Initialize statistics
    this.init();
  }

  init() {
    if (!this.articleCountElement && !this.visitorCountElement) return;

    this.loadStatistics();
    this.trackVisitor();

    // Hitung dari localStorage (bukan dari DOM)
    this.updateArticleCount();

    // Animasi awal (opsional)
    this.startCounterAnimation();

    // Periodic (opsional)
    this.setupPeriodicUpdates();

    // Auto-sync kalau data jurnal berubah
    window.addEventListener("journals:changed", () =>
      this.updateArticleCount()
    );

    // Auto-sync antar tab
    window.addEventListener("storage", (e) => {
      if (e.key === "journals") this.updateArticleCount();
    });
  }

  loadStatistics() {
    // Get stored statistics or initialize
    const stats = this.getStoredStats();
    this.currentArticles = stats.articles;
    this.currentVisitors = stats.visitors;
  }

  getStoredStats() {
    const stored = localStorage.getItem("siteStatistics");
    if (stored) {
      return JSON.parse(stored);
    }

    // Initialize new statistics
    return {
      articles: 0,
      visitors: 0,
      lastVisit: null,
      uniqueVisitorId: this.generateVisitorId(),
    };
  }

  saveStatistics() {
    const stats = {
      articles: this.currentArticles,
      visitors: this.currentVisitors,
      lastVisit: new Date().toISOString(),
      uniqueVisitorId: this.getStoredStats().uniqueVisitorId,
    };
    localStorage.setItem("siteStatistics", JSON.stringify(stats));
  }

  generateVisitorId() {
    return (
      "visitor_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  trackVisitor() {
    const stats = this.getStoredStats();
    const today = new Date().toDateString();
    const lastVisit = stats.lastVisit
      ? new Date(stats.lastVisit).toDateString()
      : null;

    // Increment visitor count if it's a new day or first visit
    if (!lastVisit || lastVisit !== today) {
      this.currentVisitors++;
      this.saveStatistics();
    }

    // Track session visitors (for demo purposes)
    const sessionVisitors = sessionStorage.getItem("sessionVisitorCount");
    if (!sessionVisitors) {
      sessionStorage.setItem("sessionVisitorCount", "1");
    }
  }

  updateArticleCount() {
    try {
      const list = JSON.parse(localStorage.getItem("journals") || "[]");
      this.currentArticles = Array.isArray(list) ? list.length : 0;
    } catch {
      this.currentArticles = 0;
    }

    if (this.articleCountElement) {
      this.articleCountElement.textContent = String(this.currentArticles);
    }
    this.saveStatistics();
  }

  startCounterAnimation() {
    if (this.articleCountElement) {
      const startA = parseInt(this.articleCountElement.textContent || "0", 10);
      const endA = this.currentArticles || 0;
      this.animateCounter(this.articleCountElement, startA, endA, 700);
    }
    if (this.visitorCountElement) {
      const startV = parseInt(this.visitorCountElement.textContent || "0", 10);
      const endV = this.currentVisitors || 0;
      this.animateCounter(this.visitorCountElement, startV, endV, 900);
    }
  }

  animateCounter(element, start, end, duration) {
    if (this.isAnimating) return;

    element.classList.add("counting");
    const startTime = performance.now();
    const range = end - start;

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + range * easeOutQuart);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = end;
        element.classList.remove("counting");
      }
    };

    requestAnimationFrame(updateCounter);
  }

  incrementArticleCount() {
    this.currentArticles++;
    this.saveStatistics();
    this.animateCounter(
      this.articleCountElement,
      parseInt(this.articleCountElement.textContent),
      this.currentArticles,
      500
    );
  }

  decrementArticleCount() {
    if (this.currentArticles > 0) {
      this.currentArticles--;
      this.saveStatistics();
      this.animateCounter(
        this.articleCountElement,
        parseInt(this.articleCountElement.textContent),
        this.currentArticles,
        500
      );
    }
  }

  incrementVisitorCount() {
    this.currentVisitors++;
    this.saveStatistics();
    this.animateCounter(
      this.visitorCountElement,
      parseInt(this.visitorCountElement.textContent),
      this.currentVisitors,
      500
    );
  }

  setupPeriodicUpdates() {
    // Simulate real-time visitor updates (for demo)
    setInterval(() => {
      // Random chance to simulate a new visitor (5% chance every 10 seconds)
      if (Math.random() < 0.05) {
        this.incrementVisitorCount();
      }
    }, 10000);
  }

  resetStatistics() {
    localStorage.removeItem("siteStatistics");
    sessionStorage.removeItem("sessionVisitorCount");
    this.currentArticles = 0;
    this.currentVisitors = 0;
    this.saveStatistics();
    this.articleCountElement.textContent = "0";
    this.visitorCountElement.textContent = "0";
  }
}
