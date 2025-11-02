// ===== LOGIN MANAGER =====

class LoginManager {
  constructor() {
    this.loginModal = document.getElementById("loginModal");
    this.loginForm = document.getElementById("loginForm");

    // Support multiple button locations (index.html & journals.html)
    this.loginBtn = document.querySelector(".btn-register");

    this.closeModalBtn = document.getElementById("closeLoginModal");
    this.togglePasswordBtn = document.getElementById("togglePassword");
    this.uploadSection = document.querySelector(".upload-section");

    this.adminCredentials = {
      email: "admin@ksmeducation.com",
      password: "admin123",
    };

    this.isLoggedIn = false;

    // Check jika element penting ada
    if (!this.loginBtn) {
      console.warn("loginBtn tidak ditemukan");
      return;
    }

    if (!this.loginModal || !this.loginForm) {
      console.warn("loginModal atau loginForm tidak ditemukan");
      return;
    }

    this.init();
  }

  init() {
    this.checkLoginStatus();

    // Attach event listener ke button login
    this.loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (this.isLoggedIn) {
        this.logout();
      } else {
        this.openLoginModal();
      }
    });

    // Check jika modal ada sebelum attach event
    if (!this.closeModalBtn) {
      console.warn(
        "closeModalBtn tidak ditemukan, modal tidak ada di halaman ini"
      );
      return;
    }

    this.closeModalBtn.addEventListener("click", () => {
      this.closeLoginModal();
    });

    const overlay = this.loginModal.querySelector(".modal-overlay");
    if (overlay) {
      overlay.addEventListener("click", () => {
        this.closeLoginModal();
      });
    }

    if (this.togglePasswordBtn) {
      this.togglePasswordBtn.addEventListener("click", () => {
        this.togglePasswordVisibility();
      });
    }

    this.loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      const emailInput = document.getElementById("loginEmail");
      if (emailInput) {
        emailInput.value = rememberedEmail;
      }
      const rememberCheckbox = document.getElementById("rememberMe");
      if (rememberCheckbox) {
        rememberCheckbox.checked = true;
      }
    }

    this.updateUploadSection();
  }

  openLoginModal() {
    if (!this.loginModal) {
      console.error("loginModal tidak ditemukan");
      return;
    }

    this.loginModal.classList.add("active");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      feather.replace();
    }, 100);
  }

  closeLoginModal() {
    if (!this.loginModal) {
      return;
    }

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

    if (
      email === this.adminCredentials.email &&
      password === this.adminCredentials.password
    ) {
      this.isLoggedIn = true;
      localStorage.setItem("adminLoggedIn", "true");
      localStorage.setItem("adminLoginTime", new Date().toISOString());

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      this.updateLoginButton();
      this.updateUploadSection();
      this.closeLoginModal();

      alert("Login berhasil!\n\nSelamat datang, Admin!");

      this.loginForm.reset();

      window.dispatchEvent(
        new CustomEvent("adminLoginStatusChanged", {
          detail: { isLoggedIn: true },
        })
      );
    } else {
      alert("Login gagal!\n\nEmail atau password salah.");
    }
  }

  logout() {
    if (confirm("Yakin mau logout?")) {
      this.isLoggedIn = false;
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("adminLoginTime");

      this.updateLoginButton();
      this.updateUploadSection();

      alert("Logout berhasil!");

      window.dispatchEvent(
        new CustomEvent("adminLoginStatusChanged", {
          detail: { isLoggedIn: false },
        })
      );
    }
  }

  checkLoginStatus() {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    const loginTime = localStorage.getItem("adminLoginTime");

    if (loggedIn === "true" && loginTime) {
      const loginDate = new Date(loginTime);
      const now = new Date();
      const diffMinutes = (now - loginDate) / 1000 / 60;

      if (diffMinutes > 60) {
        localStorage.removeItem("adminLoggedIn");
        localStorage.removeItem("adminLoginTime");
        this.isLoggedIn = false;
        return;
      }
    }

    if (loggedIn === "true") {
      this.isLoggedIn = true;
      this.updateLoginButton();
      this.updateUploadSection();
    } else {
      this.isLoggedIn = false;
    }
  }

  updateLoginButton() {
    if (!this.loginBtn) {
      return;
    }

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
    if (!this.uploadSection) {
      return; // Tidak ada upload section di halaman ini
    }

    if (this.isLoggedIn) {
      this.uploadSection.classList.remove("locked");
    } else {
      this.uploadSection.classList.add("locked");
    }
  }

  isAdmin() {
    return this.isLoggedIn;
  }

  // Sync login status across pages
  syncLoginStatus() {
    this.checkLoginStatus();
    this.updateLoginButton();
    this.updateUploadSection();
  }
}
