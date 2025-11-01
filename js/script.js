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

// ===== COVER IMAGE UPLOAD MANAGER =====

class CoverUploadManager {
  constructor() {
    this.coverDropZone = document.getElementById("coverDropZone");
    this.coverInput = document.getElementById("coverInput");
    this.coverPreview = document.getElementById("coverPreview");
    this.coverImage = document.getElementById("coverImage");
    this.removeCoverBtn = document.getElementById("removeCover");
    this.uploadedCover = null;

    // File constraints
    this.maxFileSize = 2 * 1024 * 1024; // 2MB
    this.allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    this.init();
  }

  init() {
    // Click to browse
    this.coverDropZone.addEventListener("click", () => {
      this.coverInput.click();
    });

    // File input change
    this.coverInput.addEventListener("change", (e) => {
      this.handleFiles(e.target.files);
    });

    // Drag and drop events
    this.coverDropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.coverDropZone.classList.add("dragover");
    });

    this.coverDropZone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.coverDropZone.classList.remove("dragover");
    });

    this.coverDropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.coverDropZone.classList.remove("dragover");

      const files = e.dataTransfer.files;
      this.handleFiles(files);
    });

    // Remove cover button
    this.removeCoverBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.removeCover();
    });
  }

  handleFiles(files) {
    if (files.length === 0) return;

    const file = files[0];

    // Validate file
    if (!this.validateFile(file)) {
      return;
    }

    this.uploadedCover = file;
    this.showCoverPreview(file);
  }

  validateFile(file) {
    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      this.showError("File harus berformat JPG, PNG, atau GIF!");
      return false;
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      this.showError("Ukuran file maksimal 2MB!");
      return false;
    }

    return true;
  }

  showCoverPreview(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      this.coverImage.src = e.target.result;
      this.coverPreview.style.display = "block";
      this.coverDropZone.style.display = "none";
    };

    reader.readAsDataURL(file);
  }

  removeCover() {
    this.uploadedCover = null;
    this.coverInput.value = "";
    this.coverImage.src = "";
    this.coverPreview.style.display = "none";
    this.coverDropZone.style.display = "block";
    this.coverDropZone.classList.remove("error");
  }

  showError(message) {
    this.coverDropZone.classList.add("error");
    alert(message);

    setTimeout(() => {
      this.coverDropZone.classList.remove("error");
    }, 3000);
  }

  getUploadedCover() {
    return this.uploadedCover;
  }

  getCoverDataURL() {
    if (this.coverImage.src) {
      return this.coverImage.src;
    }
    return null;
  }
}

// ===== DOCUMENT FILE UPLOAD MANAGER =====

class FileUploadManager {
  constructor() {
    this.dropZone = document.getElementById("dropZone");
    this.fileInput = document.getElementById("fileInput");
    this.filePreview = document.getElementById("filePreview");
    this.removeFileBtn = document.getElementById("removeFile");
    this.uploadedFile = null;

    // File constraints
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    this.allowedExtensions = [".pdf", ".doc", ".docx"];

    this.init();
  }

  init() {
    // Click to browse
    this.dropZone.addEventListener("click", () => {
      this.fileInput.click();
    });

    // File input change
    this.fileInput.addEventListener("change", (e) => {
      this.handleFiles(e.target.files);
    });

    // Drag and drop events
    this.dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZone.classList.add("dragover");
    });

    this.dropZone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZone.classList.remove("dragover");
    });

    this.dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZone.classList.remove("dragover");

      const files = e.dataTransfer.files;
      this.handleFiles(files);
    });

    // Remove file button
    this.removeFileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.removeFile();
    });
  }

  handleFiles(files) {
    if (files.length === 0) return;

    const file = files[0];

    // Validate file
    if (!this.validateFile(file)) {
      return;
    }

    this.uploadedFile = file;
    this.showFilePreview(file);
    this.dropZone.style.display = "none";
  }

  validateFile(file) {
    // Check file type
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (
      !this.allowedTypes.includes(file.type) &&
      !this.allowedExtensions.includes(fileExtension)
    ) {
      this.showError("File harus berformat PDF, DOC, atau DOCX!");
      return false;
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      this.showError("Ukuran file maksimal 10MB!");
      return false;
    }

    return true;
  }

  showFilePreview(file) {
    const fileName = document.getElementById("fileName");
    const fileSize = document.getElementById("fileSize");

    fileName.textContent = file.name;
    fileSize.textContent = this.formatFileSize(file.size);

    this.filePreview.style.display = "block";
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  removeFile() {
    this.uploadedFile = null;
    this.fileInput.value = "";
    this.filePreview.style.display = "none";
    this.dropZone.style.display = "block";
    this.dropZone.classList.remove("error");
  }

  showError(message) {
    this.dropZone.classList.add("error");
    alert(message);

    setTimeout(() => {
      this.dropZone.classList.remove("error");
    }, 3000);
  }

  simulateUpload(callback) {
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const uploadProgress = document.getElementById("uploadProgress");

    uploadProgress.style.display = "block";

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 100) progress = 100;

      progressBar.style.setProperty("--progress", progress + "%");
      progressText.textContent = Math.round(progress) + "%";

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          uploadProgress.style.display = "none";
          progressBar.style.setProperty("--progress", "0%");
          if (callback) callback();
        }, 500);
      }
    }, 200);
  }

  getUploadedFile() {
    return this.uploadedFile;
  }

  getFileDataURL() {
    return new Promise((resolve, reject) => {
      if (!this.uploadedFile) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(this.uploadedFile);
    });
  }
}

// ===== JOURNAL MANAGEMENT =====

class JournalManager {
  constructor() {
    this.journalContainer = document.getElementById("journalContainer");
    this.journals = this.loadJournals();
    this.renderJournals();
  }

  loadJournals() {
    const stored = localStorage.getItem("journals");
    if (stored) {
      return JSON.parse(stored);
    }

    // Start with empty array
    return [];
  }

  saveJournals() {
    localStorage.setItem("journals", JSON.stringify(this.journals));
  }

  renderJournals() {
    this.journalContainer.innerHTML = "";

    // Show empty state if no journals
    if (this.journals.length === 0) {
      this.journalContainer.innerHTML = `
                <div class="empty-state">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                    </svg>
                    <h3>Belum Ada Jurnal</h3>
                    <p>Upload jurnal pertama kamu di form di bawah!</p>
                </div>
            `;
      return;
    }

    this.journals.forEach((journal) => {
      const journalItem = this.createJournalElement(journal);
      this.journalContainer.appendChild(journalItem);
    });
  }

  createJournalElement(journal) {
    const div = document.createElement("div");
    div.className = "journal-item";
    div.dataset.id = journal.id;

    const fileExtension = journal.fileName
      ? journal.fileName.split(".").pop().toUpperCase()
      : "PDF";

    // Handle multiple authors
    let authorsText = "";
    if (Array.isArray(journal.author)) {
      authorsText = journal.author.join(", ");
    } else {
      authorsText = journal.author || "Unknown";
    }

    div.innerHTML = `
        <span class="file-badge">${fileExtension}</span>
        <img src="${
          journal.coverImage ||
          "https://via.placeholder.com/150x200/4a5568/ffffff?text=No+Cover"
        }" 
             alt="${journal.title}" 
             class="journal-thumbnail"
             onclick="window.open('${journal.coverImage}', '_blank')">
        <div class="journal-content">
            <div class="journal-meta">${journal.date} • ${authorsText}</div>
            <div class="journal-title">${journal.title}</div>
            <div class="journal-description">${journal.description}</div>
            <div class="journal-actions">
                <button class="btn-download" onclick="journalManager.downloadJournal(${
                  journal.id
                })">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                    Download
                </button>
                <button class="btn-delete" onclick="journalManager.deleteJournal(${
                  journal.id
                })">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    Hapus
                </button>
            </div>
        </div>
    `;
    return div;
  }

  async addJournal(journalData) {
    const newJournal = {
      id: Date.now(),
      coverImage:
        journalData.coverImage ||
        "https://via.placeholder.com/150x200/4a5568/ffffff?text=No+Cover",
      date: this.getCurrentDate(),
      title: journalData.judulJurnal,
      description: journalData.abstrak.substring(0, 100) + "...",
      fileName: journalData.fileName,
      fileData: journalData.fileData,
      author: journalData.namaPenulis,
      email: journalData.email,
      contact: journalData.kontak,
      fullAbstract: journalData.abstrak,
    };

    this.journals.unshift(newJournal);
    this.saveJournals();
    this.renderJournals();

    // Update article count
    if (window.statsManager) {
      window.statsManager.incrementArticleCount();
    }
  }

  deleteJournal(id) {
    if (!confirm("Yakin mau hapus jurnal ini?")) {
      return;
    }

    this.journals = this.journals.filter((j) => j.id !== id);
    this.saveJournals();
    this.renderJournals();

    // Update article count
    if (window.statsManager) {
      window.statsManager.decrementArticleCount();
    }

    alert("Jurnal berhasil dihapus!");
  }

  downloadJournal(id) {
    const journal = this.journals.find((j) => j.id === id);

    if (!journal) {
      alert("Jurnal tidak ditemukan!");
      return;
    }

    if (!journal.fileData) {
      alert(
        "File tidak tersedia untuk diunduh!\n\nCatatan: File yang diupload sebelum fitur download ditambahkan tidak bisa diunduh."
      );
      return;
    }

    // Create download link
    const link = document.createElement("a");
    link.href = journal.fileData;
    link.download = journal.fileName || "jurnal.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("Download dimulai!\n\nFile: " + journal.fileName);
  }

  getCurrentDate() {
    const days = [
      "MINGGU",
      "SENIN",
      "SELASA",
      "RABU",
      "KAMIS",
      "JUMAT",
      "SABTU",
    ];
    const months = [
      "JANUARY",
      "FEBRUARY",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER",
    ];

    const now = new Date();
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    return `${dayName} - ${day} ${month} ${year}`;
  }
}

// ===== SEARCH FUNCTIONALITY =====

class SearchManager {
  constructor() {
    this.searchInput = document.querySelector(".search-box input");
    this.setupSearch();
  }

  setupSearch() {
    this.searchInput.addEventListener("input", (e) => {
      this.filterJournals(e.target.value);
    });
  }

  filterJournals(searchTerm) {
    const term = searchTerm.toLowerCase();
    const journalItems = document.querySelectorAll(".journal-item");

    journalItems.forEach((item) => {
      const title = item
        .querySelector(".journal-title")
        .textContent.toLowerCase();
      const description = item
        .querySelector(".journal-description")
        .textContent.toLowerCase();

      if (title.includes(term) || description.includes(term)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  }
}

// ===== MULTIPLE AUTHORS MANAGER =====

class AuthorsManager {
  constructor() {
    this.authorsContainer = document.getElementById("authorsContainer");
    this.addAuthorBtn = document.getElementById("addAuthorBtn");
    this.authorCount = 1;

    this.init();
  }

  init() {
    // Add author button click
    this.addAuthorBtn.addEventListener("click", () => {
      this.addAuthorField();
    });
  }

  addAuthorField() {
    this.authorCount++;

    const authorGroup = document.createElement("div");
    authorGroup.className = "author-input-group";
    authorGroup.dataset.authorIndex = this.authorCount - 1;

    authorGroup.innerHTML = `
            <input type="text" 
                   class="author-input" 
                   placeholder="Nama Penulis ${this.authorCount}" 
                   ${this.authorCount === 1 ? "required" : ""}>
            <button type="button" class="btn-remove-author">
                <i data-feather="x"></i>
            </button>
        `;

    this.authorsContainer.appendChild(authorGroup);

    // Add remove functionality
    const removeBtn = authorGroup.querySelector(".btn-remove-author");
    removeBtn.addEventListener("click", () => {
      this.removeAuthorField(authorGroup);
    });

    // Replace feather icons
    feather.replace();

    // Update placeholder numbers
    this.updatePlaceholders();
  }

  removeAuthorField(authorGroup) {
    // Prevent removing if only one author left
    const authorGroups = this.authorsContainer.querySelectorAll(
      ".author-input-group"
    );
    if (authorGroups.length <= 1) {
      alert("Minimal harus ada 1 penulis!");
      return;
    }

    authorGroup.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      authorGroup.remove();
      this.authorCount--;
      this.updatePlaceholders();
    }, 300);
  }

  updatePlaceholders() {
    const authorInputs =
      this.authorsContainer.querySelectorAll(".author-input");
    authorInputs.forEach((input, index) => {
      input.placeholder = `Nama Penulis ${index + 1}`;

      // First author is required
      if (index === 0) {
        input.required = true;
      }
    });

    // Show/hide remove buttons
    const removeButtons =
      this.authorsContainer.querySelectorAll(".btn-remove-author");
    removeButtons.forEach((btn, index) => {
      if (index === 0 && authorInputs.length === 1) {
        btn.style.display = "none";
      } else {
        btn.style.display = "flex";
      }
    });
  }

  getAuthors() {
    const authorInputs =
      this.authorsContainer.querySelectorAll(".author-input");
    const authors = [];

    authorInputs.forEach((input) => {
      const value = input.value.trim();
      if (value) {
        authors.push(value);
      }
    });

    return authors;
  }

  clearAuthors() {
    // Remove all except first
    const authorGroups = this.authorsContainer.querySelectorAll(
      ".author-input-group"
    );
    authorGroups.forEach((group, index) => {
      if (index > 0) {
        group.remove();
      }
    });

    // Clear first input
    const firstInput = this.authorsContainer.querySelector(".author-input");
    if (firstInput) {
      firstInput.value = "";
    }

    this.authorCount = 1;
    this.updatePlaceholders();
  }
}

// ===== LOGIN MANAGER =====

class LoginManager {
  constructor() {
    this.loginModal = document.getElementById("loginModal");
    this.loginForm = document.getElementById("loginForm");
    this.loginBtn = document.querySelector(".btn-register");
    this.closeModalBtn = document.getElementById("closeLoginModal");
    this.togglePasswordBtn = document.getElementById("togglePassword");
    this.uploadSection = document.querySelector(".upload-section");

    // Admin credentials (in production, this should be server-side)
    this.adminCredentials = {
      email: "admin@ksmeducation.com",
      password: "admin123",
    };

    this.isLoggedIn = false;

    this.init();
  }

  init() {
    // Check if already logged in
    this.checkLoginStatus();

    // Login button click
    this.loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (this.isLoggedIn) {
        this.logout();
      } else {
        this.openLoginModal();
      }
    });

    // Close modal
    this.closeModalBtn.addEventListener("click", () => {
      this.closeLoginModal();
    });

    // Close modal when clicking overlay
    const overlay = this.loginModal.querySelector(".modal-overlay");
    overlay.addEventListener("click", () => {
      this.closeLoginModal();
    });

    // Toggle password visibility
    this.togglePasswordBtn.addEventListener("click", () => {
      this.togglePasswordVisibility();
    });

    // Form submit
    this.loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Remember me from localStorage
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      document.getElementById("loginEmail").value = rememberedEmail;
      document.getElementById("rememberMe").checked = true;
    }

    // Lock upload section if not logged in
    this.updateUploadSection();
  }

  openLoginModal() {
    this.loginModal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Replace feather icons
    setTimeout(() => {
      feather.replace();
    }, 100);
  }

  closeLoginModal() {
    this.loginModal.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  togglePasswordVisibility() {
    const passwordInput = document.getElementById("loginPassword");
    const icon = this.togglePasswordBtn.querySelector("i");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.setAttribute("data-feather", "eye-off");
    } else {
      passwordInput.type = "password";
      icon.setAttribute("data-feather", "eye");
    }

    feather.replace();
  }

  handleLogin() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    // Validate credentials
    if (
      email === this.adminCredentials.email &&
      password === this.adminCredentials.password
    ) {
      // Save login status
      this.isLoggedIn = true;
      sessionStorage.setItem("adminLoggedIn", "true");

      // Remember email if checkbox is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Update UI
      this.updateLoginButton();
      this.updateUploadSection();
      this.closeLoginModal();

      // Show success message
      alert("✅ Login berhasil!\n\nSelamat datang, Admin!");

      // Reset form
      this.loginForm.reset();
    } else {
      alert("❌ Login gagal!\n\nEmail atau password salah.");
    }
  }

  logout() {
    if (confirm("Yakin mau logout?")) {
      this.isLoggedIn = false;
      sessionStorage.removeItem("adminLoggedIn");

      this.updateLoginButton();
      this.updateUploadSection();

      alert("✅ Logout berhasil!");
    }
  }

  checkLoginStatus() {
    const loggedIn = sessionStorage.getItem("adminLoggedIn");
    if (loggedIn === "true") {
      this.isLoggedIn = true;
      this.updateLoginButton();
      this.updateUploadSection();
    }
  }

  updateLoginButton() {
    if (this.isLoggedIn) {
      this.loginBtn.innerHTML = `
                <i data-feather="log-out"></i>
                LOGOUT
            `;
      this.loginBtn.classList.add("admin-logged-in");
      feather.replace();
    } else {
      this.loginBtn.textContent = "LOGIN";
      this.loginBtn.classList.remove("admin-logged-in");
    }
  }

  updateUploadSection() {
    if (this.isLoggedIn) {
      this.uploadSection.classList.remove("locked");
    } else {
      this.uploadSection.classList.add("locked");
    }
  }

  isAdmin() {
    return this.isLoggedIn;
  }
}

// ===== FORM HANDLER =====

class FormHandler {
  constructor() {
    this.form = document.getElementById("uploadForm");
    this.setupForm();
  }

  setupForm() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  async handleSubmit() {
    if (!window.loginManager.isAdmin()) {
      alert("Harus login sebagai admin untuk upload jurnal!");
      window.loginManager.openLoginModal();
      return;
    }

    // Check if cover is uploaded
    if (!window.coverUploadManager.getUploadedCover()) {
      if (!confirm("Belum upload cover jurnal. Lanjutkan tanpa cover?")) {
        return;
      }
    }

    // Check if file is uploaded
    if (!window.fileUploadManager.getUploadedFile()) {
      alert("Silakan upload file jurnal (PDF/Word) terlebih dahulu!");
      return;
    }

    // Get authors
    const authors = window.authorsManager.getAuthors();

    if (authors.length === 0) {
      alert("Minimal harus ada 1 penulis!");
      return;
    }

    const formData = {
      judulJurnal: document.getElementById("judulJurnal").value,
      namaPenulis: authors, // Array of authors
      email: document.getElementById("email").value,
      kontak: document.getElementById("kontak").value,
      abstrak: document.getElementById("abstrak").value,
      fileName: window.fileUploadManager.getUploadedFile().name,
      coverImage: window.coverUploadManager.getCoverDataURL(),
      fileData: await window.fileUploadManager.getFileDataURL(),
    };

    // Simulate upload with progress bar
    window.fileUploadManager.simulateUpload(async () => {
      // Add journal to list
      if (window.journalManager) {
        await window.journalManager.addJournal(formData);
      }

      const authorsText =
        authors.length > 1
          ? `${authors.length} penulis: ${authors.join(", ")}`
          : authors[0];

      alert(
        "Jurnal berhasil diupload!\n\n" +
          "Judul: " +
          formData.judulJurnal +
          "\n" +
          "Penulis: " +
          authorsText +
          "\n" +
          "File: " +
          formData.fileName
      );

      // Reset form and files
      this.form.reset();
      window.fileUploadManager.removeFile();
      window.coverUploadManager.removeCover();
      window.authorsManager.clearAuthors();
    });
  }
}

// ===== INITIALIZE ALL SYSTEMS =====

document.addEventListener("DOMContentLoaded", () => {
  // Initialize managers
  window.statsManager = new StatisticsManager();
  window.journalManager = new JournalManager();
  window.searchManager = new SearchManager();
  window.coverUploadManager = new CoverUploadManager();
  window.fileUploadManager = new FileUploadManager();
  window.authorsManager = new AuthorsManager();
  window.loginManager = new LoginManager(); // NEW
  window.formHandler = new FormHandler();

  // Update article count after journals are loaded
  setTimeout(() => {
    window.statsManager.updateArticleCount();
    window.statsManager.startCounterAnimation();
  }, 100);

  // Debug console
  console.log("📊 Statistics System Initialized");
  console.log("📁 File Upload System Initialized");
  console.log("🖼️ Cover Upload System Initialized");
  console.log("👥 Authors System Initialized");
  console.log("🔐 Login System Initialized"); // NEW
  console.log("💾 Download System Initialized");
  console.log("\n🔑 Default Admin Login:");
  console.log("   Email: admin@ksmeducation.com");
  console.log("   Password: admin123");
});
