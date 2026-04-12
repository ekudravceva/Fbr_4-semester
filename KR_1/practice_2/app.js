const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let products = [
    { id: 1, name: 'Капучино', price: 350 },
    { id: 2, name: 'Американо', price: 200 },
    { id: 3, name: 'Латте', price: 300 }
];

// CREATE (POST)
app.post('/products', (req, res) => {
    const { name, price } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: 'Не указаны название или цена' });
    }

    const newProduct = {
        id: Date.now(),
        name,
        price: Number(price)
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

// READ ALL (GET) 
app.get('/products', (req, res) => {
    res.json(products);
});

// READ ONE (GET)
app.get('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    res.json(product);
});

// UPDATE (PATCH) 
app.patch('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const { name, price } = req.body;
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = Number(price);

    res.json(product);
});

// DELETE (DELETE) 
app.delete('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    products.splice(productIndex, 1);
    res.status(204).send();
});

// Главная
app.get('/', (req, res) => {
    res.send('API работает');
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});