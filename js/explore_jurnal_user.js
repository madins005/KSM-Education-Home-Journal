// Initialize Feather Icons immediately
feather.replace();

// ===== SETUP NAV DROPDOWN (sama seperti dashboard_user.js) =====
function setupNavDropdown() {
  document.querySelectorAll(".nav-dropdown").forEach((dd) => {
    const btn = dd.querySelector(".nav-link.has-caret");
    const menu = dd.querySelector(".dropdown-menu");

    if (!btn || !menu) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Close other dropdowns
      document.querySelectorAll(".nav-dropdown.open").forEach((x) => {
        if (x !== dd) x.classList.remove("open");
      });
      
      // Toggle current dropdown
      dd.classList.toggle("open");
    });
  });

  // Close all dropdowns when clicking outside
  document.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-dropdown.open")
      .forEach((x) => x.classList.remove("open"));
  });
}

// ===== SEARCH FUNCTIONALITY =====
const searchInput = document.getElementById('searchInput');
const searchModal = document.getElementById('searchModal');
const closeSearchModal = document.getElementById('closeSearchModal');
const searchResults = document.getElementById('searchResults');

let searchTimeout;

if (searchInput) {
  // Search as user types
  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.trim();
    
    // Clear previous timeout
    clearTimeout(searchTimeout);
    
    // Wait 300ms after user stops typing
    searchTimeout = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query);
        searchModal.style.display = 'flex';
      } else {
        searchModal.style.display = 'none';
      }
    }, 300);
  });
}

if (closeSearchModal) {
  // Close modal
  closeSearchModal.addEventListener('click', function() {
    searchModal.style.display = 'none';
  });
}

if (searchModal) {
  // Close modal when clicking outside
  searchModal.addEventListener('click', function(e) {
    if (e.target === searchModal) {
      searchModal.style.display = 'none';
    }
  });
}

// Perform search
function performSearch(query) {
  const journals = JSON.parse(localStorage.getItem('journals') || '[]');
  const opinions = JSON.parse(localStorage.getItem('opinions') || '[]');
  
  // Combine and search
  const allArticles = [
    ...journals.map(j => ({...j, type: 'jurnal'})),
    ...opinions.map(o => ({...o, type: 'opini'}))
  ];
  
  const results = allArticles.filter(article => {
    const title = (article.title || article.judul || '').toLowerCase();
    const abstract = (article.abstract || article.abstrak || '').toLowerCase();
    const authors = (article.authors || [article.author || article.penulis] || []).join(' ').toLowerCase();
    const tags = (article.tags || []).join(' ').toLowerCase();
    
    const searchQuery = query.toLowerCase();
    
    return title.includes(searchQuery) || 
           abstract.includes(searchQuery) || 
           authors.includes(searchQuery) ||
           tags.includes(searchQuery);
  });
  
  displaySearchResults(results, query);
}

// Display search results
function displaySearchResults(results, query) {
  if (results.length === 0) {
    searchResults.innerHTML = `
      <div class="no-results">
        <i data-feather="search"></i>
        <h3>Tidak ada hasil ditemukan</h3>
        <p>Tidak ada artikel yang cocok dengan pencarian "${query}"</p>
      </div>
    `;
    feather.replace();
    return;
  }
  
  searchResults.innerHTML = results.map(article => {
    const title = article.title || article.judul;
    const abstract = article.abstract || article.abstrak || '';
    const date = new Date(article.date || article.uploadDate).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const views = article.views || 0;
    const author = article.authors ? article.authors[0] : (article.author || article.penulis);
    
    return `
      <div class="search-result-item" onclick="goToArticle('${article.id}', '${article.type}')">
        <span class="search-result-type result-type-${article.type}">
          <i data-feather="${article.type === 'jurnal' ? 'book-open' : 'edit-3'}"></i>
          ${article.type === 'jurnal' ? 'Jurnal' : 'Opini'}
        </span>
        <div class="search-result-title">${title}</div>
        <div class="search-result-abstract">${abstract}</div>
        <div class="search-result-meta">
          <span><i data-feather="calendar"></i> ${date}</span>
          <span><i data-feather="user"></i> ${author}</span>
          <span><i data-feather="eye"></i> ${views} views</span>
        </div>
      </div>
    `;
  }).join('');
  
  feather.replace();
}

// Navigate to article
function goToArticle(id, type) {
  window.location.href = `explore_jurnal_user.html?id=${id}&type=${type}`;
}

// ===== ARTICLE LOADING FUNCTIONALITY =====
// Get article ID and type from URL
const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get('id');
const articleType = urlParams.get('type') || 'jurnal';

// Load article data
async function loadArticleDetail() {
  if (!articleId) {
    showError();
    return;
  }

  try {
    const storageKey = articleType === 'opini' ? 'opinions' : 'journals';
    const articles = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const article = articles.find(a => a.id === articleId);

    if (!article) {
      showError();
      return;
    }

    displayArticle(article, articleType);
    updateViewCount(articleId, storageKey);
    
  } catch (error) {
    console.error('Error loading article:', error);
    showError();
  }
}

function displayArticle(article, type) {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('articleDetail').style.display = 'block';

  // Article Type Badge
  const badge = document.getElementById('articleBadge');
  const badgeText = document.getElementById('badgeText');
  
  if (type === 'opini') {
    badge.className = 'article-badge badge-opini';
    badgeText.innerHTML = '<span>Artikel Opini</span>';
    badge.querySelector('i').setAttribute('data-feather', 'edit-3');
    document.getElementById('abstractTitle').textContent = 'Deskripsi';
  } else {
    badge.className = 'article-badge badge-jurnal';
    badgeText.innerHTML = '<span>Artikel Jurnal</span>';
    badge.querySelector('i').setAttribute('data-feather', 'book-open');
  }

  // Title
  document.getElementById('articleTitle').textContent = article.title || article.judul;

  // Date
  const date = new Date(article.date || article.uploadDate);
  document.getElementById('articleDate').textContent = date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Views
  document.getElementById('articleViews').textContent = `${article.views || 0} views`;

  // Estimate read time
  const wordCount = (article.abstract || article.abstrak || '').split(' ').length;
  const readTime = Math.max(2, Math.ceil(wordCount / 200));
  document.getElementById('readTime').textContent = `${readTime} min read`;

  // Cover Image
  if (article.cover) {
    const coverImg = document.getElementById('articleCover');
    coverImg.src = article.cover;
    coverImg.style.display = 'block';
  }

  // Abstract
  document.getElementById('articleAbstract').textContent = article.abstract || article.abstrak || '-';

  // Article Body
  if (article.content || article.body) {
    document.getElementById('articleBodySection').style.display = 'block';
    const bodyContent = article.content || article.body;
    document.getElementById('articleBody').innerHTML = bodyContent;
  } else {
    document.getElementById('articleBodySection').style.display = 'none';
  }

  // Tags
  if (article.tags && article.tags.length > 0) {
    document.getElementById('tagsSection').style.display = 'block';
    const tagsContainer = document.getElementById('articleTags');
    tagsContainer.innerHTML = article.tags.map(tag => 
      `<span class="tag">${tag}</span>`
    ).join('');
  }

  // Authors
  const authorsContainer = document.getElementById('articleAuthors');
  if (article.authors && article.authors.length > 0) {
    authorsContainer.innerHTML = article.authors.map(author => `
      <div class="author-item">
        <i data-feather="user"></i>
        <span>${author}</span>
      </div>
    `).join('');
  } else {
    authorsContainer.innerHTML = `
      <div class="author-item">
        <i data-feather="user"></i>
        <span>${article.author || article.penulis || '-'}</span>
      </div>
    `;
  }

  // Pengurus (only for jurnal)
  if (type === 'jurnal' && article.pengurus && article.pengurus.length > 0) {
    document.getElementById('pengurusSection').style.display = 'block';
    const pengurusContainer = document.getElementById('articlePengurus');
    pengurusContainer.innerHTML = article.pengurus.map(pengurus => `
      <div class="author-item">
        <i data-feather="briefcase"></i>
        <span>${pengurus}</span>
      </div>
    `).join('');
  }

  // Contact
  const emailLink = document.getElementById('articleEmail');
  emailLink.textContent = article.email || '-';
  emailLink.href = `mailto:${article.email}`;
  
  document.getElementById('articlePhone').textContent = article.contact || article.kontak || '-';

  // PDF Section
  if (article.file) {
    document.getElementById('pdfSection').style.display = 'block';
    document.getElementById('pdfIframe').src = article.file;
    const downloadLink = document.getElementById('pdfDownload');
    downloadLink.href = article.file;
    downloadLink.download = `${article.title || 'artikel'}.pdf`;
  } else {
    document.getElementById('pdfSection').style.display = 'none';
  }

  feather.replace();
}

function showError() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('errorState').style.display = 'block';
  feather.replace();
}

function updateViewCount(articleId, storageKey) {
  try {
    const articles = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const articleIndex = articles.findIndex(a => a.id === articleId);
    
    if (articleIndex !== -1) {
      articles[articleIndex].views = (articles[articleIndex].views || 0) + 1;
      localStorage.setItem(storageKey, JSON.stringify(articles));
    }
  } catch (error) {
    console.error('Error updating view count:', error);
  }
}

// ===== PDF VIEWER TOGGLE =====
const togglePdfBtn = document.getElementById('togglePdfViewer');
if (togglePdfBtn) {
  togglePdfBtn.addEventListener('click', function() {
    const viewer = document.getElementById('pdfViewer');
    const toggleText = document.getElementById('viewerToggleText');
    
    if (viewer.style.display === 'none') {
      viewer.style.display = 'block';
      toggleText.textContent = 'Tutup PDF';
      this.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      viewer.style.display = 'none';
      toggleText.textContent = 'Lihat PDF';
    }
  });
}

// ===== LOAD ON PAGE READY =====
document.addEventListener('DOMContentLoaded', () => {
  setupNavDropdown();
  loadArticleDetail();
  feather.replace();
});