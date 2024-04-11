const form = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');

function checkAuthentication() {
  const userEmail = localStorage.getItem('userEmail');
  if (userEmail) {
    showTasksContent();
  } else {
    showLoginForm();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();
});


function checkAuthentication() {
  const userEmail = localStorage.getItem('userEmail');
  if (userEmail) {
    document.getElementById('initial-content').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('task-content').style.display = 'block';
    document.getElementById('logout-button').style.display = 'block';
    loadTasks();
  } else {
    document.getElementById('initial-content').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('task-content').style.display = 'none';
    document.getElementById('logout-button').style.display = 'none';
  }
}

function showRegisterForm() {
  document.getElementById('initial-content').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
  document.getElementById('login-form').style.display = 'none';
}

function showLoginForm() {
  document.getElementById('initial-content').style.display = 'none';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('login-form').style.display = 'block';
}


document.getElementById('register-form').style.display = 'block';
document.getElementById('login-form').style.display = 'block';

async function register() {
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('Usuário registrado com sucesso!');
      localStorage.setItem('userEmail', email);
      document.getElementById('register-form').style.display = 'none';
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('task-content').style.display = 'block';
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Erro ao registrar', error);
  }
}

async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      alert('Login bem-sucedido!');
      localStorage.setItem('userEmail', email);
      updateUIOnLogin();
      loadTasks();
    } else {
      const error = await response.json();
      alert(error.message);
    }
  } catch (error) {
    console.error('Erro ao fazer login', error);
  }
}

function updateUIOnLogin() {
  document.getElementById('initial-content').style.display = 'none';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('task-content').style.display = 'block';
  document.getElementById('logout-button').style.display = 'block';
}

function logout() {
  localStorage.removeItem('userEmail');
  updateUIOnLogout();
}

function updateUIOnLogout() {
  document.getElementById('initial-content').style.display = 'block';
  document.getElementById('task-content').style.display = 'none';
  document.getElementById('logout-button').style.display = 'none';
  window.location.reload();
}


const tasksList = document.getElementById('tasks-list');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userEmail = localStorage.getItem('userEmail');
  if (!userEmail) {
    alert('Please log in to add tasks');
    return;
  }

  const task = taskInput.value.trim();
  if (!task) {
    alert('Please enter a task description');
    return;
  }

  const response = await fetch('http://localhost:3000/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'email': userEmail,
    },
    body: JSON.stringify({ task }),
  });

  if (response.ok) {
    const newTask = await response.json();
    taskInput.value = '';
    loadTasks();
  } else {
    alert('Failed to add task. Please try again.');
  }
});

async function loadTasks() {
  const userEmail = localStorage.getItem('userEmail');
  if (!userEmail) {
    console.log('User not logged in');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/tasks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'email': userEmail,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const tasks = await response.json();
    tasksList.innerHTML = '';
    tasks.forEach(task => {
      tasksList.innerHTML += `
      <li class="task-item">
    <input type="checkbox" id="task-${task.id}" class="task-checkbox" onchange="toggleTaskStatus(${task.id}, this)">
    <label for="task-${task.id}" class="task-label">${task.description}</label>
    <span onclick="deleteTask(${task.id})" class="delete-icon">🗑️</span>
  </li>`;
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

function toggleTaskStatus(taskId, checkboxElement) {

  const taskItem = checkboxElement.closest('.task-item');

  if (checkboxElement.checked) {
    taskItem.classList.add('completed');
  } else {
    taskItem.classList.remove('completed');
  }
}


async function deleteTask(id) {
  const userEmail = localStorage.getItem('userEmail');
  await fetch(`http://localhost:3000/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'email': userEmail,
    },
  });
  loadTasks();
}

loadTasks(); 
