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