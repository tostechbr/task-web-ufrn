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

  if (!email.includes('@')) {
    return res.status(400).send({ error: 'Email inválido.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).send({ error: 'Senha deve ter pelo menos 6 caracteres.' });
  }

  if (users.some(user => user.email === email)) {
    return res.status(409).send({ error: 'Usuário já existe.' });
  }

  users.push({ email, password });
  res.status(201).send({ message: 'Usuário registrado com sucesso.' });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ error: 'Email e senha são obrigatórios.' });
  }
  const user = users.find(user => user.email === email && user.password === password);
  
  if (!user) {
    return res.status(401).send({ error: 'Email ou senha inválidos.' });
  }
  res.status(200).send({ message: 'Login bem-sucedido.' });
});

app.post('/tasks', (req, res) => {
  const userEmail = req.headers.email;
  const { description } = req.body; 

  if (!tasksByUser[userEmail]) {
    tasksByUser[userEmail] = [];
  }

  const newTask = { id: tasksByUser[userEmail].length + 1, description: description };
  tasksByUser[userEmail].push(newTask);

  res.status(201).send(newTask);
});

app.get('/tasks', (req, res) => {
  const userEmail = req.headers.email; 

  if (!userEmail || !tasksByUser[userEmail]) {
    return res.status(404).send({ error: 'Nenhuma tarefa encontrada para o usuário' });
  }

  res.send(tasksByUser[userEmail]);
});

app.delete('/tasks/:id', (req, res) => {
  const userEmail = req.headers.email;
  const { id } = req.params;
  if (!userEmail || !tasksByUser[userEmail]) {
    return res.status(404).send({ error: 'Usuário ou tarefa não encontrada' });
  }
  tasksByUser[userEmail] = tasksByUser[userEmail].filter(task => task.id !== parseInt(id));
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});