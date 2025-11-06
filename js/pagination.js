// ===== PAGINATION MANAGER =====

class PaginationManager {
  constructor() {
    this.journalsPerPage = 10;
    this.currentPage = 1;
    this.journals = this.loadJournals();
    this.totalPages = Math.ceil(this.journals.length / this.journalsPerPage);
    this.searchTerm = "";

    // Check if we're on the journals.html page
    if (document.getElementById("journalFullContainer")) {
      this.init();
    }
  }

  init() {
    this.setupEventListeners();
    this.render();

    // Sync login status setelah LoginManager siap
    setTimeout(() => {
      if (window.loginManager) {
        this.syncLoginStatus();
      }
    }, 50);

    // Listen for login status changes
    window.addEventListener("adminLoginStatusChanged", () => {
      this.syncLoginStatus();
    });

    // di init() atau setelah this.journals terisi
    const params = new URLSearchParams(location.search);
    const sort = params.get("sort");
    if (sort) {
      this.sortJournals(sort); // 'newest' | 'oldest' | 'title'
      this.currentPage = 1;
      this.render();
    }
  }

  loadJournals() {
    const stored = localStorage.getItem("journals");
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  setupEventListeners() {
    // Sort filter
    const sortFilter = document.getElementById("sortFilter");
    if (sortFilter) {
      sortFilter.addEventListener("change", (e) => {
        this.sortJournals(e.target.value);
        this.currentPage = 1;
        this.render();
      });
    }

    // Search functionality
    const searchInput = document.querySelector(".search-box input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.currentPage = 1;
        this.render();
      });
    }
  }

  syncLoginStatus() {
    if (!window.loginManager) {
      console.warn("LoginManager belum siap");
      return;
    }

    window.loginManager.checkLoginStatus();
    window.loginManager.updateLoginButton();
    console.log("Login status synced in pagination");
  }

  sortJournals(sortBy) {
    const journalsCopy = [...this.journals];

    switch (sortBy) {
      case "newest":
        this.journals = journalsCopy.sort((a, b) => b.id - a.id);
        break;
      case "oldest":
        this.journals = journalsCopy.sort((a, b) => a.id - b.id);
        break;
      case "title":
        this.journals = journalsCopy.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        break;
      default:
        break;
    }
  }

  filterJournals() {
    if (!this.searchTerm) {
      return this.journals;
    }

    return this.journals.filter((journal) => {
      const title = journal.title.toLowerCase();
      const description = journal.description.toLowerCase();
      const authorsText = Array.isArray(journal.author)
        ? journal.author.join(" ").toLowerCase()
        : (journal.author || "").toLowerCase();

      return (
        title.includes(this.searchTerm) ||
        description.includes(this.searchTerm) ||
        authorsText.includes(this.searchTerm)
      );
    });
  }

  render() {
    this.renderJournals();
    this.renderPagination();
    this.updateStats();
  }

  renderJournals() {
    const container = document.getElementById("journalFullContainer");

    if (!container) {
      console.error("journalFullContainer tidak ditemukan");
      return;
    }

    container.innerHTML = "";

    const filteredJournals = this.filterJournals();

    if (!filteredJournals || filteredJournals.length === 0) {
      container.innerHTML = `
      <div class="empty-state">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
        </svg>
        <h3>${
          this.searchTerm ? "Tidak ada hasil pencarian" : "Tidak ada jurnal"
        }</h3>
        <p>${
          this.searchTerm
            ? "Coba cari dengan kata kunci lain"
            : "Tidak ada jurnal yang ditemukan"
        }</p>
      </div>
    `;
      return;
    }

    this.totalPages = Math.ceil(filteredJournals.length / this.journalsPerPage);

    const startIndex = (this.currentPage - 1) * this.journalsPerPage;
    const endIndex = startIndex + this.journalsPerPage;
    const journalsToDisplay = filteredJournals.slice(startIndex, endIndex);

    journalsToDisplay.forEach((journal) => {
      try {
        const journalItem = this.createJournalElement(journal);
        container.appendChild(journalItem);
      } catch (error) {
        console.error("Error creating journal element:", error, journal);
      }
    });
  }

  createJournalElement(journal) {
    const div = document.createElement("div");
    div.className = "journal-item";
    div.dataset.id = journal.id;

    const fileExtension = journal.fileName
      ? journal.fileName.split(".").pop().toUpperCase()
      : "PDF";

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
        "https://via.placeholder.com/140x180/4a5568/ffffff?text=No+Cover"
      }" 
           alt="${journal.title}" 
           class="journal-thumbnail"
           onclick="window.previewViewer && window.previewViewer.openById(${
             journal.id
           })">
      <div class="journal-content">
        <div class="journal-meta">${journal.date} • ${authorsText}</div>
        <div class="journal-title">${journal.title}</div>
        <div class="journal-description">${journal.description}</div>
        <div class="journal-actions">
          <button class="btn-download" onclick="paginationManager.downloadJournal(${
            journal.id
          })">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Download
          </button>
          <button class="btn-edit" onclick="paginationManager.editJournal(${
            journal.id
          })">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            Edit
          </button>
          <button class="btn-delete" onclick="paginationManager.deleteJournal(${
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

  renderPagination() {
    const container = document.getElementById("paginationContainer");
    container.innerHTML = "";

    const filteredJournals = this.filterJournals();
    const totalPages = Math.ceil(
      filteredJournals.length / this.journalsPerPage
    );

    if (totalPages <= 1) {
      return;
    }

    if (this.currentPage > 1) {
      const prevBtn = document.createElement("button");
      prevBtn.className = "pagination-item";
      prevBtn.textContent = "Sebelumnya";
      prevBtn.onclick = () => {
        this.currentPage--;
        this.render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
      container.appendChild(prevBtn);
    }

    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = "pagination-item";
      if (i === this.currentPage) {
        pageBtn.classList.add("active");
      }
      pageBtn.textContent = i;
      pageBtn.onclick = () => {
        this.currentPage = i;
        this.render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
      container.appendChild(pageBtn);
    }

    if (this.currentPage < totalPages) {
      const nextBtn = document.createElement("button");
      nextBtn.className = "pagination-item";
      nextBtn.textContent = "Selanjutnya";
      nextBtn.onclick = () => {
        this.currentPage++;
        this.render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
      container.appendChild(nextBtn);
    }
  }

  updateStats() {
    const filteredJournals = this.filterJournals();
    const totalElement = document.getElementById("totalJournals");
    if (totalElement) {
      if (this.searchTerm) {
        totalElement.textContent = filteredJournals.length;
      } else {
        totalElement.textContent = this.journals.length;
      }
    }
  }

  downloadJournal(id) {
    const journal = this.journals.find((j) => j.id === id);

    if (!journal) {
      alert("Jurnal tidak ditemukan!");
      return;
    }

    if (!journal.fileData) {
      alert("File tidak tersedia untuk diunduh!");
      return;
    }

    const link = document.createElement("a");
    link.href = journal.fileData;
    link.download = journal.fileName || "jurnal.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("Download dimulai!\n\nFile: " + journal.fileName);
  }

  editJournal(id) {
    // Cek admin login
    if (!window.loginManager || !window.loginManager.isAdmin()) {
      alert("Harus login sebagai admin untuk mengedit jurnal!");
      if (window.loginManager) window.loginManager.openLoginModal();
      return;
    }

    if (window.editJournalManager) {
      window.editJournalManager.openEditModal(id);
    }
  }

  deleteJournal(id) {
    // Cek admin login
    if (!window.loginManager || !window.loginManager.isAdmin()) {
      alert("Harus login sebagai admin untuk menghapus jurnal!");
      if (window.loginManager) window.loginManager.openLoginModal();
      return;
    }

    if (!confirm("Yakin mau hapus jurnal ini?")) return;

    const index = this.journals.findIndex((j) => j.id === id);
    if (index > -1) {
      this.journals.splice(index, 1);
      localStorage.setItem("journals", JSON.stringify(this.journals));
      window.dispatchEvent(new Event("journals:changed"));
      this.render();
      alert("Jurnal berhasil dihapus!");
    }
  }

  updateJournal(id, updatedData) {
    const index = this.journals.findIndex((j) => j.id === id);

    if (index === -1) {
      alert("Jurnal tidak ditemukan!");
      return;
    }

    // Update journal data
    this.journals[index] = {
      ...this.journals[index],
      title: updatedData.judulJurnal,
      description: updatedData.abstrak.substring(0, 100) + "...",
      author: updatedData.namaPenulis,
      email: updatedData.email,
      contact: updatedData.kontak,
      fullAbstract: updatedData.abstrak,
    };

    // Save ke localStorage
    localStorage.setItem("journals", JSON.stringify(this.journals));

    // Re-render untuk update tampilan
    this.render();

    alert("Jurnal berhasil diupdate!");
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("journalFullContainer")) {
    window.paginationManager = new PaginationManager();
  }
});
