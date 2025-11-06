// ===== FILE UPLOAD MANAGER (Support Multi-Instance) =====
class FileUploadManager {
  constructor(suffix = "") {
    this.suffix = suffix;
    this.dropZone = document.getElementById(`dropZone${suffix}`);
    this.fileInput = document.getElementById(`fileInput${suffix}`);
    this.filePreview = document.getElementById(`filePreview${suffix}`);
    this.removeFileBtn = document.getElementById(`removeFile${suffix}`);
    this.uploadedFile = null;

    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedTypes = ["application/pdf"];
    this.allowedExtensions = [".pdf"];

    if (this.dropZone && this.fileInput) {
      this.init();
    }
  }

  init() {
    this.dropZone.addEventListener("click", () => {
      this.fileInput.click();
    });

    this.fileInput.addEventListener("change", (e) => {
      this.handleFiles(e.target.files);
    });

    this.dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZone.classList.add("dragover");
    });

    this.dropZone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZone.classList.remove("dragover");
    });

    this.dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZone.classList.remove("dragover");
      this.handleFiles(e.dataTransfer.files);
    });

    if (this.removeFileBtn) {
      this.removeFileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.removeFile();
      });
    }
  }

  handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];
    if (!this.validateFile(file)) return;
    this.uploadedFile = file;
    this.showFilePreview(file);
    this.dropZone.style.display = "none";
  }

  validateFile(file) {
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();
    if (
      !this.allowedTypes.includes(file.type) &&
      !this.allowedExtensions.includes(fileExtension)
    ) {
      alert("File harus berformat PDF, DOC, atau DOCX!");
      return false;
    }
    if (file.size > this.maxFileSize) {
      alert("Ukuran file maksimal 10MB!");
      return false;
    }
    return true;
  }

  showFilePreview(file) {
    const fileName = document.getElementById(`fileName${this.suffix}`);
    const fileSize = document.getElementById(`fileSize${this.suffix}`);
    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = this.formatFileSize(file.size);
    if (this.filePreview) this.filePreview.style.display = "block";
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  removeFile() {
    this.uploadedFile = null;
    this.fileInput.value = "";
    if (this.filePreview) this.filePreview.style.display = "none";
    this.dropZone.style.display = "block";
  }

  simulateUpload(callback) {
    // Show loading indicator
    const loadingOverlay = document.createElement("div");
    loadingOverlay.id = "uploadLoadingOverlay";
    loadingOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;

    const spinner = document.createElement("div");
    spinner.style.cssText = `
      width: 60px;
      height: 60px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    spinner.appendChild(document.createTextNode(""));
    loadingOverlay.appendChild(spinner);
    document.body.appendChild(loadingOverlay);

    // Simulate upload with delay
    setTimeout(() => {
      // Remove loading overlay
      loadingOverlay.remove();

      if (callback) callback();

      // Call render journals to trigger "View All" button
      if (window.journalManager) {
        window.journalManager.renderJournals();
      }
    }, 1500); // 1.5 detik loading
  }

  getUploadedFile() {
    return this.uploadedFile;
  }

  getFileDataURL() {
    return new Promise((resolve, reject) => {
      if (!this.uploadedFile) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(this.uploadedFile);
    });
  }
}

// ===== COVER UPLOAD MANAGER (Support Multi-Instance) =====
class CoverUploadManager {
  constructor(suffix = "") {
    this.suffix = suffix;
    this.coverDropZone = document.getElementById(`coverDropZone${suffix}`);
    this.coverInput = document.getElementById(`coverInput${suffix}`);
    this.coverPreview = document.getElementById(`coverPreview${suffix}`);
    this.coverImage = document.getElementById(`coverImage${suffix}`);
    this.removeCoverBtn = document.getElementById(`removeCover${suffix}`);
    this.uploadedCover = null;

    this.maxFileSize = 2 * 1024 * 1024; // 2MB
    this.allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (this.coverDropZone && this.coverInput) {
      this.init();
    }
  }

  init() {
    this.coverDropZone.addEventListener("click", () => {
      this.coverInput.click();
    });

    this.coverInput.addEventListener("change", (e) => {
      this.handleFiles(e.target.files);
    });

    this.coverDropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.coverDropZone.classList.add("dragover");
    });

    this.coverDropZone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.coverDropZone.classList.remove("dragover");
    });

    this.coverDropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.coverDropZone.classList.remove("dragover");
      this.handleFiles(e.dataTransfer.files);
    });

    if (this.removeCoverBtn) {
      this.removeCoverBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.removeCover();
      });
    }
  }

  handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];
    if (!this.validateFile(file)) return;
    this.uploadedCover = file;
    this.showCoverPreview(file);
  }

  validateFile(file) {
    if (!this.allowedTypes.includes(file.type)) {
      alert("File harus berformat JPG, PNG, atau GIF!");
      return false;
    }
    if (file.size > this.maxFileSize) {
      alert("Ukuran file maksimal 2MB!");
      return false;
    }
    return true;
  }

  showCoverPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.coverImage) this.coverImage.src = e.target.result;
      if (this.coverPreview) this.coverPreview.style.display = "block";
      this.coverDropZone.style.display = "none";
    };
    reader.readAsDataURL(file);
  }

  removeCover() {
    this.uploadedCover = null;
    this.coverInput.value = "";
    if (this.coverImage) this.coverImage.src = "";
    if (this.coverPreview) this.coverPreview.style.display = "none";
    this.coverDropZone.style.display = "block";
  }

  getUploadedCover() {
    return this.uploadedCover;
  }

  getCoverDataURL() {
    if (this.coverImage && this.coverImage.src) {
      return this.coverImage.src;
    }
    return null;
  }
}

console.log("file_upload.js loaded");
