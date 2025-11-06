class PengurusManager {
  constructor(suffix = "") {
    this.suffix = suffix;
    this.pengurusContainer = document.getElementById(
      `pengurusContainer${suffix}`
    );
    this.addPengurusBtn = document.getElementById(`addPengurusBtnJurnal`);
    this.pengurusCount = 1;

    if (this.pengurusContainer && this.addPengurusBtn) {
      this.init();
    }
  }

  init() {
    this.addPengurusBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.addPengurusField();
    });
  }

  addPengurusField() {
    this.pengurusCount++;
    const pengurusGroup = document.createElement("div");
    pengurusGroup.className = "pengurus-input-group";
    pengurusGroup.dataset.pengurusIndex = this.pengurusCount - 1;

    pengurusGroup.innerHTML = `
      <input type="text" 
             class="pengurus-input" 
             placeholder="Nama Pengurus ${this.pengurusCount}">
      <button type="button" class="btn-remove-pengurus">
        <i data-feather="x"></i>
      </button>
    `;

    this.pengurusContainer.appendChild(pengurusGroup);

    const removeBtn = pengurusGroup.querySelector(".btn-remove-pengurus");
    removeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.removePengurusField(pengurusGroup);
    });

    if (typeof feather !== "undefined") {
      feather.replace();
    }

    this.updatePlaceholders();
  }

  removePengurusField(pengurusGroup) {
    const pengurusGroups = this.pengurusContainer.querySelectorAll(
      ".pengurus-input-group"
    );
    if (pengurusGroups.length <= 1) {
      alert("Minimal harus ada 1 pengurus!");
      return;
    }
    pengurusGroup.remove();
    this.pengurusCount--;
    this.updatePlaceholders();
  }

  updatePlaceholders() {
    const pengurusInputs =
      this.pengurusContainer.querySelectorAll(".pengurus-input");
    pengurusInputs.forEach((input, index) => {
      input.placeholder = `Nama Pengurus ${index + 1}`;
      if (index === 0) input.required = true;
    });

    const removeButtons = this.pengurusContainer.querySelectorAll(
      ".btn-remove-pengurus"
    );
    removeButtons.forEach((btn, index) => {
      btn.style.display =
        index === 0 && pengurusInputs.length === 1 ? "none" : "flex";
    });
  }

  getPengurus() {
    const pengurusInputs =
      this.pengurusContainer.querySelectorAll(".pengurus-input");
    const pengurus = [];
    pengurusInputs.forEach((input) => {
      const value = input.value.trim();
      if (value) pengurus.push(value);
    });
    return pengurus;
  }

  clearPengurus() {
    const pengurusGroups = this.pengurusContainer.querySelectorAll(
      ".pengurus-input-group"
    );
    pengurusGroups.forEach((group, index) => {
      if (index > 0) group.remove();
    });
    const firstInput = this.pengurusContainer.querySelector(".pengurus-input");
    if (firstInput) firstInput.value = "";
    this.pengurusCount = 1;
    this.updatePlaceholders();
  }
}

class DualUploadHandler {
  constructor() {
    console.log("DualUploadHandler initialized");
    setTimeout(() => {
      this.initJurnalForm();
      this.initOpiniForm();
    }, 100);
  }

  initJurnalForm() {
    const form = document.getElementById("uploadFormJurnal");
    if (!form) {
      console.error("uploadFormJurnal not found!");
      return;
    }

    this.jurnalFileManager = new FileUploadManager("Jurnal");
    this.jurnalCoverManager = new CoverUploadManager("Jurnal");
    this.jurnalAuthorsManager = new AuthorsManager("Jurnal");
    this.jurnalPengurusManager = new PengurusManager("Jurnal");
    this.jurnalTagsManager = new TagsManager("Jurnal");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleJurnalSubmit();
    });

    console.log("Jurnal form ready");
  }

  initOpiniForm() {
    const form = document.getElementById("uploadFormOpini");
    if (!form) {
      console.error("uploadFormOpini not found!");
      return;
    }

    this.opiniFileManager = new FileUploadManager("Opini");
    this.opiniCoverManager = new CoverUploadManager("Opini");
    this.opiniAuthorsManager = new AuthorsManager("Opini");
    this.opiniTagsManager = new TagsManager("Opini");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleOpiniSubmit();
    });

    console.log("Opini form ready");
  }

  async handleJurnalSubmit() {
    if (!window.loginManager || !window.loginManager.isAdmin()) {
      alert("Login sebagai admin terlebih dahulu!");
      if (window.loginManager) window.loginManager.openLoginModal();
      return;
    }

    if (!this.jurnalFileManager.getUploadedFile()) {
      alert("Upload file jurnal terlebih dahulu!");
      return;
    }

    const authors = this.jurnalAuthorsManager.getAuthors();
    if (authors.length === 0) {
      alert("Minimal 1 penulis!");
      return;
    }

    const pengurus = this.jurnalPengurusManager.getPengurus();
    if (pengurus.length === 0) {
      alert("Minimal 1 pengurus!");
      return;
    }

    const judul = document.getElementById("judulJurnal").value.trim();
    const email = document.getElementById("emailJurnal").value.trim();
    const kontak = document.getElementById("kontakJurnal").value.trim();
    const abstrak = document.getElementById("abstrakJurnal").value.trim();

    if (!judul || !email || !kontak || !abstrak) {
      alert("Semua field harus diisi!");
      return;
    }

    const phoneRegex = /^(?:(?:\+|00)62|[0])8[1-9]\d{7,11}$/;
    if (!phoneRegex.test(kontak.replace(/\D/g, ""))) {
      alert(
        "Nomor kontak harus berupa nomor HP yang valid!\n\nFormat: 08XXXXXXXXX"
      );
      return;
    }

    const confirmMsg = `Yakin mau upload jurnal ini?\n\nJudul: ${judul}\nPenulis: ${authors.join(
      ", "
    )}\nPengurus: ${pengurus.join(
      ", "
    )}\nKontak: ${kontak}\n\nUkuran: ${this.jurnalFileManager.formatFileSize(
      this.jurnalFileManager.getUploadedFile().size
    )}`;

    if (!confirm(confirmMsg)) {
      console.log("Upload dibatalkan oleh user");
      return;
    }

    const file = this.jurnalFileManager.getUploadedFile();
    let fileData = null;

    if (file.size <= 3 * 1024 * 1024) {
      fileData = await this.jurnalFileManager.getFileDataURL();
    }

    const formData = {
      judulJurnal: judul,
      kategori: "jurnal",
      namaPenulis: authors,
      email: email,
      kontak: kontak,
      abstrak: abstrak,
      fileName: file.name,
      coverImage: this.jurnalCoverManager.getCoverDataURL(),
      fileData: fileData,
      tags: this.jurnalTagsManager.getTags(),
      pengurus: pengurus,
    };

    this.jurnalFileManager.simulateUpload(async () => {
      if (window.journalManager) {
        await window.journalManager.addJournal(formData);
      }
      alert("Jurnal berhasil diupload!");
      this.resetJurnalForm();
    });
  }

  async handleOpiniSubmit() {
    if (!window.loginManager || !window.loginManager.isAdmin()) {
      alert("Login sebagai admin terlebih dahulu!");
      if (window.loginManager) window.loginManager.openLoginModal();
      return;
    }

    if (!this.opiniFileManager.getUploadedFile()) {
      alert("Upload file opini terlebih dahulu!");
      return;
    }

    const authors = this.opiniAuthorsManager.getAuthors();
    if (authors.length === 0) {
      alert("Minimal 1 penulis!");
      return;
    }

    const judul = document.getElementById("judulOpini").value.trim();
    const email = document.getElementById("emailOpini").value.trim();
    const kontak = document.getElementById("kontakOpini").value.trim();
    const abstrak = document.getElementById("abstrakOpini").value.trim();

    if (!judul || !email || !kontak || !abstrak) {
      alert("Semua field harus diisi!");
      return;
    }

    const phoneRegex = /^(?:(?:\+|00)62|[0])8[1-9]\d{7,11}$/;
    if (!phoneRegex.test(kontak.replace(/\D/g, ""))) {
      alert(
        "Nomor kontak harus berupa nomor HP yang valid!\n\nFormat: 08XXXXXXXXX atau +62XXXXXXXXX"
      );
      return;
    }

    const confirmMsg = `Yakin mau upload opini ini?\n\nJudul: ${judul}\nPenulis: ${authors.join(
      ", "
    )}\nKontak: ${kontak}\n\nUkuran: ${this.opiniFileManager.formatFileSize(
      this.opiniFileManager.getUploadedFile().size
    )}`;

    if (!confirm(confirmMsg)) {
      console.log("Upload dibatalkan oleh user");
      return;
    }

    const file = this.opiniFileManager.getUploadedFile();
    let fileData = null;

    if (file.size <= 3 * 1024 * 1024) {
      fileData = await this.opiniFileManager.getFileDataURL();
    }

    const formData = {
      judulJurnal: judul,
      kategori: "opini",
      namaPenulis: authors,
      email: email,
      kontak: kontak,
      abstrak: abstrak,
      fileName: file.name,
      coverImage: this.opiniCoverManager.getCoverDataURL(),
      fileData: fileData,
      tags: this.opiniTagsManager.getTags(),
    };

    this.opiniFileManager.simulateUpload(async () => {
      if (window.opinionManager) {
        await window.opinionManager.addOpinion(formData);
      }
      alert("Artikel Opini berhasil diupload!");
      this.resetOpiniForm();
    });
  }

  resetJurnalForm() {
    document.getElementById("uploadFormJurnal").reset();
    this.jurnalFileManager.removeFile();
    this.jurnalCoverManager.removeCover();
    this.jurnalAuthorsManager.clearAuthors();
    this.jurnalPengurusManager.clearPengurus();
    this.jurnalTagsManager.clearTags();
  }

  resetOpiniForm() {
    document.getElementById("uploadFormOpini").reset();
    this.opiniFileManager.removeFile();
    this.opiniCoverManager.removeCover();
    this.opiniAuthorsManager.clearAuthors();
    this.opiniTagsManager.clearTags();
  }
}

console.log("dual_upload_handler.js loaded");
