// ===== EXPLORE JURNAL USER - COMPLETE FIX =====

console.log("🚀 Starting explore_jurnal_user.js");

// Initialize Feather Icons
if (typeof feather !== 'undefined') {
  feather.replace();
} else {
  console.warn("⚠️ Feather icons not loaded");
}

// ===== SETUP NAV DROPDOWN =====
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
    document.querySelectorAll(".nav-dropdown.open").forEach((x) => x.classList.remove("open"));
  });
}

// ===== SEARCH FUNCTIONALITY =====
const searchInput = document.getElementById('searchInput');
const searchModal = document.getElementById('searchModal');
const closeSearchModal = document.getElementById('closeSearchModal');
const searchResults = document.getElementById('searchResults');

let searchTimeout;

if (searchInput) {
  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.trim();
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query);
        if (searchModal) searchModal.style.display = 'flex';
      } else {
        if (searchModal) searchModal.style.display = 'none';
      }
    }, 300);
  });
}

if (closeSearchModal) {
  closeSearchModal.addEventListener('click', function() {
    if (searchModal) searchModal.style.display = 'none';
  });
}

if (searchModal) {
  searchModal.addEventListener('click', function(e) {
    if (e.target === searchModal) {
      searchModal.style.display = 'none';
    }
  });
}

function performSearch(query) {
  const journals = JSON.parse(localStorage.getItem('journals') || '[]');
  const opinions = JSON.parse(localStorage.getItem('opinions') || '[]');
  
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

function displaySearchResults(results, query) {
  if (!searchResults) return;
  
  if (results.length === 0) {
    searchResults.innerHTML = `
      <div class="no-results">
        <i data-feather="search"></i>
        <h3>Tidak ada hasil ditemukan</h3>
        <p>Tidak ada artikel yang cocok dengan pencarian "${query}"</p>
      </div>
    `;
    if (typeof feather !== 'undefined') feather.replace();
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
  
  if (typeof feather !== 'undefined') feather.replace();
}

function goToArticle(id, type) {
  window.location.href = `explore_jurnal_user.html?id=${id}&type=${type}`;
}

// ===== GET URL PARAMETERS =====
const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get('id');
const articleType = urlParams.get('type') || 'jurnal';

console.log('📋 URL Parameters:', { articleId, articleType, fullURL: window.location.href });

// ===== MAIN LOAD FUNCTION =====
function loadArticleDetail() {
  console.log('🔍 Starting loadArticleDetail...');
  
  // Check if we have an article ID
  if (!articleId) {
    console.error('❌ No article ID in URL');
    showError('No article ID provided');
    return;
  }

  try {
    // Determine storage key
    const storageKey = articleType === 'opini' ? 'opinions' : 'journals';
    console.log('📦 Storage key:', storageKey);
    
    // Get all articles
    const articlesJSON = localStorage.getItem(storageKey);
    console.log('📚 Raw localStorage data:', articlesJSON);
    
    const articles = JSON.parse(articlesJSON || '[]');
    console.log('📚 Parsed articles array:', articles);
    console.log('📊 Total articles found:', articles.length);
    
    // Try different matching strategies
    let article = null;
    
    // Strategy 1: Exact match
    article = articles.find(a => a.id === articleId);
    console.log('🔍 Strategy 1 (exact match):', article);
    
    // Strategy 2: String comparison
    if (!article) {
      article = articles.find(a => String(a.id) === String(articleId));
      console.log('🔍 Strategy 2 (string match):', article);
    }
    
    // Strategy 3: Case-insensitive
    if (!article) {
      article = articles.find(a => String(a.id).toLowerCase() === String(articleId).toLowerCase());
      console.log('🔍 Strategy 3 (case-insensitive):', article);
    }
    
    // Strategy 4: Numeric match
    if (!article && !isNaN(articleId)) {
      article = articles.find(a => Number(a.id) === Number(articleId));
      console.log('🔍 Strategy 4 (numeric match):', article);
    }

    if (!article) {
      console.error('❌ Article not found after all strategies');
      console.log('Available article IDs:', articles.map(a => ({id: a.id, type: typeof a.id})));
      showError('Article not found in database');
      return;
    }

    console.log('✅ Article found:', article);
    displayArticle(article, articleType);
    updateViewCount(articleId, storageKey);
    
  } catch (error) {
    console.error('❌ Error in loadArticleDetail:', error);
    showError(error.message);
  }
}

function displayArticle(article, type) {
  console.log('🎨 Displaying article...', article);
  
  const loadingState = document.getElementById('loadingState');
  const articleDetail = document.getElementById('articleDetail');
  
  if (loadingState) loadingState.style.display = 'none';
  if (articleDetail) articleDetail.style.display = 'block';

  // Article Type Badge
  const badge = document.getElementById('articleBadge');
  const badgeText = document.getElementById('badgeText');
  
  if (badge && badgeText) {
    if (type === 'opini') {
      badge.className = 'article-badge badge-opini';
      badgeText.innerHTML = '<span>Artikel Opini</span>';
      const icon = badge.querySelector('i');
      if (icon) icon.setAttribute('data-feather', 'edit-3');
    } else {
      badge.className = 'article-badge badge-jurnal';
      badgeText.innerHTML = '<span>Artikel Jurnal</span>';
      const icon = badge.querySelector('i');
      if (icon) icon.setAttribute('data-feather', 'book-open');
    }
  }

  // Abstract title
  const abstractTitle = document.getElementById('abstractTitle');
  if (abstractTitle) {
    abstractTitle.textContent = type === 'opini' ? 'Deskripsi' : 'Abstrak';
  }

  // Title
  const titleEl = document.getElementById('articleTitle');
  if (titleEl) {
    titleEl.textContent = article.title || article.judul || 'Untitled Article';
  }

  // Date
  const dateEl = document.getElementById('articleDate');
  if (dateEl) {
    const date = new Date(article.date || article.uploadDate || Date.now());
    dateEl.textContent = date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Views
  const viewsEl = document.getElementById('articleViews');
  if (viewsEl) {
    viewsEl.textContent = `${article.views || 0} views`;
  }

  // Read time
  const readTimeEl = document.getElementById('readTime');
  if (readTimeEl) {
    const abstract = article.abstract || article.abstrak || '';
    const content = article.content || article.body || '';
    const wordCount = (abstract + ' ' + content).split(' ').length;
    const readTime = Math.max(2, Math.ceil(wordCount / 200));
    readTimeEl.textContent = `${readTime} min read`;
  }

  // Cover Image
  const coverImg = document.getElementById('articleCover');
  if (coverImg && (article.cover || article.coverImage)) {
    coverImg.src = article.cover || article.coverImage;
    coverImg.style.display = 'block';
    coverImg.onerror = function() {
      console.warn('⚠️ Cover image failed to load');
      this.style.display = 'none';
    };
  }

  // Abstract
  const abstractEl = document.getElementById('articleAbstract');
  if (abstractEl) {
    abstractEl.textContent = article.abstract || article.abstrak || 'Tidak ada abstrak tersedia';
  }

  // Article Body/Content
  const bodySection = document.getElementById('articleBodySection');
  const bodyElement = document.getElementById('articleBody');
  
  if (bodySection && bodyElement) {
    if (article.content || article.body) {
      bodySection.style.display = 'block';
      const bodyContent = article.content || article.body;
      
      if (bodyContent.includes('<') && bodyContent.includes('>')) {
        bodyElement.innerHTML = bodyContent;
      } else {
        bodyElement.innerHTML = `<p>${bodyContent.replace(/\n/g, '</p><p>')}</p>`;
      }
    } else {
      bodySection.style.display = 'none';
    }
  }

  // Tags
  const tagsSection = document.getElementById('tagsSection');
  const tagsContainer = document.getElementById('articleTags');
  
  if (tagsSection && tagsContainer) {
    if (article.tags && article.tags.length > 0) {
      tagsSection.style.display = 'block';
      tagsContainer.innerHTML = article.tags.map(tag => 
        `<span class="tag">${tag}</span>`
      ).join('');
    } else {
      tagsSection.style.display = 'none';
    }
  }

  // Authors
  const authorsContainer = document.getElementById('articleAuthors');
  if (authorsContainer) {
    if (article.authors && Array.isArray(article.authors) && article.authors.length > 0) {
      authorsContainer.innerHTML = article.authors.map(author => `
        <div class="author-item">
          <i data-feather="user"></i>
          <span>${author}</span>
        </div>
      `).join('');
    } else {
      const singleAuthor = article.author || article.penulis || 'Unknown Author';
      authorsContainer.innerHTML = `
        <div class="author-item">
          <i data-feather="user"></i>
          <span>${singleAuthor}</span>
        </div>
      `;
    }
  }

  // Pengurus (only for jurnal)
  const pengurusSection = document.getElementById('pengurusSection');
  const pengurusContainer = document.getElementById('articlePengurus');
  
  if (pengurusSection && pengurusContainer) {
    if (type === 'jurnal' && article.pengurus && article.pengurus.length > 0) {
      pengurusSection.style.display = 'block';
      pengurusContainer.innerHTML = article.pengurus.map(pengurus => `
        <div class="author-item">
          <i data-feather="briefcase"></i>
          <span>${pengurus}</span>
        </div>
      `).join('');
    } else {
      pengurusSection.style.display = 'none';
    }
  }

  // Contact
  const emailLink = document.getElementById('articleEmail');
  const phoneEl = document.getElementById('articlePhone');
  
  if (emailLink) {
    const email = article.email || article.contact?.email || '-';
    emailLink.textContent = email;
    emailLink.href = email !== '-' ? `mailto:${email}` : '#';
  }
  
  if (phoneEl) {
    phoneEl.textContent = article.phone || article.contact?.phone || article.kontak || '-';
  }

  // PDF Section
  const pdfSection = document.getElementById('pdfSection');
  if (pdfSection) {
    const pdfUrl = article.file || article.pdfUrl;
    
    if (pdfUrl) {
      pdfSection.style.display = 'block';
      
      const pdfIframe = document.getElementById('pdfIframe');
      if (pdfIframe) pdfIframe.src = pdfUrl;
      
      const downloadLink = document.getElementById('pdfDownload');
      if (downloadLink) {
        downloadLink.href = pdfUrl;
        downloadLink.download = `${article.title || article.judul || 'artikel'}.pdf`;
      }
    } else {
      pdfSection.style.display = 'none';
    }
  }

  // Replace feather icons
  if (typeof feather !== 'undefined') feather.replace();
  
  console.log('✅ Article displayed successfully');
}

function showError(message) {
  console.error('💥 Showing error:', message);
  
  const loadingState = document.getElementById('loadingState');
  const errorState = document.getElementById('errorState');
  
  if (loadingState) loadingState.style.display = 'none';
  if (errorState) {
    errorState.style.display = 'flex';
    
    // Add debug info to error message
    const errorDebug = errorState.querySelector('p');
    if (errorDebug) {
      errorDebug.innerHTML = `
        ${errorDebug.textContent}<br><br>
        <strong>Debug Info:</strong><br>
        Article ID: ${articleId}<br>
        Type: ${articleType}<br>
        Error: ${message || 'Unknown error'}
      `;
    }
  }
  
  if (typeof feather !== 'undefined') feather.replace();
}

function updateViewCount(articleId, storageKey) {
  try {
    const articles = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const articleIndex = articles.findIndex(a => String(a.id) === String(articleId));
    
    if (articleIndex !== -1) {
      articles[articleIndex].views = (articles[articleIndex].views || 0) + 1;
      localStorage.setItem(storageKey, JSON.stringify(articles));
      console.log('👁️ View count updated:', articles[articleIndex].views);
    }
  } catch (error) {
    console.error('❌ Error updating view count:', error);
  }
}

// ===== PDF VIEWER TOGGLE =====
const togglePdfBtn = document.getElementById('togglePdfViewer');
if (togglePdfBtn) {
  togglePdfBtn.addEventListener('click', function() {
    const viewer = document.getElementById('pdfViewer');
    const toggleText = document.getElementById('viewerToggleText');
    
    if (viewer && toggleText) {
      if (viewer.style.display === 'none' || !viewer.style.display) {
        viewer.style.display = 'block';
        toggleText.textContent = 'Tutup PDF';
        this.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        viewer.style.display = 'none';
        toggleText.textContent = 'Lihat PDF';
      }
    }
  });
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('📖 DOM Content Loaded - Initializing...');
  setupNavDropdown();
  loadArticleDetail();
  if (typeof feather !== 'undefined') feather.replace();
  console.log('✅ Initialization complete');
});

console.log('✅ explore_jurnal_user.js loaded');