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

    return [];
  }

  saveJournals() {
    localStorage.setItem("journals", JSON.stringify(this.journals));
    window.dispatchEvent(new Event("journals:changed"));
  }

  renderJournals() {
    this.journalContainer.innerHTML = "";

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

    // Display only first 5 journals on homepage
    const displayCount = 5;
    const journalsToDisplay = this.journals.slice(0, displayCount);

    journalsToDisplay.forEach((journal) => {
      const journalItem = this.createJournalElement(journal);
      this.journalContainer.appendChild(journalItem);
    });

    // Show "View All" button if more than 5 journals
    const viewAllContainer = document.getElementById("viewAllContainer");
    if (viewAllContainer) {
      if (this.journals.length > displayCount) {
        viewAllContainer.style.display = "block";
      } else {
        viewAllContainer.style.display = "none";
      }
    }
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
        "https://via.placeholder.com/150x200/4a5568/ffffff?text=No+Cover"
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
          <button class="btn-download" onclick="journalManager.downloadJournal(${
            journal.id
          })">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Download
          </button>
          <button class="btn-edit" onclick="journalManager.editJournal(${
            journal.id
          })">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            Edit
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

    if (window.statsManager) {
      window.statsManager.incrementArticleCount();
    }
  }

  editJournal(id) {
    // Check if admin is logged in
    if (!window.loginManager || !window.loginManager.isAdmin()) {
      alert("Harus login sebagai admin untuk mengedit jurnal!");
      if (window.loginManager) {
        window.loginManager.openLoginModal();
      }
      return;
    }

    const journal = this.journals.find((j) => j.id === id);

    if (!journal) {
      alert("Jurnal tidak ditemukan!");
      return;
    }

    // Open edit modal with journal data
    if (window.editJournalManager) {
      window.editJournalManager.openEditModal(journal);
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

    this.saveJournals();
    this.renderJournals();

    alert("Jurnal berhasil diupdate!");
  }

  deleteJournal(id) {
    // Check if admin is logged in
    if (!window.loginManager || !window.loginManager.isAdmin()) {
      alert("Harus login sebagai admin untuk menghapus jurnal!");
      if (window.loginManager) {
        window.loginManager.openLoginModal();
      }
      return;
    }

    if (!confirm("Yakin mau hapus jurnal ini?")) {
      return;
    }

    this.journals = this.journals.filter((j) => j.id !== id);
    this.saveJournals();
    this.renderJournals();

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

// ===== EDIT JOURNAL MANAGER =====

class EditJournalManager {
  constructor() {
    this.editModal = document.getElementById("editModal");
    this.editForm = document.getElementById("editForm");
    this.closeModalBtn = document.getElementById("closeEditModal");
    this.cancelBtn = document.getElementById("cancelEdit");
    this.editAuthorsContainer = document.getElementById("editAuthorsContainer");
    this.addAuthorBtn = document.getElementById("editAddAuthorBtn");
    this.authorCount = 0;
    this.currentJournalId = null;

    this.init();
  }

  init() {
    // Close modal
    this.closeModalBtn.addEventListener("click", () => {
      this.closeEditModal();
    });

    this.cancelBtn.addEventListener("click", () => {
      this.closeEditModal();
    });

    // Close modal when clicking overlay
    const overlay = this.editModal.querySelector(".modal-overlay");
    overlay.addEventListener("click", () => {
      this.closeEditModal();
    });

    // Add author button
    this.addAuthorBtn.addEventListener("click", () => {
      this.addAuthorField();
    });

    // Form submit
    this.editForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleUpdate();
    });
  }

  openEditModal(journal) {
    this.currentJournalId = journal.id;

    // Populate form
    const editJournalIdInput = document.getElementById("editJournalId");
    if (editJournalIdInput) {
      editJournalIdInput.value = journal.id;
    }

    const editJudulInput = document.getElementById("editJudulJurnal");
    if (editJudulInput) {
      editJudulInput.value = journal.title;
    }

    const editEmailInput = document.getElementById("editEmail");
    if (editEmailInput) {
      editEmailInput.value = journal.email;
    }

    const editKontakInput = document.getElementById("editKontak");
    if (editKontakInput) {
      editKontakInput.value = journal.contact;
    }

    const editAbstrakInput = document.getElementById("editAbstrak");
    if (editAbstrakInput) {
      editAbstrakInput.value = journal.fullAbstract;
    }

    // Clear and populate authors
    this.editAuthorsContainer.innerHTML = "";
    this.authorCount = 0;

    const authors = Array.isArray(journal.author)
      ? journal.author
      : [journal.author];

    authors.forEach((author, index) => {
      this.addAuthorField(author);
    });

    // Show modal
    if (!this.editModal) {
      console.error("editModal tidak ditemukan");
      return;
    }

    this.editModal.classList.add("active");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      feather.replace();
    }, 100);
  }

  closeEditModal() {
    if (!this.editModal) {
      return;
    }

    this.editModal.classList.remove("active");
    document.body.style.overflow = "auto";

    const editForm = document.getElementById("editForm");
    if (editForm) {
      editForm.reset();
    }

    this.editAuthorsContainer.innerHTML = "";
    this.authorCount = 0;
    this.currentJournalId = null;
  }

  addAuthorField(value = "") {
    this.authorCount++;

    const authorGroup = document.createElement("div");
    authorGroup.className = "author-input-group";
    authorGroup.dataset.authorIndex = this.authorCount - 1;

    authorGroup.innerHTML = `
      <input type="text" 
             class="author-input" 
             placeholder="Nama Penulis ${this.authorCount}" 
             value="${value}"
             ${this.authorCount === 1 ? "required" : ""}>
      <button type="button" class="btn-remove-author">
        <i data-feather="x"></i>
      </button>
    `;

    this.editAuthorsContainer.appendChild(authorGroup);

    const removeBtn = authorGroup.querySelector(".btn-remove-author");
    removeBtn.addEventListener("click", () => {
      this.removeAuthorField(authorGroup);
    });

    feather.replace();
    this.updatePlaceholders();
  }

  removeAuthorField(authorGroup) {
    const authorGroups = this.editAuthorsContainer.querySelectorAll(
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
      this.editAuthorsContainer.querySelectorAll(".author-input");
    authorInputs.forEach((input, index) => {
      input.placeholder = `Nama Penulis ${index + 1}`;

      if (index === 0) {
        input.required = true;
      }
    });

    const removeButtons =
      this.editAuthorsContainer.querySelectorAll(".btn-remove-author");
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
      this.editAuthorsContainer.querySelectorAll(".author-input");
    const authors = [];

    authorInputs.forEach((input) => {
      const value = input.value.trim();
      if (value) {
        authors.push(value);
      }
    });

    return authors;
  }

  handleUpdate() {
    const authors = this.getAuthors();

    if (authors.length === 0) {
      alert("Minimal harus ada 1 penulis!");
      return;
    }

    const updatedData = {
      judulJurnal: document.getElementById("editJudulJurnal").value,
      namaPenulis: authors,
      email: document.getElementById("editEmail").value,
      kontak: document.getElementById("editKontak").value,
      abstrak: document.getElementById("editAbstrak").value,
    };

    // Update di JournalManager (untuk index.html)
    if (window.journalManager) {
      window.journalManager.updateJournal(this.currentJournalId, updatedData);
    }

    // Update di PaginationManager (untuk journals.html)
    if (window.paginationManager) {
      window.paginationManager.updateJournal(
        this.currentJournalId,
        updatedData
      );
    }

    this.closeEditModal();
  }
}
