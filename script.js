// Enhanced InternTrack JavaScript Application
class EnhancedInternTrack {
    constructor() {
        this.logs = JSON.parse(localStorage.getItem('interntrack_logs')) || [];
        this.formVisible = false;
        this.currentFilter = 'all';
        this.initializeEventListeners();
        this.render();
    }

    initializeEventListeners() {
        const logForm = document.getElementById('logForm');
        const editForm = document.getElementById('editForm');
        const toggleFormBtn = document.getElementById('toggleFormBtn');
        const typeSelect = document.getElementById('type');
        const projectField = document.getElementById('projectField');
        const filterTabs = document.querySelectorAll('.filter-tab');
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');

        logForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addLog();
        });

        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEdit();
        });

        toggleFormBtn.addEventListener('click', () => {
            this.toggleForm();
        });

        typeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'project') {
                projectField.classList.remove('hidden');
                document.getElementById('project').required = true;
            } else {
                projectField.classList.add('hidden');
                document.getElementById('project').required = false;
                document.getElementById('project').value = '';
            }
        });

        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.setFilter(filter);
            });
        });

        bulkDeleteBtn.addEventListener('click', () => {
            this.bulkDelete();
        });

        // Event delegation untuk checkbox log
        const logList = document.getElementById('logList');
        logList.addEventListener('change', (e) => {
            if (e.target.classList.contains('log-checkbox')) {
                this.updateBulkDeleteBtn();
            }
        });

        // Set today's date as default
        document.getElementById('date').valueAsDate = new Date();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        this.render();
    }

    toggleForm() {
        const formContainer = document.getElementById('formContainer');
        const toggleText = document.getElementById('toggleFormText');
        this.formVisible = !this.formVisible;
        if (this.formVisible) {
            formContainer.classList.add('active');
            toggleText.textContent = '✕ Tutup Form';
            setTimeout(() => {
                document.getElementById('date').focus();
            }, 300);
        } else {
            formContainer.classList.remove('active');
            toggleText.textContent = '+ Tambah Kegiatan';
        }
    }

    addLog() {
        const date = document.getElementById('date').value;
        const type = document.getElementById('type').value;
        const priority = document.getElementById('priority').value;
        const status = document.getElementById('status').value;
        const project = document.getElementById('project').value.trim();
        const activity = document.getElementById('activity').value.trim();
        const duration = parseFloat(document.getElementById('duration').value);
        const notes = document.getElementById('notes').value.trim();

        if (date && type && priority && status && activity && duration > 0) {
            const newLog = {
                id: Date.now(),
                date: date,
                type: type,
                priority: priority,
                status: status,
                project: project,
                activity: activity,
                duration: duration,
                notes: notes,
                timestamp: new Date().toISOString()
            };

            this.logs.unshift(newLog);
            this.saveToLocalStorage();
            console.log('addLog: log ditambah', newLog);
            this.render(); // Memastikan render langsung
            this.clearForm();
            this.showSuccessToast('Kegiatan berhasil ditambahkan!');
            this.toggleForm();
        }
    }

    toggleStatus(id) {
        const log = this.logs.find(l => l.id === id);
        if (log) {
            if (log.status === 'completed') {
                log.status = 'pending';
            } else if (log.status === 'pending') {
                log.status = 'in-progress';
            } else {
                log.status = 'completed';
            }
            this.saveToLocalStorage();
            console.log('toggleStatus: status diubah', log);
            this.render(); // Update tampilan
            this.showSuccessToast(`Status berhasil diubah menjadi ${this.getStatusLabel(log.status)}!`);
        }
    }

    editLog(id) {
        const log = this.logs.find(l => l.id === id);
        if (log) {
            document.getElementById('editId').value = log.id;
            document.getElementById('editStatus').value = log.status;
            document.getElementById('editPriority').value = log.priority;
            document.getElementById('editDuration').value = log.duration;
            document.getElementById('editNotes').value = log.notes || '';
            document.getElementById('editModal').classList.add('active');
        }
    }

    saveEdit() {
        const id = parseInt(document.getElementById('editId').value);
        const status = document.getElementById('editStatus').value;
        const priority = document.getElementById('editPriority').value;
        const duration = parseFloat(document.getElementById('editDuration').value);
        const notes = document.getElementById('editNotes').value;

        const log = this.logs.find(l => l.id === id);
        if (log) {
            log.status = status;
            log.priority = priority;
            log.duration = duration;
            log.notes = notes;
            log.lastModified = new Date().toISOString();
            this.saveToLocalStorage();
            this.render(); // Update UI
            this.closeEditModal();
            this.showSuccessToast('Kegiatan berhasil diperbarui!');
        }
    }

    closeEditModal() {
        document.getElementById('editModal').classList.remove('active');
    }

    deleteLog(id) {
        Swal.fire({
            title: 'Hapus kegiatan ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                this.logs = this.logs.filter(log => log.id !== id);
                this.saveToLocalStorage();
                this.render();
                Swal.fire('Berhasil!', 'Kegiatan berhasil dihapus!', 'success');
            }
        });
    }

    bulkDelete() {
        const selectedLogs = document.querySelectorAll('.log-checkbox:checked');
        if (selectedLogs.length === 0) {
            Swal.fire('Pilih minimal satu kegiatan untuk dihapus', '', 'info');
            return;
        }
        Swal.fire({
            title: `Hapus ${selectedLogs.length} kegiatan terpilih?`,
            text: 'Data yang dihapus tidak dapat dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                const ids = Array.from(selectedLogs).map(cb => parseInt(cb.dataset.id));
                this.logs = this.logs.filter(log => !ids.includes(log.id));
                this.saveToLocalStorage();
                this.render();
                Swal.fire('Berhasil!', `${selectedLogs.length} kegiatan berhasil dihapus.`, 'success');
            }
        });
    }

    bulkMarkComplete() {
        const selectedLogs = document.querySelectorAll('.log-checkbox:checked');
        if (selectedLogs.length === 0) {
            alert('Pilih minimal satu kegiatan untuk ditandai selesai');
            return;
        }
        selectedLogs.forEach(checkbox => {
            const id = parseInt(checkbox.dataset.id);
            const log = this.logs.find(l => l.id === id);
            if (log) {
                log.status = 'completed';
            }
        });
        this.saveToLocalStorage();
        this.render();
        this.showSuccessToast(`${selectedLogs.length} kegiatan berhasil ditandai selesai!`);
    }

    searchLogs(query) {
        const filteredLogs = this.logs.filter(log => 
            log.activity.toLowerCase().includes(query.toLowerCase()) ||
            log.project?.toLowerCase().includes(query.toLowerCase()) ||
            log.notes?.toLowerCase().includes(query.toLowerCase())
        );
        this.renderFilteredLogs(filteredLogs);
    }

    filterByDateRange(startDate, endDate) {
        const filteredLogs = this.logs.filter(log => {
            const logDate = new Date(log.date);
            return logDate >= new Date(startDate) && logDate <= new Date(endDate);
        });
        this.renderFilteredLogs(filteredLogs);
    }

    renderFilteredLogs(filteredLogs) {
        const logList = document.getElementById('logList');
        const emptyState = document.getElementById('emptyState');
        if (filteredLogs.length === 0) {
            emptyState.style.display = 'block';
            logList.innerHTML = '';
            logList.appendChild(emptyState);
            return;
        }
        emptyState.style.display = 'none';
        logList.innerHTML = '';
        filteredLogs.forEach((log, index) => {
            const logItem = this.createLogCard(log, index);
            logList.appendChild(logItem);
        });
    }

    createLogCard(log, index) {
        const logItem = document.createElement('div');
        logItem.className = `log-card p-6 rounded-2xl slide-in ${log.status === 'completed' ? 'completed' : ''}`;
        logItem.style.animationDelay = `${index * 0.1}s`;
        logItem.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-3 flex-wrap">
                        <input type="checkbox" class="log-checkbox" data-id="${log.id}">
                        <span class="date-badge">${this.formatDate(log.date)}</span>
                        <span class="type-badge ${log.type === 'meeting' ? 'meeting' : ''}">${this.getTypeIcon(log.type)} ${this.getTypeLabel(log.type)}</span>
                        <span class="duration-badge">${log.duration} jam</span>
                        <span class="priority-badge ${log.priority}">${this.getPriorityIcon(log.priority)} ${this.getPriorityLabel(log.priority)}</span>
                        <span class="status-badge ${log.status}">${this.getStatusIcon(log.status)} ${this.getStatusLabel(log.status)}</span>
                    </div>
                    ${log.project ? `<h4 class="text-sm font-bold text-purple-600 mb-1">🚀 Project: ${log.project}</h4>` : ''}
                    <h3 class="text-lg font-bold text-gray-800 mb-2">${log.activity}</h3>
                    ${log.notes ? `<p class="text-gray-600 text-sm mb-2">📝 ${log.notes}</p>` : ''}
                    <p class="text-gray-600 text-sm flex items-center">
                        <span class="mr-2">🕐</span>
                        Ditambahkan ${this.formatTimestamp(log.timestamp)}
                        ${log.lastModified ? ` • Diubah ${this.formatTimestamp(log.lastModified)}` : ''}
                    </p>
                </div>
                <div class="flex flex-col gap-2 ml-4">
                    <button onclick="app.toggleStatus(${log.id})" 
                            class="complete-btn text-white p-2 rounded-full transition duration-200" 
                            title="Ubah Status">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </button>
                    <button onclick="app.editLog(${log.id})" 
                            class="edit-btn text-white p-2 rounded-full transition duration-200" 
                            title="Edit">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="app.deleteLog(${log.id})" 
                            class="delete-btn text-white p-2 rounded-full transition duration-200" 
                            title="Hapus">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        return logItem;
    }

    saveToLocalStorage() {
        localStorage.setItem('interntrack_logs', JSON.stringify(this.logs));
    }

    clearForm() {
        document.getElementById('activity').value = '';
        document.getElementById('duration').value = '';
        document.getElementById('type').value = '';
        document.getElementById('priority').value = '';
        document.getElementById('status').value = '';
        document.getElementById('project').value = '';
        document.getElementById('notes').value = '';
        document.getElementById('projectField').classList.add('hidden');
        document.getElementById('project').required = false;
        document.getElementById('date').valueAsDate = new Date();
    }

    showSuccessToast(message = '✅ Kegiatan berhasil disimpan!') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: message,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    getTypeLabel(type) {
        const labels = { 'project': 'Project', 'meeting': 'Meeting', 'learning': 'Pembelajaran', 'presentation': 'Presentasi', 'other': 'Lainnya' };
        return labels[type] || type;
    }

    getTypeIcon(type) {
        const icons = { 'project': '🚀', 'meeting': '👥', 'learning': '📚', 'presentation': '📽️', 'other': '📋' };
        return icons[type] || '📋';
    }

    getPriorityLabel(priority) {
        const labels = { 'high': 'Tinggi', 'medium': 'Sedang', 'low': 'Rendah' };
        return labels[priority] || priority;
    }

    getPriorityIcon(priority) {
        const icons = { 'high': '🔥', 'medium': '⚡', 'low': '🌱' };
        return icons[priority] || '⚡';
    }

    getStatusLabel(status) {
        const labels = { 'pending': 'Belum Dimulai', 'in-progress': 'Sedang Dikerjakan', 'completed': 'Selesai' };
        return labels[status] || status;
    }

    getStatusIcon(status) {
        const icons = { 'pending': '⏳', 'in-progress': '🔄', 'completed': '✅' };
        return icons[status] || '⏳';
    }

    filterLogs(filteredLogs) {
        const logList = document.getElementById('logList');
        const emptyState = document.getElementById('emptyState');
        logList.innerHTML = '';
        if (filteredLogs.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'block';
                logList.appendChild(emptyState);
            }
            this.updateBulkDeleteBtn();
            return;
        }
        if (emptyState) emptyState.style.display = 'none';
        filteredLogs.forEach((log, index) => {
            const logItem = this.createLogCard(log, index);
            logList.appendChild(logItem);
        });
        this.updateBulkDeleteBtn();
    }

    renderLogs() {
        let filteredLogs = [...this.logs];
        if (this.currentFilter !== 'all') {
            if (this.currentFilter === 'high') {
                filteredLogs = filteredLogs.filter(log => log.priority === 'high');
            } else {
                filteredLogs = filteredLogs.filter(log => log.status === this.currentFilter);
            }
        }
        this.filterLogs(filteredLogs);
        this.updateBulkDeleteBtn();
    }

    renderStats() {
        const totalLogs = this.logs.length;
        const totalHours = this.logs.reduce((sum, log) => sum + log.duration, 0);
        const completedTasks = this.logs.filter(log => log.status === 'completed').length;

        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        const thisWeekHours = this.logs
            .filter(log => new Date(log.date) >= startOfWeek)
            .reduce((sum, log) => sum + log.duration, 0);

        const progressPercent = totalLogs > 0 ? Math.round((completedTasks / totalLogs) * 100) : 0;

        document.getElementById('totalLogs').textContent = totalLogs;
        document.getElementById('totalHours').textContent = totalHours.toFixed(1);
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('thisWeek').textContent = thisWeekHours.toFixed(1);
        document.getElementById('progressPercent').textContent = progressPercent + '%';
        document.getElementById('progressFill').style.width = progressPercent + '%';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    render() {
        console.log('Render dipanggil, logs:', this.logs, 'filter:', this.currentFilter);
        this.renderLogs();
        this.renderStats();
    }

    updateBulkDeleteBtn() {
        const btn = document.getElementById('bulkDeleteBtn');
        if (!btn) return;
        const checked = document.querySelectorAll('.log-checkbox:checked').length;
        btn.style.display = checked > 0 ? '' : 'none';
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new EnhancedInternTrack();
});

//index.html

        // Global variables
        let currentUser = null;
        let studyData = {
            subjects: [],
            studyTime: 0,
            streak: 0,
            goals: []
        };
        let timerInterval = null;
        let timerMinutes = 25;
        let timerSeconds = 0;
        let isTimerRunning = false;
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();
        // Tambahkan audio bell
        const bellAudio = new Audio('bell100%.mp3');

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadUserData();
            if (currentUser) {
                document.getElementById('nameModal').classList.remove('show');
                initializeApp();
            }
            window.lastContinuedSubjectName = null;
            window.lastContinuedSubjectIndex = null;
            updateActiveSubjectName();
            renderFAQQuestions(); // Render FAQ questions when the page loads
        });

        // Name input handling
        function handleNameKeyPress(event) {
            if (event.key === 'Enter') {
                saveName();
            }
        }

        function saveName() {
            const nameInput = document.getElementById('nameInput');
            const name = nameInput.value.trim();
            
            if (name) {
                currentUser = name;
                localStorage.setItem('eduMentorUser', name);
                document.getElementById('nameModal').classList.remove('show');
                showNotification(`Selamat datang, ${name}! 🎉`);
                initializeApp();
            } else {
                showNotification('Silakan masukkan nama Anda terlebih dahulu', 'error');
            }
        }

        function loadUserData() {
            const savedUser = localStorage.getItem('eduMentorUser');
            if (savedUser) {
                currentUser = savedUser;
                const savedData = localStorage.getItem(`eduMentorData_${savedUser}`);
                if (savedData) {
                    studyData = JSON.parse(savedData);
                    // Patch: pastikan setiap subject punya targetTime
                    if (studyData.subjects && Array.isArray(studyData.subjects)) {
                        studyData.subjects.forEach(subject => {
                            if (!subject.targetTime || isNaN(parseFloat(subject.targetTime))) {
                                subject.targetTime = subject.studyTime || 25;
                            }
                            if (!subject.totalTime || isNaN(parseFloat(subject.totalTime))) {
                                subject.totalTime = 0;
                            }
                            if (!subject.lastMilestone || isNaN(parseFloat(subject.lastMilestone))) {
                                subject.lastMilestone = 0;
                            }
                            if (!subject.runningTimerElapsed || isNaN(parseFloat(subject.runningTimerElapsed))) {
                                subject.runningTimerElapsed = 0;
                            }
                        });
                    }
                }
            }
        }

        function saveUserData() {
            if (currentUser) {
                localStorage.setItem(`eduMentorData_${currentUser}`, JSON.stringify(studyData));
            }
        }

        function initializeApp() {
            document.getElementById('userName').textContent = currentUser;
            updateDashboard();
            generateCalendar();
            loadAIRecommendations();
        }

        // Tab switching
        function showTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
            
            if (tabName === 'learning-path') {
                updateLearningPath();
            } else if (tabName === 'study-planner') {
                updateStudyPlanner();
            } else if (tabName === 'analytics') {
                updateAnalytics();
            }
        }

        // Subject management
        function openSubjectModal() {
            document.getElementById('subjectModal').classList.add('show');
        }

        function closeSubjectModal() {
            document.getElementById('subjectModal').classList.remove('show');
            document.getElementById('subjectName').value = '';
            document.getElementById('subjectDescription').value = '';
            document.getElementById('subjectDifficulty').value = 'beginner';
            document.getElementById('subjectTime').value = 25; // Reset timer option
        }

        // 2. Update progress calculation and milestone logic in updateTimer
        function addNewSubject() {
            const name = document.getElementById('subjectName').value.trim();
            const description = document.getElementById('subjectDescription').value.trim();
            const difficulty = document.getElementById('subjectDifficulty').value;
            const time = parseInt(document.getElementById('subjectTime').value);
            // Cek nama subject sudah ada (case-insensitive)
            const nameExists = studyData.subjects.some(s => s.name.trim().toLowerCase() === name.toLowerCase());
            if (nameExists) {
                Swal.fire('Gagal', 'Nama mata pelajaran sudah ada, gunakan nama lain!', 'error');
                return;
            }
            if (name && description && time > 0) {
                const newSubject = {
                    name: name,
                    description: description,
                    difficulty: difficulty,
                    progress: 0,
                    totalTime: 0,
                    completed: false,
                    studyTime: time,
                    targetTime: time,
                    lastMilestone: 0, // milestone progress
                    runningTimerElapsed: 0,
                    timestamp: Date.now() // Add timestamp for sorting
                };
                studyData.subjects.push(newSubject);
                saveUserData();
                closeSubjectModal();
                // Reset to first page when adding new subject
                window.currentSchedulePage = 1;
                updateDashboard();
                showNotification(`Mata pelajaran "${name}" berhasil ditambahkan! 📚`);
            } else {
                showNotification('Silakan lengkapi semua field', 'error');
            }
        }

        // Dashboard updates
        function updateDashboard() {
            updateMetrics();
            updateTodaySchedule();
            updatePrioritySubjects();
        }

        function updateMetrics() {
            const totalSubjects = studyData.subjects.length;
            const completedSubjects = studyData.subjects.filter(s => s.completed).length;
            const overallProgress = totalSubjects > 0 ? 
                Math.round(studyData.subjects.reduce((sum, s) => sum + s.progress, 0) / totalSubjects) : 0;
            
            document.getElementById('overallProgress').textContent = `${overallProgress}%`;
            document.getElementById('completedCourses').textContent = completedSubjects;
            document.getElementById('studyTime').textContent = `${Math.round(studyData.studyTime / 60)}h`;
            document.getElementById('studyStreak').textContent = studyData.streak;
        }

        // 3. On dashboard render, always use lastMilestone as minimum progress
        function updateTodaySchedule() {
            const scheduleContainer = document.getElementById('todaySchedule');
            scheduleContainer.innerHTML = '';
            
            if (studyData.subjects.length === 0) {
                scheduleContainer.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-gray-500">Belum ada mata pelajaran. Klik "Tambah Mata Pelajaran" untuk menambahkan.</p>
                    </div>
                `;
                // Sembunyikan tombol aksi jika tidak ada subject
                const actions = document.getElementById('selectedActions');
                if (actions) actions.style.display = 'none';
                return;
            }
            
            // Siapkan array untuk menampung id subject terpilih
            if (!window.selectedSubjectIndexes) window.selectedSubjectIndexes = [];
            
            // Sort subjects: newest first (by creation time or add timestamp)
            const sortedSubjects = [...studyData.subjects].sort((a, b) => {
                // If subjects have timestamp, sort by timestamp, otherwise keep original order
                if (a.timestamp && b.timestamp) {
                    return b.timestamp - a.timestamp;
                }
                // For existing subjects without timestamp, newer ones (higher index) come first
                return studyData.subjects.indexOf(b) - studyData.subjects.indexOf(a);
            });
            
            // Pagination variables
            const itemsPerPage = 5;
            const currentPage = window.currentSchedulePage || 1;
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedSubjects = sortedSubjects.slice(startIndex, endIndex);
            
            // Render paginated subjects
            paginatedSubjects.forEach((subject, displayIndex) => {
                const originalIndex = studyData.subjects.indexOf(subject);
                const scheduleItem = document.createElement('div');
                let totalTime = (parseFloat(subject.totalTime) || 0) + (parseFloat(subject.runningTimerElapsed) || 0);
                let targetTime = parseFloat(subject.targetTime);
                if (!targetTime || isNaN(targetTime)) targetTime = 25;
                let progressRaw = (totalTime / targetTime) * 100;
                let progress = Math.floor(progressRaw);
                if (progress > 100) progress = 100;
                if (progress < 0 || isNaN(progress)) progress = 0;
                // Use lastMilestone as minimum progress
                if (subject.lastMilestone && progress < subject.lastMilestone) {
                    progress = subject.lastMilestone;
                }
                subject.progress = progress;
                subject.completed = (progress === 100);
                scheduleItem.className = 'learning-path-item p-4 mb-4';
                scheduleItem.setAttribute('data-subject-name', subject.name); // Tambahkan atribut unik
                if (subject.completed) scheduleItem.classList.add('completed');
                // Checkbox centang
                const checked = window.selectedSubjectIndexes.includes(originalIndex) ? 'checked' : '';
                scheduleItem.innerHTML = `
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                            <input type="checkbox" onchange="toggleSelectSubject(${originalIndex})" ${checked} style="margin-right:8px;transform:scale(1.2);" />
                            <div>
                                <h4 class="font-bold text-gray-800">${subject.name}</h4>
                                <p class="text-sm text-gray-600">${subject.description}</p>
                                <div class="flex items-center space-x-2 mt-2">
                                    <span class="skill-badge">${subject.difficulty}</span>
                                    <span class="text-sm text-gray-500">Target: ${subject.targetTime || subject.studyTime || 25} menit</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-purple-600">${progress}%</div>
                            <div class="w-20 h-2 bg-gray-200 rounded-full mt-2">
                                <div class="h-full bg-purple-600 rounded-full" style="width: ${progress}%"></div>
                            </div>
                            <button class="btn-primary mt-2" onclick="continueStudy('${subject.name}')">Lanjutkan</button>
                        </div>
                    </div>
                `;
                
                scheduleContainer.appendChild(scheduleItem);
            });
            
            // Add pagination controls
            const totalPages = Math.ceil(sortedSubjects.length / itemsPerPage);
            if (totalPages > 1) {
                const paginationDiv = document.createElement('div');
                paginationDiv.className = 'flex justify-center items-center space-x-2 mt-6';
                paginationDiv.innerHTML = `
                    <button class="btn-primary" onclick="changeSchedulePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} style="${currentPage === 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}">❮ Sebelumnya</button>
                    <span class="text-gray-600 font-medium">Halaman ${currentPage} dari ${totalPages}</span>
                    <button class="btn-primary" onclick="changeSchedulePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} style="${currentPage === totalPages ? 'opacity: 0.5; cursor: not-allowed;' : ''}">Selanjutnya ❯</button>
                `;
                scheduleContainer.appendChild(paginationDiv);
            }
            
            // Tampilkan/sembunyikan tombol aksi sesuai jumlah centang
            const actions = document.getElementById('selectedActions');
            if (actions) {
                if (window.selectedSubjectIndexes.length > 0) {
                    actions.style.display = '';
                } else {
                    actions.style.display = 'none';
                }
            }
        }

        function updatePrioritySubjects() {
            const prioritySelect = document.getElementById('prioritySubject');
            prioritySelect.innerHTML = '';
            
            studyData.subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.name;
                option.textContent = subject.name;
                prioritySelect.appendChild(option);
            });
        }

        class RobustTimer {
            constructor() {
                this.startTime = null;
                this.duration = 0; // in seconds
                this.isRunning = false;
                this.intervalId = null;
                this.callbacks = {
                    onTick: null,
                    onComplete: null,
                    onUpdate: null
                };
            }
        
            start(durationMinutes, callbacks = {}) {
                this.duration = durationMinutes * 60; // Convert to seconds
                this.startTime = Date.now();
                this.isRunning = true;
                this.callbacks = { ...this.callbacks, ...callbacks };
                
                // Start the display update interval
                this.intervalId = setInterval(() => {
                    this.updateDisplay();
                }, 100); // Update every 100ms for smooth display
                
                this.updateDisplay();
            }
        
            updateDisplay() {
                if (!this.isRunning) return;
                
                const now = Date.now();
                const elapsed = Math.floor((now - this.startTime) / 1000); // seconds elapsed
                const remaining = Math.max(0, this.duration - elapsed);
                
                const minutes = Math.floor(remaining / 60);
                const seconds = remaining % 60;
                
                // Call the tick callback with time data
                if (this.callbacks.onTick) {
                    this.callbacks.onTick({
                        minutes,
                        seconds,
                        elapsed,
                        remaining,
                        isComplete: remaining === 0
                    });
                }
                
                // Check if timer is complete
                if (remaining === 0) {
                    this.complete();
                }
            }
        
            complete() {
                this.isRunning = false;
                if (this.intervalId) {
                    clearInterval(this.intervalId);
                    this.intervalId = null;
                }
                
                if (this.callbacks.onComplete) {
                    this.callbacks.onComplete();
                }
            }
        
            stop() {
                this.isRunning = false;
                if (this.intervalId) {
                    clearInterval(this.intervalId);
                    this.intervalId = null;
                }
            }
        
            reset() {
                this.stop();
                this.startTime = null;
                this.duration = 0;
            }
        
            getElapsedTime() {
                if (!this.startTime) return 0;
                return Math.floor((Date.now() - this.startTime) / 1000);
            }
        
            getRemainingTime() {
                if (!this.startTime) return 0;
                const elapsed = this.getElapsedTime();
                return Math.max(0, this.duration - elapsed);
            }
        }
        
        // Modified implementation for your EduMentor app
        let robustTimer = new RobustTimer();
        
        // Replace your existing timer functions with these:
        function startTimer() {
            if (robustTimer.isRunning) return;
            
            const selectedDuration = parseInt(document.getElementById('timerSelect').value) || 25;
            
            document.getElementById('timerBtn').style.display = 'none';
            document.getElementById('timerSelect').disabled = true;
            
            robustTimer.start(selectedDuration, {
                onTick: (timeData) => {
                    // Update display
                    const display = `${timeData.minutes.toString().padStart(2, '0')}:${timeData.seconds.toString().padStart(2, '0')}`;
                    document.getElementById('timerDisplay').textContent = display;
                    
                    // Update subject progress (your existing logic)
                    updateSubjectProgress(timeData.elapsed / 60); // Convert to minutes
                },
                onComplete: () => {
                    // Timer completed
                    if (typeof bellAudio !== 'undefined' && bellAudio) {
                        bellAudio.play();
                    }
                    
                    // Save progress and reset
                    if (typeof window.lastContinuedSubjectIndex === 'number' && studyData.subjects[window.lastContinuedSubjectIndex]) {
                        const subject = studyData.subjects[window.lastContinuedSubjectIndex];
                        subject.totalTime += subject.runningTimerElapsed || 0;
                        subject.runningTimerElapsed = 0;
                        saveUserData();
                    }
                    
                    resetTimer();
                    showNotification('Sesi selesai! Istirahat! 🎉');
                    updateMetrics();
                    updateDashboard();
                }
            });
        }
        
        function resetTimer() {
            robustTimer.reset();
            
            const defaultDuration = 25;
            document.getElementById('timerDisplay').textContent = `${defaultDuration.toString().padStart(2, '0')}:00`;
            document.getElementById('timerBtn').style.display = 'block';
            document.getElementById('timerSelect').disabled = false;
            
            // Reset subject progress (your existing logic)
            if (typeof window.lastContinuedSubjectIndex === 'number' && studyData.subjects[window.lastContinuedSubjectIndex]) {
                const subject = studyData.subjects[window.lastContinuedSubjectIndex];
                let targetTime = parseFloat(subject.targetTime);
                if (!targetTime || isNaN(targetTime)) targetTime = 25;
                
                let totalTime = (parseFloat(subject.totalTime) || 0) + (parseFloat(subject.runningTimerElapsed) || 0);
                let progressRaw = (totalTime / targetTime) * 100;
                let milestone = 0;
                
                if (progressRaw >= 75) milestone = 75;
                else if (progressRaw >= 50) milestone = 50;
                else if (progressRaw >= 25) milestone = 25;
                
                if (milestone === 0) {
                    subject.totalTime = 0;
                    subject.runningTimerElapsed = 0;
                    subject.progress = 0;
                    subject.completed = false;
                } else {
                    subject.totalTime = (milestone / 100) * targetTime;
                    subject.runningTimerElapsed = 0;
                    subject.progress = milestone;
                    subject.completed = (milestone === 100);
                }
            }
            
            // Reset labels
            window.lastContinuedSubjectName = null;
            window.lastContinuedSubjectIndex = null;
            updateActiveSubjectName();
            saveUserData();
            updateDashboard();
        }
        
        function updateSubjectProgress(elapsedMinutes) {
            if (typeof window.lastContinuedSubjectIndex === 'number' && studyData.subjects[window.lastContinuedSubjectIndex]) {
                const subject = studyData.subjects[window.lastContinuedSubjectIndex];
                let targetTime = parseFloat(subject.targetTime);
                if (!targetTime || isNaN(targetTime)) targetTime = 25;
                
                // Update running timer elapsed
                subject.runningTimerElapsed = elapsedMinutes;
                
                // Calculate progress
                let totalTime = (parseFloat(subject.totalTime) || 0) + (parseFloat(subject.runningTimerElapsed) || 0);
                let progressRaw = (totalTime / targetTime) * 100;
                let progress = Math.floor(progressRaw);
                if (progress > 100) progress = 100;
                if (progress < 0 || isNaN(progress)) progress = 0;
                
                // Milestone logic
                const milestones = [25, 50, 75, 100];
                let milestoneReached = subject.lastMilestone || 0;
                
                for (let i = 0; i < milestones.length; i++) {
                    if (progress >= milestones[i] && milestoneReached < milestones[i]) {
                        milestoneReached = milestones[i];
                        subject.lastMilestone = milestoneReached;
                        saveUserData();
                        showNotification(`Selamat! Anda telah mencapai ${milestoneReached}% dari target! 🎉`);
                        
                        if (milestoneReached === 100) {
                            bellAudio.play();
                        }
                        break;
                    }
                }
                
                // Ensure progress doesn't go below lastMilestone
                if (progress < subject.lastMilestone) {
                    progress = subject.lastMilestone;
                }
                
                subject.progress = progress;
                subject.completed = (progress === 100);
                
                // Auto-pause if completed
                if (subject.completed) {
                    robustTimer.stop();
                    document.getElementById('timerBtn').style.display = 'block';
                    document.getElementById('timerSelect').disabled = false;
                }
                
                // Update DOM
                updateDOMProgress(subject.name, progress);
                saveUserData();
            }
        }
        
        function updateDOMProgress(subjectName, progress) {
            const scheduleContainer = document.getElementById('todaySchedule');
            if (scheduleContainer && window.lastContinuedSubjectName) {
                const card = scheduleContainer.querySelector(`.learning-path-item[data-subject-name="${window.lastContinuedSubjectName}"]`);
                if (card) {
                    const percentEl = card.querySelector('.text-2xl.font-bold.text-purple-600');
                    if (percentEl) percentEl.textContent = progress + '%';
                    
                    const barEl = card.querySelector('.h-full.bg-purple-600.rounded-full');
                    if (barEl) barEl.style.width = progress + '%';
                    
                    if (progress === 100) card.classList.add('completed');
                    else card.classList.remove('completed');
                }
            }
        }
        
        function changeTimerDuration() {
            const newDuration = parseInt(document.getElementById('timerSelect').value);
            document.getElementById('timerDisplay').textContent = `${newDuration.toString().padStart(2, '0')}:00`;
        }
        
        // Enhanced Page Visibility API for better handling
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                // Tab became inactive - timer continues running automatically
                console.log('Tab inactive - timer continues in background');
            } else {
                // Tab became active - force display update
                console.log('Tab active - syncing timer display');
                if (robustTimer.isRunning) {
                    robustTimer.updateDisplay();
                }
            }
        });
        
        // Additional recovery mechanism on focus
        window.addEventListener('focus', function() {
            if (robustTimer.isRunning) {
                robustTimer.updateDisplay();
            }
        });
        
        // Periodic sync every 5 seconds as backup
        setInterval(() => {
            if (robustTimer.isRunning) {
                robustTimer.updateDisplay();
            }
        }, 5000);

        function addMessageToChat(message, sender) {
            const chatContainer = document.getElementById('chatContainer');
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-bubble ${sender}-message`;
            
            if (sender === 'user') {
                messageDiv.innerHTML = `
                    <div class="text-right">
                        <div class="font-semibold text-white mb-1">${currentUser}</div>
                        <div class="text-white">${message}</div>
                    </div>
                `;
            } else {
                messageDiv.innerHTML = `
                    <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span class="text-white text-sm">🤖</span>
                        </div>
                        <div>
                            <div class="font-semibold text-gray-800 mb-1">EduMentor Chatbot</div>
                            <div class="text-gray-700">${message}</div>
                        </div>
                    </div>
                `;
            }
            
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        // Calendar functions
        function generateCalendar() {
            const calendarGrid = document.getElementById('calendarGrid');
            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                              'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            
            document.getElementById('calendarMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
            
            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            
            calendarGrid.innerHTML = '';
            
            // Day headers
            const dayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
            dayHeaders.forEach(day => {
                const headerDiv = document.createElement('div');
                headerDiv.className = 'calendar-day font-bold text-gray-600';
                headerDiv.textContent = day;
                calendarGrid.appendChild(headerDiv);
            });
            
            // Empty days
            for (let i = 0; i < firstDay; i++) {
                const emptyDiv = document.createElement('div');
                emptyDiv.className = 'calendar-day';
                calendarGrid.appendChild(emptyDiv);
            }
            
            // Days of month
            const today = new Date();
            for (let day = 1; day <= daysInMonth; day++) {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'calendar-day';
                dayDiv.textContent = day;
                
                if (currentYear === today.getFullYear() && 
                    currentMonth === today.getMonth() && 
                    day === today.getDate()) {
                    dayDiv.classList.add('today');
                }
                
                // Random study sessions for demo
                if (Math.random() > 0.7) {
                    dayDiv.classList.add('has-session');
                }
                
                calendarGrid.appendChild(dayDiv);
            }
        }

        function changeMonth(direction) {
            currentMonth += direction;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            } else if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            generateCalendar();
        }

        // Learning path functions
        function updateLearningPath() {
            const learningPathContainer = document.getElementById('learningPaths');
            learningPathContainer.innerHTML = '';
            
            studyData.subjects.forEach((subject, index) => {
                const pathItem = document.createElement('div');
                pathItem.className = 'learning-path-item p-6 mb-6';
                if (subject.completed) pathItem.classList.add('completed');
                else if (index === 0) pathItem.classList.add('current');
                
                pathItem.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="text-xl font-bold text-gray-800 mb-2">${subject.name}</h4>
                            <p class="text-gray-600 mb-4">${subject.description}</p>
                            <div class="flex items-center space-x-4 mb-4">
                                <span class="skill-badge">${subject.difficulty}</span>
                                <span class="text-sm text-gray-500">${subject.totalTime} menit belajar</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-3">
                                <div class="bg-purple-600 h-3 rounded-full transition-all duration-300" 
                                     style="width: ${subject.progress}%"></div>
                            </div>
                        </div>
                        <div class="text-right ml-6">
                            <div class="text-3xl font-bold text-purple-600">${subject.progress}%</div>
                            <button class="btn-primary mt-4" onclick="continueStudy('${subject.name}')">
                                Lanjutkan
                            </button>
                        </div>
                    </div>
                `;
                
                learningPathContainer.appendChild(pathItem);
            });
        }

        function continueStudy(subjectName) {
            const subjectIndex = studyData.subjects.findIndex(s => s.name === subjectName);
            if (subjectIndex !== -1) {
                window.lastContinuedSubjectName = subjectName;
                window.lastContinuedSubjectIndex = subjectIndex;
                const subject = studyData.subjects[subjectIndex];
                // Selalu gunakan timer default 25 menit setiap mulai sesi
                timerMinutes = 25;
                timerSeconds = 0;
                document.getElementById('timerDisplay').textContent = `25:00`;
                document.getElementById('timerSelect').disabled = true;
                if (!isTimerRunning) startTimer();
                saveUserData();
                updateDashboard();
                updateActiveSubjectName();
            }
        }

        // Study planner functions
        function updateStudyPlanner() {
            updatePrioritySubjects();
            updateStudyGoals();
        }

        function updateStudyGoals() {
            const goalsContainer = document.getElementById('studyGoals');
            goalsContainer.innerHTML = '';
            
            if (studyData.goals.length === 0) {
                studyData.goals = [
                    { text: 'Selesaikan 2 jam belajar harian', completed: false },
                    { text: 'Selesaikan kursus Matematika', completed: false },
                    { text: 'Pelajari 5 konsep baru pemrograman', completed: false }
                ];
                saveUserData();
            }
            
            studyData.goals.forEach((goal, index) => {
                const goalDiv = document.createElement('div');
                goalDiv.className = `p-3 rounded-lg border-2 ${goal.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`;
                goalDiv.innerHTML = `
                    <div class="flex items-center justify-between">
                        <span class="${goal.completed ? 'line-through text-gray-500' : 'text-gray-800'}">${goal.text}</span>
                        <input type="checkbox" ${goal.completed ? 'checked' : ''} 
                               onchange="toggleGoal(${index})" class="ml-2">
                    </div>
                `;
                goalsContainer.appendChild(goalDiv);
            });
        }

        function toggleGoal(index) {
            studyData.goals[index].completed = !studyData.goals[index].completed;
            saveUserData();
            updateStudyGoals();
        }

        function addNewGoal() {
            const goalText = prompt('Masukkan tujuan belajar Anda:');
            if (goalText) {
                studyData.goals.push({ text: goalText, completed: false });
                saveUserData();
                updateStudyGoals();
                showNotification('Tujuan baru ditambahkan! 🎯');
            }
        }

        function generateSchedule() {
            const availableTime = document.getElementById('availableTime').value;
            const learningStyle = document.getElementById('learningStyle').value;
            const prioritySubject = document.getElementById('prioritySubject').value;
            
            showNotification('AI sedang menghasilkan jadwal optimal Anda... 🤖');
            
            // Simulate AI processing
            setTimeout(() => {
                showNotification('Jadwal berhasil dihasilkan! Periksa kalender Anda. 📅');
                // In a real app, this would call the AI API to generate an actual schedule
            }, 2000);
        }

        // Analytics functions
        function updateAnalytics() {
            updateProgressChart();
            updateStudyTimeAnalytics();
            updatePerformanceInsights();
        }

        function updateProgressChart() {
            const chartContainer = document.getElementById('progressChart');
            chartContainer.innerHTML = '';
            
            studyData.subjects.forEach(subject => {
                const chartItem = document.createElement('div');
                chartItem.className = 'mb-4';
                chartItem.innerHTML = `                    <div class="flex justify-between items-center mb-2">
                        <span class="font-semibold text-gray-800">${subject.name}</span>
                        <span class="text-purple-600 font-bold">${subject.progress}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-4">
                        <div class="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-500" 
                             style="width: ${subject.progress}%"></div>
                    </div>
                `;
                chartContainer.appendChild(chartItem);
            });
        }

        function updateStudyTimeAnalytics() {
            const analyticsContainer = document.getElementById('studyTimeAnalytics');
            analyticsContainer.innerHTML = '';
            
            const totalTime = studyData.studyTime;
            const averageSession = totalTime > 0 ? Math.round(totalTime / 7) : 0;
            
            const analytics = [
                { label: 'Waktu Belajar Total', value: `${Math.round(totalTime / 60)}h ${totalTime % 60}m`, color: 'blue' },
                { label: 'Rata-rata Sesi', value: `${averageSession}m`, color: 'green' },
                { label: 'Streak Belajar', value: `${studyData.streak} hari`, color: 'purple' },
                { label: 'Mata Pelajaran Selesai', value: studyData.subjects.filter(s => s.completed).length, color: 'orange' }
            ];
            
            analytics.forEach(item => {
                const analyticsItem = document.createElement('div');
                analyticsItem.className = 'metric-card';
                analyticsItem.innerHTML = `
                    <div class="text-2xl font-bold text-${item.color}-600 mb-2">${item.value}</div>
                    <div class="text-gray-600 text-sm">${item.label}</div>
                `;
                analyticsContainer.appendChild(analyticsItem);
            });
        }

        function updatePerformanceInsights() {
            const insightsContainer = document.getElementById('performanceInsights');
            insightsContainer.innerHTML = '';
            
            const insights = [
                {
                    title: '📈 Kecepatan Belajar',
                    content: 'Anda belajar 15% lebih cepat dari pembelajar rata-rata!',
                    color: 'green'
                },
                {
                    title: '🎯 Area Fokus',
                    content: 'Pertimbangkan untuk menghabiskan lebih banyak waktu pada topik lanjutan.',
                    color: 'blue'
                },
                {
                    title: '⏰ Waktu Belajar Terbaik',
                    content: 'Kinerja Anda puncak antara 9-11 pagi.',
                    color: 'purple'
                },
                {
                    title: '🏆 Potensi Penghargaan',
                    content: 'Anda hanya 2 sesi lagi dari jadwal berikutnya!',
                    color: 'orange'
                }
            ];
            
            insights.forEach(insight => {
                const insightDiv = document.createElement('div');
                insightDiv.className = 'glass-card p-6 rounded-2xl';
                insightDiv.innerHTML = `
                    <h4 class="text-lg font-bold text-gray-800 mb-3">${insight.title}</h4>
                    <p class="text-gray-600">${insight.content}</p>
                `;
                insightsContainer.appendChild(insightDiv);
            });
        }

        // AI Recommendations
        async function loadAIRecommendations() {
            const recommendationsContainer = document.getElementById('aiRecommendations');
            recommendationsContainer.innerHTML = '<div class="loading-spinner"></div> Memuat rekomendasi...';
            
            try {
                const userContext = `Pengguna: ${currentUser}, Mata Pelajaran: ${studyData.subjects.map(s => s.name).join(', ')}, 
                                   Waktu Belajar: ${studyData.studyTime}menit, Progres: ${studyData.subjects.map(s => s.progress).join(', ')}%`;
                
                const response = await callGeminiAPI(`Berikan 3 rekomendasi belajar pendek berdasarkan: ${userContext}`);
                
                // Parse the response and create recommendation items
                const recommendations = response.split('\n').filter(line => line.trim()).slice(0, 3);
                
                recommendationsContainer.innerHTML = '';
                recommendations.forEach(rec => {
                    const recDiv = document.createElement('div');
                    recDiv.className = 'p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400';
                    recDiv.innerHTML = `<p class="text-blue-800 text-sm">${rec}</p>`;
                    recommendationsContainer.appendChild(recDiv);
                });
            } catch (error) {
                recommendationsContainer.innerHTML = `
                    <div class="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <p class="text-blue-800 text-sm">📚 Ulas kembali mata pelajaran yang lemah Anda</p>
                    </div>
                    <div class="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                        <p class="text-green-800 text-sm">⏰ Ambil break teratur setiap 25 menit</p>
                    </div>
                    <div class="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                        <p class="text-purple-800 text-sm">🎯 Tetapkan tujuan belajar harian spesifik</p>
                    </div>
                    <div class="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <p class="text-orange-800 text-sm">✅ Centang mata pelajaran yang ingin dihapus dan direset</p>
                    </div>
                `;
            }
        }

        // Utility functions
        function showNotification(message, type = 'success') {
            const notification = document.getElementById('notification');
            const notificationText = document.getElementById('notificationText');
            
            notificationText.textContent = message;
            notification.className = `notification ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        function showProfile() {
            Swal.fire({
                title: `Profil: ${currentUser}`,
                html: `<div style='text-align:left'>
                    <b>Waktu Belajar Total:</b> ${Math.round(studyData.studyTime / 60)} jam<br>
                    <b>Mata Pelajaran Selesai:</b> ${studyData.subjects.filter(s => s.completed).length}<br>
                    <b>Streak:</b> ${studyData.streak} hari
                </div>`,
                icon: 'info',
                confirmButtonText: 'Tutup'
            });
        }

        function updateActiveSubjectName() {
            const el = document.getElementById('activeSubjectName');
            if (!el) return;
            if (window.lastContinuedSubjectName) {
                el.textContent = `Sedang belajar: ${window.lastContinuedSubjectName}`;
            } else {
                el.textContent = 'Belum ada jadwal yang dipilih';
            }
        }

        // Fungsi toggle centang subject
        function toggleSelectSubject(index) {
            if (!window.selectedSubjectIndexes) window.selectedSubjectIndexes = [];
            const idx = window.selectedSubjectIndexes.indexOf(index);
            if (idx === -1) {
                window.selectedSubjectIndexes.push(index);
            } else {
                window.selectedSubjectIndexes.splice(idx, 1);
            }
            updateTodaySchedule(); // update visibilitas tombol aksi
        }

        // Hapus subject terpilih
        function deleteSelectedSubjects() {
            if (!window.selectedSubjectIndexes || window.selectedSubjectIndexes.length === 0) {
                showNotification('Pilih jadwal yang ingin dihapus!', 'error');
                return;
            }
            Swal.fire({
                title: 'Hapus Jadwal Terpilih?',
                text: 'Yakin ingin menghapus semua jadwal terpilih?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Hapus!',
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.selectedSubjectIndexes.sort((a,b)=>b-a).forEach(idx => {
                        studyData.subjects.splice(idx, 1);
                    });
                    window.selectedSubjectIndexes = [];
                    saveUserData();
                    updateDashboard();
                    Swal.fire('Berhasil!','Jadwal terpilih berhasil dihapus!','success');
                }
            });
        }

        // Reset subject terpilih
        function resetSelectedSubjects() {
            if (!window.selectedSubjectIndexes || window.selectedSubjectIndexes.length === 0) {
                showNotification('Pilih jadwal yang ingin direset!', 'error');
                return;
            }
            Swal.fire({
                title: 'Reset Jadwal Terpilih?',
                text: 'Yakin ingin mereset semua jadwal terpilih?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya, Reset!',
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.selectedSubjectIndexes.forEach(idx => {
                        if (studyData.subjects[idx]) {
                            studyData.subjects[idx].totalTime = 0;
                            studyData.subjects[idx].progress = 0;
                            studyData.subjects[idx].completed = false;
                            studyData.subjects[idx].lastMilestone = 0;
                            studyData.subjects[idx].runningTimerElapsed = 0; // Reset waktu berjalan
                        }
                    });
                    saveUserData();
                    updateDashboard();
                    Swal.fire('Berhasil!','Jadwal terpilih berhasil direset!','success');
                    // Reset timer belajar ke default
                    timerMinutes = parseInt(document.getElementById('timerSelect').value) || 25;
                    timerSeconds = 0;
                    document.getElementById('timerDisplay').textContent = `${timerMinutes.toString().padStart(2, '0')}:00`;
                    document.getElementById('timerSelect').disabled = false;
                    document.getElementById('timerBtn').style.display = 'block'; // Tampilkan tombol Mulai kembali
                    isTimerRunning = false;
                    clearInterval(timerInterval);
                    // Reset label subject aktif
                    window.lastContinuedSubjectName = null;
                    window.lastContinuedSubjectIndex = null;
                    updateActiveSubjectName();
                }
            });
        }

        // FAQ Chatbot Data
        const faqData = [
            {
                q: 'Bagaimana cara menambah mata pelajaran?',
                a: 'Klik tombol "+ Tambah Mata Pelajaran" di dashboard, isi data yang diperlukan, lalu klik "Tambah".'
            },
            {
                q: 'Bagaimana cara mengatur timer belajar?',
                a: 'Pilih durasi timer di dropdown pada panel Timer Belajar, lalu klik "Mulai" untuk memulai sesi.'
            },
            {
                q: 'Bagaimana cara menghapus atau mereset mata pelajaran?',
                a: 'Centang mata pelajaran yang ingin dihapus atau direset, lalu klik tombol "Hapus Terpilih" atau "Reset Terpilih".'
            },
            {
                q: 'Apa itu progres belajar dan bagaimana cara meningkatkannya?',
                a: 'Progres belajar adalah persentase waktu belajar terhadap target. Tingkatkan dengan menyelesaikan sesi belajar.'
            },
            {
                q: 'Bagaimana cara menggunakan perencana belajar?',
                a: 'Buka tab "Perencana Belajar", atur preferensi, lalu klik "Hasilkan Jadwal Optimal".'
            },
            {
                q: 'Bagaimana cara menambah tujuan belajar?',
                a: 'Di tab "Perencana Belajar", klik "+ Tambah Tujuan Baru" dan masukkan tujuan Anda.'
            },
            {
                q: 'Bagaimana cara melanjutkan belajar pada mata pelajaran tertentu?',
                a: 'Klik tombol "Lanjutkan" pada mata pelajaran yang ingin Anda pelajari di dashboard.'
            },
            {
                q: 'Apa itu milestone dan bagaimana cara mencapainya?',
                a: 'Milestone adalah pencapaian progres belajar (25%, 50%, 75%, 100%). Capai dengan menyelesaikan sesi belajar secara konsisten.'
            },
            {
                q: 'Bagaimana cara mengoptimalkan waktu belajar?',
                a: 'Gunakan teknik Pomodoro (25 menit fokus), istirahat teratur, dan fokus pada satu mata pelajaran per sesi.'
            },
            {
                q: 'Apa manfaat dari tracking progres belajar?',
                a: 'Tracking progres membantu Anda melihat kemajuan, mengidentifikasi area yang perlu perbaikan, dan tetap termotivasi.'
            },
            {
                q: 'Bagaimana cara mengatasi kebosanan saat belajar?',
                a: 'Variasikan mata pelajaran, gunakan timer untuk sesi pendek, dan tetapkan tujuan kecil yang mudah dicapai.'
            },
            {
                q: 'Apa itu streak belajar dan bagaimana mempertahankannya?',
                a: 'Streak adalah jumlah hari berturut-turut Anda belajar. Pertahankan dengan belajar minimal 1 sesi per hari.'
            },
            {
                q: 'Bagaimana cara mengatur prioritas mata pelajaran?',
                a: 'Identifikasi mata pelajaran yang paling sulit atau penting, lalu alokasikan lebih banyak waktu untuk itu.'
            },
            {
                q: 'Apa tips untuk belajar yang efektif?',
                a: 'Buat jadwal teratur, gunakan teknik active recall, review materi secara berkala, dan istirahat yang cukup.'
            },
            {
                q: 'Bagaimana cara mengukur keberhasilan belajar?',
                a: 'Lihat progres di dashboard, catat milestone yang dicapai, dan evaluasi pemahaman materi secara berkala.'
            }
        ];

        // Render FAQ Questions
        function renderFAQQuestions() {
            const faqContainer = document.getElementById('faqQuestions');
            faqContainer.innerHTML = '';
            faqData.forEach((item, idx) => {
                const btn = document.createElement('button');
                btn.className = 'p-4 bg-blue-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all text-left';
                btn.onclick = function() { sendFAQMessage(item.q); };
                btn.innerHTML = `<div class="font-semibold text-blue-800">${item.q}</div>`;
                faqContainer.appendChild(btn);
            });
        }

        // Chatbot send message (FAQ)
        function sendFAQMessage(msg) {
            let message = msg;
            if (!message) return;
            addMessageToChat(message, 'user');
            // Cari jawaban
            const found = faqData.find(item => item.q.toLowerCase() === message.toLowerCase());
            let answer = found ? found.a : 'Maaf, pertanyaan tidak tersedia. Silakan pilih dari daftar.';
            setTimeout(() => {
                addMessageToChat(answer, 'ai');
            }, 400);
        }



        // Pagination function for schedule
        function changeSchedulePage(page) {
            if (page < 1) return;
            const totalPages = Math.ceil(studyData.subjects.length / 5);
            if (page > totalPages) return;
            window.currentSchedulePage = page;
            updateTodaySchedule();
        }

        // Auto-save data every 30 seconds
        setInterval(saveUserData, 30000);

        function updateActiveSubjectProgress(subjectName, progress) {
            // Fungsi ini sudah tidak diperlukan karena updateTimer sudah menangani update progress
            // Hanya simpan data ke localStorage
            if (window.lastContinuedSubjectName === subjectName) {
                const subjectIndex = studyData.subjects.findIndex(s => s.name === subjectName);
                if (subjectIndex !== -1) {
                    studyData.subjects[subjectIndex].progress = progress;
                    studyData.subjects[subjectIndex].completed = (progress === 100);
                }
            }
        }