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
