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
    if (!this.journalContainer) return;

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

    const displayCount = 5;
    const journalsToDisplay = this.journals.slice(0, displayCount);

    journalsToDisplay.forEach((journal) => {
      const journalItem = this.createJournalElement(journal);
      this.journalContainer.appendChild(journalItem);
    });

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

    // PAKSA RENDER TOMBOL (UNTUK TESTING DI ADMIN)
    const currentPage = window.location.pathname;
    const isAdminDashboard = currentPage.includes("dashboard_admin");

    // JIKA DI ADMIN DASHBOARD, PAKSA TAMPILKAN TOMBOL
    const editDeleteButtons = isAdminDashboard
      ? `
    <button class="btn-edit" onclick="window.editJournalManager && window.editJournalManager.openEditModal(${journal.id})" title="EDIT">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
        <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>
      EDIT
    </button>
    <button class="btn-delete" onclick="journalManager.deleteJournal(${journal.id})" title="DELETE">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"/>
      </svg>
      DELETE
    </button>
  `
      : "";

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
        })" title="DOWNLOAD">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          DOWNLOAD
        </button>
        ${editDeleteButtons}
      </div>
    </div>
  `;
    return div;
  }

  async addJournal(journalData) {
    const capitalize = (str) => {
      return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const newJournal = {
      id: Date.now(),
      coverImage:
        journalData.coverImage ||
        "https://via.placeholder.com/150x200/4a5568/ffffff?text=No+Cover",
      date: this.getCurrentDate(),
      title: capitalize(journalData.judulJurnal),
      description: capitalize(journalData.abstrak.substring(0, 100)) + "...",
      fileName: journalData.fileName,
      fileData: journalData.fileData,
      author: journalData.namaPenulis.map((a) => capitalize(a)),
      email: journalData.email,
      contact: journalData.kontak,
      fullAbstract: capitalize(journalData.abstrak),
      tags: journalData.tags || [],
    };

    this.journals.unshift(newJournal);
    this.saveJournals();
    this.renderJournals();
  }

  downloadJournal(id) {
    const journal = this.journals.find((j) => j.id === id);

    if (!journal) {
      alert("JURNAL TIDAK DITEMUKAN");
      return;
    }

    if (!journal.fileData) {
      alert("FILE TIDAK TERSEDIA UNTUK DIUNDUH");
      return;
    }

    const link = document.createElement("a");
    link.href = journal.fileData;
    link.download = journal.fileName || "JURNAL.PDF";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("DOWNLOAD DIMULAI\n\nFILE: " + journal.fileName);
  }

  deleteJournal(id) {
    // CEK STATUS LOGIN LANGSUNG DARI sessionStorage
    const isLoggedIn = sessionStorage.getItem("userLoggedIn") === "true";
    const isAdmin = sessionStorage.getItem("userType") === "admin";

    // JIKA TIDAK LOGIN ATAU BUKAN ADMIN
    if (!isLoggedIn || !isAdmin) {
      alert("HARUS LOGIN SEBAGAI ADMIN UNTUK MENGHAPUS JURNAL");
      return;
    }

    // CONFIRM DELETE
    if (!confirm("YAKIN MAU HAPUS JURNAL INI?")) return;

    // CARI DAN HAPUS JURNAL
    const index = this.journals.findIndex((j) => j.id === id);
    if (index > -1) {
      const deleted = this.journals.splice(index, 1)[0];
      this.saveJournals();
      this.renderJournals();

      // UPDATE STATS JIKA ADA
      if (window.statsManager) {
        window.statsManager.decrementArticleCount();
      }

      alert("JURNAL '" + deleted.title.toUpperCase() + "' BERHASIL DIHAPUS");
    } else {
      alert("JURNAL TIDAK DITEMUKAN");
    }
  }

  getJournalById(id) {
    return this.journals.find((j) => j.id === id) || null;
  }

  updateJournal(id, updatedData) {
    const capitalize = (str) => {
      return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const index = this.journals.findIndex((j) => j.id === id);
    if (index > -1) {
      this.journals[index] = {
        ...this.journals[index],
        title: capitalize(updatedData.title),
        author: Array.isArray(updatedData.author)
          ? updatedData.author.map((a) => capitalize(a))
          : capitalize(updatedData.author),
        fullAbstract: capitalize(updatedData.fullAbstract),
        description: capitalize(updatedData.description),
        email: updatedData.email,
        contact: updatedData.contact,
      };
      this.saveJournals();
      this.renderJournals();
      alert("JURNAL BERHASIL DIUPDATE");
    }
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

console.log("jurnal.js loaded");
