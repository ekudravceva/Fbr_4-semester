const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mydatabase',
    password: 'Katy266277',  
    port: 5432,
});

// создание пользователя
app.post('/api/users', async (req, res) => {
    try {
        const { first_name, last_name, age } = req.body;
        const result = await pool.query(
            'INSERT INTO users (first_name, last_name, age) VALUES ($1, $2, $3) RETURNING *',
            [first_name, last_name, age]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// получение всех пользователей
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// получение одного пользователя
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// обновление пользователя
app.patch('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, age } = req.body;
        const result = await pool.query(
            'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), age = COALESCE($3, age), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [first_name, last_name, age, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// удаление пользователя
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});