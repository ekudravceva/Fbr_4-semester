const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use('/images', express.static(path.join(__dirname, 'public/images')));

let instruments = [
  {
    id: nanoid(6),
    name: 'Fender Stratocaster',
    category: 'Гитары',
    description: 'Электрогитара, корпус из ольхи, гриф из клена',
    price: 85000,
    stock: 5,
    rating: 4.8,
    image: 'http://localhost:3000/images/img1.webp'
  },
  {
    id: nanoid(6),
    name: 'Yamaha C40',
    category: 'Гитары',
    description: 'Классическая гитара для начинающих',
    price: 12000,
    stock: 15,
    rating: 4.5,
    image: 'http://localhost:3000/images/img2.jpg'
  },
  {
    id: nanoid(6),
    name: 'Roland TD-1DMK',
    category: 'Ударные',
    description: 'Электронная ударная установка',
    price: 65000,
    stock: 3,
    rating: 4.7,
    image: 'http://localhost:3000/images/img3.jpg'
  },
  {
    id: nanoid(6),
    name: 'Yamaha P-125',
    category: 'Клавишные',
    description: 'Цифровое пианино с молоточковой механикой',
    price: 55000,
    stock: 7,
    rating: 4.9,
    image: 'http://localhost:3000/images/img4.webp'
  },
  {
    id: nanoid(6),
    name: 'Shure SM58',
    category: 'Микрофоны',
    description: 'Вокальный динамический микрофон',
    price: 8500,
    stock: 20,
    rating: 4.8,
    image: 'http://localhost:3000/images/img5.webp'
  },
  {
    id: nanoid(6),
    name: 'Boss DS-1',
    category: 'Педали эффектов',
    description: 'Педаль дисторшн для гитары',
    price: 6500,
    stock: 12,
    rating: 4.6,
    image: 'http://localhost:3000/images/img6.webp'
  },
  {
    id: nanoid(6),
    name: 'Ibanez GSR200',
    category: 'Бас-гитары',
    description: '4-струнная бас-гитара',
    price: 28000,
    stock: 8,
    rating: 4.4,
    image: 'http://localhost:3000/images/img7.jpg'
  },
  {
    id: nanoid(6),
    name: 'Zildjian A Custom',
    category: 'Тарелки',
    description: 'Комплект тарелок 14" хай-хет, 16" и 18" крэш, 20" райд',
    price: 45000,
    stock: 4,
    rating: 4.9,
    image: 'http://localhost:3000/images/img8.jpg'
  },
  {
    id: nanoid(6),
    name: 'Native Instruments Komplete',
    category: 'Софт',
    description: 'Контроллер и софт для создания музыки',
    price: 35000,
    stock: 6,
    rating: 4.7,
    image: 'http://localhost:3000/images/img9.webp'
  },
  {
    id: nanoid(6),
    name: 'Fender Precision Bass',
    category: 'Бас-гитары',
    description: 'Легендарная бас-гитара',
    price: 75000,
    stock: 3,
    rating: 4.8,
    image: 'http://localhost:3000/images/img10.jpg'
  }
];

app.use(express.json());

app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      console.log('Body:', req.body);
    }
  });
  next();
});


function findInstrumentOr404(id, res) {
  const instrument = instruments.find(i => i.id == id);
  if (!instrument) {
    res.status(404).json({ error: "Instrument not found" });
    return null;
  }
  return instrument;
}

// GET /api/instruments - получение списка всех инструментов
app.get("/api/instruments", (req, res) => {
  res.json(instruments);
});

// GET /api/instruments/:id - получение инструмента по ID
app.get("/api/instruments/:id", (req, res) => {
  const id = req.params.id;
  const instrument = findInstrumentOr404(id, res);
  if (!instrument) return;
  res.json(instrument);
});

// POST /api/instruments - создание нового инструмента
app.post("/api/instruments", (req, res) => {
  const { name, category, description, price, stock, rating, image } = req.body;

  if (!name || !category || !description || !price || !stock) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newInstrument = {
    id: nanoid(6),
    name: name.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
    stock: Number(stock),
    rating: rating ? Number(rating) : 0,
    image: image || 'https://via.placeholder.com/300x200?text=Music+Instrument'
  };

  instruments.push(newInstrument);
  res.status(201).json(newInstrument);
});

// PATCH /api/instruments/:id - обновление инструмента
app.patch("/api/instruments/:id", (req, res) => {
  const id = req.params.id;
  const instrument = findInstrumentOr404(id, res);
  if (!instrument) return;

  if (req.body?.name === undefined && req.body?.category === undefined &&
    req.body?.description === undefined && req.body?.price === undefined &&
    req.body?.stock === undefined && req.body?.rating === undefined) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const { name, category, description, price, stock, rating, image } = req.body;

  if (name !== undefined) instrument.name = name.trim();
  if (category !== undefined) instrument.category = category.trim();
  if (description !== undefined) instrument.description = description.trim();
  if (price !== undefined) instrument.price = Number(price);
  if (stock !== undefined) instrument.stock = Number(stock);
  if (rating !== undefined) instrument.rating = Number(rating);
  if (image !== undefined) instrument.image = image;

  res.json(instrument);
});

// DELETE /api/instruments/:id - удаление инструмента
app.delete("/api/instruments/:id", (req, res) => {
  const id = req.params.id;
  const exists = instruments.some((i) => i.id === id);
  if (!exists) return res.status(404).json({ error: "Instrument not found" });

  instruments = instruments.filter((i) => i.id !== id);
  res.status(204).send();
});

// 404 для всех остальных маршрутов
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});