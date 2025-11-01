// ===== LOGIN MANAGER =====

class LoginManager {
  constructor() {
    this.loginModal = document.getElementById("loginModal");
    this.loginForm = document.getElementById("loginForm");
    this.loginBtn = document.querySelector(".btn-register");
    this.closeModalBtn = document.getElementById("closeLoginModal");
    this.togglePasswordBtn = document.getElementById("togglePassword");
    this.uploadSection = document.querySelector(".upload-section");

    // Admin credentials (in production, this should be server-side)
    this.adminCredentials = {
      email: "admin@ksmeducation.com",
      password: "admin123",
    };

    this.isLoggedIn = false;

    this.init();
  }

  init() {
    // Check if already logged in
    this.checkLoginStatus();

    // Login button click
    this.loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (this.isLoggedIn) {
        this.logout();
      } else {
        this.openLoginModal();
      }
    });

    // Close modal
    this.closeModalBtn.addEventListener("click", () => {
      this.closeLoginModal();
    });

    // Close modal when clicking overlay
    const overlay = this.loginModal.querySelector(".modal-overlay");
    overlay.addEventListener("click", () => {
      this.closeLoginModal();
    });

    // Toggle password visibility
    this.togglePasswordBtn.addEventListener("click", () => {
      this.togglePasswordVisibility();
    });

    // Form submit
    this.loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Remember me from localStorage
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      document.getElementById("loginEmail").value = rememberedEmail;
      document.getElementById("rememberMe").checked = true;
    }

    // Lock upload section if not logged in
    this.updateUploadSection();
  }

  openLoginModal() {
    this.loginModal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Replace feather icons
    setTimeout(() => {
      feather.replace();
    }, 100);
  }

  closeLoginModal() {
    this.loginModal.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  togglePasswordVisibility() {
    const passwordInput = document.getElementById("loginPassword");
    const icon = this.togglePasswordBtn.querySelector("i");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.setAttribute("data-feather", "eye-off");
    } else {
      passwordInput.type = "password";
      icon.setAttribute("data-feather", "eye");
    }

    feather.replace();
  }

  handleLogin() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    // Validate credentials
    if (
      email === this.adminCredentials.email &&
      password === this.adminCredentials.password
    ) {
      // Save login status
      this.isLoggedIn = true;
      sessionStorage.setItem("adminLoggedIn", "true");

      // Remember email if checkbox is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Update UI
      this.updateLoginButton();
      this.updateUploadSection();
      this.closeLoginModal();

      // Show success message
      alert("Login berhasil!\n\nSelamat datang, Admin!");

      // Reset form
      this.loginForm.reset();
    } else {
      alert("Login gagal!\n\nEmail atau password salah.");
    }
  }

  logout() {
    if (confirm("Yakin mau logout?")) {
      this.isLoggedIn = false;
      sessionStorage.removeItem("adminLoggedIn");

      this.updateLoginButton();
      this.updateUploadSection();

      alert("Logout berhasil!");
    }
  }

  checkLoginStatus() {
    const loggedIn = sessionStorage.getItem("adminLoggedIn");
    if (loggedIn === "true") {
      this.isLoggedIn = true;
      this.updateLoginButton();
      this.updateUploadSection();
    }
  }

  updateLoginButton() {
    if (this.isLoggedIn) {
      this.loginBtn.innerHTML = `
                <i data-feather="log-out"></i>
                LOGOUT
            `;
      this.loginBtn.classList.add("admin-logged-in");
      feather.replace();
    } else {
      this.loginBtn.textContent = "LOGIN";
      this.loginBtn.classList.remove("admin-logged-in");
    }
  }

  updateUploadSection() {
    if (this.isLoggedIn) {
      this.uploadSection.classList.remove("locked");
    } else {
      this.uploadSection.classList.add("locked");
    }
  }

  isAdmin() {
    return this.isLoggedIn;
  }
}
