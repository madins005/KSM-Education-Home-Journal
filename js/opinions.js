// ===== OPINIONS PAGE MANAGER =====
class OpinionsPageManager {
  constructor() {
    this.container = document.getElementById("opinionsContainer");
    this.opinionsPerPage = 12;
    this.currentPage = 1;
    this.opinions = this.loadOpinions();
    this.filteredOpinions = [...this.opinions];
    this.currentFilter = "all";
    this.currentSort = "newest";

    console.log(
      "OpinionsPageManager initialized with",
      this.opinions.length,
      "opinions"
    );

    this.init();
  }

  init() {
    if (!this.container) {
      console.warn("Opinions container not found!");
      return;
    }

    this.render();
    this.setupSort();
    this.setupSearch();
    this.renderPagination();

    window.addEventListener("storage", (e) => {
      if (e.key === "opinions") {
        console.log("Storage changed, reloading opinions...");
        this.opinions = this.loadOpinions();
        this.applyFiltersAndSort();
      }
    });

    window.addEventListener("opinions:changed", () => {
      console.log("Opinions changed event triggered");
      this.opinions = this.loadOpinions();
      this.applyFiltersAndSort();
    });
  }

  loadOpinions() {
    const stored = localStorage.getItem("opinions");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        console.log("Loaded", data.length, "opinions from localStorage");
        return data;
      } catch (e) {
        console.error("Error parsing opinions:", e);
        return [];
      }
    }
    console.log("No opinions found in localStorage");
    return [];
  }

  render() {
    if (!this.container) return;

    if (this.filteredOpinions.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <svg fill="currentColor" viewBox="0 0 24 24" width="64" height="64">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
          </svg>
          <h3>Belum Ada Artikel Opini</h3>
          <p>Artikel opini akan muncul di sini setelah admin mengupload</p>
        </div>
      `;
      return;
    }

    const start = (this.currentPage - 1) * this.opinionsPerPage;
    const end = start + this.opinionsPerPage;
    const paginatedOpinions = this.filteredOpinions.slice(start, end);

    console.log("Rendering", paginatedOpinions.length, "opinions");

    this.container.innerHTML = paginatedOpinions
      .map(
        (opinion) => `
      <div class="opinion-card">
        <div class="opinion-image" onclick="window.previewViewer?.openById(${
          opinion.id
        })" style="cursor: pointer;">
          <img src="${
            opinion.coverImage ||
            "https://via.placeholder.com/320x200/4a5568/ffffff?text=No+Cover"
          }" alt="${opinion.title}" loading="lazy" />
          <span class="file-badge">${this.getFileExtension(
            opinion.fileName
          )}</span>
        </div>
        <div class="opinion-content">
          <div class="opinion-meta">
            <span class="opinion-author">${this.formatAuthors(
              opinion.author
            )}</span>
            <span class="opinion-date">${opinion.date || "No date"}</span>
          </div>
          <h3 class="opinion-title">${opinion.title}</h3>
          <p class="opinion-excerpt">${opinion.description}</p>
          <div class="opinion-footer">
            <button class="btn-download" onclick="opinionsPageManager.downloadOpinion(${
              opinion.id
            })">
              <i data-feather="download"></i>
              Download
            </button>
            <button class="btn-preview" onclick="window.previewViewer?.openById(${
              opinion.id
            })">
              <i data-feather="eye"></i>
              Preview
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    if (typeof feather !== "undefined") {
      feather.replace();
    }
  }

  getFileExtension(fileName) {
    return fileName ? fileName.split(".").pop().toUpperCase() : "PDF";
  }

  formatAuthors(author) {
    if (Array.isArray(author)) {
      return author.join(", ");
    }
    return author || "Unknown";
  }

  setupFilters() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    if (filterBtns.length === 0) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.currentFilter = e.target.dataset.filter;
        this.applyFiltersAndSort();
      });
    });
  }

  setupSort() {
    const sortSelect = document.getElementById("sortOpinions");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.currentSort = e.target.value;
        this.applyFiltersAndSort();
      });
    }
  }

  setupSearch() {
    const searchInput = document.querySelector(".search-box input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        this.filteredOpinions = this.opinions.filter(
          (op) =>
            op.title.toLowerCase().includes(term) ||
            (op.author &&
              (Array.isArray(op.author)
                ? op.author.join(" ").toLowerCase().includes(term)
                : op.author.toLowerCase().includes(term))) ||
            (op.description && op.description.toLowerCase().includes(term))
        );
        this.currentPage = 1;
        this.render();
        this.renderPagination();
      });
    }
  }

  applyFiltersAndSort() {
    this.filteredOpinions = [...this.opinions];

    if (this.currentSort === "newest") {
      this.filteredOpinions.sort((a, b) => b.id - a.id);
    } else if (this.currentSort === "oldest") {
      this.filteredOpinions.sort((a, b) => a.id - b.id);
    } else if (this.currentSort === "title") {
      this.filteredOpinions.sort((a, b) => a.title.localeCompare(b.title));
    }

    this.currentPage = 1;
    this.render();
    this.renderPagination();
  }

  renderPagination() {
    const paginationContainer = document.getElementById("paginationContainer");
    if (!paginationContainer) return;

    const totalPages = Math.ceil(
      this.filteredOpinions.length / this.opinionsPerPage
    );

    if (totalPages <= 1) {
      paginationContainer.innerHTML = "";
      return;
    }

    let html = '<div class="pagination-buttons">';

    // Previous button
    html += `<button class="pagination-btn ${
      this.currentPage === 1 ? "disabled" : ""
    }" onclick="opinionsPageManager.goToPage(${this.currentPage - 1})" ${
      this.currentPage === 1 ? "disabled" : ""
    }>
      <i data-feather="chevron-left"></i>
    </button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= this.currentPage - 1 && i <= this.currentPage + 1)
      ) {
        html += `<button class="pagination-btn ${
          i === this.currentPage ? "active" : ""
        }" onclick="opinionsPageManager.goToPage(${i})">${i}</button>`;
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        html += `<span class="pagination-dots">...</span>`;
      }
    }

    // Next button
    html += `<button class="pagination-btn ${
      this.currentPage === totalPages ? "disabled" : ""
    }" onclick="opinionsPageManager.goToPage(${this.currentPage + 1})" ${
      this.currentPage === totalPages ? "disabled" : ""
    }>
      <i data-feather="chevron-right"></i>
    </button>`;

    html += "</div>";
    paginationContainer.innerHTML = html;

    if (typeof feather !== "undefined") {
      feather.replace();
    }
  }

  goToPage(page) {
    const totalPages = Math.ceil(
      this.filteredOpinions.length / this.opinionsPerPage
    );
    if (page > 0 && page <= totalPages) {
      this.currentPage = page;
      this.render();
      this.renderPagination();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  downloadOpinion(id) {
    const opinion = this.opinions.find((o) => o.id === id);

    if (!opinion) {
      alert("Artikel opini tidak ditemukan!");
      return;
    }

    if (!opinion.fileData) {
      alert("File tidak tersedia untuk diunduh!");
      return;
    }

    const link = document.createElement("a");
    link.href = opinion.fileData;
    link.download = opinion.fileName || "opini.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("Download dimulai!\n\nFile: " + opinion.fileName);
  }
}

// Initialize saat page load
(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initOpinionsPage);
  } else {
    initOpinionsPage();
  }

  function initOpinionsPage() {
    if (document.getElementById("opinionsContainer")) {
      window.opinionsPageManager = new OpinionsPageManager();
      console.log("OpinionsPageManager initialized on opinions.html");
    }
  }
})();

console.log("opinions.js loaded");
