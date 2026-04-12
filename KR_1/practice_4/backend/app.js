const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');
const path = require('path');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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

// ==================== SWAGGER КОНФИГУРАЦИЯ ====================

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Music Shop API',
      version: '1.0.0',
      description: 'API для управления каталогом музыкальных инструментов',
      contact: {
        name: 'Music Shop',
        email: 'info@musicshop.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Локальный сервер разработки',
      },
    ],
  },
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Instrument:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор инструмента
 *           example: "abc123"
 *         name:
 *           type: string
 *           description: Название инструмента
 *           example: "Fender Stratocaster"
 *         category:
 *           type: string
 *           description: Категория инструмента
 *           example: "Гитары"
 *         description:
 *           type: string
 *           description: Описание инструмента
 *           example: "Электрогитара, корпус из ольхи, гриф из клена"
 *         price:
 *           type: number
 *           description: Цена в рублях
 *           example: 85000
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *           example: 5
 *         rating:
 *           type: number
 *           description: Рейтинг (0-5)
 *           example: 4.8
 *         image:
 *           type: string
 *           description: URL изображения
 *           example: "http://localhost:3000/images/img1.webp"
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Сообщение об ошибке
 *           example: "Instrument not found"
 */

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

/**
 * @swagger
 * /api/instruments:
 *   get:
 *     summary: Получить список всех инструментов
 *     tags: [Instruments]
 *     responses:
 *       200:
 *         description: Список инструментов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Instrument'
 */
app.get("/api/instruments", (req, res) => {
  res.json(instruments);
});

/**
 * @swagger
 * /api/instruments/{id}:
 *   get:
 *     summary: Получить инструмент по ID
 *     tags: [Instruments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID инструмента
 *     responses:
 *       200:
 *         description: Данные инструмента
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Instrument'
 *       404:
 *         description: Инструмент не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/api/instruments/:id", (req, res) => {
  const id = req.params.id;
  const instrument = findInstrumentOr404(id, res);
  if (!instrument) return;
  res.json(instrument);
});

/**
 * @swagger
 * /api/instruments:
 *   post:
 *     summary: Создать новый инструмент
 *     tags: [Instruments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - description
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 description: Название инструмента
 *                 example: "Gibson Les Paul"
 *               category:
 *                 type: string
 *                 description: Категория
 *                 example: "Гитары"
 *               description:
 *                 type: string
 *                 description: Описание
 *                 example: "Электрогитара премиум-класса"
 *               price:
 *                 type: number
 *                 description: Цена
 *                 example: 120000
 *               stock:
 *                 type: integer
 *                 description: Количество на складе
 *                 example: 2
 *               rating:
 *                 type: number
 *                 description: Рейтинг (0-5)
 *                 example: 5.0
 *               image:
 *                 type: string
 *                 description: URL изображения
 *                 example: "http://localhost:3000/images/new.jpg"
 *     responses:
 *       201:
 *         description: Инструмент успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Instrument'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/instruments/{id}:
 *   patch:
 *     summary: Обновить существующий инструмент
 *     tags: [Instruments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID инструмента
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Название инструмента
 *                 example: "Fender Stratocaster (обновленная)"
 *               category:
 *                 type: string
 *                 description: Категория
 *                 example: "Гитары"
 *               description:
 *                 type: string
 *                 description: Описание
 *                 example: "Обновленное описание"
 *               price:
 *                 type: number
 *                 description: Цена
 *                 example: 89000
 *               stock:
 *                 type: integer
 *                 description: Количество на складе
 *                 example: 4
 *               rating:
 *                 type: number
 *                 description: Рейтинг (0-5)
 *                 example: 4.9
 *               image:
 *                 type: string
 *                 description: URL изображения
 *                 example: "http://localhost:3000/images/updated.jpg"
 *     responses:
 *       200:
 *         description: Инструмент успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Instrument'
 *       400:
 *         description: Нет данных для обновления
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Инструмент не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/instruments/{id}:
 *   delete:
 *     summary: Удалить инструмент
 *     tags: [Instruments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID инструмента
 *     responses:
 *       204:
 *         description: Инструмент успешно удален (нет тела ответа)
 *       404:
 *         description: Инструмент не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
  console.log(`Swagger документация: http://localhost:${port}/api-docs`);
});