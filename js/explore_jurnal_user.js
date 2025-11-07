// Initialize Feather Icons
feather.replace();

// ===== DROPDOWN FUNCTIONALITY =====
// Handle dropdown click (bukan hover)
document.addEventListener('DOMContentLoaded', function() {
  const navDropdown = document.querySelector('.nav-dropdown');
  const navLink = document.querySelector('.nav-link');

  // Toggle dropdown on click
  navLink.addEventListener('click', function(e) {
    e.preventDefault();
    navDropdown.classList.toggle('open');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!navDropdown.contains(e.target)) {
      navDropdown.classList.remove('open');
    }
  });

  // Prevent dropdown from closing when clicking inside
  navDropdown.addEventListener('click', function(e) {
    e.stopPropagation();
  });
});

// ===== ARTICLE LOADING FUNCTIONALITY =====
// Get article ID and type from URL
const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get('id');
const articleType = urlParams.get('type') || 'jurnal'; // 'jurnal' or 'opini'

// Load article data
async function loadArticleDetail() {
  if (!articleId) {
    showError();
    return;
  }

  try {
    // Get article data from localStorage based on type
    const storageKey = articleType === 'opini' ? 'opinions' : 'journals';
    const articles = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const article = articles.find(a => a.id === articleId);

    if (!article) {
      showError();
      return;
    }

    // Display article data
    displayArticle(article, articleType);
    
    // Update view count
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

  // Estimate read time based on abstract length
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

  // Article Body (if available)
  if (article.content || article.body) {
    document.getElementById('articleBodySection').style.display = 'block';
    const bodyContent = article.content || article.body;
    
    // Parse HTML content safely
    const articleBody = document.getElementById('articleBody');
    articleBody.innerHTML = bodyContent;
  } else {
    // Hide body section if no content
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

  // Re-initialize Feather Icons for dynamically added content
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
document.getElementById('togglePdfViewer').addEventListener('click', function() {
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

// ===== LOAD ARTICLE ON PAGE LOAD =====
window.addEventListener('DOMContentLoaded', loadArticleDetail);