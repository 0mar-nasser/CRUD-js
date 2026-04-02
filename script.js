// State management
let tasks = JSON.parse(localStorage.getItem('neonTasks')) || [];
let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
const taskList = document.getElementById('taskList');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const modalTitle = document.getElementById('modalTitle');
const closeBtn = document.querySelector('.close-btn');
const cancelBtn = document.querySelector('.cancel-btn');
const searchContainer = document.getElementById('searchContainer');
const searchToggleBtn = document.getElementById('searchToggleBtn');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sortSelect');
const emptyState = document.getElementById('emptyState');
const taskDateInput = document.getElementById('taskDate');


// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    setupEventListeners();
});

function setupEventListeners() {
    // Modal controls
    addTaskBtn.addEventListener('click', () => openModal());
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === taskModal) closeModal();
    });

    // Form submission
    taskForm.addEventListener('submit', handleFormSubmit);

    // Search Toggle
    searchToggleBtn.addEventListener('click', () => {
        searchContainer.classList.toggle('expanded');
        if (searchContainer.classList.contains('expanded')) {
            searchInput.focus();
        }
    });

    // Close search on escape or clicking outside
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchContainer.classList.contains('expanded')) {
            searchContainer.classList.remove('expanded');
        }
    });

    // Filter & Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderTasks();
    });


    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    sortSelect.addEventListener('change', renderTasks);
}

// CRUD Operations
function handleFormSubmit(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const taskData = {
        id: taskId || Date.now().toString(),
        title: document.getElementById('taskTitle').value,
        priority: document.getElementById('taskPriority').value,
        category: document.getElementById('taskCategory').value,
        description: document.getElementById('taskDesc').value,
        dueDate: document.getElementById('taskDate').value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    if (taskId) {
        // Edit existing
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            taskData.completed = tasks[index].completed;
            taskData.createdAt = tasks[index].createdAt;
            tasks[index] = taskData;
        }
    } else {
        // Add new
        tasks.unshift(taskData);
    }

    saveTasks();
    renderTasks();
    closeModal();
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
}

function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function openModal(task = null) {
    taskForm.reset();
    if (task) {
        modalTitle.innerText = 'Edit Task';
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('taskDesc').value = task.description;
        document.getElementById('taskDate').value = task.dueDate || '';
        document.getElementById('saveTaskBtn').innerText = 'Update Task';
    } else {
        modalTitle.innerText = 'New Task';
        document.getElementById('taskId').value = '';
        document.getElementById('saveTaskBtn').innerText = 'Create Task';
    }
    taskModal.classList.add('show');
    taskModal.classList.remove('hidden');
}

function closeModal() {
    taskModal.classList.remove('show');
    setTimeout(() => {
        taskModal.classList.add('hidden');
    }, 300);
}

function saveTasks() {
    localStorage.setItem('neonTasks', JSON.stringify(tasks));
}

// Rendering Logic
function renderTasks() {
    let filteredTasks = tasks.filter(task => {
        const matchesFilter = currentFilter === 'all' || 
                            (currentFilter === 'completed' && task.completed) || 
                            (currentFilter === 'pending' && !task.completed);
        const matchesSearch = task.title.toLowerCase().includes(searchQuery) || 
                             task.description.toLowerCase().includes(searchQuery);
        return matchesFilter && matchesSearch;
    });

    // Sorting
    const sortBy = sortSelect.value;
    filteredTasks.sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'priority') {
            const levels = { high: 3, medium: 2, low: 1 };
            return levels[b.priority] - levels[a.priority];
        }
        if (sortBy === 'dueDate') {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
    });

    taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        filteredTasks.forEach(task => {
            const card = createTaskCard(task);
            taskList.appendChild(card);
        });
    }
}

function createTaskCard(task) {
    const div = document.createElement('div');
    div.className = `task-card priority-${task.priority} ${task.completed ? 'completed' : ''}`;
    
    div.innerHTML = `
        <div class="task-header">
            <span class="category-badge category-${task.category.toLowerCase()}">${task.category}</span>
            <div class="task-actions">
                <button class="action-btn complete-btn ${task.completed ? 'completed' : ''}" onclick="toggleComplete('${task.id}')" title="${task.completed ? 'Mark as pending' : 'Mark as complete'}">
                    <i class="fas fa-check"></i>
                </button>
                <button class="action-btn edit-btn" onclick="editTask('${task.id}')" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteTask('${task.id}')" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="task-title">${task.title}</div>
        <div class="task-desc">${task.description || 'No description provided.'}</div>
        <div class="task-footer">
            <div class="task-meta">
                <i class="far fa-calendar-plus"></i> ${new Date(task.createdAt).toLocaleDateString()}
            </div>
            ${task.dueDate ? `
            <div class="task-meta">
                <i class="far fa-clock"></i> ${new Date(task.dueDate).toLocaleDateString()}
            </div>
            ` : ''}
            <div class="task-meta">
                <i class="fas fa-signal"></i> ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </div>
        </div>
    `;
    return div;
}

// Global functions for inline events
window.editTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) openModal(task);
};

window.deleteTask = deleteTask;
window.toggleComplete = toggleComplete;
