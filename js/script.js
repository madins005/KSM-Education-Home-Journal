// ===== Toast Helper (Global) =====
function showToast(msg, type = "ok") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = "toast" + (type === "error" ? " error" : "");
  t.style.display = "block";
  clearTimeout(window.__toastTimer__);
  window.__toastTimer__ = setTimeout(() => {
    t.style.display = "none";
  }, 2000);
}

// ===== Nav Dropdown Toggle =====
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

// ===== Hash Search Handler =====
function setupHashSearch() {
  if (location.hash === "#search") {
    const search = document.querySelector(".search-box input");
    if (search) {
      setTimeout(() => {
        search.focus();
        search.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }
}

// ===== PREVIEW VIEWER =====
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
      iframe.src = j.fileData;
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
    if (this.searchInput) this.setupSearch();
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
      const title =
        item.querySelector(".journal-title")?.textContent.toLowerCase() || "";
      const description =
        item.querySelector(".journal-description")?.textContent.toLowerCase() ||
        "";
      const tags = item.dataset.tags?.toLowerCase() || "";

      if (
        title.includes(term) ||
        description.includes(term) ||
        tags.includes(term)
      ) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  }
}

// ===== MULTIPLE AUTHORS MANAGER (Support Multi-Instance) =====
class AuthorsManager {
  constructor(suffix = "") {
    this.suffix = suffix;
    this.authorsContainer = document.getElementById(
      `authorsContainer${suffix}`
    );
    this.addAuthorBtn = document.getElementById(`addAuthorBtn${suffix}`);
    this.authorCount = 1;

    if (this.authorsContainer && this.addAuthorBtn) this.init();
  }

  init() {
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

    const removeBtn = authorGroup.querySelector(".btn-remove-author");
    removeBtn.addEventListener("click", () => {
      this.removeAuthorField(authorGroup);
    });

    feather.replace();
    this.updatePlaceholders();
  }

  removeAuthorField(authorGroup) {
    const authorGroups = this.authorsContainer.querySelectorAll(
      ".author-input-group"
    );
    if (authorGroups.length <= 1) {
      alert("Minimal harus ada 1 penulis!");
      return;
    }
    authorGroup.remove();
    this.authorCount--;
    this.updatePlaceholders();
  }

  updatePlaceholders() {
    const authorInputs =
      this.authorsContainer.querySelectorAll(".author-input");
    authorInputs.forEach((input, index) => {
      input.placeholder = `Nama Penulis ${index + 1}`;
      if (index === 0) input.required = true;
    });

    const removeButtons =
      this.authorsContainer.querySelectorAll(".btn-remove-author");
    removeButtons.forEach((btn, index) => {
      btn.style.display =
        index === 0 && authorInputs.length === 1 ? "none" : "flex";
    });
  }

  getAuthors() {
    const authorInputs =
      this.authorsContainer.querySelectorAll(".author-input");
    const authors = [];
    authorInputs.forEach((input) => {
      const value = input.value.trim();
      if (value) authors.push(value);
    });
    return authors;
  }

  clearAuthors() {
    const authorGroups = this.authorsContainer.querySelectorAll(
      ".author-input-group"
    );
    authorGroups.forEach((group, index) => {
      if (index > 0) group.remove();
    });
    const firstInput = this.authorsContainer.querySelector(".author-input");
    if (firstInput) firstInput.value = "";
    this.authorCount = 1;
    this.updatePlaceholders();
  }
}

// ===== EDIT JOURNAL MANAGER =====
class EditJournalManager {
  constructor() {
    this.modal = document.getElementById("editModal");
    this.form = document.getElementById("editForm");
    this.closeBtn = document.getElementById("closeEditModal");
    this.cancelBtn = document.getElementById("cancelEdit");
    this.authorsContainer = document.getElementById("editAuthorsContainer");
    this.addAuthorBtn = document.getElementById("editAddAuthorBtn");
    this.currentJournalId = null;

    if (!this.modal || !this.form) {
      console.warn("Edit modal not found in DOM");
      return;
    }

    this.init();
  }

  init() {
    this.closeBtn?.addEventListener("click", () => this.closeEditModal());
    this.cancelBtn?.addEventListener("click", () => this.closeEditModal());

    this.modal
      .querySelector(".modal-overlay")
      ?.addEventListener("click", () => {
        this.closeEditModal();
      });

    this.addAuthorBtn?.addEventListener("click", () => {
      this.addAuthorField();
    });

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleEditSubmit();
    });

    console.log("✅ EditJournalManager initialized");
  }

  openEditModal(journalId) {
    if (!window.loginManager || !window.loginManager.isAdmin()) {
      alert("Harus login sebagai admin untuk mengedit jurnal!");
      if (window.loginManager) window.loginManager.openLoginModal();
      return;
    }

    let journal = null;

    // Cari di journalManager (index.html)
    if (window.journalManager && window.journalManager.getJournalById) {
      journal = window.journalManager.getJournalById(journalId);
    }

    // Jika tidak ketemu, cari di paginationManager (journals.html)
    if (
      !journal &&
      window.paginationManager &&
      window.paginationManager.journals
    ) {
      journal = window.paginationManager.journals.find(
        (j) => j.id === journalId
      );
    }

    if (!journal) {
      alert("Jurnal tidak ditemukan!");
      return;
    }

    this.currentJournalId = journalId;

    document.getElementById("editJournalId").value = journalId;
    document.getElementById("editJudulJurnal").value = journal.title || "";
    document.getElementById("editEmail").value = journal.email || "";
    document.getElementById("editKontak").value = journal.contact || "";
    document.getElementById("editAbstrak").value =
      journal.fullAbstract || journal.description || "";

    this.populateAuthors(journal.author);

    this.modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeEditModal() {
    this.modal.classList.remove("active");
    document.body.style.overflow = "auto";
    this.currentJournalId = null;
    this.form.reset();
  }

  populateAuthors(authors) {
    this.authorsContainer.innerHTML = "";

    if (!Array.isArray(authors)) {
      authors = [authors || ""];
    }

    authors.forEach((author, index) => {
      const authorGroup = document.createElement("div");
      authorGroup.className = "author-input-group";
      authorGroup.dataset.authorIndex = index;

      authorGroup.innerHTML = `
        <input type="text" 
               class="author-input" 
               placeholder="Nama Penulis ${index + 1}" 
               value="${author}"
               ${index === 0 ? "required" : ""}>
        <button type="button" class="btn-remove-author" style="display: ${
          index === 0 && authors.length === 1 ? "none" : "flex"
        }">
          <i data-feather="x"></i>
        </button>
      `;

      this.authorsContainer.appendChild(authorGroup);

      const removeBtn = authorGroup.querySelector(".btn-remove-author");
      removeBtn.addEventListener("click", () => {
        this.removeAuthorField(authorGroup);
      });
    });

    if (typeof feather !== "undefined") {
      feather.replace();
    }
  }

  addAuthorField() {
    const authorGroups = this.authorsContainer.querySelectorAll(
      ".author-input-group"
    );
    const nextIndex = authorGroups.length;

    const authorGroup = document.createElement("div");
    authorGroup.className = "author-input-group";
    authorGroup.dataset.authorIndex = nextIndex;

    authorGroup.innerHTML = `
      <input type="text" 
             class="author-input" 
             placeholder="Nama Penulis ${nextIndex + 1}">
      <button type="button" class="btn-remove-author">
        <i data-feather="x"></i>
      </button>
    `;

    this.authorsContainer.appendChild(authorGroup);

    const removeBtn = authorGroup.querySelector(".btn-remove-author");
    removeBtn.addEventListener("click", () => {
      this.removeAuthorField(authorGroup);
    });

    if (typeof feather !== "undefined") {
      feather.replace();
    }

    this.updateAuthorButtons();
  }

  removeAuthorField(authorGroup) {
    const authorGroups = this.authorsContainer.querySelectorAll(
      ".author-input-group"
    );
    if (authorGroups.length <= 1) {
      alert("Minimal harus ada 1 penulis!");
      return;
    }
    authorGroup.remove();
    this.updateAuthorButtons();
  }

  updateAuthorButtons() {
    const authorGroups = this.authorsContainer.querySelectorAll(
      ".author-input-group"
    );
    authorGroups.forEach((group, index) => {
      const removeBtn = group.querySelector(".btn-remove-author");
      if (removeBtn) {
        removeBtn.style.display =
          index === 0 && authorGroups.length === 1 ? "none" : "flex";
      }

      const input = group.querySelector(".author-input");
      if (input) {
        input.placeholder = `Nama Penulis ${index + 1}`;
        input.required = index === 0;
      }
    });
  }

  handleEditSubmit() {
    const capitalize = (str) => {
      return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const authors = this.getAuthors();

    if (authors.length === 0) {
      alert("Minimal harus ada 1 penulis!");
      return;
    }

    const judul = document.getElementById("editJudulJurnal").value.trim();
    const abstrak = document.getElementById("editAbstrak").value.trim();

    const updatedData = {
      title: capitalize(judul),
      author: authors.map((a) => capitalize(a)),
      email: document.getElementById("editEmail").value,
      contact: document.getElementById("editKontak").value,
      fullAbstract: capitalize(abstrak),
      description: capitalize(abstrak.substring(0, 100)) + "...",
    };

    if (window.journalManager && window.journalManager.updateJournal) {
      window.journalManager.updateJournal(this.currentJournalId, updatedData);
    }

    if (window.paginationManager && window.paginationManager.journals) {
      const index = window.paginationManager.journals.findIndex(
        (j) => j.id === this.currentJournalId
      );
      if (index > -1) {
        window.paginationManager.journals[index] = {
          ...window.paginationManager.journals[index],
          ...updatedData,
        };
        localStorage.setItem(
          "journals",
          JSON.stringify(window.paginationManager.journals)
        );
        window.paginationManager.render();
        alert("Jurnal berhasil diupdate!");
      }
    }

    this.closeEditModal();
  }

  getAuthors() {
    const authorInputs =
      this.authorsContainer.querySelectorAll(".author-input");
    const authors = [];
    authorInputs.forEach((input) => {
      const value = input.value.trim();
      if (value) authors.push(value);
    });
    return authors;
  }
}

// ===== LOGIN STATUS SYNC =====
function syncLoginStatusUI() {
  const isLoggedIn = sessionStorage.getItem("userLoggedIn") === "true";
  const isAdmin = sessionStorage.getItem("userType") === "admin";

  // Dispatch custom event untuk notify semua manager
  window.dispatchEvent(
    new CustomEvent("loginStatusChanged", {
      detail: { isLoggedIn, isAdmin },
    })
  );

  // Re-render journal jika ada
  if (
    window.journalManager &&
    typeof window.journalManager.renderJournals === "function"
  ) {
    window.journalManager.renderJournals();
  }

  // Re-render pagination jika ada
  if (
    window.paginationManager &&
    typeof window.paginationManager.render === "function"
  ) {
    window.paginationManager.render();
  }
}

// Listen untuk login status changes
window.addEventListener("adminLoginStatusChanged", syncLoginStatusUI);

// ===== INITIALIZE ALL SYSTEMS =====
// ===== INITIALIZE ALL SYSTEMS =====
document.addEventListener("DOMContentLoaded", () => {
  setupNavDropdown();
  setupHashSearch();

  if (typeof LoginManager !== "undefined") {
    window.loginManager = new LoginManager();
  }

  if (document.getElementById("journalFullContainer")) {
    // UNTUK HALAMAN journals.html
    if (typeof EditJournalManager !== "undefined")
      window.editJournalManager = new EditJournalManager();
    if (typeof PaginationManager !== "undefined")
      window.paginationManager = new PaginationManager();
    window.previewViewer = new PreviewViewer();
    console.log("Journals page systems initialized");

    // SYNC LOGIN STATUS UNTUK RENDER TOMBOL
    syncLoginStatusUI();
    return;
  }

  if (document.getElementById("opinionsContainer")) {
    if (typeof OpinionsPageManager !== "undefined") {
      window.opinionsPageManager = new OpinionsPageManager();
      console.log("Opinions page systems initialized");
    }
    return;
  }

  // UNTUK HALAMAN dashboard_admin.html DAN index.html
  if (typeof StatisticsManager !== "undefined")
    window.statsManager = new StatisticsManager();
  if (typeof JournalManager !== "undefined")
    window.journalManager = new JournalManager();
  if (typeof OpinionManager !== "undefined")
    window.opinionManager = new OpinionManager();
  if (typeof SearchManager !== "undefined")
    window.searchManager = new SearchManager();
  if (typeof UploadTabsManager !== "undefined")
    window.uploadTabsManager = new UploadTabsManager();
  if (typeof DualUploadHandler !== "undefined")
    window.dualUploadHandler = new DualUploadHandler();
  if (typeof EditJournalManager !== "undefined")
    window.editJournalManager = new EditJournalManager();

  window.previewViewer = new PreviewViewer();

  if (window.loginManager) {
    window.loginManager.syncLoginStatus();
  }

  if (window.statsManager) {
    setTimeout(() => {
      window.statsManager.updateArticleCount();
      window.statsManager.startCounterAnimation();
    }, 100);
  }

  // SYNC LOGIN STATUS UNTUK RENDER TOMBOL DI ADMIN
  syncLoginStatusUI();

  console.log("✅ All systems initialized successfully");
});
