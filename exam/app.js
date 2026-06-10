const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const SECRET_KEY = 'my-secret-key';
const users = [
  { id: 1, username: 'admin', password: 'password123' }
];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Токен недействителен' });
    }
    req.user = decoded;
    next();
  });
};

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Неверный логин или пароль' });
  }
  
  const token = jwt.sign(
    { id: user.id, username: user.username },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
  
  res.json({ token: token });
});

app.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'Доступ разрешён', user: req.user });
});

app.listen(3001, () => {
  console.log('Сервер запущен на порту 3001');
});