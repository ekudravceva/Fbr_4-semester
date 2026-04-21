const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json()); 

mongoose.connect('mongodb://YourMongoAdmin:1234@localhost:27017/?authSource=admin')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error:', err));

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    age: { type: Number, required: true, min: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// обновление поля updated_at при изменении
userSchema.pre('findOneAndUpdate', function() {
    this.set({ updated_at: Date.now() });
});

const User = mongoose.model('User', userSchema);

// создание пользователя
app.post('/api/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// получение списка всех пользователей
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// получение конкретного пользователя
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send({ error: 'User not found' });
        res.send(user);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// обновление пользователя
app.patch('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!user) return res.status(404).send({ error: 'User not found' });
        res.send(user);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// удаление пользователя
app.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send({ error: 'User not found' });
        res.send({ message: 'User deleted successfully', user });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});