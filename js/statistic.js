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
    // Load statistics from localStorage
    this.loadStatistics();

    // Track visitor
    this.trackVisitor();

    // Update article count based on journals
    this.updateArticleCount();

    // Start real-time counter animation
    this.startCounterAnimation();

    // Set up periodic updates
    this.setupPeriodicUpdates();
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
    // Count articles from journal list
    const articles = document.querySelectorAll(".journal-item");
    this.currentArticles = articles.length;
    this.saveStatistics();
  }

  startCounterAnimation() {
    // Animate from 0 to current value
    this.animateCounter(
      this.articleCountElement,
      0,
      this.currentArticles,
      1500
    );
    this.animateCounter(
      this.visitorCountElement,
      0,
      this.currentVisitors,
      2000
    );
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