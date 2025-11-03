// statistic.js - Tambahan untuk sinkronisasi statistik antara admin dan user
// File ini HANYA menambahkan fungsi, tidak mengubah code yang sudah ada

// Fungsi untuk menghitung total pengunjung dari semua jurnal
function syncVisitorCount() {
  const journals = JSON.parse(localStorage.getItem('journals') || '[]');
  let totalVisitors = 0;
  
  journals.forEach(journal => {
    totalVisitors += parseInt(journal.views || 0);
  });
  
  // Update visitorCount di localStorage agar sinkron
  localStorage.setItem('visitorCount', totalVisitors.toString());
  
  return totalVisitors;
}

// Fungsi untuk menghitung jumlah artikel
function syncArticleCount() {
  const journals = JSON.parse(localStorage.getItem('journals') || '[]');
  return journals.length;
}

// Fungsi untuk update statistik di halaman (jika element ada)
function updateStatisticDisplay() {
  const articleCountEl = document.getElementById('articleCount');
  const visitorCountEl = document.getElementById('visitorCount');
  
  if (articleCountEl) {
    const articleCount = syncArticleCount();
    articleCountEl.textContent = articleCount;
  }
  
  if (visitorCountEl) {
    const visitorCount = syncVisitorCount();
    visitorCountEl.textContent = visitorCount;
  }
}

// Auto sync setiap 3 detik (opsional, bisa dihapus jika tidak perlu)
function startAutoSync() {
  setInterval(() => {
    updateStatisticDisplay();
  }, 3000);
}

// Initialize saat halaman load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    updateStatisticDisplay();
    // Uncomment baris di bawah jika ingin auto-sync
    // startAutoSync();
  });
} else {
  updateStatisticDisplay();
  // Uncomment baris di bawah jika ingin auto-sync
  // startAutoSync();
}