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

    if (!window.coverUploadManager.getUploadedCover()) {
      if (!confirm("Belum upload cover jurnal. Lanjutkan tanpa cover?")) {
        return;
      }
    }

    if (!window.fileUploadManager.getUploadedFile()) {
      alert("Silakan upload file jurnal (PDF/Word) terlebih dahulu!");
      return;
    }

    const authors = window.authorsManager.getAuthors();

    if (authors.length === 0) {
      alert("Minimal harus ada 1 penulis!");
      return;
    }

    // JANGAN simpan file data kalau file terlalu besar
    let fileData = null;
    const file = window.fileUploadManager.getUploadedFile();

    if (file.size > 2 * 1024 * 1024) {
      // > 2MB
      const proceed = confirm(
        "File terlalu besar (" +
          Math.round(file.size / 1024 / 1024) +
          "MB). " +
          "File tidak akan disimpan untuk download.\n\n" +
          "Lanjutkan?"
      );
      if (!proceed) return;
      fileData = null;
    } else {
      fileData = await window.fileUploadManager.getFileDataURL();
    }

    const formData = {
      judulJurnal: document.getElementById("judulJurnal").value,
      namaPenulis: authors,
      email: document.getElementById("email").value,
      kontak: document.getElementById("kontak").value,
      abstrak: document.getElementById("abstrak").value,
      fileName: file.name,
      coverImage: window.coverUploadManager.getCoverDataURL(),
      fileData: fileData,
    };

    window.fileUploadManager.simulateUpload(async () => {
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

      this.form.reset();
      window.fileUploadManager.removeFile();
      window.coverUploadManager.removeCover();
      window.authorsManager.clearAuthors();
    });
  }
}
