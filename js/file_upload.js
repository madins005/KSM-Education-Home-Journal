// ===== COVER IMAGE UPLOAD MANAGER =====

class CoverUploadManager {
  constructor() {
    this.coverDropZone = document.getElementById("coverDropZone");
    this.coverInput = document.getElementById("coverInput");
    this.coverPreview = document.getElementById("coverPreview");
    this.coverImage = document.getElementById("coverImage");
    this.removeCoverBtn = document.getElementById("removeCover");
    this.uploadedCover = null;

    // File constraints
    this.maxFileSize = 2 * 1024 * 1024; // 2MB
    this.allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    this.init();
  }

  init() {
    // Click to browse
    this.coverDropZone.addEventListener("click", () => {
      this.coverInput.click();
    });

    // File input change
    this.coverInput.addEventListener("change", (e) => {
      this.handleFiles(e.target.files);
    });

    // Drag and drop events
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

      const files = e.dataTransfer.files;
      this.handleFiles(files);
    });

    // Remove cover button
    this.removeCoverBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.removeCover();
    });
  }

  handleFiles(files) {
    if (files.length === 0) return;

    const file = files[0];

    // Validate file
    if (!this.validateFile(file)) {
      return;
    }

    this.uploadedCover = file;
    this.showCoverPreview(file);
  }

  validateFile(file) {
    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      this.showError("File harus berformat JPG, PNG, atau GIF!");
      return false;
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      this.showError("Ukuran file maksimal 2MB!");
      return false;
    }

    return true;
  }

  showCoverPreview(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      this.coverImage.src = e.target.result;
      this.coverPreview.style.display = "block";
      this.coverDropZone.style.display = "none";
    };

    reader.readAsDataURL(file);
  }

  removeCover() {
    this.uploadedCover = null;
    this.coverInput.value = "";
    this.coverImage.src = "";
    this.coverPreview.style.display = "none";
    this.coverDropZone.style.display = "block";
    this.coverDropZone.classList.remove("error");
  }

  showError(message) {
    this.coverDropZone.classList.add("error");
    alert(message);

    setTimeout(() => {
      this.coverDropZone.classList.remove("error");
    }, 3000);
  }

  getUploadedCover() {
    return this.uploadedCover;
  }

  getCoverDataURL() {
    if (this.coverImage.src) {
      return this.coverImage.src;
    }
    return null;
  }
}

// ===== DOCUMENT FILE UPLOAD MANAGER =====

class FileUploadManager {
  constructor() {
    this.dropZone = document.getElementById("dropZone");
    this.fileInput = document.getElementById("fileInput");
    this.filePreview = document.getElementById("filePreview");
    this.removeFileBtn = document.getElementById("removeFile");
    this.uploadedFile = null;

    // File constraints
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    this.allowedExtensions = [".pdf", ".doc", ".docx"];

    this.init();
  }

  init() {
    // Click to browse
    this.dropZone.addEventListener("click", () => {
      this.fileInput.click();
    });

    // File input change
    this.fileInput.addEventListener("change", (e) => {
      this.handleFiles(e.target.files);
    });

    // Drag and drop events
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

      const files = e.dataTransfer.files;
      this.handleFiles(files);
    });

    // Remove file button
    this.removeFileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.removeFile();
    });
  }

  handleFiles(files) {
    if (files.length === 0) return;

    const file = files[0];

    // Validate file
    if (!this.validateFile(file)) {
      return;
    }

    this.uploadedFile = file;
    this.showFilePreview(file);
    this.dropZone.style.display = "none";
  }

  validateFile(file) {
    // Check file type
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (
      !this.allowedTypes.includes(file.type) &&
      !this.allowedExtensions.includes(fileExtension)
    ) {
      this.showError("File harus berformat PDF, DOC, atau DOCX!");
      return false;
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      this.showError("Ukuran file maksimal 10MB!");
      return false;
    }

    return true;
  }

  showFilePreview(file) {
    const fileName = document.getElementById("fileName");
    const fileSize = document.getElementById("fileSize");

    fileName.textContent = file.name;
    fileSize.textContent = this.formatFileSize(file.size);

    this.filePreview.style.display = "block";
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
    this.filePreview.style.display = "none";
    this.dropZone.style.display = "block";
    this.dropZone.classList.remove("error");
  }

  showError(message) {
    this.dropZone.classList.add("error");
    alert(message);

    setTimeout(() => {
      this.dropZone.classList.remove("error");
    }, 3000);
  }

  simulateUpload(callback) {
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const uploadProgress = document.getElementById("uploadProgress");

    uploadProgress.style.display = "block";

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 100) progress = 100;

      progressBar.style.setProperty("--progress", progress + "%");
      progressText.textContent = Math.round(progress) + "%";

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          uploadProgress.style.display = "none";
          progressBar.style.setProperty("--progress", "0%");
          if (callback) callback();
        }, 500);
      }
    }, 200);
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