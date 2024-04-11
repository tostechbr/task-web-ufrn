const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

app.use(cors());
app.use(express.json());

let users = [];
let tasksByUser = {};

app.post('/register', (req, res) => {
  const { email, password } = req.body;

  // Validação de Email Simples
  if (!email.includes('@')) {
    return res.status(400).send({ error: 'Email inválido.' });
  }

  // Validação de Senha Simples (mínimo 6 caracteres)
  if (!password || password.length < 6) {
    return res.status(400).send({ error: 'Senha deve ter pelo menos 6 caracteres.' });
  }

  // Verificar se o usuário já existe
  if (users.some(user => user.email === email)) {
    return res.status(409).send({ error: 'Usuário já existe.' });
  }

  // Criação do Usuário
  users.push({ email, password });
  res.status(201).send({ message: 'Usuário registrado com sucesso.' });
});

// Rota para login de usuários
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validação básica de entrada
  if (!email || !password) {
    return res.status(400).send({ error: 'Email e senha são obrigatórios.' });
  }

  // Procura pelo usuário no "banco de dados"
  const user = users.find(user => user.email === email && user.password === password);

  // Se não encontrar um usuário, ou a senha estiver incorreta
  if (!user) {
    return res.status(401).send({ error: 'Email ou senha inválidos.' });
  }

  // Usuário autenticado com sucesso
  res.status(200).send({ message: 'Login bem-sucedido.' });
});

app.post('/tasks', (req, res) => {
  const userEmail = req.headers.email; // Obter o email do usuário do cabeçalho
  const { task } = req.body;

  if (!tasksByUser[userEmail]) {
    tasksByUser[userEmail] = [];
  }

  const newTask = { id: tasksByUser[userEmail].length + 1, description: task };
  tasksByUser[userEmail].push(newTask);

  res.status(201).send(newTask);
});

app.get('/tasks', (req, res) => {
  const userEmail = req.headers.email; // Obter o email do usuário do cabeçalho

  if (!userEmail || !tasksByUser[userEmail]) {
    return res.status(404).send({ error: 'No tasks found for the user' });
  }

  res.send(tasksByUser[userEmail]);
});

app.delete('/tasks/:id', (req, res) => {
  const userEmail = req.headers.email;
  const { id } = req.params;
  if (!userEmail || !tasksByUser[userEmail]) {
    return res.status(404).send({ error: 'User or task not found' });
  }
  tasksByUser[userEmail] = tasksByUser[userEmail].filter(task => task.id !== parseInt(id));
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
