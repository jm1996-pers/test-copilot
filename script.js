const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('task-count');
const taskFilters = document.querySelector('.task-filters');
const taskError = document.getElementById('taskError');
const themeToggle = document.getElementById('themeToggle');

const TASKS_STORAGE_KEY = 'taskManagerTasks';
const THEME_STORAGE_KEY = 'taskManagerTheme';

let tasks = [];
let activeFilter = 'all';

function loadTasks() {
  try {
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    tasks = saved ? JSON.parse(saved) : [];
  } catch (error) {
    tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

function updateCount(filteredCount) {
  const total = tasks.length;
  if (total === 0) {
    taskCount.textContent = 'No tasks yet';
    return;
  }

  if (activeFilter === 'all') {
    taskCount.textContent = total === 1 ? '1 task total' : `${total} tasks total`;
    return;
  }

  taskCount.textContent = `${filteredCount} ${filteredCount === 1 ? 'task' : 'tasks'} shown (${total} total)`;
}

function setTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark', isDark);
  themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(theme);
}

function createTaskElement(task) {
  const item = document.createElement('li');
  item.className = 'task-item';
  if (task.completed) {
    item.classList.add('completed');
  }
  item.setAttribute('data-id', task.id);

  const label = document.createElement('label');
  label.htmlFor = `task-${task.id}`;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `task-${task.id}`;
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', `Mark task ${task.title} as completed`);

  const title = document.createElement('p');
  title.className = 'task-title';
  title.textContent = task.title;

  label.appendChild(checkbox);
  label.appendChild(title);

  const controls = document.createElement('div');
  controls.className = 'task-controls';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-btn';
  deleteButton.textContent = 'Delete';
  deleteButton.setAttribute('aria-label', `Delete task ${task.title}`);

  controls.appendChild(deleteButton);

  item.appendChild(label);
  item.appendChild(controls);

  return item;
}

function getFilteredTasks() {
  if (activeFilter === 'completed') {
    return tasks.filter((task) => task.completed);
  }

  if (activeFilter === 'pending') {
    return tasks.filter((task) => !task.completed);
  }

  return tasks;
}

function renderTasks() {
  const visibleTasks = getFilteredTasks();
  taskList.innerHTML = '';
  visibleTasks.forEach((task) => {
    taskList.appendChild(createTaskElement(task));
  });
  updateCount(visibleTasks.length);
}

function setValidationError(message) {
  taskError.textContent = message;
  taskError.classList.toggle('visible', Boolean(message));
  taskInput.classList.toggle('invalid', Boolean(message));
}

function addTask(title) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    setValidationError('Please enter a task before adding.');
    return;
  }

  setValidationError('');

  const newTask = {
    id: Date.now().toString(),
    title: trimmedTitle,
    completed: false,
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
}

function toggleTaskCompletion(id) {
  const task = tasks.find((task) => task.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(taskInput.value);
  if (taskInput.value.trim()) {
    taskInput.value = '';
  }
  taskInput.focus();
});

taskInput.addEventListener('input', () => {
  if (taskError.textContent) {
    setValidationError('');
  }
});

taskList.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('.delete-btn');
  if (deleteButton) {
    const taskItem = deleteButton.closest('.task-item');
    if (!taskItem) return;
    deleteTask(taskItem.dataset.id);
    return;
  }

  const checkbox = event.target.closest('input[type="checkbox"]');
  if (checkbox) {
    const taskItem = checkbox.closest('.task-item');
    if (!taskItem) return;
    toggleTaskCompletion(taskItem.dataset.id);
  }
});

taskFilters.addEventListener('click', (event) => {
  const button = event.target.closest('.filter-btn');
  if (!button) return;

  activeFilter = button.dataset.filter;
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.toggle('active', btn === button);
  });
  renderTasks();
});

themeToggle.addEventListener('click', () => {
  setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
});

window.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadTasks();
  renderTasks();
});
