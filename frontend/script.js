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
      window.location.href = 'login.html';
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
      window.location.href = 'tasks.html'; 
    } else {
      const error = await response.json();
      alert(error.message, "Email ou senha inválidos.");
    }
  } catch (error) {
    console.error('Erro ao fazer login', error);
  }
}

function logout() {
  localStorage.removeItem('userEmail');
  alert('Você foi desconectado.');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('task-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        alert('Please log in to add tasks');
        window.location.href = 'login.html'; 
        return;
      }

      const taskInput = document.getElementById('task-input');  
      const task = taskInput.value.trim();
      if (!task) {
        alert('Insira uma descrição da tarefa');
        return;
      }

      const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'email': userEmail,
        },
        body: JSON.stringify({ description: task }),
      });

      if (response.ok) {
        taskInput.value = '';
        loadTasks();
      } else {
        alert('Falha ao adicionar tarefa. Por favor, tente novamente.');
      }
    });
  }

  loadTasks(); 
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
    const tasksList = document.getElementById('tasks-list');
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
  taskItem.classList.toggle('completed');
}

async function deleteTask(id) {
  const userEmail = localStorage.getItem('userEmail');
  if (userEmail) {
    await fetch(`http://localhost:3000/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'email': userEmail,
      },
    });
    loadTasks();
  } else {
    alert("Faça login para gerenciar tarefas");
  }
}