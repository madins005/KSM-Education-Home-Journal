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
