// ===== REAL-TIME STATISTICS SYSTEM =====

class StatisticsManager {
    constructor() {
        this.articleCountElement = document.getElementById('articleCount');
        this.visitorCountElement = document.getElementById('visitorCount');
        this.isAnimating = false;
        
        // Initialize statistics
        this.init();
    }

    init() {
        // Load statistics from localStorage
        this.loadStatistics();
        
        // Track visitor
        this.trackVisitor();
        
        // Update article count based on journals
        this.updateArticleCount();
        
        // Start real-time counter animation
        this.startCounterAnimation();
        
        // Set up periodic updates
        this.setupPeriodicUpdates();
    }

    loadStatistics() {
        // Get stored statistics or initialize
        const stats = this.getStoredStats();
        this.currentArticles = stats.articles;
        this.currentVisitors = stats.visitors;
    }

    getStoredStats() {
        const stored = localStorage.getItem('siteStatistics');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Initialize new statistics
        return {
            articles: 0,
            visitors: 0,
            lastVisit: null,
            uniqueVisitorId: this.generateVisitorId()
        };
    }

    saveStatistics() {
        const stats = {
            articles: this.currentArticles,
            visitors: this.currentVisitors,
            lastVisit: new Date().toISOString(),
            uniqueVisitorId: this.getStoredStats().uniqueVisitorId
        };
        localStorage.setItem('siteStatistics', JSON.stringify(stats));
    }

    generateVisitorId() {
        return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    trackVisitor() {
        const stats = this.getStoredStats();
        const today = new Date().toDateString();
        const lastVisit = stats.lastVisit ? new Date(stats.lastVisit).toDateString() : null;
        
        // Increment visitor count if it's a new day or first visit
        if (!lastVisit || lastVisit !== today) {
            this.currentVisitors++;
            this.saveStatistics();
        }
        
        // Track session visitors (for demo purposes)
        const sessionVisitors = sessionStorage.getItem('sessionVisitorCount');
        if (!sessionVisitors) {
            sessionStorage.setItem('sessionVisitorCount', '1');
        }
    }

    updateArticleCount() {
        // Count articles from journal list
        const articles = document.querySelectorAll('.journal-item');
        this.currentArticles = articles.length;
        this.saveStatistics();
    }

    startCounterAnimation() {
        // Animate from 0 to current value
        this.animateCounter(this.articleCountElement, 0, this.currentArticles, 1500);
        this.animateCounter(this.visitorCountElement, 0, this.currentVisitors, 2000);
    }

    animateCounter(element, start, end, duration) {
        if (this.isAnimating) return;
        
        element.classList.add('counting');
        const startTime = performance.now();
        const range = end - start;

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (range * easeOutQuart));
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = end;
                element.classList.remove('counting');
            }
        };

        requestAnimationFrame(updateCounter);
    }

    incrementArticleCount() {
        this.currentArticles++;
        this.saveStatistics();
        this.animateCounter(this.articleCountElement, 
            parseInt(this.articleCountElement.textContent), 
            this.currentArticles, 
            500
        );
    }

    incrementVisitorCount() {
        this.currentVisitors++;
        this.saveStatistics();
        this.animateCounter(this.visitorCountElement, 
            parseInt(this.visitorCountElement.textContent), 
            this.currentVisitors, 
            500
        );
    }

    setupPeriodicUpdates() {
        // Simulate real-time visitor updates (for demo)
        setInterval(() => {
            // Random chance to simulate a new visitor (5% chance every 10 seconds)
            if (Math.random() < 0.05) {
                this.incrementVisitorCount();
            }
        }, 10000);
    }

    resetStatistics() {
        localStorage.removeItem('siteStatistics');
        sessionStorage.removeItem('sessionVisitorCount');
        this.currentArticles = 0;
        this.currentVisitors = 0;
        this.saveStatistics();
        this.articleCountElement.textContent = '0';
        this.visitorCountElement.textContent = '0';
    }
}

// ===== DRAG AND DROP FILE UPLOAD =====

class FileUploadManager {
    constructor() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.filePreview = document.getElementById('filePreview');
        this.removeFileBtn = document.getElementById('removeFile');
        this.uploadedFile = null;
        
        // File constraints
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        this.allowedExtensions = ['.pdf', '.doc', '.docx'];
        
        this.init();
    }

    init() {
        // Click to browse
        this.dropZone.addEventListener('click', () => {
            this.fileInput.click();
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Drag and drop events
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.add('dragover');
        });

        this.dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.remove('dragover');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });

        // Remove file button
        this.removeFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFile();
        });
    }

    handleFiles(files) {
        if (files.length === 0) return;

        const file = files[0]; // Only take first file

        // Validate file
        if (!this.validateFile(file)) {
            return;
        }

        this.uploadedFile = file;
        this.showFilePreview(file);
        this.dropZone.style.display = 'none';
    }

    validateFile(file) {
        // Check file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!this.allowedTypes.includes(file.type) && !this.allowedExtensions.includes(fileExtension)) {
            this.showError('File harus berformat PDF, DOC, atau DOCX!');
            return false;
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            this.showError('Ukuran file maksimal 10MB!');
            return false;
        }

        return true;
    }

    showFilePreview(file) {
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');

        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);

        this.filePreview.style.display = 'block';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    removeFile() {
        this.uploadedFile = null;
        this.fileInput.value = '';
        this.filePreview.style.display = 'none';
        this.dropZone.style.display = 'block';
        this.dropZone.classList.remove('error');
    }

    showError(message) {
        this.dropZone.classList.add('error');
        alert(message);
        
        setTimeout(() => {
            this.dropZone.classList.remove('error');
        }, 3000);
    }

    simulateUpload(callback) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const uploadProgress = document.getElementById('uploadProgress');
        
        uploadProgress.style.display = 'block';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            progressBar.style.setProperty('--progress', progress + '%');
            progressText.textContent = Math.round(progress) + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    uploadProgress.style.display = 'none';
                    progressBar.style.setProperty('--progress', '0%');
                    if (callback) callback();
                }, 500);
            }
        }, 200);
    }

    getUploadedFile() {
        return this.uploadedFile;
    }
}

// ===== JOURNAL MANAGEMENT =====

class JournalManager {
    constructor() {
        this.journalContainer = document.getElementById('journalContainer');
        this.journals = this.loadJournals();
        this.renderJournals();
    }

    loadJournals() {
        const stored = localStorage.getItem('journals');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Default journals
        return [
            {
                id: 1,
                thumbnail: 'https://via.placeholder.com/150x100/4a5568/ffffff?text=Journal+1',
                date: 'JUMAT - 22 OCTOBER 2021',
                title: 'Analisis Implementasi Machine Learning dalam Sistem Pendidikan',
                description: 'Penelitian ini membahas penerapan algoritma machine learning untuk meningkatkan efektivitas pembelajaran online.'
            },
            {
                id: 2,
                thumbnail: 'https://via.placeholder.com/150x100/6b7280/ffffff?text=Journal+2',
                date: 'KAMIS - 21 OCTOBER 2021',
                title: 'Studi Kasus Pengembangan Web Application Modern',
                description: 'Eksplorasi framework JavaScript terkini dan best practices dalam pengembangan aplikasi web yang responsif.'
            },
            {
                id: 3,
                thumbnail: 'https://via.placeholder.com/150x100/4a5568/ffffff?text=Journal+3',
                date: 'RABU - 20 OCTOBER 2021',
                title: 'Keamanan Siber di Era Digital: Tantangan dan Solusi',
                description: 'Analisis komprehensif tentang ancaman keamanan siber dan strategi mitigasi yang efektif.'
            },
            {
                id: 4,
                thumbnail: 'https://via.placeholder.com/150x100/6b7280/ffffff?text=Journal+4',
                date: 'SELASA - 19 OCTOBER 2021',
                title: 'Optimasi Database untuk Aplikasi Skala Besar',
                description: 'Teknik-teknik optimasi query dan indexing untuk meningkatkan performa database management system.'
            },
            {
                id: 5,
                thumbnail: 'https://via.placeholder.com/150x100/4a5568/ffffff?text=Journal+5',
                date: 'SENIN - 18 OCTOBER 2021',
                title: 'Internet of Things: Transformasi Digital dalam Kehidupan Sehari-hari',
                description: 'Pengaruh teknologi IoT terhadap smart home, smart city, dan industri 4.0.'
            },
            {
                id: 6,
                thumbnail: 'https://via.placeholder.com/150x100/6b7280/ffffff?text=Journal+6',
                date: 'MINGGU - 17 OCTOBER 2021',
                title: 'Cloud Computing: Solusi Infrastruktur Modern',
                description: 'Perbandingan layanan cloud computing dan implementasinya dalam enterprise architecture.'
            }
        ];
    }

    saveJournals() {
        localStorage.setItem('journals', JSON.stringify(this.journals));
    }

    renderJournals() {
        this.journalContainer.innerHTML = '';
        this.journals.forEach((journal) => {
            const journalItem = this.createJournalElement(journal);
            this.journalContainer.appendChild(journalItem);
        });
    }

    createJournalElement(journal) {
        const div = document.createElement('div');
        div.className = 'journal-item';
        div.innerHTML = `
            <img src="${journal.thumbnail}" alt="${journal.title}" class="journal-thumbnail">
            <div class="journal-content">
                <div class="journal-meta">${journal.date}</div>
                <div class="journal-title">${journal.title}</div>
                <div class="journal-description">${journal.description}</div>
                <div class="journal-progress">
                    <div class="journal-progress-bar"></div>
                </div>
            </div>
        `;
        return div;
    }

    addJournal(journalData) {
        const newJournal = {
            id: Date.now(),
            thumbnail: 'https://via.placeholder.com/150x100/4a5568/ffffff?text=New+Journal',
            date: this.getCurrentDate(),
            title: journalData.judulJurnal,
            description: journalData.abstrak.substring(0, 100) + '...',
            fileName: journalData.fileName
        };
        
        this.journals.unshift(newJournal);
        this.saveJournals();
        this.renderJournals();
        
        // Update article count
        if (window.statsManager) {
            window.statsManager.incrementArticleCount();
        }
    }

    getCurrentDate() {
        const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
        const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                       'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        
        const now = new Date();
        const dayName = days[now.getDay()];
        const day = now.getDate();
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        
        return `${dayName} - ${day} ${month} ${year}`;
    }
}

// ===== SEARCH FUNCTIONALITY =====

class SearchManager {
    constructor() {
        this.searchInput = document.querySelector('.search-box input');
        this.setupSearch();
    }

    setupSearch() {
        this.searchInput.addEventListener('input', (e) => {
            this.filterJournals(e.target.value);
        });
    }

    filterJournals(searchTerm) {
        const term = searchTerm.toLowerCase();
        const journalItems = document.querySelectorAll('.journal-item');
        
        journalItems.forEach(item => {
            const title = item.querySelector('.journal-title').textContent.toLowerCase();
            const description = item.querySelector('.journal-description').textContent.toLowerCase();
            
            if (title.includes(term) || description.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

// ===== FORM HANDLER =====

class FormHandler {
    constructor() {
        this.form = document.getElementById('uploadForm');
        this.setupForm();
    }

    setupForm() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    handleSubmit() {
        // Check if file is uploaded
        if (!window.fileUploadManager.getUploadedFile()) {
            alert('Silakan upload file jurnal terlebih dahulu!');
            return;
        }

        const formData = {
            judulJurnal: document.getElementById('judulJurnal').value,
            namaPenulis: document.getElementById('namaPenulis').value,
            email: document.getElementById('email').value,
            kontak: document.getElementById('kontak').value,
            abstrak: document.getElementById('abstrak').value,
            fileName: window.fileUploadManager.getUploadedFile().name
        };

        // Simulate upload with progress bar
        window.fileUploadManager.simulateUpload(() => {
            // Add journal to list
            if (window.journalManager) {
                window.journalManager.addJournal(formData);
            }

            alert('✅ Jurnal berhasil diupload!\n\nJudul: ' + formData.judulJurnal + '\nFile: ' + formData.fileName);
            
            // Reset form and file
            this.form.reset();
            window.fileUploadManager.removeFile();
        });
    }
}

// ===== INITIALIZE ALL SYSTEMS =====

document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    window.statsManager = new StatisticsManager();
    window.journalManager = new JournalManager();
    window.searchManager = new SearchManager();
    window.fileUploadManager = new FileUploadManager();
    window.formHandler = new FormHandler();

    // Update article count after journals are loaded
    setTimeout(() => {
        window.statsManager.updateArticleCount();
        window.statsManager.startCounterAnimation();
    }, 100);

    // Debug: Add console commands
    console.log('📊 Statistics System Initialized');
    console.log('📁 File Upload System Initialized');
    console.log('🔧 To reset statistics, run: statsManager.resetStatistics()');
    console.log('📈 Current Articles:', window.statsManager.currentArticles);
    console.log('👥 Current Visitors:', window.statsManager.currentVisitors);
});
