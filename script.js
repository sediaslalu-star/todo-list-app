const STORAGE_KEY = 'todo-list-items-v1';
const filters = {
  all: () => true,
  active: (todo) => !todo.completed,
  completed: (todo) => todo.completed,
};

const todoForm = document.querySelector('#todo-form');
const todoInput = document.querySelector('#todo-input');
const todoList = document.querySelector('#todo-list');
const taskCount = document.querySelector('#task-count');
const emptyState = document.querySelector('#empty-state');
const clearCompletedBtn = document.querySelector('#clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';
let todos = loadTodos();

function loadTodos() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function updateTaskCount() {
  const remaining = todos.filter((todo) => !todo.completed).length;
  const total = todos.length;

  if (total === 0) {
    taskCount.textContent = '0 tasks';
    return;
  }

  taskCount.textContent = `${remaining} of ${total} remaining`;
}

function renderTodos() {
  const visibleTodos = todos.filter(filters[currentFilter]);

  todoList.innerHTML = '';

  if (visibleTodos.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  visibleTodos.forEach((todo) => {
    const item = document.createElement('li');
    item.className = `todo-item ${todo.completed ? 'completed' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.className = 'checkbox';
    checkbox.setAttribute('aria-label', `Mark ${todo.text} as complete`);
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const label = document.createElement('span');
    label.className = 'task-text';
    label.textContent = todo.text;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', `Delete ${todo.text}`);
    deleteButton.addEventListener('click', () => deleteTodo(todo.id));

    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(deleteButton);
    todoList.appendChild(item);
  });

  updateTaskCount();
}

function addTodo(event) {
  event.preventDefault();

  const value = todoInput.value.trim();

  if (!value) {
    todoInput.focus();
    return;
  }

  todos.unshift({
    id: crypto.randomUUID(),
    text: value,
    completed: false,
  });

  todoInput.value = '';
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );

  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

function clearCompletedTodos() {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
}

function setFilter(filterName) {
  currentFilter = filterName;

  filterButtons.forEach((button) => {
    const matches = button.dataset.filter === filterName;
    button.classList.toggle('active', matches);
  });

  renderTodos();
}

todoForm.addEventListener('submit', addTodo);
clearCompletedBtn.addEventListener('click', clearCompletedTodos);
filterButtons.forEach((button) => {
  button.addEventListener('click', () => setFilter(button.dataset.filter));
});

renderTodos();
