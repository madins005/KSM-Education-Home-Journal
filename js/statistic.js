// statistic.js - Script untuk sinkronisasi statistik antara admin dan user

// Fungsi untuk menghitung total pengunjung dari semua jurnal
function calculateTotalVisitors() {
  const journals = JSON.parse(localStorage.getItem('journals') || '[]');
  let totalVisitors = 0;
  
  journals.forEach(journal => {
    totalVisitors += parseInt(journal.views || 0);
  });
  
  // Update visitorCount di localStorage
  localStorage.setItem('visitorCount', totalVisitors.toString());
  
  return totalVisitors;
}

// Fungsi untuk mendapatkan jumlah artikel
function getArticleCount() {
  const journals = JSON.parse(localStorage.getItem('journals') || '[]');
  return journals.length;
}

// Fungsi untuk update statistik (digunakan di dashboard admin dan user)
function updateStatistics() {
  const articleCount = getArticleCount();
  const visitorCount = calculateTotalVisitors();
  
  // Update DOM elements jika ada
  const articleCountEl = document.getElementById('articleCount');
  const visitorCountEl = document.getElementById('visitorCount');
  
  if (articleCountEl) {
    animateCount(articleCountEl, articleCount);
  }
  
  if (visitorCountEl) {
    animateCount(visitorCountEl, visitorCount);
  }
  
  return { articleCount, visitorCount };
}

// Animasi counter
function animateCount(element, target) {
  const current = parseInt(element.textContent) || 0;
  const increment = Math.ceil(Math.abs(target - current) / 30);
  
  if (current === target) return;
  
  const timer = setInterval(() => {
    const currentValue = parseInt(element.textContent) || 0;
    
    if (currentValue < target) {
      const newValue = Math.min(currentValue + increment, target);
      element.textContent = newValue;
      element.classList.add('counting');
    } else if (currentValue > target) {
      const newValue = Math.max(currentValue - increment, target);
      element.textContent = newValue;
      element.classList.add('counting');
    } else {
      element.classList.remove('counting');
      clearInterval(timer);
    }
  }, 20);
}

// Fungsi untuk increment views saat jurnal dibuka
function incrementJournalView(journalId) {
  const journals = JSON.parse(localStorage.getItem('journals') || '[]');
  
  const journalIndex = journals.findIndex(j => j.id === journalId);
  
  if (journalIndex !== -1) {
    journals[journalIndex].views = (parseInt(journals[journalIndex].views) || 0) + 1;
    localStorage.setItem('journals', JSON.stringify(journals));
    
    // Update visitor count
    calculateTotalVisitors();
    
    return journals[journalIndex].views;
  }
  
  return 0;
}

// Auto-refresh statistics setiap 3 detik
function startStatisticsAutoRefresh() {
  setInterval(() => {
    updateStatistics();
  }, 3000);
}

// Initialize saat halaman load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    updateStatistics();
    startStatisticsAutoRefresh();
  });
} else {
  updateStatistics();
  startStatisticsAutoRefresh();
}

// Export functions untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateTotalVisitors,
    getArticleCount,
    updateStatistics,
    incrementJournalView,
    startStatisticsAutoRefresh
  };
}