// ===== Nav Dropdown Toggle =====
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-dropdown").forEach((dd) => {
    const btn = dd.querySelector(".nav-link.has-caret");
    const menu = dd.querySelector(".dropdown-menu");

    if (!btn || !menu) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // tutup yang lain
      document.querySelectorAll(".nav-dropdown.open").forEach((x) => {
        if (x !== dd) x.classList.remove("open");
      });
      dd.classList.toggle("open");
    });
  });

  // klik di luar untuk menutup
  document.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-dropdown.open")
      .forEach((x) => x.classList.remove("open"));
  });
});

document.addEventListener("DOMContentLoaded", () => {
  if (location.hash === "#search") {
    const search = document.querySelector(".search-box input");
    if (search) {
      search.focus();
      search.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
});

class PreviewViewer {
  constructor() {
    this.modal = document.getElementById("previewModal");
    this.body = document.getElementById("previewBody");
    this.title = document.getElementById("previewTitle");
    this.info = document.getElementById("previewInfo");
    this.closeBtn = document.getElementById("closePreviewModal");
    this.currentId = null;

    if (!this.modal || !this.body) return;

    const overlay = this.modal.querySelector(".modal-overlay");
    overlay?.addEventListener("click", () => this.close());
    this.closeBtn?.addEventListener("click", () => this.close());
  }

  openById(id) {
    this.currentId = id;
    const journal = this.resolveJournal(id);
    if (!journal) {
      alert("Jurnal tidak ditemukan!");
      return;
    }
    this.openWithJournal(journal);
  }

  resolveJournal(id) {
    const idNum = Number(id);
    if (window.journalManager?.journals) {
      const j = window.journalManager.journals.find((x) => x.id === idNum);
      if (j) return j;
    }
    if (window.paginationManager?.journals) {
      const j = window.paginationManager.journals.find((x) => x.id === idNum);
      if (j) return j;
    }
    try {
      const list = JSON.parse(localStorage.getItem("journals") || "[]");
      return list.find((x) => x.id === idNum) || null;
    } catch {
      return null;
    }
  }

  openWithJournal(j) {
    this.title.textContent = j.title || "Untitled";
    const authorsText = Array.isArray(j.author)
      ? j.author.join(", ")
      : j.author || "Unknown";
    this.info.textContent = `${j.date || ""} • ${authorsText}`;
    this.body.innerHTML = "";

    const ext = (j.fileName || "").split(".").pop().toLowerCase();
    const canPreviewPDF = !!j.fileData && ext === "pdf";
    const canPreviewImage =
      !!j.coverImage && /^data:image\//.test(j.coverImage);

    if (canPreviewPDF) {
      const iframe = document.createElement("iframe");
      iframe.src = j.fileData; // data:application/pdf;base64,...
      this.body.appendChild(iframe);
    } else if (canPreviewImage) {
      const img = document.createElement("img");
      img.src = j.coverImage;
      this.body.appendChild(img);
    } else {
      const box = document.createElement("div");
      box.className = "preview-fallback";
      box.innerHTML = `
        <div>Preview tidak tersedia untuk tipe file ini (${
          ext || "unknown"
        }).</div>
        <div class="hint">Gunakan menu Download di kartu/list untuk mengunduh file.</div>
      `;
      this.body.appendChild(box);
    }

    this.open();
  }

  open() {
    this.modal.classList.add("active");
    document.body.style.overflow = "hidden";
    try {
      feather.replace();
    } catch {}
  }

  close() {
    this.modal.classList.remove("active");
    document.body.style.overflow = "auto";
    this.currentId = null;
    this.body.innerHTML = "";
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

// ===== INITIALIZE ALL SYSTEMS =====

document.addEventListener("DOMContentLoaded", () => {
  window.loginManager = new LoginManager();

  // Initialize pagination jika di halaman journals
  if (document.getElementById("journalFullContainer")) {
    // Initialize EditJournalManager untuk journals page
    window.editJournalManager = new EditJournalManager();
    window.paginationManager = new PaginationManager();

    window.previewViewer = new PreviewViewer();
    console.log("Journals page systems initialized");
    return;
  }

  // Initialize managers
  window.statsManager = new StatisticsManager();
  window.journalManager = new JournalManager();
  window.searchManager = new SearchManager();
  window.coverUploadManager = new CoverUploadManager();
  window.fileUploadManager = new FileUploadManager();
  window.authorsManager = new AuthorsManager();
  window.editJournalManager = new EditJournalManager();
  window.formHandler = new FormHandler();
  window.previewViewer = new PreviewViewer();

  // Sync login status
  if (window.loginManager) {
    window.loginManager.syncLoginStatus();
  }

  // Update article count
  if (window.statsManager) {
    setTimeout(() => {
      window.statsManager.updateArticleCount();
      window.statsManager.startCounterAnimation();
    }, 100);
  }

  // Debug console
  console.log("Statistics System Initialized");
  console.log("File Upload System Initialized");
  console.log("Cover Upload System Initialized");
  console.log("Authors System Initialized");
  console.log("Login System Initialized");
  console.log("Edit Journal System Initialized");
  console.log("Download System Initialized");
  console.log("Pagination System Initialized");
  console.log("\nDefault Admin Login:");
});
